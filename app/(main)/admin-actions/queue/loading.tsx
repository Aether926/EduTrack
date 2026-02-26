import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Users, Briefcase, BookMarked, Clock } from "lucide-react";

export default function Loading() {
  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-5 md:px-6 md:py-6 space-y-4">
      {/* header card skeleton (matches real header) */}
      <div className="rounded-xl border bg-card p-4 md:p-6">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="flex flex-wrap items-center gap-2">
            <Skeleton className="h-6 w-20 rounded-full" />
            <Skeleton className="h-6 w-24 rounded-full" />
          </div>

          <div className="flex flex-wrap gap-2">
            <Badge variant="secondary" className="gap-2">
              <Users className="h-3.5 w-3.5" />
              <Skeleton className="h-4 w-12" />
            </Badge>
            <Badge variant="secondary" className="gap-2">
              <Briefcase className="h-3.5 w-3.5" />
              <Skeleton className="h-4 w-20" />
            </Badge>
            <Badge variant="secondary" className="gap-2">
              <BookMarked className="h-3.5 w-3.5" />
              <Skeleton className="h-4 w-24" />
            </Badge>
          </div>
        </div>
      </div>

      {/* total pending card skeleton */}
      <Card>
        <CardContent className="p-4 md:p-6 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Clock className="h-4 w-4" />
            <span>Total pending</span>
          </div>
          <Skeleton className="h-8 w-10" />
        </CardContent>
      </Card>

      {/* 3 queue cards skeleton */}
      <div className="grid gap-4 lg:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <Card key={i} className="min-w-0">
            <CardContent className="p-4 md:p-6 space-y-4">
              {/* card header area */}
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-2 min-w-0">
                  <Skeleton className="h-9 w-44" />
                  <Skeleton className="h-4 w-56" />
                </div>
                <div className="flex flex-col gap-2 shrink-0">
                  <Skeleton className="h-9 w-28 rounded-md" />
                  <Skeleton className="h-9 w-28 rounded-md" />
                </div>
              </div>

              {/* rows */}
              <div className="space-y-2">
                {Array.from({ length: 4 }).map((__, j) => (
                  <Skeleton key={j} className="h-12 w-full rounded-lg" />
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}