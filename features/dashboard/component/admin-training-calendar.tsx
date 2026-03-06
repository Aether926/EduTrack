"use client";

import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronLeft, ChevronRight, ChevronUp, ChevronDown,
  CalendarDays, Users,
} from "lucide-react";
import type { AdminCalendarEvent } from "@/lib/database/calendar";
import {
  Card, CardContent, CardHeader, CardTitle, CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

// ── Constants ──────────────────────────────────────────────────────────────────

const DAYS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];
const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];
const MONTHS_SHORT = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

// ── Helpers ────────────────────────────────────────────────────────────────────

function pad(n: number) { return n < 10 ? `0${n}` : String(n); }
function localKey(y: number, m: number, d: number) {
  return `${y}-${pad(m + 1)}-${pad(d)}`;
}
function parseDateOnlyToLocal(s: string) {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(s);
  if (!match) return null;
  const d = new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]));
  return isNaN(d.getTime()) ? null : d;
}

// Generate a stable bg color from a string (for avatar initials)
const AVATAR_COLORS = [
  "bg-violet-500", "bg-sky-500", "bg-emerald-500",
  "bg-amber-500",  "bg-rose-500", "bg-indigo-500",
  "bg-teal-500",   "bg-orange-500",
];
function avatarColor(id: string) {
  let hash = 0;
  for (let i = 0; i < id.length; i++) hash = (hash * 31 + id.charCodeAt(i)) >>> 0;
  return AVATAR_COLORS[hash % AVATAR_COLORS.length];
}
function initials(name: string) {
  const parts = name.trim().split(" ");
  return (parts[0]?.[0] ?? "") + (parts[1]?.[0] ?? "");
}

// ── Avatar Stack ───────────────────────────────────────────────────────────────

function AvatarStack({ teachers }: { teachers: AdminCalendarEvent["teachers"] }) {
  const visible = teachers.slice(0, 3);
  const overflow = teachers.length - visible.length;

  return (
    <div className="flex items-center gap-2 mt-2">
      <div className="flex -space-x-2">
        {visible.map((t) => (
          <div
            key={t.id}
            title={t.name}
            className="h-6 w-6 rounded-full border-2 border-card overflow-hidden shrink-0"
          >
            {t.avatarUrl ? (
              <img src={t.avatarUrl} alt={t.name} className="h-full w-full object-cover" />
            ) : (
              <div className={[
                "h-full w-full flex items-center justify-center",
                "text-[9px] font-bold text-white uppercase",
                avatarColor(t.id),
              ].join(" ")}>
                {initials(t.name)}
              </div>
            )}
          </div>
        ))}
        {overflow > 0 && (
          <div className="h-6 w-6 rounded-full border-2 border-card bg-muted flex items-center justify-center text-[9px] font-bold text-muted-foreground shrink-0">
            +{overflow}
          </div>
        )}
      </div>
      <span className="text-xs text-muted-foreground">
        {teachers.length} teacher{teachers.length !== 1 ? "s" : ""}
      </span>
    </div>
  );
}

// ── Event List Card ────────────────────────────────────────────────────────────

