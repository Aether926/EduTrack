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
    id: string;
    title: string;
    trainer: string;
    date: string;
    location: string;
    participants: number;
    url: string;
};

const trainingData: TrainingSeminar[] = [
    {
        id: "TS-2024001",
        title: "Advanced Teaching Methods",
        trainer: "Dr. Smith",
        date: "2024-03-15",
        location: "Conference Room A",
        participants: 25,
        url: "/training/1",
    },
    {
        id: "TS-2024002",
        title: "Digital Classroom Integration",
        trainer: "Prof. Johnson",
        date: "2024-03-20",
        location: "Virtual",
        participants: 40,
        url: "/training/2",
    },
];

const trainingColumns: ColumnDef<TrainingSeminar>[] = [
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
        accessorKey: "id",
        header: ({ column }) => (
            <Button
                variant="ghost"
                onClick={() =>
                    column.toggleSorting(column.getIsSorted() === "asc")
                }
            >
                Training ID
                <ArrowUpDown />
            </Button>
        ),
        cell: ({ row }) => <div>{row.getValue("id")}</div>,
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
        accessorKey: "trainer",
        header: ({ column }) => (
            <Button
                variant="ghost"
                onClick={() =>
                    column.toggleSorting(column.getIsSorted() === "asc")
                }
            >
                Trainer
                <ArrowUpDown />
            </Button>
        ),
        cell: ({ row }) => <div>{row.getValue("trainer")}</div>,
    },
    {
        accessorKey: "date",
        header: ({ column }) => (
            <Button
                variant="ghost"
                onClick={() =>
                    column.toggleSorting(column.getIsSorted() === "asc")
                }
            >
                Date
                <ArrowUpDown />
            </Button>
        ),
        cell: ({ row }) => <div>{row.getValue("date")}</div>,
    },
    {
        accessorKey: "location",
        header: () => <div>Location</div>,
        cell: ({ row }) => <div>{row.getValue("location")}</div>,
    },
    {
        accessorKey: "participants",
        header: ({ column }) => (
            <Button
                variant="ghost"
                onClick={() =>
                    column.toggleSorting(column.getIsSorted() === "asc")
                }
            >
                Participants
                <ArrowUpDown />
            </Button>
        ),
        cell: ({ row }) => <div>{row.getValue("participants")}</div>,
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
                    <DropdownMenuItem>Edit</DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem>Delete</DropdownMenuItem>
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
            data={trainingData}
            columns={trainingColumns}
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
