import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Collapse,
  Progress,
  Select,
  Tabs,
  Textarea,
  TextInput,
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { notifications } from '@mantine/notifications';
import {
  ArrowLeft,
  BookOpen,
  Brain,
  ChevronDown,
  CreditCard,
  FileUp,
  Layers,
  Loader2,
  MessageSquare,
  Plus,
  RefreshCw,
  Sparkles,
  Trash2,
  Upload,
} from 'lucide-react';
import { useAuth } from '../../../shared/context/AuthContext';
import { PageHeader } from '../../../shared/components/PageShell';
import {
  SelfLearnDetailSkeleton,
  SelfLearnLessonsListSkeleton,
  SelfLearnMaterialsSkeleton,
} from '../../../shared/components/LoadingPrimitives';
import ListGridToolbar, { filterSelectClass } from '../../../shared/components/ListGridToolbar';
import DataListFooter from '../../../shared/components/DataListFooter';
import { useServerList } from '../../../shared/hooks/useServerList';
import { GlassCard } from '../../../shared/components/GlassCard';
import { GradientButton, GhostButton } from '../../../shared/components/GradientButton';
import { AdesiaModal } from '../../../shared/components/AdesiaModal';
import { PdfDropzone } from '../../../shared/components/PdfDropzone';
import StatusBadge from '../../../shared/components/StatusBadge';
import { formatBytes, getErrorMessage } from '../../../shared/utils/formatters';
import { titleFromFilename } from '../../../shared/utils/materialUpload';
import {
  addMaterialsToPersonalLesson,
  createPersonalLesson,
  createPersonalLessonFromMaterials,
  deletePersonalLesson,
  deleteSelfStudyMaterial,
  generateLessonFlashcards,
  generateLessonQuiz,
  getSelfStudyStatus,
  getSubscription,
  regeneratePersonalLesson,
  listPersonalLessons,
  listSelfStudyMaterials,
  listLessonGroups,
  uploadSelfStudyPdf,
  uploadSelfStudyText,
  uploadSelfStudyYoutube,
} from '../services/student.services';
import LessonGroupManager from '../components/LessonGroupManager';
import AddToCollectionModal from '../components/AddToCollectionModal';
import ContinueLearningCard from '../components/ContinueLearningCard';

const DIFFICULTIES = [
  { value: 'easy', label: 'Easy' },
  { value: 'medium', label: 'Medium' },
  { value: 'hard', label: 'Hard' },
];

const STUDENT_LEVEL_OPTIONS = [
  { value: 'beginner', label: 'Beginner' },
  { value: 'intermediate', label: 'Intermediate' },
  { value: 'advanced', label: 'Advanced' },
];

const COUNT_OPTIONS = [
  { value: '5', label: '5' },
  { value: '10', label: '10' },
  { value: '15', label: '15' },
  { value: '20', label: '20' },
];

const ActionCard = ({
  icon: Icon, title, description, onClick, disabled, loading, href,
}) => {
  const inner = (
    <>
      <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
        <Icon className="h-5 w-5 text-primary" />
      </div>
      <p className="font-display font-semibold text-foreground">{title}</p>
      <p className="mt-1 text-sm text-muted-foreground">{description}</p>
      {loading && <Loader2 className="absolute right-4 top-4 h-4 w-4 animate-spin text-primary" />}
    </>
  );

  const className = `relative flex flex-col rounded-xl border border-border/50 bg-muted/15 p-4 text-left transition hover:border-primary/30 hover:bg-primary/5 disabled:opacity-50 ${disabled ? 'pointer-events-none' : ''}`;

  if (href && !disabled) {
    return (
      <Link to={href} className={`${className} no-underline`}>
        {inner}
      </Link>
    );
  }

  return (
    <button type="button" className={className} onClick={onClick} disabled={disabled || loading}>
      {inner}
    </button>
  );
};

const GENERATION_STATUS_OPTIONS = [
  { value: 'all', label: 'All statuses' },
  { value: 'COMPLETED', label: 'Ready' },
  { value: 'FAILED', label: 'Failed' },
  { value: 'PROCESSING', label: 'Processing' },
  { value: 'PENDING', label: 'Pending' },
  { value: 'QUEUED', label: 'Queued' },
];

const MATERIAL_STATUS_OPTIONS = [
  { value: 'all', label: 'All statuses' },
  { value: 'COMPLETED', label: 'Ready' },
  { value: 'FAILED', label: 'Failed' },
  { value: 'PROCESSING', label: 'Processing' },
  { value: 'PENDING', label: 'Pending' },
  { value: 'QUEUED', label: 'Queued' },
];

const SELF_LEARN_LESSONS_PAGE_SIZE = 9;
const SELF_LEARN_MATERIALS_PAGE_SIZE = 10;

const usagePct = (used, limit) => {
  if (!limit) return 0;
  return Math.min(100, Math.round((used / limit) * 100));
};

