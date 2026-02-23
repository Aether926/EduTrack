"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Calendar } from "@/components/ui/calendar";
import type { CalendarEvent } from "@/lib/database/calendar";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { CalendarDays } from "lucide-react";

function pad(n: number) {
  return n < 10 ? `0${n}` : String(n);
}
function localKey(d: Date) {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}
function parseDateOnlyToLocal(s: string) {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(s);
  if (!m) return null;
  const d = new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]));
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
      map.set(key, [...(map.get(key) ?? []), e]);
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
    <Card className="overflow-hidden">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-1">
            <CardTitle className="text-base flex items-center gap-2">
              <CalendarDays className="h-4 w-4 text-muted-foreground" />
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
        {/* smaller calendar */}
        <div className="rounded-lg border bg-card p-2 md:p-3 overflow-hidden">
          <div className="w-full overflow-hidden">
            <Calendar
              mode="single"
              selected={selected}
              onSelect={setSelected}
              className="w-full"
              // slightly tighter calendar spacing
              classNames={{
                months: "flex flex-col space-y-2",
                month: "space-y-2",
                caption: "flex justify-center pt-1 relative items-center",
                caption_label: "text-sm font-medium",
                head_row: "flex",
                head_cell: "text-muted-foreground rounded-md w-8 font-normal text-[0.75rem]",
                row: "flex w-full mt-1",
                cell: "h-8 w-8 text-center text-sm p-0 relative",
                day: "h-8 w-8 p-0 font-normal aria-selected:opacity-100",
              }}
              modifiers={{ hasEvent: highlightedDays }}
              modifiersClassNames={{
                hasEvent:
                  "relative font-semibold after:absolute after:bottom-1 after:left-1/2 after:h-1 after:w-1 after:-translate-x-1/2 after:rounded-full after:bg-primary",
              }}
            />
          </div>
        </div>

        {/* agenda moved below */}
        <div className="mt-3 rounded-lg border bg-card">
          <div className="flex items-center justify-between px-3 py-3">
            <div className="min-w-0">
              <div className="text-sm font-medium truncate">
                Agenda {selectedKey ? `• ${selectedKey}` : ""}
              </div>
              <div className="text-xs text-muted-foreground">
                {selectedEvents.length ? "Scheduled items" : "No items scheduled"}
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
                    transition={{ duration: 0.18, delay: Math.min(idx * 0.02, 0.25) }}
                    className="rounded-lg border bg-card p-3 hover:bg-accent/40 transition-colors"
                  >
                    <div className="font-medium">{e.title}</div>
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