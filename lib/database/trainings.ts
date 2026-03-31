'use server';
import { createClient, createAdminClient } from "@/lib/supabase/server";

export type MyTrainingSeminarRow = {
  id: string;
  trainingId: string;
  type: string;
  title: string;
  level: string;
  startDate: string;
  endDate: string;
  totalHours: string;
  approvedHours: string | null;
  sponsor: string;
  status: string;
  proofUrl: string | null;
};

type AttendanceRow = {
  id: string;
  training_id: string;
  status: string;
  created_at: string;
  approved_hours: number | null;
  proof_url: string | null;
};

type PDRow = {
  id: string;
  type: string | null;
  title: string | null;
  level: string | null;
  start_date: string | null;
  end_date: string | null;
  total_hours: number | null;
  sponsoring_agency: string | null;
};

export type AssignedTeacher = {
  id: string;
  name: string;
  profileImage: string | null;
  attendanceStatus: string | null; // APPROVED, ENROLLED, etc. from Attendance table
};

const STATUS_SORT_ORDER: Record<string, number> = {
  APPROVED: 0,
  ENROLLED: 1,
};

// ─────────────────────────────────────────────────────────────────────────────

export async function getMyTrainingSeminars(userId: string): Promise<MyTrainingSeminarRow[]> {
  const supabase = await createClient();
  const { data: attendance, error: aErr } = await supabase
    .from("Attendance")
    .select("id, training_id, status, created_at, approved_hours, proof_url")
    .eq("teacher_id", userId)
    .order("created_at", { ascending: false });
  if (aErr) {
    console.error("getMyTrainingSeminars:attendance", aErr);
    return [];
  }
  if (!attendance || attendance.length === 0) return [];
  const attendanceRows = attendance as AttendanceRow[];
  const trainingIds = Array.from(new Set(attendanceRows.map((r) => r.training_id)));
  const { data: trainings, error: pErr } = await supabase
    .from("ProfessionalDevelopment")
    .select("id, type, title, level, start_date, end_date, total_hours, sponsoring_agency")
    .in("id", trainingIds);
  if (pErr) {
    console.error("getMyTrainingSeminars:PD", pErr);
    return attendanceRows.map((r) => ({
      id: String(r.id),
      trainingId: String(r.training_id),
      type: "",
      title: "(missing training details)",
      level: "",
      startDate: "",
      endDate: "",
      totalHours: "",
      approvedHours: null,
      sponsor: "",
      status: r.status ?? "",
      proofUrl: null,
    }));
  }
  const pdMap = new Map<string, PDRow>();
  (trainings as PDRow[] | null)?.forEach((t) => pdMap.set(String(t.id), t));
  return attendanceRows.map((r) => {
    const pd = pdMap.get(String(r.training_id));
    return {
      id: String(r.id),
      trainingId: String(r.training_id),
      type: pd?.type ?? "",
      title: pd?.title ?? "(missing title)",
      level: pd?.level ?? "",
      startDate: pd?.start_date ?? "",
      endDate: pd?.end_date ?? "",
      totalHours: pd?.total_hours != null ? String(pd.total_hours) : "",
      approvedHours: r.approved_hours != null ? String(r.approved_hours) : null,
      sponsor: pd?.sponsoring_agency ?? "",
      status: r.status ?? "",
      proofUrl: r.proof_url ?? null,
    };
  });
}

export async function getAssignedTeachersForTraining(trainingId: string): Promise<AssignedTeacher[]> {
  const supabase = createAdminClient();

  // Step 1: Get teacher_ids AND their attendance status
  const { data: attendanceRows, error: aErr } = await supabase
    .from("Attendance")
    .select("teacher_id, status")
    .eq("training_id", trainingId);

  if (aErr) {
    console.error("getAssignedTeachersForTraining:attendance", aErr);
    return [];
  }
  if (!attendanceRows || attendanceRows.length === 0) {
    return [];
  }

  // Build a map of teacherId → attendanceStatus
  const attendanceStatusMap = new Map<string, string>();
  attendanceRows.forEach((r: { teacher_id: string; status: string }) => {
    attendanceStatusMap.set(r.teacher_id, r.status);
  });

  const teacherIds: string[] = attendanceRows
    .map((r: { teacher_id: string }) => r.teacher_id)
    .filter(Boolean);

  // Step 2: Fetch profiles
  const { data: profiles, error: pErr } = await supabase
    .from("Profile")
    .select("id, firstName, lastName, profileImage")
    .in("id", teacherIds);

  if (pErr) {
    console.error("getAssignedTeachersForTraining:profile", pErr);
    return [];
  }

  const result = (profiles ?? []).map((p: {
    id: string;
    firstName: string | null;
    lastName: string | null;
    profileImage: string | null;
  }) => ({
    id: p.id,
    name: `${p.firstName ?? ""} ${p.lastName ?? ""}`.trim(),
    profileImage: p.profileImage ?? null,
    attendanceStatus: attendanceStatusMap.get(p.id) ?? null,
  }));

  // Sort: APPROVED first, ENROLLED second, others last
  return result.sort((a, b) => {
    const aOrder = STATUS_SORT_ORDER[a.attendanceStatus?.toUpperCase() ?? ""] ?? 99;
    const bOrder = STATUS_SORT_ORDER[b.attendanceStatus?.toUpperCase() ?? ""] ?? 99;
    return aOrder - bOrder;
  });
}   