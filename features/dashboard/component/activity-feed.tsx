/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { ActivityRow } from "@/lib/database/activity";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

import { Bell, Filter, CheckCircle2, XCircle, AlertTriangle, Sparkles, Search, X } from "lucide-react";

type FeedRow = ActivityRow & {
  actor_id?: string | null;
  target_user_id?: string;
  display_time?: string;
};

type FilterKey = "all" | "approved" | "rejected" | "compliance" | "requests";

function classify(r: FeedRow) {
  const a = (r.action ?? "").toUpperCase();
  if (a.includes("APPROVED") || a === "COMPLIANCE_COMPLIANT") return "approved";
  if (a.includes("REJECTED") || a === "COMPLIANCE_NON_COMPLIANT") return "rejected";
  if (a.includes("COMPLIANCE")) return "compliance";
  if (a.includes("REQUEST")) return "requests";
  return "all";
}

function badgeVariant(kind: ReturnType<typeof classify>) {
  if (kind === "approved") return "default";
  if (kind === "rejected") return "destructive";
  if (kind === "compliance") return "secondary";
  return "outline";
}

function iconFor(kind: ReturnType<typeof classify>) {
  if (kind === "approved") return <CheckCircle2 className="h-4 w-4" />;
  if (kind === "rejected") return <XCircle className="h-4 w-4" />;
  if (kind === "compliance") return <AlertTriangle className="h-4 w-4" />;
  return <Bell className="h-4 w-4" />;
}

function getDisplayMessage(r: FeedRow, viewerId: string) {
  const title = (r.meta?.title as string | undefined) ?? null;
  const note = (r.meta?.note as string | undefined) ?? null;

  const targetUserId = r.target_user_id ?? null;
  const actorId = r.actor_id ?? null;
  const isReceiver = !!targetUserId && targetUserId === viewerId;
  const isActor = !!actorId && actorId === viewerId;

  if (r.action === "ASSIGNED_TO_TRAINING") {
    if (isActor) return `You assigned a teacher to ${title ?? "a training"}.`;
    if (isReceiver) return `You were assigned to ${title ?? "a training"}.`;
    return `Training assignment updated: ${title ?? "a training"}.`;
  }

  if (r.action === "PROOF_APPROVED") return isReceiver ? "Your proof submission was approved." : isActor ? "You approved a proof submission." : "A proof submission was approved.";
  if (r.action === "PROOF_REJECTED") return isReceiver ? `Your proof submission was rejected.${note ? ` Reason: ${note}` : ""}` : isActor ? "You rejected a proof submission." : "A proof submission was rejected.";

  if (r.action === "HR_REQUEST_APPROVED") return isReceiver ? `Your HR request was approved.${note ? ` Note: ${note}` : ""}` : "An HR request was approved.";
  if (r.action === "HR_REQUEST_REJECTED") return isReceiver ? `Your HR request was rejected.${note ? ` Reason: ${note}` : ""}` : "An HR request was rejected.";

  if (r.action === "COMPLIANCE_AT_RISK") return "Your compliance is at risk. Please complete required hours.";
  if (r.action === "COMPLIANCE_NON_COMPLIANT") return "You are currently non-compliant. Please complete required hours.";
  if (r.action === "COMPLIANCE_COMPLIANT") return "You are now compliant. Good job!";

  return r.message || "Activity updated.";
}

