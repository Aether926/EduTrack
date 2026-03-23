"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ShieldCheck, ShieldAlert, ShieldX, Clock } from "lucide-react";
import { RiskStatusBadge } from "@/components/ui-elements/badges";
import type {
    TeacherTrainingCompliance,
    ComplianceStatus,
} from "@/features/compliance/types/compliance";

const STATUS_ICON: Record<ComplianceStatus, React.ReactNode> = {
    COMPLIANT: <ShieldCheck className="h-5 w-5 text-emerald-500" />,
    AT_RISK: <ShieldAlert className="h-5 w-5 text-amber-500" />,
    NON_COMPLIANT: <ShieldX className="h-5 w-5 text-rose-500" />,
};

const STATUS_BAR_COLOR: Record<ComplianceStatus, string> = {
    COMPLIANT: "rgba(16, 185, 129, 0.55)",
    AT_RISK: "rgba(245, 158, 11, 0.6)",
    NON_COMPLIANT: "rgba(244, 63, 94, 0.55)",
};

const STATUS_BORDER_COLOR: Record<ComplianceStatus, string> = {
    COMPLIANT: "rgba(16, 185, 129, 0.2)",
    AT_RISK: "rgba(245, 158, 11, 0.2)",
    NON_COMPLIANT: "rgba(244, 63, 94, 0.2)",
};

export function ComplianceSummaryCard(props: {
    compliance: TeacherTrainingCompliance | null;
    schoolYear: string;
}) {
    const { compliance, schoolYear } = props;

    if (!compliance) {
        return (
            <Card className="border border-border/60">
                <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2">
                        <ShieldX className="h-5 w-5 text-muted-foreground" />
                        Training Compliance
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-sm text-muted-foreground">
                        No compliance data found for {schoolYear}. Contact your
                        administrator to set up compliance requirements.
                    </p>
                </CardContent>
            </Card>
        );
    }

    const status = compliance.status as ComplianceStatus;
    const percent =
        compliance.required_hours > 0
            ? Math.min(
                  (compliance.total_hours / compliance.required_hours) * 100,
                  100,
              )
            : 100;

    const hoursCompleted = compliance.total_hours >= compliance.required_hours;
    const hoursRemaining = compliance.remaining_hours <= 0;

    return (
        <Card
            className="border bg-card"
            style={{ borderColor: STATUS_BORDER_COLOR[status] }}
        >
            <CardHeader className="pb-3">
                <div className="flex items-center justify-between gap-2">
                    <CardTitle className="text-sm sm:text-base flex items-center gap-2 min-w-0">
                        <span className="shrink-0">{STATUS_ICON[status]}</span>
                        <span className="leading-snug">
                            Training Compliance — {schoolYear}
                        </span>
                    </CardTitle>
                    <div className="shrink-0">
                        <RiskStatusBadge status={status.toLowerCase()} />
                    </div>
                </div>
            </CardHeader>
            <CardContent className="space-y-4">
                {/* Progress bar */}
                <div className="space-y-1.5">
                    <div className="flex justify-between text-xs text-muted-foreground">
                        <span>{compliance.total_hours}h completed</span>
                        <span>{compliance.required_hours}h required</span>
                    </div>
                    <div
                        className="h-2 w-full rounded-full overflow-hidden"
                        style={{ backgroundColor: "rgba(255,255,255,0.07)" }}
                    >
                        <div
                            className="h-full rounded-full transition-all duration-700 ease-out"
                            style={{
                                width: `${percent}%`,
                                backgroundColor: STATUS_BAR_COLOR[status],
                            }}
                        />
                    </div>
                    <p className="text-[11px] text-muted-foreground text-right tabular-nums">
                        {Math.round(percent)}% of requirement met
                    </p>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-2">
                    {/* Completed */}
                    <div
                        className="text-center p-2 sm:p-3 rounded-lg border"
                        style={{
                            backgroundColor: hoursCompleted
                                ? "rgba(16, 185, 129, 0.08)"
                                : "rgba(245, 158, 11, 0.08)",
                            borderColor: hoursCompleted
                                ? "rgba(16, 185, 129, 0.25)"
                                : "rgba(245, 158, 11, 0.25)",
                        }}
                    >
                        <p
                            className="text-lg sm:text-2xl font-bold tabular-nums"
                            style={{
                                color: hoursCompleted
                                    ? "rgb(52, 211, 153)"
                                    : "rgb(251, 191, 36)",
                            }}
                        >
                            {compliance.total_hours}h
                        </p>
                        <p className="text-[10px] sm:text-[11px] text-muted-foreground uppercase tracking-wider font-medium mt-0.5">
                            Completed
                        </p>
                    </div>

                    {/* Required */}
                    <div
                        className="text-center p-2 sm:p-3 rounded-lg border"
                        style={{
                            backgroundColor: "rgba(59, 130, 246, 0.08)",
                            borderColor: "rgba(59, 130, 246, 0.25)",
                        }}
                    >
                        <p
                            className="text-lg sm:text-2xl font-bold tabular-nums"
                            style={{ color: "rgb(96, 165, 250)" }}
                        >
                            {compliance.required_hours}h
                        </p>
                        <p className="text-[10px] sm:text-[11px] text-muted-foreground uppercase tracking-wider font-medium mt-0.5">
                            Required
                        </p>
                    </div>

                    {/* Remaining */}
                    <div className="text-center p-2 sm:p-3">
                        <p
                            className="text-lg sm:text-2xl font-bold tabular-nums"
                            style={{
                                color: hoursRemaining
                                    ? "rgb(52, 211, 153)"
                                    : "rgb(251, 113, 133)",
                            }}
                        >
                            {compliance.remaining_hours}h
                        </p>
                        <p className="text-[10px] sm:text-[11px] text-muted-foreground uppercase tracking-wider font-medium mt-0.5">
                            Remaining
                        </p>
                    </div>
                </div>

                {status !== "COMPLIANT" && (
                    <div
                        className="flex items-start gap-2 p-3 rounded-lg text-sm border"
                        style={
                            status === "AT_RISK"
                                ? {
                                      backgroundColor:
                                          "rgba(245, 158, 11, 0.07)",
                                      borderColor: "rgba(245, 158, 11, 0.2)",
                                      color: "rgb(253, 230, 138)",
                                  }
                                : {
                                      backgroundColor:
                                          "rgba(244, 63, 94, 0.07)",
                                      borderColor: "rgba(244, 63, 94, 0.2)",
                                      color: "rgb(254, 205, 211)",
                                  }
                        }
                    >
                        <Clock className="h-4 w-4 mt-0.5 shrink-0 opacity-70" />
                        <span className="text-[13px]">
                            {status === "AT_RISK"
                                ? `You're close — complete ${compliance.remaining_hours} more hour${compliance.remaining_hours !== 1 ? "s" : ""} to stay compliant.`
                                : `You need ${compliance.remaining_hours} more hour${compliance.remaining_hours !== 1 ? "s" : ""} to meet the requirement.`}
                        </span>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
