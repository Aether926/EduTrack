"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";
import {
    User2,
    ChevronUp,
    MoreHorizontal,
    Calendar,
    Home,
    Inbox,
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
} from "@/components/ui/sidebar";

import {
    DropdownMenu,
    DropdownMenuTrigger,
    DropdownMenuContent,
} from "@/components/ui/dropdown-menu";

import { Collapsible } from "@/components/ui/collapsible";
import DropdownRedirect from "@/components/dropdown-redirect";
import { ThemeToggle } from "@/components/theme-toggle";

import Link from "next/link";

export default function AppSidebar() {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [user, setUser] = useState<any>(null);
    const router = useRouter();

    useEffect(() => {
        supabase.auth.getSession().then(({ data }) => {
            if (data.session?.user) setUser(data.session.user);
        });
    }, []);

    async function handleSignOut() {
        await supabase.auth.signOut();
        router.push("/signin");
    }

    const items = [
        { title: "Home", url: "dashboard", icon: Home },
        { title: "Profiles", url: "teacher-profiles", icon: Inbox },
        {
            title: "Training / Seminar Records",
            url: "professional-dev",
            icon: Calendar,
        },
    ];

    // Admin items
    const admin = [
        {
            title: "Account Approval",
            path: "account-approval",
        },
        {
            title: "Add Trainings / Seminars",
            path: "add-training-seminar",
        },
    ];

    const adminData = [
        {
            title: "Positions / Designations",
            children: [
                {
                    title: "Add",
                    path: "test1",
                },
                {
                    title: "Edit",
                    path: "test2",
                },
                {
                    title: "Delete",
                    path: "test3",
                },
            ],
        },
        {
            title: "Religion",
            children: [
                {
                    title: "Add",
                    path: "test1",
                },
                {
                    title: "Edit",
                    path: "test2",
                },
                {
                    title: "Delete",
                    path: "test3",
                },
            ],
        },
    ];

    const footer = [
        {
            children: [
                { title: "Account", path: "profile" },
                { title: "Sign Out", path: "logIn" },
            ],
        },
    ];

    return (
        <Sidebar>
            <SidebarContent className="flex flex-col justify-between">
                <SidebarGroup>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            <Collapsible
                                defaultOpen
                                className="group/collapsible flex flex-col gap-2"
                            >
                                <SidebarGroup>
                                    {items.map((item) => (
                                        <SidebarMenuItem key={item.title}>
                                            <SidebarMenuButton asChild>
                                                <a href={item.url}>
                                                    <item.icon />
                                                    <span>{item.title}</span>
                                                </a>
                                            </SidebarMenuButton>
                                        </SidebarMenuItem>
                                    ))}
                                </SidebarGroup>

                                <SidebarGroup>
                                    <p>Extra Functions</p>
                                    {admin.map((item, index) => (
                                        <SidebarMenuItem key={index}>
                                            <SidebarMenuButton
                                                asChild
                                                className="flex-1 justify-start"
                                            >
                                                <Link href={`/${item.path}`}>
                                                    {item.title}
                                                </Link>
                                            </SidebarMenuButton>
                                        </SidebarMenuItem>
                                    ))}

                                    {adminData.map((item, index) => (
                                        <SidebarMenuItem key={index}>
                                            <div className="flex items-center justify-between w-full">
                                                <SidebarMenuButton className="flex-1 justify-start">
                                                    {item.title}
                                                </SidebarMenuButton>
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger
                                                        asChild
                                                    >
                                                        <button className="h-8 w-8 flex items-center justify-center rounded-md hover:bg-accent">
                                                            <MoreHorizontal className="h-4 w-4" />
                                                        </button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent
                                                        side="right"
                                                        align="start"
                                                    >
                                                        {item.children.map(
                                                            (
                                                                child,
                                                                childIndex
                                                            ) => (
                                                                <DropdownRedirect
                                                                    key={
                                                                        childIndex
                                                                    }
                                                                    path={
                                                                        child.path
                                                                    }
                                                                >
                                                                    {
                                                                        child.title
                                                                    }
                                                                </DropdownRedirect>
                                                            )
                                                        )}
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </div>
                                        </SidebarMenuItem>
                                    ))}
                                </SidebarGroup>
                            </Collapsible>
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>

                <SidebarFooter>
                    <SidebarMenu>
                        <SidebarFooter>
                            <SidebarMenu>
                                <SidebarMenuItem>
                                    <DropdownMenu>
                                        {/* Wrapper so we can use group-hover for the popup */}
                                        <div className="relative group flex flex-row w-full items-start gap-1 p-1">
                                            {/* Hover popup with email + ID */}
                                            <div
                                                className="
                            pointer-events-none
                            absolute left-2 bottom-12 z-50
                            w-max max-w-[260px]
                            rounded-md border bg-popover px-3 py-2
                            text-xs text-popover-foreground shadow-md
                            opacity-0 translate-y-1
                            group-hover:opacity-100 group-hover:translate-y-0
                            transition-all duration-150
                        "
                                            >
                                                <p className="font-semibold">
                                                    {user?.user_metadata
                                                        ?.username ||
                                                        "Username"}
                                                </p>
                                                <p className="break-all">
                                                    {user?.email ||
                                                        "email@example.com"}
                                                </p>
                                                <p className="break-all text-[10px] text-muted-foreground">
                                                    {user?.id || "User ID"}
                                                </p>
                                            </div>

                                            <DropdownMenuTrigger asChild>
                                                <SidebarMenuButton className="flex items-center gap-1 w-full justify-start p-2">
                                                    <User2 className="h-5 w-5" />
                                                    <div className="flex flex-col items-start ml-3">
                                                        <span className="font-semibold text-sm">
                                                            {user?.user_metadata
                                                                ?.username ||
                                                                "Username"}
                                                        </span>
                                                    </div>
                                                    <ChevronUp className="ml-auto h-4 w-4" />
                                                </SidebarMenuButton>
                                            </DropdownMenuTrigger>

                                            <ThemeToggle />
                                        </div>

                                        {footer.map((item, index) => (
                                            <DropdownMenuContent
                                                key={index}
                                                side="top"
                                                align="end"
                                                className="w-[--radix-popper-anchor-width]"
                                            >
                                                {item.children.map(
                                                    (child, childIndex) =>
                                                        child.title ===
                                                        "Sign Out" ? (
                                                            <SidebarMenuButton
                                                                key={childIndex}
                                                                className="w-full text-left px-2 py-1"
                                                                onClick={
                                                                    handleSignOut
                                                                }
                                                            >
                                                                {child.title}
                                                            </SidebarMenuButton>
                                                        ) : (
                                                            <DropdownRedirect
                                                                key={childIndex}
                                                                path={
                                                                    child.path
                                                                }
                                                            >
                                                                {child.title}
                                                            </DropdownRedirect>
                                                        )
                                                )}
                                            </DropdownMenuContent>
                                        ))}
                                    </DropdownMenu>
                                </SidebarMenuItem>
                            </SidebarMenu>
                        </SidebarFooter>
                    </SidebarMenu>
                </SidebarFooter>
            </SidebarContent>
        </Sidebar>
    );
}
