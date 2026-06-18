import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { notifications } from '@mantine/notifications';
import { PageHeader } from '../components/PageShell';
import { GlassCard } from '../components/GlassCard';
import { PageLoader } from '../components/PageLoader';
import { GradientButton } from '../components/GradientButton';
import { formatDateTime, getErrorMessage } from '../utils/formatters';
import { useAuth } from '../context/AuthContext';
import { analyseStudent } from '../services/analytics.services';

const AnalyseStudentPage = ({ basePath = '/teacher', backLabel = 'Back to students', studentIdOverride, organizationIdOverride }) => {
  const paramsId = useParams().id;
  const studentId = studentIdOverride ?? paramsId;
  const { organizationId: authOrgId } = useAuth();
  const organizationId = organizationIdOverride ?? authOrgId;
  const [scope, setScope] = useState('overall');
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(false);

  const runAnalysis = async () => {
    if (!organizationId || !studentId) return;
    setLoading(true);
    try {
      const data = await analyseStudent({ studentId, organizationId, scope });
      setReport(data);
    } catch (err) {
      notifications.show({ title: 'Analysis', message: getErrorMessage(err), color: 'red' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    runAnalysis();
  }, [organizationId, studentId, scope]);

  if (!organizationId || !studentId) {
    return (
      <GlassCard className="p-8 text-center text-sm text-muted-foreground">
        Select a student to analyse.
      </GlassCard>
    );
  }

  return (
    <>
      <PageHeader
        title="Analyse"
        gradientWord="student"
        description="AI-powered learning report from quizzes, flashcards, lessons, and chat activity."
      />

      <GlassCard className="mb-4 flex flex-wrap items-center gap-3 p-4">
        <select
          value={scope}
          onChange={(e) => setScope(e.target.value)}
          className="rounded-xl border border-border/60 bg-background px-3 py-2 text-sm"
        >
          <option value="overall">Overall report</option>
          <option value="subject">Subject-focused</option>
          <option value="lesson">Lesson-focused</option>
        </select>
        <GradientButton type="button" onClick={runAnalysis} disabled={loading}>
          {loading ? 'Analysing…' : 'Refresh analysis'}
        </GradientButton>
        <Link
          to={studentIdOverride ? `${basePath}/dashboard` : `${basePath}/students/${studentId}`}
          className="text-sm text-primary hover:underline"
        >
          {backLabel}
        </Link>
      </GlassCard>

      {loading && !report ? (
        <PageLoader />
      ) : report ? (
        <div className="grid gap-4 lg:grid-cols-2">
          <GlassCard className="lg:col-span-2 p-6">
            <p className="text-xs uppercase text-muted-foreground">Summary · {report.scope}</p>
            <p className="mt-2 text-sm leading-relaxed">{report.summary}</p>
            <p className="mt-3 text-xs text-muted-foreground">Generated {formatDateTime(report.generatedAt)}</p>
          </GlassCard>

          <GlassCard className="p-6">
            <h3 className="font-display font-semibold text-emerald-800 dark:text-emerald-400">Strengths</h3>
            <ul className="mt-3 list-disc space-y-1 pl-5 text-sm">
              {(report.strengths ?? []).map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </GlassCard>

          <GlassCard className="p-6">
            <h3 className="font-display font-semibold text-warning-heading">Areas to improve</h3>
            <ul className="mt-3 list-disc space-y-1 pl-5 text-sm">
              {(report.weaknesses ?? []).map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </GlassCard>

          <GlassCard className="p-6">
            <h3 className="font-display font-semibold">Recommendations</h3>
            <ul className="mt-3 list-disc space-y-1 pl-5 text-sm">
              {(report.recommendations ?? []).map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </GlassCard>

          <GlassCard className="p-6">
            <h3 className="font-display font-semibold">Engagement</h3>
            <dl className="mt-3 space-y-2 text-sm">
              <div><dt className="text-muted-foreground">Quizzes</dt><dd>{report.engagement?.quizPerformance}</dd></div>
              <div><dt className="text-muted-foreground">Flashcards</dt><dd>{report.engagement?.flashcardMastery}</dd></div>
              <div><dt className="text-muted-foreground">Chat</dt><dd>{report.engagement?.chatEngagement}</dd></div>
            </dl>
          </GlassCard>

          {report.subjectBreakdown?.length > 0 && (
            <GlassCard className="lg:col-span-2 p-6">
              <h3 className="font-display font-semibold">Subject breakdown</h3>
              <div className="mt-4 grid gap-3 md:grid-cols-2">
                {report.subjectBreakdown.map((row) => (
                  <div key={row.subject} className="rounded-xl border border-border/50 p-4 text-sm">
                    <p className="font-medium">{row.subject}</p>
                    <p className="mt-1 text-muted-foreground">{row.insight}</p>
                  </div>
                ))}
              </div>
            </GlassCard>
          )}
        </div>
      ) : null}
    </>
  );
};

export default AnalyseStudentPage;
