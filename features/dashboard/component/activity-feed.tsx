/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { ActivityRow } from "@/lib/database/activity";

import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
    Bell,
    Filter,
    CheckCircle2,
    XCircle,
    AlertTriangle,
    Sparkles,
    Search,
    X,
    LayoutGrid,
    ShieldCheck,
    Inbox,
    ChevronLeft,
    ChevronRight,
} from "lucide-react";

type FeedRow = ActivityRow & {
    actor_id?: string | null;
    target_user_id?: string;
    display_time?: string;
};
type FilterKey = "all" | "approved" | "rejected" | "compliance" | "requests";

function classify(r: FeedRow) {
    const a = (r.action ?? "").toUpperCase();
    if (a.includes("APPROVED") || a === "COMPLIANCE_COMPLIANT")
        return "approved";
    if (a.includes("REJECTED") || a === "COMPLIANCE_NON_COMPLIANT")
        return "rejected";
    if (a.includes("COMPLIANCE")) return "compliance";
    if (a.includes("REQUEST") || a.includes("REQUESTED")) return "requests";
    return "all";
}

// Semantic color — only for the left border and icon tint, nothing else
function accentBorder(kind: ReturnType<typeof classify>) {
    if (kind === "approved") return "border-l-[3px] border-l-emerald-500/40";
    if (kind === "rejected") return "border-l-[3px] border-l-rose-500/40";
    if (kind === "compliance") return "border-l-[3px] border-l-amber-500/40";
    if (kind === "requests") return "border-l-[3px] border-l-blue-500/40";
    return "border-l-[3px] border-l-zinc-500/30";
}

function iconBg(kind: ReturnType<typeof classify>) {
    if (kind === "approved")
        return "bg-emerald-500/10 text-emerald-400 border-emerald-500/20";
    if (kind === "rejected")
        return "bg-rose-500/10 text-rose-400 border-rose-500/20";
    if (kind === "compliance")
        return "bg-amber-500/10 text-amber-400 border-amber-500/20";
    if (kind === "requests")
        return "bg-blue-500/10 text-blue-400 border-blue-500/20";
    return "bg-zinc-500/10 text-zinc-400 border-zinc-500/20";
}

function kindBadge(kind: ReturnType<typeof classify>) {
    if (kind === "approved")
        return "bg-emerald-500/10 text-emerald-400 border-emerald-500/25";
    if (kind === "rejected")
        return "bg-rose-500/10 text-rose-400 border-rose-500/25";
    if (kind === "compliance")
        return "bg-amber-500/10 text-amber-400 border-amber-500/25";
    if (kind === "requests")
        return "bg-blue-500/10 text-blue-400 border-blue-500/25";
    return "bg-zinc-500/10 text-zinc-400 border-zinc-500/20";
}

function filterActive(k: FilterKey) {
    if (k === "approved")
        return "bg-emerald-500/15 text-emerald-400 border-emerald-500/30 shadow-[0_0_0_1px_rgba(16,185,129,0.15)]";
    if (k === "rejected")
        return "bg-rose-500/15 text-rose-400 border-rose-500/30 shadow-[0_0_0_1px_rgba(244,63,94,0.15)]";
    if (k === "compliance")
        return "bg-amber-500/15 text-amber-400 border-amber-500/30 shadow-[0_0_0_1px_rgba(245,158,11,0.15)]";
    if (k === "requests")
        return "bg-blue-500/15 text-blue-400 border-blue-500/30 shadow-[0_0_0_1px_rgba(59,130,246,0.15)]";
    return "bg-zinc-500/15 text-zinc-300 border-zinc-500/30 shadow-[0_0_0_1px_rgba(113,113,122,0.15)]";
}

function filterHover(k: FilterKey) {
    if (k === "approved")
        return "hover:bg-emerald-500/8 hover:text-emerald-400 hover:border-emerald-500/20";
    if (k === "rejected")
        return "hover:bg-rose-500/8 hover:text-rose-400 hover:border-rose-500/20";
    if (k === "compliance")
        return "hover:bg-amber-500/8 hover:text-amber-400 hover:border-amber-500/20";
    if (k === "requests")
        return "hover:bg-blue-500/8 hover:text-blue-400 hover:border-blue-500/20";
    return "hover:bg-zinc-500/8 hover:text-zinc-300 hover:border-zinc-500/20";
}

