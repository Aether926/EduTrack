/* eslint-disable @typescript-eslint/no-explicit-any */
import { redirect } from "next/navigation";
import { createClient, createAdminClient } from "@/lib/supabase/server";
import { MyResponsibilitiesClient } from "@/features/responsibilities/components/my-responsibilities-client";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { ClipboardList, GitPullRequest, Clock } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function MyResponsibilitiesPage() {
  const supabase = await createClient();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) redirect("/signin");

  // role badge (use admin client so it works even if RLS is strict)
  const admin = createAdminClient();
  const { data: userRow } = await admin
    .from("User")
    .select("role")
    .eq("id", auth.user.id)
    .maybeSingle();

  const roleLabel = (userRow?.role ?? "USER").toString();

  const [{ data: responsibilities }, { data: changeRequests }] =
    await Promise.all([
      supabase
        .from("TeacherResponsibility")
        .select("*")
        .eq("teacher_id", auth.user.id)
        .order("created_at", { ascending: false }),
      supabase
        .from("ResponsibilityChangeRequest")
        .select("*")
        .eq("teacher_id", auth.user.id)
        .order("requested_at", { ascending: false }),
    ]);

  const resp = responsibilities ?? [];
  const reqs = changeRequests ?? [];

  // optional counts (safe even if columns differ)
  const pendingRequests = reqs.filter((r: any) =>
    String(r?.status ?? r?.request_status ?? "").toUpperCase().includes("PENDING")
  ).length;

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-5 md:px-6 md:py-6 space-y-4">
      {/* header card (same layout as other pages) */}
      <div className="rounded-xl border bg-card p-4 md:p-6">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="secondary">{roleLabel}</Badge>
            <Badge variant="outline">My Responsibilities</Badge>
          </div>

          <div className="flex flex-wrap gap-2">
            <Badge variant="secondary" className="gap-2">
              <ClipboardList className="h-3.5 w-3.5" />
              {resp.length} item{resp.length === 1 ? "" : "s"}
            </Badge>

            <Badge variant="secondary" className="gap-2">
              <GitPullRequest className="h-3.5 w-3.5" />
              {reqs.length} request{reqs.length === 1 ? "" : "s"}
            </Badge>
          </div>
        </div>
      </div>

      {/* quick summary cards (shadcn, responsive) */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardContent className="pt-4 flex items-center gap-3">
            <ClipboardList className="h-5 w-5 text-muted-foreground" />
            <div>
              <p className="text-2xl font-bold">{resp.length}</p>
              <p className="text-xs text-muted-foreground">Total responsibilities</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4 flex items-center gap-3">
            <GitPullRequest className="h-5 w-5 text-muted-foreground" />
            <div>
              <p className="text-2xl font-bold">{reqs.length}</p>
              <p className="text-xs text-muted-foreground">Change requests</p>
            </div>
          </CardContent>
        </Card>

        <Card className="sm:col-span-2 lg:col-span-1">
          <CardContent className="pt-4 flex items-center gap-3">
            <Clock className="h-5 w-5 text-muted-foreground" />
            <div>
              <p className="text-2xl font-bold">{pendingRequests}</p>
              <p className="text-xs text-muted-foreground">Pending requests</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* existing client UI */}
      <MyResponsibilitiesClient
        responsibilities={resp}
        changeRequests={reqs}
      />
    </div>
  );
}