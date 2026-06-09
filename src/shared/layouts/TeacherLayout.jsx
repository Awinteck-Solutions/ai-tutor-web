import {
  Bell,
  BookOpen,
  Layers,
  LayoutDashboard,
  Settings,
  Upload,
  Users,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import AppShell from './AppShell';

export const teacherNavGroups = [
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

const OrgBanner = ({ organizationId }) =>
  !organizationId ? (
    <div className="alert-warning">
      No organization linked to your account. Contact your school administrator.
    </div>
  ) : null;

const TeacherLayout = () => {
  const { organizationId } = useAuth();
  return (
    <AppShell
      navGroups={teacherNavGroups}
      homePath="/teacher/dashboard"
      portalLabel="Teacher"
      banner={<OrgBanner organizationId={organizationId} />}
    />
  );
};

export default TeacherLayout;
