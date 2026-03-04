/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {
    CheckCircle2,
    Clock,
    XCircle,
    AlertCircle,
    ExternalLink,
    Upload,
    RotateCcw,
    Trash2,
    Loader2,
    HourglassIcon,
    MoreHorizontal,
    FileStack,
} from "lucide-react";
import { toast } from "sonner";
import { DocumentStatusBadge } from "./document-status-badge";
import { DocumentUploadModal } from "./document-upload-modal";
import {
    getDocumentSignedUrl,
    requestResubmit,
    requestDelete,
} from "@/features/documents/actions/document-actions";
import type {
    ChecklistItem,
    DocumentStatus,
} from "@/features/documents/types/documents";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const STATUS_ICON: Record<DocumentStatus | "MISSING", React.ReactNode> = {
    APPROVED: <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />,
    SUBMITTED: <Clock className="h-4 w-4 text-blue-400 shrink-0" />,
    REJECTED: <XCircle className="h-4 w-4 text-rose-400 shrink-0" />,
    DRAFT: <AlertCircle className="h-4 w-4 text-slate-400 shrink-0" />,
    MISSING: <AlertCircle className="h-4 w-4 text-amber-400 shrink-0" />,
};

const STATUS_ACCENT: Record<DocumentStatus | "MISSING", string> = {
    APPROVED: "border-l-emerald-500/50",
    SUBMITTED: "border-l-blue-500/50",
    REJECTED: "border-l-rose-500/50",
    DRAFT: "border-l-slate-500/50",
    MISSING: "border-l-amber-500/50",
};

type RequestModal = {
    type: "RESUBMIT" | "DELETE";
    docId: string;
    docName: string;
};

function FieldLabel({
    children,
    required,
}: {
    children: React.ReactNode;
    required?: boolean;
}) {
    return (
        <label className="text-[11px] text-muted-foreground uppercase tracking-wider font-medium mb-0.5 block">
            {children}
            {required && <span className="text-rose-400 ml-0.5">*</span>}
        </label>
    );
}

