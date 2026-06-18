import {
  BarChart3,
  Bell,
  BookOpen,
  ClipboardList,
  CreditCard,
  GraduationCap,
  UserRound,
  Layers,
  LayoutDashboard,
  Settings,
  Upload,
  Users,
  Wrench,
  FileText,
  ScrollText,
  Shield,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import AppShell from './AppShell';

export const adminNavGroups = [
  {
    title: 'Overview',
    items: [
      { label: 'Dashboard', path: '/admin/dashboard', icon: LayoutDashboard, end: true },
    ],
  },
  {
    title: 'Billing',
    items: [
      { label: 'Usage', path: '/admin/usage', icon: BarChart3 },
      { label: 'Subscription', path: '/admin/subscription', icon: CreditCard },
    ],
  },
  {
    title: 'People',
    items: [
      { label: 'Members', path: '/admin/members', icon: Users },
      { label: 'Students', path: '/admin/students', icon: UserRound },
      { label: 'Assignments', path: '/admin/assignments', icon: ClipboardList },
    ],
  },
  {
    title: 'Academic',
    items: [
      { label: 'Years & terms', path: '/admin/academic/years', icon: GraduationCap },
      { label: 'Subjects & topics', path: '/admin/academic/subjects', icon: BookOpen },
    ],
  },
  {
    title: 'Content',
    items: [
      { label: 'Materials', path: '/admin/materials', icon: Upload },
      { label: 'Lessons', path: '/admin/lessons', icon: FileText },
    ],
  },
  {
    title: 'Insights',
    items: [
      { label: 'Analytics', path: '/admin/analytics', icon: BarChart3 },
    ],
  },
  {
    title: 'System',
    items: [
      { label: 'Audit log', path: '/admin/audit', icon: ScrollText },
      { label: 'Jobs', path: '/admin/jobs', icon: Wrench },
      { label: 'Notifications', path: '/admin/notifications', icon: Bell },
      { label: 'Settings', path: '/admin/settings', icon: Settings },
    ],
  },
];

const platformNavItem = {
  title: 'Platform',
  items: [{ label: 'Platform admin', path: '/platform/dashboard', icon: Shield }],
};

const OrgBanner = ({ organizationId, isPlatformAdmin }) => {
  if (organizationId || isPlatformAdmin) return null;
  return (
    <div className="alert-warning">
      No organization linked to your account.{' '}
      <a href="/onboarding" className="font-semibold text-primary underline underline-offset-2">
        Complete onboarding
      </a>{' '}
      or contact your administrator.
    </div>
  );
};

const AdminLayout = () => {
  const { organizationId, isPlatformAdmin } = useAuth();
  const navGroups = isPlatformAdmin
    ? [...adminNavGroups, platformNavItem]
    : adminNavGroups;

  return (
    <AppShell
      navGroups={navGroups}
      homePath={isPlatformAdmin ? '/platform/dashboard' : '/admin/dashboard'}
      portalLabel={isPlatformAdmin ? 'Platform' : 'Admin'}
      banner={<OrgBanner organizationId={organizationId} isPlatformAdmin={isPlatformAdmin} />}
    />
  );
};

export default AdminLayout;
