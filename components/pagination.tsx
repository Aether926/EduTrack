import { Table } from "@tanstack/react-table";
import React from "react";
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
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    table: Table<any>;
}

export default function PaginationBar({ table }: PaginationBarProps) {
    const currentPage = table.getState().pagination.pageIndex;
    const pageCount = table.getPageCount();
    const [isMobile, setIsMobile] = React.useState(false);

    React.useEffect(() => {
        const checkMobile = () => {
            setIsMobile(window.innerWidth < 640);
        };

        checkMobile();
        window.addEventListener("resize", checkMobile);
        return () => window.removeEventListener("resize", checkMobile);
    }, []);

    const getPageNumbers = () => {
        const pages = [];

        if (pageCount <= (isMobile ? 5 : 7)) {
            // Show all pages if total is small enough
            for (let i = 0; i < pageCount; i++) {
                pages.push(i);
            }
        } else {
            // Always show first page
            pages.push(0);

            if (isMobile) {
                // Mobile logic
                if (currentPage <= 1) {
                    // Pages 1-2: show 1, 2, 3, ..., last
                    pages.push(1, 2);
                    pages.push(-1); // ellipsis
                } else if (currentPage >= pageCount - 2) {
                    // Near end: 1, ..., n-2, n-1, n
                    pages.push(-1);
                    pages.push(pageCount - 3, pageCount - 2);
                } else {
                    // Middle: 1, ..., current, ..., last
                    pages.push(-1);
                    pages.push(currentPage);
                    pages.push(-2);
                }
            } else {
                // Desktop logic
                if (currentPage <= 3) {
                    // Near start: 1, 2, 3, 4, 5, ..., last
                    for (let i = 1; i <= Math.min(4, pageCount - 2); i++) {
                        pages.push(i);
                    }
                    pages.push(-1);
                } else if (currentPage >= pageCount - 4) {
                    // Near end: 1, ..., n-4, n-3, n-2, n-1, n
                    pages.push(-1);
                    for (
                        let i = Math.max(1, pageCount - 5);
                        i < pageCount - 1;
                        i++
                    ) {
                        pages.push(i);
                    }
                } else {
                    // Middle: 1, ..., current-1, current, current+1, ..., last
                    pages.push(-1);
                    pages.push(currentPage - 1, currentPage, currentPage + 1);
                    pages.push(-2);
                }
            }

            // Always show last page
            pages.push(pageCount - 1);
        }

        return pages;
    };

    const handlePrevious = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (table.getCanPreviousPage()) {
            table.previousPage();
        }
    };

    const handleNext = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (table.getCanNextPage()) {
            table.nextPage();
        }
    };

    const handlePageClick = (pageIndex: number) => (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        table.setPageIndex(pageIndex);
    };

    return (
        <Pagination className="w-full">
            <PaginationContent className="flex-wrap justify-center gap-1">
                <PaginationItem>
                    <PaginationPrevious
                        href="#"
                        onClick={handlePrevious}
                        aria-disabled={!table.getCanPreviousPage()}
                        className={
                            !table.getCanPreviousPage()
                                ? "pointer-events-none opacity-50"
                                : "cursor-pointer"
                        }
                    />
                </PaginationItem>

                {getPageNumbers().map((pageIndex, i) => (
                    <PaginationItem key={i}>
                        {pageIndex < 0 ? (
                            <PaginationEllipsis />
                        ) : (
                            <PaginationLink
                                href="#"
                                onClick={handlePageClick(pageIndex)}
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
                        href="#"
                        onClick={handleNext}
                        aria-disabled={!table.getCanNextPage()}
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
