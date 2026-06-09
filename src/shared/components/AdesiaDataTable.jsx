import { Pagination, TextInput } from '@mantine/core';
import { Search } from 'lucide-react';
import { useMemo, useState } from 'react';
import { useClientPagination } from '../hooks/useClientPagination';
import { TableSkeleton } from './TableSkeleton';

const AdesiaDataTable = ({
  title,
  description,
  columns = [],
  data = [],
  pageSize = 10,
  paginate = true,
  serverPagination = false,
  page = 1,
  totalPages = 1,
  totalItems = 0,
  rangeStart = 0,
  rangeEnd = 0,
  onPageChange,
  emptyMessage = 'No records found',
  loading = false,
  skeletonRows = 6,
  headerAction,
  getRowKey = (row, index) => row.id || row._id || row.enrollmentId || index,
  searchable = false,
  searchKeys = [],
  searchPlaceholder = 'Search…',
  search: controlledSearch,
  onSearchChange,
}) => {
  const [internalSearch, setInternalSearch] = useState('');
  const searchValue = controlledSearch ?? internalSearch;
  const setSearchValue = onSearchChange ?? setInternalSearch;

  const filteredData = useMemo(() => {
    if (serverPagination || !searchable || !searchValue.trim()) return data;
    const q = searchValue.toLowerCase();
    return data.filter((row) => searchKeys.some((key) => {
      const val = typeof key === 'function' ? key(row) : row[key];
      return String(val ?? '').toLowerCase().includes(q);
    }));
  }, [data, searchValue, searchable, searchKeys, serverPagination]);

  const client = useClientPagination(filteredData, pageSize);

  const rows = serverPagination || !paginate ? data : client.paginatedItems;
  const showFooter = serverPagination
    ? totalPages > 1
    : paginate && client.showPagination;

  const footerStart = serverPagination ? rangeStart : client.rangeStart;
  const footerEnd = serverPagination ? rangeEnd : client.rangeEnd;
  const footerTotal = serverPagination ? totalItems : client.totalItems;
  const showSearch = searchable && !serverPagination;
  const footerPage = serverPagination ? page : client.page;
  const footerTotalPages = serverPagination ? totalPages : client.totalPages;
  const handlePageChange = serverPagination ? onPageChange : client.setPage;

  if (loading) {
    return <TableSkeleton rows={skeletonRows} columns={columns.length || 4} title={title || true} />;
  }

  return (
    <div className="data-table-wrap">
      {showSearch && (
        <div className="border-b border-border/50 px-5 py-3">
          <TextInput
            placeholder={searchPlaceholder}
            leftSection={<Search className="h-4 w-4 text-muted-foreground" />}
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            className="max-w-md"
          />
        </div>
      )}

      {(title || description || headerAction) && (
        <div className="flex flex-wrap items-start justify-between gap-3 border-b border-border/50 px-5 py-4">
          <div>
            {title && <h3 className="font-display text-sm font-semibold text-foreground">{title}</h3>}
            {description && (
              <p className="mt-0.5 text-xs text-muted-foreground">{description}</p>
            )}
          </div>
          {headerAction}
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="data-table min-w-0 sm:min-w-[640px]">
          <thead>
            <tr>
              {columns.map((col) => (
                <th key={col.key} className={col.headerClassName}>
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {!rows.length ? (
              <tr>
                <td colSpan={columns.length} className="py-14 text-center text-muted-foreground">
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              rows.map((row, index) => (
                <tr key={getRowKey(row, index)}>
                  {columns.map((col) => (
                    <td key={col.key} className={col.className}>
                      {col.render ? col.render(row, index) : row[col.key] ?? '—'}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {showFooter && (
        <div className="flex flex-col gap-3 border-t border-border/50 px-5 py-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-muted-foreground">
            Showing {footerStart}–{footerEnd} of {footerTotal}
          </p>
          <Pagination
            total={footerTotalPages}
            value={footerPage}
            onChange={(value) => handlePageChange(Number(value))}
            size="sm"
            withEdges
          />
        </div>
      )}
    </div>
  );
};

export default AdesiaDataTable;
