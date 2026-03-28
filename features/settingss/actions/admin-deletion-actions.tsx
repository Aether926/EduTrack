"use server";

import {
    LOG_ACTIONS,
    LOG_MESSAGES,
} from "@/lib/database/activity-log-messages";
import { createAdminClient, createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { format } from "date-fns";
import { insertActivity } from "@/lib/database/activity";

export type ActionResult<T = null> =
    | { ok: true; data?: T }
    | { ok: false; error: string };

function errMsg(e: unknown) {
    if (e instanceof Error) return e.message;
    if (typeof e === "string") return e;
    return "Something went wrong";
}

async function requireAdmin() {
    const supabase = await createClient();
    const { data: auth } = await supabase.auth.getUser();
    if (!auth.user)
        return {
            ok: false as const,
            error: "Not authenticated",
            userId: null as string | null,
        };
    const role = auth.user.user_metadata?.role ?? "TEACHER";
    if (!["ADMIN", "SUPERADMIN"].includes(role))
        return {
            ok: false as const,
            error: "Unauthorized",
            userId: auth.user.id,
        };
    return {
        ok: true as const,
        error: null as string | null,
        userId: auth.user.id,
    };
}

export async function getAllDeletionRequests() {
    const admin = createAdminClient();

    const { data: requests } = await admin
        .from("AccountDeletionRequest")
        .select("*")
        .in("status", ["PENDING"])
        .order("created_at", { ascending: true });

    if (!requests?.length) return [];

    const userIds = requests.map((r) => r.user_id);
    const [{ data: profiles }, { data: hrs }] = await Promise.all([
        admin
            .from("Profile")
            .select("id, firstName, lastName, email")
            .in("id", userIds),
        admin.from("ProfileHR").select("id, employeeId").in("id", userIds),
    ]);

    const profileMap = new Map((profiles ?? []).map((p) => [p.id, p]));
    const hrMap = new Map((hrs ?? []).map((h) => [h.id, h]));

    return requests.map((r) => ({
        ...r,
        user: {
            id: r.user_id,
            firstName: profileMap.get(r.user_id)?.firstName ?? null,
            lastName: profileMap.get(r.user_id)?.lastName ?? null,
            email: profileMap.get(r.user_id)?.email ?? null,
            employeeId: hrMap.get(r.user_id)?.employeeId ?? null,
        },
    }));
}

export async function adminInitiateDeletion(
    teacherId: string,
    reason: string,
): Promise<ActionResult> {
    try {
        const adminCheck = await requireAdmin();
        if (!adminCheck.ok) return { ok: false, error: adminCheck.error };
        if (!reason.trim())
            return { ok: false, error: "Please provide a reason." };

        const admin = createAdminClient();

        const { data: teacherProfile } = await admin
            .from("Profile")
            .select("firstName, lastName")
            .eq("id", teacherId)
            .single();

        const teacherName = teacherProfile
            ? `${teacherProfile.firstName ?? ""} ${teacherProfile.lastName ?? ""}`.trim()
            : "Teacher";

        const { data: existing } = await admin
            .from("AccountDeletionRequest")
            .select("id")
            .eq("user_id", teacherId)
            .eq("status", "PENDING")
            .maybeSingle();

        if (existing)
            return {
                ok: false,
                error: "This user already has a pending deactivation request.",
            };

        const isDev = process.env.NODE_ENV === "development";
        const scheduledAt = new Date(
            Date.now() + (isDev ? 5 * 60 * 1000 : 72 * 60 * 60 * 1000),
        );
        const formattedScheduledAt = format(
            scheduledAt,
            "MMMM d, yyyy 'at' h:mm a",
        );
        const { data: req, error } = await admin
            .from("AccountDeletionRequest")
            .insert({
                user_id: teacherId,
                reason: reason.trim(),
                status: "PENDING",
                initiated_by: "ADMIN",
                admin_reason: reason.trim(),
                scheduled_at: scheduledAt.toISOString(),
            })
            .select("id")
            .single();

        if (error) return { ok: false, error: error.message };

        const msg = LOG_MESSAGES.ACCOUNT_DEACTIVATION_INITIATED(
            teacherName,
            reason.trim(),
            formattedScheduledAt,
        );

        await insertActivity([
            {
                actor_id: adminCheck.userId!,
                target_user_id: adminCheck.userId!,
                action: LOG_ACTIONS.ACCOUNT_DEACTIVATION_INITIATED,
                entity_type: "AccountDeletionRequest",
                entity_id: req.id,
                message: msg.actor,
                recipient_role: "actor",
                meta: {
                    reason: reason.trim(),
                    scheduledAt: scheduledAt.toISOString(),
                },
            },
            {
                actor_id: adminCheck.userId!,
                target_user_id: teacherId,
                action: LOG_ACTIONS.ACCOUNT_DEACTIVATION_INITIATED,
                entity_type: "AccountDeletionRequest",
                entity_id: req.id,
                message: msg.receiver,
                recipient_role: "receiver",
                meta: {
                    reason: reason.trim(),
                    scheduledAt: scheduledAt.toISOString(),
                },
            },
        ]);

        revalidatePath("/admin-actions");
        revalidatePath("/settings");
        return { ok: true };
    } catch (e) {
        return { ok: false, error: errMsg(e) };
    }
}

export async function adminCancelDeletion(
    requestId: string,
): Promise<ActionResult> {
    try {
        const adminCheck = await requireAdmin();
        if (!adminCheck.ok) return { ok: false, error: adminCheck.error };

        const admin = createAdminClient();
        const now = new Date().toISOString();

        const { data: req } = await admin
            .from("AccountDeletionRequest")
            .select("user_id")
            .eq("id", requestId)
            .single();

        if (!req) return { ok: false, error: "Request not found" };

        const [{ data: teacherProfile }, { data: adminProfile }] =
            await Promise.all([
                admin
                    .from("Profile")
                    .select("firstName, lastName")
                    .eq("id", req.user_id)
                    .single(),
                admin
                    .from("Profile")
                    .select("firstName, lastName")
                    .eq("id", adminCheck.userId!)
                    .single(),
            ]);

        const teacherName = teacherProfile
            ? `${teacherProfile.firstName ?? ""} ${teacherProfile.lastName ?? ""}`.trim()
            : "Teacher";

        const adminName = adminProfile
            ? `${adminProfile.firstName ?? ""} ${adminProfile.lastName ?? ""}`.trim()
            : "Admin";

        const msg = LOG_MESSAGES.ACCOUNT_DEACTIVATION_CANCELLED(
            teacherName,
            adminName,
        );

        const { error } = await admin
            .from("AccountDeletionRequest")
            .update({
                status: "CANCELLED",
                cancelled_at: now,
                cancelled_by: adminCheck.userId,
            })
            .eq("id", requestId)
            .eq("status", "PENDING");

        if (error) return { ok: false, error: error.message };

        await insertActivity([
            {
                actor_id: adminCheck.userId!,
                target_user_id: adminCheck.userId!,
                action: LOG_ACTIONS.ACCOUNT_DEACTIVATION_CANCELLED,
                entity_type: "AccountDeletionRequest",
                entity_id: requestId,
                message: msg.actor,
                recipient_role: "actor",
            },
            {
                actor_id: adminCheck.userId!,
                target_user_id: req.user_id,
                action: LOG_ACTIONS.ACCOUNT_DEACTIVATION_CANCELLED,
                entity_type: "AccountDeletionRequest",
                entity_id: requestId,
                message: msg.receiver,
                recipient_role: "receiver",
            },
        ]);

        revalidatePath("/admin-actions");
        revalidatePath("/settings");
        return { ok: true };
    } catch (e) {
        return { ok: false, error: errMsg(e) };
    }
}

export async function adminFinalizeDeleteAccount(
    requestId: string,
): Promise<ActionResult> {
    try {
        const adminCheck = await requireAdmin();
        if (!adminCheck.ok) return { ok: false, error: adminCheck.error };

        const admin = createAdminClient();
        const now = new Date().toISOString();

        const { data: req } = await admin
            .from("AccountDeletionRequest")
            .select("*")
            .eq("id", requestId)
            .single();

        if (!req) return { ok: false, error: "Request not found" };
        if (req.status !== "PENDING")
            return { ok: false, error: "Request is no longer pending" };

        // Check grace period has passed
        if (req.scheduled_at && new Date(req.scheduled_at) > new Date()) {
            const remaining = new Date(req.scheduled_at).getTime() - Date.now();
            const mins = Math.ceil(remaining / 60000);
            return {
                ok: false,
                error: `Grace period has not passed yet. ${mins} minute(s) remaining.`,
            };
        }

        // ── Fetch names ───────────────────────────────────────────────────────
        const [{ data: teacherProfile }, { data: adminProfile }] =
            await Promise.all([
                admin
                    .from("Profile")
                    .select("firstName, lastName")
                    .eq("id", req.user_id)
                    .single(),
                admin
                    .from("Profile")
                    .select("firstName, lastName")
                    .eq("id", adminCheck.userId!)
                    .single(),
            ]);

        const teacherName = teacherProfile
            ? `${teacherProfile.firstName ?? ""} ${teacherProfile.lastName ?? ""}`.trim()
            : "Teacher";

        const adminName = adminProfile
            ? `${adminProfile.firstName ?? ""} ${adminProfile.lastName ?? ""}`.trim()
            : "Admin";

        const msg = LOG_MESSAGES.ACCOUNT_ARCHIVED(
            teacherName,
            adminName,
            req.reason ?? req.admin_reason ?? "No reason provided",
        );
        // ─────────────────────────────────────────────────────────────────────

        // Mark request as approved
        await admin
            .from("AccountDeletionRequest")
            .update({
                status: "APPROVED",
                reviewed_by: adminCheck.userId,
                reviewed_at: now,
            })
            .eq("id", requestId);

        // ── Archive user instead of deleting ──────────────────────────────────
        const { error: archiveErr } = await admin
            .from("User")
            .update({
                status: "ARCHIVED",
                archivedAt: now,
                archiveReason:
                    req.reason ?? req.admin_reason ?? "No reason provided",
            })
            .eq("id", req.user_id);

        if (archiveErr) return { ok: false, error: archiveErr.message };

        await admin.auth.admin.signOut(req.user_id, "global");

        await admin.auth.admin.updateUserById(req.user_id, {
            ban_duration: "876000h",
        });

        await insertActivity([
            {
                actor_id: adminCheck.userId!,
                target_user_id: adminCheck.userId!,
                action: LOG_ACTIONS.ACCOUNT_ARCHIVED,
                entity_type: "AccountDeletionRequest",
                entity_id: requestId,
                message: msg.actor,
                recipient_role: "actor",
                meta: { reason: req.reason ?? req.admin_reason },
            },
            {
                actor_id: adminCheck.userId!,
                target_user_id: req.user_id,
                action: LOG_ACTIONS.ACCOUNT_ARCHIVED,
                entity_type: "AccountDeletionRequest",
                entity_id: requestId,
                message: msg.receiver,
                recipient_role: "receiver",
                meta: { reason: req.reason ?? req.admin_reason },
            },
        ]);

        revalidatePath("/admin-actions");
        revalidatePath("/admin-actions/archive");
        return { ok: true };
    } catch (e) {
        return { ok: false, error: errMsg(e) };
    }
}
