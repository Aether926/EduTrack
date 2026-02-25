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

// ── Get current session info ──────────────────────────────────────────────────

export async function getSessionInfo(): Promise<ActionResult<{
  email: string;
  lastSignIn: string | null;
  createdAt: string | null;
}>> {
  try {
    const supabase = await createClient();
    const { data: auth } = await supabase.auth.getUser();
    if (!auth.user) return { ok: false, error: "Not authenticated" };

    return {
      ok: true,
      data: {
        email: auth.user.email ?? "",
        lastSignIn: auth.user.last_sign_in_at ?? null,
        createdAt: auth.user.created_at ?? null,
      },
    };
  } catch (e) {
    return { ok: false, error: errMsg(e) };
  }
}

// ── Change password ───────────────────────────────────────────────────────────

export async function changePassword(
  currentPassword: string,
  newPassword: string
): Promise<ActionResult> {
  try {
    const supabase = await createClient();
    const { data: auth } = await supabase.auth.getUser();
    if (!auth.user?.email) return { ok: false, error: "Not authenticated" };

    // Verify current password by attempting sign in
    const { error: verifyErr } = await supabase.auth.signInWithPassword({
      email: auth.user.email,
      password: currentPassword,
    });

    if (verifyErr) return { ok: false, error: "Current password is incorrect." };

    // Update to new password
    const { error: updateErr } = await supabase.auth.updateUser({
      password: newPassword,
    });

    if (updateErr) {
      if (updateErr.message.toLowerCase().includes("same password"))
        return { ok: false, error: "New password must be different from your current password." };
      return { ok: false, error: updateErr.message };
    }

    await insertActivity([{
      actor_id: auth.user.id,
      target_user_id: auth.user.id,
      action: "PASSWORD_CHANGED",
      entity_type: "User",
      entity_id: auth.user.id,
      message: "You changed your password.",
    }]);

    return { ok: true };
  } catch (e) {
    return { ok: false, error: errMsg(e) };
  }
}

// ── Get own deletion request ──────────────────────────────────────────────────

export async function getMyDeletionRequest(): Promise<ActionResult<{
  id: string;
  status: string;
  reason: string | null;
  initiated_by: string;
  scheduled_at: string | null;
  created_at: string;
  admin_note: string | null;
} | null>> {
  try {
    const supabase = await createClient();
    const { data: auth } = await supabase.auth.getUser();
    if (!auth.user) return { ok: false, error: "Not authenticated" };

    const admin = createAdminClient();
    const { data } = await admin
      .from("AccountDeletionRequest")
      .select("*")
      .eq("user_id", auth.user.id)
      .eq("status", "PENDING")
      .maybeSingle();

    return { ok: true, data: data ?? null };
  } catch (e) {
    return { ok: false, error: errMsg(e) };
  }
}

// ── Request account deletion ──────────────────────────────────────────────────

export async function requestAccountDeletion(
  email: string,
  password: string,
  reason: string
): Promise<ActionResult> {
  try {
    const supabase = await createClient();
    const { data: auth } = await supabase.auth.getUser();
    if (!auth.user) return { ok: false, error: "Not authenticated" };

    if (!reason.trim()) return { ok: false, error: "Please provide a reason." };

    // Verify email matches
    if (auth.user.email?.toLowerCase() !== email.trim().toLowerCase())
      return { ok: false, error: "Email does not match your account." };

    // Verify password
    const { error: verifyErr } = await supabase.auth.signInWithPassword({
      email: email.trim().toLowerCase(),
      password,
    });
    if (verifyErr) return { ok: false, error: "Incorrect password." };

    const admin = createAdminClient();

    // Check no pending request already
    const { data: existing } = await admin
      .from("AccountDeletionRequest")
      .select("id")
      .eq("user_id", auth.user.id)
      .eq("status", "PENDING")
      .maybeSingle();

    if (existing) return { ok: false, error: "You already have a pending deletion request." };

    // scheduled_at = 72 hours from now (5 minutes for dev)
    const isDev = process.env.NODE_ENV === "development";
    const scheduledAt = new Date(Date.now() + (isDev ? 5 * 60 * 1000 : 72 * 60 * 60 * 1000));

    const { data: req, error } = await admin
      .from("AccountDeletionRequest")
      .insert({
        user_id: auth.user.id,
        reason: reason.trim(),
        status: "PENDING",
        initiated_by: "TEACHER",
        scheduled_at: scheduledAt.toISOString(),
      })
      .select("id")
      .single();

    if (error) return { ok: false, error: error.message };

    await insertActivity([{
      actor_id: auth.user.id,
      target_user_id: auth.user.id,
      action: "ACCOUNT_DELETION_REQUESTED",
      entity_type: "AccountDeletionRequest",
      entity_id: req.id,
      message: "You requested account deletion.",
      meta: { reason: reason.trim(), scheduledAt: scheduledAt.toISOString() },
    }]);

    revalidatePath("/settings");
    return { ok: true };
  } catch (e) {
    return { ok: false, error: errMsg(e) };
  }
}

// ── Cancel own deletion request ───────────────────────────────────────────────

export async function cancelDeletionRequest(requestId: string): Promise<ActionResult> {
  try {
    const supabase = await createClient();
    const { data: auth } = await supabase.auth.getUser();
    if (!auth.user) return { ok: false, error: "Not authenticated" };

    const admin = createAdminClient();
    const now = new Date().toISOString();

    // Block teacher from cancelling admin-initiated requests
    const { data: existing } = await admin
      .from("AccountDeletionRequest")
      .select("initiated_by")
      .eq("id", requestId)
      .eq("user_id", auth.user.id)
      .maybeSingle();

    if (!existing) return { ok: false, error: "Request not found." };
    if (existing.initiated_by === "ADMIN")
      return { ok: false, error: "This deletion was initiated by an administrator and cannot be cancelled. Please contact your administrator." };

    const { error } = await admin
      .from("AccountDeletionRequest")
      .update({
        status: "CANCELLED",
        cancelled_at: now,
        cancelled_by: auth.user.id,
      })
      .eq("id", requestId)
      .eq("user_id", auth.user.id)
      .eq("status", "PENDING");

    if (error) return { ok: false, error: error.message };

    await insertActivity([{
      actor_id: auth.user.id,
      target_user_id: auth.user.id,
      action: "ACCOUNT_DELETION_CANCELLED",
      entity_type: "AccountDeletionRequest",
      entity_id: requestId,
      message: "You cancelled your account deletion request.",
    }]);

    revalidatePath("/settings");
    return { ok: true };
  } catch (e) {
    return { ok: false, error: errMsg(e) };
  }
}