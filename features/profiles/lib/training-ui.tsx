export function badgeClass(value: string) {
  const v = (value || "").toUpperCase();
  if (v === "APPROVED" || v === "PASSED") return "bg-green-600/15 text-green-400 border-green-600/30";
  if (v === "SUBMITTED" || v === "ENROLLED") return "bg-blue-600/15 text-blue-400 border-blue-600/30";
  if (v === "REJECTED" || v === "FAILED") return "bg-red-600/15 text-red-400 border-red-600/30";
  return "bg-gray-600/15 text-gray-300 border-gray-600/30";
}

export function fmtDateRange(start?: string, end?: string) {
  const s = start ? new Date(start).toLocaleDateString() : "—";
  const e = end ? new Date(end).toLocaleDateString() : "—";
  return `${s} - ${e}`;
}
