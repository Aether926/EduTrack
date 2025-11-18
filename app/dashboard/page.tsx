import { ChevronDown, MoreHorizontal } from "lucide-react";

import {
    Sidebar,
    SidebarContent,
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from "@/components/ui/sidebar";

import {
    DropdownMenu,
    DropdownMenuTrigger,
    DropdownMenuContent,
    DropdownMenuItem,
} from "@/components/ui/dropdown-menu";

import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from "@/components/ui/collapsible";
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
];

export default function AppSidebar() {
    return (
        <Sidebar>
            <SidebarContent>
                <SidebarGroup>
                    <SidebarGroupLabel className="text-xl">
                        Application
                    </SidebarGroupLabel>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            <Collapsible
                                defaultOpen
                                className="group/collapsible"
                            >
                                {items.map((item, index) => {
                                    console.log(item);

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
                                {/* ---------- Positions / Designations ---------- */}
                                <SidebarMenuItem>
                                    <Collapsible className="group w-full">
                                        <div className="flex items-center justify-between w-full">
                                            <CollapsibleTrigger asChild>
                                                <SidebarMenuButton className="flex-1 justify-between">
                                                    <span>
                                                        Positions / Designations
                                                    </span>
                                                </SidebarMenuButton>
                                            </CollapsibleTrigger>

                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <button className="h-8 w-8 flex items-center justify-center rounded-md hover:bg-accent">
                                                        <MoreHorizontal className="h-4 w-4" />
                                                    </button>
                                                </DropdownMenuTrigger>

                                                <DropdownMenuContent
                                                    side="right"
                                                    align="start"
                                                >
                                                    <DropdownMenuItem>
                                                        <span>Add</span>
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem>
                                                        <span>Edit</span>
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem>
                                                        <span>Delete</span>
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </div>

                                        <CollapsibleContent>
                                            <div className="pl-6 flex flex-col gap-0 mt-1">
                                                <SidebarMenuButton className="p-0">
                                                    Add
                                                </SidebarMenuButton>
                                                <SidebarMenuButton className="p-0">
                                                    Edit
                                                </SidebarMenuButton>
                                                <SidebarMenuButton className="p-0">
                                                    Delete
                                                </SidebarMenuButton>
                                            </div>
                                        </CollapsibleContent>
                                    </Collapsible>
                                </SidebarMenuItem>

                                {/* ---------- Religion ---------- */}
                                <SidebarMenuItem>
                                    <Collapsible className="group w-full">
                                        <div className="flex items-center justify-between w-full">
                                            <CollapsibleTrigger asChild>
                                                <SidebarMenuButton className="flex-1 justify-between">
                                                    <span>Religion</span>
                                                </SidebarMenuButton>
                                            </CollapsibleTrigger>

                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <button className="h-8 w-8 flex items-center justify-center rounded-md hover:bg-accent">
                                                        <MoreHorizontal className="h-4 w-4" />
                                                    </button>
                                                </DropdownMenuTrigger>

                                                <DropdownMenuContent
                                                    side="right"
                                                    align="start"
                                                >
                                                    <DropdownMenuItem>
                                                        <span>Add</span>
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem>
                                                        <span>Edit</span>
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem>
                                                        <span>Delete</span>
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </div>

                                        <CollapsibleContent>
                                            <div className="pl-6 flex flex-col gap-0 mt-1">
                                                <SidebarMenuButton className="p-0">
                                                    Add
                                                </SidebarMenuButton>
                                                <SidebarMenuButton className="p-0">
                                                    Edit
                                                </SidebarMenuButton>
                                                <SidebarMenuButton className="p-0">
                                                    Delete
                                                </SidebarMenuButton>
                                            </div>
                                        </CollapsibleContent>
                                    </Collapsible>
                                </SidebarMenuItem>

                                {/* ---------- Nationality ---------- */}
                                <SidebarMenuItem>
                                    <Collapsible className="group w-full">
                                        <div className="flex items-center justify-between w-full">
                                            <CollapsibleTrigger asChild>
                                                <SidebarMenuButton className="flex-1 justify-between">
                                                    <span>Nationality</span>
                                                </SidebarMenuButton>
                                            </CollapsibleTrigger>

                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <button className="h-8 w-8 flex items-center justify-center rounded-md hover:bg-accent">
                                                        <MoreHorizontal className="h-4 w-4" />
                                                    </button>
                                                </DropdownMenuTrigger>

                                                <DropdownMenuContent
                                                    side="right"
                                                    align="start"
                                                >
                                                    <DropdownMenuItem>
                                                        <span>Add</span>
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem>
                                                        <span>Edit</span>
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem>
                                                        <span>Delete</span>
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </div>

                                        <CollapsibleContent>
                                            <div className="pl-6 flex flex-col gap-0 mt-1">
                                                <SidebarMenuButton className="p-0">
                                                    Add
                                                </SidebarMenuButton>
                                                <SidebarMenuButton className="p-0">
                                                    Edit
                                                </SidebarMenuButton>
                                                <SidebarMenuButton className="p-0">
                                                    Delete
                                                </SidebarMenuButton>
                                            </div>
                                        </CollapsibleContent>
                                    </Collapsible>
                                </SidebarMenuItem>

                                {/* ---------- Dropdown Example ---------- */}
                                <Collapsible className="group">
                                    <CollapsibleTrigger asChild>
                                        <SidebarMenuButton className="flex items-center justify-between">
                                            <span>Dropdown Example</span>

                                            <ChevronDown className="h-4 w-4 transition-transform duration-200 group-data-[state=open]:rotate-180" />
                                        </SidebarMenuButton>
                                    </CollapsibleTrigger>

                                    <CollapsibleContent>
                                        <div className="pl-6 flex flex-col gap-0">
                                            <SidebarMenuButton className="p-0">
                                                Add
                                            </SidebarMenuButton>
                                            <SidebarMenuButton className="p-0">
                                                Edit
                                            </SidebarMenuButton>
                                            <SidebarMenuButton className="p-0">
                                                Delete
                                            </SidebarMenuButton>
                                        </div>
                                    </CollapsibleContent>
                                </Collapsible>
                            </Collapsible>
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>
            </SidebarContent>
        </Sidebar>
    );
}
