"use server";
import { createClient } from "@/lib/supabase/server";
import type { AppointmentRequestForm } from "@/features/profiles/appointment/types/appointment";

export type AppointmentChangeRequestForm = AppointmentRequestForm & {
  position: string | null;
  appointment_type: string | null;
  start_date: string | null;
  end_date: string | null;
  memo_no: string | null;
  remarks: string | null;
  school_name: string | null;
};

export async function submitAppointmentRequest(
  teacherId: string,
  form: AppointmentChangeRequestForm
) {
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError) throw new Error(authError.message);
  if (!user) throw new Error("not authenticated");

  const { error } = await supabase.rpc("insert_appointment_change_request", {
    p_teacher_id: teacherId,
    p_requested_by: user.id,
    p_position: form.position,
    p_appointment_type: form.appointment_type,
    p_start_date: form.start_date,
    p_end_date: form.end_date,
    p_memo_no: form.memo_no,
    p_remarks: form.remarks,
    p_payload: { school_name: form.school_name },
  });

  if (error) throw new Error(error.message);
}

export async function fetchLastAppointmentRequest(teacherId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("get_last_appointment_request", {
    p_teacher_id: teacherId,
  });

  return error ? null : data?.[0] ?? null;
}

export async function fetchAppointmentHistory(teacherId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("get_appointment_history", {
    p_teacher_id: teacherId,
  });

  if (error) return [];
  return data ?? [];
}