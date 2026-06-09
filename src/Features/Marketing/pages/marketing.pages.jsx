import { Link } from 'react-router-dom';
import {
  ArrowRight,
  BookOpen,
  Brain,
  CheckCircle2,
  Layers,
  MessageSquare,
  Sparkles,
  Upload,
} from 'lucide-react';
import { AdesiaLogo } from '../../../shared/components/AdesiaLogo';
import { FadeUp, StaggerContainer } from '../../../shared/components/Motion';
import { GlowOrbs } from '../../../shared/components/GlowOrbs';
import { GlassCard } from '../../../shared/components/GlassCard';
import { GradientText } from '../../../shared/components/GradientText';
import { GradientButton, GhostButton } from '../../../shared/components/GradientButton';
import { ThemeToggle } from '../../../shared/components/ThemeToggle';

const pillars = [
  {
    icon: Layers,
    title: 'Structured',
    body: 'Turn messy uploads into clear lesson paths — not one-off answers scattered in a chat thread.',
  },
  {
    icon: BookOpen,
    title: 'Grounded',
    body: 'Chat, summaries, and assessments trace back to the learner’s own sources with visible citations.',
  },
  {
    icon: Brain,
    title: 'Active learning',
    body: 'Flashcards and quizzes reinforce what was just taught, with spaced repetition built in.',
  },
];

const flowSteps = [
  { step: '01', title: 'Upload', desc: 'PDFs, notes, slides, or links', icon: Upload },
  { step: '02', title: 'Lesson', desc: 'Structured sections from your material', icon: BookOpen },
  { step: '03', title: 'Flashcards', desc: 'Generated per section', icon: Layers },
  { step: '04', title: 'Quiz', desc: 'Check understanding immediately', icon: CheckCircle2 },
  { step: '05', title: 'Chat', desc: 'Ask questions — answers cite your files', icon: MessageSquare },
];

const useCases = [
  'University students prepping for exams',
  'Professionals studying for certifications',
  'Self-directed learners building a personal library',
];

