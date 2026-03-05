/* eslint-disable @next/next/no-img-element */
"use client";

import * as React from "react";
import { createPortal } from "react-dom";
import type { ProofReviewRow } from "../types";
import { fmt, statusBadgeVariant } from "../lib/utils";
import { Loader2, X, ZoomIn } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
} from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { useIsMobile } from "@/hooks/use-mobile";

function isImage(url: string) {
    return /\.(jpe?g|png|gif|webp|bmp|svg)(\?|$)/i.test(url);
}

function FullscreenOverlay({
    url,
    onClose,
}: {
    url: string;
    onClose: () => void;
}) {
    const image = isImage(url);

    const handleBackdrop = (e: React.MouseEvent) => {
        if (e.target === e.currentTarget) onClose();
    };

    React.useEffect(() => {
        const handler = (e: KeyboardEvent) => {
            if (e.key === "Escape") onClose();
        };
        window.addEventListener("keydown", handler);
        return () => window.removeEventListener("keydown", handler);
    }, [onClose]);

    return createPortal(
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            className="fixed inset-0 z-[9999] bg-black/90 flex items-center justify-center"
            onClick={handleBackdrop}
        >
            <button
                onClick={onClose}
                className="absolute top-4 right-4 z-10 rounded-full bg-white/10 hover:bg-white/20 transition-colors p-2 text-white"
                aria-label="Close fullscreen"
            >
                <X className="h-5 w-5" />
            </button>

            {image ? (
                <img
                    src={url}
                    alt="Proof fullscreen"
                    className="max-h-[90vh] max-w-[90vw] rounded-lg object-contain shadow-2xl"
                    onClick={(e) => e.stopPropagation()}
                />
            ) : (
                <iframe
                    src={url}
                    className="w-[90vw] h-[90vh] rounded-lg shadow-2xl bg-white"
                    title="Proof PDF"
                    onClick={(e) => e.stopPropagation()}
                />
            )}
        </motion.div>,
        document.body
    );
}

