/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";

import { ComplianceSummaryCard } from "@/features/compliance/components/compliance-summary-card";
import type { TeacherTrainingCompliance } from "@/features/compliance/types/compliance";
import { useComplianceReport } from "@/features/compliance/hooks/use-compliance-report";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import {
    BookOpen,
    Building2,
    Calendar,
    Download,
    Loader2,
    Sparkles,
    Tag,
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

function TrainingRow({
    title,
    type,
    agency,
    dateRange,
    hours,
    muted,
}: {
    title: string;
    type: string;
    agency: string;
    dateRange: string | null;
    hours: number;
    muted?: boolean;
}) {
    return (
        <motion.div
            whileHover={{ y: -1 }}
            transition={{ duration: 0.12 }}
            className={[
                "group flex items-center justify-between gap-4 px-3 py-2.5 rounded-lg border transition-colors",
                muted
                    ? "border-border hover:border-border/80"
                    : "border-border/60 bg-card hover:border-border hover:bg-muted/10",
            ].join(" ")}
            style={
                muted
                    ? { backgroundColor: "rgba(245, 158, 11, 0.06)" }
                    : undefined
            }
        >
            {/* left: text info */}
            <div className="min-w-0 flex-1 flex items-center gap-4">
                <div className="min-w-0 flex-1">
                    <p
                        className={`text-sm font-medium leading-snug truncate ${muted ? "text-foreground/70" : ""}`}
                    >
                        {title}
                    </p>

                    <div className="flex items-center gap-x-2.5 mt-0.5 min-w-0 overflow-hidden">
                        {type && type !== "—" && (
                            <span className="flex items-center gap-1 text-[11px] text-muted-foreground/80 shrink-0">
                                <Tag className="h-3 w-3" />
                                {type}
                            </span>
                        )}
                        {agency && agency !== "—" && (
                            <span className="flex items-center gap-1 text-[11px] text-muted-foreground/80 min-w-0">
                                <Building2 className="h-3 w-3 shrink-0" />
                                <span className="truncate">{agency}</span>
                            </span>
                        )}
                        {dateRange && (
                            <span className="hidden sm:flex items-center gap-1 text-[11px] text-muted-foreground/80 shrink-0">
                                <Calendar className="h-3 w-3" />
                                {dateRange}
                            </span>
                        )}
                    </div>
                </div>
            </div>

            <div className="shrink-0">
                <span
                    className="inline-flex items-center rounded-md border px-2.5 py-1 text-xs font-semibold tabular-nums"
                    style={
                        muted
                            ? {
                                  borderColor: "rgba(245, 158, 11, 0.35)",
                                  color: "rgb(251, 191, 36)",
                                  backgroundColor: "rgba(245, 158, 11, 0.1)",
                              }
                            : {
                                  borderColor: "rgba(16, 185, 129, 0.3)",
                                  color: "rgb(52, 211, 153)",
                                  backgroundColor: "rgba(16, 185, 129, 0.08)",
                              }
                    }
                >
                    {hours}h
                </span>
            </div>
        </motion.div>
    );
}

export function CompliancePageClient(props: {
    compliance: TeacherTrainingCompliance | null;
    countedTrainings: any[];
    otherTrainings: any[];
    schoolYear: string;
}) {
    const { compliance, countedTrainings, otherTrainings, schoolYear } = props;
    const { downloading, download } = useComplianceReport(schoolYear);

    const counted = useMemo(() => countedTrainings ?? [], [countedTrainings]);
    const other = useMemo(() => otherTrainings ?? [], [otherTrainings]);

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
                    <Card className="border-border/60">
                        <CardContent className="p-1.5">
                            {counted.length === 0 ? (
                                <div className="py-6 text-sm text-muted-foreground text-center">
                                    No approved and passed trainings found for
                                    this period.
                                </div>
                            ) : (
                                <div className="space-y-2">
                                    {counted.map((t: any, i: number) => {
                                        const pd = t.ProfessionalDevelopment;
                                        const displayHours =
                                            t.approved_hours ??
                                            pd?.total_hours ??
                                            0;
                                        const dateRange = fmtDateRange(
                                            pd?.start_date,
                                            pd?.end_date,
                                        );

                                        return (
                                            <motion.div
                                                key={`${t.id ?? i}`}
                                                initial={{ opacity: 0, y: 5 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{
                                                    duration: 0.16,
                                                    delay: Math.min(
                                                        i * 0.025,
                                                        0.2,
                                                    ),
                                                }}
                                            >
                                                <TrainingRow
                                                    title={pd?.title ?? "—"}
                                                    type={pd?.type ?? "—"}
                                                    agency={
                                                        pd?.sponsoring_agency ??
                                                        "—"
                                                    }
                                                    dateRange={dateRange}
                                                    hours={
                                                        Number(displayHours) ||
                                                        0
                                                    }
                                                />
                                            </motion.div>
                                        );
                                    })}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="other">
                    <Card className="border-border/60">
                        <CardContent className="p-1.5">
                            {other.length === 0 ? (
                                <div className="py-6 text-sm text-muted-foreground text-center">
                                    No trainings outside the current compliance
                                    period.
                                </div>
                            ) : (
                                <div className="space-y-2">
                                    {other.map((t: any, i: number) => {
                                        const pd = t.ProfessionalDevelopment;
                                        const dateRange = fmtDateRange(
                                            pd?.start_date,
                                            pd?.end_date,
                                        );

                                        return (
                                            <motion.div
                                                key={`${t.id ?? i}`}
                                                initial={{ opacity: 0, y: 5 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{
                                                    duration: 0.16,
                                                    delay: Math.min(
                                                        i * 0.025,
                                                        0.2,
                                                    ),
                                                }}
                                            >
                                                <TrainingRow
                                                    title={pd?.title ?? "—"}
                                                    type={pd?.type ?? "—"}
                                                    agency={
                                                        pd?.sponsoring_agency ??
                                                        "—"
                                                    }
                                                    dateRange={dateRange}
                                                    hours={
                                                        Number(
                                                            pd?.total_hours,
                                                        ) || 0
                                                    }
                                                    muted
                                                />
                                            </motion.div>
                                        );
                                    })}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}
