import { TextInput } from '@mantine/core';
import { Search } from 'lucide-react';
import ViewToggle from './ViewToggle';

const ListGridToolbar = ({
  view,
  onViewChange,
  search,
  onSearchChange,
  searchPlaceholder = 'Search…',
  showSearch = true,
  children,
}) => (
  <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
    {showSearch && onSearchChange != null ? (
      <TextInput
        placeholder={searchPlaceholder}
        leftSection={<Search className="h-4 w-4 text-muted-foreground" />}
        value={search ?? ''}
        onChange={(e) => onSearchChange(e.target.value)}
        className="max-w-md flex-1"
      />
    ) : (
      <div className="flex-1" />
    )}
    <div className="flex flex-wrap items-center gap-3">
      {children}
      {onViewChange && <ViewToggle value={view} onChange={onViewChange} />}
    </div>
  </div>
);

export default ListGridToolbar;
