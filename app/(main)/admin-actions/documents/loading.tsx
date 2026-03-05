import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
    return (
        <div className="mx-auto w-full max-w-7xl px-4 py-5 md:px-6 md:py-6 space-y-6">
            {/* header card */}
            <div className="rounded-xl border bg-card p-4 md:p-6">
                <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
                    <div className="flex flex-wrap items-center gap-2">
                        <Skeleton className="h-6 w-16 rounded-full" />
                        <Skeleton className="h-6 w-44 rounded-full" />
                    </div>
                </div>
            </div>

            {/* stats cards (exact row layout) */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="rounded-xl border bg-card p-4">
                        <div className="flex items-center gap-3">
                            <Skeleton className="h-5 w-5 rounded-full" />
                            <div className="space-y-2">
                                <Skeleton className="h-7 w-10" />
                                <Skeleton className="h-3 w-24" />
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Pending Review section */}
            <div className="space-y-3">
                <Skeleton className="h-6 w-52" />

                {/* tabs */}
                <div className="flex items-center gap-2">
                    <Skeleton className="h-9 w-44 rounded-md" />
                    <Skeleton className="h-9 w-44 rounded-md" />
                </div>

                {/* big panel */}
                <div className="rounded-xl border bg-card">
                    <div className="p-10 sm:p-12 flex items-center justify-center">
                        <Skeleton className="h-4 w-64" />
                    </div>
                </div>
            </div>

            {/* Teacher Overview section */}
            <div className="space-y-3">
                <Skeleton className="h-6 w-44" />

                <div className="rounded-xl border bg-card">
                    <div className="p-0">
                        <div className="w-full overflow-hidden rounded-xl">
                            <div className="border-b p-3">
                                <div className="grid grid-cols-6 gap-3">
                                    <Skeleton className="h-4 w-32" />
                                    <Skeleton className="h-4 w-20 justify-self-center" />
                                    <Skeleton className="h-4 w-20 justify-self-center" />
                                    <Skeleton className="h-4 w-20 justify-self-center" />
                                    <Skeleton className="h-4 w-20 justify-self-center" />
                                    <Skeleton className="h-4 w-32 justify-self-end" />
                                </div>
                            </div>

                            <div className="p-3 space-y-3">
                                {Array.from({ length: 6 }).map((_, i) => (
                                    <div
                                        key={i}
                                        className="grid grid-cols-6 gap-3 items-center"
                                    >
                                        <div className="space-y-2">
                                            <Skeleton className="h-4 w-44" />
                                            <Skeleton className="h-3 w-56" />
                                        </div>

                                        <Skeleton className="h-4 w-8 justify-self-center" />
                                        <Skeleton className="h-4 w-8 justify-self-center" />
                                        <Skeleton className="h-4 w-8 justify-self-center" />
                                        <Skeleton className="h-4 w-8 justify-self-center" />

                                        <div className="flex items-center gap-3 justify-self-end w-full">
                                            <Skeleton className="h-2 w-full rounded-full" />
                                            <Skeleton className="h-4 w-10" />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
