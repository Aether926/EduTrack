"use client";

import React, { useEffect, useMemo, useState } from "react";
import { History, Clock, ChevronDown, ChevronUp, Plus } from "lucide-react";
import { PageNav } from "@/components/ui-elements/pagination/page-nav";
import {
    PAGE_SIZES,
    resolvePageSize,
} from "@/components/ui-elements/pagination/page-sizes";
import { Button } from "@/components/ui/button";
import { RequestAppointmentModal } from "@/features/profiles/components/modals/request-appointment-sheet";
import { useAppointment } from "@/features/profiles/appointment/hooks/use-appointment";
import type { AppointmentHistory } from "@/features/profiles/appointment/types/appointment";

// ── Badge colours ──────────────────────────────────────────────────────────────

const STATUS_COLORS: Record<string, string> = {
    PENDING: "bg-amber-500/15 text-amber-400 border-amber-500/30",
    APPROVED: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
    REJECTED: "bg-rose-500/15 text-rose-400 border-rose-500/30",
};

const TYPE_COLORS: Record<string, string> = {
    Original: "bg-blue-500/15 text-blue-400 border-blue-500/30",
    Promotion: "bg-violet-500/15 text-violet-400 border-violet-500/30",
    Reappointment: "bg-teal-500/15 text-teal-400 border-teal-500/30",
    Transfer: "bg-orange-500/15 text-orange-400 border-orange-500/30",
    Reinstatement: "bg-pink-500/15 text-pink-400 border-pink-500/30",
};

function Chip({ label, colorClass }: { label: string; colorClass: string }) {
    return (
        <span
            className={`inline-block rounded-full border px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wider ${colorClass}`}
        >
            {label}
        </span>
    );
}

// ── History row ────────────────────────────────────────────────────────────────

