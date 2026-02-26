/* eslint-disable @typescript-eslint/no-explicit-any */
import { createAdminClient, createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import {
  getPendingDocuments,
  getAllTeacherDocumentStatus,
  getPendingDocumentRequests,
} from "@/features/documents/actions/admin-document-actions";
import { AdminDocumentReviewTable } from "@/features/documents/components/admin-document-review-table";
import { TeacherOverviewTable } from "@/features/documents/components/teacher-overview-table";
import { Card, CardContent } from "@/components/ui/card";
import { FileText, CheckCircle2, Clock, XCircle, AlertCircle } from "lucide-react";

export default async function AdminDocumentsPage() {
  const supabase = await createClient();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) redirect("/signin");

  const admin = createAdminClient();
  const { data: user } = await admin
    .from("User")
    .select("role")
    .eq("id", auth.user.id)
    .single();

  if (user?.role !== "ADMIN") redirect("/dashboard");

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
    <main className="min-h-screen bg-background p-4 sm:p-6 lg:p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        <header className="flex items-center gap-3">
          <FileText className="h-7 w-7 text-primary" />
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
              201 File Documents
            </h1>
            <p className="text-sm text-muted-foreground">
              Review and manage teacher document submissions.
            </p>
          </div>
        </header>

        {/* Summary stats */}
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

          {/* ✅ pass requests into the table so Teacher Requests tab works */}
          <AdminDocumentReviewTable
            docs={pendingDocs as any}
            requests={(requests ?? []) as any}
          />
        </div>

        {/* Per-teacher overview */}
        <div>
  <h2 className="text-lg font-semibold mb-3">Teacher Overview</h2>
  <TeacherOverviewTable teacherStatus={teacherStatus} />
</div>
      </div>
    </main>
  );
}