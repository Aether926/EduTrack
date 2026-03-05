import { redirect } from "next/navigation";
import { createClient, createAdminClient } from "@/lib/supabase/server";
import { getTeacherSalaryEligibility } from "@/lib/database/salary-eligibility";
import SalaryEligibilityPageClient from "@/features/salary-eligibility/components/salary-eligibility-page-client";

export const dynamic = "force-dynamic";

const ALLOWED = ["ADMIN", "SUPERADMIN"] as const;

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

  const roleLabel = (me?.role ?? "USER").toString();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  if (!ALLOWED.includes(roleLabel as any)) redirect("/dashboard");

  const { data } = await getTeacherSalaryEligibility(1, 9999, "eligible_first");

  return (
    <SalaryEligibilityPageClient
      initialData={data}
      roleLabel={roleLabel}
    />
  );
}