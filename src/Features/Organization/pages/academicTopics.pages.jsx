import { useEffect, useMemo, useState } from 'react';
import { NumberInput, Select, TextInput } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { notifications } from '@mantine/notifications';
import { Layers, Plus } from 'lucide-react';
import { useAuth } from '../../../shared/context/AuthContext';
import { PageHeader } from '../../../shared/components/PageShell';
import { EmptyOrgHint } from '../../../shared/components/PageLoader';
import { PageHeaderSkeleton } from '../../../shared/components/TableSkeleton';
import AdesiaDataTable from '../../../shared/components/AdesiaDataTable';
import ListGridToolbar from '../../../shared/components/ListGridToolbar';
import { GlassCard } from '../../../shared/components/GlassCard';
import { AdesiaModal } from '../../../shared/components/AdesiaModal';
import { GradientButton } from '../../../shared/components/GradientButton';
import { getErrorMessage } from '../../../shared/utils/formatters';
import { createTopic, getSubjects, getTopics } from '../services/organization.services';

const AcademicTopicsPage = () => {
  const { organizationId } = useAuth();
  const [subjects, setSubjects] = useState([]);
  const [subjectId, setSubjectId] = useState(null);
  const [subjectName, setSubjectName] = useState('');
  const [topics, setTopics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [topicsLoading, setTopicsLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [opened, { open, close }] = useDisclosure(false);
  const [form, setForm] = useState({ name: '', description: '', order: 1 });
  const [view, setView] = useState('grid');
  const [search, setSearch] = useState('');

  useEffect(() => {
    if (!organizationId) { setLoading(false); return; }
    getSubjects(organizationId, { limit: 100 })
      .then((data) => {
        const list = data?.items ?? [];
        setSubjects(list);
        if (list.length) {
          const first = list[0];
          const id = first.id || first._id;
          setSubjectId(id);
          setSubjectName(first.name);
        }
      })
      .catch((err) => notifications.show({ title: 'Error', message: getErrorMessage(err), color: 'red' }))
      .finally(() => setLoading(false));
  }, [organizationId]);

  useEffect(() => {
    if (!organizationId || !subjectId) return;
    setTopicsLoading(true);
    getTopics(organizationId, subjectId, { limit: 200 })
      .then((data) => setTopics(data?.items ?? []))
      .catch((err) => notifications.show({ title: 'Error', message: getErrorMessage(err), color: 'red' }))
      .finally(() => setTopicsLoading(false));
  }, [organizationId, subjectId]);

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
      setForm({ name: '', description: '', order: topics.length + 1 });
      const data = await getTopics(organizationId, subjectId, { limit: 200 });
      setTopics(data?.items ?? []);
    } catch (err) {
      notifications.show({ title: 'Error', message: getErrorMessage(err), color: 'red' });
    } finally {
      setSubmitting(false);
    }
  };

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return topics;
    return topics.filter((t) => [t.name, t.description].some((v) => v?.toLowerCase().includes(q)));
  }, [topics, search]);

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
      {loading ? <PageHeaderSkeleton /> : (
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
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.length ? filtered.map((t) => (
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
              {subjectId ? 'No topics yet for this subject.' : 'Select a subject above.'}
            </p>
          )}
        </div>
      ) : (
        <AdesiaDataTable
          title={subjectName ? `Topics in ${subjectName}` : 'Topics'}
          description="Topics define the learning units teachers build materials and lessons from."
          data={filtered}
          columns={columns}
          loading={loading || topicsLoading}
          pageSize={12}
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
            label="Display order"
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
