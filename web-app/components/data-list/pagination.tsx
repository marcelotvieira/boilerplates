import Link from 'next/link';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { buttonVariants } from '@/components/ui/button';
import { buildDataListUrl } from '@/lib/search-params';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  pathname: string;
  searchParams: Record<string, string | string[] | undefined>;
}

export function Pagination({
  currentPage,
  totalPages,
  hasNextPage,
  hasPreviousPage,
  pathname,
  searchParams,
}: PaginationProps) {
  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const maxVisible = 5;

    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      pages.push(1);

      if (currentPage > 3) {
        pages.push('...');
      }

      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);

      for (let i = start; i <= end; i++) {
        pages.push(i);
      }

      if (currentPage < totalPages - 2) {
        pages.push('...');
      }

      pages.push(totalPages);
    }

    return pages;
  };

  if (totalPages <= 1) return null;

  const disabledClass = 'pointer-events-none opacity-50';

  return (
    <div className="flex items-center justify-center gap-2">
      {hasPreviousPage ? (
        <Link
          href={buildDataListUrl(pathname, searchParams, { page: String(currentPage - 1) })}
          className={cn(buttonVariants({ variant: 'outline', size: 'icon-sm' }))}
          aria-label="Página anterior"
        >
          <ChevronLeft className="h-4 w-4" />
        </Link>
      ) : (
        <span
          className={cn(buttonVariants({ variant: 'outline', size: 'icon-sm' }), disabledClass)}
          aria-disabled="true"
        >
          <ChevronLeft className="h-4 w-4" />
        </span>
      )}

      {getPageNumbers().map((page, index) => {
        if (page === '...') {
          return (
            <span key={`ellipsis-${index}`} className="px-2 text-muted-foreground">
              ...
            </span>
          );
        }

        const isCurrentPage = currentPage === page;

        if (isCurrentPage) {
          return (
            <span
              key={page}
              className={cn(buttonVariants({ variant: 'default', size: 'icon-sm' }), 'min-w-[36px]')}
            >
              {page}
            </span>
          );
        }

        return (
          <Link
            key={page}
            href={buildDataListUrl(pathname, searchParams, { page: String(page) })}
            className={cn(buttonVariants({ variant: 'outline', size: 'icon-sm' }), 'min-w-[36px]')}
          >
            {page}
          </Link>
        );
      })}

      {hasNextPage ? (
        <Link
          href={buildDataListUrl(pathname, searchParams, { page: String(currentPage + 1) })}
          className={cn(buttonVariants({ variant: 'outline', size: 'icon-sm' }))}
          aria-label="Próxima página"
        >
          <ChevronRight className="h-4 w-4" />
        </Link>
      ) : (
        <span
          className={cn(buttonVariants({ variant: 'outline', size: 'icon-sm' }), disabledClass)}
          aria-disabled="true"
        >
          <ChevronRight className="h-4 w-4" />
        </span>
      )}
    </div>
  );
}
