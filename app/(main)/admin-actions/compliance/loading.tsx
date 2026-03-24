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
                        <Skeleton className="h-7 w-24 rounded-full" />
                        <Skeleton className="h-7 w-32 rounded-full" />
                    </div>
                </div>
            </div>

            {/* ── Toolbar panel ── */}
            <div className="rounded-xl border border-border/60 bg-gradient-to-br from-card to-background px-5 py-4 space-y-3">
                {/* Status pills + action buttons row */}
                <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                    <div className="flex items-center gap-2">
                        <Skeleton className="h-6 w-28 rounded-full" />
                        <Skeleton className="h-6 w-22 rounded-full" />
                        <Skeleton className="h-6 w-32 rounded-full" />
                    </div>
                    <div className="flex items-center gap-2">
                        <Skeleton className="h-9 w-40 rounded-lg" />
                        <Skeleton className="h-9 w-32 rounded-lg" />
                        <Skeleton className="h-9 w-36 rounded-lg" />
                    </div>
                </div>
                {/* Filter dropdowns + search row */}
                <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                    <div className="flex items-center gap-2">
                        <Skeleton className="h-9 w-36 rounded-lg" />
                        <Skeleton className="h-9 w-36 rounded-lg" />
                    </div>
                    <Skeleton className="h-9 w-72 rounded-lg" />
                </div>
                {/* Result count */}
                <Skeleton className="h-3.5 w-20" />
            </div>

            {/* ── Compliance list panel ── */}
            <div className="rounded-xl border border-border/60 bg-gradient-to-br from-card to-background overflow-hidden">
                {/* Sub-header */}
                <div className="flex items-center gap-3 px-5 py-4 border-b border-border/60">
                    <Skeleton className="h-9 w-9 rounded-lg shrink-0" />
                    <div className="space-y-1.5">
                        <Skeleton className="h-4 w-32" />
                        <Skeleton className="h-3 w-56" />
                    </div>
                </div>

                {/* Table header */}
                <div className="grid grid-cols-6 gap-4 px-5 py-3 border-b border-border/60 bg-muted/30">
                    <Skeleton className="h-3.5 w-16" />
                    <Skeleton className="h-3.5 w-16" />
                    <Skeleton className="h-3.5 w-12" />
                    <Skeleton className="h-3.5 w-16" />
                    <Skeleton className="h-3.5 w-20" />
                    <Skeleton className="h-3.5 w-14 ml-auto" />
                </div>

                {/* Table rows */}
                <div className="divide-y divide-border/60">
                    {Array.from({ length: 5 }).map((_, i) => (
                        <div key={i} className="grid grid-cols-6 gap-4 px-5 py-4 items-center">
                            {/* Teacher: name + email */}
                            <div className="space-y-1.5">
                                <Skeleton className="h-4 w-32" />
                                <Skeleton className="h-3 w-40" />
                            </div>
                            {/* School */}
                            <Skeleton className="h-4 w-8" />
                            {/* Total hours */}
                            <Skeleton className="h-4 w-10" />
                            {/* Required */}
                            <Skeleton className="h-4 w-10" />
                            {/* Remaining badge */}
                            <Skeleton className="h-6 w-12 rounded-full" />
                            {/* Status badge */}
                            <Skeleton className="h-6 w-28 rounded-full ml-auto" />
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}