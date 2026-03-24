/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useMemo, useState } from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
    ExternalLink,
    Loader2,
    FileX,
    CheckCircle2,
    Clock3,
    XCircle,
    AlertTriangle,
    FileStack,
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
    return (
        (parts[0]?.[0] ?? "") + (parts[parts.length - 1]?.[0] ?? "")
    ).toUpperCase();
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
            className="gap-1.5 h-7 text-xs border-border/60"
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

const STAT_CONFIG = [
    {
        key: "approved" as const,
        label: "Approved",
        icon: <CheckCircle2 className="h-4 w-4 text-emerald-400" />,
        cls: "border-emerald-500/20 bg-emerald-500/5",
        val: (t: TeacherInfo) => t.approved,
    },
    {
        key: "submitted" as const,
        label: "Pending",
        icon: <Clock3 className="h-4 w-4 text-blue-400" />,
        cls: "border-blue-500/20 bg-blue-500/5",
        val: (t: TeacherInfo) => t.submitted,
    },
    {
        key: "rejected" as const,
        label: "Rejected",
        icon: <XCircle className="h-4 w-4 text-rose-400" />,
        cls: "border-rose-500/20 bg-rose-500/5",
        val: (t: TeacherInfo) => t.rejected,
    },
    {
        key: "missing" as const,
        label: "Missing",
        icon: <AlertTriangle className="h-4 w-4 text-amber-400" />,
        cls: "border-amber-500/20 bg-amber-500/5",
        val: (t: TeacherInfo) => t.missing,
    },
];

