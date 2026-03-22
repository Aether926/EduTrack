const appointmentTypeColors: Record<string, string> = {
    original: "bg-blue-500/15 text-blue-400 border-blue-500/30",
    promotion: "bg-violet-500/15 text-violet-400 border-violet-500/30",
    reappointment: "bg-teal-500/15 text-teal-400 border-teal-500/30",
    transfer: "bg-orange-500/15 text-orange-400 border-orange-500/30",
    reinstatement: "bg-pink-500/15 text-pink-400 border-pink-500/30",
};

const fallback = "bg-muted/40 text-muted-foreground border-border/50";

export function AppointmentTypeBadge({
    type,
    size = "sm",
}: {
    type: string;
    /** "sm" = default table/card size · "xs" = compact calendar/list size */
    size?: "sm" | "xs";
}) {
    const key = (type ?? "").toLowerCase();
    const cls = appointmentTypeColors[key] ?? fallback;
    const textSize = size === "xs" ? "text-[10px]" : "text-[11px]";

    return (
        <span
            className={`inline-block rounded-full border px-2.5 py-0.5 font-semibold uppercase tracking-wider ${textSize} ${cls}`}
        >
            {type}
        </span>
    );
}
