'use client';

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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { deleteTeacher, deleteMultipleTeachers } from "@/app/actions/user";
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { TeacherTableRow } from '@/lib/user';



interface TeacherTableProps {
  data: TeacherTableRow[];
}

export default function TeacherTable({ data }: TeacherTableProps) {
    const router = useRouter();

    const handleDelete = async (selectedRows: TeacherTableRow[]) => {
        if (selectedRows.length === 0) return;

        const confirmed = confirm(
            `Are you sure you want to delete ${selectedRows.length} teacher(s)? This action cannot be undone.`
        );

        if (!confirmed) return;

        const userIds = selectedRows.map(row => row.id);
        
        const result = await deleteMultipleTeachers(userIds);

        if (result.success) {
            toast.success(`Successfully deleted ${result.count} teacher(s)`);
            router.refresh();
        } else {
            toast.error(result.error || 'Failed to delete teachers');
        }
    };

    const handleSingleDelete = async (userId: string) => {
        const confirmed = confirm(
            'Are you sure you want to delete this teacher? This action cannot be undone.'
        );

        if (!confirmed) return;

        const result = await deleteTeacher(userId);

        if (result.success) {
            toast.success('Teacher deleted successfully');
            router.refresh();
        } else {
            toast.error(result.error || 'Failed to delete teacher');
        }
    };

    const teacherColumns: ColumnDef<TeacherTableRow>[] = [
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
                    Employee ID
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            ),
            cell: ({ row }) => (
                <div className="font-mono text-sm">
                    {row.getValue("employeeid")}
                </div>
            ),
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
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            ),
            cell: ({ row }) => {
                const fullname = row.getValue("fullname") as string;
                const profileImage = row.original.profileImage;
                
                return (
                    <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8">
                            <AvatarImage src={profileImage || undefined} />
                            <AvatarFallback>
                                {fullname.split(' ').map(n => n[0]).join('')}
                            </AvatarFallback>
                        </Avatar>
                        <span className="font-medium">{fullname}</span>
                    </div>
                );
            },
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
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            ),
            cell: ({ row }) => (
                <div className="max-w-[200px]">
                    {row.getValue("position")}
                </div>
            ),
        },
        {
            accessorKey: "contact",
            header: () => <div>Contact Number</div>,
            cell: ({ row }) => (
                <div className="font-mono text-sm">
                    {row.getValue("contact")}
                </div>
            ),
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
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            ),
            cell: ({ row }) => (
                <div className="lowercase text-sm">
                    {row.getValue("email")}
                </div>
            ),
        },
        {
            id: "actions",
            enableHiding: false,
            cell: ({ row }) => (
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                            <span className="sr-only">Open menu</span>
                            <MoreHorizontal className="h-4 w-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuItem
                            onClick={() => router.push(`/teacher-profiles/${row.original.id}`)}
                        >
                            View Profile
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            ),
        },
    ];

    return (
        <DataTable
            data={data}
            columns={teacherColumns}
            filterColumn="fullname"
            filterPlaceholder="Search teachers by name..."
            pageSize={10}
            showDeleteButton={true}
            onDeleteClick={handleDelete}
        />
    );
}