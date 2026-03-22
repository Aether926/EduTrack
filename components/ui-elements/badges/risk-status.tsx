import { ShieldCheck, ShieldAlert, ShieldX } from "lucide-react";

const riskStatusColors: Record<string, string> = {
    compliant: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
    at_risk: "bg-amber-500/15 text-amber-400 border-amber-500/30",
    non_compliant: "bg-rose-500/15 text-rose-400 border-rose-500/30",
};

const riskStatusLabels: Record<string, string> = {
    compliant: "Compliant",
    at_risk: "At Risk",
    non_compliant: "Non-Compliant",
};

const riskStatusIcons: Record<string, React.ReactNode> = {
    compliant: <ShieldCheck className="h-3 w-3" />,
    at_risk: <ShieldAlert className="h-3 w-3" />,
    non_compliant: <ShieldX className="h-3 w-3" />,
};

const fallback = "bg-muted/40 text-muted-foreground border-border/50";

export function RiskStatusBadge({
    status,
    size = "sm",
    showIcon = true,
}: {
    status: string;
    /** "sm" = default table/card size · "xs" = compact calendar/list size */
    size?: "sm" | "xs";
    /** Show the shield icon alongside the label. Defaults to true. */
    showIcon?: boolean;
}) {
    const key = (status ?? "").toLowerCase();
    const cls = riskStatusColors[key] ?? fallback;
    const label = riskStatusLabels[key] ?? status;
    const icon = riskStatusIcons[key];
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
