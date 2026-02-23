import { supabase } from "@/lib/supabaseClient";
import type { PendingUser, ActionResult } from "../types";

async function attachProfile(u: { id: string; created_at: string; email: string; role: string; status: string }) {
  const { data: profile } = await supabase
    .from("Profile")
    .select("firstName, lastName, middleInitial, contactNumber")
    .eq("id", u.id)
    .single();

  return {
      id: u.id,
      email: u.email,
      role: u.role,
      status: u.status,
      createdAt: u.created_at,
      firstName: profile?.firstName || "",
      lastName: profile?.lastName || "",
      middleInitial: profile?.middleInitial || "",
      contactNumber: profile?.contactNumber || "",
      employeeId: ""
  } satisfies PendingUser;
}

export async function fetchUsersByStatus(status: "PENDING" | "REJECTED") {
  const { data, error } = await supabase
    .from("User")
    .select("id, email, role, status, created_at")
    .eq("status", status)
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);

  const rows = await Promise.all((data ?? []).map(attachProfile));
  return rows as PendingUser[];
}

export async function approveUser(id: string): Promise<ActionResult> {
  const { error } = await supabase.from("User").update({ status: "APPROVED" }).eq("id", id);
  if (error) return { ok: false, error: error.message };
  return { ok: true };
}

export async function rejectUser(id: string): Promise<ActionResult> {
  const { error } = await supabase.from("User").update({ status: "REJECTED" }).eq("id", id);
  if (error) return { ok: false, error: error.message };
  return { ok: true };
}

export async function permanentlyDeleteUser(id: string): Promise<ActionResult> {
  const { error: profileError } = await supabase.from("Profile").delete().eq("id", id);
  if (profileError) return { ok: false, error: profileError.message };

  const { error: userError } = await supabase.from("User").delete().eq("id", id);
  if (userError) return { ok: false, error: userError.message };

  return { ok: true };
}