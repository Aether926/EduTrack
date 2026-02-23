"use server";

import { createAdminClient, createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { toast } from "sonner";

export type ActionResult<T = null> =
  | { ok: true; data?: T }
  | { ok: false; error: string };

function errMsg(e: unknown) {
  if (e instanceof Error) return e.message;
  if (typeof e === "string") return e;
  return "something went wrong";
}

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

  if (error) toast.error("ActivityLog insert failed:");
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

/** ADMIN assigns teachers to a training */
export async function saveTrainingAssignments(trainingId: string, teacherIds: string[]) {
  const adminCheck = await requireAdmin();
  if (!adminCheck.ok) throw new Error(adminCheck.error);

  const admin = createAdminClient();

  const rows = teacherIds.map((id) => ({
    teacher_id: id,
    training_id: trainingId,
    status: "ENROLLED",
  }));

  const { error } = await admin
    .from("Attendance")
    .upsert(rows, { onConflict: "teacher_id,training_id" });

  if (error) throw new Error(error.message);

  // get training title for nicer activity
  const { data: pd } = await admin
    .from("ProfessionalDevelopment")
    .select("title,type")
    .eq("id", trainingId)
    .single();

  await insertActivity(
    teacherIds.map((teacherId) => ({
      actor_id: adminCheck.userId,
      target_user_id: teacherId,
      action: "ASSIGNED_TO_TRAINING",
      entity_type: "PROFESSIONAL_DEVELOPMENT",
      entity_id: trainingId,
      message: `You were assigned to ${pd?.title ?? "a training"}.`,
      meta: { trainingId, title: pd?.title ?? null, type: pd?.type ?? null },
    }))
  );

  revalidatePath(`/add-training-seminar/${trainingId}/assign`);
  revalidatePath("/add-training-seminar");
  revalidatePath("/dashboard");
}

/** TEACHER submits proof */
export async function submitAttendanceProof(
  attendanceId: string,
  formData: FormData
): Promise<ActionResult> {
  try {
    const supabase = await createClient();
    const { data: authData } = await supabase.auth.getUser();
    const user = authData.user;
    if (!user) return { ok: false, error: "not authenticated" };

    const { data: attendance, error: aErr } = await supabase
      .from("Attendance")
      .select("id, teacher_id, training_id, status")
      .eq("id", attendanceId)
      .single();

    if (aErr || !attendance) return { ok: false, error: "record not found" };
    if (String(attendance.teacher_id) !== String(user.id))
      return { ok: false, error: "not allowed" };

    const file = formData.get("file");
    if (!(file instanceof File)) return { ok: false, error: "file is required" };

    const safeName = file.name.replace(/[^\w.\-]+/g, "_");
    const path = `attendance/${user.id}/${attendanceId}/${Date.now()}_${safeName}`;

    const admin = createAdminClient();

    const { error: upErr } = await admin.storage
      .from("certificates")
      .upload(path, file, { upsert: true });

    if (upErr) return { ok: false, error: upErr.message };

    const { data: pub } = admin.storage.from("certificates").getPublicUrl(path);
    const proofUrl = pub.publicUrl;

    const now = new Date().toISOString();

    const { error: uErr } = await admin
      .from("Attendance")
      .update({
        proof_url: proofUrl,
        proof_path: path,
        status: "SUBMITTED",
        proof_submitted_at: now,
      })
      .eq("id", attendanceId);

    if (uErr) return { ok: false, error: uErr.message };

    await insertActivity([
      {
        actor_id: user.id,
        target_user_id: user.id,
        action: "PROOF_SUBMITTED",
        entity_type: "ATTENDANCE",
        entity_id: attendanceId,
        message: "You submitted proof for a training.",
        meta: { attendanceId, trainingId: attendance.training_id },
      },
    ]);

    revalidatePath("/professional-dev");
    revalidatePath(`/professional-dev/${attendanceId}/upload-proof`);
    revalidatePath("/dashboard");

    return { ok: true };
  } catch (e) {
    return { ok: false, error: errMsg(e) };
  }
}

/** ADMIN approves */
export async function approveAttendance(
  attendanceId: string,
  remarks: string
): Promise<ActionResult> {
  try {
    const adminCheck = await requireAdmin();
    if (!adminCheck.ok) return { ok: false, error: adminCheck.error };

    const admin = createAdminClient();
    const now = new Date().toISOString();

    // get teacher id + training id
    const { data: att, error: attErr } = await admin
      .from("Attendance")
      .select("teacher_id, training_id")
      .eq("id", attendanceId)
      .single();

    if (attErr) return { ok: false, error: attErr.message };

    // snapshot total_hours from ProfessionalDevelopment at approval time
    const { data: pd, error: pdErr } = await admin
      .from("ProfessionalDevelopment")
      .select("total_hours, title")
      .eq("id", att.training_id)
      .single();

    if (pdErr) return { ok: false, error: pdErr.message };

    const { error } = await admin
      .from("Attendance")
      .update({
        status: "APPROVED",
        result: "PASSED",
        remarks: remarks || null,
        reviewed_at: now,
        reviewed_by: adminCheck.userId,
        approved_hours: pd?.total_hours ?? 0, // ← snapshot here
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

    revalidatePath("/admin/proof-review");
    revalidatePath("/professional-dev");
    revalidatePath("/dashboard");
    return { ok: true };
  } catch (e) {
    return { ok: false, error: errMsg(e) };
  }
}

/** ADMIN rejects */
export async function rejectAttendance(
  attendanceId: string,
  remarks: string
): Promise<ActionResult> {
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
      const { error: delErr } = await admin.storage
        .from("certificates")
        .remove([proofPath]);

      if (delErr) toast.error("Failed to delete proof:");
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
        meta: {
          attendanceId,
          trainingId: att?.training_id ?? null,
          reason: remarks.trim(),
        },
      },
    ]);

    revalidatePath("/admin/proof-review");
    revalidatePath("/professional-dev");
    revalidatePath("/dashboard");
    return { ok: true };
  } catch (e) {
    return { ok: false, error: errMsg(e) };
  }
}
