/* eslint-disable @typescript-eslint/no-explicit-any */
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import {
  getPendingDocuments,
  getAllTeacherDocumentStatus,
  getPendingDocumentRequests,
} from "@/features/documents/actions/admin-document-actions";
import { AdminDocumentReviewTable } from "@/features/documents/components/admin-document-review-table";
import { TeacherOverviewTable } from "@/features/documents/components/teacher-overview-table";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FileText, CheckCircle2, Clock, XCircle, AlertCircle } from "lucide-react";


const ALLOWED = ["ADMIN", "HR_ADMIN", "PRINCIPAL", "SUPER_ADMIN", "HR"] as const;

export default async function AdminDocumentsPage() {
  const supabase = await createClient();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) redirect("/signin");

  const { data: user } = await supabase
    .from("User")
    .select("role")
    .eq("id", auth.user.id)
    .single();

  const roleLabel = (user?.role ?? "USER").toString();
  if (!ALLOWED.includes(roleLabel as any)) redirect("/dashboard");

  const [pendingDocs, teacherStatus, requests] = await Promise.all([
    getPendingDocuments(),
    getAllTeacherDocumentStatus(),
    getPendingDocumentRequests(),
  ]);

  const totalApproved = teacherStatus.reduce((sum, t) => sum + t.approved, 0);
  const totalSubmitted = teacherStatus.reduce((sum, t) => sum + t.submitted, 0);
  const totalRejected = teacherStatus.reduce((sum, t) => sum + t.rejected, 0);
  const totalMissing = teacherStatus.reduce((sum, t) => sum + t.missing, 0);

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-5 md:px-6 md:py-6 space-y-6">
      {/* header card (same style as other pages) */}
      <div className="rounded-xl border bg-card p-4 md:p-6">
        <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="secondary">{roleLabel}</Badge>
            <Badge variant="outline" className="gap-2">
              <FileText className="h-3.5 w-3.5" />
              Teacher Documents
            </Badge>
          </div>
        </div>
      </div>

      {/* keep your current stats cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          {
            label: "Approved",
            value: totalApproved,
            icon: <CheckCircle2 className="h-5 w-5 text-green-600" />,
            color: "border-green-200 bg-green-50 dark:bg-green-950/20",
          },
          {
            label: "Pending Review",
            value: totalSubmitted,
            icon: <Clock className="h-5 w-5 text-blue-600" />,
            color: "border-blue-200 bg-blue-50 dark:bg-blue-950/20",
          },
          {
            label: "Rejected",
            value: totalRejected,
            icon: <XCircle className="h-5 w-5 text-red-600" />,
            color: "border-red-200 bg-red-50 dark:bg-red-950/20",
          },
          {
            label: "Missing",
            value: totalMissing,
            icon: <AlertCircle className="h-5 w-5 text-orange-500" />,
            color: "border-orange-200 bg-orange-50 dark:bg-orange-950/20",
          },
        ].map((s) => (
          <Card key={s.label} className={s.color}>
            <CardContent className="pt-4 flex items-center gap-3">
              {s.icon}
              <div>
                <p className="text-2xl font-bold">{s.value}</p>
                <p className="text-xs text-muted-foreground">{s.label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div>
        <h2 className="text-lg font-semibold mb-3">
          Pending Review ({pendingDocs.length})
        </h2>

        <AdminDocumentReviewTable
          docs={pendingDocs as any}
          requests={(requests ?? []) as any}
        />
      </div>

      <div>
        <h2 className="text-lg font-semibold mb-3">Teacher Overview</h2>
        <TeacherOverviewTable teacherStatus={teacherStatus} />
      </div>
    </div>
  );
}