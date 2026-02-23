/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { ComplianceSummaryCard } from "@/features/compliance/components/compliance-summary-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BookOpen } from "lucide-react";
import type { TeacherTrainingCompliance} from "@/features/compliance/types/compliance";
import { useComplianceReport } from "@/features/compliance/hooks/use-compliance-report";
import { Download, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button";

export function CompliancePageClient(props: {
  compliance: TeacherTrainingCompliance | null;
  countedTrainings: any[];
  otherTrainings: any[];
  schoolYear: string;
}) {
  const { compliance, countedTrainings, schoolYear, otherTrainings } = props;
  const { downloading, download } = useComplianceReport(schoolYear);

  return (
    <main className="min-h-screen bg-background p-4 sm:p-6 lg:p-8">
      <div className="max-w-3xl mx-auto space-y-6">
        <header className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-1">
            My Training Compliance
          </h1>
          <p className="text-sm text-muted-foreground">
            Track your training hours and compliance status.
          </p>
        </div>
        <Button
          variant="outline"
          onClick={() => download("teacher")}
          disabled={downloading}
          className="flex items-center gap-2"
        >
          {downloading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
          Download Report
        </Button>
      </header>

        {/* Summary card */}
        <ComplianceSummaryCard compliance={compliance} schoolYear={schoolYear} />

        {/* Counted Trainings — this period */}
  <Card>
    <CardHeader className="pb-3">
      <div className="flex items-center gap-2">
        <BookOpen className="h-4 w-4 text-muted-foreground" />
        <CardTitle className="text-base">
          Counted Trainings — {schoolYear} ({countedTrainings.length})
        </CardTitle>
      </div>
      <p className="text-xs text-muted-foreground">
        Trainings within the compliance period that count toward your required hours.
      </p>
    </CardHeader>
    <CardContent>
      {countedTrainings.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          No approved and passed trainings found for this period.
        </p>
      ) : (
        <div className="space-y-2">
          {countedTrainings.map((t: any, i) => {
            const pd = t.ProfessionalDevelopment;
            const displayHours = t.approved_hours ?? pd?.total_hours ?? 0;
            return (
              <div key={i} className="flex items-center justify-between p-3 rounded-lg border border-border bg-muted/30">
                <div>
                  <p className="text-sm font-medium">{pd?.title ?? "—"}</p>
                  <p className="text-xs text-muted-foreground">
                    {pd?.type ?? "—"} • {pd?.sponsoring_agency ?? "—"}
                  </p>
                </div>
                <Badge variant="outline" className="text-green-700 border-green-300 bg-green-50 shrink-0">
                  {displayHours}h
                </Badge>
              </div>
            );
          })}
        </div>
      )}
    </CardContent>
  </Card>
      {/* Other Trainings — outside period */}
      {otherTrainings.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <BookOpen className="h-4 w-4 text-muted-foreground" />
              <CardTitle className="text-base">
                Other Trainings Attended ({otherTrainings.length})
              </CardTitle>
            </div>
            <p className="text-xs text-muted-foreground">
              Trainings outside the current compliance period — not counted toward required hours.
            </p>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {otherTrainings.map((t: any, i) => {
                const pd = t.ProfessionalDevelopment;
                return (
                  <div key={i} className="flex items-center justify-between p-3 rounded-lg border border-border bg-muted/30 opacity-60">
                    <div>
                      <p className="text-sm font-medium">{pd?.title ?? "—"}</p>
                      <p className="text-xs text-muted-foreground">
                        {pd?.type ?? "—"} • {pd?.sponsoring_agency ?? "—"}
                      </p>
                    </div>
                    <Badge variant="outline" className="shrink-0">
                      {pd?.total_hours ?? 0}h
                    </Badge>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}
      </div>
    </main>
  );
}