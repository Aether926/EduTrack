/* eslint-disable @typescript-eslint/no-explicit-any */
import { redirect } from "next/navigation";
import { createClient, createAdminClient } from "@/lib/supabase/server";

import { getPendingProofs } from "@/features/proof-review/lib/queries";
import ProofReviewTable from "@/features/proof-review/components/proof-review-table";

import { Badge } from "@/components/ui/badge";
import { CheckCircle2, Clock } from "lucide-react";


const ALLOWED = ["ADMIN", "HR_ADMIN", "PRINCIPAL", "SUPER_ADMIN", "HR"] as const;

export default async function ProofReviewPage() {
  // auth + role badge (and gate)
  const supabase = await createClient();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) redirect("/signin");

  const { data: viewer } = await supabase
    .from("User")
    .select("role")
    .eq("id", auth.user.id)
    .maybeSingle();

  const roleLabel = (viewer?.role ?? "USER").toString();
  if (!ALLOWED.includes(roleLabel as any)) redirect("/dashboard");

  const rows = await getPendingProofs();

  const pending = rows.length;

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-5 md:px-6 md:py-6 space-y-4">
      {/* header card (same pattern as other pages) */}
      <div className="rounded-xl border bg-card p-4 md:p-6">
        <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="secondary">{roleLabel}</Badge>
            <Badge variant="outline">Proof Review</Badge>
          </div>

          <div className="flex flex-wrap gap-2">
            <Badge variant="secondary" className="gap-2">
              <Clock className="h-3.5 w-3.5" />
              {pending} pending
            </Badge>

            <Badge variant="secondary" className="gap-2">
              <CheckCircle2 className="h-3.5 w-3.5" />
              For approval
            </Badge>
          </div>
        </div>
      </div>

      {/* table handles rendering */}
      <ProofReviewTable rows={rows} />
    </div>
  );
}