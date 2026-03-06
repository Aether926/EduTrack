"use server";

import { createClient, createAdminClient } from "@/lib/supabase/server";
import type { ActionResult } from "../types";

const ADMIN_ROLES = ["ADMIN", "SUPERADMIN"] as const;

async function requireAdmin() {
  const supabase = await createClient();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) return { ok: false as const, error: "Not authenticated" };
  const { data: user } = await supabase
    .from("User").select("role").eq("id", auth.user.id).single();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  if (!ADMIN_ROLES.includes(user?.role as any)) return { ok: false as const, error: "Unauthorized" };
  return { ok: true as const, error: null, userId: auth.user.id };
}

export async function approveUser(id: string): Promise<ActionResult> {
  const check = await requireAdmin();
  if (!check.ok) return { ok: false, error: check.error };
  const admin = createAdminClient();
  const { error } = await admin.from("User").update({ status: "APPROVED" }).eq("id", id);
  if (error) return { ok: false, error: error.message };
  return { ok: true };
}

export async function rejectUser(id: string): Promise<ActionResult> {
  const check = await requireAdmin();
  if (!check.ok) return { ok: false, error: check.error };
  const admin = createAdminClient();
  const { error } = await admin.from("User").update({ status: "REJECTED" }).eq("id", id);
  if (error) return { ok: false, error: error.message };
  return { ok: true };
}

export async function permanentlyDeleteUser(id: string): Promise<ActionResult> {
  const check = await requireAdmin();
  if (!check.ok) return { ok: false, error: check.error };
  const admin = createAdminClient();
  const { error } = await admin.auth.admin.deleteUser(id);
  if (error) return { ok: false, error: error.message };
  return { ok: true };
}

export async function fetchUsersByStatus(status: "PENDING" | "REJECTED") {
  const check = await requireAdmin();
  if (!check.ok) return [];
  const admin = createAdminClient();
  const { data, error } = await admin
    .from("User")
    .select("id, email, role, status, created_at")
    .eq("status", status)
    .order("created_at", { ascending: false });
  if (error) return [];
  const rows = await Promise.all((data ?? []).map(async (u) => {
    const { data: profile } = await admin
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
      employeeId: "",
    };
  }));
  return rows;
}