export type AppointmentType =
  | "Original"
  | "Promotion"
  | "Reappointment"
  | "Transfer"
  | "Reinstatement";

export const APPOINTMENT_TYPES: AppointmentType[] = [
  "Original",
  "Promotion",
  "Reappointment",
  "Transfer",
  "Reinstatement",
];

export type AppointmentChangeRequest = {
  id: string;
  teacher_id: string;
  school_id: string | null;
  position: string;
  appointment_type: AppointmentType;
  start_date: string;
  end_date: string | null;
  memo_no: string | null;
  remarks: string | null;
  requested_by: string;
  requested_at: string;
  status: "PENDING" | "APPROVED" | "REJECTED";
  reviewed_by: string | null;
  reviewed_at: string | null;
  review_note: string | null;
  payload: Record<string, unknown> | null;
};

export type AppointmentHistory = {
  id: string;
  teacher_id: string;
  school_id: string | null;
  position: string;
  appointment_type: AppointmentType;
  start_date: string;
  end_date: string | null;
  memo_no: string | null;
  remarks: string | null;
  created_by: string;
  created_at: string;
  approved_by: string | null;
  approved_at: string | null;
  status: string;
};

export type AppointmentRequestForm = {
  position: string;
  appointment_type: AppointmentType | "";
  start_date: string;
  end_date: string;
  memo_no: string;
  remarks: string;
  school_name: string;
};