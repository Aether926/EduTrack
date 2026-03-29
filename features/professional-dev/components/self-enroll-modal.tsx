/* eslint-disable react/no-unescaped-entities */
"use client";

import { useState, useCallback, useTransition, useRef, useEffect } from "react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import {
    Search,
    X,
    Plus,
    Upload,
    Loader2,
    ChevronLeft,
    ChevronRight,
    Clock,
    BookOpen,
    ArrowLeft,
    FileText,
    ZoomIn,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";

import { TypeBadge, LevelBadge } from "@/components/ui-elements/badges";

import PdFormModal, {
    type FormData as PdFormData,
} from "@/app/(main)/add-training-seminar/component/pd-form-modal";

import {
    getBrowsableTrainings,
    selfEnrollExistingTraining,
    teacherSelfReportTraining,
} from "@/features/professional-dev/actions/teacher-training-actions";
import { toLocalDateString } from "@/util/date";

// ── Types ─────────────────────────────────────────────────────────────────────

type BrowsableTraining = {
    id: string;
    title: string;
    type: string;
    level: string;
    sponsoring_agency: string;
    total_hours: number;
    start_date: string;
    end_date: string | null;
    source: string;
};

type View = "browse" | "upload" | "create";

// ── Helpers ───────────────────────────────────────────────────────────────────

// ── PDF first-page thumbnail via PDF.js ────────────────────────────────────────

