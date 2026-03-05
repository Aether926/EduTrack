/* eslint-disable @typescript-eslint/no-explicit-any */
import { redirect } from "next/navigation";
import { createClient, createAdminClient } from "@/lib/supabase/server";
import { HRQueueClient } from "@/features/admin-actions/queue/components/queue-client";

import { Badge } from "@/components/ui/badge";
import { ClipboardList, Users, Briefcase, BookMarked } from "lucide-react";



const ALLOWED_ROLES = ["ADMIN", "HR_ADMIN", "PRINCIPAL", "SUPERADMIN", "HR"] as const;

export default async function AdminQueuePage() {
  const supabase = await createClient();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) redirect("/signin");

  // role badge + gate (use admin client so it works even if RLS is strict)
  const admin = createAdminClient();
  const { data: viewer } = await admin
    .from("User")
    .select("role")
    .eq("id", auth.user.id)
    .maybeSingle();

  const roleLabel = (viewer?.role ?? "USER").toString();

  if (!ALLOWED_ROLES.includes(roleLabel as any)) redirect("/dashboard");

  // fetch HR requests
  const { data: hrRequests } = await admin
    .from("ProfileHRChangeRequest")
    .select("*")
    .order("requested_at", { ascending: false });

  const hrTeacherIds = [...new Set((hrRequests ?? []).map((r: any) => r.teacher_id))];
  const { data: hrProfiles } = await admin
    .from("Profile")
    .select("id, firstName, lastName, email")
    .in("id", hrTeacherIds.length ? hrTeacherIds : ["__none__"]);

  const hrProfileMap = new Map((hrProfiles ?? []).map((p: any) => [p.id, p]));
  const mergedHR = (hrRequests ?? []).map((r: any) => ({
    ...r,
    teacher: hrProfileMap.get(r.teacher_id) ?? null,
  }));

  // fetch Appointment requests
  const { data: apptRequests } = await admin
    .from("AppointmentChangeRequest")
    .select("*")
    .order("requested_at", { ascending: false });

  const apptTeacherIds = [...new Set((apptRequests ?? []).map((r: any) => r.teacher_id))];
  const { data: apptProfiles } = await admin
    .from("Profile")
    .select("id, firstName, lastName, email")
    .in("id", apptTeacherIds.length ? apptTeacherIds : ["__none__"]);

  const apptProfileMap = new Map((apptProfiles ?? []).map((p: any) => [p.id, p]));
  const mergedAppt = (apptRequests ?? []).map((r: any) => ({
    ...r,
    teacher: apptProfileMap.get(r.teacher_id) ?? null,
  }));

  // fetch Responsibility requests
  const { data: respRequests } = await admin
    .from("ResponsibilityChangeRequest")
    .select("*")
    .order("requested_at", { ascending: false });

  const respTeacherIds = [...new Set((respRequests ?? []).map((r: any) => r.teacher_id))];
  const { data: respProfiles } = await admin
    .from("Profile")
    .select("id, firstName, lastName, email")
    .in("id", respTeacherIds.length ? respTeacherIds : ["__none__"]);

  const respProfileMap = new Map((respProfiles ?? []).map((p: any) => [p.id, p]));
  const mergedResp = (respRequests ?? []).map((r: any) => ({
    ...r,
    teacher: respProfileMap.get(r.teacher_id) ?? null,
  }));

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-5 md:px-6 md:py-6 space-y-4">
      {/* header card (same layout as other pages) */}
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

      {/* existing client UI */}
      <HRQueueClient
        hrRequests={mergedHR}
        apptRequests={mergedAppt}
        respRequests={mergedResp}
      />
    </div>
  );
}