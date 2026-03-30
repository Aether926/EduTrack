/* eslint-disable @next/next/no-img-element */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useRef, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
} from "@/components/ui/sheet";
import {
    CheckCircle2,
    Clock,
    XCircle,
    AlertCircle,
    Upload,
    RotateCcw,
    Trash2,
    Loader2,
    HourglassIcon,
    MoreHorizontal,
    FileText,
    X,
    ArrowLeft,
    CalendarDays,
    ZoomIn,
    ChevronDown,
    ChevronRight,
} from "lucide-react";
import { toast } from "sonner";
import { DocumentStatusBadge } from "./document-status-badge";
import {
    getDocumentSignedUrl,
    requestResubmit,
    requestDelete,
    submitTeacherDocument,
} from "@/features/documents/actions/document-actions";
import type {
    ChecklistItem,
    DocumentStatus,
} from "@/features/documents/types/documents";
import { useIsMobile } from "@/hooks/use-mobile";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const STATUS_ICON: Record<DocumentStatus | "MISSING", React.ReactNode> = {
    APPROVED: <CheckCircle2 className="h-5 w-5 text-emerald-500 shrink-0" />,
    SUBMITTED: <Clock className="h-5 w-5 text-blue-500 shrink-0" />,
    REJECTED: <XCircle className="h-5 w-5 text-red-500 shrink-0" />,
    DRAFT: <AlertCircle className="h-5 w-5 text-gray-400 shrink-0" />,
    MISSING: <AlertCircle className="h-5 w-5 text-orange-500 shrink-0" />,
};

function fmtDate(d: string | null | undefined) {
    if (!d) return "—";
    try {
        return new Date(d).toLocaleString("en-PH", {
            year: "numeric",
            month: "short",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        });
    } catch {
        return d;
    }
}

function formatBytes(bytes: number | null | undefined) {
    if (!bytes || !Number.isFinite(bytes)) return null;
    const sizes = ["B", "KB", "MB", "GB"];
    let i = 0;
    let v = bytes;
    while (v >= 1024 && i < sizes.length - 1) {
        v /= 1024;
        i++;
    }
    return `${v.toFixed(i === 0 ? 0 : 1)} ${sizes[i]}`;
}

// ── Grouping helpers ──────────────────────────────────────────────────────────

const GROUP_PREFIX = "Medical Certificate - ";
const GROUP_PARENT_NAME = "Medical Certificate";

type GroupedEntry =
    | { type: "standalone"; item: ChecklistItem }
    | { type: "parent"; parentName: string; subitems: ChecklistItem[] };

function groupItems(allItems: ChecklistItem[]): GroupedEntry[] {
    const result: GroupedEntry[] = [];
    const medSubItems: ChecklistItem[] = [];
    const others: ChecklistItem[] = [];

    for (const item of allItems) {
        if ((item as any).documentType.name.startsWith(GROUP_PREFIX)) {
            medSubItems.push(item);
        } else {
            others.push(item);
        }
    }

    for (const item of others) {
        if (
            (item as any).documentType.name === GROUP_PARENT_NAME &&
            medSubItems.length > 0
        ) {
            result.push({
                type: "parent",
                parentName: GROUP_PARENT_NAME,
                subitems: medSubItems,
            });
        } else {
            result.push({ type: "standalone", item });
        }
    }

    // If there's no parent "Medical Certificate" standalone item, still group the subitems
    const alreadyHasParent = result.some(
        (e) => e.type === "parent" && e.parentName === GROUP_PARENT_NAME,
    );
    if (!alreadyHasParent && medSubItems.length > 0) {
        result.push({
            type: "parent",
            parentName: GROUP_PARENT_NAME,
            subitems: medSubItems,
        });
    }

    return result;
}

// ── Checklist row ─────────────────────────────────────────────────────────────

type SheetView = "detail" | "upload" | "request";
type RequestType = "RESUBMIT" | "DELETE";

