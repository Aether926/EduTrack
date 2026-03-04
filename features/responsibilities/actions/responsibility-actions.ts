import { supabase } from "@/lib/supabaseClient";
import type { AddResponsibilityForm, ChangeRequestForm } from "@/features/responsibilities/types/responsibility";

export async function fetchMyResponsibilities() {
  const { data, error } = await supabase
    .from("TeacherResponsibility")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) return [];
  return data ?? [];
}

export async function fetchMyChangeRequests() {
  const { data, error } = await supabase
    .from("ResponsibilityChangeRequest")
    .select("*")
    .order("requested_at", { ascending: false });

  if (error) return [];
  return data ?? [];
}

export async function submitChangeRequest(
  responsibilityId: string,
  form: ChangeRequestForm
) {
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) throw new Error("Not authenticated");

  const { error } = await supabase
    .from("ResponsibilityChangeRequest")
    .insert({
      responsibility_id: responsibilityId,
      teacher_id: auth.user.id,
      requested_changes: form.requested_changes,
      reason: form.reason,
      status: "PENDING",
    });

  if (error) throw new Error(error.message);
}