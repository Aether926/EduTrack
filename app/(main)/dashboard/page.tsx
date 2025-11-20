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

import { Calendar, Home, Inbox, Search, Settings } from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";

// Sidebar items
const items = [
    {
        title: "Home",
        url: "test1",
        icon: Home,
    },
    {
        title: "Profiles",
        url: "test2",
        icon: Inbox,
    },
    {
        title: "Training/Seminar Records",
        url: "test3",
        icon: Calendar,
    },
];

// Admin items
const admin = [
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
                                className="group/collapsible flex flex-col gap-2"
                            >
                                <SidebarGroup>
                                    {/* ---------- Sidebar Functions ---------- */}
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
                                    {/* ---------- Admin Functions ---------- */}
                                    {admin.map((item, index) => {
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
                                                                (
                                                                    child,
                                                                    index
                                                                ) => (
                                                                    <DropdownRedirect
                                                                        key={
                                                                            index
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
                                        );
                                    })}
                                </SidebarGroup>
                            </Collapsible>
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>
                <SidebarFooter>
                    <SidebarMenu>
                        <SidebarMenuItem>
                            <DropdownMenu>
                                <div className="flex flex-row">
                                    <DropdownMenuTrigger asChild>
                                        <SidebarMenuButton className="flex items-center gap-2 w-full">
                                            <User2 />
                                            <span>Username</span>
                                            <ChevronUp className="ml-auto" />
                                        </SidebarMenuButton>
                                    </DropdownMenuTrigger>
                                    <ThemeToggle></ThemeToggle>
                                </div>

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

// export function AppSidebar() {
//     return (
//         <Sidebar>
//             <SidebarContent>
//                 <SidebarGroup>
//                     <SidebarGroupLabel>Application</SidebarGroupLabel>
//                 </SidebarGroup>
//             </SidebarContent>
//         </Sidebar>
//     );
// }
