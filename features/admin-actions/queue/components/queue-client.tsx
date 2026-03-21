"use client";

/* eslint-disable @typescript-eslint/no-explicit-any */

import React, { useEffect, useMemo, useState } from "react";
import {
    ClipboardList,
    Briefcase,
    BookMarked,
    ChevronDown,
    ChevronUp,
    ChevronLeft,
    ChevronRight,
    CheckCircle,
    XCircle,
} from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { motion, AnimatePresence } from "framer-motion";
import InitialAvatar from "@/components/ui-elements/avatars/avatar-color";

import { HRQueueRow } from "@/features/admin-actions/queue/components/queue-row";
import { AppointmentQueueRow } from "@/features/admin-actions/queue/components/appointment-queue-row";
import type {
    RequestWithTeacher,
    AppointmentRequestWithTeacher,
    ResponsibilityRequestWithTeacher,
} from "@/features/admin-actions/queue/types/queue";
import {
    approveChangeRequest,
    rejectChangeRequest,
} from "@/features/admin-actions/responsibilities/actions/admin-responsibility-actions";
import { toast } from "sonner";

// ── Status badge ───────────────────────────────────────────────────────────────

function MiniStatusBadge({ status }: { status: string }) {
    const s = (status ?? "").toUpperCase();
    if (s === "APPROVED")
        return (
            <span className="inline-flex items-center gap-1 rounded-full border border-emerald-500/30 bg-emerald-500/15 px-2 py-0.5 text-[10px] font-semibold text-emerald-400">
                <span className="h-1 w-1 rounded-full bg-emerald-400" />
                Approved
            </span>
        );
    if (s === "REJECTED")
        return (
            <span className="inline-flex items-center gap-1 rounded-full border border-rose-500/30 bg-rose-500/15 px-2 py-0.5 text-[10px] font-semibold text-rose-400">
                <span className="h-1 w-1 rounded-full bg-rose-400" />
                Rejected
            </span>
        );
    return (
        <span className="inline-flex items-center gap-1 rounded-full border border-amber-500/30 bg-amber-500/15 px-2 py-0.5 text-[10px] font-semibold text-amber-400">
            <span className="h-1 w-1 rounded-full bg-amber-400" />
            Pending
        </span>
    );
}

function StatusBadge({ status }: { status: string }) {
    const s = status.toUpperCase();
    if (s === "APPROVED")
        return (
            <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/15 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-400">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                Approved
            </span>
        );
    if (s === "REJECTED")
        return (
            <span className="inline-flex items-center gap-1.5 rounded-full border border-rose-500/30 bg-rose-500/15 px-2.5 py-0.5 text-[11px] font-semibold text-rose-400">
                <span className="h-1.5 w-1.5 rounded-full bg-rose-400" />
                Rejected
            </span>
        );
    return (
        <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-500/30 bg-amber-500/15 px-2.5 py-0.5 text-[11px] font-semibold text-amber-400">
            <span className="h-1.5 w-1.5 rounded-full bg-amber-400" />
            Pending
        </span>
    );
}

// ── Queue row shell ────────────────────────────────────────────────────────────

