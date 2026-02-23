/* eslint-disable prefer-const */
import { supabase } from "@/lib/supabaseClient";

export async function fetchMyCompliance() {
  const { data, error } = await supabase
    .from("TeacherTrainingCompliance")
    .select("*")
    .single();

  if (error) return null;
  return data;
}

export async function fetchMyComplianceAlerts() {
  const { data } = await supabase
    .from("ComplianceAlert")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(10);

  return data ?? [];
}

export async function fetchMyCountedTrainings(schoolYear: string) {
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) return [];

  const { data: policy } = await supabase
    .from("TrainingCompliancePolicy")
    .select("period_start, period_end")
    .eq("school_year", schoolYear)
    .limit(1)
    .single();

  let query = supabase
    .from("Attendance")
    .select("id, status, result, training_id, ProfessionalDevelopment(title, type, start_date, end_date, total_hours, sponsoring_agency)")
    .eq("teacher_id", auth.user.id)
    .eq("status", "APPROVED")
    .eq("result", "PASSED");

  return (await query).data ?? [];
}