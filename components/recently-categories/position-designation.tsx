import Link from "next/link";
import {
    ChevronLeft,
    CheckCircle2,
    XCircle,
    CalendarCheck,
    Plus,
    Pencil,
    Trash2,
    ArrowUpDown,
    ChevronDown,
    LayoutList,
} from "lucide-react";
import { ReactNode } from "react";

// ─── Types ────────────────────────────────────────────────────────────────────

type ChangeType = "add" | "edit" | "delete" | "reorder";

type ReviewedChange = {
    id: string;
    type: ChangeType;
    submittedBy: string;
    submittedAt: Date;
    status: "approved" | "rejected";
    reviewedBy: string;
    reviewedAt: Date;
    rejectionReason?: string;
    newTitle?: string;
    previousTitle?: string;
    updatedTitle?: string;
    deletedTitle?: string;
    previousOrder?: string[];
    newOrder?: string[];
};

// ─── Mock data — replace with Supabase fetch ──────────────────────────────────

const MOCK: ReviewedChange[] = [
    {
        id: "r1",
        type: "add",
        submittedBy: "Maria Santos (HR)",
        submittedAt: new Date(Date.now() - 1000 * 60 * 60 * 24),
        status: "approved",
        reviewedBy: "Principal Reyes",
        reviewedAt: new Date(Date.now() - 1000 * 60 * 60 * 20),
        newTitle: "Head Teacher I",
    },
    {
        id: "r2",
        type: "delete",
        submittedBy: "Maria Santos (HR)",
        submittedAt: new Date(Date.now() - 1000 * 60 * 60 * 48),
        status: "rejected",
        reviewedBy: "Principal Reyes",
        reviewedAt: new Date(Date.now() - 1000 * 60 * 60 * 46),
        deletedTitle: "Master Teacher III",
        rejectionReason: "Still has active teachers assigned to this position.",
    },
    {
        id: "r3",
        type: "edit",
        submittedBy: "Maria Santos (HR)",
        submittedAt: new Date(Date.now() - 1000 * 60 * 60 * 72),
        status: "approved",
        reviewedBy: "Principal Reyes",
        reviewedAt: new Date(Date.now() - 1000 * 60 * 60 * 70),
        previousTitle: "Administrative Staff",
        updatedTitle: "Administrative Officer",
    },
    {
        id: "r4",
        type: "reorder",
        submittedBy: "Maria Santos (HR)",
        submittedAt: new Date(Date.now() - 1000 * 60 * 60 * 96),
        status: "approved",
        reviewedBy: "Principal Reyes",
        reviewedAt: new Date(Date.now() - 1000 * 60 * 60 * 94),
        previousOrder: ["Teacher I", "Teacher II", "Teacher III", "Principal"],
        newOrder: ["Principal", "Teacher I", "Teacher II", "Teacher III"],
    },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatDate(date: Date) {
    return date.toLocaleDateString("en-PH", {
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    });
}

const TYPE_CONFIG: Record<
    ChangeType,
    { label: string; icon: ReactNode; bg: string; text: string; border: string }
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

function ChangeDescription({ change }: { change: ReviewedChange }) {
    if (change.type === "add")
        return (
            <p className="text-sm text-muted-foreground">
                Added:{" "}
                <span className="font-medium text-foreground">
                    &ldquo;{change.newTitle}&rdquo;
                </span>
            </p>
        );
    if (change.type === "edit")
        return (
            <p className="text-sm text-muted-foreground">
                Renamed{" "}
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
                Removed:{" "}
                <span className="font-medium text-foreground line-through">
                    {change.deletedTitle}
                </span>
            </p>
        );
    if (change.type === "reorder")
        return (
            <details className="text-sm text-muted-foreground">
                <summary className="cursor-pointer hover:text-foreground select-none flex items-center gap-1">
                    Reordered positions{" "}
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

function ReviewedCard({ change }: { change: ReviewedChange }) {
    const t = TYPE_CONFIG[change.type];
    const isApproved = change.status === "approved";

    return (
        <div className="bg-card border border-border rounded-lg p-4 sm:p-6 flex flex-col gap-4">
            <div className="flex items-start justify-between gap-3 flex-wrap">
                <div className="flex items-center gap-2 flex-wrap">
                    <span
                        className={`inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-md border ${t.bg} ${t.text} ${t.border}`}
                    >
                        {t.icon}
                        {t.label}
                    </span>
                    {isApproved ? (
                        <span className="inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-md border bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 border-green-200 dark:border-green-800">
                            <CheckCircle2 className="h-3.5 w-3.5" /> Approved
                        </span>
                    ) : (
                        <span className="inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-md border bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 border-red-200 dark:border-red-800">
                            <XCircle className="h-3.5 w-3.5" /> Rejected
                        </span>
                    )}
                </div>
            </div>

            <ChangeDescription change={change} />

            {!isApproved && change.rejectionReason && (
                <div className="rounded-md bg-red-100 dark:bg-red-900/20 border border-red-200 dark:border-red-800 px-3 py-2 text-xs text-red-700 dark:text-red-400 -mt-2">
                    <span className="font-semibold">Reason: </span>
                    {change.rejectionReason}
                </div>
            )}

            <div className="pt-3 border-t border-border space-y-1">
                <p className="text-xs text-muted-foreground">
                    Submitted by{" "}
                    <span className="font-medium text-foreground">
                        {change.submittedBy}
                    </span>
                </p>
                <p className="text-xs text-muted-foreground">
                    {isApproved ? "Approved" : "Rejected"} by{" "}
                    <span className="font-medium text-foreground">
                        {change.reviewedBy}
                    </span>
                    {" · "}
                    {formatDate(change.reviewedAt)}
                </p>
            </div>
        </div>
    );
}

// ─── Main export ──────────────────────────────────────────────────────────────

export default function PositionDesignationRecent() {
    const changes = MOCK;
    const approvedCount = changes.filter((c) => c.status === "approved").length;
    const rejectedCount = changes.filter((c) => c.status === "rejected").length;

    return (
        <main className="min-h-screen bg-background p-4 sm:p-6 lg:p-8">
            <div className="max-w-7xl mx-auto w-full">
                {/* Breadcrumb */}
                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
                    <Link
                        href="/principal-actions/recently-approved"
                        className="flex items-center gap-1 hover:text-foreground transition-colors"
                    >
                        <ChevronLeft className="h-4 w-4" /> Recently Approved
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
                        Reviewed change requests for positions and designations
                    </p>
                </header>

                {/* Summary strip */}
                <div className="flex items-center gap-3 mb-6 flex-wrap">
                    <div className="flex items-center gap-2 bg-card border border-border rounded-lg px-4 py-2 text-sm text-muted-foreground">
                        <CalendarCheck className="h-4 w-4" />
                        {changes.length} total reviewed
                    </div>
                    {approvedCount > 0 && (
                        <div className="flex items-center gap-2 bg-green-100 dark:bg-green-900/30 border border-green-200 dark:border-green-800 text-green-700 dark:text-green-400 rounded-lg px-4 py-2 text-sm font-medium">
                            <CheckCircle2 className="h-4 w-4" /> {approvedCount}{" "}
                            approved
                        </div>
                    )}
                    {rejectedCount > 0 && (
                        <div className="flex items-center gap-2 bg-red-100 dark:bg-red-900/30 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 rounded-lg px-4 py-2 text-sm font-medium">
                            <XCircle className="h-4 w-4" /> {rejectedCount}{" "}
                            rejected
                        </div>
                    )}
                </div>

                {changes.length === 0 ? (
                    <div className="bg-card border border-border rounded-lg p-10 text-center text-muted-foreground text-sm">
                        No reviewed requests for this category yet.
                    </div>
                ) : (
                    <section className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
                        {changes.map((change) => (
                            <ReviewedCard key={change.id} change={change} />
                        ))}
                    </section>
                )}
            </div>
        </main>
    );
}
