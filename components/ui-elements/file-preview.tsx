"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { Upload, FileText, ZoomIn, X, Loader2 } from "lucide-react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";

// ─────────────────────────────────────────────────────────────────────────────
// PdfThumbnail (internal)
// Renders the first page of a PDF File object onto a <canvas> via PDF.js.
// ─────────────────────────────────────────────────────────────────────────────

function PdfThumbnail({
    file,
    onFullscreen,
}: {
    file: File;
    onFullscreen: () => void;
}) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);

    useEffect(() => {
        let cancelled = false;
        setLoading(true);
        setError(false);

        (async () => {
            try {
                if (typeof window === "undefined") return;

                const pdfjsLib = await import("pdfjs-dist");
                pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
                    "pdfjs-dist/build/pdf.worker.mjs",
                    import.meta.url,
                ).toString();

                const arrayBuffer = await file.arrayBuffer();
                const pdf = await pdfjsLib.getDocument({ data: arrayBuffer })
                    .promise;
                if (cancelled) return;

                const page = await pdf.getPage(1);
                if (cancelled) return;

                const canvas = canvasRef.current;
                if (!canvas) return;

                const viewport = page.getViewport({ scale: 1 });
                const scale = Math.min(400 / viewport.width, 2);
                const scaled = page.getViewport({ scale });

                canvas.width = scaled.width;
                canvas.height = scaled.height;

                const ctx = canvas.getContext("2d");
                if (!ctx) return;

                await page.render({
                    canvas: canvas,
                    canvasContext: ctx,
                    viewport: scaled,
                }).promise;

                if (!cancelled) setLoading(false);
            } catch (err) {
                console.error("PDF render error:", err);
                if (!cancelled) {
                    setLoading(false);
                    setError(true);
                }
            }
        })();

        return () => {
            cancelled = true;
        };
    }, [file]);

    if (error) {
        return (
            <div className="flex items-center gap-2 rounded-lg border bg-muted/20 p-4">
                <FileText className="h-8 w-8 text-teal-400 shrink-0" />
                <div>
                    <div className="text-sm font-medium">{file.name}</div>
                    <div className="text-xs text-muted-foreground">
                        PDF document
                    </div>
                </div>
            </div>
        );
    }

    return (
        <button
            type="button"
            onClick={onFullscreen}
            className="group relative w-full overflow-hidden rounded-lg border bg-muted/20 hover:border-border transition-colors"
            aria-label="View fullscreen"
        >
            {loading && (
                <div className="flex items-center justify-center h-40">
                    <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                </div>
            )}
            <canvas
                ref={canvasRef}
                className={`w-full block ${loading ? "hidden" : ""}`}
            />
            <div className="absolute inset-0 flex items-center justify-center bg-black/0 group-hover:bg-black/40 transition-colors rounded-lg">
                <ZoomIn className="h-6 w-6 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
        </button>
    );
}

// ─────────────────────────────────────────────────────────────────────────────
// FileDropzone
//
// A drag-and-drop file input that shows an inline preview (image or PDF
// thumbnail) once a file is selected. Calls onFullscreen so the parent can
// open <FileFullscreenPreview /> with the chosen file.
//
// Props:
//   file         – currently selected File (or null)
//   onFile       – called when user picks/drops a file, or clears one (null)
//   onFullscreen – called with the File when user clicks the inline preview
//   label        – section heading above the dropzone (default: "Attachment")
//   required     – shows a red asterisk next to the label
//   accept       – file-input accept string (default: ".pdf,.jpg,.jpeg,.png")
//   hint         – small text shown inside the empty dropzone
// ─────────────────────────────────────────────────────────────────────────────

export interface FileDropzoneProps {
    file: File | null;
    onFile: (f: File | null) => void;
    onFullscreen: (f: File) => void;
    label?: string;
    required?: boolean;
    accept?: string;
    hint?: string;
}

