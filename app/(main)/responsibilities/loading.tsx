import { Skeleton } from "@/components/ui/skeleton";

export default function MyResponsibilitiesLoading() {
    return (
        <div className="mx-auto w-full max-w-7xl px-4 py-5 md:px-6 md:py-6 space-y-4">
            {/* ── Page header band ── */}
            <div className="rounded-xl border border-border/60 bg-gradient-to-br from-card to-background px-5 py-5 md:px-6 md:py-6">
                <div className="flex items-center gap-3">
                    <Skeleton className="h-10 w-10 rounded-lg shrink-0" />
                    <div className="space-y-2">
                        <Skeleton className="h-5 w-44" />
                        <Skeleton className="h-3.5 w-72" />
                    </div>
                </div>
            </div>

            {/* ── Stat cards ── */}
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {Array.from({ length: 3 }).map((_, i) => (
                    <div
                        key={i}
                        className="rounded-xl border border-border/60 bg-gradient-to-br from-card to-background px-5 py-4"
                    >
                        <div className="flex items-center gap-4">
                            <Skeleton className="h-10 w-10 rounded-lg shrink-0" />
                            <div className="space-y-2">
                                <Skeleton className="h-7 w-8" />
                                <Skeleton className="h-3 w-32" />
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* ── Client UI ── */}
            <div className="rounded-xl border border-border/60 bg-gradient-to-br from-card to-background overflow-hidden">
                {/* Toolbar row */}
                <div className="flex items-center justify-between px-5 py-4 border-b border-border/60">
                    <div className="flex items-center gap-3">
                        <Skeleton className="h-8 w-8 rounded-lg shrink-0" />
                        <Skeleton className="h-4 w-64" />
                    </div>
                    <Skeleton className="h-9 w-56 rounded-lg" />
                </div>

                {/* Tabs row */}
                <div className="flex items-center justify-between px-5 py-3 border-b border-border/60">
                    <div className="flex items-center gap-2">
                        <Skeleton className="h-8 w-24 rounded-full" />
                        <Skeleton className="h-8 w-24 rounded-full" />
                    </div>
                    <Skeleton className="h-4 w-64" />
                </div>

                {/* Empty state area */}
                <div className="flex items-center justify-center px-5 py-16">
                    <Skeleton className="h-4 w-48" />
                </div>
            </div>
        </div>
    );
}