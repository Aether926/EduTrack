import { CheckCircle2, AlertTriangle, Clock } from "lucide-react";

const salaryStatusColors: Record<string, string> = {
    eligible: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
    approaching: "bg-amber-500/15 text-amber-400 border-amber-500/30",
    on_track: "bg-sky-500/15 text-sky-400 border-sky-500/30",
};

const salaryStatusLabels: Record<string, string> = {
    eligible: "Eligible",
    approaching: "Approaching",
    on_track: "On Track",
};

const salaryStatusIcons: Record<string, React.ReactNode> = {
    eligible: <CheckCircle2 className="h-3 w-3" />,
    approaching: <AlertTriangle className="h-3 w-3" />,
    on_track: <Clock className="h-3 w-3" />,
};

const fallback = "bg-muted/40 text-muted-foreground border-border/50";

export function SalaryStatusBadge({
    status,
    size = "sm",
    showIcon = true,
}: {
    status: string;
    /** "sm" = default table/card size · "xs" = compact calendar/list size */
    size?: "sm" | "xs";
    /** Show the icon alongside the label. Defaults to true. */
    showIcon?: boolean;
}) {
    const key = (status ?? "").toLowerCase();
    const cls = salaryStatusColors[key] ?? fallback;
    const label = salaryStatusLabels[key] ?? status;
    const icon = salaryStatusIcons[key];
    const textSize = size === "xs" ? "text-[10px]" : "text-[11px]";

    return (
        <span
            className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 font-semibold uppercase tracking-wider ${textSize} ${cls}`}
        >
            {showIcon && icon}
            {label}
        </span>
    );
}
