"use server";

import { createClient } from "@/lib/supabase/server";

export async function fetchPdDetails(trainingId: string) {
  const supabase = await createClient();

  const { data: auth, error: authErr } = await supabase.auth.getUser();
  if (authErr || !auth.user) {
    return { ok: false as const, error: "Not authenticated" };
  }

  const { data, error } = await supabase
    .from("ProfessionalDevelopment")
    .select(
      "id,title,type,level,start_date,end_date,total_hours,sponsoring_agency,venue,description"
    )
    .eq("id", trainingId)
    .single();

  if (error || !data) {
    return { ok: false as const, error: error?.message ?? "Record not found" };
  }

  return { ok: true as const, data };
}
