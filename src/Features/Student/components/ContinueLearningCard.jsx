import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { notifications } from '@mantine/notifications';
import { ArrowRight, Sparkles } from 'lucide-react';
import { GlassCard } from '../../../shared/components/GlassCard';
import { GradientButton } from '../../../shared/components/GradientButton';
import { getErrorMessage } from '../../../shared/utils/formatters';
import { extractNextLessonSuggestion } from '../../../shared/utils/lessonContent';
import { createNextLesson } from '../services/student.services';

const ContinueLearningCard = ({
  organizationId,
  lessonId,
  lesson,
  nextSuggestion,
}) => {
  const navigate = useNavigate();
  const [creating, setCreating] = useState(false);

  const suggestion =
    nextSuggestion
    || extractNextLessonSuggestion(lesson?.content)
    || null;

  if (!suggestion || !lesson?.isPersonal) return null;

  const handleCreateNext = async () => {
    if (!organizationId || !lessonId) return;
    setCreating(true);
    try {
      const created = await createNextLesson(organizationId, lessonId, {
        studentLevel: lesson.studentLevel,
      });
      notifications.show({
        title: 'Next lesson started',
        message: 'Flashcards and a quiz will be ready shortly.',
        color: 'green',
      });
      navigate(`/student/lessons/${created.id}`);
    } catch (err) {
      notifications.show({ title: 'Could not create lesson', message: getErrorMessage(err), color: 'red' });
    } finally {
      setCreating(false);
    }
  };

  return (
    <GlassCard className="border-primary/20 bg-primary/5 p-4 sm:p-5">
      <div className="mb-2 flex items-center gap-2">
        <Sparkles className="h-5 w-5 shrink-0 text-primary" />
        <h3 className="font-display text-sm font-semibold text-foreground">Continue your path</h3>
      </div>
      <p className="mb-1 text-xs font-medium uppercase tracking-wide text-muted-foreground">
        Suggested next lesson
      </p>
      <p className="mb-4 line-clamp-4 text-sm leading-relaxed text-foreground">{suggestion}</p>
      <GradientButton
        type="button"
        className="w-full !px-4 !py-2 sm:w-auto"
        onClick={handleCreateNext}
        disabled={creating}
      >
        {creating ? 'Creating…' : 'Generate next lesson'}
        <ArrowRight className="h-4 w-4" />
      </GradientButton>
    </GlassCard>
  );
};

export default ContinueLearningCard;
