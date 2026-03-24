import { redirect } from "next/navigation";
import { getUser } from "@/lib/supabase/server";

import TrainingsSeminars from "@/components/trainings-seminars";
import { getMyTrainingSeminars } from "@/lib/database/trainings";

import { Badge } from "@/components/ui/badge";
import { GraduationCap, CheckCircle2 } from "lucide-react";

export const revalidate = 60;

export default async function ProfessionalDevelopmentPage() {
    const user = await getUser();
    if (!user) redirect("/signin");

    const rows = (await getMyTrainingSeminars(user.id)) ?? [];

    const total = rows.length;
    const approved = rows.filter(
        (r) => String(r.status).toUpperCase() === "APPROVED",
    ).length;

    return (
        <div className="mx-auto w-full max-w-7xl px-4 py-5 md:px-6 md:py-6 space-y-4 overflow-x-hidden">
            {/* ── Page header band ── */}
            <div className="relative rounded-xl border border-border/60 bg-gradient-to-br from-card to-background overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-transparent to-emerald-500/5 pointer-events-none" />
                <div className="relative px-5 py-5 md:px-6 md:py-6">
                    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                        {/* Left: icon + title + badge */}
                        <div className="flex items-center gap-3">
                            <div className="rounded-lg border border-blue-500/20 bg-blue-500/10 p-2.5 shrink-0">
                                <GraduationCap className="h-5 w-5 text-blue-400" />
                            </div>
                            <div>
                                <div className="flex flex-wrap items-center gap-2 mb-0.5">
                                    <h1 className="text-lg font-semibold tracking-tight leading-tight">
                                        Trainings & Seminars
                                    </h1>
                                    <Badge
                                        variant="outline"
                                        className="text-[11px]"
                                    >
                                        Training / Seminar Records
                                    </Badge>
                                </div>
                                <p className="text-[13px] text-muted-foreground">
                                    Your professional development records.
                                </p>
                            </div>
                        </div>

                        {/* Right: stat mini-cards */}
                        <div className="flex gap-2 md:shrink-0">
                            <div className="rounded-lg border border-blue-500/30 bg-card px-3 py-2.5 flex items-center gap-2 min-w-[110px]">
                                <div className="rounded-md border border-blue-500/20 bg-blue-500/10 p-1.5 shrink-0">
                                    <GraduationCap className="h-3.5 w-3.5 text-blue-400" />
                                </div>
                                <div className="min-w-0">
                                    <div className="text-[11px] text-muted-foreground leading-none">
                                        Records
                                    </div>
                                    <div className="text-xl font-bold text-blue-400 tabular-nums mt-0.5">
                                        {total}
                                    </div>
                                </div>
                            </div>

                            <div className="rounded-lg border border-emerald-500/30 bg-card px-3 py-2.5 flex items-center gap-2 min-w-[110px]">
                                <div className="rounded-md border border-emerald-500/20 bg-emerald-500/10 p-1.5 shrink-0">
                                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                                </div>
                                <div className="min-w-0">
                                    <div className="text-[11px] text-muted-foreground leading-none">
                                        Approved
                                    </div>
                                    <div className="text-xl font-bold text-emerald-400 tabular-nums mt-0.5">
                                        {approved}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* ── Table ── */}
            <div className="min-w-0">
                <TrainingsSeminars data={rows} />
            </div>
        </div>
    );
}
