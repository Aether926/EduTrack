"use server";

import { createAdminClient, createClient } from "@/lib/supabase/server";
import { logSecurityEvent } from "@/lib/database/security-log";
import { revalidatePath } from "next/cache";

// ── Types ──────────────────────────────────────────────────────────────────────

export type ActionResult =
    | { ok: true }
    | { ok: false; error: string };

// ── Constants ──────────────────────────────────────────────────────────────────

const MAX_SUPERADMINS = 3;
const SUPERADMIN_COOLDOWN_MS = process.env.NODE_ENV === "development"
    ? 1000 * 60 * 60          // 1 hour in dev
    : 1000 * 60 * 60 * 24 * 7; // 7 days in prod

const TEACHER_PROMOTION_LIMIT = 3;
const TEACHER_PROMOTION_WINDOW_MS = process.env.NODE_ENV === "development"
    ? 1000 * 60 * 60          // 1 hour in dev
    : 1000 * 60 * 60 * 24 * 7; // 7 days in prod

// ── Auth helper ────────────────────────────────────────────────────────────────

async function requireSuperadmin() {
    const supabase = await createClient();
    const { data: auth } = await supabase.auth.getUser();
    if (!auth.user) return { ok: false as const, error: "Not authenticated" };

    const role = auth.user.user_metadata?.role ?? "";
    if (role !== "SUPERADMIN") return { ok: false as const, error: "Unauthorized" };

    return { ok: true as const, error: null, user: auth.user };
}

// ── Approve user ───────────────────────────────────────────────────────────────

export async function superadminApproveUser(id: string): Promise<ActionResult> {
    const check = await requireSuperadmin();
    if (!check.ok) return { ok: false, error: check.error };

    const admin = createAdminClient();

    const { data: target } = await admin
        .from("User")
        .select("email, role")
        .eq("id", id)
        .single();

    const [{ error: dbError }, { error: metaError }] = await Promise.all([
        admin.from("User").update({ status: "APPROVED" }).eq("id", id),
        admin.auth.admin.updateUserById(id, {
            user_metadata: { role: target?.role ?? "TEACHER" },
        }),
    ]);

    if (dbError)   return { ok: false, error: dbError.message };
    if (metaError) return { ok: false, error: metaError.message };

    await logSecurityEvent({
        userId:  id,
        actorId: check.user.id,
        email:   target?.email,
        action:  "ACCOUNT_APPROVED",
        meta:    { approved_by: check.user.email },
    });

    revalidatePath("/superadmin/users");
    return { ok: true };
}

// ── Reject user ────────────────────────────────────────────────────────────────

export async function superadminRejectUser(id: string): Promise<ActionResult> {
    const check = await requireSuperadmin();
    if (!check.ok) return { ok: false, error: check.error };

    const admin = createAdminClient();

    const { data: target } = await admin
        .from("User")
        .select("email")
        .eq("id", id)
        .single();

    const { error } = await admin
        .from("User")
        .update({ status: "REJECTED" })
        .eq("id", id);

    if (error) return { ok: false, error: error.message };

    await logSecurityEvent({
        userId:  id,
        actorId: check.user.id,
        email:   target?.email,
        action:  "ACCOUNT_REJECTED",
        meta:    { rejected_by: check.user.email },
    });

    revalidatePath("/superadmin/users");
    return { ok: true };
}

// ── Suspend user ───────────────────────────────────────────────────────────────

export async function superadminSuspendUser(
    id: string,
    reason: string,
): Promise<ActionResult> {
    const check = await requireSuperadmin();
    if (!check.ok) return { ok: false, error: check.error };

    const admin = createAdminClient();

    const { data: target } = await admin
        .from("User")
        .select("email, role")
        .eq("id", id)
        .single();

    // Cannot suspend another superadmin
    if (target?.role === "SUPERADMIN") {
        return { ok: false, error: "Cannot suspend a Superadmin." };
    }

    const { error } = await admin
        .from("User")
        .update({ status: "SUSPENDED", suspensionReason: reason })
        .eq("id", id);

    if (error) return { ok: false, error: error.message };

    // Force logout globally
    await admin.auth.admin.signOut(id, "global");

    await logSecurityEvent({
        userId:  id,
        actorId: check.user.id,
        email:   target?.email,
        action:  "ACCOUNT_SUSPENDED",
        meta:    { reason, suspended_by: check.user.email },
    });

    revalidatePath("/superadmin/users");
    return { ok: true };
}

