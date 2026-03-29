"use client";

import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    ChevronLeft,
    ChevronRight,
    ChevronUp,
    ChevronDown,
    CalendarDays,
    Users,
    GraduationCap,
} from "lucide-react";
import type { AdminCalendarEvent } from "@/lib/database/calendar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { TypeBadge } from "@/components/ui-elements/badges";
import UserAvatar from "@/components/ui-elements/user-avatar";
import {
    MONTHS,
    DAYS_SHORT,
    dateToKey,
    formatDisplayDate,
    getDayCellBandStyle,
    getDayCellButtonClass,
    getDotClass,
    getCountBubbleClass,
    getEventTypeStyles,
    buildCalendarCells,
    OUTSIDE_DAY_BTN_CLS,
    useDarkMode,
    useCalendarEvents,
} from "@/components/calendar/dashboard/calendar-shared";
import {
    CalendarMonthYearPickerContent,
    CalendarAgendaEmptyState,
} from "@/components/calendar/dashboard/custom-calendar";

// ── Main export ────────────────────────────────────────────────────────────────

export default function AdminTrainingCalendar({
    events = [],
}: {
    events: AdminCalendarEvent[];
}) {
    const today = new Date();
    const todayKey = dateToKey(today);
    const isDark = useDarkMode();

    const [selectedKey, setSelectedKey] = useState(todayKey);
    const [viewYear, setViewYear] = useState(today.getFullYear());
    const [viewMonth, setViewMonth] = useState(today.getMonth());
    const [pickerOpen, setPickerOpen] = useState(false);
    const [pickerYear, setPickerYear] = useState(today.getFullYear());

    const {
        byDay,
        highlightRange,
        rangeStart,
        rangeEnd,
        isRangeUpcoming,
        selectedEventId,
        setSelectedEventId,
        selectedEvents,
    } = useCalendarEvents(events, selectedKey, todayKey);

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
        setSelectedEventId(null);
        setViewMonth(month);
        setViewYear(pickerYear);
        setPickerOpen(false);
    };

    const cells = buildCalendarCells(viewYear, viewMonth);

    return (
        <div className="rounded-xl border border-border/60 bg-card/80 overflow-hidden">
            <div className="h-px w-full bg-border/60" />

            {/* Header */}
            <div className="flex items-center justify-between gap-3 px-5 pt-4 pb-3 border-b border-border/40">
                <div className="flex items-center gap-2">
                    <div className="rounded-lg p-1.5 bg-blue-500/10">
                        <CalendarDays className="h-3.5 w-3.5 text-blue-400" />
                    </div>
                    <div>
                        <p className="text-sm font-semibold">
                            Training Calendar
                        </p>
                        <p className="text-xs text-muted-foreground">
                            Tap a date · tap an event to highlight its range
                        </p>
                    </div>
                </div>
                <Badge variant="secondary" className="shrink-0">
                    {events.length} total
                </Badge>
            </div>

            {/* Body — events left, calendar right */}
            <div className="grid grid-cols-1 lg:grid-cols-[1fr_auto] divide-y lg:divide-y-0 lg:divide-x divide-border/40">
                {/* ── Event panel ── */}
                <div className="p-4 order-2 lg:order-1">
                    <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                            <Users className="h-3.5 w-3.5 text-blue-400" />
                            <span className="text-sm font-semibold">
                                Assigned Teachers
                            </span>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="text-xs text-muted-foreground">
                                {formatDisplayDate(selectedKey)}
                            </span>
                            <Badge
                                variant="outline"
                                className="text-[10px] h-5"
                            >
                                {selectedEvents.length}
                            </Badge>
                        </div>
                    </div>

                    <AnimatePresence mode="wait">
                        {selectedEvents.length === 0 ? (
                            <CalendarAgendaEmptyState />
                        ) : (
                            <motion.div
                                key={selectedKey}
                                initial={{ opacity: 0, y: 4 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="space-y-2 max-h-[340px] overflow-y-auto pr-1"
                            >
                                {selectedEvents.map((e, idx) => {
                                    const isUpcoming = e.start > todayKey;
                                    const { ring, stripe, countBubble } =
                                        getEventTypeStyles(e.type);

                                    return (
                                        <motion.div
                                            key={e.id}
                                            initial={{ opacity: 0, y: 6 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{
                                                duration: 0.15,
                                                delay: Math.min(
                                                    idx * 0.04,
                                                    0.2,
                                                ),
                                            }}
                                            onClick={() =>
                                                setSelectedEventId(
                                                    selectedEventId === e.id
                                                        ? null
                                                        : e.id,
                                                )
                                            }
                                            className={`rounded-lg border bg-background/50 overflow-hidden transition-colors cursor-pointer hover:bg-accent/20 ${selectedEventId === e.id ? ring : ""} ${isUpcoming ? "border-border/50" : "border-border/30 opacity-60"}`}
                                        >
                                            <div className="flex">
                                                <div
                                                    className={`w-1 shrink-0 ${stripe}`}
                                                />
                                                <div className="flex-1 p-3">
                                                    <div className="flex items-start justify-between gap-2">
                                                        <p className="text-sm font-medium leading-snug">
                                                            {e.title}
                                                        </p>
                                                        {/* badges — md+ */}
                                                        <div className="hidden md:flex items-center gap-1.5 shrink-0">
                                                            <TypeBadge
                                                                type={
                                                                    e.type ??
                                                                    "Training"
                                                                }
                                                                size="xs"
                                                            />
                                                            <div
                                                                className={`flex items-center gap-1 rounded-full border px-2 py-0.5 ${countBubble}`}
                                                            >
                                                                <GraduationCap className="h-3 w-3" />
                                                                <span className="text-[10px] font-semibold">
                                                                    {
                                                                        e
                                                                            .teachers
                                                                            .length
                                                                    }
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {/* date + badges row */}
                                                    <div className="flex items-center justify-between gap-2 mt-1">
                                                        <p className="text-[11px] text-muted-foreground">
                                                            {e.start}
                                                            {e.end &&
                                                            e.end !== e.start
                                                                ? ` → ${e.end}`
                                                                : ""}
                                                        </p>
                                                        <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-muted/50 text-muted-foreground">
                                                            {isUpcoming
                                                                ? "Upcoming"
                                                                : "Past"}
                                                        </span>
                                                        {/* badges — mobile */}
                                                        <div className="flex md:hidden items-center gap-1.5 shrink-0">
                                                            <TypeBadge
                                                                type={
                                                                    e.type ??
                                                                    "Training"
                                                                }
                                                                size="xs"
                                                            />
                                                            <div
                                                                className={`flex items-center gap-1 rounded-full border px-2 py-0.5 ${countBubble}`}
                                                            >
                                                                <GraduationCap className="h-3 w-3" />
                                                                <span className="text-[10px] font-semibold">
                                                                    {
                                                                        e
                                                                            .teachers
                                                                            .length
                                                                    }
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {/* Teachers */}
                                                    {e.teachers.length === 0 ? (
                                                        <p className="mt-2 text-xs text-muted-foreground/50 italic">
                                                            No teachers assigned
                                                        </p>
                                                    ) : (
                                                        <div className="mt-2">
                                                            <div className="flex items-center gap-2 mb-1.5">
                                                                <div className="flex gap-0.5 -space-x-1.5">
                                                                    {e.teachers
                                                                        .slice(
                                                                            0,
                                                                            3,
                                                                        )
                                                                        .map(
                                                                            (
                                                                                t,
                                                                            ) => (
                                                                                <UserAvatar
                                                                                    key={
                                                                                        t.id
                                                                                    }
                                                                                    name={
                                                                                        t.name
                                                                                    }
                                                                                    src={
                                                                                        t.avatarUrl
                                                                                    }
                                                                                    className="h-6 w-6 text-[9px]"
                                                                                />
                                                                            ),
                                                                        )}
                                                                    {e.teachers
                                                                        .length >
                                                                        3 && (
                                                                        <div className="h-6 w-6 rounded-full border-2 border-card bg-muted flex items-center justify-center text-[9px] font-bold text-muted-foreground shrink-0">
                                                                            +
                                                                            {e
                                                                                .teachers
                                                                                .length -
                                                                                3}
                                                                        </div>
                                                                    )}
                                                                </div>
                                                                <span className="text-xs text-muted-foreground">
                                                                    {
                                                                        e
                                                                            .teachers
                                                                            .length
                                                                    }{" "}
                                                                    teacher
                                                                    {e.teachers
                                                                        .length !==
                                                                    1
                                                                        ? "s"
                                                                        : ""}
                                                                </span>
                                                            </div>
                                                            <div className="space-y-1">
                                                                {e.teachers.map(
                                                                    (t) => (
                                                                        <div
                                                                            key={
                                                                                t.id
                                                                            }
                                                                            className="flex items-center gap-2"
                                                                        >
                                                                            <UserAvatar
                                                                                name={
                                                                                    t.name
                                                                                }
                                                                                src={
                                                                                    t.avatarUrl
                                                                                }
                                                                                className="h-6 w-6 text-[9px]"
                                                                            />
                                                                            <span className="text-xs text-foreground/70 truncate">
                                                                                {
                                                                                    t.name
                                                                                }
                                                                            </span>
                                                                        </div>
                                                                    ),
                                                                )}
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </motion.div>
                                    );
                                })}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* ── Calendar panel ── */}
                <div className="p-4 order-1 lg:order-2 lg:w-[420px] shrink-0">
                    <div className="rounded-lg border border-border/40 bg-muted/10 p-3 relative">
                        {/* Month nav */}
                        <div className="flex items-center justify-between mb-3 px-1">
                            <Button
                                variant="ghost"
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
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7"
                                onClick={nextMonth}
                            >
                                <ChevronRight className="h-4 w-4" />
                            </Button>
                        </div>

                        {/* Month/year picker — animated overlay */}
                        <AnimatePresence>
                            {pickerOpen && (
                                <motion.div
                                    initial={{ opacity: 0, y: -6 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -6 }}
                                    transition={{ duration: 0.15 }}
                                    className="absolute inset-x-0 top-11 z-20 mx-3 rounded-lg border bg-card shadow-lg p-3"
                                >
                                    <CalendarMonthYearPickerContent
                                        viewYear={viewYear}
                                        viewMonth={viewMonth}
                                        pickerYear={pickerYear}
                                        today={today}
                                        setPickerYear={setPickerYear}
                                        selectMonthYear={selectMonthYear}
                                    />
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* Day headers */}
                        <div className="grid grid-cols-7 mb-1">
                            {DAYS_SHORT.map((d) => (
                                <div
                                    key={d}
                                    className="text-center text-[0.7rem] text-muted-foreground py-1"
                                >
                                    {d}
                                </div>
                            ))}
                        </div>

                        {/* Day cells */}
                        <div className="grid grid-cols-7">
                            {cells.map((cell, i) => {
                                const { day, key, isOutside } = cell;

                                if (isOutside) {
                                    const isOutsideRangeStart =
                                        !!rangeStart && key === rangeStart;
                                    const isOutsideRangeEnd =
                                        !!rangeEnd &&
                                        key === rangeEnd &&
                                        rangeEnd !== rangeStart;
                                    const isOutsideRangeEdge =
                                        isOutsideRangeStart ||
                                        isOutsideRangeEnd;
                                    const isOutsideInRange =
                                        highlightRange.has(key) &&
                                        !isOutsideRangeEdge;

                                    // Same rgba the band uses — so circle and
                                    // connector are literally the same colour
                                    const bandRgb = isRangeUpcoming
                                        ? "245,158,11"
                                        : "59,130,246";
                                    const bandAlpha = isDark ? "0.45" : "0.60";
                                    const bandRgba = `rgba(${bandRgb},${bandAlpha})`;

                                    return (
                                        <div
                                            key={`outside-${i}`}
                                            style={
                                                isOutsideRangeEdge ||
                                                isOutsideInRange
                                                    ? getDayCellBandStyle({
                                                          key,
                                                          rangeStart,
                                                          rangeEnd,
                                                          highlightRange,
                                                          isRangeUpcoming,
                                                          isDark,
                                                      })
                                                    : undefined
                                            }
                                            className="relative flex items-center justify-center"
                                        >
                                            <button
                                                onClick={() => {
                                                    setSelectedKey(key);
                                                    setViewYear(cell.year);
                                                    setViewMonth(cell.month);
                                                }}
                                                style={
                                                    isOutsideRangeEdge
                                                        ? {
                                                              backgroundColor:
                                                                  bandRgba,
                                                          }
                                                        : undefined
                                                }
                                                className={
                                                    isOutsideRangeEdge
                                                        ? "relative flex h-10 w-10 flex-col items-center justify-center rounded-full text-sm font-semibold text-muted-foreground/50 transition-colors"
                                                        : OUTSIDE_DAY_BTN_CLS
                                                }
                                            >
                                                <span className="leading-none">
                                                    {day}
                                                </span>
                                            </button>
                                        </div>
                                    );
                                }

                                const eventsOnDay = byDay.get(key);
                                const hasEvent = !!eventsOnDay;
                                const eventCount = eventsOnDay?.length ?? 0;
                                const isRangeStartKey =
                                    !!rangeStart && key === rangeStart;
                                const isRangeEndKey =
                                    !!rangeEnd &&
                                    key === rangeEnd &&
                                    rangeEnd !== rangeStart;
                                const isActiveCell =
                                    key === selectedKey ||
                                    isRangeStartKey ||
                                    isRangeEndKey;
                                const teacherCount = eventsOnDay
                                    ? new Set(
                                          eventsOnDay.flatMap((e) =>
                                              e.teachers.map((t) => t.id),
                                          ),
                                      ).size
                                    : 0;

                                return (
                                    <div
                                        key={key}
                                        style={getDayCellBandStyle({
                                            key,
                                            rangeStart,
                                            rangeEnd,
                                            highlightRange,
                                            isRangeUpcoming,
                                            isDark,
                                        })}
                                        className="relative flex items-center justify-center"
                                    >
                                        <button
                                            onClick={() => setSelectedKey(key)}
                                            className={getDayCellButtonClass({
                                                key,
                                                todayKey,
                                                selectedKey,
                                                rangeStart,
                                                rangeEnd,
                                                highlightRange,
                                                isRangeUpcoming,
                                                isDark,
                                                hasEvent,
                                            })}
                                        >
                                            <span className="leading-none">
                                                {day}
                                            </span>
                                            {hasEvent && (
                                                <span
                                                    className={`absolute bottom-0.5 left-1/2 -translate-x-1/2 h-1 w-1 rounded-full ${getDotClass(key, todayKey, isActiveCell)}`}
                                                />
                                            )}
                                            {(eventCount > 1 ||
                                                (eventCount === 1 &&
                                                    teacherCount > 0)) &&
                                                !isActiveCell && (
                                                    <span
                                                        className={`absolute -top-0.5 -right-0.5 h-4 min-w-4 rounded-full text-[9px] font-bold flex items-center justify-center px-0.5 ${getCountBubbleClass(key, todayKey, isDark)}`}
                                                    >
                                                        {eventCount > 1
                                                            ? eventCount
                                                            : teacherCount}
                                                    </span>
                                                )}
                                        </button>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    <p className="mt-2 text-[11px] text-muted-foreground px-1">
                        Highlighted dates have trainings. Numbers show enrolled
                        teachers.
                    </p>
                </div>
            </div>
        </div>
    );
}
