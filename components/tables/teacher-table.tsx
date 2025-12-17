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

// Sample Data
const teacherData: Teacher[] = [
    {
        employeeid: "EID-6291964",
        fullname: "Marie C. Arcabado",
        position: "",
        contact: "09465366076",
        email: "marie.arcabado@deped.gov.ph",
        url: "test",
    },
    {
        employeeid: "EID-6316236",
        fullname: "Jennifer P. Navarro",
        position: "",
        contact: "09355089855",
        email: "jennifer.navarro029@deped.gov.ph",
        url: "test",
    },
    {
        employeeid: "EID-6295628",
        fullname: "Betsy B. Agang",
        position: "",
        contact: "09353141849",
        email: "betsy.brigilgo@deped.gov.ph",
        url: "test",
    },
    {
        employeeid: "EID-6309679",
        fullname: "Jennifer D. Alba",
        position: "",
        contact: "09638978411",
        email: "jennifer.alba029@deped.gov.ph",
        url: "test",
    },
    {
        employeeid: "EID-6291989",
        fullname: "Jane Irene D. Aligway",
        position: "",
        contact: "09128605600",
        email: "janeirene.aligway029@deped.gov.ph",
        url: "test",
    },
    {
        employeeid: "EID-6309680",
        fullname: "Jornito C. Aniban",
        position: "",
        contact: "09486053195",
        email: "jornito.aniban029@deped.gov.ph",
        url: "test",
    },
    {
        employeeid: "EID-6315840",
        fullname: "Sheila May M. Cabilin",
        position: "",
        contact: "09751580675",
        email: "sheilamay.cabilin029@deped.gov.ph",
        url: "test",
    },
    {
        employeeid: "EID-6306125",
        fullname: "Renante P. Catingub",
        position: "",
        contact: "09271964751",
        email: "renante.catingub029@deped.gov.ph",
        url: "test",
    },
    {
        employeeid: "EID-6295296",
        fullname: "Jemelyn C. Cecilio",
        position: "",
        contact: "09207508614",
        email: "jemelyn.cecilio@deped.gov.ph",
        url: "test",
    },
    {
        employeeid: "EID-6311397",
        fullname: "Marielle Dominique G. De La Cruz",
        position: "",
        contact: "09121615370",
        email: "marielledominique.delacruz029@deped.gov.ph",
        url: "test",
    },
];

// Checkbox column
const selectColumn: ColumnDef<Teacher> = {
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
};

// Data columns
const dataColumns: ColumnDef<Teacher>[] = [
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
];

// Actions column
const actionsColumn: ColumnDef<Teacher> = {
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
};

interface TeacherTableProps {
    isAdmin?: boolean;
    role?: "ADMIN" | "TEACHER"; // Add role prop
}

export default function TeacherTable({
    isAdmin = false,
    role,
}: TeacherTableProps) {
    const handleAdd = (selectedRows: Teacher[]) => {
        console.log("Adding:", selectedRows);
        // Implement your add logic here
    };

    const handleDelete = (selectedRows: Teacher[]) => {
        console.log("Deleting:", selectedRows);
        // Implement your delete logic here
    };

    // Determine if user has management permissions
    // Enable if: role is ADMIN OR isAdmin is true OR role is not specified (default to enabled)
    const canManage = role === "ADMIN" || isAdmin || !role;

    return (
        <DataTable
            data={teacherData}
            selectColumn={selectColumn}
            dataColumns={dataColumns}
            actionsColumn={actionsColumn}
            enableSelection={false} // Checkbox hidden
            enableActions={canManage} // Only disable if explicitly TEACHER
            filterColumn="fullname"
            filterPlaceholder="Filter names..."
            pageSize={8}
            showAddButton={canManage}
            showDeleteButton={canManage}
            onAddClick={handleAdd}
            onDeleteClick={handleDelete}
            getRowUrl={(row) => row.url}
            isAdmin={isAdmin}
        />
    );
}
