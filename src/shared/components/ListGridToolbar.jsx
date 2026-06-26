import { TextInput } from '@mantine/core';
import { Search } from 'lucide-react';
import ViewToggle from './ViewToggle';

/** Apply to Mantine Select filters inside ListGridToolbar for consistent mobile sizing. */
export const filterSelectClass = 'w-full min-w-0 sm:max-w-[11rem]';

const ListGridToolbar = ({
  view,
  onViewChange,
  search,
  onSearchChange,
  searchPlaceholder = 'Search…',
  showSearch = true,
  children,
}) => (
  <div className="mb-6 flex min-w-0 flex-col gap-4">
    {showSearch && onSearchChange != null ? (
      <TextInput
        placeholder={searchPlaceholder}
        leftSection={<Search className="h-4 w-4 text-muted-foreground" />}
        value={search ?? ''}
        onChange={(e) => onSearchChange(e.target.value)}
        className="w-full min-w-0 sm:max-w-md"
      />
    ) : null}

    {(children || onViewChange) && (
      <div className="grid w-full min-w-0 grid-cols-1 gap-3 sm:grid-cols-2 lg:flex lg:flex-wrap lg:items-end lg:gap-3">
        {children}
       
      </div>
    )}
  </div>
);

export default ListGridToolbar;
