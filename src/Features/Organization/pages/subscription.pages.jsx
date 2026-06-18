import { useEffect, useState } from 'react';
import { notifications } from '@mantine/notifications';
import { CheckCircle2, CreditCard, ExternalLink, Sparkles } from 'lucide-react';
import { useAuth } from '../../../shared/context/AuthContext';
import { PageHeader } from '../../../shared/components/PageShell';
import { AdesiaBadge } from '../../../shared/components/AdesiaBadge';
import { PageLoader, EmptyOrgHint } from '../../../shared/components/PageLoader';
import { GlassCard } from '../../../shared/components/GlassCard';
import { GradientButton } from '../../../shared/components/GradientButton';
import { formatDateTime, getErrorMessage } from '../../../shared/utils/formatters';
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

  const unpaid = (data?.invoices ?? []).filter((inv) => inv.status === 'SENT' || inv.status === 'DRAFT');

  return (
    <>
      <PageHeader title="Subscription" gradientWord="Subscription" description="Plan details, invoices, and online payment." />

      <div className="grid gap-4 md:grid-cols-2">
        <GlassCard className="relative overflow-hidden p-6">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary text-primary-foreground">
              <CreditCard className="h-6 w-6" />
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Plan</p>
              <p className="mt-1 font-display text-2xl font-bold">{data?.plan || '—'}</p>
              <AdesiaBadge status={data?.status === 'ACTIVE' ? 'active' : 'draft'} className="mt-3">{data?.status || 'Unknown'}</AdesiaBadge>
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
              <p className="mt-2 text-sm">
                {data?.billingReady
                  ? `Payments via ${data.paymentConfig?.stripeEnabled ? 'Stripe' : ''}${data.paymentConfig?.stripeEnabled && data.paymentConfig?.paystackEnabled ? ' & ' : ''}${data.paymentConfig?.paystackEnabled ? 'Paystack' : ''}`
                  : 'Billing not configured — contact platform admin.'}
              </p>
            </div>
          </div>
        </GlassCard>
      </div>

      {unpaid.length > 0 && (
        <GlassCard className="mt-6 overflow-hidden">
          <div className="border-b border-border/50 px-5 py-4">
            <h3 className="font-display font-semibold">Outstanding invoices</h3>
          </div>
          <div className="divide-y divide-border/40">
            {unpaid.map((inv) => (
              <div key={inv.id} className="flex flex-wrap items-center justify-between gap-4 px-5 py-4">
                <div>
                  <p className="font-medium">{inv.invoiceNumber}</p>
                  <p className="text-sm text-muted-foreground">{inv.description}</p>
                  <p className="text-sm">{inv.currency} {inv.amount} · Due {inv.dueDate ? formatDateTime(inv.dueDate) : '—'}</p>
                </div>
                {inv.paymentLink ? (
                  <a href={inv.paymentLink} target="_blank" rel="noreferrer">
                    <GradientButton type="button" className="inline-flex items-center gap-2">
                      Pay now <ExternalLink className="h-4 w-4" />
                    </GradientButton>
                  </a>
                ) : (
                  <AdesiaBadge status="draft">Awaiting payment link</AdesiaBadge>
                )}
              </div>
            ))}
          </div>
        </GlassCard>
      )}

      {(data?.invoices ?? []).length > 0 && (
        <GlassCard className="mt-6 overflow-hidden">
          <div className="border-b border-border/50 px-5 py-4"><h3 className="font-display font-semibold">Invoice history</h3></div>
          <table className="w-full text-left text-sm">
            <tbody>
              {data.invoices.map((inv) => (
                <tr key={inv.id} className="border-t border-border/40">
                  <td className="px-5 py-3">{inv.invoiceNumber}</td>
                  <td className="px-5 py-3">{inv.currency} {inv.amount}</td>
                  <td className="px-5 py-3"><AdesiaBadge status={inv.status === 'PAID' ? 'success' : 'draft'}>{inv.status}</AdesiaBadge></td>
                  <td className="px-5 py-3 text-muted-foreground">{formatDateTime(inv.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </GlassCard>
      )}

      {data?.features && (
        <GlassCard className="mt-6 overflow-hidden">
          <div className="border-b border-border/50 px-5 py-4"><h3 className="font-display font-semibold">Included features</h3></div>
          <div className="grid gap-3 p-5 sm:grid-cols-2">
            {Object.entries(data.features).map(([key, enabled]) => (
              <div key={key} className={`flex items-center gap-3 rounded-xl border px-4 py-3 ${enabled ? 'border-primary/30 bg-primary/5' : 'opacity-60'}`}>
                <CheckCircle2 className={`h-4 w-4 ${enabled ? 'text-primary' : 'text-muted-foreground'}`} />
                <span className="text-sm capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</span>
              </div>
            ))}
          </div>
        </GlassCard>
      )}
    </>
  );
};

export default SubscriptionPage;
