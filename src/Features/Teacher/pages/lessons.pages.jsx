import { useCallback, useEffect, useState } from 'react';
import {
  Modal, MultiSelect, Select, TextInput,
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { notifications } from '@mantine/notifications';
import { Link } from 'react-router-dom';
import { Sparkles, Eye, BookOpen } from 'lucide-react';
import { FlashcardStateCell, LessonAssetsMobileCell, QuizStateCell } from '../../../shared/components/LessonAssetState';
import { useAuth } from '../../../shared/context/AuthContext';
import { EmptyState, PageHeader } from '../../../shared/components/PageShell';
import { PageHeaderSkeleton } from '../../../shared/components/TableSkeleton';
import AdesiaDataTable from '../../../shared/components/AdesiaDataTable';
import DataListFooter from '../../../shared/components/DataListFooter';
import ListGridToolbar from '../../../shared/components/ListGridToolbar';
import { GlassCard } from '../../../shared/components/GlassCard';
import { TableSkeleton } from '../../../shared/components/TableSkeleton';
import { AdesiaModal } from '../../../shared/components/AdesiaModal';
import { GradientButton } from '../../../shared/components/GradientButton';
import StatusBadge from '../../../shared/components/StatusBadge';
import { useServerList } from '../../../shared/hooks/useServerList';
import { formatDateTime, getErrorMessage } from '../../../shared/utils/formatters';
import {
  generateLesson, getLessonSources, getLessonsPaginated, getMaterials, getSubjects, getTopics, regenerateLesson,
} from '../services/teacher.services';

const TeacherLessonsPage = () => {
  const { organizationId } = useAuth();
  const [subjects, setSubjects] = useState([]);
  const [topics, setTopics] = useState([]);
  const [materials, setMaterials] = useState([]);
  const [topicId, setTopicId] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [opened, { open, close }] = useDisclosure(false);
  const [sourcesOpen, { open: openSources, close: closeSources }] = useDisclosure(false);
  const [sources, setSources] = useState([]);
  const [form, setForm] = useState({ title: '', materialIds: [], studentLevel: 'intermediate' });
  const [view, setView] = useState('grid');

  const fetchLessons = useCallback(async (params) => {
    if (!organizationId) return { items: [], meta: { total: 0, totalPages: 1, page: 1, limit: params.limit } };
    try {
      return await getLessonsPaginated(organizationId, params);
    } catch (err) {
      notifications.show({ title: 'Error', message: getErrorMessage(err), color: 'red' });
      return { items: [], meta: { total: 0, totalPages: 1, page: 1, limit: params.limit } };
    }
  }, [organizationId]);

  const {
    items: lessons, loading, page, setPage, search, setSearch, meta, reload, rangeStart, rangeEnd,
  } = useServerList(fetchLessons, [organizationId], 10);

  useEffect(() => {
    if (!organizationId) return;
    getSubjects(organizationId).then((data) => setSubjects(Array.isArray(data) ? data : []));
  }, [organizationId]);

  const loadTopicsForSubject = async (subjectId) => {
    const data = await getTopics(organizationId, subjectId);
    setTopics(Array.isArray(data) ? data : []);
    setTopicId(null);
    setMaterials([]);
  };

  const loadMaterialsForTopic = async (tid) => {
    setTopicId(tid);
    const data = await getMaterials(organizationId, { topicId: tid });
    setMaterials(Array.isArray(data) ? data.filter((m) => m.processingStatus === 'COMPLETED') : []);
  };

  const handleGenerate = async () => {
    if (!topicId || !form.materialIds.length) {
      notifications.show({ title: 'Error', message: 'Select topic and materials', color: 'red' });
      return;
    }
    setSubmitting(true);
    try {
      await generateLesson({
        topicId,
        materialIds: form.materialIds,
        title: form.title,
        studentLevel: form.studentLevel,
        organizationId,
      });
      notifications.show({ title: 'Queued', message: 'Lesson generation started', color: 'green' });
      close();
      reload();
    } catch (err) {
      notifications.show({ title: 'Error', message: getErrorMessage(err), color: 'red' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleRegenerate = async (id) => {
    try {
      await regenerateLesson(id, organizationId);
      notifications.show({ title: 'Queued', message: 'Regeneration started', color: 'green' });
      reload();
    } catch (err) {
      notifications.show({ title: 'Error', message: getErrorMessage(err), color: 'red' });
    }
  };

  const viewSources = async (id) => {
    try {
      const data = await getLessonSources(id, organizationId);
      setSources(Array.isArray(data) ? data : data?.sources ?? []);
      openSources();
    } catch (err) {
      notifications.show({ title: 'Error', message: getErrorMessage(err), color: 'red' });
    }
  };

  if (!organizationId) {
    return <EmptyState title="No organization" description="Your account is not linked to an organization." />;
  }

  const columns = [
    { key: 'title', header: 'Lesson', className: 'font-medium' },
    {
      key: 'status',
      header: 'Status',
      render: (l) => <StatusBadge status={l.generationStatus} />,
    },
    {
      key: 'assets',
      header: 'Assets',
      className: 'asset-cell sm:hidden',
      headerClassName: 'sm:hidden',
      render: (l) => <LessonAssetsMobileCell lesson={l} />,
    },
    { key: 'flashcards', header: 'FC', className: 'asset-cell hidden sm:table-cell', headerClassName: 'hidden sm:table-cell', render: (l) => <FlashcardStateCell lesson={l} /> },
    { key: 'quizzes', header: 'Quiz', className: 'asset-cell hidden sm:table-cell', headerClassName: 'hidden sm:table-cell', render: (l) => <QuizStateCell lesson={l} /> },
    {
      key: 'createdAt',
      header: 'Created',
      render: (l) => formatDateTime(l.createdAt),
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (l) => (
        <div className="flex flex-wrap gap-2">
          <Link
            to={`/teacher/lessons/${l.id || l._id}/preview`}
            className="btn-outline !px-2 !py-1 text-xs no-underline"
          >
            <Eye className="h-3 w-3" />
            Preview
          </Link>
          <button type="button" className="btn-outline !px-2 !py-1 text-xs" onClick={() => viewSources(l.id || l._id)}>
            Sources
          </button>
          <button type="button" className="btn-outline !px-2 !py-1 text-xs" onClick={() => handleRegenerate(l.id || l._id)}>
            Regenerate
          </button>
        </div>
      ),
    },
  ];

  return (
    <>
      {loading && page === 1 ? <PageHeaderSkeleton /> : (
        <PageHeader
          title="Lessons"
          gradientWord="Lessons"
          description="Generate and manage AI lessons from your processed materials."
          action={(
            <GradientButton type="button" onClick={open} className="!px-3 !py-2">
              <Sparkles className="h-4 w-4" />
              Generate
            </GradientButton>
          )}
        />
      )}

      <ListGridToolbar
        view={view}
        onViewChange={setView}
        search={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search lessons…"
      />

      {view === 'grid' ? (
        <div className="data-table-wrap">
          <div className="border-b border-border/50 px-5 py-4">
            <h3 className="font-display text-sm font-semibold text-foreground">Your lessons</h3>
          </div>
          {loading ? (
            <div className="p-5"><TableSkeleton rows={4} columns={1} title={false} /></div>
          ) : lessons.length ? (
            <div className="grid gap-4 p-5 sm:grid-cols-2 lg:grid-cols-3">
              {lessons.map((l) => (
                <GlassCard key={l.id || l._id} className="flex h-full flex-col p-5">
                  <div className="mb-3 flex items-start justify-between gap-2">
                    <BookOpen className="h-5 w-5 shrink-0 text-primary" />
                    <StatusBadge status={l.generationStatus} />
                  </div>
                  <h3 className="font-display text-sm font-semibold text-foreground">{l.title}</h3>
                  <div className="mt-2 sm:hidden">
                    <LessonAssetsMobileCell lesson={l} />
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">{formatDateTime(l.createdAt)}</p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    <Link
                      to={`/teacher/lessons/${l.id || l._id}/preview`}
                      className="btn-outline !px-2 !py-1 text-xs no-underline"
                    >
                      <Eye className="h-3 w-3" />
                      Preview
                    </Link>
                    <button type="button" className="btn-outline !px-2 !py-1 text-xs" onClick={() => viewSources(l.id || l._id)}>
                      Sources
                    </button>
                    <button type="button" className="btn-outline !px-2 !py-1 text-xs" onClick={() => handleRegenerate(l.id || l._id)}>
                      Regenerate
                    </button>
                  </div>
                </GlassCard>
              ))}
            </div>
          ) : (
            <p className="px-5 py-14 text-center text-muted-foreground">
              No lessons yet — generate one from completed materials.
            </p>
          )}
          <DataListFooter
            rangeStart={rangeStart}
            rangeEnd={rangeEnd}
            totalItems={meta.total ?? 0}
            page={page}
            totalPages={meta.totalPages ?? 1}
            onPageChange={setPage}
          />
        </div>
      ) : (
        <AdesiaDataTable
          title="Your lessons"
          data={lessons}
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
          emptyMessage="No lessons yet — generate one from completed materials."
        />
      )}

      <AdesiaModal
        opened={opened}
        onClose={close}
        title="Generate lesson"
        size="lg"
        submitLabel="Start generation"
        onSubmit={handleGenerate}
        submitting={submitting}
        submitDisabled={!topicId || !form.materialIds.length}
      >
        <div className="space-y-4">
          <Select label="Subject" searchable data={subjects.map((s) => ({ value: s.id || s._id, label: s.name }))} onChange={loadTopicsForSubject} />
          <Select label="Topic" searchable data={topics.map((t) => ({ value: t.id || t._id, label: t.name }))} value={topicId} onChange={loadMaterialsForTopic} />
          <TextInput label="Title (optional)" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
          <Select
            label="Student level"
            description="Target depth and vocabulary for the generated lesson."
            data={[
              { value: 'beginner', label: 'Beginner' },
              { value: 'intermediate', label: 'Intermediate' },
              { value: 'advanced', label: 'Advanced' },
            ]}
            value={form.studentLevel}
            onChange={(value) => setForm({ ...form, studentLevel: value ?? 'intermediate' })}
          />
          <MultiSelect
            label="Materials"
            description="Select 1–10 completed materials"
            searchable
            data={materials.map((m) => ({ value: m.id || m._id, label: m.title || m.name }))}
            value={form.materialIds}
            onChange={(v) => setForm({ ...form, materialIds: v })}
            maxValues={10}
          />
        </div>
      </AdesiaModal>

      <Modal opened={sourcesOpen} onClose={closeSources} title="Lesson sources" size="lg" centered classNames={{ content: 'glass-card !bg-card' }}>
        <pre className="max-h-96 overflow-auto rounded-lg border border-border/50 bg-muted/30 p-4 text-xs">
          {JSON.stringify(sources, null, 2)}
        </pre>
      </Modal>
    </>
  );
};

export default TeacherLessonsPage;
