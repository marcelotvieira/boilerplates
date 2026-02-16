import Link from 'next/link';
import { LayoutGrid, List } from 'lucide-react';
import { cn } from '@/lib/utils';
import { buttonVariants } from '@/components/ui/button';
import { buildDataListUrl, type ViewMode } from '@/lib/search-params';

interface ViewToggleProps {
  viewMode: ViewMode;
  pathname: string;
  searchParams: Record<string, string | string[] | undefined>;
}

export function ViewToggle({ viewMode, pathname, searchParams }: ViewToggleProps) {
  return (
    <div className="flex items-center gap-1 border rounded-lg p-1">
      <Link
        href={buildDataListUrl(pathname, searchParams, { view: 'grid' })}
        className={cn(buttonVariants({ variant: viewMode === 'grid' ? 'secondary' : 'ghost', size: 'icon-sm' }))}
        aria-label="Visualização em grade"
      >
        <LayoutGrid className="h-4 w-4" />
      </Link>
      <Link
        href={buildDataListUrl(pathname, searchParams, { view: 'list' })}
        className={cn(buttonVariants({ variant: viewMode === 'list' ? 'secondary' : 'ghost', size: 'icon-sm' }))}
        aria-label="Visualização em lista"
      >
        <List className="h-4 w-4" />
      </Link>
    </div>
  );
}
