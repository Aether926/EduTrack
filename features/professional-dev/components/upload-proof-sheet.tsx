"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useUploadProof } from "@/features/professional-dev/hooks/use-upload-proof";
import { useIsMobile } from "@/hooks/use-mobile";

import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetDescription,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import {
    TypeBadge,
    LevelBadge,
    StatusBadge,
} from "@/components/ui-elements/badges";
import {
    FileDropzone,
    FileFullscreenPreview,
} from "@/components/ui-elements/file-preview";
import { Separator } from "@/components/ui/separator";
import { X, Loader2, CalendarDays, Clock } from "lucide-react";

function fmtDate(d: string | null | undefined) {
    if (!d) return "—";
    try {
        return new Date(d).toISOString().slice(0, 10);
    } catch {
        return String(d);
    }
}

export type UploadProofContext = {
    attendanceId: string;
    status: string;
    training: {
        title: string;
        type: string;
        level: string;
        totalHours: number;
        startDate: string | null;
        endDate: string | null;
    };
};

interface UploadProofSheetProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    ctx: UploadProofContext | null;
}

export default function UploadProofSheet({
    open,
    onOpenChange,
    ctx,
}: UploadProofSheetProps) {
    const isMobile = useIsMobile();
    const router = useRouter();
    const [fullscreenFile, setFullscreenFile] = useState<File | null>(null);

    const attendanceId = ctx?.attendanceId ?? "";
    const { file, setFile, loading, submit } = useUploadProof(attendanceId);

    const onSubmit = async () => {
        try {
            await submit();
            setFile(null);
            onOpenChange(false);
            router.refresh();
        } catch {
            // hook handles toast/error
        }
    };

    const handleClose = () => {
        if (loading) return;
        setFile(null);
        setFullscreenFile(null);
        onOpenChange(false);
    };

    if (!ctx) return null;

    const subtitle = `${ctx.training.type} • ${ctx.training.level} • ${ctx.training.totalHours} hrs`;
    const dates = `${fmtDate(ctx.training.startDate)} → ${fmtDate(ctx.training.endDate)}`;

    return (
        <>
            <Sheet open={open} onOpenChange={handleClose}>
                <SheetContent
                    side={isMobile ? "bottom" : "right"}
                    className={[
                        "flex flex-col gap-0 p-0 overflow-y-auto",
                        isMobile
                            ? "h-auto max-h-[92vh] rounded-t-2xl data-[state=closed]:animate-out data-[state=closed]:slide-out-to-bottom data-[state=closed]:duration-300"
                            : "w-[480px] sm:w-[520px] data-[state=closed]:animate-out data-[state=closed]:slide-out-to-right data-[state=closed]:duration-300",
                    ].join(" ")}
                >
                    {/* ── Header ── */}
                    <SheetHeader className="px-5 py-4 border-b border-border/60 sticky top-0 bg-background z-10">
                        <div className="flex items-start justify-between gap-3">
                            <div className="space-y-1 min-w-0">
                                <div className="flex flex-wrap items-center gap-2">
                                    <TypeBadge
                                        type={ctx.training.type}
                                        size="xs"
                                    />
                                    <LevelBadge
                                        level={ctx.training.level}
                                        size="xs"
                                    />
                                </div>
                                <SheetTitle className="text-base leading-snug truncate">
                                    {ctx.training.title}
                                </SheetTitle>
                                <SheetDescription className="text-xs">
                                    {subtitle}
                                </SheetDescription>
                            </div>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="shrink-0 h-7 w-7"
                                onClick={handleClose}
                                disabled={loading}
                                aria-label="Close"
                            >
                                <X className="h-4 w-4" />
                            </Button>
                        </div>
                    </SheetHeader>

                    {/* ── Body ── */}
                    <div className="flex-1 px-5 py-4 space-y-4">
                        {/* Training meta */}
                        <div className="grid gap-3 grid-cols-2">
                            <div className="flex items-start gap-2 text-sm">
                                <CalendarDays className="h-4 w-4 mt-0.5 text-muted-foreground shrink-0" />
                                <div className="min-w-0">
                                    <div className="text-xs text-muted-foreground">
                                        Schedule
                                    </div>
                                    <div className="font-mono text-xs truncate">
                                        {dates}
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-start gap-2 text-sm">
                                <Clock className="h-4 w-4 mt-0.5 text-muted-foreground shrink-0" />
                                <div className="min-w-0">
                                    <div className="text-xs text-muted-foreground">
                                        Status
                                    </div>
                                    <div className="text-xs font-medium">
                                        <StatusBadge
                                            status={ctx.status.toLowerCase()}
                                            size="xs"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {ctx.status === "REJECTED" && (
                            <div className="rounded-lg border border-rose-500/30 bg-rose-500/5 px-3 py-2 text-xs text-rose-400">
                                Your previous submission was rejected. Upload a
                                new proof and resubmit.
                            </div>
                        )}

                        <Separator />

                        {/* Upload label */}
                        <div className="space-y-1">
                            <div className="flex items-center justify-between">
                                <div className="text-sm font-medium">
                                    Select file
                                </div>
                                {file ? (
                                    <StatusBadge status="submitted" size="xs" />
                                ) : (
                                    <StatusBadge status="draft" size="xs" />
                                )}
                            </div>
                        </div>

                        <FileDropzone
                            file={file}
                            onFile={setFile}
                            onFullscreen={setFullscreenFile}
                            label="Proof of Attendance"
                            required
                            hint="PDF, JPG, PNG — max 5 MB"
                        />
                    </div>

                    {/* ── Footer — sticky at bottom ── */}
                    <div className="sticky bottom-0 bg-background border-t border-border/60 px-5 py-3 flex gap-2">
                        <Button
                            type="button"
                            variant="secondary"
                            onClick={handleClose}
                            disabled={loading}
                            className="flex-1"
                        >
                            Cancel
                        </Button>
                        <Button
                            type="button"
                            onClick={onSubmit}
                            disabled={loading || !file}
                            className="flex-1 gap-2"
                        >
                            {loading && (
                                <Loader2 className="h-4 w-4 animate-spin" />
                            )}
                            {loading ? "Uploading..." : "Submit"}
                        </Button>
                    </div>
                </SheetContent>
            </Sheet>

            {/* ── Fullscreen preview ── */}
            <FileFullscreenPreview
                file={fullscreenFile}
                onClose={() => setFullscreenFile(null)}
            />
        </>
    );
}
