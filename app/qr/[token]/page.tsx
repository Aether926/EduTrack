import { redirect } from "next/navigation";
import { createAdminClient, createClient } from "@/lib/supabase/server";
import PublicProfileView from "@/components/public-profile-view";

import type { ViewerRole } from "@/features/profiles/types/viewer-role";
import type { TrainingRow } from "@/features/profiles/types/trainings";

function isPublicSafeTraining(a: { status: string; result: string | null }) {
    const s = (a.status ?? "").toUpperCase();
    const r = (a.result ?? "").toUpperCase();
    return s === "APPROVED" && r === "PASSED";
}

export default async function QRPublicProfilePage({
    params,
}: {
    params: Promise<{ token: string }>;
}) {
    const { token } = await params;

    const admin = createAdminClient();
    const nowISO = new Date().toISOString();
    // eslint-disable-next-line react-hooks/purity
    const nowMs = Date.now();
    // ── 1. Validate QR token ──────────────────────────────────────────────────

    const { data: qrRow, error: qrErr } = await admin
        .from("ProfileQRCode")
        .select(
            "id, user_id, token, is_active, expires_at, scan_count, last_scanned_at",
        )
        .eq("token", token)
        .eq("is_active", true)
        .gt("expires_at", nowISO)
        .single();

    if (qrErr || !qrRow) redirect("/qr/invalid");

    const lastMs = qrRow.last_scanned_at
        ? new Date(qrRow.last_scanned_at).getTime()
        : 0;
    const COOLDOWN_MS = 30_000;

    if (nowMs - lastMs > COOLDOWN_MS) {
        await admin
            .from("ProfileQRCode")
            .update({
                scan_count: (qrRow.scan_count ?? 0) + 1,
                last_scanned_at: nowISO,
            })
            .eq("id", qrRow.id);
    }

    // ── 2. Fetch all profile tables in parallel ───────────────────────────────

    const uid = qrRow.user_id;

    const [
        { data: profile, error: pErr },
        { data: profileHR },
        { data: family },
        { data: children },
        { data: education },
        { data: emergency },
    ] = await Promise.all([
        admin.from("Profile").select("*").eq("id", uid).single(),
        admin.from("ProfileHR").select("*").eq("id", uid).single(),
        admin.from("ProfileFamily").select("*").eq("profileId", uid).single(),
        admin
            .from("ProfileChildren")
            .select("*")
            .eq("profileId", uid)
            .order("createdAt", { ascending: true }),
        admin.from("ProfileEducation").select("*").eq("profileId", uid),
        admin
            .from("ProfileEmergencyContact")
            .select("*")
            .eq("profileId", uid)
            .single(),
    ]);

    if (pErr || !profile) redirect("/qr/invalid");

    const fullProfile = {
        ...profile,
        ...profileHR,
        // Family
        spouseSurname: family?.spouseSurname ?? null,
        spouseFirstName: family?.spouseFirstName ?? null,
        spouseMiddleName: family?.spouseMiddleName ?? null,
        spouseNameExtension: family?.spouseNameExtension ?? null,
        spouseOccupation: family?.spouseOccupation ?? null,
        spouseEmployerName: family?.spouseEmployerName ?? null,
        spouseBusinessAddress: family?.spouseBusinessAddress ?? null,
        spouseTelephoneNo: family?.spouseTelephoneNo ?? null,
        fatherSurname: family?.fatherSurname ?? null,
        fatherFirstName: family?.fatherFirstName ?? null,
        fatherMiddleName: family?.fatherMiddleName ?? null,
        fatherNameExtension: family?.fatherNameExtension ?? null,
        motherSurname: family?.motherSurname ?? null,
        motherFirstName: family?.motherFirstName ?? null,
        motherMiddleName: family?.motherMiddleName ?? null,
        children: (children ?? []).map((c) => ({
            id: c.id,
            name: c.name ?? "",
            dateOfBirth: c.dateOfBirth ?? "",
        })),
        // Education (flatten by level)
        educationElementarySchool:
            education?.find((e) => e.level === "ELEMENTARY")?.schoolName ??
            null,
        educationElementaryDegree:
            education?.find((e) => e.level === "ELEMENTARY")?.degreeOrCourse ??
            null,
        educationElementaryFrom:
            education
                ?.find((e) => e.level === "ELEMENTARY")
                ?.attendanceFrom?.toString() ?? null,
        educationElementaryTo:
            education
                ?.find((e) => e.level === "ELEMENTARY")
                ?.attendanceTo?.toString() ?? null,
        educationElementaryUnits:
            education?.find((e) => e.level === "ELEMENTARY")
                ?.highestUnitsEarned ?? null,
        educationElementaryGraduated:
            education
                ?.find((e) => e.level === "ELEMENTARY")
                ?.yearGraduated?.toString() ?? null,
        educationElementaryHonors:
            education?.find((e) => e.level === "ELEMENTARY")
                ?.scholarshipHonors ?? null,
        educationSecondarySchool:
            education?.find((e) => e.level === "SECONDARY")?.schoolName ?? null,
        educationSecondaryDegree:
            education?.find((e) => e.level === "SECONDARY")?.degreeOrCourse ??
            null,
        educationSecondaryFrom:
            education
                ?.find((e) => e.level === "SECONDARY")
                ?.attendanceFrom?.toString() ?? null,
        educationSecondaryTo:
            education
                ?.find((e) => e.level === "SECONDARY")
                ?.attendanceTo?.toString() ?? null,
        educationSecondaryUnits:
            education?.find((e) => e.level === "SECONDARY")
                ?.highestUnitsEarned ?? null,
        educationSecondaryGraduated:
            education
                ?.find((e) => e.level === "SECONDARY")
                ?.yearGraduated?.toString() ?? null,
        educationSecondaryHonors:
            education?.find((e) => e.level === "SECONDARY")
                ?.scholarshipHonors ?? null,
        educationVocationalSchool:
            education?.find((e) => e.level === "VOCATIONAL")?.schoolName ??
            null,
        educationVocationalDegree:
            education?.find((e) => e.level === "VOCATIONAL")?.degreeOrCourse ??
            null,
        educationVocationalFrom:
            education
                ?.find((e) => e.level === "VOCATIONAL")
                ?.attendanceFrom?.toString() ?? null,
        educationVocationalTo:
            education
                ?.find((e) => e.level === "VOCATIONAL")
                ?.attendanceTo?.toString() ?? null,
        educationVocationalUnits:
            education?.find((e) => e.level === "VOCATIONAL")
                ?.highestUnitsEarned ?? null,
        educationVocationalGraduated:
            education
                ?.find((e) => e.level === "VOCATIONAL")
                ?.yearGraduated?.toString() ?? null,
        educationVocationalHonors:
            education?.find((e) => e.level === "VOCATIONAL")
                ?.scholarshipHonors ?? null,
        educationCollegeSchool:
            education?.find((e) => e.level === "COLLEGE")?.schoolName ?? null,
        educationCollegeDegree:
            education?.find((e) => e.level === "COLLEGE")?.degreeOrCourse ??
            null,
        educationCollegeFrom:
            education
                ?.find((e) => e.level === "COLLEGE")
                ?.attendanceFrom?.toString() ?? null,
        educationCollegeTo:
            education
                ?.find((e) => e.level === "COLLEGE")
                ?.attendanceTo?.toString() ?? null,
        educationCollegeUnits:
            education?.find((e) => e.level === "COLLEGE")?.highestUnitsEarned ??
            null,
        educationCollegeGraduated:
            education
                ?.find((e) => e.level === "COLLEGE")
                ?.yearGraduated?.toString() ?? null,
        educationCollegeHonors:
            education?.find((e) => e.level === "COLLEGE")?.scholarshipHonors ??
            null,
        educationGraduateSchool:
            education?.find((e) => e.level === "GRADUATE")?.schoolName ?? null,
        educationGraduateDegree:
            education?.find((e) => e.level === "GRADUATE")?.degreeOrCourse ??
            null,
        educationGraduateFrom:
            education
                ?.find((e) => e.level === "GRADUATE")
                ?.attendanceFrom?.toString() ?? null,
        educationGraduateTo:
            education
                ?.find((e) => e.level === "GRADUATE")
                ?.attendanceTo?.toString() ?? null,
        educationGraduateUnits:
            education?.find((e) => e.level === "GRADUATE")
                ?.highestUnitsEarned ?? null,
        educationGraduateGraduated:
            education
                ?.find((e) => e.level === "GRADUATE")
                ?.yearGraduated?.toString() ?? null,
        educationGraduateHonors:
            education?.find((e) => e.level === "GRADUATE")?.scholarshipHonors ??
            null,
        // Emergency Contact
        emergencyName: emergency?.name ?? null,
        emergencyRelationship: emergency?.relationship ?? null,
        emergencyAddress: emergency?.address ?? null,
        emergencyTelephoneNo: emergency?.telephoneNo ?? null,
    };

    // ── 3. Detect viewer session + role ──────────────────────────────────────

    const viewerClient = await createClient();
    const { data: auth } = await viewerClient.auth.getUser();

    let viewerRole: ViewerRole = "GUEST";

    if (auth.user?.id) {
        const { data: viewer } = await viewerClient
            .from("User")
            .select("role")
            .eq("id", auth.user.id)
            .single();

        if (viewer?.role === "ADMIN") viewerRole = "ADMIN";
        else if (viewer?.role === "TEACHER") viewerRole = "TEACHER";
    }

    const adminMode = viewerRole === "ADMIN";

    // ── 4. Fetch trainings (ADMIN only) ──────────────────────────────────────

    const { data: attendanceRows, error: aErr } = await admin
        .from("Attendance")
        .select(
            "id, training_id, status, result, proof_url, proof_path, created_at",
        )
        .eq("teacher_id", uid)
        .order("created_at", { ascending: false });

    const serializedProfile = JSON.parse(JSON.stringify(fullProfile));

    if (aErr || !attendanceRows || attendanceRows.length === 0) {
        return (
            <PublicProfileView
                profile={serializedProfile}
                trainings={[]}
                from="qr"
                viewerRole={viewerRole}
            />
        );
    }

    const attendance = attendanceRows as Array<{
        id: string;
        training_id: string;
        status: string;
        result: string | null;
        proof_url: string | null;
        proof_path: string | null;
        created_at: string;
    }>;

    // Only ADMIN sees trainings
    const filtered = adminMode ? attendance : [];

    if (filtered.length === 0) {
        return (
            <PublicProfileView
                profile={serializedProfile}
                trainings={[]}
                from="qr"
                viewerRole={viewerRole}
            />
        );
    }

    const trainingIds = Array.from(new Set(filtered.map((r) => r.training_id)));

    const { data: pdRows } = await admin
        .from("ProfessionalDevelopment")
        .select(
            "id, title, type, level, start_date, end_date, total_hours, approved_hours, sponsoring_agency",
        )
        .in("id", trainingIds.length ? trainingIds : ["__none__"]);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const pdMap = new Map<string, any>();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (pdRows ?? []).forEach((r: any) => pdMap.set(String(r.id), r));

    const trainings: TrainingRow[] = filtered.map((a) => {
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

    return (
        <PublicProfileView
            profile={serializedProfile}
            trainings={trainings}
            from="qr"
            viewerRole={viewerRole}
        />
    );
}
