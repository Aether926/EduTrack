"use client";

import { useMemo, useState } from "react";
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
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

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

export default function TrainingCalendar({
    events,
}: {
    events: CalendarEvent[];
}) {
    const today = new Date();
    const [viewYear, setViewYear] = useState(today.getFullYear());
    const [viewMonth, setViewMonth] = useState(today.getMonth());
    const [selectedKey, setSelectedKey] = useState(
        localKey(today.getFullYear(), today.getMonth(), today.getDate()),
    );
    const [pickerOpen, setPickerOpen] = useState(false);
    const [pickerYear, setPickerYear] = useState(today.getFullYear());

    const byDay = useMemo(() => {
        const map = new Map<string, CalendarEvent[]>();
        for (const e of events) {
            const d = parseDateOnlyToLocal(e.start);
            if (!d) continue;
            const key = localKey(d.getFullYear(), d.getMonth(), d.getDate());
            map.set(key, [...(map.get(key) ?? []), e]);
        }
        return map;
    }, [events]);

    const selectedEvents = byDay.get(selectedKey) ?? [];

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
    const todayKey = localKey(
        today.getFullYear(),
        today.getMonth(),
        today.getDate(),
    );

    const cells: (number | null)[] = [
        ...Array(startDay).fill(null),
        ...Array.from({ length: totalDays }, (_, i) => i + 1),
    ];
    while (cells.length % 7 !== 0) cells.push(null);

    return (
        <Card className="overflow-hidden">
            <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1">
                        <CardTitle className="text-base flex items-center gap-2">
                            <CalendarDays className="h-4 w-4 text-orange-400" />
                            Training calendar
                        </CardTitle>
                        <CardDescription className="text-sm">
                            Tap a highlighted date to see your agenda.
                        </CardDescription>
                    </div>
                    <Badge variant="secondary">{events.length} total</Badge>
                </div>
            </CardHeader>

            <CardContent className="pt-0">
                <div className="rounded-lg border bg-muted/20 p-3 relative">
                    {/* Month navigation */}
                    <div className="flex items-center justify-between mb-3 px-1">
                        <Button
                            variant="outline"
                            size="icon"
                            className="h-7 w-7"
                            onClick={prevMonth}
                        >
                            <ChevronLeft className="h-4 w-4" />
                        </Button>

                        {/* Clickable month/year label — opens picker */}
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

                    {/* Month/Year picker overlay */}
                    <AnimatePresence>
                        {pickerOpen && (
                            <motion.div
                                initial={{ opacity: 0, y: -6 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -6 }}
                                transition={{ duration: 0.15 }}
                                className="absolute inset-x-0 top-[2.75rem] z-10 mx-3 rounded-lg border bg-card shadow-lg p-3"
                            >
                                {/* Year selector */}
                                <div className="flex items-center justify-between mb-3">
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-7 w-7"
                                        onClick={() =>
                                            setPickerYear((y) => y - 1)
                                        }
                                    >
                                        <ChevronLeft className="h-4 w-4" />
                                    </Button>
                                    <span className="text-sm font-semibold">
                                        {pickerYear}
                                    </span>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-7 w-7"
                                        onClick={() =>
                                            setPickerYear((y) => y + 1)
                                        }
                                    >
                                        <ChevronRight className="h-4 w-4" />
                                    </Button>
                                </div>

                                {/* Month grid */}
                                <div className="grid grid-cols-4 gap-1">
                                    {MONTHS_SHORT.map((m, i) => {
                                        const isCurrent =
                                            i === viewMonth &&
                                            pickerYear === viewYear;
                                        const isToday =
                                            i === today.getMonth() &&
                                            pickerYear === today.getFullYear();
                                        return (
                                            <button
                                                key={m}
                                                onClick={() =>
                                                    selectMonthYear(i)
                                                }
                                                className={[
                                                    "rounded-md py-2 text-sm transition-colors",
                                                    isCurrent
                                                        ? "bg-orange-600/50 text-orange-100 font-semibold"
                                                        : isToday
                                                          ? "border border-orange-500/40 font-semibold hover:bg-accent"
                                                          : "hover:bg-accent text-foreground",
                                                ].join(" ")}
                                            >
                                                {m}
                                            </button>
                                        );
                                    })}
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Day-of-week headers */}
                    <div className="grid grid-cols-7 mb-1">
                        {DAYS.map((d) => (
                            <div
                                key={d}
                                className="text-center text-[0.72rem] text-muted-foreground py-1"
                            >
                                {d}
                            </div>
                        ))}
                    </div>

                    {/* Day cells */}
                    <div className="grid grid-cols-7 gap-y-1">
                        {cells.map((day, i) => {
                            if (day === null) return <div key={`e-${i}`} />;
                            const key = localKey(viewYear, viewMonth, day);
                            const isToday = key === todayKey;
                            const isSelected = key === selectedKey;
                            const hasEvent = byDay.has(key);

                            return (
                                <button
                                    key={key}
                                    onClick={() => setSelectedKey(key)}
                                    className={[
                                        "relative mx-auto flex h-8 w-8 items-center justify-center rounded-md text-sm transition-colors",
                                        isSelected
                                            ? "bg-orange-600/50 text-orange-100 font-semibold"
                                            : isToday
                                              ? "border border-orange-500/40 font-semibold text-orange-300 hover:bg-accent"
                                              : "hover:bg-accent",
                                        hasEvent && !isSelected
                                            ? "font-semibold"
                                            : "",
                                    ]
                                        .filter(Boolean)
                                        .join(" ")}
                                >
                                    {day}
                                    {hasEvent && (
                                        <span className="absolute bottom-0.5 left-1/2 h-1 w-1 -translate-x-1/2 rounded-full bg-orange-400 opacity-50" />
                                    )}
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Agenda */}
                <div className="mt-3 rounded-lg border bg-card">
                    <div className="flex items-center justify-between px-3 py-3">
                        <div className="min-w-0">
                            <div className="text-sm font-medium truncate">
                                Agenda {selectedKey ? `• ${selectedKey}` : ""}
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
                        {selectedEvents.length === 0 ? (
                            <div className="rounded-md border bg-muted/30 p-4 text-sm text-muted-foreground">
                                No trainings on this date.
                            </div>
                        ) : (
                            <div className="space-y-2">
                                {selectedEvents.map((e, idx) => (
                                    <motion.div
                                        key={e.id}
                                        initial={{ opacity: 0, y: 6 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{
                                            duration: 0.18,
                                            delay: Math.min(idx * 0.02, 0.25),
                                        }}
                                        className="rounded-lg border bg-card p-3 hover:bg-accent/40 transition-colors"
                                    >
                                        <div className="font-medium">
                                            {e.title}
                                        </div>
                                        <div className="mt-1 text-xs text-muted-foreground">
                                            Starts: {e.start}
                                            {e.end ? ` • Ends: ${e.end}` : ""}
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                <div className="mt-3 text-xs text-muted-foreground">
                    Tip: highlighted dates have at least one training.
                </div>
            </CardContent>
        </Card>
    );
}
