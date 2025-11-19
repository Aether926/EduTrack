import { redirect } from "next/navigation";

import { User2, ChevronDown, ChevronUp, MoreHorizontal } from "lucide-react";

import {
    Sidebar,
    SidebarContent,
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel,
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

// Sidebar items.
const items = [
    {
        title: "Profiles",
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
        title: "Training and Seminars",
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
    {
        title: "Nationality",
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

// Footer items
const footer = [
    {
        children: [
            {
                title: "Account",
                path: "test1",
            },
            {
                title: "Sign Out",
                path: "logIn",
            },
        ],
    },
];

export default function AppSidebar() {
    return (
        <Sidebar>
            <SidebarContent className="flex flex-col justify-between">
                <SidebarGroup>
                    {/* <SidebarGroupLabel className="text-xl">
                        Application
                    </SidebarGroupLabel> */}
                    <SidebarGroupContent>
                        <SidebarMenu>
                            <Collapsible
                                defaultOpen
                                className="group/collapsible"
                            >
                                {/* ---------- Admin Functions ---------- */}
                                {items.map((item, index) => {
                                    return (
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
                                                            (child, index) => (
                                                                <DropdownRedirect
                                                                    key={index}
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
                                    );
                                })}
                            </Collapsible>
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>
                <SidebarFooter>
                    <SidebarMenu>
                        <SidebarMenuItem>
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <SidebarMenuButton className="flex items-center gap-2 w-full">
                                        <User2 />
                                        <span>Username</span>
                                        <ChevronUp className="ml-auto" />
                                    </SidebarMenuButton>
                                </DropdownMenuTrigger>

                                {footer.map((item, index) => (
                                    <DropdownMenuContent
                                        key={index}
                                        side="top"
                                        align="end"
                                        className="w-[--radix-popper-anchor-width]"
                                    >
                                        {item.children.map(
                                            (child, childIndex) => (
                                                <DropdownRedirect
                                                    key={childIndex}
                                                    path={child.path}
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
            </SidebarContent>
        </Sidebar>
    );
}
