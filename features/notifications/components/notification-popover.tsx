"use client";

import { useState } from "react";
import { Bell } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useNotifications } from "@/features/notifications/hooks/use-notifications";
import { Button } from "@/components/ui/button";


const ACTION_LABELS: Record<string, string> = {
  HR_REQUEST_APPROVED: "Employment request approved",
  HR_REQUEST_REJECTED: "Employment request rejected",
  APPOINTMENT_REQUEST_APPROVED: "Appointment request approved",
  APPOINTMENT_REQUEST_REJECTED: "Appointment request rejected",
  ASSIGNED_TO_TRAINING: "Assigned to training",
  PROOF_APPROVED: "Proof submission approved",
  PROOF_REJECTED: "Proof submission rejected",
};

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  const hrs = Math.floor(mins / 60);
  const days = Math.floor(hrs / 24);
  if (days > 0) return `${days}d ago`;
  if (hrs > 0) return `${hrs}h ago`;
  if (mins > 0) return `${mins}m ago`;
  return "just now";
}

export function NotificationPopover() {
  const { notifications, loading, unreadCount, markRead } = useNotifications();
  const [open, setOpen] = useState(false);

  const handleOpen = async (isOpen: boolean) => {
    setOpen(isOpen);
    if (isOpen && unreadCount > 0) {
      await markRead();
    }
  };

  return (
    <Popover open={open} onOpenChange={handleOpen}>
      <PopoverTrigger asChild>
        <button className="relative flex items-center justify-center w-8 h-8 rounded-md hover:bg-accent transition-colors">
          <Bell className="h-4 w-4" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 flex items-center justify-center w-4 h-4 rounded-full bg-red-500 text-white text-[10px] font-bold">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </button>
      </PopoverTrigger>

      <PopoverContent
        side="right"
        align="end"
        className="w-80 p-0 overflow-hidden"
      >
        <div className="flex items-center justify-between px-4 py-3 border-b">
          <h3 className="text-sm font-semibold">Notifications</h3>
          {unreadCount > 0 && (
            <span className="text-xs text-muted-foreground">{unreadCount} unread</span>
          )}
        </div>

        <div className="max-h-[400px] overflow-y-auto">
          {loading ? (
            <div className="px-4 py-6 text-center text-sm text-muted-foreground">
              Loading...
            </div>
          ) : notifications.length === 0 ? (
            <div className="px-4 py-6 text-center text-sm text-muted-foreground">
              No notifications yet.
            </div>
          ) : (
            notifications.map((n) => (
              <div
                key={n.id}
                className={`px-4 py-3 border-b last:border-0 transition-colors ${
                  !n.read_at ? "bg-blue-50 dark:bg-blue-950/20" : ""
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm ${!n.read_at ? "font-semibold" : "font-medium"}`}>
                      {ACTION_LABELS[n.action] ?? n.action}
                    </p>
                    {n.message && (
                      <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
                        {n.message}
                      </p>
                    )}
                    {n.meta?.note && (
                      <p className="text-xs text-muted-foreground mt-0.5 italic">
                        Note: {String(n.meta.note)}
                      </p>
                    )}
                  </div>
                  <div className="flex flex-col items-end gap-1 shrink-0">
                    <span className="text-[10px] text-muted-foreground whitespace-nowrap">
                      {timeAgo(n.created_at)}
                    </span>
                    {!n.read_at && (
                      <span className="w-2 h-2 rounded-full bg-blue-500" />
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}