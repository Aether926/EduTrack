import {
    getUser,
    createClient,
    createAdminClient,
} from "@/lib/supabase/server";
import PublicProfileView from "@/components/public-profile-view";
import type { ViewerRole } from "@/features/profiles/types/viewer-role";
import type { TrainingRow } from "@/features/profiles/types/trainings";
import { redirect } from "next/navigation";

export const revalidate = 60;

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
    if (filtered.length === 0) return [];

    const trainingIds = Array.from(new Set(filtered.map((r) => r.training_id)));

    const { data: pdRows } = await db
        .from("ProfessionalDevelopment")
        .select(
            "id, title, type, level, start_date, end_date, total_hours, sponsoring_agency",
        )
        .in("id", trainingIds);

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
            approvedHours: null,
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

    const user = await getUser();

    // ── Resolve viewer role (mirrors QR page logic) ───────────────────────────
    let viewerRole: ViewerRole = "GUEST";
    const hasSession = !!user;

    if (user) {
        const supabase = await createClient();
        const { data: viewer } = await supabase
            .from("User")
            .select("role")
            .eq("id", user.id)
            .single();

        if (viewer?.role === "ADMIN" || viewer?.role === "SUPERADMIN")
            viewerRole = "ADMIN";
        else if (viewer?.role === "TEACHER") viewerRole = "TEACHER";
    }

    const adminMode = viewerRole === "ADMIN";
    const db = adminMode ? createAdminClient() : await createClient();

    const [{ data: profile, error }, { data: profileHR }, trainings] =
        await Promise.all([
            db.from("Profile").select("*").eq("id", id).single(),
            db.from("ProfileHR").select("*").eq("id", id).single(),
            getTrainingsForTeacher(id, viewerRole),
        ]);

    if (error || !profile) redirect("/teacher-profiles");

    const fullProfile = { ...profile, ...profileHR };

    return (
        <PublicProfileView
            profile={fullProfile}
            from="teacher"
            viewerRole={viewerRole}
            trainings={trainings}
            hasSession={hasSession}
        />
    );
}
