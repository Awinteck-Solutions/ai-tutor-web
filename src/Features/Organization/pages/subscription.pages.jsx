import { useEffect, useState } from 'react';
import { notifications } from '@mantine/notifications';
import { CheckCircle2, CreditCard, Sparkles } from 'lucide-react';
import { useAuth } from '../../../shared/context/AuthContext';
import { PageHeader } from '../../../shared/components/PageShell';
import { AdesiaBadge } from '../../../shared/components/AdesiaBadge';
import { PageLoader, EmptyOrgHint } from '../../../shared/components/PageLoader';
import { GlassCard } from '../../../shared/components/GlassCard';
import { getErrorMessage } from '../../../shared/utils/formatters';
import { getSubscription } from '../services/organization.services';

const SubscriptionPage = () => {
  const { organizationId } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!organizationId) { setLoading(false); return; }
    getSubscription(organizationId)
      .then(setData)
      .catch((err) => notifications.show({ title: 'Error', message: getErrorMessage(err), color: 'red' }))
      .finally(() => setLoading(false));
  }, [organizationId]);

  if (loading) return <PageLoader />;
  if (!organizationId) return <EmptyOrgHint />;

  return (
    <>
      <PageHeader
        title="Subscription"
        gradientWord="Subscription"
        description="Plan details, billing readiness, and included features."
      />

      <div className="grid gap-4 md:grid-cols-2">
        <GlassCard className="relative overflow-hidden p-6">
          <div className="pointer-events-none absolute -right-8 -top-8 h-32 w-32 rounded-full bg-primary/10 blur-2xl" />
          <div className="relative flex items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-glow-sm">
              <CreditCard className="h-6 w-6" />
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Plan</p>
              <p className="mt-1 font-display text-2xl font-bold text-foreground">{data?.plan || '—'}</p>
              <div className="mt-3">
                <AdesiaBadge status={data?.status === 'ACTIVE' ? 'active' : 'draft'}>
                  {data?.status || 'Unknown'}
                </AdesiaBadge>
              </div>
            </div>
          </div>
        </GlassCard>

        <GlassCard className="p-6">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-border bg-muted text-primary">
              <Sparkles className="h-6 w-6" />
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Billing</p>
              <p className="mt-2 text-sm text-foreground">
                {data?.billingReady
                  ? 'Billing is configured for your organization.'
                  : 'Billing not yet configured — V1 preview mode.'}
              </p>
            </div>
          </div>
        </GlassCard>
      </div>

      {data?.features && (
        <GlassCard className="mt-6 overflow-hidden">
          <div className="border-b border-border/50 px-5 py-4">
            <h3 className="font-display font-semibold">Included features</h3>
          </div>
          <div className="grid gap-3 p-5 sm:grid-cols-2">
            {Object.entries(data.features).map(([key, enabled]) => (
              <div
                key={key}
                className={`flex items-center gap-3 rounded-xl border px-4 py-3 ${
                  enabled
                    ? 'border-primary/30 bg-primary/5'
                    : 'border-border/50 bg-muted/30 opacity-60'
                }`}
              >
                <CheckCircle2 className={`h-4 w-4 shrink-0 ${enabled ? 'text-primary' : 'text-muted-foreground'}`} />
                <span className="text-sm capitalize text-foreground">
                  {key.replace(/([A-Z])/g, ' $1').trim()}
                </span>
              </div>
            ))}
          </div>
        </GlassCard>
      )}
    </>
  );
};

export default SubscriptionPage;
