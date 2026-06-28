import { useCallback, useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { notifications } from '@mantine/notifications';
import { PageHeader } from '../../../shared/components/PageShell';
import { GlassCard } from '../../../shared/components/GlassCard';
import { PageLoader } from '../../../shared/components/PageLoader';
import { formatDateTime, getErrorMessage } from '../../../shared/utils/formatters';
import { listPlatformContent, listPlatformOrganizations } from '../services/platform.services';
import { resolvePlatformPortalLink } from '../platform.paths';

const CONTENT_TYPES = [
  { value: 'lessons', label: 'Lessons' },
  { value: 'quizzes', label: 'Quizzes' },
  { value: 'materials', label: 'Materials' },
];

const ContentPage = () => {
  const [searchParams] = useSearchParams();
  const [type, setType] = useState(searchParams.get('type') || 'lessons');
  const [search, setSearch] = useState('');
  const [organizationId, setOrganizationId] = useState(searchParams.get('organizationId') || '');
  const [items, setItems] = useState([]);
  const [organizations, setOrganizations] = useState([]);
  const [loading, setLoading] = useState(true);

  const reload = useCallback(() => {
    setLoading(true);
    Promise.all([
      listPlatformContent({ type, search: search || undefined, organizationId: organizationId || undefined, limit: 50 }),
      listPlatformOrganizations({ limit: 100 }),
    ])
      .then(([content, orgs]) => {
        setItems(content.items ?? []);
        setOrganizations(orgs.items ?? []);
      })
      .catch((err) => notifications.show({ title: 'Content', message: getErrorMessage(err), color: 'red' }))
      .finally(() => setLoading(false));
  }, [type, search, organizationId]);

  useEffect(() => { reload(); }, [reload]);

  return (
    <>
      <PageHeader
        title="Content"
        gradientWord="preview"
        description="Browse lessons, quizzes, and materials across all organizations."
      />

      <GlassCard className="mb-4 flex flex-wrap gap-3 p-4">
        <select value={type} onChange={(e) => setType(e.target.value)} className="rounded-xl border border-border/60 bg-background px-3 py-2 text-sm">
          {CONTENT_TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
        </select>
        <select value={organizationId} onChange={(e) => setOrganizationId(e.target.value)} className="rounded-xl border border-border/60 bg-background px-3 py-2 text-sm">
          <option value="">All organizations</option>
          {organizations.map((o) => <option key={o.id} value={o.id}>{o.name}</option>)}
        </select>
        <input
          type="search"
          placeholder="Search title"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 rounded-xl border border-border/60 bg-background px-3 py-2 text-sm"
        />
        <button type="button" onClick={reload} className="rounded-xl bg-primary px-4 py-2 text-sm text-primary-foreground">Search</button>
      </GlassCard>

      {loading ? <PageLoader /> : (
        <GlassCard className="overflow-hidden p-0">
          <table className="w-full text-left text-sm">
            <thead className="bg-muted/40 text-xs uppercase text-muted-foreground">
              <tr>
                <th className="px-4 py-3">Title</th>
                <th className="px-4 py-3">Organization</th>
                <th className="px-4 py-3">Created</th>
                <th className="px-4 py-3">Preview</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={item.id} className="border-t border-border/40">
                  <td className="px-4 py-3">
                    <div className="font-medium">{item.title}</div>
                    {item.lessonTitle && <div className="text-xs text-muted-foreground">Lesson: {item.lessonTitle}</div>}
                  </td>
                  <td className="px-4 py-3">{item.organizationName ?? '—'}</td>
                  <td className="px-4 py-3 text-muted-foreground">{formatDateTime(item.createdAt)}</td>
                  <td className="px-4 py-3">
                    {item.previewPath ? (
                      <Link
                        to={resolvePlatformPortalLink(item.previewPath, {
                          organizationId: item.organizationId,
                        })}
                        className="text-primary hover:underline"
                      >
                        Open preview
                      </Link>
                    ) : (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </GlassCard>
      )}
    </>
  );
};

export default ContentPage;
