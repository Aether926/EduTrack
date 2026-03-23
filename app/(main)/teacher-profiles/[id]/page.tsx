import { createClient, createAdminClient } from "@/lib/supabase/server";
import PublicProfileView from "@/components/public-profile-view";

import type { ViewerRole } from "@/features/profiles/types/viewer-role";
import type { TrainingRow } from "@/features/profiles/types/trainings";
import { redirect } from "next/navigation";

function isPublicSafeTraining(a: { status: string; result: string | null }) {
    const s = (a.status ?? "").toUpperCase();
    const r = (a.result ?? "").toUpperCase();
    return s === "APPROVED" && r === "PASSED";
}

async function getTrainingsForTeacher(
    teacherId: string,
    viewerRole: ViewerRole,
): Promise<TrainingRow[]> {
    const adminMode = viewerRole === "ADMIN";
    const db = adminMode ? createAdminClient() : await createClient();

    const { data: attendanceRows, error: aErr } = await db
        .from("Attendance")
        .select(
            "id, training_id, status, result, proof_url, proof_path, created_at",
        )
        .eq("teacher_id", teacherId)
        .order("created_at", { ascending: false });

    if (aErr || !attendanceRows || attendanceRows.length === 0) return [];

    const attendance = attendanceRows as Array<{
        id: string;
        training_id: string;
        status: string;
        result: string | null;
        proof_url: string | null;
        proof_path: string | null;
        created_at: string;
    }>;

    const filtered = adminMode
        ? attendance
        : attendance.filter(isPublicSafeTraining);

    const trainingIds = Array.from(new Set(filtered.map((r) => r.training_id)));

    const { data: pdRows } = await db
        .from("ProfessionalDevelopment")
        .select(
            "id, title, type, level, start_date, end_date, total_hours, approved_hours, sponsoring_agency",
        )
        .in("id", trainingIds.length ? trainingIds : ["__none__"]);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const pdMap = new Map<string, any>();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (pdRows ?? []).forEach((r: any) => pdMap.set(String(r.id), r));

    return filtered.map((a) => {
        const pd = pdMap.get(String(a.training_id));

        return {
            attendanceId: String(a.id),
            trainingId: String(a.training_id),

            title: pd?.title ?? "(missing title)",
            type: pd?.type ?? "",
            level: pd?.level ?? "",
            startDate: pd?.start_date ?? "",
            endDate: pd?.end_date ?? "",
            totalHours: pd?.total_hours != null ? String(pd.total_hours) : "",
            approvedHours: pd?.approved_hours ?? null,
            sponsor: pd?.sponsoring_agency ?? "",

            status: a.status ?? "",
            result: a.result ?? null,

            proof_url: adminMode ? (a.proof_url ?? null) : null,
            proof_path: adminMode ? (a.proof_path ?? null) : null,

            created_at: a.created_at ?? "",
        };
    });
}

export default async function TeacherPublicProfilePage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = await params;

    const supabase = await createClient();
    const { data: auth } = await supabase.auth.getUser();

    if (!auth.user) return <div className="p-6">not authenticated</div>;

    const { data: viewer } = await supabase
        .from("User")
        .select("role")
        .eq("id", auth.user.id)
        .single();

    const viewerRole: ViewerRole =
        viewer?.role === "ADMIN" ? "ADMIN" : "TEACHER";

    // Always use adminClient for the profile fetch so RLS doesn't strip fields
    // when a teacher views another teacher's profile. PublicProfileView handles
    // what to show/hide via privacySettings.
    const db = createAdminClient();

    const { data: profile, error } = await db
        .from("Profile")
        .select(
            `
            *,
            ProfileEmergencyContact (*)
        `,
        )
        .eq("id", id)
        .single();

    if (error || !profile) redirect("/teacher-profiles");

    const { data: profileHR } = await db
        .from("ProfileHR")
        .select("*")
        .eq("id", id)
        .single();

    // Safe merge: only let ProfileHR overwrite Profile fields when the HR value
    // is a real value — not null, undefined, or an empty string. This prevents
    // empty/unset HR fields from clobbering data that lives in Profile
    // (e.g. emergencyName, emergencyRelationship, emergencyAddress, emergencyTelephoneNo).
    const hrEntries = Object.fromEntries(
        Object.entries(profileHR ?? {}).filter(
            ([v]) => v !== null && v !== undefined && v !== "",
        ),
    );

    const fullProfile = {
        ...profile,
        ...hrEntries,
        // Always prefer Profile's privacySettings — it's the source of truth
        privacySettings:
            profile.privacySettings ?? profileHR?.privacySettings ?? null,
    };

    const trainings = await getTrainingsForTeacher(id, viewerRole);

    return (
        <PublicProfileView
            profile={fullProfile}
            from="teacher"
            viewerRole={viewerRole}
            trainings={trainings}
            hasSession={!!auth.user}
        />
    );
}
