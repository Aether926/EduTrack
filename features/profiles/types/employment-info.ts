export type ProfileHR = {
  id: string;
  school_id: string | null;
  employeeId: string;
  plantillaNo: string;
  position: string;
  positionId: string;
  dateOfOriginalAppointment: string | null;
  dateOfLatestAppointment: string | null;
  created_at: string;
  updated_at: string;
};

export type HRChangeRequestPayload = {
  employeeId?: string | null;
  position?: string | null;
  plantillaNo?: string | null;
  positionId?: string | null;
  dateOfOriginalAppointment?: string | null;
  dateOfLatestAppointment?: string | null;
  reason: string;
};

export type ProfileHRChangeRequest = {
  id: string;
  teacher_id: string;
  requested_by: string;
  requested_at: string;
  status: "PENDING" | "APPROVED" | "REJECTED";
  reviewed_by: string | null;
  reviewed_at: string | null;
  review_note: string | null;
  payload: HRChangeRequestPayload;
};