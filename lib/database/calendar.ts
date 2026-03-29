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

  // Step 1 — fetch ALL trainings (not just ones with attendance rows)
  const { data: pdData, error: pdError } = await admin
    .from("ProfessionalDevelopment")
    .select("id, title, type, start_date, end_date");

  if (pdError || !pdData || pdData.length === 0) return [];

  // Step 2 — fetch all attendance rows to map teachers to trainings
  const { data: attendanceData } = await admin
    .from("Attendance")
    .select("training_id, teacher_id");

  const teacherIds = [
    ...new Set(
      (attendanceData ?? []).map((r: any) => r.teacher_id).filter(Boolean),
    ),
  ];

  // Step 3 — fetch teacher profiles
  const { data: profileData } = teacherIds.length
    ? await admin
        .from("Profile")
        .select("id, firstName, middleInitial, lastName")
        .in("id", teacherIds)
    : { data: [] };

  const userMap = new Map<string, { id: string; name: string; avatarUrl: null }>(
    (profileData ?? []).map((p: any) => [
      p.id,
      {
        id: p.id,
        name: [p.firstName, p.middleInitial, p.lastName]
          .filter(Boolean)
          .join(" ") || "Unknown",
        avatarUrl: null,
      },
    ]),
  );

  // Group teachers by training_id
  const teachersByTraining = new Map<string, { id: string; name: string; avatarUrl: null }[]>();
  for (const row of (attendanceData ?? []) as any[]) {
    if (!row.training_id) continue;
    const profile = userMap.get(row.teacher_id);
    if (!profile) continue;
    if (!teachersByTraining.has(row.training_id)) {
      teachersByTraining.set(row.training_id, []);
    }
    const list = teachersByTraining.get(row.training_id)!;
    if (!list.some((t) => t.id === profile.id)) list.push(profile);
  }

  // Build one event per training (including those with 0 enrolled teachers)
  return (pdData as any[])
    .filter((pd) => !!pd.start_date)
    .map((pd) => ({
      id: pd.id,
      trainingId: pd.id,
      title: pd.title ?? "(no title)",
      type: pd.type ?? null,
      start: pd.start_date,
      end: pd.end_date ?? null,
      status: "",
      result: null,
      teachers: teachersByTraining.get(pd.id) ?? [],
    }));
}