"use client";

import { useRef, useState } from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
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
            toast.success(
                isReplace ? "Document resubmitted." : "Document submitted.",
            );
            onOpenChange(false);
            setFile(null);
        } catch {
            toast.error("Failed to submit document.");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <Dialog
            open={open}
            onOpenChange={(o) => {
                onOpenChange(o);
                if (!o) setFile(null);
            }}
        >
            <DialogContent className="max-w-md w-[90vw] p-0 gap-0">
                {/* Header */}
                <div className="relative px-6 pt-6 pb-5 border-b border-border/60 bg-gradient-to-br from-card to-background">
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-transparent to-violet-500/5 pointer-events-none" />
                    <DialogHeader className="relative">
                        <div className="flex items-center gap-2.5 mb-2">
                            <div className="rounded-lg border border-blue-500/20 bg-blue-500/10 p-2">
                                <Upload className="h-4 w-4 text-blue-400" />
                            </div>
                            <DialogTitle className="text-sm font-medium text-muted-foreground">
                                {isReplace ? "Resubmit" : "Upload"} Document
                            </DialogTitle>
                        </div>
                        <p className="text-base font-semibold tracking-tight leading-snug">
                            {documentType.name}
                        </p>
                    </DialogHeader>
                </div>

                {/* Body */}
                <div className="px-6 py-5 space-y-4">
                    {documentType.description && (
                        <p className="text-sm text-muted-foreground leading-relaxed">
                            {documentType.description}
                        </p>
                    )}

                    {submission?.status === "REJECTED" &&
                        submission.reject_reason && (
                            <div className="rounded-md border border-rose-500/30 bg-rose-500/10 px-3 py-2.5">
                                <p className="text-[10px] text-rose-400 uppercase tracking-widest font-semibold mb-1">
                                    Rejection reason
                                </p>
                                <p className="text-sm text-rose-300 leading-snug">
                                    {submission.reject_reason}
                                </p>
                            </div>
                        )}

                    {(documentType.allowed_mime || documentType.max_mb) && (
                        <div className="rounded-md border border-border/40 bg-muted/5 px-3 py-2 space-y-0.5">
                            {documentType.allowed_mime && (
                                <p className="text-[11px] text-muted-foreground">
                                    <span className="uppercase tracking-wider font-semibold">
                                        Allowed:
                                    </span>{" "}
                                    {documentType.allowed_mime.join(", ")}
                                </p>
                            )}
                            {documentType.max_mb && (
                                <p className="text-[11px] text-muted-foreground">
                                    <span className="uppercase tracking-wider font-semibold">
                                        Max size:
                                    </span>{" "}
                                    {documentType.max_mb}MB
                                </p>
                            )}
                        </div>
                    )}

                    {/* Drop zone */}
                    <div
                        className="border-2 border-dashed border-border/60 rounded-xl p-6 text-center cursor-pointer hover:border-blue-500/40 hover:bg-blue-500/[0.02] transition-colors"
                        onClick={() => inputRef.current?.click()}
                    >
                        {file ? (
                            <div className="flex items-center justify-center gap-2">
                                <FileText className="h-4 w-4 text-blue-400 shrink-0" />
                                <span className="text-sm font-medium truncate max-w-[200px]">
                                    {file.name}
                                </span>
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setFile(null);
                                    }}
                                    className="text-muted-foreground hover:text-rose-400 transition-colors shrink-0"
                                >
                                    <X className="h-4 w-4" />
                                </button>
                            </div>
                        ) : (
                            <div className="space-y-2">
                                <div className="mx-auto h-10 w-10 rounded-lg border border-border/60 bg-muted/20 flex items-center justify-center">
                                    <Upload className="h-5 w-5 text-muted-foreground" />
                                </div>
                                <p className="text-sm text-muted-foreground">
                                    Click to select a file
                                </p>
                            </div>
                        )}
                        <input
                            ref={inputRef}
                            type="file"
                            className="hidden"
                            accept={documentType.allowed_mime?.join(",") ?? "*"}
                            onChange={(e) =>
                                setFile(e.target.files?.[0] ?? null)
                            }
                        />
                    </div>
                </div>

                {/* Footer */}
                <div className="px-6 py-4 border-t border-border/60 bg-gradient-to-br from-card to-background flex justify-end gap-2">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onOpenChange(false)}
                        disabled={submitting}
                    >
                        Cancel
                    </Button>
                    <Button
                        size="sm"
                        onClick={handleSubmit}
                        disabled={submitting || !file}
                        className="gap-1.5"
                    >
                        {submitting ? (
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        ) : (
                            <Upload className="h-3.5 w-3.5" />
                        )}
                        {submitting
                            ? "Submitting..."
                            : isReplace
                              ? "Resubmit"
                              : "Submit"}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
