import { supabase } from "@/lib/supabaseClient";
import type { AddResponsibilityForm } from "@/features/responsibilities/types/responsibility";

export async function addResponsibility(form: AddResponsibilityForm) {
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) throw new Error("Not authenticated");

  const { error } = await supabase.from("TeacherResponsibility").insert({
    teacher_id: form.teacher_id,
    type: form.type,
    title: form.title,
    details: form.details,
    status: "ACTIVE",
    created_by: auth.user.id,
  });

  if (error) throw new Error(error.message);
}

export async function updateResponsibilityStatus(
  id: string,
  status: "ACTIVE" | "ENDED"
) {
  const { error } = await supabase
    .from("TeacherResponsibility")
    .update({ status, updated_at: new Date().toISOString() })
    .eq("id", id);

  if (error) throw new Error(error.message);
}

export async function approveChangeRequest(id: string, note?: string) {
  const { data: req } = await supabase
    .from("ResponsibilityChangeRequest")
    .select("*")
    .eq("id", id)
    .single();

  if (!req) throw new Error("Request not found");

  const { error: updateReqError } = await supabase
    .from("ResponsibilityChangeRequest")
    .update({
      status: "APPROVED",
      reviewed_at: new Date().toISOString(),
      review_note: note ?? null,
    })
    .eq("id", id);

  if (updateReqError) throw new Error(updateReqError.message);

  // apply changes to the responsibility
  const changes = req.requested_changes as Record<string, unknown>;
  const { error: updateError } = await supabase
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
  const { error } = await supabase
    .from("ResponsibilityChangeRequest")
    .update({
      status: "REJECTED",
      reviewed_at: new Date().toISOString(),
      review_note: note,
    })
    .eq("id", id);

  if (error) throw new Error(error.message);
}