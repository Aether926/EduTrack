"use server";

import { createClient } from "@/lib/supabase/server";
import type { HRChangeRequestPayload, ProfileHRChangeRequest } from "@/features/profiles/types/employment-info";

export async function fetchLastHRChangeRequest(teacherId: string): Promise<ProfileHRChangeRequest | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("ProfileHRChangeRequest")
    .select("*")
    .eq("teacher_id", teacherId)
    .order("requested_at", { ascending: false })
    .limit(1)
    .single();

  if (error || !data) return null;
  return data as ProfileHRChangeRequest;
}

export async function submitHRChangeRequest(
  teacherId: string,
  payload: HRChangeRequestPayload
) {
  const supabase = await createClient();

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
    teacher_id:   teacherId,
    requested_by: teacherId,
    requested_at: new Date().toISOString(),
    status:       "PENDING",
    payload,
  });

  if (error) throw new Error(error.message);
}

export async function approveHRChangeRequest(reqId: string, note?: string) {
  const supabase = await createClient();
  const { error } = await supabase.rpc("approve_profilehr_change_request", {
    req_id: reqId,
    note:   note ?? null,
  });
  if (error) throw new Error(error.message);
}

export async function rejectHRChangeRequest(reqId: string, note?: string) {
  const supabase = await createClient();
  const { error } = await supabase.rpc("reject_profilehr_change_request", {
    req_id: reqId,
    note:   note ?? null,
  });
  if (error) throw new Error(error.message);
}