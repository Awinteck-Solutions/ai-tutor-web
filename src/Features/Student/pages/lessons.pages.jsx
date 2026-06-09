import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { notifications } from '@mantine/notifications';
import { Select } from '@mantine/core';
import { BookOpen, Play } from 'lucide-react';
import { useAuth } from '../../../shared/context/AuthContext';
import { PageHeader } from '../../../shared/components/PageShell';
import { CardGridSkeleton, PageHeaderSkeleton, TableSkeleton } from '../../../shared/components/TableSkeleton';
import { GlassCard } from '../../../shared/components/GlassCard';
import { AdesiaBadge } from '../../../shared/components/AdesiaBadge';
import ListGridToolbar from '../../../shared/components/ListGridToolbar';
import AdesiaDataTable from '../../../shared/components/AdesiaDataTable';
import DataListFooter from '../../../shared/components/DataListFooter';
import { useClientList } from '../../../shared/hooks/useClientList';
import { getErrorMessage } from '../../../shared/utils/formatters';
import { getLessons } from '../services/student.services';
import StudentSourceLabel from '../components/StudentSourceLabel';

const LESSONS_PAGE_SIZE = 9;

const progressStatus = (progress) => {
  if (!progress) return 'ready';
  if (progress.status === 'COMPLETED' || progress.progressPercent >= 100) return 'active';
  if (progress.status === 'IN_PROGRESS') return 'draft';
  return 'ready';
};

const progressLabel = (progress) => {
  if (!progress) return 'Not started';
  if (progress.status === 'COMPLETED' || progress.progressPercent >= 100) return 'Completed';
  if (progress.progressPercent > 0) return `${Math.round(progress.progressPercent)}%`;
  return progress.status?.replace('_', ' ') ?? 'In progress';
};

const progressFilterKey = (progress) => {
  if (!progress || (progress.progressPercent ?? 0) <= 0) {
    if (progress?.status === 'IN_PROGRESS') return 'in_progress';
    return 'not_started';
  }
  if (progress.status === 'COMPLETED' || progress.progressPercent >= 100) return 'completed';
  return 'in_progress';
};

const lessonFilters = [
  {
    key: 'progress',
    defaultValue: 'all',
    apply: (lesson, value) => progressFilterKey(lesson.progress) === value,
  },
  {
    key: 'source',
    defaultValue: 'all',
    apply: (lesson, value) => {
      if (value === 'all') return true;
      if (value === 'self') return Boolean(lesson.isPersonal);
      return !lesson.isPersonal;
    },
  },
];

