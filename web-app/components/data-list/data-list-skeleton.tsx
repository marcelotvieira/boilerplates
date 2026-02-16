import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';
import type { ViewMode } from '@/lib/search-params';

function ListSkeletonItem() {
  return (
    <div className="flex items-center justify-between rounded-lg border p-4">
      <div className="flex flex-col gap-2 min-w-0 flex-1">
        <Skeleton className="h-4 w-36" />
        <Skeleton className="h-3 w-48" />
      </div>
      <div className="flex items-center gap-3 shrink-0">
        <Skeleton className="h-5 w-20 rounded-full" />
        <Skeleton className="h-3 w-16" />
      </div>
    </div>
  );
}

function GridSkeletonItem() {
  return (
    <div className="rounded-xl border bg-card p-6 space-y-4">
      <div className="space-y-2">
        <Skeleton className="h-5 w-32" />
        <Skeleton className="h-3 w-24" />
      </div>
      <div className="flex items-center gap-4">
        <Skeleton className="h-5 w-20 rounded-full" />
        <Skeleton className="h-5 w-16 rounded-full" />
      </div>
    </div>
  );
}

interface DataListSkeletonProps {
  viewMode: ViewMode;
  count?: number;
  gridClassName?: string;
}

export function DataListSkeleton({
  viewMode,
  count = 5,
  gridClassName,
}: DataListSkeletonProps) {
  const items = Array.from({ length: count });

  if (viewMode === 'grid') {
    return (
      <div
        className={cn(
          'grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
          gridClassName,
        )}
      >
        {items.map((_, i) => (
          <GridSkeletonItem key={i} />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {items.map((_, i) => (
        <ListSkeletonItem key={i} />
      ))}
    </div>
  );
}
