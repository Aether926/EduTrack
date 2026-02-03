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
    console.error("Error fetching professional development:", error);
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
    console.error("Error fetching assigned teachers:", error);
    return [];
  }
  
  return (data as AttendanceRow[])
    .map((r) => r.teacher_id)
    .filter((id): id is string => id !== null);
}

export async function getTeachersForPicker(): Promise<TeacherTableRow[]> {
  const supabase = createAdminClient();

  try {
    console.log("🔍 Fetching approved teachers...");

    // 1) Get approved teachers
    const { data: users, error: userErr } = await supabase
      .from("User")
      .select("id, email")
      .eq("role", "TEACHER")
      .eq("status", "APPROVED");

    if (userErr) {
      console.error("❌ Error fetching users:", userErr);
      return [];
    }

    if (!users || users.length === 0) {
      console.log("⚠️ No approved teachers found");
      return [];
    }

    console.log("✅ Found", users.length, "approved teachers");

    const teacherUsers = users as UserRow[];
    const emails = teacherUsers
      .map((u) => u.email)
      .filter((e): e is string => !!e);

    if (emails.length === 0) {
      console.log("⚠️ No teacher emails found");
      return [];
    }

    console.log("🔍 Fetching profiles for", emails.length, "emails");

    // 2) Fetch profiles using CAMELCASE column names
    const { data: profiles, error: profErr } = await supabase
      .from("Profile")
      .select("id, employeeId, firstName, lastName, middleInitial, contactNumber, email, profileImage, position")
      .in("email", emails)
      .order("lastName", { ascending: true });

    if (profErr) {
      console.error("❌ Error fetching profiles:", profErr);
      return [];
    }

    if (!profiles || profiles.length === 0) {
      console.log("⚠️ No profiles found");
      return [];
    }

    console.log("✅ Found", profiles.length, "profiles");

    // 3) Map email -> user id
    const emailToUserId = new Map<string, string>();
    for (const u of teacherUsers) {
      if (u.email) emailToUserId.set(u.email, u.id);
    }

    // 4) Transform to TeacherTableRow
    const result = (profiles as ProfileRow[])
      .filter((p) => !!p.email && emailToUserId.has(p.email))
      .map((p) => {
        const userId = emailToUserId.get(p.email!)!;

        return {
          id: userId,
          employeeid: p.employeeId ?? "N/A",
          fullname: `${p.firstName ?? ""} ${p.middleInitial ? p.middleInitial + '. ' : ''}${p.lastName ?? ""}`.trim(),
          position: p.position ?? "N/A",
          contact: p.contactNumber ?? "N/A",
          email: p.email ?? "",
          profileImage: p.profileImage ?? null,
          status: "APPROVED",
        };
      });

    console.log("✅ Returning", result.length, "teachers");
    return result;

  } catch (error) {
    console.error("💥 Unexpected error:", error);
    return [];
  }
}