function QueueRowShell({
    fullName,
    email,
    status,
    date,
    expanded,
    onToggle,
    children,
    sub,
}: {
    fullName: string;
    email?: string;
    status: string;
    date: string;
    expanded: boolean;
    onToggle: () => void;
    children: React.ReactNode;
    sub?: React.ReactNode;
}) {
    return (
        <div className="rounded-lg border border-border/50 bg-background/50 overflow-hidden transition-colors hover:bg-accent/10">
            <button className="w-full text-left px-4 py-2.5" onClick={onToggle}>
                {/* Mobile layout */}
                <div className="flex gap-3 sm:hidden">
                    <InitialAvatar
                        name={fullName}
                        className="h-8 w-8 text-xs shrink-0 mt-0.5"
                    />
                    <div className="min-w-0 flex-1">
                        <p className="text-sm font-semibold truncate leading-tight">
                            {fullName}
                        </p>
                        <p className="text-xs text-muted-foreground truncate leading-tight mt-0.5">
                            {email ?? "—"}
                        </p>
                        <div className="flex items-center gap-2 mt-1.5">
                            <MiniStatusBadge status={status} />
                            <span className="text-xs text-muted-foreground font-mono">
                                {date}
                            </span>
                            <span className="text-muted-foreground ml-auto">
                                {expanded ? (
                                    <ChevronUp className="h-3 w-3" />
                                ) : (
                                    <ChevronDown className="h-3 w-3" />
                                )}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Desktop layout */}
                <div
                    className="hidden sm:grid items-center gap-x-3"
                    style={{
                        gridTemplateColumns:
                            "auto minmax(0,1fr) 100px 72px 20px",
                    }}
                >
                    <InitialAvatar
                        name={fullName}
                        className="h-8 w-8 text-xs"
                    />
                    <div className="min-w-0">
                        <p className="text-sm font-semibold truncate leading-tight">
                            {fullName}
                        </p>
                        <p className="text-xs text-muted-foreground leading-tight mt-0.5 break-all">
                            {email ?? "—"}
                        </p>
                    </div>
                    <div className="shrink-0">
                        <StatusBadge status={status} />
                    </div>
                    <span className="text-xs text-muted-foreground font-mono whitespace-nowrap text-right">
                        {date}
                    </span>
                    <span className="text-muted-foreground pl-2">
                        {expanded ? (
                            <ChevronUp className="h-3.5 w-3.5" />
                        ) : (
                            <ChevronDown className="h-3.5 w-3.5" />
                        )}
                    </span>
                </div>
            </button>
            <AnimatePresence initial={false}>
                {expanded && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.18 }}
                        className="overflow-hidden"
                    >
                        <div className="border-t border-border/50 px-4 py-4 space-y-4">
                            {children}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

// ── Review actions ─────────────────────────────────────────────────────────────

function ReviewActions({
    note,
    onNoteChange,
    onApprove,
    onReject,
    loading,
}: {
    note: string;
    onNoteChange: (v: string) => void;
    onApprove: () => void;
    onReject: () => void;
    loading: boolean;
}) {
    return (
        <div className="space-y-3">
            <div className="h-px bg-border/50" />
            <div>
                <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">
                    Review Note{" "}
                    <span className="font-normal normal-case">
                        (required for rejection)
                    </span>
                </p>
                <Textarea
                    rows={2}
                    placeholder="Add a note..."
                    value={note}
                    onChange={(e) => onNoteChange(e.target.value)}
                    className="bg-white/5 border-white/10 focus:border-blue-500/50 resize-none text-sm"
                />
            </div>
            <div className="flex gap-2 justify-end">
                <Button
                    size="sm"
                    className="gap-1.5 bg-emerald-600 hover:bg-emerald-500 text-white"
                    onClick={onApprove}
                    disabled={loading}
                >
                    <CheckCircle className="h-3.5 w-3.5" />
                    Approve
                </Button>
                <Button
                    size="sm"
                    variant="outline"
                    className="gap-1.5 border-rose-500/30 text-rose-400 hover:bg-rose-500/10"
                    onClick={onReject}
                    disabled={loading}
                >
                    <XCircle className="h-3.5 w-3.5" />
                    Reject
                </Button>
            </div>
        </div>
    );
}

// ── Detail grid ────────────────────────────────────────────────────────────────

function DetailGrid({ entries }: { entries: Array<[string, any]> }) {
    const filtered = entries.filter(([, v]) => v != null && v !== "");
    if (!filtered.length) return null;
    return (
        <div className="grid gap-2 sm:grid-cols-2">
            {filtered.map(([label, val]) => (
                <div
                    key={label}
                    className="rounded-md border border-border/50 bg-muted/10 p-3"
                >
                    <div className="text-[11px] text-muted-foreground uppercase tracking-wider font-medium mb-0.5">
                        {label}
                    </div>
                    <div className="text-sm font-medium break-words">
                        {String(val)}
                    </div>
                </div>
            ))}
        </div>
    );
}

// ── Responsibility queue row ───────────────────────────────────────────────────

