"use client";

import PaginationBar from "../pagination";
import { useRouter } from "next/navigation";

import * as React from "react";
import {
    ColumnDef,
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
import { ChevronDown, Search } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuCheckboxItem,
    DropdownMenuContent,
    DropdownMenuTrigger,
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

interface DataTableProps<T> {
    data: T[];
    columns: ColumnDef<T>[];
    filterColumn: string;
    filterPlaceholder?: string;
    pageSize?: number;
    onAddClick?: (selectedRows: T[]) => void;
    onDeleteClick?: (selectedRows: T[]) => void;
    showAddButton?: boolean;
    showDeleteButton?: boolean;
    getRowUrl?: (row: T) => string;
}

export function DataTable<T>({
    data,
    columns,
    filterColumn,
    filterPlaceholder = "Filter.",
    pageSize = 8,
    onAddClick,
    onDeleteClick,
    showAddButton = false,
    showDeleteButton = true,
    getRowUrl,
}: DataTableProps<T>) {
    const router = useRouter();
    const [sorting, setSorting] = React.useState<SortingState>([]);
    const [columnFilters, setColumnFilters] =
        React.useState<ColumnFiltersState>([]);
    const [columnVisibility, setColumnVisibility] =
        React.useState<VisibilityState>({});
    const [rowSelection, setRowSelection] = React.useState({});

    // Add state for dynamic page size
    const [currentPageSize, setCurrentPageSize] = React.useState(() => {
        if (typeof window === "undefined") return pageSize;
        return getPageSize();
    });

    const handleRowClick = (row: T, event: React.MouseEvent) => {
        if (!getRowUrl) return;

        const target = event.target as HTMLElement;
        if (
            target.closest("button") ||
            target.closest('[role="checkbox"]') ||
            target.closest('input[type="checkbox"]')
        ) {
            return;
        }
        router.push(getRowUrl(row));
    };

    function getPageSize() {
        if (typeof window === "undefined") return pageSize;

        const width = window.innerWidth;

        // Row limiter depending on screen size
        if (width < 768) return 6; // sm
        if (width < 1440) return 7; // md-lg
        return 12; // xl+
    }

    // Handle window resize
    React.useEffect(() => {
        const handleResize = () => {
            const newPageSize = getPageSize();
            if (newPageSize !== currentPageSize) {
                setCurrentPageSize(newPageSize);
            }
        };

        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, [currentPageSize]);

    const table = useReactTable({
        data,
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
                pageSize: currentPageSize,
            },
        },
        state: {
            sorting,
            columnFilters,
            columnVisibility,
            rowSelection,
        },
    });

    // Update table page size when currentPageSize changes
    React.useEffect(() => {
        table.setPageSize(currentPageSize);
    }, [currentPageSize, table]);

    const selectedRows = table
        .getFilteredSelectedRowModel()
        .rows.map((row) => row.original);

    return (
        <div className="w-full flex flex-col">
            <div>
                <div className="flex items-center py-2">
                    <div className="flex flex-row">
                        <div className="relative max-w-sm pr-2">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                            <Input
                                placeholder={filterPlaceholder}
                                value={
                                    (table
                                        .getColumn(filterColumn)
                                        ?.getFilterValue() as string) ?? ""
                                }
                                onChange={(event) =>
                                    table
                                        .getColumn(filterColumn)
                                        ?.setFilterValue(event.target.value)
                                }
                                className="max-w-sm pl-10 pr-4 mr-4"
                            />
                        </div>

                        {/* Add button: show when at least 1 row is selected */}
                        {showAddButton &&
                            onAddClick &&
                            selectedRows.length >= 1 && (
                                <Button
                                    onClick={() => onAddClick(selectedRows)}
                                    className="mr-2 !bg-green-700 !text-white hover:!bg-green-800"
                                >
                                    Add
                                </Button>
                            )}

                        {/* Delete button: show when at least 2 rows are selected */}
                        {showDeleteButton &&
                            onDeleteClick &&
                            selectedRows.length >= 2 && (
                                <Button
                                    onClick={() => onDeleteClick(selectedRows)}
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
                                .map((column) => {
                                    return (
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
                                    );
                                })}
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>

                <div className="overflow-x-auto rounded-md border">
                    <Table className="min-w-[900px]">
                        <TableHeader>
                            {table.getHeaderGroups().map((headerGroup) => (
                                <TableRow key={headerGroup.id}>
                                    {headerGroup.headers.map((header) => {
                                        return (
                                            <TableHead key={header.id}>
                                                {header.isPlaceholder
                                                    ? null
                                                    : flexRender(
                                                          header.column
                                                              .columnDef.header,
                                                          header.getContext(),
                                                      )}
                                            </TableHead>
                                        );
                                    })}
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
                                        {row.getVisibleCells().map((cell) => {
                                            const colId = cell.column.id;
                                            const isClickable =
                                                !!getRowUrl &&
                                                // Url excluding checkbox and menu column
                                                colId !== "select" &&
                                                colId !== "actions";

                                            return (
                                                <TableCell
                                                    key={cell.id}
                                                    onClick={(e) => {
                                                        if (!isClickable)
                                                            return;
                                                        handleRowClick(
                                                            row.original,
                                                            e,
                                                        );
                                                    }}
                                                    className={
                                                        isClickable
                                                            ? "cursor-pointer hover:underline"
                                                            : ""
                                                    }
                                                >
                                                    {flexRender(
                                                        cell.column.columnDef
                                                            .cell,
                                                        cell.getContext(),
                                                    )}
                                                </TableCell>
                                            );
                                        })}
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
                        <PaginationBar table={table} />
                    </div>
                </div>
            </div>
        </div>
    );
}
