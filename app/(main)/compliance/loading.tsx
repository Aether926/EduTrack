import { Skeleton } from "@/components/ui/skeleton";

export default function ComplianceLoading() {
    return (
        <div className="mx-auto w-full max-w-7xl px-4 py-5 md:px-6 md:py-6 space-y-4">
            {/* ── Header card ── */}
            <div className="rounded-xl border border-border/60 bg-gradient-to-br from-card to-background px-5 py-5 md:px-6 md:py-6">
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div className="flex items-center gap-3">
                        <Skeleton className="h-10 w-10 rounded-lg shrink-0" />
                        <div className="space-y-2">
                            <Skeleton className="h-5 w-36" />
                            <Skeleton className="h-3.5 w-72" />
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <Skeleton className="h-6 w-24 rounded-full" />
                        <Skeleton className="h-6 w-28 rounded-full" />
                    </div>
                </div>
            </div>

            {/* ── Stat cards ── */}
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {/* Current school year */}
                <div className="rounded-xl border border-border/60 bg-gradient-to-br from-card to-background px-5 py-5">
                    <div className="flex items-center gap-4">
                        <Skeleton className="h-10 w-10 rounded-lg shrink-0" />
                        <div className="space-y-2">
                            <Skeleton className="h-6 w-28" />
                            <Skeleton className="h-3 w-36" />
                        </div>
                    </div>
                </div>

                {/* Counting period */}
                <div className="rounded-xl border border-border/60 bg-gradient-to-br from-card to-background px-5 py-5">
                    <div className="flex items-center gap-4">
                        <Skeleton className="h-10 w-10 rounded-lg shrink-0" />
                        <div className="space-y-2">
                            <Skeleton className="h-6 w-48" />
                            <Skeleton className="h-3 w-28" />
                        </div>
                    </div>
                </div>

                {/* Approved & passed trainings */}
                <div className="rounded-xl border border-border/60 bg-gradient-to-br from-card to-background px-5 py-5 sm:col-span-2 lg:col-span-1">
                    <div className="flex items-center gap-4">
                        <Skeleton className="h-10 w-10 rounded-lg shrink-0" />
                        <div className="space-y-2">
                            <Skeleton className="h-6 w-8" />
                            <Skeleton className="h-3 w-44" />
                        </div>
                    </div>
                </div>
            </div>

            {/* ── Info banner + download button ── */}
            <div className="rounded-xl border border-border/60 bg-gradient-to-br from-card to-background px-5 py-4">
                <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <Skeleton className="h-5 w-5 rounded-md shrink-0" />
                        <Skeleton className="h-4 w-72" />
                    </div>
                    <Skeleton className="h-9 w-36 rounded-lg shrink-0" />
                </div>
            </div>

            {/* ── Training Compliance card ── */}
            <div className="rounded-xl border border-border/60 bg-gradient-to-br from-card to-background px-5 py-5 space-y-4">
                <div className="flex items-center gap-2">
                    <Skeleton className="h-5 w-5 rounded-md shrink-0" />
                    <Skeleton className="h-5 w-44" />
                </div>
                <Skeleton className="h-4 w-96" />
            </div>

            {/* ── Tabs row ── */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <Skeleton className="h-8 w-28 rounded-full" />
                    <Skeleton className="h-8 w-32 rounded-full" />
                </div>
                <Skeleton className="h-4 w-64" />
            </div>

            {/* ── Empty state area ── */}
            <div className="rounded-xl border border-border/60 bg-gradient-to-br from-card to-background flex items-center justify-center py-16">
                <Skeleton className="h-4 w-64" />
            </div>
        </div>
    );
}