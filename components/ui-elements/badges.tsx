import {
    ShieldCheck,
    ShieldAlert,
    ShieldX,
    CheckCircle2,
    AlertTriangle,
    Clock,
} from "lucide-react";

// ── Shared primitives ─────────────────────────────────────────────────────────

const fallback = "bg-muted/40 text-muted-foreground border-border/50";

function Pill({
    cls,
    size,
    children,
}: {
    cls: string;
    size: "sm" | "xs";
    children: React.ReactNode;
}) {
    return (
        <span
            className={`inline-block rounded-full border px-2.5 py-0.5 font-semibold uppercase tracking-wider ${size === "xs" ? "text-[10px]" : "text-[11px]"} ${cls}`}
        >
            {children}
        </span>
    );
}

function IconPill({
    cls,
    size,
    icon,
    children,
}: {
    cls: string;
    size: "sm" | "xs";
    icon: React.ReactNode;
    children: React.ReactNode;
}) {
    return (
        <span
            className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 font-semibold uppercase tracking-wider ${size === "xs" ? "text-[10px]" : "text-[11px]"} ${cls}`}
        >
            {icon}
            {children}
        </span>
    );
}

// ── Type ──────────────────────────────────────────────────────────────────────

const TYPE: Record<string, string> = {
    training: "bg-teal-500/15 text-teal-400 border-teal-500/30",
    seminar: "bg-violet-500/15 text-violet-400 border-violet-500/30",
    workshop: "bg-amber-500/15 text-amber-400 border-amber-500/30",
    webinar: "bg-sky-500/15 text-sky-400 border-sky-500/30",
    conference: "bg-pink-500/15 text-pink-400 border-pink-500/30",
};

export function TypeBadge({
    type,
    size = "sm",
}: {
    type: string;
    size?: "sm" | "xs";
}) {
    return (
        <Pill cls={TYPE[(type ?? "").toLowerCase()] ?? fallback} size={size}>
            {type}
        </Pill>
    );
}

// ── Level ─────────────────────────────────────────────────────────────────────

const LEVEL: Record<string, string> = {
    withinInstitution: "bg-teal-500/15 text-teal-400 border-teal-500/30",
    interInstitutional: "bg-sky-500/15 text-sky-400 border-sky-500/30",
    local: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
    regional: "bg-amber-500/15 text-amber-400 border-amber-500/30",
    national: "bg-blue-500/15 text-blue-400 border-blue-500/30",
    international: "bg-rose-500/15 text-rose-400 border-rose-500/30",
    division: "bg-violet-500/15 text-violet-400 border-violet-500/30",
    school: "bg-slate-500/15 text-slate-400 border-slate-500/30",
};

export function LevelBadge({
    level,
    size = "sm",
}: {
    level: string;
    size?: "sm" | "xs";
}) {
    return (
        <Pill
            cls={
                LEVEL[level ?? ""] ??
                LEVEL[(level ?? "").toLowerCase()] ??
                fallback
            }
            size={size}
        >
            {level}
        </Pill>
    );
}

// ── Status ────────────────────────────────────────────────────────────────────

const STATUS_CLS: Record<string, string> = {
    approved: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
    rejected: "bg-rose-500/15 text-rose-400 border-rose-500/30",
    pending: "bg-amber-500/15 text-amber-400 border-amber-500/30",
    enrolled: "bg-sky-500/15 text-sky-400 border-sky-500/30",
    submitted: "bg-blue-500/15 text-blue-400 border-blue-500/30",
    draft: "bg-muted/40 text-muted-foreground border-border/50",
    suspended: "bg-orange-500/15 text-orange-400 border-orange-500/30",
    active: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
    ended: "bg-muted/40 text-muted-foreground border-border/50",
    compliance: "bg-amber-500/15 text-amber-400 border-amber-500/30",
    requests: "bg-blue-500/15 text-blue-400 border-blue-500/30",
};

const STATUS_LABEL: Record<string, string> = {
    approved: "Approved",
    rejected: "Rejected",
    pending: "Pending",
    enrolled: "Enrolled",
    submitted: "Submitted",
    draft: "Draft",
    suspended: "Suspended",
    active: "Active",
    ended: "Ended",
    compliance: "Compliance",
    requests: "Requests",
};

export function StatusBadge({
    status,
    size = "sm",
}: {
    status: string;
    size?: "sm" | "xs";
}) {
    const key = (status ?? "").toLowerCase();
    return (
        <Pill cls={STATUS_CLS[key] ?? fallback} size={size}>
            {STATUS_LABEL[key] ?? status}
        </Pill>
    );
}

// ── Role ──────────────────────────────────────────────────────────────────────

const ROLE_CLS: Record<string, string> = {
    teacher: "bg-teal-500/15 text-teal-400 border-teal-500/30",
    admin: "bg-violet-500/15 text-violet-400 border-violet-500/30",
    superadmin: "bg-rose-500/15 text-rose-400 border-rose-500/30",
    hr: "bg-sky-500/15 text-sky-400 border-sky-500/30",
    principal: "bg-orange-500/15 text-orange-400 border-orange-500/30",
};

const ROLE_LABEL: Record<string, string> = {
    teacher: "Teacher",
    admin: "Admin",
    superadmin: "Superadmin",
    hr: "HR",
    principal: "Principal",
};

export function RoleBadge({
    role,
    size = "sm",
}: {
    role: string;
    size?: "sm" | "xs";
}) {
    const key = (role ?? "").toLowerCase();
    return (
        <Pill cls={ROLE_CLS[key] ?? fallback} size={size}>
            {ROLE_LABEL[key] ?? role}
        </Pill>
    );
}

// ── Appointment Type ──────────────────────────────────────────────────────────

const APPT: Record<string, string> = {
    original: "bg-blue-500/15 text-blue-400 border-blue-500/30",
    promotion: "bg-violet-500/15 text-violet-400 border-violet-500/30",
    reappointment: "bg-teal-500/15 text-teal-400 border-teal-500/30",
    transfer: "bg-orange-500/15 text-orange-400 border-orange-500/30",
    reinstatement: "bg-pink-500/15 text-pink-400 border-pink-500/30",
};

export function AppointmentTypeBadge({
    type,
    size = "sm",
}: {
    type: string;
    size?: "sm" | "xs";
}) {
    return (
        <Pill cls={APPT[(type ?? "").toLowerCase()] ?? fallback} size={size}>
            {type}
        </Pill>
    );
}

// ── Responsibility Type ───────────────────────────────────────────────────────

const RESP_CLS: Record<string, string> = {
    teaching_load: "bg-blue-500/15 text-blue-400 border-blue-500/30",
    coordinator: "bg-violet-500/15 text-violet-400 border-violet-500/30",
    other: "bg-orange-500/15 text-orange-400 border-orange-500/30",
};

const RESP_LABEL: Record<string, string> = {
    teaching_load: "Teaching Load",
    coordinator: "Coordinator",
    other: "Other Duties",
};

export function ResponsibilityTypeBadge({
    type,
    size = "sm",
}: {
    type: string;
    size?: "sm" | "xs";
}) {
    const key = (type ?? "").toLowerCase();
    return (
        <Pill cls={RESP_CLS[key] ?? fallback} size={size}>
            {RESP_LABEL[key] ?? type}
        </Pill>
    );
}

// ── Risk Status ───────────────────────────────────────────────────────────────

const RISK_CLS: Record<string, string> = {
    compliant: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
    at_risk: "bg-amber-500/15 text-amber-400 border-amber-500/30",
    non_compliant: "bg-rose-500/15 text-rose-400 border-rose-500/30",
};

const RISK_LABEL: Record<string, string> = {
    compliant: "Compliant",
    at_risk: "At Risk",
    non_compliant: "Non-Compliant",
};

const RISK_ICON: Record<string, React.ReactNode> = {
    compliant: <ShieldCheck className="h-3 w-3" />,
    at_risk: <ShieldAlert className="h-3 w-3" />,
    non_compliant: <ShieldX className="h-3 w-3" />,
};

export function RiskStatusBadge({
    status,
    size = "sm",
    showIcon = true,
}: {
    status: string;
    size?: "sm" | "xs";
    showIcon?: boolean;
}) {
    const key = (status ?? "").toLowerCase();
    return (
        <IconPill
            cls={RISK_CLS[key] ?? fallback}
            size={size}
            icon={showIcon ? RISK_ICON[key] : null}
        >
            {RISK_LABEL[key] ?? status}
        </IconPill>
    );
}

// ── Salary Status ─────────────────────────────────────────────────────────────

const SAL_CLS: Record<string, string> = {
    eligible: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
    approaching: "bg-amber-500/15 text-amber-400 border-amber-500/30",
    on_track: "bg-sky-500/15 text-sky-400 border-sky-500/30",
};

const SAL_LABEL: Record<string, string> = {
    eligible: "Eligible",
    approaching: "Approaching",
    on_track: "On Track",
};

const SAL_ICON: Record<string, React.ReactNode> = {
    eligible: <CheckCircle2 className="h-3 w-3" />,
    approaching: <AlertTriangle className="h-3 w-3" />,
    on_track: <Clock className="h-3 w-3" />,
};

export function SalaryStatusBadge({
    status,
    size = "sm",
    showIcon = true,
}: {
    status: string;
    size?: "sm" | "xs";
    showIcon?: boolean;
}) {
    const key = (status ?? "").toLowerCase();
    return (
        <IconPill
            cls={SAL_CLS[key] ?? fallback}
            size={size}
            icon={showIcon ? SAL_ICON[key] : null}
        >
            {SAL_LABEL[key] ?? status}
        </IconPill>
    );
}

// ── Position ──────────────────────────────────────────────────────────────────
//
// Uses startsWith matching so any new roman-numeral variant (e.g. Master Teacher VI,
// Head Teacher VII) is automatically covered without touching this file.
// Order matters — longer prefixes must come before shorter ones to avoid false
// matches ("assistant school principal" before "school principal", etc.).

const POSITION_PREFIX: [string, string][] = [
    [
        "assistant school principal",
        "bg-teal-500/25 text-teal-300 border-teal-500/50",
    ],
    [
        "school principal",
        "bg-emerald-500/25 text-emerald-300 border-emerald-500/50",
    ],
    ["master teacher", "bg-purple-500/25 text-purple-300 border-purple-500/50"],
    ["head teacher", "bg-sky-500/25 text-sky-300 border-sky-500/50"],
    ["teacher", "bg-blue-500/25 text-blue-300 border-blue-500/50"],
    ["administrative", "bg-amber-500/25 text-amber-300 border-amber-500/50"],
];

function positionCls(position: string): string {
    const p = (position ?? "").toLowerCase();
    for (const [prefix, cls] of POSITION_PREFIX) {
        if (p.startsWith(prefix)) return cls;
    }
    return fallback;
}

export function PositionBadge({
    position,
    size = "sm",
}: {
    position: string;
    size?: "sm" | "xs";
}) {
    if (!position)
        return (
            <Pill cls={fallback} size={size}>
                —
            </Pill>
        );
    return (
        <Pill cls={positionCls(position)} size={size}>
            {position}
        </Pill>
    );
}

// ── Security Action ───────────────────────────────────────────────────────────
//
// Used in the superadmin security log feed. Each action maps to a label and
// a colour token so badge appearance stays consistent site-wide.

const SECURITY_ACTION_MAP: Record<string, { label: string; cls: string }> = {
    SIGNED_IN: {
        label: "Signed in",
        cls: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
    },
    SIGNED_OUT: {
        label: "Signed out",
        cls: "bg-slate-500/15 text-slate-400 border-slate-500/30",
    },
    SIGNED_UP: {
        label: "Signed up",
        cls: "bg-blue-500/15 text-blue-400 border-blue-500/30",
    },
    PASSWORD_CHANGED: {
        label: "Password changed",
        cls: "bg-amber-500/15 text-amber-400 border-amber-500/30",
    },
    ACCOUNT_APPROVED: {
        label: "Account approved",
        cls: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
    },
    ACCOUNT_REJECTED: {
        label: "Account rejected",
        cls: "bg-rose-500/15 text-rose-400 border-rose-500/30",
    },
    ACCOUNT_SUSPENDED: {
        label: "Account suspended",
        cls: "bg-orange-500/15 text-orange-400 border-orange-500/30",
    },
    ACCOUNT_UNSUSPENDED: {
        label: "Unsuspended",
        cls: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
    },
    ROLE_PROMOTED: {
        label: "Role promoted",
        cls: "bg-violet-500/15 text-violet-400 border-violet-500/30",
    },
    ROLE_DEMOTED: {
        label: "Role demoted",
        cls: "bg-amber-500/15 text-amber-400 border-amber-500/30",
    },
    SUPERADMIN_PROMOTED: {
        label: "Superadmin",
        cls: "bg-rose-500/15 text-rose-400 border-rose-500/30",
    },
    ACCOUNT_ARCHIVED: {
        label: "Archived",
        cls: "bg-slate-500/15 text-slate-400 border-slate-500/30",
    },
    ACCOUNT_RESTORED: {
        label: "Account restored",
        cls: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
    },
    ACCOUNT_PERMANENTLY_DELETED: {
        label: "Permanently deleted",
        cls: "bg-rose-500/15 text-rose-400 border-rose-500/30",
    },
};

export function SecurityActionBadge({
    action,
    size = "xs",
}: {
    action: string;
    size?: "sm" | "xs";
}) {
    const entry = SECURITY_ACTION_MAP[action] ?? {
        label: action,
        cls: fallback,
    };
    return (
        <Pill cls={entry.cls} size={size}>
            {entry.label}
        </Pill>
    );
}
