"use server";

import { createAdminClient, createClient } from "@/lib/supabase/server";
import type { SuperadminUser, SecurityLogEntry } from "../types";

async function requireSuperadmin() {
    const supabase = await createClient();
    const { data: auth } = await supabase.auth.getUser();
    if (!auth.user) return { ok: false as const, error: "Not authenticated" };
    const role = auth.user.user_metadata?.role ?? "";
    if (role !== "SUPERADMIN") return { ok: false as const, error: "Unauthorized" };
    return { ok: true as const, error: null, user: auth.user };
}

export async function fetchAllUsers(): Promise<SuperadminUser[]> {
    const check = await requireSuperadmin();
    if (!check.ok) return [];

    const admin = createAdminClient();

    const { data: users, error } = await admin
        .from("User")
        .select("id, email, role, status, created_at, suspensionReason")
        .order("created_at", { ascending: false });

    if (error || !users?.length) return [];

    const ids = users.map((u) => u.id);

    const [{ data: profiles }, { data: hrProfiles }] = await Promise.all([
        admin
            .from("Profile")
            .select("id, firstName, lastName, middleInitial, contactNumber")
            .in("id", ids),
        admin
            .from("ProfileHR")
            .select("id, employeeId, position")
            .in("id", ids),
    ]);

    const profileMap = new Map((profiles ?? []).map((p) => [p.id, p]));
    const hrMap      = new Map((hrProfiles ?? []).map((p) => [p.id, p]));

    return users.map((u) => {
        const profile = profileMap.get(u.id);
        const hr      = hrMap.get(u.id);
        return {
            id:               u.id,
            email:            u.email ?? "",
            role:             u.role ?? "",
            status:           u.status ?? "",
            createdAt:        u.created_at,
            firstName:        profile?.firstName        ?? "",
            lastName:         profile?.lastName         ?? "",
            middleInitial:    profile?.middleInitial    ?? "",
            contactNumber:    profile?.contactNumber    ?? "",
            employeeId:       hr?.employeeId            ?? "",
            position:         hr?.position              ?? "",
            suspensionReason: u.suspensionReason        ?? null,
        };
    });
}

export async function fetchSecurityLogs(): Promise<SecurityLogEntry[]> {
    const check = await requireSuperadmin();
    if (!check.ok) return [];

    const admin = createAdminClient();

    const { data, error } = await admin
        .from("SecurityLog")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(50);

    if (error || !data) return [];

    return data.map((r) => ({
        id:        r.id,
        userId:    r.user_id    ?? null,
        actorId:   r.actor_id   ?? null,
        email:     r.email      ?? null,
        action:    r.action,
        meta:      r.meta       ?? null,
        ipAddress: r.ip_address ?? null,
        createdAt: r.created_at,
    }));
}

export async function fetchPromotionQuota(actorId: string): Promise<{
    teacherPromotionsUsed: number;
    teacherPromotionsLeft: number;
    superadminCooldownRemaining: number | null;
    superadminCount: number;
}> {
    const check = await requireSuperadmin();
    if (!check.ok) return {
        teacherPromotionsUsed:       0,
        teacherPromotionsLeft:       3,
        superadminCooldownRemaining: null,
        superadminCount:             0,
    };

    const admin = createAdminClient();

    const windowMs = process.env.NODE_ENV === "development"
        ? 1000 * 60 * 60
        : 1000 * 60 * 60 * 24 * 7;

    const windowStart = new Date(Date.now() - windowMs).toISOString();
    const cooldownMs  = windowMs;

    const [
        { count: promotionCount },
        { data: lastSuperadminPromotion },
        { count: superadminCount },
    ] = await Promise.all([
        admin
            .from("SecurityLog")
            .select("*", { count: "exact", head: true })
            .eq("actor_id", actorId)
            .eq("action", "ROLE_PROMOTED")
            .gte("created_at", windowStart),
        admin
            .from("SecurityLog")
            .select("created_at")
            .eq("action", "SUPERADMIN_PROMOTED")
            .order("created_at", { ascending: false })
            .limit(1),
        admin
            .from("User")
            .select("*", { count: "exact", head: true })
            .eq("role", "SUPERADMIN"),
    ]);

    // Calculate cooldown remaining in ms
    let superadminCooldownRemaining: number | null = null;
    if (lastSuperadminPromotion?.[0]) {
        const lastPromotionTime = new Date(lastSuperadminPromotion[0].created_at).getTime();
        const elapsed           = Date.now() - lastPromotionTime;
        const remaining         = cooldownMs - elapsed;
        if (remaining > 0) superadminCooldownRemaining = remaining;
    }

    const used = promotionCount ?? 0;

    return {
        teacherPromotionsUsed:       used,
        teacherPromotionsLeft:       Math.max(0, 3 - used),
        superadminCooldownRemaining,
        superadminCount:             superadminCount ?? 0,
    };
}