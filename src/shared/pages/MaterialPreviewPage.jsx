import { useEffect, useMemo, useState } from 'react';
import { Link, useLocation, useParams } from 'react-router-dom';
import { Anchor, Breadcrumbs, Tabs, TextInput } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import {
  ArrowLeft, ChevronRight, ExternalLink, FileText, Pause, Play, Search, Volume2,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { PageHeader } from '../components/PageShell';
import { EmptyOrgHint } from '../components/PageLoader';
import { PageHeaderSkeleton } from '../components/TableSkeleton';
import StatusBadge from '../components/StatusBadge';
import { GradientButton } from '../components/GradientButton';
import { useMaterialSpeech } from '../hooks/useMaterialSpeech';
import { formatDateTime, getErrorMessage } from '../utils/formatters';
import {
  getMaterial as getStudentMaterial,
  getMaterialChunks as getStudentMaterialChunks,
} from '../../Features/Student/services/student.services';
import {
  getMaterial as getOrgMaterial,
  getMaterialChunks as getOrgMaterialChunks,
} from '../../Features/Organization/services/organization.services';

const getYoutubeEmbedUrl = (url) => {
  if (!url) return null;
  const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\s?/]+)/);
  return match?.[1] ? `https://www.youtube.com/embed/${match[1]}` : null;
};

