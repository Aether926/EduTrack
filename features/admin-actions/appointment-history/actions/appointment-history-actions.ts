import { supabase } from "@/lib/supabaseClient";
import type { AddAppointmentForm } from "@/features/admin-actions/appointment-history/types/appointment-history";

export async function addAppointmentHistoryEntry(form: AddAppointmentForm) {
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) throw new Error("Not authenticated");

  const { error } = await supabase.from("AppointmentHistory").insert({
    teacher_id: form.teacher_id,
    position: form.position,
    appointment_type: form.appointment_type,
    start_date: form.start_date || null,
    end_date: form.end_date || null,
    memo_no: form.memo_no || null,
    remarks: form.remarks || null,
    created_by: auth.user.id,
    approved_by: auth.user.id,
    approved_at: new Date().toISOString(),
    status: "APPROVED",
  });

  if (error) throw new Error(error.message);
}