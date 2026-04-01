"use client";

import * as React from "react";
import { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown, MoreHorizontal, Search, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
    DropdownMenuCheckboxItem,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    ColumnFiltersState,
    flexRender,
    getCoreRowModel,
    getFilteredRowModel,
    getPaginationRowModel,
    getSortedRowModel,
    SortingState,
    useReactTable,
    VisibilityState,
} from "@tanstack/react-table";
import { PageNav } from "@/components/ui-elements/pagination/page-nav";
import {
    PAGE_SIZES,
    resolvePageSize,
} from "@/components/ui-elements/pagination/page-sizes";
import { TypeBadge, LevelBadge } from "@/components/ui-elements/badges";
import { useRouter } from "next/navigation";

export type TrainingSeminarHistory = {
    type: string;
    title: string;
    level: string;
    startDate: string;
    endDate: string;
    totalHours: string;
    sponsor: string;
    url: string;
};

// Sample Data
const trainingHistoryData: TrainingSeminarHistory[] = [
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
const selectColumn: ColumnDef<TrainingSeminarHistory> = {
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
const dataColumns: ColumnDef<TrainingSeminarHistory>[] = [
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
        cell: ({ row }) => (
            <TypeBadge type={row.getValue("type") as string} size="xs" />
        ),
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
            <div className="flex justify-center">
                <LevelBadge level={row.getValue("level") as string} size="xs" />
            </div>
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
            <div className="text-center w-full font-mono text-xs text-muted-foreground">
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
            <div className="text-center w-full font-mono text-xs text-muted-foreground">
                {row.getValue("endDate")}
            </div>
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
            <div className="text-center w-full tabular-nums text-sm">
                {row.getValue("totalHours")}h
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
        cell: ({ row }) => (
            <div className="text-sm text-muted-foreground">
                {row.getValue("sponsor")}
            </div>
        ),
        size: 180,
    },
];

// Actions column
const actionsColumn: ColumnDef<TrainingSeminarHistory> = {
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

interface TrainingHistoryProps {
    isAdmin?: boolean;
    role?: "ADMIN" | "TEACHER";
}

export default function TrainingHistory({
    isAdmin = false,
    role,
}: TrainingHistoryProps) {
    const router = useRouter();
    const [sorting, setSorting] = React.useState<SortingState>([]);
    const [columnFilters, setColumnFilters] =
        React.useState<ColumnFiltersState>([]);
    const [columnVisibility, setColumnVisibility] =
        React.useState<VisibilityState>({});
    const [rowSelection, setRowSelection] = React.useState({});

    const canManage = role === "ADMIN" || isAdmin === true;

    const columns = React.useMemo(() => {
        const cols: ColumnDef<TrainingSeminarHistory>[] = [
            selectColumn,
            ...dataColumns,
        ];
        if (canManage) cols.push(actionsColumn);
        return cols;
    }, [canManage]);

    const table = useReactTable({
        data: trainingHistoryData,
        columns,
        onSortingChange: setSorting,
        onColumnFiltersChange: setColumnFilters,
        getCoreRowModel: getCoreRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        onColumnVisibilityChange: setColumnVisibility,
        onRowSelectionChange: setRowSelection,
        initialState: {
            pagination: {
                pageSize: resolvePageSize(PAGE_SIZES.historyTrainingRecords),
            },
        },
        state: { sorting, columnFilters, columnVisibility, rowSelection },
    });

    const selectedRows = table
        .getFilteredSelectedRowModel()
        .rows.map((row) => row.original);

    const handleDelete = () => {};

    return (
        <div className="w-full min-h-screen flex flex-col">
            <div className="flex-1">
                <div className="flex items-center py-2">
                    <div className="flex flex-row">
                        <div className="relative max-w-sm pr-2">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                            <Input
                                placeholder="Filter trainings..."
                                value={
                                    (table
                                        .getColumn("title")
                                        ?.getFilterValue() as string) ?? ""
                                }
                                onChange={(e) =>
                                    table
                                        .getColumn("title")
                                        ?.setFilterValue(e.target.value)
                                }
                                className="max-w-sm pl-10 pr-4 mr-4"
                            />
                        </div>

                        {selectedRows.length >= 1 && (
                            <Button
                                onClick={handleDelete}
                                className="mr-2 !bg-red-700 !text-white hover:!bg-red-800"
                            >
                                Delete
                            </Button>
                        )}
                    </div>

                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="outline" className="ml-auto">
                                Columns <ChevronDown />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            {table
                                .getAllColumns()
                                .filter((column) => column.getCanHide())
                                .map((column) => (
                                    <DropdownMenuCheckboxItem
                                        key={column.id}
                                        className="capitalize"
                                        checked={column.getIsVisible()}
                                        onCheckedChange={(value) =>
                                            column.toggleVisibility(!!value)
                                        }
                                    >
                                        {column.id}
                                    </DropdownMenuCheckboxItem>
                                ))}
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>

                <div className="overflow-hidden rounded-md border">
                    <Table>
                        <TableHeader>
                            {table.getHeaderGroups().map((headerGroup) => (
                                <TableRow key={headerGroup.id}>
                                    {headerGroup.headers.map((header) => (
                                        <TableHead key={header.id}>
                                            {header.isPlaceholder
                                                ? null
                                                : flexRender(
                                                      header.column.columnDef
                                                          .header,
                                                      header.getContext(),
                                                  )}
                                        </TableHead>
                                    ))}
                                </TableRow>
                            ))}
                        </TableHeader>
                        <TableBody>
                            {table.getRowModel().rows?.length ? (
                                table.getRowModel().rows.map((row) => (
                                    <TableRow
                                        key={row.id}
                                        data-state={
                                            row.getIsSelected() && "selected"
                                        }
                                    >
                                        {row.getVisibleCells().map((cell) => (
                                            <TableCell key={cell.id}>
                                                {flexRender(
                                                    cell.column.columnDef.cell,
                                                    cell.getContext(),
                                                )}
                                            </TableCell>
                                        ))}
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell
                                        colSpan={columns.length}
                                        className="h-24 text-center"
                                    >
                                        No results.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>
            </div>

            <div className="sticky bottom-0 bg-background border-t py-4 z-10 mt-auto">
                <div className="flex flex-col lg:flex-row items-center gap-2 w-full">
                    <div className="text-muted-foreground text-sm mr-auto">
                        {table.getFilteredSelectedRowModel().rows.length} of{" "}
                        {table.getFilteredRowModel().rows.length} row(s)
                        selected.
                    </div>
                    <div className="lg:absolute lg:left-1/2 lg:-translate-x-1/2">
                        <PageNav
                            page={table.getState().pagination.pageIndex + 1}
                            totalPages={table.getPageCount()}
                            onPageChange={(p) => table.setPageIndex(p - 1)}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}
