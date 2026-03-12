"use client";

/* eslint-disable @typescript-eslint/no-explicit-any */

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
    Send,
    Search,
    BookOpen,
    Clock,
    CheckCircle2,
    Loader2,
    GitPullRequest,
} from "lucide-react";
import { toast } from "sonner";

import type {
    TeacherResponsibility,
    ResponsibilityChangeRequest,
} from "@/features/admin-actions/responsibilities/types/responsibility";
import { submitChangeRequest } from "@/features/admin-actions/responsibilities/actions/responsibility-actions";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion";

const TYPE_LABEL: Record<string, string> = {
    TEACHING_LOAD: "Teaching Load",
    COORDINATOR: "Coordinator Role",
    OTHER: "Other Duties",
};

const TYPE_COLORS: Record<string, string> = {
    TEACHING_LOAD: "bg-blue-500/10 text-blue-400 border-blue-500/30",
    COORDINATOR: "bg-violet-500/10 text-violet-400 border-violet-500/30",
    OTHER: "bg-orange-500/10 text-orange-400 border-orange-500/30",
};

const TYPE_ACCENT: Record<string, string> = {
    TEACHING_LOAD: "border-l-blue-500/50",
    COORDINATOR: "border-l-violet-500/50",
    OTHER: "border-l-orange-500/50",
};

function TypeBadge({ type }: { type: string }) {
    const cls =
        TYPE_COLORS[type] ??
        "bg-slate-500/10 text-slate-400 border-slate-500/30";
    return (
        <span
            className={`inline-block rounded-full border px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wider ${cls}`}
        >
            {TYPE_LABEL[type] ?? type}
        </span>
    );
}

