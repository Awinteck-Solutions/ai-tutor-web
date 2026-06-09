import { useCallback, useState } from 'react';
import { Tabs, TextInput } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { notifications } from '@mantine/notifications';
import { Bell, BellRing, Search } from 'lucide-react';
import { PageHeader } from '../../../shared/components/PageShell';
import { PageHeaderSkeleton } from '../../../shared/components/TableSkeleton';
import AdesiaDataTable from '../../../shared/components/AdesiaDataTable';
import { AdesiaBadge } from '../../../shared/components/AdesiaBadge';
import { GradientButton } from '../../../shared/components/GradientButton';
import { useServerList } from '../../../shared/hooks/useServerList';
import { formatDateTime, getErrorMessage } from '../../../shared/utils/formatters';
import { getNotifications, markAllNotificationsRead, markNotificationRead } from '../services/organization.services';

const NotificationsPage = () => {
  const [activeTab, setActiveTab] = useState('all');

  const fetchNotifications = useCallback(async (params) => {
    try {
      return await getNotifications({
        ...params,
        unreadOnly: activeTab === 'unread' ? true : undefined,
      });
    } catch (err) {
      notifications.show({ title: 'Error', message: getErrorMessage(err), color: 'red' });
      return { items: [], meta: { total: 0, totalPages: 1, page: 1, limit: params.limit } };
    }
  }, [activeTab]);

  const {
    items, loading, page, setPage, search, setSearch, meta, reload, rangeStart, rangeEnd,
  } = useServerList(fetchNotifications, [activeTab], 12);

  const markRead = async (id) => {
    try {
      await markNotificationRead(id);
      reload();
    } catch (err) {
      notifications.show({ title: 'Error', message: getErrorMessage(err), color: 'red' });
    }
  };

  const markAll = async () => {
    try {
      await markAllNotificationsRead();
      notifications.show({ title: 'Done', message: 'All marked as read', color: 'green' });
      reload();
    } catch (err) {
      notifications.show({ title: 'Error', message: getErrorMessage(err), color: 'red' });
    }
  };

  const unreadCount = items.filter((n) => !n.read).length;

  const columns = [
    { key: 'title', header: 'Title', className: 'font-medium' },
    {
      key: 'message',
      header: 'Message',
      className: 'max-w-md text-muted-foreground',
      render: (row) => row.message || row.body || '—',
    },
    {
      key: 'read',
      header: 'Status',
      render: (row) => (
        <AdesiaBadge status={row.read ? 'draft' : 'active'}>
          {row.read ? 'Read' : 'Unread'}
        </AdesiaBadge>
      ),
    },
    {
      key: 'createdAt',
      header: 'Date',
      render: (row) => formatDateTime(row.createdAt),
    },
    {
      key: 'actions',
      header: '',
      className: 'text-right',
      render: (row) => !row.read && (
        <button type="button" className="btn-outline !px-2 !py-1 text-xs" onClick={() => markRead(row.id || row._id)}>
          Mark read
        </button>
      ),
    },
  ];

  return (
    <>
      {loading && page === 1 ? <PageHeaderSkeleton /> : (
        <PageHeader
          title="Notifications"
          gradientWord="Notifications"
          description="System alerts and activity updates for your organization."
          action={(
            <GradientButton type="button" onClick={markAll} className="!px-3 !py-2">
              Mark all read
            </GradientButton>
          )}
        />
      )}

      <Tabs value={activeTab} onChange={setActiveTab}>
        <Tabs.List className="mb-4 flex-wrap gap-1 rounded-xl border border-border/50 bg-card/50 p-1">
          <Tabs.Tab value="all" leftSection={<Bell className="h-4 w-4" />}>All</Tabs.Tab>
          <Tabs.Tab value="unread" leftSection={<BellRing className="h-4 w-4" />}>Unread</Tabs.Tab>
        </Tabs.List>
      </Tabs>

      <div className="mb-4 max-w-md">
        <TextInput
          placeholder="Search notifications…"
          leftSection={<Search className="h-4 w-4 text-muted-foreground" />}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <AdesiaDataTable
        title="Notification inbox"
        description={`${meta.total ?? 0} notification${meta.total === 1 ? '' : 's'}`}
        data={items}
        columns={columns}
        loading={loading}
        serverPagination
        page={page}
        totalPages={meta.totalPages ?? 1}
        totalItems={meta.total ?? 0}
        rangeStart={rangeStart}
        rangeEnd={rangeEnd}
        onPageChange={setPage}
        paginate={false}
        emptyMessage="No notifications in this view."
      />
    </>
  );
};

export default NotificationsPage;
