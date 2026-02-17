import { createClient } from "@/lib/supabase/server";

export type CalendarEvent = {
  id: string; // attendance id
  trainingId: string;
  title: string;
  start: string;
  end: string | null;
};

type PdRow = {
  id: string;
  title: string | null;
  start_date: string | null;
  end_date: string | null;
};

type AttendanceRow = {
  id: string;
  training_id: string | null;
  ProfessionalDevelopment: PdRow | null;
};

export async function getMyUpcomingEvents(): Promise<CalendarEvent[]> {
  const supabase = await createClient();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) return [];

  const today = new Date().toISOString().slice(0, 10);

  const { data, error } = await supabase
    .from("Attendance")
    .select(
      `
      id,
      training_id,
      ProfessionalDevelopment:training_id (
        id,
        title,
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
        start: pd?.start_date ?? "",
        end: pd?.end_date ?? null,
      };
    })
    .filter((e) => e.start && e.start >= today);
}
