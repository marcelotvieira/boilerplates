import Link from 'next/link';
import { cn } from '@/lib/utils';
import { buttonVariants } from '@/components/ui/button';
import { buildDataListUrl } from '@/lib/search-params';

interface ItemsPerPageSelectorProps {
  value: number;
  options?: number[];
  pathname: string;
  searchParams: Record<string, string | string[] | undefined>;
}

export function ItemsPerPageSelector({
  value,
  options = [10, 25, 50],
  pathname,
  searchParams,
}: ItemsPerPageSelectorProps) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-sm text-muted-foreground">Por página:</span>
      <div className="flex items-center gap-1">
        {options.map((option) => {
          const isActive = value === option;

          if (isActive) {
            return (
              <span
                key={option}
                className={cn(buttonVariants({ variant: 'secondary', size: 'xs' }))}
              >
                {option}
              </span>
            );
          }

          return (
            <Link
              key={option}
              href={buildDataListUrl(pathname, searchParams, { perPage: String(option) })}
              className={cn(buttonVariants({ variant: 'ghost', size: 'xs' }))}
            >
              {option}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
