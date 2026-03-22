const responsibilityTypeColors: Record<string, string> = {
    teaching_load: "bg-blue-500/15 text-blue-400 border-blue-500/30",
    coordinator: "bg-violet-500/15 text-violet-400 border-violet-500/30",
    other: "bg-orange-500/15 text-orange-400 border-orange-500/30",
};

const responsibilityTypeLabels: Record<string, string> = {
    teaching_load: "Teaching Load",
    coordinator: "Coordinator",
    other: "Other Duties",
};

const fallback = "bg-muted/40 text-muted-foreground border-border/50";

export function ResponsibilityTypeBadge({
    type,
    size = "sm",
}: {
    type: string;
    /** "sm" = default table/card size · "xs" = compact calendar/list size */
    size?: "sm" | "xs";
}) {
    const key = (type ?? "").toLowerCase();
    const cls = responsibilityTypeColors[key] ?? fallback;
    const label = responsibilityTypeLabels[key] ?? type;
    const textSize = size === "xs" ? "text-[10px]" : "text-[11px]";

    return (
        <span
            className={`inline-block rounded-full border px-2.5 py-0.5 font-semibold uppercase tracking-wider ${textSize} ${cls}`}
        >
            {label}
        </span>
    );
}
