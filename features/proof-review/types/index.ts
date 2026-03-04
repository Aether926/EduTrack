export type ProofReviewRow = {
  attendanceId: string;

  status: string;
  submittedAt: string | null;
  proofUrl: string | null;
  result: string | null;
  remarks: string | null;

  teacher: {
    userId: string;
    email: string | null;
    name: string;
    employeeId: string | null;
    profileImage: string | null;
  };

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

export type ActionResult<T = null> =
  | { ok: true; data?: T }
  | { ok: false; error: string };