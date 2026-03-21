"use server";
import { createClient, createAdminClient } from "@/lib/supabase/server";
import type { AddResponsibilityForm } from "@/features/admin-actions/responsibilities/types/responsibility";

export async function addResponsibility(form: AddResponsibilityForm) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const admin = createAdminClient();
  const { error } = await admin.from("TeacherResponsibility").insert({
    teacher_id: form.teacher_id,
    type: form.type,
    title: form.title,
    details: form.details,
    status: "ACTIVE",
    created_by: user.id,
  });

  if (error) throw new Error(error.message);
}

export async function updateResponsibility(
  id: string,
  data: {
    teacher_id?: string;
    type?: string;
    title?: string;
    details?: Record<string, unknown>;
  }
) {
  const admin = createAdminClient();
  const { error } = await admin
    .from("TeacherResponsibility")
    .update({ ...data, updated_at: new Date().toISOString() })
    .eq("id", id);

  if (error) throw new Error(error.message);
}

export async function updateResponsibilityStatus(id: string, status: "ACTIVE" | "ENDED") {
  const admin = createAdminClient();
  const { error } = await admin
    .from("TeacherResponsibility")
    .update({ status, updated_at: new Date().toISOString() })
    .eq("id", id);

  if (error) throw new Error(error.message);
}

export async function approveChangeRequest(id: string, note?: string) {
  const admin = createAdminClient();

  const { data: req } = await admin
    .from("ResponsibilityChangeRequest")
    .select("*")
    .eq("id", id)
    .single();

  if (!req) throw new Error("Request not found");

  const { error: updateReqError } = await admin
    .from("ResponsibilityChangeRequest")
    .update({
      status: "APPROVED",
      reviewed_at: new Date().toISOString(),
      review_note: note ?? null,
    })
    .eq("id", id);

  if (updateReqError) throw new Error(updateReqError.message);

  const changes = req.requested_changes as Record<string, unknown>;
  const { error: updateError } = await admin
    .from("TeacherResponsibility")
    .update({
      ...(changes.title ? { title: changes.title } : {}),
      ...(changes.details ? { details: changes.details } : {}),
      updated_at: new Date().toISOString(),
    })
    .eq("id", req.responsibility_id);

  if (updateError) throw new Error(updateError.message);
}

export async function rejectChangeRequest(id: string, note: string) {
  const admin = createAdminClient();
  const { error } = await admin
    .from("ResponsibilityChangeRequest")
    .update({
      status: "REJECTED",
      reviewed_at: new Date().toISOString(),
      review_note: note,
    })
    .eq("id", id);

  if (error) throw new Error(error.message);
}