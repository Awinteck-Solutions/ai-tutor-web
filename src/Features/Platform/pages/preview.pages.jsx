import { useEffect, useState } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import { Badge, Tabs } from '@mantine/core';
import { ExternalLink } from 'lucide-react';
import { notifications } from '@mantine/notifications';
import { PageHeader } from '../../../shared/components/PageShell';
import { GlassCard } from '../../../shared/components/GlassCard';
import { PageLoader } from '../../../shared/components/PageLoader';
import { AdesiaBadge } from '../../../shared/components/AdesiaBadge';
import { formatDateTime, getErrorMessage } from '../../../shared/utils/formatters';
import { previewPlatformUser, previewPlatformOrganization } from '../services/platform.services';
import {
  resolvePreviewPortalLink,
} from '../platform.paths';

const PreviewNavLink = ({ to, className, children }) => (
  <Link to={to} className={className}>
    {children}
  </Link>
);

const LinkList = ({ links, title, linkContext, hint }) => (
  <GlassCard className="p-6">
    <h3 className="mb-4 font-display font-semibold">{title}</h3>
    {hint && (
      <p className="mb-4 text-xs text-muted-foreground">{hint}</p>
    )}
    <ul className="space-y-2">
      {(links ?? []).map((link) => {
        const to = resolvePreviewPortalLink(link.path, linkContext);
        return (
          <li key={`${link.label}-${link.path}`}>
            <PreviewNavLink
              to={to}
              className="flex items-center justify-between gap-2 rounded-xl border border-border/50 px-3 py-2 text-sm transition hover:border-primary/40 hover:bg-primary/5"
            >
              <span>
                <span className="font-medium text-foreground">{link.label}</span>
                {link.note && <span className="ml-2 text-xs text-muted-foreground">({link.note})</span>}
              </span>
              <ExternalLink className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
            </PreviewNavLink>
          </li>
        );
      })}
    </ul>
  </GlassCard>
);

