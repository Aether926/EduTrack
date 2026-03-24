/* eslint-disable @typescript-eslint/no-explicit-any */
import { redirect } from "next/navigation";
import { getUser, createClient } from "@/lib/supabase/server";
import { CompliancePageClient } from "@/features/compliance/components/compliance-page-client";
import { Badge } from "@/components/ui/badge";
import {
    CalendarRange,
    CheckCircle2,
    ClipboardCheck,
    Layers3,
} from "lucide-react";

export const revalidate = 60;

function currentSchoolYear() {
    const now = new Date();
    const month = now.getMonth() + 1;
    const year = now.getFullYear();
    return month >= 6 ? `SY ${year}-${year + 1}` : `SY ${year - 1}-${year}`;
}

function fmtDate(d: string | null | undefined) {
    if (!d) return "—";
    try {
        return new Date(d).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
        });
    } catch {
        return String(d);
    }
}

export default async function CompliancePage() {
    const user = await getUser();
    if (!user) redirect("/signin");

    const supabase = await createClient();
    const schoolYear = currentSchoolYear();

    const [{ data: policy }, { data: compliance }, { data: allTrainings }] =
        await Promise.all([
            supabase
                .from("TrainingCompliancePolicy")
                .select("period_start, period_end")
                .eq("school_year", schoolYear)
                .maybeSingle(),
            supabase
                .from("TeacherTrainingCompliance")
                .select("*")
                .eq("teacher_id", user.id)
                .maybeSingle(),
            supabase
                .from("Attendance")
                .select(
                    "id, status, result, training_id, approved_hours, ProfessionalDevelopment(title, type, start_date, end_date, total_hours, sponsoring_agency)",
                )
                .eq("teacher_id", user.id)
                .eq("status", "APPROVED")
                .eq("result", "PASSED"),
        ]);

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
            {/* header card — intentionally accented */}
            <div className="relative rounded-xl border border-border/60 bg-gradient-to-br from-card to-background overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 via-transparent to-yellow-500/5 pointer-events-none" />
                <div className="relative px-5 py-5 md:px-6 md:py-6">
                    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                        <div className="flex items-center gap-3 md:flex-1">
                            <div className="rounded-lg border border-amber-500/20 bg-amber-500/10 p-2.5 shrink-0">
                                <ClipboardCheck className="h-5 w-5 text-amber-400" />
                            </div>
                            <div>
                                <h1 className="text-lg font-semibold tracking-tight leading-tight">
                                    My Compliance
                                </h1>
                                <p className="text-[13px] text-muted-foreground mt-0.5">
                                    Track your training hours and compliance
                                    status — {schoolYear}
                                </p>
                            </div>
                        </div>
                        <div className="flex flex-wrap md:flex-nowrap items-center gap-2 md:justify-end">
                            <Badge
                                variant="outline"
                                className="gap-1.5 text-amber-400 border-amber-500/30"
                            >
                                <CheckCircle2 className="h-3.5 w-3.5" />
                                {countedTrainings.length} counted
                            </Badge>
                            <Badge variant="outline" className="gap-1.5">
                                <Layers3 className="h-3.5 w-3.5" />
                                {otherTrainings.length} outside period
                            </Badge>
                        </div>
                    </div>
                </div>
            </div>

            {/* quick stats cards */}
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {/* School year — amber */}
                <div className="rounded-xl border border-border/60 bg-card">
                    <div className="flex items-center gap-4 px-5 py-4">
                        <div className="h-9 w-9 rounded-lg border border-amber-500/25 bg-amber-500/10 flex items-center justify-center shrink-0">
                            <ClipboardCheck className="h-4 w-4 text-amber-400" />
                        </div>
                        <div>
                            <p className="text-base font-semibold tabular-nums leading-tight">
                                {schoolYear}
                            </p>
                            <p className="text-[11px] text-muted-foreground uppercase tracking-wider font-medium mt-0.5">
                                Current school year
                            </p>
                        </div>
                    </div>
                </div>

                {/* Counting period — sky */}
                <div className="rounded-xl border border-border/60 bg-card">
                    <div className="flex items-center gap-4 px-5 py-4">
                        <div className="h-9 w-9 rounded-lg border border-sky-500/25 bg-sky-500/10 flex items-center justify-center shrink-0">
                            <CalendarRange className="h-4 w-4 text-sky-400" />
                        </div>
                        <div>
                            <p className="text-base font-semibold tabular-nums leading-tight font-mono">
                                {fmtDate(periodStart)} → {fmtDate(periodEnd)}
                            </p>
                            <p className="text-[11px] text-muted-foreground uppercase tracking-wider font-medium mt-0.5">
                                Counting period
                            </p>
                        </div>
                    </div>
                </div>

                {/* Approved trainings — emerald */}
                <div className="rounded-xl border border-border/60 bg-card sm:col-span-2 lg:col-span-1">
                    <div className="flex items-center gap-4 px-5 py-4">
                        <div className="h-9 w-9 rounded-lg border border-emerald-500/25 bg-emerald-500/10 flex items-center justify-center shrink-0">
                            <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                        </div>
                        <div>
                            <p className="text-base font-semibold tabular-nums leading-tight">
                                {(allTrainings ?? []).length}
                            </p>
                            <p className="text-[11px] text-muted-foreground uppercase tracking-wider font-medium mt-0.5">
                                Approved & passed trainings
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            <CompliancePageClient
                compliance={compliance}
                countedTrainings={countedTrainings}
                otherTrainings={otherTrainings}
                schoolYear={schoolYear}
            />
        </div>
    );
}
