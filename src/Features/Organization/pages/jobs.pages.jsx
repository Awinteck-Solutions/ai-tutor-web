import { useCallback, useEffect, useState } from 'react';
import { Modal, Select, Tabs } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { notifications } from '@mantine/notifications';
import { CheckCircle2, Clock, List, RefreshCw, ServerCrash } from 'lucide-react';
import { PageHeader } from '../../../shared/components/PageShell';
import { PageHeaderSkeleton } from '../../../shared/components/TableSkeleton';
import AdesiaDataTable from '../../../shared/components/AdesiaDataTable';
import StatusBadge from '../../../shared/components/StatusBadge';
import { GradientButton } from '../../../shared/components/GradientButton';
import { formatDateTime, getErrorMessage } from '../../../shared/utils/formatters';
import { getJob, getJobQueues, getQueueJobs } from '../services/organization.services';

const STATUS_TABS = [
  { value: 'all', label: 'All jobs', icon: List },
  { value: 'completed', label: 'Completed', icon: CheckCircle2 },
  { value: 'failed', label: 'Failed', icon: ServerCrash },
  { value: 'active', label: 'Active', icon: RefreshCw },
  { value: 'waiting', label: 'Waiting', icon: Clock },
];

const stateLabel = {
  completed: 'COMPLETED',
  failed: 'FAILED',
  active: 'PROCESSING',
  waiting: 'QUEUED',
  delayed: 'QUEUED',
};

/** BullMQ timestamps are ms since epoch */
const getJobTimestamp = (row) => {
  const raw = row.finishedOn ?? row.finishedAt ?? row.processedOn ?? row.timestamp;
  if (raw == null) return null;
  const n = Number(raw);
  if (Number.isNaN(n)) return null;
  return n < 1e12 ? n * 1000 : n;
};

const JobsPage = () => {
  const [queues, setQueues] = useState([]);
  const [selectedQueue, setSelectedQueue] = useState('');
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [jobsLoading, setJobsLoading] = useState(false);
  const [statusTab, setStatusTab] = useState('all');
  const [inspectOpen, { open: openInspect, close: closeInspect }] = useDisclosure(false);
  const [inspectedJob, setInspectedJob] = useState(null);

  useEffect(() => {
    getJobQueues()
      .then((data) => {
        const list = Array.isArray(data) ? data : data?.queues ?? [];
        setQueues(list.map((q) => ({ value: q.name || q, label: q.name || q })));
        if (list.length) setSelectedQueue(list[0].name || list[0]);
      })
      .catch((err) => notifications.show({ title: 'Error', message: getErrorMessage(err), color: 'red' }))
      .finally(() => setLoading(false));
  }, []);

  const loadJobs = useCallback(async () => {
    if (!selectedQueue) return;
    setJobsLoading(true);
    try {
      const data = await getQueueJobs(selectedQueue, { status: statusTab, limit: 100 });
      const list = Array.isArray(data) ? data : data?.jobs ?? [];
      setJobs(list);
    } catch (err) {
      notifications.show({ title: 'Error', message: getErrorMessage(err), color: 'red' });
      setJobs([]);
    } finally {
      setJobsLoading(false);
    }
  }, [selectedQueue, statusTab]);

  useEffect(() => {
    loadJobs();
  }, [loadJobs]);

  const inspectJob = async (jobId) => {
    try {
      const job = await getJob(jobId, selectedQueue);
      setInspectedJob(job);
      openInspect();
    } catch (err) {
      notifications.show({ title: 'Error', message: getErrorMessage(err), color: 'red' });
    }
  };

  const dateHeader = statusTab === 'failed' ? 'Failed at' : statusTab === 'completed' ? 'Completed at' : 'Last updated';

  const columns = [
    {
      key: 'id',
      header: 'Job ID',
      className: 'max-w-[7rem] truncate font-mono text-xs sm:max-w-none',
      render: (row) => row.id || row.jobId || '—',
    },
    { key: 'name', header: 'Name', render: (row) => row.name || '—' },
    {
      key: 'state',
      header: 'Status',
      render: (row) => (
        <StatusBadge status={stateLabel[row.state] || row.state?.toUpperCase() || 'UNKNOWN'} />
      ),
    },
    {
      key: 'attempts',
      header: 'Attempts',
      className: 'hidden sm:table-cell',
      headerClassName: 'hidden sm:table-cell',
      render: (row) => row.attemptsMade ?? '—',
    },
    {
      key: 'finishedAt',
      header: dateHeader,
      render: (row) => {
        const ts = getJobTimestamp(row);
        return ts ? formatDateTime(ts) : '—';
      },
    },
    {
      key: 'actions',
      header: '',
      className: 'text-right',
      render: (row) => (
        <button
          type="button"
          className="btn-outline !px-2 !py-1 text-xs"
          onClick={() => inspectJob(row.id || row.jobId)}
        >
          Inspect
        </button>
      ),
    },
  ];

  return (
    <>
      {loading ? <PageHeaderSkeleton /> : (
        <PageHeader
          title="Jobs Monitor"
          gradientWord="Monitor"
          description="View completed, failed, active, and queued background jobs across your processing queues."
        />
      )}

      <div className="glass-card mb-6 flex flex-col gap-4 p-5 sm:flex-row sm:items-end sm:justify-between">
        <Select
          label="Queue"
          placeholder="Select queue"
          className="min-w-[240px] flex-1 max-w-md"
          data={queues}
          value={selectedQueue}
          onChange={setSelectedQueue}
          disabled={loading}
        />
        <GradientButton type="button" onClick={loadJobs} className="!px-3 !py-2" disabled={!selectedQueue}>
          <RefreshCw className="h-4 w-4" />
          Refresh
        </GradientButton>
      </div>

      <Tabs value={statusTab} onChange={setStatusTab}>
        <Tabs.List className="mb-6 flex-wrap gap-1 rounded-xl border border-border/50 bg-card/50 p-1">
          {STATUS_TABS.map(({ value, label, icon: Icon }) => (
            <Tabs.Tab key={value} value={value} leftSection={<Icon className="h-4 w-4" />}>
              {label}
              {statusTab === value && jobs.length > 0 ? ` (${jobs.length})` : ''}
            </Tabs.Tab>
          ))}
        </Tabs.List>

        {STATUS_TABS.map(({ value }) => (
          <Tabs.Panel key={value} value={value}>
            <AdesiaDataTable
              title={STATUS_TABS.find((t) => t.value === value)?.label ?? 'Jobs'}
              description={
                selectedQueue
                  ? `Queue: ${selectedQueue}${value === 'all' ? ' — latest jobs across all states' : ''}`
                  : 'Select a queue to view jobs.'
              }
              data={jobs}
              columns={columns}
              loading={loading || jobsLoading}
              pageSize={15}
              searchable
              searchKeys={['id', 'jobId', 'name', 'state']}
              searchPlaceholder="Search jobs…"
              emptyMessage={
                value === 'failed'
                  ? 'No failed jobs in this queue.'
                  : value === 'completed'
                    ? 'No completed jobs in this queue.'
                    : 'No jobs found for this filter.'
              }
            />
          </Tabs.Panel>
        ))}
      </Tabs>

      <Modal
        opened={inspectOpen}
        onClose={closeInspect}
        title="Job details"
        size="lg"
        centered
        classNames={{ content: 'glass-card !bg-card' }}
      >
        <pre className="max-h-[420px] overflow-auto rounded-lg border border-border/50 bg-muted/30 p-4 text-xs">
          {JSON.stringify(inspectedJob, null, 2)}
        </pre>
      </Modal>
    </>
  );
};

export default JobsPage;
