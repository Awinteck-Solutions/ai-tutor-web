import { useCallback, useEffect, useState } from 'react';
import { NumberInput, Select, TextInput } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { notifications } from '@mantine/notifications';
import { Layers, Plus } from 'lucide-react';
import { useAuth } from '../../../shared/context/AuthContext';
import { PageHeader } from '../../../shared/components/PageShell';
import { EmptyOrgHint } from '../../../shared/components/PageLoader';
import { PageHeaderSkeleton } from '../../../shared/components/TableSkeleton';
import AdesiaDataTable from '../../../shared/components/AdesiaDataTable';
import DataListFooter from '../../../shared/components/DataListFooter';
import ListGridToolbar from '../../../shared/components/ListGridToolbar';
import { GlassCard } from '../../../shared/components/GlassCard';
import { AdesiaModal } from '../../../shared/components/AdesiaModal';
import { GradientButton } from '../../../shared/components/GradientButton';
import { useServerList } from '../../../shared/hooks/useServerList';
import { emptyPaginated, getErrorMessage } from '../../../shared/utils/formatters';
import {
  createTopic,
  getSubjectsList,
  getTopics,
} from '../services/organization.services';

const TOPICS_PAGE_SIZE = 12;

const AcademicTopicsPage = () => {
  const { organizationId } = useAuth();
  const [subjects, setSubjects] = useState([]);
  const [subjectId, setSubjectId] = useState(null);
  const [subjectName, setSubjectName] = useState('');
  const [subjectsLoading, setSubjectsLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [opened, { open, close }] = useDisclosure(false);
  const [form, setForm] = useState({ name: '', description: '', order: 1 });
  const [view, setView] = useState('grid');

  useEffect(() => {
    if (!organizationId) {
      setSubjectsLoading(false);
      return;
    }
    getSubjectsList(organizationId)
      .then((list) => {
        const items = Array.isArray(list) ? list : [];
        setSubjects(items);
        if (items.length) {
          const first = items[0];
          const id = first.id || first._id;
          setSubjectId(id);
          setSubjectName(first.name);
        }
      })
      .catch((err) => notifications.show({ title: 'Error', message: getErrorMessage(err), color: 'red' }))
      .finally(() => setSubjectsLoading(false));
  }, [organizationId]);

  const fetchTopics = useCallback(async (params) => {
    const sid = params.subjectId;
    if (!organizationId || !sid) return emptyPaginated(params.limit);
    try {
      return await getTopics(organizationId, sid, {
        page: params.page,
        limit: params.limit,
        search: params.search,
      });
    } catch (err) {
      notifications.show({ title: 'Error', message: getErrorMessage(err), color: 'red' });
      return emptyPaginated(params.limit);
    }
  }, [organizationId]);

  const {
    items: topics,
    loading: topicsLoading,
    page,
    setPage,
    search,
    setSearch,
    meta,
    reload: reloadTopics,
    setFilters,
    rangeStart,
    rangeEnd,
  } = useServerList(fetchTopics, [organizationId, subjectId], TOPICS_PAGE_SIZE);

  useEffect(() => {
    setFilters({ subjectId: subjectId || undefined });
  }, [subjectId, setFilters]);

  const handleCreate = async () => {
    setSubmitting(true);
    try {
      await createTopic(organizationId, {
        ...form,
        name: form.name.trim(),
        description: form.description.trim(),
        subjectId,
      });
      notifications.show({ title: 'Created', message: 'Topic created', color: 'green' });
      close();
      setForm({ name: '', description: '', order: (meta.total ?? topics.length) + 1 });
      reloadTopics();
    } catch (err) {
      notifications.show({ title: 'Error', message: getErrorMessage(err), color: 'red' });
    } finally {
      setSubmitting(false);
    }
  };

  if (!organizationId) return <EmptyOrgHint />;

  const columns = [
    {
      key: 'order',
      header: '#',
      className: 'w-16 text-muted-foreground',
      render: (row) => row.order ?? '—',
    },
    { key: 'name', header: 'Topic', className: 'font-medium' },
    {
      key: 'description',
      header: 'Description',
      className: 'max-w-lg text-muted-foreground',
      render: (row) => row.description || '—',
    },
  ];

  return (
    <>
      {subjectsLoading ? <PageHeaderSkeleton /> : (
        <PageHeader
          title="Topics"
          gradientWord="Topics"
          description="Organize curriculum topics within each subject."
          action={(
            <GradientButton type="button" onClick={open} disabled={!subjectId} className="!px-3 !py-2">
              <Plus className="h-4 w-4" />
              Add topic
            </GradientButton>
          )}
        />
      )}

      <div className="glass-card mb-6 p-5">
        <Select
          label="Subject"
          description="Choose a subject to view and manage its topic sequence."
          placeholder="Select subject"
          searchable
          className="max-w-md"
          leftSection={<Layers className="h-4 w-4 text-muted-foreground" />}
          data={subjects.map((s) => ({ value: s.id || s._id, label: s.name }))}
          value={subjectId}
          onChange={(v) => {
            const subject = subjects.find((s) => (s.id || s._id) === v);
            setSubjectId(v);
            setSubjectName(subject?.name ?? '');
          }}
        />
      </div>

      <ListGridToolbar
        view={view}
        onViewChange={setView}
        search={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search topics…"
      />

      {view === 'grid' ? (
        <div className="glass-card overflow-hidden">
          <div className="grid gap-4 p-5 sm:grid-cols-2 lg:grid-cols-3">
            {topics.length ? topics.map((t) => (
              <GlassCard key={t.id || t._id} className="p-6">
                <div className="mb-3 flex items-center justify-between">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/15 text-primary">
                    <Layers className="h-5 w-5" />
                  </div>
                  <span className="text-xs text-muted-foreground">#{t.order ?? '—'}</span>
                </div>
                <h3 className="font-display font-semibold text-foreground">{t.name}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{t.description || '—'}</p>
              </GlassCard>
            )) : (
              <p className="col-span-full py-12 text-center text-muted-foreground">
                {topicsLoading ? 'Loading topics…' : subjectId ? 'No topics yet for this subject.' : 'Select a subject above.'}
              </p>
            )}
          </div>
          <DataListFooter
            rangeStart={rangeStart}
            rangeEnd={rangeEnd}
            totalItems={meta.total ?? 0}
            page={page}
            totalPages={meta.totalPages ?? 1}
            pageSize={TOPICS_PAGE_SIZE}
            onPageChange={setPage}
          />
        </div>
      ) : (
        <AdesiaDataTable
          title={subjectName ? `Topics in ${subjectName}` : 'Topics'}
          description="Topics define the learning units teachers build materials and lessons from."
          data={topics}
          columns={columns}
          loading={topicsLoading || subjectsLoading}
          pageSize={TOPICS_PAGE_SIZE}
          serverPagination
          page={page}
          totalPages={meta.totalPages ?? 1}
          totalItems={meta.total ?? 0}
          rangeStart={rangeStart}
          rangeEnd={rangeEnd}
          onPageChange={setPage}
          paginate={false}
          emptyMessage={subjectId ? 'No topics yet for this subject.' : 'Select a subject above.'}
        />
      )}

      <AdesiaModal
        opened={opened}
        onClose={close}
        title={`New topic — ${subjectName}`}
        submitLabel="Create topic"
        onSubmit={handleCreate}
        submitting={submitting}
        submitDisabled={!form.name.trim() || !subjectId}
      >
        <div className="space-y-4">
          <TextInput
            label="Topic name"
            placeholder="e.g. Algebra fundamentals"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            required
          />
          <TextInput
            label="Description"
            placeholder="Optional learning objectives"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
          />
          <NumberInput
            label="Order"
            min={1}
            value={form.order}
            onChange={(v) => setForm({ ...form, order: Number(v) || 1 })}
          />
        </div>
      </AdesiaModal>
    </>
  );
};

export default AcademicTopicsPage;
