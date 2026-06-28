import { useEffect, useState } from 'react';
import { Link, useLocation, useParams } from 'react-router-dom';
import { Anchor, Breadcrumbs } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import {
  ArrowLeft, ChevronRight, ExternalLink, FileText,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { usePreviewOrganizationId } from '../hooks/usePreviewOrganizationId';
import { platformContentPath } from '../../Features/Platform/platform.paths';
import { PageHeader } from '../components/PageShell';
import { EmptyOrgHint } from '../components/PageLoader';
import { ContentFadeIn, MaterialPreviewSkeleton } from '../components/LoadingPrimitives';
import StatusBadge from '../components/StatusBadge';
import MarkdownContent from '../components/MarkdownContent';
import { formatDateTime, getErrorMessage } from '../utils/formatters';
import {
  getMaterial as getStudentMaterial,
} from '../../Features/Student/services/student.services';
import {
  getMaterial as getOrgMaterial,
} from '../../Features/Organization/services/organization.services';

const getYoutubeEmbedUrl = (url) => {
  if (!url) return null;
  const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\s?/]+)/);
  return match?.[1] ? `https://www.youtube.com/embed/${match[1]}` : null;
};

const MaterialPreviewPage = () => {
  const { materialId } = useParams();
  const location = useLocation();
  const organizationId = usePreviewOrganizationId();
  const { user } = useAuth();
  const [material, setMaterial] = useState(null);
  const [loading, setLoading] = useState(true);

  const isStudent = location.pathname.startsWith('/student');
  const isTeacher = location.pathname.startsWith('/teacher');
  const isPlatform = location.pathname.startsWith('/platform');

  const returnTo = location.state?.returnTo ?? (isStudent ? '/student/dashboard' : null);
  const returnLabel = returnTo?.startsWith('/student/lessons/')
    ? 'Lesson'
    : returnTo === '/student/self-learn'
      ? 'Self-learn'
      : returnTo === '/student/dashboard'
        ? 'Dashboard'
        : 'Back';

  const materialsPath = isPlatform
    ? platformContentPath({ organizationId, type: 'materials' })
    : isStudent
      ? (returnTo?.startsWith('/student/lessons/') ? returnTo : '/student/self-learn')
      : isTeacher
        ? '/teacher/materials'
        : '/admin/materials';

  const isOwnUpload = material?.uploadedBy && user?.id && material.uploadedBy === user.id;

  useEffect(() => {
    if (!organizationId || !materialId) return;

    const fetchMaterial = isStudent ? getStudentMaterial : getOrgMaterial;

    setLoading(true);
    fetchMaterial(materialId, organizationId)
      .then(setMaterial)
      .catch((err) => {
        notifications.show({ title: 'Error', message: getErrorMessage(err), color: 'red' });
      })
      .finally(() => setLoading(false));
  }, [organizationId, materialId, isStudent]);

  if (!organizationId) return <EmptyOrgHint />;

  const youtubeEmbed = getYoutubeEmbedUrl(material?.sourceUrl);
  const isComplete = material?.processingStatus === 'COMPLETED';
  const originalText = material?.rawText || material?.summary;

  const backLink = returnTo ? (
    <Link
      to={returnTo}
      className="mb-6 inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
    >
      <ArrowLeft className="h-4 w-4" />
      Back
    </Link>
  ) : (
    <Link
      to={materialsPath}
      className="mb-6 inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
    >
      <ArrowLeft className="h-4 w-4" />
      {isStudent ? 'Back to Self-learn' : 'Back to materials'}
    </Link>
  );

  return (
    <>
      {isStudent && returnTo && returnTo !== '/student/dashboard' && (
        <Breadcrumbs separator={<ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />} mb="md">
          <Anchor component={Link} to="/student/dashboard" size="sm" c="dimmed">
            Dashboard
          </Anchor>
          <Anchor component={Link} to={returnTo} size="sm" c="dimmed">
            {returnLabel}
          </Anchor>
          <Anchor size="sm">{material?.title ?? 'Material'}</Anchor>
        </Breadcrumbs>
      )}

      {!isStudent || !returnTo || returnTo === '/student/dashboard' ? backLink : null}

      {loading ? (
        <MaterialPreviewSkeleton />
      ) : (
        <ContentFadeIn>
        <PageHeader
          title={material?.title || 'Material'}
          gradientWord={isStudent ? undefined : 'preview'}
          description="Review your upload, summary, and embedded preview."
        />

      {isStudent && material && isOwnUpload && (
        <p className="mb-4 text-xs text-muted-foreground">Your upload · Self-learn</p>
      )}

      {material && (
        <div className="min-w-0 space-y-6">
          <div className="glass-card grid gap-4 p-4 sm:grid-cols-2 sm:p-5 lg:grid-cols-4">
            <div>
              <p className="text-xs uppercase tracking-wide text-muted-foreground">Type</p>
              <p className="mt-1 font-medium">{material.type || '—'}</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-wide text-muted-foreground">Status</p>
              <div className="mt-1">
                <StatusBadge status={material.processingStatus} />
              </div>
            </div>
            <div>
              <p className="text-xs uppercase tracking-wide text-muted-foreground">Chunks</p>
              <p className="mt-1 font-medium">{material.chunkCount ?? 0}</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-wide text-muted-foreground">Uploaded</p>
              <p className="mt-1 font-medium">{formatDateTime(material.createdAt)}</p>
            </div>
          </div>

          {material.type === 'PDF' && material.r2Url && (
            <div className="glass-card min-w-0 overflow-hidden p-1">
              <div className="flex flex-col gap-2 border-b border-border/50 px-3 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-4">
                <div className="flex items-center gap-2 text-sm font-medium">
                  <FileText className="h-4 w-4 shrink-0 text-primary" />
                  PDF document
                </div>
                <a
                  href={material.r2Url}
                  target="_blank"
                  rel="noreferrer"
                  className="btn-outline inline-flex w-full items-center justify-center gap-1.5 !px-2 !py-1.5 text-xs sm:w-auto"
                >
                  <ExternalLink className="h-3.5 w-3.5" />
                  Open in new tab
                </a>
              </div>
              <iframe
                title={material.title}
                src={material.r2Url}
                className="h-[min(70dvh,560px)] min-h-[280px] w-full bg-muted/20 sm:h-[480px]"
              />
            </div>
          )}

          {material.type === 'YOUTUBE' && youtubeEmbed && (
            <div className="glass-card overflow-hidden p-1">
              <div className="aspect-video w-full">
                <iframe
                  title={material.title}
                  src={youtubeEmbed}
                  className="h-full w-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
            </div>
          )}

          {material.type === 'TEXT' && originalText && (
            <div className="glass-card p-4 sm:p-5">
              <h3 className="mb-3 text-sm font-semibold">Original notes</h3>
              <MarkdownContent content={originalText} variant="chat" />
            </div>
          )}

          <div className="min-w-0">
            <h3 className="mb-3 font-display text-sm font-semibold text-foreground">Summary</h3>
            <div className="glass-card p-4 sm:p-5">
              {material.summary ? (
                <MarkdownContent content={material.summary} variant="chat" />
              ) : (
                <p className="text-sm text-muted-foreground">
                  {isComplete ? 'No summary was generated for this material.' : 'Summary will appear after processing completes.'}
                </p>
              )}
              {material.description && (
                <div className="mt-4 border-t border-border/50 pt-4">
                  <MarkdownContent content={material.description} />
                </div>
              )}
            </div>
          </div>
        </div>
      )}
        </ContentFadeIn>
      )}
    </>
  );
};

export default MaterialPreviewPage;
