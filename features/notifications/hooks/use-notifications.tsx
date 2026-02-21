/* eslint-disable react-hooks/set-state-in-effect */
import { useState, useEffect, useCallback } from "react";
import { fetchNotifications, markAllRead, clearAllNotifications } from "@/features/notifications/actions/notification-actions";

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

  const load = useCallback(async () => {
    setLoading(true);
    const data = await fetchNotifications();
    setNotifications(data as NotificationRow[]);
    setLoading(false);
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const unreadCount = notifications.filter((n) => !n.read_at).length;

  const markRead = async () => {
    await markAllRead();
    setNotifications((prev) => prev.map((n) => ({ ...n, read_at: n.read_at ?? new Date().toISOString() })));
  };
  const clearAll = async () => {
  await clearAllNotifications();
  setNotifications([]);
    };

    return { notifications, loading, unreadCount, markRead, load, clearAll };

}