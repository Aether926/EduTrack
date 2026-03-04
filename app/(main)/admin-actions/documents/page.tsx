/* eslint-disable @typescript-eslint/no-explicit-any */
import { redirect } from "next/navigation";
import { createClient, createAdminClient } from "@/lib/supabase/server";
import { AdminComplianceClient } from "@/features/compliance/components/admin-compliance-client";

import { Badge } from "@/components/ui/badge";
import { ShieldAlert, ShieldCheck, ShieldX } from "lucide-react";

export const dynamic = "force-dynamic";

const ALLOWED = [
    "ADMIN",
    "HR_ADMIN",
    "PRINCIPAL",
    "SUPER_ADMIN",
    "HR",
] as const;

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
            admin
                .from("School")
                .select("id,name")
                .order("name", { ascending: true }),
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
        `,
                )
                .eq("school_year", schoolYear)
                .order("remaining_hours", { ascending: false }),
        ]);

    const safeCompliance = (compliance ?? []) as any[];

    const counts = {
        COMPLIANT: safeCompliance.filter((c) => c.status === "COMPLIANT")
            .length,
        AT_RISK: safeCompliance.filter((c) => c.status === "AT_RISK").length,
        NON_COMPLIANT: safeCompliance.filter(
            (c) => c.status === "NON_COMPLIANT",
        ).length,
    };

    return (
        <div className="mx-auto w-full max-w-7xl px-4 py-5 md:px-6 md:py-6 space-y-4">
            {/* header card */}
            <div className="relative rounded-xl border border-border/60 bg-gradient-to-br from-card to-background overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-orange-500/5 via-transparent to-amber-500/5 pointer-events-none" />
                <div className="relative px-5 py-5 md:px-6 md:py-6">
                    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                        {/* Left — icon + title */}
                        <div className="flex items-center gap-3">
                            <div className="rounded-lg border border-orange-500/20 bg-orange-500/10 p-2.5 shrink-0">
                                <ShieldAlert className="h-5 w-5 text-orange-400" />
                            </div>
                            <div>
                                <h1 className="text-lg font-semibold tracking-tight leading-tight">
                                    Training Compliance
                                </h1>
                                <p className="text-[13px] text-muted-foreground mt-0.5">
                                    Monitor compliance and hour requirements —{" "}
                                    {schoolYear}
                                </p>
                            </div>
                        </div>

                        {/* Right — role pill + stat badges */}
                        <div className="flex flex-col md:flex-row flex-wrap items-center gap-2">
                            <span className="inline-block rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                                {roleLabel}
                            </span>
                            <div>
                                <Badge
                                    variant="outline"
                                    className="gap-1.5 text-emerald-400 border-emerald-500/30"
                                >
                                    <ShieldCheck className="h-3.5 w-3.5" />
                                    {counts.COMPLIANT} compliant
                                </Badge>
                                <Badge
                                    variant="outline"
                                    className="gap-1.5 text-amber-400 border-amber-500/30"
                                >
                                    <ShieldAlert className="h-3.5 w-3.5" />
                                    {counts.AT_RISK} at risk
                                </Badge>
                                <Badge
                                    variant="outline"
                                    className="gap-1.5 text-rose-400 border-rose-500/30"
                                >
                                    <ShieldX className="h-3.5 w-3.5" />
                                    {counts.NON_COMPLIANT} non-compliant
                                </Badge>
                            </div>
                        </div>
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