// ── Unsuspend user ─────────────────────────────────────────────────────────────

export async function superadminUnsuspendUser(id: string): Promise<ActionResult> {
    const check = await requireSuperadmin();
    if (!check.ok) return { ok: false, error: check.error };

    const admin = createAdminClient();

    const { data: target } = await admin
        .from("User")
        .select("email")
        .eq("id", id)
        .single();

    const { error } = await admin
        .from("User")
        .update({ status: "APPROVED", suspensionReason: null })
        .eq("id", id);

    if (error) return { ok: false, error: error.message };

    await logSecurityEvent({
        userId:  id,
        actorId: check.user.id,
        email:   target?.email,
        action:  "ACCOUNT_UNSUSPENDED",
        meta:    { unsuspended_by: check.user.email },
    });

    revalidatePath("/superadmin/users");
    return { ok: true };
}

// ── Delete user permanently ────────────────────────────────────────────────────

export async function superadminDeleteUser(id: string): Promise<ActionResult> {
    const check = await requireSuperadmin();
    if (!check.ok) return { ok: false, error: check.error };

    const admin = createAdminClient();

    const { data: target } = await admin
        .from("User")
        .select("email, role")
        .eq("id", id)
        .single();

    if (target?.role === "SUPERADMIN") {
        return { ok: false, error: "Cannot delete a Superadmin." };
    }

    // Delete storage files first
    const buckets = ["profile-picture", "teacher-documents", "qr-codes", "certificates"];
    for (const bucket of buckets) {
        const { data: files } = await admin.storage.from(bucket).list(id);
        if (files && files.length > 0) {
            const paths = files.map((f) => `${id}/${f.name}`);
            await admin.storage.from(bucket).remove(paths);
        }
    }

    // Delete related rows
    await admin.from("Attendance").delete().eq("teacher_id", id);
    await admin.from("DocumentSubmission").delete().eq("teacher_id", id);
    await admin.from("SecurityLog").delete().eq("user_id", id);
    await admin.from("Profile").delete().eq("id", id);
    await admin.from("ProfileHR").delete().eq("id", id);
    await admin.from("User").delete().eq("id", id);

    // Finally delete from auth
    const { error } = await admin.auth.admin.deleteUser(id);
    if (error) return { ok: false, error: error.message };

    revalidatePath("/superadmin/users");
    return { ok: true };
}

// ── Promote Teacher → Admin ────────────────────────────────────────────────────

export async function promoteToAdmin(id: string): Promise<ActionResult> {
    const check = await requireSuperadmin();
    if (!check.ok) return { ok: false, error: check.error };

    const admin = createAdminClient();

    // Check target user
    const { data: target } = await admin
        .from("User")
        .select("email, role")
        .eq("id", id)
        .single();

    if (!target) return { ok: false, error: "User not found." };
    if (target.role !== "TEACHER") {
        return { ok: false, error: "User must be a Teacher to promote to Admin." };
    }

    // Check superadmin's promotion quota for this window
    const windowStart = new Date(Date.now() - TEACHER_PROMOTION_WINDOW_MS).toISOString();

    const { count } = await admin
        .from("SecurityLog")
        .select("*", { count: "exact", head: true })
        .eq("actor_id", check.user.id)
        .eq("action", "ROLE_PROMOTED")
        .gte("created_at", windowStart);

    if ((count ?? 0) >= TEACHER_PROMOTION_LIMIT) {
        return {
            ok: false,
            error: process.env.NODE_ENV === "development"
                ? "Promotion limit reached. Resets in 1 hour."
                : "Promotion limit reached. Resets in 7 days.",
        };
    }

    // Update role
    const [{ error: dbError }, { error: metaError }] = await Promise.all([
        admin.from("User").update({ role: "ADMIN" }).eq("id", id),
        admin.auth.admin.updateUserById(id, {
            user_metadata: { role: "ADMIN" },
        }),
    ]);

    if (dbError)   return { ok: false, error: dbError.message };
    if (metaError) return { ok: false, error: metaError.message };

    await logSecurityEvent({
        userId:  id,
        actorId: check.user.id,
        email:   target.email,
        action:  "ROLE_PROMOTED",
        meta: {
            from_role:    "TEACHER",
            to_role:      "ADMIN",
            promoted_by:  check.user.email,
        },
    });

    revalidatePath("/superadmin/users");
    return { ok: true };
}

