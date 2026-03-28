"use server";
import { createClient } from "@/lib/supabase/server";

async function getUserRole(
    supabase: Awaited<ReturnType<typeof createClient>>,
): Promise<string | null> {
    const { data: auth } = await supabase.auth.getUser();
    if (!auth.user) return null;
    const { data } = await supabase
        .from("User")
        .select("role")
        .eq("id", auth.user.id)
        .single();
    return data?.role ?? null;
}

export async function fetchNotifications() {
    const supabase = await createClient();
    const { data: auth } = await supabase.auth.getUser();
    if (!auth.user) return [];

    const role = await getUserRole(supabase);
    const isPrivileged =
        role === "ADMIN" || role === "SUPERADMIN" || role === "PRINCIPAL";

    const userId = auth.user.id;

    if (isPrivileged) {
        // Admin only sees their own actor rows
        const { data, error } = await supabase
            .from("ActivityLog")
            .select(
                "id, action, message, meta, created_at, read_at, actor_id, target_user_id, recipient_role",
            )
            .eq("actor_id", userId)
            .eq("recipient_role", "actor")
            .order("created_at", { ascending: false })
            .limit(20);

        if (error) return [];
        return data ?? [];
    } else {
        // Teacher only sees rows targeted at them as receiver
        const { data, error } = await supabase
            .from("ActivityLog")
            .select(
                "id, action, message, meta, created_at, read_at, actor_id, target_user_id, recipient_role",
            )
            .eq("target_user_id", userId)
            .eq("recipient_role", "receiver")
            .order("created_at", { ascending: false })
            .limit(20);

        if (error) return [];
        return data ?? [];
    }
}

export async function markAllRead() {
    const supabase = await createClient();
    await supabase.rpc("mark_notifications_read");
}

export async function clearAllNotifications() {
    const supabase = await createClient();
    const {
        data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    await supabase.from("ActivityLog").delete().eq("target_user_id", user.id);
}
