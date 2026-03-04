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
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";

import { BookOpen, Download, Loader2, Sparkles } from "lucide-react";

function TrainingRow({
  title,
  meta,
  hours,
  muted,
}: {
  title: string;
  meta: string;
  hours: number;
  muted?: boolean;
}) {
  return (
    <motion.div
      whileHover={{ y: -2 }}
      transition={{ duration: 0.15 }}
      className={[
        "flex items-center justify-between gap-3 p-3 rounded-lg border border-border bg-muted/20",
        muted ? "opacity-60" : "",
      ].join(" ")}
    >
      <div className="min-w-0">
        <div className="truncate text-sm font-medium">{title}</div>
        <div className="truncate text-xs text-muted-foreground">{meta}</div>
      </div>

      <Badge
        variant="outline"
        className={
          muted
            ? "shrink-0"
            : "shrink-0 text-green-700 border-green-300 bg-green-50"
        }
      >
        {hours}h
      </Badge>
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
      {/* toolbar (no duplicate page header) */}
      <Card className="min-w-0">
        <CardContent className="p-4 md:p-6">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Sparkles className="h-4 w-4" />
              Your counted trainings update based on the current policy period.
            </div>

            <Button
              variant="outline"
              onClick={() => download("teacher")}
              disabled={downloading}
              className="flex items-center gap-2"
            >
              {downloading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Download className="h-4 w-4" />
              )}
              Download report
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* summary (kept) */}
      <ComplianceSummaryCard compliance={compliance} schoolYear={schoolYear} />

      {/* tabs */}
      <Tabs defaultValue="counted" className="space-y-3">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <TabsList className="w-full sm:w-auto">
            <TabsTrigger value="counted" className="gap-2">
              <BookOpen className="h-4 w-4" />
              Counted
              <Badge variant="secondary" className="ml-1">
                {counted.length}
              </Badge>
            </TabsTrigger>
            <TabsTrigger value="other" className="gap-2">
              <BookOpen className="h-4 w-4" />
              Outside period
              <Badge variant="secondary" className="ml-1">
                {other.length}
              </Badge>
            </TabsTrigger>
          </TabsList>

          <div className="text-xs text-muted-foreground">
            Counted = within period and approved + passed.
          </div>
        </div>

        <TabsContent value="counted">
          <Card>
            <CardContent className="p-4 md:p-6">
              {counted.length === 0 ? (
                <div className="py-8 text-sm text-muted-foreground text-center">
                  No approved and passed trainings found for this period.
                </div>
              ) : (
                <div className="space-y-2">
                  {counted.map((t: any, i: number) => {
                    const pd = t.ProfessionalDevelopment;
                    const displayHours = t.approved_hours ?? pd?.total_hours ?? 0;

                    return (
                      <motion.div
                        key={`${t.id ?? i}`}
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.18, delay: Math.min(i * 0.02, 0.2) }}
                      >
                        <TrainingRow
                          title={pd?.title ?? "—"}
                          meta={`${pd?.type ?? "—"} • ${pd?.sponsoring_agency ?? "—"}`}
                          hours={Number(displayHours) || 0}
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
          <Card>
            <CardContent className="p-4 md:p-6">
              {other.length === 0 ? (
                <div className="py-8 text-sm text-muted-foreground text-center">
                  No trainings outside the current compliance period.
                </div>
              ) : (
                <div className="space-y-2">
                  {other.map((t: any, i: number) => {
                    const pd = t.ProfessionalDevelopment;
                    return (
                      <motion.div
                        key={`${t.id ?? i}`}
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.18, delay: Math.min(i * 0.02, 0.2) }}
                      >
                        <TrainingRow
                          title={pd?.title ?? "—"}
                          meta={`${pd?.type ?? "—"} • ${pd?.sponsoring_agency ?? "—"}`}
                          hours={Number(pd?.total_hours) || 0}
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