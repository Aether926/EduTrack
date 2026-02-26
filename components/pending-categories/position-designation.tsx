"use client";

import * as React from "react";
import Link from "next/link";
import {
    ChevronLeft,
    CheckCircle2,
    XCircle,
    Clock,
    Plus,
    Pencil,
    Trash2,
    ArrowUpDown,
    ChevronDown,
    LayoutList,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

// ─── Types ────────────────────────────────────────────────────────────────────

type ChangeType = "add" | "edit" | "delete" | "reorder";

type PendingChange = {
    id: string;
    type: ChangeType;
    submittedBy: string;
    submittedAt: Date;
    status: "pending" | "approved" | "rejected";
    newTitle?: string;
    previousTitle?: string;
    updatedTitle?: string;
    deletedTitle?: string;
    previousOrder?: string[];
    newOrder?: string[];
};

// ─── Mock data — replace with Supabase fetch in the page that renders this ───

const MOCK: PendingChange[] = [
    {
        id: "c1",
        type: "add",
        submittedBy: "Maria Santos (HR)",
        submittedAt: new Date(Date.now() - 1000 * 60 * 14),
        status: "pending",
        newTitle: "Teacher IV",
    },
    {
        id: "c2",
        type: "edit",
        submittedBy: "Maria Santos (HR)",
        submittedAt: new Date(Date.now() - 1000 * 60 * 42),
        status: "pending",
        previousTitle: "Teacher III",
        updatedTitle: "Teacher III (Senior)",
    },
    {
        id: "c3",
        type: "delete",
        submittedBy: "Maria Santos (HR)",
        submittedAt: new Date(Date.now() - 1000 * 60 * 60 * 2),
        status: "pending",
        deletedTitle: "Administrative Staff",
    },
    {
        id: "c4",
        type: "reorder",
        submittedBy: "Maria Santos (HR)",
        submittedAt: new Date(Date.now() - 1000 * 60 * 60 * 5),
        status: "pending",
        previousOrder: ["Teacher I", "Teacher II", "Teacher III", "Principal"],
        newOrder: ["Principal", "Teacher I", "Teacher II", "Teacher III"],
    },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function timeAgo(date: Date) {
    const m = Math.floor((Date.now() - date.getTime()) / 60000);
    if (m < 1) return "just now";
    if (m < 60) return `${m}m ago`;
    const h = Math.floor(m / 60);
    if (h < 24) return `${h}h ago`;
    return `${Math.floor(h / 24)}d ago`;
}

const TYPE_CONFIG: Record<
    ChangeType,
    {
        label: string;
        icon: React.ReactNode;
        bg: string;
        text: string;
        border: string;
    }
> = {
    add: {
        label: "Add",
        icon: <Plus className="h-3.5 w-3.5" />,
        bg: "bg-green-100 dark:bg-green-900/30",
        text: "text-green-700 dark:text-green-400",
        border: "border-green-200 dark:border-green-800",
    },
    edit: {
        label: "Edit",
        icon: <Pencil className="h-3.5 w-3.5" />,
        bg: "bg-blue-100 dark:bg-blue-900/30",
        text: "text-blue-700 dark:text-blue-400",
        border: "border-blue-200 dark:border-blue-800",
    },
    delete: {
        label: "Delete",
        icon: <Trash2 className="h-3.5 w-3.5" />,
        bg: "bg-red-100 dark:bg-red-900/30",
        text: "text-red-700 dark:text-red-400",
        border: "border-red-200 dark:border-red-800",
    },
    reorder: {
        label: "Reorder",
        icon: <ArrowUpDown className="h-3.5 w-3.5" />,
        bg: "bg-purple-100 dark:bg-purple-900/30",
        text: "text-purple-700 dark:text-purple-400",
        border: "border-purple-200 dark:border-purple-800",
    },
};

function ChangeDescription({ change }: { change: PendingChange }) {
    if (change.type === "add")
        return (
            <p className="text-sm text-muted-foreground">
                Add:{" "}
                <span className="font-medium text-foreground">
                    &ldquo;{change.newTitle}&rdquo;
                </span>
            </p>
        );
    if (change.type === "edit")
        return (
            <p className="text-sm text-muted-foreground">
                Rename{" "}
                <span className="font-medium text-foreground line-through">
                    {change.previousTitle}
                </span>
                {" → "}
                <span className="font-medium text-foreground">
                    {change.updatedTitle}
                </span>
            </p>
        );
    if (change.type === "delete")
        return (
            <p className="text-sm text-muted-foreground">
                Remove:{" "}
                <span className="font-medium text-foreground line-through">
                    {change.deletedTitle}
                </span>
            </p>
        );
    if (change.type === "reorder")
        return (
            <details className="text-sm text-muted-foreground">
                <summary className="cursor-pointer hover:text-foreground select-none flex items-center gap-1">
                    Reorder positions{" "}
                    <ChevronDown className="h-3.5 w-3.5 inline" />
                </summary>
                <div className="mt-2 grid grid-cols-2 gap-3 text-xs">
                    <div className="rounded-md border bg-muted/30 p-2.5">
                        <p className="font-semibold text-muted-foreground mb-1.5 uppercase tracking-wide text-[10px]">
                            Before
                        </p>
                        <ol className="space-y-1">
                            {change.previousOrder?.map((t, i) => (
                                <li key={i} className="flex gap-1.5">
                                    <span className="text-muted-foreground">
                                        {i + 1}.
                                    </span>
                                    {t}
                                </li>
                            ))}
                        </ol>
                    </div>
                    <div className="rounded-md border bg-muted/30 p-2.5">
                        <p className="font-semibold text-muted-foreground mb-1.5 uppercase tracking-wide text-[10px]">
                            After
                        </p>
                        <ol className="space-y-1">
                            {change.newOrder?.map((t, i) => (
                                <li key={i} className="flex gap-1.5">
                                    <span className="text-muted-foreground">
                                        {i + 1}.
                                    </span>
                                    {t}
                                </li>
                            ))}
                        </ol>
                    </div>
                </div>
            </details>
        );
    return null;
}

function PendingCard({
    change,
    onApprove,
    onReject,
}: {
    change: PendingChange;
    onApprove: (id: string) => void;
    onReject: (id: string, reason: string) => void;
}) {
    const t = TYPE_CONFIG[change.type];
    const [reason, setReason] = React.useState("");

    return (
        <div className="bg-card border border-border rounded-lg p-4 sm:p-6 flex flex-col gap-4">
            <div className="flex items-start justify-between gap-3 flex-wrap">
                <span
                    className={`inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-md border ${t.bg} ${t.text} ${t.border}`}
                >
                    {t.icon}
                    {t.label}
                </span>
                <span className="text-xs text-muted-foreground">
                    {timeAgo(change.submittedAt)}
                </span>
            </div>

            <ChangeDescription change={change} />

            <p className="text-xs text-muted-foreground -mt-2">
                Submitted by{" "}
                <span className="font-medium text-foreground">
                    {change.submittedBy}
                </span>
            </p>

            <div className="flex items-center gap-2 pt-3 border-t border-border">
                <AlertDialog>
                    <AlertDialogTrigger asChild>
                        <Button
                            size="sm"
                            className="gap-1.5 bg-green-700 hover:bg-green-800 text-white text-xs h-8"
                        >
                            <CheckCircle2 className="h-3.5 w-3.5" /> Approve
                        </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>
                                Approve this change?
                            </AlertDialogTitle>
                            <AlertDialogDescription>
                                This will apply the change and notify the HR who
                                submitted it.
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                                className="bg-green-700 hover:bg-green-800 text-white"
                                onClick={() => onApprove(change.id)}
                            >
                                Confirm Approval
                            </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>

                <AlertDialog>
                    <AlertDialogTrigger asChild>
                        <Button
                            size="sm"
                            variant="outline"
                            className="gap-1.5 text-destructive border-destructive/30 hover:bg-destructive/10 text-xs h-8"
                        >
                            <XCircle className="h-3.5 w-3.5" /> Reject
                        </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>
                                Reject this change?
                            </AlertDialogTitle>
                            <AlertDialogDescription>
                                Optionally provide a reason. The HR will be
                                notified.
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <div className="px-6 pb-2">
                            <Textarea
                                placeholder="Reason for rejection (optional)"
                                value={reason}
                                onChange={(e) => setReason(e.target.value)}
                                className="text-sm resize-none"
                                rows={3}
                            />
                        </div>
                        <AlertDialogFooter>
                            <AlertDialogCancel onClick={() => setReason("")}>
                                Cancel
                            </AlertDialogCancel>
                            <AlertDialogAction
                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                onClick={() => {
                                    onReject(change.id, reason);
                                    setReason("");
                                }}
                            >
                                Confirm Rejection
                            </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            </div>
        </div>
    );
}

// ─── Main export — this is what the drill-down page renders ──────────────────

export default function PositionDesignationPending() {
    const [changes, setChanges] = React.useState<PendingChange[]>(MOCK);
    const pending = changes.filter((c) => c.status === "pending");

    const handleApprove = (id: string) => {
        setChanges((prev) =>
            prev.map((c) =>
                c.id === id ? { ...c, status: "approved" as const } : c,
            ),
        );
        // TODO: PATCH /api/principal/approve { changeId: id }
    };
    const handleReject = (id: string, reason: string) => {
        setChanges((prev) =>
            prev.map((c) =>
                c.id === id ? { ...c, status: "rejected" as const } : c,
            ),
        );
        // TODO: PATCH /api/principal/reject { changeId: id, reason }
    };

    return (
        <main className="min-h-screen bg-background p-4 sm:p-6 lg:p-8">
            <div className="max-w-7xl mx-auto w-full">
                {/* Breadcrumb */}
                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
                    <Link
                        href="/principal-actions/pending-approval"
                        className="flex items-center gap-1 hover:text-foreground transition-colors"
                    >
                        <ChevronLeft className="h-4 w-4" /> Pending Approval
                    </Link>
                    <span>/</span>
                    <span className="text-foreground font-medium">
                        Position / Designation
                    </span>
                </div>

                {/* Header */}
                <header className="mb-6">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg">
                            <LayoutList className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
                        </div>
                        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground">
                            Position / Designation
                        </h1>
                    </div>
                    <p className="text-sm sm:text-base text-muted-foreground">
                        Pending change requests for positions and designations
                    </p>
                </header>

                {pending.length > 0 && (
                    <div className="flex items-center gap-2 mb-6 bg-yellow-100 dark:bg-yellow-900/30 border border-yellow-200 dark:border-yellow-800 text-yellow-700 dark:text-yellow-400 rounded-lg px-4 py-2.5 text-sm font-medium w-fit">
                        <Clock className="h-4 w-4" />
                        {pending.length} pending{" "}
                        {pending.length === 1 ? "request" : "requests"}
                    </div>
                )}

                {pending.length === 0 ? (
                    <div className="bg-card border border-border rounded-lg p-10 text-center text-muted-foreground text-sm">
                        No pending requests for this category.
                    </div>
                ) : (
                    <section className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
                        {pending.map((change) => (
                            <PendingCard
                                key={change.id}
                                change={change}
                                onApprove={handleApprove}
                                onReject={handleReject}
                            />
                        ))}
                    </section>
                )}
            </div>
        </main>
    );
}
