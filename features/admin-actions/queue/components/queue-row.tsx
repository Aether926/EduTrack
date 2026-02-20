"use client";

import React, { useState } from "react";
import { CheckCircle, XCircle, ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useHRQueue } from "@/features/admin-actions/queue/hooks/use-admin-queue";
import type { RequestWithTeacher } from "@/features/admin-actions/queue/types/queue";

const STATUS_STYLE: Record<string, string> = {
  PENDING: "bg-yellow-100 text-yellow-800",
  APPROVED: "bg-green-100 text-green-800",
  REJECTED: "bg-red-100 text-red-800",
};

const PAYLOAD_LABELS: Record<string, string> = {
  employeeId: "Employee ID",
  position: "Position",
  plantillaNo: "Plantilla No.",
  positionId: "Position ID",
  dateOfOriginalAppointment: "Original Appointment",
  dateOfLatestAppointment: "Latest Appointment",
  reason: "Reason",
};

export function HRQueueRow(props: {
  request: RequestWithTeacher;
  onRefresh: (id: string, status: "APPROVED" | "REJECTED") => void;
}) {
  const { request, onRefresh } = props;
  const [expanded, setExpanded] = useState(false);
  const [note, setNote] = useState("");
  const { loading, approve, reject } = useHRQueue();

  const teacher = request.teacher;
  const fullName = teacher ? `${teacher.firstName} ${teacher.lastName}` : "Unknown";

  const handleApprove = async () => {
    const ok = await approve(request.id, note || undefined);
    if (ok) onRefresh(request.id, "APPROVED");
  };

  const handleReject = async () => {
    const ok = await reject(request.id, note);
    if (ok) onRefresh(request.id, "REJECTED");
  };

  return (
    <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
      <button
        className="w-full flex items-center justify-between px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors text-left"
        onClick={() => setExpanded((v) => !v)}
      >
        <div className="flex items-center gap-3">
          <span className="font-medium text-sm">{fullName}</span>
          <span className="text-xs text-gray-400">{teacher?.email}</span>
          <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${STATUS_STYLE[request.status]}`}>
            {request.status}
          </span>
        </div>
        <div className="flex items-center gap-3 text-xs text-gray-400">
          <span>{new Date(request.requested_at).toLocaleDateString()}</span>
          {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        </div>
      </button>

      {expanded && (
        <div className="px-4 pb-4 pt-4 space-y-4 border-t border-gray-100 dark:border-gray-700">
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
              Requested Changes
            </p>
            <div className="space-y-2">
              {Object.entries(request.payload).map(([key, val]) => {
                if (!val) return null;
                return (
                  <div key={key} className="flex gap-2 text-sm">
                    <span className="w-48 text-gray-500 shrink-0">
                      {PAYLOAD_LABELS[key] ?? key}
                    </span>
                    <span className="font-medium">{String(val)}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {request.status === "PENDING" && (
            <div className="space-y-3">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
                  Review Note
                  <span className="text-gray-400 font-normal ml-1">
                    (required for rejection)
                  </span>
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