import { createAdminClient } from "@/lib/supabase/server";

export type ProofReviewRow = {
  attendanceId: string;

  // attendance
  status: string;
  submittedAt: string | null;
  proofUrl: string | null;
  result: string | null;
  remarks: string | null;

  // teacher
  teacher: {
    userId: string;
    email: string | null;
    name: string;
    employeeId: string | null;
    profileImage: string | null;
  };

  // training
  training: {
    id: string;
    title: string;
    type: string;
    level: string;
    startDate: string;
    endDate: string | null;
    totalHours: number;
    sponsor: string | null;
    venue: string | null;
    description: string | null;
  };
};

type AttendanceRow = {
  id: string;
  teacher_id: string;
  training_id: string;
  status: string;
  proof_url: string | null;
  proof_submitted_at: string | null;
  result: string | null;
  remarks: string | null;
};

type UserRow = { id: string; email: string | null };

type ProfileRow = {
  email: string | null;
  firstName: string | null;
  lastName: string | null;
  employeeId: string | null;
  profileImage: string | null;
};

type PDRow = {
  id: string;
  title: string;
  type: string;
  level: string;
  start_date: string;
  end_date: string | null;
  total_hours: number;
  sponsoring_agency: string | null;
  venue: string | null;
  description: string | null;
};

export async function getPendingProofs(): Promise<ProofReviewRow[]> {
  const admin = createAdminClient();

  // 1) attendance rows waiting for review
  const { data: att, error: attErr } = await admin
    .from("Attendance")
    .select(
      "id,teacher_id,training_id,status,proof_url,proof_submitted_at,result,remarks"
    )
    .eq("status", "SUBMITTED")
    .order("proof_submitted_at", { ascending: false });

  if (attErr || !att) return [];
  const attRows = att as AttendanceRow[];

  const teacherIds = Array.from(new Set(attRows.map((r) => r.teacher_id)));
  const trainingIds = Array.from(new Set(attRows.map((r) => r.training_id)));

  // 2) trainings
  const { data: pds } = await admin
    .from("ProfessionalDevelopment")
    .select(
      "id,title,type,level,start_date,end_date,total_hours,sponsoring_agency,venue,description"
    )
    .in("id", trainingIds);

  const pdMap = new Map<string, PDRow>(
    ((pds ?? []) as PDRow[]).map((x) => [String(x.id), x])
  );

  // 3) users -> email
  const { data: users } = await admin
    .from("User")
    .select("id,email")
    .in("id", teacherIds);

  const userMap = new Map<string, UserRow>(
    ((users ?? []) as UserRow[]).map((u) => [String(u.id), u])
  );

  const emails = Array.from(
    new Set(
      teacherIds
        .map((id) => userMap.get(String(id))?.email ?? null)
        .filter((e): e is string => !!e)
    )
  );

  // 4) profiles by email
  let profiles: ProfileRow[] = [];
  if (emails.length > 0) {
    const { data: profData } = await admin
      .from("Profile")
      .select("email,firstName,lastName,employeeId,profileImage")
      .in("email", emails);

    profiles = (profData ?? []) as ProfileRow[];
  }

  const profileByEmail = new Map<string, ProfileRow>(
    profiles
      .filter((p) => p.email)
      .map((p) => [String(p.email), p])
  );

  // 5) map final rows
  return attRows.map((r) => {
    const pd = pdMap.get(String(r.training_id));
    const u = userMap.get(String(r.teacher_id));
    const prof = u?.email ? profileByEmail.get(u.email) : null;

    const fullName = `${prof?.firstName ?? ""} ${prof?.lastName ?? ""}`.trim();

    return {
      attendanceId: String(r.id),

      status: r.status,
      submittedAt: r.proof_submitted_at ?? null,
      proofUrl: r.proof_url ?? null,
      result: r.result ?? null,
      remarks: r.remarks ?? null,

      teacher: {
        userId: String(r.teacher_id),
        email: u?.email ?? null,
        name: fullName || u?.email || "(unknown)",
        employeeId: prof?.employeeId ?? null,
        profileImage: prof?.profileImage ?? null,
      },

      training: {
        id: String(r.training_id),
        title: pd?.title ?? "(unknown training)",
        type: pd?.type ?? "",
        level: pd?.level ?? "",
        startDate: pd?.start_date ?? "",
        endDate: pd?.end_date ?? null,
        totalHours: pd?.total_hours ?? 0,
        sponsor: pd?.sponsoring_agency ?? null,
        venue: pd?.venue ?? null,
        description: pd?.description ?? null,
      },
    };
  });
}
