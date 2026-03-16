import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
    return (
        <div className="mx-auto w-full max-w-7xl px-4 py-5 md:px-6 md:py-6 space-y-4">
            {/* ── Page header band ── */}
            <div className="rounded-xl border border-border/60 bg-gradient-to-br from-card to-background px-5 py-5 md:px-6 md:py-6">
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    {/* Left: icon + title + badge */}
                    <div className="flex items-center gap-3">
                        <Skeleton className="h-10 w-10 rounded-lg shrink-0" />
                        <div className="space-y-2">
                            <div className="flex flex-wrap items-center gap-2">
                                <Skeleton className="h-5 w-40" />
                                <Skeleton className="h-5 w-36 rounded-full" />
                            </div>
                            <Skeleton className="h-3.5 w-56" />
                        </div>
                    </div>

                    {/* Right: stat mini-cards */}
                    <div className="flex gap-2 md:shrink-0">
                        <div className="rounded-lg border border-border/60 bg-card px-3 py-2.5 flex items-center gap-2 min-w-[110px]">
                            <Skeleton className="h-7 w-7 rounded-md shrink-0" />
                            <div className="space-y-1">
                                <Skeleton className="h-2.5 w-12" />
                                <Skeleton className="h-6 w-8" />
                            </div>
                        </div>
                        <div className="rounded-lg border border-border/60 bg-card px-3 py-2.5 flex items-center gap-2 min-w-[110px]">
                            <Skeleton className="h-7 w-7 rounded-md shrink-0" />
                            <div className="space-y-1">
                                <Skeleton className="h-2.5 w-14" />
                                <Skeleton className="h-6 w-8" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* ── Table panel ── */}
            <div className="rounded-xl border border-border/60 bg-gradient-to-br from-card to-background overflow-hidden">
                {/* Toolbar */}
                <div className="flex items-center gap-3 px-5 py-4 border-b border-border/60">
                    <Skeleton className="h-9 w-56 rounded-lg" />
                    <Skeleton className="h-9 w-36 rounded-lg" />
                </div>

                {/* Table header */}
                <div className="grid grid-cols-7 gap-4 px-5 py-3 border-b border-border/60 bg-muted/30">
                    <Skeleton className="h-3.5 w-12" />
                    <Skeleton className="h-3.5 w-16" />
                    <Skeleton className="h-3.5 w-12" />
                    <Skeleton className="h-3.5 w-14" />
                    <Skeleton className="h-3.5 w-10" />
                    <Skeleton className="h-3.5 w-16" />
                    <Skeleton className="h-3.5 w-14" />
                </div>

                {/* Table rows */}
                <div className="divide-y divide-border/60">
                    {Array.from({ length: 5 }).map((_, i) => (
                        <div key={i} className="grid grid-cols-7 gap-4 px-5 py-3.5 items-center">
                            <Skeleton className="h-5 w-16 rounded-full" />
                            <Skeleton className="h-4 w-32" />
                            <Skeleton className="h-4 w-16" />
                            <Skeleton className="h-4 w-20" />
                            <Skeleton className="h-4 w-14" />
                            <Skeleton className="h-4 w-24" />
                            <Skeleton className="h-5 w-20 rounded-full" />
                        </div>
                    ))}
                </div>

                {/* Pagination */}
                <div className="flex items-center justify-between px-5 py-3.5 border-t border-border/60">
                    <Skeleton className="h-4 w-24" />
                    <div className="flex items-center gap-2">
                        <Skeleton className="h-8 w-16 rounded-md" />
                        <Skeleton className="h-8 w-16 rounded-md" />
                    </div>
                </div>
            </div>
        </div>
    );
}