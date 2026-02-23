export type PendingUser = {
  employeeId: string;
  id: string;
  firstName: string;
  lastName: string;
  middleInitial: string;
  email: string;
  role: string;
  status: "PENDING" | "REJECTED" | "APPROVED" | string;
  contactNumber: string;
  createdAt: string;
};

export type ActionResult =
  | { ok: true }
  | { ok: false; error: string };