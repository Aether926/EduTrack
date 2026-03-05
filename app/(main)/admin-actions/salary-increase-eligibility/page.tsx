import { redirect } from "next/navigation";
import { createClient, createAdminClient } from "@/lib/supabase/server";
import { getTeacherSalaryEligibility } from "@/lib/database/salary-eligibility";
import SalaryEligibilityPageClient from "@/features/salary-eligibility/components/salary-eligibility-page-client";

export const dynamic = "force-dynamic";

export default async function SalaryEligibilityPage() {
  const supabase = await createClient();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) redirect("/signin");

  const admin = createAdminClient();
  const { data: me } = await admin
    .from("User")
    .select("role")
    .eq("id", auth.user.id)
    .maybeSingle();

  if (me?.role !== "ADMIN") redirect("/dashboard");

  // fetch all teachers for client-side filtering (no pagination on server)
  const { data, count } = await getTeacherSalaryEligibility(1, 9999, "eligible_first");

  return (
    <SalaryEligibilityPageClient
      initialData={data}
      roleLabel={me.role}
    />
  );
}