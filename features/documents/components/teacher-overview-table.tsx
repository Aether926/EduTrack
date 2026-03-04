/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState } from "react";
import { TeacherDocumentsModal } from "./teacher-documents-modal";
import { CheckCircle2, Clock, XCircle, AlertCircle, Users } from "lucide-react";

type TeacherStatus = {
    teacherId: string;
    firstName: string | null;
    lastName: string | null;
    email: string | null;
    employeeId: string | null;
    approved: number;
    submitted: number;
    rejected: number;
    missing: number;
    total: number;
    docs: any[];
};

function pct(approved: number, total: number) {
    if (!total) return 0;
    return Math.round((approved / total) * 100);
}

function MiniStat({
    icon,
    value,
    cls,
}: {
    icon: React.ReactNode;
    value: number;
    cls: string;
}) {
    return (
        <span
            className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] font-semibold tabular-nums ${cls}`}
        >
            {icon}
            {value}
        </span>
    );
}

export function TeacherOverviewTable({
    teacherStatus,
}: {
    teacherStatus: TeacherStatus[];
}) {
    const [selectedTeacher, setSelectedTeacher] =
        useState<TeacherStatus | null>(null);
    const [modalOpen, setModalOpen] = useState(false);

    return (
        <>
            <div className="rounded-xl border border-border/60 bg-card overflow-hidden">
                {/* ── Header ── */}
                <div className="relative px-5 py-4 border-b border-border/60 bg-gradient-to-br from-card to-background">
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-transparent to-transparent pointer-events-none" />
                    <div className="relative flex items-center gap-2.5">
                        <div className="rounded-lg border border-blue-500/20 bg-blue-500/10 p-2 shrink-0">
                            <Users className="h-4 w-4 text-blue-400" />
                        </div>
                        <div>
                            <p className="text-sm font-semibold">
                                Teacher Overview
                            </p>
                            <p className="text-[11px] text-muted-foreground uppercase tracking-wider font-medium">
                                {teacherStatus.length} teacher
                                {teacherStatus.length === 1 ? "" : "s"}
                            </p>
                        </div>
                    </div>
                </div>

                {/* ── Table ── */}
                <div className="w-full overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b border-border/60 bg-muted/30">
                                <th className="text-left px-5 py-2.5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                                    Teacher
                                </th>
                                <th className="hidden md:table-cell text-center px-4 py-2.5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                                    Approved
                                </th>
                                <th className="hidden md:table-cell text-center px-4 py-2.5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                                    Pending
                                </th>
                                <th className="hidden md:table-cell text-center px-4 py-2.5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                                    Rejected
                                </th>
                                <th className="hidden md:table-cell text-center px-4 py-2.5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                                    Missing
                                </th>
                                <th className="text-center px-4 py-2.5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                                    Progress
                                </th>
                            </tr>
                        </thead>

                        <tbody className="divide-y divide-border/60">
                            {teacherStatus.map((t) => {
                                const percent = pct(t.approved, t.total);

                                return (
                                    <tr
                                        key={t.teacherId}
                                        className="cursor-pointer hover:bg-muted/20 transition-colors"
                                        onClick={() => {
                                            setSelectedTeacher(t);
                                            setModalOpen(true);
                                        }}
                                    >
                                        {/* Teacher info */}
                                        <td className="px-5 py-3 align-middle">
                                            <p className="font-medium text-sm leading-snug">
                                                {t.firstName} {t.lastName}
                                            </p>
                                            <p className="text-[11px] text-muted-foreground font-mono truncate max-w-[55vw]">
                                                {t.email}
                                            </p>

                                            {/* Mobile stats */}
                                            <div className="mt-2 flex flex-wrap gap-1.5 md:hidden">
                                                <MiniStat
                                                    icon={
                                                        <CheckCircle2 className="h-3 w-3" />
                                                    }
                                                    value={t.approved}
                                                    cls="bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                                                />
                                                <MiniStat
                                                    icon={
                                                        <Clock className="h-3 w-3" />
                                                    }
                                                    value={t.submitted}
                                                    cls="bg-blue-500/10 text-blue-400 border-blue-500/30"
                                                />
                                                <MiniStat
                                                    icon={
                                                        <XCircle className="h-3 w-3" />
                                                    }
                                                    value={t.rejected}
                                                    cls="bg-rose-500/10 text-rose-400 border-rose-500/30"
                                                />
                                                <MiniStat
                                                    icon={
                                                        <AlertCircle className="h-3 w-3" />
                                                    }
                                                    value={t.missing}
                                                    cls="bg-amber-500/10 text-amber-400 border-amber-500/30"
                                                />
                                            </div>
                                        </td>

                                        {/* Desktop stat columns */}
                                        <td className="hidden md:table-cell px-4 py-3 text-center align-middle">
                                            <span className="text-sm font-semibold tabular-nums text-emerald-400">
                                                {t.approved}
                                            </span>
                                        </td>
                                        <td className="hidden md:table-cell px-4 py-3 text-center align-middle">
                                            <span className="text-sm font-semibold tabular-nums text-blue-400">
                                                {t.submitted}
                                            </span>
                                        </td>
                                        <td className="hidden md:table-cell px-4 py-3 text-center align-middle">
                                            <span className="text-sm font-semibold tabular-nums text-rose-400">
                                                {t.rejected}
                                            </span>
                                        </td>
                                        <td className="hidden md:table-cell px-4 py-3 text-center align-middle">
                                            <span className="text-sm font-semibold tabular-nums text-amber-400">
                                                {t.missing}
                                            </span>
                                        </td>

                                        {/* Progress */}
                                        <td className="px-4 py-3 align-middle">
                                            <div className="flex flex-col items-end gap-1 min-w-[120px] md:min-w-[180px]">
                                                <div className="flex items-center gap-2 w-full">
                                                    <div className="flex-1 h-1.5 rounded-full bg-muted/60 overflow-hidden">
                                                        <div
                                                            className="h-1.5 rounded-full bg-emerald-500 transition-all"
                                                            style={{
                                                                width:
                                                                    t.total > 0
                                                                        ? `${(t.approved / t.total) * 100}%`
                                                                        : "0%",
                                                            }}
                                                        />
                                                    </div>
                                                    <span className="text-[11px] text-muted-foreground tabular-nums shrink-0 font-mono">
                                                        {percent}%
                                                    </span>
                                                </div>
                                                <span className="text-[10px] text-muted-foreground/60 tabular-nums">
                                                    {t.approved}/{t.total}
                                                </span>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>

            <TeacherDocumentsModal
                teacher={selectedTeacher}
                open={modalOpen}
                onOpenChange={(o) => {
                    setModalOpen(o);
                    if (!o) setSelectedTeacher(null);
                }}
            />
        </>
    );
}
