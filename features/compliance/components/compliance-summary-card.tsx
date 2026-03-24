"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ShieldCheck, ShieldAlert, ShieldX, Clock } from "lucide-react";
import type {
    TeacherTrainingCompliance,
    ComplianceStatus,
} from "@/features/compliance/types/compliance";

// ── Status config ─────────────────────────────────────────────────────────────

const STATUS_CONFIG: Record<
    ComplianceStatus,
    {
        icon: React.ReactNode;
        barColor: string;
        cardBorder: string;
        badgeBg: string;
        badgeBorder: string;
        badgeText: string;
        badgeDot: string;
        badgeLabel: string;
        hintBg: string;
        hintBorder: string;
        hintText: string;
    }
> = {
    COMPLIANT: {
        icon: <ShieldCheck className="h-4 w-4 text-emerald-400" />,
        barColor: "rgba(16, 185, 129, 0.5)",
        cardBorder: "rgba(16, 185, 129, 0.18)",
        badgeBg: "rgba(16, 185, 129, 0.1)",
        badgeBorder: "rgba(16, 185, 129, 0.3)",
        badgeText: "rgb(52, 211, 153)",
        badgeDot: "rgb(52, 211, 153)",
        badgeLabel: "Compliant",
        hintBg: "rgba(16, 185, 129, 0.06)",
        hintBorder: "rgba(16, 185, 129, 0.18)",
        hintText: "rgb(167, 243, 208)",
    },
    AT_RISK: {
        icon: <ShieldAlert className="h-4 w-4 text-amber-400" />,
        barColor: "rgba(245, 158, 11, 0.55)",
        cardBorder: "rgba(245, 158, 11, 0.18)",
        badgeBg: "rgba(245, 158, 11, 0.1)",
        badgeBorder: "rgba(245, 158, 11, 0.3)",
        badgeText: "rgb(251, 191, 36)",
        badgeDot: "rgb(251, 191, 36)",
        badgeLabel: "At Risk",
        hintBg: "rgba(245, 158, 11, 0.06)",
        hintBorder: "rgba(245, 158, 11, 0.18)",
        hintText: "rgb(253, 230, 138)",
    },
    NON_COMPLIANT: {
        icon: <ShieldX className="h-4 w-4 text-rose-400" />,
        barColor: "rgba(244, 63, 94, 0.5)",
        cardBorder: "rgba(244, 63, 94, 0.18)",
        badgeBg: "rgba(244, 63, 94, 0.1)",
        badgeBorder: "rgba(244, 63, 94, 0.3)",
        badgeText: "rgb(251, 113, 133)",
        badgeDot: "rgb(251, 113, 133)",
        badgeLabel: "Non-Compliant",
        hintBg: "rgba(244, 63, 94, 0.06)",
        hintBorder: "rgba(244, 63, 94, 0.18)",
        hintText: "rgb(254, 205, 211)",
    },
};

// ── Stat cell ─────────────────────────────────────────────────────────────────

function StatCell({
    value,
    label,
    color,
}: {
    value: string;
    label: string;
    color: string;
}) {
    return (
        <div className="flex flex-col items-center justify-center gap-1 rounded-lg border border-white/8 bg-white/[0.03] px-3 py-3.5">
            <span
                className="text-2xl font-bold tabular-nums leading-none"
                style={{ color }}
            >
                {value}
            </span>
            <span className="text-[10px] uppercase tracking-widest text-muted-foreground font-semibold">
                {label}
            </span>
        </div>
    );
}

// ── Main component ────────────────────────────────────────────────────────────

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
                        <ShieldX className="h-4 w-4 text-muted-foreground" />
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
    const cfg = STATUS_CONFIG[status];

    const percent =
        compliance.required_hours > 0
            ? Math.min(
                  (compliance.total_hours / compliance.required_hours) * 100,
                  100,
              )
            : 100;

    // Completed: green when met, plain foreground when not — no amber scream
    const completedColor =
        compliance.total_hours >= compliance.required_hours
            ? "rgb(52, 211, 153)"
            : "hsl(var(--foreground))";

    // Required: always muted — it's just a fixed reference number
    const requiredColor = "hsl(var(--muted-foreground))";

    // Remaining: green when zero, status tint when still owed
    const remainingColor =
        compliance.remaining_hours <= 0 ? "rgb(52, 211, 153)" : cfg.badgeText;

    return (
        <Card
            className="border bg-card"
            style={{ borderColor: cfg.cardBorder }}
        >
            {/* ── Header ── */}
            <CardHeader className="pb-3">
                <div className="flex items-center justify-between gap-2">
                    <CardTitle className="text-sm font-semibold flex items-center gap-2 min-w-0">
                        <span className="shrink-0">{cfg.icon}</span>
                        <span className="leading-snug truncate">
                            Training Compliance — {schoolYear}
                        </span>
                    </CardTitle>

                    {/* Inline status badge — matches your pill pattern */}
                    <span
                        className="inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[11px] font-semibold shrink-0"
                        style={{
                            backgroundColor: cfg.badgeBg,
                            borderColor: cfg.badgeBorder,
                            color: cfg.badgeText,
                        }}
                    >
                        <span
                            className="h-1.5 w-1.5 rounded-full shrink-0"
                            style={{ backgroundColor: cfg.badgeDot }}
                        />
                        {cfg.badgeLabel}
                    </span>
                </div>
            </CardHeader>

            <CardContent className="space-y-4">
                {/* ── Progress bar ── */}
                <div className="space-y-1.5">
                    <div className="flex justify-between text-[11px] text-muted-foreground">
                        <span className="tabular-nums">
                            {compliance.total_hours}h completed
                        </span>
                        <span className="tabular-nums">
                            {compliance.required_hours}h required
                        </span>
                    </div>
                    <div
                        className="h-1.5 w-full rounded-full overflow-hidden"
                        style={{ backgroundColor: "rgba(255,255,255,0.06)" }}
                    >
                        <div
                            className="h-full rounded-full transition-all duration-700 ease-out"
                            style={{
                                width: `${percent}%`,
                                backgroundColor: cfg.barColor,
                            }}
                        />
                    </div>
                    <p className="text-[11px] text-muted-foreground text-right tabular-nums">
                        {Math.round(percent)}% of requirement met
                    </p>
                </div>

                {/* ── Stat cells — all three consistent ── */}
                <div className="grid grid-cols-3 gap-2">
                    <StatCell
                        value={`${compliance.total_hours}h`}
                        label="Completed"
                        color={completedColor}
                    />
                    <StatCell
                        value={`${compliance.required_hours}h`}
                        label="Required"
                        color={requiredColor}
                    />
                    <StatCell
                        value={`${compliance.remaining_hours}h`}
                        label="Remaining"
                        color={remainingColor}
                    />
                </div>

                {/* ── Hint banner — only when not compliant ── */}
                {status !== "COMPLIANT" && (
                    <div
                        className="flex items-start gap-2.5 px-3 py-2.5 rounded-lg border text-[13px]"
                        style={{
                            backgroundColor: cfg.hintBg,
                            borderColor: cfg.hintBorder,
                            color: cfg.hintText,
                        }}
                    >
                        <Clock className="h-3.5 w-3.5 mt-0.5 shrink-0 opacity-60" />
                        <span>
                            {status === "AT_RISK"
                                ? `You're close — ${compliance.remaining_hours} more hour${compliance.remaining_hours !== 1 ? "s" : ""} to stay compliant.`
                                : `You need ${compliance.remaining_hours} more hour${compliance.remaining_hours !== 1 ? "s" : ""} to meet the requirement.`}
                        </span>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
