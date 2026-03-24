/* eslint-disable @typescript-eslint/no-explicit-any */
// lib/database/assignments.ts
import { createAdminClient } from "@/lib/supabase/server";
import type { TeacherTableRow, ProfessionalDevelopment } from "@/lib/user";

type AttendanceRow = { 
  teacher_id: string | null 
};

type UserRow = {
  id: string;
  email: string | null;
};

// CamelCase to match your database
type ProfileRow = {
  id: string;
  employeeId?: string | null;
  firstName?: string | null;
  lastName?: string | null;
  middleInitial?: string | null;
  contactNumber?: string | null;
  email?: string | null;
  profileImage?: string | null;
  position?: string | null;
};

export async function getProfessionalDevelopmentAdmin(id: string) {
  const supabase = createAdminClient();

  const { data, error } = await supabase
    .from("ProfessionalDevelopment")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    return null;
  }
  
  return data as ProfessionalDevelopment;
}

export async function getAssignedTeacherIds(trainingId: string) {
  const supabase = createAdminClient();

  const { data, error } = await supabase
    .from("Attendance")
    .select("teacher_id")
    .eq("training_id", trainingId);

  if (error) {
    return [];
  }
  
  return (data as AttendanceRow[])
    .map((r) => r.teacher_id)
    .filter((id): id is string => id !== null);
}

export async function getTeachersForPicker(): Promise<TeacherTableRow[]> {
  const supabase = createAdminClient();

  try {

    const { data: users, error: userErr } = await supabase
      .from("User")
      .select("id, email")
      .eq("role", "TEACHER")
      .eq("status", "APPROVED");

    if (userErr) {
      return [];
    }

    const teacherUsers = (users ?? []) as { id: string; email: string | null }[];
    if (teacherUsers.length === 0) return [];

    const teacherIds = teacherUsers.map((u) => u.id);

    // 2) Fetch Profile rows by teacher id
    const { data: profiles, error: profErr } = await supabase
      .from("Profile")
      .select("id, firstName, lastName, middleInitial, contactNumber, email, profileImage, subjectSpecialization")
      .in("id", teacherIds);

    if (profErr) {
      return [];
    }

    // 3) Fetch ProfileHR rows by teacher id (employeeId + position)
    const { data: hrs, error: hrErr } = await supabase
      .from("ProfileHR")
      .select("id, employeeId, position")
      .in("id", teacherIds);

    if (hrErr) {
      return [];
    }

    const profileById = new Map<string, any>();
    for (const p of profiles ?? []) profileById.set(p.id, p);

    const hrById = new Map<string, any>();
    for (const h of hrs ?? []) hrById.set(h.id, h);

    // email from Profile if exists, else fallback from User table
    const emailById = new Map<string, string>();
    for (const u of teacherUsers) {
      if (u.email) emailById.set(u.id, u.email);
    }

    const result: TeacherTableRow[] = teacherIds.map((id) => {
      const p = profileById.get(id) ?? {};
      const h = hrById.get(id) ?? {};

      const fullname = `${p.firstName ?? ""} ${p.middleInitial ? p.middleInitial + ". " : ""}${p.lastName ?? ""}`.trim();

      return {
        id,
        employeeid: h.employeeId ?? "N/A",
        fullname: fullname || "N/A",
        position: h.position ?? "N/A",
        contact: p.contactNumber ?? "N/A",
        email: p.email ?? emailById.get(id) ?? "",
        profileImage: p.profileImage ?? null,
        status: "APPROVED",
        subjectSpecialization: p.subjectSpecialization ?? null,
      };
    });

    return result;
  } catch (error) {
    return [];
  }
}
