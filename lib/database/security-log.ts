

import { createAdminClient } from "@/lib/supabase/server";
import { headers } from "next/headers";


export type SecurityAction =
    | "SIGNED_IN"
    | "SIGNED_OUT"
    | "SIGNED_UP"
    | "PASSWORD_CHANGED"
    | "ACCOUNT_APPROVED"
    | "ACCOUNT_REJECTED"
    | "ACCOUNT_SUSPENDED"
    | "ACCOUNT_UNSUSPENDED"
    | "ROLE_PROMOTED"
    | "ROLE_DEMOTED"
    | "SUPERADMIN_PROMOTED";

export async function logSecurityEvent({
    userId,
    actorId,
    email,
    action,
    meta,
}: {
    userId?: string | null;
    actorId?: string | null;
    email?: string | null;
    action: SecurityAction;
    meta?: Record<string, unknown>;
}) {
    try {
        const admin = createAdminClient();
        const headersList = await headers();

        const forwarded = headersList.get("x-forwarded-for");
        const ip = forwarded
            ? forwarded.split(",")[0].trim()
            : headersList.get("x-real-ip") ?? null;

        await admin.from("SecurityLog").insert({
            user_id:    userId   ?? null,
            actor_id:   actorId  ?? null,
            email:      email    ?? null,
            action,
            meta:       meta     ?? null,
            ip_address: ip,
        });
    } catch (error) {
        console.error("SecurityLog error:", error);
    }
}