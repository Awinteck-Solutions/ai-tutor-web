import { useEffect, useMemo, useState } from 'react';
import { Progress } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { CheckCircle2, CreditCard, Lock, Sparkles } from 'lucide-react';
import { useAuth } from '../../../shared/context/AuthContext';
import { PageHeader } from '../../../shared/components/PageShell';
import { EmptyOrgHint } from '../../../shared/components/PageLoader';
import { StudentSettingsSkeleton } from '../components/StudentPageSkeleton';
import { GlassCard } from '../../../shared/components/GlassCard';
import { AdesiaBadge } from '../../../shared/components/AdesiaBadge';
import { formatBytes, getErrorMessage } from '../../../shared/utils/formatters';
import { getSubscription } from '../services/student.services';

const pct = (used, limit) => {
  if (!limit || limit <= 0) return 0;
  return Math.min(100, Math.round((used / limit) * 100));
};

const UsageMeter = ({ label, used, limit, formatValue }) => {
  const value = pct(used, limit);
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-2 text-sm">
        <span className="text-muted-foreground">{label}</span>
        <span className="font-medium tabular-nums text-foreground">
          {formatValue ? formatValue(used, limit) : `${used} / ${limit}`}
        </span>
      </div>
      <Progress value={value} size="sm" radius="xl" />
    </div>
  );
};

const StudentSubscriptionPage = () => {
  const { organizationId } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!organizationId) {
      setLoading(false);
      return undefined;
    }
    getSubscription(organizationId)
      .then(setData)
      .catch((err) => {
        notifications.show({ title: 'Error', message: getErrorMessage(err), color: 'red' });
      })
      .finally(() => setLoading(false));
    return undefined;
  }, [organizationId]);

  const limits = data?.limits;
  const usage = data?.usage ?? {};
  const packages = data?.packages ?? [];

  const currentPlan = useMemo(
    () => packages.find((p) => p.id === data?.plan) ?? packages[0],
    [packages, data?.plan],
  );

  if (loading) return <StudentSettingsSkeleton />;
  if (!organizationId) return <EmptyOrgHint />;

  return (
    <>
      <PageHeader
        title="Subscription"
        gradientWord="Subscription"
        description="Your plan, usage limits, and upgrade options."
      />

      <div className="mb-8 grid min-w-0 gap-4 sm:gap-6 lg:grid-cols-3">
        <GlassCard className="relative min-w-0 overflow-hidden p-4 sm:p-6 lg:col-span-1">
          <div className="pointer-events-none absolute -right-8 -top-8 h-32 w-32 rounded-full bg-primary/10 blur-2xl" />
          <div className="relative flex items-start gap-3 sm:gap-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-glow-sm sm:h-12 sm:w-12">
              <CreditCard className="h-5 w-5 sm:h-6 sm:w-6" />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Current plan</p>
              <p className="mt-1 font-display text-2xl font-bold text-foreground">{currentPlan?.name ?? data?.plan ?? 'Free'}</p>
              <p className="mt-1 text-sm text-muted-foreground">{currentPlan?.priceLabel ?? '$0 / month'}</p>
              <div className="mt-3 flex flex-wrap gap-2">
                <AdesiaBadge status="active">Active</AdesiaBadge>
                {data?.isPersonalWorkspace && (
                  <AdesiaBadge status="draft">Personal workspace</AdesiaBadge>
                )}
              </div>
            </div>
          </div>
        </GlassCard>

        {data?.applyFreeLimits && limits && (
          <GlassCard className="min-w-0 p-4 sm:p-6 lg:col-span-2">
            <h3 className="mb-4 font-display text-sm font-semibold text-foreground sm:mb-5">Free plan usage</h3>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5">
              <UsageMeter
                label="Storage"
                used={usage.storageBytes ?? 0}
                limit={limits.storageBytes}
                formatValue={(u, l) => `${formatBytes(u)} / ${formatBytes(l)}`}
              />
              <UsageMeter
                label="Lessons today"
                used={usage.lessonsToday ?? 0}
                limit={limits.lessonsPerDay}
              />
              <UsageMeter
                label="Uploads today"
                used={usage.materialsToday ?? 0}
                limit={limits.materialsPerDay}
              />
              <UsageMeter
                label="AI chat today"
                used={usage.chatMessagesToday ?? 0}
                limit={limits.chatMessagesPerDay}
              />
              <UsageMeter
                label="Quiz & flashcard gens today"
                used={usage.practiceGenerationsToday ?? 0}
                limit={limits.practiceGenerationsPerDay}
              />
              <UsageMeter
                label="Monthly AI requests"
                used={usage.monthlyAiRequests ?? 0}
                limit={limits.monthlyAiRequests}
              />
            </div>
          </GlassCard>
        )}
      </div>

      <GlassCard className="mb-8 p-4 sm:p-6">
        <div className="mb-4 flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-primary" />
          <h3 className="font-display text-sm font-semibold text-foreground">All plans</h3>
        </div>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 xl:grid-cols-4">
          {packages.map((pkg) => {
            const isCurrent = pkg.id === data?.plan;
            return (
              <div
                key={pkg.id}
                className={`relative flex min-w-0 flex-col rounded-2xl border p-4 sm:p-5 ${
                  isCurrent
                    ? 'border-primary/40 bg-primary/5 shadow-glow-sm'
                    : 'border-border/60 bg-muted/20'
                } ${pkg.comingSoon ? 'opacity-90' : ''}`}
              >
                {pkg.comingSoon && (
                  <span className="absolute right-3 top-3 inline-flex items-center gap-1 rounded-full border border-border bg-card px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                    <Lock className="h-3 w-3" />
                    Coming soon
                  </span>
                )}
                {isCurrent && !pkg.comingSoon && (
                  <span className="absolute right-3 top-3 text-[10px] font-semibold uppercase tracking-wide text-primary">
                    Current
                  </span>
                )}
                <p className="font-display text-lg font-semibold text-foreground">{pkg.name}</p>
                <p className="mt-1 text-xs text-muted-foreground">{pkg.tagline}</p>
                <p className="mt-3 text-sm font-medium text-foreground">{pkg.priceLabel}</p>
                <ul className="mt-4 flex-1 space-y-2">
                  {(pkg.highlights ?? []).map((item) => (
                    <li key={item} className="flex items-start gap-2 text-xs text-muted-foreground">
                      <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>
        <p className="mt-5 text-xs text-muted-foreground">
          Paid upgrades are not available yet. Limits reset daily (lessons, uploads, chat) or monthly (AI requests).
        </p>
      </GlassCard>
    </>
  );
};

export default StudentSubscriptionPage;
