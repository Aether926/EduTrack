"use client";

/* eslint-disable @typescript-eslint/no-explicit-any */

import React, { useMemo, useState } from "react";
import { Clock, ClipboardList, Briefcase, BookMarked } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

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
import { toast } from "sonner";
import { Textarea } from "@/components/ui/textarea";

function QueueCard(props: {
  icon: React.ReactNode;
  title: string;
  subtitle?: string;
  pendingCount: number;
  reviewedCount: number;
  pending: React.ReactNode;
  reviewed: React.ReactNode;
}) {
  const { icon, title, subtitle, pendingCount, reviewedCount, pending, reviewed } = props;
  const [tab, setTab] = useState<"PENDING" | "REVIEWED">("PENDING");

  return (
    <Card className="min-w-0">
      <CardHeader className="space-y-2">
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-1 min-w-0">
            <div className="flex items-center gap-2 text-muted-foreground">
              <div className="rounded-md border bg-muted/10 p-2">{icon}</div>
              <CardTitle className="text-base truncate">{title}</CardTitle>
            </div>
            {subtitle ? (
              <CardDescription className="text-sm">{subtitle}</CardDescription>
            ) : null}
          </div>

          <div className="flex flex-wrap items-center justify-end gap-2">
            <Button
              size="sm"
              variant={tab === "PENDING" ? "default" : "outline"}
              onClick={() => setTab("PENDING")}
            >
              Pending
              <Badge variant="secondary" className="ml-2">
                {pendingCount}
              </Badge>
            </Button>

            <Button
              size="sm"
              variant={tab === "REVIEWED" ? "default" : "outline"}
              onClick={() => setTab("REVIEWED")}
            >
              Reviewed
              <Badge variant="secondary" className="ml-2">
                {reviewedCount}
              </Badge>
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        {tab === "PENDING" ? pending : reviewed}
      </CardContent>
    </Card>
  );
}

