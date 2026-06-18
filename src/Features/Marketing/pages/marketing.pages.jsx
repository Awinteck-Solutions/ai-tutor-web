import { Link } from 'react-router-dom';
import {
  ArrowRight,
  BarChart3,
  BookOpen,
  Brain,
  Building2,
  Calendar,
  CheckCircle2,
  ClipboardList,
  FileText,
  Flame,
  GraduationCap,
  Heart,
  Home,
  Layers,
  LineChart,
  MessageSquare,
  Rocket,
  School,
  Sparkles,
  Target,
  TrendingUp,
  Upload,
  UserCheck,
  Users,
  Video,
} from 'lucide-react';
import { AdesiaLogo } from '../../../shared/components/AdesiaLogo';
import { FadeUp, StaggerContainer } from '../../../shared/components/Motion';
import { GlowOrbs } from '../../../shared/components/GlowOrbs';
import { GlassCard } from '../../../shared/components/GlassCard';
import { GradientText } from '../../../shared/components/GradientText';
import { GradientButton, GhostButton } from '../../../shared/components/GradientButton';
import { ThemeToggle } from '../../../shared/components/ThemeToggle';

const DEMO_EMAIL = 'info@adesiatutor.com';
const DEMO_PHONE = '+233547785025';
const DEMO_MAILTO = `mailto:${DEMO_EMAIL}?subject=School%20Demo%20Request`;
const DEMO_TEL = 'tel:+233547785025';

const navLinks = [
  { href: '#audiences', label: 'Who it\'s for' },
  { href: '#flow', label: 'How it works' },
  { href: '#ai-tutor', label: 'AI tutor' },
  { href: '#analytics', label: 'Analytics' },
];

const audienceCards = [
  {
    id: 'self-learners',
    icon: Rocket,
    label: 'Self-learners',
    headline: 'Learn anything, anytime',
    href: '#self-learners',
  },
  {
    id: 'schools',
    icon: Building2,
    label: 'Schools',
    headline: 'Centralized learning for every classroom',
    href: '#schools',
  },
  {
    id: 'parents',
    icon: Heart,
    label: 'Parents',
    headline: 'Support learning at home with real visibility',
    href: '#parents',
  },
  {
    id: 'teachers',
    icon: ClipboardList,
    label: 'Teachers',
    headline: 'Spot struggling students early',
    href: '#teachers',
  },
];

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

const afterSchoolPoints = [
  'Continue lessons from school',
  'Review weak topics with AI guidance',
  'Practice with auto-generated quizzes',
  'Study using flashcards on any device',
  'Ask questions to a context-aware AI tutor',
  'Follow personalized learning paths',
];

const parentFeatures = [
  'Create and manage child accounts',
  'Monitor daily and weekly learning activity',
  'View completed lessons and study time',
  'Track quiz performance and topic mastery',
  'Identify strengths and areas needing support',
  'Follow learning milestones and streaks',
  'Receive AI-powered learning recommendations',
];

const parentMetrics = [
  { label: 'Study time', value: '4h 20m', sub: 'This week', icon: Calendar },
  { label: 'Lessons completed', value: '12', sub: '+3 vs last week', icon: BookOpen },
  { label: 'Quiz scores', value: '78%', sub: 'Average', icon: Target },
  { label: 'Topic mastery', value: '64%', sub: 'Biology', icon: TrendingUp },
  { label: 'Learning streak', value: '9 days', sub: 'Personal best', icon: Flame },
  { label: 'Needs support', value: 'Algebra', sub: 'Recommended focus', icon: LineChart },
];

const teacherFeatures = [
  'Upload teaching materials once — reuse across classes',
  'Generate structured lessons automatically',
  'Create quizzes and flashcards in minutes',
  'Track class performance at a glance',
  'Monitor student engagement and study time',
  'Identify weak topics across the cohort',
  'Detect struggling students before exams',
  'Assign learning activities with clear outcomes',
];

