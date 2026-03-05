"use client";

/* eslint-disable @typescript-eslint/no-explicit-any */

import React, { useState } from "react";
import { CheckCircle, XCircle, ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { useHRQueue } from "@/features/admin-actions/queue/hooks/use-admin-queue";
import type { RequestWithTeacher } from "@/features/admin-actions/queue/types/queue";

const PAYLOAD_LABELS: Record<string, string> = {
    employeeId: "Employee ID",
    position: "Position",
    plantillaNo: "Plantilla No.",
    positionId: "Position ID",
    dateOfOriginalAppointment: "Original Appointment",
    dateOfLatestAppointment: "Latest Appointment",
    reason: "Reason",
};

function statusClass(status: string) {
    if (status === "APPROVED")
        return "bg-green-500/10 text-green-700 border-green-500/20";
    if (status === "REJECTED")
        return "bg-red-500/10 text-red-700 border-red-500/20";
    return "bg-yellow-500/10 text-yellow-800 border-yellow-500/20";
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
        <div className="rounded-lg border bg-muted/10 overflow-hidden">
            <button
                className="w-full text-left p-3 hover:bg-muted/20 transition-colors"
                onClick={() => setExpanded((v) => !v)}
            >
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                            <span className="text-sm font-medium truncate">
                                {fullName}
                            </span>
                            <span className="text-xs text-muted-foreground truncate">
                                {teacher?.email ?? "—"}
                            </span>
                            <Badge
                                variant="outline"
                                className={statusClass(request.status)}
                            >
                                {request.status}
                            </Badge>
                        </div>
                    </div>

                    <div className="flex items-center gap-2 text-xs text-muted-foreground shrink-0">
                        <span>
                            {new Date(
                                request.requested_at,
                            ).toLocaleDateString()}
                        </span>
                        {expanded ? (
                            <ChevronUp size={14} />
                        ) : (
                            <ChevronDown size={14} />
                        )}
                    </div>
                </div>
            </button>

            {expanded ? (
                <div className="border-t p-3 space-y-3">
                    <div className="space-y-2">
                        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                            Requested Changes
                        </p>

                        <div className="grid gap-2 sm:grid-cols-2">
                            {Object.entries(request.payload ?? {}).map(
                                ([key, val]) => {
                                    if (!val) return null;
                                    return (
                                        <div
                                            key={key}
                                            className="rounded-md border bg-background p-3"
                                        >
                                            <div className="text-xs text-muted-foreground">
                                                {PAYLOAD_LABELS[key] ?? key}
                                            </div>
                                            <div className="text-sm font-medium break-words">
                                                {String(val)}
                                            </div>
                                        </div>
                                    );
                                },
                            )}
                        </div>
                    </div>

                    {request.status === "PENDING" ? (
                        <div className="space-y-2">
                            <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                                Review Note{" "}
                                <span className="font-normal">
                                    (required for rejection)
                                </span>
                            </div>

                            <Textarea
                                rows={3}
                                placeholder="Add a note..."
                                value={note}
                                onChange={(e) => setNote(e.target.value)}
                            />

                            <div className="flex flex-col sm:flex-row gap-2 justify-end">
                                <Button
                                    size="sm"
                                    className="flex items-center gap-1.5 bg-green-600 hover:bg-green-700 text-white"
                                    onClick={handleApprove}
                                    disabled={loading}
                                >
                                    <CheckCircle size={14} />
                                    Approve
                                </Button>

                                <Button
                                    size="sm"
                                    variant="outline"
                                    className="flex items-center gap-1.5 border-red-300 text-red-600 hover:bg-red-50"
                                    onClick={handleReject}
                                    disabled={loading}
                                >
                                    <XCircle size={14} />
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
            ) : null}
        </div>
    );
}