function filterIcon(k: FilterKey) {
    if (k === "approved") return <CheckCircle2 className="h-3 w-3" />;
    if (k === "rejected") return <XCircle className="h-3 w-3" />;
    if (k === "compliance") return <ShieldCheck className="h-3 w-3" />;
    if (k === "requests") return <Inbox className="h-3 w-3" />;
    return <LayoutGrid className="h-3 w-3" />;
}

function iconFor(kind: ReturnType<typeof classify>) {
    if (kind === "approved") return <CheckCircle2 className="h-4 w-4" />;
    if (kind === "rejected") return <XCircle className="h-4 w-4" />;
    if (kind === "compliance") return <AlertTriangle className="h-4 w-4" />;
    return <Bell className="h-4 w-4" />;
}

export function getDisplayMessage(r: FeedRow, viewerId: string): string {
    const title = (r.meta?.title as string | undefined) ?? null;
    const note = (r.meta?.note as string | undefined) ?? null;
    const docType = (r.meta?.docType as string | undefined) ?? null;
    const position = (r.meta?.position as string | undefined) ?? null;
    const isActor = !!r.actor_id && r.actor_id === viewerId;
    const isReceiver = !!r.target_user_id && r.target_user_id === viewerId;

    switch (r.action) {
        case "ASSIGNED_TO_TRAINING":
            if (isActor)
                return `You assigned a teacher to "${title ?? "a training"}".`;
            if (isReceiver)
                return `You were assigned to "${title ?? "a training"}".`;
            return `A teacher was assigned to "${title ?? "a training"}".`;
        case "PROOF_SUBMITTED":
            if (isActor)
                return `You submitted proof for "${title ?? "a training"}".`;
            if (isReceiver)
                return `A proof submission was received for "${title ?? "a training"}".`;
            return `Proof submitted for "${title ?? "a training"}".`;
        case "PROOF_APPROVED":
            if (isActor)
                return `You approved a proof submission${title ? ` for "${title}"` : ""}.`;
            if (isReceiver)
                return `Your proof submission${title ? ` for "${title}"` : ""} was approved.`;
            return `A proof submission was approved${title ? ` for "${title}"` : ""}.`;
        case "PROOF_REJECTED":
            if (isActor)
                return `You rejected a proof submission${title ? ` for "${title}"` : ""}${note ? `. Reason: ${note}` : ""}.`;
            if (isReceiver)
                return `Your proof submission${title ? ` for "${title}"` : ""} was rejected${note ? `. Reason: ${note}` : ""}.`;
            return `A proof submission was rejected${title ? ` for "${title}"` : ""}.`;
        case "REQUEST_APPROVED":
        case "HR_REQUEST_APPROVED":
        case "APPOINTMENT_REQUEST_APPROVED":
            if (isActor)
                return `You approved an employment change request${position ? ` for "${position}"` : ""}${note ? `. Note: ${note}` : ""}.`;
            if (isReceiver)
                return `Your employment change request${position ? ` for "${position}"` : ""} was approved${note ? `. Note: ${note}` : ""}.`;
            return `An employment change request was approved${position ? ` for "${position}"` : ""}.`;
        case "REQUEST_REJECTED":
        case "HR_REQUEST_REJECTED":
            if (isActor)
                return `You rejected an employment change request${note ? `. Reason: ${note}` : ""}.`;
            if (isReceiver)
                return `Your employment change request was rejected${note ? `. Reason: ${note}` : ""}.`;
            return `An employment change request was rejected.`;
        case "DOC_SUBMITTED":
            if (isActor)
                return `You submitted "${docType ?? "a document"}" for review.`;
            if (isReceiver) return `A document was submitted for review.`;
            return `A document was submitted for review.`;
        default:
            return r.message ?? "Activity updated.";
    }
}

