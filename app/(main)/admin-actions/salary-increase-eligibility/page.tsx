import { redirect } from "next/navigation";
import { getUser } from "@/lib/supabase/server";
import { getTeacherSalaryEligibility } from "@/lib/database/salary-eligibility";
import SalaryEligibilityPageClient from "@/features/admin-actions/salary-eligibility/components/salary-eligibility-page-client";

const ALLOWED = ["ADMIN", "SUPERADMIN"] as const;

export default async function SalaryEligibilityPage() {
    const user = await getUser();
    if (!user) redirect("/signin");
    
    const roleLabel = (user.user_metadata?.role ?? "TEACHER").toString();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    if (!ALLOWED.includes(roleLabel as any)) redirect("/dashboard");

    const { data } = await getTeacherSalaryEligibility(
        1,
        9999,
        "eligible_first",
    );

    return (
        <SalaryEligibilityPageClient initialData={data} roleLabel={roleLabel} />
    );
}
