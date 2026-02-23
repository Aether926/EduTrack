"use client";

import React, { useState } from "react";
import { Clock } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
} from "@/features/responsibilities/actions/admin-responsibility-actions";
import { ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

function SectionHeader(props: { title: string; count: number }) {
  return (
    <div className="flex items-center justify-between">
      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
        {props.title}
      </p>
      <span className="text-xs px-2 py-0.5 rounded-full border border-border text-muted-foreground">
        {props.count}
      </span>
    </div>
  );
}

function QueueCard(props: {
  title: string;
  subtitle?: string;
  pendingCount: number;
  reviewedCount: number;
  pending: React.ReactNode;
  reviewed: React.ReactNode;
}) {
  const { title, subtitle, pendingCount, reviewedCount, pending, reviewed } =
    props;

  const [tab, setTab] = useState<"PENDING" | "REVIEWED">("PENDING");

  return (
    <Card className="border-0 shadow-lg">
      <CardHeader className="space-y-3">
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-1">
            <CardTitle className="text-base">{title}</CardTitle>
            {subtitle ? (
              <p className="text-sm text-muted-foreground">{subtitle}</p>
            ) : null}
          </div>

          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant={tab === "PENDING" ? "default" : "outline"}
              onClick={() => setTab("PENDING")}
            >
              Pending ({pendingCount})
            </Button>
            <Button
              size="sm"
              variant={tab === "REVIEWED" ? "default" : "outline"}
              onClick={() => setTab("REVIEWED")}
            >
              Reviewed ({reviewedCount})
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {tab === "PENDING" ? pending : reviewed}
      </CardContent>
    </Card>
  );
}

// ─── Responsibility Queue Row ──────────────────────────────────────
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

  const statusStyle =
    r.status === "APPROVED"
      ? "bg-green-100 text-green-800"
      : r.status === "REJECTED"
      ? "bg-red-100 text-red-800"
      : "bg-yellow-100 text-yellow-800";

  return (
    <div className="border border-border rounded-lg overflow-hidden">
      <button
        className="w-full flex items-center justify-between px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors text-left"
        onClick={() => setExpanded((v) => !v)}
      >
        <div className="flex items-center gap-3 flex-wrap">
          <span className="font-medium text-sm">{fullName}</span>
          <span className="text-xs text-muted-foreground">{teacher?.email}</span>
          <span
            className={`px-2 py-0.5 rounded-full text-xs font-semibold ${statusStyle}`}
          >
            {r.status}
          </span>
        </div>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <span>{new Date(r.requested_at).toLocaleDateString()}</span>
          {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        </div>
      </button>

      {expanded && (
        <div className="px-4 pb-4 pt-3 space-y-3 border-t border-border text-sm">
          <div className="space-y-1">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
              Requested Changes
            </p>
            {Object.entries(r.requested_changes).map(([key, val]) => (
              <div key={key} className="flex gap-2">
                <span className="w-32 text-muted-foreground capitalize">
                  {key}
                </span>
                <span className="font-medium">
                  {typeof val === "object"
                    ? JSON.stringify(val)
                    : String(val)}
                </span>
              </div>
            ))}
          </div>

          <div>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">
              Reason
            </p>
            <p>{r.reason}</p>
          </div>

          {r.status === "PENDING" && (
            <div className="space-y-2">
              <textarea
                className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-700 rounded-md bg-transparent resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={2}
                placeholder="Review note (required for rejection)..."
                value={note}
                onChange={(e) => setNote(e.target.value)}
              />
              <div className="flex gap-2">
                <Button
                  size="sm"
                  className="bg-green-600 hover:bg-green-700 text-white"
                  onClick={handleApprove}
                  disabled={loading}
                >
                  Approve
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="border-red-300 text-red-600 hover:bg-red-50"
                  onClick={handleReject}
                  disabled={loading}
                >
                  Reject
                </Button>
              </div>
            </div>
          )}

          {r.status !== "PENDING" && r.review_note && (
            <p className="text-muted-foreground italic">Note: {r.review_note}</p>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Main Queue Client ─────────────────────────────────────────────
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
    setHrList((prev) => prev.map((r) => (r.id === id ? { ...r, status } : r)));

  const handleApptRefresh = (id: string, status: "APPROVED" | "REJECTED") =>
    setApptList((prev) =>
      prev.map((r) => (r.id === id ? { ...r, status } : r))
    );

  const handleRespRefresh = (id: string, status: "APPROVED" | "REJECTED") =>
    setRespList((prev) =>
      prev.map((r) => (r.id === id ? { ...r, status } : r))
    );

  const pendingHR = hrList.filter((r) => r.status === "PENDING");
  const reviewedHR = hrList.filter((r) => r.status !== "PENDING");
  const pendingAppt = apptList.filter((r) => r.status === "PENDING");
  const reviewedAppt = apptList.filter((r) => r.status !== "PENDING");
  const pendingResp = respList.filter((r) => r.status === "PENDING");
  const reviewedResp = respList.filter((r) => r.status !== "PENDING");

  const totalPending =
    pendingHR.length + pendingAppt.length + pendingResp.length;

  return (
    <main className="min-h-screen bg-background p-4 sm:p-6 lg:p-8">
      <div className="max-w-5xl mx-auto space-y-8">
        <header>
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-1">
            HR Change Request Queue
          </h1>
          <p className="text-sm text-muted-foreground">
            Review and approve or reject pending requests from teachers.
          </p>
        </header>

        <div className="rounded-lg border border-border bg-card p-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock size={18} className="text-yellow-500" />
            <div className="text-sm text-muted-foreground">Total pending</div>
          </div>
          <div className="text-lg font-semibold text-foreground">
            {totalPending}
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6">
          <QueueCard
            title="Employment Info"
            subtitle="ProfileHR change requests"
            pendingCount={pendingHR.length}
            reviewedCount={reviewedHR.length}
            pending={
              pendingHR.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  No pending employment requests.
                </p>
              ) : (
                <div className="space-y-2">
                  <SectionHeader title="pending" count={pendingHR.length} />
                  {pendingHR.map((r) => (
                    <HRQueueRow
                      key={r.id}
                      request={r}
                      onRefresh={handleHRRefresh}
                    />
                  ))}
                </div>
              )
            }
            reviewed={
              reviewedHR.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  No reviewed employment requests yet.
                </p>
              ) : (
                <div className="space-y-2">
                  <SectionHeader title="reviewed" count={reviewedHR.length} />
                  {reviewedHR.map((r) => (
                    <HRQueueRow
                      key={r.id}
                      request={r}
                      onRefresh={handleHRRefresh}
                    />
                  ))}
                </div>
              )
            }
          />

          <QueueCard
            title="Appointment Changes"
            subtitle="Appointment history change requests"
            pendingCount={pendingAppt.length}
            reviewedCount={reviewedAppt.length}
            pending={
              pendingAppt.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  No pending appointment requests.
                </p>
              ) : (
                <div className="space-y-2">
                  <SectionHeader title="pending" count={pendingAppt.length} />
                  {pendingAppt.map((r) => (
                    <AppointmentQueueRow
                      key={r.id}
                      request={r}
                      onRefresh={handleApptRefresh}
                    />
                  ))}
                </div>
              )
            }
            reviewed={
              reviewedAppt.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  No reviewed appointment requests yet.
                </p>
              ) : (
                <div className="space-y-2">
                  <SectionHeader title="reviewed" count={reviewedAppt.length} />
                  {reviewedAppt.map((r) => (
                    <AppointmentQueueRow
                      key={r.id}
                      request={r}
                      onRefresh={handleApptRefresh}
                    />
                  ))}
                </div>
              )
            }
          />

          <QueueCard
            title="Responsibility Changes"
            subtitle="Teacher responsibility change requests"
            pendingCount={pendingResp.length}
            reviewedCount={reviewedResp.length}
            pending={
              pendingResp.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  No pending responsibility requests.
                </p>
              ) : (
                <div className="space-y-2">
                  <SectionHeader title="pending" count={pendingResp.length} />
                  {pendingResp.map((r) => (
                    <ResponsibilityQueueRow
                      key={r.id}
                      request={r}
                      onRefresh={handleRespRefresh}
                    />
                  ))}
                </div>
              )
            }
            reviewed={
              reviewedResp.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  No reviewed responsibility requests yet.
                </p>
              ) : (
                <div className="space-y-2">
                  <SectionHeader title="reviewed" count={reviewedResp.length} />
                  {reviewedResp.map((r) => (
                    <ResponsibilityQueueRow
                      key={r.id}
                      request={r}
                      onRefresh={handleRespRefresh}
                    />
                  ))}
                </div>
              )
            }
          />
        </div>
      </div>
    </main>
  );
}