export default function ActivityFeed({
    rows,
    role,
    viewerId,
}: {
    rows: (FeedRow & { _kind?: ReturnType<typeof classify> })[];
    role: string | null;
    viewerId: string;
}) {
    const [q, setQ] = useState("");
    const [filter, setFilter] = useState<FilterKey>("all");
    const PAGE_SIZE = 8;
    const [page, setPage] = useState(1);
    const [searchOpen, setSearchOpen] = useState(false);

    const enriched = useMemo(
        () => rows.map((r) => ({ ...r, _kind: classify(r) })),
        [rows],
    );

    const filtered = useMemo(() => {
        const s = q.trim().toLowerCase();
        return enriched.filter((r) => {
            if (filter !== "all" && r._kind !== filter) return false;
            if (!s) return true;
            return (
                getDisplayMessage(r, viewerId).toLowerCase().includes(s) ||
                (r.action ?? "").toLowerCase().includes(s)
            );
        });
    }, [enriched, q, filter, viewerId]);

    const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
    const shown = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

    return (
        <Card className="overflow-hidden border-border/60">
            <CardHeader className="gap-3 md:flex-row md:items-center md:justify-between">
                <div className="space-y-1">
                    <CardTitle className="text-base flex items-center gap-2">
                        <Sparkles className="h-4 w-4 text-amber-400" />
                        Activity
                    </CardTitle>
                    <CardDescription className="text-sm">
                        {role === "ADMIN"
                            ? "Latest system updates."
                            : "Your latest updates."}
                    </CardDescription>
                </div>

                {/* Desktop search */}
                <div className="hidden md:block w-[280px]">
                    <Input
                        value={q}
                        onChange={(e) => {
                            setQ(e.target.value);
                            setPage(1);
                        }}
                        placeholder="Search..."
                    />
                </div>

                {/* Mobile search */}
                <div className="flex md:hidden items-center gap-2">
                    <Button
                        variant="outline"
                        size="icon"
                        onClick={() => setSearchOpen((v) => !v)}
                        aria-label="Search"
                    >
                        {searchOpen ? (
                            <X className="h-4 w-4" />
                        ) : (
                            <Search className="h-4 w-4" />
                        )}
                    </Button>
                    <AnimatePresence initial={false}>
                        {searchOpen && (
                            <motion.div
                                initial={{ width: 0, opacity: 0 }}
                                animate={{
                                    width: "min(220px, 55vw)",
                                    opacity: 1,
                                }}
                                exit={{ width: 0, opacity: 0 }}
                                transition={{ duration: 0.18 }}
                                className="overflow-hidden"
                            >
                                <Input
                                    value={q}
                                    onChange={(e) => {
                                        setQ(e.target.value);
                                        setPage(1);
                                    }}
                                    placeholder="Search..."
                                    className="h-9"
                                />
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </CardHeader>

            {/* Filter bar */}
            <CardContent className="pt-0 pb-3">
                <div className="flex flex-wrap items-center gap-2">
                    <Badge
                        variant="outline"
                        className="gap-1 text-muted-foreground border-border/50"
                    >
                        <Filter className="h-3.5 w-3.5" />
                        Filter
                    </Badge>
                    {(
                        [
                            "all",
                            "approved",
                            "rejected",
                            "compliance",
                            "requests",
                        ] as const
                    ).map((k) => (
                        <button
                            key={k}
                            onClick={() => {
                                setFilter(k);
                                setPage(1);
                            }}
                            className={[
                                "inline-flex items-center gap-1.5 h-8 px-3 rounded-md border text-xs font-medium capitalize transition-all",
                                filter === k
                                    ? filterActive(k)
                                    : `text-muted-foreground border-border/40 bg-transparent ${filterHover(k)}`,
                            ].join(" ")}
                        >
                            {filterIcon(k)}
                            {k}
                        </button>
                    ))}
                    <div className="ml-auto text-xs text-muted-foreground">
                        {filtered.length} item{filtered.length !== 1 ? "s" : ""}
                    </div>
                </div>
            </CardContent>

            <Separator />

            {/* Items */}
            <CardContent className="pt-3 pb-4">
                <div className="space-y-2">
                    <AnimatePresence initial={false}>
                        {shown.map((r, idx) => {
                            const kind = (r as any)._kind as ReturnType<
                                typeof classify
                            >;
                            const msg = getDisplayMessage(r, viewerId);
                            return (
                                <motion.div
                                    key={r.id}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -8 }}
                                    transition={{
                                        duration: 0.18,
                                        delay: Math.min(idx * 0.02, 0.25),
                                    }}
                                >
                                    <div
                                        className={`rounded-lg border overflow-hidden transition-colors ${accentBorder(kind)} ${kind === "all" ? "border-zinc-500/20 bg-zinc-500/5 hover:bg-zinc-500/10" : "border-border/50 bg-muted/30 hover:bg-muted/50"}`}
                                    >
                                        <div className="flex gap-3 p-4">
                                            <div
                                                className={`mt-1 grid h-9 w-9 shrink-0 place-items-center rounded-full border ${iconBg(kind)}`}
                                            >
                                                {iconFor(kind)}
                                            </div>
                                            <div className="min-w-0 flex-1">
                                                <div className="flex flex-wrap items-center gap-2">
                                                    <Badge
                                                        variant="outline"
                                                        className={`capitalize ${kindBadge(kind)}`}
                                                    >
                                                        {kind}
                                                    </Badge>
                                                    <div className="text-xs text-muted-foreground">
                                                        {(r as FeedRow)
                                                            .display_time ??
                                                            r.created_at}
                                                    </div>
                                                </div>
                                                <div className="mt-2 text-sm leading-relaxed">
                                                    {msg}
                                                </div>
                                                {r.meta?.title ? (
                                                    <div className="mt-3 rounded-md border border-border/50 bg-background/60 p-3 text-sm">
                                                        <div className="text-xs text-muted-foreground">
                                                            Related
                                                        </div>
                                                        <div className="font-medium">
                                                            {String(
                                                                r.meta.title,
                                                            )}
                                                        </div>
                                                    </div>
                                                ) : null}
                                                <Separator className="mt-4" />
                                                <div className="flex items-center justify-between px-1 pt-3 text-xs text-muted-foreground gap-2">
                                                    <span className="truncate">
                                                        {r.entity_type ?? ""}
                                                    </span>
                                                    <span className="shrink-0">
                                                        {r.entity_id
                                                            ? `#${String(r.entity_id).slice(0, 8)}`
                                                            : ""}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            );
                        })}
                    </AnimatePresence>

                    {filtered.length === 0 && (
                        <div className="rounded-lg border border-border/50 bg-muted/20 py-10 text-center text-sm text-muted-foreground">
                            Nothing to show.
                        </div>
                    )}

                    {totalPages > 1 && (
                        <div className="flex flex-col items-center gap-2 mt-1 px-1">
                            <div className="flex items-center justify-between w-full">
                                <span className="text-[11px] text-muted-foreground">
                                    Page {page} of {totalPages}
                                </span>
                                <span className="text-[11px] text-muted-foreground">
                                    {filtered.length} items
                                </span>
                            </div>
                            <div className="flex flex-nowrap items-center justify-center gap-1 overflow-x-auto w-full pb-1">
                                <button
                                    onClick={() =>
                                        setPage((p) => Math.max(1, p - 1))
                                    }
                                    disabled={page === 1}
                                    className="inline-flex items-center justify-center rounded-md border border-white/10 bg-white/5 p-1.5 text-muted-foreground transition hover:bg-white/10 hover:text-foreground disabled:pointer-events-none disabled:opacity-30"
                                >
                                    <ChevronLeft className="h-3.5 w-3.5" />
                                </button>
                                {(() => {
                                    const delta = 1;
                                    const range: (number | "…")[] = [];
                                    const left = Math.max(2, page - delta);
                                    const right = Math.min(
                                        totalPages - 1,
                                        page + delta,
                                    );
                                    range.push(1);
                                    if (left > 2) range.push("…");
                                    for (let i = left; i <= right; i++)
                                        range.push(i);
                                    if (right < totalPages - 1) range.push("…");
                                    if (totalPages > 1) range.push(totalPages);
                                    return range.map((p, idx) =>
                                        p === "…" ? (
                                            <span
                                                key={`ellipsis-${idx}`}
                                                className="inline-flex h-6 w-6 items-center justify-center text-[11px] text-muted-foreground"
                                            >
                                                …
                                            </span>
                                        ) : (
                                            <button
                                                key={p}
                                                onClick={() => setPage(p)}
                                                className={`inline-flex h-6 w-6 items-center justify-center rounded-md border text-[11px] font-medium transition ${
                                                    p === page
                                                        ? "border-blue-500/40 bg-blue-500/20 text-blue-400"
                                                        : "border-white/10 bg-white/5 text-muted-foreground hover:bg-white/10 hover:text-foreground"
                                                }`}
                                            >
                                                {p}
                                            </button>
                                        ),
                                    );
                                })()}
                                <button
                                    onClick={() =>
                                        setPage((p) =>
                                            Math.min(totalPages, p + 1),
                                        )
                                    }
                                    disabled={page === totalPages}
                                    className="inline-flex items-center justify-center rounded-md border border-white/10 bg-white/5 p-1.5 text-muted-foreground transition hover:bg-white/10 hover:text-foreground disabled:pointer-events-none disabled:opacity-30"
                                >
                                    <ChevronRight className="h-3.5 w-3.5" />
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}
