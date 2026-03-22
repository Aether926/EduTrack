"use client";

import React, { useMemo, useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    ChevronLeft,
    ChevronRight,
    ChevronUp,
    ChevronDown,
    CalendarDays,
} from "lucide-react";
import type { CalendarEvent } from "@/lib/database/calendar";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { StatusBadge } from "@/components/ui-elements/badges";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

// ── Constants ──────────────────────────────────────────────────────────────────

const DAYS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];
const MONTHS = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
];
const MONTHS_SHORT = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
];

const YEAR_RANGE_BACK = 10;
const YEAR_RANGE_FORWARD = 5;

// ── Picker overlay ─────────────────────────────────────────────────────────────

function PickerOverlay({
    viewYear,
    viewMonth,
    pickerYear,
    today,
    setPickerYear,
    selectMonthYear,
}: {
    viewYear: number;
    viewMonth: number;
    pickerYear: number;
    today: Date;
    setPickerYear: React.Dispatch<React.SetStateAction<number>>;
    selectMonthYear: (month: number) => void;
}) {
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
        if (el) el.scrollIntoView({ block: "center", behavior: "instant" });
    }, [pickerYear]);

    return (
        <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.15 }}
            className="absolute inset-x-0 top-[2.75rem] z-20 mx-3 rounded-lg border bg-card shadow-lg p-3"
        >
            <div className="flex gap-3">
                {/* Year column — scrollable */}
                <div className="flex flex-col gap-0.5 w-16 shrink-0">
                    <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide mb-1 text-center">
                        Year
                    </p>
                    <div
                        ref={yearListRef}
                        className="overflow-y-auto max-h-[168px] flex flex-col gap-0.5"
                        style={{ scrollbarWidth: "none" }}
                    >
                        {years.map((y) => {
                            const isPickerYear = y === pickerYear;
                            const isViewYear = y === viewYear;
                            const isTodayYear = y === currentYear;
                            return (
                                <button
                                    key={y}
                                    data-year={y}
                                    onClick={() => setPickerYear(y)}
                                    className={[
                                        "rounded-md py-1.5 text-sm w-full transition-colors",
                                        isPickerYear
                                            ? "bg-blue-500/20 text-blue-300 font-semibold"
                                            : isViewYear
                                              ? "bg-muted/50 text-foreground font-semibold"
                                              : isTodayYear
                                                ? "border border-blue-500/30 text-blue-300 hover:bg-accent"
                                                : "hover:bg-accent text-foreground/80",
                                    ].join(" ")}
                                >
                                    {y}
                                </button>
                            );
                        })}
                    </div>
                </div>
                {/* Divider */}
                <div className="w-px bg-border/40 self-stretch" />
                {/* Month grid */}
                <div className="flex-1">
                    <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide mb-1 text-center">
                        Month
                    </p>
                    <div className="grid grid-cols-3 gap-1">
                        {MONTHS_SHORT.map((m, i) => {
                            const isCurrent =
                                i === viewMonth && pickerYear === viewYear;
                            const isNow =
                                i === today.getMonth() &&
                                pickerYear === today.getFullYear();
                            return (
                                <button
                                    key={m}
                                    onClick={() => selectMonthYear(i)}
                                    className={[
                                        "rounded-md py-2 text-sm transition-colors",
                                        isCurrent
                                            ? "bg-blue-500/20 text-blue-300 font-semibold"
                                            : isNow
                                              ? "border border-amber-500/40 text-amber-300 font-semibold hover:bg-accent"
                                              : "hover:bg-accent text-foreground/80",
                                    ].join(" ")}
                                >
                                    {m}
                                </button>
                            );
                        })}
                    </div>
                </div>
            </div>
        </motion.div>
    );
}

// ── Helpers ────────────────────────────────────────────────────────────────────

function pad(n: number) {
    return n < 10 ? `0${n}` : String(n);
}
function localKey(y: number, m: number, d: number) {
    return `${y}-${pad(m + 1)}-${pad(d)}`;
}
function parseDateOnlyToLocal(s: string) {
    const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(s);
    if (!match) return null;
    const d = new Date(
        Number(match[1]),
        Number(match[2]) - 1,
        Number(match[3]),
    );
    return isNaN(d.getTime()) ? null : d;
}
function formatDisplayDate(key: string) {
    const [y, m, d] = key.split("-");
    return `${MONTHS[Number(m) - 1]} ${Number(d)}, ${y}`;
}

