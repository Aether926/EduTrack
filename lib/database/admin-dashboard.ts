"use server";

import { createAdminClient } from "@/lib/supabase/server";

export type AdminDashboardStats = {
  totalTeachers: number;
  pendingProofs: number;
  pendingHRRequests: number;
  pendingDocuments: number;
  pendingAccountApprovals: number;
  complianceBreakdown: {
    compliant: number;
    atRisk: number;
    nonCompliant: number;
  };
  documentBreakdown: {
    approved: number;
    pending: number;
    rejected: number;
    missing: number;
  };
  trainingHoursPerMonth: {
    month: string;
    hours: number;
  }[];
};

export async function getAdminDashboardStats(): Promise<AdminDashboardStats> {
  const admin = createAdminClient();

  const [
    { count: totalTeachers },
    { count: pendingProofs },
    { count: pendingHRRequests },
    { count: pendingDocuments },
    { count: pendingAccountApprovals },
    { data: complianceRows },
    { data: docRows },
    { data: approvedAttendance },
    { data: docTypes },
    { data: teacherUsers },
  ] = await Promise.all([
    admin
      .from("User")
      .select("*", { count: "exact", head: true })
      .eq("role", "TEACHER")
      .eq("status", "APPROVED"),
    admin
      .from("Attendance")
      .select("*", { count: "exact", head: true })
      .eq("status", "SUBMITTED"),
    admin
      .from("HRChangeRequest")
      .select("*", { count: "exact", head: true })
      .eq("status", "PENDING"),
    admin
      .from("TeacherDocument")
      .select("*", { count: "exact", head: true })
      .eq("status", "SUBMITTED"),
    admin
      .from("User")
      .select("*", { count: "exact", head: true })
      .eq("status", "PENDING"),
    admin.from("TeacherTrainingCompliance").select("status"),
    admin.from("TeacherDocument").select("status, teacher_id, document_type_id"),
    admin
      .from("Attendance")
      .select("approved_hours, ProfessionalDevelopment:training_id(start_date)")
      .eq("status", "APPROVED")
      .eq("result", "PASSED"),
    admin.from("DocumentType").select("id").eq("required", true),
    admin
      .from("User")
      .select("id")
      .eq("role", "TEACHER")
      .eq("status", "APPROVED"),
  ]);

  // ── Compliance breakdown ───────────────────────────────────────────────────
  const compliance = complianceRows ?? [];
  const complianceBreakdown = {
    compliant: compliance.filter((r) => r.status === "COMPLIANT").length,
    atRisk: compliance.filter((r) => r.status === "AT_RISK").length,
    nonCompliant: compliance.filter((r) => r.status === "NON_COMPLIANT").length,
  };

  // ── Document breakdown ─────────────────────────────────────────────────────
  const docs = docRows ?? [];
  const requiredTypeIds = new Set((docTypes ?? []).map((d) => d.id));
  const teacherIds = (teacherUsers ?? []).map((u) => u.id);

  let approvedCount = 0;
  let pendingCount = 0;
  let rejectedCount = 0;
  let missingCount = 0;

  for (const tid of teacherIds) {
    const teacherDocs = docs.filter((d) => d.teacher_id === tid);
    for (const typeId of requiredTypeIds) {
      const doc = teacherDocs.find((d) => d.document_type_id === typeId);
      if (!doc) {
        missingCount++;
      } else if (doc.status === "APPROVED") {
        approvedCount++;
      } else if (doc.status === "SUBMITTED") {
        pendingCount++;
      } else if (doc.status === "REJECTED") {
        rejectedCount++;
      }
    }
  }

  const documentBreakdown = {
    approved: approvedCount,
    pending: pendingCount,
    rejected: rejectedCount,
    missing: missingCount,
  };

  // ── Training hours per month (last 12 months) ──────────────────────────────
  const now = new Date();
  const monthsMap = new Map<string, number>();

  for (let i = 11; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    monthsMap.set(key, 0);
  }

  for (const row of approvedAttendance ?? []) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const pd = row.ProfessionalDevelopment as any;
    const startDate = pd?.start_date;
    if (!startDate) continue;

    const d = new Date(startDate);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    if (monthsMap.has(key)) {
      monthsMap.set(key, (monthsMap.get(key) ?? 0) + (row.approved_hours ?? 0));
    }
  }

  const trainingHoursPerMonth = Array.from(monthsMap.entries()).map(
    ([month, hours]) => {
      const [year, m] = month.split("-");
      const label = new Date(
        Number(year),
        Number(m) - 1,
        1
      ).toLocaleString("en-US", { month: "short", year: "2-digit" });
      return { month: label, hours };
    }
  );

  return {
    totalTeachers: totalTeachers ?? 0,
    pendingProofs: pendingProofs ?? 0,
    pendingHRRequests: pendingHRRequests ?? 0,
    pendingDocuments: pendingDocuments ?? 0,
    pendingAccountApprovals: pendingAccountApprovals ?? 0,
    complianceBreakdown,
    documentBreakdown,
    trainingHoursPerMonth,
  };
}