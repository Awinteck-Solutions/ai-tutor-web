import {
  Award,
  BookOpen,
  Brain,
  CheckCircle2,
  Circle,
  Flame,
  Layers,
  Lightbulb,
  MessageSquare,
  Sparkles,
  Target,
  Timer,
  TrendingUp,
  Trophy,
} from 'lucide-react';
import { Progress } from '@mantine/core';
import { AdesiaBadge } from './AdesiaBadge';
import { GlassCard } from './GlassCard';
import { formatDateTime, formatNumber } from '../utils/formatters';

const MILESTONE_ICONS = {
  'book-open': BookOpen,
  'check-circle': CheckCircle2,
  target: Target,
  trophy: Trophy,
  layers: Layers,
  brain: Brain,
  'message-square': MessageSquare,
  flame: Flame,
};

const MILESTONE_STATUS = {
  complete: {
    badge: 'active',
    label: 'Done',
    ring: 'border-emerald-500/40 bg-emerald-500/10',
    icon: 'text-emerald-600 dark:text-emerald-400',
    bar: 'bg-emerald-500',
  },
  in_progress: {
    badge: 'draft',
    label: 'In progress',
    ring: 'border-primary/40 bg-primary/10',
    icon: 'text-primary',
    bar: 'bg-primary',
  },
  not_started: {
    badge: 'ready',
    label: 'Not started',
    ring: 'border-border/60 bg-muted/30',
    icon: 'text-muted-foreground',
    bar: 'bg-muted-foreground/40',
  },
};

const CATEGORY_LABELS = {
  foundation: 'Foundation',
  practice: 'Practice',
  mastery: 'Mastery',
  engagement: 'Engagement',
};

const scoreTone = (value, good = 70, ok = 40) => {
  if (value >= good) return 'emerald';
  if (value >= ok) return 'amber';
  return 'rose';
};

const toneClasses = {
  emerald: 'border-emerald-500/30 bg-emerald-500/5',
  amber: 'border-amber-500/30 bg-amber-500/5',
  rose: 'border-rose-500/30 bg-rose-500/5',
  blue: 'border-blue-500/30 bg-blue-500/5',
  primary: 'border-primary/30 bg-primary/5',
  slate: 'border-border/50 bg-muted/20',
};

const MetricTile = ({ icon: Icon, label, value, sublabel, tone = 'slate' }) => (
  <div className={`min-w-0 rounded-xl border p-3 sm:p-4 ${toneClasses[tone] ?? toneClasses.slate}`}>
    <div className="flex items-start gap-3">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-background/80">
        <Icon className="h-4 w-4 text-primary" />
      </div>
      <div className="min-w-0">
        <p className="text-[10px] font-bold uppercase tracking-wide text-muted-foreground">{label}</p>
        <p className="mt-0.5 font-display text-lg font-bold tabular-nums text-foreground sm:text-xl">{value}</p>
        {sublabel && <p className="mt-0.5 text-xs text-muted-foreground">{sublabel}</p>}
      </div>
    </div>
  </div>
);

