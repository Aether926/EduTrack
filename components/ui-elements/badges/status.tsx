const statusColors: Record<string, string> = {
    // T&S statuses
    approved: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
    rejected: "bg-rose-500/15 text-rose-400 border-rose-500/30",
    pending: "bg-amber-500/15 text-amber-400 border-amber-500/30",
    enrolled: "bg-sky-500/15 text-sky-400 border-sky-500/30",
    // Document statuses
    submitted: "bg-blue-500/15 text-blue-400 border-blue-500/30",
    draft: "bg-muted/40 text-muted-foreground border-border/50",
    // User statuses
    suspended: "bg-orange-500/15 text-orange-400 border-orange-500/30",
    // Responsibility statuses
    active: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
    ended: "bg-muted/40 text-muted-foreground border-border/50",
};

const statusLabels: Record<string, string> = {
    approved: "Approved",
    rejected: "Rejected",
    pending: "Pending",
    enrolled: "Enrolled",
    submitted: "Submitted",
    draft: "Draft",
    suspended: "Suspended",
    active: "Active",
    ended: "Ended",
};

const fallback = "bg-muted/40 text-muted-foreground border-border/50";

export function StatusBadge({
    status,
    size = "sm",
}: {
    status: string;
    /** "sm" = default table/card size · "xs" = compact calendar/list size */
    size?: "sm" | "xs";
}) {
    const key = (status ?? "").toLowerCase();
    const cls = statusColors[key] ?? fallback;
    const label = statusLabels[key] ?? status;
    const textSize = size === "xs" ? "text-[10px]" : "text-[11px]";

    return (
        <span
            className={`inline-block rounded-full border px-2.5 py-0.5 font-semibold uppercase tracking-wider ${textSize} ${cls}`}
        >
            {label}
        </span>
    );
}
