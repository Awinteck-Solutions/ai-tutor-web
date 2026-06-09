import { useCallback, useEffect, useMemo, useState } from 'react';

const normalizeMeta = (result, page, pageSize) => {
  const items = result?.items ?? [];
  const total = Number(result?.meta?.total);
  const limit = Number(result?.meta?.limit) || pageSize;
  const resolvedTotal = Number.isFinite(total) && total >= 0 ? total : items.length;
  const totalPages = Number(result?.meta?.totalPages)
    || Math.max(1, Math.ceil(resolvedTotal / limit));

  return {
    items,
    meta: {
      ...result?.meta,
      total: resolvedTotal,
      limit,
      totalPages,
      page: Number(result?.meta?.page) || page,
    },
  };
};

export const useServerList = (fetchFn, deps = [], pageSize = 10) => {
  const [page, setPageState] = useState(1);
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState({});
  const [items, setItems] = useState([]);
  const [meta, setMeta] = useState({ total: 0, totalPages: 1, page: 1, limit: pageSize });
  const [loading, setLoading] = useState(true);

  const filtersKey = useMemo(() => JSON.stringify(filters), [filters]);

  const setPage = useCallback((nextPage) => {
    const parsed = Number(nextPage);
    setPageState(Number.isFinite(parsed) && parsed > 0 ? parsed : 1);
  }, []);

  useEffect(() => {
    setPageState(1);
  }, [search, filtersKey]);

  useEffect(() => {
    let active = true;

    (async () => {
      setLoading(true);
      try {
        const result = await fetchFn({
          page,
          limit: pageSize,
          search,
          ...filters,
        });
        if (!active) return;

        const normalized = normalizeMeta(result, page, pageSize);
        setItems(normalized.items);
        setMeta(normalized.meta);
      } finally {
        if (active) setLoading(false);
      }
    })();

    return () => {
      active = false;
    };
  }, [fetchFn, page, pageSize, search, filtersKey, ...deps]);

  const reload = useCallback(async () => {
    setLoading(true);
    try {
      const result = await fetchFn({
        page,
        limit: pageSize,
        search,
        ...filters,
      });
      const normalized = normalizeMeta(result, page, pageSize);
      setItems(normalized.items);
      setMeta(normalized.meta);
    } finally {
      setLoading(false);
    };
  }, [fetchFn, page, pageSize, search, filters, filtersKey]);

  const rangeStart = items.length ? (page - 1) * pageSize + 1 : 0;
  const rangeEnd = Math.min(page * pageSize, meta.total || items.length);

  return {
    items,
    loading,
    page,
    setPage,
    search,
    setSearch,
    filters,
    setFilters,
    meta,
    reload,
    rangeStart,
    rangeEnd,
    pageSize,
  };
};

export default useServerList;
