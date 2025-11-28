"use client";

import { DataTable } from "@/components/data-table";
import { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown, MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export type User = {
    employeeid: string;
    fullname: string;
    position: string;
    contact: string;
    email: string;
    url: string;
};

// Sample Data
const userData: User[] = [
    {
        employeeid: "EID-2023456711",
        fullname: "Hu Tao",
        position: "Funeral Director",
        contact: "09123456789",
        email: "hutao@example.com",
        url: "test",
    },
    {
        employeeid: "EID-2018456792",
        fullname: "Amber",
        position: "Outrider",
        contact: "09123456789",
        email: "amber@example.com",
        url: "test",
    },
];

const userColumns: ColumnDef<User>[] = [
    {
        id: "select",
        header: ({ table }) => (
            <Checkbox
                checked={
                    table.getIsAllRowsSelected() ||
                    (table.getIsSomeRowsSelected() && "indeterminate")
                }
                onCheckedChange={(value) =>
                    table.toggleAllRowsSelected(!!value)
                }
                aria-label="Select all"
            />
        ),
        cell: ({ row }) => (
            <Checkbox
                checked={row.getIsSelected()}
                onCheckedChange={(value) => row.toggleSelected(!!value)}
                aria-label="Select row"
            />
        ),
        enableSorting: false,
        enableHiding: false,
    },
    {
        accessorKey: "employeeid",
        header: ({ column }) => (
            <Button
                variant="ghost"
                onClick={() =>
                    column.toggleSorting(column.getIsSorted() === "asc")
                }
            >
                Employee Id
                <ArrowUpDown />
            </Button>
        ),
        cell: ({ row }) => <div>{row.getValue("employeeid")}</div>,
    },
    {
        accessorKey: "fullname",
        header: ({ column }) => (
            <Button
                variant="ghost"
                onClick={() =>
                    column.toggleSorting(column.getIsSorted() === "asc")
                }
            >
                Full Name
                <ArrowUpDown />
            </Button>
        ),
        cell: ({ row }) => <div>{row.getValue("fullname")}</div>,
    },
    {
        accessorKey: "position",
        header: ({ column }) => (
            <Button
                variant="ghost"
                onClick={() =>
                    column.toggleSorting(column.getIsSorted() === "asc")
                }
            >
                Position
                <ArrowUpDown />
            </Button>
        ),
        cell: ({ row }) => <div>{row.getValue("position")}</div>,
    },
    {
        accessorKey: "contact",
        header: () => <div>Contact Number</div>,
        cell: ({ row }) => <div>{row.getValue("contact")}</div>,
    },
    {
        accessorKey: "email",
        header: ({ column }) => (
            <Button
                variant="ghost"
                onClick={() =>
                    column.toggleSorting(column.getIsSorted() === "asc")
                }
            >
                Email
                <ArrowUpDown />
            </Button>
        ),
        cell: ({ row }) => (
            <div className="lowercase">{row.getValue("email")}</div>
        ),
    },
    {
        id: "actions",
        enableHiding: false,
        cell: () => (
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="h-8 w-8 p-0">
                        <span className="sr-only">Open menu</span>
                        <MoreHorizontal />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                    <DropdownMenuItem>Accept</DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem>Deny</DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        ),
    },
];

export default function RequestTable() {
    const handleAdd = (selectedRows: User[]) => {
        console.log("Accepted:", selectedRows);
        // Add logic here
    };

    const handleDelete = (selectedRows: User[]) => {
        console.log("Denied:", selectedRows);
        // Delete logic here
    };

    return (
        <DataTable
            data={userData}
            columns={userColumns}
            filterColumn="fullname"
            filterPlaceholder="Filter names..."
            pageSize={8}
            showAddButton={true}
            showDeleteButton={true}
            onAddClick={handleAdd}
            onDeleteClick={handleDelete}
            getRowUrl={(row) => row.url}
        />
    );
}