export default function ProofReviewSheet({
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
    const isMobile = useIsMobile();
    const [fullscreen, setFullscreen] = React.useState(false);

    if (!row) return null;

    const isLoading = loadingId === row.attendanceId;
    const hasProof = !!row.proofUrl;
    const proofIsImage = hasProof && isImage(row.proofUrl!);

    return (
        <>
            <Sheet open={open} onOpenChange={onOpenChange}>
                <SheetContent
                    side={isMobile ? "bottom" : "right"}
                    className={[
                        "flex flex-col gap-0 p-0 overflow-y-auto",
                        isMobile
                            ? "h-[92vh] rounded-t-2xl data-[state=closed]:animate-out data-[state=closed]:slide-out-to-bottom data-[state=closed]:duration-300"
                            : "w-[480px] sm:w-[520px] data-[state=closed]:animate-out data-[state=closed]:slide-out-to-right data-[state=closed]:duration-300",
                    ].join(" ")}
                >
                    {/* ── Header ── */}
                    <SheetHeader className="px-5 py-4 border-b border-border/60 sticky top-0 bg-background z-10">
                        <div className="flex items-start justify-between gap-3">
                            <div className="space-y-1 min-w-0">
                                <SheetTitle className="text-base leading-snug truncate">
                                    {row.training.title}
                                </SheetTitle>
                                <div className="flex flex-wrap items-center gap-2">
                                    <Badge variant={statusBadgeVariant(row.status)}>
                                        {row.status}
                                    </Badge>
                                    <span className="text-xs text-muted-foreground">
                                        Submitted: {fmt(row.submittedAt)}
                                    </span>
                                </div>
                            </div>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="shrink-0 h-7 w-7"
                                onClick={() => onOpenChange(false)}
                                disabled={isLoading}
                                aria-label="Close"
                            >
                                <X className="h-4 w-4" />
                            </Button>
                        </div>
                    </SheetHeader>

                    {/* ── Body ── */}
                    <div className="flex-1 px-5 py-4 space-y-5">

                        {/* Training details */}
                        <div className="space-y-1 text-sm">
                            <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">
                                Training
                            </div>
                            <div className="text-muted-foreground">
                                <span className="font-medium text-foreground">Type / Level:</span>{" "}
                                {row.training.type} • {row.training.level} • {row.training.totalHours} hrs
                            </div>
                            <div className="text-muted-foreground">
                                <span className="font-medium text-foreground">Dates:</span>{" "}
                                {row.training.startDate}
                                {row.training.endDate ? ` → ${row.training.endDate}` : ""}
                            </div>
                            <div className="text-muted-foreground">
                                <span className="font-medium text-foreground">Sponsor / Venue:</span>{" "}
                                {row.training.sponsor ?? "—"} • {row.training.venue ?? "—"}
                            </div>
                            {row.training.description && (
                                <div className="text-muted-foreground">
                                    <span className="font-medium text-foreground">Description:</span>{" "}
                                    {row.training.description}
                                </div>
                            )}
                        </div>

                        <Separator />

                        {/* Teacher details */}
                        <div className="space-y-1 text-sm">
                            <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">
                                Teacher
                            </div>
                            <div className="font-medium">{row.teacher.name}</div>
                            {row.teacher.employeeId && (
                                <div className="text-xs text-muted-foreground">
                                    ID: {row.teacher.employeeId}
                                </div>
                            )}
                            <div className="text-xs text-muted-foreground">
                                {row.teacher.email ?? "—"}
                            </div>
                        </div>

                        <Separator />

                        {/* Proof preview */}
                        <div className="space-y-2">
                            <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                                Proof
                            </div>

                            {!hasProof ? (
                                <div className="rounded-lg border border-dashed bg-muted/20 p-4 text-sm text-muted-foreground text-center">
                                    No proof file attached.
                                </div>
                            ) : proofIsImage ? (
                                <button
                                    onClick={() => setFullscreen(true)}
                                    className="group relative w-full overflow-hidden rounded-lg border bg-muted/20 hover:border-border transition-colors"
                                    aria-label="View proof fullscreen"
                                >
                                    <img
                                        src={row.proofUrl!}
                                        alt="Proof"
                                        className="w-full max-h-56 object-contain"
                                    />
                                    <div className="absolute inset-0 flex items-center justify-center bg-black/0 group-hover:bg-black/40 transition-colors rounded-lg">
                                        <ZoomIn className="h-6 w-6 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                                    </div>
                                </button>
                            ) : (
                                <div className="relative w-full overflow-hidden rounded-lg border bg-muted/20">
                                    <iframe
                                        src={row.proofUrl!}
                                        className="w-full h-64"
                                        title="Proof PDF preview"
                                    />
                                    <button
                                        onClick={() => setFullscreen(true)}
                                        className="absolute top-2 right-2 z-10 rounded-md bg-black/50 hover:bg-black/70 transition-colors p-1.5 text-white"
                                        aria-label="Expand PDF"
                                    >
                                        <ZoomIn className="h-4 w-4" />
                                    </button>
                                </div>
                            )}
                        </div>

                        <Separator />

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
                    </div>

                    {/* ── Footer actions — sticky at bottom ── */}
                    <div className="sticky bottom-0 bg-background border-t border-border/60 px-5 py-4 flex flex-wrap gap-2">
                        <Button
                            onClick={() => void onApprove(row.attendanceId)}
                            disabled={isLoading}
                            className="gap-2 flex-1"
                        >
                            {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
                            Approve
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={() => void onReject(row.attendanceId)}
                            disabled={isLoading}
                            className="gap-2 flex-1"
                        >
                            {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
                            Reject
                        </Button>
                    </div>
                </SheetContent>
            </Sheet>

            {/* ── Fullscreen overlay ── */}
            <AnimatePresence>
                {fullscreen && row.proofUrl && (
                    <FullscreenOverlay
                        url={row.proofUrl}
                        onClose={() => setFullscreen(false)}
                    />
                )}
            </AnimatePresence>
        </>
    );
}