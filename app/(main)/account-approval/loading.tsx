import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
    return (
        <div className="mx-auto w-full max-w-7xl px-4 py-5 md:px-6 md:py-6 space-y-4">
            {/* ── Page header band ── */}
            <div className="rounded-xl border border-border/60 bg-gradient-to-br from-card to-background px-5 py-5 md:px-6 md:py-6">
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    {/* Left: icon + title + role badge + description */}
                    <div className="flex items-center gap-3">
                        <Skeleton className="h-10 w-10 rounded-lg shrink-0" />
                        <div className="space-y-2">
                            <div className="flex items-center gap-2">
                                <Skeleton className="h-5 w-40" />
                                <Skeleton className="h-5 w-16 rounded-full" />
                            </div>
                            <Skeleton className="h-3.5 w-64" />
                        </div>
                    </div>
                    {/* Right: 3 stat pill badges */}
                    <div className="flex items-center gap-2">
                        <Skeleton className="h-7 w-20 rounded-full" />
                        <Skeleton className="h-7 w-24 rounded-full" />
                        <Skeleton className="h-7 w-24 rounded-full" />
                    </div>
                </div>
            </div>

            {/* ── Access requests panel ── */}
            <div className="rounded-xl border border-border/60 bg-gradient-to-br from-card to-background overflow-hidden">
                {/* Panel header: title + subtitle + search */}
                <div className="flex items-center justify-between px-5 py-4 border-b border-border/60">
                    <div className="space-y-1.5">
                        <Skeleton className="h-5 w-36" />
                        <Skeleton className="h-3.5 w-52" />
                    </div>
                    <Skeleton className="h-9 w-56 rounded-lg" />
                </div>

                {/* Pending / Rejected tabs */}
                <div className="grid grid-cols-2 border-b border-border/60">
                    <Skeleton className="h-11 w-full rounded-none" />
                    <div className="flex items-center justify-center py-3 border-l border-border/60">
                        <Skeleton className="h-4 w-24" />
                    </div>
                </div>

                {/* Sub-header card */}
                <div className="flex items-center gap-3 px-5 py-3.5 border-b border-border/60">
                    <Skeleton className="h-8 w-8 rounded-lg shrink-0" />
                    <div className="space-y-1.5">
                        <Skeleton className="h-4 w-36" />
                        <Skeleton className="h-3 w-44" />
                    </div>
                </div>

                {/* Rows */}
                <div className="divide-y divide-border/60">
                    {Array.from({ length: 6 }).map((_, i) => (
                        <div key={i} className="flex items-center justify-between px-5 py-4 gap-4">
                            <div className="flex items-center gap-3 flex-1 min-w-0">
                                <Skeleton className="h-9 w-9 rounded-full shrink-0" />
                                <div className="space-y-1.5 min-w-0">
                                    <Skeleton className="h-4 w-40" />
                                    <Skeleton className="h-3 w-52" />
                                </div>
                            </div>
                            <div className="flex items-center gap-2 shrink-0">
                                <Skeleton className="h-8 w-20 rounded-lg" />
                                <Skeleton className="h-8 w-20 rounded-lg" />
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}