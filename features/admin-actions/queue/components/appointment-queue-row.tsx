"use client";

import React, { useState } from "react";
import { CheckCircle, XCircle, ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import {
  approveAppointmentRequest,
  rejectAppointmentRequest,
} from "@/features/admin-actions/queue/actions/queue-actions";
import type { AppointmentRequestWithTeacher } from "@/features/admin-actions/queue/types/queue";

const STATUS_STYLE: Record<string, string> = {
  PENDING: "bg-yellow-100 text-yellow-800",
  APPROVED: "bg-green-100 text-green-800",
  REJECTED: "bg-red-100 text-red-800",
};

const TYPE_STYLE: Record<string, string> = {
  Original: "bg-blue-100 text-blue-800",
  Promotion: "bg-purple-100 text-purple-800",
  Reappointment: "bg-teal-100 text-teal-800",
  Transfer: "bg-orange-100 text-orange-800",
  Reinstatement: "bg-pink-100 text-pink-800",
};

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

  return (
    <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
      <button
        className="w-full flex items-center justify-between px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors text-left"
        onClick={() => setExpanded((v) => !v)}
      >
        <div className="flex items-center gap-3 flex-wrap">
          <span className="font-medium text-sm">{fullName}</span>
          <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${TYPE_STYLE[request.appointment_type] ?? "bg-gray-100 text-gray-800"}`}>
            {request.appointment_type}
          </span>
          <span className="text-sm text-gray-600">{request.position}</span>
          <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${STATUS_STYLE[request.status]}`}>
            {request.status}
          </span>
        </div>
        <div className="flex items-center gap-3 text-xs text-gray-400 shrink-0">
          <span>{new Date(request.requested_at).toLocaleDateString()}</span>
          {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        </div>
      </button>

      {expanded && (
        <div className="px-4 pb-4 pt-4 space-y-4 border-t border-gray-100 dark:border-gray-700">
          {/* Details */}
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
              Request Details
            </p>
            <div className="space-y-2 text-sm">
              {[
                ["Position", request.position],
                ["Type", request.appointment_type],
                ["Start Date", request.start_date ? new Date(request.start_date).toLocaleDateString() : null],
                ["End Date", request.end_date ? new Date(request.end_date).toLocaleDateString() : null],
                ["Memo No.", request.memo_no],
                ["School", (request.payload as Record<string, string> | null)?.school_name],
                ["Remarks", request.remarks],
              ].map(([label, val]) => val ? (
                <div key={label} className="flex gap-2">
                  <span className="w-28 text-gray-500 shrink-0">{label}</span>
                  <span className="font-medium">{val}</span>
                </div>
              ) : null)}
            </div>
          </div>

          {/* Actions for PENDING */}
          {request.status === "PENDING" && (
            <div className="space-y-3">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
                  Review Note
                  <span className="text-gray-400 font-normal ml-1">(required for rejection)</span>
                </label>
                <textarea
                  className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-700 rounded-md bg-transparent resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={2}
                  placeholder="Add a note..."
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                />
              </div>
              <div className="flex gap-2">
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
          )}

          {request.status !== "PENDING" && request.review_note && (
            <div className="text-sm text-gray-500">
              <span className="font-medium">Note: </span>
              {request.review_note}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
