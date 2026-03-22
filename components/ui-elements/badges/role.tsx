const roleColors: Record<string, string> = {
    teacher: "bg-teal-500/15 text-teal-400 border-teal-500/30",
    admin: "bg-violet-500/15 text-violet-400 border-violet-500/30",
    superadmin: "bg-rose-500/15 text-rose-400 border-rose-500/30",
    hr: "bg-sky-500/15 text-sky-400 border-sky-500/30",
    principal: "bg-orange-500/15 text-orange-400 border-orange-500/30",
};

const roleLabels: Record<string, string> = {
    teacher: "Teacher",
    admin: "Admin",
    superadmin: "Superadmin",
    hr: "HR",
    principal: "Principal",
};

const fallback = "bg-muted/40 text-muted-foreground border-border/50";

export function RoleBadge({
    role,
    size = "sm",
}: {
    role: string;
    /** "sm" = default table/card size · "xs" = compact calendar/list size */
    size?: "sm" | "xs";
}) {
    const key = (role ?? "").toLowerCase();
    const cls = roleColors[key] ?? fallback;
    const label = roleLabels[key] ?? role;
    const textSize = size === "xs" ? "text-[10px]" : "text-[11px]";

    return (
        <span
            className={`inline-block rounded-full border px-2.5 py-0.5 font-semibold uppercase tracking-wider ${textSize} ${cls}`}
        >
            {label}
        </span>
    );
}
