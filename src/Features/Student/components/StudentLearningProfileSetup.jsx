import { useEffect, useMemo, useState } from 'react';
import { Modal, Progress, Select, MultiSelect, SegmentedControl } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { Globe, GraduationCap, Sparkles, Target } from 'lucide-react';
import { GradientButton } from '../../../shared/components/GradientButton';
import { GlassCard } from '../../../shared/components/GlassCard';
import {
  AGE_GROUPS,
  COUNTRIES,
  EDUCATION_LEVELS,
  LANGUAGE_OPTIONS,
  LEARNING_GOALS,
  STUDENT_LEVELS,
  getCountryLabel,
} from '../../../shared/constants/learningProfile.constants';
import { updateLearningProfile } from '../../Auth/services/auth.service';
import { getErrorMessage } from '../../../shared/utils/formatters';

const STEPS = [
  { title: 'Your education', icon: GraduationCap },
  { title: 'Where you learn', icon: Globe },
  { title: 'How you learn', icon: Target },
  { title: 'Personalise further', icon: Sparkles },
];

const emptyForm = {
  educationLevel: '',
  countryCode: '',
  studentLevel: 'intermediate',
  ageGroup: '',
  learningGoals: [],
  preferredLanguage: 'English',
};

const StudentLearningProfileSetup = ({ opened, onComplete, initialProfile }) => {
  const [step, setStep] = useState(0);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState(emptyForm);

  useEffect(() => {
    if (!opened) return;
    setStep(0);
    setForm({
      educationLevel: initialProfile?.educationLevel ?? '',
      countryCode: initialProfile?.countryCode ?? '',
      studentLevel: initialProfile?.studentLevel ?? 'intermediate',
      ageGroup: initialProfile?.ageGroup ?? '',
      learningGoals: initialProfile?.learningGoals ?? [],
      preferredLanguage: initialProfile?.preferredLanguage ?? 'English',
    });
  }, [opened, initialProfile]);

  const current = STEPS[step];
  const Icon = current.icon;
  const progress = ((step + 1) / STEPS.length) * 100;

  const countryOptions = useMemo(
    () => COUNTRIES.map((country) => ({ value: country.value, label: country.label })),
    []
  );

  const canContinue = () => {
    if (step === 0) return Boolean(form.educationLevel);
    if (step === 1) return Boolean(form.countryCode);
    if (step === 2) return Boolean(form.studentLevel);
    return true;
  };

  const submit = async () => {
    setSaving(true);
    try {
      await updateLearningProfile({
        educationLevel: form.educationLevel,
        country: getCountryLabel(form.countryCode),
        countryCode: form.countryCode,
        studentLevel: form.studentLevel,
        ageGroup: form.ageGroup || undefined,
        learningGoals: form.learningGoals.length ? form.learningGoals : undefined,
        preferredLanguage: form.preferredLanguage || undefined,
      });
      notifications.show({
        title: 'Profile saved',
        message: 'Your learning preferences will improve lessons and AI tutoring.',
        color: 'green',
      });
      onComplete?.();
    } catch (err) {
      notifications.show({
        title: 'Could not save profile',
        message: getErrorMessage(err),
        color: 'red',
      });
    } finally {
      setSaving(false);
    }
  };

  const next = async () => {
    if (!canContinue()) {
      notifications.show({
        title: 'Required',
        message: 'Please complete this step before continuing.',
        color: 'orange',
      });
      return;
    }

    if (step >= STEPS.length - 1) {
      await submit();
      return;
    }

    setStep((value) => value + 1);
  };

  if (!opened) return null;

  return (
    <Modal
      opened={opened}
      onClose={() => {}}
      withCloseButton={false}
      title="Set up your learning profile"
      size="lg"
      centered
      closeOnClickOutside={false}
      closeOnEscape={false}
      classNames={{ content: 'glass-card !bg-card' }}
    >
      <p className="mb-4 text-sm text-muted-foreground">
        Tell us a little about yourself so Adesia can tailor lessons, examples, and AI tutoring to you.
        You can update these anytime in Settings.
      </p>

      <div className="mb-4">
        <div className="mb-2 flex justify-between text-xs text-muted-foreground">
          <span>Step {step + 1} of {STEPS.length}</span>
          <span>{Math.round(progress)}%</span>
        </div>
        <Progress value={progress} size="sm" radius="xl" />
      </div>

      <GlassCard className="space-y-4 p-4 sm:p-6">
        <div className="flex items-start gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-primary/15 text-primary">
            <Icon className="h-5 w-5" />
          </div>
          <div>
            <h3 className="font-display text-lg font-semibold text-foreground">{current.title}</h3>
            {step === 0 && (
              <p className="mt-1 text-sm text-muted-foreground">
                We use this to match lesson depth to your education stage.
              </p>
            )}
            {step === 1 && (
              <p className="mt-1 text-sm text-muted-foreground">
                Local examples and spelling help lessons feel relevant.
              </p>
            )}
            {step === 2 && (
              <p className="mt-1 text-sm text-muted-foreground">
                Choose how challenging new lessons should be by default.
              </p>
            )}
            {step === 3 && (
              <p className="mt-1 text-sm text-muted-foreground">
                Optional — helps us prioritise what matters most to you.
              </p>
            )}
          </div>
        </div>

        {step === 0 && (
          <Select
            label="Education level"
            placeholder="Select your current stage"
            data={EDUCATION_LEVELS}
            value={form.educationLevel}
            onChange={(value) => setForm({ ...form, educationLevel: value ?? '' })}
            searchable
            required
          />
        )}

        {step === 1 && (
          <Select
            label="Country"
            placeholder="Where do you study?"
            data={countryOptions}
            value={form.countryCode}
            onChange={(value) => setForm({ ...form, countryCode: value ?? '' })}
            searchable
            required
          />
        )}

        {step === 2 && (
          <div className="space-y-3">
            <SegmentedControl
              fullWidth
              value={form.studentLevel}
              onChange={(value) => setForm({ ...form, studentLevel: value })}
              data={STUDENT_LEVELS.map((level) => ({ value: level.value, label: level.label }))}
            />
            <p className="text-sm text-muted-foreground">
              {STUDENT_LEVELS.find((level) => level.value === form.studentLevel)?.description}
            </p>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-4">
            <Select
              label="Age group (optional)"
              placeholder="Select if you'd like to share"
              data={AGE_GROUPS}
              value={form.ageGroup}
              onChange={(value) => setForm({ ...form, ageGroup: value ?? '' })}
              clearable
            />
            <MultiSelect
              label="Learning goals (optional)"
              placeholder="What are you mainly here for?"
              data={LEARNING_GOALS}
              value={form.learningGoals}
              onChange={(value) => setForm({ ...form, learningGoals: value })}
              clearable
            />
            <Select
              label="Preferred language (optional)"
              data={LANGUAGE_OPTIONS}
              value={form.preferredLanguage}
              onChange={(value) =>
                setForm({ ...form, preferredLanguage: value ?? 'English' })
              }
            />
          </div>
        )}
      </GlassCard>

      <div className="mt-6 flex items-center justify-between gap-3">
        {step > 0 ? (
          <button
            type="button"
            className="btn-outline !px-4 !py-2 text-sm"
            disabled={saving}
            onClick={() => setStep((value) => value - 1)}
          >
            Back
          </button>
        ) : (
          <span />
        )}
        <GradientButton
          type="button"
          className="!px-4 !py-2 text-sm"
          disabled={saving || !canContinue()}
          onClick={next}
        >
          {saving
            ? 'Saving…'
            : step >= STEPS.length - 1
              ? 'Finish setup'
              : 'Continue'}
        </GradientButton>
      </div>
    </Modal>
  );
};

export default StudentLearningProfileSetup;
