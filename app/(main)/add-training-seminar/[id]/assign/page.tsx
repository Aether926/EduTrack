/* eslint-disable @typescript-eslint/no-explicit-any */
import { redirect } from "next/navigation";
import TeacherPickerClient from "./teacher-picker-client";
import { getUser } from "@/lib/supabase/server";
import {
    getAssignedTeacherIds,
    getProfessionalDevelopmentAdmin,
    getTeachersForPicker,
} from "@/lib/database/assignments";
import type { TeacherTableRow } from "@/lib/user";
import { Badge } from "@/components/ui/badge";
import { GraduationCap, Users, MapPin } from "lucide-react";

const ALLOWED = ["ADMIN", "SUPERADMIN"] as const;

export default async function AssignPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const user = await getUser();
    if (!user) redirect("/signin");

    const roleLabel = (user.user_metadata?.role ?? "TEACHER").toString();
    if (!ALLOWED.includes(roleLabel as any)) redirect("/dashboard");

    const { id: trainingId } = await params;

    const [training, teachers, assignedIds] = await Promise.all([
        getProfessionalDevelopmentAdmin(trainingId),
        getTeachersForPicker(),
        getAssignedTeacherIds(trainingId),
    ]);

    if (!training) {
        return (
            <div className="mx-auto w-full max-w-7xl px-4 py-5 md:px-6 md:py-6 space-y-4">
                <div className="rounded-xl border border-border/60 bg-gradient-to-br from-card to-background p-6 text-sm text-muted-foreground">
                    Training/Seminar not found.
                </div>
            </div>
        );
    }

    return (
        <div className="mx-auto w-full max-w-7xl px-4 py-5 md:px-6 md:py-6 space-y-4">
            {/* ── Page header band ── */}
            <div className="relative rounded-xl border border-border/60 bg-gradient-to-br from-card to-background overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-violet-500/5 via-transparent to-blue-500/5 pointer-events-none" />
                <div className="relative px-5 py-5 md:px-6 md:py-6">
                    <div className="flex items-center gap-3">
                        <div className="rounded-lg border border-violet-500/20 bg-violet-500/10 p-2.5 shrink-0">
                            <Users className="h-5 w-5 text-violet-400" />
                        </div>
                        <div>
                            <div className="flex flex-wrap items-center gap-2 mb-0.5">
                                <h1 className="text-lg font-semibold tracking-tight leading-tight">
                                    Assign Teachers
                                </h1>
                                <Badge variant="secondary" className="text-[11px]">{roleLabel}</Badge>
                                <Badge variant="outline" className="text-[11px]">Assign Teachers</Badge>
                            </div>
                            <p className="text-[13px] text-muted-foreground">
                                Select teachers to assign to this training or seminar.
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* ── Training info card ── */}
            <div className="relative rounded-xl border border-border/60 bg-gradient-to-br from-card to-background overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-teal-500/5 via-transparent to-transparent pointer-events-none" />
                <div className="relative px-5 py-5 md:px-6 md:py-6 space-y-3">
                    <div className="flex items-start gap-3">
                        <div className="rounded-lg border border-teal-500/20 bg-teal-500/10 p-2.5 shrink-0 mt-0.5">
                            <GraduationCap className="h-5 w-5 text-teal-400" />
                        </div>
                        <div className="space-y-2 min-w-0">
                            <h2 className="text-lg font-semibold leading-tight">{training.title}</h2>
                            <div className="flex flex-wrap items-center gap-2">
                                <Badge variant="outline" className="gap-1.5 text-[11px]">
                                    <GraduationCap className="h-3 w-3" />{training.type}
                                </Badge>
                                <Badge variant="outline" className="text-[11px]">{training.level}</Badge>
                                <Badge variant="outline" className="text-[11px]">{training.total_hours} hrs</Badge>
                            </div>
                            <div className="flex flex-wrap items-center gap-3 text-[13px] text-muted-foreground">
                                {training.sponsoring_agency && (
                                    <span>{training.sponsoring_agency}</span>
                                )}
                                {training.venue && (
                                    <span className="flex items-center gap-1">
                                        <MapPin className="h-3 w-3" />{training.venue}
                                    </span>
                                )}
                            </div>
                            {training.description && (
                                <p className="text-[13px] text-muted-foreground">{training.description}</p>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* ── Teacher picker ── */}
            <TeacherPickerClient
                trainingId={trainingId}
                teachers={(teachers ?? []) as TeacherTableRow[]}
                assignedIds={(assignedIds ?? []) as string[]}
            />
        </div>
    );
}