export function FileDropzone({
    file,
    onFile,
    onFullscreen,
    label = "Attachment",
    required = false,
    accept = ".pdf,.jpg,.jpeg,.png",
    hint = "PDF, JPG, PNG accepted",
}: FileDropzoneProps) {
    const inputRef = useRef<HTMLInputElement>(null);
    const [dragging, setDragging] = useState(false);

    const onDrop = useCallback(
        (e: React.DragEvent) => {
            e.preventDefault();
            setDragging(false);
            const f = e.dataTransfer.files[0];
            if (f) onFile(f);
        },
        [onFile],
    );

    const previewUrl = file ? URL.createObjectURL(file) : null;
    const isImage = file?.type.startsWith("image/");
    const isPdf = file?.type === "application/pdf";

    return (
        <div className="space-y-2 min-w-0 w-full overflow-hidden">
            {/* Label */}
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                {label}
                {required && <span className="text-rose-400 ml-1">*</span>}
            </p>

            {/* Dropzone — shown when no file is selected */}
            {!file && (
                <div
                    onDragOver={(e) => {
                        e.preventDefault();
                        setDragging(true);
                    }}
                    onDragLeave={() => setDragging(false)}
                    onDrop={onDrop}
                    onClick={() => inputRef.current?.click()}
                    className={`cursor-pointer rounded-lg border-2 border-dashed p-5 text-center transition-colors
                        ${
                            dragging
                                ? "border-teal-500 bg-teal-500/5"
                                : "border-border hover:border-muted-foreground/50"
                        }`}
                >
                    <input
                        ref={inputRef}
                        type="file"
                        accept={accept}
                        className="hidden"
                        onChange={(e) => onFile(e.target.files?.[0] ?? null)}
                    />
                    <div className="space-y-1">
                        <Upload className="mx-auto h-6 w-6 text-muted-foreground" />
                        <p className="text-sm text-muted-foreground">
                            Drop your file here or{" "}
                            <span className="text-teal-400 underline">
                                browse
                            </span>
                        </p>
                        <p className="text-[11px] text-muted-foreground/60">
                            {hint}
                        </p>
                    </div>
                </div>
            )}

            {/* Preview — shown once a file is selected */}
            {file && previewUrl && (
                <div className="space-y-2 min-w-0 overflow-hidden">
                    {/* Image thumbnail */}
                    {isImage && (
                        <button
                            type="button"
                            onClick={(e) => {
                                e.stopPropagation();
                                onFullscreen(file);
                            }}
                            className="group relative w-full overflow-hidden rounded-lg border bg-muted/20 hover:border-border transition-colors"
                            aria-label="View fullscreen"
                        >
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                                src={previewUrl}
                                alt="Preview"
                                className="w-full max-h-64 object-contain block"
                            />
                            <div className="absolute inset-0 flex items-center justify-center bg-black/0 group-hover:bg-black/40 transition-colors rounded-lg">
                                <ZoomIn className="h-6 w-6 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                            </div>
                        </button>
                    )}

                    {/* PDF first-page thumbnail */}
                    {isPdf && (
                        <PdfThumbnail
                            file={file}
                            onFullscreen={() => onFullscreen(file)}
                        />
                    )}

                    {/* Generic file fallback */}
                    {!isImage && !isPdf && (
                        <div className="flex items-center gap-2 rounded-lg border p-3">
                            <FileText className="h-4 w-4 text-teal-400 shrink-0" />
                            <span className="truncate text-sm text-foreground">
                                {file.name}
                            </span>
                        </div>
                    )}

                    {/* File meta + remove button */}
                    <div className="flex items-center justify-between gap-3">
                        <div className="min-w-0">
                            <div className="truncate text-sm font-medium">
                                {file.name}
                            </div>
                            <div className="text-xs text-muted-foreground">
                                {file.type || "file"} •{" "}
                                {(file.size / 1024).toFixed(0)} KB
                            </div>
                        </div>
                        <button
                            type="button"
                            onClick={() => onFile(null)}
                            className="shrink-0 rounded-md border border-border p-1.5 text-muted-foreground hover:text-foreground hover:bg-muted/30 transition-colors"
                            aria-label="Remove file"
                        >
                            <X className="h-3.5 w-3.5" />
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}

// ─────────────────────────────────────────────────────────────────────────────
// FileFullscreenPreview
//
// A full-screen Dialog that shows an image or PDF (via iframe) based on the
// file's MIME type. Pair this with FileDropzone by sharing a single
// `useState<File | null>` for the open/close state.
//
// Usage:
//   const [previewFile, setPreviewFile] = useState<File | null>(null);
//
//   <FileDropzone
//     file={file}
//     onFile={setFile}
//     onFullscreen={setPreviewFile}
//   />
//   <FileFullscreenPreview
//     file={previewFile}
//     onClose={() => setPreviewFile(null)}
//   />
// ─────────────────────────────────────────────────────────────────────────────

export interface FileFullscreenPreviewProps {
    file: File | null;
    onClose: () => void;
}

export function FileFullscreenPreview({
    file,
    onClose,
}: FileFullscreenPreviewProps) {
    const isImage = file?.type.startsWith("image/");

    return (
        <Dialog
            open={!!file}
            onOpenChange={(open) => {
                if (!open) onClose();
            }}
        >
            <DialogContent className="max-w-screen w-screen h-screen p-0 border-0 bg-black/90 flex items-center justify-center rounded-none [&>button.absolute]:hidden">
                <DialogTitle className="sr-only">File Preview</DialogTitle>

                {file && isImage && (
                    <div className="relative inline-block">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                            src={URL.createObjectURL(file)}
                            alt="Fullscreen preview"
                            className="max-h-[90vh] max-w-[90vw] w-auto h-auto object-contain rounded-lg shadow-2xl block"
                        />
                        <button
                            onClick={onClose}
                            className="absolute top-2 right-2 z-10 rounded-md bg-black/50 hover:bg-black/70 transition-colors p-1.5 text-white"
                            aria-label="Close fullscreen"
                        >
                            <X className="h-4 w-4" />
                        </button>
                    </div>
                )}

                {file && !isImage && (
                    <div className="relative inline-block">
                        <iframe
                            src={URL.createObjectURL(file)}
                            className="w-[90vw] h-[90vh] rounded-lg bg-white"
                            title="Fullscreen preview"
                        />
                        <button
                            onClick={onClose}
                            className="absolute top-2 right-2 z-10 rounded-md bg-black/50 hover:bg-black/70 transition-colors p-1.5 text-white"
                            aria-label="Close fullscreen"
                        >
                            <X className="h-4 w-4" />
                        </button>
                    </div>
                )}
            </DialogContent>
        </Dialog>
    );
}
