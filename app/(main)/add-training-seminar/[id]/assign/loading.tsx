import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
    return (
        <div className="mx-auto w-full max-w-7xl px-4 py-5 md:px-6 md:py-6 space-y-4">
            {/* ── Page header band ── */}
            <div className="rounded-xl border border-border/60 bg-gradient-to-br from-card to-background px-5 py-5 md:px-6 md:py-6">
                <div className="flex items-center gap-3">
                    <Skeleton className="h-10 w-10 rounded-lg shrink-0" />
                    <div className="space-y-2">
                        <div className="flex flex-wrap items-center gap-2">
                            <Skeleton className="h-5 w-36" />
                            <Skeleton className="h-5 w-16 rounded-full" />
                            <Skeleton className="h-5 w-32 rounded-full" />
                        </div>
                        <Skeleton className="h-3.5 w-64" />
                    </div>
                </div>
            </div>

            {/* ── Training info card ── */}
            <div className="rounded-xl border border-border/60 bg-gradient-to-br from-card to-background px-5 py-5 md:px-6 md:py-6">
                <div className="flex items-start gap-3">
                    <Skeleton className="h-10 w-10 rounded-lg shrink-0 mt-0.5" />
                    <div className="space-y-3 flex-1 min-w-0">
                        <Skeleton className="h-6 w-48" />
                        <div className="flex flex-wrap items-center gap-2">
                            <Skeleton className="h-5 w-24 rounded-full" />
                            <Skeleton className="h-5 w-20 rounded-full" />
                            <Skeleton className="h-5 w-16 rounded-full" />
                        </div>
                        <Skeleton className="h-3.5 w-32" />
                    </div>
                </div>
            </div>

            {/* ── Teacher picker panel ── */}
            <div className="rounded-xl border border-border/60 bg-gradient-to-br from-card to-background overflow-hidden">
                {/* Panel header */}
                <div className="px-5 py-4 border-b border-border/60 space-y-1">
                    <Skeleton className="h-5 w-32" />
                    <Skeleton className="h-3.5 w-40" />
                </div>

                {/* Search + Assign selected */}
                <div className="flex items-center gap-3 px-5 py-4 border-b border-border/60">
                    <Skeleton className="h-9 flex-1 max-w-xs rounded-lg" />
                    <Skeleton className="h-9 w-36 rounded-lg" />
                </div>

                {/* Table header with checkbox */}
                <div className="grid grid-cols-4 gap-4 px-5 py-3 border-b border-border/60 bg-muted/30 items-center">
                    <div className="flex items-center gap-3">
                        <Skeleton className="h-4 w-4 rounded" />
                        <Skeleton className="h-3.5 w-24" />
                    </div>
                    <Skeleton className="h-3.5 w-20" />
                    <Skeleton className="h-3.5 w-16" />
                    <Skeleton className="h-3.5 w-24" />
                </div>

                {/* Table rows */}
                <div className="divide-y divide-border/60">
                    {Array.from({ length: 5 }).map((_, i) => (
                        <div key={i} className="grid grid-cols-4 gap-4 px-5 py-4 items-center">
                            <div className="flex items-center gap-3">
                                <Skeleton className="h-4 w-4 rounded shrink-0" />
                                <Skeleton className="h-4 w-16" />
                            </div>
                            <div className="flex items-center gap-2">
                                <Skeleton className="h-8 w-8 rounded-full shrink-0" />
                                <Skeleton className="h-4 w-32" />
                            </div>
                            <Skeleton className="h-4 w-28" />
                            <Skeleton className="h-4 w-24" />
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