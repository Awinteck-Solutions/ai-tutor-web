import {
  Bell,
  BookOpen,
  Layers,
  LayoutDashboard,
  Settings,
  Store,
  Upload,
  Users,
} from 'lucide-react';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import AppShell from './AppShell';

export const buildTeacherNavGroups = (t) => [
  {
    title: 'Overview',
    items: [
      { label: 'Dashboard', path: '/teacher/dashboard', icon: LayoutDashboard, end: true },
    ],
  },
  {
    title: 'Teach',
    items: [
      { label: 'Subjects & topics', path: '/teacher/subjects', icon: BookOpen },
      { label: 'Materials', path: '/teacher/materials', icon: Upload },
      { label: 'Lessons', path: '/teacher/lessons', icon: Layers },
      { label: t('teacher.marketplace'), path: '/teacher/marketplace', icon: Store },
      { label: 'Students', path: '/teacher/students', icon: Users },
    ],
  },
  {
    title: 'Account',
    items: [
      { label: 'Notifications', path: '/teacher/notifications', icon: Bell },
      { label: 'Settings', path: '/teacher/settings', icon: Settings },
    ],
  },
];

export const teacherNavGroups = [];

const OrgBanner = ({ organizationId }) =>
  !organizationId ? (
    <div className="alert-warning">
      No organization linked to your account. Contact your school administrator.
    </div>
  ) : null;

const TeacherLayout = () => {
  const { t } = useTranslation('nav');
  const { organizationId } = useAuth();
  const navGroups = useMemo(() => buildTeacherNavGroups(t), [t]);
  return (
    <AppShell
      navGroups={navGroups}
      homePath="/teacher/dashboard"
      portalLabel="Teacher"
      banner={<OrgBanner organizationId={organizationId} />}
    />
  );
};

export default TeacherLayout;
