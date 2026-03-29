"use client";

import React, { useMemo, useState, useRef, useEffect } from "react";

// ── Constants ──────────────────────────────────────────────────────────────────

export const MONTHS = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December",
] as const;

export const MONTHS_SHORT = [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
] as const;

export const DAYS_SHORT = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"] as const;

export const YEAR_RANGE_BACK = 10;
export const YEAR_RANGE_FORWARD = 5;

// ── Date helpers ───────────────────────────────────────────────────────────────

export function pad(n: number) {
    return n < 10 ? `0${n}` : String(n);
}

export function localKey(y: number, m: number, d: number) {
    return `${y}-${pad(m + 1)}-${pad(d)}`;
}

export function dateToKey(d: Date) {
    return localKey(d.getFullYear(), d.getMonth(), d.getDate());
}

export function parseDateOnlyToLocal(s: string): Date | null {
    const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(s);
    if (!match) return null;
    const d = new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]));
    return isNaN(d.getTime()) ? null : d;
}

export function formatDisplayDate(key: string) {
    const [y, m, d] = key.split("-");
    return `${MONTHS[Number(m) - 1]} ${Number(d)}, ${y}`;
}

// ── useDarkMode ────────────────────────────────────────────────────────────────

/** Reactively tracks whether the `dark` class is present on `<html>`. */
export function useDarkMode(): boolean {
    const [isDark, setIsDark] = React.useState(
        () => typeof document !== "undefined" && document.documentElement.classList.contains("dark"),
    );
    React.useEffect(() => {
        const check = () => setIsDark(document.documentElement.classList.contains("dark"));
        const observer = new MutationObserver(check);
        observer.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
        return () => observer.disconnect();
    }, []);
    return isDark;
}

// ── useCalendarEvents ──────────────────────────────────────────────────────────

export interface BaseCalendarEvent {
    id: string;
    start: string;
    end?: string | null;
}

/**
 * Core calendar data hook: builds the `byDay` map, computes the multi-day
 * highlight range, and auto-selects the lone event on a day.
 */
