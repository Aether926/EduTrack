/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
    DialogDescription,
} from "@/components/ui/dialog";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    ExternalLink,
    CheckCircle2,
    XCircle,
    Loader2,
    Trash2,
    RotateCcw,
    AlertTriangle,
    FileCheck,
    Inbox,
} from "lucide-react";
import { toast } from "sonner";
import {
    approveTeacherDocument,
    rejectTeacherDocument,
    adminDeleteDocument,
    adminRequestResubmit,
    approveDocumentRequest,
    rejectDocumentRequest,
} from "@/features/documents/actions/admin-document-actions";
import type { getPendingDocumentRequests } from "@/features/documents/actions/admin-document-actions";
import { getDocumentSignedUrl } from "@/features/documents/actions/document-actions";
import { DocumentStatusBadge } from "./document-status-badge";
import type { AdminDocumentRow } from "@/features/documents/types/documents";

type PendingRequest = Awaited<
    ReturnType<typeof getPendingDocumentRequests>
>[number];

// ── View button ───────────────────────────────────────────────────────────────
function ViewButton({ docId }: { docId: string }) {
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
            className="gap-1.5"
            onClick={handleView}
            disabled={loading}
        >
            {loading ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
                <ExternalLink className="h-3.5 w-3.5" />
            )}
            {loading ? "Opening..." : "View"}
        </Button>
    );
}

