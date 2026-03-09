"use server";
/* eslint-disable prefer-const */
import { createClient } from "@/lib/supabase/server";

export async function fetchMyCompliance() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("TeacherTrainingCompliance")
    .select("*")
    .single();

  if (error) return null;
  return data;
}

export async function fetchMyComplianceAlerts() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("ComplianceAlert")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(10);

  return data ?? [];
}

export async function fetchMyCountedTrainings(schoolYear: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const { data: policy } = await supabase
    .from("TrainingCompliancePolicy")
    .select("period_start, period_end")
    .eq("school_year", schoolYear)
    .limit(1)
    .single();

  const { data } = await supabase
    .from("Attendance")
    .select("id, status, result, training_id, ProfessionalDevelopment(title, type, start_date, end_date, total_hours, sponsoring_agency)")
    .eq("teacher_id", user.id)
    .eq("status", "APPROVED")
    .eq("result", "PASSED");

  return data ?? [];
}