"use client";

import Link from "next/link";
import { CheckCircle2, TrendingUp, ArrowRight } from "lucide-react";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { SalaryStatusBadge } from "@/components/ui-elements/badges";
import type {
    TeacherEligibilityRow,
    EligibilityStatus,
} from "@/lib/database/salary-eligibility";

interface SalaryEligibilityOverviewProps {
    data: TeacherEligibilityRow[];
    count: number;
}

export default function SalaryEligibilityOverview({
    data,
    count,
}: SalaryEligibilityOverviewProps) {
    const eligibleCount = data.filter((r) => r.status === "ELIGIBLE").length;
    const approachingCount = data.filter(
        (r) => r.status === "APPROACHING",
    ).length;

    const preview = [...data]
        .sort((a, b) => {
            const order = { ELIGIBLE: 0, APPROACHING: 1, ON_TRACK: 2 };
            return order[a.status] - order[b.status];
        })
        .slice(0, 5);

    return (
        <Card className="overflow-hidden border-border/60">
            <CardHeader className="pb-3 border-b border-border/40">
                <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-2">
                        <div className="rounded-lg p-1.5 bg-muted/40 shrink-0">
                            <TrendingUp className="h-3.5 w-3.5 text-muted-foreground" />
                        </div>
                        <div>
                            <CardTitle className="text-sm font-semibold">
                                Salary Eligibility
                            </CardTitle>
                            <CardDescription className="text-xs">
                                Every 3 years in current position
                            </CardDescription>
                        </div>
                    </div>

                    {/* summary pills */}
                    <div className="flex flex-wrap gap-1 justify-end shrink-0">
                        {eligibleCount > 0 && (
                            <span className="inline-flex items-center gap-1 rounded-full border border-border/60 bg-muted/40 px-2 py-0.5 text-[10px] font-semibold text-foreground">
                                <span className="h-1.5 w-1.5 rounded-full bg-foreground/40" />
                                {eligibleCount} eligible
                            </span>
                        )}
                        {approachingCount > 0 && (
                            <span className="inline-flex items-center gap-1 rounded-full border border-border/50 bg-muted/30 px-2 py-0.5 text-[10px] font-semibold text-muted-foreground">
                                <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground/50" />
                                {approachingCount} approaching
                            </span>
                        )}
                    </div>
                </div>

                {/* alert banner */}
                {eligibleCount > 0 && (
                    <div className="mt-2 rounded-lg border border-border/60 bg-muted/30 px-3 py-2 flex items-center gap-2">
                        <CheckCircle2 className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                        <p className="text-[11px] text-foreground/70 font-medium">
                            {eligibleCount} teacher
                            {eligibleCount === 1 ? " is" : "s are"} eligible for
                            a salary increase.
                        </p>
                    </div>
                )}
            </CardHeader>

            <CardContent className="pt-0 pb-2 px-0">
                {preview.length === 0 ? (
                    <div className="py-8 text-center text-xs text-muted-foreground">
                        No employment records found.
                    </div>
                ) : (
                    <div className="divide-y divide-border/40">
                        {preview.map((row) => {
                            return (
                                <div
                                    key={row.userId}
                                    className="flex items-center justify-between gap-3 px-4 py-3 hover:bg-accent/20 transition-colors"
                                >
                                    <div className="min-w-0">
                                        <p className="text-sm font-medium truncate">
                                            {row.lastName}, {row.firstName}
                                            {row.middleInitial
                                                ? ` ${row.middleInitial}.`
                                                : ""}
                                        </p>
                                        <p className="text-[11px] text-muted-foreground font-mono mt-0.5">
                                            {row.employeeId !== "—"
                                                ? row.employeeId
                                                : "No ID"}{" "}
                                            · {row.position}
                                        </p>
                                        <p className="text-[11px] text-muted-foreground mt-0.5">
                                            {row.cycleYears}y {row.cycleMonths}m
                                            into cycle
                                            {row.status !== "ELIGIBLE" && (
                                                <>
                                                    {" "}
                                                    · next{" "}
                                                    <span className="font-mono">
                                                        {row.nextEligibleDate}
                                                    </span>
                                                </>
                                            )}
                                        </p>
                                    </div>
                                    <SalaryStatusBadge
                                        status={row.status.toLowerCase()}
                                        size="xs"
                                    />
                                </div>
                            );
                        })}
                    </div>
                )}

                <div className="px-4 pt-2 pb-1 border-t border-border/40">
                    <Button
                        asChild
                        variant="ghost"
                        size="sm"
                        className="w-full justify-between text-xs text-muted-foreground hover:text-foreground h-8"
                    >
                        <Link href="/admin-actions/salary-increase-eligibility">
                            View all {count} teachers
                            <ArrowRight className="h-3.5 w-3.5" />
                        </Link>
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}
