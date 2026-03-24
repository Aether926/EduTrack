export function toDate(v: unknown): Date | undefined {
  if (!v) return undefined;
  const d = v instanceof Date ? v : new Date(String(v));
  return Number.isNaN(d.getTime()) ? undefined : d;
}

export function addDays(date: Date, days: number) {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

export function fmtShort(d: Date) {
  try {
    return d.toLocaleDateString();
  } catch {
    return d.toISOString().slice(0, 10);
  }
}

export function calculateServiceYears(dateValue: Date | string | undefined) {
    if (!dateValue) return "—";

    const start = typeof dateValue === "string"
        ? new Date(dateValue.includes("T") ? dateValue : dateValue + "T00:00:00")
        : new Date(dateValue);

    const today = new Date();
    if (start > today) return "Invalid date";

    let years = today.getFullYear() - start.getFullYear();
    let months = today.getMonth() - start.getMonth();
    let days = today.getDate() - start.getDate();

    if (days < 0) {
        months--;
        const prevMonth = new Date(today.getFullYear(), today.getMonth(), 0);
        days += prevMonth.getDate();
    }

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