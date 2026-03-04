"use server";

import { revalidatePath } from "next/cache";
import { createAdminClient, createClient } from "@/lib/supabase/server";
import type { ActionResult } from "../types";
import { errMsg } from "../lib/utils";
import { toast } from "sonner";

type ActivityInsert = {
  actor_id: string | null;
  target_user_id: string | null;
  action: string;
  entity_type: string | null;
  entity_id: string | null;
  message: string;
  meta?: Record<string, unknown> | null;
};

async function insertActivity(rows: ActivityInsert[]) {
  if (!rows.length) return;

  const admin = createAdminClient();
  const { error } = await admin.from("ActivityLog").insert(
    rows.map((r) => ({
      actor_id: r.actor_id,
      target_user_id: r.target_user_id,
      action: r.action,
      entity_type: r.entity_type,
      entity_id: r.entity_id,
      message: r.message,
      meta: r.meta ?? null,
    }))
  );

  if (error) toast.error("ActivityLog insert failed");
}

async function requireAdmin() {
  const supabase = await createClient();
  const { data: authData, error: authError } = await supabase.auth.getUser();

  if (authError || !authData.user) {
    return { ok: false as const, error: "Not authenticated", userId: null as string | null };
  }

  const { data: roleRow, error: roleErr } = await supabase
    .from("User")
    .select("role")
    .eq("id", authData.user.id)
    .single();

  if (roleErr) return { ok: false as const, error: roleErr.message, userId: authData.user.id };

  if (roleRow?.role !== "ADMIN") {
    return { ok: false as const, error: "Unauthorized. Admin only.", userId: authData.user.id };
  }

  return { ok: true as const, error: null as string | null, userId: authData.user.id };
}

export async function approveProof(attendanceId: string, remarks: string): Promise<ActionResult> {
  try {
    const adminCheck = await requireAdmin();
    if (!adminCheck.ok) return { ok: false, error: adminCheck.error };

    const admin = createAdminClient();
    const now = new Date().toISOString();

    const { data: att, error: attErr } = await admin
      .from("Attendance")
      .select("teacher_id, training_id")
      .eq("id", attendanceId)
      .single();

    if (attErr) return { ok: false, error: attErr.message };

    // snapshot total_hours at approval time
    const { data: pd, error: pdErr } = await admin
      .from("ProfessionalDevelopment")
      .select("total_hours, title")
      .eq("id", att.training_id)
      .single();

    if (pdErr) return { ok: false, error: pdErr.message };

    if (!pd?.total_hours || pd.total_hours === 0) {
      return { ok: false, error: "Training has no hours set. Please update the training before approving." };
    }

    const { error } = await admin
      .from("Attendance")
      .update({
        status: "APPROVED",
        result: "PASSED",
        remarks: remarks?.trim() ? remarks.trim() : null,
        reviewed_at: now,
        reviewed_by: adminCheck.userId,
        approved_hours: pd.total_hours, // ← snapshot here
      })
      .eq("id", attendanceId);

    if (error) return { ok: false, error: error.message };

    await insertActivity([
      {
        actor_id: adminCheck.userId,
        target_user_id: String(att?.teacher_id ?? ""),
        action: "PROOF_APPROVED",
        entity_type: "ATTENDANCE",
        entity_id: attendanceId,
        message: "Your proof was approved.",
        meta: { 
          attendanceId, 
          trainingId: att?.training_id ?? null,
          title: pd?.title ?? null,
        },
      },
    ]);

    revalidatePath("/proof-review");
    revalidatePath("/professional-dev");
    revalidatePath("/compliance");
    revalidatePath("/dashboard");
    return { ok: true };
  } catch (e) {
    return { ok: false, error: errMsg(e) };
  }
}

export async function rejectProof(attendanceId: string, remarks: string): Promise<ActionResult> {
  try {
    const adminCheck = await requireAdmin();
    if (!adminCheck.ok) return { ok: false, error: adminCheck.error };

    if (!remarks?.trim()) return { ok: false, error: "Please provide a reason." };

    const admin = createAdminClient();
    const now = new Date().toISOString();

    const { data: att, error: fetchErr } = await admin
      .from("Attendance")
      .select("teacher_id, training_id, proof_path")
      .eq("id", attendanceId)
      .single();

    if (fetchErr) return { ok: false, error: fetchErr.message };

    const proofPath = att?.proof_path ?? null;
    if (proofPath) {
      const { error: delErr } = await admin.storage.from("certificates").remove([proofPath]);
      if (delErr) toast.error("failed to delete proof");
    }

    const { error: updateErr } = await admin
      .from("Attendance")
      .update({
        status: "REJECTED",
        result: "FAILED",
        remarks: remarks.trim(),
        reviewed_at: now,
        reviewed_by: adminCheck.userId,
        proof_url: null,
        proof_path: null,
      })
      .eq("id", attendanceId);

    if (updateErr) return { ok: false, error: updateErr.message };

    await insertActivity([
      {
        actor_id: adminCheck.userId,
        target_user_id: String(att?.teacher_id ?? ""),
        action: "PROOF_REJECTED",
        entity_type: "ATTENDANCE",
        entity_id: attendanceId,
        message: "Your proof was rejected.",
        meta: { attendanceId, trainingId: att?.training_id ?? null, reason: remarks.trim() },
      },
    ]);

    revalidatePath("/proof-review");
    revalidatePath("/professional-dev");
    revalidatePath("/dashboard");
    return { ok: true };
  } catch (e) {
    return { ok: false, error: errMsg(e) };
  }
}