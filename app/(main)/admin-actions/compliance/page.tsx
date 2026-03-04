/* eslint-disable @typescript-eslint/no-explicit-any */
import { redirect } from "next/navigation";
import { createClient, createAdminClient } from "@/lib/supabase/server";
import { AdminComplianceClient } from "@/features/compliance/components/admin-compliance-client";

import { Badge } from "@/components/ui/badge";
import { ShieldAlert, ShieldCheck, ShieldX } from "lucide-react";


const ALLOWED = ["ADMIN", "HR_ADMIN", "PRINCIPAL", "SUPER_ADMIN", "HR"] as const;

function currentSchoolYear() {
  const now = new Date();
  const m = now.getMonth() + 1;
  const y = now.getFullYear();
  return m >= 6 ? `SY ${y}-${y + 1}` : `SY ${y - 1}-${y}`;
}

export default async function AdminCompliancePage() {
  const supabase = await createClient();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) redirect("/signin");

  const admin = createAdminClient();

  const { data: viewer } = await admin
    .from("User")
    .select("role")
    .eq("id", auth.user.id)
    .maybeSingle();

  const roleLabel = (viewer?.role ?? "USER").toString();
  if (!ALLOWED.includes(roleLabel as any)) redirect("/dashboard");

  const schoolYear = currentSchoolYear();

  const [{ data: schools }, { data: policies }, { data: compliance }] =
    await Promise.all([
      admin.from("School").select("id,name").order("name", { ascending: true }),
      admin
        .from("TrainingCompliancePolicy")
        .select("*")
        .order("school_year", { ascending: false }),
      admin
        .from("TeacherTrainingCompliance")
        .select(
          `
          *,
          teacher:Profile(id, firstName, lastName, email),
          school:School(id, name)
        `
        )
        .eq("school_year", schoolYear)
        .order("remaining_hours", { ascending: false }),
    ]);

  const safeCompliance = (compliance ?? []) as any[];

  const counts = {
    NON_COMPLIANT: safeCompliance.filter((c) => c.status === "NON_COMPLIANT").length,
    AT_RISK: safeCompliance.filter((c) => c.status === "AT_RISK").length,
    COMPLIANT: safeCompliance.filter((c) => c.status === "COMPLIANT").length,
  };

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-5 md:px-6 md:py-6 space-y-4">
      {/* header card */}
      <div className="rounded-xl border bg-card p-4 md:p-6">
        <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="secondary">{roleLabel}</Badge>
            <Badge variant="outline">Training Compliance</Badge>
            <Badge variant="outline">{schoolYear}</Badge>
          </div>

          <div className="flex flex-wrap gap-2">
            <Badge variant="secondary" className="gap-2">
              <ShieldX className="h-3.5 w-3.5" />
              {counts.NON_COMPLIANT} non-compliant
            </Badge>
            <Badge variant="secondary" className="gap-2">
              <ShieldAlert className="h-3.5 w-3.5" />
              {counts.AT_RISK} at risk
            </Badge>
            <Badge variant="secondary" className="gap-2">
              <ShieldCheck className="h-3.5 w-3.5" />
              {counts.COMPLIANT} compliant
            </Badge>
          </div>
        </div>
      </div>

      <AdminComplianceClient
        compliance={safeCompliance as any}
        policies={(policies ?? []) as any}
        schools={(schools ?? []) as any}
        schoolYear={schoolYear}
      />
    </div>
  );
}