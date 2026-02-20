import type { ProfileHRChangeRequest } from "@/features/profiles/types/employment-info";
import type { AppointmentChangeRequest } from "@/features/profiles/appointment/types/appointment";

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