const MarketingPage = () => (
  <div className="relative min-h-screen overflow-x-hidden bg-background text-foreground">
    <GlowOrbs />

    {/* Header */}
    <header className="sticky top-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-xl">
      <div className="container-wide flex h-16 items-center justify-between">
        <AdesiaLogo />
        <nav className="hidden items-center gap-8 md:flex">
          <a href="#features" className="text-sm text-muted-foreground transition-colors hover:text-foreground">Features</a>
          <a href="#flow" className="text-sm text-muted-foreground transition-colors hover:text-foreground">How it works</a>
          <a href="#use-cases" className="text-sm text-muted-foreground transition-colors hover:text-foreground">Use cases</a>
        </nav>
        <div className="flex items-center gap-3">
          <ThemeToggle />
          <Link to="/login" className="hidden text-sm font-medium text-muted-foreground transition-colors hover:text-foreground sm:inline">
            Log in
          </Link>
          <GradientButton to="/login" className="!px-4 !py-2 text-xs sm:!px-5 sm:text-sm">
            Get started
          </GradientButton>
        </div>
      </div>
    </header>

    {/* Hero */}
    <section className="section-padding relative">
      <div className="container-narrow text-center">
        <FadeUp>
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-border/50 bg-card/60 px-4 py-1.5 text-xs font-medium text-muted-foreground backdrop-blur-sm">
            <Sparkles className="h-3.5 w-3.5 text-primary" />
            AI tutor from your own materials
          </div>
        </FadeUp>
        <FadeUp delay={1}>
          <h1 className="font-display text-4xl font-bold leading-[1.1] tracking-tight sm:text-5xl lg:text-7xl">
            Turn uploads into{' '}
            <GradientText>structured lessons</GradientText>
          </h1>
        </FadeUp>
        <FadeUp delay={2}>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground sm:text-xl">
            Adesia ingests what you upload, builds lesson paths, generates flashcards and quizzes,
            summarizes key ideas — and powers chat that stays grounded in your sources.
          </p>
        </FadeUp>
        <FadeUp delay={3}>
          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <GradientButton to="/login">
              Start learning free
              <ArrowRight className="h-4 w-4" />
            </GradientButton>
            <GhostButton href="#flow">See how it works</GhostButton>
          </div>
        </FadeUp>
        <FadeUp delay={4}>
          <p className="mt-6 text-sm text-muted-foreground">
            From your PDF to a lesson in minutes.
          </p>
        </FadeUp>
      </div>
    </section>

    {/* Pillars */}
    <section id="features" className="section-padding border-t border-border/50 bg-gradient-band">
      <div className="container-wide">
        <FadeUp className="mb-14 text-center">
          <h2 className="font-display text-3xl font-bold sm:text-4xl">
            Built for how people <GradientText>actually study</GradientText>
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-muted-foreground">
            Calm, capable, and encouraging — like a patient tutor who plans ahead.
          </p>
        </FadeUp>
        <StaggerContainer className="grid gap-6 md:grid-cols-3">
          {pillars.map(({ icon: Icon, title, body }) => (
            <FadeUp key={title}>
              <GlassCard hover className="h-full p-8">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/15 text-primary">
                  <Icon className="h-6 w-6" />
                </div>
                <h3 className="font-display text-xl font-bold">{title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{body}</p>
              </GlassCard>
            </FadeUp>
          ))}
        </StaggerContainer>
      </div>
    </section>

    {/* Flow */}
    <section id="flow" className="section-padding">
      <div className="container-wide">
        <FadeUp className="mb-14 text-center">
          <h2 className="font-display text-3xl font-bold sm:text-4xl">
            Upload → learn → <GradientText>retain</GradientText>
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-muted-foreground">
            One continuous flow from raw material to active recall.
          </p>
        </FadeUp>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {flowSteps.map(({ step, title, desc, icon: Icon }, i) => (
            <FadeUp key={step} delay={i}>
              <GlassCard className="relative p-6 text-center">
                <span className="font-mono text-[10px] font-medium text-muted-foreground">{step}</span>
                <div className="mx-auto my-4 flex h-11 w-11 items-center justify-center rounded-xl bg-primary/15 text-primary">
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className="font-display font-semibold">{title}</h3>
                <p className="mt-1 text-xs text-muted-foreground">{desc}</p>
              </GlassCard>
            </FadeUp>
          ))}
        </div>
      </div>
    </section>

    {/* Use cases */}
    <section id="use-cases" className="section-padding border-t border-border/50">
      <div className="container-narrow">
        <FadeUp className="mb-10 text-center">
          <h2 className="font-display text-3xl font-bold">Made for serious learners</h2>
        </FadeUp>
        <StaggerContainer className="space-y-4">
          {useCases.map((item) => (
            <FadeUp key={item}>
              <GlassCard className="flex items-center gap-4 p-5">
                <CheckCircle2 className="h-5 w-5 shrink-0 text-accent" />
                <span className="text-sm text-foreground">{item}</span>
              </GlassCard>
            </FadeUp>
          ))}
        </StaggerContainer>
      </div>
    </section>

    {/* CTA band */}
    <section className="section-padding">
      <div className="container-narrow">
        <FadeUp>
          <GlassCard className="relative overflow-hidden p-10 text-center sm:p-16">
            <div className="pointer-events-none absolute inset-0 bg-gradient-cta opacity-10" />
            <h2 className="relative font-display text-3xl font-bold sm:text-4xl">
              Ready to study smarter with <GradientText>Adesia</GradientText>?
            </h2>
            <p className="relative mx-auto mt-4 max-w-lg text-muted-foreground">
              Upload your first material and see a structured lesson path in minutes.
            </p>
            <div className="relative mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <GradientButton to="/login">Upload your first material</GradientButton>
              <GhostButton to="/login">Try a sample lesson</GhostButton>
            </div>
          </GlassCard>
        </FadeUp>
      </div>
    </section>

    {/* Footer */}
    <footer className="border-t border-border/50 py-12">
      <div className="container-wide flex flex-col items-center justify-between gap-6 sm:flex-row">
        <AdesiaLogo size="sm" />
        <div className="flex gap-6 text-xs text-muted-foreground">
          <a href="#" className="hover:text-foreground">Privacy</a>
          <a href="#" className="hover:text-foreground">Terms</a>
          <a href="#" className="hover:text-foreground">Contact</a>
        </div>
        <p className="text-xs text-muted-foreground">© {new Date().getFullYear()} Adesia</p>
      </div>
    </footer>
  </div>
);

export default MarketingPage;
