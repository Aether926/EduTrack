/* eslint-disable @typescript-eslint/no-explicit-any */
import { redirect } from "next/navigation";
import { getUser, createAdminClient } from "@/lib/supabase/server";
import { HRQueueClient } from "@/features/admin-actions/queue/components/queue-client";

import { Badge } from "@/components/ui/badge";
import { Users, Briefcase, BookMarked } from "lucide-react";

const ALLOWED_ROLES = new Set(["ADMIN", "HR_ADMIN", "PRINCIPAL", "SUPERADMIN", "HR"]);

export default async function AdminQueuePage() {
  const user = await getUser();
  if (!user) redirect("/signin");

  // Role from metadata — zero DB call
  const roleLabel = (user.user_metadata?.role ?? "USER").toString();
  if (!ALLOWED_ROLES.has(roleLabel)) redirect("/dashboard");

  const admin = createAdminClient();

  // All 3 request tables in parallel — no role query needed
  const [
    { data: hrRequests },
    { data: apptRequests },
    { data: respRequests },
  ] = await Promise.all([
    admin.from("ProfileHRChangeRequest").select("*").order("requested_at", { ascending: false }),
    admin.from("AppointmentChangeRequest").select("*").order("requested_at", { ascending: false }),
    admin.from("ResponsibilityChangeRequest").select("*").order("requested_at", { ascending: false }),
  ]);

  const allTeacherIds = [
    ...new Set([
      ...(hrRequests   ?? []).map((r: any) => r.teacher_id),
      ...(apptRequests ?? []).map((r: any) => r.teacher_id),
      ...(respRequests ?? []).map((r: any) => r.teacher_id),
    ]),
  ];

  const { data: profiles } = allTeacherIds.length
    ? await admin.from("Profile").select("id, firstName, lastName, email").in("id", allTeacherIds)
    : { data: [] };

  const profileMap = new Map((profiles ?? []).map((p: any) => [p.id, p]));
  const merge = (rows: any[]) =>
    rows.map((r) => ({ ...r, teacher: profileMap.get(r.teacher_id) ?? null }));

  const mergedHR   = merge(hrRequests   ?? []);
  const mergedAppt = merge(apptRequests ?? []);
  const mergedResp = merge(respRequests ?? []);

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-5 md:px-6 md:py-6 space-y-4">
      <div className="rounded-xl border bg-card p-4 md:p-6">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="secondary">{roleLabel}</Badge>
            <Badge variant="outline">HR Queue</Badge>
          </div>
          <div className="flex flex-wrap gap-2">
            <Badge variant="secondary" className="gap-2">
              <Users className="h-3.5 w-3.5" />
              {mergedHR.length} Employments
            </Badge>
            <Badge variant="secondary" className="gap-2">
              <Briefcase className="h-3.5 w-3.5" />
              {mergedAppt.length} appointments
            </Badge>
            <Badge variant="secondary" className="gap-2">
              <BookMarked className="h-3.5 w-3.5" />
              {mergedResp.length} responsibilities
            </Badge>
          </div>
        </div>
      </div>

      <HRQueueClient
        hrRequests={mergedHR}
        apptRequests={mergedAppt}
        respRequests={mergedResp}
      />
    </div>
  );
}