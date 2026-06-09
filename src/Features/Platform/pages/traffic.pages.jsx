import { useCallback, useEffect, useState } from 'react';
import { notifications } from '@mantine/notifications';
import { Globe2, MapPin } from 'lucide-react';
import { PageHeader } from '../../../shared/components/PageShell';
import { StatCard } from '../../../shared/components/AdesiaBadge';
import { PageLoader } from '../../../shared/components/PageLoader';
import { GlassCard } from '../../../shared/components/GlassCard';
import { formatNumber, formatDateTime, getErrorMessage } from '../../../shared/utils/formatters';
import { getPlatformTraffic, listPlatformVisits } from '../services/platform.services';

const TrafficPage = () => {
  const [traffic, setTraffic] = useState(null);
  const [visits, setVisits] = useState([]);
  const [loading, setLoading] = useState(true);

  const reload = useCallback(() => {
    setLoading(true);
    Promise.all([
      getPlatformTraffic(30),
      listPlatformVisits({ limit: 25, days: 30 }),
    ])
      .then(([trafficData, visitData]) => {
        setTraffic(trafficData);
        setVisits(visitData.items ?? []);
      })
      .catch((err) => notifications.show({ title: 'Traffic', message: getErrorMessage(err), color: 'red' }))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    reload();
  }, [reload]);

  if (loading) return <PageLoader />;

  return (
    <>
      <PageHeader
        title="Traffic &"
        gradientWord="geography"
        description="Page views, unique visitors, countries, and recent sessions."
      />

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard icon={Globe2} label="Total views (30d)" value={formatNumber(traffic?.totalVisits)} highlight />
        <StatCard icon={MapPin} label="Unique visitors" value={formatNumber(traffic?.uniqueVisitors)} sublabel="By IP address" />
        <StatCard icon={Globe2} label="Countries" value={formatNumber(traffic?.byCountry?.length)} />
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <GlassCard className="p-5">
          <h3 className="mb-4 font-display font-semibold">Top countries</h3>
          <ul className="space-y-2">
            {(traffic?.byCountry ?? []).slice(0, 12).map((row) => (
              <li key={row.country} className="flex items-center justify-between rounded-lg border border-border/50 px-3 py-2 text-sm">
                <span>{row.country}</span>
                <span className="font-semibold tabular-nums">{formatNumber(row.visits)}</span>
              </li>
            ))}
          </ul>
        </GlassCard>

        <GlassCard className="p-5">
          <h3 className="mb-4 font-display font-semibold">By portal</h3>
          <ul className="space-y-2">
            {(traffic?.byPortal ?? []).map((row) => (
              <li key={row.portal} className="flex items-center justify-between rounded-lg border border-border/50 px-3 py-2 text-sm">
                <span className="capitalize">{row.portal}</span>
                <span className="font-semibold tabular-nums">{formatNumber(row.visits)}</span>
              </li>
            ))}
          </ul>
        </GlassCard>
      </div>

      <GlassCard className="mt-6 overflow-hidden p-0">
        <div className="border-b border-border/50 px-5 py-4">
          <h3 className="font-display font-semibold">Recent visits</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-muted/40 text-xs uppercase text-muted-foreground">
              <tr>
                <th className="px-4 py-3">Time</th>
                <th className="px-4 py-3">Path</th>
                <th className="px-4 py-3">Country</th>
                <th className="px-4 py-3">IP</th>
                <th className="px-4 py-3">Portal</th>
              </tr>
            </thead>
            <tbody>
              {visits.map((v) => (
                <tr key={v.id} className="border-t border-border/40">
                  <td className="px-4 py-3 whitespace-nowrap text-muted-foreground">{formatDateTime(v.createdAt)}</td>
                  <td className="px-4 py-3 max-w-xs truncate">{v.path}</td>
                  <td className="px-4 py-3">{v.country ?? '—'}</td>
                  <td className="px-4 py-3 font-mono text-xs">{v.ipAddress ?? '—'}</td>
                  <td className="px-4 py-3 capitalize">{v.portal ?? '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </GlassCard>
    </>
  );
};

export default TrafficPage;
