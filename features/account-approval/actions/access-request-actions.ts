"use server";

import { createClient, createAdminClient } from "@/lib/supabase/server";
import type { ActionResult } from "../types";
import { revalidatePath, unstable_cache } from "next/cache";
import { revalidateTag } from "next/cache";

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

  // Get the user's role from the User table
  const { data: userData } = await admin
    .from("User")
    .select("role")
    .eq("id", id)
    .single();

  const role = userData?.role ?? "TEACHER";

  // Update status in DB and sync role to Auth metadata in parallel
  const [{ error: dbError }, { error: metaError }] = await Promise.all([
    admin.from("User").update({ status: "APPROVED" }).eq("id", id),
    admin.auth.admin.updateUserById(id, {
      user_metadata: { role },
    }),
  ]);

  if (dbError) return { ok: false, error: dbError.message };
  if (metaError) return { ok: false, error: metaError.message };

  revalidatePath("access-requests");
  return { ok: true };
}

export async function rejectUser(id: string): Promise<ActionResult> {
  const check = await requireAdmin();
  if (!check.ok) return { ok: false, error: check.error };
  const admin = createAdminClient();
  const { error } = await admin
    .from("User")
    .update({ status: "REJECTED" })
    .eq("id", id);
  if (error) return { ok: false, error: error.message };

  revalidatePath("access-requests");
  return { ok: true };
}

export async function permanentlyDeleteUser(id: string): Promise<ActionResult> {
  const check = await requireAdmin();
  if (!check.ok) return { ok: false, error: check.error };
  const admin = createAdminClient();
  const { error } = await admin.auth.admin.deleteUser(id);
  if (error) return { ok: false, error: error.message };

  revalidatePath("access-requests");
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

    if (error || !data?.length) return [];

    const ids = data.map((u) => u.id);

    const [{ data: profiles }, { data: hrProfiles }] = await Promise.all([
        admin
            .from("Profile")
            .select("id, firstName, lastName, middleInitial, contactNumber, profileImage")
            .in("id", ids),
        admin
            .from("ProfileHR")
            .select("id, employeeId, position, dateOfOriginalAppointment, dateOfOriginalDeployment")
            .in("id", ids),
    ]);

    const profileMap = new Map((profiles ?? []).map((p) => [p.id, p]));
    const hrMap = new Map((hrProfiles ?? []).map((p) => [p.id, p]));

    return data.map((u) => {
        const profile = profileMap.get(u.id);
        const hr = hrMap.get(u.id);
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
            employeeId: hr?.employeeId || "",
            position: hr?.position || "",
            dateOfOriginalAppointment: hr?.dateOfOriginalAppointment || null,
            dateOfOriginalDeployment: hr?.dateOfOriginalDeployment || null,
            profileImage: profile?.profileImage ?? null,
        };
    });
}