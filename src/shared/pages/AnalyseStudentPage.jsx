import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Select, SegmentedControl } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { Brain, ChevronLeft, Clock, History } from 'lucide-react';
import { PageHeader } from '../components/PageShell';
import { GlassCard } from '../components/GlassCard';
import { AdesiaBadge } from '../components/AdesiaBadge';
import { PageLoader } from '../components/PageLoader';
import { GradientButton } from '../components/GradientButton';
import StudentAnalysisReportView from '../components/StudentAnalysisReportView';
import { filterSelectClass } from '../components/ListGridToolbar';
import { formatDateTime, getErrorMessage } from '../utils/formatters';
import { useAuth } from '../context/AuthContext';
import {
  generateStudentReport,
  getStoredStudentReport,
  getStudentAnalysisContext,
  listStudentReports,
} from '../services/analytics.services';

const scopeKeyFor = (scope, subjectId, lessonId) => {
  if (scope === 'lesson' && lessonId) return `lesson:${lessonId}`;
  if (scope === 'subject' && subjectId) return `subject:${subjectId}`;
  return 'overall';
};

const AnalyseStudentPage = ({
  basePath = '/teacher',
  backLabel = 'Back to students',
  backTo,
  studentIdOverride,
  organizationIdOverride,
  studentMode = false,
}) => {
  const paramsId = useParams().id;
  const studentId = studentIdOverride ?? paramsId;
  const { organizationId: authOrgId, user } = useAuth();
  const organizationId = organizationIdOverride ?? authOrgId;

  const [scope, setScope] = useState('overall');
  const [subjectId, setSubjectId] = useState('');
  const [lessonId, setLessonId] = useState('');
  const [context, setContext] = useState(null);
  const [report, setReport] = useState(null);
  const [history, setHistory] = useState([]);
  const [loadingContext, setLoadingContext] = useState(true);
  const [loadingStored, setLoadingStored] = useState(false);
  const [generating, setGenerating] = useState(false);

  const backHref = backTo ?? (studentMode ? `${basePath}/dashboard` : `${basePath}/students/${studentId}`);
  const currentScopeKey = scopeKeyFor(scope, subjectId, lessonId);

  const loadContext = useCallback(async () => {
    if (!organizationId || !studentId) return;
    setLoadingContext(true);
    try {
      const data = await getStudentAnalysisContext({ studentId, organizationId });
      setContext(data);
    } catch (err) {
      notifications.show({ title: 'Error', message: getErrorMessage(err), color: 'red' });
    } finally {
      setLoadingContext(false);
    }
  }, [organizationId, studentId]);

  const loadHistory = useCallback(async () => {
    if (!organizationId || !studentId) return;
    try {
      const rows = await listStudentReports({ studentId, organizationId });
      setHistory(Array.isArray(rows) ? rows : []);
    } catch {
      setHistory([]);
    }
  }, [organizationId, studentId]);

  const loadStoredReport = useCallback(async () => {
    if (!organizationId || !studentId) return;
    if (scope === 'subject' && !subjectId) {
      setReport(null);
      return;
    }
    if (scope === 'lesson' && !lessonId) {
      setReport(null);
      return;
    }

    setLoadingStored(true);
    try {
      const data = await getStoredStudentReport({
        studentId,
        organizationId,
        scope,
        subjectId: scope === 'subject' ? subjectId : undefined,
        lessonId: scope === 'lesson' ? lessonId : undefined,
      });
      setReport(data || null);
    } catch (err) {
      setReport(null);
      notifications.show({ title: 'Error', message: getErrorMessage(err), color: 'red' });
    } finally {
      setLoadingStored(false);
    }
  }, [organizationId, studentId, scope, subjectId, lessonId]);

  const handleGenerate = useCallback(async () => {
    if (!organizationId || !studentId) return;
    if (scope === 'subject' && !subjectId) {
      notifications.show({ title: 'Select a subject', message: 'Choose a subject first.', color: 'yellow' });
      return;
    }
    if (scope === 'lesson' && !lessonId) {
      notifications.show({ title: 'Select a lesson', message: 'Choose a lesson first.', color: 'yellow' });
      return;
    }

    setGenerating(true);
    try {
      const data = await generateStudentReport({
        studentId,
        organizationId,
        scope,
        subjectId: scope === 'subject' ? subjectId : undefined,
        lessonId: scope === 'lesson' ? lessonId : undefined,
      });
      setReport(data);
      await loadHistory();
      notifications.show({
        title: 'Report saved',
        message: report ? 'Report regenerated for this scope.' : 'New report generated and saved.',
        color: 'green',
      });
    } catch (err) {
      notifications.show({ title: 'Analysis', message: getErrorMessage(err), color: 'red' });
    } finally {
      setGenerating(false);
    }
  }, [organizationId, studentId, scope, subjectId, lessonId, loadHistory, report]);

  const applyHistoryItem = (item) => {
    setScope(item.scope);
    setSubjectId(item.subjectId ?? '');
    setLessonId(item.lessonId ?? '');
  };

  useEffect(() => {
    loadContext();
    loadHistory();
  }, [loadContext, loadHistory]);

  useEffect(() => {
    if (scope === 'overall') {
      setSubjectId('');
      setLessonId('');
    }
    if (scope === 'subject') setLessonId('');
  }, [scope]);

  useEffect(() => {
    if (loadingContext) return undefined;
    loadStoredReport();
    return undefined;
  }, [loadingContext, loadStoredReport]);

  const subjectOptions = useMemo(
    () => (context?.subjects ?? []).map((s) => ({ value: s.id, label: `${s.name} (${s.lessonCount})` })),
    [context?.subjects],
  );

  const lessonOptions = useMemo(() => {
    const lessons = context?.lessons ?? [];
    const filtered = scope === 'subject' && subjectId
      ? lessons.filter((l) => l.subjectId === subjectId)
      : lessons;
    return filtered.map((l) => ({
      value: l.id,
      label: l.title,
    }));
  }, [context?.lessons, scope, subjectId]);

  const displayName = context?.studentName
    ?? (studentMode ? user?.firstName : null)
    ?? 'Student';

  const canLoadScope = scope === 'overall'
    || (scope === 'subject' && subjectId)
    || (scope === 'lesson' && lessonId);

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
        title={studentMode ? 'My learning report' : `Analyse ${displayName}`}
        gradientWord={studentMode ? 'learning report' : 'student'}
        description={
          studentMode
            ? 'Saved AI reports from your quizzes, flashcards, lessons, and chat — one report per overall, subject, or lesson scope.'
            : 'Saved learning reports for parents and teachers. Generate once per scope; regenerate only when you choose.'
        }
        action={(
          <Link to={backHref} className="btn-outline inline-flex w-full items-center justify-center gap-2 !px-3 !py-2 text-sm no-underline sm:w-auto">
            <ChevronLeft className="h-4 w-4" />
            {backLabel}
          </Link>
        )}
      />

      {history.length > 0 && (
        <GlassCard className="mb-4 min-w-0 p-4 sm:p-5">
          <div className="mb-3 flex items-center gap-2">
            <History className="h-4 w-4 text-primary" />
            <h3 className="font-display text-sm font-semibold text-foreground">Saved reports</h3>
            <span className="text-xs text-muted-foreground">({history.length})</span>
          </div>
          <div className="flex gap-2 overflow-x-auto pb-1">
            {history.map((item) => {
              const active = item.scopeKey === currentScopeKey;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => applyHistoryItem(item)}
                  className={`shrink-0 rounded-xl border px-3 py-2.5 text-left transition ${
                    active
                      ? 'border-primary/40 bg-primary/10'
                      : 'border-border/50 bg-muted/20 hover:border-primary/25 hover:bg-primary/5'
                  }`}
                >
                  <p className="max-w-[12rem] truncate text-xs font-medium text-foreground">{item.scopeLabel}</p>
                  <p className="mt-0.5 flex items-center gap-1 text-[10px] text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    {formatDateTime(item.generatedAt)}
                  </p>
                </button>
              );
            })}
          </div>
        </GlassCard>
      )}

      <GlassCard className="mb-4 min-w-0 p-4 sm:p-5">
        <div className="flex min-w-0 flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-end">
          <SegmentedControl
            fullWidth
            className="sm:!w-auto"
            size="xs"
            value={scope}
            onChange={setScope}
            data={[
              { label: 'Overall', value: 'overall' },
              { label: 'By subject', value: 'subject' },
              { label: 'By lesson', value: 'lesson' },
            ]}
          />

          {scope === 'subject' && (
            <Select
              label="Subject"
              placeholder="Select subject"
              data={subjectOptions}
              value={subjectId || null}
              onChange={(v) => setSubjectId(v ?? '')}
              className={filterSelectClass}
              size="sm"
              searchable
              disabled={loadingContext}
            />
          )}

          {scope === 'lesson' && (
            <Select
              label="Lesson"
              placeholder="Select lesson"
              data={lessonOptions}
              value={lessonId || null}
              onChange={(v) => setLessonId(v ?? '')}
              className="w-full min-w-0 sm:max-w-xs"
              size="sm"
              searchable
              disabled={loadingContext}
            />
          )}

          <GradientButton
            type="button"
            onClick={handleGenerate}
            disabled={generating || loadingContext || !canLoadScope}
            className="w-full !px-4 !py-2 sm:w-auto"
          >
            <Brain className="h-4 w-4" />
            {generating ? 'Generating…' : report ? 'Regenerate report' : 'Generate report'}
          </GradientButton>
        </div>
      </GlassCard>

      {generating && (
        <div className="mb-4 flex items-center gap-2 rounded-xl border border-primary/25 bg-primary/10 px-4 py-2.5 text-sm text-primary">
          <Brain className="h-4 w-4 shrink-0 animate-pulse" />
          Generating and saving report…
        </div>
      )}

      {loadingContext && !report && !loadingStored ? (
        <PageLoader />
      ) : loadingStored && !report ? (
        <PageLoader />
      ) : report ? (
        <>
          {report.cached && (
            <div className="mb-4 flex flex-wrap items-center gap-2">
              <AdesiaBadge status="draft">Saved report</AdesiaBadge>
              <span className="text-xs text-muted-foreground">
                Generated {formatDateTime(report.generatedAt)} · click Regenerate to refresh with latest data
              </span>
            </div>
          )}
          <StudentAnalysisReportView
            key={`${report.scope}-${currentScopeKey}-${report.generatedAt}`}
            report={report}
          />
        </>
      ) : !loadingStored && !generating ? (
        <GlassCard className="p-8 text-center">
          <Brain className="mx-auto mb-3 h-10 w-10 text-primary/60" />
          <p className="text-sm text-muted-foreground">
            {!canLoadScope
              ? scope === 'subject'
                ? 'Select a subject above, then generate a report.'
                : 'Select a lesson above, then generate a report.'
              : 'No saved report for this scope yet. Click Generate report to create one.'}
          </p>
        </GlassCard>
      ) : null}
    </>
  );
};

export default AnalyseStudentPage;
