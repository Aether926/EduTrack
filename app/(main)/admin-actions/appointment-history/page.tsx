/* eslint-disable @typescript-eslint/no-explicit-any */
import { redirect } from "next/navigation";
import { createClient, createAdminClient } from "@/lib/supabase/server";
import { AppointmentHistoryClient } from "@/features/admin-actions/appointment-history/components/appointment-history-client";

import { Badge } from "@/components/ui/badge";
import { Users, ClipboardList } from "lucide-react";

const ALLOWED = ["ADMIN", "HR_ADMIN", "PRINCIPAL", "SUPER_ADMIN", "HR"] as const;

export default async function AppointmentHistoryPage() {
  const supabase = await createClient();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) redirect("/signin");

  const { data: viewer } = await supabase
    .from("User")
    .select("role")
    .eq("id", auth.user.id)
    .single();

  const roleLabel = (viewer?.role ?? "USER").toString();
  if (!ALLOWED.includes(roleLabel as any)) redirect("/");

  const admin = createAdminClient();

  const { data: history } = await admin
    .from("AppointmentHistory")
    .select("*")
    .order("created_at", { ascending: false });

  const { data: profiles } = await admin
    .from("Profile")
    .select("id, firstName, lastName, email")
    .order("lastName", { ascending: true });

  const profileMap = new Map((profiles ?? []).map((p) => [p.id, p]));

  const merged = (history ?? []).map((row: any) => ({
    ...row,
    teacher: profileMap.get(row.teacher_id) ?? null,
  }));

  const teachers = (profiles ?? []).map((p: any) => ({
    id: p.id,
    fullName: `${p.firstName ?? ""} ${p.lastName ?? ""}`.trim(),
  }));

  const totalRows = merged.length;
  const totalTeachers = teachers.length;

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-5 md:px-6 md:py-6 space-y-4">
      {/* header card (same style as other pages) */}
      <div className="rounded-xl border bg-card p-4 md:p-6">
        <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="secondary">{roleLabel}</Badge>
            <Badge variant="outline">Appointment History</Badge>
          </div>

          <div className="flex flex-wrap gap-2">
            <Badge variant="secondary" className="gap-2">
              <ClipboardList className="h-3.5 w-3.5" />
              {totalRows} record{totalRows === 1 ? "" : "s"}
            </Badge>

            <Badge variant="secondary" className="gap-2">
              <Users className="h-3.5 w-3.5" />
              {totalTeachers} teacher{totalTeachers === 1 ? "" : "s"}
            </Badge>
          </div>
        </div>
      </div>

      {/* existing UI */}
      <AppointmentHistoryClient rows={merged} teachers={teachers} />
    </div>
  );
}