import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Modal, Progress } from '@mantine/core';
import {
  BookOpen,
  Brain,
  ChevronRight,
  CreditCard,
  MessageSquare,
  Sparkles,
  Target,
  Trophy,
} from 'lucide-react';
import { GradientButton } from '../../../shared/components/GradientButton';
import { GlassCard } from '../../../shared/components/GlassCard';

const STORAGE_KEY = 'adesia-student-onboarding-v1';

export const shouldShowStudentOnboarding = () =>
  typeof window !== 'undefined' && localStorage.getItem(STORAGE_KEY) !== 'done';

export const markStudentOnboardingDone = () => {
  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_KEY, 'done');
  }
};

const STEPS = [
  {
    title: 'Welcome to Adesia',
    icon: Sparkles,
    body: 'Turn your notes, PDFs, and videos into lessons, flashcards, and quizzes — then track progress with XP and milestones.',
  },
  {
    title: 'Start with Self-learn',
    icon: BookOpen,
    body: 'Upload materials or describe a topic. Adesia builds a personal lesson you can read, preview sources, and turn into practice.',
    cta: { label: 'Open Self-learn', to: '/student/self-learn' },
  },
  {
    title: 'Practice what you learn',
    icon: Target,
    body: 'Take quizzes with save-and-continue, flip flashcards, and review answers anytime from the Practice page.',
    cta: { label: 'Go to Practice', to: '/student/practice' },
  },
  {
    title: 'Ask the AI tutor',
    icon: MessageSquare,
    body: 'Use AI Chat for grounded help on your lessons and materials. Free plan includes a daily chat allowance.',
    cta: { label: 'Try AI Chat', to: '/student/chat' },
  },
  {
    title: 'Track your progress',
    icon: Trophy,
    body: 'Earn XP, unlock achievements, climb the leaderboard, and use Milestones to stay on track.',
    cta: { label: 'View Milestones', to: '/student/milestones' },
  },
  {
    title: 'Your Free plan',
    icon: CreditCard,
    body: 'You start on Free: 10 MB storage, 10 lessons/day, 5 uploads/day, and daily chat limits. Paid plans are labeled Coming soon on the Subscription page.',
    cta: { label: 'View Subscription', to: '/student/subscription' },
  },
];

const StudentOnboardingWizard = ({ opened, onClose, forceOpen = false }) => {
  const [step, setStep] = useState(0);
  const current = STEPS[step];
  const Icon = current.icon;
  const progress = ((step + 1) / STEPS.length) * 100;

  useEffect(() => {
    if (opened) setStep(0);
  }, [opened]);

  const finish = () => {
    markStudentOnboardingDone();
    onClose?.();
  };

  const next = () => {
    if (step >= STEPS.length - 1) {
      finish();
      return;
    }
    setStep((s) => s + 1);
  };

  if (!opened && !forceOpen) return null;

  return (
    <Modal
      opened={opened}
      onClose={finish}
      title="Getting started"
      size="lg"
      centered
      closeOnClickOutside={false}
      classNames={{ content: 'glass-card !bg-card' }}
    >
      <div className="mb-4">
        <div className="mb-2 flex justify-between text-xs text-muted-foreground">
          <span>Step {step + 1} of {STEPS.length}</span>
          <span>{Math.round(progress)}%</span>
        </div>
        <Progress value={progress} size="sm" radius="xl" />
      </div>

      <GlassCard className="p-6">
        <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/15 text-primary">
          <Icon className="h-6 w-6" />
        </div>
        <h3 className="font-display text-lg font-semibold text-foreground">{current.title}</h3>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{current.body}</p>
        {current.cta && (
          <Link
            to={current.cta.to}
            onClick={finish}
            className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline"
          >
            {current.cta.label}
            <ChevronRight className="h-4 w-4" />
          </Link>
        )}
      </GlassCard>

      <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
        <button
          type="button"
          className="text-sm text-muted-foreground hover:text-foreground"
          onClick={finish}
        >
          Skip tour
        </button>
        <div className="flex gap-2">
          {step > 0 && (
            <button
              type="button"
              className="btn-outline !px-4 !py-2 text-sm"
              onClick={() => setStep((s) => s - 1)}
            >
              Back
            </button>
          )}
          <GradientButton type="button" className="!px-4 !py-2 text-sm" onClick={next}>
            {step >= STEPS.length - 1 ? 'Start learning' : 'Next'}
            {step < STEPS.length - 1 && <ChevronRight className="h-4 w-4" />}
          </GradientButton>
        </div>
      </div>
    </Modal>
  );
};

export default StudentOnboardingWizard;
