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
                                <Skeleton className="h-5 w-32" />
                                <Skeleton className="h-5 w-16 rounded-full" />
                            </div>
                            <Skeleton className="h-3.5 w-72" />
                        </div>
                    </div>
                    {/* Right: 3 stat badges */}
                    <div className="flex items-center gap-2">
                        <Skeleton className="h-7 w-24 rounded-full" />
                        <Skeleton className="h-7 w-24 rounded-full" />
                        <Skeleton className="h-7 w-24 rounded-full" />
                    </div>
                </div>
            </div>

            {/* ── Submissions table panel ── */}
            <div className="rounded-xl border border-border/60 bg-gradient-to-br from-card to-background overflow-hidden">
                {/* Sub-header */}
                <div className="flex items-center justify-between px-5 py-4 border-b border-border/60">
                    <div className="flex items-center gap-3">
                        <Skeleton className="h-8 w-8 rounded-lg shrink-0" />
                        <div className="space-y-1.5">
                            <Skeleton className="h-4 w-28" />
                            <Skeleton className="h-3 w-44" />
                        </div>
                    </div>
                    <Skeleton className="h-9 w-56 rounded-lg" />
                </div>

                {/* Table header */}
                <div className="grid grid-cols-5 gap-4 px-5 py-3 border-b border-border/60 bg-muted/30">
                    <Skeleton className="h-3.5 w-24" />
                    <Skeleton className="h-3.5 w-16" />
                    <Skeleton className="h-3.5 w-14" />
                    <Skeleton className="h-3.5 w-20" />
                    <Skeleton className="h-3.5 w-16 ml-auto" />
                </div>

                {/* Table rows */}
                <div className="divide-y divide-border/60">
                    {Array.from({ length: 6 }).map((_, i) => (
                        <div key={i} className="grid grid-cols-5 gap-4 px-5 py-4 items-center">
                            {/* Submission: title + meta */}
                            <div className="space-y-1.5">
                                <Skeleton className="h-4 w-24" />
                                <Skeleton className="h-3 w-40" />
                            </div>
                            {/* Teacher: avatar + name + email */}
                            <div className="flex items-center gap-2">
                                <Skeleton className="h-8 w-8 rounded-full shrink-0" />
                                <div className="space-y-1.5">
                                    <Skeleton className="h-3.5 w-28" />
                                    <Skeleton className="h-3 w-36" />
                                </div>
                            </div>
                            {/* Status badge */}
                            <Skeleton className="h-6 w-20 rounded-full" />
                            {/* Submitted date */}
                            <Skeleton className="h-4 w-36" />
                            {/* Action button */}
                            <div className="flex justify-end">
                                <Skeleton className="h-8 w-20 rounded-lg" />
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}