function ResponsibilityQueueRow(props: {
    request: ResponsibilityRequestWithTeacher;
    onRefresh: (id: string, status: "APPROVED" | "REJECTED") => void;
}) {
    const { request: r, onRefresh } = props;
    const [expanded, setExpanded] = useState(false);
    const [note, setNote] = useState("");
    const [loading, setLoading] = useState(false);

    const teacher = r.teacher;
    const fullName = teacher
        ? `${teacher.firstName} ${teacher.lastName}`
        : "Unknown";

    const handleApprove = async () => {
        setLoading(true);
        try {
            await approveChangeRequest(r.id, note || undefined);
            toast.success("Request approved.");
            onRefresh(r.id, "APPROVED");
        } catch (e) {
            toast.error(e instanceof Error ? e.message : "Failed.");
        } finally {
            setLoading(false);
        }
    };

    const handleReject = async () => {
        if (!note.trim()) return toast.info("Please provide a rejection note.");
        setLoading(true);
        try {
            await rejectChangeRequest(r.id, note);
            toast.success("Request rejected.");
            onRefresh(r.id, "REJECTED");
        } catch (e) {
            toast.error(e instanceof Error ? e.message : "Failed.");
        } finally {
            setLoading(false);
        }
    };

    const entries = Object.entries(r.requested_changes ?? {}).map(
        ([k, v]) => [k.replaceAll("_", " "), v] as [string, any],
    );

    return (
        <QueueRowShell
            fullName={fullName}
            email={teacher?.email}
            status={r.status}
            date={new Date(r.requested_at).toLocaleDateString()}
            expanded={expanded}
            onToggle={() => setExpanded((v) => !v)}
        >
            <div>
                <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                    Requested Changes
                </p>
                <DetailGrid entries={entries} />
            </div>
            {r.reason && (
                <div className="rounded-md border border-border/50 bg-muted/10 p-3">
                    <div className="text-[11px] text-muted-foreground uppercase tracking-wider font-medium mb-0.5">
                        Reason
                    </div>
                    <div className="text-sm">{r.reason}</div>
                </div>
            )}
            {r.status === "PENDING" ? (
                <ReviewActions
                    note={note}
                    onNoteChange={setNote}
                    onApprove={handleApprove}
                    onReject={handleReject}
                    loading={loading}
                />
            ) : r.review_note ? (
                <div className="rounded-md border border-border/50 bg-muted/10 p-3 text-sm text-muted-foreground italic">
                    Note: {r.review_note}
                </div>
            ) : null}
        </QueueRowShell>
    );
}

// ── Paginated list ─────────────────────────────────────────────────────────────

