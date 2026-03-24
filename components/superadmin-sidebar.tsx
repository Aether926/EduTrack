"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { motion } from "framer-motion";
import {
    LayoutDashboard,
    Users,
    ChevronLeft,
    ChevronUp,
    User2,
    Shield,
    Archive,
} from "lucide-react";

import {
    Sidebar,
    SidebarContent,
    SidebarGroup,
    SidebarGroupContent,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarFooter,
    useSidebar,
} from "@/components/ui/sidebar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
    DropdownMenu,
    DropdownMenuTrigger,
    DropdownMenuContent,
    DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { ThemeToggle } from "@/components/theme-toggle";
import { logSignOut } from "@/app/actions/auth-log-actions";

const NAV_ITEMS = [
    { title: "Dashboard", url: "/superadmin/dashboard", icon: LayoutDashboard },
    { title: "User Management", url: "/superadmin/users", icon: Users },
    { title: "Archive",         url: "/superadmin/archive",   icon: Archive },
];

type SuperadminSidebarProps = {
    displayName: string;
    email: string;
};

export default function SuperadminSidebar({
    displayName,
    email,
}: SuperadminSidebarProps) {
    const pathname = usePathname();
    const router = useRouter();
    const { toggleSidebar } = useSidebar();

    async function handleSignOut() {
        await logSignOut();
        await supabase.auth.signOut({ scope: "local" });
        router.push("/signin");
    }

    const container = {
        hidden: { opacity: 1 },
        show: {
            opacity: 1,
            transition: { staggerChildren: 0.045, delayChildren: 0.02 },
        },
    };

    const child = {
        hidden: { opacity: 0, x: -10 },
        show:   { opacity: 1, x: 0 },
    };

    return (
        <Sidebar collapsible="offcanvas" variant="sidebar">
            <SidebarContent className="relative flex h-full flex-col">

                {/* ── Header ── */}
                <div className="px-3 pt-3">
                    <div className="flex items-center justify-between gap-2">
                        <div className="flex min-w-0 items-center gap-2">
                            <div className="grid h-9 w-9 place-items-center rounded-md border bg-rose-500/10 border-rose-500/20">
                                <Shield className="h-4 w-4 text-rose-400" />
                            </div>
                            <div className="min-w-0">
                                <div className="truncate text-sm font-semibold">
                                    EDUTRACK
                                </div>
                                <div className="truncate text-xs text-rose-400 font-medium">
                                    SUPERADMIN
                                </div>
                            </div>
                        </div>
                        <button
                            onClick={toggleSidebar}
                            className="grid h-9 w-9 place-items-center rounded-md hover:bg-accent lg:hidden"
                            aria-label="Close sidebar"
                        >
                            <ChevronLeft className="h-5 w-5" />
                        </button>
                    </div>

                    <Separator className="mt-4" />
                </div>

                {/* ── Nav items ── */}
                <ScrollArea className="flex-1 px-2">
                    <div className="pb-4 pt-2">
                        <SidebarGroup>
                            <div className="px-2 pb-2 text-xs font-medium text-muted-foreground">
                                Superadmin
                            </div>
                            <SidebarGroupContent>
                                <SidebarMenu>
                                    <motion.div
                                        variants={container}
                                        initial="hidden"
                                        animate="show"
                                        className="space-y-1"
                                    >
                                        {NAV_ITEMS.map((item) => {
                                            const active = pathname.startsWith(item.url);
                                            const Icon = item.icon;
                                            return (
                                                <SidebarMenuItem key={item.url}>
                                                    <motion.div
                                                        variants={child}
                                                        whileHover={{ x: 2 }}
                                                        transition={{
                                                            type: "spring",
                                                            stiffness: 450,
                                                            damping: 28,
                                                        }}
                                                    >
                                                        <SidebarMenuButton
                                                            asChild
                                                            className={[
                                                                "group relative w-full justify-start transition-colors",
                                                                active
                                                                    ? "bg-rose-500/10 text-rose-400 border border-rose-500/20"
                                                                    : "hover:bg-accent/60",
                                                            ].join(" ")}
                                                        >
                                                            <Link
                                                                href={item.url}
                                                                prefetch={false}
                                                                className="flex items-center gap-3"
                                                            >
                                                                <Icon
                                                                    className={[
                                                                        "h-4 w-4 transition-transform duration-200 group-hover:translate-x-[1px]",
                                                                        active
                                                                            ? "text-rose-400"
                                                                            : "text-muted-foreground",
                                                                    ].join(" ")}
                                                                />
                                                                <span className="truncate">
                                                                    {item.title}
                                                                </span>
                                                            </Link>
                                                        </SidebarMenuButton>
                                                    </motion.div>
                                                </SidebarMenuItem>
                                            );
                                        })}
                                    </motion.div>
                                </SidebarMenu>
                            </SidebarGroupContent>
                        </SidebarGroup>
                    </div>
                </ScrollArea>
            </SidebarContent>

            {/* ── Footer ── */}
            <SidebarFooter className="border-t">
                <div className="px-2 py-2">
                    <DropdownMenu>
                        <div className="flex items-center gap-2">
                            <DropdownMenuTrigger asChild>
                                <SidebarMenuButton className="w-full justify-start">
                                    <User2 className="h-4 w-4 text-muted-foreground" />
                                    <div className="ml-2 flex min-w-0 flex-col items-start">
                                        <span className="truncate text-sm font-semibold">
                                            {displayName}
                                        </span>
                                        <div className="flex items-center gap-1.5">
                                            <span className="truncate text-xs text-muted-foreground">
                                                {email || "—"}
                                            </span>
                                        </div>
                                    </div>
                                    <ChevronUp className="ml-auto h-4 w-4 text-muted-foreground" />
                                </SidebarMenuButton>
                            </DropdownMenuTrigger>

                            <div className="shrink-0">
                                <ThemeToggle />
                            </div>
                        </div>

                        <DropdownMenuContent
                            side="top"
                            align="end"
                            className="w-56"
                        >
                            <DropdownMenuItem
                                onClick={() => router.push("/superadmin/settings")}
                            >
                                Settings
                            </DropdownMenuItem>
                            <DropdownMenuItem
                                onClick={handleSignOut}
                                className="text-rose-400 focus:text-rose-400 focus:bg-rose-500/10"
                            >
                                Sign Out
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </SidebarFooter>
        </Sidebar>
    );
}