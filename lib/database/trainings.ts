import { createClient } from "@/lib/supabase/server";
import { toast } from "sonner";

export type MyTrainingSeminarRow = {
  id: string;
  trainingId: string;
  type: string;
  title: string;
  level: string;
  startDate: string;
  endDate: string;
  totalHours: string;
  approvedHours: string | null; // ← add
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

export async function getMyTrainingSeminars(userId: string): Promise<MyTrainingSeminarRow[]> {
  const supabase = await createClient();

  const { data: attendance, error: aErr } = await supabase
    .from("Attendance")
    .select("id, training_id, status, created_at, approved_hours, proof_url")
    .eq("teacher_id", userId)
    .order("created_at", { ascending: false });

  if (aErr) {
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