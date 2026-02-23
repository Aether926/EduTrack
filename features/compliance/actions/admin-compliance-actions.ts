/* eslint-disable @typescript-eslint/no-explicit-any */
"use server";

import { createAdminClient } from "@/lib/supabase/server";

export async function upsertCompliancePolicy(form: {
  school_id: string | null;
  school_year: string;
  required_hours: number;
  at_risk_threshold_hours: number;
  period_start: string;
  period_end: string;
  is_edit?: boolean;
}) {
  const admin = createAdminClient();

  const cleanForm = {
    ...form,
    school_id: form.school_id === "global" || form.school_id === "" ? null : form.school_id,
  };

  let query = admin
    .from("TrainingCompliancePolicy")
    .select("id")
    .eq("school_year", cleanForm.school_year);

  if (cleanForm.school_id) {
    query = query.eq("school_id", cleanForm.school_id);
  } else {
    query = query.is("school_id", null);
  }

  const { data: existing } = await query.single();

  if (existing?.id) {
    // when editing — only allow threshold and period dates to change
    const updatePayload = form.is_edit ? {
      at_risk_threshold_hours: cleanForm.at_risk_threshold_hours,
      period_start: cleanForm.period_start,
      period_end: cleanForm.period_end,
      updated_at: new Date().toISOString(),
    } : {
      required_hours: cleanForm.required_hours,
      at_risk_threshold_hours: cleanForm.at_risk_threshold_hours,
      period_start: cleanForm.period_start,
      period_end: cleanForm.period_end,
      updated_at: new Date().toISOString(),
    };

    const { error } = await admin
      .from("TrainingCompliancePolicy")
      .update(updatePayload)
      .eq("id", existing.id);

    if (error) throw new Error(error.message);
  } else {
    const { error } = await admin
      .from("TrainingCompliancePolicy")
      .insert(cleanForm);

    if (error) throw new Error(error.message);
  }

  await recomputeAllCompliance();
}

export async function recomputeAllCompliance() {
  const admin = createAdminClient();

  const month = new Date().getMonth() + 1;
  const year = new Date().getFullYear();
  const schoolYear = month >= 6 ? `SY ${year}-${year + 1}` : `SY ${year - 1}-${year}`;

  const { data: teachers } = await admin
    .from("User")
    .select("id")
    .eq("role", "TEACHER")
    .eq("status", "APPROVED");

  if (!teachers?.length) return;

  const results = await Promise.all(
    teachers.map((t: any) =>
      admin.rpc("compute_teacher_training_compliance", {
        p_teacher_id: t.id,
        p_school_year: schoolYear,
      })
    )
  );
}