import { createAdminClient, createClient } from "@/lib/supabase/server";

export type ActivityRow = {
    id: string;
    created_at: string;
    actor_id: string | null;
    target_user_id: string | null;
    action: string;
    entity_type: string | null;
    entity_id: string | null;
    message: string;
    meta: Record<string, unknown> | null;
    recipient_role: "actor" | "receiver" | null;
};

export type ActivityInsert = {
    actor_id: string;
    target_user_id: string;
    action: string;
    entity_type: string;
    entity_id: string;
    message: string;
    recipient_role: "actor" | "receiver";
    meta?: Record<string, unknown>;
};

export async function insertActivity(rows: ActivityInsert[]) {
    if (!rows.length) return;
    const admin = createAdminClient();
    await admin.from("ActivityLog").insert(
        rows.map((r) => ({
            actor_id: r.actor_id,
            target_user_id: r.target_user_id,
            action: r.action,
            entity_type: r.entity_type,
            entity_id: r.entity_id,
            message: r.message,
            recipient_role: r.recipient_role,
            meta: r.meta ?? null,
        })),
    );
}

async function getRole(userId: string) {
    const supabase = await createClient();
    const { data } = await supabase
        .from("User")
        .select("role")
        .eq("id", userId)
        .single();
    return data?.role ?? null;
}

/**
 * Fetches activity rows for the current user.
 * Every user — including admins — only sees rows where
 * target_user_id matches their own ID. This ensures admin-facing
 * messages (actor rows) and teacher-facing messages (receiver rows)
 * are never mixed up.
 */
export async function getDashboardActivity(limit = 20): Promise<ActivityRow[]> {
    const supabase = await createClient();
    const { data: auth } = await supabase.auth.getUser();
    if (!auth.user) return [];

    const userId = auth.user.id;

    const columns =
        "id, created_at, actor_id, target_user_id, action, entity_type, entity_id, message, meta, recipient_role";
    // Receiver rows
    // Receiver rows — only rows explicitly marked for this user as receiver
    const { data: receiverRows } = await supabase
        .from("ActivityLog")
        .select(columns)
        .eq("target_user_id", userId)
        .eq("recipient_role", "receiver")
        .order("created_at", { ascending: false })
        .limit(limit);

    // Actor rows — only rows explicitly marked for this user as actor
    const { data: actorRows } = await supabase
        .from("ActivityLog")
        .select(columns)
        .eq("target_user_id", userId)
        .eq("recipient_role", "actor")
        .order("created_at", { ascending: false })
        .limit(limit);

    const all = [...(receiverRows ?? []), ...(actorRows ?? [])];
    const seen = new Set<string>();
    const deduped = all
        .filter((r) => {
            if (seen.has(r.id)) return false;
            seen.add(r.id);
            return true;
        })
        .sort(
            (a, b) =>
                new Date(b.created_at).getTime() -
                new Date(a.created_at).getTime(),
        )
        .slice(0, limit);

    return deduped as ActivityRow[];
}

/**
 * For admin audit pages — fetches ALL activity logs across all users.
 * Only call this from admin-only server components.
 */
export async function getAllActivity(limit = 50): Promise<ActivityRow[]> {
    const supabase = await createClient();
    const { data: auth } = await supabase.auth.getUser();
    if (!auth.user) return [];

    const role = await getRole(auth.user.id);
    if (!["ADMIN", "SUPERADMIN"].includes(role)) return [];

    const { data, error } = await supabase
        .from("ActivityLog")
        .select(
            "id, created_at, actor_id, target_user_id, action, entity_type, entity_id, message, meta, recipient_role",
        )
        .order("created_at", { ascending: false })
        .limit(limit);

    if (error || !data) return [];
    return data as ActivityRow[];
}
