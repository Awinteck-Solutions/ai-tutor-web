import { useEffect, useMemo, useState } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { Drawer } from '@mantine/core';
import {
  Bot,
  MessageCircle,
  NotebookPen,
  Plus,
  Sparkles,
  X,
} from 'lucide-react';
import { useAuth } from '../../../shared/context/AuthContext';
import { useTheme } from '../../../shared/context/ThemeContext';
import ChatPanel from './ChatPanel';
import NotesWorkspace from './NotesWorkspace';

const QUICK_ACTIONS = [
  {
    id: 'chat',
    label: 'Quick chat',
    description: 'Pick a lesson, then chat',
    icon: MessageCircle,
    iconClass: 'bg-primary/15 text-primary',
    rowClass: 'hover:bg-primary/10 hover:border-primary/30 border-transparent',
    onClick: 'chat',
  },
  {
    id: 'notes',
    label: 'Notes',
    description: 'Write & attach',
    icon: NotebookPen,
    iconClass: 'bg-accent/15 text-accent',
    rowClass: 'hover:bg-accent/10 hover:border-accent/30 border-transparent',
    onClick: 'notes',
  },
];

const FAB_ICON_CYCLE = [
  { Icon: Plus, label: 'Quick actions' },
  { Icon: Bot, label: 'AI tutor' },
  { Icon: NotebookPen, label: 'Notes' },
];

const SPARKLE_CLASSES = {
  light: [
    'text-primary/35',
    'text-primary/25 [animation-delay:1.3s]',
    'text-secondary/30 [animation-delay:2.6s]',
  ],
  dark: [
    'text-amber-100',
    'text-yellow-200 [animation-delay:1.3s]',
    'text-white/90 [animation-delay:2.6s]',
  ],
  edu: [
    'text-primary/40',
    'text-secondary/35 [animation-delay:1.3s]',
    'text-accent/30 [animation-delay:2.6s]',
  ],
};

const StudentQuickActions = () => {
  const { organizationId } = useAuth();
  const { theme } = useTheme();
  const { lessonId: routeLessonId } = useParams();
  const [searchParams] = useSearchParams();
  const [menuOpen, setMenuOpen] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  const [notesOpen, setNotesOpen] = useState(false);
  const [fabIconIndex, setFabIconIndex] = useState(0);

  const defaultLessonId = routeLessonId || searchParams.get('lessonId') || undefined;
  const sparkleClasses = SPARKLE_CLASSES[theme] ?? SPARKLE_CLASSES.light;

  useEffect(() => {
    if (menuOpen) return undefined;

    const intervalId = window.setInterval(() => {
      setFabIconIndex((index) => (index + 1) % FAB_ICON_CYCLE.length);
    }, 2000);

    return () => window.clearInterval(intervalId);
  }, [menuOpen]);

  const FabIcon = FAB_ICON_CYCLE[fabIconIndex].Icon;

  const chatContext = useMemo(
    () => (defaultLessonId ? { lessonId: defaultLessonId } : {}),
    [defaultLessonId],
  );

  if (!organizationId) return null;

  const handleAction = (action) => {
    setMenuOpen(false);
    if (action === 'chat') setChatOpen(true);
    if (action === 'notes') setNotesOpen(true);
  };

  return (
    <>
      {menuOpen && (
        <button
          type="button"
          className="fixed inset-0 z-40 cursor-default"
          aria-label="Close quick actions"
          onClick={() => setMenuOpen(false)}
        />
      )}

      <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3">
        {menuOpen && (
          <div className="w-[min(100vw-3rem,17rem)] rounded-2xl border border-border/80 bg-card p-2 shadow-xl">
            <p className="px-2 pb-2 pt-1 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
              Quick actions
            </p>
            <div className="flex flex-col gap-1.5">
              {QUICK_ACTIONS.map((item) => {
                const Icon = item.icon;
                const content = (
                  <>
                    <span
                      className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${item.iconClass}`}
                    >
                      <Icon className="h-5 w-5" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-semibold text-foreground">
                        {item.label}
                      </span>
                      <span className="block truncate text-xs text-muted-foreground">
                        {item.description}
                      </span>
                    </span>
                  </>
                );

                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => handleAction(item.onClick)}
                    className={`flex w-full items-center gap-3 rounded-xl border px-3 py-2.5 text-left transition ${item.rowClass}`}
                  >
                    {content}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        <div className={`relative ${menuOpen ? '' : 'animate-fab-bounce'}`}>
          {!menuOpen && (
            <>
              <Sparkles
                className={`pointer-events-none absolute -right-1 -top-1 h-4 w-4 animate-sparkle-twinkle drop-shadow-sm ${sparkleClasses[0]}`}
                aria-hidden
              />
              <Sparkles
                className={`pointer-events-none absolute -left-2 top-2 h-3.5 w-3.5 animate-sparkle-twinkle drop-shadow-sm ${sparkleClasses[1]}`}
                aria-hidden
              />
              <Sparkles
                className={`pointer-events-none absolute -top-2 left-1/2 h-3 w-3 -ml-1.5 animate-sparkle-twinkle drop-shadow-sm ${sparkleClasses[2]}`}
                aria-hidden
              />
            </>
          )}

          <button
            type="button"
            onClick={() => setMenuOpen((o) => !o)}
            className="flex h-14 w-14 items-center justify-center rounded-full bg-gradient-cta text-primary-foreground shadow-cta transition hover:scale-105 hover:brightness-105 active:scale-95"
            aria-label={menuOpen ? 'Close quick actions' : FAB_ICON_CYCLE[fabIconIndex].label}
            aria-expanded={menuOpen}
          >
            {menuOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <FabIcon key={fabIconIndex} className="h-6 w-6 animate-fab-icon-in" aria-hidden />
            )}
          </button>
        </div>
      </div>

      <ChatPanel
        opened={chatOpen}
        onClose={() => setChatOpen(false)}
        context={chatContext}
      />

      <Drawer
        opened={notesOpen}
        onClose={() => setNotesOpen(false)}
        withCloseButton={false}
        padding={0}
        position="right"
        size="100%"
        classNames={{
          content: 'student-drawer-solid flex flex-col !bg-card !backdrop-blur-none border-l border-border shadow-xl max-w-full sm:max-w-[min(100vw,720px)]',
          header: 'hidden',
          body: 'student-drawer-solid !bg-card h-full p-0',
        }}
        overlayProps={{ backgroundOpacity: 0.55 }}
      >
        <NotesWorkspace
          defaultLessonId={defaultLessonId}
          embedded
          onClose={() => setNotesOpen(false)}
        />
      </Drawer>
    </>
  );
};

export default StudentQuickActions;
