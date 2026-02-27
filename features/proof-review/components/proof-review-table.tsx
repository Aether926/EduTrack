"use client";

import type { ProofReviewRow } from "../types";
import { useProofReview } from "../hooks/use-proof-review";
import { fmt, statusBadgeVariant } from "../lib/utils";

import { useMemo, useState } from "react";
import { Search, X, Clock, GraduationCap, User2 } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
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
  const [searchOpen, setSearchOpen] = useState(false);

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
      <Card className="min-w-0">
        <CardHeader className="gap-3 md:flex-row md:items-end md:justify-between">
          <div className="space-y-1">
            <CardTitle className="text-base">Pending submissions</CardTitle>
            <CardDescription>
              Tap a row to review proof and approve or reject.
            </CardDescription>
          </div>

          {/* desktop toolbar */}
          <div className="hidden md:flex items-center gap-2">
            <Input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search teacher, email, training..."
              className="w-[320px]"
            />
            <Badge variant="secondary" className="gap-2">
              <Clock className="h-3.5 w-3.5" />
              {filtered.length} pending
            </Badge>
          </div>

          {/* mobile toolbar */}
          <div className="flex md:hidden items-center justify-between gap-2">
            <Badge variant="secondary" className="gap-2">
              <Clock className="h-3.5 w-3.5" />
              {filtered.length} pending
            </Badge>

            <Button
              variant="outline"
              size="icon"
              onClick={() => setSearchOpen((v) => !v)}
              aria-label="Search"
            >
              {searchOpen ? <X className="h-4 w-4" /> : <Search className="h-4 w-4" />}
            </Button>
          </div>
        </CardHeader>

        <CardContent className="space-y-3">
          {/* mobile inline search */}
          {searchOpen ? (
            <div className="md:hidden">
              <Input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search teacher, email, training..."
              />
            </div>
          ) : null}

          {filtered.length === 0 ? (
            <div className="rounded-lg border bg-muted/20 p-6 text-sm text-muted-foreground text-center">
              No pending proofs found.
            </div>
          ) : (
            <div className="overflow-hidden rounded-lg border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Submission</TableHead>
                    <TableHead className="hidden lg:table-cell">Teacher</TableHead>
                    <TableHead className="hidden md:table-cell">Status</TableHead>
                    <TableHead className="hidden md:table-cell text-right">Submitted</TableHead>
                  </TableRow>
                </TableHeader>

                <TableBody>
                  {filtered.map((r) => (
                    <TableRow
                      key={r.attendanceId}
                      className="cursor-pointer transition-colors hover:bg-accent/40"
                      onClick={() => setSelected(r)}
                    >
                      {/* submission (primary column) */}
                      <TableCell className="align-top">
                        <div className="min-w-0 space-y-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="truncate font-medium">
                              {r.training.title}
                            </span>

                            {/* desktop status pill */}
                            <span className="hidden md:inline-flex">
                              <Badge variant={statusBadgeVariant(r.status)}>
                                {r.status}
                              </Badge>
                            </span>
                          </div>

                          <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                            <span className="inline-flex items-center gap-1">
                              <GraduationCap className="h-3.5 w-3.5" />
                              {r.training.type} • {r.training.level} • {r.training.totalHours} hrs
                            </span>
                          </div>

                          {/* mobile teacher + status + submitted */}
                          <div className="md:hidden flex flex-wrap items-center gap-2 pt-1 text-xs text-muted-foreground">
                            <span className="inline-flex items-center gap-1">
                              <User2 className="h-3.5 w-3.5" />
                              {r.teacher.name}
                            </span>

                            <Badge variant={statusBadgeVariant(r.status)} className="ml-auto">
                              {r.status}
                            </Badge>

                            <span className="w-full inline-flex items-center gap-1">
                              <Clock className="h-3.5 w-3.5" />
                              {fmt(r.submittedAt)}
                            </span>

                            {r.teacher.email ? (
                              <span className="w-full truncate">{r.teacher.email}</span>
                            ) : null}
                          </div>
                        </div>
                      </TableCell>

                      {/* teacher (desktop) */}
                      <TableCell className="hidden lg:table-cell align-top">
                        <div className="min-w-0">
                          <div className="font-medium">{r.teacher.name}</div>
                          <div className="text-xs text-muted-foreground truncate">
                            {r.teacher.email ?? "—"}
                          </div>
                        </div>
                      </TableCell>

                      {/* status (desktop) */}
                      <TableCell className="hidden md:table-cell align-top">
                        <Badge variant={statusBadgeVariant(r.status)}>{r.status}</Badge>
                      </TableCell>

                      {/* submitted (desktop) */}
                      <TableCell className="hidden md:table-cell align-top text-right text-sm text-muted-foreground">
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