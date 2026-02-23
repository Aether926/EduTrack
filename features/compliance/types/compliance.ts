export type ComplianceStatus = "COMPLIANT" | "AT_RISK" | "NON_COMPLIANT";

export type TeacherTrainingCompliance = {
  teacher_id: string;
  school_id: string | null;
  school_year: string;
  total_hours: number;
  required_hours: number;
  remaining_hours: number;
  status: ComplianceStatus;
  computed_at: string;
  updated_at: string;
};

export type TrainingCompliancePolicy = {
  id: string;
  school_id: string | null;
  school_year: string;
  required_hours: number;
  at_risk_threshold_hours: number;
  period_start: string;
  period_end: string;
};

export type ComplianceAlert = {
  id: string;
  teacher_id: string;
  school_year: string;
  alert_type: ComplianceStatus;
  message: string;
  created_at: string;
  resolved_at: string | null;
};

export type ComplianceWithTeacher = TeacherTrainingCompliance & {
  teacher: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  } | null;
  school: {
    id: string;
    name: string;
    division: string;
  } | null;
};