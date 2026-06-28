import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Brain, ChevronRight } from 'lucide-react';
import { GlassCard } from '../../../shared/components/GlassCard';
import { GradientButton } from '../../../shared/components/GradientButton';
import StudentAnalysisReportView from '../../../shared/components/StudentAnalysisReportView';
import { getStoredStudentReport } from '../../../shared/services/analytics.services';

const StudentLearningReportCard = ({ organizationId, studentId, weakTopics = [] }) => {
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(false);
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    if (!organizationId || !studentId || !expanded) return undefined;
    setLoading(true);
    getStoredStudentReport({ studentId, organizationId, scope: 'overall' })
      .then((data) => setReport(data || null))
      .catch(() => setReport(null))
      .finally(() => setLoading(false));
    return undefined;
  }, [organizationId, studentId, expanded]);

  return (
    <GlassCard className="min-w-0 overflow-hidden p-4 sm:p-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <Brain className="h-5 w-5 shrink-0 text-primary" />
            <h3 className="font-display text-sm font-semibold text-foreground">Learning report</h3>
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            Your saved AI learning report — generate once on the full report page.
          </p>
          {weakTopics.length > 0 && !expanded && (
            <div className="mt-3 flex flex-wrap gap-1.5">
              {weakTopics.slice(0, 3).map((topic) => (
                <span
                  key={topic}
                  className="max-w-full truncate rounded-full border border-amber-500/30 bg-amber-500/10 px-2.5 py-0.5 text-xs font-medium text-amber-700 dark:text-amber-300"
                >
                  {topic}
                </span>
              ))}
            </div>
          )}
        </div>
        <div className="flex shrink-0 flex-col gap-2 sm:items-end">
          <GradientButton
            type="button"
            className="w-full !px-3 !py-2 sm:w-auto"
            onClick={() => setExpanded((v) => !v)}
            disabled={loading}
          >
            {loading ? 'Loading…' : expanded ? 'Hide preview' : 'View saved report'}
          </GradientButton>
          <Link
            to="/student/analyse"
            className="inline-flex w-full items-center justify-center gap-1 text-xs font-medium text-primary hover:underline sm:w-auto"
          >
            Full report
            <ChevronRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>

      {expanded && !loading && !report && (
        <p className="mt-4 border-t border-border/40 pt-4 text-sm text-muted-foreground">
          No saved overall report yet.{' '}
          <Link to="/student/analyse" className="text-primary hover:underline">
            Generate one on the learning report page
          </Link>
          .
        </p>
      )}

      {expanded && report && (
        <div className="mt-5 border-t border-border/40 pt-5">
          <StudentAnalysisReportView report={report} compact />
        </div>
      )}
    </GlassCard>
  );
};

export default StudentLearningReportCard;