const schoolFeatures = [
  { icon: School, title: 'Multi-school support', body: 'Manage campuses, roles, and access from one platform.' },
  { icon: Layers, title: 'Curriculum organization', body: 'Structure subjects, topics, and academic years clearly.' },
  { icon: BarChart3, title: 'Learning analytics', body: 'Measure outcomes — not just logins and page views.' },
  { icon: UserCheck, title: 'Performance insights', body: 'See which students and topics need intervention.' },
  { icon: MessageSquare, title: 'AI tutoring', body: 'Grounded help that stays tied to your materials.' },
  { icon: TrendingUp, title: 'Progress tracking', body: 'Follow mastery, streaks, and revision across terms.' },
];

const selfLearnerTopics = [
  'Python Programming',
  'Mathematics',
  'Biology',
  'Data Science',
  'Accounting',
  'Physics',
  'Business Studies',
  'Any academic topic',
];

const uploadTypes = [
  { icon: FileText, label: 'PDFs & documents' },
  { icon: Layers, label: 'Slides & notes' },
  { icon: Video, label: 'YouTube lectures' },
  { icon: BookOpen, label: 'Textbooks & readings' },
];

const flowSteps = [
  { step: '01', title: 'Upload materials', desc: 'PDFs, slides, notes, docs, or educational videos', icon: Upload },
  { step: '02', title: 'AI creates lessons', desc: 'Structured paths with objectives and key concepts', icon: Sparkles },
  { step: '03', title: 'Study interactively', desc: 'Read, chat, and explore within your content', icon: BookOpen },
  { step: '04', title: 'Practice & retain', desc: 'Flashcards and quizzes generated from each lesson', icon: Layers },
  { step: '05', title: 'Track mastery', desc: 'Progress, streaks, weak areas, and revision plans', icon: CheckCircle2 },
];

const aiTutorFeatures = [
  'Context-aware AI tutoring tied to your uploads',
  'Lesson-specific explanations at the right level',
  'Instant answers without leaving your materials',
  'Guided support that encourages understanding',
];

const analyticsAudiences = [
  {
    icon: GraduationCap,
    role: 'Students',
    points: ['See topic mastery and streaks', 'Focus revision on weak areas', 'Stay motivated with clear progress'],
  },
  {
    icon: Users,
    role: 'Parents',
    points: ['Know if children are actually studying', 'Spot subjects needing extra help', 'Celebrate milestones together'],
  },
  {
    icon: ClipboardList,
    role: 'Teachers',
    points: ['Intervene before grades slip', 'Align support to class-wide gaps', 'Spend less time guessing who needs help'],
  },
];

const examTypes = ['BECE', 'WASSCE', 'University exams', 'Professional certifications'];

const examFeatures = [
  'Revise topics with structured lesson paths',
  'Practice with quizzes matched to your materials',
  'Review flashcards for active recall',
  'Focus on weak areas flagged by analytics',
  'Follow personalized revision plans',
];

const testimonials = [
  {
    quote: 'My daughter actually studies after school now. I can see her quiz scores improving week by week — I don\'t have to guess whether she\'s preparing for exams.',
    name: 'Ama O.',
    role: 'Parent',
    outcome: 'Better study habits at home',
  },
  {
    quote: 'I upload my slides once and get lessons, quizzes, and flashcards for the whole class. I finally know which students are falling behind before the test.',
    name: 'Kwame A.',
    role: 'Teacher',
    outcome: 'Early intervention, less prep time',
  },
  {
    quote: 'I turned my lecture PDFs into lessons and passed my certification on the first try. The AI tutor answered questions exactly from my notes.',
    name: 'Sarah M.',
    role: 'Self-learner',
    outcome: 'Exam-ready in weeks, not months',
  },
];

