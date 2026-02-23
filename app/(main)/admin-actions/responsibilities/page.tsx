import { redirect } from "next/navigation";
import { createClient, createAdminClient } from "@/lib/supabase/server";
import { AdminResponsibilitiesClient } from "@/features/responsibilities/components/admin-responsibility-client";

export const dynamic = "force-dynamic";

export default async function AdminResponsibilitiesPage() {
  const supabase = await createClient();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) redirect("/signin");

  const { data: viewer } = await supabase
    .from("User")
    .select("role")
    .eq("id", auth.user.id)
    .single();

  if (viewer?.role !== "ADMIN") redirect("/");

  const admin = createAdminClient();

  const { data: responsibilities } = await admin
    .from("TeacherResponsibility")
    .select("*")
    .order("created_at", { ascending: false });

  const { data: changeRequests } = await admin
    .from("ResponsibilityChangeRequest")
    .select("*")
    .order("requested_at", { ascending: false });

  const { data: profiles } = await admin
    .from("Profile")
    .select("id, firstName, lastName, email")
    .order("lastName", { ascending: true });

  const profileMap = new Map((profiles ?? []).map((p) => [p.id, p]));

  const responsibilityMap = new Map(
    (responsibilities ?? []).map((r) => [r.id, r])
  );

  const mergedResponsibilities = (responsibilities ?? []).map((r) => ({
    ...r,
    teacher: profileMap.get(r.teacher_id) ?? null,
  }));

  const mergedRequests = (changeRequests ?? []).map((r) => ({
    ...r,
    teacher: profileMap.get(r.teacher_id) ?? null,
    responsibility: responsibilityMap.get(r.responsibility_id)
      ? { title: responsibilityMap.get(r.responsibility_id)!.title }
      : null,
  }));

  const teachers = (profiles ?? []).map((p) => ({
    id: p.id,
    fullName: `${p.firstName ?? ""} ${p.lastName ?? ""}`.trim(),
  }));

  return (
    <AdminResponsibilitiesClient
      responsibilities={mergedResponsibilities}
      changeRequests={mergedRequests}
      teachers={teachers}
    />
  );
}