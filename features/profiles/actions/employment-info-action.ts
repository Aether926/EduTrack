import { supabase } from "@/lib/supabaseClient";
import type { HRChangeRequestPayload } from "@/features/profiles/types/employment-info";

export async function submitHRChangeRequest(
  teacherId: string,
  payload: HRChangeRequestPayload
) {
  const { data: existing } = await supabase
    .from("ProfileHRChangeRequest")
    .select("id")
    .eq("teacher_id", teacherId)
    .eq("status", "PENDING")
    .single();

  if (existing) {
    throw new Error("You already have a pending request. Please wait for it to be reviewed before submitting a new one.");
  }

  const { error } = await supabase.from("ProfileHRChangeRequest").insert({
    teacher_id: teacherId,
    requested_by: teacherId,
    requested_at: new Date().toISOString(),
    status: "PENDING",
    payload,
  });

  if (error) throw new Error(error.message);
}

export async function approveHRChangeRequest(reqId: string, note?: string) {
  const { error } = await supabase.rpc("approve_profilehr_change_request", {
    req_id: reqId,
    note: note ?? null,
  });

  if (error) throw new Error(error.message);
}

export async function rejectHRChangeRequest(reqId: string, note?: string) {
  const { error } = await supabase.rpc("reject_profilehr_change_request", {
    req_id: reqId,
    note: note ?? null,
  });

  if (error) throw new Error(error.message);
}