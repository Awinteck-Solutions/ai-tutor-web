import { useCallback } from 'react';
import { Select, TextInput } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { Search } from 'lucide-react';
import { useAuth } from '../../../shared/context/AuthContext';
import { PageHeader } from '../../../shared/components/PageShell';
import { EmptyOrgHint } from '../../../shared/components/PageLoader';
import { PageHeaderSkeleton } from '../../../shared/components/TableSkeleton';
import AdesiaDataTable from '../../../shared/components/AdesiaDataTable';
import { useServerList } from '../../../shared/hooks/useServerList';
import { formatDateTime, getErrorMessage } from '../../../shared/utils/formatters';
import { getAuditLogs } from '../services/organization.services';

const ACTIVITY_TYPES = [
  { value: '', label: 'All activities' },
  { value: 'MEMBER_ADD', label: 'Member added' },
  { value: 'MEMBER_REMOVE', label: 'Member removed' },
  { value: 'INVITE_SENT', label: 'Invite sent' },
  { value: 'UPLOAD', label: 'Upload' },
  { value: 'ARCHIVE', label: 'Archive' },
];

const AuditPage = () => {
  const { organizationId } = useAuth();

  const fetchAudit = useCallback(async (params) => {
    if (!organizationId) return { items: [], meta: { total: 0, totalPages: 1, page: 1, limit: params.limit } };
    try {
      return await getAuditLogs(organizationId, params);
    } catch (err) {
      notifications.show({ title: 'Error', message: getErrorMessage(err), color: 'red' });
      return { items: [], meta: { total: 0, totalPages: 1, page: 1, limit: params.limit } };
    }
  }, [organizationId]);

  const {
    items, loading, page, setPage, search, setSearch, filters, setFilters, meta, rangeStart, rangeEnd,
  } = useServerList(fetchAudit, [organizationId], 15);

  if (!organizationId) return <EmptyOrgHint />;

  const columns = [
    {
      key: 'action',
      header: 'Activity',
      className: 'font-medium',
      render: (row) => (row.activityType || row.action || '—').replace(/_/g, ' '),
    },
    {
      key: 'description',
      header: 'Details',
      className: 'max-w-md text-muted-foreground',
      render: (row) => row.description || '—',
    },
    {
      key: 'actor',
      header: 'Actor',
      render: (row) => (
        <div>
          <p className="font-medium">{row.actorName || 'System'}</p>
          {row.actorEmail && <p className="text-xs text-muted-foreground">{row.actorEmail}</p>}
        </div>
      ),
    },
    {
      key: 'resource',
      header: 'Resource',
      render: (row) => row.resourceType || '—',
    },
    {
      key: 'createdAt',
      header: 'Time',
      render: (row) => formatDateTime(row.createdAt),
    },
  ];

  return (
    <>
      {loading && page === 1 ? <PageHeaderSkeleton /> : (
        <PageHeader
          title="Audit Log"
          gradientWord="Log"
          description="Track administrative actions across your organization."
        />
      )}

      <div className="mb-6 flex flex-col gap-4 sm:flex-row">
        <TextInput
          placeholder="Search activity…"
          leftSection={<Search className="h-4 w-4 text-muted-foreground" />}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-md flex-1"
        />
        <Select
          placeholder="Filter by type"
          data={ACTIVITY_TYPES}
          value={filters.activityType ?? ''}
          onChange={(v) => setFilters({ activityType: v || undefined })}
          className="min-w-[200px]"
          clearable
        />
      </div>

      <AdesiaDataTable
        title="Activity trail"
        description={`${meta.total ?? 0} events recorded`}
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
        emptyMessage="No audit events recorded yet."
      />
    </>
  );
};

export default AuditPage;
