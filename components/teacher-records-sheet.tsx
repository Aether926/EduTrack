"use client";

import { useEffect, useState } from "react";
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
} from "@/components/ui/sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {
    FileText,
    BookMarked,
    ShieldCheck,
    LayoutDashboard,
    ExternalLink,
    Bell,
    AlertTriangle,
    CheckCircle2,
    XCircle,
    Clock,
    Loader2,
} from "lucide-react";
import { toast } from "sonner";
import {
    fetchTeacherRecords,
    pingTeacherDocument,
} from "@/lib/database/teacher-records";
import { REQUIRED_DOCUMENT_TYPES } from "@/components/constant-data";

function fmtDate(dt: string | null | undefined) {
    if (!dt) return "—";
    try {
        return new Date(dt).toLocaleDateString("en-PH", {
            year: "numeric",
            month: "short",
            day: "numeric",
        });
    } catch {
        return dt;
    }
}

function isExpiringSoon(expiresAt: string | null | undefined) {
    if (!expiresAt) return false;
    const diff = new Date(expiresAt).getTime() - Date.now();
    return diff > 0 && diff < 1000 * 60 * 60 * 24 * 30;
}

function isExpired(expiresAt: string | null | undefined) {
    if (!expiresAt) return false;
    return new Date(expiresAt).getTime() < Date.now();
}

function DocStatusBadge({ status }: { status: string }) {
    const s = (status ?? "").toUpperCase();
    if (s === "APPROVED")
        return (
            <Badge className="bg-emerald-500/15 text-emerald-400 border-emerald-500/30 text-[10px]">
                <CheckCircle2 className="h-2.5 w-2.5 mr-1" />
                Approved
            </Badge>
        );
    if (s === "REJECTED")
        return (
            <Badge className="bg-rose-500/15 text-rose-400 border-rose-500/30 text-[10px]">
                <XCircle className="h-2.5 w-2.5 mr-1" />
                Rejected
            </Badge>
        );
    return (
        <Badge className="bg-amber-500/15 text-amber-400 border-amber-500/30 text-[10px]">
            <Clock className="h-2.5 w-2.5 mr-1" />
            Pending
        </Badge>
    );
}

