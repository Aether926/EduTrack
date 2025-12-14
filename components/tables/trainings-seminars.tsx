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
import { useRouter } from "next/navigation";

export type TrainingSeminar = {
    type: string;
    title: string;
    level: string;
    startDate: string;
    endDate: string;
    totalHours: string;
    sponsor: string;
    url: string;
};

export const userTrainingSeminar: TrainingSeminar[] = [
    {
        type: "Training",
        title: "School Titling",
        level: "Division",
        startDate: "2025-12-3",
        endDate: "2025-12-5",
        totalHours: "24",
        sponsor: "DepEd",
        url: "test",
    },
    {
        type: "Seminar",
        title: "Sample Titling",
        level: "District",
        startDate: "2025-12-3",
        endDate: "2025-12-5",
        totalHours: "24",
        sponsor: "DepEd",
        url: "test",
    },
];

// Checkbox column
const selectColumn: ColumnDef<TrainingSeminar> = {
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
const dataColumns: ColumnDef<TrainingSeminar>[] = [
    {
        accessorKey: "type",
        header: ({ column }) => (
            <Button
                variant="ghost"
                onClick={() =>
                    column.toggleSorting(column.getIsSorted() === "asc")
                }
            >
                Type
                <ArrowUpDown />
            </Button>
        ),
        cell: ({ row }) => <div>{row.getValue("type")}</div>,
        size: 120,
    },
    {
        accessorKey: "title",
        header: ({ column }) => (
            <Button
                variant="ghost"
                onClick={() =>
                    column.toggleSorting(column.getIsSorted() === "asc")
                }
            >
                Title
                <ArrowUpDown />
            </Button>
        ),
        cell: ({ row }) => <div>{row.getValue("title")}</div>,
        size: 200,
    },
    {
        accessorKey: "level",
        header: ({ column }) => (
            <Button
                variant="ghost"
                onClick={() =>
                    column.toggleSorting(column.getIsSorted() === "asc")
                }
            >
                Level
                <ArrowUpDown />
            </Button>
        ),
        cell: ({ row }) => (
            <div className="text-center w-full">{row.getValue("level")}</div>
        ),
        size: 120,
    },
    {
        accessorKey: "startDate",
        header: ({ column }) => (
            <Button
                variant="ghost"
                onClick={() =>
                    column.toggleSorting(column.getIsSorted() === "asc")
                }
            >
                Start Date
                <ArrowUpDown />
            </Button>
        ),
        cell: ({ row }) => (
            <div className="text-center w-full">
                {row.getValue("startDate")}
            </div>
        ),
        size: 130,
    },
    {
        accessorKey: "endDate",
        header: ({ column }) => (
            <Button
                variant="ghost"
                onClick={() =>
                    column.toggleSorting(column.getIsSorted() === "asc")
                }
            >
                End Date
                <ArrowUpDown />
            </Button>
        ),
        cell: ({ row }) => (
            <div className="text-center w-full">{row.getValue("endDate")}</div>
        ),
        size: 130,
    },
    {
        accessorKey: "totalHours",
        header: ({ column }) => (
            <Button
                variant="ghost"
                onClick={() =>
                    column.toggleSorting(column.getIsSorted() === "asc")
                }
            >
                Total Hours
                <ArrowUpDown />
            </Button>
        ),
        cell: ({ row }) => (
            <div className="text-center w-full">
                {row.getValue("totalHours")}
            </div>
        ),
        size: 120,
    },
    {
        accessorKey: "sponsor",
        header: ({ column }) => (
            <Button
                variant="ghost"
                onClick={() =>
                    column.toggleSorting(column.getIsSorted() === "asc")
                }
            >
                Sponsoring Agency
                <ArrowUpDown />
            </Button>
        ),
        cell: ({ row }) => <div>{row.getValue("sponsor")}</div>,
        size: 180,
    },
];

// Actions column
const actionsColumn: ColumnDef<TrainingSeminar> = {
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
                    <DropdownMenuItem>Accept</DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem>Deny</DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        </div>
    ),
    size: 60,
    minSize: 60,
    maxSize: 60,
};

interface TrainingSeminarsProps {
    isAdmin?: boolean;
    role?: "ADMIN" | "TEACHER"; // Add role prop
}

export default function TrainingSeminars({
    isAdmin = false,
    role,
}: TrainingSeminarsProps) {
    const router = useRouter();

    const handleAdd = () => {
        router.push("/training/add");
        console.log("Add new training/seminar");
    };

    const handleDelete = (selectedRows: TrainingSeminar[]) => {
        console.log("Deleting:", selectedRows);
        // Implement your delete logic here
    };

    // Determine if user has management permissions
    // Only allow if explicitly ADMIN
    const canManage = role === "ADMIN" || isAdmin === true;

    return (
        <DataTable
            data={userTrainingSeminar}
            selectColumn={selectColumn}
            dataColumns={dataColumns}
            actionsColumn={actionsColumn}
            enableSelection={true} // Always show checkboxes
            enableActions={canManage} // Only show actions for admins
            filterColumn="title"
            filterPlaceholder="Filter trainings..."
            pageSize={8}
            showAddButton={true} // Show add button for all users
            showDeleteButton={true} // Show delete button only when isAdmin is true
            onAddClick={handleAdd}
            onDeleteClick={handleDelete}
            getRowUrl={(row) => row.url}
            isAdmin={canManage} // Only true for ADMIN role
        />
    );
}