const DOC_ACCENT: Record<string, string> = {
    APPROVED: "border-l-emerald-500/50",
    SUBMITTED: "border-l-blue-500/50",
    REJECTED: "border-l-rose-500/50",
    DRAFT: "border-l-slate-500/50",
};

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

    const pct =
        teacher.total > 0
            ? Math.round((teacher.approved / teacher.total) * 100)
            : 0;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl w-[95vw] max-h-[88vh] overflow-y-auto p-0 gap-0">
                {/* ── Header ── */}
                <div className="relative px-6 pt-6 pb-5 border-b border-border/60 bg-gradient-to-br from-card to-background">
                    <div className="absolute inset-0 bg-gradient-to-br from-violet-500/5 via-transparent to-blue-500/5 pointer-events-none" />
                    <DialogHeader className="relative">
                        <div className="flex items-center gap-3 mb-1">
                            <div className="h-10 w-10 rounded-xl border border-border/60 bg-muted/30 flex items-center justify-center font-semibold text-sm shrink-0">
                                {initials(fullName)}
                            </div>
                            <div className="min-w-0">
                                <div className="flex items-center gap-2 mb-0.5">
                                    <div className="rounded-lg border border-violet-500/20 bg-violet-500/10 p-1.5">
                                        <FileStack className="h-3.5 w-3.5 text-violet-400" />
                                    </div>
                                    <DialogTitle className="text-sm font-medium text-muted-foreground">
                                        201 File Documents
                                    </DialogTitle>
                                </div>
                                <p className="text-base font-semibold tracking-tight truncate">
                                    {fullName}
                                </p>
                                <div className="flex flex-wrap items-center gap-2 mt-0.5 text-[11px] text-muted-foreground font-mono">
                                    {teacher.email && (
                                        <span className="truncate">
                                            {teacher.email}
                                        </span>
                                    )}
                                    {teacher.employeeId && (
                                        <>
                                            <span className="font-sans">•</span>
                                            <span>{teacher.employeeId}</span>
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>
                    </DialogHeader>
                </div>

                <div className="px-6 py-5 space-y-5">
                    {/* ── Stat cards ── */}
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
                        {STAT_CONFIG.map((s) => (
                            <div
                                key={s.key}
                                className={`rounded-lg border px-3 py-2.5 flex items-center gap-2.5 ${s.cls}`}
                            >
                                <div className="rounded-md border border-white/10 bg-white/5 p-1.5 shrink-0">
                                    {s.icon}
                                </div>
                                <div>
                                    <div className="text-lg font-bold tabular-nums leading-none">
                                        {s.val(teacher)}
                                    </div>
                                    <div className="text-[11px] text-muted-foreground uppercase tracking-wider font-medium mt-0.5">
                                        {s.label}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* ── Progress ── */}
                    <div className="rounded-lg border border-border/60 bg-muted/5 px-4 py-3">
                        <div className="flex items-center justify-between gap-3 mb-2">
                            <div>
                                <p className="text-[11px] text-muted-foreground uppercase tracking-wider font-medium">
                                    Completion
                                </p>
                                <p className="text-sm font-semibold mt-0.5">
                                    {teacher.approved}/{teacher.total} required
                                    approved
                                </p>
                            </div>
                            <span className="text-2xl font-bold tabular-nums text-muted-foreground">
                                {pct}%
                            </span>
                        </div>
                        <div className="h-1.5 w-full rounded-full bg-muted/60 overflow-hidden">
                            <div
                                className="h-1.5 rounded-full bg-emerald-500 transition-all duration-500"
                                style={{
                                    width:
                                        teacher.total > 0
                                            ? `${(teacher.approved / teacher.total) * 100}%`
                                            : "0%",
                                }}
                            />
                        </div>
                    </div>

                    {/* ── Documents list ── */}
                    <div>
                        <div className="flex items-center justify-between mb-2">
                            <p className="text-[11px] text-muted-foreground uppercase tracking-wider font-medium">
                                Documents · {teacher.docs.length} item
                                {teacher.docs.length === 1 ? "" : "s"}
                            </p>
                            <p className="text-[11px] text-muted-foreground">
                                * = required
                            </p>
                        </div>

                        {teacher.docs.length === 0 ? (
                            <div className="rounded-xl border border-border/60 bg-card py-12 flex flex-col items-center gap-2 text-muted-foreground">
                                <FileX className="h-8 w-8" />
                                <p className="text-sm">
                                    No documents submitted yet.
                                </p>
                            </div>
                        ) : (
                            <div className="space-y-2">
                                {teacher.docs.map((doc) => {
                                    const accent =
                                        DOC_ACCENT[doc.status] ??
                                        "border-l-slate-500/50";
                                    return (
                                        <div
                                            key={doc.id}
                                            className={`rounded-lg border border-border bg-card border-l-4 ${accent} px-4 py-3 transition-colors hover:bg-muted/20`}
                                        >
                                            <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                                                <div className="min-w-0 space-y-1.5">
                                                    <div className="flex flex-wrap items-center gap-2">
                                                        <p className="text-sm font-medium">
                                                            {
                                                                doc.DocumentType
                                                                    .name
                                                            }
                                                            {doc.DocumentType
                                                                .required && (
                                                                <span className="text-rose-400 ml-1 text-xs">
                                                                    *
                                                                </span>
                                                            )}
                                                        </p>
                                                        <DocumentStatusBadge
                                                            status={
                                                                doc.status as any
                                                            }
                                                        />
                                                        <span className="inline-block rounded border border-border/60 bg-muted/20 px-1.5 py-0.5 text-[10px] font-mono text-muted-foreground">
                                                            {
                                                                doc.DocumentType
                                                                    .code
                                                            }
                                                        </span>
                                                    </div>

                                                    <div className="flex flex-wrap items-center gap-3 text-[11px] text-muted-foreground font-mono">
                                                        {doc.submitted_at && (
                                                            <span>
                                                                Submitted:{" "}
                                                                {new Date(
                                                                    doc.submitted_at,
                                                                ).toLocaleDateString(
                                                                    "en-PH",
                                                                )}
                                                            </span>
                                                        )}
                                                        {doc.reviewed_at && (
                                                            <span>
                                                                Reviewed:{" "}
                                                                {new Date(
                                                                    doc.reviewed_at,
                                                                ).toLocaleDateString(
                                                                    "en-PH",
                                                                )}
                                                            </span>
                                                        )}
                                                    </div>

                                                    {doc.status ===
                                                        "REJECTED" &&
                                                        doc.reject_reason && (
                                                            <div className="rounded-md border border-rose-500/30 bg-rose-500/10 px-3 py-2">
                                                                <p className="text-[10px] text-rose-400 uppercase tracking-widest font-semibold mb-0.5">
                                                                    Reason
                                                                </p>
                                                                <p className="text-xs text-rose-300 leading-snug break-words">
                                                                    {
                                                                        doc.reject_reason
                                                                    }
                                                                </p>
                                                            </div>
                                                        )}
                                                </div>

                                                <div className="shrink-0">
                                                    {doc.file_path ? (
                                                        <ViewDocButton
                                                            docId={doc.id}
                                                        />
                                                    ) : (
                                                        <span className="inline-flex items-center gap-1.5 rounded-full border border-border/40 bg-muted/10 px-2.5 py-0.5 text-[11px] text-muted-foreground">
                                                            No file
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
