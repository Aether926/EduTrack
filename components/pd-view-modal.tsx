"use client";

import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { fetchPdDetails } from "@/app/actions/pd-details";

type PdDetails = {
  id: string;
  title: string;
  type: string;
  level: string;
  start_date: string;
  end_date: string | null;
  total_hours: number;
  sponsoring_agency: string | null;
  venue: string | null;
  description: string | null;
};

type FetchOk = { ok: true; data: PdDetails };
type FetchFail = { ok: false; error: string };
type FetchResult = FetchOk | FetchFail;

export default function PdViewModal({
  open,
  onOpenChange,
  trainingId,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  trainingId: string | null;
}) {
  const [loading, setLoading] = useState(false);
  const [pd, setPd] = useState<PdDetails | null>(null);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    if (!open || !trainingId) return;

    let cancelled = false;

    (async () => {
      setLoading(true);
      setErr(null);
      setPd(null);

      const res = (await fetchPdDetails(trainingId)) as FetchResult;
      if (cancelled) return;

      if (!res.ok) {
        setErr(res.error);
        setLoading(false);
        return;
      }

      setPd(res.data);
      setLoading(false);
    })();

    return () => {
      cancelled = true;
    };
  }, [open, trainingId]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>Training / Seminar Details</DialogTitle>
        </DialogHeader>

        {loading ? <div className="text-sm opacity-70">Loading…</div> : null}
        {err ? <div className="text-sm text-red-600">{err}</div> : null}

        {pd ? (
          <div className="space-y-2 text-sm">
            <div className="text-xl font-semibold">{pd.title}</div>

            <div className="opacity-70">
              {pd.type} • {pd.level} • {pd.total_hours} hrs
            </div>

            <div className="opacity-70">
              {pd.start_date}
              {pd.end_date ? ` → ${pd.end_date}` : ""}
            </div>

            <div>
              <span className="font-medium">Sponsor:</span>{" "}
              {pd.sponsoring_agency ?? "—"}
            </div>

            <div>
              <span className="font-medium">Venue:</span> {pd.venue ?? "—"}
            </div>

            <div>
              <span className="font-medium">Description:</span>{" "}
              {pd.description ?? "—"}
            </div>
          </div>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
