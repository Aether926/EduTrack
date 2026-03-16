export type PendingUser = {
  id: string;
  firstName: string;
  lastName: string;
  middleInitial: string;
  email: string;
  role: string;
  status: "PENDING" | "REJECTED" | "APPROVED" | string;
  contactNumber: string;
  createdAt: string;
  employeeId: string;
  position: string;
  dateOfOriginalAppointment: string | null;
  dateOfOriginalDeployment: string | null;
  profileImage: string | null;
};
export type ActionResult =
  | { ok: true }
  | { ok: false; error: string };