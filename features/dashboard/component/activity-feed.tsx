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

function badgeClass(kind: ReturnType<typeof classify>) {
    if (kind === "approved")
        return "bg-green-700/30 text-green-300 border-green-600/30";
    if (kind === "rejected")
        return "bg-red-700/30 text-red-300 border-red-600/30";
    if (kind === "compliance")
        return "bg-yellow-700/30 text-yellow-300 border-yellow-600/30";
    if (kind === "requests")
        return "bg-blue-700/30 text-blue-300 border-blue-600/30";
    return "";
}

function iconFor(kind: ReturnType<typeof classify>) {
    if (kind === "approved") return <CheckCircle2 className="h-4 w-4" />;
    if (kind === "rejected") return <XCircle className="h-4 w-4" />;
    if (kind === "compliance") return <AlertTriangle className="h-4 w-4" />;
    return <Bell className="h-4 w-4" />;
}

// Left-border accent color per kind
function accentClass(kind: ReturnType<typeof classify>) {
    if (kind === "approved") return "border-l-4 border-l-green-600/60";
    if (kind === "rejected") return "border-l-4 border-l-red-600/60";
    if (kind === "compliance") return "border-l-4 border-l-yellow-600/60";
    if (kind === "requests") return "border-l-4 border-l-blue-600/60";
    return "border-l-4 border-l-border";
}

// Icon background tint per kind
function iconBgClass(kind: ReturnType<typeof classify>) {
    if (kind === "approved")
        return "bg-green-500/10 text-green-500/70 border-green-500/15";
    if (kind === "rejected")
        return "bg-red-500/10 text-red-500/70 border-red-500/15";
    if (kind === "compliance")
        return "bg-yellow-500/10 text-yellow-500/70 border-yellow-500/15";
    if (kind === "requests")
        return "bg-blue-500/10 text-blue-500/70 border-blue-500/15";
    return "bg-muted text-muted-foreground border-border";
}

// Filter button active color per kind
function filterActiveClass(k: FilterKey) {
    if (k === "approved")
        return "bg-green-700/40 text-green-300 border-green-600/40 hover:bg-green-700/50";
    if (k === "rejected")
        return "bg-red-700/40 text-red-300 border-red-600/40 hover:bg-red-700/50";
    if (k === "compliance")
        return "bg-yellow-700/40 text-yellow-300 border-yellow-600/40 hover:bg-yellow-700/50";
    if (k === "requests")
        return "bg-blue-700/40 text-blue-300 border-blue-600/40 hover:bg-blue-700/50";
    return "bg-muted/60 text-foreground border-border hover:bg-muted";
}

