import { useEffect, useMemo, useState } from 'react';
import { useClientPagination } from './useClientPagination';

const defaultMatchSearch = (item, query, keys) =>
  keys.some((key) => {
    const value = key.split('.').reduce((obj, part) => obj?.[part], item);
    return String(value ?? '').toLowerCase().includes(query);
  });

/**
 * Client-side search, optional named filters, and pagination.
 * @param {Array} items
 * @param {Object} options
 * @param {number} options.pageSize
 * @param {string[]} options.searchKeys
 * @param {Array<{ key: string, defaultValue?: string, apply: (item, value) => boolean }>} options.filters
 */
export const useClientList = (items = [], options = {}) => {
  const {
    pageSize = 9,
    searchKeys = ['title'],
    filters = [],
    matchSearch = defaultMatchSearch,
  } = options;

  const [search, setSearch] = useState('');
  const [filterValues, setFilterValues] = useState(() =>
    Object.fromEntries(filters.map((f) => [f.key, f.defaultValue ?? 'all'])),
  );

  const setFilter = (key, value) => {
    setFilterValues((prev) => ({ ...prev, [key]: value }));
  };

  const filtered = useMemo(() => {
    const list = Array.isArray(items) ? items : [];
    const q = search.trim().toLowerCase();

    return list.filter((item) => {
      if (q && !matchSearch(item, q, searchKeys)) return false;
      return filters.every((f) => {
        const val = filterValues[f.key] ?? 'all';
        if (val === 'all' || !f.apply) return true;
        return f.apply(item, val);
      });
    });
  }, [items, search, searchKeys, filters, filterValues, matchSearch]);

  const { setPage, ...pagination } = useClientPagination(filtered, pageSize);

  useEffect(() => {
    setPage(1);
  }, [search, filterValues, pageSize, setPage]);

  return {
    search,
    setSearch,
    filterValues,
    setFilter,
    filtered,
    ...pagination,
  };
};

export default useClientList;
