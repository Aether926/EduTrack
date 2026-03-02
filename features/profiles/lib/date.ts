export function toDate(value: string | Date | null | undefined): Date | undefined {
    if (!value) return undefined;
    if (value instanceof Date) return isNaN(value.getTime()) ? undefined : value;
    const d = new Date(value);
    return isNaN(d.getTime()) ? undefined : d;
}

export function fmtDateRange(start: string | null | undefined, end: string | null | undefined): string {
    const fmt = (d: string | null | undefined) => {
        if (!d) return null;
        const date = new Date(d);
        if (isNaN(date.getTime())) return null;
        return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
    };
    const s = fmt(start);
    const e = fmt(end);
    if (!s && !e) return "—";
    if (!e) return s!;
    if (s === e) return s!;
    return `${s} – ${e}`;
}

export function badgeClass(status: string): string {
    const s = (status ?? "").toLowerCase();
    if (s === "completed" || s === "passed") return "bg-green-500/10 text-green-400 border-green-500/30";
    if (s === "failed") return "bg-red-500/10 text-red-400 border-red-500/30";
    if (s === "ongoing" || s === "in progress") return "bg-blue-500/10 text-blue-400 border-blue-500/30";
    if (s === "pending") return "bg-yellow-500/10 text-yellow-400 border-yellow-500/30";
    return "bg-gray-500/10 text-gray-400 border-gray-500/30";
}

export function calculateServiceYears(dateStr: string | Date | null | undefined): string {
    if (!dateStr) return "—";

    const start = dateStr instanceof Date ? dateStr : new Date(dateStr);
    if (isNaN(start.getTime())) return "—";

    const now = new Date();

    // If start is in the future
    if (start > now) {
        const diffMs = start.getTime() - now.getTime();
        const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
        return `Starts in ${diffDays}d`;
    }

    let years = now.getFullYear() - start.getFullYear();
    let months = now.getMonth() - start.getMonth();
    let days = now.getDate() - start.getDate();

    // Borrow from months if days is negative
    if (days < 0) {
        months -= 1;
        const prevMonth = new Date(now.getFullYear(), now.getMonth(), 0);
        days += prevMonth.getDate();
    }

    // Borrow from years if months is negative
    if (months < 0) {
        years -= 1;
        months += 12;
    }

    const parts: string[] = [];
    if (years > 0) parts.push(`${years}y`);
    if (months > 0) parts.push(`${months}m`);
    if (days > 0 || parts.length === 0) parts.push(`${days}d`);

    return parts.join(" ");
}