/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useRef } from "react";
import { Bell } from "lucide-react";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { useNotifications } from "@/features/notifications/hooks/use-notifications";
import { getDisplayMessage } from "@/features/dashboard/component/activity-feed";

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

export function NotificationPopover({ viewerId }: { viewerId: string }) {
    const { notifications, loading, unreadCount, markRead } =
        useNotifications();
    const [open, setOpen] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);

    const handleOpen = async (isOpen: boolean) => {
        setOpen(isOpen);
        if (isOpen && unreadCount > 0) await markRead();
    };

    const stopPropagation = (e: React.TouchEvent) => e.stopPropagation();

    return (
        <>
            {/* Thin scrollbar style — applied globally but scoped by class */}
            <style>{`
        .notif-scroll::-webkit-scrollbar {
          width: 4px;
        }
        .notif-scroll::-webkit-scrollbar-track {
          background: transparent;
        }
        .notif-scroll::-webkit-scrollbar-thumb {
          background-color: hsl(var(--border));
          border-radius: 999px;
        }
        .notif-scroll {
          scrollbar-width: thin;
          scrollbar-color: hsl(var(--border)) transparent;
        }
      `}</style>

            <Popover open={open} onOpenChange={handleOpen}>
                <PopoverTrigger asChild>
                    <button
                        className={`relative flex items-center justify-center w-8 h-8 rounded-md transition-all duration-150 ${
                            open
                                ? "bg-blue-500/15 text-blue-400 ring-1 ring-blue-500/30"
                                : "hover:bg-accent text-muted-foreground hover:text-foreground"
                        }`}
                    >
                        <Bell
                            className={`h-4 w-4 transition-transform duration-150 ${open ? "scale-110" : ""}`}
                        />
                        {unreadCount > 0 && (
                            <span className="absolute -top-1 -right-1 flex items-center justify-center w-4 h-4 rounded-full bg-red-500 text-white text-[10px] font-bold">
                                {unreadCount > 9 ? "9+" : unreadCount}
                            </span>
                        )}
                    </button>
                </PopoverTrigger>

                <PopoverContent
                    side="top"
                    align="end"
                    sideOffset={8}
                    className="p-0 flex flex-col overflow-hidden"
                    style={{
                        width: "300px",
                        marginLeft: "1rem",
                        maxHeight: "min(400px, calc(100svh - 180px))",
                    }}
                >
                    {/* Header */}
                    <div className="flex items-center justify-between px-4 py-3 border-b shrink-0">
                        <h3 className="text-sm font-semibold">Notifications</h3>
                        {unreadCount > 0 && (
                            <span className="text-xs text-muted-foreground">
                                {unreadCount} unread
                            </span>
                        )}
                    </div>

                    {/* Scrollable list */}
                    <div
                        ref={scrollRef}
                        onTouchStart={stopPropagation}
                        onTouchMove={stopPropagation}
                        onPointerDownCapture={(e) => e.stopPropagation()}
                        className="notif-scroll overflow-y-auto overscroll-contain flex-1"
                        style={
                            {
                                WebkitOverflowScrolling: "touch",
                            } as React.CSSProperties
                        }
                    >
                        {loading ? (
                            <div className="px-4 py-6 text-center text-sm text-muted-foreground">
                                Loading...
                            </div>
                        ) : notifications.length === 0 ? (
                            <div className="px-4 py-6 text-center text-sm text-muted-foreground">
                                No notifications yet.
                            </div>
                        ) : (
                            notifications.map((n) => {
                                const feedRow = {
                                    ...n,
                                    actor_id: n.actor_id ?? null,
                                    target_user_id:
                                        n.target_user_id ?? undefined,
                                };
                                const msg = viewerId
                                    ? getDisplayMessage(
                                          feedRow as any,
                                          viewerId,
                                      )
                                    : n.message || n.action;

                                return (
                                    <div
                                        key={n.id}
                                        className={`px-4 py-3 border-b last:border-0 transition-colors ${
                                            !n.read_at
                                                ? "bg-blue-50 dark:bg-blue-950/20"
                                                : ""
                                        }`}
                                    >
                                        <div className="flex items-start justify-between gap-3">
                                            <div className="flex-1 min-w-0">
                                                <p
                                                    className={`text-sm leading-snug ${!n.read_at ? "font-semibold" : "font-medium"}`}
                                                >
                                                    {msg}
                                                </p>
                                            </div>
                                            <div className="flex flex-col items-end gap-1 shrink-0 pt-0.5">
                                                <span className="text-[10px] text-muted-foreground whitespace-nowrap">
                                                    {timeAgo(n.created_at)}
                                                </span>
                                                {!n.read_at && (
                                                    <span className="w-2 h-2 rounded-full bg-blue-500" />
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>
                </PopoverContent>
            </Popover>
        </>
    );
}
