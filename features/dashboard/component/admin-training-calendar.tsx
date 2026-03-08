"use client";

import { useMemo, useState } from "react";
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

// ── Avatar colour (by first letter, matching InitialAvatar component) ──────────

const LETTER_COLOR_MAP: { letters: string[]; bg: string; text: string }[] = [
    {
        letters: ["A", "B", "C", "D"],
        bg: "bg-violet-500/20",
        text: "text-violet-300",
    },
    {
        letters: ["E", "F", "G", "H"],
        bg: "bg-blue-500/20",
        text: "text-blue-300",
    },
    {
        letters: ["I", "J", "K", "L"],
        bg: "bg-teal-500/20",
        text: "text-teal-300",
    },
    {
        letters: ["M", "N", "O", "P"],
        bg: "bg-emerald-500/20",
        text: "text-emerald-300",
    },
    {
        letters: ["Q", "R", "S", "T"],
        bg: "bg-orange-500/20",
        text: "text-orange-300",
    },
    { letters: ["U", "V", "W"], bg: "bg-red-500/20", text: "text-red-300" },
    { letters: ["X", "Y", "Z"], bg: "bg-pink-500/20", text: "text-pink-300" },
];
const LETTER_COLORS: Record<string, { bg: string; text: string }> =
    Object.fromEntries(
        LETTER_COLOR_MAP.flatMap(({ letters, bg, text }) =>
            letters.map((l) => [l, { bg, text }]),
        ),
    );
function getAvatarColor(name: string) {
    const first = name.trim()[0]?.toUpperCase() ?? "";
    return (
        LETTER_COLORS[first] ?? {
            bg: "bg-muted",
            text: "text-muted-foreground",
        }
    );
}
function initials(name: string) {
    return name
        .trim()
        .split(" ")
        .filter(Boolean)
        .slice(0, 2)
        .map((n) => n[0])
        .join("")
        .toUpperCase();
}

// ── Avatar ─────────────────────────────────────────────────────────────────────

function Avatar({
    teacher,
}: {
    teacher: AdminCalendarEvent["teachers"][number];
}) {
    const color = getAvatarColor(teacher.name);
    return (
        <div
            title={teacher.name}
            className="h-6 w-6 rounded-full border-[1.5px] border-card overflow-hidden shrink-0"
        >
            {teacher.avatarUrl ? (
                <img
                    src={teacher.avatarUrl}
                    alt={teacher.name}
                    className="h-full w-full object-cover"
                />
            ) : (
                <div
                    className={`h-full w-full flex items-center justify-center text-[9px] font-bold uppercase ${color.bg} ${color.text}`}
                >
                    {initials(teacher.name)}
                </div>
            )}
        </div>
    );
}

// ── Main export ────────────────────────────────────────────────────────────────

