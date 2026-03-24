"use server";

import { createAdminClient } from "@/lib/supabase/server";
import type { TeacherHRFields } from "@/features/admin-actions/teachers/types/manage-profile";

export async function saveTeacherHR(teacherId: string, fields: TeacherHRFields) {
  const admin = createAdminClient();
  const { error } = await admin
    .from("ProfileHR")
    .upsert({
      id: teacherId,
      ...fields,
      updated_at: new Date().toISOString(),
    });

  if (error) throw new Error(error.message);
}