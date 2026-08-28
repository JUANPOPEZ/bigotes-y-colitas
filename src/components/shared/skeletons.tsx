import { Skeleton } from "@/components/ui/skeleton";

export function TableSkeleton({ filas = 5 }: { filas?: number }) {
  return (
    <div className="space-y-3" aria-hidden="true">
      {Array.from({ length: filas }).map((_, i) => (
        <div key={i} className="flex items-center gap-4 rounded-xl border border-border p-4">
          <Skeleton className="size-10 rounded-full" />
          <Skeleton className="h-4 flex-1" />
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-4 w-16" />
        </div>
      ))}
    </div>
  );
}

export function CardsSkeleton({ items = 6 }: { items?: number }) {
  return (
    <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3" aria-hidden="true">
      {Array.from({ length: items }).map((_, i) => (
        <div key={i} className="space-y-3 rounded-2xl border border-border p-4">
          <Skeleton className="aspect-[4/3] w-full rounded-xl" />
          <Skeleton className="h-5 w-2/3" />
          <Skeleton className="h-4 w-1/2" />
          <Skeleton className="h-9 w-full rounded-full" />
        </div>
      ))}
    </div>
  );
}
