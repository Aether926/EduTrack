"use server";
import { createAdminClient } from "@/lib/supabase/server";
import type { TeacherOption } from "@/components/teacher-picker-modal";

export async function fetchTeacherOptions(): Promise<TeacherOption[]> {
  const admin = createAdminClient();

  const [{ data: users }, { data: profiles }, { data: hrRows }] = await Promise.all([
    admin
      .from("User")
      .select("id")
      .eq("role", "TEACHER"),
    admin
      .from("Profile")
      .select("id, firstName, lastName")
      .order("lastName", { ascending: true }),
    admin
      .from("ProfileHR")
      .select("id, employeeId"),
  ]);

  const ids = new Set((users ?? []).map((u) => u.id));
  const hrMap = new Map((hrRows ?? []).map((h) => [h.id, h.employeeId ?? ""]));

  return (profiles ?? [])
    .filter((p) => ids.has(p.id))
    .map((p) => ({
      id: p.id,
      fullName: `${p.firstName ?? ""} ${p.lastName ?? ""}`.trim(),
      employeeId: hrMap.get(p.id) ?? "—",
    }));
}