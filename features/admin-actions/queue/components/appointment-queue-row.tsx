"use client";

/* eslint-disable @typescript-eslint/no-explicit-any */

import React, { useState } from "react";
import { CheckCircle, XCircle, ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import {
  approveAppointmentRequest,
  rejectAppointmentRequest,
} from "@/features/admin-actions/queue/actions/queue-actions";
import type { AppointmentRequestWithTeacher } from "@/features/admin-actions/queue/types/queue";

function statusClass(status: string) {
  if (status === "APPROVED") return "bg-green-500/10 text-green-700 border-green-500/20";
  if (status === "REJECTED") return "bg-red-500/10 text-red-700 border-red-500/20";
  return "bg-yellow-500/10 text-yellow-800 border-yellow-500/20";
}

function typeClass(type: string) {
  const map: Record<string, string> = {
    Original: "bg-blue-500/10 text-blue-700 border-blue-500/20",
    Promotion: "bg-purple-500/10 text-purple-700 border-purple-500/20",
    Reappointment: "bg-teal-500/10 text-teal-700 border-teal-500/20",
    Transfer: "bg-orange-500/10 text-orange-700 border-orange-500/20",
    Reinstatement: "bg-pink-500/10 text-pink-700 border-pink-500/20",
  };
  return map[type] ?? "bg-muted text-muted-foreground border-border";
}

export function AppointmentQueueRow(props: {
  request: AppointmentRequestWithTeacher;
  onRefresh: (id: string, status: "APPROVED" | "REJECTED") => void;
}) {
  const { request, onRefresh } = props;
  const [expanded, setExpanded] = useState(false);
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(false);

  const teacher = request.teacher;
  const fullName = teacher ? `${teacher.firstName} ${teacher.lastName}` : "Unknown";

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

  const details: Array<[string, any]> = [
    ["Position", request.position],
    ["Type", request.appointment_type],
    ["Start Date", request.start_date ? new Date(request.start_date).toLocaleDateString() : null],
    ["End Date", request.end_date ? new Date(request.end_date).toLocaleDateString() : null],
    ["Memo No.", request.memo_no],
    ["School", (request.payload as Record<string, string> | null)?.school_name],
    ["Remarks", request.remarks],
  ];

  return (
    <div className="rounded-lg border bg-muted/10 overflow-hidden">
      <button
        className="w-full text-left p-3 hover:bg-muted/20 transition-colors"
        onClick={() => setExpanded((v) => !v)}
      >
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-sm font-medium truncate">{fullName}</span>
              <Badge variant="outline" className={typeClass(request.appointment_type)}>
                {request.appointment_type}
              </Badge>
              <span className="text-xs text-muted-foreground truncate">{request.position}</span>
              <Badge variant="outline" className={statusClass(request.status)}>
                {request.status}
              </Badge>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs text-muted-foreground shrink-0">
            <span>{new Date(request.requested_at).toLocaleDateString()}</span>
            {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </div>
        </div>
      </button>

      {expanded ? (
        <div className="border-t p-3 space-y-3">
          <div className="space-y-2">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
              Request Details
            </p>

            <div className="grid gap-2 sm:grid-cols-2">
              {details.map(([label, val]) =>
                val ? (
                  <div key={label} className="rounded-md border bg-background p-3">
                    <div className="text-xs text-muted-foreground">{label}</div>
                    <div className="text-sm font-medium break-words">{String(val)}</div>
                  </div>
                ) : null
              )}
            </div>
          </div>

          {request.status === "PENDING" ? (
            <div className="space-y-2">
              <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                Review Note <span className="font-normal">(required for rejection)</span>
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