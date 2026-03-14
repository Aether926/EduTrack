export type SuperadminUser = {
    id: string;
    email: string;
    role: string;
    status: string;
    createdAt: string;
    firstName: string;
    lastName: string;
    middleInitial: string;
    contactNumber: string;
    employeeId: string;
    position: string;
    suspensionReason: string | null;
};

export type SecurityLogEntry = {
    id: string;
    userId: string | null;
    actorId: string | null;
    email: string | null;
    action: string;
    meta: Record<string, unknown> | null;
    ipAddress: string | null;
    createdAt: string;
};

export type ActionResult =
    | { ok: true }
    | { ok: false; error: string };