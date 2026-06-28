import { Skeleton } from '@mantine/core';

export function ContentFadeIn({ children, className = '' }) {
  return (
    <div className={`content-fade-in ${className}`.trim()}>
      {children}
    </div>
  );
}

export function ShimmerBlock({ className = '', height = 14 }) {
  return (
    <div
      className={`animate-shimmer-slide rounded-md bg-gradient-to-r from-muted/40 via-muted/70 to-muted/40 bg-[length:200%_100%] ${className}`}
      style={{ height }}
    />
  );
}

export function ConceptMapSkeleton({ compact = false }) {
  return (
    <div className="space-y-6 animate-content-fade-in">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="space-y-2">
          <Skeleton height={18} width={160} radius="sm" />
          <Skeleton height={12} width={280} radius="sm" />
        </div>
        <div className="flex gap-2">
          <Skeleton height={52} width={96} radius="xl" />
          <Skeleton height={52} width={96} radius="xl" />
        </div>
      </div>
      <div
        className={`relative overflow-hidden rounded-2xl border border-border/50 bg-gradient-to-br from-primary/5 via-card/80 to-violet-500/5 ${
          compact ? 'h-[260px]' : 'h-[440px]'
        }`}
      >
        <div className="absolute inset-x-0 top-16 flex justify-center gap-8 px-8">
          {Array.from({ length: 4 }).map((_, index) => (
            <Skeleton key={index} height={compact ? 44 : 52} width={compact ? 108 : 124} radius="xl" />
          ))}
        </div>
        <div className="absolute inset-x-0 bottom-16 flex justify-center gap-10 px-8">
          {Array.from({ length: 3 }).map((_, index) => (
            <Skeleton key={index} height={compact ? 56 : 68} width={compact ? 56 : 68} radius="9999px" />
          ))}
        </div>
        <div className="absolute inset-x-12 top-[calc(50%-1px)] h-0.5 bg-primary/15" />
      </div>
    </div>
  );
}

export function LessonPreviewSkeleton() {
  return (
    <div className="space-y-6">
      <div className="mb-8 flex flex-wrap items-start justify-between gap-4">
        <div className="space-y-2">
          <Skeleton height={32} width={280} radius="sm" />
          <Skeleton height={14} width={420} radius="sm" />
        </div>
        <Skeleton height={40} width={140} radius="md" />
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index} className="glass-card p-4">
            <Skeleton height={12} width={80} radius="sm" mb={8} />
            <Skeleton height={22} width={48} radius="sm" />
          </div>
        ))}
      </div>

      <div className="glass-card p-2">
        <div className="mb-4 flex gap-2 overflow-x-auto px-2 pt-2">
          {Array.from({ length: 5 }).map((_, index) => (
            <Skeleton key={index} height={36} width={110} radius="md" />
          ))}
        </div>
        <div className="space-y-3 p-4">
          <Skeleton height={16} width="40%" radius="sm" />
          <Skeleton height={12} width="100%" radius="sm" />
          <Skeleton height={12} width="96%" radius="sm" />
          <Skeleton height={12} width="88%" radius="sm" />
          <Skeleton height={180} width="100%" radius="lg" mt={12} />
        </div>
      </div>
    </div>
  );
}

export function MaterialPreviewSkeleton() {
  return (
    <div className="space-y-6 animate-content-fade-in">
      <div className="mb-8 flex flex-wrap items-start justify-between gap-4">
        <div className="space-y-2">
          <Skeleton height={32} width={240} radius="sm" />
          <Skeleton height={14} width={360} radius="sm" />
        </div>
        <Skeleton height={40} width={120} radius="md" />
      </div>
      <div className="glass-card p-5 space-y-3">
        <Skeleton height={14} width="30%" radius="sm" />
        <Skeleton height={12} width="100%" radius="sm" />
        <Skeleton height={12} width="94%" radius="sm" />
        <Skeleton height={12} width="90%" radius="sm" />
        <Skeleton height={220} width="100%" radius="lg" mt={8} />
      </div>
    </div>
  );
}

