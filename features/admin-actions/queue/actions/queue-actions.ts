"use server";

import { createClient } from "@/lib/supabase/server";

export async function approveHRChangeRequest(reqId: string, note?: string) {
  const supabase = await createClient();
  const { error } = await supabase.rpc("approve_profilehr_change_request", {
    req_id: reqId,
    note: note ?? null,
  });
  if (error) throw new Error(error.message);
}

export async function rejectHRChangeRequest(reqId: string, note?: string) {
  const supabase = await createClient();
  const { error } = await supabase.rpc("reject_profilehr_change_request", {
    req_id: reqId,
    note: note ?? null,
  });
  if (error) throw new Error(error.message);
}

export async function approveAppointmentRequest(reqId: string, note?: string) {
  const supabase = await createClient();
  const { error } = await supabase.rpc("approve_appointment_change_request", {
    req_id: reqId,
    note: note ?? null,
  });
  if (error) throw new Error(error.message);
}

export async function rejectAppointmentRequest(reqId: string, note?: string) {
  const supabase = await createClient();
  const { error } = await supabase.rpc("reject_appointment_change_request", {
    req_id: reqId,
    note: note ?? null,
  });
  if (error) throw new Error(error.message);
}