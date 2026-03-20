"use server";
import { createAdminClient } from "@/lib/supabase/server";
import type { TeacherOption } from "@/components/teacher-picker-modal";

export async function fetchTeacherOptions(): Promise<TeacherOption[]> {
  const admin = createAdminClient();

  const [{ data: users }, { data: profiles }, { data: hrRows }] = await Promise.all([
    admin
      .from("User")
      .select("id")
      .eq("role", "TEACHER")
      .eq("status", "APPROVED"),
    admin
      .from("Profile")
      .select("id, firstName, lastName, email, profileImage")
      .order("lastName", { ascending: true }),
    admin
      .from("ProfileHR")
      .select("id, employeeId, position"),
  ]);

  const ids = new Set((users ?? []).map((u) => u.id));
  const hrMap = new Map((hrRows ?? []).map((h) => [h.id, h]));

  return (profiles ?? [])
    .filter((p) => ids.has(p.id))
    .map((p) => {
      const hr = hrMap.get(p.id);
      return {
        id: p.id,
        fullName: `${p.firstName ?? ""} ${p.lastName ?? ""}`.trim(),
        employeeId: hr?.employeeId ?? "—",
        position: hr?.position ?? "",
        email: p.email ?? "",
        profileImage: p.profileImage ?? null,
      };
    });
}