function StatusBadge({ status }: { status: string }) {
    const s = (status || "").toUpperCase();
    const cls =
        s === "ACTIVE"
            ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
            : "bg-slate-500/10 text-slate-400 border-slate-500/30";
    return (
        <span
            className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wider ${cls}`}
        >
            <span className="h-1.5 w-1.5 rounded-full bg-current" />
            {s || "UNKNOWN"}
        </span>
    );
}

function PendingBadge() {
    return (
        <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-500/30 bg-amber-500/10 px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wider text-amber-400">
            <span className="h-1.5 w-1.5 rounded-full bg-current" />
            Request Pending
        </span>
    );
}

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

function RequestChangeModal(props: {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    responsibility: TeacherResponsibility;
    onSuccess: () => void;
}) {
    const { open, onOpenChange, responsibility, onSuccess } = props;
    const [title, setTitle] = useState(responsibility.title);
    const [reason, setReason] = useState("");
    const [submitting, setSubmitting] = useState(false);

    const onOpen = (v: boolean) => {
        onOpenChange(v);
        if (v) {
            setTitle(responsibility.title);
            setReason("");
        }
    };

    const handleSubmit = async () => {
        if (!reason.trim()) return toast.info("Please provide a reason.");
        setSubmitting(true);
        try {
            await submitChangeRequest(responsibility.id, {
                reason,
                requested_changes: { title },
            });
            toast.success("Change request submitted.");
            onOpen(false);
            onSuccess();
        } catch (e) {
            toast.error(e instanceof Error ? e.message : "Failed to submit.");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpen}>
            <DialogContent className="max-w-md w-[90vw] max-h-[90vh] overflow-y-auto p-0 gap-0">
                {/* Header band */}
                <div className="relative px-6 pt-6 pb-5 border-b border-border/60 bg-gradient-to-br from-card to-background">
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-transparent to-violet-500/5 pointer-events-none" />
                    <DialogHeader className="relative">
                        <div className="flex items-center gap-2 mb-1">
                            <div className="rounded-lg border border-blue-500/20 bg-blue-500/10 p-2">
                                <GitPullRequest className="h-4 w-4 text-blue-400" />
                            </div>
                            <DialogTitle className="text-sm font-medium text-muted-foreground">
                                Request Change
                            </DialogTitle>
                        </div>
                        <DialogDescription className="text-[13px]">
                            Ask HR/Admin to update your responsibility details.
                        </DialogDescription>
                    </DialogHeader>
                </div>

                {/* Body */}
                <div className="px-6 py-5 space-y-4">
                    <div className="rounded-md border border-border/60 bg-muted/10 p-3">
                        <div className="text-[11px] text-muted-foreground uppercase tracking-wider font-medium mb-0.5">
                            Current Title
                        </div>
                        <div className="text-sm font-medium">
                            {responsibility.title}
                        </div>
                    </div>
                    <div className="h-px bg-border/50" />
                    <div className="space-y-1">
                        <FieldLabel required>New Title</FieldLabel>
                        <Input
                            className="h-9 text-sm"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                        />
                    </div>
                    <div className="space-y-1">
                        <FieldLabel required>Reason</FieldLabel>
                        <Textarea
                            rows={3}
                            placeholder="Explain why you need this change..."
                            value={reason}
                            onChange={(e) => setReason(e.target.value)}
                            className="text-sm"
                        />
                    </div>
                </div>

                {/* Footer */}
                <div className="px-6 py-4 border-t border-border/60 bg-gradient-to-br from-card to-background flex justify-end gap-2">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onOpen(false)}
                        disabled={submitting}
                    >
                        Cancel
                    </Button>
                    <Button
                        size="sm"
                        onClick={handleSubmit}
                        disabled={submitting}
                        className="gap-1.5"
                    >
                        {submitting ? (
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        ) : (
                            <Send className="h-3.5 w-3.5" />
                        )}
                        {submitting ? "Submitting..." : "Submit Request"}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}

function DetailsGrid({ r }: { r: TeacherResponsibility }) {
    const entries = Object.entries(r.details ?? {});
    return (
        <div className="grid gap-2 sm:grid-cols-2">
            {entries.map(([key, val]) => (
                <div
                    key={key}
                    className="group relative rounded-lg border border-border/40 bg-muted/5 px-4 py-3 overflow-hidden"
                >
                    <div className="absolute inset-y-0 left-0 w-0.5 bg-border/60 group-hover:bg-border transition-colors" />
                    <div className="text-[10px] text-muted-foreground/70 uppercase tracking-widest font-semibold mb-1">
                        {key.replaceAll("_", " ")}
                    </div>
                    <div className="text-sm font-medium break-words leading-snug">
                        {String(val)}
                    </div>
                </div>
            ))}
            <div className="group relative rounded-lg border border-border/40 bg-muted/5 px-4 py-3 overflow-hidden">
                <div className="absolute inset-y-0 left-0 w-0.5 bg-border/60 group-hover:bg-border transition-colors" />
                <div className="text-[10px] text-muted-foreground/70 uppercase tracking-widest font-semibold mb-1">
                    Assigned
                </div>
                <div className="text-sm font-medium font-mono">
                    {new Date(r.created_at).toLocaleDateString()}
                </div>
            </div>
        </div>
    );
}

export function MyResponsibilitiesClient(props: {
    responsibilities: TeacherResponsibility[];
    changeRequests: ResponsibilityChangeRequest[];
}) {
    const { responsibilities, changeRequests } = props;
    const router = useRouter();

    const [query, setQuery] = useState("");
    const [modalOpen, setModalOpen] = useState(false);
    const [selected, setSelected] = useState<TeacherResponsibility | null>(
        null,
    );

    const getPendingRequest = (id: string) =>
        changeRequests.find(
            (r) => r.responsibility_id === id && r.status === "PENDING",
        );

    const filtered = useMemo(() => {
        const q = query.trim().toLowerCase();
        if (!q) return responsibilities;
        return responsibilities.filter((r) => {
            const type = String(TYPE_LABEL[r.type] ?? r.type).toLowerCase();
            const title = String(r.title ?? "").toLowerCase();
            const details = JSON.stringify(r.details ?? {}).toLowerCase();
            return type.includes(q) || title.includes(q) || details.includes(q);
        });
    }, [responsibilities, query]);

    const active = filtered.filter((r) => r.status === "ACTIVE");
    const ended = filtered.filter((r) => r.status === "ENDED");
    const defaultTab = active.length ? "active" : "ended";

    const openRequest = (r: TeacherResponsibility) => {
        setSelected(r);
        setModalOpen(true);
    };

    return (
        <div className="space-y-4">
            {/* ── Toolbar card ── */}
            <div className="rounded-xl border border-border/60 bg-card">
                <div className="flex flex-col gap-3 px-5 py-4 md:flex-row md:items-center md:justify-between">
                    <div className="flex items-center gap-2.5">
                        <div className="rounded-lg border border-blue-500/20 bg-blue-500/10 p-2 shrink-0">
                            <BookOpen className="h-4 w-4 text-blue-400" />
                        </div>
                        <p className="text-sm text-muted-foreground">
                            Review your assignments and request changes if
                            needed.
                        </p>
                    </div>
                    <div className="relative w-full md:w-[320px]">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            placeholder="Search title, type, details..."
                            className="pl-9"
                        />
                    </div>
                </div>
            </div>

            {/* ── Tabs ── */}
            <Tabs defaultValue={defaultTab} className="space-y-3">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <TabsList className="w-full sm:w-auto h-9">
                        <TabsTrigger value="active" className="gap-2 text-xs">
                            <Clock className="h-3.5 w-3.5" />
                            Active
                            <span className="inline-block rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 px-1.5 py-0.5 text-[10px] font-semibold ml-0.5">
                                {active.length}
                            </span>
                        </TabsTrigger>
                        <TabsTrigger value="ended" className="gap-2 text-xs">
                            <CheckCircle2 className="h-3.5 w-3.5" />
                            Ended
                            <span className="inline-block rounded-full bg-slate-500/10 text-slate-400 border border-slate-500/30 px-1.5 py-0.5 text-[10px] font-semibold ml-0.5">
                                {ended.length}
                            </span>
                        </TabsTrigger>
                    </TabsList>
                    <div className="text-xs text-muted-foreground">
                        Tip: you can only request change while a responsibility
                        is ACTIVE.
                    </div>
                </div>

                {/* ── Active tab ── */}
                <TabsContent value="active">
                    {active.length === 0 ? (
                        <div className="rounded-xl border border-border/60 bg-card py-12 text-center text-sm text-muted-foreground">
                            No active responsibilities.
                        </div>
                    ) : (
                        <Accordion type="multiple" className="space-y-3">
                            {active.map((r) => {
                                const pending = getPendingRequest(r.id);
                                const accent =
                                    TYPE_ACCENT[r.type] ??
                                    "border-l-slate-500/50";
                                return (
                                    <AccordionItem
                                        key={r.id}
                                        value={r.id}
                                        className={`rounded-xl border border-border bg-card border-l-4 ${accent} px-4 md:px-5 overflow-hidden transition-colors hover:bg-muted/20`}
                                    >
                                        <AccordionTrigger className="hover:no-underline py-4">
                                            <div className="w-full pr-2 text-left">
                                                <div className="flex flex-wrap items-center gap-2">
                                                    <TypeBadge type={r.type} />
                                                    <StatusBadge
                                                        status={r.status}
                                                    />
                                                    {pending && (
                                                        <PendingBadge />
                                                    )}
                                                </div>
                                                <div className="mt-2">
                                                    <div className="text-sm font-semibold truncate">
                                                        {r.title}
                                                    </div>
                                                    <div className="mt-0.5 text-xs text-muted-foreground">
                                                        Tap to view details
                                                    </div>
                                                </div>
                                            </div>
                                        </AccordionTrigger>
                                        <AccordionContent>
                                            <div className="pb-5 pt-1 space-y-4">
                                                <div className="h-px bg-border/30" />
                                                <DetailsGrid r={r} />
                                                <div className="flex flex-wrap items-center justify-between gap-2">
                                                    {pending ? (
                                                        <p className="text-xs text-amber-400/80 flex items-center gap-1.5">
                                                            <span className="h-1.5 w-1.5 rounded-full bg-amber-400 inline-block" />
                                                            A change request is
                                                            already pending.
                                                        </p>
                                                    ) : (
                                                        <span />
                                                    )}
                                                    <div className="flex gap-2 ml-auto">
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            className="text-xs text-muted-foreground h-8"
                                                            onClick={() =>
                                                                router.refresh()
                                                            }
                                                        >
                                                            Refresh
                                                        </Button>
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            disabled={!!pending}
                                                            className="border-violet-500/30 text-violet-400 hover:bg-violet-500/10 text-xs h-8"
                                                            onClick={() =>
                                                                openRequest(r)
                                                            }
                                                        >
                                                            Request Change
                                                        </Button>
                                                    </div>
                                                </div>
                                            </div>
                                        </AccordionContent>
                                    </AccordionItem>
                                );
                            })}
                        </Accordion>
                    )}
                </TabsContent>

                {/* ── Ended tab ── */}
                <TabsContent value="ended">
                    {ended.length === 0 ? (
                        <div className="rounded-xl border border-border/60 bg-card py-12 text-center text-sm text-muted-foreground">
                            No ended responsibilities.
                        </div>
                    ) : (
                        <Accordion type="multiple" className="space-y-3">
                            {ended.map((r) => {
                                const accent =
                                    TYPE_ACCENT[r.type] ??
                                    "border-l-slate-500/50";
                                return (
                                    <AccordionItem
                                        key={r.id}
                                        value={r.id}
                                        className={`rounded-xl border border-border bg-card border-l-4 ${accent} px-4 md:px-5 overflow-hidden transition-colors hover:bg-muted/20`}
                                    >
                                        <AccordionTrigger className="hover:no-underline py-4">
                                            <div className="w-full pr-2 text-left">
                                                <div className="flex flex-wrap items-center gap-2">
                                                    <TypeBadge type={r.type} />
                                                    <StatusBadge
                                                        status={r.status}
                                                    />
                                                </div>
                                                <div className="mt-2">
                                                    <div className="text-sm font-semibold truncate">
                                                        {r.title}
                                                    </div>
                                                    <div className="mt-0.5 text-xs text-muted-foreground">
                                                        Ended responsibilities
                                                        are read-only
                                                    </div>
                                                </div>
                                            </div>
                                        </AccordionTrigger>
                                        <AccordionContent>
                                            <div className="pb-5 pt-1 space-y-4">
                                                <div className="h-px bg-border/30" />
                                                <DetailsGrid r={r} />
                                                <div className="flex justify-end">
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        className="text-xs text-muted-foreground h-8"
                                                        onClick={() =>
                                                            router.refresh()
                                                        }
                                                    >
                                                        Refresh
                                                    </Button>
                                                </div>
                                            </div>
                                        </AccordionContent>
                                    </AccordionItem>
                                );
                            })}
                        </Accordion>
                    )}
                </TabsContent>
            </Tabs>

            {selected && (
                <RequestChangeModal
                    open={modalOpen}
                    onOpenChange={setModalOpen}
                    responsibility={selected}
                    onSuccess={() => router.refresh()}
                />
            )}
        </div>
    );
}
