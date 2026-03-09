"use server";
import { createClient } from "@/lib/supabase/server";
import type { AddResponsibilityForm, ChangeRequestForm } from "@/features/responsibilities/types/responsibility";

export async function fetchMyResponsibilities() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("TeacherResponsibility")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) return [];
  return data ?? [];
}

export async function fetchMyChangeRequests() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("ResponsibilityChangeRequest")
    .select("*")
    .order("requested_at", { ascending: false });

  if (error) return [];
  return data ?? [];
}

export async function submitChangeRequest(responsibilityId: string, form: ChangeRequestForm) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const { error } = await supabase
    .from("ResponsibilityChangeRequest")
    .insert({
      responsibility_id: responsibilityId,
      teacher_id: user.id,
      requested_changes: form.requested_changes,
      reason: form.reason,
      status: "PENDING",
    });

  if (error) throw new Error(error.message);
}