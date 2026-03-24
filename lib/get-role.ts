import type { User } from "@supabase/supabase-js";

export function getRole(user: User): string {
  return user.user_metadata?.role ?? "TEACHER";
}

const ADMIN_ROLES = new Set(["ADMIN", "SUPERADMIN","PRINCIPAL"]);
export function isAdminRole(role: string): boolean {
  return ADMIN_ROLES.has(role);
}