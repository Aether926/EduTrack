import { createClient } from "@/lib/supabase/server";

export type UploadProofContext = {
  attendanceId: string;
  status: string;
  proofUrl: string | null;
  submittedAt: string | null;

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
  };
};

type PdRow = {
  id: string;
  title: string | null;
  type: string | null;
  level: string | null;
  start_date: string | null;
  end_date: string | null;
  total_hours: number | null;
  sponsoring_agency: string | null;
  venue: string | null;
};

type AttendanceWithPdRow = {
  id: string;
  status: string | null;
  proof_url: string | null;
  proof_submitted_at: string | null;
  training_id: string | null;
  ProfessionalDevelopment: PdRow | null;
};

export async function getUploadProofContext(
  attendanceId: string
): Promise<UploadProofContext | null> {
  const supabase = await createClient();

  // auth check
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) return null;

  const { data, error } = await supabase
    .from("Attendance")
    .select(
      `
      id,
      status,
      proof_url,
      proof_submitted_at,
      training_id,
      ProfessionalDevelopment:training_id (
        id,
        title,
        type,
        level,
        start_date,
        end_date,
        total_hours,
        sponsoring_agency,
        venue
      )
    `
    )
    .eq("id", attendanceId)
    .single<AttendanceWithPdRow>();

  if (error || !data) return null;

  const pd = data.ProfessionalDevelopment;

  return {
    attendanceId: data.id,
    status: data.status ?? "",
    proofUrl: data.proof_url ?? null,
    submittedAt: data.proof_submitted_at ?? null,

    training: {
      id: data.training_id ?? "",
      title: pd?.title ?? "(missing training title)",
      type: pd?.type ?? "",
      level: pd?.level ?? "",
      startDate: pd?.start_date ?? "",
      endDate: pd?.end_date ?? null,
      totalHours: pd?.total_hours ?? 0,
      sponsor: pd?.sponsoring_agency ?? null,
      venue: pd?.venue ?? null,
    },
  };
}
