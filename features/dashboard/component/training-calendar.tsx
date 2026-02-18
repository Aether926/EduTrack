"use client";

import { useMemo, useState } from "react";
import { Calendar } from "@/components/ui/calendar";
import type { CalendarEvent } from "@/lib/database/calendar";

function pad(n: number) {
  return n < 10 ? `0${n}` : String(n);
}

function localKey(d: Date) {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}


function parseDateOnlyToLocal(s: string) {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(s);
  if (!m) return null;
  const y = Number(m[1]);
  const mo = Number(m[2]) - 1;
  const da = Number(m[3]);
  const d = new Date(y, mo, da);
  return isNaN(d.getTime()) ? null : d;
}

export default function TrainingCalendar({ events }: { events: CalendarEvent[] }) {
  const [selected, setSelected] = useState<Date | undefined>(new Date());

  const byDay = useMemo(() => {
    const map = new Map<string, CalendarEvent[]>();

    for (const e of events) {
      const d = parseDateOnlyToLocal(e.start);
      if (!d) continue;

      const key = localKey(d);
      const arr = map.get(key) ?? [];
      arr.push(e);
      map.set(key, arr);
    }

    return map;
  }, [events]);

  const selectedKey = selected ? localKey(selected) : "";
  const selectedEvents = byDay.get(selectedKey) ?? [];

  const highlightedDays = useMemo(() => {
    return Array.from(byDay.keys())
      .map((k) => parseDateOnlyToLocal(k))
      .filter((d): d is Date => !!d);
  }, [byDay]);

  return (
    <div className="bg-card border border-border rounded-lg p-4">
      <div className="text-lg font-semibold mb-3">Training Calendar</div>

      {/* calendar */}
      <div className="rounded-lg border border-border p-2">
        <Calendar
          mode="single"
          selected={selected}
          onSelect={setSelected}
          modifiers={{ hasEvent: highlightedDays }}
          modifiersClassNames={{ hasEvent: "bg-primary/15 font-semibold" }}
        />
      </div>

      {/* selected date */}
      <div className="mt-3 text-sm font-semibold">
        Selected: <span className="font-normal opacity-80">{selectedKey || "—"}</span>
      </div>

      {/* scroll area (only this scrolls) */}
      <div className="mt-3 max-h-[320px] overflow-y-auto pr-1">
        {selectedEvents.length === 0 ? (
          <div className="text-sm opacity-70">No trainings on this date.</div>
        ) : (
          <div className="space-y-2">
            {selectedEvents.map((e) => (
              <div key={e.id} className="rounded-md border border-border p-3">
                <div className="font-medium">{e.title}</div>
                <div className="text-xs opacity-70">
                  Starts: {e.start}
                  {e.end ? ` • Ends: ${e.end}` : ""}
                </div>
                {e.end ? (
                  <div className="text-xs mt-1">
                    Deadline: <span className="font-medium">{e.end}</span>
                  </div>
                ) : null}
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="mt-3 text-xs opacity-60">
        highlighted dates = you have an assigned training
      </div>
    </div>
  );
}