const StudentLessonsPage = () => {
  const { organizationId, organizationName, isSchoolStudent } = useAuth();
  const [lessons, setLessons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState('grid');

  useEffect(() => {
    if (!organizationId) { setLoading(false); return; }
    getLessons(organizationId)
      .then((data) => setLessons(Array.isArray(data) ? data : []))
      .catch((err) => notifications.show({ title: 'Error', message: getErrorMessage(err), color: 'red' }))
      .finally(() => setLoading(false));
  }, [organizationId]);

  const {
    search,
    setSearch,
    setFilter,
    filterValues,
    paginatedItems,
    filtered,
    page,
    setPage,
    rangeStart,
    rangeEnd,
    totalItems,
    totalPages,
  } = useClientList(lessons, {
    pageSize: LESSONS_PAGE_SIZE,
    searchKeys: ['title', 'summary'],
    filters: lessonFilters,
  });

  const emptyMessage = filtered.length
    ? 'No lessons on this page.'
    : 'No lessons match your search or filters.';

  const columns = [
    {
      key: 'title',
      header: 'Lesson',
      className: 'font-medium',
      render: (row) => (
        <div className="flex flex-col gap-1">
          <Link to={`/student/lessons/${row.id}`} className="text-primary hover:underline">
            {row.title}
          </Link>
          <StudentSourceLabel
            isPersonal={row.isPersonal}
            organizationName={organizationName}
            isSchoolStudent={isSchoolStudent}
          />
        </div>
      ),
    },
    {
      key: 'progress',
      header: 'Progress',
      render: (row) => (
        <AdesiaBadge status={progressStatus(row.progress)}>
          {progressLabel(row.progress)}
        </AdesiaBadge>
      ),
    },
    {
      key: 'actions',
      header: '',
      className: 'text-right',
      render: (row) => (
        <Link to={`/student/lessons/${row.id}`} className="btn-outline !px-2 !py-1 text-xs">
          Open
        </Link>
      ),
    },
  ];

  const lessonCard = (l) => (
    <Link key={l.id} to={`/student/lessons/${l.id}`} className="no-underline">
      <GlassCard hover className="flex h-full flex-col p-6">
        <div className="mb-3 flex items-center justify-between gap-2">
          <BookOpen className="h-5 w-5 text-primary" />
          <div className="flex flex-wrap justify-end gap-1">
            {(l.isPersonal || (isSchoolStudent && !l.isPersonal)) && (
              <AdesiaBadge status={l.isPersonal ? 'draft' : 'ready'}>
                {l.isPersonal ? 'Self-learn' : organizationName}
              </AdesiaBadge>
            )}
            <AdesiaBadge status={progressStatus(l.progress)}>
              {progressLabel(l.progress)}
            </AdesiaBadge>
          </div>
        </div>
        <h3 className="font-display font-semibold text-foreground">{l.title}</h3>
        <p className="mt-2 line-clamp-2 flex-1 text-sm text-muted-foreground">
          {l.summary || 'Open to read lesson content, flashcards, and quizzes.'}
        </p>
        <span className="mt-4 inline-flex items-center gap-1 text-xs font-medium text-primary">
          <Play className="h-3 w-3" />
          Continue
        </span>
      </GlassCard>
    </Link>
  );

  return (
    <>
      {loading ? <PageHeaderSkeleton /> : (
        <PageHeader
          title="Lessons"
          gradientWord="Lessons"
          description="School lessons and your self-learn lessons in one place."
        />
      )}

      <ListGridToolbar
        view={view}
        onViewChange={setView}
        search={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search lessons…"
      >
        <Select
          label="Source"
          data={[
            { value: 'all', label: 'All sources' },
            { value: 'school', label: isSchoolStudent && organizationName ? organizationName : 'School' },
            { value: 'self', label: 'Self-learn' },
          ]}
          value={filterValues.source ?? 'all'}
          onChange={(v) => setFilter('source', v ?? 'all')}
          className="w-40"
          size="sm"
        />
        <Select
          label="Progress"
          data={[
            { value: 'all', label: 'All' },
            { value: 'not_started', label: 'Not started' },
            { value: 'in_progress', label: 'In progress' },
            { value: 'completed', label: 'Completed' },
          ]}
          value={filterValues.progress ?? 'all'}
          onChange={(v) => setFilter('progress', v ?? 'all')}
          className="w-44"
          size="sm"
        />
      </ListGridToolbar>

      {!loading && (
        <p className="-mt-2 mb-4 text-sm text-muted-foreground">
          {totalItems}
          {' '}
          lesson
          {totalItems !== 1 ? 's' : ''}
          {search.trim() || filterValues.progress !== 'all' || filterValues.source !== 'all'
            ? ' matching filters'
            : ''}
        </p>
      )}

      {loading ? (
        view === 'grid' ? <CardGridSkeleton count={6} /> : (
          <TableSkeleton rows={6} columns={3} title="Your lessons" />
        )
      ) : view === 'grid' ? (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {paginatedItems.length ? paginatedItems.map(lessonCard) : (
              <p className="col-span-full py-12 text-center text-muted-foreground">
                {emptyMessage}
              </p>
            )}
          </div>
          <DataListFooter
            rangeStart={rangeStart}
            rangeEnd={rangeEnd}
            totalItems={totalItems}
            page={page}
            totalPages={totalPages}
            pageSize={LESSONS_PAGE_SIZE}
            onPageChange={setPage}
          />
        </>
      ) : (
        <>
          <AdesiaDataTable
            title={`Your lessons (${totalItems})`}
            data={paginatedItems}
            columns={columns}
            loading={false}
            paginate={false}
            searchable={false}
            emptyMessage={emptyMessage}
          />
          <DataListFooter
            rangeStart={rangeStart}
            rangeEnd={rangeEnd}
            totalItems={totalItems}
            page={page}
            totalPages={totalPages}
            pageSize={LESSONS_PAGE_SIZE}
            onPageChange={setPage}
          />
        </>
      )}
    </>
  );
};

export default StudentLessonsPage;
