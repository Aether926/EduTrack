/* eslint-disable react-hooks/exhaustive-deps */
"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { supabase } from "@/lib/supabaseClient"; 

import { motion, AnimatePresence } from "framer-motion";
import {
    Home,
    Inbox,
    Calendar,
    ClipboardListIcon,
    ShieldCheck,
    ChevronLeft,
    User2,
    ChevronUp,
    Users,
    UserCheck,
    GraduationCap,
    ClipboardCheck,
    Search,
    FileText,
} from "lucide-react";

import { NotificationPopover } from "@/features/notifications/components/notification-popover";

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

import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";

import {
    DropdownMenu,
    DropdownMenuTrigger,
    DropdownMenuContent,
} from "@/components/ui/dropdown-menu";

import DropdownRedirect from "@/components/dropdown-redirect";
import { ThemeToggle } from "@/components/theme-toggle";
import { logSignOut } from "@/app/actions/auth-log-actions";

type NavItem = {
    title: string;
    url: string;
    icon: React.ComponentType<{ className?: string }>;
    tag?: string;
};

type AdminItem = {
    title: string;
    path: string;
    icon: React.ComponentType<{ className?: string }>;
    tag?: string;
};

type PrincipalItem = {
    title: string;
    path: string;
    icon: React.ComponentType<{ className?: string }>;
    tag?: string;
};

type AppSidebarProps = {
    role: string | null;
    displayName: string;
    email: string;
    userId: string;
};

