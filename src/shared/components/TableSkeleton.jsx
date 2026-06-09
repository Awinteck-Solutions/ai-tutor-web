import { Skeleton } from '@mantine/core';

export const TableSkeleton = ({ rows = 6, columns = 4, title, showPagination = true }) => (
  <div className="data-table-wrap">
    {title !== false && (
      <div className="border-b border-border/50 px-5 py-4">
        <Skeleton height={14} width={title ? 140 : 100} radius="sm" />
      </div>
    )}
    <div className="overflow-x-auto p-4">
      <div className="mb-3 hidden gap-4 sm:grid" style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}>
        {Array.from({ length: columns }).map((_, i) => (
          <Skeleton key={`head-${i}`} height={10} radius="sm" />
        ))}
      </div>
      <div className="space-y-2">
        {Array.from({ length: rows }).map((_, row) => (
          <div
            key={`row-${row}`}
            className="grid gap-4 rounded-lg border border-border/30 bg-muted/20 p-3"
            style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}
          >
            {Array.from({ length: columns }).map((__, col) => (
              <Skeleton key={`cell-${row}-${col}`} height={14} radius="sm" />
            ))}
          </div>
        ))}
      </div>
    </div>
    {showPagination && (
      <div className="flex items-center justify-between border-t border-border/50 px-5 py-3">
        <Skeleton height={12} width={120} radius="sm" />
        <Skeleton height={28} width={180} radius="md" />
      </div>
    )}
  </div>
);

export const PageHeaderSkeleton = () => (
  <div className="mb-8 flex flex-wrap items-start justify-between gap-4">
    <div className="space-y-2">
      <Skeleton height={32} width={260} radius="sm" />
      <Skeleton height={14} width={380} radius="sm" />
    </div>
    <Skeleton height={40} width={130} radius="md" />
  </div>
);

export const CardGridSkeleton = ({ count = 6 }) => (
  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
    {Array.from({ length: count }).map((_, i) => (
      <div key={i} className="glass-card p-6">
        <div className="mb-4 flex items-center justify-between">
          <Skeleton height={40} width={40} radius="md" />
          <Skeleton height={22} width={56} radius="xl" />
        </div>
        <Skeleton height={18} width="70%" radius="sm" mb={8} />
        <Skeleton height={12} width="90%" radius="sm" />
      </div>
    ))}
  </div>
);

export default TableSkeleton;