function EventListCard({
  selectedKey,
  selectedEvents,
}: {
  selectedKey: string;
  selectedEvents: AdminCalendarEvent[];
}) {
  return (
    <Card className="bg-card/80 border-border/50 flex flex-col h-full">
      <CardHeader className="pb-3 px-5 pt-5">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <CardTitle className="text-base flex items-center gap-2">
              <Users className="h-4 w-4 text-orange-400" />
              Assigned Teachers
            </CardTitle>
            <CardDescription className="text-sm">
              {selectedKey
                ? `${MONTHS[Number(selectedKey.split("-")[1]) - 1]} ${selectedKey.split("-")[2]}, ${selectedKey.split("-")[0]}`
                : "Select a date"}
            </CardDescription>
          </div>
          <Badge variant="outline">{selectedEvents.length}</Badge>
        </div>
      </CardHeader>

      <Separator />

      <CardContent className="px-4 py-4 flex-1 overflow-y-auto">
        {selectedEvents.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full gap-2 py-10 text-center">
            <CalendarDays className="h-8 w-8 text-muted-foreground/30" />
            <p className="text-sm text-muted-foreground">No trainings on this date.</p>
            <p className="text-xs text-muted-foreground/60">Tap a highlighted date on the calendar.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {selectedEvents.map((e, idx) => (
              <motion.div
                key={e.id}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.18, delay: Math.min(idx * 0.04, 0.3) }}
                className="rounded-lg border bg-background/60 p-3 hover:bg-accent/30 transition-colors"
              >
                {/* Title + date */}
                <div className="font-medium text-sm leading-snug">{e.title}</div>
                <div className="mt-0.5 text-xs text-muted-foreground">
                  {e.start}{e.end && e.end !== e.start ? ` → ${e.end}` : ""}
                </div>

                {/* Avatar stack */}
                {e.teachers.length > 0 ? (
                  <AvatarStack teachers={e.teachers} />
                ) : (
                  <p className="mt-2 text-xs text-muted-foreground/50 italic">No teachers assigned</p>
                )}

                {/* Full teacher list if ≤ 6 */}
                {e.teachers.length > 0 && e.teachers.length <= 6 && (
                  <div className="mt-2 space-y-1">
                    {e.teachers.map((t) => (
                      <div key={t.id} className="flex items-center gap-2">
                        <div className="h-5 w-5 rounded-full overflow-hidden shrink-0">
                          {t.avatarUrl ? (
                            <img src={t.avatarUrl} alt={t.name} className="h-full w-full object-cover" />
                          ) : (
                            <div className={[
                              "h-full w-full flex items-center justify-center",
                              "text-[8px] font-bold text-white uppercase",
                              avatarColor(t.id),
                            ].join(" ")}>
                              {initials(t.name)}
                            </div>
                          )}
                        </div>
                        <span className="text-xs text-foreground/70 truncate">{t.name}</span>
                      </div>
                    ))}
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// ── Calendar Card ──────────────────────────────────────────────────────────────

function CalendarCard({
  events,
  selectedKey,
  onSelectKey,
}: {
  events: AdminCalendarEvent[];
  selectedKey: string;
  onSelectKey: (key: string) => void;
}) {
  const today = new Date();
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

  const prevMonth = () => {
    if (viewMonth === 0) { setViewYear(y => y - 1); setViewMonth(11); }
    else setViewMonth(m => m - 1);
  };
  const nextMonth = () => {
    if (viewMonth === 11) { setViewYear(y => y + 1); setViewMonth(0); }
    else setViewMonth(m => m + 1);
  };

  const totalDays = new Date(viewYear, viewMonth + 1, 0).getDate();
  const startDay  = new Date(viewYear, viewMonth, 1).getDay();
  const todayKey  = localKey(today.getFullYear(), today.getMonth(), today.getDate());

  const cells: (number | null)[] = [
    ...Array(startDay).fill(null),
    ...Array.from({ length: totalDays }, (_, i) => i + 1),
  ];
  while (cells.length % 7 !== 0) cells.push(null);

  return (
    <Card className="bg-card/80 border-border/50 h-full">
      <CardHeader className="pb-3 px-5 pt-5">
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-0.5">
            <CardTitle className="text-base flex items-center gap-2">
              <CalendarDays className="h-4 w-4 text-orange-400" />
              Training Calendar
            </CardTitle>
            <CardDescription className="text-sm">
              Tap a highlighted date to see assigned teachers.
            </CardDescription>
          </div>
          <Badge variant="secondary">{events.length} total</Badge>
        </div>
      </CardHeader>

      <CardContent className="pt-0 px-4 pb-4">
        <div className="rounded-lg border bg-muted/20 p-3 relative">
          {/* Month nav */}
          <div className="flex items-center justify-between mb-3 px-1">
            <Button variant="outline" size="icon" className="h-7 w-7" onClick={prevMonth}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <button
              onClick={() => { setPickerYear(viewYear); setPickerOpen(v => !v); }}
              className="flex items-center gap-1 rounded-md px-2 py-1 text-sm font-medium hover:bg-accent transition-colors"
            >
              {MONTHS[viewMonth]} {viewYear}
              {pickerOpen
                ? <ChevronUp className="h-3.5 w-3.5 text-muted-foreground" />
                : <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />}
            </button>
            <Button variant="outline" size="icon" className="h-7 w-7" onClick={nextMonth}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>

          {/* Month/year picker */}
          <AnimatePresence>
            {pickerOpen && (
              <motion.div
                initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.15 }}
                className="absolute inset-x-0 top-[2.75rem] z-10 mx-3 rounded-lg border bg-card shadow-lg p-3"
              >
                <div className="flex items-center justify-between mb-3">
                  <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setPickerYear(y => y - 1)}>
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <span className="text-sm font-semibold">{pickerYear}</span>
                  <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setPickerYear(y => y + 1)}>
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
                <div className="grid grid-cols-4 gap-1">
                  {MONTHS_SHORT.map((m, i) => {
                    const isCurrent = i === viewMonth && pickerYear === viewYear;
                    const isNow = i === today.getMonth() && pickerYear === today.getFullYear();
                    return (
                      <button key={m} onClick={() => { setViewMonth(i); setViewYear(pickerYear); setPickerOpen(false); }}
                        className={[
                          "rounded-md py-2 text-sm transition-colors",
                          isCurrent ? "bg-orange-600/50 text-orange-100 font-semibold"
                            : isNow ? "border border-orange-500/40 font-semibold hover:bg-accent"
                            : "hover:bg-accent text-foreground",
                        ].join(" ")}
                      >{m}</button>
                    );
                  })}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Day headers */}
          <div className="grid grid-cols-7 mb-1">
            {DAYS.map((d) => (
              <div key={d} className="text-center text-[0.72rem] text-muted-foreground py-1">{d}</div>
            ))}
          </div>

          {/* Day cells */}
          <div className="grid grid-cols-7 gap-y-1">
            {cells.map((day, i) => {
              if (day === null) return <div key={`e-${i}`} />;
              const key = localKey(viewYear, viewMonth, day);
              const isToday    = key === todayKey;
              const isSelected = key === selectedKey;
              const eventsOnDay = byDay.get(key);
              const hasEvent   = !!eventsOnDay;
              // Count total teachers on this day
              const teacherCount = eventsOnDay
                ? new Set(eventsOnDay.flatMap(e => e.teachers.map(t => t.id))).size
                : 0;

              return (
                <button
                  key={key}
                  onClick={() => onSelectKey(key)}
                  className={[
                    "relative mx-auto flex h-9 w-9 flex-col items-center justify-center rounded-md text-sm transition-colors",
                    isSelected ? "bg-orange-600/50 text-orange-100 font-semibold"
                      : isToday ? "border border-orange-500/40 font-semibold text-orange-300 hover:bg-accent"
                      : "hover:bg-accent",
                    hasEvent && !isSelected ? "font-semibold" : "",
                  ].filter(Boolean).join(" ")}
                >
                  <span>{day}</span>
                  {hasEvent && (
                    <span className={[
                      "absolute bottom-0.5 left-1/2 -translate-x-1/2",
                      "flex items-center justify-center",
                      "h-1 min-w-1 rounded-full bg-orange-400",
                      isSelected ? "opacity-80" : "opacity-50",
                    ].join(" ")} />
                  )}
                  {/* tiny teacher count bubble */}
                  {hasEvent && teacherCount > 0 && !isSelected && (
                    <span className="absolute -top-0.5 -right-0.5 h-3.5 min-w-3.5 rounded-full bg-orange-500/80 text-white text-[8px] font-bold flex items-center justify-center px-0.5">
                      {teacherCount}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        <p className="mt-3 text-xs text-muted-foreground">
          Highlighted dates have trainings. Numbers show enrolled teachers.
        </p>
      </CardContent>
    </Card>
  );
}

// ── Main export ────────────────────────────────────────────────────────────────

export default function AdminTrainingCalendar({ events }: { events: AdminCalendarEvent[] }) {
  const today = new Date();
  const [selectedKey, setSelectedKey] = useState(
    localKey(today.getFullYear(), today.getMonth(), today.getDate()),
  );

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

  return (
    <div className="grid gap-4 lg:grid-cols-[2fr_3fr]">
      {/* Left — event + teacher list */}
      <EventListCard selectedKey={selectedKey} selectedEvents={selectedEvents} />
      {/* Right — calendar */}
      <CalendarCard events={events} selectedKey={selectedKey} onSelectKey={setSelectedKey} />
    </div>
  );
}