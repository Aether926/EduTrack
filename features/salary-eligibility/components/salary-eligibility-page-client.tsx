"use client";

import { useState } from "react";
import Link from "next/link";
import { CheckCircle2, TrendingUp, ArrowLeft } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

import type { TeacherEligibilityRow, EligibilityStatus } from "@/lib/database/salary-eligibility";
import SalaryEligibilityTable from "@/features/salary-eligibility/components/salary-eligibility-table";

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
  const approachingCount = rows.filter((r) => r.status === "APPROACHING").length;

  function handleOptimisticUpdate(userId: string) {
    setRows((prev) =>
      prev.map((r) =>
        r.userId === userId
          ? { ...r, status: "ON_TRACK" as EligibilityStatus }
          : r
      )
    );
  }

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-5 md:px-6 md:py-6 space-y-5">
      {/* Header */}
      <div className="rounded-xl border bg-card p-4 md:p-6 space-y-4">
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="secondary">{roleLabel}</Badge>
          <Badge variant="outline">Salary Eligibility</Badge>
        </div>

        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <Button
              asChild variant="ghost" size="sm"
              className="gap-1.5 text-muted-foreground hover:text-foreground -ml-2 mb-1"
            >
              <Link href="/admin-actions">
                <ArrowLeft className="h-3.5 w-3.5" />
                Admin Actions
              </Link>
            </Button>
            <h1 className="text-2xl md:text-3xl font-semibold tracking-tight">
              Salary Increase Eligibility
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Teachers eligible for salary increase every 3 years in current position.
            </p>
          </div>

          {/* stat mini-cards */}
          <div className="flex gap-3 shrink-0">
            <div className="rounded-lg border border-emerald-500/30 bg-card px-4 py-2.5 flex items-center gap-3">
              <div className="rounded-md border border-emerald-500/20 bg-emerald-500/10 p-1.5">
                <CheckCircle2 className="h-4 w-4 text-emerald-400" />
              </div>
              <div>
                <div className="text-[11px] text-muted-foreground">Eligible</div>
                <div className="text-xl font-bold text-emerald-400 tabular-nums">{eligibleCount}</div>
              </div>
            </div>
            <div className="rounded-lg border border-amber-500/30 bg-card px-4 py-2.5 flex items-center gap-3">
              <div className="rounded-md border border-amber-500/20 bg-amber-500/10 p-1.5">
                <TrendingUp className="h-4 w-4 text-amber-400" />
              </div>
              <div>
                <div className="text-[11px] text-muted-foreground">Approaching</div>
                <div className="text-xl font-bold text-amber-400 tabular-nums">{approachingCount}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* eligible alert */}
      {eligibleCount > 0 && (
        <div className="rounded-lg border border-emerald-500/30 bg-emerald-500/5 px-4 py-3 flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
          <p className="text-sm text-emerald-400 font-medium">
            {eligibleCount} teacher{eligibleCount === 1 ? " is" : "s are"} eligible for a salary increase — review and mark them below.
          </p>
        </div>
      )}

      {/* Separated table component */}
      <SalaryEligibilityTable
        data={rows}
        onOptimisticUpdate={handleOptimisticUpdate}
      />
    </div>
  );
}