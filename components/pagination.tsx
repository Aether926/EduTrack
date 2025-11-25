import { Table } from "@tanstack/react-table";
import {
    Pagination,
    PaginationContent,
    PaginationEllipsis,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
} from "@/components/ui/pagination";

interface PaginationBarProps {
    table: Table<any>;
}

export default function PaginationBar({ table }: PaginationBarProps) {
    const currentPage = table.getState().pagination.pageIndex;
    const pageCount = table.getPageCount();

    const getPageNumbers = () => {
        const pages = [];

        if (pageCount <= 5) {
            for (let i = 0; i < pageCount; i++) {
                pages.push(i);
            }
        } else {
            pages.push(0);

            let start = Math.max(1, currentPage - 1);
            let end = Math.min(pageCount - 2, currentPage + 1);

            if (start > 1) {
                pages.push(-1);
            }

            for (let i = start; i <= end; i++) {
                pages.push(i);
            }

            if (end < pageCount - 2) {
                pages.push(-2);
            }

            pages.push(pageCount - 1);
        }

        return pages;
    };

    return (
        <Pagination>
            <PaginationContent>
                <PaginationItem>
                    <PaginationPrevious
                        onClick={() => table.previousPage()}
                        className={
                            !table.getCanPreviousPage()
                                ? "pointer-events-none opacity-50"
                                : "cursor-pointer"
                        }
                    />
                </PaginationItem>

                {getPageNumbers().map((pageIndex, i) => (
                    <PaginationItem key={i}>
                        {pageIndex === -1 || pageIndex === -2 ? (
                            <PaginationEllipsis />
                        ) : (
                            <PaginationLink
                                onClick={() => table.setPageIndex(pageIndex)}
                                isActive={currentPage === pageIndex}
                                className="cursor-pointer"
                            >
                                {pageIndex + 1}
                            </PaginationLink>
                        )}
                    </PaginationItem>
                ))}

                <PaginationItem>
                    <PaginationNext
                        onClick={() => table.nextPage()}
                        className={
                            !table.getCanNextPage()
                                ? "pointer-events-none opacity-50"
                                : "cursor-pointer"
                        }
                    />
                </PaginationItem>
            </PaginationContent>
        </Pagination>
    );
}