const SectionIntro = ({ eyebrow, title, titleGradient, description, center = true }) => (
  <FadeUp className={`mb-12 lg:mb-14 ${center ? 'text-center' : ''}`}>
    {eyebrow && (
      <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-primary">{eyebrow}</p>
    )}
    <h2 className="font-display text-3xl font-bold sm:text-4xl">
      {title}
      {titleGradient && <> <GradientText>{titleGradient}</GradientText></>}
    </h2>
    {description && (
      <p className={`mt-4 text-muted-foreground ${center ? 'mx-auto max-w-2xl' : 'max-w-2xl'}`}>
        {description}
      </p>
    )}
  </FadeUp>
);

const FeatureList = ({ items, icon: Icon = CheckCircle2 }) => (
  <ul className="space-y-3">
    {items.map((item) => (
      <li key={item} className="flex items-start gap-3 text-sm text-foreground">
        <Icon className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
        <span>{item}</span>
      </li>
    ))}
  </ul>
);

const MarketingPage = () => (
  <div className="relative min-h-screen overflow-x-hidden bg-background text-foreground">
    <GlowOrbs />

    <header className="sticky top-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-xl">
      <div className="container-wide flex h-16 items-center justify-between">
        <AdesiaLogo />
        <nav className="hidden items-center gap-6 lg:flex">
          {navLinks.map(({ href, label }) => (
            <a
              key={href}
              href={href}
              className="text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              {label}
            </a>
          ))}
        </nav>
        <div className="flex items-center gap-3">
          <ThemeToggle />
          <Link
            to="/login"
            className="hidden text-sm font-medium text-muted-foreground transition-colors hover:text-foreground sm:inline"
          >
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
            AI-powered learning for school, home, and beyond
          </div>
        </FadeUp>
        <FadeUp delay={1}>
          <h1 className="font-display text-4xl font-bold leading-[1.1] tracking-tight sm:text-5xl lg:text-6xl xl:text-7xl">
            Your personal AI learning companion for{' '}
            <GradientText>school, home, and beyond</GradientText>
          </h1>
        </FadeUp>
        <FadeUp delay={2}>
          <p className="mx-auto mt-6 max-w-3xl text-lg text-muted-foreground sm:text-xl">
            Upload notes, PDFs, slides, or educational videos. Adesia automatically generates
            lessons, flashcards, quizzes, and revision plans — then powers an AI tutor that
            understands your content. Track progress across every topic, inside and outside the classroom.
          </p>
        </FadeUp>
        <FadeUp delay={3}>
          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <GradientButton to="/login">
              Get started free
              <ArrowRight className="h-4 w-4" />
            </GradientButton>
            <GhostButton href={DEMO_MAILTO}>Book a school demo</GhostButton>
          </div>
        </FadeUp>
        <FadeUp delay={4}>
          <p className="mt-6 text-sm text-muted-foreground">
            Trusted by learners, parents, teachers, and schools — from classroom to exam prep.
          </p>
          <p className="mt-2 text-xs text-muted-foreground">
            School demo:{' '}
            <a href={DEMO_MAILTO} className="text-primary hover:underline">{DEMO_EMAIL}</a>
            {' '}or{' '}
            <a href={DEMO_TEL} className="text-primary hover:underline">{DEMO_PHONE}</a>
          </p>
        </FadeUp>
      </div>
    </section>

    {/* Audience quick nav */}
    <section id="audiences" className="border-t border-border/50 pb-16 pt-4 lg:pb-20">
      <div className="container-wide">
        <StaggerContainer className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {audienceCards.map(({ id, icon: Icon, label, headline, href }) => (
            <FadeUp key={id}>
              <a href={href} className="block no-underline">
                <GlassCard hover className="h-full p-6">
                  <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-primary/15 text-primary">
                    <Icon className="h-5 w-5" />
                  </div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-primary">{label}</p>
                  <p className="mt-2 font-display text-base font-semibold text-foreground">{headline}</p>
                </GlassCard>
              </a>
            </FadeUp>
          ))}
        </StaggerContainer>
      </div>
    </section>

    {/* Pillars */}
    <section id="features" className="section-padding border-t border-border/50 bg-gradient-band">
      <div className="container-wide">
        <SectionIntro
          title="Built for how people"
          titleGradient="actually learn"
          description="Calm, capable, and outcome-driven — like a patient tutor who plans ahead and keeps learning active."
        />
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

    {/* Self-learners */}
    <section id="self-learners" className="section-padding border-t border-border/50 bg-gradient-band">
      <div className="container-wide">
        <SectionIntro
          eyebrow="For independent learners"
          title="Learn anything,"
          titleGradient="anytime"
          description="University students, professionals, exam candidates, and lifelong learners — upload your materials and study with an AI tutor, even when no teacher is in the room."
        />
        <div className="grid gap-10 lg:grid-cols-2">
          <FadeUp>
            <p className="mb-4 text-sm font-semibold text-foreground">Upload any learning material</p>
            <div className="grid grid-cols-2 gap-3">
              {uploadTypes.map(({ icon: Icon, label }) => (
                <GlassCard key={label} className="flex items-center gap-3 p-4">
                  <Icon className="h-5 w-5 shrink-0 text-primary" />
                  <span className="text-sm font-medium">{label}</span>
                </GlassCard>
              ))}
            </div>
            <p className="mt-6 text-sm text-muted-foreground">
              Adesia converts uploads into structured lessons, quizzes, flashcards, revision notes,
              and AI tutoring sessions — automatically.
            </p>
          </FadeUp>
          <FadeUp delay={2}>
            <p className="mb-4 text-sm font-semibold text-foreground">Popular topics learners study</p>
            <div className="flex flex-wrap gap-2">
              {selfLearnerTopics.map((topic) => (
                <span
                  key={topic}
                  className="rounded-full border border-border/50 bg-card/60 px-4 py-2 text-sm text-foreground"
                >
                  {topic}
                </span>
              ))}
            </div>
            <div className="mt-8">
              <GradientButton to="/login">
                Start self-learning free
                <ArrowRight className="h-4 w-4" />
              </GradientButton>
            </div>
          </FadeUp>
        </div>
      </div>
    </section>

    {/* After school — Parents */}
    <section id="after-school" className="section-padding border-t border-border/50">
      <div className="container-wide">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          <div>
            <SectionIntro
              eyebrow="For parents & guardians"
              title="Keep learning active"
              titleGradient="after school hours"
              description="When students leave the classroom, learning often slows down. Adesia helps parents create structured study at home — during evenings, weekends, and vacations — without needing to be subject experts."
              center={false}
            />
            <FadeUp>
              <FeatureList items={afterSchoolPoints} />
              <p className="mt-6 text-sm leading-relaxed text-muted-foreground">
                Parents gain visibility into their child&apos;s learning journey. You&apos;ll know
                what was studied, how quizzes went, and where extra support helps most.
              </p>
            </FadeUp>
          </div>
          <FadeUp delay={2}>
            <GlassCard className="relative overflow-hidden p-8">
              <div className="pointer-events-none absolute inset-0 bg-gradient-cta opacity-[0.07]" />
              <div className="relative flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/15 text-primary">
                  <Home className="h-6 w-6" />
                </div>
                <div>
                  <p className="font-display text-lg font-semibold">Learning continues at home</p>
                  <p className="text-sm text-muted-foreground">Evenings · Weekends · Holidays</p>
                </div>
              </div>
              <ul className="relative mt-6 space-y-3">
                {['Review today\'s school topics', 'Practice with quizzes & flashcards', 'Ask the AI tutor for help'].map((item) => (
                  <li key={item} className="flex items-center gap-3 rounded-lg border border-border/40 bg-card/50 px-4 py-3 text-sm">
                    <CheckCircle2 className="h-4 w-4 shrink-0 text-primary" />
                    {item}
                  </li>
                ))}
              </ul>
            </GlassCard>
          </FadeUp>
        </div>
      </div>
    </section>

    {/* Parent dashboard */}
    <section id="parents" className="section-padding border-t border-border/50 bg-gradient-band">
      <div className="container-wide">
        <SectionIntro
          eyebrow="Parent dashboard"
          title="Give parents real visibility into"
          titleGradient="learning progress"
          description="Parents no longer have to wonder whether their children are studying. See measurable engagement, quiz performance, and topics that need attention — all in one place."
        />
        <FadeUp>
          <GlassCard className="overflow-hidden p-6 sm:p-8">
            <div className="mb-6 flex flex-wrap items-center justify-between gap-3 border-b border-border/40 pb-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Parent overview</p>
                <p className="font-display text-lg font-semibold">Kofi&apos;s learning this week</p>
              </div>
              <span className="rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
                3 subjects active
              </span>
            </div>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {parentMetrics.map(({ label, value, sub, icon: Icon }) => (
                <div
                  key={label}
                  className="rounded-xl border border-border/40 bg-card/40 p-4"
                >
                  <div className="mb-2 flex items-center justify-between">
                    <p className="text-xs text-muted-foreground">{label}</p>
                    <Icon className="h-4 w-4 text-primary" />
                  </div>
                  <p className="font-display text-2xl font-bold text-foreground">{value}</p>
                  <p className="mt-1 text-xs text-muted-foreground">{sub}</p>
                </div>
              ))}
            </div>
          </GlassCard>
        </FadeUp>
        <FadeUp delay={2}>
          <div className="mt-10 grid gap-8 lg:grid-cols-2">
            <FeatureList items={parentFeatures} />
            <GlassCard className="p-6">
              <p className="font-display font-semibold text-foreground">What parents see at a glance</p>
              <p className="mt-2 text-sm text-muted-foreground">
                Daily activity, completed lessons, quiz trends, mastery by topic, streaks,
                and AI recommendations for what to study next — without micromanaging every session.
              </p>
            </GlassCard>
          </div>
        </FadeUp>
      </div>
    </section>

    {/* Teachers */}
    <section id="teachers" className="section-padding border-t border-border/50">
      <div className="container-wide">
        <div className="grid items-start gap-12 lg:grid-cols-2">
          <FadeUp>
            <GlassCard className="p-8">
              <p className="text-xs font-semibold uppercase tracking-wide text-primary">For teachers</p>
              <h2 className="mt-2 font-display text-3xl font-bold sm:text-4xl">
                Know exactly which students{' '}
                <GradientText>need support</GradientText>
              </h2>
              <p className="mt-4 text-muted-foreground">
                Teachers spend less time creating content and more time helping students succeed.
                Upload once, generate lessons and assessments automatically, then act on clear performance data.
              </p>
            </GlassCard>
          </FadeUp>
          <FadeUp delay={2}>
            <FeatureList items={teacherFeatures} icon={UserCheck} />
          </FadeUp>
        </div>
      </div>
    </section>

    {/* Schools */}
    <section id="schools" className="section-padding border-t border-border/50 bg-gradient-band">
      <div className="container-wide">
        <SectionIntro
          eyebrow="For schools & organizations"
          title="An AI learning platform"
          titleGradient="built for schools"
          description="Provide a centralized ecosystem where students learn inside and outside the classroom, teachers monitor performance, administrators track outcomes, and parents stay involved."
        />
        <StaggerContainer className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {schoolFeatures.map(({ icon: Icon, title, body }) => (
            <FadeUp key={title}>
              <GlassCard hover className="h-full p-6">
                <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-primary/15 text-primary">
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className="font-display font-semibold">{title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{body}</p>
              </GlassCard>
            </FadeUp>
          ))}
        </StaggerContainer>
        <FadeUp delay={2}>
          <div className="mt-10 text-center">
            <GhostButton href={DEMO_MAILTO}>Request a school demo</GhostButton>
            <p className="mt-3 text-xs text-muted-foreground">
              <a href={DEMO_MAILTO} className="text-primary hover:underline">{DEMO_EMAIL}</a>
              {' · '}
              <a href={DEMO_TEL} className="text-primary hover:underline">{DEMO_PHONE}</a>
            </p>
          </div>
        </FadeUp>
      </div>
    </section>

    {/* How it works */}
    <section id="flow" className="section-padding border-t border-border/50 bg-gradient-band">
      <div className="container-wide">
        <SectionIntro
          title="How it"
          titleGradient="works"
          description="From raw material to mastery — one continuous flow designed for retention and measurable progress."
        />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {flowSteps.map(({ step, title, desc, icon: Icon }, i) => (
            <FadeUp key={step} delay={i}>
              <GlassCard className="relative h-full p-6 text-center">
                <span className="font-mono text-[10px] font-medium text-muted-foreground">{step}</span>
                <div className="mx-auto my-4 flex h-11 w-11 items-center justify-center rounded-xl bg-primary/15 text-primary">
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className="font-display font-semibold">{title}</h3>
                <p className="mt-2 text-xs leading-relaxed text-muted-foreground">{desc}</p>
              </GlassCard>
            </FadeUp>
          ))}
        </div>
      </div>
    </section>

    {/* AI tutor */}
    <section id="ai-tutor" className="section-padding border-t border-border/50">
      <div className="container-wide">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          <FadeUp>
            <SectionIntro
              eyebrow="AI tutor"
              title="Ask questions."
              titleGradient="Get personalized answers."
              description="Students chat directly with their lessons, notes, PDFs, and videos. The AI tutor understands the learning context and explains concepts at the student's level."
              center={false}
            />
            <FeatureList items={aiTutorFeatures} icon={MessageSquare} />
          </FadeUp>
          <FadeUp delay={2}>
            <GlassCard className="p-6">
              <div className="space-y-4">
                <div className="rounded-xl border border-border/40 bg-muted/20 p-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Student</p>
                  <p className="mt-1 text-sm text-foreground">
                    Can you explain photosynthesis using my biology notes?
                  </p>
                </div>
                <div className="rounded-xl border border-primary/20 bg-primary/5 p-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-primary">Adesia AI tutor</p>
                  <p className="mt-1 text-sm text-foreground">
                    Based on your uploaded chapter, photosynthesis converts light energy into chemical
                    energy. Let&apos;s walk through the two stages in your notes…
                  </p>
                </div>
              </div>
            </GlassCard>
          </FadeUp>
        </div>
      </div>
    </section>

    {/* Analytics */}
    <section id="analytics" className="section-padding border-t border-border/50 bg-gradient-band">
      <div className="container-wide">
        <SectionIntro
          title="Measure learning,"
          titleGradient="not just activity"
          description="Topic mastery, streaks, study consistency, quiz performance, weak areas, and AI recommendations — so every stakeholder can act on real outcomes."
        />
        <StaggerContainer className="grid gap-6 md:grid-cols-3">
          {analyticsAudiences.map(({ icon: Icon, role, points }) => (
            <FadeUp key={role}>
              <GlassCard hover className="h-full p-6">
                <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-primary/15 text-primary">
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className="font-display font-semibold">{role}</h3>
                <ul className="mt-4 space-y-2">
                  {points.map((point) => (
                    <li key={point} className="flex items-start gap-2 text-sm text-muted-foreground">
                      <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-accent" />
                      {point}
                    </li>
                  ))}
                </ul>
              </GlassCard>
            </FadeUp>
          ))}
        </StaggerContainer>
      </div>
    </section>

    {/* Exam prep */}
    <section id="exams" className="section-padding border-t border-border/50">
      <div className="container-wide">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          <FadeUp>
            <SectionIntro
              eyebrow="Exam preparation"
              title="Prepare smarter"
              titleGradient="for exams"
              description="Revise with purpose. Focus time on weak topics, practice with material-matched quizzes, and follow revision plans built from your own content."
              center={false}
            />
            <FeatureList items={examFeatures} />
          </FadeUp>
          <FadeUp delay={2}>
            <GlassCard className="p-8">
              <p className="mb-4 text-sm font-semibold text-foreground">Perfect for</p>
              <div className="grid grid-cols-2 gap-3">
                {examTypes.map((exam) => (
                  <div
                    key={exam}
                    className="rounded-xl border border-border/40 bg-card/50 px-4 py-3 text-center text-sm font-medium"
                  >
                    {exam}
                  </div>
                ))}
              </div>
            </GlassCard>
          </FadeUp>
        </div>
      </div>
    </section>

    {/* Testimonials */}
    <section id="testimonials" className="section-padding border-t border-border/50 bg-gradient-band">
      <div className="container-wide">
        <SectionIntro
          title="Outcomes that"
          titleGradient="matter"
          description="Better performance, stronger study habits, and learning that continues beyond the classroom."
        />
        <StaggerContainer className="grid gap-6 md:grid-cols-3">
          {testimonials.map(({ quote, name, role, outcome }) => (
            <FadeUp key={name}>
              <GlassCard hover className="flex h-full flex-col p-6">
                <p className="flex-1 text-sm leading-relaxed text-foreground">&ldquo;{quote}&rdquo;</p>
                <div className="mt-6 border-t border-border/40 pt-4">
                  <p className="font-display font-semibold">{name}</p>
                  <p className="text-xs text-muted-foreground">{role}</p>
                  <p className="mt-2 text-xs font-medium text-primary">{outcome}</p>
                </div>
              </GlassCard>
            </FadeUp>
          ))}
        </StaggerContainer>
      </div>
    </section>

    {/* Final CTA */}
    <section id="demo" className="section-padding">
      <div className="container-narrow">
        <FadeUp>
          <GlassCard className="relative overflow-hidden p-10 text-center sm:p-16">
            <div className="pointer-events-none absolute inset-0 bg-gradient-cta opacity-10" />
            <h2 className="relative font-display text-3xl font-bold sm:text-4xl">
              Transform learning with <GradientText>AI</GradientText>
            </h2>
            <p className="relative mx-auto mt-4 max-w-2xl text-muted-foreground">
              Whether you&apos;re a student, parent, teacher, or school, Adesia AI Tutor turns
              educational content into meaningful learning experiences — in class, at home, and on your own schedule.
            </p>
            <div className="relative mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <GradientButton to="/login">
                Start learning free
                <ArrowRight className="h-4 w-4" />
              </GradientButton>
              <GhostButton href={DEMO_MAILTO}>Request a school demo</GhostButton>
            </div>
            <p className="relative mt-4 text-xs text-muted-foreground">
              Demo requests:{' '}
              <a href={DEMO_MAILTO} className="text-primary hover:underline">{DEMO_EMAIL}</a>
              {' '}or call{' '}
              <a href={DEMO_TEL} className="text-primary hover:underline">{DEMO_PHONE}</a>
            </p>
          </GlassCard>
        </FadeUp>
      </div>
    </section>

    <footer className="border-t border-border/50 py-12">
      <div className="container-wide flex flex-col items-center justify-between gap-6 sm:flex-row">
        <AdesiaLogo size="sm" />
        <div className="flex flex-wrap justify-center gap-6 text-xs text-muted-foreground">
          <a href="#schools" className="hover:text-foreground">Schools</a>
          <a href="#parents" className="hover:text-foreground">Parents</a>
          <a href="#teachers" className="hover:text-foreground">Teachers</a>
          <a href="#self-learners" className="hover:text-foreground">Self-learners</a>
          <a href="#" className="hover:text-foreground">Privacy</a>
          <a href="#" className="hover:text-foreground">Terms</a>
          <a href={DEMO_MAILTO} className="hover:text-foreground">{DEMO_EMAIL}</a>
          <a href={DEMO_TEL} className="hover:text-foreground">{DEMO_PHONE}</a>
        </div>
        <p className="text-xs text-muted-foreground">© {new Date().getFullYear()} Adesia</p>
      </div>
    </footer>
  </div>
);

export default MarketingPage;
