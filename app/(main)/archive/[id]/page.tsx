import { redirect } from "next/navigation";
import { getUser, createAdminClient } from "@/lib/supabase/server";
import PublicProfileView from "@/features/profiles/pages/public-profile-view";
import ArchiveProfileBanner from "@/features/archive/components/archive-profile-banner";

const ALLOWED = new Set(["ADMIN", "SUPERADMIN"]);

export default async function ArchivedProfilePage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id: teacherId } = await params;

    const user = await getUser();
    if (!user) redirect("/signin");

    const role = (user.user_metadata?.role ?? "TEACHER").toString();
    if (!ALLOWED.has(role)) redirect("/dashboard");

    const admin = createAdminClient();

    // Verify user is archived
    const { data: archivedUser } = await admin
        .from("User")
        .select("status, archivedAt, archiveReason")
        .eq("id", teacherId)
        .eq("status", "ARCHIVED")
        .maybeSingle();

    if (!archivedUser) redirect("/archive");

    // Fetch full profile
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

    const { data: trainings } = await admin
        .from("Attendance")
        .select(`
            id,
            status,
            submitted_at,
            proof_url,
            ProfessionalDevelopment:training_id (
                id, title, type, level,
                start_date, end_date,
                total_hours, sponsor, venue
            )
        `)
        .eq("teacher_id", teacherId);

    const mergedProfile = {
        ...profile,
        ...hr,
        children:    [],
        trainings:   trainings ?? [],
    };

    return (
        <div className="relative min-h-screen">
            {/* Archived banner */}
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
                showRecordButton={true}
            />
        </div>
    );
}