/* eslint-disable @typescript-eslint/no-explicit-any */
import { redirect } from "next/navigation";
import { createClient, createAdminClient } from "@/lib/supabase/server";

import AccessRequestPanel from "@/features/account-approval/components/access-request-panel";

import { Badge } from "@/components/ui/badge";
import { Users, Clock, XCircle } from "lucide-react";

export const dynamic = "force-dynamic";

const ALLOWED = ["ADMIN", "HR_ADMIN", "PRINCIPAL", "SUPER_ADMIN", "HR"] as const;

export default async function AccessRequestPage() {
  const supabase = await createClient();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) redirect("/signin");

  const admin = createAdminClient();
  const { data: me } = await admin
    .from("User")
    .select("role")
    .eq("id", auth.user.id)
    .maybeSingle();

  const roleLabel = (me?.role ?? "USER").toString();
  if (!ALLOWED.includes(roleLabel as any)) redirect("/dashboard");

  // counts for header pills
  const [{ count: pendingCount }, { count: rejectedCount }, { count: totalCount }] =
    await Promise.all([
      admin
        .from("User")
        .select("*", { count: "exact", head: true })
        .eq("status", "PENDING"),
      admin
        .from("User")
        .select("*", { count: "exact", head: true })
        .eq("status", "REJECTED"),
      admin
        .from("User")
        .select("*", { count: "exact", head: true })
        .in("status", ["PENDING", "REJECTED"]),
    ]);

  const pending = pendingCount ?? 0;
  const rejected = rejectedCount ?? 0;
  const total = totalCount ?? pending + rejected;

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-5 md:px-6 md:py-6 space-y-4">
      {/* header card */}
      <div className="rounded-xl border bg-card p-4 md:p-6">
        <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="secondary">{roleLabel}</Badge>
            <Badge variant="outline">Account Approval</Badge>
          </div>

          <div className="flex flex-wrap gap-2">
            <Badge variant="secondary" className="gap-2">
              <Users className="h-3.5 w-3.5" />
              {total} total
            </Badge>

            <Badge variant="secondary" className="gap-2">
              <Clock className="h-3.5 w-3.5" />
              {pending} pending
            </Badge>

            <Badge variant="secondary" className="gap-2">
              <XCircle className="h-3.5 w-3.5" />
              {rejected} rejected
            </Badge>
          </div>
        </div>
      </div>

      {/* client panel (no duplicate header inside it now) */}
      <AccessRequestPanel />
    </div>
  );
}