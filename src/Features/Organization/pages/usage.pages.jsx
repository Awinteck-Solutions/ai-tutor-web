import { useEffect, useState } from 'react';
import { notifications } from '@mantine/notifications';
import { BarChart3, Cpu, HardDrive, Zap } from 'lucide-react';
import { useAuth } from '../../../shared/context/AuthContext';
import { PageHeader } from '../../../shared/components/PageShell';
import { MetricSplitCard, StatCard } from '../../../shared/components/AdesiaBadge';
import { PageLoader, EmptyOrgHint } from '../../../shared/components/PageLoader';
import { GlassCard } from '../../../shared/components/GlassCard';
import { formatBytes, formatNumber, getErrorMessage } from '../../../shared/utils/formatters';
import { getUsage } from '../services/organization.services';

const UsagePage = () => {
  const { organizationId } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!organizationId) { setLoading(false); return; }
    getUsage(organizationId)
      .then(setData)
      .catch((err) => notifications.show({ title: 'Error', message: getErrorMessage(err), color: 'red' }))
      .finally(() => setLoading(false));
  }, [organizationId]);

  if (loading) return <PageLoader />;
  if (!organizationId) return <EmptyOrgHint />;

  return (
    <>
      <PageHeader
        title="Usage & billing"
        gradientWord="billing"
        description="AI tokens, requests, and storage consumption for your organization."
      />

      <div className="mb-6 grid gap-4 md:grid-cols-3">
        <StatCard icon={Zap} label="Token usage" value={formatNumber(data?.tokenUsage)} highlight />
        <StatCard icon={Cpu} label="AI requests" value={formatNumber(data?.aiRequests)} />
        <StatCard icon={HardDrive} label="Storage" value={formatBytes(data?.storageUsage?.totalBytes ?? data?.storageUsage)} />
      </div>

      {data?.breakdown?.length > 0 && (
        <GlassCard className="overflow-hidden">
          <div className="border-b border-border/50 px-5 py-4">
            <div className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4 text-primary" />
              <h3 className="font-display font-semibold text-foreground">Usage breakdown</h3>
            </div>
            <p className="mt-1 text-xs text-muted-foreground">By AI operation type this billing period</p>
          </div>
          <div className="overflow-x-auto">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Type</th>
                  <th>Requests</th>
                  <th>Tokens</th>
                </tr>
              </thead>
              <tbody>
                {data.breakdown.map((row) => (
                  <tr key={row._id}>
                    <td>
                      <span className="font-mono text-xs capitalize text-foreground">{row._id}</span>
                    </td>
                    <td className="tabular-nums">{formatNumber(row.requests ?? 0)}</td>
                    <td className="tabular-nums">{formatNumber(row.tokens ?? 0)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </GlassCard>
      )}

      {data?.plan && (
        <GlassCard className="mt-4 p-5">
          <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Current plan</p>
          <p className="mt-1 font-display text-lg font-bold">{data.plan}</p>
        </GlassCard>
      )}
    </>
  );
};

export default UsagePage;