export function getDisplayMessage(r: FeedRow, viewerId: string): string {
    const title = (r.meta?.title as string | undefined) ?? null;
    const note = (r.meta?.note as string | undefined) ?? null;
    const reason = (r.meta?.reason as string | undefined) ?? null;
    const docType = (r.meta?.docType as string | undefined) ?? null;
    const position = (r.meta?.position as string | undefined) ?? null;

    const targetId = r.target_user_id ?? null;
    const actorId = r.actor_id ?? null;

    const isActor = !!actorId && actorId === viewerId;
    const isReceiver = !!targetId && targetId === viewerId;

    switch (r.action) {
        // ── Training ─────────────────────────────────────────────────────────────
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

        // ── HR / Employment ───────────────────────────────────────────────────────
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

        // ── Documents ─────────────────────────────────────────────────────────────
        case "DOC_SUBMITTED":
            if (isActor)
                return `You submitted "${docType ?? "a document"}" for review.`;
            if (isReceiver)
                return `A document "${docType ?? ""}" was submitted and is pending your review.`;
            return `A document "${docType ?? ""}" was submitted.`;

        case "DOC_APPROVED":
            if (isActor) return `You approved "${docType ?? "a document"}".`;
            if (isReceiver)
                return `Your document "${docType ?? ""}" was approved.`;
            return `A document "${docType ?? ""}" was approved.`;

        case "DOC_REJECTED":
            if (isActor)
                return `You rejected "${docType ?? "a document"}"${note ? `. Reason: ${note}` : ""}.`;
            if (isReceiver)
                return `Your document "${docType ?? ""}" was rejected${note ? `. Reason: ${note}` : ""}.`;
            return `A document "${docType ?? ""}" was rejected.`;

        case "DOC_RESUBMIT_REQUESTED":
            if (isActor)
                return `You requested resubmission of "${docType ?? "a document"}".`;
            if (isReceiver)
                return `Your request to resubmit "${docType ?? "a document"}" is pending admin review.`;
            return `A resubmission was requested for "${docType ?? "a document"}".`;

        case "DOC_RESUBMIT_REQUESTED_BY_ADMIN":
            if (isActor)
                return `You requested resubmission of "${docType ?? "a document"}" from a teacher.`;
            if (isReceiver)
                return `Admin has requested you to resubmit "${docType ?? "a document"}"${note ? `. Note: ${note}` : ""}.`;
            return `Admin requested resubmission of "${docType ?? "a document"}".`;

        case "DOC_RESUBMIT_APPROVED":
            if (isActor)
                return `You approved the resubmission request for "${docType ?? "a document"}".`;
            if (isReceiver)
                return `Your resubmission request for "${docType ?? "a document"}" was approved. You may now upload again.`;
            return `A resubmission request was approved for "${docType ?? "a document"}".`;

        case "DOC_RESUBMIT_REJECTED":
            if (isActor)
                return `You rejected the resubmission request for "${docType ?? "a document"}"${note ? `. Reason: ${note}` : ""}.`;
            if (isReceiver)
                return `Your resubmission request for "${docType ?? "a document"}" was rejected${note ? `. Reason: ${note}` : ""}.`;
            return `A resubmission request was rejected for "${docType ?? "a document"}".`;

        case "DOC_DELETE_REQUESTED":
            if (isActor)
                return `You requested deletion of "${docType ?? "a document"}".`;
            if (isReceiver)
                return `Your request to delete "${docType ?? "a document"}" is pending admin review.`;
            return `A deletion was requested for "${docType ?? "a document"}".`;

        case "DOC_DELETE_APPROVED":
            if (isActor)
                return `You approved the deletion of "${docType ?? "a document"}".`;
            if (isReceiver)
                return `Your document "${docType ?? ""}" deletion request was approved and the document has been removed.`;
            return `A document deletion was approved for "${docType ?? "a document"}".`;

        case "DOC_DELETE_REJECTED":
            if (isActor)
                return `You rejected the deletion request for "${docType ?? "a document"}"${note ? `. Reason: ${note}` : ""}.`;
            if (isReceiver)
                return `Your deletion request for "${docType ?? "a document"}" was rejected${note ? `. Reason: ${note}` : ""}.`;
            return `A deletion request was rejected for "${docType ?? "a document"}".`;

        // ── Compliance ────────────────────────────────────────────────────────────
        case "COMPLIANCE_AT_RISK":
            return "Your training compliance is at risk. Please complete the required hours soon.";

        case "COMPLIANCE_NON_COMPLIANT":
            return "You are currently non-compliant with training requirements. Please complete the required hours.";

        case "COMPLIANCE_COMPLIANT":
            return "You are now compliant with training requirements. Great work!";

        // ── Account Deletion ──────────────────────────────────────────────────────
        case "ACCOUNT_DELETION_REQUESTED":
            if (isActor)
                return `You submitted a request to delete your account${reason ? `. Reason: ${reason}` : ""}. You have a grace period to cancel.`;
            if (isReceiver)
                return `A teacher has requested deletion of their account. Review it in Admin Actions.`;
            return "An account deletion was requested.";

        case "ACCOUNT_DELETION_CANCELLED":
            if (isActor)
                return "You cancelled your account deletion request. Your account remains active.";
            if (isReceiver)
                return "The account deletion request was cancelled by the teacher.";
            return "An account deletion request was cancelled.";

        case "ACCOUNT_DELETION_CANCELLED_BY_ADMIN":
            if (isActor)
                return "You cancelled a teacher's account deletion request.";
            if (isReceiver)
                return "Your account deletion request has been cancelled by an administrator. Your account remains active.";
            return "An account deletion request was cancelled by admin.";

        case "ACCOUNT_DELETION_INITIATED_BY_ADMIN":
            if (isActor)
                return `You initiated account deletion for a teacher${reason ? `. Reason: ${reason}` : ""}. Grace period has started.`;
            if (isReceiver)
                return `An administrator has scheduled your account for deletion${reason ? `. Reason: ${reason}` : ""}. You have a grace period before this takes effect.`;
            return "An administrator initiated account deletion for a teacher.";

        // ── Password ──────────────────────────────────────────────────────────────
        case "PASSWORD_CHANGED":
            return "Your password was changed successfully.";

        // ── Fallback ──────────────────────────────────────────────────────────────
        case "TEST_LOG":
            return "Test activity log entry.";

        default:
            return r.message || "Activity updated.";
    }
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

    const enriched = useMemo(
        () => (rows as FeedRow[]).map((r) => ({ ...r, _kind: classify(r) })),
        [rows],
    );

    const filtered = useMemo(() => {
        const s = q.trim().toLowerCase();
        return enriched.filter((r) => {
            const kindOk = filter === "all" ? true : r._kind === filter;
            if (!kindOk) return false;
            if (!s) return true;
            const msg = getDisplayMessage(r, viewerId).toLowerCase();
            return (
                msg.includes(s) || (r.action ?? "").toLowerCase().includes(s)
            );
        });
    }, [enriched, q, filter, viewerId]);

    const shown = filtered.slice(0, visible);
    const canLoadMore = visible < filtered.length;

    return (
        <Card className="overflow-hidden">
            {/* Header */}
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
                        onChange={(e) => setQ(e.target.value)}
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
                        {searchOpen ? (
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
                                    onChange={(e) => setQ(e.target.value)}
                                    placeholder="Search..."
                                    className="h-9"
                                />
                            </motion.div>
                        ) : null}
                    </AnimatePresence>
                </div>
            </CardHeader>

            {/* Filter bar */}
            <CardContent className="pt-0 pb-3">
                <div className="flex flex-wrap items-center gap-2">
                    <Badge variant="outline" className="gap-1">
                        <Filter className="h-3.5 w-3.5" />
                        Filter
                    </Badge>

                    {(
                        [
                            ["all", "All"],
                            ["approved", "Approved"],
                            ["rejected", "Rejected"],
                            ["compliance", "Compliance"],
                            ["requests", "Requests"],
                        ] as const
                    ).map(([k, label]) => (
                        <Button
                            key={k}
                            size="sm"
                            variant="outline"
                            className={`h-8 ${filter === k ? filterActiveClass(k) : "hover:bg-muted/40"}`}
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

            <Separator />

            {/* Activity items — inside the same card, visually distinct */}
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
                                        className={`rounded-lg border bg-muted/40 overflow-hidden hover:bg-muted/60 transition-colors ${accentClass(kind)}`}
                                    >
                                        <div className="flex gap-3 p-4">
                                            <div
                                                className={`mt-1 grid h-9 w-9 shrink-0 place-items-center rounded-full border ${iconBgClass(kind)}`}
                                            >
                                                {iconFor(kind)}
                                            </div>

                                            <div className="min-w-0 flex-1">
                                                <div className="flex flex-wrap items-center gap-2">
                                                    <Badge
                                                        variant="outline"
                                                        className={`capitalize ${badgeClass(kind)}`}
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
                                                    <div className="mt-3 rounded-md border bg-background/60 p-3 text-sm">
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

                    {filtered.length === 0 ? (
                        <div className="rounded-lg border bg-muted/30 py-10 text-center text-sm text-muted-foreground">
                            Nothing to show.
                        </div>
                    ) : null}

                    {canLoadMore ? (
                        <div className="flex justify-center pt-2">
                            <Button
                                variant="outline"
                                onClick={() => setVisible((v) => v + 8)}
                            >
                                Load more
                            </Button>
                        </div>
                    ) : null}
                </div>
            </CardContent>
        </Card>
    );
}
