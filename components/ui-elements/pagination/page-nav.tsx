"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";

interface PageNavProps {
    page: number;
    totalPages: number;
    onPageChange: (page: number) => void;
}

export function PageNav({ page, totalPages, onPageChange }: PageNavProps) {
    if (totalPages <= 1) return null;

    const delta = 1;
    const range: (number | "…")[] = [];
    const left = Math.max(2, page - delta);
    const right = Math.min(totalPages - 1, page + delta);

    range.push(1);
    if (left > 2) range.push("…");
    for (let i = left; i <= right; i++) range.push(i);
    if (right < totalPages - 1) range.push("…");
    if (totalPages > 1) range.push(totalPages);

    return (
        <div className="flex flex-col items-center gap-2 mt-1 px-1">
            <div className="flex items-center justify-between w-full">
                <span className="text-[11px] text-muted-foreground">
                    Page {page} of {totalPages}
                </span>
            </div>
            <div className="flex flex-nowrap items-center justify-center gap-1 overflow-x-auto w-full pb-1">
                <button
                    onClick={() => onPageChange(Math.max(1, page - 1))}
                    disabled={page === 1}
                    className="inline-flex items-center justify-center rounded-md border border-white/10 bg-white/5 p-1.5 text-muted-foreground transition hover:bg-white/10 hover:text-foreground disabled:pointer-events-none disabled:opacity-30"
                >
                    <ChevronLeft className="h-3.5 w-3.5" />
                </button>

                {range.map((p, idx) =>
                    p === "…" ? (
                        <span
                            key={`ellipsis-${idx}`}
                            className="inline-flex h-6 w-6 items-center justify-center text-[11px] text-muted-foreground"
                        >
                            …
                        </span>
                    ) : (
                        <button
                            key={p}
                            onClick={() => onPageChange(p)}
                            className={`inline-flex h-6 w-6 items-center justify-center rounded-md border text-[11px] font-medium transition ${
                                p === page
                                    ? "border-blue-500/40 bg-blue-500/20 text-blue-400"
                                    : "border-white/10 bg-white/5 text-muted-foreground hover:bg-white/10 hover:text-foreground"
                            }`}
                        >
                            {p}
                        </button>
                    ),
                )}

                <button
                    onClick={() => onPageChange(Math.min(totalPages, page + 1))}
                    disabled={page === totalPages}
                    className="inline-flex items-center justify-center rounded-md border border-white/10 bg-white/5 p-1.5 text-muted-foreground transition hover:bg-white/10 hover:text-foreground disabled:pointer-events-none disabled:opacity-30"
                >
                    <ChevronRight className="h-3.5 w-3.5" />
                </button>
            </div>
        </div>
    );
}
