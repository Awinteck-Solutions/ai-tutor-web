import { Pagination } from '@mantine/core';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const resolveTotalPages = (totalItems, totalPages, pageSize) => {
  const fromMeta = Number(totalPages);
  if (Number.isFinite(fromMeta) && fromMeta > 0) return fromMeta;
  if (!pageSize || !totalItems) return 1;
  return Math.max(1, Math.ceil(totalItems / pageSize));
};

const DataListFooter = ({
  rangeStart = 0,
  rangeEnd = 0,
  totalItems = 0,
  page = 1,
  totalPages = 1,
  pageSize,
  onPageChange,
  className = '',
}) => {
  const resolvedTotalPages = resolveTotalPages(totalItems, totalPages, pageSize);
  const currentPage = Math.min(Math.max(1, page), resolvedTotalPages);
  const canPaginate = resolvedTotalPages > 1 && typeof onPageChange === 'function';

  if (resolvedTotalPages <= 1 && totalItems === 0) return null;

  const goToPage = (nextPage) => {
    if (!canPaginate) return;
    const parsed = Number(nextPage);
    const clamped = Math.min(
      Math.max(1, Number.isFinite(parsed) ? parsed : currentPage),
      resolvedTotalPages,
    );
    if (clamped !== currentPage) onPageChange(clamped);
  };

  return (
    <div
      className={`flex flex-col gap-3 border-t border-border/50 bg-muted/10 px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-5 ${className}`}
    >
      <p className="text-xs text-muted-foreground">
        {totalItems
          ? `Showing ${rangeStart}–${rangeEnd} of ${totalItems}`
          : 'No records'}
      </p>

      {canPaginate && (
        <div className="flex flex-wrap items-center justify-end gap-2">
          <button
            type="button"
            className="inline-flex items-center gap-1 rounded-lg border border-border/60 bg-card px-3 py-1.5 text-xs font-medium text-foreground transition hover:border-primary/40 hover:bg-primary/5 disabled:pointer-events-none disabled:opacity-40"
            onClick={() => goToPage(currentPage - 1)}
            disabled={currentPage <= 1}
            aria-label="Previous page"
          >
            <ChevronLeft className="h-4 w-4" />
            Previous
          </button>

          <Pagination
            total={resolvedTotalPages}
            value={currentPage}
            onChange={(value) => onPageChange(Number(value))}
            size="sm"
            withEdges
            siblings={1}
            boundaries={1}
            hideWithOnePage={false}
            classNames={{
              control: 'border-border/60 bg-card hover:bg-primary/5 data-[active=true]:bg-primary data-[active=true]:text-primary-foreground',
            }}
          />

          <button
            type="button"
            className="inline-flex items-center gap-1 rounded-lg border border-border/60 bg-card px-3 py-1.5 text-xs font-medium text-foreground transition hover:border-primary/40 hover:bg-primary/5 disabled:pointer-events-none disabled:opacity-40"
            onClick={() => goToPage(currentPage + 1)}
            disabled={currentPage >= resolvedTotalPages}
            aria-label="Next page"
          >
            Next
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      )}
    </div>
  );
};

export default DataListFooter;
