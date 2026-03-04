export type TrainingRow = {
  attendanceId: string;
  trainingId: string;
  title: string;
  type: string;
  level: string;
  startDate: string;
  endDate: string;
  totalHours: string;
  approvedHours: string | null;
  sponsor: string;
  status: string;
  result: string | null;
  proof_url: string | null;
  proof_path: string | null;
  created_at: string;
};
