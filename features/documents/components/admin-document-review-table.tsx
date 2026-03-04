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
    DialogDescription,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
    HourglassIcon,
    FileCheck,
    FileX,
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
            className="gap-1.5 h-7 text-xs"
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

// ── Teacher cell ──────────────────────────────────────────────────────────────
function TeacherCell({
    firstName,
    lastName,
    email,
    employeeId,
}: {
    firstName: string | null;
    lastName: string | null;
    email: string | null;
    employeeId?: string | null;
}) {
    return (
        <div>
            <p className="font-medium text-sm leading-snug">
                {firstName} {lastName}
            </p>
            <p className="text-[11px] text-muted-foreground font-mono">
                {email}
            </p>
            {employeeId && (
                <p className="text-[11px] text-muted-foreground font-mono">
                    {employeeId}
                </p>
            )}
        </div>
    );
}

// ── Document cell ─────────────────────────────────────────────────────────────
function DocCell({ name, code }: { name: string; code: string }) {
    return (
        <div>
            <p className="text-sm font-medium leading-snug">{name}</p>
            <span className="inline-block rounded border border-border/60 bg-muted/20 px-1.5 py-0.5 text-[10px] font-mono text-muted-foreground mt-0.5">
                {code}
            </span>
        </div>
    );
}

// ── Empty state ───────────────────────────────────────────────────────────────
function EmptyState({ message }: { message: string }) {
    return (
        <div className="rounded-xl border border-border/60 bg-card py-16 text-center">
            <div className="mx-auto mb-3 h-10 w-10 rounded-lg border border-border/60 bg-muted/20 flex items-center justify-center">
                <FileCheck className="h-5 w-5 text-muted-foreground" />
            </div>
            <p className="text-sm text-muted-foreground">{message}</p>
        </div>
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

    if (!docs.length)
        return <EmptyState message="No pending documents to review." />;

    return (
        <>
            <div className="rounded-xl border border-border/60 bg-card overflow-hidden">
                <div className="overflow-x-auto">
                    <Table>
                        <TableHeader>
                            <TableRow className="bg-muted/30 hover:bg-muted/30">
                                <TableHead className="text-[11px] uppercase tracking-wider font-semibold text-muted-foreground">
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
                                    <TableRow
                                        key={doc.id}
                                        className="hover:bg-muted/20"
                                    >
                                        <TableCell>
                                            <TeacherCell
                                                firstName={
                                                    doc.teacher.firstName
                                                }
                                                lastName={doc.teacher.lastName}
                                                email={doc.teacher.email}
                                                employeeId={
                                                    doc.teacher.employeeId
                                                }
                                            />
                                        </TableCell>
                                        <TableCell>
                                            <DocCell
                                                name={
                                                    (doc.DocumentType as any)
                                                        ?.name ?? "—"
                                                }
                                                code={
                                                    (doc.DocumentType as any)
                                                        ?.code ?? ""
                                                }
                                            />
                                        </TableCell>
                                        <TableCell className="text-center">
                                            <DocumentStatusBadge
                                                status={doc.status}
                                            />
                                        </TableCell>
                                        <TableCell className="text-center text-[11px] text-muted-foreground font-mono">
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
                                                <span className="text-muted-foreground text-xs">
                                                    —
                                                </span>
                                            )}
                                        </TableCell>
                                        <TableCell className="text-center">
                                            <div className="flex items-center justify-center gap-1 flex-wrap">
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    className="gap-1.5 h-7 text-xs border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/10"
                                                    onClick={() =>
                                                        handleApprove(doc)
                                                    }
                                                    disabled={isLoading}
                                                >
                                                    {isLoading ? (
                                                        <Loader2 className="h-3 w-3 animate-spin" />
                                                    ) : (
                                                        <CheckCircle2 className="h-3 w-3" />
                                                    )}
                                                    Approve
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    className="gap-1.5 h-7 text-xs border-rose-500/30 text-rose-400 hover:bg-rose-500/10"
                                                    onClick={() => {
                                                        setRejectModal(doc);
                                                        setRejectReason("");
                                                    }}
                                                    disabled={isLoading}
                                                >
                                                    <XCircle className="h-3 w-3" />
                                                    Reject
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    className="gap-1.5 h-7 text-xs border-amber-500/30 text-amber-400 hover:bg-amber-500/10"
                                                    onClick={() => {
                                                        setResubmitModal(doc);
                                                        setResubmitNote("");
                                                    }}
                                                    disabled={isLoading}
                                                >
                                                    <RotateCcw className="h-3 w-3" />
                                                    Resubmit
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    className="gap-1.5 h-7 text-xs border-rose-700/30 text-rose-600 hover:bg-rose-500/10"
                                                    onClick={() =>
                                                        setDeleteModal(doc)
                                                    }
                                                    disabled={isLoading}
                                                >
                                                    <Trash2 className="h-3 w-3" />
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
                <DialogContent className="max-w-md w-[90vw] p-0 gap-0">
                    <div className="relative px-6 pt-6 pb-5 border-b border-border/60 bg-gradient-to-br from-card to-background">
                        <div className="absolute inset-0 bg-gradient-to-br from-rose-500/5 via-transparent to-transparent pointer-events-none" />
                        <DialogHeader className="relative">
                            <div className="flex items-center gap-2.5 mb-2">
                                <div className="rounded-lg border border-rose-500/20 bg-rose-500/10 p-2">
                                    <XCircle className="h-4 w-4 text-rose-400" />
                                </div>
                                <DialogTitle className="text-sm font-medium text-muted-foreground">
                                    Reject Document
                                </DialogTitle>
                            </div>
                            <p className="text-sm text-muted-foreground leading-relaxed">
                                Rejecting{" "}
                                <strong className="text-foreground">
                                    {(rejectModal?.DocumentType as any)?.name}
                                </strong>{" "}
                                from{" "}
                                <strong className="text-foreground">
                                    {rejectModal?.teacher.firstName}{" "}
                                    {rejectModal?.teacher.lastName}
                                </strong>
                                .
                            </p>
                        </DialogHeader>
                    </div>
                    <div className="px-6 py-5 space-y-3">
                        <div className="space-y-1">
                            <FieldLabel required>Reason</FieldLabel>
                            <Textarea
                                placeholder="Provide a reason..."
                                value={rejectReason}
                                onChange={(e) =>
                                    setRejectReason(e.target.value)
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
                                setRejectModal(null);
                                setRejectReason("");
                            }}
                        >
                            Cancel
                        </Button>
                        <Button
                            variant="destructive"
                            size="sm"
                            onClick={handleReject}
                            disabled={!rejectReason.trim() || !!loadingId}
                            className="gap-1.5"
                        >
                            {loadingId && (
                                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                            )}
                            Reject
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Resubmit modal */}
            <Dialog
                open={!!resubmitModal}
                onOpenChange={(o) => {
                    if (!o) {
                        setResubmitModal(null);
                        setResubmitNote("");
                    }
                }}
            >
                <DialogContent className="max-w-md w-[90vw] p-0 gap-0">
                    <div className="relative px-6 pt-6 pb-5 border-b border-border/60 bg-gradient-to-br from-card to-background">
                        <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 via-transparent to-transparent pointer-events-none" />
                        <DialogHeader className="relative">
                            <div className="flex items-center gap-2.5 mb-2">
                                <div className="rounded-lg border border-amber-500/20 bg-amber-500/10 p-2">
                                    <RotateCcw className="h-4 w-4 text-amber-400" />
                                </div>
                                <DialogTitle className="text-sm font-medium text-muted-foreground">
                                    Request Resubmission
                                </DialogTitle>
                            </div>
                            <p className="text-sm text-muted-foreground leading-relaxed">
                                Requesting{" "}
                                <strong className="text-foreground">
                                    {resubmitModal?.teacher.firstName}{" "}
                                    {resubmitModal?.teacher.lastName}
                                </strong>{" "}
                                to resubmit{" "}
                                <strong className="text-foreground">
                                    {(resubmitModal?.DocumentType as any)?.name}
                                </strong>
                                . The teacher will be notified.
                            </p>
                        </DialogHeader>
                    </div>
                    <div className="px-6 py-5 space-y-3">
                        <div className="space-y-1">
                            <FieldLabel>Note (optional)</FieldLabel>
                            <Textarea
                                placeholder="Reason for resubmission..."
                                value={resubmitNote}
                                onChange={(e) =>
                                    setResubmitNote(e.target.value)
                                }
                                className="min-h-[80px] text-sm"
                            />
                        </div>
                    </div>
                    <div className="px-6 py-4 border-t border-border/60 bg-gradient-to-br from-card to-background flex justify-end gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                                setResubmitModal(null);
                                setResubmitNote("");
                            }}
                        >
                            Cancel
                        </Button>
                        <Button
                            size="sm"
                            onClick={handleRequestResubmit}
                            disabled={!!loadingId}
                            className="gap-1.5"
                        >
                            {loadingId && (
                                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                            )}
                            Send Request
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Delete modal */}
            <Dialog
                open={!!deleteModal}
                onOpenChange={(o) => {
                    if (!o) setDeleteModal(null);
                }}
            >
                <DialogContent className="max-w-md w-[90vw] p-0 gap-0">
                    <div className="relative px-6 pt-6 pb-5 border-b border-border/60 bg-gradient-to-br from-card to-background">
                        <div className="absolute inset-0 bg-gradient-to-br from-rose-500/5 via-transparent to-transparent pointer-events-none" />
                        <DialogHeader className="relative">
                            <div className="flex items-center gap-2.5 mb-2">
                                <div className="rounded-lg border border-rose-500/20 bg-rose-500/10 p-2">
                                    <AlertTriangle className="h-4 w-4 text-rose-400" />
                                </div>
                                <DialogTitle className="text-sm font-medium text-muted-foreground">
                                    Permanently Delete Document
                                </DialogTitle>
                            </div>
                            <DialogDescription className="text-[11px] text-rose-400 uppercase tracking-wider font-semibold">
                                This action cannot be undone
                            </DialogDescription>
                        </DialogHeader>
                    </div>
                    <div className="px-6 py-5">
                        <div className="rounded-md border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm">
                            <p className="text-rose-300 leading-relaxed">
                                You are about to permanently delete{" "}
                                <strong className="text-rose-200">
                                    {(deleteModal?.DocumentType as any)?.name}
                                </strong>{" "}
                                submitted by{" "}
                                <strong className="text-rose-200">
                                    {deleteModal?.teacher.firstName}{" "}
                                    {deleteModal?.teacher.lastName}
                                </strong>
                                . The file will be removed from storage and
                                cannot be recovered.
                            </p>
                        </div>
                    </div>
                    <div className="px-6 py-4 border-t border-border/60 bg-gradient-to-br from-card to-background flex justify-end gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setDeleteModal(null)}
                        >
                            Cancel
                        </Button>
                        <Button
                            variant="destructive"
                            size="sm"
                            onClick={handleDelete}
                            disabled={!!loadingId}
                            className="gap-1.5"
                        >
                            {loadingId ? (
                                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                            ) : (
                                <Trash2 className="h-3.5 w-3.5" />
                            )}
                            Yes, Delete Permanently
                        </Button>
                    </div>
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

    if (!requests.length)
        return <EmptyState message="No pending document requests." />;

    return (
        <>
            <div className="rounded-xl border border-border/60 bg-card overflow-hidden">
                <div className="overflow-x-auto">
                    <Table>
                        <TableHeader>
                            <TableRow className="bg-muted/30 hover:bg-muted/30">
                                <TableHead className="text-[11px] uppercase tracking-wider font-semibold text-muted-foreground">
                                    Teacher
                                </TableHead>
                                <TableHead className="text-[11px] uppercase tracking-wider font-semibold text-muted-foreground">
                                    Document
                                </TableHead>
                                <TableHead className="text-[11px] uppercase tracking-wider font-semibold text-muted-foreground text-center">
                                    Request
                                </TableHead>
                                <TableHead className="text-[11px] uppercase tracking-wider font-semibold text-muted-foreground">
                                    Reason
                                </TableHead>
                                <TableHead className="text-[11px] uppercase tracking-wider font-semibold text-muted-foreground text-center">
                                    Date
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
                                    <TableRow
                                        key={req.id}
                                        className="hover:bg-muted/20"
                                    >
                                        <TableCell>
                                            <TeacherCell
                                                firstName={
                                                    req.teacher.firstName
                                                }
                                                lastName={req.teacher.lastName}
                                                email={req.teacher.email}
                                                employeeId={
                                                    req.teacher.employeeId
                                                }
                                            />
                                        </TableCell>
                                        <TableCell>
                                            <DocCell
                                                name={
                                                    (req.DocumentType as any)
                                                        ?.name ?? "—"
                                                }
                                                code={
                                                    (req.DocumentType as any)
                                                        ?.code ?? ""
                                                }
                                            />
                                        </TableCell>
                                        <TableCell className="text-center">
                                            <span
                                                className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wider ${isDelete ? "bg-rose-500/10 text-rose-400 border-rose-500/30" : "bg-amber-500/10 text-amber-400 border-amber-500/30"}`}
                                            >
                                                {isDelete ? (
                                                    <>
                                                        <Trash2 className="h-3 w-3" />{" "}
                                                        Delete
                                                    </>
                                                ) : (
                                                    <>
                                                        <RotateCcw className="h-3 w-3" />{" "}
                                                        Resubmit
                                                    </>
                                                )}
                                            </span>
                                        </TableCell>
                                        <TableCell className="text-sm text-muted-foreground max-w-[180px]">
                                            <p
                                                className="truncate text-[11px]"
                                                title={req.reason ?? ""}
                                            >
                                                {req.reason ?? "—"}
                                            </p>
                                        </TableCell>
                                        <TableCell className="text-center text-[11px] text-muted-foreground font-mono">
                                            {new Date(
                                                req.created_at,
                                            ).toLocaleDateString("en-PH")}
                                        </TableCell>
                                        <TableCell className="text-center">
                                            <div className="flex items-center justify-center gap-1">
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    className="gap-1.5 h-7 text-xs border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/10"
                                                    onClick={() =>
                                                        handleApprove(req)
                                                    }
                                                    disabled={isLoading}
                                                >
                                                    {isLoading ? (
                                                        <Loader2 className="h-3 w-3 animate-spin" />
                                                    ) : (
                                                        <CheckCircle2 className="h-3 w-3" />
                                                    )}
                                                    Approve
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    className="gap-1.5 h-7 text-xs border-rose-500/30 text-rose-400 hover:bg-rose-500/10"
                                                    onClick={() => {
                                                        setRejectModal(req);
                                                        setRejectNote("");
                                                    }}
                                                    disabled={isLoading}
                                                >
                                                    <XCircle className="h-3 w-3" />
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
                <DialogContent className="max-w-md w-[90vw] p-0 gap-0">
                    <div className="relative px-6 pt-6 pb-5 border-b border-border/60 bg-gradient-to-br from-card to-background">
                        <div className="absolute inset-0 bg-gradient-to-br from-rose-500/5 via-transparent to-transparent pointer-events-none" />
                        <DialogHeader className="relative">
                            <div className="flex items-center gap-2.5 mb-2">
                                <div className="rounded-lg border border-rose-500/20 bg-rose-500/10 p-2">
                                    <XCircle className="h-4 w-4 text-rose-400" />
                                </div>
                                <DialogTitle className="text-sm font-medium text-muted-foreground">
                                    Reject{" "}
                                    {rejectModal?.type === "DELETE"
                                        ? "Delete"
                                        : "Resubmit"}{" "}
                                    Request
                                </DialogTitle>
                            </div>
                            <p className="text-sm text-muted-foreground leading-relaxed">
                                Rejecting request from{" "}
                                <strong className="text-foreground">
                                    {rejectModal?.teacher.firstName}{" "}
                                    {rejectModal?.teacher.lastName}
                                </strong>{" "}
                                for{" "}
                                <strong className="text-foreground">
                                    {(rejectModal?.DocumentType as any)?.name}
                                </strong>
                                .
                            </p>
                        </DialogHeader>
                    </div>
                    <div className="px-6 py-5">
                        <div className="space-y-1">
                            <FieldLabel required>Reason</FieldLabel>
                            <Textarea
                                placeholder="Reason for rejecting this request..."
                                value={rejectNote}
                                onChange={(e) => setRejectNote(e.target.value)}
                                className="min-h-[100px] text-sm"
                            />
                        </div>
                    </div>
                    <div className="px-6 py-4 border-t border-border/60 bg-gradient-to-br from-card to-background flex justify-end gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                                setRejectModal(null);
                                setRejectNote("");
                            }}
                        >
                            Cancel
                        </Button>
                        <Button
                            variant="destructive"
                            size="sm"
                            onClick={handleReject}
                            disabled={!rejectNote.trim() || !!loadingId}
                            className="gap-1.5"
                        >
                            {loadingId && (
                                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                            )}
                            Reject Request
                        </Button>
                    </div>
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
    return (
        <Tabs defaultValue="submissions">
            <TabsList className="mb-4 h-9">
                <TabsTrigger value="submissions" className="gap-2 text-xs">
                    <FileCheck className="h-3.5 w-3.5" />
                    Pending Submissions
                    {docs.length > 0 && (
                        <span className="inline-block rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/30 px-1.5 py-0.5 text-[10px] font-semibold ml-0.5">
                            {docs.length}
                        </span>
                    )}
                </TabsTrigger>
                <TabsTrigger value="requests" className="gap-2 text-xs">
                    <HourglassIcon className="h-3.5 w-3.5" />
                    Teacher Requests
                    {requests.length > 0 && (
                        <span className="inline-block rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/30 px-1.5 py-0.5 text-[10px] font-semibold ml-0.5">
                            {requests.length}
                        </span>
                    )}
                </TabsTrigger>
            </TabsList>

            <TabsContent value="submissions">
                <PendingSubmissionsTable docs={docs} />
            </TabsContent>
            <TabsContent value="requests">
                <PendingRequestsTable requests={requests} />
            </TabsContent>
        </Tabs>
    );
}
