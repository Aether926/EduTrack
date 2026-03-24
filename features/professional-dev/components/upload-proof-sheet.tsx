/* eslint-disable @next/next/no-img-element */
"use client";

import * as React from "react";
import { useRef, useState } from "react";
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
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Upload, X, Loader2, CalendarDays, Clock, ZoomIn } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";

function formatBytes(bytes: number) {
    if (!Number.isFinite(bytes)) return "";
    const sizes = ["B", "KB", "MB", "GB"];
    let i = 0;
    let v = bytes;
    while (v >= 1024 && i < sizes.length - 1) {
        v /= 1024;
        i++;
    }
    return `${v.toFixed(i === 0 ? 0 : 1)} ${sizes[i]}`;
}

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
    const [fullscreen, setFullscreen] = useState(false);

    const attendanceId = ctx?.attendanceId ?? "";
    const { file, setFile, loading, submit } = useUploadProof(attendanceId);

    const inputRef = useRef<HTMLInputElement | null>(null);
    const [dragActive, setDragActive] = useState(false);

    const allowed = ["image/jpeg", "image/png", "application/pdf"];
    const maxMb = 5;

    const pickFile = () => inputRef.current?.click();

    const onDrop = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);
        const f = e.dataTransfer.files?.[0];
        if (!f) return;
        setFile(f);
    };

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
        setFullscreen(false);
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
                                    <Badge variant="secondary">TEACHER</Badge>
                                    <Badge variant="outline">
                                        Upload Proof
                                    </Badge>
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
                                        {ctx.status}
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
                                    <Badge variant="secondary">
                                        File selected
                                    </Badge>
                                ) : (
                                    <Badge variant="outline">No file</Badge>
                                )}
                            </div>
                            <div className="text-xs text-muted-foreground">
                                Allowed: {allowed.join(", ")} • Max {maxMb}MB
                            </div>
                        </div>

                        {/* Hidden file input */}
                        <input
                            ref={inputRef}
                            type="file"
                            accept={allowed.join(",")}
                            className="hidden"
                            onChange={(e) =>
                                setFile(e.target.files?.[0] ?? null)
                            }
                        />

                        {/* Dropzone — only when no file selected */}
                        {!file && (
                            <div
                                role="button"
                                tabIndex={0}
                                onKeyDown={(e) => {
                                    if (e.key === "Enter" || e.key === " ")
                                        pickFile();
                                }}
                                onClick={pickFile}
                                onDragEnter={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    setDragActive(true);
                                }}
                                onDragOver={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    setDragActive(true);
                                }}
                                onDragLeave={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    setDragActive(false);
                                }}
                                onDrop={onDrop}
                                className={[
                                    "rounded-lg border border-dashed p-8 text-center",
                                    "cursor-pointer select-none transition-colors",
                                    "bg-muted/10 hover:bg-muted/20",
                                    dragActive
                                        ? "border-primary/60 bg-muted/30"
                                        : "border-border/70",
                                ].join(" ")}
                            >
                                <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-md bg-muted/30">
                                    <Upload className="h-5 w-5 text-muted-foreground" />
                                </div>
                                <div className="text-sm font-medium">
                                    Click to select file
                                </div>
                                <div className="mt-1 text-xs text-muted-foreground">
                                    or drag and drop here
                                </div>
                            </div>
                        )}

                        {/* Preview — only when file is selected */}
                        {file && (
                            <div className="space-y-2">
                                {/* Image preview */}
                                {file.type.startsWith("image/") && (
                                    <button
                                        type="button"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setFullscreen(true);
                                        }}
                                        className="group relative w-full overflow-hidden rounded-lg border bg-muted/20 hover:border-border transition-colors"
                                        aria-label="View fullscreen"
                                    >
                                        <img
                                            src={URL.createObjectURL(file)}
                                            alt="Preview"
                                            className="w-full h-auto max-h-72 object-contain block"
                                        />
                                        <div className="absolute inset-0 flex items-center justify-center bg-black/0 group-hover:bg-black/40 transition-colors rounded-lg">
                                            <ZoomIn className="h-6 w-6 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                                        </div>
                                    </button>
                                )}

                                {/* PDF preview */}
                                {file.type === "application/pdf" && (
                                    <div className="relative rounded-lg border overflow-hidden bg-muted/20">
                                        <iframe
                                            src={URL.createObjectURL(file)}
                                            className="w-full h-48"
                                            title="PDF preview"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setFullscreen(true)}
                                            className="absolute top-2 right-2 z-10 rounded-md bg-black/50 hover:bg-black/70 transition-colors p-1.5 text-white"
                                            aria-label="Expand"
                                        >
                                            <ZoomIn className="h-4 w-4" />
                                        </button>
                                    </div>
                                )}

                                {/* File info + remove */}
                                <div className="flex items-start justify-between gap-3">
                                    <div className="min-w-0">
                                        <div className="truncate text-sm font-medium">
                                            {file.name}
                                        </div>
                                        <div className="text-xs text-muted-foreground">
                                            {file.type || "file"} •{" "}
                                            {formatBytes(file.size)}
                                        </div>
                                    </div>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="icon"
                                        onClick={() => setFile(null)}
                                        disabled={loading}
                                        aria-label="Remove file"
                                    >
                                        <X className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>
                        )}
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
            <Dialog
                open={fullscreen && !!file}
                onOpenChange={(open) => {
                    if (!open) setFullscreen(false);
                }}
            >
                <DialogContent className="max-w-screen w-screen h-screen p-0 border-0 bg-black/90 flex items-center justify-center rounded-none [&>button.absolute]:hidden">
                    <DialogTitle className="sr-only">Image Preview</DialogTitle>
                    {file?.type.startsWith("image/") ? (
                        <div className="relative inline-block">
                            <img
                                src={file ? URL.createObjectURL(file) : ""}
                                alt="Fullscreen preview"
                                className="max-h-[90vh] max-w-[90vw] w-auto h-auto object-contain rounded-lg shadow-2xl block"
                            />
                            <button
                                onClick={() => setFullscreen(false)}
                                className="absolute top-2 right-2 z-10 rounded-md bg-black/50 hover:bg-black/70 transition-colors p-1.5 text-white"
                                aria-label="Close fullscreen"
                            >
                                <X className="h-4 w-4" />
                            </button>
                        </div>
                    ) : file ? (
                        <div className="relative inline-block">
                            <iframe
                                src={URL.createObjectURL(file)}
                                className="w-[90vw] h-[90vh] rounded-lg bg-white"
                                title="Fullscreen preview"
                            />
                            <button
                                onClick={() => setFullscreen(false)}
                                className="absolute top-2 right-2 z-10 rounded-md bg-black/50 hover:bg-black/70 transition-colors p-1.5 text-white"
                                aria-label="Close fullscreen"
                            >
                                <X className="h-4 w-4" />
                            </button>
                        </div>
                    ) : null}
                </DialogContent>
            </Dialog>
        </>
    );
}
