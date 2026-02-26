import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-5 md:px-6 md:py-6 space-y-4">
      {/* header card skeleton */}
      <div className="rounded-xl border bg-card p-4 md:p-6">
        <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div className="flex flex-wrap items-center gap-2">
            <Skeleton className="h-6 w-20 rounded-full" />
            <Skeleton className="h-6 w-40 rounded-full" />
            <Skeleton className="h-6 w-24 rounded-full" />
          </div>
          <div className="flex flex-wrap gap-2">
            <Skeleton className="h-6 w-36 rounded-full" />
            <Skeleton className="h-6 w-28 rounded-full" />
            <Skeleton className="h-6 w-32 rounded-full" />
          </div>
        </div>
      </div>

      {/* toolbar skeleton */}
      <div className="rounded-xl border bg-card">
        <div className="p-4 md:p-6 space-y-3">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex flex-wrap gap-2">
              <Skeleton className="h-6 w-40 rounded-full" />
              <Skeleton className="h-6 w-28 rounded-full" />
              <Skeleton className="h-6 w-32 rounded-full" />
            </div>
            <div className="flex flex-wrap gap-2">
              <Skeleton className="h-9 w-44 rounded-md" />
              <Skeleton className="h-9 w-36 rounded-md" />
              <Skeleton className="h-9 w-40 rounded-md" />
            </div>
          </div>

          <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
            <div className="flex gap-2">
              <Skeleton className="h-10 w-44 rounded-md" />
              <Skeleton className="h-10 w-44 rounded-md" />
            </div>
            <Skeleton className="h-10 w-[360px] max-w-full rounded-md" />
          </div>
        </div>
      </div>

      {/* table skeleton */}
      <div className="rounded-xl border bg-card">
        <div className="p-4 md:p-6 space-y-3">
          <Skeleton className="h-6 w-44" />
          <Skeleton className="h-4 w-60" />

          <div className="rounded-lg border overflow-hidden">
            <div className="p-3 border-b flex gap-3">
              <Skeleton className="h-4 w-40" />
              <Skeleton className="h-4 w-28 hidden md:block" />
              <Skeleton className="h-4 w-20 hidden md:block" />
              <Skeleton className="h-4 w-20 hidden md:block" />
              <Skeleton className="h-4 w-24 hidden md:block" />
              <Skeleton className="h-4 w-24 hidden md:block" />
            </div>

            <div className="p-3 space-y-3">
              {Array.from({ length: 7 }).map((_, i) => (
                <Skeleton key={i} className="h-12 w-full rounded-lg" />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}