const ContentTable = ({ title, rows, columns }) => (
  <GlassCard className="overflow-hidden p-0">
    <div className="border-b border-border/40 px-4 py-3 font-display font-semibold">{title}</div>
    {!rows?.length ? (
      <p className="p-4 text-sm text-muted-foreground">None</p>
    ) : (
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="bg-muted/40 text-xs uppercase text-muted-foreground">
            <tr>
              {columns.map((col) => (
                <th key={col.key} className="px-4 py-2">{col.label}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.id ?? row.title} className="border-t border-border/40">
                {columns.map((col) => (
                  <td key={col.key} className="px-4 py-2">
                    {col.render ? col.render(row) : row[col.key]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    )}
  </GlassCard>
);

const StatGrid = ({ stats }) => (
  <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
    {stats.map(({ label, value }) => (
      <GlassCard key={label} className="p-4">
        <p className="text-xs uppercase text-muted-foreground">{label}</p>
        <p className="mt-1 text-xl font-bold text-foreground">{value ?? '—'}</p>
      </GlassCard>
    ))}
  </div>
);

const HEALTH_FLAG_LABELS = {
  NEVER_LOGGED_IN: { label: 'Never logged in', color: 'orange' },
  INACTIVE_14D: { label: 'Inactive 14+ days', color: 'orange' },
  INACTIVE_30D: { label: 'Inactive 30+ days', color: 'red' },
  UNSUBSCRIBED_ALL: { label: 'Unsubscribed from email', color: 'gray' },
  LOW_QUIZ_PERFORMANCE: { label: 'Low quiz performance', color: 'orange' },
  AT_RISK: { label: 'At risk of churn', color: 'red' },
  INACTIVE: { label: 'Inactive account', color: 'gray' },
  SUSPENDED: { label: 'Suspended', color: 'red' },
};

const orgTypeLabel = (type) => {
  if (type === 'personal') return 'Personal workspace';
  if (type === 'school') return 'School / org';
  return 'No organization';
};

const BusinessOverview = ({ user, summary, linkContext }) => {
  if (!summary) return null;

  const engagement = summary.engagement ?? {};
  const orgMembers = summary.orgMembers;
  const roleMetrics = summary.roleMetrics ?? {};
  const flags = (summary.healthFlags ?? []).filter((f) => f !== 'ACTIVE');

  const businessStats = [
    { label: 'Account age', value: `${summary.accountAgeDays ?? 0} days` },
    {
      label: 'Last login',
      value: summary.daysSinceLastLogin == null
        ? 'Never'
        : summary.daysSinceLastLogin === 0
          ? 'Today'
          : `${summary.daysSinceLastLogin} days ago`,
    },
    { label: 'Plan', value: summary.subscriptionPlan ?? '—' },
    { label: 'Workspace', value: orgTypeLabel(summary.orgType) },
    { label: 'Emails (30d)', value: engagement.emailsSent30d ?? 0 },
    { label: 'Chat sessions', value: engagement.chatSessions ?? 0 },
    { label: 'AI requests (30d)', value: summary.aiUsage30d?.requests ?? 0 },
    { label: 'Marketing opt-in', value: engagement.unsubscribedAll ? 'Unsubscribed' : engagement.marketingOptIn ? 'Yes' : 'No' },
  ];

  const roleStats = [];
  if (user.role === 'STUDENT') {
    roleStats.push(
      { label: 'Lessons completed', value: roleMetrics.lessonsCompleted ?? '—' },
      { label: 'Quiz average', value: roleMetrics.averageQuizScore != null ? `${Math.round(roleMetrics.averageQuizScore)}%` : '—' },
      { label: 'Streak', value: roleMetrics.currentStreak ?? '—' },
      { label: 'Org rank', value: roleMetrics.orgRank ?? '—' },
    );
  } else if (user.role === 'TEACHER') {
    roleStats.push(
      { label: 'Students', value: roleMetrics.totalStudents ?? '—' },
      { label: 'Lessons', value: roleMetrics.totalLessons ?? '—' },
      { label: 'Materials', value: roleMetrics.totalMaterials ?? '—' },
      { label: 'Avg quiz score', value: roleMetrics.averageScore != null ? `${Math.round(roleMetrics.averageScore)}%` : '—' },
    );
  } else if (user.role === 'SCHOOL_ADMIN' && orgMembers) {
    roleStats.push(
      { label: 'Org students', value: orgMembers.students ?? 0 },
      { label: 'Org teachers', value: orgMembers.teachers ?? 0 },
      { label: 'Org admins', value: orgMembers.admins ?? 0 },
    );
  } else if (user.role === 'PARENT') {
    roleStats.push({ label: 'Linked students', value: roleMetrics.linkedStudents ?? 0 });
  }

  return (
    <div className="space-y-4">
      {flags.length > 0 && (
        <GlassCard className="border-orange-500/30 bg-orange-500/5 p-4">
          <p className="mb-2 text-sm font-medium text-foreground">Attention needed</p>
          <div className="flex flex-wrap gap-2">
            {flags.map((flag) => {
              const meta = HEALTH_FLAG_LABELS[flag] ?? { label: flag, color: 'orange' };
              return <Badge key={flag} color={meta.color} variant="light">{meta.label}</Badge>;
            })}
          </div>
        </GlassCard>
      )}

      <StatGrid stats={businessStats} />
      {roleStats.length > 0 && (
        <>
          <h3 className="font-display text-sm font-semibold uppercase tracking-wide text-muted-foreground">Role metrics</h3>
          <StatGrid stats={roleStats} />
        </>
      )}

      {(summary.recentInvoices ?? []).length > 0 && (
        <ContentTable
          title="Recent organization invoices"
          rows={summary.recentInvoices}
          columns={[
            { key: 'invoiceNumber', label: 'Invoice' },
            { key: 'plan', label: 'Plan' },
            { key: 'amount', label: 'Amount', render: (r) => `${r.currency ?? 'USD'} ${r.amount}` },
            { key: 'status', label: 'Status' },
            { key: 'dueDate', label: 'Due', render: (r) => (r.dueDate ? formatDateTime(r.dueDate) : '—') },
          ]}
        />
      )}

      <GlassCard className="p-6">
        <h3 className="mb-3 font-display font-semibold">Quick actions</h3>
        <div className="flex flex-wrap gap-2">
          {(summary.quickActions ?? []).map((action) => (
            <PreviewNavLink
              key={action.path}
              to={resolvePreviewPortalLink(action.path, linkContext)}
              className="rounded-lg border border-border/60 px-3 py-1.5 text-sm text-primary hover:border-primary/40 hover:bg-primary/5"
            >
              {action.label}
            </PreviewNavLink>
          ))}
        </div>
      </GlassCard>
    </div>
  );
};

export const UserPreviewPage = () => {
  const { userId } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const activeTab = searchParams.get('tab') || 'overview';

  const linkContext = {
    userId,
    organizationId: data?.user?.organizationId,
  };

  const PreviewContextLink = ({ path, className, children }) => (
    <PreviewNavLink to={resolvePreviewPortalLink(path, linkContext)} className={className}>
      {children}
    </PreviewNavLink>
  );

  useEffect(() => {
    previewPlatformUser(userId)
      .then(setData)
      .catch((err) => notifications.show({ title: 'Preview', message: getErrorMessage(err), color: 'red' }))
      .finally(() => setLoading(false));
  }, [userId]);

  if (loading) return <PageLoader />;
  const user = data?.user;
  const sections = data?.sections ?? {};
  const dash = sections.dashboard ?? {};
  const profile = sections.studentProfile ?? {};

  const studentStats = user?.role === 'STUDENT' ? [
    { label: 'Lessons completed', value: dash.lessonsCompleted ?? profile.progress?.lessonsCompleted },
    { label: 'Quiz average', value: dash.averageQuizScore != null ? `${Math.round(dash.averageQuizScore)}%` : profile.progress?.averageQuizScore },
    { label: 'Streak', value: dash.streak ?? dash.currentStreak ?? profile.progress?.currentStreak },
    { label: 'XP', value: dash.totalXp ?? profile.progress?.totalXp },
    { label: 'Due flashcards', value: dash.nextReviews },
    { label: 'Pending quizzes', value: dash.pendingQuizzes },
    { label: 'Org rank', value: dash.orgRank },
    { label: 'Study time (min)', value: dash.studyTime ?? dash.totalStudyTimeMinutes },
  ] : [];

  return (
    <>
      <PageHeader
        title="User"
        gradientWord="preview"
        description="Business snapshot — account health, engagement, billing context, and operational detail."
      />
      <Link to="/platform/users" className="mb-4 inline-block text-sm text-primary hover:underline">← Back to users</Link>

      {user && (
        <>
          <GlassCard className="mb-6 p-6">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <h2 className="font-display text-xl font-bold">{user.firstName} {user.lastName}</h2>
                <p className="text-sm text-muted-foreground">{user.email}</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  <AdesiaBadge status="active">{user.role}</AdesiaBadge>
                  <AdesiaBadge status={user.status === 'ACTIVE' ? 'success' : 'draft'}>{user.status}</AdesiaBadge>
                  {user.subscriptionPlan && <AdesiaBadge status="success">{user.subscriptionPlan}</AdesiaBadge>}
                </div>
              </div>
              <dl className="grid gap-2 text-sm sm:grid-cols-2">
                <div>
                  <dt className="text-muted-foreground">Organization</dt>
                  <dd className="font-medium">
                    {user.role === 'SUPER_ADMIN' ? 'Platform (no tenant)' : user.organizationName ?? '—'}
                  </dd>
                </div>
                <div><dt className="text-muted-foreground">Created</dt><dd>{formatDateTime(user.createdAt)}</dd></div>
                <div><dt className="text-muted-foreground">Last login</dt><dd>{user.lastLoginAt ? formatDateTime(user.lastLoginAt) : '—'}</dd></div>
                {user.isPersonalWorkspace && (
                  <div><dt className="text-muted-foreground">Workspace</dt><dd>Personal</dd></div>
                )}
              </dl>
            </div>
          </GlassCard>

          <Tabs
            value={activeTab}
            onChange={(value) => setSearchParams(value === 'overview' ? {} : { tab: value }, { replace: true })}
            className="space-y-4"
          >
            <Tabs.List>
              <Tabs.Tab value="overview">Business overview</Tabs.Tab>
              <Tabs.Tab value="learning">Learning & content</Tabs.Tab>
              <Tabs.Tab value="activity">Activity</Tabs.Tab>
              <Tabs.Tab value="comms">Email & chat</Tabs.Tab>
              <Tabs.Tab value="links">Portal links</Tabs.Tab>
            </Tabs.List>

            <Tabs.Panel value="overview">
              <BusinessOverview
                user={user}
                summary={data.businessSummary}
                linkContext={linkContext}
              />
              {sections.note && (
                <GlassCard className="mt-4 p-4 text-sm text-muted-foreground">{sections.note}</GlassCard>
              )}
            </Tabs.Panel>

            <Tabs.Panel value="links">
              <LinkList
                links={data.portalLinks}
                title="Portal pages this user can access"
                linkContext={linkContext}
                hint="Opens in this app — student/teacher portals route to the matching preview tab for platform admins."
              />
            </Tabs.Panel>

            <Tabs.Panel value="learning" className="space-y-4">
              {user.role === 'STUDENT' && (
                <>
                  <StatGrid stats={studentStats} />

                  {sections.recommendations && (
                    <GlassCard className="p-6">
                      <h3 className="font-display font-semibold">Recommendations</h3>
                      <p className="mt-2 text-sm text-muted-foreground">Next lessons</p>
                      <ul className="mt-2 list-disc space-y-1 pl-5 text-sm">
                        {(sections.recommendations.nextLessons ?? []).slice(0, 8).map((l) => (
                          <li key={l.id ?? l.title}>{l.title ?? l.id}</li>
                        ))}
                      </ul>
                      {(sections.recommendations.weakTopics ?? []).length > 0 && (
                        <>
                          <p className="mt-4 text-sm text-muted-foreground">Weak topics</p>
                          <div className="mt-2 flex flex-wrap gap-2">
                            {sections.recommendations.weakTopics.map((t) => (
                              <Badge key={t} variant="light" color="orange">{t}</Badge>
                            ))}
                          </div>
                        </>
                      )}
                    </GlassCard>
                  )}

                  {sections.learningPath?.path && (
                    <GlassCard className="p-6">
                      <h3 className="mb-3 font-display font-semibold">Learning path</h3>
                      <div className="space-y-4">
                        {sections.learningPath.path.slice(0, 12).map((node) => (
                          <div key={`${node.subjectId}-${node.topicId}`} className="rounded-xl border border-border/50 p-4">
                            <p className="text-sm font-medium">{node.subjectName} → {node.topicName}</p>
                            <ul className="mt-2 space-y-1 text-xs text-muted-foreground">
                              {(node.lessons ?? []).map((l) => (
                                <li key={l.id}>
                                  <PreviewContextLink path={`/student/lessons/${l.id}`} className="text-primary hover:underline">
                                    {l.title}
                                  </PreviewContextLink>
                                </li>
                              ))}
                            </ul>
                          </div>
                        ))}
                      </div>
                    </GlassCard>
                  )}

                  {sections.revisionPlan && (
                    <GlassCard className="p-6">
                      <h3 className="font-display font-semibold">Revision plan</h3>
                      <ul className="mt-3 space-y-2 text-sm">
                        {(sections.revisionPlan.schedule ?? []).map((item, i) => (
                          <li key={i} className="rounded-lg border border-border/40 px-3 py-2">
                            {item.type} · {item.itemCount ?? item.topic ?? item.quizTitle ?? ''} · ~{item.suggestedMinutes} min
                          </li>
                        ))}
                      </ul>
                    </GlassCard>
                  )}

                  {profile.progress && (
                    <GlassCard className="p-6">
                      <h3 className="font-display font-semibold">Teacher-view profile summary</h3>
                      <p className="mt-2 text-sm">Flashcard accuracy: {profile.progress.flashcardAccuracy ?? '—'}%</p>
                      <p className="text-sm">Lessons in progress: {profile.lessonProgress?.length ?? 0}</p>
                      <p className="text-sm">Recent quiz attempts: {profile.recentActivity?.quizAttempts?.length ?? 0}</p>
                    </GlassCard>
                  )}
                </>
              )}

              {user.role === 'TEACHER' && sections.dashboard && (
                <StatGrid stats={[
                  { label: 'Students', value: sections.dashboard.totalStudents },
                  { label: 'Lessons', value: sections.dashboard.totalLessons },
                  { label: 'Materials', value: sections.dashboard.totalMaterials },
                  { label: 'Avg quiz score', value: sections.dashboard.averageScore != null ? `${Math.round(sections.dashboard.averageScore)}%` : '—' },
                ]} />
              )}

              {user.role === 'SCHOOL_ADMIN' && sections.dashboard && (
                <StatGrid stats={[
                  { label: 'Students', value: sections.dashboard.students },
                  { label: 'Teachers', value: sections.dashboard.teachers },
                  { label: 'Lessons', value: sections.dashboard.lessons },
                  { label: 'Materials', value: sections.dashboard.materials },
                ]} />
              )}

              {user.role === 'PARENT' && sections.linkedStudents && (
                <ContentTable
                  title="Linked students"
                  rows={sections.linkedStudents}
                  columns={[
                    { key: 'name', label: 'Student' },
                    { key: 'email', label: 'Email' },
                    { key: 'actions', label: 'Links', render: (row) => (
                      <span className="flex gap-2">
                        <PreviewContextLink path={row.teacherViewPath} className="text-primary hover:underline">Profile</PreviewContextLink>
                        <PreviewContextLink path={row.analysePath} className="text-primary hover:underline">Analyse</PreviewContextLink>
                      </span>
                    ) },
                  ]}
                />
              )}

              {sections.content?.lessons && (
                <ContentTable
                  title="Lessons"
                  rows={sections.content.lessons}
                  columns={[
                    { key: 'title', label: 'Title' },
                    { key: 'status', label: 'Status', render: (r) => r.status ?? '—' },
                    { key: 'links', label: 'Open', render: (r) => (
                      <span className="flex flex-wrap gap-2">
                        {r.studentPath && <PreviewContextLink path={r.studentPath} className="text-primary hover:underline">Student</PreviewContextLink>}
                        {r.previewPath && <PreviewContextLink path={r.previewPath} className="text-primary hover:underline">Preview</PreviewContextLink>}
                        {r.adminPreviewPath && <PreviewContextLink path={r.adminPreviewPath} className="text-primary hover:underline">Admin</PreviewContextLink>}
                      </span>
                    ) },
                  ]}
                />
              )}
              {sections.content?.materials && (
                <ContentTable
                  title="Materials"
                  rows={sections.content.materials}
                  columns={[
                    { key: 'title', label: 'Title' },
                    { key: 'status', label: 'Status' },
                    { key: 'links', label: 'Open', render: (r) => (
                      <span className="flex gap-2">
                        {r.previewPath && <PreviewContextLink path={r.previewPath} className="text-primary hover:underline">Preview</PreviewContextLink>}
                        {r.teacherPath && <PreviewContextLink path={r.teacherPath} className="text-primary hover:underline">Teacher</PreviewContextLink>}
                      </span>
                    ) },
                  ]}
                />
              )}
              {sections.students && (
                <ContentTable
                  title="Students (teacher roster sample)"
                  rows={sections.students}
                  columns={[
                    { key: 'name', label: 'Name' },
                    { key: 'email', label: 'Email' },
                    { key: 'links', label: 'Links', render: (r) => (
                      <span className="flex gap-2">
                        <PreviewContextLink path={r.detailPath} className="text-primary hover:underline">Detail</PreviewContextLink>
                        <PreviewContextLink path={r.analysePath} className="text-primary hover:underline">Analyse</PreviewContextLink>
                      </span>
                    ) },
                  ]}
                />
              )}
              {sections.content?.quizCount != null && (
                <GlassCard className="p-4 text-sm">Total quizzes in org scope: <strong>{sections.content.quizCount}</strong></GlassCard>
              )}
            </Tabs.Panel>

            <Tabs.Panel value="activity" className="space-y-4">
              {sections.history && (
                <>
                  <ContentTable
                    title="Recent quiz attempts"
                    rows={(sections.history.quizAttempts ?? []).slice(0, 15)}
                    columns={[
                      { key: 'score', label: 'Score', render: (r) => `${r.score ?? '—'}%` },
                      { key: 'completedAt', label: 'When', render: (r) => formatDateTime(r.completedAt) },
                    ]}
                  />
                  <ContentTable
                    title="Lesson progress"
                    rows={(sections.history.lessonProgress ?? []).slice(0, 15)}
                    columns={[
                      { key: 'status', label: 'Status' },
                      { key: 'progressPercent', label: '%', render: (r) => r.progressPercent ?? '—' },
                      { key: 'lastAccessedAt', label: 'Last access', render: (r) => formatDateTime(r.lastAccessedAt) },
                    ]}
                  />
                </>
              )}
              {sections.studyQueue && (
                <GlassCard className="p-6 text-sm">
                  <p>Study queue: {sections.studyQueue.flashcards?.length ?? 0} flashcards due</p>
                  {sections.studyQueue.pendingQuiz && <p className="mt-1">Next quiz: {sections.studyQueue.pendingQuiz.title ?? 'Available'}</p>}
                </GlassCard>
              )}
              {sections.achievements && (
                <GlassCard className="p-6">
                  <h3 className="font-display font-semibold">Achievements</h3>
                  <p className="mt-2 text-sm">Unlocked: {sections.achievements.unlocked?.length ?? sections.achievements.items?.length ?? 0}</p>
                </GlassCard>
              )}
              {(data.enrollments ?? []).length > 0 && (
                <GlassCard className="p-6">
                  <h3 className="font-display font-semibold">Enrolled subjects</h3>
                  <ul className="mt-2 flex flex-wrap gap-2">
                    {data.enrollments.map((e) => (
                      <Badge key={e.subjectCode ?? e.subjectName} variant="outline">{e.subjectName}{e.subjectCode ? ` (${e.subjectCode})` : ''}</Badge>
                    ))}
                  </ul>
                </GlassCard>
              )}
            </Tabs.Panel>

            <Tabs.Panel value="comms" className="space-y-4">
              {data.emailPreferences && (
                <GlassCard className="p-6">
                  <h3 className="font-display font-semibold">Email preferences</h3>
                  <dl className="mt-3 grid gap-2 text-sm sm:grid-cols-2">
                    {Object.entries(data.emailPreferences).filter(([k]) => k !== 'unsubscribedAllAt').map(([k, v]) => (
                      <div key={k} className="flex justify-between rounded-lg border border-border/40 px-3 py-2">
                        <dt className="capitalize text-muted-foreground">{k.replace(/([A-Z])/g, ' $1')}</dt>
                        <dd>{typeof v === 'boolean' ? (v ? 'On' : 'Off') : String(v)}</dd>
                      </div>
                    ))}
                  </dl>
                </GlassCard>
              )}
              <ContentTable
                title="Recent system emails"
                rows={data.recentEmails ?? []}
                columns={[
                  { key: 'templateKey', label: 'Template' },
                  { key: 'subject', label: 'Subject' },
                  { key: 'status', label: 'Status' },
                  { key: 'sentAt', label: 'Sent', render: (r) => formatDateTime(r.sentAt ?? r.createdAt) },
                ]}
              />
              <ContentTable
                title="Chat sessions"
                rows={data.chat?.sessions ?? []}
                columns={[
                  { key: 'title', label: 'Title' },
                  { key: 'contextType', label: 'Context' },
                  { key: 'messageCount', label: 'Messages' },
                  { key: 'lastMessageAt', label: 'Last active', render: (r) => formatDateTime(r.lastMessageAt) },
                ]}
              />
            </Tabs.Panel>
          </Tabs>
        </>
      )}
    </>
  );
};

export const OrganizationPreviewPage = () => {
  const { organizationId } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const activeTab = searchParams.get('tab') || 'overview';

  const linkContext = { organizationId: data?.organization?.id ?? organizationId };

  useEffect(() => {
    previewPlatformOrganization(organizationId)
      .then(setData)
      .catch((err) => notifications.show({ title: 'Preview', message: getErrorMessage(err), color: 'red' }))
      .finally(() => setLoading(false));
  }, [organizationId]);

  if (loading) return <PageLoader />;
  const org = data?.organization;
  const dashboard = data?.dashboard ?? {};
  const storage = dashboard.storageUsage ?? {};

  const usageStats = [
    { label: 'Total users', value: dashboard.users },
    { label: 'Students', value: dashboard.students ?? data?.counts?.students },
    { label: 'Teachers', value: dashboard.teachers ?? data?.counts?.teachers },
    { label: 'Subjects', value: dashboard.subjects },
    { label: 'Lessons', value: dashboard.lessons ?? data?.counts?.lessons },
    { label: 'Materials', value: dashboard.materials ?? data?.counts?.materials },
    { label: 'Quizzes', value: data?.counts?.quizzes },
    {
      label: 'AI requests (month)',
      value: dashboard.aiUsage?.requests ?? dashboard.aiUsage,
    },
    {
      label: 'Storage used',
      value: storage.usedMb != null ? `${storage.usedMb} MB` : null,
    },
  ].map((s) => ({ ...s, value: s.value ?? '—' }));

  return (
    <>
      <PageHeader title="Organization" gradientWord="preview" description="Read-only admin dashboard snapshot." />
      <Link to="/platform/organizations" className="mb-4 inline-block text-sm text-primary hover:underline">← Back to organizations</Link>
      {org && (
        <>
          <GlassCard className="mb-6 p-6">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <h2 className="font-display text-xl font-bold">{org.name}</h2>
                <p className="text-sm text-muted-foreground">{org.slug}</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  <AdesiaBadge status="success">{org.subscriptionPlan}</AdesiaBadge>
                  {org.isPersonalWorkspace && <AdesiaBadge status="draft">Personal workspace</AdesiaBadge>}
                </div>
              </div>
              <dl className="grid gap-2 text-sm sm:grid-cols-2">
                <div><dt className="text-muted-foreground">Created</dt><dd>{formatDateTime(org.createdAt)}</dd></div>
                <div><dt className="text-muted-foreground">Plan</dt><dd>{org.subscriptionPlan}</dd></div>
              </dl>
            </div>
          </GlassCard>

          <Tabs
            value={activeTab}
            onChange={(value) => setSearchParams(value === 'overview' ? {} : { tab: value }, { replace: true })}
            className="space-y-4"
          >
            <Tabs.List>
              <Tabs.Tab value="overview">Overview</Tabs.Tab>
              <Tabs.Tab value="usage">Usage & metrics</Tabs.Tab>
              <Tabs.Tab value="links">Platform links</Tabs.Tab>
            </Tabs.List>

            <Tabs.Panel value="overview" className="space-y-4">
              <StatGrid stats={Object.entries(data.counts ?? {}).map(([label, value]) => ({
                label: label.replace(/([A-Z])/g, ' $1').trim(),
                value,
              }))} />

              {(data.quickActions ?? []).length > 0 && (
                <GlassCard className="p-6">
                  <h3 className="mb-3 font-display font-semibold">Quick actions</h3>
                  <div className="flex flex-wrap gap-2">
                    {data.quickActions.map((action) => (
                      <PreviewNavLink
                        key={action.path}
                        to={resolvePreviewPortalLink(action.path, linkContext)}
                        className="rounded-lg border border-border/60 px-3 py-1.5 text-sm text-primary hover:border-primary/40 hover:bg-primary/5"
                      >
                        {action.label}
                      </PreviewNavLink>
                    ))}
                  </div>
                </GlassCard>
              )}
            </Tabs.Panel>

            <Tabs.Panel value="usage" className="space-y-4">
              <StatGrid stats={usageStats} />
              {dashboard.totalTopics != null && (
                <GlassCard className="p-4 text-sm">
                  Teaching overview: {dashboard.totalTopics} topics · {dashboard.completedTopics ?? 0} completed
                </GlassCard>
              )}
            </Tabs.Panel>

            <Tabs.Panel value="links">
              <LinkList
                links={data.portalLinks}
                title="Organization portal links"
                linkContext={linkContext}
                hint="Platform pages filtered to this organization."
              />
            </Tabs.Panel>
          </Tabs>
        </>
      )}
    </>
  );
};
