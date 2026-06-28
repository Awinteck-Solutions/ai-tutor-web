import { useCallback, useEffect, useState } from 'react';
import { Select } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import {
  CheckCircle2, Circle, FileUp, Link as LinkIcon, RefreshCw, Sparkles,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { GlassCard } from '../../../shared/components/GlassCard';
import { GradientButton } from '../../../shared/components/GradientButton';
import StatusBadge from '../../../shared/components/StatusBadge';
import { platformContentPath } from '../platform.paths';
import PlatformMarketplaceUploadModal from './PlatformMarketplaceUploadModal';
import PlatformMarketplaceGenerateModal from './PlatformMarketplaceGenerateModal';
import {
  getMaterials,
  getSubjectsList,
  getTopicsList,
} from '../../Organization/services/organization.services';

export default function PlatformMarketplaceLessonBuilder({
  organizationId,
  organizationName,
  workspace,
  onGenerated,
}) {
  const [subjects, setSubjects] = useState([]);
  const [topics, setTopics] = useState([]);
  const [materials, setMaterials] = useState([]);
  const [subjectId, setSubjectId] = useState('');
  const [topicId, setTopicId] = useState('');
  const [uploadOpen, { open: openUpload, close: closeUpload }] = useDisclosure(false);
  const [generateOpen, { open: openGenerate, close: closeGenerate }] = useDisclosure(false);

  const loadMaterials = useCallback(async (tid) => {
    if (!organizationId || !tid) {
      setMaterials([]);
      return;
    }
    const data = await getMaterials(organizationId, { topicId: tid });
    setMaterials(Array.isArray(data) ? data : []);
  }, [organizationId]);

  useEffect(() => {
    if (!organizationId) return;
    getSubjectsList(organizationId)
      .then((items) => {
        setSubjects(items);
        const defaultSubjectId = workspace?.defaultSubject?.id;
        if (defaultSubjectId && items.some((s) => (s.id || s._id) === defaultSubjectId)) {
          setSubjectId(defaultSubjectId);
        }
      })
      .catch(() => setSubjects([]));
  }, [organizationId, workspace?.defaultSubject?.id]);

  useEffect(() => {
    if (!organizationId || !subjectId) {
      setTopics([]);
      setTopicId('');
      setMaterials([]);
      return;
    }
    getTopicsList(organizationId, subjectId)
      .then(async (items) => {
        setTopics(items);
        const defaultTopicId = workspace?.defaultTopic?.id;
        const nextTopicId =
          defaultTopicId && items.some((t) => (t.id || t._id) === defaultTopicId)
            ? defaultTopicId
            : items[0]?.id || items[0]?._id || '';
        setTopicId(nextTopicId);
        if (nextTopicId) await loadMaterials(nextTopicId);
      })
      .catch(() => {
        setTopics([]);
        setTopicId('');
      });
  }, [organizationId, subjectId, workspace?.defaultTopic?.id, loadMaterials]);

  const handleSubjectChange = (value) => {
    setSubjectId(value ?? '');
    setTopicId('');
    setMaterials([]);
  };

  const handleTopicChange = async (value) => {
    setTopicId(value ?? '');
    await loadMaterials(value);
  };

  const readyMaterials = materials.filter((m) => m.processingStatus === 'COMPLETED');
  const processingMaterials = materials.filter((m) => m.processingStatus !== 'COMPLETED');
  const curriculumReady = Boolean(subjectId && topicId);
  const materialsReady = readyMaterials.length > 0;

  if (!organizationId) {
    return (
      <GlassCard className="p-6 text-sm text-muted-foreground">
        Loading platform workspace…
      </GlassCard>
    );
  }

  return (
    <>
      <GlassCard className="flex flex-wrap items-center justify-between gap-3 border border-primary/20 bg-primary/5 p-4">
        <div className="text-sm text-muted-foreground">
          <span className="font-medium text-foreground">{organizationName}</span>
          {workspace?.defaultSubject?.name && <> · {workspace.defaultSubject.name}</>}
        </div>
        <Link
          to={platformContentPath({ organizationId, type: 'materials' })}
          className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
        >
          <LinkIcon className="h-3 w-3" />
          Manage all materials
        </Link>
      </GlassCard>

      <div className="grid gap-4 lg:grid-cols-3">
        <StepCard
          step={1}
          title="Curriculum"
          complete={curriculumReady}
          description="Choose where source materials live in your workspace."
        >
          <div className="space-y-3">
            <Select
              label="Subject"
              placeholder="Select subject"
              searchable
              size="sm"
              data={subjects.map((subject) => ({
                value: subject.id || subject._id,
                label: subject.name,
              }))}
              value={subjectId || null}
              onChange={handleSubjectChange}
            />
            <Select
              label="Topic"
              placeholder="Select topic"
              searchable
              size="sm"
              data={topics.map((topic) => ({
                value: topic.id || topic._id,
                label: topic.name,
              }))}
              value={topicId || null}
              onChange={handleTopicChange}
            />
          </div>
        </StepCard>

        <StepCard
          step={2}
          title="Source materials"
          complete={materialsReady}
          description="Upload PDFs, text, or YouTube videos for AI to build from."
        >
          <div className="space-y-3">
            <div className="rounded-xl border border-border/50 bg-muted/20 p-3 text-sm">
              <p className="font-medium text-foreground">{readyMaterials.length} ready</p>
              <p className="text-xs text-muted-foreground">
                {processingMaterials.length} processing · {materials.length} total
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <GradientButton
                type="button"
                className="!px-3 !py-2"
                disabled={!topicId}
                onClick={openUpload}
              >
                <FileUp className="h-4 w-4" />
                Upload material
              </GradientButton>
              <button
                type="button"
                className="inline-flex items-center gap-1 rounded-lg border border-border/60 px-3 py-2 text-xs text-primary hover:bg-muted/30"
                onClick={() => loadMaterials(topicId)}
              >
                <RefreshCw className="h-3 w-3" />
                Refresh
              </button>
            </div>
            {materials.length > 0 && (
              <ul className="max-h-28 space-y-1 overflow-y-auto text-xs">
                {materials.slice(0, 6).map((material) => (
                  <li
                    key={material.id || material._id}
                    className="flex items-center justify-between gap-2 rounded-lg border border-border/40 px-2 py-1.5"
                  >
                    <span className="truncate">{material.title || material.name}</span>
                    <StatusBadge status={material.processingStatus} />
                  </li>
                ))}
                {materials.length > 6 && (
                  <li className="px-2 py-1 text-muted-foreground">+{materials.length - 6} more</li>
                )}
              </ul>
            )}
          </div>
        </StepCard>

        <StepCard
          step={3}
          title="Generate listing"
          complete={false}
          description="Configure lesson settings and create a draft marketplace listing."
        >
          <div className="space-y-3">
            <div className="rounded-xl border border-dashed border-border/60 p-4 text-sm text-muted-foreground">
              {materialsReady
                ? `${readyMaterials.length} material${readyMaterials.length === 1 ? '' : 's'} ready for generation.`
                : 'Upload and wait for at least one material to finish processing.'}
            </div>
            <GradientButton
              type="button"
              className="w-full !px-3 !py-2"
              disabled={!materialsReady || !topicId}
              onClick={openGenerate}
            >
              <Sparkles className="h-4 w-4" />
              Configure & generate
            </GradientButton>
          </div>
        </StepCard>
      </div>

      <PlatformMarketplaceUploadModal
        opened={uploadOpen}
        onClose={closeUpload}
        organizationId={organizationId}
        topicId={topicId}
        onUploaded={() => loadMaterials(topicId)}
      />

      <PlatformMarketplaceGenerateModal
        opened={generateOpen}
        onClose={closeGenerate}
        organizationId={organizationId}
        topicId={topicId}
        readyMaterials={readyMaterials}
        onGenerated={onGenerated}
      />
    </>
  );
}

function StepCard({ step, title, complete, description, children }) {
  return (
    <GlassCard className="flex h-full flex-col gap-4 p-4 sm:p-5">
      <div className="flex items-start gap-3">
        <div
          className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${
            complete ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400' : 'bg-muted text-muted-foreground'
          }`}
        >
          {complete ? <CheckCircle2 className="h-4 w-4" /> : <Circle className="h-4 w-4" />}
        </div>
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Step {step}</p>
          <h3 className="font-display text-base font-semibold">{title}</h3>
          <p className="mt-1 text-sm text-muted-foreground">{description}</p>
        </div>
      </div>
      <div className="flex-1">{children}</div>
    </GlassCard>
  );
}