export function SelfLearnHomeSkeleton() {
  return (
    <div className="space-y-6">
      <div className="mb-8 flex flex-wrap items-start justify-between gap-4">
        <div className="space-y-2">
          <Skeleton height={32} width={220} radius="sm" />
          <Skeleton height={14} width={380} radius="sm" />
        </div>
      </div>
      <div className="mb-6 flex flex-col gap-3 sm:flex-row">
        <Skeleton height={44} radius="xl" className="flex-1" />
        <Skeleton height={44} radius="xl" className="flex-1" />
      </div>
      <Skeleton height={44} radius="md" mb={4} />
      <div className="grid min-w-0 gap-6 lg:grid-cols-[minmax(240px,280px)_1fr]">
        <div className="glass-card hidden space-y-3 p-4 lg:block">
          <Skeleton height={14} width={120} radius="sm" />
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} height={36} radius="md" />
          ))}
        </div>
        <div className="min-w-0 space-y-3">
          <Skeleton height={40} radius="md" />
          <div className="rounded-xl border border-border/50 p-3">
            <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {Array.from({ length: 6 }).map((_, i) => (
                <li key={i} className="rounded-xl border border-border/50 p-4">
                  <div className="flex items-center gap-3">
                    <Skeleton height={40} width={40} radius="md" />
                    <div className="min-w-0 flex-1 space-y-2">
                      <Skeleton height={14} width="80%" radius="sm" />
                      <Skeleton height={10} width="50%" radius="sm" />
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

export function SelfLearnLessonsListSkeleton() {
  return (
    <div className="rounded-xl border border-border/50 bg-card/40 p-3">
      <ul className="grid min-w-0 grid-cols-1 gap-3 sm:grid-cols-2">
        {Array.from({ length: 6 }).map((_, i) => (
          <li key={i} className="rounded-xl border border-border/50 p-4">
            <div className="flex items-center gap-3">
              <Skeleton height={40} width={40} radius="md" />
              <div className="min-w-0 flex-1 space-y-2">
                <Skeleton height={14} width="80%" radius="sm" />
                <Skeleton height={10} width="50%" radius="sm" />
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function SelfLearnDetailSkeleton() {
  return (
    <div className="space-y-6">
      <Skeleton height={14} width={120} radius="sm" />
      <div className="glass-card space-y-4 p-4 sm:p-6">
        <Skeleton height={28} width="70%" radius="sm" />
        <Skeleton height={12} width={180} radius="sm" />
      </div>
      <Skeleton height={14} width={160} radius="sm" />
      <div className="grid gap-3 sm:grid-cols-2">
        {Array.from({ length: 2 }).map((_, i) => (
          <div key={i} className="glass-card space-y-2 p-4">
            <Skeleton height={36} width={36} radius="md" />
            <Skeleton height={16} width="60%" radius="sm" />
            <Skeleton height={12} width="90%" radius="sm" />
          </div>
        ))}
      </div>
      {Array.from({ length: 2 }).map((_, i) => (
        <div key={i} className="glass-card space-y-3 p-4 sm:p-5">
          <Skeleton height={18} width={140} radius="sm" />
          <Skeleton height={12} width="80%" radius="sm" />
          <Skeleton height={40} width={180} radius="md" />
        </div>
      ))}
    </div>
  );
}

export function SelfLearnMaterialsSkeleton() {
  return (
    <div className="space-y-3">
      <Skeleton height={40} radius="md" />
      <div className="overflow-hidden rounded-xl border border-border/50">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex items-center justify-between gap-3 border-b border-border/40 px-4 py-3 last:border-0">
            <div className="min-w-0 flex-1 space-y-2">
              <Skeleton height={14} width="55%" radius="sm" />
              <Skeleton height={10} width="30%" radius="sm" />
            </div>
            <Skeleton height={28} width={72} radius="md" />
          </div>
        ))}
      </div>
    </div>
  );
}

export function ChatLessonsSidebarSkeleton() {
  return (
    <ul className="space-y-2 p-2">
      {Array.from({ length: 8 }).map((_, i) => (
        <li key={i} className="flex items-start gap-2 rounded-lg px-2.5 py-2.5">
          <Skeleton height={32} width={32} radius="md" />
          <div className="min-w-0 flex-1 space-y-2">
            <Skeleton height={14} width="85%" radius="sm" />
            <Skeleton height={10} width="60%" radius="sm" />
          </div>
        </li>
      ))}
    </ul>
  );
}

export function ChatSessionSkeleton() {
  return (
    <div className="flex flex-1 flex-col justify-center gap-6 px-2 py-8 sm:px-4">
      {[
        { align: 'start', w: '68%', h: 80 },
        { align: 'end', w: '48%', h: 52 },
        { align: 'start', w: '72%', h: 96 },
        { align: 'end', w: '40%', h: 44 },
      ].map((row, i) => (
        <div
          key={i}
          className={`flex gap-3 ${row.align === 'end' ? 'justify-end' : 'justify-start'}`}
        >
          {row.align === 'start' && <Skeleton height={32} width={32} radius="xl" />}
          <Skeleton height={row.h} width={row.w} radius="xl" />
        </div>
      ))}
    </div>
  );
}

export function LeaderboardSkeleton({ compact = false }) {
  const count = compact ? 5 : 8;
  return (
    <div className="space-y-4">
      {!compact && <Skeleton height={36} radius="md" />}
      <Skeleton height={52} radius="xl" />
      <ul className="space-y-2">
        {Array.from({ length: count }).map((_, i) => (
          <li key={i} className="flex items-center gap-3 rounded-xl border border-border/50 px-3 py-2.5 sm:px-4">
            <Skeleton height={16} width={16} radius="sm" />
            <Skeleton height={14} width={20} radius="sm" />
            <Skeleton height={14} className="flex-1" radius="sm" />
            <Skeleton height={14} width={56} radius="sm" />
          </li>
        ))}
      </ul>
    </div>
  );
}

export function PageLoader({ label = 'Loading…' }) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-24 animate-content-fade-in">
      <div className="relative">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        <div className="absolute inset-0 h-10 w-10 animate-ping rounded-full border border-primary/20" />
      </div>
      <p className="text-sm text-muted-foreground">{label}</p>
    </div>
  );
}
