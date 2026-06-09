import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Collapse } from '@mantine/core';
import {
  AlertTriangle,
  BookOpen,
  ChevronDown,
  ChevronRight,
  Layers,
  Sparkles,
  Target,
  Upload,
  Users,
} from 'lucide-react';
import { GlassCard } from './GlassCard';
import { AdesiaBadge } from './AdesiaBadge';
import { StatCard } from './AdesiaBadge';
import { formatNumber } from '../utils/formatters';

const subjectKey = (subject) => subject.subjectId || subject.subjectName;

const TeachingDashboardSections = ({
  role = 'teacher',
  stats = {},
  quizPerformance = {},
  firstName,
}) => {
  const paths = role === 'admin'
    ? {
      lessons: '/admin/lessons',
      lesson: (id) => `/admin/lessons/${id}/preview`,
      students: '/admin/students',
      student: (id) => `/admin/students/${id}`,
      subjects: '/admin/academic/subjects',
      materials: '/admin/materials',
    }
    : {
      lessons: '/teacher/lessons',
      lesson: (id) => `/teacher/lessons/${id}/preview`,
      students: '/teacher/students',
      student: (id) => `/teacher/students/${id}`,
      subjects: '/teacher/subjects',
      materials: '/teacher/materials',
    };

  const contentBySubject = stats.contentBySubject ?? [];
  const recentActivity = stats.recentActivity ?? [];
  const atRiskStudents = stats.atRiskStudents ?? [];
  const focusLessons = stats.focusLessons ?? [];

  const [expandedSubjects, setExpandedSubjects] = useState({});

  const groupedKeyList = useMemo(
    () => contentBySubject.map(subjectKey).join('|'),
    [contentBySubject],
  );

  useEffect(() => {
    if (!contentBySubject.length) {
      setExpandedSubjects({});
      return;
    }
    setExpandedSubjects((prev) => {
      const keys = contentBySubject.map(subjectKey);
      if (keys.some((k) => k in prev)) return prev;
      return Object.fromEntries(keys.map((k, i) => [k, i === 0]));
    });
  }, [groupedKeyList, contentBySubject]);

  const toggleSubject = (key) => {
    setExpandedSubjects((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const avgQuiz = quizPerformance?.avgScore != null
    ? Math.round(quizPerformance.avgScore)
    : Math.round(stats.averageScore ?? 0);

  return (
    <>
      <div className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard icon={Users} label="Students" value={formatNumber(stats.totalStudents)} highlight />
        <StatCard icon={BookOpen} label="Subjects" value={formatNumber(stats.totalSubjects)} />
        <StatCard icon={Layers} label="Lessons" value={formatNumber(stats.totalLessons)} />
        <StatCard icon={Target} label="Quiz avg" value={`${avgQuiz}%`} />
      </div>

      <div className="mb-8 grid gap-4 sm:grid-cols-2 md:grid-cols-4">
        <StatCard icon={Upload} label="Materials" value={formatNumber(stats.totalMaterials)} />
        <StatCard icon={Target} label="Quizzes" value={formatNumber(stats.totalQuizzes)} />
        <StatCard icon={Layers} label="Flashcards" value={formatNumber(stats.totalFlashcards)} />
        <StatCard icon={Sparkles} label="Completion" value={`${Math.round(stats.completionRate ?? 0)}%`} />
      </div>

      <div className="my-8">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="flex items-center gap-2 font-display text-sm font-semibold text-foreground">
            <Sparkles className="h-4 w-4 text-primary" />
            Content by subject
          </h2>
          <Link to={paths.lessons} className="text-xs text-primary hover:underline">
            View all lessons
          </Link>
        </div>

        {contentBySubject.length ? (
          <div className="space-y-6">
            {contentBySubject.map((subject) => {
              const key = subjectKey(subject);
              const isOpen = expandedSubjects[key] === true;
              return (
                <GlassCard key={key} className="overflow-hidden p-0">
                  <button
                    type="button"
                    onClick={() => toggleSubject(key)}
                    className="flex w-full items-center justify-between gap-3 p-6 text-left transition hover:bg-muted/20"
                    aria-expanded={isOpen}
                  >
                    <div className="flex min-w-0 items-center gap-2">
                      <ChevronDown
                        className={`h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
                      />
                      <h3 className="font-display text-base font-semibold text-foreground">
                        {subject.subjectName}
                      </h3>
                    </div>
                    <span className="shrink-0 text-xs text-muted-foreground">
                      {subject.lessons.length}
                      {' lesson'}
                      {subject.lessons.length !== 1 ? 's' : ''}
                    </span>
                  </button>
                  <Collapse in={isOpen}>
                    <ul className="space-y-4 border-t border-border/40 px-6 pb-6 pt-4">
                      {subject.lessons.map((lesson) => (
                        <li
                          key={lesson.lessonId}
                          className="rounded-xl border border-border/50 bg-muted/20 p-4"
                        >
                          <div className="flex flex-wrap items-start justify-between gap-3">
                            <div className="min-w-0">
                              <Link
                                to={paths.lesson(lesson.lessonId)}
                                className="font-medium text-foreground hover:text-primary"
                              >
                                {lesson.title}
                              </Link>
                              <div className="mt-2 flex flex-wrap gap-2">
                                <AdesiaBadge status={lesson.avgProgress >= 70 ? 'active' : 'draft'}>
                                  {lesson.avgProgress}% avg progress
                                </AdesiaBadge>
                                {lesson.quizCount > 0 && (
                                  <AdesiaBadge status="ready">
                                    {lesson.quizCount}
                                    {' quiz'}
                                    {lesson.quizCount !== 1 ? 'zes' : ''}
                                  </AdesiaBadge>
                                )}
                                {lesson.flashcardCount > 0 && (
                                  <AdesiaBadge status="ready">
                                    {lesson.flashcardCount}
                                    {' cards'}
                                  </AdesiaBadge>
                                )}
                              </div>
                            </div>
                            <Link
                              to={paths.lesson(lesson.lessonId)}
                              className="btn-outline shrink-0 !px-2 !py-1 text-xs no-underline"
                            >
                              Open
                            </Link>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </Collapse>
                </GlassCard>
              );
            })}
          </div>
        ) : (
          <GlassCard className="p-8 text-center">
            <p className="text-sm text-muted-foreground">No published lessons yet.</p>
            <Link to={paths.subjects} className="mt-3 inline-block text-sm text-primary hover:underline">
              Manage subjects
            </Link>
          </GlassCard>
        )}
      </div>

      <div className="mb-8 grid gap-6 lg:grid-cols-2">
        <GlassCard className="p-6">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="font-display text-sm font-semibold text-foreground">Recent student activity</h3>
            <Link to={paths.students} className="text-xs text-primary hover:underline">All students</Link>
          </div>
          {recentActivity.length ? (
            <ul className="space-y-3">
              {recentActivity.slice(0, 5).map((item) => (
                <li key={`${item.studentId}-${item.lessonId}`}>
                  <Link
                    to={paths.student(item.studentId)}
                    className="flex items-center justify-between gap-3 rounded-xl border border-border/50 bg-muted/30 px-4 py-3 no-underline transition hover:border-primary/30"
                  >
                    <div className="min-w-0">
                      <p className="truncate font-medium text-foreground">{item.studentName}</p>
                      <p className="truncate text-xs text-muted-foreground">
                        {item.lessonTitle}
                        {' · '}
                        {item.progressPercent > 0
                          ? `${Math.round(item.progressPercent)}%`
                          : 'Started'}
                      </p>
                    </div>
                    <ChevronRight className="h-4 w-4 shrink-0 text-primary" />
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-muted-foreground">
              No in-progress lessons yet. Students appear here once they open a lesson.
            </p>
          )}
        </GlassCard>

        <GlassCard className="p-6">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="flex items-center gap-2 font-display text-sm font-semibold text-foreground">
              <AlertTriangle className="h-4 w-4 text-amber-500" />
              Needs attention
            </h3>
          </div>
          {atRiskStudents.length ? (
            <ul className="space-y-3">
              {atRiskStudents.map((s) => (
                <li key={s.studentId}>
                  <Link
                    to={paths.student(s.studentId)}
                    className="flex items-center justify-between rounded-xl border border-amber-500/20 bg-amber-500/5 px-4 py-3 no-underline transition hover:border-amber-500/40"
                  >
                    <span className="font-medium text-foreground">
                      {s.firstName} {s.lastName}
                    </span>
                    <span className="text-sm text-muted-foreground">
                      {s.averageQuizScore}% quiz avg
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-muted-foreground">No struggling students flagged right now.</p>
          )}
        </GlassCard>
      </div>

      {focusLessons.length > 0 && (
        <GlassCard className="mb-8 p-6">
          <h3 className="mb-3 font-display text-sm font-semibold text-foreground">Focus lessons</h3>
          <p className="mb-4 text-xs text-muted-foreground">
            Lessons where students average below 50% progress — consider reviewing content.
          </p>
          <div className="flex flex-wrap gap-2">
            {focusLessons.map((lesson) => (
              <Link
                key={lesson.lessonId}
                to={paths.lesson(lesson.lessonId)}
                className="rounded-full border border-amber-500/30 bg-amber-500/10 px-3 py-1 text-xs font-medium text-amber-700 no-underline transition hover:border-amber-500/50 dark:text-amber-300"
              >
                {lesson.title}
                {' '}
                ({lesson.avgProgress}% avg)
              </Link>
            ))}
          </div>
        </GlassCard>
      )}

      {firstName && (
        <p className="sr-only">Dashboard for {firstName}</p>
      )}
    </>
  );
};

export default TeachingDashboardSections;
