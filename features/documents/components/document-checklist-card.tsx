/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import {
  CheckCircle2, Clock, XCircle, AlertCircle,
  ExternalLink, Upload, RotateCcw, Trash2, Loader2, HourglassIcon,
} from "lucide-react";
import { toast } from "sonner";
import { DocumentStatusBadge } from "./document-status-badge";
import { DocumentUploadModal } from "./document-upload-modal";
import {
  getDocumentSignedUrl,
  requestResubmit,
  requestDelete,
} from "@/features/documents/actions/document-actions";
import type { ChecklistItem, DocumentStatus } from "@/features/documents/types/documents";

const STATUS_ICON: Record<DocumentStatus | "MISSING", React.ReactNode> = {
  APPROVED: <CheckCircle2 className="h-5 w-5 text-green-600 shrink-0" />,
  SUBMITTED: <Clock className="h-5 w-5 text-blue-600 shrink-0" />,
  REJECTED: <XCircle className="h-5 w-5 text-red-600 shrink-0" />,
  DRAFT: <AlertCircle className="h-5 w-5 text-gray-400 shrink-0" />,
  MISSING: <AlertCircle className="h-5 w-5 text-orange-500 shrink-0" />,
};

type RequestModal = {
  type: "RESUBMIT" | "DELETE";
  docId: string;
  docName: string;
};

