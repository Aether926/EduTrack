import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
    return (
        <div className="mx-auto w-full max-w-7xl px-4 py-5 md:px-6 md:py-6 space-y-4">
            {/* ── Page header band ── */}
            <div className="rounded-xl border border-border/60 bg-gradient-to-br from-card to-background px-5 py-5 md:px-6 md:py-6">
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    {/* Left: back link + icon + title + description */}
                    <div className="flex items-center gap-3">
                        <Skeleton className="h-10 w-10 rounded-lg shrink-0" />
                        <div className="space-y-2">
                            <Skeleton className="h-3 w-24" />
                            <Skeleton className="h-5 w-52" />
                            <Skeleton className="h-3.5 w-72" />
                        </div>
                    </div>
                    {/* Right: role badge + 2 stat counts */}
                    <div className="flex items-center gap-2">
                        <Skeleton className="h-7 w-16 rounded-full" />
                        <Skeleton className="h-7 w-24 rounded-full" />
                        <Skeleton className="h-7 w-28 rounded-full" />
                    </div>
                </div>
            </div>

            {/* ── Table panel ── */}
            <div className="rounded-xl border border-border/60 bg-gradient-to-br from-card to-background overflow-hidden">
                {/* Panel header */}
                <div className="px-5 py-4 border-b border-border/60 space-y-1">
                    <Skeleton className="h-5 w-28" />
                    <Skeleton className="h-3.5 w-40" />
                </div>

                {/* Filter dropdown + search */}
                <div className="flex items-center gap-3 px-5 py-4 border-b border-border/60">
                    <Skeleton className="h-9 w-36 rounded-lg" />
                    <Skeleton className="h-9 flex-1 max-w-sm rounded-lg" />
                </div>

                {/* Table header */}
                <div className="grid grid-cols-6 gap-4 px-5 py-3 border-b border-border/60 bg-muted/30">
                    <Skeleton className="h-3.5 w-24" />
                    <Skeleton className="h-3.5 w-16" />
                    <Skeleton className="h-3.5 w-20" />
                    <Skeleton className="h-3.5 w-28" />
                    <Skeleton className="h-3.5 w-24" />
                    <Skeleton className="h-3.5 w-14 ml-auto" />
                </div>

                {/* Table rows */}
                <div className="divide-y divide-border/60">
                    {Array.from({ length: 5 }).map((_, i) => (
                        <div key={i} className="grid grid-cols-6 gap-4 px-5 py-4 items-center">
                            {/* Employee ID */}
                            <Skeleton className="h-4 w-16" />
                            {/* Name */}
                            <Skeleton className="h-4 w-32" />
                            {/* Position */}
                            <Skeleton className="h-4 w-28" />
                            {/* Cycle Progress: bar + label */}
                            <div className="space-y-1.5">
                                <Skeleton className="h-2 w-full rounded-full" />
                                <Skeleton className="h-3 w-16" />
                            </div>
                            {/* Next Increase: date + sub */}
                            <div className="space-y-1.5">
                                <Skeleton className="h-4 w-24" />
                                <Skeleton className="h-3 w-16" />
                            </div>
                            {/* Status badge */}
                            <Skeleton className="h-6 w-20 rounded-full ml-auto" />
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