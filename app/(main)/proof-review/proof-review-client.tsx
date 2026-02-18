"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { approveAttendance, rejectAttendance } from "@/app/actions/attendance";
import type { ProofReviewRow } from "@/lib/database/proof-review";

function fmt(dt: string | null) {
  if (!dt) return "—";
  try {
    return new Date(dt).toLocaleString();
  } catch {
    return dt;
  }
}

export default function ProofReviewClient({ rows }: { rows: ProofReviewRow[] }) {
  const [remarks, setRemarks] = useState<Record<string, string>>({});
  const [loadingId, setLoadingId] = useState<string | null>(null);

  if (rows.length === 0) {
    return <div className="rounded-lg border p-6 opacity-70">No pending proofs.</div>;
  }

  const handleApprove = async (attendanceId: string) => {
    setLoadingId(attendanceId);
    const comment = (remarks[attendanceId] ?? "").trim();

    const res = await approveAttendance(attendanceId, comment);
    setLoadingId(null);

    if (!res.ok) return toast.error(res.error);
    toast.success("Approved");
  };

  const handleReject = async (attendanceId: string) => {
    const comment = (remarks[attendanceId] ?? "").trim();
    if (!comment) return toast.error("Please provide a reason.");

    setLoadingId(attendanceId);
    const res = await rejectAttendance(attendanceId, comment);
    setLoadingId(null);

    if (!res.ok) return toast.error(res.error);
    toast.success("Rejected");
  };

  return (
    <div className="space-y-4">
      {rows.map((r) => (
        <div key={r.attendanceId} className="rounded-lg border p-4 space-y-3">
          {/* training */}
          <div>
            <div className="text-lg font-semibold">{r.training.title}</div>
            <div className="text-sm opacity-70">
              {r.training.type} • {r.training.level} • {r.training.totalHours} hrs
            </div>
            <div className="text-sm opacity-70">
              {r.training.startDate}
              {r.training.endDate ? ` → ${r.training.endDate}` : ""}
            </div>
            <div className="text-sm opacity-70">
              {r.training.sponsor ?? "—"} • {r.training.venue ?? "—"}
            </div>
            {r.training.description ? (
              <div className="text-sm opacity-70">{r.training.description}</div>
            ) : null}
          </div>

          {/* teacher */}
          <div className="text-sm">
            <div>
              <span className="font-medium">Teacher:</span> {r.teacher.name}
              {r.teacher.employeeId ? ` • ${r.teacher.employeeId}` : ""}
            </div>
            <div className="opacity-70">
              <span className="font-medium">Email:</span> {r.teacher.email ?? "—"}
            </div>
          </div>

          {/* attendance meta */}
          <div className="text-sm opacity-70">
            Status: {r.status} • Submitted: {fmt(r.submittedAt)}
          </div>

          {/* proof */}
          {r.proofUrl ? (
            <a className="underline text-sm" href={r.proofUrl} target="_blank" rel="noreferrer">
              View proof
            </a>
          ) : (
            <div className="text-sm opacity-70">No proof URL found</div>
          )}

          {/* comment */}
          <input
            className="w-full border rounded p-2 text-sm"
            placeholder="Comment (required for rejection)"
            value={remarks[r.attendanceId] ?? ""}
            onChange={(e) =>
              setRemarks((prev) => ({ ...prev, [r.attendanceId]: e.target.value }))
            }
          />

          {/* actions */}
          <div className="flex gap-2">
            <Button
              disabled={loadingId === r.attendanceId}
              onClick={() => void handleApprove(r.attendanceId)}
            >
              Approve
            </Button>

            <Button
              variant="destructive"
              disabled={loadingId === r.attendanceId}
              onClick={() => void handleReject(r.attendanceId)}
            >
              Reject
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
}
