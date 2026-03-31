/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";

import { ComplianceSummaryCard } from "@/features/compliance/components/compliance-summary-card";
import type { TeacherTrainingCompliance } from "@/features/compliance/types/compliance";
import { useComplianceReport } from "@/features/compliance/hooks/use-compliance-report";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card"; // Card still used for toolbar + summary
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { PageNav } from "@/components/ui-elements/pagination/page-nav";
import { TypeBadge, LevelBadge } from "@/components/ui-elements/badges";
import { PAGE_SIZES } from "@/components/ui-elements/pagination/page-sizes";

import {
    BookOpen,
    Building2,
    Calendar,
    Clock,
    Download,
    GraduationCap,
    Loader2,
    Sparkles,
} from "lucide-react";

function fmtDateRange(start?: string | null, end?: string | null) {
    const fmt = (d?: string | null) => {
        if (!d) return null;
        try {
            return new Date(d).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
            });
        } catch {
            return d;
        }
    };
    const s = fmt(start);
    const e = fmt(end);
    if (s && e && s !== e) return `${s} – ${e}`;
    return s ?? e ?? null;
}

/* ── Hours badge ── */
function HoursBadge({ hours, muted }: { hours: number; muted?: boolean }) {
    return (
        <span
            className="inline-flex items-center gap-1 rounded-md border px-2 py-0.5 text-xs font-semibold tabular-nums"
            style={
                muted
                    ? {
                          borderColor: "rgba(245,158,11,0.35)",
                          color: "rgb(251,191,36)",
                          backgroundColor: "rgba(245,158,11,0.1)",
                      }
                    : {
                          borderColor: "rgba(16,185,129,0.3)",
                          color: "rgb(52,211,153)",
                          backgroundColor: "rgba(16,185,129,0.08)",
                      }
            }
        >
            <Clock className="h-3 w-3" />
            {hours}h
        </span>
    );
}

