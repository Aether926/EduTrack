"use client";

import type { ProofReviewRow } from "../types";
import { useProofReview } from "../hooks/use-proof-review";
import { fmt, statusBadgeVariant } from "../lib/utils";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import ProofReviewModal from "@/features/proof-review/components/proof-review-modal";
import { useMemo, useState } from "react";

export default function ProofReviewTable({ rows }: { rows: ProofReviewRow[] }) {
  const {
    sortedRows,
    selected,
    setSelected,
    remarks,
    setRemarks,
    loadingId,
    onApprove,
    onReject,
  } = useProofReview(rows);

  const [q, setQ] = useState("");

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return sortedRows;
    return sortedRows.filter((r) => {
      return (
        r.training.title.toLowerCase().includes(s) ||
        r.teacher.name.toLowerCase().includes(s) ||
        (r.teacher.email ?? "").toLowerCase().includes(s)
      );
    });
  }, [q, sortedRows]);

  return (
    <>
      <Card>
        <CardHeader className="gap-3 md:flex-row md:items-center md:justify-between">
          <div className="space-y-1">
            <CardTitle className="text-base">Pending submissions</CardTitle>
            <p className="text-sm text-muted-foreground">
              Click a row to open the review modal.
            </p>
          </div>

          <div className="flex w-full flex-col gap-2 md:w-auto md:flex-row md:items-center">
            <Input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search teacher or training..."
              className="md:w-[260px]"
            />
            <Badge variant="secondary">{filtered.length} pending</Badge>
          </div>
        </CardHeader>

        <CardContent>
          {filtered.length === 0 ? (
            <div className="text-sm text-muted-foreground">No pending proofs.</div>
          ) : (
            <div className="overflow-hidden rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Training</TableHead>
                    <TableHead>Teacher</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Submitted</TableHead>
                  </TableRow>
                </TableHeader>

                <TableBody>
                  {filtered.map((r) => (
                    <TableRow
                      key={r.attendanceId}
                      className="cursor-pointer"
                      onClick={() => setSelected(r)}
                    >
                      <TableCell>
                        <div className="font-medium">{r.training.title}</div>
                        <div className="text-xs text-muted-foreground">
                          {r.training.type} • {r.training.level} • {r.training.totalHours} hrs
                        </div>
                      </TableCell>

                      <TableCell>
                        <div className="font-medium">{r.teacher.name}</div>
                        <div className="text-xs text-muted-foreground">
                          {r.teacher.email ?? "—"}
                        </div>
                      </TableCell>

                      <TableCell>
                        <Badge variant={statusBadgeVariant(r.status)}>{r.status}</Badge>
                      </TableCell>

                      <TableCell className="text-right text-sm text-muted-foreground">
                        {fmt(r.submittedAt)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <ProofReviewModal
        row={selected}
        open={!!selected}
        onOpenChange={(open) => {
          if (!open) setSelected(null);
        }}
        remarks={remarks}
        setRemarks={setRemarks}
        loadingId={loadingId}
        onApprove={onApprove}
        onReject={onReject}
      />
    </>
  );
}