/* eslint-disable @typescript-eslint/no-explicit-any */
import { redirect } from "next/navigation";
import { getUser, createAdminClient } from "@/lib/supabase/server";
import AdminTeacherManage from "@/features/admin-actions/teachers/components/manage-profile";

const ALLOWED = ["ADMIN", "SUPERADMIN"] as const;

export default async function AdminTeacherEditPage({
    params,
}: {
    params: { id: string };
}) {
    const user = await getUser();
    if (!user) redirect("/signin");

    const roleLabel = (user.user_metadata?.role ?? "TEACHER").toString();
    if (!ALLOWED.includes(roleLabel as any)) redirect("/");

    const admin = createAdminClient();
    const { id } = await params;

    const [
        { data: profile },
        { data: hr },
        { data: appointmentHistory },
        { data: trainings },
    ] = await Promise.all([
        admin.from("Profile")
            .select("id, firstName, lastName, middleInitial, email, profileImage, contactNumber, address, gender, age, dateOfBirth, civilStatus, nationality, religion, pagibigNo, philHealthNo, gsisNo, tinNo, subjectSpecialization, bachelorsDegree, postGraduate")
            .eq("id", id)
            .single(),
        admin
            .from("ProfileHR")
            .select("*")
            .eq("id", id)
            .single(),
        admin
            .from("AppointmentHistory")
            .select("*")
            .eq("teacher_id", id)
            .order("start_date", { ascending: false }),
        admin.from("TrainingAttendance")
            .select(`id, status, result, proof_url, Training (id, title, type, level, sponsor, totalHours, approvedHours, startDate, endDate)`)
            .eq("teacher_id", id),
    ]);

    if (!profile) redirect("/admin-actions/teachers");

    const mappedTrainings = (trainings ?? []).map((t: any) => ({
        attendanceId:  t.id,
        trainingId:    t.Training?.id    ?? "",
        status:        t.status,
        result:        t.result,
        proof_url:     t.proof_url,
        proof_path:    t.proof_url,
        title:         t.Training?.title ?? "",
        type:          t.Training?.type  ?? "",
        level:         t.Training?.level ?? "",
        sponsor:       t.Training?.sponsor       ?? "",
        totalHours:    t.Training?.totalHours    ?? null,
        approvedHours: t.Training?.approvedHours ?? null,
        startDate:     t.Training?.startDate     ?? null,
        endDate:       t.Training?.endDate       ?? null,
        created_at:    new Date().toISOString(),
    }));

    return (
        <AdminTeacherManage
            teacherId={id}
            profile={profile}
            hr={hr ?? { employeeId: "", position: "", plantillaNo: "", dateOfOriginalAppointment: null, dateOfLatestAppointment: null }}
            appointmentHistory={appointmentHistory ?? []}
            trainings={mappedTrainings}
        />
    );
}