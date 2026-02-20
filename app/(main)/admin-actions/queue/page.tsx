import { redirect } from "next/navigation";
import { createClient, createAdminClient } from "@/lib/supabase/server";
import { HRQueueClient } from "@/features/admin-actions/queue/components/queue-client";

export const dynamic = "force-dynamic";

export default async function AdminQueuePage() {
  const supabase = await createClient();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) redirect("/login");

  const { data: viewer } = await supabase
    .from("User")
    .select("role")
    .eq("id", auth.user.id)
    .single();

  if (viewer?.role !== "ADMIN") redirect("/");

  const admin = createAdminClient();

  // fetch HR requests
  const { data: hrRequests } = await admin
    .from("ProfileHRChangeRequest")
    .select("*")
    .order("requested_at", { ascending: false });

  const hrTeacherIds = [...new Set((hrRequests ?? []).map((r) => r.teacher_id))];
  const { data: hrProfiles } = await admin
    .from("Profile")
    .select("id, firstName, lastName, email")
    .in("id", hrTeacherIds.length ? hrTeacherIds : ["__none__"]);

  const hrProfileMap = new Map((hrProfiles ?? []).map((p) => [p.id, p]));
  const mergedHR = (hrRequests ?? []).map((r) => ({
    ...r,
    teacher: hrProfileMap.get(r.teacher_id) ?? null,
  }));

  // fetch Appointment requests
  const { data: apptRequests } = await admin
    .from("AppointmentChangeRequest")
    .select("*")
    .order("requested_at", { ascending: false });

  const apptTeacherIds = [...new Set((apptRequests ?? []).map((r) => r.teacher_id))];
  const { data: apptProfiles } = await admin
    .from("Profile")
    .select("id, firstName, lastName, email")
    .in("id", apptTeacherIds.length ? apptTeacherIds : ["__none__"]);

  const apptProfileMap = new Map((apptProfiles ?? []).map((p) => [p.id, p]));
  const mergedAppt = (apptRequests ?? []).map((r) => ({
    ...r,
    teacher: apptProfileMap.get(r.teacher_id) ?? null,
  }));

  return (
    <HRQueueClient
      hrRequests={mergedHR}
      apptRequests={mergedAppt}
    />
  );
}