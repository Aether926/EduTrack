import { createClient } from "@/lib/supabase/server";

export type MyTrainingSeminarRow = {
  id: string; // attendance id
  trainingId: string; // professionalDevelopment id
  type: string;
  title: string;
  level: string;
  startDate: string;
  endDate: string;
  totalHours: string;
  sponsor: string;
  status: string;
};

type AttendanceRow = {
  id: string;
  training_id: string;
  status: string;
  created_at: string;
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

export async function getMyTrainingSeminars(): Promise<MyTrainingSeminarRow[]> {
  const supabase = await createClient();
  

  const { data: authData, error: authError } = await supabase.auth.getUser();
  const user = authData.user;

  if (authError || !user) return [];

  // 1) get attendance rows for this teacher
  const { data: attendance, error: aErr } = await supabase
    .from("Attendance")
    .select("id, training_id, status, created_at")
    .eq("teacher_id", user.id)
    .order("created_at", { ascending: false });

  if (aErr) {
    console.error("getMyTrainingSeminars Attendance error:", aErr.message);
    return [];
  }

  if (!attendance || attendance.length === 0) return [];

  const attendanceRows = attendance as AttendanceRow[];
  const trainingIds = Array.from(new Set(attendanceRows.map((r) => r.training_id)));

  // 2) fetch the trainings
  const { data: trainings, error: pErr } = await supabase
    .from("ProfessionalDevelopment")
    .select("id, type, title, level, start_date, end_date, total_hours, sponsoring_agency")
    .in("id", trainingIds);

  if (pErr) {
    console.error("getMyTrainingSeminars ProfessionalDevelopment error:", pErr.message);
    // even if PD fails, still return attendance rows with placeholders
    return attendanceRows.map((r) => ({
      id: String(r.id),
      trainingId: String(r.training_id),
      type: "",
      title: "(missing training details)",
      level: "",
      startDate: "",
      endDate: "",
      totalHours: "",
      sponsor: "",
      status: r.status ?? "",
    }));
  }

  const pdMap = new Map<string, PDRow>();
  (trainings as PDRow[] | null)?.forEach((t) => pdMap.set(String(t.id), t));

  // 3) merge
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
      sponsor: pd?.sponsoring_agency ?? "",
      status: r.status ?? "",
    };
  });
}