function PdfThumbnail({
    file,
    onFullscreen,
}: {
    file: File;
    previewUrl: string;
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
                // Scale to fit container width (~400px max)
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
        // Fallback: show file icon if canvas render fails
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

// ── File drop zone ─────────────────────────────────────────────────────────────

function ProofUpload({
    file,
    onFile,
    onFullscreen,
}: {
    file: File | null;
    onFile: (f: File | null) => void;
    onFullscreen: (f: File) => void;
}) {
    const ref = useRef<HTMLInputElement>(null);
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
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Proof of Attendance <span className="text-rose-400">*</span>
            </p>

            {/* Dropzone — only when no file */}
            {!file && (
                <div
                    onDragOver={(e) => {
                        e.preventDefault();
                        setDragging(true);
                    }}
                    onDragLeave={() => setDragging(false)}
                    onDrop={onDrop}
                    onClick={() => ref.current?.click()}
                    className={`cursor-pointer rounded-lg border-2 border-dashed p-5 text-center transition-colors
            ${dragging ? "border-teal-500 bg-teal-500/5" : "border-border hover:border-muted-foreground/50"}`}
                >
                    <input
                        ref={ref}
                        type="file"
                        accept=".pdf,.jpg,.jpeg,.png"
                        className="hidden"
                        onChange={(e) => onFile(e.target.files?.[0] ?? null)}
                    />
                    <div className="space-y-1">
                        <Upload className="mx-auto h-6 w-6 text-muted-foreground" />
                        <p className="text-sm text-muted-foreground">
                            Drop your proof here or{" "}
                            <span className="text-teal-400 underline">
                                browse
                            </span>
                        </p>
                        <p className="text-[11px] text-muted-foreground/60">
                            PDF, JPG, PNG accepted
                        </p>
                    </div>
                </div>
            )}

            {/* Preview — when file is selected */}
            {file && previewUrl && (
                <div className="space-y-2 min-w-0 overflow-hidden">
                    {/* Image preview */}
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

                    {/* PDF preview — first page thumbnail via PDF.js */}
                    {isPdf && (
                        <PdfThumbnail
                            file={file}
                            previewUrl={previewUrl}
                            onFullscreen={() => onFullscreen(file)}
                        />
                    )}

                    {/* Non-previewable file (shouldn't happen with accept filter, but fallback) */}
                    {!isImage && !isPdf && (
                        <div className="flex items-center gap-2 rounded-lg border p-3">
                            <FileText className="h-4 w-4 text-teal-400 shrink-0" />
                            <span className="truncate text-sm text-foreground">
                                {file.name}
                            </span>
                        </div>
                    )}

                    {/* File info + remove */}
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

// ── Main modal ────────────────────────────────────────────────────────────────

const DEFAULT_FORM: PdFormData = {
    title: "",
    type: "TRAINING",
    level: "REGIONAL",
    sponsoring_agency: "",
    total_hours: "",
    start_date: undefined,
    end_date: undefined,
    venue: "",
    description: "",
};

interface SelfEnrollModalProps {
    open: boolean;
    onOpenChange: (v: boolean) => void;
    onSuccess: () => void;
}

export default function SelfEnrollModal({
    open,
    onOpenChange,
    onSuccess,
}: SelfEnrollModalProps) {
    // view state
    const [view, setView] = useState<View>("browse");
    const [selected, setSelected] = useState<BrowsableTraining | null>(null);

    // browse state
    const [search, setSearch] = useState("");
    const [page, setPage] = useState(1);
    const [results, setResults] = useState<BrowsableTraining[]>([]);
    const [totalCount, setTotalCount] = useState(0);
    const [loadingBrowse, setLoadingBrowse] = useState(false);
    const [searched, setSearched] = useState(false);

    // upload state (for self-enroll existing)
    const [enrollProof, setEnrollProof] = useState<File | null>(null);

    // create form state
    const [formData, setFormData] = useState<PdFormData>(DEFAULT_FORM);
    const [createProof, setCreateProof] = useState<File | null>(null);
    const [showCreateModal, setShowCreateModal] = useState(false);

    const [fullscreenFile, setFullscreenFile] = useState<File | null>(null);
    const [isPending, startTransition] = useTransition();

    const PAGE_SIZE = 8;
    const pageCount = Math.ceil(totalCount / PAGE_SIZE);

    // ── Search ──────────────────────────────────────────────────────────────────

    async function doSearch(q: string, p: number) {
        setLoadingBrowse(true);
        setSearched(true);
        try {
            const res = await getBrowsableTrainings(q, p, PAGE_SIZE);
            setResults(res.data);
            setTotalCount(res.count);
            setPage(p);
        } finally {
            setLoadingBrowse(false);
        }
    }

    function handleSearchSubmit(e: React.FormEvent) {
        e.preventDefault();
        doSearch(search, 1);
    }

    // ── Select existing training → go to upload view ────────────────────────────

    function handleSelectTraining(t: BrowsableTraining) {
        setSelected(t);
        setEnrollProof(null);
        setView("upload");
    }

    // ── Submit self-enroll existing ─────────────────────────────────────────────

    function handleEnrollSubmit() {
        if (!selected) return;
        if (!enrollProof) {
            toast.error("Please upload your proof of attendance.");
            return;
        }
        startTransition(async () => {
            const fd = new FormData();
            fd.append("proof", enrollProof);
            const res = await selfEnrollExistingTraining(selected.id, fd);
            if (!res.success) {
                toast.error(res.error);
                return;
            }
            toast.success("Proof submitted! Waiting for admin review.");
            handleClose();
            onSuccess();
        });
    }

    function handleCreateSubmit(e: React.FormEvent) {
        e.preventDefault();
        if (!createProof) {
            toast.error("Please upload your proof of attendance.");
            return;
        }
        if (!formData.start_date) {
            toast.error("Start date is required.");
            return;
        }

        startTransition(async () => {
            const fd = new FormData();
            fd.append("proof", createProof);
            const res = await teacherSelfReportTraining(
                {
                    title: formData.title,
                    type: formData.type,
                    level: formData.level,
                    sponsoring_agency: formData.sponsoring_agency,
                    total_hours: Number(formData.total_hours),
                    start_date: toLocalDateString(formData.start_date!),
                    end_date: formData.end_date
                        ? toLocalDateString(formData.end_date)
                        : undefined,
                    venue: formData.venue || undefined,
                    description: formData.description || undefined,
                },
                fd,
            );

            if (!res.success) {
                // if duplicate found, suggest enrolling instead
                if (res.existingId) {
                    toast.error(res.error, { duration: 6000 });
                    // switch to browse so they can find it
                    setView("browse");
                    setShowCreateModal(false);
                    return;
                }
                toast.error(res.error);
                return;
            }

            toast.success("Training submitted! Waiting for admin review.");
            handleClose();
            onSuccess();
        });
    }

    // ── Reset + close ───────────────────────────────────────────────────────────

    function handleClose() {
        onOpenChange(false);
        setTimeout(() => {
            setView("browse");
            setSelected(null);
            setSearch("");
            setResults([]);
            setTotalCount(0);
            setSearched(false);
            setEnrollProof(null);
            setCreateProof(null);
            setFormData(DEFAULT_FORM);
            setShowCreateModal(false);
            setFullscreenFile(null);
        }, 300);
    }

    // ── Render ──────────────────────────────────────────────────────────────────

    return (
        <>
            <Dialog open={open} onOpenChange={handleClose}>
                <DialogContent className="max-w-2xl w-[calc(100vw-2rem)] max-h-[90vh] overflow-hidden p-0 gap-0 flex flex-col">
                    <div className="px-6 pt-6 pb-4 border-b border-border/60 bg-gradient-to-br from-card to-background">
                        <DialogHeader>
                            <div className="flex items-center gap-2 mb-2">
                                <div className="rounded-lg border border-teal-500/20 bg-teal-500/10 p-2">
                                    <BookOpen className="h-4 w-4 text-teal-400" />
                                </div>
                                <span className="inline-block rounded-full border border-teal-500/30 bg-teal-500/10 px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wider text-teal-400">
                                    Self-Report
                                </span>
                            </div>
                            <DialogTitle className="text-lg font-semibold tracking-tight">
                                {view === "browse" &&
                                    "Find a Training or Seminar"}
                                {view === "upload" && (
                                    <button
                                        onClick={() => setView("browse")}
                                        className="flex items-center gap-1.5 text-base hover:text-teal-400 transition-colors"
                                    >
                                        <ArrowLeft className="h-4 w-4" />
                                        Back to Search
                                    </button>
                                )}
                                {view === "create" && "Add New Training"}
                            </DialogTitle>
                            {view === "browse" && (
                                <p className="text-sm text-muted-foreground mt-0.5">
                                    Search for a training you attended. If not
                                    found, add it manually.
                                </p>
                            )}
                        </DialogHeader>
                    </div>

                    {/* ── BROWSE VIEW ── */}
                    <div
                        className="flex-1 overflow-y-auto min-h-0"
                        style={{
                            scrollbarWidth: "thin",
                            scrollbarColor: "hsl(var(--border)) transparent",
                        }}
                    >
                        <AnimatePresence mode="wait">
                            {view === "browse" && (
                                <motion.div
                                    key="browse"
                                    initial={{ opacity: 0, y: 8 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -8 }}
                                    transition={{ duration: 0.15 }}
                                    className="px-6 py-5 space-y-4"
                                >
                                    {/* Search bar */}
                                    <form
                                        onSubmit={handleSearchSubmit}
                                        className="flex gap-2"
                                    >
                                        <div className="relative flex-1">
                                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                            <Input
                                                value={search}
                                                onChange={(e) =>
                                                    setSearch(e.target.value)
                                                }
                                                placeholder="Search by title, sponsor, level..."
                                                className="pl-9"
                                            />
                                        </div>
                                        <Button
                                            type="submit"
                                            disabled={loadingBrowse}
                                            className="gap-2"
                                        >
                                            {loadingBrowse ? (
                                                <Loader2 className="h-4 w-4 animate-spin" />
                                            ) : (
                                                <Search className="h-4 w-4" />
                                            )}
                                            Search
                                        </Button>
                                    </form>

                                    {/* Results — desktop table */}
                                    {searched && (
                                        <>
                                            {loadingBrowse ? (
                                                <div className="flex items-center justify-center py-12">
                                                    <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                                                </div>
                                            ) : results.length === 0 ? (
                                                <div className="rounded-lg border border-dashed py-10 text-center text-muted-foreground text-sm">
                                                    No trainings found matching
                                                    your search.
                                                </div>
                                            ) : (
                                                <>
                                                    {/* Desktop table */}
                                                    <div
                                                        className="hidden md:block rounded-md border overflow-x-auto w-full"
                                                        style={{
                                                            scrollbarWidth:
                                                                "thin",
                                                            scrollbarColor:
                                                                "hsl(var(--border)) transparent",
                                                        }}
                                                    >
                                                        <Table>
                                                            <TableHeader>
                                                                <TableRow>
                                                                    <TableHead>
                                                                        Type
                                                                    </TableHead>
                                                                    <TableHead>
                                                                        Title
                                                                    </TableHead>
                                                                    <TableHead>
                                                                        Level
                                                                    </TableHead>
                                                                    <TableHead>
                                                                        Date
                                                                    </TableHead>
                                                                    <TableHead>
                                                                        Hours
                                                                    </TableHead>
                                                                    <TableHead />
                                                                </TableRow>
                                                            </TableHeader>
                                                            <TableBody>
                                                                {results.map(
                                                                    (t) => (
                                                                        <TableRow
                                                                            key={
                                                                                t.id
                                                                            }
                                                                            className="cursor-pointer hover:bg-accent/50"
                                                                            onClick={() =>
                                                                                handleSelectTraining(
                                                                                    t,
                                                                                )
                                                                            }
                                                                        >
                                                                            <TableCell>
                                                                                <TypeBadge
                                                                                    type={
                                                                                        t.type
                                                                                    }
                                                                                    size="xs"
                                                                                />
                                                                            </TableCell>
                                                                            <TableCell>
                                                                                <div className="font-medium text-sm">
                                                                                    {
                                                                                        t.title
                                                                                    }
                                                                                </div>
                                                                                <div className="text-xs text-muted-foreground">
                                                                                    {
                                                                                        t.sponsoring_agency
                                                                                    }
                                                                                </div>
                                                                                {t.source ===
                                                                                    "SELF_REPORTED" && (
                                                                                    <span className="text-[10px] text-amber-400 border border-amber-500/30 bg-amber-500/10 rounded-full px-1.5 py-0.5">
                                                                                        Self-reported
                                                                                    </span>
                                                                                )}
                                                                            </TableCell>
                                                                            <TableCell>
                                                                                <LevelBadge
                                                                                    level={
                                                                                        t.level
                                                                                    }
                                                                                    size="xs"
                                                                                />
                                                                            </TableCell>
                                                                            <TableCell className="font-mono text-xs text-muted-foreground whitespace-nowrap">
                                                                                {
                                                                                    t.start_date
                                                                                }
                                                                            </TableCell>
                                                                            <TableCell>
                                                                                <div className="flex items-center gap-1 text-sm">
                                                                                    <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                                                                                    {
                                                                                        t.total_hours
                                                                                    }

                                                                                    h
                                                                                </div>
                                                                            </TableCell>
                                                                            <TableCell>
                                                                                <Button
                                                                                    size="sm"
                                                                                    variant="outline"
                                                                                    className="text-xs h-7"
                                                                                >
                                                                                    Select
                                                                                </Button>
                                                                            </TableCell>
                                                                        </TableRow>
                                                                    ),
                                                                )}
                                                            </TableBody>
                                                        </Table>
                                                    </div>

                                                    {/* Mobile cards */}
                                                    <div className="md:hidden space-y-2">
                                                        {results.map((t) => (
                                                            <button
                                                                key={t.id}
                                                                type="button"
                                                                onClick={() =>
                                                                    handleSelectTraining(
                                                                        t,
                                                                    )
                                                                }
                                                                className="w-full text-left rounded-lg border p-3 hover:bg-accent/50 transition-colors space-y-1.5"
                                                            >
                                                                <div className="flex items-start justify-between gap-2">
                                                                    <span className="font-medium text-sm leading-snug">
                                                                        {
                                                                            t.title
                                                                        }
                                                                    </span>
                                                                    <TypeBadge
                                                                        type={
                                                                            t.type
                                                                        }
                                                                        size="xs"
                                                                    />
                                                                </div>
                                                                <div className="flex flex-wrap gap-1.5 items-center">
                                                                    <LevelBadge
                                                                        level={
                                                                            t.level
                                                                        }
                                                                        size="xs"
                                                                    />
                                                                    <span className="text-xs text-muted-foreground">
                                                                        {
                                                                            t.sponsoring_agency
                                                                        }
                                                                    </span>
                                                                </div>
                                                                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                                                                    <span className="font-mono">
                                                                        {
                                                                            t.start_date
                                                                        }
                                                                    </span>
                                                                    <span className="flex items-center gap-1">
                                                                        <Clock className="h-3 w-3" />
                                                                        {
                                                                            t.total_hours
                                                                        }
                                                                        h
                                                                    </span>
                                                                    {t.source ===
                                                                        "SELF_REPORTED" && (
                                                                        <span className="text-amber-400">
                                                                            Self-reported
                                                                        </span>
                                                                    )}
                                                                </div>
                                                            </button>
                                                        ))}
                                                    </div>

                                                    {/* Pagination */}
                                                    {pageCount > 1 && (
                                                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                                                            <span>
                                                                Page {page} of{" "}
                                                                {pageCount}
                                                            </span>
                                                            <div className="flex gap-1">
                                                                <Button
                                                                    variant="outline"
                                                                    size="sm"
                                                                    disabled={
                                                                        page <=
                                                                            1 ||
                                                                        loadingBrowse
                                                                    }
                                                                    onClick={() =>
                                                                        doSearch(
                                                                            search,
                                                                            page -
                                                                                1,
                                                                        )
                                                                    }
                                                                >
                                                                    <ChevronLeft className="h-3.5 w-3.5" />
                                                                </Button>
                                                                <Button
                                                                    variant="outline"
                                                                    size="sm"
                                                                    disabled={
                                                                        page >=
                                                                            pageCount ||
                                                                        loadingBrowse
                                                                    }
                                                                    onClick={() =>
                                                                        doSearch(
                                                                            search,
                                                                            page +
                                                                                1,
                                                                        )
                                                                    }
                                                                >
                                                                    <ChevronRight className="h-3.5 w-3.5" />
                                                                </Button>
                                                            </div>
                                                        </div>
                                                    )}
                                                </>
                                            )}
                                        </>
                                    )}

                                    {/* Not found CTA */}
                                    <div className="border-t border-border/60 pt-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                                        <p className="text-sm text-muted-foreground">
                                            Can't find the training you
                                            attended?
                                        </p>
                                        <Button
                                            type="button"
                                            variant="outline"
                                            className="gap-2 shrink-0"
                                            onClick={() =>
                                                setShowCreateModal(true)
                                            }
                                        >
                                            <Plus className="h-4 w-4" />
                                            Add New Training
                                        </Button>
                                    </div>
                                </motion.div>
                            )}

                            {/* ── UPLOAD VIEW (enroll existing) ── */}
                            {view === "upload" && selected && (
                                <motion.div
                                    key="upload"
                                    initial={{ opacity: 0, y: 8 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -8 }}
                                    transition={{ duration: 0.15 }}
                                    className="px-6 py-5 space-y-5 min-w-0 overflow-hidden"
                                >
                                    {/* Training summary card */}
                                    <div className="rounded-lg border bg-muted/20 p-4 space-y-2">
                                        <div className="flex flex-wrap gap-1.5">
                                            <TypeBadge
                                                type={selected.type}
                                                size="xs"
                                            />
                                            <LevelBadge
                                                level={selected.level}
                                                size="xs"
                                            />
                                            {selected.source ===
                                                "SELF_REPORTED" && (
                                                <span className="inline-block rounded-full border border-amber-500/30 bg-amber-500/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-amber-400">
                                                    Self-reported
                                                </span>
                                            )}
                                        </div>
                                        <p className="font-semibold">
                                            {selected.title}
                                        </p>
                                        <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
                                            <span>
                                                {selected.sponsoring_agency}
                                            </span>
                                            <span className="font-mono">
                                                {selected.start_date}
                                            </span>
                                            <span className="flex items-center gap-1">
                                                <Clock className="h-3 w-3" />
                                                {selected.total_hours}h
                                            </span>
                                        </div>
                                    </div>

                                    {/* Proof upload */}
                                    <ProofUpload
                                        file={enrollProof}
                                        onFile={setEnrollProof}
                                        onFullscreen={setFullscreenFile}
                                    />

                                    <p className="text-xs text-muted-foreground">
                                        Your proof will be reviewed by the admin
                                        before this training is added to your
                                        profile.
                                    </p>

                                    {/* Footer */}
                                    <div className="flex justify-end gap-2 pt-2 border-t border-border/60">
                                        <Button
                                            variant="outline"
                                            onClick={() => setView("browse")}
                                            disabled={isPending}
                                        >
                                            Back
                                        </Button>
                                        <Button
                                            onClick={handleEnrollSubmit}
                                            disabled={isPending || !enrollProof}
                                            className="gap-2 bg-teal-600 hover:bg-teal-700 text-white"
                                        >
                                            {isPending && (
                                                <Loader2 className="h-4 w-4 animate-spin" />
                                            )}
                                            {isPending
                                                ? "Submitting..."
                                                : "Submit Proof"}
                                        </Button>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </DialogContent>
            </Dialog>

            {/* ── CREATE NEW — reuses PdFormModal with proof upload injected ── */}
            {showCreateModal && (
                <Dialog
                    open={showCreateModal}
                    onOpenChange={setShowCreateModal}
                >
                    <DialogContent className="max-w-2xl w-[calc(100vw-2rem)] max-h-[90vh] overflow-y-auto p-0 gap-0">
                        <PdFormModal
                            open={showCreateModal}
                            onOpenChange={setShowCreateModal}
                            mode="create"
                            formData={formData}
                            setFormData={setFormData}
                            isSubmitting={isPending}
                            onSubmit={handleCreateSubmit}
                            extraFooter={
                                <div className="px-6 pb-5">
                                    <ProofUpload
                                        file={createProof}
                                        onFile={setCreateProof}
                                        onFullscreen={setFullscreenFile}
                                    />
                                </div>
                            }
                        />
                    </DialogContent>
                </Dialog>
            )}

            {/* ── Fullscreen proof preview ── */}
            <Dialog
                open={!!fullscreenFile}
                onOpenChange={(open) => {
                    if (!open) setFullscreenFile(null);
                }}
            >
                <DialogContent className="max-w-screen w-screen h-screen p-0 border-0 bg-black/90 flex items-center justify-center rounded-none [&>button.absolute]:hidden">
                    <DialogTitle className="sr-only">Image Preview</DialogTitle>
                    {fullscreenFile?.type.startsWith("image/") ? (
                        <div className="relative inline-block">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                                src={
                                    fullscreenFile
                                        ? URL.createObjectURL(fullscreenFile)
                                        : ""
                                }
                                alt="Fullscreen preview"
                                className="max-h-[90vh] max-w-[90vw] w-auto h-auto object-contain rounded-lg shadow-2xl block"
                            />
                            <button
                                onClick={() => setFullscreenFile(null)}
                                className="absolute top-2 right-2 z-10 rounded-md bg-black/50 hover:bg-black/70 transition-colors p-1.5 text-white"
                                aria-label="Close fullscreen"
                            >
                                <X className="h-4 w-4" />
                            </button>
                        </div>
                    ) : fullscreenFile ? (
                        <div className="relative inline-block">
                            <iframe
                                src={URL.createObjectURL(fullscreenFile)}
                                className="w-[90vw] h-[90vh] rounded-lg bg-white"
                                title="Fullscreen preview"
                            />
                            <button
                                onClick={() => setFullscreenFile(null)}
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
