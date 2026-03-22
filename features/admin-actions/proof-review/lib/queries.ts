import { createAdminClient } from "@/lib/supabase/server";
import type { ProofReviewRow } from "../types";

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
  id: string;
  firstName: string | null;
  lastName: string | null;
  profileImage: string | null;
};

type ProfileHRRow = {
  id: string;
  employeeId: string | null;
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

  // trainings
  const { data: pds } = await admin
    .from("ProfessionalDevelopment")
    .select(
      "id,title,type,level,start_date,end_date,total_hours,sponsoring_agency,venue,description"
    )
    .in("id", trainingIds);

  const pdMap = new Map<string, PDRow>(
    ((pds ?? []) as PDRow[]).map((x) => [String(x.id), x])
  );

  // users → email
  const { data: users } = await admin
    .from("User")
    .select("id,email")
    .in("id", teacherIds);

  const userMap = new Map<string, UserRow>(
    ((users ?? []) as UserRow[]).map((u) => [String(u.id), u])
  );

  // Profile — name + avatar only (id is text, matches teacher_id)
  const { data: profData } = await admin
    .from("Profile")
    .select("id,firstName,lastName,profileImage")
    .in("id", teacherIds);

  const profileMap = new Map<string, ProfileRow>(
    ((profData ?? []) as ProfileRow[]).map((p) => [String(p.id), p])
  );

  // ProfileHR — employeeId (id is uuid, need to cast)
  const { data: hrData } = await admin
    .from("ProfileHR")
    .select("id,employeeId")
    .in("id", teacherIds);

  const hrMap = new Map<string, ProfileHRRow>(
    ((hrData ?? []) as ProfileHRRow[]).map((p) => [String(p.id), p])
  );

  return attRows.map((r) => {
    const pd = pdMap.get(String(r.training_id));
    const u = userMap.get(String(r.teacher_id));
    const prof = profileMap.get(String(r.teacher_id));
    const hr = hrMap.get(String(r.teacher_id));

    const firstName = prof?.firstName ?? "";
    const lastName = prof?.lastName ?? "";
    const fullName = `${firstName} ${lastName}`.trim();

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
        firstName,
        lastName,
        employeeId: hr?.employeeId ?? null,
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