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
];

const trainingSeminarColumns: ColumnDef<TrainingSeminar>[] = [
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

// Add and Delete Function
export default function TrainingSeminars() {
    const router = useRouter();

    const handleAdd = () => {
        router.push("/training/add");
        console.log("Add new training/seminar");
    };

    const handleDelete = (selectedRows: TrainingSeminar[]) => {
        console.log("Deleting:", selectedRows);
    };

    return (
        <DataTable
            data={userTrainingSeminar}
            columns={trainingSeminarColumns}
            filterColumn="title"
            filterPlaceholder="Filter trainings..."
            pageSize={8}
            showAddButton={true}
            showDeleteButton={true}
            onAddClick={handleAdd}
            onDeleteClick={handleDelete}
            getRowUrl={(row) => row.url}
        />
    );
}
