"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ShieldCheck, ShieldAlert, ShieldX, Clock } from "lucide-react";
import { STATUS_LABEL, STATUS_BADGE, STATUS_CARD } from "@/features/compliance/lib/status";
import type { TeacherTrainingCompliance, ComplianceStatus } from "@/features/compliance/types/compliance";

const STATUS_ICON: Record<ComplianceStatus, React.ReactNode> = {
  COMPLIANT: <ShieldCheck className="h-5 w-5 text-green-600" />,
  AT_RISK: <ShieldAlert className="h-5 w-5 text-yellow-600" />,
  NON_COMPLIANT: <ShieldX className="h-5 w-5 text-red-600" />,
};

export function ComplianceSummaryCard(props: {
  compliance: TeacherTrainingCompliance | null;
  schoolYear: string;
}) {
  const { compliance, schoolYear } = props;

  if (!compliance) {
    return (
      <Card className="border border-gray-200">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <ShieldX className="h-5 w-5 text-gray-400" />
            Training Compliance
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            No compliance data found for {schoolYear}. Contact your administrator to set up compliance requirements.
          </p>
        </CardContent>
      </Card>
    );
  }

  const status = compliance.status as ComplianceStatus;
  const percent = compliance.required_hours > 0
    ? Math.min((compliance.total_hours / compliance.required_hours) * 100, 100)
    : 100;

  return (
    <Card className={`border ${STATUS_CARD[status]}`}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            {STATUS_ICON[status]}
            Training Compliance — {schoolYear}
          </CardTitle>
          <Badge className={STATUS_BADGE[status]}>
            {STATUS_LABEL[status]}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Progress bar */}
        <div className="space-y-2">
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>{compliance.total_hours}h completed</span>
            <span>{compliance.required_hours}h required</span>
          </div>
          <Progress value={percent} className="h-2" />
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3">
          <div className="text-center p-3 rounded-lg bg-white dark:bg-gray-900 border border-border">
            <p className="text-2xl font-bold text-foreground">{compliance.total_hours}h</p>
            <p className="text-xs text-muted-foreground mt-1">Completed</p>
          </div>
          <div className="text-center p-3 rounded-lg bg-white dark:bg-gray-900 border border-border">
            <p className="text-2xl font-bold text-foreground">{compliance.required_hours}h</p>
            <p className="text-xs text-muted-foreground mt-1">Required</p>
          </div>
          <div className="text-center p-3 rounded-lg bg-white dark:bg-gray-900 border border-border">
            <p className={`text-2xl font-bold ${compliance.remaining_hours > 0 ? "text-red-600" : "text-green-600"}`}>
              {compliance.remaining_hours}h
            </p>
            <p className="text-xs text-muted-foreground mt-1">Remaining</p>
          </div>
        </div>

        {status !== "COMPLIANT" && (
          <div className={`flex items-start gap-2 p-3 rounded-lg text-sm
            ${status === "AT_RISK" ? "bg-yellow-50 text-yellow-800 dark:bg-yellow-950/30" : "bg-red-50 text-red-800 dark:bg-red-950/30"}`}>
            <Clock className="h-4 w-4 mt-0.5 shrink-0" />
            <span>
              {status === "AT_RISK"
                ? `You are close to the requirement. Complete ${compliance.remaining_hours} more hours to stay compliant.`
                : `You need ${compliance.remaining_hours} more hours to meet the requirement.`}
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}