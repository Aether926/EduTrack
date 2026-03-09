/* eslint-disable @typescript-eslint/no-explicit-any */
import { redirect } from "next/navigation";
import { format } from "date-fns";
import { getUser } from "@/lib/supabase/server";
import { getAllProfessionalDevelopment } from "@/lib/database/professional-development";
import type { TrainingSeminarTableRow, ProfessionalDevelopment } from "@/lib/user";
import AddTrainingAndSeminar from "@/app/(main)/add-training-seminar/component/add-training-and-seminar";
import { Badge } from "@/components/ui/badge";
import { BookOpen, GraduationCap, Users } from "lucide-react";

const ALLOWED = ["ADMIN", "HR_ADMIN", "PRINCIPAL", "SUPERADMIN", "HR"] as const;

export default async function AddTrainingSeminarPage() {
    const user = await getUser();
    if (!user) redirect("/signin");

    const roleLabel = (user.user_metadata?.role ?? "TEACHER").toString();
    if (!ALLOWED.includes(roleLabel as any)) redirect("/dashboard");

    const professionalDev = await getAllProfessionalDevelopment();

    const tableData: TrainingSeminarTableRow[] = professionalDev.map(
        (item: ProfessionalDevelopment) => ({
            id: item.id,
            title: item.title,
            type: item.type,
            level: item.level,
            date: format(new Date(item.start_date), "MMM dd, yyyy"),
            totalHours: item.total_hours,
            sponsor: item.sponsoring_agency,
            raw: item,
        }),
    );

    const total = tableData.length;
    const trainings = tableData.filter((t) => String(t.type).toUpperCase() === "TRAINING").length;
    const seminars = total - trainings;

    return (
        <div className="mx-auto w-full max-w-7xl px-4 py-5 md:px-6 md:py-6 space-y-5">
            <div className="space-y-4">
                <div className="flex flex-wrap items-center gap-2">
                    <Badge variant="secondary">{roleLabel}</Badge>
                    <Badge variant="outline">Training & Seminar Management</Badge>
                </div>
                <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                    <div>
                        <h1 className="text-2xl md:text-3xl font-semibold tracking-tight">Trainings & Seminars</h1>
                        <p className="text-sm text-muted-foreground mt-1">Manage and assign professional development records.</p>
                    </div>
                    <div className="flex flex-col [@media(min-width:360px)]:flex-row gap-2">
                        <div className="rounded-lg border border-amber-500/30 bg-card px-3 py-2.5 flex items-center gap-2 [@media(min-width:360px)]:flex-1 min-w-0">
                            <div className="rounded-md border border-amber-500/20 bg-amber-500/10 p-1.5 shrink-0">
                                <BookOpen className="h-3.5 w-3.5 text-amber-400" />
                            </div>
                            <div className="min-w-0">
                                <div className="text-[11px] text-muted-foreground leading-none">Total</div>
                                <div className="text-xl font-bold text-amber-400 tabular-nums mt-0.5">{total}</div>
                            </div>
                        </div>
                        <div className="flex gap-2 [@media(min-width:360px)]:contents">
                            <div className="rounded-lg border border-teal-500/30 bg-card px-3 py-2.5 flex items-center gap-2 flex-1 min-w-0">
                                <div className="rounded-md border border-teal-500/20 bg-teal-500/10 p-1.5 shrink-0">
                                    <GraduationCap className="h-3.5 w-3.5 text-teal-400" />
                                </div>
                                <div className="min-w-0">
                                    <div className="text-[11px] text-muted-foreground leading-none">Trainings</div>
                                    <div className="text-xl font-bold text-teal-400 tabular-nums mt-0.5">{trainings}</div>
                                </div>
                            </div>
                            <div className="rounded-lg border border-violet-500/30 bg-card px-3 py-2.5 flex items-center gap-2 flex-1 min-w-0">
                                <div className="rounded-md border border-violet-500/20 bg-violet-500/10 p-1.5 shrink-0">
                                    <Users className="h-3.5 w-3.5 text-violet-400" />
                                </div>
                                <div className="min-w-0">
                                    <div className="text-[11px] text-muted-foreground leading-none">Seminars</div>
                                    <div className="text-xl font-bold text-violet-400 tabular-nums mt-0.5">{seminars}</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div className="min-w-0">
                <AddTrainingAndSeminar data={tableData} />
            </div>
        </div>
    );
}