/* eslint-disable @typescript-eslint/no-explicit-any */
import { redirect } from "next/navigation";
import { createClient, createAdminClient } from "@/lib/supabase/server";
import { CompliancePageClient } from "@/features/compliance/components/compliance-page-client";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { CalendarRange, CheckCircle2, ClipboardCheck, Layers3 } from "lucide-react";

export const dynamic = "force-dynamic";

function currentSchoolYear() {
  const now = new Date();
  const month = now.getMonth() + 1;
  const year = now.getFullYear();
  return month >= 6 ? `SY ${year}-${year + 1}` : `SY ${year - 1}-${year}`;
}

function fmtDate(d: string | null | undefined) {
  if (!d) return "—";
  try {
    return new Date(d).toISOString().slice(0, 10);
  } catch {
    return String(d);
  }
}

export default async function CompliancePage() {
  const supabase = await createClient();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) redirect("/signin");

  // role badge (dynamic)
  const admin = createAdminClient();
  const { data: me } = await admin
    .from("User")
    .select("role")
    .eq("id", auth.user.id)
    .maybeSingle();

  const roleLabel = (me?.role ?? "USER").toString();

  const schoolYear = currentSchoolYear();

  // policy period
  const { data: policy } = await supabase
    .from("TrainingCompliancePolicy")
    .select("period_start, period_end")
    .eq("school_year", schoolYear)
    .maybeSingle();

  // compliance row
  const { data: compliance } = await supabase
    .from("TeacherTrainingCompliance")
    .select("*")
    .eq("teacher_id", auth.user.id)
    .maybeSingle();

  // trainings (approved + passed)
  const { data: allTrainings } = await supabase
    .from("Attendance")
    .select(
      "id, status, result, training_id, approved_hours, ProfessionalDevelopment(title, type, start_date, end_date, total_hours, sponsoring_agency)"
    )
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
    <div className="mx-auto w-full max-w-7xl px-4 py-5 md:px-6 md:py-6 space-y-4">
      {/* header card (same as other pages) */}
      <div className="rounded-xl border bg-card p-4 md:p-6">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="secondary">{roleLabel}</Badge>
            <Badge variant="outline">Training Compliance</Badge>
          </div>

          <div className="flex flex-wrap gap-2">
            <Badge variant="secondary" className="gap-2">
              <CheckCircle2 className="h-3.5 w-3.5" />
              {countedTrainings.length} counted
            </Badge>

            <Badge variant="secondary" className="gap-2">
              <Layers3 className="h-3.5 w-3.5" />
              {otherTrainings.length} outside period
            </Badge>
          </div>
        </div>
      </div>

      {/* quick stats cards */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardContent className="pt-4 flex items-center gap-3">
            <ClipboardCheck className="h-5 w-5 text-muted-foreground" />
            <div>
              <p className="text-2xl font-bold">{schoolYear}</p>
              <p className="text-xs text-muted-foreground">Current school year</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4 flex items-center gap-3">
            <CalendarRange className="h-5 w-5 text-muted-foreground" />
            <div>
              <p className="text-sm font-semibold">
                {fmtDate(periodStart)} → {fmtDate(periodEnd)}
              </p>
              <p className="text-xs text-muted-foreground">Counting period</p>
            </div>
          </CardContent>
        </Card>

        <Card className="sm:col-span-2 lg:col-span-1">
          <CardContent className="pt-4 flex items-center gap-3">
            <CheckCircle2 className="h-5 w-5 text-muted-foreground" />
            <div>
              <p className="text-2xl font-bold">{(allTrainings ?? []).length}</p>
              <p className="text-xs text-muted-foreground">Approved & passed trainings</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* existing client UI */}
      <CompliancePageClient
        compliance={compliance}
        countedTrainings={countedTrainings}
        otherTrainings={otherTrainings}
        schoolYear={schoolYear}
      />
    </div>
  );
}