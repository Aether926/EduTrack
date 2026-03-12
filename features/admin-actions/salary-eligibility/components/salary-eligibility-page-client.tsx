"use client";

import { useState } from "react";
import Link from "next/link";
import { CheckCircle2, TrendingUp, ArrowLeft } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

import type {
    TeacherEligibilityRow,
    EligibilityStatus,
} from "@/lib/database/salary-eligibility";
import SalaryEligibilityTable from "@/features/admin-actions/salary-eligibility/components/salary-eligibility-table";

interface SalaryEligibilityPageClientProps {
    initialData: TeacherEligibilityRow[];
    roleLabel: string;
}

export default function SalaryEligibilityPageClient({
    initialData,
    roleLabel,
}: SalaryEligibilityPageClientProps) {
    const [rows, setRows] = useState<TeacherEligibilityRow[]>(initialData);

    const eligibleCount = rows.filter((r) => r.status === "ELIGIBLE").length;
    const approachingCount = rows.filter(
        (r) => r.status === "APPROACHING",
    ).length;

    function handleOptimisticUpdate(userId: string) {
        setRows((prev) =>
            prev.map((r) =>
                r.userId === userId
                    ? { ...r, status: "ON_TRACK" as EligibilityStatus }
                    : r,
            ),
        );
    }

    return (
        <div className="mx-auto w-full max-w-7xl px-4 py-5 md:px-6 md:py-6 space-y-5">
            {/* ── Header ── */}
            <div className="relative rounded-xl border border-border/60 bg-gradient-to-br from-card to-background overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-rose-500/5 via-transparent to-rose-400/5 pointer-events-none" />
                <div className="relative px-5 py-5 md:px-6 md:py-6">
                    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                        <div className="flex items-center gap-3">
                            <div className="rounded-lg border border-rose-500/20 bg-rose-500/10 p-2.5 shrink-0">
                                <TrendingUp className="h-5 w-5 text-rose-400" />
                            </div>
                            <div>
                                <Button
                                    asChild
                                    variant="ghost"
                                    size="sm"
                                    className="gap-1.5 text-muted-foreground hover:text-foreground -ml-2 -mt-1 mb-0.5 h-auto py-0.5"
                                >
                                    <Link href="/admin-actions">
                                        <ArrowLeft className="h-3.5 w-3.5" />
                                        Admin Actions
                                    </Link>
                                </Button>
                                <h1 className="text-lg font-semibold tracking-tight leading-tight">
                                    Salary Increase Eligibility
                                </h1>
                                <p className="text-[13px] text-muted-foreground mt-0.5">
                                    Teachers eligible for salary increase every
                                    3 years in current position.
                                </p>
                            </div>
                        </div>
                        <div className="flex flex-wrap items-center gap-2">
                            <span className="inline-block rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                                {roleLabel}
                            </span>
                            <Badge
                                variant="outline"
                                className="gap-1.5 text-emerald-400 border-emerald-500/30"
                            >
                                <CheckCircle2 className="h-3.5 w-3.5" />
                                {eligibleCount} eligible
                            </Badge>
                            <Badge
                                variant="outline"
                                className="gap-1.5 text-amber-400 border-amber-500/30"
                            >
                                <TrendingUp className="h-3.5 w-3.5" />
                                {approachingCount} approaching
                            </Badge>
                        </div>
                    </div>
                </div>
            </div>

            {/* eligible alert */}
            {eligibleCount > 0 && (
                <div className="rounded-lg border border-emerald-500/30 bg-emerald-500/5 px-4 py-3 flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                    <p className="text-sm text-emerald-400 font-medium">
                        {eligibleCount} teacher
                        {eligibleCount === 1 ? " is" : "s are"} eligible for a
                        salary increase — review and mark them below.
                    </p>
                </div>
            )}

            <SalaryEligibilityTable
                data={rows}
                onOptimisticUpdate={handleOptimisticUpdate}
            />
        </div>
    );
}
