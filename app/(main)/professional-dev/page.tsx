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

    const rows = await getMyTrainingSeminars(user.id);

    const total = rows.length;
    const approved = rows.filter(
        (r) => String(r.status).toUpperCase() === "APPROVED",
    ).length;

    return (
        <div className="mx-auto w-full max-w-7xl px-4 py-5 md:px-6 md:py-6 space-y-5">
            {/* Header */}
            <div className="space-y-4">
                <div className="flex flex-wrap items-center gap-2">
                    <Badge variant="outline">Training / Seminar Records</Badge>
                </div>

                <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                    <div>
                        <h1 className="text-2xl md:text-3xl font-semibold tracking-tight">
                            Trainings & Seminars
                        </h1>
                        <p className="text-sm text-muted-foreground mt-1">
                            Your professional development records.
                        </p>
                    </div>

                    {/* Stat mini-cards */}
                    <div className="flex gap-3">
                        <div className="rounded-lg border border-blue-500/30 bg-card px-4 py-2.5 flex items-center gap-3 min-w-[110px]">
                            <div className="rounded-md border border-blue-500/20 bg-blue-500/10 p-1.5">
                                <GraduationCap className="h-4 w-4 text-blue-400" />
                            </div>
                            <div>
                                <div className="text-[11px] text-muted-foreground leading-none">
                                    Records
                                </div>
                                <div className="text-xl font-bold text-blue-400 tabular-nums mt-0.5">
                                    {total}
                                </div>
                            </div>
                        </div>

                        <div className="rounded-lg border border-emerald-500/30 bg-card px-4 py-2.5 flex items-center gap-3 min-w-[110px]">
                            <div className="rounded-md border border-emerald-500/20 bg-emerald-500/10 p-1.5">
                                <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                            </div>
                            <div>
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

            {/* Table */}
            <div className="min-w-0">
                <TrainingsSeminars data={rows} />
            </div>
        </div>
    );
}