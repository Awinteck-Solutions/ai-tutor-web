import { useEffect, useState } from 'react';
import { SimpleGrid, Skeleton } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { BarChart3 } from 'lucide-react';
import { useAuth } from '../../../shared/context/AuthContext';
import { PageHeader } from '../../../shared/components/PageShell';
import { EmptyOrgHint } from '../../../shared/components/PageLoader';
import { PageHeaderSkeleton } from '../../../shared/components/TableSkeleton';
import { GlassCard } from '../../../shared/components/GlassCard';
import { formatNumber, getErrorMessage } from '../../../shared/utils/formatters';
import { getAnalytics } from '../services/organization.services';

const labelize = (key) =>
  key
    .replace(/([A-Z])/g, ' $1')
    .replace(/^./, (s) => s.toUpperCase())
    .trim();

const AnalyticsPage = () => {
  const { organizationId } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!organizationId) { setLoading(false); return; }
    getAnalytics(organizationId)
      .then(setData)
      .catch((err) => notifications.show({ title: 'Error', message: getErrorMessage(err), color: 'red' }))
      .finally(() => setLoading(false));
  }, [organizationId]);

  if (!organizationId) return <EmptyOrgHint />;

  const stats = data || {};
  const scalarStats = Object.entries(stats).filter(([k]) => typeof stats[k] !== 'object');

  return (
    <>
      {loading ? <PageHeaderSkeleton /> : (
        <PageHeader
          title="Analytics"
          gradientWord="Analytics"
          description="Organization-wide learning insights and engagement metrics."
        />
      )}

      {loading ? (
        <SimpleGrid cols={{ base: 1, sm: 2, lg: 4 }} spacing="md">
          {Array.from({ length: 4 }).map((_, i) => (
            <GlassCard key={i} className="p-6">
              <Skeleton height={12} width="50%" mb="sm" />
              <Skeleton height={28} width="40%" />
            </GlassCard>
          ))}
        </SimpleGrid>
      ) : (
        <>
          <SimpleGrid cols={{ base: 1, sm: 2, lg: 4 }} spacing="md">
            {scalarStats.length ? scalarStats.map(([key, value]) => (
              <GlassCard key={key} className="p-6">
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  {labelize(key)}
                </p>
                <p className="mt-2 font-display text-2xl font-bold text-foreground">
                  {typeof value === 'number' ? formatNumber(value) : String(value ?? '—')}
                </p>
              </GlassCard>
            )) : (
              <GlassCard className="col-span-full flex flex-col items-center p-12 text-center">
                <BarChart3 className="mb-3 h-8 w-8 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">No analytics data available yet.</p>
              </GlassCard>
            )}
          </SimpleGrid>

          {stats.topSubjects && (
            <GlassCard className="mt-6 p-6">
              <h3 className="mb-4 font-display text-sm font-semibold">Top subjects</h3>
              <pre className="max-h-80 overflow-auto rounded-lg border border-border/50 bg-muted/30 p-4 text-xs">
                {JSON.stringify(stats.topSubjects, null, 2)}
              </pre>
            </GlassCard>
          )}
        </>
      )}
    </>
  );
};

export default AnalyticsPage;
