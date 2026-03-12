export type ResponsibilityType = "TEACHING_LOAD" | "COORDINATOR" | "OTHER";
export type ResponsibilityStatus = "ACTIVE" | "ENDED";

export type TeacherResponsibility = {
  id: string;
  teacher_id: string;
  type: ResponsibilityType;
  title: string;
  details: Record<string, unknown>;
  status: ResponsibilityStatus;
  created_by: string;
  created_at: string;
  updated_at: string | null;
};

export type ResponsibilityChangeRequest = {
  id: string;
  responsibility_id: string;
  teacher_id: string;
  requested_changes: Record<string, unknown>;
  reason: string;
  status: "PENDING" | "APPROVED" | "REJECTED";
  requested_at: string;
  reviewed_by: string | null;
  reviewed_at: string | null;
  review_note: string | null;
};

export type ResponsibilityWithTeacher = TeacherResponsibility & {
  teacher: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  } | null;
};

export type AddResponsibilityForm = {
  teacher_id: string;
  type: ResponsibilityType | "";
  title: string;
  details: {
    subject?: string;
    section?: string;
    grade?: string;
    schedule?: string;
    role?: string;
    organization?: string;
    description?: string;
  };
};

export type ChangeRequestForm = {
  reason: string;
  requested_changes: {
    title?: string;
    details?: Record<string, unknown>;
  };
};