// ── Pending submissions tab ───────────────────────────────────────────────────
function PendingSubmissionsTable({ docs }: { docs: AdminDocumentRow[] }) {
    const [loadingId, setLoadingId] = useState<string | null>(null);
    const [rejectModal, setRejectModal] = useState<AdminDocumentRow | null>(
        null,
    );
    const [rejectReason, setRejectReason] = useState("");
    const [resubmitModal, setResubmitModal] = useState<AdminDocumentRow | null>(
        null,
    );
    const [resubmitNote, setResubmitNote] = useState("");
    const [deleteModal, setDeleteModal] = useState<AdminDocumentRow | null>(
        null,
    );

    const handleApprove = async (doc: AdminDocumentRow) => {
        setLoadingId(doc.id);
        try {
            const result = await approveTeacherDocument(doc.id);
            if (!result.ok) return toast.error(result.error);
            toast.success("Document approved.");
        } catch {
            toast.error("Failed to approve.");
        } finally {
            setLoadingId(null);
        }
    };

    const handleReject = async () => {
        if (!rejectModal || !rejectReason.trim())
            return toast.error("Provide a reason.");
        setLoadingId(rejectModal.id);
        try {
            const result = await rejectTeacherDocument(
                rejectModal.id,
                rejectReason,
            );
            if (!result.ok) return toast.error(result.error);
            toast.success("Document rejected.");
            setRejectModal(null);
            setRejectReason("");
        } catch {
            toast.error("Failed to reject.");
        } finally {
            setLoadingId(null);
        }
    };

    const handleDelete = async () => {
        if (!deleteModal) return;
        setLoadingId(deleteModal.id);
        try {
            const result = await adminDeleteDocument(deleteModal.id);
            if (!result.ok) return toast.error(result.error);
            toast.success("Document permanently deleted.");
            setDeleteModal(null);
        } catch {
            toast.error("Failed to delete.");
        } finally {
            setLoadingId(null);
        }
    };

    const handleRequestResubmit = async () => {
        if (!resubmitModal) return;
        setLoadingId(resubmitModal.id);
        try {
            const result = await adminRequestResubmit(
                resubmitModal.id,
                resubmitNote,
            );
            if (!result.ok) return toast.error(result.error);
            toast.success("Resubmission requested. Teacher has been notified.");
            setResubmitModal(null);
            setResubmitNote("");
        } catch {
            toast.error("Failed to request resubmission.");
        } finally {
            setLoadingId(null);
        }
    };

    if (!docs.length) {
        return (
            <div className="rounded-xl border border-border/60 bg-card py-16 text-center text-muted-foreground text-sm">
                No pending documents to review.
            </div>
        );
    }

    return (
        <>
            <div className="rounded-xl border border-border/60 bg-card overflow-hidden">
                <div className="relative px-5 py-4 border-b border-border/60 bg-gradient-to-br from-card to-background">
                    <div className="absolute inset-0 bg-gradient-to-br from-orange-500/5 via-transparent to-transparent pointer-events-none" />
                    <div className="relative flex items-center gap-2.5">
                        <div className="rounded-lg border border-orange-500/20 bg-orange-500/10 p-2 shrink-0">
                            <FileCheck className="h-4 w-4 text-orange-400" />
                        </div>
                        <div>
                            <p className="text-sm font-semibold">
                                Pending Submissions
                            </p>
                            <p className="text-[11px] text-muted-foreground uppercase tracking-wider font-medium">
                                {docs.length} document
                                {docs.length === 1 ? "" : "s"} awaiting review
                            </p>
                        </div>
                    </div>
                </div>
                <div className="w-full overflow-x-auto">
                    <Table>
                        <TableHeader>
                            <TableRow className="bg-muted/30 hover:bg-muted/30">
                                <TableHead className="text-[11px] uppercase tracking-wider font-semibold text-muted-foreground pl-5">
                                    Teacher
                                </TableHead>
                                <TableHead className="text-[11px] uppercase tracking-wider font-semibold text-muted-foreground">
                                    Document
                                </TableHead>
                                <TableHead className="text-[11px] uppercase tracking-wider font-semibold text-muted-foreground text-center">
                                    Status
                                </TableHead>
                                <TableHead className="text-[11px] uppercase tracking-wider font-semibold text-muted-foreground text-center">
                                    Submitted
                                </TableHead>
                                <TableHead className="text-[11px] uppercase tracking-wider font-semibold text-muted-foreground text-center">
                                    File
                                </TableHead>
                                <TableHead className="text-[11px] uppercase tracking-wider font-semibold text-muted-foreground text-center">
                                    Actions
                                </TableHead>
                            </TableRow>
                        </TableHeader>

                        <TableBody>
                            {docs.map((doc) => {
                                const isLoading = loadingId === doc.id;
                                const hasFile = !!doc.file_path;

                                return (
                                    <TableRow key={doc.id}>
                                        <TableCell className="pl-5">
                                            <p className="font-medium text-sm">
                                                {doc.teacher.firstName}{" "}
                                                {doc.teacher.lastName}
                                            </p>
                                            <p className="text-xs text-muted-foreground">
                                                {doc.teacher.email}
                                            </p>
                                            {doc.teacher.employeeId && (
                                                <p className="text-xs text-muted-foreground">
                                                    {doc.teacher.employeeId}
                                                </p>
                                            )}
                                        </TableCell>

                                        <TableCell>
                                            <p className="text-sm font-medium">
                                                {(doc.DocumentType as any)
                                                    ?.name ?? "—"}
                                            </p>
                                            <p className="text-xs text-muted-foreground">
                                                {
                                                    (doc.DocumentType as any)
                                                        ?.code
                                                }
                                            </p>
                                        </TableCell>

                                        <TableCell className="text-center">
                                            <DocumentStatusBadge
                                                status={doc.status}
                                            />
                                        </TableCell>

                                        <TableCell className="text-center text-sm text-muted-foreground">
                                            {doc.submitted_at
                                                ? new Date(
                                                      doc.submitted_at,
                                                  ).toLocaleDateString("en-PH")
                                                : "—"}
                                        </TableCell>

                                        <TableCell className="text-center">
                                            {hasFile ? (
                                                <ViewButton docId={doc.id} />
                                            ) : (
                                                "—"
                                            )}
                                        </TableCell>

                                        <TableCell className="text-center">
                                            <div className="flex items-center justify-center gap-1.5">
                                                <Button
                                                    size="sm"
                                                    className="gap-1.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/25 hover:bg-emerald-500/20 hover:border-emerald-500/40"
                                                    onClick={() =>
                                                        handleApprove(doc)
                                                    }
                                                    disabled={isLoading}
                                                >
                                                    {isLoading ? (
                                                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                                    ) : (
                                                        <CheckCircle2 className="h-3.5 w-3.5" />
                                                    )}
                                                    Approve
                                                </Button>

                                                <Button
                                                    size="sm"
                                                    className="gap-1.5 bg-rose-500/10 text-rose-400 border border-rose-500/25 hover:bg-rose-500/20 hover:border-rose-500/40"
                                                    onClick={() => {
                                                        setRejectModal(doc);
                                                        setRejectReason("");
                                                    }}
                                                    disabled={isLoading}
                                                >
                                                    <XCircle className="h-3.5 w-3.5" />
                                                    Reject
                                                </Button>

                                                <Button
                                                    size="sm"
                                                    className="gap-1.5 bg-amber-500/10 text-amber-400 border border-amber-500/25 hover:bg-amber-500/20 hover:border-amber-500/40"
                                                    onClick={() => {
                                                        setResubmitModal(doc);
                                                        setResubmitNote("");
                                                    }}
                                                    disabled={isLoading}
                                                >
                                                    <RotateCcw className="h-3.5 w-3.5" />
                                                    Request Resubmit
                                                </Button>

                                                <Button
                                                    size="sm"
                                                    className="gap-1.5 bg-rose-900/10 text-rose-800 border border-rose-700/60 hover:bg-rose-900/30 hover:border-rose-600/40"
                                                    onClick={() =>
                                                        setDeleteModal(doc)
                                                    }
                                                    disabled={isLoading}
                                                >
                                                    <Trash2 className="h-3.5 w-3.5" />
                                                    Delete
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                );
                            })}
                        </TableBody>
                    </Table>
                </div>
            </div>

            {/* Reject modal */}
            <Dialog
                open={!!rejectModal}
                onOpenChange={(o) => {
                    if (!o) {
                        setRejectModal(null);
                        setRejectReason("");
                    }
                }}
            >
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle>Reject Document</DialogTitle>
                    </DialogHeader>

                    <div className="space-y-3">
                        <p className="text-sm text-muted-foreground">
                            Rejecting{" "}
                            <strong>
                                {(rejectModal?.DocumentType as any)?.name}
                            </strong>{" "}
                            from{" "}
                            <strong>
                                {rejectModal?.teacher.firstName}{" "}
                                {rejectModal?.teacher.lastName}
                            </strong>
                            .
                        </p>
                        <Textarea
                            placeholder="Provide a reason..."
                            value={rejectReason}
                            onChange={(e) => setRejectReason(e.target.value)}
                            className="min-h-[100px]"
                        />
                    </div>

                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => {
                                setRejectModal(null);
                                setRejectReason("");
                            }}
                        >
                            Cancel
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={handleReject}
                            disabled={!rejectReason.trim() || !!loadingId}
                        >
                            {loadingId ? (
                                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                            ) : null}
                            Reject
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Request resubmit modal */}
            <Dialog
                open={!!resubmitModal}
                onOpenChange={(o) => {
                    if (!o) {
                        setResubmitModal(null);
                        setResubmitNote("");
                    }
                }}
            >
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle>Request Resubmission</DialogTitle>
                    </DialogHeader>

                    <div className="space-y-3">
                        <p className="text-sm text-muted-foreground">
                            Requesting{" "}
                            <strong>
                                {resubmitModal?.teacher.firstName}{" "}
                                {resubmitModal?.teacher.lastName}
                            </strong>{" "}
                            to resubmit their{" "}
                            <strong>
                                {(resubmitModal?.DocumentType as any)?.name}
                            </strong>
                            . The document will be marked as rejected and the
                            teacher will be notified.
                        </p>
                        <Textarea
                            placeholder="Reason for resubmission (optional)..."
                            value={resubmitNote}
                            onChange={(e) => setResubmitNote(e.target.value)}
                            className="min-h-[80px]"
                        />
                    </div>

                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => {
                                setResubmitModal(null);
                                setResubmitNote("");
                            }}
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={handleRequestResubmit}
                            disabled={!!loadingId}
                        >
                            {loadingId ? (
                                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                            ) : null}
                            Send Request
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Delete modal */}
            <Dialog
                open={!!deleteModal}
                onOpenChange={(o) => {
                    if (!o) setDeleteModal(null);
                }}
            >
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 text-red-600">
                            <AlertTriangle className="h-5 w-5" />
                            Permanently Delete Document
                        </DialogTitle>
                        <DialogDescription>
                            This action cannot be undone.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="rounded-lg border border-rose-500/30 bg-rose-500/10 p-3 text-sm text-rose-400">
                        <p className="font-semibold mb-1">⚠ Warning</p>
                        <p>
                            You are about to permanently delete{" "}
                            <strong>
                                {(deleteModal?.DocumentType as any)?.name}
                            </strong>{" "}
                            submitted by{" "}
                            <strong>
                                {deleteModal?.teacher.firstName}{" "}
                                {deleteModal?.teacher.lastName}
                            </strong>
                            .
                        </p>
                        <p className="mt-1">
                            The file will be removed from storage and cannot be
                            recovered.
                        </p>
                    </div>

                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => setDeleteModal(null)}
                        >
                            Cancel
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={handleDelete}
                            disabled={!!loadingId}
                        >
                            {loadingId ? (
                                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                            ) : (
                                <Trash2 className="h-4 w-4 mr-2" />
                            )}
                            Yes, Delete Permanently
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}