// ── Main export ────────────────────────────────────────────────────────────────

export default function TrainingCalendar({
    events,
}: {
    events: CalendarEvent[];
}) {
    const today = new Date();
    const todayKey = localKey(
        today.getFullYear(),
        today.getMonth(),
        today.getDate(),
    );

    // Stable events reference — eventIds is a plain string so exhaustive-deps is satisfied.
    const eventIds = events.map((e) => e.id).join(",");
    // eslint-disable-next-line react-hooks/exhaustive-deps
    const stableEvents = useMemo(() => events, [eventIds]);

    // Auto-select: prefer today if it has events, otherwise nearest upcoming
    // event date, otherwise first event date, otherwise today.
    const defaultSelectedKey = useMemo(() => {
        const keys = stableEvents
            .map((e) => {
                const d = parseDateOnlyToLocal(e.start);
                if (!d) return null;
                return localKey(d.getFullYear(), d.getMonth(), d.getDate());
            })
            .filter(Boolean) as string[];
        const unique = Array.from(new Set(keys)).sort();
        if (unique.includes(todayKey)) return todayKey;
        const upcoming = unique.find((k) => k >= todayKey);
        return upcoming ?? unique[0] ?? todayKey;
    }, [stableEvents, todayKey]);

    const [selectedKey, setSelectedKey] = useState(defaultSelectedKey);
    const [viewYear, setViewYear] = useState(today.getFullYear());
    const [viewMonth, setViewMonth] = useState(today.getMonth());
    const [pickerOpen, setPickerOpen] = useState(false);
    const [pickerYear, setPickerYear] = useState(today.getFullYear());
    const [selectedEventId, setSelectedEventId] = useState<string | null>(null);

    // Detect dark mode (class-based, e.g. next-themes)
    const [isDark, setIsDark] = React.useState(
        () =>
            typeof document !== "undefined" &&
            document.documentElement.classList.contains("dark"),
    );
    React.useEffect(() => {
        const check = () =>
            setIsDark(document.documentElement.classList.contains("dark"));
        const observer = new MutationObserver(check);
        observer.observe(document.documentElement, {
            attributes: true,
            attributeFilter: ["class"],
        });
        return () => observer.disconnect();
    }, []);

    const byDay = useMemo(() => {
        const map = new Map<string, CalendarEvent[]>();
        for (const e of stableEvents) {
            const d = parseDateOnlyToLocal(e.start);
            if (!d) continue;
            const key = localKey(d.getFullYear(), d.getMonth(), d.getDate());
            map.set(key, [...(map.get(key) ?? []), e]);
        }
        return map;
    }, [stableEvents]);

    const { highlightRange, rangeStart, rangeEnd, isRangeUpcoming } =
        useMemo(() => {
            if (!selectedEventId)
                return {
                    highlightRange: new Set<string>(),
                    rangeStart: null,
                    rangeEnd: null,
                    isRangeUpcoming: false,
                };
            const event = stableEvents.find((e) => e.id === selectedEventId);
            if (!event?.start)
                return {
                    highlightRange: new Set<string>(),
                    rangeStart: null,
                    rangeEnd: null,
                    isRangeUpcoming: false,
                };
            const range = new Set<string>();
            const start = parseDateOnlyToLocal(event.start);
            const end = event.end ? parseDateOnlyToLocal(event.end) : start;
            if (!start)
                return {
                    highlightRange: range,
                    rangeStart: null,
                    rangeEnd: null,
                    isRangeUpcoming: false,
                };
            const cur = new Date(start);
            const last = end ?? start;
            while (cur <= last) {
                range.add(
                    localKey(cur.getFullYear(), cur.getMonth(), cur.getDate()),
                );
                cur.setDate(cur.getDate() + 1);
            }
            const sorted = Array.from(range).sort();
            return {
                highlightRange: range,
                rangeStart: sorted[0] ?? null,
                rangeEnd: sorted[sorted.length - 1] ?? null,
                isRangeUpcoming: event.start > todayKey,
            };
        }, [selectedEventId, stableEvents, todayKey]);

    const selectedEvents = byDay.get(selectedKey) ?? [];

    // Auto-highlight: 1 event → select it automatically; multiple → let user click.
    const prevSelectedKeyRef = useRef<string | null>(null);
    useEffect(() => {
        if (prevSelectedKeyRef.current === selectedKey) return;
        prevSelectedKeyRef.current = selectedKey;
        const eventsOnDay = byDay.get(selectedKey) ?? [];
        setSelectedEventId(eventsOnDay.length === 1 ? eventsOnDay[0].id : null);
    }, [selectedKey, byDay]);

    const prevMonth = () => {
        if (viewMonth === 0) {
            setViewYear((y) => y - 1);
            setViewMonth(11);
        } else setViewMonth((m) => m - 1);
    };
    const nextMonth = () => {
        if (viewMonth === 11) {
            setViewYear((y) => y + 1);
            setViewMonth(0);
        } else setViewMonth((m) => m + 1);
    };

    const selectMonthYear = (month: number) => {
        setViewMonth(month);
        setViewYear(pickerYear);
        setPickerOpen(false);
    };

    const totalDays = new Date(viewYear, viewMonth + 1, 0).getDate();
    const startDay = new Date(viewYear, viewMonth, 1).getDay();
    const cells: (number | null)[] = [
        ...Array(startDay).fill(null),
        ...Array.from({ length: totalDays }, (_, i) => i + 1),
    ];
    while (cells.length % 7 !== 0) cells.push(null);

    return (
        <Card className="overflow-hidden md:rounded-tr-none md:rounded-br-none md:flex md:flex-col md:max-h-[calc(100vh-8rem)]">
            <CardHeader className="pb-2 pt-4">
                <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1">
                        <CardTitle className="text-base flex items-center gap-2">
                            <CalendarDays className="h-4 w-4 text-blue-400" />
                            Training calendar
                        </CardTitle>
                        <CardDescription className="text-sm">
                            Tap a highlighted date to view your schedule.
                        </CardDescription>
                    </div>
                    <Badge variant="secondary">{events.length} total</Badge>
                </div>
            </CardHeader>

            <CardContent
                className="pt-0 md:overflow-y-auto md:flex-1 md:min-h-0"
                style={{
                    scrollbarWidth: "thin",
                    scrollbarColor: "rgba(255,255,255,0.12) transparent",
                }}
            >
                {/* Calendar */}
                <div className="rounded-lg border bg-muted/20 p-3 relative mb-3">
                    {/* month nav */}
                    <div className="flex items-center justify-between mb-3 px-1">
                        <Button
                            variant="outline"
                            size="icon"
                            className="h-7 w-7"
                            onClick={prevMonth}
                        >
                            <ChevronLeft className="h-4 w-4" />
                        </Button>
                        <button
                            onClick={() => {
                                setPickerYear(viewYear);
                                setPickerOpen((v) => !v);
                            }}
                            className="flex items-center gap-1 rounded-md px-2 py-1 text-sm font-medium hover:bg-accent transition-colors"
                        >
                            {MONTHS[viewMonth]} {viewYear}
                            {pickerOpen ? (
                                <ChevronUp className="h-3.5 w-3.5 text-muted-foreground" />
                            ) : (
                                <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
                            )}
                        </button>
                        <Button
                            variant="outline"
                            size="icon"
                            className="h-7 w-7"
                            onClick={nextMonth}
                        >
                            <ChevronRight className="h-4 w-4" />
                        </Button>
                    </div>

                    {/* month/year picker */}
                    <AnimatePresence>
                        {pickerOpen && (
                            <PickerOverlay
                                viewYear={viewYear}
                                viewMonth={viewMonth}
                                pickerYear={pickerYear}
                                today={today}
                                setPickerYear={setPickerYear}
                                selectMonthYear={selectMonthYear}
                            />
                        )}
                    </AnimatePresence>

                    {/* day headers */}
                    <div className="grid grid-cols-7 mb-1">
                        {DAYS.map((d) => (
                            <div
                                key={d}
                                className="text-center text-[0.7rem] text-muted-foreground py-1"
                            >
                                {d}
                            </div>
                        ))}
                    </div>

                    {/* day cells */}
                    <div className="grid grid-cols-7">
                        {cells.map((day, i) => {
                            if (day === null) return <div key={`e-${i}`} />;
                            const key = localKey(viewYear, viewMonth, day);
                            const isToday = key === todayKey;
                            const isSelected = key === selectedKey;
                            const isRangeStart =
                                !!rangeStart && key === rangeStart;
                            const isRangeEnd =
                                !!rangeEnd &&
                                key === rangeEnd &&
                                rangeEnd !== rangeStart;
                            const isInRange =
                                highlightRange.has(key) &&
                                !isRangeStart &&
                                !isRangeEnd;
                            const eventsOnDay = byDay.get(key);
                            const hasEvent = !!eventsOnDay;
                            const eventCount = eventsOnDay?.length ?? 0;
                            const isPast = key < todayKey;
                            const isSingleDayRange = isRangeStart && isRangeEnd;
                            const bandRgb = isRangeUpcoming
                                ? "245,158,11"
                                : "59,130,246";
                            const bandAlpha = isDark ? "0.45" : "0.60";
                            const bandStyle: React.CSSProperties =
                                isSingleDayRange
                                    ? {}
                                    : isRangeStart
                                      ? {
                                            background: `linear-gradient(to right, transparent 50%, rgba(${bandRgb},${bandAlpha}) 50%)`,
                                        }
                                      : isRangeEnd
                                        ? {
                                              background: `linear-gradient(to left, transparent 50%, rgba(${bandRgb},${bandAlpha}) 50%)`,
                                          }
                                        : isInRange
                                          ? {
                                                background: `rgba(${bandRgb},${bandAlpha})`,
                                            }
                                          : {};

                            return (
                                <div
                                    key={key}
                                    style={bandStyle}
                                    className="relative flex items-center justify-center"
                                >
                                    <button
                                        onClick={() => setSelectedKey(key)}
                                        className={[
                                            "relative flex h-10 w-10 flex-col items-center justify-center rounded-full text-sm transition-colors",
                                            isRangeStart || isRangeEnd
                                                ? isRangeUpcoming
                                                    ? "bg-amber-500 text-white font-semibold shadow-sm"
                                                    : "bg-blue-500 text-white font-semibold shadow-sm"
                                                : isInRange
                                                  ? isRangeUpcoming
                                                      ? isDark
                                                          ? "text-amber-300 font-medium hover:bg-amber-500/30"
                                                          : "text-amber-100 hover:bg-amber-500/30"
                                                      : isDark
                                                        ? "text-blue-300 font-medium hover:bg-blue-500/30"
                                                        : "text-blue-100 hover:bg-blue-500/30"
                                                  : isSelected
                                                    ? "bg-blue-500/20 text-blue-300 font-semibold shadow-sm"
                                                    : isToday
                                                      ? isDark
                                                          ? "border border-blue-500/50 text-blue-300 font-semibold hover:bg-accent"
                                                          : "border border-blue-500/80 text-blue-500/80 font-semibold hover:bg-accent"
                                                      : hasEvent
                                                        ? "font-semibold hover:bg-accent"
                                                        : "hover:bg-accent text-foreground/80",
                                        ]
                                            .filter(Boolean)
                                            .join(" ")}
                                    >
                                        <span className="leading-none">
                                            {day}
                                        </span>
                                        {/* dot — color by worst status on this day */}
                                        {hasEvent &&
                                            (() => {
                                                const statuses = (
                                                    eventsOnDay ?? []
                                                ).map((ev) =>
                                                    ev.status?.toUpperCase(),
                                                );
                                                const results = (
                                                    eventsOnDay ?? []
                                                ).map((ev) =>
                                                    ev.result?.toUpperCase(),
                                                );
                                                const hasRejected =
                                                    statuses.includes(
                                                        "REJECTED",
                                                    );
                                                const hasApproved =
                                                    statuses.some(
                                                        (s, i) =>
                                                            s === "APPROVED" &&
                                                            results[i] ===
                                                                "PASSED",
                                                    );
                                                const dotCls =
                                                    isSelected ||
                                                    isRangeStart ||
                                                    isRangeEnd
                                                        ? "bg-white/50"
                                                        : hasRejected
                                                          ? "bg-rose-400/70"
                                                          : hasApproved
                                                            ? "bg-emerald-400/70"
                                                            : key > todayKey
                                                              ? "bg-amber-400/70"
                                                              : "bg-blue-400/70";
                                                return (
                                                    <span
                                                        className={`absolute bottom-0.5 left-1/2 -translate-x-1/2 h-1 w-1 rounded-full ${dotCls}`}
                                                    />
                                                );
                                            })()}
                                        {/* count / teacher badge */}
                                        {eventCount > 1 &&
                                            !isSelected &&
                                            !isRangeStart &&
                                            !isRangeEnd && (
                                                <span
                                                    className={`absolute -top-0.5 -right-0.5 h-4 min-w-4 rounded-full text-[9px] font-bold flex items-center justify-center px-0.5 ${key > todayKey ? (isDark ? "bg-amber-500 text-white" : "bg-amber-500/80 text-white") : isDark ? "bg-blue-500 text-white" : "bg-blue-500/80 text-white"}`}
                                                >
                                                    {eventCount}
                                                </span>
                                            )}
                                    </button>
                                </div>
                            );
                        })}
                    </div>
                </div>
                {/* Agenda section */}
                <div className="rounded-lg border bg-card mt-3">
                    <div className="flex items-center justify-between px-3 py-3">
                        <div className="min-w-0">
                            <div className="text-sm font-medium truncate">
                                {selectedKey}
                            </div>
                            <div className="text-xs text-muted-foreground">
                                {selectedEvents.length
                                    ? "Scheduled items"
                                    : "No items scheduled"}
                            </div>
                        </div>
                        <Badge variant="outline">{selectedEvents.length}</Badge>
                    </div>
                    <Separator />
                    <div className="p-3">
                        <AnimatePresence mode="wait">
                            {selectedEvents.length === 0 ? (
                                <motion.div
                                    key="empty"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    className="flex flex-col items-center justify-center gap-2 py-10 text-center rounded-lg border border-dashed border-border/40 bg-muted/10"
                                >
                                    <CalendarDays className="h-7 w-7 text-muted-foreground/30" />
                                    <p className="text-sm text-muted-foreground">
                                        No trainings on this date
                                    </p>
                                    <p className="text-xs text-muted-foreground/50">
                                        Select a highlighted date
                                    </p>
                                </motion.div>
                            ) : (
                                <motion.div
                                    key={selectedKey}
                                    initial={{ opacity: 0, y: 4 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="space-y-2 max-h-[340px] overflow-y-auto pr-1"
                                >
                                    {selectedEvents.map((e, idx) => {
                                        const s = e.status?.toUpperCase();
                                        const r = e.result?.toUpperCase();
                                        const isApproved =
                                            s === "APPROVED" && r === "PASSED";
                                        const isPending =
                                            s === "APPROVED" && r === "PENDING";
                                        const isRejected = s === "REJECTED";

                                        const eType = (
                                            e.type ?? ""
                                        ).toLowerCase();
                                        const isSeminar = eType === "seminar";
                                        const isWorkshop = eType === "workshop";
                                        const isWebinar = eType === "webinar";
                                        const isConference =
                                            eType === "conference";

                                        const borderCls = isSeminar
                                            ? "border-l-4 border-l-teal-500/60"
                                            : isWorkshop
                                              ? "border-l-4 border-l-amber-500/60"
                                              : isWebinar
                                                ? "border-l-4 border-l-sky-500/60"
                                                : isConference
                                                  ? "border-l-4 border-l-pink-500/60"
                                                  : "border-l-4 border-l-violet-500/60";

                                        return (
                                            <motion.div
                                                key={e.id}
                                                initial={{ opacity: 0, y: 6 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{
                                                    duration: 0.18,
                                                    delay: Math.min(
                                                        idx * 0.02,
                                                        0.25,
                                                    ),
                                                }}
                                                onClick={() =>
                                                    setSelectedEventId(
                                                        selectedEventId === e.id
                                                            ? null
                                                            : e.id,
                                                    )
                                                }
                                                className={`rounded-lg border overflow-hidden bg-card transition-colors cursor-pointer hover:bg-accent/20 ${borderCls} ${selectedEventId === e.id ? (isSeminar ? "ring-1 ring-teal-500/40" : isWorkshop ? "ring-1 ring-amber-500/40" : isWebinar ? "ring-1 ring-sky-500/40" : isConference ? "ring-1 ring-pink-500/40" : "ring-1 ring-violet-500/40") : ""}`}
                                            >
                                                <div className="p-3">
                                                    <div className="font-medium text-sm text-foreground">
                                                        {e.title}
                                                    </div>
                                                    <div className="flex items-center gap-2 mt-1">
                                                        <StatusBadge
                                                            status={
                                                                isApproved
                                                                    ? "approved"
                                                                    : isPending
                                                                      ? "pending"
                                                                      : isRejected
                                                                        ? "rejected"
                                                                        : "enrolled"
                                                            }
                                                            size="xs"
                                                        />
                                                        <span className="text-xs text-muted-foreground">
                                                            {e.start}
                                                            {e.end
                                                                ? ` → ${e.end}`
                                                                : ""}
                                                        </span>
                                                    </div>
                                                </div>
                                            </motion.div>
                                        );
                                    })}
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
