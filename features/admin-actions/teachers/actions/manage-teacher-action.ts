import { supabase } from "@/lib/supabaseClient";
import type { TeacherHRFields } from "@/features/admin-actions/teachers/types/manage-profile";

export async function saveTeacherHR(teacherId: string, fields: TeacherHRFields) {
  const { error } = await supabase
    .from("ProfileHR")
    .upsert({
      id: teacherId,
      ...fields,
      updated_at: new Date().toISOString(),
    });

  if (error) throw new Error(error.message);
}