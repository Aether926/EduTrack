import UploadProofClient from "@/features/professional-dev/components/upload-proof-client";
import { getUploadProofContext } from "@/lib/database/attendance-details";
import { createClient } from "@/lib/supabase/server";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { CalendarDays, Clock, FileUp, CheckCircle2, XCircle } from "lucide-react";
import { redirect } from "next/navigation";

function fmtDate(d: string | null | undefined) {
  if (!d) return "—";
  try {
    return new Date(d).toISOString().slice(0, 10);
  } catch {
    return String(d);
  }
}

function StatusPill({ status }: { status: string }) {
  const s = (status || "").toUpperCase();

  if (s === "APPROVED") {
    return (
      <Badge variant="secondary" className="gap-2">
        <CheckCircle2 className="h-3.5 w-3.5" />
        APPROVED
      </Badge>
    );
  }

  if (s === "REJECTED") {
    return (
      <Badge variant="secondary" className="gap-2">
        <XCircle className="h-3.5 w-3.5" />
        REJECTED
      </Badge>
    );
  }

  // covers ENROLLED / PENDING / SUBMITTED / etc
  return (
    <Badge variant="secondary" className="gap-2">
      <Clock className="h-3.5 w-3.5" />
      {s || "UNKNOWN"}
    </Badge>
  );
}

export default async function UploadProofPage({
  params,
}: {
  params: Promise<{ attendance: string }>;
}) {
  const { attendance } = await params;

  const supabase = await createClient();
  const { data: authData } = await supabase.auth.getUser();
  if (!authData.user) redirect("/signin");

  const ctx = await getUploadProofContext(attendance);
  if (!ctx) redirect("/professional-dev")

  const title = ctx.training.title;
  const subtitle = `${ctx.training.type} • ${ctx.training.level} • ${ctx.training.totalHours} hrs`;
  const dates = `${fmtDate(ctx.training.startDate)} → ${fmtDate(ctx.training.endDate)}`;

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-5 md:px-6 md:py-6 space-y-4">
      {/* header card (matches other pages) */}
      <div className="rounded-xl border bg-card p-4 md:p-6">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="secondary">TEACHER</Badge>
            <Badge variant="outline">Upload Proof</Badge>
          </div>

          <div className="flex flex-wrap gap-2">
            <Badge variant="secondary" className="gap-2">
              <FileUp className="h-3.5 w-3.5" />
              proof submission
            </Badge>

            <StatusPill status={ctx.status} />
          </div>
        </div>
      </div>

      {/* context card */}
      <Card className="min-w-0">
        <CardContent className="p-4 md:p-6">
          <div className="flex flex-col gap-3">
            <div className="space-y-1">
              <div className="text-xl md:text-2xl font-semibold tracking-tight">
                {title}
              </div>
              <div className="text-sm text-muted-foreground">{subtitle}</div>
            </div>

            <Separator />

            <div className="grid gap-3 md:grid-cols-2">
              <div className="flex items-start gap-2 text-sm">
                <CalendarDays className="h-4 w-4 mt-0.5 text-muted-foreground" />
                <div className="min-w-0">
                  <div className="text-muted-foreground">Schedule</div>
                  <div className="font-mono text-xs md:text-sm truncate">{dates}</div>
                </div>
              </div>

              <div className="flex items-start gap-2 text-sm">
                <Clock className="h-4 w-4 mt-0.5 text-muted-foreground" />
                <div className="min-w-0">
                  <div className="text-muted-foreground">Current status</div>
                  <div className="font-medium">{ctx.status}</div>
                </div>
              </div>
            </div>

            {/* subtle hover polish like other pages */}
            <div className="mt-1 rounded-lg border bg-muted/20 p-3 transition-colors hover:bg-muted/30">
              <div className="text-xs text-muted-foreground">
                Tip: If your status is <span className="font-medium">REJECTED</span>, upload a new proof and resubmit.
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* uploader */}
      <UploadProofClient attendanceId={attendance} />
    </div>
  );
}