export function useCalendarEvents<T extends BaseCalendarEvent>(
    events: T[],
    selectedKey: string,
    todayKey: string,
) {
    const eventIds = events.map((e) => e.id).join(",");
    // eslint-disable-next-line react-hooks/exhaustive-deps
    const stableEvents = useMemo(() => events, [eventIds]);

    const [selectedEventId, setSelectedEventId] = useState<string | null>(null);

    const byDay = useMemo(() => {
        const map = new Map<string, T[]>();
        for (const e of stableEvents) {
            const d = parseDateOnlyToLocal(e.start);
            if (!d) continue;
            const key = dateToKey(d);
            map.set(key, [...(map.get(key) ?? []), e]);
        }
        return map;
    }, [stableEvents]);

    const { highlightRange, rangeStart, rangeEnd, isRangeUpcoming } = useMemo(() => {
        const empty = { highlightRange: new Set<string>(), rangeStart: null, rangeEnd: null, isRangeUpcoming: false };
        if (!selectedEventId) return empty;
        const event = stableEvents.find((e) => e.id === selectedEventId);
        if (!event?.start) return empty;
        const start = parseDateOnlyToLocal(event.start);
        if (!start) return { ...empty, highlightRange: new Set<string>() };
        const end = event.end ? parseDateOnlyToLocal(event.end) : start;
        const range = new Set<string>();
        const cur = new Date(start);
        while (cur <= (end ?? start)) {
            range.add(dateToKey(cur));
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

    // Auto-select if only one event on the selected day
    const prevKeyRef = useRef<string | null>(null);
    useEffect(() => {
        if (prevKeyRef.current === selectedKey) return;
        prevKeyRef.current = selectedKey;
        const eventsOnDay = byDay.get(selectedKey) ?? [];
        setSelectedEventId(eventsOnDay.length === 1 ? eventsOnDay[0].id : null);
    }, [selectedKey, byDay]);

    return {
        byDay,
        highlightRange,
        rangeStart,
        rangeEnd,
        isRangeUpcoming,
        selectedEventId,
        setSelectedEventId,
        selectedEvents: byDay.get(selectedKey) ?? [],
    };
}

// ── Calendar grid builder ──────────────────────────────────────────────────────

export interface CalendarCell {
    /** Day-of-month number. */
    day: number;
    /** Full year (e.g. 2026). */
    year: number;
    /** 0-based month index. */
    month: number;
    /** `true` for days that belong to the previous or next month. */
    isOutside: boolean;
    /** Pre-computed `YYYY-MM-DD` key for this cell. */
    key: string;
}

/**
 * Builds a 6-row × 7-column grid of calendar cells for the given month.
 * Outside days (trailing from the previous month, leading from the next) are
 * included so the grid is always complete — matching the user calendar's
 * `showOutsideDays` behaviour from shadcn.
 */
export function buildCalendarCells(viewYear: number, viewMonth: number): CalendarCell[] {
    const firstDayOfWeek = new Date(viewYear, viewMonth, 1).getDay();
    const daysInMonth    = new Date(viewYear, viewMonth + 1, 0).getDate();

    // Previous month
    const prevMonth = viewMonth === 0 ? 11 : viewMonth - 1;
    const prevYear  = viewMonth === 0 ? viewYear - 1 : viewYear;
    const daysInPrevMonth = new Date(prevYear, prevMonth + 1, 0).getDate();

    // Next month
    const nextMonth = viewMonth === 11 ? 0 : viewMonth + 1;
    const nextYear  = viewMonth === 11 ? viewYear + 1 : viewYear;

    const cells: CalendarCell[] = [];

    // Trailing days from previous month
    for (let i = firstDayOfWeek - 1; i >= 0; i--) {
        const day = daysInPrevMonth - i;
        cells.push({ day, year: prevYear, month: prevMonth, isOutside: true, key: localKey(prevYear, prevMonth, day) });
    }

    // Current month days
    for (let day = 1; day <= daysInMonth; day++) {
        cells.push({ day, year: viewYear, month: viewMonth, isOutside: false, key: localKey(viewYear, viewMonth, day) });
    }

    // Leading days from next month to complete the last row
    let nextDay = 1;
    while (cells.length % 7 !== 0) {
        cells.push({ day: nextDay, year: nextYear, month: nextMonth, isOutside: true, key: localKey(nextYear, nextMonth, nextDay) });
        nextDay++;
    }

    return cells;
}

// ── Day cell styling ───────────────────────────────────────────────────────────

/** Tailwind class for outside-month day buttons (grayed out, same in both calendars). */
export const OUTSIDE_DAY_BTN_CLS =
    "relative flex h-10 w-10 flex-col items-center justify-center rounded-full text-sm text-muted-foreground/30 hover:text-muted-foreground/60 hover:bg-accent transition-colors";

interface DayCellStyleOptions {
    key: string;
    todayKey: string;
    selectedKey: string;
    rangeStart: string | null;
    rangeEnd: string | null;
    highlightRange: Set<string>;
    isRangeUpcoming: boolean;
    isDark: boolean;
    hasEvent: boolean;
}

/** Inline style for the range band that spans multi-day events. */
export function getDayCellBandStyle(
    opts: Pick<DayCellStyleOptions, "key" | "rangeStart" | "rangeEnd" | "highlightRange" | "isRangeUpcoming" | "isDark">,
): React.CSSProperties {
    const { key, rangeStart, rangeEnd, highlightRange, isRangeUpcoming, isDark } = opts;
    const isStart = !!rangeStart && key === rangeStart;
    const isEnd = !!rangeEnd && key === rangeEnd && rangeEnd !== rangeStart;
    const isIn = highlightRange.has(key) && !isStart && !isEnd;
    const rgb = isRangeUpcoming ? "245,158,11" : "59,130,246";
    const a = isDark ? "0.45" : "0.60";
    if (isStart && isEnd) return {};
    if (isStart) return { background: `linear-gradient(to right, transparent 50%, rgba(${rgb},${a}) 50%)` };
    if (isEnd)   return { background: `linear-gradient(to left, transparent 50%, rgba(${rgb},${a}) 50%)` };
    if (isIn)    return { background: `rgba(${rgb},${a})` };
    return {};
}

/** Tailwind class string for the circular day button. */
export function getDayCellButtonClass(opts: DayCellStyleOptions): string {
    const { key, todayKey, selectedKey, rangeStart, rangeEnd, highlightRange, isRangeUpcoming, isDark, hasEvent } = opts;
    const isStart = !!rangeStart && key === rangeStart;
    const isEnd = !!rangeEnd && key === rangeEnd && rangeEnd !== rangeStart;
    const isIn = highlightRange.has(key) && !isStart && !isEnd;
    const base = "relative flex h-10 w-10 flex-col items-center justify-center rounded-full text-sm transition-colors";
    if (isStart || isEnd) return `${base} ${isRangeUpcoming ? "bg-amber-500 text-white font-semibold shadow-sm" : "bg-blue-500 text-white font-semibold shadow-sm"}`;
    if (isIn) return `${base} ${isRangeUpcoming ? isDark ? "text-amber-300 font-medium hover:bg-amber-500/30" : "text-amber-100 hover:bg-amber-500/30" : isDark ? "text-blue-300 font-medium hover:bg-blue-500/30" : "text-blue-100 hover:bg-blue-500/30"}`;
    if (key === selectedKey) return `${base} bg-blue-500/20 text-blue-300 font-semibold shadow-sm`;
    if (key === todayKey) return `${base} ${isDark ? "border border-blue-500/50 text-blue-300 font-semibold hover:bg-accent" : "border border-blue-500/80 text-blue-500/80 font-semibold hover:bg-accent"}`;
    if (hasEvent) return `${base} font-semibold hover:bg-accent`;
    return `${base} hover:bg-accent text-foreground/80`;
}

/** Tailwind class for the event-indicator dot at the bottom of a day cell. */
export function getDotClass(key: string, todayKey: string, isActiveCell: boolean) {
    if (isActiveCell) return "bg-white/50";
    return key > todayKey ? "bg-amber-400/70" : "bg-blue-400/70";
}

/** Tailwind class for the count bubble on days with multiple events. */
export function getCountBubbleClass(key: string, todayKey: string, isDark: boolean) {
    return key > todayKey
        ? isDark ? "bg-amber-500 text-white" : "bg-amber-500/80 text-white"
        : isDark ? "bg-blue-500 text-white" : "bg-blue-500/80 text-white";
}

// ── Event type styles ──────────────────────────────────────────────────────────

export type EventType = "seminar" | "workshop" | "webinar" | "conference" | "training";

export function normaliseEventType(raw: string | null | undefined): EventType {
    switch ((raw ?? "").toLowerCase()) {
        case "seminar":    return "seminar";
        case "workshop":   return "workshop";
        case "webinar":    return "webinar";
        case "conference": return "conference";
        default:           return "training";
    }
}

/** Returns all colour strings for a given raw event type. */
export function getEventTypeStyles(raw: string | null | undefined) {
    const type = normaliseEventType(raw);
    const map = {
        seminar:    { border: "border-l-4 border-l-violet-500/60", ring: "ring-1 ring-violet-500/40", stripe: "bg-violet-400/50", countBubble: "bg-violet-500/10 border-violet-500/20 text-violet-400" },
        workshop:   { border: "border-l-4 border-l-amber-500/60",  ring: "ring-1 ring-amber-500/40",  stripe: "bg-amber-400/50",  countBubble: "bg-amber-500/10 border-amber-500/20 text-amber-400" },
        webinar:    { border: "border-l-4 border-l-sky-500/60",    ring: "ring-1 ring-sky-500/40",    stripe: "bg-sky-400/50",    countBubble: "bg-sky-500/10 border-sky-500/20 text-sky-400" },
        conference: { border: "border-l-4 border-l-pink-500/60",   ring: "ring-1 ring-pink-500/40",   stripe: "bg-pink-400/50",   countBubble: "bg-pink-500/10 border-pink-500/20 text-pink-400" },
        training:   { border: "border-l-4 border-l-teal-500/60",   ring: "ring-1 ring-teal-500/40",   stripe: "bg-teal-400/50",   countBubble: "bg-teal-500/10 border-teal-500/20 text-teal-400" },
    };
    return { type, ...map[type] };
}