export type AppointmentHistoryRow = {
  id: string;
  teacher_id: string;
  school_id: string | null;
  school_name: string | null;
  position: string;
  appointment_type: string;
  start_date: string;
  end_date: string | null;
  memo_no: string | null;
  remarks: string | null;
  created_by: string;
  created_at: string;
  approved_by: string | null;
  approved_at: string | null;
  status: string;
  teacher: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  } | null;
};

export type AddAppointmentForm = {
  teacher_id: string;
  position: string;
  appointment_type: string;
  start_date: string;
  end_date: string;
  memo_no: string;
  remarks: string;
  school_name: string;
};