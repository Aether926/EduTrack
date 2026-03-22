"use server";

import { createAdminClient, createClient } from "@/lib/supabase/server";

export type ArchivedUser = {
    id: string;
    email: string;
    role: string;
    archivedAt: string | null;
    archiveReason: string | null;
    firstName: string;
    lastName: string;
    middleInitial: string;
    employeeId: string;
    position: string;
    profileImage: string | null;
};

async function requireAdminOrSuperadmin() {
    const supabase = await createClient();
    const { data: auth } = await supabase.auth.getUser();
    if (!auth.user) return { ok: false as const, error: "Not authenticated" };
    const role = auth.user.user_metadata?.role ?? "";
    if (!["ADMIN", "SUPERADMIN"].includes(role))
        return { ok: false as const, error: "Unauthorized" };
    return { ok: true as const, error: null, user: auth.user };
}

export async function fetchArchivedUsers(): Promise<ArchivedUser[]> {
    const check = await requireAdminOrSuperadmin();
    if (!check.ok) return [];

    const admin = createAdminClient();

    const { data: users, error } = await admin
        .from("User")
        .select("id, email, role, archivedAt, archiveReason")
        .eq("status", "ARCHIVED")
        .order("archivedAt", { ascending: false });

    if (error || !users?.length) return [];

    const ids = users.map((u) => u.id);

    const [{ data: profiles }, { data: hrProfiles }] = await Promise.all([
        admin
            .from("Profile")
            .select("id, firstName, lastName, middleInitial, profileImage")
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
            id:            u.id,
            email:         u.email         ?? "",
            role:          u.role          ?? "",
            archivedAt:    u.archivedAt    ?? null,
            archiveReason: u.archiveReason ?? null,
            firstName:     profile?.firstName     ?? "",
            lastName:      profile?.lastName      ?? "",
            middleInitial: profile?.middleInitial ?? "",
            employeeId:    hr?.employeeId         ?? "",
            position:      hr?.position           ?? "",
            profileImage:  profile?.profileImage  ?? null,
        };
    });
}