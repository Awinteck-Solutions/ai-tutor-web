import { useEffect, useState } from 'react';
import { Breadcrumbs, Anchor } from '@mantine/core';
import { Link, useParams } from 'react-router-dom';
import { notifications } from '@mantine/notifications';
import { useDisclosure } from '@mantine/hooks';
import { ChevronRight, Layers, Users } from 'lucide-react';
import EnrolledStudentsModal from '../../../shared/components/EnrolledStudentsModal';
import { getSubjectEnrollments } from '../../Organization/services/organization.services';
import { useAuth } from '../../../shared/context/AuthContext';
import { PageHeader } from '../../../shared/components/PageShell';
import { PageHeaderSkeleton } from '../../../shared/components/TableSkeleton';
import { GlassCard } from '../../../shared/components/GlassCard';
import AdesiaDataTable from '../../../shared/components/AdesiaDataTable';
import ListGridToolbar from '../../../shared/components/ListGridToolbar';
import { getErrorMessage } from '../../../shared/utils/formatters';
import { getSubjects, getTopics } from '../services/teacher.services';

const TopicsPage = () => {
  const { subjectId } = useParams();
  const { organizationId } = useAuth();
  const [topics, setTopics] = useState([]);
  const [subjectName, setSubjectName] = useState('');
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [view, setView] = useState('grid');
  const [studentsOpened, { open: openStudents, close: closeStudents }] = useDisclosure(false);

  useEffect(() => {
    if (!organizationId || !subjectId) { setLoading(false); return; }

    Promise.all([
      getTopics(organizationId, subjectId),
      getSubjects(organizationId),
    ])
      .then(([topicsData, subjectsData]) => {
        setTopics(Array.isArray(topicsData) ? topicsData : []);
        const subjects = Array.isArray(subjectsData) ? subjectsData : [];
        const subject = subjects.find((s) => (s.id || s._id) === subjectId);
        setSubjectName(subject?.name ?? 'Subject');
      })
      .catch((err) => notifications.show({ title: 'Error', message: getErrorMessage(err), color: 'red' }))
      .finally(() => setLoading(false));
  }, [organizationId, subjectId]);

  const filtered = topics.filter((t) => {
    const q = search.trim().toLowerCase();
    if (!q) return true;
    return [t.name, t.description].some((v) => v?.toLowerCase().includes(q));
  });

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
      className: 'max-w-xl text-muted-foreground',
      render: (row) => row.description || '—',
    },
  ];

  return (
    <>
      {loading ? (
        <PageHeaderSkeleton />
      ) : (
        <>
          <Breadcrumbs separator={<ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />} mb="md">
            <Anchor component={Link} to="/teacher/subjects" size="sm" c="dimmed">
              Subject
            </Anchor>
            <Anchor size="sm">{subjectName}</Anchor>
          </Breadcrumbs>
          <PageHeader
            title={subjectName}
            description="Topics in this subject — use them to organize materials and lessons."
            action={(
              <button type="button" className="btn-outline flex items-center gap-2 !px-3 !py-2 text-sm" onClick={openStudents}>
                <Users className="h-4 w-4" />
                Enrolled students
              </button>
            )}
          />
        </>
      )}

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
              <p className="mt-1 text-sm text-muted-foreground">{t.description || 'No description'}</p>
            </GlassCard>
          )) : (
            <p className="col-span-full py-12 text-center text-muted-foreground">No topics found for this subject.</p>
          )}
        </div>
      ) : (
        <AdesiaDataTable
          title="Topic sequence"
          description={`${filtered.length} topic${filtered.length === 1 ? '' : 's'} in this subject`}
          data={filtered}
          columns={columns}
          loading={loading}
          pageSize={12}
          emptyMessage="No topics found for this subject."
        />
      )}

      <EnrolledStudentsModal
        opened={studentsOpened}
        onClose={closeStudents}
        title={subjectName ? `Students — ${subjectName}` : 'Enrolled students'}
        loadStudents={() => getSubjectEnrollments(organizationId, subjectId)}
      />
    </>
  );
};

export default TopicsPage;
