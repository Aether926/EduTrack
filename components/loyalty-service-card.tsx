"use client";

import React from "react";
import { Heart, CalendarDays, ChevronRight } from "lucide-react";

// ── Types ────────────────────────────────────────────────────────────────────

interface LoyaltyCardProps {
    /** The teacher's original appointment date (ISO string or Date) */
    dateOfOriginalAppointment: string | Date | null | undefined;
}

// ── Loyalty math ─────────────────────────────────────────────────────────────

/**
 * Given the original appointment date, returns:
 *  - totalYears        : full years served so far
 *  - milestone         : the NEXT loyalty milestone (10, 15, 20, 25, …)
 *  - milestoneDate     : the exact Date of that milestone
 *  - daysRemaining     : calendar days from today to milestone
 *  - yearsRemaining    : whole years component of the countdown
 *  - monthsRemaining   : months component of the countdown
 *  - daysRemainingPart : days component of the countdown
 *  - pct               : 0-100 progress into the current interval
 *  - intervalLabel     : e.g. "10-year milestone" or "15-year milestone"
 *  - intervalStart     : Date the current interval started
 *  - intervalEnd       : Date the current interval ends (= milestoneDate)
 */
function computeLoyalty(raw: string | Date | null | undefined) {
    if (!raw) return null;

    const start = new Date(raw);
    if (isNaN(start.getTime())) return null;

    const today = new Date();

    // Full years from start to today
    let totalYears = today.getFullYear() - start.getFullYear();
    const m = today.getMonth() - start.getMonth();
    const d = today.getDate() - start.getDate();
    if (m < 0 || (m === 0 && d < 0)) totalYears--;

    // Determine current interval [intervalStart, milestone)
    // First milestone at 10 years; every 5 years after that
    let intervalStartYear: number;
    let milestoneYear: number;

    if (totalYears < 10) {
        intervalStartYear = 0;
        milestoneYear = 10;
    } else {
        // how many complete 5-year blocks beyond 10?
        const blocks = Math.floor((totalYears - 10) / 5);
        intervalStartYear = 10 + blocks * 5;
        milestoneYear = intervalStartYear + 5;
    }

    const intervalStart = new Date(start);
    intervalStart.setFullYear(start.getFullYear() + intervalStartYear);

    const milestoneDate = new Date(start);
    milestoneDate.setFullYear(start.getFullYear() + milestoneYear);

    // Progress percentage within the interval
    const intervalMs = milestoneDate.getTime() - intervalStart.getTime();
    const elapsedMs = today.getTime() - intervalStart.getTime();
    const pct = Math.min(Math.max((elapsedMs / intervalMs) * 100, 0), 100);

    // Countdown breakdown
    const msRemaining = milestoneDate.getTime() - today.getTime();
    const daysRemaining = Math.max(0, Math.ceil(msRemaining / 86_400_000));

    // y / m / d breakdown for countdown
    let yr = milestoneDate.getFullYear() - today.getFullYear();
    let mo = milestoneDate.getMonth() - today.getMonth();
    let dy = milestoneDate.getDate() - today.getDate();
    if (dy < 0) {
        mo--;
        dy += 30;
    }
    if (mo < 0) {
        yr--;
        mo += 12;
    }

    return {
        totalYears,
        milestone: milestoneYear,
        milestoneDate,
        daysRemaining,
        yearsRemaining: yr,
        monthsRemaining: mo,
        daysRemainingPart: dy,
        pct,
        intervalLabel: `${milestoneYear}-year milestone`,
        intervalStart,
    };
}

function fmt(date: Date) {
    return date.toLocaleDateString("en-PH", {
        year: "numeric",
        month: "short",
        day: "numeric",
    });
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function LoyaltyServiceCard({
    dateOfOriginalAppointment,
}: LoyaltyCardProps) {
    const loyalty = computeLoyalty(dateOfOriginalAppointment);

    return (
        <div className="relative overflow-hidden rounded-lg border border-rose-500/20 bg-rose-500/8 px-4 py-3.5">
            {/* Gradient wash */}
            <div className="absolute inset-0 bg-gradient-to-r from-rose-500/10 to-transparent pointer-events-none" />

            <div className="relative space-y-3">
                {/* Row 1 — label + countdown */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-4">
                    <div className="flex items-center gap-2.5 min-w-0">
                        <div className="rounded-md border border-rose-500/20 bg-rose-500/10 p-1.5 shrink-0">
                            <Heart className="h-3.5 w-3.5 text-rose-400" />
                        </div>
                        <div className="min-w-0">
                            <p className="text-[11px] font-semibold text-rose-400/80 uppercase tracking-widest">
                                Loyalty Award
                            </p>
                            <p className="text-[11px] text-muted-foreground mt-0.5">
                                {loyalty
                                    ? `Next: ${loyalty.milestone}-year milestone`
                                    : "No appointment date set"}
                            </p>
                        </div>
                    </div>

                    {loyalty ? (
                        <div className="sm:text-right shrink-0 pl-9 sm:pl-0">
                            {loyalty.daysRemaining === 0 ? (
                                <p className="text-2xl font-bold text-rose-400 leading-tight">
                                    Eligible!
                                </p>
                            ) : (
                                <>
                                    <p className="text-2xl font-bold text-foreground tabular-nums leading-tight">
                                        {loyalty.yearsRemaining}y{" "}
                                        {loyalty.monthsRemaining}m{" "}
                                        {loyalty.daysRemainingPart}d
                                    </p>
                                    <p className="text-[10px] text-muted-foreground flex items-center sm:justify-end gap-1 mt-0.5">
                                        <CalendarDays
                                            size={9}
                                            className="shrink-0"
                                        />
                                        remaining
                                    </p>
                                </>
                            )}
                        </div>
                    ) : (
                        <div className="text-[11px] text-muted-foreground italic pl-9 sm:pl-0">
                            —
                        </div>
                    )}
                </div>

                {/* Row 2 — progress bar */}
                {loyalty && (
                    <div className="space-y-1.5">
                        {/* Bar */}
                        <div className="w-full h-1.5 rounded-full bg-muted/40 overflow-hidden">
                            <div
                                className="h-full rounded-full bg-rose-500 transition-all duration-700"
                                style={{ width: `${100 - loyalty.pct}%` }}
                                /* inverted: full bar = just started, empty = reached milestone */
                            />
                        </div>

                        {/* Date stamps */}
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                                <span className="font-medium text-rose-400/70">
                                    {loyalty.milestone === 10
                                        ? "Appointment"
                                        : `${loyalty.milestone - 5}yr`}
                                </span>
                                <span>{fmt(loyalty.intervalStart)}</span>
                            </div>
                            <ChevronRight className="h-3 w-3 text-muted-foreground/40 shrink-0" />
                            <div className="flex items-center gap-1 text-[10px] text-muted-foreground text-right">
                                <span>{fmt(loyalty.milestoneDate)}</span>
                                <span className="font-medium text-rose-400/70">
                                    {loyalty.milestone}yr
                                </span>
                            </div>
                        </div>

                        {/* Years served badge */}
                        <p className="text-[10px] text-muted-foreground text-center">
                            <span className="font-semibold text-foreground/60">
                                {loyalty.totalYears}
                            </span>{" "}
                            total years in DepEd
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}