function PaginatedList<T extends { id: string }>({
    items,
    renderItem,
    emptyMessage,
}: {
    items: T[];
    renderItem: (item: T) => React.ReactNode;
    emptyMessage: string;
}) {
    const [isMobile, setIsMobile] = useState(
        () =>
            typeof window !== "undefined" &&
            window.matchMedia("(max-width: 767px)").matches,
    );
    const [page, setPage] = useState(1);

    useEffect(() => {
        const mq = window.matchMedia("(max-width: 767px)");
        const handler = (e: MediaQueryListEvent) => {
            setIsMobile(e.matches);
            setPage(1);
        };
        mq.addEventListener("change", handler);
        return () => mq.removeEventListener("change", handler);
    }, []);

    const pageSize = isMobile ? 6 : 10;
    const totalPages = Math.max(1, Math.ceil(items.length / pageSize));
    const safePage = Math.min(page, totalPages);
    const slice = items.slice((safePage - 1) * pageSize, safePage * pageSize);

    if (items.length === 0) {
        return (
            <p className="py-8 text-center text-sm text-muted-foreground">
                {emptyMessage}
            </p>
        );
    }

    const pageNumbers: (number | "ellipsis")[] = [];
    const spread = isMobile ? 0 : 1;
    for (let i = 1; i <= totalPages; i++) {
        if (
            i === 1 ||
            i === totalPages ||
            (i >= safePage - spread && i <= safePage + spread)
        ) {
            pageNumbers.push(i);
        } else if (pageNumbers[pageNumbers.length - 1] !== "ellipsis") {
            pageNumbers.push("ellipsis");
        }
    }

    return (
        <div className="space-y-3">
            <div className="space-y-2">
                {slice.map((item) => renderItem(item))}
            </div>

            {totalPages > 1 && (
                <div className="pt-1 w-full">
                    <div className="flex items-center justify-center gap-1 flex-nowrap">
                        {/* Prev */}
                        <button
                            onClick={() => setPage((p) => Math.max(1, p - 1))}
                            disabled={safePage === 1}
                            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-input bg-background text-sm hover:bg-accent disabled:pointer-events-none disabled:opacity-40"
                        >
                            <ChevronLeft className="h-3.5 w-3.5" />
                        </button>

                        {/* Page numbers */}
                        {pageNumbers.map((p, i) =>
                            p === "ellipsis" ? (
                                <span
                                    key={`e-${i}`}
                                    className="flex h-8 w-6 shrink-0 items-center justify-center text-xs text-muted-foreground"
                                >
                                    …
                                </span>
                            ) : (
                                <button
                                    key={p}
                                    onClick={() => setPage(p)}
                                    className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-md border text-xs font-medium transition-colors ${
                                        p === safePage
                                            ? "border-primary bg-primary text-primary-foreground"
                                            : "border-input bg-background hover:bg-accent"
                                    }`}
                                >
                                    {p}
                                </button>
                            ),
                        )}

                        {/* Next */}
                        <button
                            onClick={() =>
                                setPage((p) => Math.min(totalPages, p + 1))
                            }
                            disabled={safePage === totalPages}
                            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-input bg-background text-sm hover:bg-accent disabled:pointer-events-none disabled:opacity-40"
                        >
                            <ChevronRight className="h-3.5 w-3.5" />
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}

// ── Queue card ─────────────────────────────────────────────────────────────────

const accentMap: Record<string, { icon: string; iconBg: string }> = {
    employment: {
        icon: "text-blue-400",
        iconBg: "bg-blue-500/10 border-blue-500/20",
    },
    appointment: {
        icon: "text-amber-400",
        iconBg: "bg-amber-500/10 border-amber-500/20",
    },
    responsibility: {
        icon: "text-violet-400",
        iconBg: "bg-violet-500/10 border-violet-500/20",
    },
};

function QueueCard(props: {
    accentKey: keyof typeof accentMap;
    icon: React.ReactNode;
    title: string;
    pendingCount: number;
    reviewedCount: number;
    pending: React.ReactNode;
    reviewed: React.ReactNode;
}) {
    const {
        accentKey,
        icon,
        title,
        pendingCount,
        reviewedCount,
        pending,
        reviewed,
    } = props;
    const [tab, setTab] = useState<"PENDING" | "REVIEWED">("PENDING");
    const accent = accentMap[accentKey];
    const activeCount = tab === "PENDING" ? pendingCount : reviewedCount;

    return (
        <Card className="min-w-0 overflow-hidden">
            <CardHeader className="gap-3 md:flex-row md:items-center md:justify-between">
                <div className="flex items-center gap-3 shrink-0">
                    <div
                        className={`rounded-lg border p-2.5 shrink-0 ${accent.iconBg}`}
                    >
                        <div className={accent.icon}>{icon}</div>
                    </div>
                    <div className="space-y-1">
                        <p className="text-base font-semibold leading-none">
                            {title}
                        </p>
                        <p className="text-[13px] text-muted-foreground">
                            {activeCount} result{activeCount === 1 ? "" : "s"} •{" "}
                            {pendingCount} pending, {reviewedCount} reviewed
                        </p>
                    </div>
                </div>

                <div className="flex rounded-lg border border-border/60 overflow-hidden bg-muted/30 p-0.5 gap-0.5 shrink-0">
                    {(["PENDING", "REVIEWED"] as const).map((t) => {
                        const count =
                            t === "PENDING" ? pendingCount : reviewedCount;
                        return (
                            <button
                                key={t}
                                onClick={() => setTab(t)}
                                className={`flex-1 flex items-center justify-center gap-2 rounded-md px-3 py-1.5 text-sm font-medium transition-all duration-150 ${
                                    tab === t
                                        ? "bg-background text-foreground shadow-sm"
                                        : "text-muted-foreground hover:text-foreground"
                                }`}
                            >
                                {t.charAt(0) + t.slice(1).toLowerCase()}
                                <span
                                    className={`text-xs tabular-nums ${
                                        tab === t
                                            ? "text-foreground"
                                            : "text-muted-foreground"
                                    }`}
                                >
                                    {count}
                                </span>
                            </button>
                        );
                    })}
                </div>
            </CardHeader>

            <CardContent className="pt-0 px-4 pb-4">
                <div className="rounded-xl border border-border/60 bg-muted/20 overflow-hidden">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={tab}
                            initial={{ opacity: 0, y: 4 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.15 }}
                            className="p-3"
                        >
                            {tab === "PENDING" ? pending : reviewed}
                        </motion.div>
                    </AnimatePresence>
                </div>
            </CardContent>
        </Card>
    );
}

// ── Main export ────────────────────────────────────────────────────────────────

export function HRQueueClient(props: {
    hrRequests: RequestWithTeacher[];
    apptRequests: AppointmentRequestWithTeacher[];
    respRequests: ResponsibilityRequestWithTeacher[];
}) {
    const { hrRequests, apptRequests, respRequests } = props;

    const [hrList, setHrList] = useState(hrRequests);
    const [apptList, setApptList] = useState(apptRequests);
    const [respList, setRespList] = useState(respRequests);

    const handleHRRefresh = (id: string, status: "APPROVED" | "REJECTED") =>
        setHrList((p) => p.map((r) => (r.id === id ? { ...r, status } : r)));
    const handleApptRefresh = (id: string, status: "APPROVED" | "REJECTED") =>
        setApptList((p) => p.map((r) => (r.id === id ? { ...r, status } : r)));
    const handleRespRefresh = (id: string, status: "APPROVED" | "REJECTED") =>
        setRespList((p) => p.map((r) => (r.id === id ? { ...r, status } : r)));

    const pendingHR = useMemo(
        () => hrList.filter((r) => r.status === "PENDING"),
        [hrList],
    );
    const reviewedHR = useMemo(
        () => hrList.filter((r) => r.status !== "PENDING"),
        [hrList],
    );
    const pendingAppt = useMemo(
        () => apptList.filter((r) => r.status === "PENDING"),
        [apptList],
    );
    const reviewedAppt = useMemo(
        () => apptList.filter((r) => r.status !== "PENDING"),
        [apptList],
    );
    const pendingResp = useMemo(
        () => respList.filter((r) => r.status === "PENDING"),
        [respList],
    );
    const reviewedResp = useMemo(
        () => respList.filter((r) => r.status !== "PENDING"),
        [respList],
    );

    return (
        <div className="grid gap-4">
            <QueueCard
                accentKey="employment"
                icon={<ClipboardList className="h-4 w-4" />}
                title="Employment Info"
                pendingCount={pendingHR.length}
                reviewedCount={reviewedHR.length}
                pending={
                    <PaginatedList
                        items={pendingHR}
                        emptyMessage="No pending employment requests."
                        renderItem={(r) => (
                            <HRQueueRow
                                key={r.id}
                                request={r}
                                onRefresh={handleHRRefresh}
                            />
                        )}
                    />
                }
                reviewed={
                    <PaginatedList
                        items={reviewedHR}
                        emptyMessage="No reviewed employment requests yet."
                        renderItem={(r) => (
                            <HRQueueRow
                                key={r.id}
                                request={r}
                                onRefresh={handleHRRefresh}
                            />
                        )}
                    />
                }
            />

            <QueueCard
                accentKey="appointment"
                icon={<Briefcase className="h-4 w-4" />}
                title="Appointment Changes"
                pendingCount={pendingAppt.length}
                reviewedCount={reviewedAppt.length}
                pending={
                    <PaginatedList
                        items={pendingAppt}
                        emptyMessage="No pending appointment requests."
                        renderItem={(r) => (
                            <AppointmentQueueRow
                                key={r.id}
                                request={r}
                                onRefresh={handleApptRefresh}
                            />
                        )}
                    />
                }
                reviewed={
                    <PaginatedList
                        items={reviewedAppt}
                        emptyMessage="No reviewed appointment requests yet."
                        renderItem={(r) => (
                            <AppointmentQueueRow
                                key={r.id}
                                request={r}
                                onRefresh={handleApptRefresh}
                            />
                        )}
                    />
                }
            />

            <QueueCard
                accentKey="responsibility"
                icon={<BookMarked className="h-4 w-4" />}
                title="Responsibility Changes"
                pendingCount={pendingResp.length}
                reviewedCount={reviewedResp.length}
                pending={
                    <PaginatedList
                        items={pendingResp}
                        emptyMessage="No pending responsibility requests."
                        renderItem={(r) => (
                            <ResponsibilityQueueRow
                                key={r.id}
                                request={r}
                                onRefresh={handleRespRefresh}
                            />
                        )}
                    />
                }
                reviewed={
                    <PaginatedList
                        items={reviewedResp}
                        emptyMessage="No reviewed responsibility requests yet."
                        renderItem={(r) => (
                            <ResponsibilityQueueRow
                                key={r.id}
                                request={r}
                                onRefresh={handleRespRefresh}
                            />
                        )}
                    />
                }
            />
        </div>
    );
}
