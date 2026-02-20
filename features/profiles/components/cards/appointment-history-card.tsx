"use client";

import React, { useEffect, useMemo, useState } from "react";
import { History, Clock, ChevronDown, ChevronUp, Plus } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RequestAppointmentModal } from "@/features/profiles/components/modals/request-appointment-modal";
import { useAppointment } from "@/features/profiles/appointment/hooks/use-appointment";
import type { AppointmentHistory } from "@/features/profiles/appointment/types/appointment";

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

function HistoryRow({ row }: { row: AppointmentHistory }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
      <button
        className="w-full flex items-center justify-between px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors text-left"
        onClick={() => setExpanded((v) => !v)}
        type="button"
      >
        <div className="flex items-center gap-3 flex-wrap">
          <span
            className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
              TYPE_STYLE[row.appointment_type] ?? "bg-gray-100 text-gray-800"
            }`}
          >
            {row.appointment_type}
          </span>
          <span className="text-sm font-medium">{row.position}</span>
        </div>

        <div className="flex items-center gap-3 text-xs text-gray-400 shrink-0">
          <span>
            {row.start_date
              ? new Date(row.start_date).toLocaleDateString()
              : "—"}
          </span>
          {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        </div>
      </button>

      {expanded && (
        <div className="px-4 pb-4 pt-3 space-y-2 border-t border-gray-100 dark:border-gray-700 text-sm">
          {row.end_date && (
            <div className="flex gap-2">
              <span className="w-32 text-gray-500">End Date</span>
              <span>{new Date(row.end_date).toLocaleDateString()}</span>
            </div>
          )}

          {row.memo_no && (
            <div className="flex gap-2">
              <span className="w-32 text-gray-500">Memo No.</span>
              <span>{row.memo_no}</span>
            </div>
          )}

          {row.remarks && (
            <div className="flex gap-2">
              <span className="w-32 text-gray-500">Remarks</span>
              <span>{row.remarks}</span>
            </div>
          )}

          {row.approved_at && (
            <div className="flex gap-2">
              <span className="w-32 text-gray-500">Approved At</span>
              <span>{new Date(row.approved_at).toLocaleDateString()}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function AppointmentHistoryCard(props: {
  teacherId: string;
  isOwnProfile?: boolean;
  from?: "profile" | "qr" | "teacher";
}) {
  const { teacherId, isOwnProfile = false, from = "profile" } = props;
  const [modalOpen, setModalOpen] = useState(false);

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

  // extra safety: sometimes the hook flag can lag, so also check lastRequest
  const isPending = useMemo(() => {
    return (
      hasPendingRequest ||
      lastRequest?.status?.toUpperCase() === "PENDING"
    );
  }, [hasPendingRequest, lastRequest?.status]);

  // guard submit so teacher can't spam even if modal is open
  const onSubmitGuarded: typeof submitRequest = async (payload) => {
    if (isPending) {
      throw new Error(
        "You already have a pending request. Please wait for admin review."
      );
    }

    await submitRequest(payload);
    setModalOpen(false);
    await loadData();
    return true;
  };

  return (
    <>
      <Card className="flex flex-col border-0 shadow-lg">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <History className="text-blue-600" size={20} />
              <CardTitle>Appointment History</CardTitle>
            </div>

            {showRequestButton && (
              <div className="flex items-center gap-2">
                {isPending ? (
                  <span className="flex items-center gap-1.5 text-xs text-yellow-600 bg-yellow-100 dark:bg-yellow-900/30 px-3 py-1.5 rounded-full font-medium">
                    <Clock size={12} />
                    Request Pending
                  </span>
                ) : (
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex items-center gap-2"
                    onClick={() => setModalOpen(true)}
                    disabled={loading}
                  >
                    <Plus size={14} />
                    Add Appointement
                  </Button>
                )}
              </div>
            )}
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Last request status */}
          {showRequestButton && lastRequest && (
            <div className="flex items-center gap-2 text-sm">
              <span className="text-gray-500">Last request:</span>
              <span
                className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                  STATUS_STYLE[lastRequest.status] ?? "bg-gray-100 text-gray-800"
                }`}
              >
                {lastRequest.status}
              </span>
              {lastRequest.review_note && (
                <span className="text-gray-400 text-xs truncate">
                  — {lastRequest.review_note}
                </span>
              )}
            </div>
          )}

          {/* History list */}
          {loading ? (
            <p className="text-sm text-gray-400">Loading...</p>
          ) : history.length === 0 ? (
            <p className="text-sm text-gray-400">No appointment history yet.</p>
          ) : (
            <div className="space-y-3">
              {history.map((row) => (
                <HistoryRow key={row.id} row={row} />
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <RequestAppointmentModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        submitting={submitting}
        onSubmit={onSubmitGuarded}
      />
    </>
  );
}
