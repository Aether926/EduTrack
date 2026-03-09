"use server";

import { createAdminClient, createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

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
  if (!auth.user) return { ok: false as const, error: "Not authenticated", userId: null as string | null };
  const role = auth.user.user_metadata?.role ?? "TEACHER";
  if (!["ADMIN", "SUPERADMIN"].includes(role)) return { ok: false as const, error: "Unauthorized", userId: auth.user.id };
  return { ok: true as const, error: null as string | null, userId: auth.user.id };
}

async function insertActivity(rows: {
  actor_id: string;
  target_user_id: string;
  action: string;
  entity_type: string;
  entity_id: string;
  message: string;
  meta?: Record<string, unknown>;
}[]) {
  const admin = createAdminClient();
  await admin.from("ActivityLog").insert(rows.map((r) => ({
    actor_id: r.actor_id,
    target_user_id: r.target_user_id,
    action: r.action,
    entity_type: r.entity_type,
    entity_id: r.entity_id,
    message: r.message,
    meta: r.meta ?? null,
  })));
}

// ── Get all pending deletion requests ────────────────────────────────────────

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
    admin.from("Profile").select("id, firstName, lastName, email").in("id", userIds),
    admin.from("ProfileHR").select("id, employeeId").in("id", userIds),
  ]);

  const profileMap = new Map((profiles ?? []).map((p) => [p.id, p]));
  const hrMap      = new Map((hrs ?? []).map((h) => [h.id, h]));

  return requests.map((r) => ({
    ...r,
    user: {
      id:         r.user_id,
      firstName:  profileMap.get(r.user_id)?.firstName ?? null,
      lastName:   profileMap.get(r.user_id)?.lastName  ?? null,
      email:      profileMap.get(r.user_id)?.email     ?? null,
      employeeId: hrMap.get(r.user_id)?.employeeId     ?? null,
    },
  }));
}

// ── Admin initiates deletion ──────────────────────────────────────────────────

export async function adminInitiateDeletion(
  teacherId: string,
  reason: string
): Promise<ActionResult> {
  try {
    const adminCheck = await requireAdmin();
    if (!adminCheck.ok) return { ok: false, error: adminCheck.error };
    if (!reason.trim()) return { ok: false, error: "Please provide a reason." };

    const admin = createAdminClient();

    // Check no pending request already
    const { data: existing } = await admin
      .from("AccountDeletionRequest")
      .select("id")
      .eq("user_id", teacherId)
      .eq("status", "PENDING")
      .maybeSingle();

    if (existing) return { ok: false, error: "This teacher already has a pending deletion request." };

    const isDev = process.env.NODE_ENV === "development";
    const scheduledAt = new Date(Date.now() + (isDev ? 5 * 60 * 1000 : 72 * 60 * 60 * 1000));

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

    await insertActivity([{
      actor_id: adminCheck.userId!,
      target_user_id: teacherId,
      action: "ACCOUNT_DELETION_INITIATED_BY_ADMIN",
      entity_type: "AccountDeletionRequest",
      entity_id: req.id,
      message: "Admin has initiated account deletion. Your account will be deleted after the grace period.",
      meta: { reason: reason.trim(), scheduledAt: scheduledAt.toISOString() },
    }]);

    revalidatePath("/admin-actions");
    revalidatePath("/settings");
    return { ok: true };
  } catch (e) {
    return { ok: false, error: errMsg(e) };
  }
}

// ── Admin cancel deletion request ────────────────────────────────────────────

export async function adminCancelDeletion(requestId: string): Promise<ActionResult> {
  try {
    const adminCheck = await requireAdmin();
    if (!adminCheck.ok) return { ok: false, error: adminCheck.error };

    const admin = createAdminClient();
    const now   = new Date().toISOString();

    const { data: req } = await admin
      .from("AccountDeletionRequest")
      .select("user_id")
      .eq("id", requestId)
      .single();

    if (!req) return { ok: false, error: "Request not found" };

    const { error } = await admin
      .from("AccountDeletionRequest")
      .update({ status: "CANCELLED", cancelled_at: now, cancelled_by: adminCheck.userId })
      .eq("id", requestId)
      .eq("status", "PENDING");

    if (error) return { ok: false, error: error.message };

    await insertActivity([{
      actor_id: adminCheck.userId!,
      target_user_id: req.user_id,
      action: "ACCOUNT_DELETION_CANCELLED_BY_ADMIN",
      entity_type: "AccountDeletionRequest",
      entity_id: requestId,
      message: "Admin has cancelled the account deletion request.",
    }]);

    revalidatePath("/admin-actions");
    revalidatePath("/settings");
    return { ok: true };
  } catch (e) {
    return { ok: false, error: errMsg(e) };
  }
}

// ── Admin finalize deletion (after grace period) ──────────────────────────────

export async function adminFinalizeDeleteAccount(requestId: string): Promise<ActionResult> {
  try {
    const adminCheck = await requireAdmin();
    if (!adminCheck.ok) return { ok: false, error: adminCheck.error };

    const admin = createAdminClient();
    const now   = new Date().toISOString();

    const { data: req } = await admin
      .from("AccountDeletionRequest")
      .select("*")
      .eq("id", requestId)
      .single();

    if (!req) return { ok: false, error: "Request not found" };
    if (req.status !== "PENDING") return { ok: false, error: "Request is no longer pending" };

    // Check grace period has passed
    if (req.scheduled_at && new Date(req.scheduled_at) > new Date()) {
      const remaining = new Date(req.scheduled_at).getTime() - Date.now();
      const mins = Math.ceil(remaining / 60000);
      return { ok: false, error: `Grace period has not passed yet. ${mins} minute(s) remaining.` };
    }

    // Mark request as approved
    await admin
      .from("AccountDeletionRequest")
      .update({ status: "APPROVED", reviewed_by: adminCheck.userId, reviewed_at: now })
      .eq("id", requestId);

    // ── Clean up storage files ────────────────────────────────────────────────
    const { data: files } = await admin.storage
      .from("teacher-documents")
      .list(req.user_id);

    if (files && files.length > 0) {
      const paths = files.map((f: { name: string }) => `${req.user_id}/${f.name}`);
      await admin.storage.from("teacher-documents").remove(paths);
    }

    // Delete user from auth (cascades to all related DB data)
    const { error: deleteErr } = await admin.auth.admin.deleteUser(req.user_id);
    if (deleteErr) return { ok: false, error: deleteErr.message };

    revalidatePath("/admin-actions");
    return { ok: true };
  } catch (e) {
    return { ok: false, error: errMsg(e) };
  }
}