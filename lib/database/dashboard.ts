// lib/database/dashboard.ts
import { createClient } from "@/lib/supabase/server";
import { toast } from "sonner";

export async function getDashboardStats(userId: string) {
  const supabase = await createClient();

  try {
    // Total Profiles (global)
    const { count: profileCount } = await supabase
      .from("User")
      .select("*", { count: "exact", head: true })
      .eq("role", "TEACHER")
      .eq("status", "APPROVED");

    // Trainings assigned to THIS user (Attendance -> ProfessionalDevelopment)
    const { count: trainingCount } = await supabase
      .from("Attendance")
      .select("id, ProfessionalDevelopment:training_id!inner(type)", {
        count: "exact",
        head: true,
      })
      .eq("teacher_id", userId)
      .eq("ProfessionalDevelopment.type", "TRAINING");

    // Seminars assigned to THIS user
    const { count: seminarCount } = await supabase
      .from("Attendance")
      .select("id, ProfessionalDevelopment:training_id!inner(type)", {
        count: "exact",
        head: true,
      })
      .eq("teacher_id", userId)
      .eq("ProfessionalDevelopment.type", "SEMINAR");

    return {
      totalProfiles: profileCount || 0,
      totalTrainings: trainingCount || 0,
      totalSeminars: seminarCount || 0,
    };
  } catch (error) {
    toast.error("Error fetching dashboard stats:");
    return {
      totalProfiles: 0,
      totalTrainings: 0,
      totalSeminars: 0,
    };
  }
}
