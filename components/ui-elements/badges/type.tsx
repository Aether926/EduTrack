const typeColors: Record<string, string> = {
    training: "bg-violet-500/15 text-violet-400 border-violet-500/30",
    seminar: "bg-teal-500/15 text-teal-400 border-teal-500/30",
    workshop: "bg-amber-500/15 text-amber-400 border-amber-500/30",
    webinar: "bg-sky-500/15 text-sky-400 border-sky-500/30",
    conference: "bg-pink-500/15 text-pink-400 border-pink-500/30",
};

const fallback = "bg-muted/40 text-muted-foreground border-border/50";

export function TypeBadge({
    type,
    size = "sm",
}: {
    type: string;
    /** "sm" = default table/card size · "xs" = compact calendar/list size */
    size?: "sm" | "xs";
}) {
    const key = (type ?? "").toLowerCase();
    const cls = typeColors[key] ?? fallback;
    const textSize = size === "xs" ? "text-[10px]" : "text-[11px]";

    return (
        <span
            className={`inline-block rounded-full border px-2.5 py-0.5 font-semibold uppercase tracking-wider ${textSize} ${cls}`}
        >
            {type}
        </span>
    );
}
