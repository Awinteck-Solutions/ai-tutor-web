import { Sparkles } from 'lucide-react';
import { AdesiaBadge } from './AdesiaBadge';

export default function LearningDNAInsights({ learningDNA }) {
  if (!learningDNA) return null;

  const { learningProfile, insights = [], metrics = {} } = learningDNA;

  return (
    <div className="glass-card space-y-4 p-4">
      <div className="flex items-center gap-2">
        <Sparkles className="h-4 w-4 text-primary" />
        <h3 className="font-display text-sm font-semibold">Learning DNA</h3>
      </div>

      <div className="flex flex-wrap gap-2">
        <AdesiaBadge status="draft">
          Style: {learningProfile?.preferredStyle ?? 'mixed'}
        </AdesiaBadge>
        <AdesiaBadge status="active">
          Retention: {metrics.retentionScore ?? 0}%
        </AdesiaBadge>
        <AdesiaBadge status="pending">
          Consistency: {metrics.consistencyScore ?? 0}%
        </AdesiaBadge>
      </div>

      {insights.length > 0 && (
        <ul className="space-y-2 text-sm text-muted-foreground">
          {insights.slice(0, 3).map((insight) => (
            <li key={insight} className="rounded-lg border border-border/40 px-3 py-2">
              {insight}
            </li>
          ))}
        </ul>
      )}

      {(learningProfile?.strongAreas?.length > 0
        || learningProfile?.weakAreas?.length > 0) && (
        <div className="grid gap-3 sm:grid-cols-2">
          {learningProfile.strongAreas?.length > 0 && (
            <div>
              <p className="mb-1 text-xs font-semibold uppercase text-muted-foreground">
                Strong areas
              </p>
              <p className="text-sm">{learningProfile.strongAreas.slice(0, 3).join(', ')}</p>
            </div>
          )}
          {learningProfile.weakAreas?.length > 0 && (
            <div>
              <p className="mb-1 text-xs font-semibold uppercase text-muted-foreground">
                Focus areas
              </p>
              <p className="text-sm">{learningProfile.weakAreas.slice(0, 3).join(', ')}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
