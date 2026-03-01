export interface PaginationMeta {
  page: number;
  totalPages: number;
  totalCount: number;
  nextPage: number | null;
  prevPage: number | null;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: PaginationMeta;
}

export function parsePaginationHeaders(headers: Headers): PaginationMeta {
  const page = parseInt(headers.get('x-page-number') ?? '1', 10);
  const totalPages = parseInt(headers.get('x-total-pages') ?? '1', 10);
  const totalCount = parseInt(headers.get('x-total-count') ?? '0', 10);
  const nextPage = headers.get('x-next-page');
  const prevPage = headers.get('x-prev-page');

  return {
    page,
    totalPages,
    totalCount,
    nextPage: nextPage ? parseInt(nextPage, 10) : null,
    prevPage: prevPage ? parseInt(prevPage, 10) : null,
  };
}
