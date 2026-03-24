export function fullName(u: { firstName: string; lastName: string; middleInitial?: string }) {
  const mi = u.middleInitial?.trim() ? ` ${u.middleInitial.trim()}.` : "";
  return `${u.firstName}${mi} ${u.lastName}`.trim();
}

export function fmtDate(iso: string) {
  try {
    return new Date(iso).toLocaleDateString();
  } catch {
    return iso;
  }
}

export function errMsg(e: unknown) {
  if (e instanceof Error) return e.message;
  if (typeof e === "string") return e;
  return "something went wrong";
}