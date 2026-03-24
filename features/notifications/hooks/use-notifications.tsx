/* eslint-disable react-hooks/set-state-in-effect */
import { useState, useEffect, useCallback } from "react";
import {
    fetchNotifications,
    markAllRead,
    clearAllNotifications,
} from "@/features/notifications/actions/notification-actions";
import { supabase } from "@/lib/supabaseClient";

export type NotificationRow = {
    id: string;
    action: string;
    message: string | null;
    meta: Record<string, unknown> | null;
    created_at: string;
    read_at: string | null;
    actor_id: string | null;
    target_user_id: string | null;
};

export function useNotifications() {
    const [notifications, setNotifications] = useState<NotificationRow[]>([]);
    const [loading, setLoading] = useState(false);
    const [currentUserId, setCurrentUserId] = useState<string | null>(null);

    useEffect(() => {
        supabase.auth.getUser().then(({ data }) => {
            if (data.user) setCurrentUserId(data.user.id);
        });
    }, []);

    const load = useCallback(async () => {
        setLoading(true);
        const data = await fetchNotifications();
        setNotifications(data as NotificationRow[]);
        setLoading(false);
    }, []);

    useEffect(() => {
        void load();
    }, [load]);

    // Only count rows directed at the current user as "unread" —
    // admins see all rows but shouldn't have other users' unread pollute their badge
    const unreadCount = notifications.filter(
        (n) => !n.read_at && n.target_user_id === currentUserId,
    ).length;

    const markRead = async () => {
        await markAllRead();
        setNotifications((prev) =>
            prev.map((n) => ({
                ...n,
                read_at: n.read_at ?? new Date().toISOString(),
            })),
        );
    };

    const clearAll = async () => {
        await clearAllNotifications();
        setNotifications([]);
    };

    return { notifications, loading, unreadCount, markRead, load, clearAll };
}
