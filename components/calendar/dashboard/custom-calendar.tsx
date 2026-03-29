"use client";

import { useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { CalendarDays } from "lucide-react";
import {
    MONTHS_SHORT,
    YEAR_RANGE_BACK,
    YEAR_RANGE_FORWARD,
} from "./calendar-shared";

// ── CalendarMonthYearPickerContent ─────────────────────────────────────────────
//
// Inner UI shared by both calendars. The user calendar wraps it in a shadcn
// <Popover>; the admin calendar wraps it in an animated absolute overlay.

interface CalendarMonthYearPickerContentProps {
    viewYear: number;
    viewMonth: number;
    pickerYear: number;
    today: Date;
    setPickerYear: React.Dispatch<React.SetStateAction<number>>;
    selectMonthYear: (month: number) => void;
}

export function CalendarMonthYearPickerContent({
    viewYear,
    viewMonth,
    pickerYear,
    today,
    setPickerYear,
    selectMonthYear,
}: CalendarMonthYearPickerContentProps) {
    const currentYear = today.getFullYear();
    const years = Array.from(
        { length: YEAR_RANGE_BACK + YEAR_RANGE_FORWARD + 1 },
        (_, i) => currentYear - YEAR_RANGE_BACK + i,
    );
    const yearListRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const el = yearListRef.current?.querySelector(
            `[data-year="${pickerYear}"]`,
        ) as HTMLElement | null;
        if (el) {
            const isMobile = window.innerWidth < 640; // sm breakpoint
            el.scrollIntoView({
                inline: isMobile ? "center" : "nearest",
                block: isMobile ? "nearest" : "center",
                behavior: "instant",
            });
        }
    }, [pickerYear]);

    return (
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 p-4">
            {/* ── Year ── */}
            {/* Mobile: full-width label + horizontal scroll row */}
            {/* Desktop: narrow vertical column (original) */}
            <div className="flex flex-col gap-0.5 sm:w-16 sm:shrink-0">
                <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide mb-1 text-center">
                    Year
                </p>
                <div
                    ref={yearListRef}
                    /* mobile: horizontal scroll row | desktop: vertical scroll column */
                    className="flex flex-row gap-1 overflow-x-auto pb-1 sm:pb-0 sm:flex-col sm:gap-0.5 sm:overflow-x-visible sm:overflow-y-auto sm:max-h-[168px]"
                    style={{ scrollbarWidth: "none" }}
                >
                    {years.map((y) => (
                        <button
                            key={y}
                            data-year={y}
                            onClick={() => setPickerYear(y)}
                            className={[
                                "rounded-md py-1.5 text-sm shrink-0 sm:shrink transition-colors",
                                /* mobile needs explicit horizontal padding; desktop fills the column width */
                                "px-2.5 sm:px-0 sm:w-full",
                                y === pickerYear
                                    ? "bg-blue-500/20 text-blue-300 font-semibold"
                                    : y === viewYear
                                      ? "bg-muted/50 text-foreground font-semibold"
                                      : y === currentYear
                                        ? "border border-blue-500/30 text-blue-300 hover:bg-accent"
                                        : "hover:bg-accent text-foreground/80",
                            ].join(" ")}
                        >
                            {y}
                        </button>
                    ))}
                </div>
            </div>

            {/* Divider — horizontal on mobile, vertical on desktop */}
            <div className="h-px w-full bg-border/40 sm:h-auto sm:w-px sm:self-stretch" />

            {/* ── Month ── */}
            {/* Mobile: 4-column grid (4×3) | Desktop: 3-column grid (3×4, original) */}
            <div className="flex-1">
                <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide mb-1 text-center">
                    Month
                </p>
                <div className="grid grid-cols-4 sm:grid-cols-3 gap-1.5 sm:gap-2">
                    {MONTHS_SHORT.map((m, i) => (
                        <button
                            key={m}
                            onClick={() => selectMonthYear(i)}
                            className={[
                                "rounded-md py-2 sm:py-2.5 sm:px-3 text-sm transition-colors",
                                i === viewMonth && pickerYear === viewYear
                                    ? "bg-blue-500/20 text-blue-300 font-semibold"
                                    : i === today.getMonth() &&
                                        pickerYear === today.getFullYear()
                                      ? "border border-blue-500/40 text-blue-300 font-semibold hover:bg-accent"
                                      : "hover:bg-accent text-foreground/80",
                            ].join(" ")}
                        >
                            {m}
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
}

// ── CalendarAgendaEmptyState ───────────────────────────────────────────────────

interface CalendarAgendaEmptyStateProps {
    message?: string;
    hint?: string;
}

export function CalendarAgendaEmptyState({
    message = "No trainings on this date",
    hint = "Select a highlighted date",
}: CalendarAgendaEmptyStateProps) {
    return (
        <motion.div
            key="empty"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center justify-center gap-2 py-10 text-center rounded-lg border border-dashed border-border/40 bg-muted/10"
        >
            <CalendarDays className="h-7 w-7 text-muted-foreground/30" />
            <p className="text-sm text-muted-foreground">{message}</p>
            <p className="text-xs text-muted-foreground/50">{hint}</p>
        </motion.div>
    );
}
