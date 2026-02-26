/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ExternalLink, Loader2, FileX } from "lucide-react";
import { useState } from "react";
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
      variant="ghost"
      size="sm"
      className="gap-1.5 h-7 text-xs"
      onClick={handleView}
      disabled={loading}
    >
      {loading ? (
        <Loader2 className="h-3 w-3 animate-spin" />
      ) : (
        <ExternalLink className="h-3 w-3" />
      )}
      {loading ? "Opening..." : "View"}
    </Button>
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
  if (!teacher) return null;

  const fullName = `${teacher.firstName ?? ""} ${teacher.lastName ?? ""}`.trim();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-base">
            {fullName} — 201 File Documents
          </DialogTitle>
          <p className="text-xs text-muted-foreground">
            {teacher.email}
            {teacher.employeeId ? ` • ${teacher.employeeId}` : ""}
          </p>
        </DialogHeader>

        {/* summary badges */}
        <div className="flex flex-wrap gap-2">
          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-300">
            ✅ {teacher.approved} Approved
          </Badge>
          <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-300">
            🕐 {teacher.submitted} Pending
          </Badge>
          <Badge variant="outline" className="bg-red-50 text-red-700 border-red-300">
            ❌ {teacher.rejected} Rejected
          </Badge>
          <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-300">
            ⚠️ {teacher.missing} Missing
          </Badge>
        </div>

        {/* progress bar */}
        <div className="space-y-1">
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>{teacher.approved} of {teacher.total} required approved</span>
            <span>{teacher.total > 0 ? Math.round((teacher.approved / teacher.total) * 100) : 0}%</span>
          </div>
          <div className="w-full bg-muted rounded-full h-2">
            <div
              className="bg-green-500 h-2 rounded-full transition-all"
              style={{
                width: teacher.total > 0
                  ? `${(teacher.approved / teacher.total) * 100}%`
                  : "0%",
              }}
            />
          </div>
        </div>

        {/* documents list */}
        <div className="space-y-2 mt-2">
          {teacher.docs.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 text-muted-foreground gap-2">
              <FileX className="h-8 w-8" />
              <p className="text-sm">No documents submitted yet.</p>
            </div>
          ) : (
            teacher.docs.map((doc) => (
              <div
                key={doc.id}
                className="flex items-center justify-between p-3 rounded-lg border border-border bg-muted/30"
              >
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium">
                      {doc.DocumentType.name}
                      {doc.DocumentType.required && (
                        <span className="text-red-500 ml-1 text-xs">*</span>
                      )}
                    </p>
                    <DocumentStatusBadge status={doc.status as any} />
                  </div>
                  {doc.submitted_at && (
                    <p className="text-xs text-muted-foreground">
                      Submitted: {new Date(doc.submitted_at).toLocaleDateString("en-PH")}
                    </p>
                  )}
                  {doc.reviewed_at && (
                    <p className="text-xs text-muted-foreground">
                      Reviewed: {new Date(doc.reviewed_at).toLocaleDateString("en-PH")}
                    </p>
                  )}
                  {doc.status === "REJECTED" && doc.reject_reason && (
                    <p className="text-xs text-red-600">
                      Reason: {doc.reject_reason}
                    </p>
                  )}
                </div>

                <div className="shrink-0">
                  {doc.file_path ? (
                    <ViewDocButton docId={doc.id} />
                  ) : (
                    <span className="text-xs text-muted-foreground">No file</span>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}