import { useEffect, useState } from 'react';
import { notifications } from '@mantine/notifications';
import {
  Award,
  BookOpen,
  Brain,
  Flame,
  Footprints,
  Layers,
  Sparkles,
  Target,
  Trophy,
  Zap,
} from 'lucide-react';
import { useAuth } from '../../../shared/context/AuthContext';
import { PageHeader } from '../../../shared/components/PageShell';
import { PageHeaderSkeleton } from '../../../shared/components/TableSkeleton';
import { GlassCard } from '../../../shared/components/GlassCard';
import { formatNumber, getErrorMessage } from '../../../shared/utils/formatters';
import { getMilestones } from '../services/student.services';

const ICONS = {
  footprints: Footprints,
  target: Target,
  layers: Layers,
  'book-open': BookOpen,
  flame: Flame,
  zap: Zap,
  brain: Brain,
  sparkles: Sparkles,
  trophy: Trophy,
};

const TIER_STYLES = {
  bronze: {
    ring: 'from-amber-700/80 to-amber-900/60',
    glow: 'shadow-amber-900/30',
    label: 'Bronze',
    text: 'text-amber-800 dark:text-amber-200',
  },
  silver: {
    ring: 'from-slate-300/90 to-slate-500/70',
    glow: 'shadow-slate-500/25',
    label: 'Silver',
    text: 'text-slate-600 dark:text-slate-300',
  },
  gold: {
    ring: 'from-yellow-400/90 to-amber-600/70',
    glow: 'shadow-amber-500/35',
    label: 'Gold',
    text: 'text-yellow-700 dark:text-yellow-300',
  },
  platinum: {
    ring: 'from-cyan-300/90 to-indigo-500/70',
    glow: 'shadow-cyan-500/30',
    label: 'Platinum',
    text: 'text-cyan-700 dark:text-cyan-300',
  },
  diamond: {
    ring: 'from-violet-400/90 to-fuchsia-600/70',
    glow: 'shadow-violet-500/35',
    label: 'Diamond',
    text: 'text-violet-700 dark:text-violet-300',
  },
};

const MilestoneNode = ({ milestone, isLast }) => {
  const style = TIER_STYLES[milestone.tier] ?? TIER_STYLES.bronze;
  const Icon = ICONS[milestone.icon] ?? Award;
  const complete = milestone.complete;

  return (
    <li className="relative flex gap-6 pb-10">
      {!isLast && (
        <span
          className={`absolute left-[1.65rem] top-14 h-[calc(100%-2rem)] w-0.5 ${
            complete ? 'bg-primary/40' : 'bg-border'
          }`}
          aria-hidden
        />
      )}
      <div
        className={`relative z-10 flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-gradient-to-br ${style.ring} shadow-lg ${style.glow} ${
          complete ? '' : 'opacity-60 grayscale-[0.35]'
        }`}
      >
        <Icon className="h-6 w-6 text-white drop-shadow" />
        {complete && (
          <span className="absolute -right-0.5 -top-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500 text-[10px] font-bold text-white">
            ✓
          </span>
        )}
      </div>
      <GlassCard
        className={`min-w-0 flex-1 p-5 transition ${
          complete ? 'border-primary/25 bg-primary/5' : ''
        }`}
      >
        <div className="mb-1 flex flex-wrap items-center gap-2">
          <span className={`text-xs font-semibold uppercase tracking-wider ${style.text}`}>
            {style.label}
          </span>
          {complete && (
            <span className="rounded-full bg-emerald-500/15 px-2 py-0.5 text-xs font-medium text-emerald-600 dark:text-emerald-400">
              Complete
            </span>
          )}
        </div>
        <h3 className="font-display text-lg font-semibold text-foreground">{milestone.title}</h3>
        <p className="mt-1 text-sm text-muted-foreground">{milestone.description}</p>
        <div className="mt-4">
          <div className="mb-1 flex justify-between text-xs text-muted-foreground">
            <span>
              {formatNumber(milestone.current)}
              {' '}
              /
              {' '}
              {formatNumber(milestone.target)}
            </span>
            <span>
              {milestone.progressPercent}
              %
            </span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-muted">
            <div
              className={`h-full rounded-full transition-all duration-700 ${
                complete
                  ? 'bg-gradient-to-r from-primary to-emerald-500'
                  : 'bg-gradient-to-r from-primary/70 to-primary'
              }`}
              style={{ width: `${milestone.progressPercent}%` }}
            />
          </div>
        </div>
      </GlassCard>
    </li>
  );
};

const StudentMilestonesPage = () => {
  const { organizationId } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!organizationId) {
      setLoading(false);
      return;
    }
    getMilestones(organizationId)
      .then(setData)
      .catch((err) => notifications.show({ title: 'Error', message: getErrorMessage(err), color: 'red' }))
      .finally(() => setLoading(false));
  }, [organizationId]);

  if (loading) return <PageHeaderSkeleton />;

  const summary = data?.summary;
  const milestones = data?.milestones ?? [];

  return (
    <>
      <PageHeader
        title="Learning milestones"
        gradientWord="Milestones"
        description="Your journey from first steps to mastery — every badge marks real progress."
      />

      {summary && (
        <div className="mb-8 overflow-hidden rounded-2xl border border-primary/20 bg-gradient-to-br from-primary/10 via-background to-violet-500/10 p-6 md:p-8">
          <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-sm font-medium uppercase tracking-wider text-primary">Overall progress</p>
              <p className="mt-1 font-display text-4xl font-bold text-foreground md:text-5xl">
                {summary.overallPercent}
                <span className="text-2xl text-muted-foreground">%</span>
              </p>
              <p className="mt-2 text-muted-foreground">
                {summary.completed}
                {' '}
                of
                {' '}
                {summary.total}
                {' '}
                milestones unlocked
              </p>
              {summary.nextMilestone && (
                <p className="mt-3 text-sm">
                  Next up:
                  {' '}
                  <strong className="text-foreground">{summary.nextMilestone.title}</strong>
                  {' '}
                  (
                  {summary.nextMilestone.progressPercent}
                  %)
                </p>
              )}
            </div>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-5">
              {(summary.tierProgress ?? []).map((t) => {
                const style = TIER_STYLES[t.tier] ?? TIER_STYLES.bronze;
                return (
                  <div
                    key={t.tier}
                    className="rounded-xl border border-border/50 bg-background/60 px-3 py-3 text-center backdrop-blur"
                  >
                    <p className={`text-xs font-semibold uppercase ${style.text}`}>{style.label}</p>
                    <p className="mt-1 font-display text-xl font-bold text-foreground">
                      {t.completed}
                      /
                      {t.total}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      <div className="relative">
        <ul className="list-none p-0">
          {milestones.map((m, i) => (
            <MilestoneNode
              key={m.id}
              milestone={m}
              isLast={i === milestones.length - 1}
            />
          ))}
        </ul>
      </div>

      {milestones.length === 0 && (
        <GlassCard className="p-8 text-center text-muted-foreground">
          <Trophy className="mx-auto mb-3 h-10 w-10 opacity-40" />
          Start learning to unlock your first milestone.
        </GlassCard>
      )}
    </>
  );
};

export default StudentMilestonesPage;
