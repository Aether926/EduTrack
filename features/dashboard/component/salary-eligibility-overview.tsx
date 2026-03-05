"use client";

import Link from "next/link";
import { CheckCircle2, AlertTriangle, Clock, TrendingUp, ArrowRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { TeacherEligibilityRow, EligibilityStatus } from "@/lib/database/salary-eligibility";

const statusConfig: Record<EligibilityStatus, { cls: string; icon: React.ReactNode }> = {
  ELIGIBLE: {
    cls: "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30",
    icon: <CheckCircle2 className="h-3 w-3" />,
  },
  APPROACHING: {
    cls: "bg-amber-500/15 text-amber-400 border border-amber-500/30",
    icon: <AlertTriangle className="h-3 w-3" />,
  },
  ON_TRACK: {
    cls: "bg-sky-500/15 text-sky-400 border border-sky-500/30",
    icon: <Clock className="h-3 w-3" />,
  },
};

interface SalaryEligibilityOverviewProps {
  data: TeacherEligibilityRow[];
  count: number;
}

export default function SalaryEligibilityOverview({
  data,
  count,
}: SalaryEligibilityOverviewProps) {
  const eligibleCount = data.filter((r) => r.status === "ELIGIBLE").length;
  const approachingCount = data.filter((r) => r.status === "APPROACHING").length;

  // show top 5 eligible first
  const preview = [...data]
    .sort((a, b) => {
      const order = { ELIGIBLE: 0, APPROACHING: 1, ON_TRACK: 2 };
      return order[a.status] - order[b.status];
    })
    .slice(0, 5);

  return (
    <Card className="overflow-hidden border-border/60">
      <CardHeader className="pb-2 border-b border-border/60">
        <div className="flex items-start justify-between gap-2">
          <div className="space-y-0.5">
            <CardTitle className="text-sm flex items-center gap-2">
              <TrendingUp className="h-3.5 w-3.5 text-emerald-400" />
              Salary Eligibility
            </CardTitle>
            <CardDescription className="text-xs">
              Every 3 years in current position
            </CardDescription>
          </div>

          {/* summary pills */}
          <div className="flex flex-wrap gap-1 justify-end">
            {eligibleCount > 0 && (
              <span className="inline-flex items-center gap-1 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2 py-0.5 text-[10px] font-semibold text-emerald-400">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                {eligibleCount} eligible
              </span>
            )}
            {approachingCount > 0 && (
              <span className="inline-flex items-center gap-1 rounded-full border border-amber-500/30 bg-amber-500/10 px-2 py-0.5 text-[10px] font-semibold text-amber-400">
                <span className="h-1.5 w-1.5 rounded-full bg-amber-400" />
                {approachingCount} approaching
              </span>
            )}
          </div>
        </div>

        {/* alert banner */}
        {eligibleCount > 0 && (
          <div className="mt-2 rounded-lg border border-emerald-500/30 bg-emerald-500/5 px-3 py-2 flex items-center gap-2">
            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
            <p className="text-[11px] text-emerald-400 font-medium">
              {eligibleCount} teacher{eligibleCount === 1 ? " is" : "s are"} eligible for a salary increase.
            </p>
          </div>
        )}
      </CardHeader>

      <CardContent className="pt-0 pb-2 px-0">
        {preview.length === 0 ? (
          <div className="py-6 text-center text-xs text-muted-foreground">
            No employment records found.
          </div>
        ) : (
          <div className="divide-y divide-border/40">
            {preview.map((row) => {
              const sc = statusConfig[row.status];
              return (
                <div
                  key={row.userId}
                  className="flex items-center justify-between gap-2 px-4 py-2.5 hover:bg-accent/20 transition-colors"
                >
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate">
                      {row.lastName}, {row.firstName}
                      {row.middleInitial ? ` ${row.middleInitial}.` : ""}
                    </p>
                    <p className="text-[11px] text-muted-foreground font-mono">
                      {row.employeeId !== "—" ? row.employeeId : "No ID"} · {row.position}
                    </p>
                    <p className="text-[11px] text-muted-foreground mt-0.5">
                      {row.cycleYears}y {row.cycleMonths}m into cycle
                      {row.status !== "ELIGIBLE" && (
                        <> · next <span className="font-mono">{row.nextEligibleDate}</span></>
                      )}
                    </p>
                  </div>
                  <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold shrink-0 ${sc.cls}`}>
                    {sc.icon}
                    {row.status === "ELIGIBLE" ? "Eligible" : row.status === "APPROACHING" ? "Soon" : "On Track"}
                  </span>
                </div>
              );
            })}
          </div>
        )}

        {/* footer — view all */}
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