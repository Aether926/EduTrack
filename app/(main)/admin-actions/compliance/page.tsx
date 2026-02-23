import { redirect } from "next/navigation";
import { createClient, createAdminClient } from "@/lib/supabase/server";
import { AdminComplianceClient } from "@/features/compliance/components/admin-compliance-client";

export const dynamic = "force-dynamic";

function currentSchoolYear() {
  const now = new Date();
  const month = now.getMonth() + 1;
  const year = now.getFullYear();
  return month >= 6 ? `SY ${year}-${year + 1}` : `SY ${year - 1}-${year}`;
}

export default async function AdminCompliancePage() {
  const supabase = await createClient();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) redirect("/signin");

  const { data: viewer } = await supabase.from("User").select("role").eq("id", auth.user.id).single();
  if (viewer?.role !== "ADMIN") redirect("/");

  const admin = createAdminClient();
  const schoolYear = currentSchoolYear();

  const [
    { data: compliance },
    { data: policies },
    { data: schools },
  ] = await Promise.all([
    admin
    .from("TeacherTrainingCompliance")
    .select("*"),
    admin
    .from("TrainingCompliancePolicy")
    .select("*")
    .eq("school_year", schoolYear),
    admin
    .from("School")
    .select("id, name, division"),
  ]);

  const teacherIds = (compliance ?? []).map((c) => c.teacher_id);
  const { data: profiles } = teacherIds.length
    ? await admin
    .from("Profile")
    .select("id, firstName, lastName, email")
    .in("id", teacherIds)
    : { data: [] };

  const profileMap = new Map((profiles ?? []).map((p) => [p.id, p]));
  const schoolMap = new Map((schools ?? []).map((s) => [s.id, s]));

  const merged = (compliance ?? []).map((c) => ({
    ...c,
    teacher: profileMap.get(c.teacher_id) ?? null,
    school: c.school_id ? schoolMap.get(c.school_id) ?? null : null,
  }));

  return (
    <AdminComplianceClient
      compliance={merged}
      policies={policies ?? []}
      schools={(schools ?? []).map((s) => ({ id: s.id, name: s.name }))}
      schoolYear={schoolYear}
    />
  );
}