const MaterialPreviewPage = () => {
  const { materialId } = useParams();
  const location = useLocation();
  const { organizationId, user } = useAuth();
  const [material, setMaterial] = useState(null);
  const [chunks, setChunks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [chunkSearch, setChunkSearch] = useState('');
  const [speechSource, setSpeechSource] = useState('summary');
  const { speak, stop, speaking, supported } = useMaterialSpeech();

  const isStudent = location.pathname.startsWith('/student');
  const isTeacher = location.pathname.startsWith('/teacher');

  const returnTo = location.state?.returnTo ?? (isStudent ? '/student/dashboard' : null);
  const returnLabel = returnTo?.startsWith('/student/lessons/')
    ? 'Lesson'
    : returnTo === '/student/self-learn'
      ? 'Self-learn'
      : returnTo === '/student/dashboard'
        ? 'Dashboard'
        : 'Back';

  const materialsPath = isStudent
    ? (returnTo?.startsWith('/student/lessons/') ? returnTo : '/student/self-learn')
    : isTeacher
      ? '/teacher/materials'
      : '/admin/materials';

  const getMaterial = isStudent ? getStudentMaterial : getOrgMaterial;
  const getMaterialChunks = isStudent ? getStudentMaterialChunks : getOrgMaterialChunks;

  const isOwnUpload = material?.uploadedBy && user?.id && material.uploadedBy === user.id;

  useEffect(() => {
    if (!organizationId || !materialId) return;

    setLoading(true);
    Promise.all([
      getMaterial(materialId, organizationId),
      getMaterialChunks(materialId, organizationId).catch(() => []),
    ])
      .then(([mat, chunkData]) => {
        setMaterial(mat);
        setChunks(Array.isArray(chunkData) ? chunkData : chunkData?.items ?? []);
      })
      .catch((err) => {
        notifications.show({ title: 'Error', message: getErrorMessage(err), color: 'red' });
      })
      .finally(() => setLoading(false));
  }, [organizationId, materialId, isStudent]);

  const filteredChunks = useMemo(() => {
    if (!chunkSearch.trim()) return chunks;
    const q = chunkSearch.toLowerCase();
    return chunks.filter((c) => c.content?.toLowerCase().includes(q));
  }, [chunks, chunkSearch]);

  const fullSpeechText = useMemo(() => {
    if (speechSource === 'summary' && material?.summary) return material.summary;
    if (speechSource === 'full') {
      return chunks.map((c) => c.content).filter(Boolean).join('\n\n');
    }
    return '';
  }, [speechSource, material, chunks]);

  const handleListen = () => {
    if (speaking) {
      stop();
      return;
    }
    const ok = speak(fullSpeechText);
    if (!ok) {
      notifications.show({
        title: 'Unavailable',
        message: supported ? 'No text available to read aloud.' : 'Speech is not supported in this browser.',
        color: 'blue',
      });
    }
  };

  if (!organizationId) return <EmptyOrgHint />;

  const youtubeEmbed = getYoutubeEmbedUrl(material?.sourceUrl);
  const isComplete = material?.processingStatus === 'COMPLETED';

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
        <PageHeaderSkeleton />
      ) : (
        <PageHeader
          title={material?.title || 'Material'}
          gradientWord={isStudent ? undefined : 'preview'}
          description="Review extracted content, summary, and listen with text-to-speech."
        />
      )}

      {isStudent && !loading && material && isOwnUpload && (
        <p className="mb-4 text-xs text-muted-foreground">Your upload · Self-learn</p>
      )}

      {!loading && material && (
        <div className="space-y-6">
          <div className="glass-card grid gap-4 p-5 sm:grid-cols-2 lg:grid-cols-4">
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
              <p className="mt-1 font-medium">{material.chunkCount ?? chunks.length ?? 0}</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-wide text-muted-foreground">Uploaded</p>
              <p className="mt-1 font-medium">{formatDateTime(material.createdAt)}</p>
            </div>
          </div>

          {material.type === 'PDF' && material.r2Url && (
            <div className="glass-card overflow-hidden p-1">
              <div className="flex items-center justify-between border-b border-border/50 px-4 py-3">
                <div className="flex items-center gap-2 text-sm font-medium">
                  <FileText className="h-4 w-4 text-primary" />
                  PDF document
                </div>
                <a href={material.r2Url} target="_blank" rel="noreferrer" className="btn-outline !px-2 !py-1 text-xs">
                  <ExternalLink className="h-3.5 w-3.5" />
                  Open in new tab
                </a>
              </div>
              <iframe
                title={material.title}
                src={material.r2Url}
                className="h-[480px] w-full bg-muted/20"
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

          {material.type === 'TEXT' && material.summary && (
            <div className="glass-card p-5">
              <h3 className="mb-2 text-sm font-semibold">Original notes</h3>
              <p className="whitespace-pre-wrap text-sm leading-relaxed text-foreground">
                {material.summary}
              </p>
            </div>
          )}

          <Tabs defaultValue="summary" classNames={{ list: 'mb-4 flex-wrap gap-1 rounded-xl border border-border/50 bg-card/50 p-1' }}>
            <Tabs.List>
              <Tabs.Tab value="summary">Summary</Tabs.Tab>
              <Tabs.Tab value="content">Content</Tabs.Tab>
              <Tabs.Tab value="speech" leftSection={<Volume2 className="h-3.5 w-3.5" />}>
                Speech
              </Tabs.Tab>
            </Tabs.List>

            <Tabs.Panel value="summary">
              <div className="glass-card p-5">
                {material.summary ? (
                  <p className="whitespace-pre-wrap text-sm leading-relaxed text-foreground">{material.summary}</p>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    {isComplete ? 'No summary was generated for this material.' : 'Summary will appear after processing completes.'}
                  </p>
                )}
                {material.description && (
                  <p className="mt-4 border-t border-border/50 pt-4 text-sm text-muted-foreground">{material.description}</p>
                )}
              </div>
            </Tabs.Panel>

            <Tabs.Panel value="content">
              <div className="mb-4 max-w-md">
                <TextInput
                  placeholder="Search within content…"
                  leftSection={<Search className="h-4 w-4 text-muted-foreground" />}
                  value={chunkSearch}
                  onChange={(e) => setChunkSearch(e.target.value)}
                />
              </div>
              {!isComplete ? (
                <div className="glass-card p-5 text-sm text-muted-foreground">
                  Content chunks will be available once processing is complete.
                </div>
              ) : filteredChunks.length === 0 ? (
                <div className="glass-card p-5 text-sm text-muted-foreground">
                  {chunkSearch ? 'No chunks match your search.' : 'No content chunks found.'}
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredChunks.map((chunk) => (
                    <div key={chunk.id || chunk.chunkIndex} className="glass-card p-4">
                      <p className="mb-2 text-xs font-medium text-muted-foreground">
                        Chunk {chunk.chunkIndex + 1}
                      </p>
                      <p className="whitespace-pre-wrap text-sm leading-relaxed">{chunk.content}</p>
                    </div>
                  ))}
                </div>
              )}
            </Tabs.Panel>

            <Tabs.Panel value="speech">
              <div className="glass-card space-y-5 p-5">
                <div>
                  <p className="text-sm text-muted-foreground">
                    Listen to the material using your browser&apos;s text-to-speech. Choose summary or full extracted text.
                  </p>
                </div>

                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    className={`btn-outline !px-3 !py-1.5 text-xs ${speechSource === 'summary' ? '!border-primary !text-primary' : ''}`}
                    onClick={() => setSpeechSource('summary')}
                  >
                    Summary
                  </button>
                  <button
                    type="button"
                    className={`btn-outline !px-3 !py-1.5 text-xs ${speechSource === 'full' ? '!border-primary !text-primary' : ''}`}
                    onClick={() => setSpeechSource('full')}
                    disabled={!chunks.length}
                  >
                    Full content
                  </button>
                </div>

                <div className="rounded-lg border border-border/50 bg-muted/20 p-4">
                  <p className="max-h-40 overflow-y-auto whitespace-pre-wrap text-sm text-muted-foreground">
                    {fullSpeechText || 'No text available for the selected source.'}
                  </p>
                </div>

                <GradientButton
                  type="button"
                  onClick={handleListen}
                  disabled={!fullSpeechText.trim() || !supported}
                  className="!px-4 !py-2"
                >
                  {speaking ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                  {speaking ? 'Stop' : 'Listen'}
                </GradientButton>
              </div>
            </Tabs.Panel>
          </Tabs>
        </div>
      )}
    </>
  );
};

export default MaterialPreviewPage;
