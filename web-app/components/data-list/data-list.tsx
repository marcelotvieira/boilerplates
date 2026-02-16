import { ReactNode } from 'react';
import { cn } from '@/lib/utils';
import type { ViewMode } from '@/lib/search-params';

interface DataListProps<T> {
  items: T[];
  viewMode: ViewMode;
  renderItem: (item: T, index: number) => ReactNode;
  keyExtractor: (item: T, index: number) => string;
  emptyMessage?: ReactNode;
  gridClassName?: string;
  listClassName?: string;
  itemClassName?: string;
}

export function DataList<T>({
  items,
  viewMode,
  renderItem,
  keyExtractor,
  emptyMessage = 'Nenhum item encontrado.',
  gridClassName,
  listClassName,
  itemClassName,
}: DataListProps<T>) {
  if (items.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        {emptyMessage}
      </div>
    );
  }

  if (viewMode === 'grid') {
    return (
      <div
        className={cn(
          'grid gap-4 grid-cols-1 md:grid-cols-1 lg:grid-cols-2 xl:grid-cols-3',
          gridClassName,
        )}
      >
        {items.map((item, index) => (
          <div key={keyExtractor(item, index)} className={itemClassName}>
            {renderItem(item, index)}
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className={cn('space-y-4', listClassName)}>
      {items.map((item, index) => (
        <div key={keyExtractor(item, index)} className={itemClassName}>
          {renderItem(item, index)}
        </div>
      ))}
    </div>
  );
}
