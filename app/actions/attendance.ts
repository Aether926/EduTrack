"use server";

import { createAdminClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function saveTrainingAssignments(trainingId: string, teacherIds: string[]) {
  const supabase = createAdminClient();

  const rows = teacherIds.map((id) => ({
    teacher_id: id,
    training_id: trainingId,
    status: "ENROLLED", 
  }));

  const { error } = await supabase
    .from("Attendance")
    .upsert(rows, { onConflict: "teacher_id,training_id" });

  if (error) throw new Error(error.message);

  revalidatePath(`/add-training-seminar/${trainingId}/assign`);
  revalidatePath("/add-training-seminar");
}
