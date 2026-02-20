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

export function calculateServiceYears(dateValue: Date | undefined) {
  if (!dateValue) return "—";

  const originalDate = new Date(dateValue);
  const today = new Date();
  if (originalDate > today) return "Invalid date";

  let years = today.getFullYear() - originalDate.getFullYear();
  let months = today.getMonth() - originalDate.getMonth();
  let days = today.getDate() - originalDate.getDate();

  if (days < 0) {
    months--;
    const lastDayOfPrevMonth = new Date(today.getFullYear(), today.getMonth(), 0).getDate();
    days += lastDayOfPrevMonth;
  }
  if (months < 0) {
    years--;
    months += 12;
  }

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
