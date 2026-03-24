import { getUser } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { createAdminClient } from "@/lib/supabase/server";
import { fetchSecurityLogs } from "@/features/superadmin/actions/fetch-actions";
import SuperadminDashboardView from "@/features/superadmin/components/superadmin-dashboard-view";
import PatchNoteModal from "@/components/patch-note-modal";

export default async function SuperadminDashboardPage() {
    const user = await getUser();
    if (!user) redirect("/signin");

    const role = user.user_metadata?.role ?? null;
    if (role !== "SUPERADMIN") redirect("/dashboard");

    const admin = createAdminClient();

    const [
        { count: totalTeachers },
        { count: totalAdmins },
        { count: totalPending },
        { count: totalSuspended },
        { count: superadminCount },
        logs,
    ] = await Promise.all([
        admin
            .from("User")
            .select("*", { count: "exact", head: true })
            .eq("role", "TEACHER")
            .eq("status", "APPROVED"),
        admin
            .from("User")
            .select("*", { count: "exact", head: true }).eq("role", "ADMIN")
            .eq("status", "APPROVED"),
        admin
            .from("User")
            .select("*", { count: "exact", head: true })
            .eq("status", "PENDING"),
        admin
            .from("User")
            .select("*", { count: "exact", head: true })
            .eq("status", "SUSPENDED"),
        admin
            .from("User")
            .select("*", { count: "exact", head: true })
            .eq("role", "SUPERADMIN"),
        fetchSecurityLogs(),
    ]);

    return (
        <>
        <SuperadminDashboardView
            stats={{
                totalTeachers: totalTeachers ?? 0,
                totalAdmins: totalAdmins ?? 0,
                totalPending: totalPending ?? 0,
                totalSuspended: totalSuspended ?? 0,
                superadminCount: superadminCount ?? 0,
            }}
            logs={logs}
            viewerId={user.id} />
            <PatchNoteModal />
        </>
    );
}