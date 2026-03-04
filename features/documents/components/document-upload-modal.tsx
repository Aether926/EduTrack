"use client";

import { useRef, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Loader2, Upload, FileText, X } from "lucide-react";
import { toast } from "sonner";
import { submitTeacherDocument } from "@/features/documents/actions/document-actions";
import type { ChecklistItem } from "@/features/documents/types/documents";

export function DocumentUploadModal({
  item,
  open,
  onOpenChange,
}: {
  item: ChecklistItem | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [file, setFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  if (!item) return null;

  const { documentType, submission } = item;
  const isReplace = !!submission;

  const handleSubmit = async () => {
    if (!file) return toast.error("Please select a file.");
    setSubmitting(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const result = await submitTeacherDocument(documentType.id, fd);
      if (!result.ok) return toast.error(result.error);
      toast.success(isReplace ? "Document resubmitted." : "Document submitted.");
      onOpenChange(false);
      setFile(null);
    } catch {
      toast.error("Failed to submit document.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(o) => { onOpenChange(o); if (!o) setFile(null); }}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{isReplace ? "Resubmit" : "Upload"} — {documentType.name}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {documentType.description && (
            <p className="text-sm text-muted-foreground">{documentType.description}</p>
          )}

          {submission?.status === "REJECTED" && submission.reject_reason && (
            <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-800 text-sm dark:bg-red-950/30 dark:text-red-400 dark:border-red-800">
              <p className="font-medium mb-1">Rejection reason:</p>
              <p>{submission.reject_reason}</p>
            </div>
          )}

          <div className="text-xs text-muted-foreground space-y-1">
            {documentType.allowed_mime && (
              <p>Allowed types: {documentType.allowed_mime.join(", ")}</p>
            )}
            {documentType.max_mb && (
              <p>Max size: {documentType.max_mb}MB</p>
            )}
          </div>

          <div
            className="border-2 border-dashed border-border rounded-lg p-6 text-center cursor-pointer hover:border-primary transition-colors"
            onClick={() => inputRef.current?.click()}
          >
            {file ? (
              <div className="flex items-center justify-center gap-2">
                <FileText className="h-5 w-5 text-primary" />
                <span className="text-sm font-medium">{file.name}</span>
                <button
                  onClick={(e) => { e.stopPropagation(); setFile(null); }}
                  className="text-muted-foreground hover:text-destructive"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <div className="space-y-2">
                <Upload className="h-8 w-8 mx-auto text-muted-foreground" />
                <p className="text-sm text-muted-foreground">Click to select file</p>
              </div>
            )}
            <input
              ref={inputRef}
              type="file"
              className="hidden"
              accept={documentType.allowed_mime?.join(",") ?? "*"}
              onChange={(e) => setFile(e.target.files?.[0] ?? null)}
            />
          </div>

          <div className="flex gap-2 justify-end">
            <Button variant="outline" onClick={() => onOpenChange(false)} disabled={submitting}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={submitting || !file}>
              {submitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              {isReplace ? "Resubmit" : "Submit"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}