function HistoryRow({ row }: { row: AppointmentHistory }) {
    const [expanded, setExpanded] = useState(false);
    const typeClass =
        TYPE_COLORS[row.appointment_type] ??
        "bg-slate-500/15 text-slate-400 border-slate-500/30";

    return (
        <div className="rounded-lg border border-white/8 overflow-hidden">
            <button
                className="w-full flex items-center justify-between px-4 py-3 hover:bg-white/3 transition-colors text-left"
                onClick={() => setExpanded((v) => !v)}
                type="button"
            >
                <div className="flex items-center gap-3 flex-wrap">
                    <Chip label={row.appointment_type} colorClass={typeClass} />
                    <span className="text-sm font-medium text-foreground">
                        {row.position}
                    </span>
                </div>
                <div className="flex items-center gap-3 text-xs text-muted-foreground shrink-0">
                    <span className="font-mono">
                        {row.start_date
                            ? new Date(row.start_date).toLocaleDateString()
                            : "—"}
                    </span>
                    {expanded ? (
                        <ChevronUp size={13} />
                    ) : (
                        <ChevronDown size={13} />
                    )}
                </div>
            </button>

            {expanded && (
                <div className="px-4 pb-4 pt-3 space-y-2 border-t border-white/8 text-sm">
                    {row.end_date && (
                        <div className="flex gap-2">
                            <span className="w-32 text-muted-foreground text-[11px] uppercase tracking-wider font-medium">
                                End Date
                            </span>
                            <span className="font-mono text-xs">
                                {new Date(row.end_date).toLocaleDateString()}
                            </span>
                        </div>
                    )}
                    {row.memo_no && (
                        <div className="flex gap-2">
                            <span className="w-32 text-muted-foreground text-[11px] uppercase tracking-wider font-medium">
                                Memo No.
                            </span>
                            <span className="text-sm">{row.memo_no}</span>
                        </div>
                    )}
                    {row.remarks && (
                        <div className="flex gap-2">
                            <span className="w-32 text-muted-foreground text-[11px] uppercase tracking-wider font-medium">
                                Remarks
                            </span>
                            <span className="text-sm">{row.remarks}</span>
                        </div>
                    )}
                    {row.approved_at && (
                        <div className="flex gap-2">
                            <span className="w-32 text-muted-foreground text-[11px] uppercase tracking-wider font-medium">
                                Approved At
                            </span>
                            <span className="font-mono text-xs">
                                {new Date(row.approved_at).toLocaleDateString()}
                            </span>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

// ── Main export ────────────────────────────────────────────────────────────────

export default function AppointmentHistoryCard(props: {
    teacherId: string;
    isOwnProfile?: boolean;
    from?: "profile" | "qr" | "teacher";
}) {
    const { teacherId, isOwnProfile = false, from = "profile" } = props;
    const [modalOpen, setModalOpen] = useState(false);
    const PAGE_SIZE = resolvePageSize(PAGE_SIZES.appointmentHistory);
    const [page, setPage] = useState(1);

    const {
        submitting,
        lastRequest,
        history,
        loading,
        hasPendingRequest,
        loadData,
        submitRequest,
    } = useAppointment(teacherId);

    useEffect(() => {
        if (teacherId) void loadData();
    }, [teacherId, loadData]);

    const showRequestButton = isOwnProfile && from === "profile";

    const isPending = useMemo(
        () =>
            hasPendingRequest ||
            lastRequest?.status?.toUpperCase() === "PENDING",
        [hasPendingRequest, lastRequest?.status],
    );

    const onSubmitGuarded: typeof submitRequest = async (payload) => {
        if (isPending)
            throw new Error(
                "You already have a pending request. Please wait for admin review.",
            );
        await submitRequest(payload);
        setModalOpen(false);
        await loadData();
        return true;
    };

    const totalPages = Math.ceil(history.length / PAGE_SIZE);
    const paginated = history.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

    return (
        <>
            <div className="border border-border/60 shadow-lg w-full overflow-hidden rounded-xl bg-card">
                {/* Header band */}
                <div className="relative px-6 py-4 border-b border-border/60 bg-gradient-to-br from-card to-background">
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-transparent to-violet-500/5 pointer-events-none" />
                    <div className="relative flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                        <div className="flex items-center gap-2.5">
                            <div className="rounded-lg border border-blue-500/20 bg-blue-500/10 p-2">
                                <History className="h-4 w-4 text-blue-400" />
                            </div>
                            <span className="text-base font-semibold text-foreground">
                                Appointment History
                            </span>
                        </div>
                        {showRequestButton && (
                            <div className="shrink-0">
                                {isPending ? (
                                    <span className="flex items-center gap-1.5 text-xs text-amber-400 bg-amber-500/10 border border-amber-500/30 px-3 py-1.5 rounded-full font-medium whitespace-nowrap">
                                        <Clock size={12} />
                                        Request Pending
                                    </span>
                                ) : (
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="flex items-center gap-2 whitespace-nowrap border-white/10 hover:bg-white/5 text-xs"
                                        onClick={() => setModalOpen(true)}
                                        disabled={loading}
                                    >
                                        <Plus size={14} />
                                        Add Appointment
                                    </Button>
                                )}
                            </div>
                        )}
                    </div>
                </div>

                {/* Body */}
                <div className="px-6 py-5 space-y-4">
                    {/* Last request status */}
                    {showRequestButton && lastRequest && (
                        <div className="flex items-center gap-2 text-sm">
                            <span className="text-muted-foreground text-[11px] uppercase tracking-wider font-medium">
                                Last request:
                            </span>
                            <Chip
                                label={lastRequest.status}
                                colorClass={
                                    STATUS_COLORS[lastRequest.status] ??
                                    "bg-slate-500/15 text-slate-400 border-slate-500/30"
                                }
                            />
                            {lastRequest.review_note && (
                                <span className="text-muted-foreground text-xs truncate">
                                    — {lastRequest.review_note}
                                </span>
                            )}
                        </div>
                    )}

                    {loading ? (
                        <p className="text-sm text-muted-foreground">
                            Loading...
                        </p>
                    ) : history.length === 0 ? (
                        <div className="px-3 py-4 rounded-md bg-white/5 border border-white/8 text-sm text-muted-foreground text-center">
                            No appointment history yet.
                        </div>
                    ) : (
                        <>
                            <div className="space-y-2">
                                {paginated.map((row) => (
                                    <HistoryRow key={row.id} row={row} />
                                ))}
                            </div>
                            {totalPages > 1 && (
                                <PageNav
                                    page={page}
                                    totalPages={totalPages}
                                    onPageChange={setPage}
                                />
                            )}
                        </>
                    )}
                    <p className="text-[11px] text-muted-foreground/60 leading-relaxed pt-2 border-t border-white/8">
                        This section keeps a record of all positions held. Use
                        the{" "}
                        <span className="text-muted-foreground font-medium">
                            Add Appointment
                        </span>{" "}
                        button to log a past or current appointment for accurate
                        employment history.
                    </p>
                </div>
            </div>

            <RequestAppointmentModal
                open={modalOpen}
                onOpenChange={setModalOpen}
                submitting={submitting}
                onSubmit={onSubmitGuarded}
            />
        </>
    );
}
