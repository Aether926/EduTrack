"use client";

import * as React from "react";
import type { ProofReviewRow } from "../types";
import { fmt, statusBadgeVariant } from "../lib/utils";
import { ExternalLink, Loader2 } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";

export default function ProofReviewModal({
  row,
  open,
  onOpenChange,
  remarks,
  setRemarks,
  loadingId,
  onApprove,
  onReject,
}: {
  row: ProofReviewRow | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  remarks: Record<string, string>;
  setRemarks: React.Dispatch<React.SetStateAction<Record<string, string>>>;
  loadingId: string | null;
  onApprove: (attendanceId: string) => Promise<void>;
  onReject: (attendanceId: string) => Promise<void>;
}) {
  if (!row) return null;

  const isLoading = loadingId === row.attendanceId;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-base">Review submission</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <div className="font-medium">{row.training.title}</div>
                <Badge variant={statusBadgeVariant(row.status)}>{row.status}</Badge>
              </div>
              <div className="text-sm text-muted-foreground">
                {row.training.type} • {row.training.level} • {row.training.totalHours} hrs
              </div>
            </div>

            <div className="text-xs text-muted-foreground">
              Submitted: {fmt(row.submittedAt)}
            </div>
          </div>

          <Separator />

          <div className="grid gap-2 text-sm">
            <div>
              <span className="font-medium">Teacher:</span> {row.teacher.name}
              {row.teacher.employeeId ? (
                <span className="text-muted-foreground"> • {row.teacher.employeeId}</span>
              ) : null}
              <div className="text-xs text-muted-foreground">
                {row.teacher.email ?? "—"}
              </div>
            </div>

            <div className="text-muted-foreground">
              <span className="font-medium text-foreground">Dates:</span>{" "}
              {row.training.startDate}
              {row.training.endDate ? ` → ${row.training.endDate}` : ""}
            </div>

            <div className="text-muted-foreground">
              <span className="font-medium text-foreground">Sponsor / Venue:</span>{" "}
              {row.training.sponsor ?? "—"} • {row.training.venue ?? "—"}
            </div>

            {row.training.description ? (
              <div className="text-muted-foreground">
                <span className="font-medium text-foreground">Description:</span>{" "}
                {row.training.description}
              </div>
            ) : null}
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {row.proofUrl ? (
              <Button asChild variant="outline" size="sm">
                <a href={row.proofUrl} target="_blank" rel="noreferrer" className="gap-2">
                  <ExternalLink className="h-4 w-4" />
                  View proof
                </a>
              </Button>
            ) : (
              <Badge variant="outline">No proof URL</Badge>
            )}
          </div>

          <Separator />

          <div className="space-y-2">
            <div className="text-sm font-medium">
              Review note{" "}
              <span className="text-xs text-muted-foreground">
                (required for rejection)
              </span>
            </div>

            <Textarea
              value={remarks[row.attendanceId] ?? ""}
              onChange={(e) =>
                setRemarks((prev) => ({ ...prev, [row.attendanceId]: e.target.value }))
              }
              placeholder="Add a short note for the teacher..."
              className="min-h-[96px]"
            />
          </div>

          <div className="flex flex-wrap gap-2">
            <Button
              onClick={() => void onApprove(row.attendanceId)}
              disabled={isLoading}
              className="gap-2"
            >
              {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              Approve
            </Button>

            <Button
              variant="destructive"
              onClick={() => void onReject(row.attendanceId)}
              disabled={isLoading}
              className="gap-2"
            >
              {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              Reject
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}