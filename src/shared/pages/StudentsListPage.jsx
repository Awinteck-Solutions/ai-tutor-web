import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { notifications } from '@mantine/notifications';
import { Users } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { PageHeader } from '../components/PageShell';
import { PageHeaderSkeleton } from '../components/TableSkeleton';
import { GlassCard } from '../components/GlassCard';
import AdesiaDataTable from '../components/AdesiaDataTable';
import ListGridToolbar from '../components/ListGridToolbar';
import { getErrorMessage } from '../utils/formatters';
import { getStudents } from '../../Features/Teacher/services/teacher.services';

const StudentsListPage = ({ basePath = '/teacher' }) => {
  const { organizationId } = useAuth();
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [view, setView] = useState('grid');

  useEffect(() => {
    if (!organizationId) { setLoading(false); return; }
    getStudents(organizationId)
      .then((data) => setStudents(Array.isArray(data) ? data : []))
      .catch((err) => notifications.show({ title: 'Error', message: getErrorMessage(err), color: 'red' }))
      .finally(() => setLoading(false));
  }, [organizationId]);

  const filtered = students.filter((s) => {
    const q = search.trim().toLowerCase();
    if (!q) return true;
    return [s.firstName, s.lastName, s.email].some((v) => v?.toLowerCase().includes(q));
  });

  const columns = [
    {
      key: 'name',
      header: 'Student',
      className: 'font-medium',
      render: (row) => `${row.firstName} ${row.lastName}`,
    },
    { key: 'email', header: 'Email', className: 'text-muted-foreground' },
    {
      key: 'subjects',
      header: 'Subjects',
      render: (row) => row.enrolledSubjectCount ?? '—',
    },
    {
      key: 'progress',
      header: 'Quiz avg',
      render: (row) => {
        const pct = row.progress?.averageQuizScore;
        return pct != null ? `${Math.round(pct)}%` : '—';
      },
    },
    {
      key: 'lessons',
      header: 'Lessons',
      render: (row) => row.progress?.lessonsCompleted ?? '—',
    },
    {
      key: 'actions',
      header: '',
      className: 'text-right',
      render: (row) => (
        <Link to={`${basePath}/students/${row.id || row._id}`} className="btn-outline !px-2 !py-1 text-xs">
          View progress
        </Link>
      ),
    },
  ];

  return (
    <>
      {loading ? <PageHeaderSkeleton /> : (
        <PageHeader
          title="Students"
          gradientWord="Students"
          description="Progress and performance for students in your organization."
        />
      )}

      <ListGridToolbar
        view={view}
        onViewChange={setView}
        search={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search students…"
      />

      {view === 'grid' ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.length ? filtered.map((s) => (
            <Link key={s.id || s._id} to={`${basePath}/students/${s.id || s._id}`} className="no-underline">
              <GlassCard hover className="h-full p-6">
                <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-primary/15 text-primary">
                  <Users className="h-5 w-5" />
                </div>
                <h3 className="font-display font-semibold text-foreground">
                  {s.firstName} {s.lastName}
                </h3>
                <p className="mt-1 text-sm text-muted-foreground">{s.email}</p>
                <p className="mt-2 text-xs text-muted-foreground">
                  {s.progress?.lessonsCompleted ?? 0} lessons ·{' '}
                  {s.progress?.averageQuizScore != null
                    ? `${Math.round(s.progress.averageQuizScore)}% quiz avg`
                    : 'no quizzes yet'}
                </p>
              </GlassCard>
            </Link>
          )) : (
            <p className="col-span-full py-12 text-center text-muted-foreground">No students found.</p>
          )}
        </div>
      ) : (
        <AdesiaDataTable
          title="All students"
          data={filtered}
          columns={columns}
          loading={loading}
          pageSize={10}
          emptyMessage="No students in this organization yet."
        />
      )}
    </>
  );
};

export default StudentsListPage;
