import { useMemo, useState } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import { Drawer } from '@mantine/core';
import {
  ExternalLink,
  MessageCircle,
  MessageSquare,
  NotebookPen,
  Plus,
  X,
} from 'lucide-react';
import { useAuth } from '../../../shared/context/AuthContext';
import ChatPanel from './ChatPanel';
import NotesWorkspace from './NotesWorkspace';

const SOLID_DRAWER = {
  content: 'student-drawer-solid flex flex-col !bg-card !backdrop-blur-none border-l border-border shadow-xl',
  header: 'student-drawer-solid-header !bg-card text-foreground',
  body: 'student-drawer-solid !bg-card',
};

const QUICK_ACTIONS = [
  {
    id: 'chat',
    label: 'Quick chat',
    description: 'Pop-up tutor',
    icon: MessageCircle,
    iconClass: 'bg-amber-400/20 text-amber-700 dark:bg-amber-400/25 dark:text-amber-300',
    rowClass: 'hover:bg-amber-500/10 hover:border-amber-500/25 border-transparent',
    onClick: 'chat',
  },
  {
    id: 'full-chat',
    label: 'Full chat page',
    description: 'Sessions & history',
    icon: MessageSquare,
    iconClass: 'bg-sky-500/15 text-sky-700 dark:bg-sky-400/20 dark:text-sky-300',
    rowClass: 'hover:bg-sky-500/10 hover:border-sky-500/25 border-transparent',
    href: (lessonId) =>
      lessonId ? `/student/chat?lessonId=${lessonId}` : '/student/chat',
  },
  {
    id: 'notes',
    label: 'Notes',
    description: 'Write & attach',
    icon: NotebookPen,
    iconClass: 'bg-emerald-500/15 text-emerald-700 dark:bg-emerald-400/20 dark:text-emerald-300',
    rowClass: 'hover:bg-emerald-500/10 hover:border-emerald-500/25 border-transparent',
    onClick: 'notes',
  },
];

const StudentQuickActions = () => {
  const { organizationId } = useAuth();
  const { lessonId: routeLessonId } = useParams();
  const [searchParams] = useSearchParams();
  const [menuOpen, setMenuOpen] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  const [notesOpen, setNotesOpen] = useState(false);

  const defaultLessonId = routeLessonId || searchParams.get('lessonId') || undefined;

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
                    {item.href && (
                      <ExternalLink className="h-3.5 w-3.5 shrink-0 text-muted-foreground opacity-60" />
                    )}
                  </>
                );

                const rowClass = `flex w-full items-center gap-3 rounded-xl border px-3 py-2.5 text-left transition ${item.rowClass}`;

                if (item.href) {
                  return (
                    <Link
                      key={item.id}
                      to={item.href(defaultLessonId)}
                      onClick={() => setMenuOpen(false)}
                      className={`${rowClass} no-underline`}
                    >
                      {content}
                    </Link>
                  );
                }

                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => handleAction(item.onClick)}
                    className={rowClass}
                  >
                    {content}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        <button
          type="button"
          onClick={() => setMenuOpen((o) => !o)}
          className="flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-amber-400 to-amber-600 text-amber-950 shadow-lg shadow-amber-500/30 transition hover:scale-105 active:scale-95"
          aria-label={menuOpen ? 'Close quick actions' : 'Quick actions'}
          aria-expanded={menuOpen}
        >
          {menuOpen ? <X className="h-6 w-6" /> : <Plus className="h-6 w-6" />}
        </button>
      </div>

      <ChatPanel
        opened={chatOpen}
        onClose={() => setChatOpen(false)}
        context={chatContext}
      />

      <Drawer
        opened={notesOpen}
        onClose={() => setNotesOpen(false)}
        title={(
          <span className="flex items-center gap-2 font-display font-semibold text-foreground">
            <NotebookPen className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
            My notes
          </span>
        )}
        position="right"
        size="lg"
        classNames={SOLID_DRAWER}
        overlayProps={{ backgroundOpacity: 0.55 }}
      >
        <NotesWorkspace defaultLessonId={defaultLessonId} embedded />
      </Drawer>
    </>
  );
};

export default StudentQuickActions;
