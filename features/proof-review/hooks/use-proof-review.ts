"use client";

import { useMemo, useState } from "react";
import { toast } from "sonner";
import type { ProofReviewRow } from "../types";
import { approveProof, rejectProof } from "../actions/review-proof";

export function useProofReview(rows: ProofReviewRow[]) {
  const [selected, setSelected] = useState<ProofReviewRow | null>(null);
  const [remarks, setRemarks] = useState<Record<string, string>>({});
  const [loadingId, setLoadingId] = useState<string | null>(null);

  const sortedRows = useMemo(() => {
    return [...rows].sort((a, b) => {
      const ad = a.submittedAt ? new Date(a.submittedAt).getTime() : 0;
      const bd = b.submittedAt ? new Date(b.submittedAt).getTime() : 0;
      return bd - ad;
    });
  }, [rows]);

  const onApprove = async (attendanceId: string) => {
    setLoadingId(attendanceId);
    const comment = (remarks[attendanceId] ?? "").trim();

    const res = await approveProof(attendanceId, comment);
    setLoadingId(null);

    if (!res.ok) return toast.error(res.error);
    toast.success("Approved");
    setSelected(null);
  };

  const onReject = async (attendanceId: string) => {
    const comment = (remarks[attendanceId] ?? "").trim();
    if (!comment) return toast.error("Please provide a reason.");

    setLoadingId(attendanceId);
    const res = await rejectProof(attendanceId, comment);
    setLoadingId(null);

    if (!res.ok) return toast.error(res.error);
    toast.success("Rejected");
    setSelected(null);
  };

  return {
    sortedRows,
    selected,
    setSelected,
    remarks,
    setRemarks,
    loadingId,
    onApprove,
    onReject,
  };
}