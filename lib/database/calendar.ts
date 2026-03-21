/* eslint-disable @typescript-eslint/no-explicit-any */
import { createClient } from "@/lib/supabase/server";

export type CalendarEvent = {
  id: string;
  trainingId: string;
  title: string;
  type: string | null;
  start: string;
  end: string | null;
  status: string;
  result: string | null;
};

export type AdminCalendarEvent = CalendarEvent & {
  type: string | null;
  teachers: { id: string; name: string; avatarUrl: string | null }[];
};

// ── Types ──────────────────────────────────────────────────────────────────────

type PdRow = {
  id: string;
  title: string | null;
  type: string | null;
  start_date: string | null;
  end_date: string | null;
};

type AttendanceRow = {
  id: string;
  training_id: string | null;
  status: string | null;
  result: string | null;
  ProfessionalDevelopment: PdRow | null;
};


// ── Teacher calendar (own events only) ────────────────────────────────────────

export async function getMyUpcomingEvents(): Promise<CalendarEvent[]> {
  const supabase = await createClient();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) return [];

  const { data, error } = await supabase
    .from("Attendance")
    .select(
      `
      id,
      training_id,
      status,
      result,
      ProfessionalDevelopment:training_id (
        id,
        title,
        type,
        start_date,
        end_date
      )
    `
    )
    .eq("teacher_id", auth.user.id);

  if (error || !data) return [];

  const rows = data as unknown as AttendanceRow[];

  return rows
    .map((r) => {
      const pd = r.ProfessionalDevelopment;
      return {
        id: String(r.id),
        trainingId: String(r.training_id ?? ""),
        title: pd?.title ?? "(no title)",
        type: pd?.type ?? null,
        start: pd?.start_date ?? "",
        end: pd?.end_date ?? null,
        status: r.status ?? "",
        result: r.result ?? null,
      };
    })
    .filter((e) => !!e.start);
}

// ── Admin calendar (all trainings + enrolled teachers) ────────────────────────

export async function getAllUpcomingEvents(): Promise<AdminCalendarEvent[]> {
  const { createAdminClient } = await import("@/lib/supabase/server");
  const admin = createAdminClient();
  

  // Step 1 — fetch all attendance rows with training + teacher ids
  const { data: attendanceData, error: attendanceError } = await admin
    .from("Attendance")
    .select("id, training_id, teacher_id");

  if (attendanceError || !attendanceData || attendanceData.length === 0) return [];

  const trainingIds = [...new Set(attendanceData.map((r: any) => r.training_id).filter(Boolean))];
  const teacherIds  = [...new Set(attendanceData.map((r: any) => r.teacher_id).filter(Boolean))];

  // Step 2 — fetch training details
  const { data: pdData, error: pdError } = await admin
    .from("ProfessionalDevelopment")
    .select("id, title, type, start_date, end_date")
    .in("id", trainingIds);

  if (pdError || !pdData) return [];

  // Step 3 — fetch teacher names from Profile table
  const { data: profileData, error: profileError } = await admin
    .from("Profile")
    .select("id, firstName, middleInitial, lastName")
    .in("id", teacherIds);

  // Build lookup maps
  const pdMap = new Map<string, { id: string; title: string | null; type: string | null; start_date: string | null; end_date: string | null }>(
    (pdData ?? []).map((pd: any) => [pd.id, pd])
  );
  const userMap = new Map<string, { id: string; name: string; avatarUrl: null }>(
    (profileData ?? []).map((p: any) => [
      p.id,
      {
        id: p.id,
        name: [p.firstName, p.middleName, p.lastName].filter(Boolean).join(" ") || "Unknown",
        avatarUrl: null,
      },
    ])
    
  );

  // Group attendance rows by training — collect teachers per training
  const trainingMap = new Map<string, AdminCalendarEvent>();

  for (const row of attendanceData as any[]) {
    const pd = pdMap.get(row.training_id);
    if (!pd?.start_date) continue;

    const profile = userMap.get(row.teacher_id);
    const teacher = profile
      ? { id: profile.id, name: profile.name, avatarUrl: null }
      : null;

    if (trainingMap.has(pd.id)) {
      if (teacher) trainingMap.get(pd.id)!.teachers.push(teacher);
    } else {
      trainingMap.set(pd.id, {
        id: pd.id,
        trainingId: pd.id,
        title: pd.title ?? "(no title)",
        type: pd.type ?? null,
        start: pd.start_date,
        end: pd.end_date ?? null,
        status: "",
        result: null,
        teachers: teacher ? [teacher] : [],
      });
    }
  }

  return Array.from(trainingMap.values());
}