export default function ActivityFeed({
  rows,
  role,
  viewerId,
}: {
  rows: ActivityRow[];
  role: string | null;
  viewerId: string;
}) {
  const [q, setQ] = useState("");
  const [filter, setFilter] = useState<FilterKey>("all");
  const [visible, setVisible] = useState(8);
  const [searchOpen, setSearchOpen] = useState(false);

  const enriched = useMemo(() => (rows as FeedRow[]).map((r) => ({ ...r, _kind: classify(r) })), [rows]);

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    return enriched.filter((r) => {
      const kindOk = filter === "all" ? true : r._kind === filter;
      if (!kindOk) return false;
      if (!s) return true;
      const msg = getDisplayMessage(r, viewerId).toLowerCase();
      return msg.includes(s) || (r.action ?? "").toLowerCase().includes(s);
    });
  }, [enriched, q, filter, viewerId]);

  const shown = filtered.slice(0, visible);
  const canLoadMore = visible < filtered.length;

  return (
    <div className="space-y-3">
      <Card>
        <CardHeader className="gap-3 md:flex-row md:items-center md:justify-between">
          <div className="space-y-1">
            <CardTitle className="text-base flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-muted-foreground" />
              Activity
            </CardTitle>
            <CardDescription className="text-sm">
              {role === "ADMIN" ? "Latest system updates." : "Your latest updates."}
            </CardDescription>
          </div>

          {/* Desktop search */}
          <div className="hidden md:block w-[280px]">
            <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search..." />
          </div>

          {/* Mobile search icon -> expand */}
          <div className="flex md:hidden items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={() => setSearchOpen((v) => !v)}
              aria-label="Search"
            >
              {searchOpen ? <X className="h-4 w-4" /> : <Search className="h-4 w-4" />}
            </Button>

            <AnimatePresence initial={false}>
              {searchOpen ? (
                <motion.div
                  initial={{ width: 0, opacity: 0 }}
                  animate={{ width: "220px", opacity: 1 }}
                  exit={{ width: 0, opacity: 0 }}
                  transition={{ duration: 0.18 }}
                  className="overflow-hidden"
                >
                  <Input
                    value={q}
                    onChange={(e) => setQ(e.target.value)}
                    placeholder="Search..."
                    className="h-9"
                  />
                </motion.div>
              ) : null}
            </AnimatePresence>
          </div>
        </CardHeader>

        <CardContent className="pt-0">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="outline" className="gap-1">
              <Filter className="h-3.5 w-3.5" />
              Filter
            </Badge>

            {([
              ["all", "All"],
              ["approved", "Approved"],
              ["rejected", "Rejected"],
              ["compliance", "Compliance"],
              ["requests", "Requests"],
            ] as const).map(([k, label]) => (
              <Button
                key={k}
                size="sm"
                variant={filter === k ? "default" : "outline"}
                className="h-8"
                onClick={() => setFilter(k)}
              >
                {label}
              </Button>
            ))}

            <div className="ml-auto text-xs text-muted-foreground">
              {filtered.length} items
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-2">
        <AnimatePresence initial={false}>
          {shown.map((r, idx) => {
            const kind = (r as any)._kind as ReturnType<typeof classify>;
            const msg = getDisplayMessage(r, viewerId);

            return (
              <motion.div
                key={r.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.18, delay: Math.min(idx * 0.02, 0.25) }}
              >
                <Card className="overflow-hidden">
                  <CardContent className="p-0">
                    <div className="flex gap-3 p-4">
                      <div className="mt-1 grid h-9 w-9 place-items-center rounded-full border bg-card text-muted-foreground">
                        {iconFor(kind)}
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <Badge variant={badgeVariant(kind)} className="capitalize">
                            {kind}
                          </Badge>
                          <div className="text-xs text-muted-foreground">
                            {(r as FeedRow).display_time ?? r.created_at}
                          </div>
                        </div>

                        <div className="mt-2 text-sm leading-relaxed">{msg}</div>

                        {r.meta?.title ? (
                          <div className="mt-3 rounded-md border bg-muted/30 p-3 text-sm">
                            <div className="text-xs text-muted-foreground">Related</div>
                            <div className="font-medium">{String(r.meta.title)}</div>
                          </div>
                        ) : null}

                        <Separator className="mt-4" />
                        <div className="flex items-center justify-between px-1 pt-3 text-xs text-muted-foreground">
                          <span>{r.entity_type ? `${r.entity_type}` : ""}</span>
                          <span>{r.entity_id ? `#${String(r.entity_id).slice(0, 8)}` : ""}</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </AnimatePresence>

        {filtered.length === 0 ? (
          <Card>
            <CardContent className="py-10 text-center text-sm text-muted-foreground">
              Nothing to show.
            </CardContent>
          </Card>
        ) : null}

        {canLoadMore ? (
          <div className="flex justify-center pt-2">
            <Button variant="outline" onClick={() => setVisible((v) => v + 8)}>
              Load more
            </Button>
          </div>
        ) : null}
      </div>
    </div>
  );
}