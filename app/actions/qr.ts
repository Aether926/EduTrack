"use server";

import { rotateQRTokenForCurrentUser, getProfileByQRToken } from "@/lib/database/qr";

export type ActionResult<T> =
  | { ok: true; data: T }
  | { ok: false; error: string };

function errMsg(e: unknown) {
  if (e instanceof Error) return e.message;
  if (typeof e === "string") return e;
  return "something went wrong";
}

/**
 * Generate / rotate the QR token for the currently signed-in user.
 * Old token becomes inactive, new one expires in 30 days.
 */
export async function generateMyProfileQRToken(): Promise<ActionResult<{ token: string }>> {
  try {
    const token = await rotateQRTokenForCurrentUser();
    return { ok: true, data: { token } };
  } catch (e) {
    return { ok: false, error: errMsg(e) };
  }
}

/**
 * Resolve a profile by QR token (valid + active + not expired).
 * Returns null data if invalid/expired (so caller can show "invalid QR").
 */
export async function resolveProfileByQRToken(
  token: string
): Promise<ActionResult<{ profile: unknown | null }>> {
  try {
    const profile = await getProfileByQRToken(token);
    return { ok: true, data: { profile } };
  } catch (e) {
    return { ok: false, error: errMsg(e) };
  }
}
