export function fmt(dt: string | null) {
  if (!dt) return "—";
  try {
    return new Date(dt).toLocaleString();
  } catch {
    return dt;
  }
}

export function statusBadgeVariant(status: string) {
  const s = (status ?? "").toUpperCase();
  if (s === "SUBMITTED" || s === "PENDING") return "secondary";
  if (s === "APPROVED") return "default";
  if (s === "REJECTED") return "destructive";
  return "outline";
}

export function errMsg(e: unknown) {
  if (e instanceof Error) return e.message;
  if (typeof e === "string") return e;
  return "something went wrong";
}