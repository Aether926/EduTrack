import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
    return (
        <div className="mx-auto w-full max-w-7xl px-4 py-5 md:px-6 md:py-6 space-y-4">
            {/* ── Page header band ── */}
            <div className="rounded-xl border border-border/60 bg-gradient-to-br from-card to-background px-5 py-5 md:px-6 md:py-6">
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
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
                    <div className="flex flex-col [@media(min-width:360px)]:flex-row gap-2 md:shrink-0">
                        <div className="rounded-lg border border-border/60 bg-card px-3 py-2.5 flex items-center gap-2">
                            <Skeleton className="h-7 w-7 rounded-md shrink-0" />
                            <div className="space-y-1"><Skeleton className="h-2.5 w-8" /><Skeleton className="h-6 w-8" /></div>
                        </div>
                        <div className="flex gap-2 [@media(min-width:360px)]:contents">
                            <div className="rounded-lg border border-border/60 bg-card px-3 py-2.5 flex items-center gap-2 flex-1">
                                <Skeleton className="h-7 w-7 rounded-md shrink-0" />
                                <div className="space-y-1"><Skeleton className="h-2.5 w-14" /><Skeleton className="h-6 w-8" /></div>
                            </div>
                            <div className="rounded-lg border border-border/60 bg-card px-3 py-2.5 flex items-center gap-2 flex-1">
                                <Skeleton className="h-7 w-7 rounded-md shrink-0" />
                                <div className="space-y-1"><Skeleton className="h-2.5 w-14" /><Skeleton className="h-6 w-8" /></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* ── Table panel ── */}
            <div className="rounded-xl border border-border/60 bg-gradient-to-br from-card to-background overflow-hidden">
                {/* Toolbar */}
                <div className="px-5 py-4 border-b border-border/60 space-y-3">
                    {/* Search + Add row */}
                    <div className="flex items-center gap-2">
                        <Skeleton className="h-9 flex-1 rounded-lg" />
                        <Skeleton className="h-9 w-44 rounded-lg shrink-0" />
                    </div>
                    {/* Filter row */}
                    <div className="flex gap-2">
                        <Skeleton className="h-8 w-32 rounded-lg" />
                        <Skeleton className="h-8 w-32 rounded-lg" />
                        <Skeleton className="h-8 w-32 rounded-lg" />
                    </div>
                </div>

                {/* Table header */}
                <div className="grid grid-cols-5 gap-4 px-5 py-3 border-b border-border/60">
                    <Skeleton className="h-3 w-12" />
                    <Skeleton className="h-3 w-24" />
                    <Skeleton className="h-3 w-16" />
                    <Skeleton className="h-3 w-12" />
                    <Skeleton className="h-3 w-16" />
                </div>

                {/* Rows */}
                <div className="divide-y divide-border/40">
                    {Array.from({ length: 6 }).map((_, i) => (
                        <div key={i} className="grid grid-cols-5 gap-4 px-5 py-3.5 items-center">
                            <Skeleton className="h-5 w-20 rounded-full" />
                            <Skeleton className="h-4 w-40" />
                            <Skeleton className="h-5 w-20 rounded-full" />
                            <Skeleton className="h-4 w-24" />
                            <Skeleton className="h-4 w-10" />
                        </div>
                    ))}
                </div>

                {/* Pagination */}
                <div className="flex items-center justify-between px-5 py-3.5 border-t border-border/60">
                    <Skeleton className="h-4 w-36" />
                    <div className="flex gap-2">
                        <Skeleton className="h-8 w-16 rounded-md" />
                        <Skeleton className="h-8 w-16 rounded-md" />
                    </div>
                </div>
            </div>
        </div>
    );
}