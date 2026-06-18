import {
  Building2,
  CreditCard,
  Globe2,
  LayoutDashboard,
  Mail,
  Server,
  Users,
  BookOpen,
  Wallet,
} from 'lucide-react';
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
      { label: 'Payments', path: '/platform/payments', icon: Wallet },
      { label: 'Content', path: '/platform/content', icon: BookOpen },
      { label: 'Emails', path: '/platform/emails', icon: Mail },
    ],
  },
];

const PlatformBanner = () => (
  <div className="rounded-xl border border-primary/25 bg-primary/5 px-4 py-3 text-sm text-foreground">
    <span className="font-semibold text-primary">Platform admin</span>
    {' — '}
    Cross-tenant operations for Adesia. Manage organizations, users, billing, and email from this portal.
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
