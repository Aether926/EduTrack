"use client";

import React, { useState, useMemo } from "react";
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
import { StatusBadge, TypeBadge } from "@/components/ui-elements/badges";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Calendar } from "@/components/ui/calendar";
import type { DayProps } from "react-day-picker";
import {
    MONTHS,
    dateToKey,
    formatDisplayDate,
    getDayCellBandStyle,
    getDayCellButtonClass,
    getCountBubbleClass,
    getEventTypeStyles,
    OUTSIDE_DAY_BTN_CLS,
    useDarkMode,
    useCalendarEvents,
} from "@/components/calendar/dashboard/calendar-shared";
import {
    CalendarMonthYearPickerContent,
    CalendarAgendaEmptyState,
} from "@/components/calendar/dashboard/custom-calendar";

// ── Main export ────────────────────────────────────────────────────────────────

export default function TrainingCalendar({
    events,
}: {
    events: CalendarEvent[];
}) {
    const today = new Date();
    const todayKey = dateToKey(today);
    const isDark = useDarkMode();

    const [selectedDate, setSelectedDate] = useState<Date>(today);
    const selectedKey = dateToKey(selectedDate);

    const [viewMonth, setViewMonth] = useState<Date>(
        new Date(today.getFullYear(), today.getMonth(), 1),
    );
    const viewYear = viewMonth.getFullYear();
    const viewMonthIdx = viewMonth.getMonth();

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

    const selectMonthYear = (month: number) => {
        setViewMonth(new Date(pickerYear, month, 1));
        setPickerOpen(false);
    };

    // ── Custom Day component injected into shadcn Calendar ─────────────────────
    const CustomDay = useMemo(() => {
        return function Day({ day, modifiers }: DayProps) {
            const date = day.date;
            const key = dateToKey(date);

            if (modifiers.outside) {
                const isOutsideRangeStart = !!rangeStart && key === rangeStart;
                const isOutsideRangeEnd =
                    !!rangeEnd && key === rangeEnd && rangeEnd !== rangeStart;
                const isOutsideRangeEdge =
                    isOutsideRangeStart || isOutsideRangeEnd;
                const isOutsideInRange =
                    highlightRange.has(key) && !isOutsideRangeEdge;

                // Same rgba the band uses — so circle and connector are
                // literally the same colour
                const bandRgb = isRangeUpcoming ? "245,158,11" : "59,130,246";
                const bandAlpha = isDark ? "0.45" : "0.60";
                const bandRgba = `rgba(${bandRgb},${bandAlpha})`;

                return (
                    <div
                        style={
                            isOutsideRangeEdge || isOutsideInRange
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
                                setSelectedDate(date);
                                setViewMonth(
                                    new Date(
                                        date.getFullYear(),
                                        date.getMonth(),
                                        1,
                                    ),
                                );
                            }}
                            style={
                                isOutsideRangeEdge
                                    ? { backgroundColor: bandRgba }
                                    : undefined
                            }
                            className={
                                isOutsideRangeEdge
                                    ? "relative flex h-10 w-10 flex-col items-center justify-center rounded-full text-sm font-semibold text-muted-foreground/50 transition-colors"
                                    : OUTSIDE_DAY_BTN_CLS
                            }
                        >
                            <span className="leading-none">
                                {date.getDate()}
                            </span>
                        </button>
                    </div>
                );
            }

            const eventsOnDay = byDay.get(key);
            const hasEvent = !!eventsOnDay;
            const eventCount = eventsOnDay?.length ?? 0;
            const isRangeStartKey = !!rangeStart && key === rangeStart;
            const isRangeEndKey =
                !!rangeEnd && key === rangeEnd && rangeEnd !== rangeStart;
            const isActiveCell =
                key === selectedKey || isRangeStartKey || isRangeEndKey;

            const bandStyle = getDayCellBandStyle({
                key,
                rangeStart,
                rangeEnd,
                highlightRange,
                isRangeUpcoming,
                isDark,
            });
            const btnCls = getDayCellButtonClass({
                key,
                todayKey,
                selectedKey,
                rangeStart,
                rangeEnd,
                highlightRange,
                isRangeUpcoming,
                isDark,
                hasEvent,
            });

            // Dot colour — driven by status/result, unique to the user calendar
            let dotCls = "";
            if (hasEvent) {
                const statuses = (eventsOnDay ?? []).map((ev) =>
                    ev.status?.toUpperCase(),
                );
                const results = (eventsOnDay ?? []).map((ev) =>
                    ev.result?.toUpperCase(),
                );
                const hasRejected = statuses.includes("REJECTED");
                const hasApproved = statuses.some(
                    (s, i) => s === "APPROVED" && results[i] === "PASSED",
                );
                dotCls = isActiveCell
                    ? "bg-white/50"
                    : hasRejected
                      ? "bg-rose-400/70"
                      : hasApproved
                        ? "bg-emerald-400/70"
                        : key > todayKey
                          ? "bg-amber-400/70"
                          : "bg-blue-400/70";
            }

            return (
                <div
                    style={bandStyle}
                    className="relative flex items-center justify-center"
                >
                    <button
                        onClick={() => setSelectedDate(date)}
                        className={btnCls}
                    >
                        <span className="leading-none">{date.getDate()}</span>
                        {hasEvent && (
                            <span
                                className={`absolute bottom-0.5 left-1/2 -translate-x-1/2 h-1 w-1 rounded-full ${dotCls}`}
                            />
                        )}
                        {eventCount > 1 && !isActiveCell && (
                            <span
                                className={`absolute -top-0.5 -right-0.5 h-4 min-w-4 rounded-full text-[9px] font-bold flex items-center justify-center px-0.5 ${getCountBubbleClass(key, todayKey, isDark)}`}
                            >
                                {eventCount}
                            </span>
                        )}
                    </button>
                </div>
            );
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [
        byDay,
        selectedKey,
        rangeStart,
        rangeEnd,
        highlightRange,
        isRangeUpcoming,
        todayKey,
        isDark,
    ]);

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
                    {/* Custom month/year nav */}
                    <div className="flex items-center justify-between mb-3 px-1">
                        <Button
                            variant="outline"
                            size="icon"
                            className="h-7 w-7"
                            onClick={() =>
                                setViewMonth(
                                    new Date(
                                        viewMonthIdx === 0
                                            ? viewYear - 1
                                            : viewYear,
                                        viewMonthIdx === 0
                                            ? 11
                                            : viewMonthIdx - 1,
                                        1,
                                    ),
                                )
                            }
                        >
                            <ChevronLeft className="h-4 w-4" />
                        </Button>

                        <button
                            onClick={() => {
                                if (!pickerOpen) setPickerYear(viewYear);
                                setPickerOpen((v) => !v);
                            }}
                            className="flex items-center gap-1 rounded-md px-2 py-1 text-sm font-medium hover:bg-accent transition-colors"
                        >
                            {MONTHS[viewMonthIdx]} {viewYear}
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
                            onClick={() =>
                                setViewMonth(
                                    new Date(
                                        viewMonthIdx === 11
                                            ? viewYear + 1
                                            : viewYear,
                                        viewMonthIdx === 11
                                            ? 0
                                            : viewMonthIdx + 1,
                                        1,
                                    ),
                                )
                            }
                        >
                            <ChevronRight className="h-4 w-4" />
                        </Button>
                    </div>

                    {/* Month/year picker — inline absolute overlay (same as admin calendar) */}
                    <AnimatePresence>
                        {pickerOpen && (
                            <motion.div
                                initial={{ opacity: 0, y: -6 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -6 }}
                                transition={{ duration: 0.15 }}
                                className="absolute inset-x-0 top-11 z-20 mx-3 rounded-lg border bg-card shadow-lg"
                            >
                                <CalendarMonthYearPickerContent
                                    viewYear={viewYear}
                                    viewMonth={viewMonthIdx}
                                    pickerYear={pickerYear}
                                    today={today}
                                    setPickerYear={setPickerYear}
                                    selectMonthYear={selectMonthYear}
                                />
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* shadcn Calendar — nav + caption hidden, Day fully overridden */}
                    <Calendar
                        mode="single"
                        selected={selectedDate}
                        onSelect={(date) => date && setSelectedDate(date)}
                        month={viewMonth}
                        onMonthChange={setViewMonth}
                        showOutsideDays={true}
                        className="p-0 w-full"
                        components={{
                            Day: CustomDay,
                            Nav: () => <></>,
                            MonthCaption: () => <></>,
                        }}
                        classNames={{
                            months: "w-full",
                            month: "w-full",
                            month_caption: "hidden",
                            nav: "hidden",
                            caption_label: "hidden",
                            month_grid: "w-full border-collapse",
                            weekdays: "grid grid-cols-7 mb-1",
                            weekday:
                                "text-center text-[0.7rem] text-muted-foreground py-1",
                            weeks: "w-full",
                            week: "grid grid-cols-7 w-full",
                            day: "p-0 flex items-center justify-center",
                            day_button: "hidden",
                            selected: "",
                            today: "",
                            outside: "",
                            disabled: "",
                            range_start: "",
                            range_end: "",
                            range_middle: "",
                            hidden: "invisible",
                        }}
                    />
                </div>

                {/* Agenda section */}
                <div className="rounded-lg border bg-card mt-3">
                    <div className="flex items-center justify-between px-3 py-3">
                        <div className="min-w-0">
                            <div className="text-sm font-medium truncate">
                                {formatDisplayDate(selectedKey)}
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
                                <CalendarAgendaEmptyState />
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
                                        const isUpcoming = e.start > todayKey;
                                        const { border, ring } =
                                            getEventTypeStyles(e.type);

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
                                                className={`rounded-lg border overflow-hidden bg-card transition-colors cursor-pointer hover:bg-accent/20 ${border} ${selectedEventId === e.id ? ring : ""}`}
                                            >
                                                <div className="px-4 py-3 flex flex-col gap-2">
                                                    <div>
                                                        <div className="font-medium text-sm text-foreground leading-snug">
                                                            {e.title}
                                                        </div>
                                                        <div className="text-xs text-muted-foreground mt-0.5">
                                                            {e.start}
                                                            {e.end &&
                                                            e.end !== e.start
                                                                ? ` → ${e.end}`
                                                                : ""}
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center justify-end gap-1.5 flex-wrap">
                                                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-muted/50 border border-border/40 text-muted-foreground">
                                                            {isUpcoming
                                                                ? "Upcoming"
                                                                : "Past"}
                                                        </span>
                                                        <TypeBadge
                                                            type={
                                                                e.type ??
                                                                "Training"
                                                            }
                                                            size="xs"
                                                        />
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
