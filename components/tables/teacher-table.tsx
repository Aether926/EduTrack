"use client";

import { DataTable } from "@/components/tables/data-table";
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

export type Teacher = {
    employeeid: string;
    fullname: string;
    position: string;
    contact: string;
    email: string;
    url: string;
};

const teacherData: Teacher[] = [
    {
        employeeid: "EID-2024011523",
        fullname: "Maria Angelica Reyes",
        position: "Senior High School Teacher II",
        contact: "09171234567",
        email: "mareyes@school.edu.ph",
        url: "test",
    },
    {
        employeeid: "EID-2023082944",
        fullname: "John Carlo D. Santos",
        position: "ICT Coordinator",
        contact: "09183456712",
        email: "jcsantos@school.edu.ph",
        url: "test",
    },
    {
        employeeid: "EID-2023100879",
        fullname: "Louise Anne T. Cruz",
        position: "Guidance Counselor",
        contact: "09281234567",
        email: "lacruz@school.edu.ph",
        url: "test",
    },
    {
        employeeid: "EID-2022125648",
        fullname: "Patrick Joseph Mendoza",
        position: "Administrative Assistant II",
        contact: "09061239876",
        email: "pjmendoza@school.edu.ph",
        url: "test",
    },
    {
        employeeid: "EID-2024053121",
        fullname: "Kimberly Joy Flores",
        position: "Master Teacher I",
        contact: "09351236789",
        email: "kjflores@school.edu.ph",
        url: "test",
    },
];

const columns: ColumnDef<Teacher>[] = [
    {
        id: "select",
        header: ({ table }) => (
            <Checkbox
                checked={
                    table.getIsAllPageRowsSelected() ||
                    (table.getIsSomePageRowsSelected() && "indeterminate")
                }
                onCheckedChange={(value) =>
                    table.toggleAllPageRowsSelected(!!value)
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
        size: 40,
        minSize: 40,
        maxSize: 40,
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
        size: 150,
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
        size: 200,
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
        size: 250,
    },
    {
        accessorKey: "contact",
        header: () => <div>Contact Number</div>,
        cell: ({ row }) => <div>{row.getValue("contact")}</div>,
        size: 150,
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
        size: 220,
    },
    {
        id: "actions",
        enableHiding: false,
        cell: () => (
            <div className="flex justify-end">
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                            <span className="sr-only">Open menu</span>
                            <MoreHorizontal />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuItem>Edit</DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem>Delete</DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        ),
        size: 60,
        minSize: 60,
        maxSize: 60,
    },
];

interface TeacherTableProps {
    isAdmin?: boolean;
    role?: "ADMIN" | "TEACHER";
}

export default function TeacherTable({
    isAdmin = false,
    role,
}: TeacherTableProps) {
    const canManage = role === "ADMIN" || isAdmin || !role;

    const handleAdd = (selectedRows: Teacher[]) => {
        
    };

    const handleDelete = (selectedRows: Teacher[]) => {
        
    };

    return (
        <DataTable
            data={teacherData}
            columns={columns}
            filterColumn="fullname"
            filterPlaceholder="Filter names..."
            pageSize={8}
            showAddButton={canManage}
            showDeleteButton={canManage}
            onAddClick={handleAdd}
            onDeleteClick={handleDelete}
            getRowUrl={(row) => row.url}
        />
    );
}
