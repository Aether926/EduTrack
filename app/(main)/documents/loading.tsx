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
                            <Skeleton className="h-5 w-28" />
                            <Skeleton className="h-3.5 w-64" />
                        </div>
                    </div>

                    {/* Right: 3 stat mini-cards */}
                    <div className="flex gap-2 md:shrink-0">
                        {Array.from({ length: 3 }).map((_, i) => (
                            <div key={i} className="rounded-lg border border-border/60 bg-card px-3 py-2.5 flex items-center gap-2">
                                <Skeleton className="h-7 w-7 rounded-md shrink-0" />
                                <div className="space-y-1">
                                    <Skeleton className="h-2.5 w-14" />
                                    <Skeleton className="h-6 w-6" />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* ── Checklist card skeleton ── */}
            <div className="rounded-xl border border-border/60 bg-gradient-to-br from-card to-background overflow-hidden">
                {/* Card header */}
                <div className="flex items-center justify-between px-5 py-4 border-b border-border/60">
                    <div className="space-y-1.5">
                        <Skeleton className="h-5 w-40" />
                        <Skeleton className="h-3.5 w-36" />
                    </div>
                    <Skeleton className="h-2 w-48 rounded-full" />
                </div>

                {/* Document rows */}
                <div className="divide-y divide-border/60">
                    {Array.from({ length: 9 }).map((_, i) => (
                        <div key={i} className="flex items-center justify-between px-5 py-4">
                            <div className="flex items-center gap-3">
                                <Skeleton className="h-5 w-5 rounded-full shrink-0" />
                                <Skeleton className="h-4 w-40" />
                            </div>
                            <Skeleton className="h-9 w-24 rounded-lg" />
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}