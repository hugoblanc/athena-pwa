/**
 * L'API expose 4 enveloppes paginées incohérentes (AUDIT.md §3).
 * On les normalise toutes derrière `UnifiedPage<T>` via des adaptateurs.
 */

export interface UnifiedPage<T> {
  items: T[];
  page: number;
  hasNext: boolean;
  total?: number;
  totalPages?: number;
}

// ── Forme Content : { count, next?, page, totalCount, objects } ──
export interface ContentPage<T> {
  count: number;
  next?: number;
  page: number;
  totalCount: number;
  objects: T[];
}
export function fromContentPage<T>(p: ContentPage<T>): UnifiedPage<T> {
  return {
    items: p.objects ?? [],
    page: p.page,
    hasNext: p.next != null,
    total: p.totalCount,
  };
}

// ── Forme Podcast : { data, meta:{ page, size, total, totalPages } } ──
export interface MetaPage<T> {
  data: T[];
  meta: { page: number; size: number; total: number; totalPages: number };
}
export function fromMetaPage<T>(p: MetaPage<T>): UnifiedPage<T> {
  return {
    items: p.data ?? [],
    page: p.meta.page,
    hasNext: p.meta.page < p.meta.totalPages,
    total: p.meta.total,
    totalPages: p.meta.totalPages,
  };
}

// ── Forme Law/QA : { data, pagination:{ page, limit, total, totalPages, hasNextPage } } ──
export interface PaginationPage<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNextPage?: boolean;
    hasPreviousPage?: boolean;
  };
}
export function fromPaginationPage<T>(p: PaginationPage<T>): UnifiedPage<T> {
  return {
    items: p.data ?? [],
    page: p.pagination.page,
    hasNext: p.pagination.hasNextPage ?? p.pagination.page < p.pagination.totalPages,
    total: p.pagination.total,
    totalPages: p.pagination.totalPages,
  };
}

// ── Forme "recent" : { data, count } (non paginée) ──
export interface CountPage<T> {
  data: T[];
  count: number;
}
export function fromCountPage<T>(p: CountPage<T>): UnifiedPage<T> {
  return { items: p.data ?? [], page: 1, hasNext: false, total: p.count };
}
