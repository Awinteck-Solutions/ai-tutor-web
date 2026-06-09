import { Building2, Mail, ArrowRight } from 'lucide-react';
import { AdesiaLogo } from '../../../shared/components/AdesiaLogo';
import { GlowOrbs } from '../../../shared/components/GlowOrbs';
import { GlassCard } from '../../../shared/components/GlassCard';
import { GradientText } from '../../../shared/components/GradientText';
import { GradientButton, GhostButton } from '../../../shared/components/GradientButton';
import { ThemeToggle } from '../../../shared/components/ThemeToggle';
import { FadeUp } from '../../../shared/components/Motion';

const steps = [
  { num: 1, title: 'Link your organization', desc: 'Your admin assigns you to a school or team workspace.' },
  { num: 2, title: 'Upload materials', desc: 'Add syllabi, chapters, or slides to your library.' },
  { num: 3, title: 'Start teaching', desc: 'Generate lessons, flashcards, and quizzes from uploads.' },
];

const OnboardingPage = () => (
  <div className="relative min-h-screen bg-background">
    <GlowOrbs />
    <div className="absolute right-4 top-4 z-10">
      <ThemeToggle />
    </div>

    <div className="container-narrow section-padding relative">
      <FadeUp className="mb-12 text-center">
        <AdesiaLogo className="justify-center mb-6" />
        <h1 className="font-display text-3xl font-bold sm:text-4xl">
          Set up your <GradientText>workspace</GradientText>
        </h1>
        <p className="mx-auto mt-4 max-w-lg text-muted-foreground">
          Your account isn’t linked to an organization yet. Follow these steps or contact your administrator.
        </p>
      </FadeUp>

      <div className="mx-auto max-w-xl space-y-4">
        {steps.map(({ num, title, desc }, i) => (
          <FadeUp key={num} delay={i}>
            <GlassCard className="flex gap-4 p-6">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/15 font-display text-sm font-bold text-primary">
                {num}
              </div>
              <div>
                <h3 className="font-display font-semibold">{title}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{desc}</p>
              </div>
            </GlassCard>
          </FadeUp>
        ))}
      </div>

      <FadeUp delay={3} className="mx-auto mt-10 max-w-xl">
        <GlassCard className="p-6 text-center">
          <Building2 className="mx-auto h-8 w-8 text-primary" />
          <p className="mt-4 text-sm text-muted-foreground">
            Waiting for an invite? Check your email or reach out to your organization admin.
          </p>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
            <GradientButton to="/login">
              <Mail className="h-4 w-4" />
              Back to sign in
            </GradientButton>
            <GhostButton href="mailto:support@adesia.app">
              Contact support
              <ArrowRight className="h-4 w-4" />
            </GhostButton>
          </div>
        </GlassCard>
      </FadeUp>
    </div>
  </div>
);

export default OnboardingPage;
