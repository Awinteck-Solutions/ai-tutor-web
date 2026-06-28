const variants = {
  ready: 'badge-success',
  success: 'badge-success',
  draft: 'badge-draft',
  due: 'badge-due',
  mastered: 'badge-success',
  processing: 'badge-processing',
  failed: 'badge-failed',
  active: 'badge-success',
  default: 'badge-draft',
};

export const AdesiaBadge = ({ status, children, className = '' }) => (
  <span className={`${variants[status?.toLowerCase()] || variants.default} ${className}`}>
    {children || status}
  </span>
);

/** Simple metric card */
export const StatCard = ({
  icon: Icon,
  label,
  value,
  sublabel,
  className = '',
  highlight = false,
}) => (
  <div
    className={`glass-card relative min-w-0 overflow-hidden p-3 sm:p-5 ${highlight ? 'border-primary/30' : ''} ${className}`}
  >
    {highlight && <div className="pointer-events-none absolute inset-0 bg-stat-shine" />}
    <div className="relative flex items-center gap-2.5 sm:items-start sm:gap-3">
      {Icon && (
        <div
          className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl sm:h-11 sm:w-11 ${
            highlight
              ? 'bg-primary text-primary-foreground shadow-glow-sm'
              : 'border border-border/60 bg-muted text-primary'
          }`}
        >
          <Icon className="h-4 w-4 sm:h-5 sm:w-5" />
        </div>
      )}
      <div className="min-w-0 flex-1">
        <p className="truncate text-[10px] font-bold uppercase tracking-[0.12em] text-muted-foreground">
          {label}
        </p>
        <p className="mt-0.5 truncate font-display text-lg font-bold tabular-nums text-foreground sm:mt-1 sm:text-2xl">
          {value ?? '—'}
        </p>
        {sublabel && (
          <p className="mt-0.5 truncate text-xs text-muted-foreground sm:mt-1">{sublabel}</p>
        )}
      </div>
    </div>
  </div>
);

/** Split metrics — ideal for AI usage (requests + tokens) */
export const MetricSplitCard = ({
  icon: Icon,
  label,
  metrics = [],
  footer,
  className = '',
}) => (
  <div className={`glass-card relative overflow-hidden ${className}`}>
    <div className="absolute left-0 top-0 h-full w-1 bg-gradient-cta" />
    <div className="relative border-b border-border/50 bg-muted/30 px-5 py-4">
      <div className="flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-glow-sm">
          {Icon && <Icon className="h-5 w-5" />}
        </div>
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-muted-foreground">
            {label}
          </p>
          {footer && <p className="text-xs text-muted-foreground">{footer}</p>}
        </div>
      </div>
    </div>
    <div className={`grid divide-border/50 ${metrics.length > 2 ? 'grid-cols-2 sm:grid-cols-3' : 'grid-cols-2'} divide-x`}>
      {metrics.map((m) => (
        <div key={m.label} className="px-4 py-4 sm:px-5">
          <p className="font-display text-2xl font-bold tabular-nums tracking-tight text-foreground sm:text-3xl">
            {m.value}
          </p>
          <p className="mt-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
            {m.label}
          </p>
          {m.hint && (
            <p className="mt-0.5 text-[10px] text-muted-foreground/80">{m.hint}</p>
          )}
        </div>
      ))}
    </div>
  </div>
);

export default AdesiaBadge;
