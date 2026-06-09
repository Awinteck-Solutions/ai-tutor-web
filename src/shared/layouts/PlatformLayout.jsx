import {
  Activity,
  Building2,
  CreditCard,
  Globe2,
  LayoutDashboard,
  Server,
  Shield,
  Users,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import AppShell from './AppShell';

export const platformNavGroups = [
  {
    title: 'Overview',
    items: [
      { label: 'Dashboard', path: '/platform/dashboard', icon: LayoutDashboard, end: true },
    ],
  },
  {
    title: 'Monitoring',
    items: [
      { label: 'Traffic & geography', path: '/platform/traffic', icon: Globe2 },
      { label: 'System health', path: '/platform/health', icon: Server },
    ],
  },
  {
    title: 'Management',
    items: [
      { label: 'Organizations', path: '/platform/organizations', icon: Building2 },
      { label: 'Users', path: '/platform/users', icon: Users },
      { label: 'Invoices', path: '/platform/invoices', icon: CreditCard },
    ],
  },
  {
    title: 'Portals',
    items: [
      { label: 'Org admin', path: '/admin/dashboard', icon: Shield },
    ],
  },
];

const PlatformBanner = () => (
  <div className="rounded-xl border border-primary/25 bg-primary/5 px-4 py-3 text-sm text-foreground">
    <span className="font-semibold text-primary">Platform admin</span>
    {' — '}
    Cross-tenant view for Adesia operations. Payment collection is invoice-only for now.
    {' '}
    <Link to="/admin/dashboard" className="font-medium text-primary underline underline-offset-2">
      Open org admin
    </Link>
  </div>
);

const PlatformLayout = () => (
  <AppShell
    navGroups={platformNavGroups}
    homePath="/platform/dashboard"
    portalLabel="Platform"
    banner={<PlatformBanner />}
  />
);

export default PlatformLayout;
