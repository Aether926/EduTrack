// features/admin-actions/teachers/types/manage-profile.ts

export type TeacherProfile = {
  id: string;
  firstName: string | null;
  lastName: string | null;
  middleInitial: string | null;
  email: string | null;
  profileImage: string | null;
  contactNumber: string | null;
  address: string | null;
  gender: string | null;
  age: number | null;
  dateOfBirth: string | null;
  civilStatus: string | null;
  nationality: string | null;
  religion: string | null;
  pagibigNo: string | null;
  philHealthNo: string | null;
  gsisNo: string | null;
  tinNo: string | null;
  subjectSpecialization: string | null;
  bachelorsDegree: string | null;
  postGraduate: string | null;
};

export type TeacherHRFields = {
  employeeId: string;
  position: string;
  plantillaNo: string;
  dateOfOriginalAppointment: string | null;
  dateOfLatestAppointment: string | null;
};

export type AppointmentHistoryRow = {
  id: string;
  teacher_id: string;
  position: string;
  appointment_type: string;
  start_date: string | null;
  end_date: string | null;
  memo_no: string | null;
  remarks: string | null;
  approved_at: string | null;
};