export default function AdminTrainingCalendar({
    events,
}: {
    events: AdminCalendarEvent[];
}) {
    const today = new Date();
    const todayKey = localKey(
        today.getFullYear(),
        today.getMonth(),
        today.getDate(),
    );

    const [selectedKey, setSelectedKey] = useState(todayKey);
    const [viewYear, setViewYear] = useState(today.getFullYear());
    const [viewMonth, setViewMonth] = useState(today.getMonth());
    const [pickerOpen, setPickerOpen] = useState(false);
    const [pickerYear, setPickerYear] = useState(today.getFullYear());

    const byDay = useMemo(() => {
        const map = new Map<string, AdminCalendarEvent[]>();
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

    const totalDays = new Date(viewYear, viewMonth + 1, 0).getDate();
    const startDay = new Date(viewYear, viewMonth, 1).getDay();
    const cells: (number | null)[] = [
        ...Array(startDay).fill(null),
        ...Array.from({ length: totalDays }, (_, i) => i + 1),
    ];
    while (cells.length % 7 !== 0) cells.push(null);

    return (
        <div className="rounded-xl border border-orange-500/20 bg-card/80 overflow-hidden">
            {/* accent bar */}
            <div className="h-0.5 w-full bg-gradient-to-r from-orange-500/60 to-orange-500/10" />

            {/* header */}
            <div className="flex items-center justify-between gap-3 px-5 pt-4 pb-3 border-b border-border/40">
                <div className="flex items-center gap-2">
                    <div className="rounded-lg p-1.5 bg-orange-500/10">
                        <CalendarDays className="h-3.5 w-3.5 text-orange-400" />
                    </div>
                    <div>
                        <p className="text-sm font-semibold">
                            Training Calendar
                        </p>
                        <p className="text-xs text-muted-foreground">
                            Tap a date to see assigned teachers
                        </p>
                    </div>
                </div>
                <Badge variant="secondary" className="shrink-0">
                    {events.length} total
                </Badge>
            </div>

            {/* body — calendar left, events right */}
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
                                    const eType = (e.type ?? "").toLowerCase();
                                    const isSeminar = eType === "seminar";
                                    const isWorkshop = eType === "workshop";
                                    const isWebinar = eType === "webinar";
                                    const isConference = eType === "conference";

                                    // stripe only keeps type colour — everything else is neutral orange
                                    const stripeClass = isSeminar
                                        ? "bg-violet-400/50"
                                        : isWorkshop
                                          ? "bg-orange-400/50"
                                          : isWebinar
                                            ? "bg-sky-400/50"
                                            : isConference
                                              ? "bg-pink-400/50"
                                              : "bg-teal-400/50";

                                    const countBubble = isSeminar
                                        ? "bg-violet-500/10 border-violet-500/20 text-violet-400"
                                        : isWorkshop
                                          ? "bg-orange-500/10 border-orange-500/20 text-orange-400"
                                          : isWebinar
                                            ? "bg-sky-500/10 border-sky-500/20 text-sky-400"
                                            : isConference
                                              ? "bg-pink-500/10 border-pink-500/20 text-pink-400"
                                              : "bg-teal-500/10 border-teal-500/20 text-teal-400";

                                    const typeBadge = isSeminar
                                        ? "bg-violet-500/15 text-violet-400 border-violet-500/30"
                                        : isWorkshop
                                          ? "bg-orange-500/15 text-orange-400 border-orange-500/30"
                                          : isWebinar
                                            ? "bg-sky-500/15 text-sky-400 border-sky-500/30"
                                            : isConference
                                              ? "bg-pink-500/15 text-pink-400 border-pink-500/30"
                                              : "bg-teal-500/15 text-teal-400 border-teal-500/30";

                                    const cardBorder =
                                        "border-border/50 hover:bg-accent/20";

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
                                            className={`rounded-lg border bg-background/50 overflow-hidden transition-colors ${cardBorder}`}
                                        >
                                            {/* colored left stripe */}
                                            <div className="flex">
                                                <div
                                                    className={`w-1 shrink-0 ${stripeClass}`}
                                                />
                                                <div className="flex-1 p-3">
                                                    {/* md+: title and badges inline | mobile: title then date+badges below */}
                                                    <div className="flex items-start justify-between gap-2">
                                                        <p className="text-sm font-medium leading-snug">
                                                            {e.title}
                                                        </p>
                                                        {/* badges — visible on md+ only */}
                                                        <div className="hidden md:flex items-center gap-1.5 shrink-0">
                                                            <span
                                                                className={`inline-block rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${typeBadge}`}
                                                            >
                                                                {e.type ??
                                                                    "Training"}
                                                            </span>
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
                                                    {/* date + badges row (badges visible on mobile only) */}
                                                    <div className="flex items-center justify-between gap-2 mt-1">
                                                        <p className="text-[11px] text-muted-foreground">
                                                            {e.start}
                                                            {e.end &&
                                                            e.end !== e.start
                                                                ? ` → ${e.end}`
                                                                : ""}
                                                        </p>
                                                        <div className="flex md:hidden items-center gap-1.5 shrink-0">
                                                            <span
                                                                className={`inline-block rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${typeBadge}`}
                                                            >
                                                                {e.type ??
                                                                    "Training"}
                                                            </span>
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

                                                    {/* teachers */}
                                                    {e.teachers.length === 0 ? (
                                                        <p className="mt-2 text-xs text-muted-foreground/50 italic">
                                                            No teachers assigned
                                                        </p>
                                                    ) : (
                                                        <div className="mt-2">
                                                            {/* avatar stack */}
                                                            <div className="flex items-center gap-2 mb-1.5">
                                                                <div className="flex -space-x-1.5">
                                                                    {e.teachers
                                                                        .slice(
                                                                            0,
                                                                            3,
                                                                        )
                                                                        .map(
                                                                            (
                                                                                t,
                                                                            ) => (
                                                                                <Avatar
                                                                                    key={
                                                                                        t.id
                                                                                    }
                                                                                    teacher={
                                                                                        t
                                                                                    }
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
                                                            {/* name list */}
                                                            <div className="space-y-1">
                                                                {e.teachers.map(
                                                                    (t) => (
                                                                        <div
                                                                            key={
                                                                                t.id
                                                                            }
                                                                            className="flex items-center gap-2"
                                                                        >
                                                                            <Avatar
                                                                                teacher={
                                                                                    t
                                                                                }
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
                        {/* month nav */}
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

                        {/* month/year picker */}
                        <AnimatePresence>
                            {pickerOpen && (
                                <motion.div
                                    initial={{ opacity: 0, y: -6 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -6 }}
                                    transition={{ duration: 0.15 }}
                                    className="absolute inset-x-0 top-[2.75rem] z-10 mx-3 rounded-lg border bg-card shadow-lg p-3"
                                >
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
                                    <div className="grid grid-cols-4 gap-1">
                                        {MONTHS_SHORT.map((m, i) => {
                                            const isCurrent =
                                                i === viewMonth &&
                                                pickerYear === viewYear;
                                            const isNow =
                                                i === today.getMonth() &&
                                                pickerYear ===
                                                    today.getFullYear();
                                            return (
                                                <button
                                                    key={m}
                                                    onClick={() => {
                                                        setViewMonth(i);
                                                        setViewYear(pickerYear);
                                                        setPickerOpen(false);
                                                    }}
                                                    className={[
                                                        "rounded-md py-2 text-sm transition-colors",
                                                        isCurrent
                                                            ? "bg-orange-600/50 text-orange-100 font-semibold"
                                                            : isNow
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
                        <div className="grid grid-cols-7 gap-y-0.5">
                            {cells.map((day, i) => {
                                if (day === null) return <div key={`e-${i}`} />;
                                const key = localKey(viewYear, viewMonth, day);
                                const isToday = key === todayKey;
                                const isSelected = key === selectedKey;
                                const eventsOnDay = byDay.get(key);
                                const hasEvent = !!eventsOnDay;
                                const eventCount = eventsOnDay?.length ?? 0;
                                const teacherCount = eventsOnDay
                                    ? new Set(
                                          eventsOnDay.flatMap((e) =>
                                              e.teachers.map((t) => t.id),
                                          ),
                                      ).size
                                    : 0;

                                return (
                                    <button
                                        key={key}
                                        onClick={() => setSelectedKey(key)}
                                        className={[
                                            "relative mx-auto flex h-10 w-10 flex-col items-center justify-center rounded-md text-sm transition-colors",
                                            isSelected
                                                ? "bg-orange-500/80 text-white font-semibold shadow-sm"
                                                : isToday
                                                  ? "border border-orange-500/50 font-semibold text-orange-300 hover:bg-accent"
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
                                        {/* dot for training */}
                                        {hasEvent && (
                                            <span
                                                className={[
                                                    "absolute bottom-0.5 left-1/2 -translate-x-1/2 h-1 w-1 rounded-full",
                                                    isSelected
                                                        ? "bg-white/80"
                                                        : "bg-orange-400/70",
                                                ].join(" ")}
                                            />
                                        )}
                                        {/* event count badge (multiple events) */}
                                        {eventCount > 1 && !isSelected && (
                                            <span className="absolute -top-0.5 -right-0.5 h-3.5 min-w-3.5 rounded-full bg-orange-500 text-white text-[8px] font-bold flex items-center justify-center px-0.5">
                                                {eventCount}
                                            </span>
                                        )}
                                        {/* teacher count bubble (single event) */}
                                        {eventCount === 1 &&
                                            teacherCount > 0 &&
                                            !isSelected && (
                                                <span className="absolute -top-0.5 -right-0.5 h-3.5 min-w-3.5 rounded-full bg-orange-500/70 text-white text-[8px] font-bold flex items-center justify-center px-0.5">
                                                    {teacherCount}
                                                </span>
                                            )}
                                    </button>
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