// ── Demote Admin → Teacher ─────────────────────────────────────────────────────

export async function demoteToTeacher(id: string): Promise<ActionResult> {
    const check = await requireSuperadmin();
    if (!check.ok) return { ok: false, error: check.error };

    const admin = createAdminClient();

    const { data: target } = await admin
        .from("User")
        .select("email, role")
        .eq("id", id)
        .single();

    if (!target) return { ok: false, error: "User not found." };
    if (target.role !== "ADMIN") {
        return { ok: false, error: "User must be an Admin to demote to Teacher." };
    }

    const [{ error: dbError }, { error: metaError }] = await Promise.all([
        admin.from("User").update({ role: "TEACHER" }).eq("id", id),
        admin.auth.admin.updateUserById(id, {
            user_metadata: { role: "TEACHER" },
        }),
    ]);

    if (dbError)   return { ok: false, error: dbError.message };
    if (metaError) return { ok: false, error: metaError.message };

    await logSecurityEvent({
        userId:  id,
        actorId: check.user.id,
        email:   target.email,
        action:  "ROLE_DEMOTED",
        meta: {
            from_role:   "ADMIN",
            to_role:     "TEACHER",
            demoted_by:  check.user.email,
        },
    });

    revalidatePath("/superadmin/users");
    return { ok: true };
}

// ── Promote Admin → Superadmin ─────────────────────────────────────────────────

export async function promoteToSuperadmin(id: string): Promise<ActionResult> {
    const check = await requireSuperadmin();
    if (!check.ok) return { ok: false, error: check.error };

    const admin = createAdminClient();

    // Check target user
    const { data: target } = await admin
        .from("User")
        .select("email, role")
        .eq("id", id)
        .single();

    if (!target) return { ok: false, error: "User not found." };
    if (target.role !== "ADMIN") {
        return {
            ok: false,
            error: "User must be an Admin to promote to Superadmin.",
        };
    }

    // Check max superadmin cap
    const { count: superadminCount } = await admin
        .from("User")
        .select("*", { count: "exact", head: true })
        .eq("role", "SUPERADMIN");

    if ((superadminCount ?? 0) >= MAX_SUPERADMINS) {
        return {
            ok: false,
            error: `Maximum of ${MAX_SUPERADMINS} Superadmins allowed.`,
        };
    }

    // Check system-wide cooldown
    const cooldownStart = new Date(Date.now() - SUPERADMIN_COOLDOWN_MS).toISOString();

    const { count: recentPromotions } = await admin
        .from("SecurityLog")
        .select("*", { count: "exact", head: true })
        .eq("action", "SUPERADMIN_PROMOTED")
        .gte("created_at", cooldownStart);

    if ((recentPromotions ?? 0) > 0) {
        return {
            ok: false,
            error: process.env.NODE_ENV === "development"
                ? "A Superadmin was promoted recently. Try again after 1 hour."
                : "A Superadmin was promoted recently. Try again after 7 days.",
        };
    }

    // Update role
    const [{ error: dbError }, { error: metaError }] = await Promise.all([
        admin.from("User").update({ role: "SUPERADMIN" }).eq("id", id),
        admin.auth.admin.updateUserById(id, {
            user_metadata: { role: "SUPERADMIN" },
        }),
    ]);

    if (dbError)   return { ok: false, error: dbError.message };
    if (metaError) return { ok: false, error: metaError.message };

    await logSecurityEvent({
        userId:  id,
        actorId: check.user.id,
        email:   target.email,
        action:  "SUPERADMIN_PROMOTED",
        meta: {
            from_role:   "ADMIN",
            to_role:     "SUPERADMIN",
            promoted_by: check.user.email,
        },
    });

    revalidatePath("/superadmin/users");
    return { ok: true };
}

// ── Change role (general handler) ─────────────────────────────────────────────

export async function changeUserRole(
    id: string,
    newRole: "TEACHER" | "ADMIN" | "SUPERADMIN",
): Promise<ActionResult> {
    if (newRole === "ADMIN")       return promoteToAdmin(id);
    if (newRole === "TEACHER")     return demoteToTeacher(id);
    if (newRole === "SUPERADMIN")  return promoteToSuperadmin(id);
    return { ok: false, error: "Invalid role." };
}