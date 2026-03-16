import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
    return (
        <div className="mx-auto w-full max-w-7xl px-4 py-5 md:px-6 md:py-6 space-y-4">
            {/* ── Page header band ── */}
            <div className="rounded-xl border border-border/60 bg-gradient-to-br from-card to-background px-5 py-5 md:px-6 md:py-6">
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    {/* Left: icon + title + badges */}
                    <div className="flex items-center gap-3">
                        <Skeleton className="h-10 w-10 rounded-lg shrink-0" />
                        <div className="space-y-2">
                            <div className="flex flex-wrap items-center gap-2">
                                <Skeleton className="h-5 w-40" />
                                <Skeleton className="h-5 w-16 rounded-full" />
                                <Skeleton className="h-5 w-48 rounded-full" />
                            </div>
                            <Skeleton className="h-3.5 w-72" />
                        </div>
                    </div>

                    {/* Right: stat mini-cards */}
                    <div className="flex flex-col [@media(min-width:360px)]:flex-row gap-2 md:shrink-0">
                        <div className="rounded-lg border border-border/60 bg-card px-3 py-2.5 flex items-center gap-2">
                            <Skeleton className="h-7 w-7 rounded-md shrink-0" />
                            <div className="space-y-1">
                                <Skeleton className="h-2.5 w-8" />
                                <Skeleton className="h-6 w-8" />
                            </div>
                        </div>

                        <div className="flex gap-2 [@media(min-width:360px)]:contents">
                            <div className="rounded-lg border border-border/60 bg-card px-3 py-2.5 flex items-center gap-2 flex-1">
                                <Skeleton className="h-7 w-7 rounded-md shrink-0" />
                                <div className="space-y-1">
                                    <Skeleton className="h-2.5 w-14" />
                                    <Skeleton className="h-6 w-8" />
                                </div>
                            </div>
                            <div className="rounded-lg border border-border/60 bg-card px-3 py-2.5 flex items-center gap-2 flex-1">
                                <Skeleton className="h-7 w-7 rounded-md shrink-0" />
                                <div className="space-y-1">
                                    <Skeleton className="h-2.5 w-14" />
                                    <Skeleton className="h-6 w-8" />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* ── Table panel ── */}
            <div className="rounded-xl border border-border/60 bg-gradient-to-br from-card to-background overflow-hidden">
                {/* Toolbar */}
                <div className="flex items-center justify-between gap-3 px-5 py-4 border-b border-border/60">
                    <Skeleton className="h-9 w-64 rounded-lg" />
                    <div className="flex items-center gap-2">
                        <Skeleton className="h-9 w-24 rounded-lg" />
                        <Skeleton className="h-9 w-28 rounded-lg" />
                    </div>
                </div>

                {/* Table header */}
                <div className="grid grid-cols-5 gap-4 px-5 py-3 border-b border-border/60 bg-muted/30">
                    <Skeleton className="h-3.5 w-24" />
                    <Skeleton className="h-3.5 w-16" />
                    <Skeleton className="h-3.5 w-16" />
                    <Skeleton className="h-3.5 w-20" />
                    <Skeleton className="h-3.5 w-16 ml-auto" />
                </div>

                {/* Table rows */}
                <div className="divide-y divide-border/60">
                    {Array.from({ length: 6 }).map((_, i) => (
                        <div key={i} className="grid grid-cols-5 gap-4 px-5 py-3.5 items-center">
                            <Skeleton className="h-4 w-48" />
                            <Skeleton className="h-5 w-20 rounded-full" />
                            <Skeleton className="h-4 w-16" />
                            <Skeleton className="h-4 w-24" />
                            <div className="flex justify-end gap-2">
                                <Skeleton className="h-8 w-8 rounded-md" />
                                <Skeleton className="h-8 w-8 rounded-md" />
                            </div>
                        </div>
                    ))}
                </div>

                {/* Pagination */}
                <div className="flex items-center justify-between px-5 py-3.5 border-t border-border/60">
                    <Skeleton className="h-4 w-28" />
                    <div className="flex items-center gap-2">
                        <Skeleton className="h-8 w-20 rounded-md" />
                        <Skeleton className="h-8 w-20 rounded-md" />
                    </div>
                </div>
            </div>
        </div>
    );
}