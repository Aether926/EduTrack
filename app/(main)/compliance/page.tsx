/* eslint-disable @typescript-eslint/no-explicit-any */
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { CompliancePageClient } from "@/features/compliance/components/compliance-page-client";

export const dynamic = "force-dynamic";

function currentSchoolYear() {
  const now = new Date();
  const month = now.getMonth() + 1;
  const year = now.getFullYear();
  return month >= 6
    ? `SY ${year}-${year + 1}`
    : `SY ${year - 1}-${year}`;
}

export default async function CompliancePage() {
  const supabase = await createClient();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) redirect("/signin");

  const schoolYear = currentSchoolYear();

  // fetch policy first to get the period dates
const { data: policy } = await supabase
  .from("TrainingCompliancePolicy")
  .select("period_start, period_end")
  .eq("school_year", schoolYear)
  .maybeSingle();

const [
  { data: compliance },,
] = await Promise.all([
  supabase
    .from("TeacherTrainingCompliance")
    .select("*")
    .eq("teacher_id", auth.user.id)
    .single(),

  ]);
  const { data: allTrainings } = await supabase
  .from("Attendance")
  .select("id, status, result, training_id, approved_hours, ProfessionalDevelopment(title, type, start_date, end_date, total_hours, sponsoring_agency)")
  .eq("teacher_id", auth.user.id)
  .eq("status", "APPROVED")
  .eq("result", "PASSED");

    const periodStart = policy?.period_start ?? null;
    const periodEnd = policy?.period_end ?? null;

    const countedTrainings = (allTrainings ?? []).filter((t) => {
      const pd = t.ProfessionalDevelopment as any;
      if (!pd?.start_date || !pd?.end_date) return false;
      if (!periodStart || !periodEnd) return true;
      return pd.start_date >= periodStart && pd.end_date <= periodEnd;
    });

    const otherTrainings = (allTrainings ?? []).filter((t) => {
      const pd = t.ProfessionalDevelopment as any;
      if (!pd?.start_date || !pd?.end_date) return false;
      if (!periodStart || !periodEnd) return false;
      return pd.start_date < periodStart || pd.end_date > periodEnd;
    });
  return (
    <CompliancePageClient
      compliance={compliance}
      countedTrainings={countedTrainings ?? []}
      otherTrainings={otherTrainings}
      schoolYear={schoolYear}
    />
  );
}