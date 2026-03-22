const levelColors: Record<string, string> = {
    regional: "bg-amber-500/15 text-amber-400 border-amber-500/30",
    national: "bg-blue-500/15 text-blue-400 border-blue-500/30",
    international: "bg-rose-500/15 text-rose-400 border-rose-500/30",
    division: "bg-violet-500/15 text-violet-400 border-violet-500/30",
    school: "bg-teal-500/15 text-teal-400 border-teal-500/30",
};

const fallback = "bg-muted/40 text-muted-foreground border-border/50";

export function LevelBadge({
    level,
    size = "sm",
}: {
    level: string;
    /** "sm" = default table/card size · "xs" = compact calendar/list size */
    size?: "sm" | "xs";
}) {
    const key = (level ?? "").toLowerCase();
    const cls = levelColors[key] ?? fallback;
    const textSize = size === "xs" ? "text-[10px]" : "text-[11px]";

    return (
        <span
            className={`inline-block rounded-full border px-2.5 py-0.5 font-semibold uppercase tracking-wider ${textSize} ${cls}`}
        >
            {level}
        </span>
    );
}
