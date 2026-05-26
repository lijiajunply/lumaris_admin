import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

interface LoadingSkeletonProps {
  variant?: "card" | "table" | "detail";
  count?: number;
  className?: string;
}

export function LoadingSkeleton({ variant = "card", count = 6, className }: LoadingSkeletonProps) {
  if (variant === "table") {
    return (
      <div className={cn("space-y-3", className)}>
        {Array.from({ length: count }).map((_, i) => (
          <Skeleton key={i} className="h-14 w-full rounded-xl" />
        ))}
      </div>
    );
  }

  if (variant === "detail") {
    return (
      <div className={cn("space-y-4", className)}>
        <Skeleton className="h-8 w-48 rounded-lg" />
        <Skeleton className="h-64 w-full rounded-2xl" />
        <Skeleton className="h-6 w-3/4 rounded-lg" />
        <Skeleton className="h-6 w-1/2 rounded-lg" />
      </div>
    );
  }

  return (
    <div className={cn("grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4", className)}>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="rounded-2xl border border-border/50 p-5 space-y-3">
          <div className="flex items-start gap-3">
            <Skeleton className="size-10 rounded-xl shrink-0" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-5 w-2/3 rounded-lg" />
              <Skeleton className="h-4 w-full rounded-lg" />
            </div>
          </div>
          <div className="flex gap-1.5">
            <Skeleton className="h-5 w-16 rounded-lg" />
            <Skeleton className="h-5 w-12 rounded-lg" />
          </div>
        </div>
      ))}
    </div>
  );
}
