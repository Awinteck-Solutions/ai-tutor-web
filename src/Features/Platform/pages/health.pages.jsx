import { useCallback, useEffect, useState } from 'react';
import { notifications } from '@mantine/notifications';
import { RefreshCw, Server } from 'lucide-react';
import { PageHeader } from '../../../shared/components/PageShell';
import { StatCard, AdesiaBadge } from '../../../shared/components/AdesiaBadge';
import { PageLoader } from '../../../shared/components/PageLoader';
import { GlassCard } from '../../../shared/components/GlassCard';
import { GradientButton } from '../../../shared/components/GradientButton';
import { formatDateTime, getErrorMessage } from '../../../shared/utils/formatters';
import { getPlatformHealth, runPlatformHealthCheck } from '../services/platform.services';

const statusVariant = (status) => {
  if (status === 'UP') return 'success';
  if (status === 'DEGRADED') return 'processing';
  return 'failed';
};

const formatUptime = (seconds) => {
  if (!seconds) return '—';
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  return `${h}h ${m}m`;
};

const HealthPage = () => {
  const [health, setHealth] = useState(null);
  const [loading, setLoading] = useState(true);
  const [checking, setChecking] = useState(false);

  const reload = useCallback(() => {
    setLoading(true);
    getPlatformHealth(24)
      .then(setHealth)
      .catch((err) => notifications.show({ title: 'Health', message: getErrorMessage(err), color: 'red' }))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    reload();
  }, [reload]);

  const handleCheck = async () => {
    setChecking(true);
    try {
      const data = await runPlatformHealthCheck();
      setHealth(data);
      notifications.show({ title: 'Health', message: 'Checks completed', color: 'green' });
    } catch (err) {
      notifications.show({ title: 'Health', message: getErrorMessage(err), color: 'red' });
    } finally {
      setChecking(false);
    }
  };

  if (loading) return <PageLoader />;

  return (
    <>
      <PageHeader
        title="System"
        gradientWord="health"
        description="API, database, Redis, Qdrant, and AI provider uptime over the last 24 hours."
        action={(
          <GradientButton type="button" onClick={handleCheck} disabled={checking} className="!px-3 !py-2">
            <RefreshCw className={`h-4 w-4 ${checking ? 'animate-spin' : ''}`} />
            Run checks
          </GradientButton>
        )}
      />

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard icon={Server} label="Overall status" value={health?.overallStatus ?? '—'} highlight />
        <StatCard icon={Server} label="API uptime (24h)" value={`${health?.apiUptimePercent ?? 0}%`} />
        <StatCard icon={Server} label="Process uptime" value={formatUptime(health?.processUptimeSeconds)} />
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {(health?.latest ?? []).map((c) => {
          const uptime = health?.uptimeByComponent?.find((u) => u.component === c.component);
          return (
            <GlassCard key={c.component} className="p-5">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h3 className="font-display font-semibold">{c.component}</h3>
                  <p className="mt-1 text-xs text-muted-foreground">{c.message}</p>
                </div>
                <AdesiaBadge status={statusVariant(c.status)}>{c.status}</AdesiaBadge>
              </div>
              <div className="mt-4 flex items-center justify-between text-xs text-muted-foreground">
                <span>{uptime ? `${uptime.uptimePercent}% uptime (${uptime.samples} checks)` : 'No samples'}</span>
                <span>{c.latencyMs != null ? `${c.latencyMs}ms` : ''}</span>
              </div>
              {c.checkedAt && (
                <p className="mt-2 text-[11px] text-muted-foreground">
                  Last check: {formatDateTime(c.checkedAt)}
                </p>
              )}
            </GlassCard>
          );
        })}
      </div>

      <GlassCard className="mt-6 overflow-hidden p-0">
        <div className="border-b border-border/50 px-5 py-4">
          <h3 className="font-display font-semibold">Recent check history</h3>
        </div>
        <div className="max-h-96 overflow-y-auto">
          <table className="w-full text-left text-sm">
            <thead className="sticky top-0 bg-muted/40 text-xs uppercase text-muted-foreground">
              <tr>
                <th className="px-4 py-3">Time</th>
                <th className="px-4 py-3">Component</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Latency</th>
                <th className="px-4 py-3">Message</th>
              </tr>
            </thead>
            <tbody>
              {(health?.history ?? []).slice(0, 50).map((h) => (
                <tr key={h.id} className="border-t border-border/40">
                  <td className="px-4 py-3 whitespace-nowrap text-muted-foreground">{formatDateTime(h.createdAt)}</td>
                  <td className="px-4 py-3">{h.component}</td>
                  <td className="px-4 py-3"><AdesiaBadge status={statusVariant(h.status)}>{h.status}</AdesiaBadge></td>
                  <td className="px-4 py-3">{h.latencyMs != null ? `${h.latencyMs}ms` : '—'}</td>
                  <td className="px-4 py-3 text-muted-foreground">{h.message}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </GlassCard>
    </>
  );
};

export default HealthPage;
