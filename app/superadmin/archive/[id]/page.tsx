import { redirect } from "next/navigation";
import { getUser, createAdminClient } from "@/lib/supabase/server";
import PublicProfileView from "@/features/profiles/pages/public-profile-view";
import ArchiveProfileBanner from "@/features/archive/components/archive-profile-banner";

export default async function SuperadminArchivedProfilePage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id: teacherId } = await params;

    const user = await getUser();
    if (!user) redirect("/signin");

    const role = user.user_metadata?.role ?? null;
    if (role !== "SUPERADMIN") redirect("/dashboard");

    const admin = createAdminClient();

    const { data: archivedUser } = await admin
        .from("User")
        .select("status, archivedAt, archiveReason")
        .eq("id", teacherId)
        .eq("status", "ARCHIVED")
        .maybeSingle();

    if (!archivedUser) redirect("/superadmin/archive");

    const { data: profile } = await admin
        .from("Profile")
        .select("*")
        .eq("id", teacherId)
        .maybeSingle();

    const { data: hr } = await admin
        .from("ProfileHR")
        .select("*")
        .eq("id", teacherId)
        .maybeSingle();

    const mergedProfile = {
        ...profile,
        ...hr,
        children: [],
    };

    return (
        <div className="relative min-h-screen">
            <ArchiveProfileBanner
                archivedAt={archivedUser.archivedAt}
                archiveReason={archivedUser.archiveReason}
                
            />

            <PublicProfileView
                profile={mergedProfile}
                from="teacher"
                trainings={[]}
                viewerRole="ADMIN"
                hasSession={true}
            />
        </div>
    );
}