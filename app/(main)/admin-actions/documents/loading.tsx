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
                    {/* Right: role badge */}
                    <Skeleton className="h-6 w-16 rounded-full" />
                </div>
            </div>

            {/* ── 4 stat cards ── */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="rounded-xl border border-border/60 bg-gradient-to-br from-card to-background p-4">
                        <div className="flex items-center gap-3">
                            <Skeleton className="h-8 w-8 rounded-full shrink-0" />
                            <div className="space-y-1.5">
                                <Skeleton className="h-7 w-8" />
                                <Skeleton className="h-3 w-20" />
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* ── Pending Review section ── */}
            <div className="space-y-3">
                <Skeleton className="h-6 w-48" />
                <div className="rounded-xl border border-border/60 bg-gradient-to-br from-card to-background flex items-center justify-center py-16">
                    <Skeleton className="h-4 w-56" />
                </div>
            </div>

            {/* ── Teacher Overview section ── */}
            <div className="space-y-3">
                <Skeleton className="h-6 w-40" />

                <div className="rounded-xl border border-border/60 bg-gradient-to-br from-card to-background overflow-hidden">
                    {/* Sub-header */}
                    <div className="flex items-center gap-3 px-5 py-4 border-b border-border/60">
                        <Skeleton className="h-8 w-8 rounded-lg shrink-0" />
                        <div className="space-y-1.5">
                            <Skeleton className="h-4 w-36" />
                            <Skeleton className="h-3 w-24" />
                        </div>
                    </div>

                    {/* Table header */}
                    <div className="grid grid-cols-6 gap-3 px-5 py-3 border-b border-border/60 bg-muted/30">
                        <Skeleton className="h-3.5 w-20" />
                        <Skeleton className="h-3.5 w-16 justify-self-center" />
                        <Skeleton className="h-3.5 w-14 justify-self-center" />
                        <Skeleton className="h-3.5 w-16 justify-self-center" />
                        <Skeleton className="h-3.5 w-16 justify-self-center" />
                        <Skeleton className="h-3.5 w-20 justify-self-end" />
                    </div>

                    {/* Table rows */}
                    <div className="divide-y divide-border/60">
                        {Array.from({ length: 5 }).map((_, i) => (
                            <div key={i} className="grid grid-cols-6 gap-3 px-5 py-4 items-center">
                                <div className="space-y-1.5">
                                    <Skeleton className="h-4 w-32" />
                                    <Skeleton className="h-3 w-44" />
                                </div>
                                <Skeleton className="h-4 w-6 justify-self-center" />
                                <Skeleton className="h-4 w-6 justify-self-center" />
                                <Skeleton className="h-4 w-6 justify-self-center" />
                                <Skeleton className="h-4 w-6 justify-self-center" />
                                <div className="flex items-center gap-2 justify-self-end w-full">
                                    <Skeleton className="h-2 w-full rounded-full" />
                                    <Skeleton className="h-3.5 w-8 shrink-0" />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}