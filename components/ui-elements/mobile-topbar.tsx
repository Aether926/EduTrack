"use client";

import Link from "next/link";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { NotificationPopover } from "@/features/notifications/components/notification-popover";
import { ThemeToggle } from "@/components/ui-elements/theme-toggle";

type MobileTopbarProps = {
    userId: string;
    displayName: string;
};

export function MobileTopbar({ userId, displayName }: MobileTopbarProps) {
    return (
        <div className="lg:hidden sticky top-0 z-40 flex h-12 items-center justify-between border-b border-border/60 bg-background/95 backdrop-blur px-3">
            {/* Left: hamburger + app name */}
            <div className="flex items-center gap-2">
                <SidebarTrigger className="h-8 w-8" />
                <Link href="/dashboard" className="flex items-center gap-2">
                    <div className="grid h-6 w-6 place-items-center rounded-md border bg-card text-xs">
                        📚
                    </div>
                    <span className="text-sm font-semibold">EduTrack</span>
                </Link>
            </div>

            {/* Right: notifications + theme */}
            <div className="flex items-center gap-1">
                <NotificationPopover viewerId={userId} />
                <ThemeToggle />
            </div>
        </div>
    );
}
