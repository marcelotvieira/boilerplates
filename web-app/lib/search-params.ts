export type ViewMode = 'grid' | 'list';

interface DataListDefaults {
  view?: ViewMode;
  perPage?: number;
}

interface DataListParams {
  view: ViewMode;
  page: number;
  perPage: number;
}

export function parseDataListParams(
  searchParams: Record<string, string | string[] | undefined>,
  defaults: DataListDefaults = {},
): DataListParams {
  const { view: defaultView = 'list', perPage: defaultPerPage = 10 } = defaults;

  const rawView = typeof searchParams.view === 'string' ? searchParams.view : undefined;
  const view: ViewMode = rawView === 'grid' || rawView === 'list' ? rawView : defaultView;

  const rawPage = typeof searchParams.page === 'string' ? parseInt(searchParams.page, 10) : NaN;
  const page = Number.isFinite(rawPage) && rawPage >= 1 ? rawPage : 1;

  const rawPerPage = typeof searchParams.perPage === 'string' ? parseInt(searchParams.perPage, 10) : NaN;
  const perPage = Number.isFinite(rawPerPage) && rawPerPage >= 1 ? rawPerPage : defaultPerPage;

  return { view, page, perPage };
}

export function buildDataListUrl(
  pathname: string,
  current: Record<string, string | string[] | undefined>,
  overrides: Partial<Record<'view' | 'page' | 'perPage', string>>,
): string {
  const params = new URLSearchParams();

  // Copy existing params
  for (const [key, value] of Object.entries(current)) {
    if (typeof value === 'string') {
      params.set(key, value);
    }
  }

  // Apply overrides
  for (const [key, value] of Object.entries(overrides)) {
    if (value !== undefined) {
      params.set(key, value);
    }
  }

  // Reset page to 1 when changing perPage
  if ('perPage' in overrides && !('page' in overrides)) {
    params.set('page', '1');
  }

  // Remove defaults to keep URL clean
  if (params.get('page') === '1') params.delete('page');

  const qs = params.toString();
  return qs ? `${pathname}?${qs}` : pathname;
}

export function paginateItems<T>(items: T[], page: number, perPage: number) {
  const totalPages = Math.max(1, Math.ceil(items.length / perPage));
  const safePage = Math.min(page, totalPages);
  const startIndex = (safePage - 1) * perPage;
  const endIndex = Math.min(startIndex + perPage, items.length);
  const paginatedItems = items.slice(startIndex, endIndex);

  return {
    paginatedItems,
    totalPages,
    currentPage: safePage,
    startIndex,
    endIndex,
    hasNextPage: safePage < totalPages,
    hasPreviousPage: safePage > 1,
  };
}