const SelfLearnPage = () => {
  const { organizationId } = useAuth();
  const [homeTab, setHomeTab] = useState('lessons');
  const [activeLesson, setActiveLesson] = useState(null);
  const [status, setStatus] = useState(null);
  const [statusLoading, setStatusLoading] = useState(false);
  const [creating, setCreating] = useState(false);
  const [generating, setGenerating] = useState(null);
  const [fcOptionsOpen, setFcOptionsOpen] = useState(false);
  const [quizOptionsOpen, setQuizOptionsOpen] = useState(false);
  const [fcCount, setFcCount] = useState('10');
  const [fcDiff, setFcDiff] = useState('medium');
  const [quizCount, setQuizCount] = useState('10');
  const [quizDiff, setQuizDiff] = useState('medium');

  const [createOpen, { open: openCreate, close: closeCreate }] = useDisclosure(false);
  const [createMode, setCreateMode] = useState(null);
  const [title, setTitle] = useState('');
  const [prompt, setPrompt] = useState('');
  const [studentLevel, setStudentLevel] = useState('intermediate');
  const [selectedMaterialIds, setSelectedMaterialIds] = useState([]);

  const [retryOpen, { open: openRetry, close: closeRetry }] = useDisclosure(false);
  const [retryPrompt, setRetryPrompt] = useState('');
  const [retryStudentLevel, setRetryStudentLevel] = useState('intermediate');
  const [reprocessing, setReprocessing] = useState(false);

  const [deleteOpen, { open: openDelete, close: closeDelete }] = useDisclosure(false);
  const [materialToDelete, setMaterialToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const [deleteLessonOpen, { open: openDeleteLesson, close: closeDeleteLesson }] = useDisclosure(false);
  const [lessonToDelete, setLessonToDelete] = useState(null);
  const [deletingLesson, setDeletingLesson] = useState(false);

  const [addMaterialsOpen, { open: openAddMaterials, close: closeAddMaterials }] = useDisclosure(false);
  const [addMaterialIds, setAddMaterialIds] = useState([]);
  const [addingMaterials, setAddingMaterials] = useState(false);
  const [availableMaterials, setAvailableMaterials] = useState([]);

  const [uploadOpen, { open: openUpload, close: closeUpload }] = useDisclosure(false);
  const [uploadType, setUploadType] = useState('pdf');
  const [uploading, setUploading] = useState(false);
  const [file, setFile] = useState(null);
  const [pdfTitle, setPdfTitle] = useState('');
  const [pdfDescription, setPdfDescription] = useState('');
  const [textForm, setTextForm] = useState({ title: '', content: '', description: '' });
  const [youtubeForm, setYoutubeForm] = useState({ title: '', url: '', description: '' });
  const [subscription, setSubscription] = useState(null);
  const [lessonGroups, setLessonGroups] = useState([]);
  const [createGroupId, setCreateGroupId] = useState('');

  const [collectionOpen, { open: openCollection, close: closeCollection }] = useDisclosure(false);
  const [collectionLesson, setCollectionLesson] = useState(null);

  const reloadSubscription = useCallback(() => {
    if (!organizationId) return;
    getSubscription(organizationId).then(setSubscription).catch(() => setSubscription(null));
  }, [organizationId]);

  useEffect(() => {
    reloadSubscription();
  }, [reloadSubscription]);

  const reloadGroups = useCallback(() => {
    listLessonGroups(organizationId)
      .then((data) => setLessonGroups(data?.groups ?? []))
      .catch(() => setLessonGroups([]));
  }, [organizationId]);

  useEffect(() => {
    reloadGroups();
  }, [reloadGroups]);

  const fetchLessons = useCallback(async (params) => {
    if (!organizationId) {
      return { items: [], meta: { total: 0, totalPages: 1, page: 1, limit: params.limit } };
    }
    try {
      const query = {
        page: params.page,
        limit: params.limit,
        search: params.search || undefined,
      };
      if (params.generationStatus && params.generationStatus !== 'all') {
        query.generationStatus = params.generationStatus;
      }
      if (params.groupId && params.groupId !== 'all') {
        query.groupId = params.groupId;
      }
      return await listPersonalLessons(organizationId, query);
    } catch (err) {
      notifications.show({ title: 'Error', message: getErrorMessage(err), color: 'red' });
      return { items: [], meta: { total: 0, totalPages: 1, page: 1, limit: params.limit } };
    }
  }, [organizationId]);

  const fetchMaterials = useCallback(async (params) => {
    if (!organizationId) {
      return { items: [], meta: { total: 0, totalPages: 1, page: 1, limit: params.limit } };
    }
    try {
      const query = {
        page: params.page,
        limit: params.limit,
        search: params.search || undefined,
      };
      if (params.processingStatus && params.processingStatus !== 'all') {
        query.processingStatus = params.processingStatus;
      }
      return await listSelfStudyMaterials(organizationId, query);
    } catch (err) {
      notifications.show({ title: 'Error', message: getErrorMessage(err), color: 'red' });
      return { items: [], meta: { total: 0, totalPages: 1, page: 1, limit: params.limit } };
    }
  }, [organizationId]);

  const {
    items: lessons,
    loading: lessonsLoading,
    page: lessonPage,
    setPage: setLessonPage,
    search: lessonSearch,
    setSearch: setLessonSearch,
    filters: lessonFilters,
    setFilters: setLessonFilters,
    meta: lessonMeta,
    reload: reloadLessons,
    rangeStart: lessonRangeStart,
    rangeEnd: lessonRangeEnd,
  } = useServerList(fetchLessons, [organizationId], SELF_LEARN_LESSONS_PAGE_SIZE);

  const {
    items: materials,
    loading: materialsLoading,
    page: materialPage,
    setPage: setMaterialPage,
    search: materialSearch,
    setSearch: setMaterialSearch,
    filters: materialFilters,
    setFilters: setMaterialFilters,
    meta: materialMeta,
    reload: reloadMaterials,
    rangeStart: materialRangeStart,
    rangeEnd: materialRangeEnd,
  } = useServerList(fetchMaterials, [organizationId], SELF_LEARN_MATERIALS_PAGE_SIZE);

  useEffect(() => {
    const pending = materials.some(
      (m) => m.processingStatus && !['COMPLETED', 'FAILED'].includes(m.processingStatus),
    );
    if (!pending) return undefined;
    const t = setInterval(reloadMaterials, 5000);
    return () => clearInterval(t);
  }, [materials, reloadMaterials]);

  const [allReadyMaterials, setAllReadyMaterials] = useState([]);

  useEffect(() => {
    if (createMode !== 'files' || !organizationId) return;
    listSelfStudyMaterials(organizationId, { processingStatus: 'COMPLETED', limit: 50 })
      .then((data) => setAllReadyMaterials(data?.items ?? []))
      .catch(() => setAllReadyMaterials([]));
  }, [createMode, organizationId]);

  const readyMaterials = allReadyMaterials.length
    ? allReadyMaterials
    : materials.filter((m) => m.processingStatus === 'COMPLETED');

  const pollStatus = useCallback(async (lessonId, { silent = false } = {}) => {
    if (!organizationId || !lessonId) return;
    if (!silent) setStatusLoading(true);
    try {
      const data = await getSelfStudyStatus(organizationId, lessonId);
      setStatus(data);
      setActiveLesson(data?.lesson ?? { id: lessonId });
    } finally {
      if (!silent) setStatusLoading(false);
    }
  }, [organizationId]);

  useEffect(() => {
    if (!activeLesson?.id) return undefined;
    pollStatus(activeLesson.id);
    const t = setInterval(() => pollStatus(activeLesson.id, { silent: true }), 4000);
    return () => clearInterval(t);
  }, [activeLesson?.id, pollStatus]);

  const lessonReady = status?.lesson?.generationStatus === 'COMPLETED';
  const lessonFailed = status?.lesson?.generationStatus === 'FAILED';
  const lessonGenerating = ['PENDING', 'QUEUED', 'PROCESSING'].includes(
    status?.lesson?.generationStatus,
  );
  const runRegenerate = async (promptText, level = retryStudentLevel) => {
    if (!organizationId || !activeLesson?.id) return;
    const fromMaterials = status?.lesson?.hasSourceMaterials;
    setReprocessing(true);
    try {
      const payload = { studentLevel: level };
      if (promptText?.trim()) payload.prompt = promptText.trim();
      await regeneratePersonalLesson(organizationId, activeLesson.id, payload);
      notifications.show({
        title: fromMaterials ? 'Rebuild started' : 'Lesson ready',
        message: fromMaterials
          ? 'We are rebuilding your lesson from your materials.'
          : 'Your lesson was regenerated successfully.',
        color: 'green',
      });
      closeRetry();
      setRetryPrompt('');
      reloadLessons();
      pollStatus(activeLesson.id);
      reloadSubscription();
    } catch (err) {
      notifications.show({ title: 'Could not retry', message: getErrorMessage(err), color: 'red' });
      pollStatus(activeLesson.id);
    } finally {
      setReprocessing(false);
    }
  };

  const openRegenerateModal = () => {
    setRetryPrompt('');
    setRetryStudentLevel(status?.lesson?.studentLevel ?? 'intermediate');
    openRetry();
  };

  const handleRetryLesson = () => {
    openRegenerateModal();
  };

  const handleRebuildLesson = () => {
    openRegenerateModal();
  };

  const linkedMaterialIds = useMemo(
    () => (status?.sourceMaterials ?? []).map((m) => m.id),
    [status?.sourceMaterials],
  );

  const loadAvailableMaterials = useCallback(async () => {
    if (!organizationId) return;
    try {
      const data = await listSelfStudyMaterials(organizationId, {
        processingStatus: 'COMPLETED',
        limit: 50,
      });
      setAvailableMaterials(data?.items ?? []);
    } catch {
      setAvailableMaterials([]);
    }
  }, [organizationId]);

  const openAddMaterialsModal = () => {
    setAddMaterialIds([]);
    loadAvailableMaterials();
    openAddMaterials();
  };

  const handleAddMaterialsToLesson = async () => {
    if (!organizationId || !activeLesson?.id || addMaterialIds.length === 0) return;
    setAddingMaterials(true);
    try {
      await addMaterialsToPersonalLesson(organizationId, activeLesson.id, {
        materialIds: addMaterialIds,
        reprocess: true,
      });
      notifications.show({
        title: 'Materials added',
        message: 'Your lesson is being rebuilt with the new files.',
        color: 'green',
      });
      closeAddMaterials();
      setAddMaterialIds([]);
      reloadMaterials();
      pollStatus(activeLesson.id);
      reloadLessons();
      reloadSubscription();
    } catch (err) {
      notifications.show({ title: 'Could not add files', message: getErrorMessage(err), color: 'red' });
    } finally {
      setAddingMaterials(false);
    }
  };

  const confirmDeleteMaterial = (material) => {
    setMaterialToDelete(material);
    openDelete();
  };

  const confirmDeleteLesson = (lesson, event) => {
    event?.stopPropagation?.();
    event?.preventDefault?.();
    setLessonToDelete(lesson);
    openDeleteLesson();
  };

  const openCollectionModal = (lesson, event) => {
    event?.stopPropagation?.();
    event?.preventDefault?.();
    setCollectionLesson(lesson);
    openCollection();
  };

  const handleDeleteLesson = async () => {
    if (!organizationId || !lessonToDelete?.id) return;
    setDeletingLesson(true);
    try {
      await deletePersonalLesson(organizationId, lessonToDelete.id);
      notifications.show({ title: 'Deleted', message: 'Your lesson was removed.', color: 'green' });
      closeDeleteLesson();
      setLessonToDelete(null);
      if (activeLesson?.id === lessonToDelete.id) {
        setActiveLesson(null);
        setStatus(null);
      }
      reloadLessons();
      reloadGroups();
      reloadSubscription();
    } catch (err) {
      notifications.show({ title: 'Could not delete', message: getErrorMessage(err), color: 'red' });
    } finally {
      setDeletingLesson(false);
    }
  };

  const handleDeleteMaterial = async () => {
    if (!organizationId || !materialToDelete?.id) return;
    setDeleting(true);
    try {
      await deleteSelfStudyMaterial(organizationId, materialToDelete.id);
      notifications.show({ title: 'Deleted', message: 'Your upload was removed.', color: 'green' });
      closeDelete();
      setMaterialToDelete(null);
      reloadMaterials();
      reloadSubscription();
    } catch (err) {
      notifications.show({ title: 'Could not delete', message: getErrorMessage(err), color: 'red' });
    } finally {
      setDeleting(false);
    }
  };

  const resetUploadForm = () => {
    setFile(null);
    setPdfTitle('');
    setPdfDescription('');
    setTextForm({ title: '', content: '', description: '' });
    setYoutubeForm({ title: '', url: '', description: '' });
  };

  const resetCreateModal = () => {
    setCreateMode(null);
    setTitle('');
    setPrompt('');
    setStudentLevel('intermediate');
    setSelectedMaterialIds([]);
    setCreateGroupId(lessonFilters.groupId && lessonFilters.groupId !== 'all'
      ? lessonFilters.groupId
      : '');
  };

  const handleCreatePrompt = async () => {
    if (!organizationId || prompt.trim().length < 10) {
      notifications.show({ title: 'Tell us more', message: 'Write at least 10 characters.', color: 'orange' });
      return;
    }
    setCreating(true);
    try {
      const lesson = await createPersonalLesson(organizationId, {
        title: title.trim() || undefined,
        prompt: prompt.trim(),
        studentLevel,
        groupId: createGroupId || undefined,
      });
      notifications.show({
        title: 'Done!',
        message: 'Your lesson is ready. Flashcards and a quiz are being prepared.',
        color: 'green',
      });
      reloadLessons();
      reloadSubscription();
      closeCreate();
      resetCreateModal();
      setActiveLesson(lesson);
      pollStatus(lesson.id);
    } catch (err) {
      notifications.show({ title: 'Error', message: getErrorMessage(err), color: 'red' });
    } finally {
      setCreating(false);
    }
  };

  const handleCreateFromMaterials = async () => {
    const ids = readyMaterials.filter((m) => selectedMaterialIds.includes(m.id)).map((m) => m.id);
    if (!ids.length) {
      notifications.show({ title: 'Pick a file', message: 'Select at least one ready upload.', color: 'orange' });
      return;
    }
    setCreating(true);
    try {
      const lesson = await createPersonalLessonFromMaterials(organizationId, {
        title: title.trim() || undefined,
        materialIds: ids,
        studentLevel,
        groupId: createGroupId || undefined,
      });
      notifications.show({ title: 'Building lesson', message: 'This may take a minute.', color: 'blue' });
      reloadLessons();
      reloadSubscription();
      closeCreate();
      resetCreateModal();
      setActiveLesson(lesson);
      pollStatus(lesson.id);
    } catch (err) {
      notifications.show({ title: 'Error', message: getErrorMessage(err), color: 'red' });
    } finally {
      setCreating(false);
    }
  };

  const handleUpload = async () => {
    if (!organizationId) return;
    setUploading(true);
    try {
      if (uploadType === 'pdf' && file) {
        const fd = new FormData();
        fd.append('file', file);
        fd.append('organizationId', organizationId);
        fd.append('title', pdfTitle.trim() || titleFromFilename(file.name));
        if (pdfDescription.trim()) fd.append('description', pdfDescription.trim());
        await uploadSelfStudyPdf(fd);
      } else if (uploadType === 'text') {
        await uploadSelfStudyText({
          organizationId,
          title: textForm.title.trim(),
          content: textForm.content.trim(),
          description: textForm.description.trim() || undefined,
        });
      } else {
        await uploadSelfStudyYoutube({
          organizationId,
          title: youtubeForm.title.trim(),
          youtubeUrl: youtubeForm.url.trim(),
          description: youtubeForm.description.trim() || undefined,
        });
      }
      notifications.show({ title: 'Uploaded', message: 'We are processing your file.', color: 'green' });
      resetUploadForm();
      reloadMaterials();
      reloadSubscription();
      if (!createOpen) closeUpload();
    } catch (err) {
      notifications.show({ title: 'Error', message: getErrorMessage(err), color: 'red' });
    } finally {
      setUploading(false);
    }
  };

  const handleGenFlashcards = async () => {
    if (!activeLesson?.id) return;
    setGenerating('flashcards');
    try {
      await generateLessonFlashcards(organizationId, activeLesson.id, {
        count: Number(fcCount),
        difficulty: fcDiff,
      });
      notifications.show({ title: 'On it!', message: 'Flashcards are being made.', color: 'blue' });
      setTimeout(() => pollStatus(activeLesson.id), 2000);
    } catch (err) {
      notifications.show({ title: 'Error', message: getErrorMessage(err), color: 'red' });
    } finally {
      setGenerating(null);
    }
  };

  const handleGenQuiz = async () => {
    if (!activeLesson?.id) return;
    setGenerating('quiz');
    try {
      await generateLessonQuiz(organizationId, activeLesson.id, {
        count: Number(quizCount),
        difficulty: quizDiff,
      });
      notifications.show({ title: 'On it!', message: 'Your quiz is being made.', color: 'blue' });
      setTimeout(() => pollStatus(activeLesson.id), 2000);
    } catch (err) {
      notifications.show({ title: 'Error', message: getErrorMessage(err), color: 'red' });
    } finally {
      setGenerating(null);
    }
  };

  /* —— Lesson detail view —— */
  if (activeLesson) {
    const lessonTitle = status?.lesson?.title ?? activeLesson.title;

    return (
      <>
        <PageHeader
          title="Self-learn"
          gradientWord="Self-learn"
          description="Build lessons and practice tools from your own study goals."
        />

        <button
          type="button"
          onClick={() => { setActiveLesson(null); setStatus(null); setStatusLoading(false); }}
          className="mb-4 flex items-center gap-1 text-sm font-medium text-muted-foreground transition hover:text-primary"
        >
          <ArrowLeft className="h-4 w-4" />
          All my lessons
        </button>

        {statusLoading && !status ? (
          <SelfLearnDetailSkeleton />
        ) : (
        <>
        <GlassCard className="mb-6 p-4 sm:p-6">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h2 className="font-display text-xl font-semibold text-foreground sm:text-2xl">
                {lessonTitle}
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                {status?.flashcardSets?.length ?? 0}
                {' flashcard sets · '}
                {status?.quizzes?.length ?? 0}
                {' quizzes'}
              </p>
            </div>
            {status?.lesson?.generationStatus && (
              <StatusBadge status={status.lesson.generationStatus} />
            )}
            <GhostButton
              type="button"
              className="!px-3 !py-2 text-sm text-red-600 hover:text-red-700"
              onClick={() => confirmDeleteLesson(activeLesson)}
            >
              <Trash2 className="mr-2 inline h-4 w-4" />
              Delete lesson
            </GhostButton>
          </div>

          {lessonFailed && (
            <div className="mt-4 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3">
              <p className="text-sm font-medium text-foreground">This lesson could not be generated</p>
              {status?.lesson?.errorMessage && (
                <p className="mt-1 text-xs text-muted-foreground">{status.lesson.errorMessage}</p>
              )}
              <GradientButton
                type="button"
                size="sm"
                className="mt-3"
                onClick={handleRetryLesson}
                disabled={reprocessing}
              >
                {reprocessing ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <RefreshCw className="mr-2 h-4 w-4" />
                )}
                {reprocessing ? 'Retrying…' : 'Try again'}
              </GradientButton>
            </div>
          )}

          {lessonGenerating && !lessonFailed && (
            <p className="mt-4 rounded-lg bg-blue-500/10 px-3 py-2 text-sm text-foreground">
              Your lesson is still being prepared. Flashcards and quizzes will be available soon.
            </p>
          )}

          {lessonReady && (
            <div className="mt-4 flex flex-wrap gap-2">
              {status?.lesson?.hasSourceMaterials ? (
                <GhostButton
                  type="button"
                  className="!px-4 !py-2 text-sm"
                  onClick={handleRebuildLesson}
                  disabled={reprocessing}
                >
                  {reprocessing ? (
                    <Loader2 className="mr-2 inline h-4 w-4 animate-spin" />
                  ) : (
                    <RefreshCw className="mr-2 inline h-4 w-4" />
                  )}
                  Rebuild lesson
                </GhostButton>
              ) : (
                <GhostButton
                  type="button"
                  className="!px-4 !py-2 text-sm"
                  onClick={handleRebuildLesson}
                  disabled={reprocessing}
                >
                  <RefreshCw className="mr-2 inline h-4 w-4" />
                  Regenerate lesson
                </GhostButton>
              )}
            </div>
          )}
        </GlassCard>

        {status?.lesson?.hasSourceMaterials && (
          <GlassCard className="mb-6 p-4 sm:p-5">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <FileUp className="h-5 w-5 text-primary" />
                <h3 className="font-display font-semibold text-foreground">Source files</h3>
              </div>
              <button
                type="button"
                onClick={openAddMaterialsModal}
                className="flex items-center gap-1 text-sm font-medium text-primary"
              >
                <Plus className="h-4 w-4" />
                Add files
              </button>
            </div>
            {status?.sourceMaterials?.length > 0 ? (
              <ul className="divide-y divide-border/40 rounded-lg border border-border/40">
                {status.sourceMaterials.map((m) => (
                  <li key={m.id} className="flex items-center justify-between gap-3 px-3 py-2.5">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-foreground">{m.title}</p>
                      <p className="text-xs text-muted-foreground">{m.type ?? 'Material'}</p>
                    </div>
                    <Link
                      to={`/student/materials/${m.id}/preview`}
                      state={{ returnTo: '/student/self-learn', lessonId: activeLesson.id }}
                      className="btn-outline !px-2 !py-1 text-xs no-underline"
                    >
                      Preview
                    </Link>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-muted-foreground">No source files linked yet.</p>
            )}
          </GlassCard>
        )}

        {!lessonFailed && (
        <>
        {lessonReady && (
          <div className="mb-6 space-y-4">
            <ContinueLearningCard
              organizationId={organizationId}
              lessonId={activeLesson.id}
              lesson={{ ...status.lesson, isPersonal: true }}
              nextSuggestion={status?.lesson?.nextLessonSuggestion}
            />
            <LessonGroupManager
              organizationId={organizationId}
              lessonId={activeLesson.id}
              currentGroupId={status?.lesson?.groupId}
              compact
              onChanged={() => {
                pollStatus(activeLesson.id);
                reloadGroups();
                reloadLessons();
              }}
            />
          </div>
        )}

        <p className="mb-3 text-sm font-medium text-muted-foreground">What do you want to do?</p>
        <div className="mb-6 grid gap-3 sm:grid-cols-2">
          <ActionCard
            icon={MessageSquare}
            title="Read & chat"
            description="Open the lesson and ask the AI tutor questions."
            href={`/student/lessons/${activeLesson.id}`}
          />
          <ActionCard
            icon={BookOpen}
            title="Go to practice"
            description="Review flashcards and take quizzes."
            href={`/student/practice?lessonId=${activeLesson.id}`}
          />
        </div>

        <GlassCard className="mb-6 p-4 sm:p-5">
          <div className="mb-4 flex items-center gap-2">
            <Layers className="h-5 w-5 text-primary" />
            <h3 className="font-display font-semibold text-foreground">Flashcards</h3>
          </div>
          <p className="mb-4 text-sm text-muted-foreground">
            Default: {fcCount} cards, {fcDiff} difficulty.
          </p>
          <GradientButton
            type="button"
            className="w-full sm:w-auto"
            onClick={handleGenFlashcards}
            disabled={!lessonReady || generating === 'flashcards'}
          >
            {generating === 'flashcards' ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Layers className="mr-2 h-4 w-4" />
            )}
            {generating === 'flashcards' ? 'Creating…' : 'Create flashcard set'}
          </GradientButton>
          <button
            type="button"
            className="mt-3 flex items-center gap-1 text-xs text-primary"
            onClick={() => setFcOptionsOpen((o) => !o)}
          >
            <ChevronDown className={`h-3 w-3 transition ${fcOptionsOpen ? 'rotate-180' : ''}`} />
            Change options
          </button>
          <Collapse in={fcOptionsOpen}>
            <div className="mt-3 grid max-w-sm grid-cols-2 gap-3">
              <Select label="How many?" data={COUNT_OPTIONS} value={fcCount} onChange={setFcCount} />
              <Select label="Difficulty" data={DIFFICULTIES} value={fcDiff} onChange={setFcDiff} />
            </div>
          </Collapse>

          {status?.flashcardSets?.length > 0 && (
            <ul className="mt-5 space-y-2 border-t border-border/40 pt-4">
              {status.flashcardSets.map((s) => (
                <li
                  key={s.id}
                  className="flex flex-col gap-2 text-sm sm:flex-row sm:items-center sm:justify-between"
                >
                  <span className="font-medium text-foreground">{s.title}</span>
                  <StatusBadge status={s.generationStatus} />
                </li>
              ))}
            </ul>
          )}
        </GlassCard>

        <GlassCard className="p-4 sm:p-5">
          <div className="mb-4 flex items-center gap-2">
            <Brain className="h-5 w-5 text-primary" />
            <h3 className="font-display font-semibold text-foreground">Quiz</h3>
          </div>
          <p className="mb-4 text-sm text-muted-foreground">
            Default: {quizCount} questions, {quizDiff} difficulty.
          </p>
          <GradientButton
            type="button"
            className="w-full sm:w-auto"
            onClick={handleGenQuiz}
            disabled={!lessonReady || generating === 'quiz'}
          >
            {generating === 'quiz' ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Plus className="mr-2 h-4 w-4" />
            )}
            {generating === 'quiz' ? 'Creating…' : 'Create a quiz'}
          </GradientButton>
          <button
            type="button"
            className="mt-3 flex items-center gap-1 text-xs text-primary"
            onClick={() => setQuizOptionsOpen((o) => !o)}
          >
            <ChevronDown className={`h-3 w-3 transition ${quizOptionsOpen ? 'rotate-180' : ''}`} />
            Change options
          </button>
          <Collapse in={quizOptionsOpen}>
            <div className="mt-3 grid max-w-sm grid-cols-2 gap-3">
              <Select label="Questions" data={COUNT_OPTIONS} value={quizCount} onChange={setQuizCount} />
              <Select label="Difficulty" data={DIFFICULTIES} value={quizDiff} onChange={setQuizDiff} />
            </div>
          </Collapse>

          {status?.quizzes?.length > 0 && (
            <ul className="mt-5 space-y-2 border-t border-border/40 pt-4">
              {status.quizzes.map((q) => (
                <li
                  key={q.id}
                  className="flex flex-col gap-2 text-sm sm:flex-row sm:items-center sm:justify-between"
                >
                  <span className="text-foreground">{q.title}</span>
                  <StatusBadge status={q.generationStatus} />
                </li>
              ))}
            </ul>
          )}
        </GlassCard>
        </>
        )}
        </>
        )}

        <AdesiaModal
          opened={retryOpen}
          onClose={closeRetry}
          title={status?.lesson?.hasSourceMaterials ? 'Rebuild lesson' : 'Regenerate lesson'}
          size="md"
          submitLabel={status?.lesson?.hasSourceMaterials ? 'Rebuild lesson' : 'Regenerate lesson'}
          onSubmit={() => runRegenerate(retryPrompt, retryStudentLevel)}
          submitting={reprocessing}
          submitDisabled={
            !status?.lesson?.hasSourceMaterials && retryPrompt.trim().length < 10
          }
        >
          <div className="space-y-4">
            <Select
              label="Student level"
              description="Adjust depth and vocabulary for the regenerated lesson."
              data={STUDENT_LEVEL_OPTIONS}
              value={retryStudentLevel}
              onChange={(value) => setRetryStudentLevel(value ?? 'intermediate')}
            />
            {status?.lesson?.hasSourceMaterials ? (
              <p className="text-sm text-muted-foreground">
                Your lesson will be rebuilt from the linked source materials at the selected level.
              </p>
            ) : (
              <Textarea
                label="What should this lesson cover?"
                placeholder="I want to learn about…"
                value={retryPrompt}
                onChange={(e) => setRetryPrompt(e.currentTarget.value)}
                minRows={5}
                autosize
              />
            )}
          </div>
        </AdesiaModal>

        <AdesiaModal
          opened={addMaterialsOpen}
          onClose={closeAddMaterials}
          title="Add files to lesson"
          size="lg"
          submitLabel="Add & rebuild lesson"
          onSubmit={handleAddMaterialsToLesson}
          submitting={addingMaterials}
          submitDisabled={addMaterialIds.length === 0}
        >
          {availableMaterials.filter((m) => !linkedMaterialIds.includes(m.id)).length === 0 ? (
            <div className="rounded-lg border border-dashed border-border/60 py-8 text-center text-sm text-muted-foreground">
              <p>No new files available.</p>
              <button
                type="button"
                className="mt-2 font-medium text-primary underline"
                onClick={() => { closeAddMaterials(); openUpload(); }}
              >
                Upload a file first
              </button>
            </div>
          ) : (
            <div className="max-h-64 space-y-2 overflow-y-auto">
              {availableMaterials
                .filter((m) => !linkedMaterialIds.includes(m.id))
                .map((m) => (
                  <label
                    key={m.id}
                    className="flex cursor-pointer items-center gap-3 rounded-lg border border-border/40 px-3 py-2.5"
                  >
                    <input
                      type="checkbox"
                      checked={addMaterialIds.includes(m.id)}
                      onChange={() => setAddMaterialIds((prev) => (
                        prev.includes(m.id) ? prev.filter((x) => x !== m.id) : [...prev, m.id]
                      ))}
                    />
                    <div className="min-w-0">
                      <span className="block truncate text-sm font-medium text-foreground">{m.title}</span>
                      <span className="text-xs text-muted-foreground">{m.type ?? 'Material'}</span>
                    </div>
                  </label>
                ))}
            </div>
          )}
        </AdesiaModal>

        <AdesiaModal
          opened={deleteLessonOpen}
          onClose={() => { closeDeleteLesson(); setLessonToDelete(null); }}
          title="Delete lesson?"
          size="sm"
          submitLabel="Delete permanently"
          onSubmit={handleDeleteLesson}
          submitting={deletingLesson}
        >
          <p className="text-sm text-muted-foreground">
            {lessonToDelete?.title
              ? `Delete "${lessonToDelete.title}"? Flashcards, quizzes, and chat history for this lesson will be removed. This cannot be undone.`
              : 'Delete this lesson? This cannot be undone.'}
          </p>
        </AdesiaModal>
      </>
    );
  }

  /* —— Home: lesson list —— */
  return (
    <>
      <PageHeader
        title="Self-learn"
        gradientWord="Self-learn"
        description="Create your own lessons and turn them into flashcards and quizzes."
      />

      <div className="mb-6 flex flex-col gap-3 sm:flex-row">
        <GradientButton type="button" className="flex-1" onClick={() => { resetCreateModal(); openCreate(); }}>
          <Plus className="mr-2 h-4 w-4" />
          Create a lesson
        </GradientButton>
        <button
          type="button"
          onClick={openUpload}
          className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-border/50 bg-card/50 px-4 py-2.5 text-sm font-medium text-foreground transition hover:border-primary/30"
        >
          <Upload className="h-4 w-4 text-primary" />
          Upload a file
        </button>
      </div>

      {subscription?.applyFreeLimits && subscription.limits && (
        <GlassCard className="mb-6 p-4 sm:p-5">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <CreditCard className="h-4 w-4 text-primary" />
              <h3 className="font-display text-sm font-semibold text-foreground">Plan limits</h3>
            </div>
            <Link to="/student/subscription" className="text-xs text-primary hover:underline">
              View plans
            </Link>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <div className="mb-1.5 flex justify-between text-xs text-muted-foreground">
                <span>Storage</span>
                <span className="tabular-nums text-foreground">
                  {formatBytes(subscription.usage.storageBytes)}
                  {' / '}
                  {formatBytes(subscription.limits.storageBytes)}
                </span>
              </div>
              <Progress
                value={usagePct(subscription.usage.storageBytes, subscription.limits.storageBytes)}
                size="sm"
                radius="xl"
              />
            </div>
            <div>
              <div className="mb-1.5 flex justify-between text-xs text-muted-foreground">
                <span>Lessons today</span>
                <span className="tabular-nums text-foreground">
                  {subscription.usage.lessonsToday}
                  {' / '}
                  {subscription.limits.lessonsPerDay}
                </span>
              </div>
              <Progress
                value={usagePct(subscription.usage.lessonsToday, subscription.limits.lessonsPerDay)}
                size="sm"
                radius="xl"
              />
            </div>
          </div>
        </GlassCard>
      )}

      <Tabs value={homeTab} onChange={setHomeTab} className="mb-4">
        <Tabs.List className="mb-4 flex-wrap gap-1 rounded-xl border border-border/50 bg-card/50 p-1">
          <Tabs.Tab value="lessons">My lessons ({lessonMeta.total ?? lessons.length})</Tabs.Tab>
          <Tabs.Tab value="materials">My uploads ({materialMeta.total ?? materials.length})</Tabs.Tab>
        </Tabs.List>

        <Tabs.Panel value="lessons">
          <div className="grid min-w-0 gap-6 lg:grid-cols-[minmax(240px,280px)_1fr]">
            <LessonGroupManager
              organizationId={organizationId}
              onChanged={() => {
                reloadGroups();
                reloadLessons();
              }}
              onGroupSelect={(groupId) => setLessonFilters({
                ...lessonFilters,
                groupId: groupId ?? 'all',
              })}
              selectedGroupFilter={
                lessonFilters.groupId && lessonFilters.groupId !== 'all'
                  ? lessonFilters.groupId
                  : null
              }
            />

            <div className="min-w-0">
          <ListGridToolbar
            search={lessonSearch}
            onSearchChange={setLessonSearch}
            searchPlaceholder="Search lessons…"
            showSearch
          >
            <Select
              label="Collection"
              data={[
                { value: 'all', label: 'All collections' },
                { value: 'ungrouped', label: 'Ungrouped' },
                ...lessonGroups.map((g) => ({ value: g.id, label: g.title })),
              ]}
              value={lessonFilters.groupId ?? 'all'}
              onChange={(v) => setLessonFilters({ ...lessonFilters, groupId: v ?? 'all' })}
              className={filterSelectClass}
              size="sm"
            />
            <Select
              label="Status"
              data={GENERATION_STATUS_OPTIONS}
              value={lessonFilters.generationStatus ?? 'all'}
              onChange={(v) => setLessonFilters({ ...lessonFilters, generationStatus: v ?? 'all' })}
              className={filterSelectClass}
              size="sm"
            />
          </ListGridToolbar>

          {lessonsLoading ? (
            <SelfLearnLessonsListSkeleton />
          ) : lessons.length === 0 ? (
            <GlassCard className="flex flex-col items-center px-6 py-14 text-center">
              <Sparkles className="mb-4 h-12 w-12 text-primary/60" />
              <h2 className="font-display text-lg font-semibold text-foreground">No lessons yet</h2>
              <p className="mt-2 max-w-sm text-sm text-muted-foreground">
                Tap &quot;Create a lesson&quot; to describe a topic, or upload notes first and build from your files.
              </p>
            </GlassCard>
          ) : (
            <>
              <p className="mb-3 text-sm text-muted-foreground">Tap a lesson to study or add practice</p>
              <div className="rounded-xl border border-border/50 bg-card/40">
                <ul className="grid min-w-0 grid-cols-1 gap-3 p-3 sm:grid-cols-2">
                  {lessons.map((l) => (
                    <li key={l.id} className="min-w-0">
                      <div className="flex min-w-0 overflow-hidden rounded-xl border border-border/50 bg-card/40">
                        <button
                          type="button"
                          onClick={() => { setActiveLesson(l); pollStatus(l.id); }}
                          className="flex min-w-0 flex-1 items-center gap-3 p-3 text-left transition hover:bg-primary/5 sm:p-4"
                        >
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                            <BookOpen className="h-5 w-5 text-primary" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="line-clamp-2 font-display font-semibold leading-snug text-foreground sm:truncate">
                              {l.title}
                            </p>
                            {l.groupTitle && (
                              <p className="mt-0.5 truncate text-xs text-primary">{l.groupTitle}</p>
                            )}
                            {l.generationStatus === 'FAILED' && (
                              <p className="mt-0.5 text-xs font-medium text-red-500">Failed — tap to retry</p>
                            )}
                            {l.generationStatus && !['COMPLETED', 'FAILED'].includes(l.generationStatus) && (
                              <p className="mt-0.5 flex items-center gap-1 text-xs text-muted-foreground">
                                <Loader2 className="h-3 w-3 shrink-0 animate-spin" />
                                Preparing…
                              </p>
                            )}
                          </div>
                          <ChevronDown className="hidden h-4 w-4 shrink-0 -rotate-90 text-muted-foreground sm:block" />
                        </button>
                        <div className="flex shrink-0 flex-col justify-center gap-0.5 border-l border-border/40 px-1 py-2 sm:flex-row sm:items-center sm:gap-0 sm:px-0 sm:py-0">
                          <button
                            type="button"
                            onClick={(e) => openCollectionModal(l, e)}
                            className="rounded-lg p-2 text-muted-foreground transition hover:bg-primary/10 hover:text-primary sm:p-1.5"
                            title="Add to collection"
                            aria-label={`Add ${l.title} to collection`}
                          >
                            <Layers className="h-4 w-4" />
                          </button>
                          <button
                            type="button"
                            onClick={(e) => confirmDeleteLesson(l, e)}
                            className="rounded-lg p-2 text-muted-foreground transition hover:bg-red-500/10 hover:text-red-500 sm:p-1.5"
                            title="Delete lesson"
                            aria-label={`Delete ${l.title}`}
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
                <DataListFooter
                  rangeStart={lessonRangeStart}
                  rangeEnd={lessonRangeEnd}
                  totalItems={lessonMeta.total ?? lessons.length}
                  page={lessonPage}
                  totalPages={lessonMeta.totalPages ?? 1}
                  pageSize={SELF_LEARN_LESSONS_PAGE_SIZE}
                  onPageChange={setLessonPage}
                />
              </div>
            </>
          )}
            </div>
          </div>
        </Tabs.Panel>

        <Tabs.Panel value="materials">
          <ListGridToolbar
            search={materialSearch}
            onSearchChange={setMaterialSearch}
            searchPlaceholder="Search uploads…"
            showSearch
          >
            <Select
              label="Status"
              data={MATERIAL_STATUS_OPTIONS}
              value={materialFilters.processingStatus ?? 'all'}
              onChange={(v) => setMaterialFilters({ processingStatus: v ?? 'all' })}
              className={filterSelectClass}
              size="sm"
            />
          </ListGridToolbar>

          {materialsLoading ? (
            <SelfLearnMaterialsSkeleton />
          ) : materials.length === 0 ? (
            <GlassCard className="flex flex-col items-center px-6 py-12 text-center">
              <FileUp className="mb-3 h-10 w-10 text-primary/60" />
              <p className="text-sm text-muted-foreground">No uploads yet. Use &quot;Upload a file&quot; to add PDFs, notes, or videos.</p>
            </GlassCard>
          ) : (
            <>
              <div className="overflow-hidden rounded-xl border border-border/50 bg-card/40">
                <ul className="divide-y divide-border/40">
                  {materials.map((m) => (
                    <li key={m.id} className="flex items-center justify-between gap-3 px-4 py-3">
                      <div className="min-w-0">
                        <p className="truncate font-medium text-foreground">{m.title}</p>
                        <p className="text-xs text-muted-foreground">{m.type ?? 'Material'}</p>
                      </div>
                      <div className="flex shrink-0 items-center gap-2">
                        {m.processingStatus && <StatusBadge status={m.processingStatus} />}
                        {m.processingStatus === 'COMPLETED' && (
                          <Link
                            to={`/student/materials/${m.id}/preview`}
                            state={{ returnTo: '/student/self-learn' }}
                            className="btn-outline !px-2 !py-1 text-xs no-underline"
                          >
                            Preview
                          </Link>
                        )}
                        <button
                          type="button"
                          onClick={() => confirmDeleteMaterial(m)}
                          className="rounded-lg p-1.5 text-muted-foreground transition hover:bg-red-500/10 hover:text-red-500"
                          title="Delete upload"
                          aria-label={`Delete ${m.title}`}
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
                <DataListFooter
                  rangeStart={materialRangeStart}
                  rangeEnd={materialRangeEnd}
                  totalItems={materialMeta.total ?? materials.length}
                  page={materialPage}
                  totalPages={materialMeta.totalPages ?? 1}
                  pageSize={SELF_LEARN_MATERIALS_PAGE_SIZE}
                  onPageChange={setMaterialPage}
                />
              </div>
            </>
          )}
          {readyMaterials.length > 0 && (
            <p className="mt-4 text-center text-xs text-muted-foreground">
              {readyMaterials.length}
              {' file'}
              {readyMaterials.length !== 1 ? 's' : ''}
              {' ready on this page — use &quot;Create a lesson&quot; → From my files'}
            </p>
          )}
        </Tabs.Panel>
      </Tabs>

      {/* Create lesson modal */}
      <AdesiaModal
        opened={createOpen}
        onClose={() => { closeCreate(); resetCreateModal(); }}
        title={createMode === 'prompt' ? 'Describe a topic' : createMode === 'files' ? 'From your files' : 'New lesson'}
        size="lg"
        submitLabel={
          createMode === 'prompt' ? 'Create lesson' : createMode === 'files' ? 'Build lesson' : undefined
        }
        onSubmit={
          createMode === 'prompt'
            ? handleCreatePrompt
            : createMode === 'files'
              ? handleCreateFromMaterials
              : undefined
        }
        submitting={creating}
        submitDisabled={
          createMode === 'prompt'
            ? prompt.trim().length < 10
            : selectedMaterialIds.length === 0
        }
      >
        {!createMode ? (
          <div className="grid gap-3 sm:grid-cols-2">
            <button
              type="button"
              onClick={() => setCreateMode('prompt')}
              className="rounded-xl border border-border/50 p-5 text-left transition hover:border-primary/40 hover:bg-primary/5"
            >
              <Sparkles className="mb-3 h-8 w-8 text-primary" />
              <p className="font-display font-semibold text-foreground">Describe a topic</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Tell the AI what you want to learn. Fastest way to start.
              </p>
            </button>
            <button
              type="button"
              onClick={() => setCreateMode('files')}
              className="rounded-xl border border-border/50 p-5 text-left transition hover:border-primary/40 hover:bg-primary/5"
            >
              <FileUp className="mb-3 h-8 w-8 text-primary" />
              <p className="font-display font-semibold text-foreground">From my files</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Use PDFs, notes, or videos you uploaded.
              </p>
            </button>
          </div>
        ) : createMode === 'prompt' ? (
          <div className="space-y-4">
            <button type="button" className="text-xs text-primary" onClick={() => setCreateMode(null)}>
              ← Back
            </button>
            <TextInput
              label="Title (optional)"
              placeholder="e.g. Photosynthesis basics"
              value={title}
              onChange={(e) => setTitle(e.currentTarget.value)}
            />
            <Select
              label="Student level"
              description="Choose how deep and technical the lesson should be."
              data={STUDENT_LEVEL_OPTIONS}
              value={studentLevel}
              onChange={(value) => setStudentLevel(value ?? 'intermediate')}
            />
            {lessonGroups.length > 0 && (
              <Select
                label="Collection (optional)"
                description="Add this lesson to a learning path."
                data={[
                  { value: '', label: 'No collection' },
                  ...lessonGroups.map((g) => ({ value: g.id, label: g.title })),
                ]}
                value={createGroupId}
                onChange={(value) => setCreateGroupId(value ?? '')}
                clearable
              />
            )}
            <Textarea
              label="What should this lesson cover?"
              placeholder="I want to learn about…"
              value={prompt}
              onChange={(e) => setPrompt(e.currentTarget.value)}
              minRows={5}
              autosize
            />
          </div>
        ) : (
          <div className="space-y-4">
            <button type="button" className="text-xs text-primary" onClick={() => setCreateMode(null)}>
              ← Back
            </button>
            <TextInput
              label="Title (optional)"
              value={title}
              onChange={(e) => setTitle(e.currentTarget.value)}
            />
            <Select
              label="Student level"
              description="Choose how deep and technical the lesson should be."
              data={STUDENT_LEVEL_OPTIONS}
              value={studentLevel}
              onChange={(value) => setStudentLevel(value ?? 'intermediate')}
            />
            {lessonGroups.length > 0 && (
              <Select
                label="Collection (optional)"
                data={[
                  { value: '', label: 'No collection' },
                  ...lessonGroups.map((g) => ({ value: g.id, label: g.title })),
                ]}
                value={createGroupId}
                onChange={(value) => setCreateGroupId(value ?? '')}
                clearable
              />
            )}
            {readyMaterials.length === 0 ? (
              <div className="rounded-lg border border-dashed border-border/60 py-8 text-center text-sm text-muted-foreground">
                <p>No files ready yet.</p>
                <button
                  type="button"
                  className="mt-2 font-medium text-primary underline"
                  onClick={() => { closeCreate(); openUpload(); }}
                >
                  Upload a file first
                </button>
              </div>
            ) : (
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Select files to turn into a lesson:</p>
                {readyMaterials.map((m) => (
                  <label
                    key={m.id}
                    className="flex cursor-pointer items-center gap-3 rounded-lg border border-border/40 px-3 py-2"
                  >
                    <input
                      type="checkbox"
                      checked={selectedMaterialIds.includes(m.id)}
                      onChange={() => setSelectedMaterialIds((prev) => (
                        prev.includes(m.id) ? prev.filter((x) => x !== m.id) : [...prev, m.id]
                      ))}
                    />
                    <span className="text-sm font-medium">{m.title}</span>
                  </label>
                ))}
              </div>
            )}
          </div>
        )}
      </AdesiaModal>

      {/* Upload modal */}
      <AdesiaModal
        opened={uploadOpen}
        onClose={() => { closeUpload(); resetUploadForm(); }}
        title="Upload a file"
        size="lg"
        submitLabel="Upload"
        onSubmit={handleUpload}
        submitting={uploading}
        submitDisabled={
          (uploadType === 'pdf' && !file)
          || (uploadType === 'text' && (!textForm.title.trim() || !textForm.content.trim()))
          || (uploadType === 'youtube' && (!youtubeForm.title.trim() || !youtubeForm.url.trim()))
        }
      >
        <p className="mb-4 text-sm text-muted-foreground">
          Add a PDF, notes, or YouTube video. When it shows as Ready, use it to build or update a lesson.
        </p>
        <Tabs value={uploadType} onChange={setUploadType}>
          <Tabs.List className="mb-3">
            <Tabs.Tab value="pdf">PDF</Tabs.Tab>
            <Tabs.Tab value="text">Notes</Tabs.Tab>
            <Tabs.Tab value="youtube">Video</Tabs.Tab>
          </Tabs.List>
          <Tabs.Panel value="pdf">
            <div className="space-y-3">
              <PdfDropzone
                value={file}
                onChange={(f) => { setFile(f); if (f?.name) setPdfTitle(titleFromFilename(f.name)); }}
              />
              <TextInput
                label="Title"
                placeholder="e.g. Biology Chapter 3"
                value={pdfTitle}
                onChange={(e) => setPdfTitle(e.target.value)}
              />
            </div>
          </Tabs.Panel>
          <Tabs.Panel value="text">
            <div className="space-y-3">
              <TextInput
                label="Title"
                placeholder="e.g. French past tense notes"
                value={textForm.title}
                onChange={(e) => setTextForm({ ...textForm, title: e.target.value })}
              />
              <Textarea
                label="Notes"
                placeholder="Paste your notes here…"
                minRows={14}
                autosize
                maxRows={22}
                value={textForm.content}
                onChange={(e) => setTextForm({ ...textForm, content: e.target.value })}
              />
            </div>
          </Tabs.Panel>
          <Tabs.Panel value="youtube">
            <div className="space-y-3">
              <TextInput
                label="Title"
                placeholder="e.g. Intro to algebra"
                value={youtubeForm.title}
                onChange={(e) => setYoutubeForm({ ...youtubeForm, title: e.target.value })}
              />
              <TextInput
                label="YouTube link"
                placeholder="https://www.youtube.com/watch?v=…"
                value={youtubeForm.url}
                onChange={(e) => setYoutubeForm({ ...youtubeForm, url: e.target.value })}
              />
            </div>
          </Tabs.Panel>
        </Tabs>
      </AdesiaModal>

      <AdesiaModal
        opened={deleteLessonOpen}
        onClose={() => { closeDeleteLesson(); setLessonToDelete(null); }}
        title="Delete lesson?"
        size="sm"
        submitLabel="Delete permanently"
        onSubmit={handleDeleteLesson}
        submitting={deletingLesson}
      >
        <p className="text-sm text-muted-foreground">
          {lessonToDelete?.title
            ? `Delete "${lessonToDelete.title}"? Flashcards, quizzes, and chat history for this lesson will be removed. This cannot be undone.`
            : 'Delete this lesson? This cannot be undone.'}
        </p>
      </AdesiaModal>

      <AdesiaModal
        opened={deleteOpen}
        onClose={() => { closeDelete(); setMaterialToDelete(null); }}
        title="Delete upload?"
        size="sm"
        submitLabel="Delete permanently"
        onSubmit={handleDeleteMaterial}
        submitting={deleting}
      >
        <p className="text-sm text-muted-foreground">
          {materialToDelete?.title
            ? `Delete "${materialToDelete.title}"? This cannot be undone.`
            : 'Delete this upload? This cannot be undone.'}
        </p>
      </AdesiaModal>

      <AddToCollectionModal
        opened={collectionOpen}
        onClose={() => { closeCollection(); setCollectionLesson(null); }}
        organizationId={organizationId}
        lessonId={collectionLesson?.id}
        lessonTitle={collectionLesson?.title}
        currentGroupId={collectionLesson?.groupId}
        onChanged={() => {
          reloadLessons();
          reloadGroups();
        }}
      />
    </>
  );
};

export default SelfLearnPage;
