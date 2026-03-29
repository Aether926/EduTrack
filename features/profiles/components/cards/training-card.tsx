import React, { useState } from "react";
import Link from "next/link";
import { GraduationCap } from "lucide-react";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import type { TrainingRow } from "@/features/profiles/types/trainings";
import type { ViewerRole } from "@/features/profiles/types/viewer-role";
import { fmtDateRange } from "@/features/profiles/lib/date";
import { PageNav } from "@/components/ui-elements/pagination/page-nav";
import { PAGE_SIZES } from "@/components/ui-elements/pagination/page-sizes";

// ── Type chip colours ──────────────────────────────────────────────────────────

const typeColors: Record<string, string> = {
    training: "bg-teal-500/15 text-teal-400 border-teal-500/30",
    seminar: "bg-violet-500/15 text-violet-400 border-violet-500/30",
    workshop: "bg-orange-500/15 text-orange-400 border-orange-500/30",
    webinar: "bg-sky-500/15 text-sky-400 border-sky-500/30",
    conference: "bg-pink-500/15 text-pink-400 border-pink-500/30",
};

function TypeChip({ type }: { type: string }) {
    const cls =
        typeColors[(type ?? "").toLowerCase()] ??
        "bg-slate-500/15 text-slate-400 border-slate-500/30";
    return (
        <span
            className={`inline-block rounded-full border px-1.5 py-px text-[9px] font-semibold uppercase tracking-tight leading-tight ${cls}`}
        >
            {type}
        </span>
    );
}

// ── Status badge ───────────────────────────────────────────────────────────────

const statusColors: Record<string, string> = {
    APPROVED: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
    PASSED: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
    REJECTED: "bg-rose-500/15 text-rose-400 border-rose-500/30",
    FAILED: "bg-rose-500/15 text-rose-400 border-rose-500/30",
    PENDING: "bg-amber-500/15 text-amber-400 border-amber-500/30",
    ENROLLED: "bg-sky-500/15 text-sky-400 border-sky-500/30",
};

function StatusChip({ value }: { value: string }) {
    const cls =
        statusColors[(value ?? "").toUpperCase()] ??
        "bg-slate-500/15 text-slate-400 border-slate-500/30";
    return (
        <span
            className={`inline-block rounded-full border px-1.5 py-px text-[9px] font-semibold uppercase tracking-tight leading-tight ${cls}`}
        >
            {value || "—"}
        </span>
    );
}

// ── Main export ────────────────────────────────────────────────────────────────

export default function TrainingsCard(props: {
    trainings: TrainingRow[];
    loading: boolean;
    viewerRole?: ViewerRole;
}) {
    const { trainings = [], loading, viewerRole } = props;
    const showProof = viewerRole === "ADMIN";

    const PAGE_SIZE = PAGE_SIZES.trainingsCard;
    const [page, setPage] = useState(1);
    const totalPages = Math.ceil(trainings.length / PAGE_SIZE);
    const paginated = trainings.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

    return (
        <div className="border border-border/60 shadow-lg w-full min-w-0 overflow-hidden rounded-xl bg-card">
            {/* Header band */}
            <div className="relative px-6 py-4 border-b border-border/60 bg-gradient-to-br from-card to-background">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-transparent to-violet-500/5 pointer-events-none" />
                <div className="relative flex items-center gap-2.5">
                    <div className="rounded-lg border border-blue-500/20 bg-blue-500/10 p-2">
                        <GraduationCap className="h-4 w-4 text-blue-400" />
                    </div>
                    <span className="text-base font-semibold text-foreground">
                        Trainings & Seminars
                    </span>
                </div>
            </div>

            {/* Body */}
            <div className="px-6 py-5">
                {loading ? (
                    <div className="text-sm text-muted-foreground">
                        Loading trainings...
                    </div>
                ) : trainings.length === 0 ? (
                    <div className="px-3 py-4 rounded-md bg-white/5 border border-white/8 text-sm text-muted-foreground text-center">
                        No trainings found.
                    </div>
                ) : (
                    <>
                        <div className="rounded-md border border-white/8 overflow-hidden w-full">
                            <Table className="table-fixed w-full">
                                <TableHeader>
                                    <TableRow className="border-white/8 hover:bg-transparent">
                                        <TableHead className="text-[10px] uppercase tracking-widest text-muted-foreground font-semibold w-[60%]">
                                            Title
                                        </TableHead>
                                        <TableHead className="text-[10px] uppercase tracking-widest text-muted-foreground font-semibold text-right w-[40%]">
                                            Type / Status
                                        </TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {paginated.map((t) => (
                                        <TableRow
                                            key={t.attendanceId}
                                            className="border-white/8 hover:bg-white/3"
                                        >
                                            <TableCell className="py-3 align-top">
                                                <div className="font-medium text-sm text-foreground break-words whitespace-normal">
                                                    {t.title}
                                                </div>
                                                <div className="text-[11px] text-muted-foreground mt-0.5">
                                                    {t.level
                                                        ? `${t.level} • `
                                                        : ""}
                                                    {t.sponsor ?? ""}
                                                    {t.totalHours
                                                        ? ` • ${t.totalHours} hrs`
                                                        : ""}
                                                </div>
                                                <div className="text-[11px] text-muted-foreground font-mono mt-1">
                                                    {fmtDateRange(
                                                        t.startDate,
                                                        t.endDate,
                                                    )}
                                                </div>
                                            </TableCell>
                                            <TableCell className="py-3 align-top">
                                                <div className="flex flex-col items-end gap-2 sm:gap-1.5">
                                                    <div className="flex flex-wrap items-start justify-end gap-1">
                                                        <TypeChip
                                                            type={t.type || "—"}
                                                        />
                                                        <StatusChip
                                                            value={t.status}
                                                        />
                                                        {t.result && (
                                                            <StatusChip
                                                                value={t.result}
                                                            />
                                                        )}
                                                    </div>
                                                    {showProof &&
                                                        t.proof_url && (
                                                            <a
                                                                href={
                                                                    t.proof_url
                                                                }
                                                                target="_blank"
                                                                rel="noreferrer"
                                                                className="text-blue-400 hover:text-blue-300 text-[11px] hover:underline"
                                                            >
                                                                View proof
                                                            </a>
                                                        )}
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>

                        {/* Pagination */}
                        {totalPages > 1 && (
                            <div className="mt-3">
                                {viewerRole !== "ADMIN" && (
                                    <div className="flex justify-end mb-1">
                                        <Link
                                            href="/professional-dev"
                                            className="text-[11px] text-blue-400 hover:text-blue-300 hover:underline"
                                        >
                                            View All
                                        </Link>
                                    </div>
                                )}
                                <PageNav
                                    page={page}
                                    totalPages={totalPages}
                                    onPageChange={setPage}
                                />
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}
