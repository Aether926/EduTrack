/* eslint-disable @typescript-eslint/no-explicit-any */
import { getUser } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import {
    getPendingDocuments,
    getAllTeacherDocumentStatus,
    getPendingDocumentRequests,
} from "@/features/documents/actions/admin-document-actions";
import { AdminDocumentReviewTable } from "@/features/documents/components/admin-document-review-table";
import { TeacherOverviewTable } from "@/features/documents/components/teacher-overview-table";
import { Card, CardContent } from "@/components/ui/card";
import {
    FileText,
    CheckCircle2,
    Clock,
    XCircle,
    AlertCircle,
} from "lucide-react";

const ALLOWED = ["ADMIN", "SUPERADMIN"] as const;

export default async function AdminDocumentsPage() {
    const user = await getUser();
    if (!user) redirect("/signin");

    const roleLabel = (user.user_metadata?.role ?? "TEACHER").toString();
    if (!ALLOWED.includes(roleLabel as any)) redirect("/dashboard");

    const [pendingDocs, teacherStatus, requests] = await Promise.all([
        getPendingDocuments(),
        getAllTeacherDocumentStatus(),
        getPendingDocumentRequests(),
    ]);

    const totalApproved = teacherStatus.reduce((sum, t) => sum + t.approved, 0);
    const totalSubmitted = teacherStatus.reduce(
        (sum, t) => sum + t.submitted,
        0,
    );
    const totalRejected = teacherStatus.reduce((sum, t) => sum + t.rejected, 0);
    const totalMissing = teacherStatus.reduce((sum, t) => sum + t.missing, 0);

    return (
        <div className="mx-auto w-full max-w-7xl px-4 py-5 md:px-6 md:py-6 space-y-6">
            <div className="relative rounded-xl border border-border/60 bg-gradient-to-br from-card to-background overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-orange-500/5 via-transparent to-amber-500/5 pointer-events-none" />
                <div className="relative px-5 py-5 md:px-6 md:py-6">
                    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                        <div className="flex items-center gap-3 md:flex-1">
                            <div className="rounded-lg border border-orange-500/20 bg-orange-500/10 p-2.5 shrink-0">
                                <FileText className="h-5 w-5 text-orange-400" />
                            </div>
                            <div>
                                <h1 className="text-lg font-semibold tracking-tight leading-tight">
                                    Teacher Documents
                                </h1>
                                <p className="text-[13px] text-muted-foreground mt-0.5">
                                    Review and manage 201 file submissions
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="inline-block rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                                {roleLabel}
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-4">
                {[
                    {
                        label: "Approved",
                        value: totalApproved,
                        icon: (
                            <CheckCircle2 className="h-5 w-5 text-emerald-400" />
                        ),
                        color: "border-emerald-500/20 bg-emerald-500/5",
                        valueClass: "text-emerald-400",
                    },
                    {
                        label: "Pending",
                        labelFull: "Pending Review",
                        value: totalSubmitted,
                        icon: <Clock className="h-5 w-5 text-blue-400" />,
                        color: "border-blue-500/20 bg-blue-500/5",
                        valueClass: "text-blue-400",
                    },
                    {
                        label: "Rejected",
                        value: totalRejected,
                        icon: <XCircle className="h-5 w-5 text-rose-400" />,
                        color: "border-rose-500/20 bg-rose-500/5",
                        valueClass: "text-rose-400",
                    },
                    {
                        label: "Missing",
                        value: totalMissing,
                        icon: (
                            <AlertCircle className="h-5 w-5 text-amber-400" />
                        ),
                        color: "border-amber-500/20 bg-amber-500/5",
                        valueClass: "text-amber-400",
                    },
                ].map((s) => (
                    <Card key={s.label} className={s.color}>
                        <CardContent className="flex items-center gap-3">
                            {s.icon}
                            <div className="min-w-0">
                                <p
                                    className={`text-2xl font-bold leading-none ${s.valueClass}`}
                                >
                                    {s.value}
                                </p>
                                <p className="text-xs text-muted-foreground mt-1 whitespace-nowrap">
                                    <span className="sm:hidden">{s.label}</span>
                                    <span className="hidden sm:inline">
                                        {(s as any).labelFull ?? s.label}
                                    </span>
                                </p>
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
