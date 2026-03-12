import type { ProfileHRChangeRequest } from "@/features/profiles/types/employment-info";
import type { AppointmentChangeRequest } from "@/features/profiles/appointment/types/appointment";
import type { ResponsibilityChangeRequest } from "@/features/admin-actions/responsibilities/types/responsibility";
export type RequestWithTeacher = ProfileHRChangeRequest & {
  teacher: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  } | null;
};

export type AppointmentRequestWithTeacher = AppointmentChangeRequest & {
  teacher: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  } | null;
};

export type ResponsibilityRequestWithTeacher = ResponsibilityChangeRequest & {
  teacher: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  } | null;
};