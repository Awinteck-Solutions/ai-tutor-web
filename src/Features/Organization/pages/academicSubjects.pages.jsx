import { useEffect, useMemo, useState } from 'react';
import { NumberInput, Select, TextInput } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { notifications } from '@mantine/notifications';
import { BookMarked, Layers, Plus, Users } from 'lucide-react';
import { useAuth } from '../../../shared/context/AuthContext';
import { PageHeader } from '../../../shared/components/PageShell';
import { EmptyOrgHint } from '../../../shared/components/PageLoader';
import { PageHeaderSkeleton } from '../../../shared/components/TableSkeleton';
import { GlassCard } from '../../../shared/components/GlassCard';
import AdesiaDataTable from '../../../shared/components/AdesiaDataTable';
import ListGridToolbar from '../../../shared/components/ListGridToolbar';
import { AdesiaModal } from '../../../shared/components/AdesiaModal';
import { GradientButton } from '../../../shared/components/GradientButton';
import EnrolledStudentsModal from '../../../shared/components/EnrolledStudentsModal';
import { getErrorMessage } from '../../../shared/utils/formatters';
import {
  createSubject,
  createTopic,
  getSubjectEnrollments,
  getSubjects,
  getTopics,
} from '../services/organization.services';

const AcademicSubjectsPage = () => {
  const { organizationId } = useAuth();
  const [subjects, setSubjects] = useState([]);
  const [selectedSubjectId, setSelectedSubjectId] = useState(null);
  const [selectedSubjectName, setSelectedSubjectName] = useState('');
  const [topics, setTopics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [topicsLoading, setTopicsLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [subjectOpened, { open: openSubject, close: closeSubject }] = useDisclosure(false);
  const [topicOpened, { open: openTopic, close: closeTopic }] = useDisclosure(false);
  const [studentsOpened, { open: openStudents, close: closeStudents }] = useDisclosure(false);
  const [subjectForm, setSubjectForm] = useState({ name: '', code: '', description: '' });
  const [topicForm, setTopicForm] = useState({ name: '', description: '', order: 1 });
  const [view, setView] = useState('grid');
  const [search, setSearch] = useState('');

  const loadSubjects = () => {
    if (!organizationId) return;
    setLoading(true);
    getSubjects(organizationId, { limit: 100 })
      .then((data) => {
        const list = data?.items ?? [];
        setSubjects(list);
        if (!selectedSubjectId && list.length) {
          const first = list[0];
          setSelectedSubjectId(first.id || first._id);
          setSelectedSubjectName(first.name);
        }
      })
      .catch((err) => notifications.show({ title: 'Error', message: getErrorMessage(err), color: 'red' }))
      .finally(() => setLoading(false));
  };

  useEffect(() => { loadSubjects(); }, [organizationId]);

  useEffect(() => {
    if (!organizationId || !selectedSubjectId) return;
    setTopicsLoading(true);
    getTopics(organizationId, selectedSubjectId, { limit: 200 })
      .then((data) => setTopics(data?.items ?? []))
      .catch((err) => notifications.show({ title: 'Error', message: getErrorMessage(err), color: 'red' }))
      .finally(() => setTopicsLoading(false));
  }, [organizationId, selectedSubjectId]);

  const filteredSubjects = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return subjects;
    return subjects.filter((row) => ['name', 'code', 'description'].some((key) =>
      String(row[key] ?? '').toLowerCase().includes(q)));
  }, [subjects, search]);

  const handleCreateSubject = async () => {
    setSubmitting(true);
    try {
      await createSubject(organizationId, {
        name: subjectForm.name.trim(),
        code: subjectForm.code.trim(),
        description: subjectForm.description.trim(),
      });
      notifications.show({ title: 'Created', message: 'Subject created', color: 'green' });
      closeSubject();
      setSubjectForm({ name: '', code: '', description: '' });
      loadSubjects();
    } catch (err) {
      notifications.show({ title: 'Error', message: getErrorMessage(err), color: 'red' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleCreateTopic = async () => {
    setSubmitting(true);
    try {
      await createTopic(organizationId, {
        ...topicForm,
        name: topicForm.name.trim(),
        description: topicForm.description.trim(),
        subjectId: selectedSubjectId,
      });
      notifications.show({ title: 'Created', message: 'Topic created', color: 'green' });
      closeTopic();
      setTopicForm({ name: '', description: '', order: topics.length + 1 });
      const data = await getTopics(organizationId, selectedSubjectId, { limit: 200 });
      setTopics(data?.items ?? []);
    } catch (err) {
      notifications.show({ title: 'Error', message: getErrorMessage(err), color: 'red' });
    } finally {
      setSubmitting(false);
    }
  };

  if (!organizationId) return <EmptyOrgHint />;

  const subjectColumns = [
    { key: 'name', header: 'Subject', className: 'font-medium' },
    { key: 'code', header: 'Code' },
    {
      key: 'students',
      header: 'Students',
      render: (row) => row.enrolledStudentCount ?? 0,
    },
    {
      key: 'actions',
      header: '',
      className: 'text-right',
      render: (row) => (
        <button
          type="button"
          className="btn-outline !px-2 !py-1 text-xs"
          onClick={() => {
            setSelectedSubjectId(row.id || row._id);
            setSelectedSubjectName(row.name);
            openStudents();
          }}
        >
          View students
        </button>
      ),
    },
  ];

  const topicColumns = [
    { key: 'order', header: '#', className: 'w-16 text-muted-foreground', render: (row) => row.order ?? '—' },
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
          title="Subjects & topics"
          gradientWord="Subjects"
          description="Manage curriculum subjects, topics, and view enrolled students."
          action={(
            <GradientButton type="button" onClick={openSubject} className="!px-3 !py-2">
              <Plus className="h-4 w-4" />
              Add subject
            </GradientButton>
          )}
        />
      )}

      <ListGridToolbar
        view={view}
        onViewChange={setView}
        search={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search subjects…"
      />

      {view === 'grid' ? (
        <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredSubjects.length ? filteredSubjects.map((s) => (
            <GlassCard
              key={s.id || s._id}
              className={`cursor-pointer p-6 transition ${selectedSubjectId === (s.id || s._id) ? 'ring-2 ring-primary/40' : ''}`}
              onClick={() => {
                setSelectedSubjectId(s.id || s._id);
                setSelectedSubjectName(s.name);
              }}
            >
              <div className="mb-3 flex items-center justify-between">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/15 text-primary">
                  <BookMarked className="h-5 w-5" />
                </div>
                <button
                  type="button"
                  className="btn-outline flex items-center gap-1 !px-2 !py-1 text-xs"
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedSubjectId(s.id || s._id);
                    setSelectedSubjectName(s.name);
                    openStudents();
                  }}
                >
                  <Users className="h-3 w-3" />
                  {s.enrolledStudentCount ?? 0}
                </button>
              </div>
              <h3 className="font-display font-semibold text-foreground">{s.name}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{s.code || 'No code'}</p>
            </GlassCard>
          )) : (
            <p className="col-span-full py-12 text-center text-muted-foreground">No subjects yet.</p>
          )}
        </div>
      ) : (
        <AdesiaDataTable
          title="Subjects"
          data={filteredSubjects}
          columns={subjectColumns}
          loading={loading}
          pageSize={10}
          emptyMessage="No subjects yet."
        />
      )}

      <GlassCard className="p-6">
        <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
          <Select
            label="Topics for subject"
            className="max-w-md flex-1"
            leftSection={<Layers className="h-4 w-4 text-muted-foreground" />}
            data={subjects.map((s) => ({ value: s.id || s._id, label: s.name }))}
            value={selectedSubjectId}
            onChange={(v) => {
              const subject = subjects.find((s) => (s.id || s._id) === v);
              setSelectedSubjectId(v);
              setSelectedSubjectName(subject?.name ?? '');
            }}
          />
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              className="btn-outline flex items-center gap-1 text-xs"
              disabled={!selectedSubjectId}
              onClick={openStudents}
            >
              <Users className="h-3 w-3" />
              Enrolled students
            </button>
            <GradientButton
              type="button"
              disabled={!selectedSubjectId}
              onClick={openTopic}
              className="!px-3 !py-2"
            >
              <Plus className="h-4 w-4" />
              Add topic
            </GradientButton>
          </div>
        </div>

        <AdesiaDataTable
          title={selectedSubjectName ? `Topics in ${selectedSubjectName}` : 'Topics'}
          data={topics}
          columns={topicColumns}
          loading={topicsLoading}
          pageSize={12}
          emptyMessage={selectedSubjectId ? 'No topics for this subject yet.' : 'Select a subject.'}
        />
        <p className="mt-3 text-xs text-muted-foreground">
          Students enrolled in this subject can access lessons under these topics.
        </p>
      </GlassCard>

      <EnrolledStudentsModal
        opened={studentsOpened}
        onClose={closeStudents}
        title={selectedSubjectName ? `Students — ${selectedSubjectName}` : 'Enrolled students'}
        loadStudents={() => getSubjectEnrollments(organizationId, selectedSubjectId)}
      />

      <AdesiaModal
        opened={subjectOpened}
        onClose={closeSubject}
        title="New subject"
        submitLabel="Create subject"
        onSubmit={handleCreateSubject}
        submitting={submitting}
        submitDisabled={!subjectForm.name.trim()}
      >
        <div className="space-y-4">
          <TextInput
            label="Subject name"
            value={subjectForm.name}
            onChange={(e) => setSubjectForm({ ...subjectForm, name: e.target.value })}
            required
          />
          <TextInput
            label="Code"
            value={subjectForm.code}
            onChange={(e) => setSubjectForm({ ...subjectForm, code: e.target.value })}
          />
          <TextInput
            label="Description"
            value={subjectForm.description}
            onChange={(e) => setSubjectForm({ ...subjectForm, description: e.target.value })}
          />
        </div>
      </AdesiaModal>

      <AdesiaModal
        opened={topicOpened}
        onClose={closeTopic}
        title={`New topic — ${selectedSubjectName}`}
        submitLabel="Create topic"
        onSubmit={handleCreateTopic}
        submitting={submitting}
        submitDisabled={!topicForm.name.trim() || !selectedSubjectId}
      >
        <div className="space-y-4">
          <TextInput
            label="Topic name"
            value={topicForm.name}
            onChange={(e) => setTopicForm({ ...topicForm, name: e.target.value })}
            required
          />
          <TextInput
            label="Description"
            value={topicForm.description}
            onChange={(e) => setTopicForm({ ...topicForm, description: e.target.value })}
          />
          <NumberInput
            label="Order"
            min={1}
            value={topicForm.order}
            onChange={(v) => setTopicForm({ ...topicForm, order: Number(v) || 1 })}
          />
        </div>
      </AdesiaModal>
    </>
  );
};

export default AcademicSubjectsPage;