function DocumentViewer({
    open,
    onOpenChange,
    fileUrl,
    mimeType,
    title,
}: {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    fileUrl: string;
    mimeType: string;
    title: string;
}) {
    const isPdf = mimeType === "application/pdf";
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl w-[90vw] p-0 gap-0 overflow-hidden">
                <DialogHeader className="px-5 py-4 border-b border-border/60">
                    <div className="flex items-center justify-between">
                        <DialogTitle className="text-sm font-medium truncate">
                            {title}
                        </DialogTitle>
                        <a
                            href={fileUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1.5 text-[11px] text-blue-400 hover:text-blue-300"
                        >
                            <ExternalLink className="h-3.5 w-3.5" />
                            Open in new tab
                        </a>
                    </div>
                </DialogHeader>
                <div className="bg-black/20 flex items-center justify-center min-h-[400px] max-h-[70vh]">
                    {isPdf ? (
                        <iframe
                            src={fileUrl}
                            className="w-full h-[70vh]"
                            title={title}
                        />
                    ) : (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                            src={fileUrl}
                            alt={title}
                            className="max-h-[70vh] max-w-full object-contain"
                        />
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}

interface TeacherRecordsSheetProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    teacherId: string;
    isArchived?: boolean;
}

type Records = Awaited<ReturnType<typeof fetchTeacherRecords>>;

export default function TeacherRecordsSheet({
    open,
    onOpenChange,
    teacherId,
    isArchived = false,
}: TeacherRecordsSheetProps) {
    const [records, setRecords] = useState<Records | null>(null);
    const [loading, setLoading] = useState(false);
    const [pingingId, setPingingId] = useState<string | null>(null);
    const [viewer, setViewer] = useState<{
        fileUrl: string;
        mimeType: string;
        title: string;
    } | null>(null);

    useEffect(() => {
        if (!open) return;
        setRecords(null);
        setLoading(true);
        fetchTeacherRecords(teacherId)
            .then(setRecords)
            .finally(() => setLoading(false));
    }, [open, teacherId]);

    const submittedTypeIds = new Set(
        (records?.documents ?? []).map((d) => d.documentTypeId),
    );
    const missingDocuments = REQUIRED_DOCUMENT_TYPES.filter(
        (dt) => !submittedTypeIds.has(dt.id),
    );
    const approvedDocs = (records?.documents ?? []).filter(
        (d) => d.status === "APPROVED",
    ).length;
    const totalDocs = (records?.documents ?? []).length;
    const compliantCount = (records?.compliance ?? []).filter(
        (c) => c.status === "COMPLIANT",
    ).length;
    const totalCompliance = (records?.compliance ?? []).length;

    async function handlePing(documentTypeName: string, docId?: string) {
        const id = docId ?? `missing-${documentTypeName}`;
        setPingingId(id);
        try {
            await pingTeacherDocument(teacherId, documentTypeName);
            toast.success(
                `Notification sent to teacher about ${documentTypeName}.`,
            );
        } catch {
            toast.error("Failed to send notification.");
        } finally {
            setPingingId(null);
        }
    }

    return (
        <>
            <Sheet open={open} onOpenChange={onOpenChange}>
                <SheetContent className="w-full sm:max-w-lg overflow-hidden p-0 flex flex-col gap-0">
                    <SheetHeader className="px-6 pt-6 pb-4 border-b border-border/60 shrink-0">
                        <SheetTitle className="flex items-center gap-2 text-sm">
                            <FileText className="h-4 w-4 text-slate-400" />
                            Teacher Records
                            {isArchived && (
                                <Badge className="bg-slate-500/15 text-slate-400 border-slate-500/30 text-[10px] ml-1">
                                    Archived
                                </Badge>
                            )}
                        </SheetTitle>
                    </SheetHeader>

                    <div className="flex-1 overflow-y-auto">
                        {loading ? (
                            <div className="p-6 space-y-3">
                                {[...Array(4)].map((_, i) => (
                                    <Skeleton
                                        key={i}
                                        className="h-14 w-full rounded-lg"
                                    />
                                ))}
                            </div>
                        ) : (
                            <Tabs defaultValue="overview" className="w-full">
                                <TabsList className="w-full rounded-none border-b border-border/60 bg-transparent h-auto p-0 justify-start overflow-x-auto flex-nowrap">
                                    {[
                                        {
                                            value: "overview",
                                            label: "Overview",
                                            icon: LayoutDashboard,
                                        },
                                        {
                                            value: "documents",
                                            label: "Documents",
                                            icon: FileText,
                                        },
                                        {
                                            value: "responsibilities",
                                            label: "Duties",
                                            icon: BookMarked,
                                        },
                                        {
                                            value: "compliance",
                                            label: "Compliance",
                                            icon: ShieldCheck,
                                        },
                                    ].map(({ value, label, icon: Icon }) => (
                                        <TabsTrigger
                                            key={value}
                                            value={value}
                                            className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-4 py-3 text-xs shrink-0"
                                        >
                                            <Icon className="h-3.5 w-3.5 mr-1.5" />
                                            {label}
                                        </TabsTrigger>
                                    ))}
                                </TabsList>

                                {/* ── Overview ── */}
                                <TabsContent
                                    value="overview"
                                    className="p-4 space-y-3 mt-0"
                                >
                                    <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-widest">
                                        Quick Summary
                                    </p>
                                    <div className="grid grid-cols-2 gap-2">
                                        <div className="rounded-lg border border-border/50 bg-muted/10 p-3">
                                            <p className="text-[11px] text-muted-foreground">
                                                Documents
                                            </p>
                                            <p className="text-xl font-bold mt-0.5">
                                                {approvedDocs}
                                                <span className="text-xs text-muted-foreground font-normal">
                                                    /{totalDocs} approved
                                                </span>
                                            </p>
                                        </div>
                                        <div className="rounded-lg border border-border/50 bg-muted/10 p-3">
                                            <p className="text-[11px] text-muted-foreground">
                                                Missing Docs
                                            </p>
                                            <p
                                                className={`text-xl font-bold mt-0.5 ${missingDocuments.length > 0 ? "text-rose-400" : "text-emerald-400"}`}
                                            >
                                                {missingDocuments.length}
                                                <span className="text-xs text-muted-foreground font-normal">
                                                    /
                                                    {
                                                        REQUIRED_DOCUMENT_TYPES.length
                                                    }{" "}
                                                    required
                                                </span>
                                            </p>
                                        </div>
                                        <div className="rounded-lg border border-border/50 bg-muted/10 p-3">
                                            <p className="text-[11px] text-muted-foreground">
                                                Compliance
                                            </p>
                                            <p className="text-xl font-bold mt-0.5">
                                                {compliantCount}
                                                <span className="text-xs text-muted-foreground font-normal">
                                                    /{totalCompliance} compliant
                                                </span>
                                            </p>
                                        </div>
                                        <div className="rounded-lg border border-border/50 bg-muted/10 p-3">
                                            <p className="text-[11px] text-muted-foreground">
                                                Responsibilities
                                            </p>
                                            <p className="text-xl font-bold mt-0.5">
                                                {records?.responsibilities
                                                    ?.length ?? 0}
                                                <span className="text-xs text-muted-foreground font-normal">
                                                    {" "}
                                                    assigned
                                                </span>
                                            </p>
                                        </div>
                                    </div>

                                    {missingDocuments.length > 0 &&
                                        !isArchived && (
                                            <div className="rounded-lg border border-rose-500/20 bg-rose-500/5 p-3">
                                                <div className="flex items-center gap-1.5 mb-2">
                                                    <AlertTriangle className="h-3.5 w-3.5 text-rose-400 shrink-0" />
                                                    <p className="text-[11px] font-semibold text-rose-400 uppercase tracking-wider">
                                                        Missing Required
                                                        Documents
                                                    </p>
                                                </div>
                                                <div className="space-y-1.5">
                                                    {missingDocuments.map(
                                                        (dt) => (
                                                            <div
                                                                key={dt.id}
                                                                className="flex items-center justify-between gap-2"
                                                            >
                                                                <p className="text-xs text-foreground">
                                                                    {dt.name}
                                                                </p>
                                                                {!isArchived && (
                                                                    <Button
                                                                        size="sm"
                                                                        variant="outline"
                                                                        className="h-6 text-[10px] px-2 gap-1 border-rose-500/30 text-rose-400 hover:bg-rose-500/10"
                                                                        onClick={() =>
                                                                            handlePing(
                                                                                dt.name,
                                                                            )
                                                                        }
                                                                        disabled={
                                                                            pingingId ===
                                                                            `missing-${dt.name}`
                                                                        }
                                                                    >
                                                                        {pingingId ===
                                                                        `missing-${dt.name}` ? (
                                                                            <Loader2 className="h-2.5 w-2.5 animate-spin" />
                                                                        ) : (
                                                                            <Bell className="h-2.5 w-2.5" />
                                                                        )}
                                                                        Notify
                                                                    </Button>
                                                                )}
                                                            </div>
                                                        ),
                                                    )}
                                                </div>
                                            </div>
                                        )}

                                    {totalCompliance > 0 && (
                                        <div className="rounded-lg border border-border/50 bg-muted/10 p-3 space-y-2">
                                            <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                                                Compliance Overview
                                            </p>
                                            {records?.compliance?.map((c) => (
                                                <div key={c.id}>
                                                    <div className="flex items-center justify-between mb-1">
                                                        <p className="text-xs text-foreground truncate">
                                                            {c.policyName}
                                                        </p>
                                                        <span
                                                            className={`text-[10px] font-semibold ${c.status === "COMPLIANT" ? "text-emerald-400" : "text-rose-400"}`}
                                                        >
                                                            {c.approvedHours}hrs
                                                        </span>
                                                    </div>
                                                    <div className="w-full bg-muted rounded-full h-1.5 overflow-hidden">
                                                        <div
                                                            className={`h-1.5 rounded-full transition-all ${c.status === "COMPLIANT" ? "bg-emerald-400" : "bg-rose-400"}`}
                                                            style={{
                                                                width: `${Math.min(100, (c.approvedHours / (c.requiredHours || 1)) * 100)}%`,
                                                            }}
                                                        />
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </TabsContent>

                                {/* ── Documents ── */}
                                <TabsContent
                                    value="documents"
                                    className="p-4 space-y-3 mt-0"
                                >
                                    <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-widest">
                                        Submitted Documents
                                    </p>
                                    {!records?.documents?.length ? (
                                        <p className="text-sm text-muted-foreground text-center py-4">
                                            No documents submitted.
                                        </p>
                                    ) : (
                                        <div className="space-y-2">
                                            {records.documents.map((d) => {
                                                const expiring = isExpiringSoon(
                                                    d.expiresAt,
                                                );
                                                const expired = isExpired(
                                                    d.expiresAt,
                                                );
                                                return (
                                                    <div
                                                        key={d.id}
                                                        className={`rounded-lg border border-border/50 bg-muted/10 p-3 transition-colors ${d.fileUrl ? "cursor-pointer hover:bg-muted/20" : ""}`}
                                                        onClick={() =>
                                                            d.fileUrl &&
                                                            setViewer({
                                                                fileUrl:
                                                                    d.fileUrl,
                                                                mimeType:
                                                                    d.mimeType ??
                                                                    "image/jpeg",
                                                                title: d.documentType,
                                                            })
                                                        }
                                                    >
                                                        <div className="flex items-start justify-between gap-2">
                                                            <div className="min-w-0 flex-1">
                                                                <p className="text-sm font-medium truncate">
                                                                    {
                                                                        d.documentType
                                                                    }
                                                                </p>
                                                                <div className="flex items-center gap-2 mt-1 flex-wrap">
                                                                    <DocStatusBadge
                                                                        status={
                                                                            d.status
                                                                        }
                                                                    />
                                                                    <span className="text-[11px] text-muted-foreground font-mono">
                                                                        {fmtDate(
                                                                            d.submittedAt,
                                                                        )}
                                                                    </span>
                                                                    {expired && (
                                                                        <Badge className="bg-rose-500/15 text-rose-400 border-rose-500/30 text-[10px]">
                                                                            Expired
                                                                        </Badge>
                                                                    )}
                                                                    {!expired &&
                                                                        expiring && (
                                                                            <Badge className="bg-amber-500/15 text-amber-400 border-amber-500/30 text-[10px]">
                                                                                Expiring
                                                                                soon
                                                                            </Badge>
                                                                        )}
                                                                </div>
                                                                {d.expiresAt && (
                                                                    <p className="text-[10px] text-muted-foreground mt-0.5">
                                                                        Expires:{" "}
                                                                        {fmtDate(
                                                                            d.expiresAt,
                                                                        )}
                                                                    </p>
                                                                )}
                                                            </div>
                                                            <div className="flex items-center gap-1.5 shrink-0">
                                                                {(expired ||
                                                                    expiring ||
                                                                    d.status ===
                                                                        "REJECTED") &&
                                                                    !isArchived && (
                                                                        <Button
                                                                            size="sm"
                                                                            variant="outline"
                                                                            className="h-6 text-[10px] px-2 gap-1 border-amber-500/30 text-amber-400 hover:bg-amber-500/10"
                                                                            onClick={(
                                                                                e,
                                                                            ) => {
                                                                                e.stopPropagation();
                                                                                handlePing(
                                                                                    d.documentType,
                                                                                    d.id,
                                                                                );
                                                                            }}
                                                                            disabled={
                                                                                pingingId ===
                                                                                d.id
                                                                            }
                                                                        >
                                                                            {pingingId ===
                                                                            d.id ? (
                                                                                <Loader2 className="h-2.5 w-2.5 animate-spin" />
                                                                            ) : (
                                                                                <Bell className="h-2.5 w-2.5" />
                                                                            )}
                                                                            Notify
                                                                        </Button>
                                                                    )}
                                                                {d.fileUrl && (
                                                                    <ExternalLink className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    )}

                                    {missingDocuments.length > 0 &&
                                        !isArchived && (
                                            <>
                                                <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-widest pt-2">
                                                    Missing Documents
                                                </p>
                                                <div className="space-y-2">
                                                    {missingDocuments.map(
                                                        (dt) => (
                                                            <div
                                                                key={dt.id}
                                                                className="rounded-lg border border-rose-500/20 bg-rose-500/5 p-3 flex items-center justify-between gap-2"
                                                            >
                                                                <div className="flex items-center gap-2 min-w-0">
                                                                    <AlertTriangle className="h-3.5 w-3.5 text-rose-400 shrink-0" />
                                                                    <p className="text-sm text-foreground truncate">
                                                                        {
                                                                            dt.name
                                                                        }
                                                                    </p>
                                                                </div>
                                                                {!isArchived && (
                                                                    <Button
                                                                        size="sm"
                                                                        variant="outline"
                                                                        className="h-7 text-[10px] px-2.5 gap-1 border-rose-500/30 text-rose-400 hover:bg-rose-500/10 shrink-0"
                                                                        onClick={() =>
                                                                            handlePing(
                                                                                dt.name,
                                                                            )
                                                                        }
                                                                        disabled={
                                                                            pingingId ===
                                                                            `missing-${dt.name}`
                                                                        }
                                                                    >
                                                                        {pingingId ===
                                                                        `missing-${dt.name}` ? (
                                                                            <Loader2 className="h-2.5 w-2.5 animate-spin" />
                                                                        ) : (
                                                                            <Bell className="h-2.5 w-2.5" />
                                                                        )}
                                                                        Notify
                                                                    </Button>
                                                                )}
                                                            </div>
                                                        ),
                                                    )}
                                                </div>
                                            </>
                                        )}
                                </TabsContent>

                                {/* ── Responsibilities ── */}
                                <TabsContent
                                    value="responsibilities"
                                    className="p-4 space-y-2 mt-0"
                                >
                                    <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-widest">
                                        Assigned Responsibilities
                                    </p>
                                    {!records?.responsibilities?.length ? (
                                        <p className="text-sm text-muted-foreground text-center py-8">
                                            No responsibilities assigned.
                                        </p>
                                    ) : (
                                        records.responsibilities.map((r) => (
                                            <div
                                                key={r.id}
                                                className="rounded-lg border border-border/50 bg-muted/10 p-3"
                                            >
                                                <p className="text-sm font-medium">
                                                    {r.title}
                                                </p>
                                                <p className="text-[11px] text-muted-foreground mt-0.5">
                                                    {r.schoolYear}
                                                </p>
                                            </div>
                                        ))
                                    )}
                                </TabsContent>

                                {/* ── Compliance ── */}
                                <TabsContent
                                    value="compliance"
                                    className="p-4 space-y-2 mt-0"
                                >
                                    <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-widest">
                                        Training Compliance
                                    </p>
                                    {!records?.compliance?.length ? (
                                        <p className="text-sm text-muted-foreground text-center py-8">
                                            No compliance records.
                                        </p>
                                    ) : (
                                        records.compliance.map((c) => (
                                            <div
                                                key={c.id}
                                                className="rounded-lg border border-border/50 bg-muted/10 p-3 space-y-2"
                                            >
                                                <div className="flex items-center justify-between gap-2">
                                                    <p className="text-sm font-medium truncate">
                                                        {c.policyName}
                                                    </p>
                                                    <Badge
                                                        className={
                                                            c.status ===
                                                            "COMPLIANT"
                                                                ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/30 text-[10px] shrink-0"
                                                                : "bg-rose-500/15 text-rose-400 border-rose-500/30 text-[10px] shrink-0"
                                                        }
                                                    >
                                                        {c.status}
                                                    </Badge>
                                                </div>
                                                <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                                                    <span>
                                                        {c.approvedHours}hrs
                                                        approved
                                                    </span>
                                                    <span>
                                                        {c.requiredHours}hrs
                                                        required
                                                    </span>
                                                </div>
                                                <div className="w-full bg-muted rounded-full h-1.5 overflow-hidden">
                                                    <div
                                                        className={`h-1.5 rounded-full transition-all ${c.status === "COMPLIANT" ? "bg-emerald-400" : "bg-rose-400"}`}
                                                        style={{
                                                            width: `${Math.min(100, (c.approvedHours / (c.requiredHours || 1)) * 100)}%`,
                                                        }}
                                                    />
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </TabsContent>
                            </Tabs>
                        )}
                    </div>
                </SheetContent>
            </Sheet>

            {viewer && (
                <DocumentViewer
                    open={!!viewer}
                    onOpenChange={(o) => !o && setViewer(null)}
                    fileUrl={viewer.fileUrl}
                    mimeType={viewer.mimeType}
                    title={viewer.title}
                />
            )}
        </>
    );
}
