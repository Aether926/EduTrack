/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useMemo, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

import {
  ExternalLink,
  Loader2,
  FileX,
  CheckCircle2,
  Clock3,
  XCircle,
  AlertTriangle,
} from "lucide-react";

import { DocumentStatusBadge } from "./document-status-badge";
import { getDocumentSignedUrl } from "@/features/documents/actions/document-actions";
import { toast } from "sonner";

type DocumentRow = {
  id: string;
  status: string;
  file_path: string | null;
  submitted_at: string | null;
  reviewed_at: string | null;
  reject_reason: string | null;
  DocumentType: {
    name: string;
    code: string;
    required: boolean;
  };
};

type TeacherInfo = {
  teacherId: string;
  firstName: string | null;
  lastName: string | null;
  email: string | null;
  employeeId: string | null;
  approved: number;
  submitted: number;
  rejected: number;
  missing: number;
  total: number;
  docs: DocumentRow[];
};

function initials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return "U";
  const a = parts[0]?.[0] ?? "";
  const b = parts[parts.length - 1]?.[0] ?? "";
  return (a + b).toUpperCase();
}

function ViewDocButton({ docId }: { docId: string }) {
  const [loading, setLoading] = useState(false);

  const handleView = async () => {
    setLoading(true);
    try {
      const result = await getDocumentSignedUrl(docId);
      if (!result.ok) return toast.error(result.error);
      window.open(result.data!.url, "_blank", "noreferrer");
    } catch {
      toast.error("Failed to open document.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      variant="outline"
      size="sm"
      className="gap-2 h-8"
      onClick={handleView}
      disabled={loading}
    >
      {loading ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <ExternalLink className="h-4 w-4" />
      )}
      {loading ? "Opening..." : "View"}
    </Button>
  );
}

function StatCard({
  label,
  value,
  icon,
  className,
}: {
  label: string;
  value: number;
  icon: React.ReactNode;
  className: string;
}) {
  return (
    <Card className={`p-3 ${className}`}>
      <div className="flex items-center gap-3">
        <div className="h-9 w-9 rounded-lg border bg-background/40 flex items-center justify-center">
          {icon}
        </div>
        <div className="min-w-0">
          <div className="text-xl font-semibold leading-none">{value}</div>
          <div className="text-xs text-muted-foreground">{label}</div>
        </div>
      </div>
    </Card>
  );
}

export function TeacherDocumentsModal({
  teacher,
  open,
  onOpenChange,
}: {
  teacher: TeacherInfo | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const fullName = useMemo(() => {
    if (!teacher) return "";
    return `${teacher.firstName ?? ""} ${teacher.lastName ?? ""}`.trim();
  }, [teacher]);

  if (!teacher) return null;

  const percent =
    teacher.total > 0 ? Math.round((teacher.approved / teacher.total) * 100) : 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-start gap-3">
            <div className="h-10 w-10 rounded-xl border bg-muted/30 flex items-center justify-center font-semibold">
              {initials(fullName)}
            </div>

            <div className="min-w-0">
              <DialogTitle className="text-base sm:text-lg">
                {fullName} — 201 File Documents
              </DialogTitle>

              <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                {teacher.email ? <span className="truncate">{teacher.email}</span> : null}
                {teacher.employeeId ? (
                  <>
                    <span>•</span>
                    <span className="font-mono">{teacher.employeeId}</span>
                  </>
                ) : null}
              </div>
            </div>
          </div>
        </DialogHeader>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <StatCard
            label="Approved"
            value={teacher.approved}
            icon={<CheckCircle2 className="h-5 w-5 text-green-600" />}
            className="border-green-200/60 bg-green-500/5"
          />
          <StatCard
            label="Pending review"
            value={teacher.submitted}
            icon={<Clock3 className="h-5 w-5 text-blue-600" />}
            className="border-blue-200/60 bg-blue-500/5"
          />
          <StatCard
            label="Rejected"
            value={teacher.rejected}
            icon={<XCircle className="h-5 w-5 text-red-600" />}
            className="border-red-200/60 bg-red-500/5"
          />
          <StatCard
            label="Missing"
            value={teacher.missing}
            icon={<AlertTriangle className="h-5 w-5 text-orange-500" />}
            className="border-orange-200/60 bg-orange-500/5"
          />
        </div>

        {/* Progress */}
        <Card className="p-4">
          <div className="flex items-center justify-between gap-3">
            <div className="text-sm font-medium">
              Progress
              <span className="ml-2 text-xs text-muted-foreground">
                {teacher.approved}/{teacher.total} required approved
              </span>
            </div>
            <Badge variant="outline" className="font-mono">
              {percent}%
            </Badge>
          </div>

          <div className="mt-3 h-2 w-full rounded-full bg-muted overflow-hidden">
            <div
              className="h-2 rounded-full bg-green-500 transition-all"
              style={{
                width: teacher.total > 0 ? `${(teacher.approved / teacher.total) * 100}%` : "0%",
              }}
            />
          </div>

          <div className="mt-2 text-xs text-muted-foreground">
            Tip: click a document row to quickly scan its status and notes.
          </div>
        </Card>

        <Separator />

        {/* Documents */}
        <div className="space-y-2">
          <div className="flex items-end justify-between">
            <div>
              <div className="text-sm font-semibold">Documents</div>
              <div className="text-xs text-muted-foreground">
                {teacher.docs.length} item{teacher.docs.length === 1 ? "" : "s"}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Badge variant="outline" className="hidden sm:inline-flex">
                Required marked with *
              </Badge>
            </div>
          </div>

          {teacher.docs.length === 0 ? (
            <Card className="p-10">
              <div className="flex flex-col items-center justify-center text-muted-foreground gap-2">
                <FileX className="h-10 w-10" />
                <p className="text-sm">No documents submitted yet.</p>
              </div>
            </Card>
          ) : (
            <div className="space-y-2">
              {teacher.docs.map((doc) => (
                <Card key={doc.id} className="p-3">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div className="min-w-0 space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <div className="text-sm font-medium">
                          {doc.DocumentType.name}
                          {doc.DocumentType.required ? (
                            <span className="text-red-500 ml-1 text-xs">*</span>
                          ) : null}
                        </div>

                        <DocumentStatusBadge status={doc.status as any} />

                        <Badge variant="outline" className="text-xs font-mono">
                          {doc.DocumentType.code}
                        </Badge>
                      </div>

                      <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                        {doc.submitted_at ? (
                          <span>
                            Submitted:{" "}
                            {new Date(doc.submitted_at).toLocaleDateString("en-PH")}
                          </span>
                        ) : null}
                        {doc.reviewed_at ? (
                          <span>
                            Reviewed:{" "}
                            {new Date(doc.reviewed_at).toLocaleDateString("en-PH")}
                          </span>
                        ) : null}
                      </div>

                      {doc.status === "REJECTED" && doc.reject_reason ? (
                        <div className="rounded-md border border-red-200/60 bg-red-500/5 p-2 text-xs text-red-600">
                          <span className="font-semibold">Reason:</span>{" "}
                          <span className="break-words">{doc.reject_reason}</span>
                        </div>
                      ) : null}
                    </div>

                    <div className="shrink-0">
                      {doc.file_path ? (
                        <ViewDocButton docId={doc.id} />
                      ) : (
                        <Badge variant="outline" className="text-xs">
                          No file
                        </Badge>
                      )}
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}