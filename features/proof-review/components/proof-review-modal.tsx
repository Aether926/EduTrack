"use client";

import * as React from "react";
import type { ProofReviewRow } from "../types";
import { fmt, statusBadgeVariant } from "../lib/utils";
import {
    ExternalLink,
    Loader2,
    GraduationCap,
    User,
    CalendarDays,
    Clock,
    Building2,
    MapPin,
    FileText,
    ShieldCheck,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";

/* ── Status chip ── */
const statusColors: Record<string, string> = {
    pending: "bg-yellow-500/10 text-yellow-400 border-yellow-500/40",
    approved: "bg-emerald-500/10 text-emerald-400 border-emerald-500/40",
    rejected: "bg-red-500/10 text-red-400 border-red-500/40",
};
function StatusChip({ status }: { status: string }) {
    const cls =
        statusColors[status.toLowerCase()] ??
        "bg-slate-500/10 text-slate-400 border-slate-500/40";
    return (
        <span
            className={`inline-block rounded-full border px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wider ${cls}`}
        >
            {status}
        </span>
    );
}

/* ── Type chip ── */
const typeColors: Record<string, string> = {
    training: "bg-teal-500/10 text-teal-400 border-teal-500/40",
    seminar: "bg-violet-500/10 text-violet-400 border-violet-500/40",
    workshop: "bg-orange-500/10 text-orange-400 border-orange-500/40",
    webinar: "bg-sky-500/10 text-sky-400 border-sky-500/40",
    conference: "bg-pink-500/10 text-pink-400 border-pink-500/40",
};
function TypeChip({ type }: { type: string }) {
    const cls =
        typeColors[(type ?? "").toLowerCase()] ??
        "bg-slate-500/10 text-slate-400 border-slate-500/40";
    return (
        <span
            className={`inline-block rounded-full border px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wider ${cls}`}
        >
            {type}
        </span>
    );
}

/* ── Level chip ── */
function LevelChip({ level }: { level: string }) {
    const l = (level ?? "").toLowerCase();
    const cls =
        l === "regional"
            ? "bg-amber-500/10 text-amber-400 border-amber-500/40"
            : l === "national"
              ? "bg-blue-500/10 text-blue-400 border-blue-500/40"
              : l === "international"
                ? "bg-rose-500/10 text-rose-400 border-rose-500/40"
                : "bg-slate-500/10 text-slate-400 border-slate-500/40";
    return (
        <span
            className={`inline-block rounded-full border px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wider ${cls}`}
        >
            {level}
        </span>
    );
}

/* ── Info row ── */
function InfoRow({
    icon: Icon,
    label,
    value,
}: {
    icon: React.ElementType;
    label: string;
    value: React.ReactNode;
}) {
    return (
        <div className="flex items-start gap-3">
            <div className="mt-0.5 rounded-md border border-white/10 bg-white/5 p-1.5 shrink-0">
                <Icon className="h-3.5 w-3.5 text-muted-foreground" />
            </div>
            <div className="min-w-0">
                <div className="text-[11px] text-muted-foreground uppercase tracking-wider font-medium mb-0.5">
                    {label}
                </div>
                <div className="text-sm text-foreground leading-snug">
                    {value ?? <span className="text-muted-foreground">—</span>}
                </div>
            </div>
        </div>
    );
}

export default function ProofReviewModal({
    row,
    open,
    onOpenChange,
    remarks,
    setRemarks,
    loadingId,
    onApprove,
    onReject,
}: {
    row: ProofReviewRow | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    remarks: Record<string, string>;
    setRemarks: React.Dispatch<React.SetStateAction<Record<string, string>>>;
    loadingId: string | null;
    onApprove: (attendanceId: string) => Promise<void>;
    onReject: (attendanceId: string) => Promise<void>;
}) {
    if (!row) return null;

    const isLoading = loadingId === row.attendanceId;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl w-[90vw] max-h-[90vh] overflow-y-auto p-0 overflow-x-hidden gap-0">
                {/* ── Header band ── */}
                <div className="relative px-6 pt-6 pb-5 border-b border-border/60 bg-gradient-to-br from-card to-background">
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-transparent to-violet-500/5 pointer-events-none" />

                    <DialogHeader className="relative">
                        <div className="flex items-center gap-2 mb-3">
                            <div className="rounded-lg border border-blue-500/20 bg-blue-500/10 p-2">
                                <ShieldCheck className="h-4 w-4 text-blue-400" />
                            </div>
                            <DialogTitle className="text-sm font-medium text-muted-foreground">
                                Review Submission
                            </DialogTitle>
                        </div>

                        <h2 className="text-xl font-semibold tracking-tight leading-tight">
                            {row.training.title}
                        </h2>

                        <div className="flex flex-wrap items-center gap-2 mt-2.5">
                            <StatusChip status={row.status} />
                            <TypeChip type={row.training.type ?? "—"} />
                            <LevelChip level={row.training.level ?? "—"} />
                        </div>

                        <div className="text-xs text-muted-foreground mt-2">
                            Submitted: {fmt(row.submittedAt)}
                        </div>
                    </DialogHeader>
                </div>

                {/* ── Body ── */}
                <div className="px-6 py-5 space-y-5">
                    {/* Training details */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <InfoRow
                            icon={CalendarDays}
                            label="Dates"
                            value={
                                <span className="font-mono text-xs">
                                    {row.training.startDate}
                                    {row.training.endDate ? (
                                        <>
                                            {" "}
                                            <span className="text-muted-foreground">
                                                →
                                            </span>{" "}
                                            {row.training.endDate}
                                        </>
                                    ) : null}
                                </span>
                            }
                        />
                        <InfoRow
                            icon={Clock}
                            label="Total Hours"
                            value={
                                <span className="font-semibold text-emerald-400 tabular-nums">
                                    {row.training.totalHours ?? "—"}h
                                </span>
                            }
                        />
                        <InfoRow
                            icon={Building2}
                            label="Sponsor / Agency"
                            value={row.training.sponsor ?? "—"}
                        />
                        <InfoRow
                            icon={MapPin}
                            label="Venue"
                            value={row.training.venue ?? "—"}
                        />
                    </div>

                    {row.training.description && (
                        <InfoRow
                            icon={FileText}
                            label="Description"
                            value={row.training.description}
                        />
                    )}

                    <div className="h-px bg-border/50" />

                    {/* Teacher info */}
                    <InfoRow
                        icon={User}
                        label="Teacher"
                        value={
                            <div>
                                <div className="font-medium">
                                    {row.teacher.name}
                                    {row.teacher.employeeId && (
                                        <span className="text-muted-foreground font-normal">
                                            {" "}
                                            • {row.teacher.employeeId}
                                        </span>
                                    )}
                                </div>
                                <div className="text-xs text-muted-foreground">
                                    {row.teacher.email ?? "—"}
                                </div>
                            </div>
                        }
                    />

                    <div className="h-px bg-border/50" />

                    {/* Proof link */}
                    {row.proofUrl ? (
                        <Button asChild variant="outline" size="sm">
                            <a
                                href={row.proofUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="gap-2"
                            >
                                <ExternalLink className="h-4 w-4" />
                                View proof
                            </a>
                        </Button>
                    ) : (
                        <Badge variant="outline">No proof URL</Badge>
                    )}

                    <div className="h-px bg-border/50" />

                    {/* Review note */}
                    <div className="space-y-2">
                        <div className="text-sm font-medium">
                            Review note{" "}
                            <span className="text-xs text-muted-foreground">
                                (required for rejection)
                            </span>
                        </div>
                        <Textarea
                            value={remarks[row.attendanceId] ?? ""}
                            onChange={(e) =>
                                setRemarks((prev) => ({
                                    ...prev,
                                    [row.attendanceId]: e.target.value,
                                }))
                            }
                            placeholder="Add a short note for the teacher..."
                            className="min-h-[96px]"
                        />
                    </div>

                    {/* Actions */}
                    <div className="flex flex-wrap gap-2">
                        <Button
                            onClick={() => void onApprove(row.attendanceId)}
                            disabled={isLoading}
                            className="gap-2"
                        >
                            {isLoading ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                            ) : null}
                            Approve
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={() => void onReject(row.attendanceId)}
                            disabled={isLoading}
                            className="gap-2"
                        >
                            {isLoading ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                            ) : null}
                            Reject
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
