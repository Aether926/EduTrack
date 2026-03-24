"use server";

import { createClient, createAdminClient } from "@/lib/supabase/server";
import type { AddAppointmentForm } from "@/features/admin-actions/appointment-history/types/appointment-history";

export async function addAppointmentHistoryEntry(form: AddAppointmentForm) {
  const supabase = await createClient();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) throw new Error("Not authenticated");

  const admin = createAdminClient();
  const { error } = await admin.from("AppointmentHistory").insert({
    teacher_id:       form.teacher_id,
    position:         form.position,
    appointment_type: form.appointment_type,
    school_name:      form.school_name || null,
    start_date:       form.start_date || null,
    end_date:         form.end_date   || null,
    memo_no:          form.memo_no    || null,
    remarks:          form.remarks    || null,
    created_by:       auth.user.id,
    approved_by:      auth.user.id,
    approved_at:      new Date().toISOString(),
    status:           "APPROVED",
  });

  if (error) throw new Error(error.message);
}

export async function updateAppointmentHistoryEntry(
  id: string,
  data: {
    teacher_id?: string;
    position?: string;
    appointment_type?: string;
    school_name?: string | null;
    start_date?: string;
    end_date?: string | null;
    memo_no?: string | null;
    remarks?: string | null;
  }
) {
  const admin = createAdminClient();
  const { error } = await admin
    .from("AppointmentHistory")
    .update({ ...data, updated_at: new Date().toISOString() })
    .eq("id", id);

  if (error) throw new Error(error.message);
}

export async function deleteAppointmentHistoryEntry(id: string) {
  const admin = createAdminClient();
  const { error } = await admin
    .from("AppointmentHistory")
    .delete()
    .eq("id", id);

  if (error) throw new Error(error.message);
}