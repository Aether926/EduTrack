import { supabase } from "@/lib/supabaseClient";
import type { AppointmentRequestForm } from "@/features/profiles/appointment/types/appointment";

export type AppointmentChangeRequestForm = AppointmentRequestForm & {
  position: string | null;
  appointment_type: string | null;
  start_date: string | null; // "YYYY-MM-DD"
  end_date: string | null;   // "YYYY-MM-DD"
  memo_no: string | null;
  remarks: string | null;
  school_name: string | null;
};

export async function submitAppointmentRequest(
  teacherId: string,
  form: AppointmentChangeRequestForm
) {
  const { data: sessionData, error: sessionError } =
    await supabase.auth.getSession();

  if (sessionError) throw new Error(sessionError.message);

  const requestedBy = sessionData.session?.user.id;
  if (!requestedBy) throw new Error("not authenticated");

  const {
    position,
    appointment_type,
    start_date,
    end_date,
    memo_no,
    remarks,
    school_name,
  } = form;

  const { error } = await supabase.rpc("insert_appointment_change_request", {
    p_teacher_id: teacherId,
    p_requested_by: requestedBy,
    p_position: position,
    p_appointment_type: appointment_type,
    p_start_date: start_date,
    p_end_date: end_date,
    p_memo_no: memo_no,
    p_remarks: remarks,
    p_payload: { school_name },
  });

  if (error) throw new Error(error.message);
}

export async function fetchLastAppointmentRequest(teacherId: string) {
  const { data, error } = await supabase.rpc("get_last_appointment_request", {
    p_teacher_id: teacherId,
  });

  return error ? null : data?.[0] ?? null;
}

export async function fetchAppointmentHistory(teacherId: string) {
  const { data, error } = await supabase.rpc("get_appointment_history", {
    p_teacher_id: teacherId,
  });

  if (error) return [];
  return data ?? [];
}
