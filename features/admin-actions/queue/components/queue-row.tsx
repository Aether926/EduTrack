"use client";

/* eslint-disable @typescript-eslint/no-explicit-any */

import React, { useState } from "react";
import { ChevronDown, ChevronUp, CheckCircle, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { motion, AnimatePresence } from "framer-motion";
import { useHRQueue } from "@/features/admin-actions/queue/hooks/use-admin-queue";
import type { RequestWithTeacher } from "@/features/admin-actions/queue/types/queue";
import InitialAvatar from "@/components/avatar-ui-color/avatar-color";

const PAYLOAD_LABELS: Record<string, string> = {
    employeeId: "Employee ID",
    position: "Position",
    plantillaNo: "Plantilla No.",
    positionId: "Position ID",
    dateOfOriginalAppointment: "Original Appointment",
    dateOfLatestAppointment: "Latest Appointment",
    reason: "Reason",
};

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
    const s = (status ?? "").toUpperCase();
    if (s === "APPROVED")
        return (
            <Badge className="inline-flex items-center justify-center gap-1.5 min-w-[90px] bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/15">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                Approved
            </Badge>
        );
    if (s === "REJECTED")
        return (
            <Badge className="inline-flex items-center justify-center gap-1.5 min-w-[90px] bg-rose-500/15 text-rose-400 border border-rose-500/30 hover:bg-rose-500/15">
                <span className="h-1.5 w-1.5 rounded-full bg-rose-400" />
                Rejected
            </Badge>
        );
    return (
        <Badge className="inline-flex items-center justify-center gap-1.5 min-w-[90px] bg-amber-500/15 text-amber-400 border border-amber-500/30 hover:bg-amber-500/15">
            <span className="h-1.5 w-1.5 rounded-full bg-amber-400" />
            Pending
        </Badge>
    );
}

export function HRQueueRow(props: {
    request: RequestWithTeacher;
    onRefresh: (id: string, status: "APPROVED" | "REJECTED") => void;
}) {
    const { request, onRefresh } = props;
    const [expanded, setExpanded] = useState(false);
    const [note, setNote] = useState("");
    const { loading, approve, reject } = useHRQueue();

    const teacher = request.teacher;
    const fullName = teacher
        ? `${teacher.firstName} ${teacher.lastName}`
        : "Unknown";

    const handleApprove = async () => {
        const ok = await approve(request.id, note || undefined);
        if (ok) onRefresh(request.id, "APPROVED");
    };
    const handleReject = async () => {
        const ok = await reject(request.id, note);
        if (ok) onRefresh(request.id, "REJECTED");
    };

    return (
        <div className="rounded-lg border border-border/50 bg-background/50 overflow-hidden transition-colors hover:bg-accent/10">
            <button
                className="w-full text-left px-4 py-2.5"
                onClick={() => setExpanded((v) => !v)}
            >
                {/* Mobile layout */}
                <div className="flex gap-3 sm:hidden">
                    <InitialAvatar
                        name={fullName}
                        src={teacher?.profileImage}
                        className="h-8 w-8 text-xs shrink-0 mt-0.5"
                    />
                    <div className="min-w-0 flex-1">
                        <p className="text-sm font-semibold truncate leading-tight">
                            {fullName}
                        </p>
                        <p className="text-xs text-muted-foreground truncate leading-tight mt-0.5">
                            {teacher?.email ?? "—"}
                        </p>
                        <div className="flex items-center gap-2 mt-1.5">
                            <MiniStatusBadge status={request.status} />
                            <span className="text-xs text-muted-foreground font-mono">
                                {new Date(
                                    request.requested_at,
                                ).toLocaleDateString()}
                            </span>
                            <span className="text-muted-foreground ml-auto">
                                {expanded ? (
                                    <ChevronUp size={13} />
                                ) : (
                                    <ChevronDown size={13} />
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
                        src={teacher?.profileImage}
                        className="h-8 w-8 text-xs"
                    />
                    <div className="min-w-0">
                        <p className="text-sm font-semibold truncate leading-tight">
                            {fullName}
                        </p>
                        <p className="text-xs text-muted-foreground leading-tight mt-0.5 break-all">
                            {teacher?.email ?? "—"}
                        </p>
                    </div>
                    <div className="shrink-0">
                        <StatusBadge status={request.status} />
                    </div>
                    <span className="text-xs text-muted-foreground font-mono whitespace-nowrap text-right">
                        {new Date(request.requested_at).toLocaleDateString()}
                    </span>
                    <span className="text-muted-foreground pl-2">
                        {expanded ? (
                            <ChevronUp size={14} />
                        ) : (
                            <ChevronDown size={14} />
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
                        transition={{ duration: 0.16 }}
                        className="overflow-hidden"
                    >
                        <div className="border-t border-border/50 p-3 space-y-3">
                            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                                Requested Changes
                            </p>
                            <div className="grid gap-2 sm:grid-cols-2">
                                {Object.entries(request.payload ?? {}).map(
                                    ([key, val]) =>
                                        val ? (
                                            <div
                                                key={key}
                                                className="rounded-md border bg-background p-3"
                                            >
                                                <div className="text-xs text-muted-foreground capitalize mb-0.5">
                                                    {PAYLOAD_LABELS[key] ?? key}
                                                </div>
                                                <div className="text-sm font-medium break-words">
                                                    {String(val)}
                                                </div>
                                            </div>
                                        ) : null,
                                )}
                            </div>

                            {request.status === "PENDING" ? (
                                <div className="space-y-2">
                                    <Textarea
                                        rows={3}
                                        placeholder="Review note (required for rejection)..."
                                        value={note}
                                        onChange={(e) =>
                                            setNote(e.target.value)
                                        }
                                    />
                                    <div className="flex flex-col sm:flex-row gap-2 justify-end">
                                        <Button
                                            size="sm"
                                            className="gap-1.5 bg-emerald-600 hover:bg-emerald-500 text-white"
                                            onClick={handleApprove}
                                            disabled={loading}
                                        >
                                            <CheckCircle className="h-3.5 w-3.5" />{" "}
                                            Approve
                                        </Button>
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            className="gap-1.5 border-rose-500/30 text-rose-400 hover:bg-rose-500/10"
                                            onClick={handleReject}
                                            disabled={loading}
                                        >
                                            <XCircle className="h-3.5 w-3.5" />{" "}
                                            Reject
                                        </Button>
                                    </div>
                                </div>
                            ) : request.review_note ? (
                                <div className="text-sm text-muted-foreground italic">
                                    Note: {request.review_note}
                                </div>
                            ) : null}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