// ─── Responsibility Queue Row (kept behavior, improved UI) ─────────
function ResponsibilityQueueRow(props: {
  request: ResponsibilityRequestWithTeacher;
  onRefresh: (id: string, status: "APPROVED" | "REJECTED") => void;
}) {
  const { request: r, onRefresh } = props;
  const [expanded, setExpanded] = useState(false);
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(false);

  const teacher = r.teacher;
  const fullName = teacher ? `${teacher.firstName} ${teacher.lastName}` : "Unknown";

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

  const statusBadge =
    r.status === "APPROVED"
      ? "bg-green-500/10 text-green-700 border-green-500/20"
      : r.status === "REJECTED"
      ? "bg-red-500/10 text-red-700 border-red-500/20"
      : "bg-yellow-500/10 text-yellow-800 border-yellow-500/20";

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
              <span className="text-xs text-muted-foreground truncate">
                {teacher?.email ?? "—"}
              </span>
              <Badge variant="outline" className={statusBadge}>
                {r.status}
              </Badge>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs text-muted-foreground shrink-0">
            <span>{new Date(r.requested_at).toLocaleDateString()}</span>
            {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
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
              {Object.entries(r.requested_changes ?? {}).map(([key, val]) => (
                <div key={key} className="rounded-md border bg-background p-3">
                  <div className="text-xs text-muted-foreground capitalize">
                    {key.replaceAll("_", " ")}
                  </div>
                  <div className="text-sm font-medium break-words">
                    {typeof val === "object" ? JSON.stringify(val) : String(val)}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-md border bg-background p-3">
            <div className="text-xs text-muted-foreground uppercase tracking-wide font-semibold mb-1">
              Reason
            </div>
            <div className="text-sm">{r.reason}</div>
          </div>

          {r.status === "PENDING" ? (
            <div className="space-y-2">
              <Textarea
                rows={3}
                placeholder="Review note (required for rejection)..."
                value={note}
                onChange={(e) => setNote(e.target.value)}
              />

              <div className="flex flex-col sm:flex-row gap-2 justify-end">
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
          ) : r.review_note ? (
            <div className="text-sm text-muted-foreground italic">
              Note: {r.review_note}
            </div>
          ) : null}
        </div>
      ) : null}
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
    setApptList((prev) => prev.map((r) => (r.id === id ? { ...r, status } : r)));

  const handleRespRefresh = (id: string, status: "APPROVED" | "REJECTED") =>
    setRespList((prev) => prev.map((r) => (r.id === id ? { ...r, status } : r)));

  const pendingHR = useMemo(() => hrList.filter((r) => r.status === "PENDING"), [hrList]);
  const reviewedHR = useMemo(() => hrList.filter((r) => r.status !== "PENDING"), [hrList]);

  const pendingAppt = useMemo(() => apptList.filter((r) => r.status === "PENDING"), [apptList]);
  const reviewedAppt = useMemo(() => apptList.filter((r) => r.status !== "PENDING"), [apptList]);

  const pendingResp = useMemo(() => respList.filter((r) => r.status === "PENDING"), [respList]);
  const reviewedResp = useMemo(() => respList.filter((r) => r.status !== "PENDING"), [respList]);

  const totalPending = pendingHR.length + pendingAppt.length + pendingResp.length;

  return (
    <div className="space-y-4">
      {/* summary card (optional, matches theme) */}
      <Card>
        <CardContent className="p-4 md:p-6 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Clock size={18} className="text-yellow-500" />
            Total pending
          </div>
          <div className="text-2xl font-semibold">{totalPending}</div>
        </CardContent>
      </Card>

      {/* 3-card responsive grid like the loading state */}
      <div className="grid gap-4 lg:grid-cols-3">
        <QueueCard
          icon={<ClipboardList className="h-5 w-5" />}
          title="Employment Info"
          subtitle="ProfileHR change requests"
          pendingCount={pendingHR.length}
          reviewedCount={reviewedHR.length}
          pending={
            pendingHR.length === 0 ? (
              <div className="text-sm text-muted-foreground">No pending employment requests.</div>
            ) : (
              <div className="space-y-2">
                {pendingHR.map((r) => (
                  <HRQueueRow key={r.id} request={r} onRefresh={handleHRRefresh} />
                ))}
              </div>
            )
          }
          reviewed={
            reviewedHR.length === 0 ? (
              <div className="text-sm text-muted-foreground">No reviewed employment requests yet.</div>
            ) : (
              <div className="space-y-2">
                {reviewedHR.map((r) => (
                  <HRQueueRow key={r.id} request={r} onRefresh={handleHRRefresh} />
                ))}
              </div>
            )
          }
        />

        <QueueCard
          icon={<Briefcase className="h-5 w-5" />}
          title="Appointment Changes"
          subtitle="Appointment history change requests"
          pendingCount={pendingAppt.length}
          reviewedCount={reviewedAppt.length}
          pending={
            pendingAppt.length === 0 ? (
              <div className="text-sm text-muted-foreground">No pending appointment requests.</div>
            ) : (
              <div className="space-y-2">
                {pendingAppt.map((r) => (
                  <AppointmentQueueRow key={r.id} request={r} onRefresh={handleApptRefresh} />
                ))}
              </div>
            )
          }
          reviewed={
            reviewedAppt.length === 0 ? (
              <div className="text-sm text-muted-foreground">No reviewed appointment requests yet.</div>
            ) : (
              <div className="space-y-2">
                {reviewedAppt.map((r) => (
                  <AppointmentQueueRow key={r.id} request={r} onRefresh={handleApptRefresh} />
                ))}
              </div>
            )
          }
        />

        <QueueCard
          icon={<BookMarked className="h-5 w-5" />}
          title="Responsibility Changes"
          subtitle="Teacher responsibility change requests"
          pendingCount={pendingResp.length}
          reviewedCount={reviewedResp.length}
          pending={
            pendingResp.length === 0 ? (
              <div className="text-sm text-muted-foreground">No pending responsibility requests.</div>
            ) : (
              <div className="space-y-2">
                {pendingResp.map((r) => (
                  <ResponsibilityQueueRow key={r.id} request={r} onRefresh={handleRespRefresh} />
                ))}
              </div>
            )
          }
          reviewed={
            reviewedResp.length === 0 ? (
              <div className="text-sm text-muted-foreground">No reviewed responsibility requests yet.</div>
            ) : (
              <div className="space-y-2">
                {reviewedResp.map((r) => (
                  <ResponsibilityQueueRow key={r.id} request={r} onRefresh={handleRespRefresh} />
                ))}
              </div>
            )
          }
        />
      </div>
    </div>
  );
}