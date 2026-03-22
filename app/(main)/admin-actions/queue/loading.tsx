import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
    return (
        <div className="mx-auto w-full max-w-7xl px-4 py-5 md:px-6 md:py-6 space-y-4">
            {/* ── Page header band ── */}
            <div className="rounded-xl border border-border/60 bg-gradient-to-br from-card to-background px-5 py-5 md:px-6 md:py-6">
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    {/* Left: icon + title + description */}
                    <div className="flex items-center gap-3">
                        <Skeleton className="h-10 w-10 rounded-lg shrink-0" />
                        <div className="space-y-2">
                            <Skeleton className="h-5 w-44" />
                            <Skeleton className="h-3.5 w-64" />
                        </div>
                    </div>
                    {/* Right: role badge + 3 stat counts */}
                    <div className="flex items-center gap-2">
                        <Skeleton className="h-7 w-16 rounded-full" />
                        <Skeleton className="h-7 w-28 rounded-full" />
                        <Skeleton className="h-7 w-28 rounded-full" />
                        <Skeleton className="h-7 w-32 rounded-full" />
                    </div>
                </div>
            </div>

            {/* ── 3 section panels ── */}
            {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="rounded-xl border border-border/60 bg-gradient-to-br from-card to-background overflow-hidden">
                    {/* Section sub-header */}
                    <div className="flex items-center gap-3 px-5 py-4 border-b border-border/60">
                        <Skeleton className="h-9 w-9 rounded-lg shrink-0" />
                        <div className="space-y-1.5">
                            <Skeleton className="h-4 w-40" />
                            <Skeleton className="h-3 w-52" />
                        </div>
                    </div>

                    {/* Pending / Reviewed tabs */}
                    <div className="flex items-center gap-2 px-5 py-3 border-b border-border/60">
                        <Skeleton className="h-8 w-24 rounded-lg" />
                        <Skeleton className="h-8 w-24 rounded-lg" />
                    </div>

                    {/* Rows */}
                    <div className="divide-y divide-border/60">
                        {Array.from({ length: i === 0 ? 3 : 2 }).map((_, j) => (
                            <div key={j} className="flex items-center justify-between px-5 py-4 gap-4">
                                <div className="flex items-center gap-3">
                                    <Skeleton className="h-9 w-9 rounded-full shrink-0" />
                                    <div className="space-y-1.5">
                                        <Skeleton className="h-4 w-36" />
                                        <Skeleton className="h-3 w-44" />
                                    </div>
                                </div>
                                <div className="flex items-center gap-3 shrink-0">
                                    <Skeleton className="h-6 w-20 rounded-full" />
                                    <Skeleton className="h-4 w-16" />
                                    <Skeleton className="h-5 w-5 rounded" />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            ))}
        </div>
    );
}