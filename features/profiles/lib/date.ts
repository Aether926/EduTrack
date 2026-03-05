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

export function calculateServiceYears(dateValue: Date | undefined) {
  if (!dateValue) return "—";

  const start = new Date(dateValue);
  const today = new Date();
  if (start > today) return "Invalid date";

  let years = today.getFullYear() - start.getFullYear();
  let months = today.getMonth() - start.getMonth();
  let days = today.getDate() - start.getDate();

  // Borrow a month if days are negative
  if (days < 0) {
    months--;
    // Days in the month before today's month
    const prevMonth = new Date(today.getFullYear(), today.getMonth(), 0);
    days += prevMonth.getDate();
  }

  // Borrow a year if months are negative
  if (months < 0) {
    years--;
    months += 12;
  }

  if (years === 0 && months === 0) return `${days}d`;
  if (years === 0) return `${months}m ${days}d`;
  return `${years}y ${months}m ${days}d`;
}

export function fmtDateRange(start?: string, end?: string) {
  const s = start ? new Date(start).toLocaleDateString() : "—";
  const e = end ? new Date(end).toLocaleDateString() : "—";
  return `${s} - ${e}`;
}

export function badgeClass(value: string) {
  const v = (value || "").toUpperCase();
  if (v === "APPROVED" || v === "PASSED")
    return "bg-green-600/15 text-green-400 border-green-600/30";
  if (v === "SUBMITTED" || v === "ENROLLED")
    return "bg-blue-600/15 text-blue-400 border-blue-600/30";
  if (v === "REJECTED" || v === "FAILED")
    return "bg-red-600/15 text-red-400 border-red-600/30";
  return "bg-gray-600/15 text-gray-300 border-gray-600/30";
}