const BulletList = ({ items, tone = 'default' }) => {
  const dot = {
    default: 'bg-primary',
    emerald: 'bg-emerald-500',
    amber: 'bg-amber-500',
  }[tone] ?? 'bg-primary';

  return (
    <ul className="space-y-2.5">
      {(items ?? []).map((item) => (
        <li key={item} className="flex gap-2.5 text-sm leading-relaxed text-foreground">
          <span className={`mt-2 h-1.5 w-1.5 shrink-0 rounded-full ${dot}`} />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
};

const InstructionalMilestonesPanel = ({ milestones = [] }) => {
  if (!milestones.length) return null;

  const completed = milestones.filter((m) => m.status === 'complete').length;

  return (
    <GlassCard className="min-w-0 overflow-hidden p-4 sm:p-6">
      <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="flex items-center gap-2 font-display text-sm font-semibold text-foreground">
            <Sparkles className="h-4 w-4 text-primary" />
            Learning pathway
          </h3>
          <p className="mt-1 text-xs text-muted-foreground">
            Core instructional milestones for this report scope.
          </p>
        </div>
        <AdesiaBadge status="draft">
          {completed}/{milestones.length} complete
        </AdesiaBadge>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        {milestones.map((m) => {
          const style = MILESTONE_STATUS[m.status] ?? MILESTONE_STATUS.not_started;
          const Icon = MILESTONE_ICONS[m.icon] ?? Circle;
          return (
            <div
              key={m.id}
              className={`rounded-xl border p-3 sm:p-4 ${style.ring}`}
            >
              <div className="flex items-start gap-3">
                <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-background/70 ${style.icon}`}>
                  <Icon className="h-5 w-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-medium leading-snug text-foreground">{m.title}</p>
                    <AdesiaBadge status={style.badge}>{style.label}</AdesiaBadge>
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">{m.description}</p>
                  <p className="mt-1 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                    {CATEGORY_LABELS[m.category] ?? m.category}
                  </p>
                  <div className="mt-3">
                    <div className="mb-1 flex justify-between text-[11px] text-muted-foreground">
                      <span>Progress</span>
                      <span>{m.progressPercent}%</span>
                    </div>
                    <Progress value={m.progressPercent} size="sm" radius="xl" color={m.status === 'complete' ? 'teal' : undefined} />
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </GlassCard>
  );
};

const buildMetricTiles = (metrics) => {
  const scope = metrics.scope ?? 'overall';
  const quizTone = scoreTone(metrics.avgQuizScore ?? 0);
  const fcTone = scoreTone(metrics.flashcardAccuracy ?? 0);

  if (scope === 'lesson') {
    return [
      {
        icon: BookOpen,
        label: 'Lesson progress',
        value: `${metrics.lessonProgressPercent ?? 0}%`,
        sublabel: 'Reading & completion',
        tone: scoreTone(metrics.lessonProgressPercent ?? 0),
      },
      {
        icon: Target,
        label: 'Quiz average',
        value: metrics.quizzesTaken ? `${metrics.avgQuizScore}%` : '—',
        sublabel: metrics.quizzesTaken ? `${metrics.quizzesTaken} attempt${metrics.quizzesTaken === 1 ? '' : 's'}` : 'No quizzes yet',
        tone: metrics.quizzesTaken ? quizTone : 'slate',
      },
      {
        icon: Brain,
        label: 'Flashcard accuracy',
        value: metrics.flashcardsReviewed ? `${metrics.flashcardAccuracy}%` : '—',
        sublabel: metrics.flashcardsReviewed ? `${metrics.flashcardsReviewed} reviewed` : 'Not reviewed',
        tone: metrics.flashcardsReviewed ? fcTone : 'slate',
      },
      {
        icon: MessageSquare,
        label: 'Chat sessions',
        value: formatNumber(metrics.chatSessions),
        sublabel: `${formatNumber(metrics.chatMessages)} messages`,
        tone: metrics.chatSessions > 0 ? 'blue' : 'slate',
      },
      {
        icon: Sparkles,
        label: 'Cards due',
        value: formatNumber(metrics.flashcardsDue),
        sublabel: 'Needs review',
        tone: metrics.flashcardsDue > 0 ? 'amber' : 'emerald',
      },
      {
        icon: CheckCircle2,
        label: 'Quizzes passed',
        value: formatNumber(metrics.quizzesPassed),
        sublabel: 'Score 70% or higher',
        tone: metrics.quizzesPassed > 0 ? 'emerald' : 'slate',
      },
    ];
  }

  if (scope === 'subject') {
    return [
      {
        icon: BookOpen,
        label: 'Lessons in scope',
        value: formatNumber(metrics.lessonsStarted),
        sublabel: `${formatNumber(metrics.lessonsCompleted)} completed`,
        tone: metrics.lessonsCompleted > 0 ? 'emerald' : 'primary',
      },
      {
        icon: Target,
        label: 'Quiz average',
        value: metrics.quizzesTaken ? `${metrics.avgQuizScore}%` : '—',
        sublabel: `${formatNumber(metrics.quizzesTaken)} taken · ${formatNumber(metrics.quizzesPassed)} passed`,
        tone: metrics.quizzesTaken ? quizTone : 'slate',
      },
      {
        icon: Brain,
        label: 'Flashcard accuracy',
        value: metrics.flashcardsReviewed ? `${metrics.flashcardAccuracy}%` : '—',
        sublabel: `${formatNumber(metrics.flashcardsReviewed)} reviews`,
        tone: metrics.flashcardsReviewed ? fcTone : 'slate',
      },
      {
        icon: MessageSquare,
        label: 'Chat activity',
        value: formatNumber(metrics.chatSessions),
        sublabel: `${formatNumber(metrics.chatMessages)} messages`,
        tone: metrics.chatSessions > 0 ? 'blue' : 'slate',
      },
      {
        icon: Sparkles,
        label: 'Cards due',
        value: formatNumber(metrics.flashcardsDue),
        sublabel: 'In this subject',
        tone: metrics.flashcardsDue > 0 ? 'amber' : 'emerald',
      },
      {
        icon: Lightbulb,
        label: 'Focus areas',
        value: formatNumber(metrics.weakTopicsCount),
        sublabel: 'Topics to revisit',
        tone: metrics.weakTopicsCount > 0 ? 'amber' : 'emerald',
      },
    ];
  }

  return [
    {
      icon: BookOpen,
      label: 'Lessons started',
      value: formatNumber(metrics.lessonsStarted),
      sublabel: `${formatNumber(metrics.lessonsCompleted)} completed`,
      tone: 'primary',
    },
    {
      icon: Target,
      label: 'Quiz average',
      value: `${metrics.avgQuizScore ?? 0}%`,
      sublabel: `${formatNumber(metrics.quizzesTaken)} taken`,
      tone: quizTone,
    },
    {
      icon: Brain,
      label: 'Flashcard accuracy',
      value: `${metrics.flashcardAccuracy ?? 0}%`,
      sublabel: `${formatNumber(metrics.flashcardsReviewed)} reviewed`,
      tone: fcTone,
    },
    {
      icon: MessageSquare,
      label: 'Chat sessions',
      value: formatNumber(metrics.chatSessions),
      sublabel: `${formatNumber(metrics.chatMessages)} messages`,
      tone: metrics.chatSessions > 0 ? 'blue' : 'slate',
    },
    {
      icon: Timer,
      label: 'Study time',
      value: metrics.studyTimeMinutes != null ? `${formatNumber(metrics.studyTimeMinutes)}m` : '—',
      sublabel: 'Total logged',
      tone: 'slate',
    },
    {
      icon: TrendingUp,
      label: 'Streak',
      value: metrics.currentStreak != null ? formatNumber(metrics.currentStreak) : '—',
      sublabel: 'Days in a row',
      tone: (metrics.currentStreak ?? 0) >= 3 ? 'emerald' : 'amber',
    },
  ];
};

const SectionBlock = ({ title, icon: Icon, summary, highlights = [], accent = 'primary' }) => {
  const accents = {
    primary: 'from-primary/15 to-transparent border-primary/20',
    amber: 'from-amber-500/15 to-transparent border-amber-500/20',
    blue: 'from-blue-500/15 to-transparent border-blue-500/20',
    emerald: 'from-emerald-500/15 to-transparent border-emerald-500/20',
  };

  if (!summary && !highlights.length) return null;

  return (
    <GlassCard className={`min-w-0 overflow-hidden border bg-gradient-to-br p-4 sm:p-5 ${accents[accent] ?? accents.primary}`}>
      <h3 className="mb-3 flex items-center gap-2 font-display text-sm font-semibold text-foreground">
        {Icon && <Icon className="h-4 w-4 shrink-0 text-primary" />}
        {title}
      </h3>
      {summary && <p className="text-sm leading-relaxed text-muted-foreground">{summary}</p>}
      {highlights.length > 0 && (
        <ul className="mt-3 space-y-1.5">
          {highlights.map((item) => (
            <li key={item} className="flex gap-2 text-sm text-foreground">
              <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      )}
    </GlassCard>
  );
};

const scopeBadgeStatus = (scope) => {
  if (scope === 'lesson') return 'draft';
  if (scope === 'subject') return 'ready';
  return 'active';
};

const StudentAnalysisReportView = ({ report, compact = false }) => {
  if (!report) return null;

  const metrics = report.metrics ?? {};
  const sections = report.sections ?? {};
  const metricTiles = buildMetricTiles(metrics);
  const scope = metrics.scope ?? report.scope ?? 'overall';

  return (
    <div className="space-y-4">
      <GlassCard className="min-w-0 overflow-hidden border-primary/20 bg-gradient-to-br from-primary/10 via-background to-violet-500/5 p-4 sm:p-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <AdesiaBadge status={scopeBadgeStatus(scope)}>
                {report.scopeLabel ?? scope}
              </AdesiaBadge>
              {report.audience === 'student' && (
                <AdesiaBadge status="draft">Your report</AdesiaBadge>
              )}
            </div>
            <p className="mt-3 text-sm leading-relaxed text-foreground sm:text-base">{report.summary}</p>
          </div>
          <p className="shrink-0 text-xs text-muted-foreground">
            Updated {formatDateTime(report.generatedAt)}
          </p>
        </div>
      </GlassCard>

      {!compact && (
        <>
          <div className="grid grid-cols-2 gap-2.5 sm:gap-3 lg:grid-cols-3">
            {metricTiles.map((tile) => (
              <MetricTile key={tile.label} {...tile} />
            ))}
          </div>

          <InstructionalMilestonesPanel milestones={report.instructionalMilestones} />
        </>
      )}

      <div className="grid gap-4 lg:grid-cols-2">
        <GlassCard className={`min-w-0 p-4 sm:p-5 ${toneClasses.emerald}`}>
          <h3 className="flex items-center gap-2 font-display font-semibold text-emerald-700 dark:text-emerald-400">
            <Award className="h-4 w-4" />
            Strengths
          </h3>
          <div className="mt-3">
            <BulletList items={report.strengths} tone="emerald" />
          </div>
        </GlassCard>

        <GlassCard className={`min-w-0 p-4 sm:p-5 ${toneClasses.amber}`}>
          <h3 className="flex items-center gap-2 font-display font-semibold text-amber-700 dark:text-amber-400">
            <Lightbulb className="h-4 w-4" />
            Areas to improve
          </h3>
          <div className="mt-3">
            <BulletList items={report.weaknesses} tone="amber" />
          </div>
        </GlassCard>

        <GlassCard className={`min-w-0 p-4 sm:p-5 ${toneClasses.primary}`}>
          <h3 className="flex items-center gap-2 font-display font-semibold text-foreground">
            <Target className="h-4 w-4 text-primary" />
            Next steps
          </h3>
          <div className="mt-3">
            <BulletList items={report.recommendations} />
          </div>
        </GlassCard>

        <GlassCard className="min-w-0 p-4 sm:p-5">
          <h3 className="font-display font-semibold text-foreground">Engagement by activity</h3>
          <dl className="mt-4 space-y-3">
            {[
              { label: 'Quizzes', value: report.engagement?.quizPerformance, color: 'border-l-amber-500' },
              { label: 'Flashcards', value: report.engagement?.flashcardMastery, color: 'border-l-blue-500' },
              { label: 'AI chat', value: report.engagement?.chatEngagement, color: 'border-l-primary' },
              { label: 'Lessons', value: report.engagement?.lessonProgress, color: 'border-l-emerald-500' },
            ].map((row) => (
              <div key={row.label} className={`border-l-2 pl-3 ${row.color}`}>
                <dt className="text-[10px] font-bold uppercase tracking-wide text-muted-foreground">{row.label}</dt>
                <dd className="mt-1 text-sm leading-relaxed text-foreground">{row.value || '—'}</dd>
              </div>
            ))}
          </dl>
        </GlassCard>
      </div>

      {!compact && (
        <>
          <div className="grid gap-4 lg:grid-cols-2">
            <SectionBlock
              title="Quizzes"
              icon={Target}
              accent="amber"
              summary={sections.quizzes?.summary}
              highlights={sections.quizzes?.highlights}
            />
            <SectionBlock
              title="Flashcards"
              icon={Brain}
              accent="blue"
              summary={sections.flashcards?.summary}
              highlights={sections.flashcards?.highlights}
            />
            <SectionBlock
              title="AI chat"
              icon={MessageSquare}
              accent="primary"
              summary={sections.chat?.summary}
              highlights={sections.chat?.highlights}
            />
            <SectionBlock
              title="Lessons"
              icon={BookOpen}
              accent="emerald"
              summary={sections.lessons?.summary}
              highlights={sections.lessons?.highlights}
            />
          </div>

          {(report.subjectBreakdown?.length > 0 || report.lessonInsights?.length > 0) && (
            <GlassCard className="min-w-0 p-4 sm:p-6">
              <h3 className="font-display text-sm font-semibold text-foreground">
                {scope === 'lesson' ? 'Lesson insights' : 'Subject breakdown'}
              </h3>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                {(report.lessonInsights ?? report.subjectBreakdown ?? []).map((row) => (
                  <div
                    key={row.lesson ?? row.subject}
                    className="rounded-xl border border-border/50 bg-muted/20 p-3 sm:p-4"
                  >
                    <p className="font-medium leading-snug text-foreground">{row.lesson ?? row.subject}</p>
                    <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{row.insight}</p>
                  </div>
                ))}
              </div>
            </GlassCard>
          )}
        </>
      )}
    </div>
  );
};

export default StudentAnalysisReportView;