/* ── Paginated table ── */
function TrainingTable({
    items,
    muted,
    emptyMessage,
}: {
    items: any[];
    muted?: boolean;
    emptyMessage: string;
}) {
    const [page, setPage] = useState(1);
    const pageSize = PAGE_SIZES.trainingsCard.default; // 6
    const totalPages = Math.max(1, Math.ceil(items.length / pageSize));

    const paged = useMemo(() => {
        const start = (page - 1) * pageSize;
        return items.slice(start, start + pageSize);
    }, [items, page, pageSize]);

    if (items.length === 0) {
        return (
            <div className="py-10 text-sm text-muted-foreground text-center">
                {emptyMessage}
            </div>
        );
    }

    return (
        <div className="space-y-3">
            <div className="rounded-md border border-border/60 overflow-x-auto">
                <Table>
                    <TableHeader>
                        <TableRow className="hover:bg-transparent border-border/60">
                            <TableHead className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground w-[96px]">
                                Type
                            </TableHead>
                            <TableHead className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                                Title
                            </TableHead>
                            <TableHead className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground hidden md:table-cell w-[120px]">
                                Level
                            </TableHead>
                            <TableHead className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground hidden lg:table-cell">
                                <span className="flex items-center gap-1.5">
                                    <Building2 className="h-3 w-3" />
                                    Agency
                                </span>
                            </TableHead>
                            <TableHead className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground hidden sm:table-cell w-[170px]">
                                <span className="flex items-center gap-1.5">
                                    <Calendar className="h-3 w-3" />
                                    Date
                                </span>
                            </TableHead>
                            <TableHead className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground text-right w-[80px]">
                                Hours
                            </TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {paged.map((t: any, idx: number) => {
                            const pd = t.ProfessionalDevelopment;
                            const displayHours = muted
                                ? Number(pd?.total_hours) || 0
                                : Number(t.approved_hours ?? pd?.total_hours) ||
                                  0;
                            const dateRange = fmtDateRange(
                                pd?.start_date,
                                pd?.end_date,
                            );

                            return (
                                <motion.tr
                                    key={`${t.id ?? idx}`}
                                    initial={{ opacity: 0, y: 4 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{
                                        duration: 0.15,
                                        delay: Math.min(idx * 0.03, 0.18),
                                    }}
                                    className={[
                                        "border-b border-border/40 last:border-b-0 transition-colors",
                                        muted
                                            ? "hover:bg-amber-500/5"
                                            : "hover:bg-accent/40",
                                    ].join(" ")}
                                >
                                    {/* Type */}
                                    <TableCell className="py-3">
                                        <TypeBadge
                                            type={pd?.type ?? "—"}
                                            size="xs"
                                        />
                                    </TableCell>

                                    {/* Title */}
                                    <TableCell className="py-3">
                                        <div className="min-w-0">
                                            <p
                                                className={`text-sm font-medium truncate max-w-[260px] ${
                                                    muted
                                                        ? "text-foreground/65"
                                                        : "text-foreground"
                                                }`}
                                            >
                                                {pd?.title ?? "—"}
                                            </p>
                                            {/* Level shown under title on mobile */}
                                            {pd?.level && (
                                                <div className="flex items-center gap-1.5 mt-1 md:hidden">
                                                    <LevelBadge
                                                        level={pd.level}
                                                        size="xs"
                                                    />
                                                </div>
                                            )}
                                        </div>
                                    </TableCell>

                                    {/* Level */}
                                    <TableCell className="py-3 hidden md:table-cell">
                                        {pd?.level ? (
                                            <LevelBadge
                                                level={pd.level}
                                                size="xs"
                                            />
                                        ) : (
                                            <span className="text-xs text-muted-foreground/40">
                                                —
                                            </span>
                                        )}
                                    </TableCell>

                                    {/* Agency */}
                                    <TableCell className="py-3 hidden lg:table-cell">
                                        <span className="text-xs text-muted-foreground truncate max-w-[180px] block">
                                            {pd?.sponsoring_agency ?? "—"}
                                        </span>
                                    </TableCell>

                                    {/* Date */}
                                    <TableCell className="py-3 hidden sm:table-cell">
                                        <span className="font-mono text-[11px] text-muted-foreground whitespace-nowrap">
                                            {dateRange ?? "—"}
                                        </span>
                                    </TableCell>

                                    {/* Hours */}
                                    <TableCell className="py-3 text-right">
                                        <HoursBadge
                                            hours={displayHours}
                                            muted={muted}
                                        />
                                    </TableCell>
                                </motion.tr>
                            );
                        })}
                    </TableBody>
                </Table>
            </div>

            {totalPages > 1 && (
                <div className="pt-1 border-t border-border/40">
                    <PageNav
                        page={page}
                        totalPages={totalPages}
                        onPageChange={setPage}
                    />
                </div>
            )}
        </div>
    );
}

/* ── Card header band (matching trainings-seminars.tsx / pd-view-modal.tsx style) ── */
function TableCardHeader({ count, muted }: { count: number; muted?: boolean }) {
    return (
        <div
            className={[
                "relative px-5 py-4 border-b border-border/60 bg-gradient-to-br from-card to-background",
            ].join(" ")}
        >
            <div
                className={`absolute inset-0 pointer-events-none bg-gradient-to-br ${
                    muted
                        ? "from-amber-500/5 via-transparent to-orange-500/5"
                        : "from-emerald-500/5 via-transparent to-teal-500/5"
                }`}
            />
            <div className="relative flex items-center gap-2.5">
                <div
                    className={`rounded-lg border p-1.5 ${
                        muted
                            ? "border-amber-500/20 bg-amber-500/10"
                            : "border-emerald-500/20 bg-emerald-500/10"
                    }`}
                >
                    <GraduationCap
                        className={`h-3.5 w-3.5 ${muted ? "text-amber-400" : "text-emerald-400"}`}
                    />
                </div>
                <div>
                    <p className="text-sm font-semibold text-foreground">
                        {muted ? "Outside Period" : "Counted Trainings"}
                    </p>
                    <p className="text-[11px] text-muted-foreground">
                        {count} result{count === 1 ? "" : "s"} ·{" "}
                        {PAGE_SIZES.trainingsCard.default} per page
                    </p>
                </div>
            </div>
        </div>
    );
}

// Captured once at module load — safe to use in useMemo without purity warnings
const _NOW = Date.now();

export function CompliancePageClient(props: {
    compliance: TeacherTrainingCompliance | null;
    countedTrainings: any[];
    otherTrainings: any[];
    schoolYear: string;
}) {
    const { compliance, countedTrainings, otherTrainings, schoolYear } = props;
    const { downloading, download } = useComplianceReport(schoolYear);

    // Counted → most recent start_date first
    const counted = useMemo(
        () =>
            [...(countedTrainings ?? [])].sort((a, b) => {
                const aDate = a.ProfessionalDevelopment?.start_date ?? "";
                const bDate = b.ProfessionalDevelopment?.start_date ?? "";
                return bDate.localeCompare(aDate);
            }),
        [countedTrainings],
    );

    // Outside period → closest to today first (ascending distance from now)
    const other = useMemo(
        () =>
            [...(otherTrainings ?? [])].sort((a, b) => {
                const aMs = new Date(
                    a.ProfessionalDevelopment?.start_date ?? 0,
                ).getTime();
                const bMs = new Date(
                    b.ProfessionalDevelopment?.start_date ?? 0,
                ).getTime();
                return Math.abs(aMs - _NOW) - Math.abs(bMs - _NOW);
            }),
        [otherTrainings],
    );

    return (
        <div className="space-y-4">
            {/* toolbar */}
            <Card className="min-w-0 border-border/60">
                <CardContent className="p-4 md:p-5">
                    <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Sparkles className="h-4 w-4 shrink-0 text-amber-400" />
                            Your counted trainings update based on the current
                            policy period.
                        </div>
                        <Button
                            variant="outline"
                            onClick={() => download("teacher")}
                            disabled={downloading}
                            size="sm"
                            className="flex items-center gap-2 shrink-0"
                        >
                            {downloading ? (
                                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                            ) : (
                                <Download className="h-3.5 w-3.5" />
                            )}
                            Download report
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {/* summary */}
            <ComplianceSummaryCard
                compliance={compliance}
                schoolYear={schoolYear}
            />

            {/* tabs */}
            <Tabs defaultValue="counted" className="space-y-3">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <TabsList className="w-full sm:w-auto">
                        <TabsTrigger value="counted" className="gap-1.5">
                            <BookOpen className="h-3.5 w-3.5" />
                            Counted
                            <Badge
                                variant="secondary"
                                className="ml-1 text-[11px] px-1.5 py-0"
                            >
                                {counted.length}
                            </Badge>
                        </TabsTrigger>
                        <TabsTrigger value="other" className="gap-1.5">
                            <BookOpen className="h-3.5 w-3.5" />
                            Outside period
                            <Badge
                                variant="secondary"
                                className="ml-1 text-[11px] px-1.5 py-0"
                            >
                                {other.length}
                            </Badge>
                        </TabsTrigger>
                    </TabsList>
                    <p className="text-[11px] text-muted-foreground">
                        Counted = within period and approved + passed.
                    </p>
                </div>

                <TabsContent value="counted">
                    <div className="rounded-xl border border-border/60 overflow-hidden min-w-0 bg-card">
                        <TableCardHeader count={counted.length} />
                        <div className="p-4">
                            <TrainingTable
                                items={counted}
                                emptyMessage="No approved and passed trainings found for this period."
                            />
                        </div>
                    </div>
                </TabsContent>

                <TabsContent value="other">
                    <div className="rounded-xl border border-border/60 overflow-hidden min-w-0 bg-card">
                        <TableCardHeader count={other.length} muted />
                        <div className="p-4">
                            <TrainingTable
                                items={other}
                                muted
                                emptyMessage="No trainings outside the current compliance period."
                            />
                        </div>
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    );
}