export function DocumentsChecklistCard({ items }: { items: ChecklistItem[] }) {
  const [selectedItem, setSelectedItem]   = useState<ChecklistItem | null>(null);
  const [modalOpen, setModalOpen]         = useState(false);
  const [viewingId, setViewingId]         = useState<string | null>(null);
  const [requestModal, setRequestModal]   = useState<RequestModal | null>(null);
  const [requestReason, setRequestReason] = useState("");
  const [requesting, setRequesting]       = useState(false);

  const approved = items.filter((i) => i.submission?.status === "APPROVED").length;
  const total    = items.filter((i) => i.documentType.required).length;

  const handleView = async (docId: string) => {
    setViewingId(docId);
    try {
      const result = await getDocumentSignedUrl(docId);
      if (!result.ok) return toast.error(result.error);
      window.open(result.data!.url, "_blank", "noreferrer");
    } catch {
      toast.error("Failed to open document.");
    } finally {
      setViewingId(null);
    }
  };

  const handleRequest = async () => {
    if (!requestModal) return;
    if (!requestReason.trim()) return toast.error("Please provide a reason.");
    setRequesting(true);
    try {
      const fn     = requestModal.type === "RESUBMIT" ? requestResubmit : requestDelete;
      const result = await fn(requestModal.docId, requestReason);
      if (!result.ok) return toast.error(result.error);
      toast.success(
        requestModal.type === "RESUBMIT"
          ? "Resubmit request sent. Waiting for admin approval."
          : "Delete request sent. Waiting for admin approval."
      );
      setRequestModal(null);
      setRequestReason("");
    } catch {
      toast.error("Failed to send request.");
    } finally {
      setRequesting(false);
    }
  };

  return (
    <>
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">201 File Documents</CardTitle>
            <span className="text-sm text-muted-foreground">
              {approved}/{total} required approved
            </span>
          </div>
          <div className="w-full bg-muted rounded-full h-2 mt-2">
            <div
              className="bg-green-500 h-2 rounded-full transition-all"
              style={{ width: total > 0 ? `${(approved / total) * 100}%` : "0%" }}
            />
          </div>
        </CardHeader>

        <CardContent className="space-y-2">
          {items.map((item) => {
            const { documentType, submission, pendingRequest } = item as any;
            const status     = submission?.status ?? "MISSING";
            const isApproved = status === "APPROVED";
            const isViewing  = viewingId === submission?.id;
            const hasPending = !!pendingRequest;

            return (
              <div
                key={documentType.id}
                className="flex items-start justify-between p-3 rounded-lg border border-border bg-muted/30 gap-3"
              >
                {/* Left: icon + info */}
                <div className="flex items-start gap-3 min-w-0">
                  <div className="mt-0.5">{STATUS_ICON[status as DocumentStatus | "MISSING"]}</div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium">
                      {documentType.name}
                      {documentType.required && <span className="text-red-500 ml-1 text-xs">*</span>}
                    </p>
                    {submission?.submitted_at && (
                      <p className="text-xs text-muted-foreground">
                        Submitted: {new Date(submission.submitted_at).toLocaleDateString("en-PH")}
                      </p>
                    )}
                    {status === "REJECTED" && submission?.reject_reason && (
                      <p className="text-xs text-red-600 mt-0.5">Reason: {submission.reject_reason}</p>
                    )}
                    {hasPending && (
                      <div className="flex items-center gap-1 mt-1">
                        <HourglassIcon className="h-3 w-3 text-yellow-600" />
                        <p className="text-xs text-yellow-600 font-medium">
                          {pendingRequest.type === "RESUBMIT"
                            ? "Resubmit request pending"
                            : "Delete request pending"}
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Right: actions */}
                <div className="flex items-center gap-1.5 shrink-0 flex-wrap justify-end">
                  {submission?.status && <DocumentStatusBadge status={submission.status} />}

                  {/* View */}
                  {submission?.file_path && (
                    <Button
                      variant="ghost" size="sm"
                      onClick={() => handleView(submission.id)}
                      disabled={isViewing}
                      title="View document"
                    >
                      {isViewing
                        ? <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        : <ExternalLink className="h-3.5 w-3.5" />}
                    </Button>
                  )}

                  {/* Upload (no submission or rejected) */}
                  {!isApproved && !hasPending && (status === "MISSING" || status === "REJECTED") && (
                    <Button
                      size="sm"
                      variant={status === "REJECTED" ? "default" : "default"}
                      onClick={() => { setSelectedItem(item); setModalOpen(true); }}
                      className="gap-1.5"
                    >
                      <Upload className="h-3.5 w-3.5" />
                      {status === "REJECTED" ? "Resubmit" : "Upload"}
                    </Button>
                  )}

                  {/* Request resubmit (only if SUBMITTED or APPROVED and no pending request) */}
                  {submission && !hasPending && (status === "SUBMITTED" || status === "APPROVED") && (
                    <Button
                      size="sm" variant="outline"
                      className="gap-1.5 text-yellow-700 border-yellow-300 hover:bg-yellow-50"
                      onClick={() => {
                        setRequestModal({ type: "RESUBMIT", docId: submission.id, docName: documentType.name });
                        setRequestReason("");
                      }}
                      title="Request to replace this document"
                    >
                      <RotateCcw className="h-3.5 w-3.5" />
                      Request Resubmit
                    </Button>
                  )}

                  {/* Request delete (any submitted doc, no pending request) */}
                  {submission && !hasPending && (
                    <Button
                      size="sm" variant="outline"
                      className="gap-1.5 text-red-700 border-red-300 hover:bg-red-50"
                      onClick={() => {
                        setRequestModal({ type: "DELETE", docId: submission.id, docName: documentType.name });
                        setRequestReason("");
                      }}
                      title="Request to delete this document"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      Request Delete
                    </Button>
                  )}
                </div>
              </div>
            );
          })}
        </CardContent>
      </Card>

      {/* Upload modal */}
      <DocumentUploadModal
        item={selectedItem}
        open={modalOpen}
        onOpenChange={(o) => { setModalOpen(o); if (!o) setSelectedItem(null); }}
      />

      {/* Request modal (resubmit or delete) */}
      <Dialog
        open={!!requestModal}
        onOpenChange={(o) => { if (!o) { setRequestModal(null); setRequestReason(""); } }}
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {requestModal?.type === "RESUBMIT" ? "Request Resubmission" : "Request Deletion"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">
              {requestModal?.type === "RESUBMIT"
                ? <>You are requesting to replace your <strong>{requestModal?.docName}</strong>. Admin must approve before you can upload a new one.</>
                : <>You are requesting to delete your <strong>{requestModal?.docName}</strong>. This requires admin approval.</>
              }
            </p>
            <Textarea
              placeholder="Reason for this request..."
              value={requestReason}
              onChange={(e) => setRequestReason(e.target.value)}
              className="min-h-[100px]"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setRequestModal(null); setRequestReason(""); }}>
              Cancel
            </Button>
            <Button
              variant={requestModal?.type === "DELETE" ? "destructive" : "default"}
              onClick={handleRequest}
              disabled={!requestReason.trim() || requesting}
            >
              {requesting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Send Request
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}