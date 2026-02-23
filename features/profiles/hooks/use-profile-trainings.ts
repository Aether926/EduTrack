import { useCallback, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import type { TrainingRow } from "@/features/profiles/types/trainings";
import { toast } from "sonner";

export function useProfileTrainings() {
  const [trainings, setTrainings] = useState<TrainingRow[]>([]);
  const [trainingsLoading, setTrainingsLoading] = useState(false);

  const loadTrainings = useCallback(async (teacherId: string) => {
    setTrainingsLoading(true);

    const { data: attendanceRows, error: aErr } = await supabase
      .from("Attendance")
      .select("id, training_id, status, result, proof_url, proof_path, created_at, approved_hours")
      .eq("teacher_id", teacherId)
      .order("created_at", { ascending: false });

    if (aErr) {
      toast.error("Attendance fetch error" );
      setTrainings([]);
      setTrainingsLoading(false);
      return;
    }

    const attendance = (attendanceRows ?? []) as Array<{
      id: string;
      training_id: string;
      status: string;
      result: string | null;
      proof_url: string | null;
      proof_path: string | null;
      created_at: string;
      approved_hours: number | null;
    }>;

    if (attendance.length === 0) {
      setTrainings([]);
      setTrainingsLoading(false);
      return;
    }

    const trainingIds = Array.from(new Set(attendance.map((r) => r.training_id)));

    const { data: pdRows, error: pdErr } = await supabase
      .from("ProfessionalDevelopment")
      .select("id, title, type, level, start_date, end_date, total_hours, sponsoring_agency")
      .in("id", trainingIds);

    if (pdErr) {
      toast.error("ProfessionalDevelopment fetch error");
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const pdMap = new Map<string, any>();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (pdRows ?? []).forEach((r: any) => pdMap.set(String(r.id), r));

    const merged: TrainingRow[] = attendance.map((a) => {
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
        approvedHours: a.approved_hours != null ? String(a.approved_hours) : null,
        sponsor: pd?.sponsoring_agency ?? "",

        status: a.status ?? "",
        result: a.result ?? null,

        proof_url: a.proof_url ?? null,
        proof_path: a.proof_path ?? null,

        created_at: a.created_at ?? "",
      };
    });

    setTrainings(merged);
    setTrainingsLoading(false);
  }, []);

  return { trainings, trainingsLoading, loadTrainings };
}