// ── Pending requests tab ──────────────────────────────────────────────────────
function PendingRequestsTable({
    requests = [],
}: {
    requests?: PendingRequest[];
}) {
    const [loadingId, setLoadingId] = useState<string | null>(null);
    const [rejectModal, setRejectModal] = useState<PendingRequest | null>(null);
    const [rejectNote, setRejectNote] = useState("");

    const handleApprove = async (req: PendingRequest) => {
        setLoadingId(req.id);
        try {
            const result = await approveDocumentRequest(req.id);
            if (!result.ok) return toast.error(result.error);
            toast.success(
                req.type === "DELETE"
                    ? "Delete approved. Document has been removed."
                    : "Resubmit approved. Teacher can now upload a new document.",
            );
        } catch {
            toast.error("Failed to approve request.");
        } finally {
            setLoadingId(null);
        }
    };

    const handleReject = async () => {
        if (!rejectModal || !rejectNote.trim())
            return toast.error("Provide a reason.");
        setLoadingId(rejectModal.id);
        try {
            const result = await rejectDocumentRequest(
                rejectModal.id,
                rejectNote,
            );
            if (!result.ok) return toast.error(result.error);
            toast.success("Request rejected.");
            setRejectModal(null);
            setRejectNote("");
        } catch {
            toast.error("Failed to reject request.");
        } finally {
            setLoadingId(null);
        }
    };

    if (!requests.length) {
        return (
            <div className="rounded-xl border border-border/60 bg-card py-16 text-center text-muted-foreground text-sm">
                No pending document requests.
            </div>
        );
    }

    return (
        <>
            <div className="rounded-xl border border-border/60 bg-card overflow-hidden">
                <div className="relative px-5 py-4 border-b border-border/60 bg-gradient-to-br from-card to-background">
                    <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 via-transparent to-transparent pointer-events-none" />
                    <div className="relative flex items-center gap-2.5">
                        <div className="rounded-lg border border-amber-500/20 bg-amber-500/10 p-2 shrink-0">
                            <Inbox className="h-4 w-4 text-amber-400" />
                        </div>
                        <div>
                            <p className="text-sm font-semibold">
                                Teacher Requests
                            </p>
                            <p className="text-[11px] text-muted-foreground uppercase tracking-wider font-medium">
                                {requests.length} pending request
                                {requests.length === 1 ? "" : "s"}
                            </p>
                        </div>
                    </div>
                </div>
                <div className="w-full overflow-x-auto">
                    <Table>
                        <TableHeader>
                            <TableRow className="bg-muted/30 hover:bg-muted/30">
                                <TableHead className="text-[11px] uppercase tracking-wider font-semibold text-muted-foreground pl-5">
                                    Teacher
                                </TableHead>
                                <TableHead className="text-[11px] uppercase tracking-wider font-semibold text-muted-foreground">
                                    Document
                                </TableHead>
                                <TableHead className="text-[11px] uppercase tracking-wider font-semibold text-muted-foreground text-center">
                                    Request Type
                                </TableHead>
                                <TableHead className="text-[11px] uppercase tracking-wider font-semibold text-muted-foreground">
                                    Reason
                                </TableHead>
                                <TableHead className="text-[11px] uppercase tracking-wider font-semibold text-muted-foreground text-center">
                                    Requested
                                </TableHead>
                                <TableHead className="text-[11px] uppercase tracking-wider font-semibold text-muted-foreground text-center">
                                    Actions
                                </TableHead>
                            </TableRow>
                        </TableHeader>

                        <TableBody>
                            {requests.map((req) => {
                                const isLoading = loadingId === req.id;
                                const isDelete = req.type === "DELETE";
                                return (
                                    <TableRow key={req.id}>
                                        <TableCell className="pl-5">
                                            <p className="font-medium text-sm">
                                                {req.teacher.firstName}{" "}
                                                {req.teacher.lastName}
                                            </p>
                                            <p className="text-xs text-muted-foreground">
                                                {req.teacher.email}
                                            </p>
                                            {req.teacher.employeeId && (
                                                <p className="text-xs text-muted-foreground">
                                                    {req.teacher.employeeId}
                                                </p>
                                            )}
                                        </TableCell>

                                        <TableCell>
                                            <p className="text-sm font-medium">
                                                {(req.DocumentType as any)
                                                    ?.name ?? "—"}
                                            </p>
                                            <p className="text-xs text-muted-foreground">
                                                {
                                                    (req.DocumentType as any)
                                                        ?.code
                                                }
                                            </p>
                                        </TableCell>

                                        <TableCell className="text-center">
                                            <Badge
                                                variant="outline"
                                                className={
                                                    isDelete
                                                        ? "bg-rose-500/10 text-rose-400 border-rose-500/30"
                                                        : "bg-amber-500/10 text-amber-400 border-amber-500/30"
                                                }
                                            >
                                                {isDelete ? (
                                                    <>
                                                        <Trash2 className="h-3 w-3 mr-1 inline" />
                                                        Delete
                                                    </>
                                                ) : (
                                                    <>
                                                        <RotateCcw className="h-3 w-3 mr-1 inline" />
                                                        Resubmit
                                                    </>
                                                )}
                                            </Badge>
                                        </TableCell>

                                        <TableCell className="text-sm text-muted-foreground max-w-[200px]">
                                            <p
                                                className="truncate"
                                                title={req.reason ?? ""}
                                            >
                                                {req.reason ?? "—"}
                                            </p>
                                        </TableCell>

                                        <TableCell className="text-center text-sm text-muted-foreground">
                                            {new Date(
                                                req.created_at,
                                            ).toLocaleDateString("en-PH")}
                                        </TableCell>

                                        <TableCell className="text-center">
                                            <div className="flex items-center justify-center gap-1.5">
                                                <Button
                                                    size="sm"
                                                    className="gap-1.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/25 hover:bg-emerald-500/20 hover:border-emerald-500/40"
                                                    onClick={() =>
                                                        handleApprove(req)
                                                    }
                                                    disabled={isLoading}
                                                >
                                                    {isLoading ? (
                                                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                                    ) : (
                                                        <CheckCircle2 className="h-3.5 w-3.5" />
                                                    )}
                                                    Approve
                                                </Button>

                                                <Button
                                                    size="sm"
                                                    className="gap-1.5 bg-rose-500/10 text-rose-400 border border-rose-500/25 hover:bg-rose-500/20 hover:border-rose-500/40"
                                                    onClick={() => {
                                                        setRejectModal(req);
                                                        setRejectNote("");
                                                    }}
                                                    disabled={isLoading}
                                                >
                                                    <XCircle className="h-3.5 w-3.5" />
                                                    Reject
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                );
                            })}
                        </TableBody>
                    </Table>
                </div>
            </div>

            <Dialog
                open={!!rejectModal}
                onOpenChange={(o) => {
                    if (!o) {
                        setRejectModal(null);
                        setRejectNote("");
                    }
                }}
            >
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle>
                            Reject{" "}
                            {rejectModal?.type === "DELETE"
                                ? "Delete"
                                : "Resubmit"}{" "}
                            Request
                        </DialogTitle>
                    </DialogHeader>

                    <div className="space-y-3">
                        <p className="text-sm text-muted-foreground">
                            Rejecting request from{" "}
                            <strong>
                                {rejectModal?.teacher.firstName}{" "}
                                {rejectModal?.teacher.lastName}
                            </strong>{" "}
                            for{" "}
                            <strong>
                                {(rejectModal?.DocumentType as any)?.name}
                            </strong>
                            .
                        </p>

                        <Textarea
                            placeholder="Reason for rejecting this request..."
                            value={rejectNote}
                            onChange={(e) => setRejectNote(e.target.value)}
                            className="min-h-[100px]"
                        />
                    </div>

                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => {
                                setRejectModal(null);
                                setRejectNote("");
                            }}
                        >
                            Cancel
                        </Button>

                        <Button
                            variant="destructive"
                            onClick={handleReject}
                            disabled={!rejectNote.trim() || !!loadingId}
                        >
                            {loadingId ? (
                                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                            ) : null}
                            Reject Request
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}

// ── Main export ───────────────────────────────────────────────────────────────
export function AdminDocumentReviewTable({
    docs,
    requests = [],
}: {
    docs: AdminDocumentRow[];
    requests?: PendingRequest[];
}) {
    const pendingRequestCount = requests.length;

    return (
        <div className="space-y-4">
            <PendingSubmissionsTable docs={docs} />
            <PendingRequestsTable requests={requests} />
        </div>
    );
}
