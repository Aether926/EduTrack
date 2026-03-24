export type DocumentStatus = "DRAFT" | "SUBMITTED" | "APPROVED" | "REJECTED";

export type DocumentType = {
  id: string;
  code: string;
  name: string;
  description: string | null;
  required: boolean;
  allowed_mime: string[] | null;
  max_mb: number | null;
  created_at: string;
};

export type TeacherDocument = {
  id: string;
  teacher_id: string;
  document_type_id: string;
  status: DocumentStatus;
  file_url: string | null;
  file_path: string | null;
  mime_type: string | null;
  file_size_bytes: number | null;
  submitted_at: string | null;
  reviewed_at: string | null;
  reviewed_by: string | null;
  reject_reason: string | null;
  expires_at: string | null;
  created_at: string;
  updated_at: string;
};

export type DocumentWithType = TeacherDocument & {
  DocumentType: DocumentType;
};

export type ChecklistItem = {
  documentType: DocumentType;
  submission: TeacherDocument | null;
};

export type AdminDocumentRow = TeacherDocument & {
  DocumentType: DocumentType;
  teacher: {
    id: string;
    firstName: string | null;
    lastName: string | null;
    email: string | null;
    employeeId: string | null;
  };
};