"use client";

import React, { useState } from "react";
import { ChevronDown, ChevronUp, CheckCircle, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import {
    approveAppointmentRequest,
    rejectAppointmentRequest,
} from "@/features/admin-actions/queue/actions/queue-actions";
import type { AppointmentRequestWithTeacher } from "@/features/admin-actions/queue/types/queue";
import { InitialAvatar } from "@/components/ui-elements/user-avatar";
import { StatusBadge } from "@/components/ui-elements/badges";

export function AppointmentQueueRow(props: {
    request: AppointmentRequestWithTeacher;
    onRefresh: (id: string, status: "APPROVED" | "REJECTED") => void;
}) {
    const { request, onRefresh } = props;
    const [expanded, setExpanded] = useState(false);
    const [note, setNote] = useState("");
    const [loading, setLoading] = useState(false);

    const teacher = request.teacher;
    const fullName = teacher
        ? `${teacher.firstName} ${teacher.lastName}`
        : "Unknown";

    const handleApprove = async () => {
        setLoading(true);
        try {
            await approveAppointmentRequest(request.id, note || undefined);
            toast.success("Appointment request approved.");
            onRefresh(request.id, "APPROVED");
        } catch (e) {
            toast.error(e instanceof Error ? e.message : "Failed to approve.");
        } finally {
            setLoading(false);
        }
    };

    const handleReject = async () => {
        if (!note.trim()) {
            toast.info("Please provide a note when rejecting.");
            return;
        }
        setLoading(true);
        try {
            await rejectAppointmentRequest(request.id, note);
            toast.success("Appointment request rejected.");
            onRefresh(request.id, "REJECTED");
        } catch (e) {
            toast.error(e instanceof Error ? e.message : "Failed to reject.");
        } finally {
            setLoading(false);
        }
    };

    /* eslint-disable @typescript-eslint/no-explicit-any */
    const details: Array<[string, any]> = [
        ["Position", request.position],
        ["Type", request.appointment_type],
        [
            "Start Date",
            request.start_date
                ? new Date(request.start_date).toLocaleDateString()
                : null,
        ],
        [
            "End Date",
            request.end_date
                ? new Date(request.end_date).toLocaleDateString()
                : null,
        ],
        ["Memo No.", request.memo_no],
        [
            "School",
            (request.payload as Record<string, string> | null)?.school_name,
        ],
        ["Remarks", request.remarks],
    ].filter(([, v]) => v != null && v !== "") as Array<[string, any]>;

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
                            <StatusBadge status={request.status} size="xs" />
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
                                Request Details
                            </p>
                            <div className="grid gap-2 sm:grid-cols-2">
                                {details.map(([label, val]) => (
                                    <div
                                        key={label}
                                        className="rounded-md border bg-background p-3"
                                    >
                                        <div className="text-xs text-muted-foreground capitalize mb-0.5">
                                            {label}
                                        </div>
                                        <div className="text-sm font-medium break-words">
                                            {String(val)}
                                        </div>
                                    </div>
                                ))}
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
