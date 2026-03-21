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
                            <Skeleton className="h-5 w-36" />
                            <Skeleton className="h-3.5 w-64" />
                        </div>
                    </div>
                    {/* Right: role badge + teacher count + two buttons */}
                    <div className="flex items-center gap-2">
                        <Skeleton className="h-7 w-16 rounded-full" />
                        <Skeleton className="h-7 w-24 rounded-full" />
                        <Skeleton className="h-9 w-36 rounded-lg" />
                        <Skeleton className="h-9 w-40 rounded-lg" />
                    </div>
                </div>
            </div>

            {/* ── Tabs ── */}
            <div className="flex items-center gap-2">
                <Skeleton className="h-9 w-24 rounded-lg" />
                <Skeleton className="h-9 w-36 rounded-lg" />
            </div>

            {/* ── Main content ── */}
            <div className="grid gap-4 lg:grid-cols-3">
                {/* Quick actions — 2x3 grid of action cards */}
                <div className="lg:col-span-2 space-y-3">
                    <div className="space-y-1">
                        <Skeleton className="h-5 w-28" />
                        <Skeleton className="h-3.5 w-52" />
                    </div>
                    <div className="grid gap-3 sm:grid-cols-2">
                        {Array.from({ length: 6 }).map((_, i) => (
                            <div key={i} className="rounded-xl border border-border/60 bg-gradient-to-br from-card to-background p-5 space-y-3">
                                <div className="flex items-start justify-between">
                                    <Skeleton className="h-10 w-10 rounded-lg" />
                                    <Skeleton className="h-5 w-20 rounded-full" />
                                </div>
                                <div className="space-y-1.5">
                                    <Skeleton className="h-4 w-40" />
                                    <Skeleton className="h-3.5 w-56" />
                                </div>
                                <Skeleton className="h-3.5 w-16" />
                            </div>
                        ))}
                    </div>
                </div>

                {/* Teacher snapshot panel */}
                <div className="rounded-xl border border-border/60 bg-gradient-to-br from-card to-background overflow-hidden">
                    {/* Snapshot header */}
                    <div className="px-5 py-4 border-b border-border/60 space-y-1">
                        <div className="flex items-center justify-between">
                            <Skeleton className="h-5 w-36" />
                            <Skeleton className="h-6 w-16 rounded-full" />
                        </div>
                        <Skeleton className="h-3.5 w-48" />
                    </div>

                    {/* Big number */}
                    <div className="px-5 py-4 border-b border-border/60">
                        <Skeleton className="h-10 w-12" />
                        <Skeleton className="h-3 w-40 mt-1.5" />
                    </div>

                    {/* Teacher rows */}
                    <div className="divide-y divide-border/60">
                        {Array.from({ length: 5 }).map((_, i) => (
                            <div key={i} className="flex items-center justify-between px-5 py-3.5 gap-3">
                                <div className="flex items-center gap-3">
                                    <Skeleton className="h-8 w-8 rounded-full shrink-0" />
                                    <div className="space-y-1.5">
                                        <Skeleton className="h-3.5 w-28" />
                                        <Skeleton className="h-3 w-36" />
                                    </div>
                                </div>
                                <Skeleton className="h-4 w-4 rounded shrink-0" />
                            </div>
                        ))}
                    </div>
                    {/* Footer button */}
                    <div className="px-5 py-4 border-t border-border/60">
                        <Skeleton className="h-9 w-full rounded-lg" />
                    </div>
                </div>
            </div>
        </div>
    );
}