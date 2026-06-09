import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { notifications } from '@mantine/notifications';
import { useDisclosure } from '@mantine/hooks';
import { BookOpen, Users } from 'lucide-react';
import EnrolledStudentsModal from '../../../shared/components/EnrolledStudentsModal';
import { getSubjectEnrollments } from '../../Organization/services/organization.services';
import { useAuth } from '../../../shared/context/AuthContext';
import { AdesiaBadge } from '../../../shared/components/AdesiaBadge';
import { EmptyState, PageHeader } from '../../../shared/components/PageShell';
import { CardGridSkeleton, PageHeaderSkeleton } from '../../../shared/components/TableSkeleton';
import { GlassCard } from '../../../shared/components/GlassCard';
import AdesiaDataTable from '../../../shared/components/AdesiaDataTable';
import ListGridToolbar from '../../../shared/components/ListGridToolbar';
import { getErrorMessage } from '../../../shared/utils/formatters';
import { getSubjects } from '../services/teacher.services';

const SubjectsPage = () => {
  const { organizationId } = useAuth();
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState('grid');
  const [search, setSearch] = useState('');
  const [previewSubject, setPreviewSubject] = useState(null);
  const [studentsOpened, { open: openStudents, close: closeStudents }] = useDisclosure(false);

  useEffect(() => {
    if (!organizationId) { setLoading(false); return; }
    getSubjects(organizationId)
      .then((data) => setSubjects(Array.isArray(data) ? data : []))
      .catch((err) => notifications.show({ title: 'Error', message: getErrorMessage(err), color: 'red' }))
      .finally(() => setLoading(false));
  }, [organizationId]);

  const filtered = subjects.filter((s) => {
    const q = search.trim().toLowerCase();
    if (!q) return true;
    return [s.name, s.code, s.description].some((v) => v?.toLowerCase().includes(q));
  });

  if (loading) {
    return (
      <>
        <PageHeaderSkeleton />
        <CardGridSkeleton count={6} />
      </>
    );
  }

  if (!subjects.length) {
    return (
      <>
        <PageHeader title="Subject" gradientWord="Subject" description="Your assigned subjects and materials." />
        <EmptyState
          icon={BookOpen}
          title="No subjects assigned yet"
          description="Ask your admin to assign you to a subject under Admin → Assignments → Teachers, then refresh."
          actionLabel="Upload your first material"
          actionTo="/teacher/materials"
        />
      </>
    );
  }

  const tableColumns = [
    {
      key: 'name',
      header: 'Subject',
      className: 'font-medium',
      render: (row) => (
        <Link
          to={`/teacher/subjects/${row.id || row._id}/topics`}
          className="text-primary hover:underline"
        >
          {row.name}
        </Link>
      ),
    },
    { key: 'code', header: 'Code', render: (row) => row.code || '—' },
    {
      key: 'students',
      header: 'Students',
      render: (row) => row.enrolledStudentCount ?? 0,
    },
    {
      key: 'description',
      header: 'Description',
      className: 'text-muted-foreground',
      render: (row) => row.description || '—',
    },
    {
      key: 'actions',
      header: '',
      className: 'text-right',
      render: (row) => (
        <div className="flex justify-end gap-2">
          <button
            type="button"
            className="btn-outline !px-2 !py-1 text-xs"
            onClick={() => {
              setPreviewSubject(row);
              openStudents();
            }}
          >
            Students
          </button>
          <Link to={`/teacher/subjects/${row.id || row._id}/topics`} className="btn-outline !px-2 !py-1 text-xs">
            Topics
          </Link>
        </div>
      ),
    },
  ];

  return (
    <>
      <PageHeader
        title="Subject"
        gradientWord="Subject"
        description="Subjects assigned to you — browse topics and build learning content."
      />

      <ListGridToolbar
        view={view}
        onViewChange={setView}
        search={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search subjects…"
      />

      {view === 'grid' ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((s) => (
            <Link key={s.id || s._id} to={`/teacher/subjects/${s.id || s._id}/topics`} className="no-underline">
              <GlassCard hover className="h-full p-6">
                <div className="mb-3 flex items-center justify-between">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/15 text-primary">
                    <BookOpen className="h-5 w-5" />
                  </div>
                  <AdesiaBadge status="ready">Ready</AdesiaBadge>
                </div>
                <h3 className="font-display font-semibold text-foreground">{s.name}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{s.code || s.description || 'View topics →'}</p>
                <p className="mt-2 text-xs text-muted-foreground">
                  {s.enrolledStudentCount ?? 0} enrolled student{(s.enrolledStudentCount ?? 0) === 1 ? '' : 's'}
                </p>
                <button
                  type="button"
                  className="btn-outline mt-3 flex items-center gap-1 !px-2 !py-1 text-xs"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setPreviewSubject(s);
                    openStudents();
                  }}
                >
                  <Users className="h-3 w-3" />
                  View students
                </button>
              </GlassCard>
            </Link>
          ))}
        </div>
      ) : (
        <AdesiaDataTable
          title="Subject list"
          data={filtered}
          columns={tableColumns}
          pageSize={10}
          emptyMessage="No subjects match your search."
        />
      )}

      <EnrolledStudentsModal
        opened={studentsOpened}
        onClose={closeStudents}
        title={previewSubject?.name ? `Students — ${previewSubject.name}` : 'Enrolled students'}
        loadStudents={() => getSubjectEnrollments(
          organizationId,
          previewSubject?.id || previewSubject?._id,
        )}
      />
    </>
  );
};

export default SubjectsPage;
