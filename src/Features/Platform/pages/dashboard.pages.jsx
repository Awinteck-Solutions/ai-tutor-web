import { useCallback, useEffect, useState } from 'react';
import { notifications } from '@mantine/notifications';
import {
  BookOpen,
  Building2,
  Cpu,
  Globe2,
  Server,
  Users,
  Activity,
} from 'lucide-react';
import { PageHeader } from '../../../shared/components/PageShell';
import { StatCard, MetricSplitCard, AdesiaBadge } from '../../../shared/components/AdesiaBadge';
import { PageLoader } from '../../../shared/components/PageLoader';
import { GlassCard } from '../../../shared/components/GlassCard';
import { formatNumber, getErrorMessage } from '../../../shared/utils/formatters';
import { getPlatformStats } from '../services/platform.services';

const statusVariant = (status) => {
  if (status === 'UP') return 'success';
  if (status === 'DEGRADED') return 'processing';
  return 'failed';
};

const DashboardPage = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  const reload = useCallback(() => {
    setLoading(true);
    getPlatformStats(30)
      .then(setStats)
      .catch((err) => notifications.show({ title: 'Platform', message: getErrorMessage(err), color: 'red' }))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    reload();
  }, [reload]);

  if (loading) return <PageLoader />;

  const health = stats?.health ?? {};
  const traffic = stats?.traffic ?? {};

  return (
    <>
      <PageHeader
        title="Platform"
        gradientWord="overview"
        description="Cross-tenant metrics for users, organizations, AI usage, traffic, and system health."
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard icon={Users} label="Total users" value={formatNumber(stats?.users?.total)} sublabel={`${formatNumber(stats?.users?.active)} active`} highlight />
        <StatCard icon={Building2} label="Organizations" value={formatNumber(stats?.organizations?.total)} sublabel={`${formatNumber(stats?.organizations?.personalWorkspaces)} personal workspaces`} />
        <StatCard icon={Globe2} label="Page views (30d)" value={formatNumber(traffic.totalVisits)} sublabel={`${formatNumber(traffic.uniqueVisitors)} unique IPs`} />
        <StatCard icon={Server} label="API uptime (24h)" value={`${health.apiUptimePercent ?? 100}%`} sublabel={`Overall: ${health.overallStatus ?? 'UP'}`} />
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <MetricSplitCard
          icon={Cpu}
          label="AI usage this month"
          footer="Across all organizations"
          metrics={[
            { label: 'Requests', value: formatNumber(stats?.aiUsageThisMonth?.requests) },
            { label: 'Tokens', value: formatNumber(stats?.aiUsageThisMonth?.tokens) },
          ]}
        />
        <GlassCard className="p-5">
          <div className="mb-4 flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-primary" />
            <h3 className="font-display font-semibold">Content</h3>
          </div>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-muted-foreground">Materials</p>
              <p className="font-display text-2xl font-bold">{formatNumber(stats?.content?.materials)}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Lessons</p>
              <p className="font-display text-2xl font-bold">{formatNumber(stats?.content?.lessons)}</p>
            </div>
          </div>
        </GlassCard>
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <GlassCard className="p-5">
          <h3 className="mb-4 font-display font-semibold">Users by role</h3>
          <ul className="space-y-2">
            {(stats?.users?.byRole ?? []).map((row) => (
              <li key={row.role} className="flex items-center justify-between rounded-lg border border-border/50 px-3 py-2 text-sm">
                <span>{row.role}</span>
                <span className="font-semibold tabular-nums">{formatNumber(row.count)}</span>
              </li>
            ))}
          </ul>
        </GlassCard>

        <GlassCard className="p-5">
          <h3 className="mb-4 font-display font-semibold">Plans</h3>
          <ul className="space-y-2">
            {(stats?.organizations?.byPlan ?? []).map((row) => (
              <li key={row.plan} className="flex items-center justify-between rounded-lg border border-border/50 px-3 py-2 text-sm">
                <span>{row.plan}</span>
                <span className="font-semibold tabular-nums">{formatNumber(row.count)}</span>
              </li>
            ))}
          </ul>
        </GlassCard>
      </div>

      <GlassCard className="mt-6 p-5">
        <div className="mb-4 flex items-center gap-2">
          <Activity className="h-5 w-5 text-primary" />
          <h3 className="font-display font-semibold">Service status</h3>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {(health.components ?? []).map((c) => (
            <div key={c.component} className="rounded-xl border border-border/50 p-3">
              <div className="flex items-center justify-between gap-2">
                <span className="text-sm font-medium">{c.component}</span>
                <AdesiaBadge status={statusVariant(c.status)}>{c.status}</AdesiaBadge>
              </div>
              <p className="mt-1 text-xs text-muted-foreground">{c.message}</p>
            </div>
          ))}
        </div>
      </GlassCard>
    </>
  );
};

export default DashboardPage;
