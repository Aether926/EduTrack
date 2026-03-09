/* eslint-disable @typescript-eslint/no-explicit-any */
import { redirect } from "next/navigation";
import { getUser, createAdminClient } from "@/lib/supabase/server";
import { AppointmentHistoryClient } from "@/features/admin-actions/appointment-history/components/appointment-history-client";

import { Badge } from "@/components/ui/badge";
import { Users, ClipboardList } from "lucide-react";

const ALLOWED = new Set(["ADMIN", "PRINCIPAL", "SUPERADMIN"]);

export default async function AppointmentHistoryPage() {
  const user = await getUser();
  if (!user) redirect("/signin");

  const roleLabel = (user.user_metadata?.role ?? "TEACHER").toString();
  if (!ALLOWED.has(roleLabel)) redirect("/");

  const admin = createAdminClient();

  const [{ data: history }, { data: profiles }] = await Promise.all([
    admin
      .from("AppointmentHistory")
      .select("id, teacher_id, position, appointment_type, start_date, end_date, memo_no, remarks, created_by, created_at, approved_by, approved_at, status, school_id")
      .order("created_at", { ascending: false }),
    admin
      .from("Profile")
      .select("id, firstName, lastName")
      .order("lastName", { ascending: true }),
  ]);

  const profileMap = new Map((profiles ?? []).map((p: any) => [p.id, p]));
  const merged = (history ?? []).map((row: any) => ({
    ...row,
    teacher: profileMap.get(row.teacher_id) ?? null,
  }));

  const teachers = (profiles ?? []).map((p: any) => ({
    id:       p.id,
    fullName: `${p.firstName ?? ""} ${p.lastName ?? ""}`.trim(),
  }));

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-5 md:px-6 md:py-6 space-y-4">
      <div className="rounded-xl border bg-card p-4 md:p-6">
        <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="secondary">{roleLabel}</Badge>
            <Badge variant="outline">Appointment History</Badge>
          </div>
          <div className="flex flex-wrap gap-2">
            <Badge variant="secondary" className="gap-2">
              <ClipboardList className="h-3.5 w-3.5" />{merged.length} record{merged.length === 1 ? "" : "s"}
            </Badge>
            <Badge variant="secondary" className="gap-2">
              <Users className="h-3.5 w-3.5" />{teachers.length} teacher{teachers.length === 1 ? "" : "s"}
            </Badge>
          </div>
        </div>
      </div>
      <AppointmentHistoryClient rows={merged} teachers={teachers} />
    </div>
  );
}