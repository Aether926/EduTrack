import type { DocumentStatus } from "@/features/documents/types/documents";

const CONFIG: Record<
    DocumentStatus,
    { label: string; cls: string; dot: string }
> = {
    APPROVED: {
        label: "Approved",
        cls: "bg-emerald-500/10 text-emerald-400 border-emerald-500/30",
        dot: "bg-emerald-400",
    },
    SUBMITTED: {
        label: "Submitted",
        cls: "bg-blue-500/10 text-blue-400 border-blue-500/30",
        dot: "bg-blue-400",
    },
    REJECTED: {
        label: "Rejected",
        cls: "bg-rose-500/10 text-rose-400 border-rose-500/30",
        dot: "bg-rose-400",
    },
    DRAFT: {
        label: "Draft",
        cls: "bg-slate-500/10 text-slate-400 border-slate-500/30",
        dot: "bg-slate-400",
    },
};

export function DocumentStatusBadge({ status }: { status: DocumentStatus }) {
    const config = CONFIG[status] ?? CONFIG.DRAFT;
    return (
        <span
            className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wider ${config.cls}`}
        >
            <span
                className={`h-1.5 w-1.5 rounded-full shrink-0 ${config.dot}`}
            />
            {config.label}
        </span>
    );
}
