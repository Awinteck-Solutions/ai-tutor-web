import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { notifications } from '@mantine/notifications';
import { Select, SegmentedControl } from '@mantine/core';
import { BookOpen, Play } from 'lucide-react';
import { useAuth } from '../../../shared/context/AuthContext';
import { PageHeader } from '../../../shared/components/PageShell';
import { CardGridSkeleton, PageHeaderSkeleton, TableSkeleton } from '../../../shared/components/TableSkeleton';
import { GlassCard } from '../../../shared/components/GlassCard';
import { AdesiaBadge } from '../../../shared/components/AdesiaBadge';
import ListGridToolbar, { filterSelectClass } from '../../../shared/components/ListGridToolbar';
import AdesiaDataTable from '../../../shared/components/AdesiaDataTable';
import DataListFooter from '../../../shared/components/DataListFooter';
import { useClientList } from '../../../shared/hooks/useClientList';
import { getErrorMessage } from '../../../shared/utils/formatters';
import { groupPersonalLessons } from '../../../shared/utils/lessonContent';
import { getLessons, listLessonGroups } from '../services/student.services';
import StudentSourceLabel from '../components/StudentSourceLabel';
import GroupedLessonSections from '../components/GroupedLessonSections';

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
  {
    key: 'collection',
    defaultValue: 'all',
    apply: (lesson, value) => {
      if (value === 'all') return true;
      if (value === 'school') return !lesson.isPersonal;
      if (value === 'ungrouped') return lesson.isPersonal && !lesson.groupId;
      return lesson.groupId === value;
    },
  },
];

const StudentLessonsPage = () => {
  const { organizationId, organizationName, isSchoolStudent } = useAuth();
  const [lessons, setLessons] = useState([]);
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState('grid');

  useEffect(() => {
    if (!organizationId) { setLoading(false); return; }
    Promise.all([
      getLessons(organizationId),
      listLessonGroups(organizationId).catch(() => ({ groups: [] })),
    ])
      .then(([lessonData, groupData]) => {
        setLessons(Array.isArray(lessonData) ? lessonData : []);
        setGroups(groupData?.groups ?? []);
      })
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
    searchKeys: ['title', 'summary', 'groupTitle'],
    filters: lessonFilters,
  });

  const grouped = useMemo(
    () => groupPersonalLessons(filtered, groups),
    [filtered, groups],
  );

  const collectionOptions = useMemo(() => {
    const opts = [
      { value: 'all', label: 'All collections' },
      { value: 'school', label: isSchoolStudent && organizationName ? organizationName : 'School' },
      { value: 'ungrouped', label: 'Ungrouped self-learn' },
    ];
    groups.forEach((g) => opts.push({ value: g.id, label: g.title }));
    return opts;
  }, [groups, isSchoolStudent, organizationName]);

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
          {row.groupTitle && (
            <span className="text-xs text-muted-foreground">{row.groupTitle}</span>
          )}
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
    <Link key={l.id} to={`/student/lessons/${l.id}`} className="block h-full no-underline">
      <GlassCard hover className="flex h-full min-w-0 flex-col p-4 sm:p-6">
        <div className="mb-3 flex items-start justify-between gap-2">
          <BookOpen className="h-5 w-5 shrink-0 text-primary" />
          <div className="flex min-w-0 flex-wrap justify-end gap-1">
            {(l.isPersonal || (isSchoolStudent && !l.isPersonal)) && (
              <AdesiaBadge status={l.isPersonal ? 'draft' : 'ready'}>
                {l.isPersonal ? 'Self-learn' : organizationName}
              </AdesiaBadge>
            )}
            {l.groupTitle && (
              <AdesiaBadge status="draft">{l.groupTitle}</AdesiaBadge>
            )}
            <AdesiaBadge status={progressStatus(l.progress)}>
              {progressLabel(l.progress)}
            </AdesiaBadge>
          </div>
        </div>
        <h3 className="line-clamp-2 font-display font-semibold leading-snug text-foreground">{l.title}</h3>
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

  const listRow = (l) => (
    <Link
      key={l.id}
      to={`/student/lessons/${l.id}`}
      className="flex min-w-0 items-center gap-3 px-3 py-3.5 no-underline transition hover:bg-primary/5 sm:px-4 sm:py-3"
    >
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10">
        <BookOpen className="h-4 w-4 text-primary" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="line-clamp-2 font-medium leading-snug text-foreground">{l.title}</p>
        <p className="mt-0.5 truncate text-xs text-muted-foreground">
          {progressLabel(l.progress)}
          {l.groupTitle ? ` · ${l.groupTitle}` : ''}
        </p>
      </div>
      <Play className="h-4 w-4 shrink-0 text-primary" />
    </Link>
  );

  const showCollections = view === 'collections';

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
        view={view === 'table' ? 'list' : 'grid'}
        onViewChange={(v) => setView(v === 'list' ? 'table' : 'grid')}
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
          className={filterSelectClass}
          size="sm"
        />
        <Select
          label="Collection"
          data={collectionOptions}
          value={filterValues.collection ?? 'all'}
          onChange={(v) => setFilter('collection', v ?? 'all')}
          className={filterSelectClass}
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
          className={filterSelectClass}
          size="sm"
        />
      </ListGridToolbar>

      <div className="mb-4 flex min-w-0 flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        {!loading && (
          <p className="text-sm text-muted-foreground">
            {totalItems}
            {' lesson'}
            {totalItems !== 1 ? 's' : ''}
            {search.trim() || filterValues.progress !== 'all' || filterValues.source !== 'all'
              || filterValues.collection !== 'all'
              ? ' matching filters'
              : ''}
          </p>
        )}

        <SegmentedControl
          fullWidth
          className="sm:!w-auto"
          size="xs"
          value={view}
          onChange={setView}
          data={[
            { value: 'grid', label: 'Grid' },
            { value: 'table', label: 'Table' },
            { value: 'collections', label: 'Collections' },
          ]}
        />
      </div>

      {loading ? (
        view === 'collections' ? <CardGridSkeleton count={3} /> : view === 'grid' ? (
          <CardGridSkeleton count={6} />
        ) : (
          <TableSkeleton rows={6} columns={3} title="Your lessons" />
        )
      ) : showCollections ? (
        filtered.length === 0 ? (
          <p className="py-12 text-center text-muted-foreground">{emptyMessage}</p>
        ) : (
          <GroupedLessonSections
            school={grouped.school}
            grouped={grouped.grouped}
            ungrouped={grouped.ungrouped}
            renderGridLesson={lessonCard}
            renderListLesson={listRow}
            emptyMessage={emptyMessage}
          />
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