export default function AppSidebar({
    role: userRole,
    displayName,
    email,
    userId,
}: AppSidebarProps) {
    const [query, setQuery] = useState("");
    const pathname = usePathname();
    const router = useRouter();
    const { toggleSidebar } = useSidebar();

    async function handleSignOut() {
        await logSignOut();
        await supabase.auth.signOut({ scope: "local"});
        router.push("/signin");
    }

    const isAdmin = userRole === "ADMIN";
    const isSuperAdmin = userRole === "SUPERADMIN";

    const items: NavItem[] = [
        { title: "Home", url: "/dashboard", icon: Home },
        { title: "All Profiles", url: "/teacher-profiles", icon: Inbox },
        ...(!isAdmin || isSuperAdmin
            ? ([
                  {
                      title: "Training / Seminar Records",
                      url: "/professional-dev",
                      icon: Calendar,
                  },
                  {
                      title: "My Responsibilities",
                      url: "/responsibilities",
                      icon: ClipboardListIcon,
                  },
                  {
                      title: "My Compliance",
                      url: "/compliance",
                      icon: ShieldCheck,
                  },
                  { title: "Repository", url: "/documents", icon: FileText },
              ] as NavItem[])
            : []),
    ];

    const admin: AdminItem[] = [
        {
            title: "Manage Users",
            path: "admin-actions",
            icon: Users,
        },
        {
            title: "Account Approval",
            path: "account-approval",
            icon: UserCheck,
        },
        {
            title: "Trainings / Seminars",
            path: "add-training-seminar",
            icon: GraduationCap,
        },
        { title: "Attendance", path: "proof-review", icon: ClipboardCheck },
        { title: "Documents", path: "admin-actions/documents", icon: FileText },
    ];

    const principal: PrincipalItem[] = [];

    const filteredMain = useMemo(() => {
        const q = query.trim().toLowerCase();
        if (!q) return items;
        return items.filter((i) => i.title.toLowerCase().includes(q));
    }, [items, query]);

    const filteredAdmin = useMemo(() => {
        const q = query.trim().toLowerCase();
        if (!q) return admin;
        return admin.filter((i) => i.title.toLowerCase().includes(q));
    }, [admin, query]);

    const filteredPrincipal = useMemo(() => {
        const q = query.trim().toLowerCase();
        if (!q) return principal;
        return principal.filter((i) => i.title.toLowerCase().includes(q));
    }, [principal, query]);

    const container = {
        hidden: { opacity: 1 },
        show: {
            opacity: 1,
            transition: { staggerChildren: 0.045, delayChildren: 0.02 },
        },
    };

    const child = {
        hidden: { opacity: 0, x: -10 },
        show: { opacity: 1, x: 0 },
    };

    function NavRow({
        href,
        title,
        Icon,
        active,
        tag,
        count,
    }: {
        href: string;
        title: string;
        Icon: NavItem["icon"];
        active: boolean;
        tag?: string;
        count?: number;
    }) {
        return (
            <SidebarMenuButton
                asChild
                className={[
                    "group relative w-full justify-start transition-colors",
                    active
                        ? "bg-accent text-accent-foreground shadow-sm"
                        : "hover:bg-accent/60",
                ].join(" ")}
            >
                <Link
                    href={href}
                    prefetch={false}
                    className="flex items-center gap-3"
                >
                    <Icon
                        className={[
                            "h-4 w-4 transition-transform duration-200 group-hover:translate-x-[1px]",
                            active
                                ? "text-foreground"
                                : "text-muted-foreground",
                        ].join(" ")}
                    />
                    <span className="truncate">{title}</span>
                    {count && count > 0 ? (
                        <Badge
                            variant="destructive"
                            className="ml-auto shrink-0 text-[10px]"
                        >
                            {count > 99 ? "99+" : count}
                        </Badge>
                    ) : tag ? (
                        <Badge
                            variant="secondary"
                            className="ml-auto hidden shrink-0 text-[10px] sm:inline-flex"
                        >
                            {tag}
                        </Badge>
                    ) : null}
                </Link>
            </SidebarMenuButton>
        );
    }

    return (
        <Sidebar collapsible="offcanvas" variant="sidebar">
            <SidebarContent className="relative flex h-full flex-col">
                {/* header */}
                <div className="px-3 pt-3">
                    <div className="flex items-center justify-between gap-2">
                        <div className="flex min-w-0 items-center gap-2">
                            <div className="grid h-9 w-9 place-items-center rounded-md border bg-card">
                                <span className="text-sm font-semibold">
                                    📚
                                </span>
                            </div>
                            <div className="min-w-0">
                                <div className="truncate text-sm font-semibold">
                                    EDUTRACK
                                </div>
                                <div className="truncate text-xs text-muted-foreground">
                                    {userRole ?? "—"}
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

                    {/* search */}
                    <div className="relative mt-3">
                        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            placeholder="Search menu..."
                            className="pl-9"
                        />
                    </div>

                    {filteredMain.length > 0 && <Separator className="my-4" />}
                </div>

                {/* content */}
                <ScrollArea className="flex-1 px-2">
                    <div className="pb-4">
                        {filteredMain.length > 0 && (
                            <SidebarGroup className={isAdmin ? "pb-0" : ""}>
                                <div className="px-2 pb-2 text-xs font-medium text-muted-foreground">
                                    Main
                                </div>
                                <SidebarGroupContent>
                                    <SidebarMenu>
                                        <motion.div
                                            variants={container}
                                            initial="hidden"
                                            animate="show"
                                            className="space-y-1"
                                        >
                                            {filteredMain.map((item) => {
                                                const active =
                                                    pathname === item.url;
                                                const Icon = item.icon;
                                                return (
                                                    <SidebarMenuItem
                                                        key={item.title}
                                                    >
                                                        <motion.div
                                                            variants={child}
                                                            whileHover={{
                                                                x: 2,
                                                            }}
                                                            transition={{
                                                                type: "spring",
                                                                stiffness: 450,
                                                                damping: 28,
                                                            }}
                                                        >
                                                            <NavRow
                                                                href={item.url}
                                                                title={
                                                                    item.title
                                                                }
                                                                Icon={Icon}
                                                                active={active}
                                                                tag={item.tag}
                                                            />
                                                        </motion.div>
                                                    </SidebarMenuItem>
                                                );
                                            })}
                                        </motion.div>
                                    </SidebarMenu>
                                </SidebarGroupContent>
                            </SidebarGroup>
                        )}

                        {(userRole === "ADMIN" || isSuperAdmin) &&
                        filteredAdmin.length > 0 ? (
                            <>
                                {!isAdmin && <Separator className="my-4" />}
                                <SidebarGroup className={isAdmin ? "pt-0" : ""}>
                                    {!isAdmin && (
                                        <div className="px-2 pb-2 text-xs font-medium text-muted-foreground">
                                            Admin tools
                                        </div>
                                    )}
                                    <SidebarGroupContent>
                                        <SidebarMenu>
                                            <motion.div
                                                variants={container}
                                                initial="hidden"
                                                animate="show"
                                                className="space-y-1"
                                            >
                                                {filteredAdmin.map((item) => {
                                                    const href = `/${item.path}`;
                                                    const active =
                                                        pathname === href;
                                                    const Icon = item.icon;
                                                    return (
                                                        <SidebarMenuItem
                                                            key={item.path}
                                                        >
                                                            <motion.div
                                                                variants={child}
                                                                whileHover={{
                                                                    x: 2,
                                                                }}
                                                                transition={{
                                                                    type: "spring",
                                                                    stiffness: 450,
                                                                    damping: 28,
                                                                }}
                                                            >
                                                                <NavRow
                                                                    href={href}
                                                                    title={
                                                                        item.title
                                                                    }
                                                                    Icon={Icon}
                                                                    active={
                                                                        active
                                                                    }
                                                                    tag={
                                                                        item.tag
                                                                    }
                                                                />
                                                            </motion.div>
                                                        </SidebarMenuItem>
                                                    );
                                                })}
                                            </motion.div>
                                        </SidebarMenu>
                                    </SidebarGroupContent>
                                </SidebarGroup>
                            </>
                        ) : null}

                        {(userRole === "PRINCIPAL" || isSuperAdmin) &&
                        filteredPrincipal.length > 0 ? (
                            <>
                                <Separator className="my-4" />
                                <SidebarGroup>
                                    <div className="px-2 pb-2 text-xs font-medium text-muted-foreground">
                                        Principal tools
                                    </div>
                                    <SidebarGroupContent>
                                        <SidebarMenu>
                                            <motion.div
                                                variants={container}
                                                initial="hidden"
                                                animate="show"
                                                className="space-y-1"
                                            >
                                                {filteredPrincipal.map(
                                                    (item) => {
                                                        const href = item.path;
                                                        const active =
                                                            pathname === href;
                                                        const Icon = item.icon;
                                                        return (
                                                            <SidebarMenuItem
                                                                key={item.path}
                                                            >
                                                                <motion.div
                                                                    variants={
                                                                        child
                                                                    }
                                                                    whileHover={{
                                                                        x: 2,
                                                                    }}
                                                                    transition={{
                                                                        type: "spring",
                                                                        stiffness: 450,
                                                                        damping: 28,
                                                                    }}
                                                                >
                                                                    <NavRow
                                                                        href={
                                                                            href
                                                                        }
                                                                        title={
                                                                            item.title
                                                                        }
                                                                        Icon={
                                                                            Icon
                                                                        }
                                                                        active={
                                                                            active
                                                                        }
                                                                        tag={
                                                                            item.tag
                                                                        }
                                                                    />
                                                                </motion.div>
                                                            </SidebarMenuItem>
                                                        );
                                                    },
                                                )}
                                            </motion.div>
                                        </SidebarMenu>
                                    </SidebarGroupContent>
                                </SidebarGroup>
                            </>
                        ) : null}
                    </div>
                </ScrollArea>
            </SidebarContent>

            {/* footer */}
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
                                        <span className="truncate text-xs text-muted-foreground">
                                            {email || "—"}
                                        </span>
                                    </div>
                                    <ChevronUp className="ml-auto h-4 w-4 text-muted-foreground" />
                                </SidebarMenuButton>
                            </DropdownMenuTrigger>

                            <div className="shrink-0">
                                <NotificationPopover viewerId={userId} />
                            </div>
                            <div className="shrink-0">
                                <ThemeToggle />
                            </div>
                        </div>

                        <DropdownMenuContent
                            side="top"
                            align="end"
                            className="w-56"
                        >
                            <DropdownRedirect path="/profile">
                                Manage Profile
                            </DropdownRedirect>
                            <DropdownRedirect path="/settings">
                                Settings
                            </DropdownRedirect>
                            <button
                                onClick={handleSignOut}
                                className="w-full rounded-md px-2 py-1.5 text-left text-sm hover:bg-accent"
                            >
                                Sign Out
                            </button>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </SidebarFooter>
        </Sidebar>
    );
}