export function DocumentsChecklistCard({ items }: { items: ChecklistItem[] }) {
    const [selectedItem, setSelectedItem] = useState<ChecklistItem | null>(
        null,
    );
    const [modalOpen, setModalOpen] = useState(false);
    const [viewingId, setViewingId] = useState<string | null>(null);
    const [requestModal, setRequestModal] = useState<RequestModal | null>(null);
    const [requestReason, setRequestReason] = useState("");
    const [requesting, setRequesting] = useState(false);

    const approved = items.filter(
        (i) => i.submission?.status === "APPROVED",
    ).length;
    const total = items.filter((i) => i.documentType.required).length;
    const pct = total > 0 ? Math.round((approved / total) * 100) : 0;

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
        if (!requestReason.trim())
            return toast.error("Please provide a reason.");
        setRequesting(true);
        try {
            const fn =
                requestModal.type === "RESUBMIT"
                    ? requestResubmit
                    : requestDelete;
            const result = await fn(requestModal.docId, requestReason);
            if (!result.ok) return toast.error(result.error);
            toast.success(
                requestModal.type === "RESUBMIT"
                    ? "Resubmit request sent. Waiting for admin approval."
                    : "Delete request sent. Waiting for admin approval.",
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
            <div className="rounded-xl border border-border/60 bg-card overflow-hidden">
                {/* ── Header ── */}
                <div className="relative px-5 py-4 border-b border-border/60 bg-gradient-to-br from-card to-background">
                    <div className="absolute inset-0 bg-gradient-to-br from-violet-500/5 via-transparent to-transparent pointer-events-none" />
                    <div className="relative flex items-center justify-between gap-3">
                        <div className="flex items-center gap-2.5">
                            <div className="rounded-lg border border-violet-500/20 bg-violet-500/10 p-2 shrink-0">
                                <FileStack className="h-4 w-4 text-violet-400" />
                            </div>
                            <div>
                                <p className="text-sm font-semibold">
                                    201 File Documents
                                </p>
                                <p className="text-[11px] text-muted-foreground uppercase tracking-wider font-medium">
                                    {approved}/{total} required approved
                                </p>
                            </div>
                        </div>
                        <span className="text-lg font-bold tabular-nums text-muted-foreground">
                            {pct}%
                        </span>
                    </div>

                    {/* Progress bar */}
                    <div className="relative mt-3 h-1.5 w-full rounded-full bg-muted/60 overflow-hidden">
                        <div
                            className="absolute inset-y-0 left-0 rounded-full bg-emerald-500 transition-all duration-500"
                            style={{ width: `${pct}%` }}
                        />
                    </div>
                </div>

                {/* ── Items ── */}
                <div className="p-3 space-y-2">
                    {items.map((item) => {
                        const { documentType, submission, pendingRequest } =
                            item as any;
                        const status: DocumentStatus | "MISSING" =
                            submission?.status ?? "MISSING";
                        const isViewing = viewingId === submission?.id;
                        const hasPending = !!pendingRequest;

                        const canUpload =
                            status !== "APPROVED" &&
                            !hasPending &&
                            (status === "MISSING" || status === "REJECTED");
                        const canRequestResubmit =
                            !!submission &&
                            !hasPending &&
                            (status === "SUBMITTED" || status === "APPROVED");
                        const canRequestDelete = !!submission && !hasPending;

                        const openUpload = () => {
                            setSelectedItem(item);
                            setModalOpen(true);
                        };
                        const openRequest = (type: "RESUBMIT" | "DELETE") => {
                            if (!submission) return;
                            setRequestModal({
                                type,
                                docId: submission.id,
                                docName: documentType.name,
                            });
                            setRequestReason("");
                        };

                        const accent =
                            STATUS_ACCENT[status] ?? "border-l-slate-500/50";

                        return (
                            <div
                                key={documentType.id}
                                className={`rounded-lg border border-border bg-card border-l-4 ${accent} px-4 py-3 transition-colors hover:bg-muted/20`}
                            >
                                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                                    {/* Left */}
                                    <div className="flex items-start gap-3 min-w-0">
                                        <div className="mt-0.5">
                                            {STATUS_ICON[status]}
                                        </div>
                                        <div className="min-w-0">
                                            <p className="text-sm font-medium leading-snug">
                                                {documentType.name}
                                                {documentType.required && (
                                                    <span className="text-rose-400 ml-1 text-xs">
                                                        *
                                                    </span>
                                                )}
                                            </p>
                                            {submission?.submitted_at && (
                                                <p className="text-[11px] text-muted-foreground mt-0.5 font-mono">
                                                    {new Date(
                                                        submission.submitted_at,
                                                    ).toLocaleDateString(
                                                        "en-PH",
                                                    )}
                                                </p>
                                            )}
                                            {status === "REJECTED" &&
                                                submission?.reject_reason && (
                                                    <p className="text-[11px] text-rose-400 mt-1 leading-snug">
                                                        {
                                                            submission.reject_reason
                                                        }
                                                    </p>
                                                )}
                                            {hasPending && (
                                                <div className="flex items-center gap-1 mt-1">
                                                    <HourglassIcon className="h-3 w-3 text-amber-400" />
                                                    <p className="text-[11px] text-amber-400 font-medium">
                                                        {pendingRequest.type ===
                                                        "RESUBMIT"
                                                            ? "Resubmit request pending"
                                                            : "Delete request pending"}
                                                    </p>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Right */}
                                    <div className="flex items-center justify-between gap-2 sm:justify-end">
                                        {/* Status badge */}
                                        {submission?.status ? (
                                            <DocumentStatusBadge
                                                status={submission.status}
                                            />
                                        ) : (
                                            <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-500/30 bg-amber-500/10 px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wider text-amber-400">
                                                <span className="h-1.5 w-1.5 rounded-full bg-amber-400" />
                                                Missing
                                            </span>
                                        )}

                                        {/* Mobile dropdown */}
                                        <div className="sm:hidden">
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button
                                                        variant="outline"
                                                        size="icon"
                                                        className="h-8 w-8"
                                                        aria-label="Actions"
                                                    >
                                                        <MoreHorizontal className="h-4 w-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    {submission?.file_path ? (
                                                        <DropdownMenuItem
                                                            onSelect={(e) => {
                                                                e.preventDefault();
                                                                handleView(
                                                                    submission.id,
                                                                );
                                                            }}
                                                            disabled={isViewing}
                                                        >
                                                            {isViewing ? (
                                                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                                            ) : (
                                                                <ExternalLink className="h-4 w-4 mr-2" />
                                                            )}
                                                            View document
                                                        </DropdownMenuItem>
                                                    ) : null}
                                                    {canUpload ? (
                                                        <DropdownMenuItem
                                                            onSelect={(e) => {
                                                                e.preventDefault();
                                                                openUpload();
                                                            }}
                                                        >
                                                            <Upload className="h-4 w-4 mr-2" />
                                                            {status ===
                                                            "REJECTED"
                                                                ? "Resubmit"
                                                                : "Upload"}
                                                        </DropdownMenuItem>
                                                    ) : null}
                                                    {(submission?.file_path ||
                                                        canUpload) && (
                                                        <DropdownMenuSeparator />
                                                    )}
                                                    {canRequestResubmit ? (
                                                        <DropdownMenuItem
                                                            onSelect={(e) => {
                                                                e.preventDefault();
                                                                openRequest(
                                                                    "RESUBMIT",
                                                                );
                                                            }}
                                                        >
                                                            <RotateCcw className="h-4 w-4 mr-2" />
                                                            Request resubmit
                                                        </DropdownMenuItem>
                                                    ) : null}
                                                    {canRequestDelete ? (
                                                        <DropdownMenuItem
                                                            className="text-destructive focus:text-destructive"
                                                            onSelect={(e) => {
                                                                e.preventDefault();
                                                                openRequest(
                                                                    "DELETE",
                                                                );
                                                            }}
                                                        >
                                                            <Trash2 className="h-4 w-4 mr-2" />
                                                            Request delete
                                                        </DropdownMenuItem>
                                                    ) : null}
                                                    {!submission &&
                                                    !canUpload ? (
                                                        <DropdownMenuItem
                                                            disabled
                                                        >
                                                            No actions
                                                        </DropdownMenuItem>
                                                    ) : null}
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </div>

                                        {/* Desktop buttons */}
                                        <div className="hidden sm:flex items-center gap-1.5 shrink-0">
                                            {submission?.file_path && (
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    className="h-7 w-7 p-0 text-muted-foreground hover:text-foreground"
                                                    onClick={() =>
                                                        handleView(
                                                            submission.id,
                                                        )
                                                    }
                                                    disabled={isViewing}
                                                    title="View document"
                                                >
                                                    {isViewing ? (
                                                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                                    ) : (
                                                        <ExternalLink className="h-3.5 w-3.5" />
                                                    )}
                                                </Button>
                                            )}
                                            {canUpload && (
                                                <Button
                                                    size="sm"
                                                    onClick={openUpload}
                                                    className="gap-1.5 h-7 text-xs"
                                                >
                                                    <Upload className="h-3 w-3" />
                                                    {status === "REJECTED"
                                                        ? "Resubmit"
                                                        : "Upload"}
                                                </Button>
                                            )}
                                            {canRequestResubmit && (
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    className="gap-1.5 h-7 text-xs border-amber-500/30 text-amber-400 hover:bg-amber-500/10"
                                                    onClick={() =>
                                                        openRequest("RESUBMIT")
                                                    }
                                                >
                                                    <RotateCcw className="h-3 w-3" />
                                                    Resubmit
                                                </Button>
                                            )}
                                            {canRequestDelete && (
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    className="gap-1.5 h-7 text-xs border-rose-500/30 text-rose-400 hover:bg-rose-500/10"
                                                    onClick={() =>
                                                        openRequest("DELETE")
                                                    }
                                                >
                                                    <Trash2 className="h-3 w-3" />
                                                    Delete
                                                </Button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Upload modal */}
            <DocumentUploadModal
                item={selectedItem}
                open={modalOpen}
                onOpenChange={(o) => {
                    setModalOpen(o);
                    if (!o) setSelectedItem(null);
                }}
            />

            {/* Request modal */}
            <Dialog
                open={!!requestModal}
                onOpenChange={(o) => {
                    if (!o) {
                        setRequestModal(null);
                        setRequestReason("");
                    }
                }}
            >
                <DialogContent className="max-w-md w-[90vw] p-0 gap-0">
                    <div className="relative px-6 pt-6 pb-5 border-b border-border/60 bg-gradient-to-br from-card to-background">
                        <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 via-transparent to-rose-500/5 pointer-events-none" />
                        <DialogHeader className="relative">
                            <div className="flex items-center gap-2.5 mb-2">
                                <div
                                    className={`rounded-lg border p-2 ${requestModal?.type === "DELETE" ? "border-rose-500/20 bg-rose-500/10" : "border-amber-500/20 bg-amber-500/10"}`}
                                >
                                    {requestModal?.type === "DELETE" ? (
                                        <Trash2 className="h-4 w-4 text-rose-400" />
                                    ) : (
                                        <RotateCcw className="h-4 w-4 text-amber-400" />
                                    )}
                                </div>
                                <DialogTitle className="text-sm font-medium text-muted-foreground">
                                    {requestModal?.type === "RESUBMIT"
                                        ? "Request Resubmission"
                                        : "Request Deletion"}
                                </DialogTitle>
                            </div>
                            <p className="text-base font-semibold tracking-tight">
                                {requestModal?.docName}
                            </p>
                        </DialogHeader>
                    </div>
                    <div className="px-6 py-5 space-y-4">
                        <p className="text-sm text-muted-foreground leading-relaxed">
                            {requestModal?.type === "RESUBMIT"
                                ? "You are requesting to replace this document. Admin must approve before you can upload a new one."
                                : "You are requesting to delete this document. This requires admin approval."}
                        </p>
                        <div className="space-y-1">
                            <FieldLabel required>Reason</FieldLabel>
                            <Textarea
                                placeholder="Reason for this request..."
                                value={requestReason}
                                onChange={(e) =>
                                    setRequestReason(e.target.value)
                                }
                                className="min-h-[100px] text-sm"
                            />
                        </div>
                    </div>
                    <div className="px-6 py-4 border-t border-border/60 bg-gradient-to-br from-card to-background flex justify-end gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                                setRequestModal(null);
                                setRequestReason("");
                            }}
                        >
                            Cancel
                        </Button>
                        <Button
                            size="sm"
                            variant={
                                requestModal?.type === "DELETE"
                                    ? "destructive"
                                    : "default"
                            }
                            onClick={handleRequest}
                            disabled={!requestReason.trim() || requesting}
                            className="gap-1.5"
                        >
                            {requesting && (
                                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                            )}
                            Send Request
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </>
    );
}
