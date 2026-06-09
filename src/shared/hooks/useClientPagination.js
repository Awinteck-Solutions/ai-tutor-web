import { useCallback, useEffect, useMemo, useState } from 'react';

export const useClientPagination = (items = [], pageSize = 10) => {
  const list = Array.isArray(items) ? items : [];
  const [page, setPageState] = useState(1);

  const setPage = useCallback((nextPage) => {
    const parsed = Number(nextPage);
    setPageState(Number.isFinite(parsed) && parsed > 0 ? parsed : 1);
  }, []);

  const totalPages = Math.max(1, Math.ceil(list.length / pageSize));

  useEffect(() => {
    if (page > totalPages) setPage(totalPages);
  }, [page, totalPages, setPage]);

  useEffect(() => {
    setPage(1);
  }, [list.length, pageSize, setPage]);

  const paginatedItems = useMemo(() => {
    const start = (page - 1) * pageSize;
    return list.slice(start, start + pageSize);
  }, [list, page, pageSize]);

  const rangeStart = list.length ? (page - 1) * pageSize + 1 : 0;
  const rangeEnd = Math.min(page * pageSize, list.length);

  return {
    page,
    setPage,
    totalPages,
    paginatedItems,
    rangeStart,
    rangeEnd,
    totalItems: list.length,
    showPagination: list.length > pageSize,
  };
};

export default useClientPagination;