function ChecklistRow({
    item,
    viewingId,
    onOpen,
    indent = false,
}: {
    item: ChecklistItem;
    viewingId: string | null;
    onOpen: (
        item: ChecklistItem,
        view: SheetView,
        reqType?: RequestType,
    ) => void;
    indent?: boolean;
}) {
    const { documentType, submission, pendingRequest } = item as any;
    const status: DocumentStatus | "MISSING" = submission?.status ?? "MISSING";
    const hasPending = !!pendingRequest;

    const canUpload =
        !hasPending && (status === "MISSING" || status === "REJECTED");
    const canRequestResubmit =
        !!submission && !hasPending && status === "APPROVED";
    const canRequestDelete = !!submission && !hasPending;

    return (
        <div
            className={[
                "rounded-lg border border-border bg-muted/30 p-3 transition-colors hover:bg-muted/40 cursor-pointer",
                indent ? "ml-6 border-l-2 border-l-blue-500/20" : "",
            ].join(" ")}
            onClick={() => onOpen(item, "detail")}
        >
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                {/* LEFT */}
                <div className="flex items-start gap-3 min-w-0">
                    <div className="mt-0.5">{STATUS_ICON[status]}</div>
                    <div className="min-w-0">
                        <p className="text-sm font-medium leading-tight">
                            {indent
                                ? documentType.name.replace(GROUP_PREFIX, "")
                                : documentType.name}
                            {documentType.required && (
                                <span className="text-red-500 ml-1 text-xs">
                                    *
                                </span>
                            )}
                        </p>
                        {submission?.submitted_at && (
                            <p className="text-xs text-muted-foreground mt-0.5">
                                Submitted:{" "}
                                {new Date(
                                    submission.submitted_at,
                                ).toLocaleDateString("en-PH")}
                            </p>
                        )}
                        {status === "REJECTED" && submission?.reject_reason && (
                            <p className="text-xs text-red-500 mt-1">
                                Reason: {submission.reject_reason}
                            </p>
                        )}
                        {hasPending && (
                            <div className="flex items-center gap-1 mt-1">
                                <HourglassIcon className="h-3 w-3 text-yellow-500" />
                                <p className="text-xs text-yellow-500 font-medium">
                                    {pendingRequest.type === "RESUBMIT"
                                        ? "Resubmit request pending"
                                        : "Delete request pending"}
                                </p>
                            </div>
                        )}
                    </div>
                </div>

                {/* RIGHT */}
                <div
                    className="flex items-center justify-between gap-2 sm:justify-end"
                    onClick={(e) => e.stopPropagation()}
                >
                    {submission?.status ? (
                        <div className="shrink-0">
                            <DocumentStatusBadge status={submission.status} />
                        </div>
                    ) : (
                        <div className="shrink-0" />
                    )}

                    {/* Desktop buttons */}
                    <div className="hidden sm:flex items-center gap-1.5 shrink-0 flex-wrap justify-end">
                        {canUpload && (
                            <Button
                                size="sm"
                                variant="default"
                                onClick={() => onOpen(item, "upload")}
                                className="gap-1.5"
                            >
                                <Upload className="h-3.5 w-3.5" />
                                {status === "REJECTED" ? "Resubmit" : "Upload"}
                            </Button>
                        )}
                        {canRequestResubmit && (
                            <Button
                                size="sm"
                                variant="outline"
                                className="gap-1.5 text-yellow-600 border-yellow-500/40 hover:bg-yellow-500/10"
                                onClick={() =>
                                    onOpen(item, "request", "RESUBMIT")
                                }
                            >
                                <RotateCcw className="h-3.5 w-3.5" /> Request
                                Resubmit
                            </Button>
                        )}
                        {canRequestDelete && (
                            <Button
                                size="sm"
                                variant="outline"
                                className="gap-1.5 text-red-500 border-red-500/40 hover:bg-red-500/10"
                                onClick={() =>
                                    onOpen(item, "request", "DELETE")
                                }
                            >
                                <Trash2 className="h-3.5 w-3.5" /> Request
                                Delete
                            </Button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

// ── Group row ─────────────────────────────────────────────────────────────────

function GroupRow({
    parentName,
    subitems,
    viewingId,
    onOpen,
}: {
    parentName: string;
    subitems: ChecklistItem[];
    viewingId: string | null;
    onOpen: (
        item: ChecklistItem,
        view: SheetView,
        reqType?: RequestType,
    ) => void;
}) {
    const [expanded, setExpanded] = useState(true);

    const approvedCount = subitems.filter(
        (c) => (c as any).submission?.status === "APPROVED",
    ).length;
    const total = subitems.length;
    const allApproved = approvedCount === total;
    const hasRejected = subitems.some(
        (c) => (c as any).submission?.status === "REJECTED",
    );
    const hasMissing = subitems.some((c) => !(c as any).submission);

    const summaryColor = allApproved
        ? "text-emerald-500"
        : hasRejected
          ? "text-red-500"
          : hasMissing
            ? "text-orange-500"
            : "text-blue-500";

    return (
        <div className="space-y-1.5">
            <button
                type="button"
                onClick={() => setExpanded((v) => !v)}
                className="w-full rounded-lg border border-border bg-muted/50 px-3 py-2.5 flex items-center justify-between gap-3 hover:bg-muted/70 transition-colors"
            >
                <div className="flex items-center gap-3 min-w-0">
                    <div className="rounded-md border border-blue-500/20 bg-blue-500/10 p-1.5 shrink-0">
                        <FileText className="h-3.5 w-3.5 text-blue-400" />
                    </div>
                    <div className="text-left min-w-0">
                        <p className="text-sm font-medium leading-tight">
                            {parentName}
                            <span className="text-red-500 ml-1 text-xs">*</span>
                        </p>
                        <p className={`text-xs mt-0.5 ${summaryColor}`}>
                            {approvedCount}/{total} approved
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                    <span className="text-[11px] text-muted-foreground">
                        {expanded ? "Hide" : "Show"} subtypes
                    </span>
                    {expanded ? (
                        <ChevronDown className="h-4 w-4 text-muted-foreground" />
                    ) : (
                        <ChevronRight className="h-4 w-4 text-muted-foreground" />
                    )}
                </div>
            </button>

            {expanded && (
                <div className="space-y-1.5 pl-4 border-l-2 border-blue-500/20 ml-3">
                    {subitems.map((child) => (
                        <ChecklistRow
                            key={(child as any).documentType.id}
                            item={child}
                            viewingId={viewingId}
                            onOpen={onOpen}
                            indent
                        />
                    ))}
                </div>
            )}
        </div>
    );
}

// ── Main component ────────────────────────────────────────────────────────────

export function DocumentsChecklistCard({ items }: { items: ChecklistItem[] }) {
    const isMobile = useIsMobile();
    const inputRef = useRef<HTMLInputElement>(null);

    const [sheetOpen, setSheetOpen] = useState(false);
    const [sheetView, setSheetView] = useState<SheetView>("detail");
    const [activeItem, setActiveItem] = useState<ChecklistItem | null>(null);
    const [requestType, setRequestType] = useState<RequestType>("RESUBMIT");

    const [file, setFile] = useState<File | null>(null);
    const [submitting, setSubmitting] = useState(false);

    const [requestReason, setRequestReason] = useState("");
    const [requesting, setRequesting] = useState(false);

    const [viewingId, setViewingId] = useState<string | null>(null);

    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [previewLoading, setPreviewLoading] = useState(false);
    const [previewFullscreen, setPreviewFullscreen] = useState(false);

    const approved = items.filter(
        (i) => (i as any).submission?.status === "APPROVED",
    ).length;
    const total = items.filter((i) => (i as any).documentType.required).length;

    const openSheet = (
        item: ChecklistItem,
        view: SheetView,
        reqType?: RequestType,
    ) => {
        setActiveItem(item);
        setSheetView(view);
        if (reqType) setRequestType(reqType);
        setFile(null);
        setRequestReason("");
        setPreviewUrl(null);
        setSheetOpen(true);

        if (view === "detail" && (item as any).submission?.file_path) {
            setPreviewLoading(true);
            getDocumentSignedUrl((item as any).submission.id)
                .then((result) => {
                    if (result.ok) setPreviewUrl(result.data!.url);
                })
                .catch(() => {})
                .finally(() => setPreviewLoading(false));
        }
    };

    const handleClose = () => {
        if (submitting || requesting) return;
        setSheetOpen(false);
        setFile(null);
        setRequestReason("");
    };

    const handleUpload = async () => {
        if (!file || !activeItem) return toast.error("Please select a file.");
        setSubmitting(true);
        try {
            const fd = new FormData();
            fd.append("file", file);
            const result = await submitTeacherDocument(
                (activeItem as any).documentType.id,
                fd,
            );
            if (!result.ok) return toast.error(result.error);
            toast.success(
                (activeItem as any).submission
                    ? "Document resubmitted."
                    : "Document submitted.",
            );
            setSheetOpen(false);
            setFile(null);
        } catch {
            toast.error("Failed to submit document.");
        } finally {
            setSubmitting(false);
        }
    };

    const handleRequest = async () => {
        if (!(activeItem as any)?.submission) return;
        if (!requestReason.trim())
            return toast.error("Please provide a reason.");
        setRequesting(true);
        try {
            const fn =
                requestType === "RESUBMIT" ? requestResubmit : requestDelete;
            const result = await fn(
                (activeItem as any).submission.id,
                requestReason,
            );
            if (!result.ok) return toast.error(result.error);
            toast.success(
                requestType === "RESUBMIT"
                    ? "Resubmit request sent. Waiting for admin approval."
                    : "Delete request sent. Waiting for admin approval.",
            );
            setSheetOpen(false);
            setRequestReason("");
        } catch {
            toast.error("Failed to send request.");
        } finally {
            setRequesting(false);
        }
    };

    const item = activeItem;
    const submission = (item as any)?.submission;
    const documentType = (item as any)?.documentType;
    const pendingRequest = (item as any)?.pendingRequest;
    const status: DocumentStatus | "MISSING" = submission?.status ?? "MISSING";

    const grouped = groupItems(items);

    return (
        <>
            <Card>
                <CardHeader className="pb-3">
                    <div className="flex items-center justify-between gap-3">
                        <CardTitle className="text-base">
                            201 File Documents
                        </CardTitle>
                        <span className="text-sm text-muted-foreground">
                            {approved}/{total} required approved
                        </span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2 mt-2">
                        <div
                            className="bg-emerald-500 h-2 rounded-full transition-all"
                            style={{
                                width:
                                    total > 0
                                        ? `${(approved / total) * 100}%`
                                        : "0%",
                            }}
                        />
                    </div>
                </CardHeader>

                <CardContent className="space-y-2">
                    {grouped.map((entry, idx) =>
                        entry.type === "standalone" ? (
                            <ChecklistRow
                                key={(entry.item as any).documentType.id}
                                item={entry.item}
                                viewingId={viewingId}
                                onOpen={openSheet}
                            />
                        ) : (
                            <GroupRow
                                key={`group-${entry.parentName}-${idx}`}
                                parentName={entry.parentName}
                                subitems={entry.subitems}
                                viewingId={viewingId}
                                onOpen={openSheet}
                            />
                        ),
                    )}
                </CardContent>
            </Card>

            {/* ── Unified Sheet ── */}
            <Sheet open={sheetOpen} onOpenChange={handleClose}>
                <SheetContent
                    side={isMobile ? "bottom" : "right"}
                    className={[
                        "flex flex-col gap-0 p-0 overflow-y-auto",
                        isMobile
                            ? "h-auto max-h-[92vh] rounded-t-2xl"
                            : "w-[480px] sm:w-[520px]",
                    ].join(" ")}
                >
                    <SheetHeader className="px-5 py-4 border-b border-border/60 sticky top-0 bg-background z-10">
                        <div className="flex items-start justify-between gap-3">
                            <div className="flex items-center gap-2 min-w-0">
                                {sheetView !== "detail" && (
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-7 w-7 shrink-0"
                                        onClick={() => setSheetView("detail")}
                                        disabled={submitting || requesting}
                                    >
                                        <ArrowLeft className="h-4 w-4" />
                                    </Button>
                                )}
                                <div className="min-w-0">
                                    <SheetTitle className="text-base leading-snug truncate">
                                        {sheetView === "detail" &&
                                            documentType?.name}
                                        {sheetView === "upload" &&
                                            `${submission ? "Resubmit" : "Upload"} — ${documentType?.name}`}
                                        {sheetView === "request" &&
                                            `${requestType === "RESUBMIT" ? "Request Resubmission" : "Request Deletion"}`}
                                    </SheetTitle>
                                    {sheetView === "detail" && (
                                        <div className="flex items-center gap-2 mt-1">
                                            {submission?.status ? (
                                                <DocumentStatusBadge
                                                    status={submission.status}
                                                />
                                            ) : (
                                                <Badge
                                                    variant="outline"
                                                    className="text-orange-500 border-orange-500/30"
                                                >
                                                    Missing
                                                </Badge>
                                            )}
                                            {documentType?.required && (
                                                <span className="text-xs text-muted-foreground">
                                                    Required
                                                </span>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="shrink-0 h-7 w-7"
                                onClick={handleClose}
                                disabled={submitting || requesting}
                                aria-label="Close"
                            >
                                <X className="h-4 w-4" />
                            </Button>
                        </div>
                    </SheetHeader>

                    <div className="flex-1 px-5 py-4 space-y-4">
                        {sheetView === "detail" && item && (
                            <>
                                {documentType?.description && (
                                    <p className="text-sm text-muted-foreground">
                                        {documentType.description}
                                    </p>
                                )}
                                {pendingRequest && (
                                    <div className="rounded-lg border border-yellow-500/30 bg-yellow-500/5 px-3 py-2 flex items-center gap-2">
                                        <HourglassIcon className="h-4 w-4 text-yellow-500 shrink-0" />
                                        <p className="text-xs text-yellow-500 font-medium">
                                            {pendingRequest.type === "RESUBMIT"
                                                ? "Resubmit request pending admin approval"
                                                : "Delete request pending admin approval"}
                                        </p>
                                    </div>
                                )}
                                {status === "REJECTED" &&
                                    submission?.reject_reason && (
                                        <div className="rounded-lg border border-red-500/30 bg-red-500/5 px-3 py-2">
                                            <p className="text-xs font-medium text-red-500 mb-1">
                                                Rejection reason
                                            </p>
                                            <p className="text-xs text-red-400">
                                                {submission.reject_reason}
                                            </p>
                                        </div>
                                    )}
                                {submission ? (
                                    <>
                                        <Separator />
                                        <div className="space-y-3">
                                            <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                                                Timeline
                                            </div>
                                            <div className="space-y-2">
                                                <div className="flex items-start gap-3 text-sm">
                                                    <CalendarDays className="h-4 w-4 mt-0.5 text-muted-foreground shrink-0" />
                                                    <div>
                                                        <div className="text-xs text-muted-foreground">
                                                            Submitted
                                                        </div>
                                                        <div className="text-xs font-medium">
                                                            {fmtDate(
                                                                submission.submitted_at,
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                                {submission.reviewed_at && (
                                                    <div className="flex items-start gap-3 text-sm">
                                                        <CalendarDays className="h-4 w-4 mt-0.5 text-muted-foreground shrink-0" />
                                                        <div>
                                                            <div className="text-xs text-muted-foreground">
                                                                Reviewed
                                                            </div>
                                                            <div className="text-xs font-medium">
                                                                {fmtDate(
                                                                    submission.reviewed_at,
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                )}
                                                {submission.status ===
                                                    "APPROVED" &&
                                                    submission.reviewed_at && (
                                                        <div className="flex items-start gap-3 text-sm">
                                                            <CheckCircle2 className="h-4 w-4 mt-0.5 text-emerald-500 shrink-0" />
                                                            <div>
                                                                <div className="text-xs text-muted-foreground">
                                                                    Approved
                                                                </div>
                                                                <div className="text-xs font-medium">
                                                                    {fmtDate(
                                                                        submission.reviewed_at,
                                                                    )}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    )}
                                                {submission.expires_at && (
                                                    <div className="flex items-start gap-3 text-sm">
                                                        <Clock className="h-4 w-4 mt-0.5 text-muted-foreground shrink-0" />
                                                        <div>
                                                            <div className="text-xs text-muted-foreground">
                                                                Expires
                                                            </div>
                                                            <div className="text-xs font-medium">
                                                                {fmtDate(
                                                                    submission.expires_at,
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                        <Separator />
                                        <div className="space-y-2">
                                            <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                                                File
                                            </div>
                                            {previewLoading ? (
                                                <div className="rounded-lg border bg-muted/20 h-48 flex items-center justify-center">
                                                    <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                                                </div>
                                            ) : previewUrl ? (
                                                <div className="space-y-2">
                                                    {submission.mime_type?.startsWith(
                                                        "image/",
                                                    ) ? (
                                                        <div className="rounded-lg border overflow-hidden bg-muted/20">
                                                            <img
                                                                src={previewUrl}
                                                                alt="Document preview"
                                                                className="w-full max-h-64 object-contain"
                                                            />
                                                        </div>
                                                    ) : (
                                                        <div className="rounded-lg border overflow-hidden bg-muted/20">
                                                            <iframe
                                                                src={previewUrl}
                                                                className="w-full h-64"
                                                                title="Document preview"
                                                            />
                                                        </div>
                                                    )}
                                                    <div className="flex items-center justify-between gap-2">
                                                        <div className="text-xs text-muted-foreground truncate">
                                                            {submission.mime_type ??
                                                                "Document"}
                                                            {submission.file_size_bytes
                                                                ? ` • ${formatBytes(submission.file_size_bytes)}`
                                                                : ""}
                                                        </div>
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            className="shrink-0 gap-1.5 text-xs"
                                                            onClick={() =>
                                                                setPreviewFullscreen(
                                                                    true,
                                                                )
                                                            }
                                                        >
                                                            <ZoomIn className="h-3.5 w-3.5" />
                                                            Fullscreen
                                                        </Button>
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="rounded-lg border bg-muted/20 px-3 py-2 flex items-center gap-2">
                                                    <FileText className="h-4 w-4 text-muted-foreground shrink-0" />
                                                    <div className="min-w-0 flex-1">
                                                        <div className="text-xs font-medium truncate">
                                                            {submission.mime_type ??
                                                                "Document"}
                                                        </div>
                                                        {submission.file_size_bytes && (
                                                            <div className="text-xs text-muted-foreground">
                                                                {formatBytes(
                                                                    submission.file_size_bytes,
                                                                )}
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </>
                                ) : (
                                    <div className="rounded-lg border border-dashed bg-muted/10 p-6 text-center text-sm text-muted-foreground">
                                        No document submitted yet.
                                    </div>
                                )}
                            </>
                        )}

                        {sheetView === "upload" && item && (
                            <>
                                {documentType?.description && (
                                    <p className="text-sm text-muted-foreground">
                                        {documentType.description}
                                    </p>
                                )}
                                {status === "REJECTED" &&
                                    submission?.reject_reason && (
                                        <div className="rounded-lg border border-red-500/30 bg-red-500/5 px-3 py-2">
                                            <p className="text-xs font-medium text-red-500 mb-1">
                                                Rejection reason
                                            </p>
                                            <p className="text-xs text-red-400">
                                                {submission.reject_reason}
                                            </p>
                                        </div>
                                    )}
                                <div className="text-xs text-muted-foreground space-y-1">
                                    {documentType?.allowed_mime && (
                                        <p>
                                            Allowed:{" "}
                                            {documentType.allowed_mime.join(
                                                ", ",
                                            )}
                                        </p>
                                    )}
                                    {documentType?.max_mb && (
                                        <p>Max size: {documentType.max_mb}MB</p>
                                    )}
                                </div>
                                <input
                                    ref={inputRef}
                                    type="file"
                                    className="hidden"
                                    accept={
                                        documentType?.allowed_mime?.join(",") ??
                                        "*"
                                    }
                                    onChange={(e) =>
                                        setFile(e.target.files?.[0] ?? null)
                                    }
                                />
                                {!file ? (
                                    <div
                                        className="border-2 border-dashed border-border rounded-lg p-8 text-center cursor-pointer hover:border-primary hover:bg-muted/10 transition-colors"
                                        onClick={() =>
                                            inputRef.current?.click()
                                        }
                                    >
                                        <Upload className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                                        <p className="text-sm text-muted-foreground">
                                            Click to select file
                                        </p>
                                        <p className="text-xs text-muted-foreground mt-1">
                                            or drag and drop here
                                        </p>
                                    </div>
                                ) : (
                                    <div className="space-y-2">
                                        <div className="rounded-lg border bg-muted/20 px-3 py-3 flex items-center gap-3">
                                            <FileText className="h-5 w-5 text-primary shrink-0" />
                                            <div className="min-w-0 flex-1">
                                                <div className="text-sm font-medium truncate">
                                                    {file.name}
                                                </div>
                                                <div className="text-xs text-muted-foreground">
                                                    {formatBytes(file.size)}
                                                </div>
                                            </div>
                                            <Button
                                                type="button"
                                                variant="outline"
                                                size="icon"
                                                className="shrink-0 h-7 w-7"
                                                onClick={() => setFile(null)}
                                                disabled={submitting}
                                            >
                                                <X className="h-3.5 w-3.5" />
                                            </Button>
                                        </div>
                                    </div>
                                )}
                            </>
                        )}

                        {sheetView === "request" && item && (
                            <>
                                <p className="text-sm text-muted-foreground">
                                    {requestType === "RESUBMIT" ? (
                                        <>
                                            You are requesting to replace your{" "}
                                            <strong className="text-foreground">
                                                {documentType?.name}
                                            </strong>
                                            . Admin must approve before you can
                                            upload a new one.
                                        </>
                                    ) : (
                                        <>
                                            You are requesting to delete your{" "}
                                            <strong className="text-foreground">
                                                {documentType?.name}
                                            </strong>
                                            . This requires admin approval.
                                        </>
                                    )}
                                </p>
                                {requestType === "DELETE" && (
                                    <div className="rounded-lg border border-red-500/30 bg-red-500/5 px-3 py-2 text-xs text-red-400">
                                        This action is irreversible once
                                        approved by an admin.
                                    </div>
                                )}
                                <div className="space-y-1.5">
                                    <div className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                                        Reason
                                    </div>
                                    <Textarea
                                        placeholder="Provide a reason for this request..."
                                        value={requestReason}
                                        onChange={(e) =>
                                            setRequestReason(e.target.value)
                                        }
                                        className="min-h-[120px]"
                                        disabled={requesting}
                                    />
                                </div>
                            </>
                        )}
                    </div>

                    <div className="sticky bottom-0 bg-background border-t border-border/60 px-5 py-3 flex gap-2">
                        {sheetView === "detail" && (
                            <>
                                {(() => {
                                    const hasPending = !!(item as any)
                                        ?.pendingRequest;
                                    const canUpload =
                                        !hasPending &&
                                        (status === "MISSING" ||
                                            status === "REJECTED");
                                    const canRequestResubmit =
                                        !!submission &&
                                        !hasPending &&
                                        status === "APPROVED";
                                    const canRequestDelete =
                                        !!submission && !hasPending;

                                    return (
                                        <>
                                            <Button
                                                variant="secondary"
                                                onClick={handleClose}
                                                className="flex-1"
                                            >
                                                Close
                                            </Button>
                                            {canUpload && (
                                                <Button
                                                    onClick={() =>
                                                        setSheetView("upload")
                                                    }
                                                    className="flex-1 gap-2"
                                                >
                                                    <Upload className="h-4 w-4" />
                                                    {status === "REJECTED"
                                                        ? "Resubmit"
                                                        : "Upload"}
                                                </Button>
                                            )}
                                            {(canRequestResubmit ||
                                                canRequestDelete) && (
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger
                                                        asChild
                                                    >
                                                        <Button
                                                            variant="outline"
                                                            size="icon"
                                                        >
                                                            <MoreHorizontal className="h-4 w-4" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end">
                                                        {canRequestResubmit && (
                                                            <DropdownMenuItem
                                                                onClick={() => {
                                                                    setRequestType(
                                                                        "RESUBMIT",
                                                                    );
                                                                    setSheetView(
                                                                        "request",
                                                                    );
                                                                }}
                                                            >
                                                                <RotateCcw className="h-4 w-4 mr-2" />{" "}
                                                                Request Resubmit
                                                            </DropdownMenuItem>
                                                        )}
                                                        {canRequestDelete && (
                                                            <DropdownMenuItem
                                                                className="text-destructive focus:text-destructive"
                                                                onClick={() => {
                                                                    setRequestType(
                                                                        "DELETE",
                                                                    );
                                                                    setSheetView(
                                                                        "request",
                                                                    );
                                                                }}
                                                            >
                                                                <Trash2 className="h-4 w-4 mr-2" />{" "}
                                                                Request Delete
                                                            </DropdownMenuItem>
                                                        )}
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            )}
                                        </>
                                    );
                                })()}
                            </>
                        )}

                        {sheetView === "upload" && (
                            <>
                                <Button
                                    variant="secondary"
                                    onClick={() => setSheetView("detail")}
                                    disabled={submitting}
                                    className="flex-1"
                                >
                                    Back
                                </Button>
                                <Button
                                    onClick={handleUpload}
                                    disabled={submitting || !file}
                                    className="flex-1 gap-2"
                                >
                                    {submitting && (
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                    )}
                                    {submitting
                                        ? "Uploading..."
                                        : submission
                                          ? "Resubmit"
                                          : "Submit"}
                                </Button>
                            </>
                        )}

                        {sheetView === "request" && (
                            <>
                                <Button
                                    variant="secondary"
                                    onClick={() => setSheetView("detail")}
                                    disabled={requesting}
                                    className="flex-1"
                                >
                                    Back
                                </Button>
                                <Button
                                    variant={
                                        requestType === "DELETE"
                                            ? "destructive"
                                            : "default"
                                    }
                                    onClick={handleRequest}
                                    disabled={
                                        !requestReason.trim() || requesting
                                    }
                                    className="flex-1 gap-2"
                                >
                                    {requesting && (
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                    )}
                                    {requesting ? "Sending..." : "Send Request"}
                                </Button>
                            </>
                        )}
                    </div>
                </SheetContent>
            </Sheet>

            {previewFullscreen && previewUrl && (
                <div
                    className="fixed inset-0 z-[200] bg-black/90 flex items-center justify-center"
                    onClick={() => setPreviewFullscreen(false)}
                >
                    <button
                        onClick={() => setPreviewFullscreen(false)}
                        className="absolute top-4 right-4 z-10 rounded-full bg-white/10 hover:bg-white/20 transition-colors p-2 text-white"
                        aria-label="Close fullscreen"
                    >
                        <X className="h-5 w-5" />
                    </button>
                    {submission?.mime_type?.startsWith("image/") ? (
                        <img
                            src={previewUrl}
                            alt="Fullscreen preview"
                            className="max-h-[90vh] max-w-[90vw] rounded-lg object-contain shadow-2xl"
                            onClick={(e) => e.stopPropagation()}
                        />
                    ) : (
                        <iframe
                            src={previewUrl}
                            className="w-[90vw] h-[90vh] rounded-lg shadow-2xl bg-white"
                            title="Fullscreen preview"
                            onClick={(e) => e.stopPropagation()}
                        />
                    )}
                </div>
            )}
        </>
    );
}
