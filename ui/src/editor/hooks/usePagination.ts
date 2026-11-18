import { useState } from 'react';

function usePagination(pageSize?: number) {
  const [page, setPage] = useState(1);

  const resetPage = () => setPage(1);

  function paginate<T>(items: T[]) {
    if (!pageSize) {
      return { pageItems: items, currentPage: 1, total: items.length };
    }
    const pageCount = Math.max(1, Math.ceil(items.length / pageSize));
    const currentPage = Math.min(page, pageCount);
    return {
      pageItems: items.slice(
        (currentPage - 1) * pageSize,
        currentPage * pageSize
      ),
      currentPage,
      total: items.length,
    };
  }

  return { setPage, resetPage, paginate };
}

export default usePagination;
