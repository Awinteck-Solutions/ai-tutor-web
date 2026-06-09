import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  BookOpen,
  MessageCircle,
  Plus,
  RotateCw,
  Search,
  Send,
  Sparkles,
  Square,
  X,
} from 'lucide-react';
import { notifications } from '@mantine/notifications';
import { useAuth } from '../../../shared/context/AuthContext';
import MarkdownContent from '../../../shared/components/MarkdownContent';
import { getErrorMessage } from '../../../shared/utils/formatters';
import {
  getChatSession,
  getLessons,
  listChatSessions,
  sendChatMessage,
} from '../services/student.services';

const SUGGESTIONS = [
  'Explain this topic in simple terms',
  'What are the key ideas I should remember?',
  'Give me practice questions',
  'Summarize what I need to know for a test',
];

const formatRelative = (value) => {
  if (!value) return '';
  const date = new Date(value);
  const diffMs = Date.now() - date.getTime();
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d`;
  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
};

const withRetryState = (msgs) =>
  msgs.map((m, i) => {
    if (m.role !== 'USER') return { ...m, failed: false };
    const next = msgs[i + 1];
    return {
      ...m,
      failed: !next || next.role !== 'ASSISTANT',
    };
  });

const isRequestCanceled = (error) =>
  error?.code === 'ERR_CANCELED' || error?.name === 'CanceledError';

const ChatExperience = ({
  context = {},
  onClose,
  fullPage = false,
}) => {
  const navigate = useNavigate();
  const { organizationId } = useAuth();
  const [lessons, setLessons] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [selectedLessonId, setSelectedLessonId] = useState(context.lessonId ?? null);
  const [sessionId, setSessionId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const bottomRef = useRef(null);
  const inputRef = useRef(null);
  const abortControllerRef = useRef(null);

  const activeLesson = useMemo(
    () => lessons.find((l) => l.id === selectedLessonId),
    [lessons, selectedLessonId],
  );

  const refreshData = useCallback(async () => {
    if (!organizationId) return { lessons: [], sessions: [] };
    const [lessonList, sessionList] = await Promise.all([
      getLessons(organizationId).catch(() => []),
      listChatSessions(organizationId).catch(() => []),
    ]);
    const normalizedLessons = Array.isArray(lessonList) ? lessonList : [];
    const normalizedSessions = Array.isArray(sessionList) ? sessionList : [];
    setLessons(normalizedLessons);
    setSessions(normalizedSessions);
    return { lessons: normalizedLessons, sessions: normalizedSessions };
  }, [organizationId]);

  const loadSession = useCallback(async (id) => {
    if (!id) return;
    setLoading(true);
    try {
      const data = await getChatSession(id);
      setMessages(withRetryState(data?.messages ?? []));
      setSessionId(id);
      if (data?.lessonId) setSelectedLessonId(data.lessonId);
    } catch (err) {
      notifications.show({ title: 'Chat', message: getErrorMessage(err), color: 'red' });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!organizationId) return;
    refreshData().then(({ lessons: lessonList, sessions: sessionList }) => {
      const initialLessonId = context.lessonId
        ?? lessonList.find((l) => l.generationStatus === 'COMPLETED')?.id
        ?? lessonList[0]?.id
        ?? null;
      if (!initialLessonId) return;
      setSelectedLessonId(initialLessonId);
      const latestSession = sessionList
        .filter((s) => s.lessonId === initialLessonId)
        .sort((a, b) => new Date(b.updatedAt ?? 0) - new Date(a.updatedAt ?? 0))[0];
      if (latestSession?.id) loadSession(latestSession.id);
    });
  }, [organizationId, context.lessonId, refreshData, loadSession]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, sending]);

  useEffect(
    () => () => {
      abortControllerRef.current?.abort();
    },
    [],
  );

  const latestSessionByLesson = useMemo(() => {
    const map = new Map();
    sessions.forEach((session) => {
      if (!session.lessonId) return;
      const existing = map.get(session.lessonId);
      if (
        !existing
        || new Date(session.updatedAt ?? 0) > new Date(existing.updatedAt ?? 0)
      ) {
        map.set(session.lessonId, session);
      }
    });
    return map;
  }, [sessions]);

  const lessonEntries = useMemo(() => {
    const q = search.trim().toLowerCase();
    return lessons
      .filter((lesson) => {
        if (!q) return true;
        return (
          lesson.title?.toLowerCase().includes(q)
          || lesson.summary?.toLowerCase().includes(q)
        );
      })
      .map((lesson) => ({
        ...lesson,
        latestSession: latestSessionByLesson.get(lesson.id) ?? null,
      }))
      .sort((a, b) => {
        const aTime = a.latestSession?.updatedAt ?? a.updatedAt ?? a.createdAt ?? 0;
        const bTime = b.latestSession?.updatedAt ?? b.updatedAt ?? b.createdAt ?? 0;
        return new Date(bTime) - new Date(aTime);
      });
  }, [lessons, latestSessionByLesson, search]);

  const selectLesson = (lessonId) => {
    setSelectedLessonId(lessonId);
    const latest = latestSessionByLesson.get(lessonId);
    if (latest?.id) {
      loadSession(latest.id);
    } else {
      setSessionId(null);
      setMessages([]);
      setInput('');
    }
    if (fullPage) {
      navigate(`/student/chat?lessonId=${lessonId}`, { replace: true });
    }
  };

  const startNewChat = () => {
    if (!selectedLessonId) return;
    setSessionId(null);
    setMessages([]);
    setInput('');
    inputRef.current?.focus();
  };

  const handleStop = () => {
    abortControllerRef.current?.abort();
  };

  const handleSend = async (textOverride, { retryMessageId } = {}) => {
    const text = (textOverride ?? input).trim();
    if (!text || !organizationId || !selectedLessonId || sending) return;

    const userMessageId = retryMessageId ?? `u-${Date.now()}`;
    const controller = new AbortController();
    abortControllerRef.current?.abort();
    abortControllerRef.current = controller;

    setSending(true);
    if (!textOverride && !retryMessageId) setInput('');

    if (retryMessageId) {
      setMessages((prev) =>
        prev.map((m) => (m.id === retryMessageId ? { ...m, failed: false } : m)),
      );
    } else {
      setMessages((prev) => [
        ...prev,
        { id: userMessageId, role: 'USER', content: text, failed: false },
      ]);
    }

    try {
      const chatOpts = {
        lessonId: selectedLessonId,
        signal: controller.signal,
      };
      if (sessionId) chatOpts.sessionId = sessionId;

      const res = await sendChatMessage(organizationId, text, chatOpts);
      const sid = res?.sessionId ?? sessionId;
      if (sid && sid !== sessionId) setSessionId(sid);

      setMessages((prev) => [
        ...prev,
        {
          id: res?.id ?? `a-${Date.now()}`,
          role: 'ASSISTANT',
          content: res?.content ?? res?.answer ?? 'No response',
        },
      ]);

      const { sessions: updatedSessions } = await refreshData();
      if (sid) {
        const session = updatedSessions.find((s) => s.id === sid);
        if (session?.lessonId) setSelectedLessonId(session.lessonId);
      }
    } catch (err) {
      if (isRequestCanceled(err)) {
        setMessages((prev) =>
          prev.map((m) => (m.id === userMessageId ? { ...m, failed: true } : m)),
        );
      } else {
        notifications.show({ title: 'Chat', message: getErrorMessage(err), color: 'red' });
        setMessages((prev) =>
          prev.map((m) => (m.id === userMessageId ? { ...m, failed: true } : m)),
        );
      }
    } finally {
      if (abortControllerRef.current === controller) {
        abortControllerRef.current = null;
      }
      setSending(false);
    }
  };

  const shellClass = fullPage
    ? 'flex h-[calc(100dvh-10rem)] min-h-[520px] overflow-hidden rounded-2xl border border-border/60 bg-card shadow-card'
    : 'flex h-full min-h-[100dvh] overflow-hidden bg-card';

  return (
    <div className={shellClass}>
      <aside className="flex w-[280px] shrink-0 flex-col border-r border-border/60 bg-muted/25">
        <div className="border-b border-border/50 p-3">
          <div className="mb-3 flex items-center justify-between gap-2">
            <span className="flex items-center gap-2 font-display text-sm font-semibold text-foreground">
              <Sparkles className="h-4 w-4 text-primary" />
              Lesson chats
            </span>
            {onClose && (
              <button
                type="button"
                onClick={onClose}
                className="rounded-lg p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground"
                aria-label="Close chat"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
          <button
            type="button"
            onClick={startNewChat}
            disabled={!selectedLessonId}
            className="flex w-full items-center justify-center gap-2 rounded-xl border border-border/70 bg-card px-3 py-2.5 text-sm font-medium text-foreground shadow-sm transition hover:border-primary/40 hover:bg-primary/5 disabled:opacity-50"
          >
            <Plus className="h-4 w-4" />
            New chat in lesson
          </button>
        </div>

        <div className="border-b border-border/50 px-3 py-2">
          <div className="relative">
            <Search className="pointer-events-none absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <input
              type="search"
              placeholder="Search lessons"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-lg border border-border/60 bg-card py-2 pl-9 pr-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary/50 focus:outline-none focus:ring-1 focus:ring-primary/25"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-2">
          {lessonEntries.length === 0 ? (
            <p className="px-2 py-4 text-center text-xs text-muted-foreground">
              {search ? 'No lessons match your search' : 'Create a lesson to start chatting'}
            </p>
          ) : (
            <ul className="space-y-0.5">
              {lessonEntries.map((lesson) => (
                <li key={lesson.id}>
                  <button
                    type="button"
                    onClick={() => selectLesson(lesson.id)}
                    className={`w-full rounded-lg px-2.5 py-2.5 text-left transition ${
                      selectedLessonId === lesson.id
                        ? 'bg-card shadow-sm ring-1 ring-primary/25'
                        : 'hover:bg-card/80'
                    }`}
                  >
                    <div className="flex items-start gap-2">
                      <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                        <BookOpen className="h-4 w-4 text-primary" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-start justify-between gap-1">
                          <p className="truncate text-sm font-medium text-foreground">
                            {lesson.title}
                          </p>
                          {lesson.latestSession && (
                            <span className="shrink-0 text-[10px] text-muted-foreground">
                              {formatRelative(lesson.latestSession.updatedAt)}
                            </span>
                          )}
                        </div>
                        <p className="mt-0.5 truncate text-xs text-muted-foreground">
                          {lesson.latestSession?.preview
                            || lesson.summary
                            || 'No messages yet'}
                        </p>
                      </div>
                    </div>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </aside>

      <main className="flex min-w-0 flex-1 flex-col bg-background">
        <header className="flex shrink-0 items-center justify-between gap-3 border-b border-border/50 px-4 py-3">
          <div className="min-w-0">
            <h2 className="truncate font-display text-base font-semibold text-foreground">
              {activeLesson?.title ?? 'Select a lesson'}
            </h2>
            <p className="text-xs text-muted-foreground">
              {selectedLessonId
                ? 'Chat is grounded in this lesson\'s content'
                : 'Choose a lesson from the sidebar to start'}
            </p>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto">
          <div className="mx-auto flex min-h-full max-w-3xl flex-col px-4 py-6">
            {!selectedLessonId ? (
              <div className="flex flex-1 flex-col items-center justify-center py-12 text-center">
                <BookOpen className="mb-4 h-12 w-12 text-primary/50" />
                <h3 className="font-display text-lg font-semibold">Pick a lesson</h3>
                <p className="mt-2 max-w-sm text-sm text-muted-foreground">
                  AI tutoring is available within the context of a specific lesson.
                </p>
              </div>
            ) : loading ? (
              <div className="flex flex-1 items-center justify-center py-20">
                <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
              </div>
            ) : messages.length === 0 ? (
              <div className="flex flex-1 flex-col items-center justify-center py-12 text-center">
                <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/15">
                  <MessageCircle className="h-7 w-7 text-primary" />
                </div>
                <h3 className="font-display text-xl font-semibold text-foreground">
                  Ask about {activeLesson?.title}
                </h3>
                <p className="mt-2 max-w-md text-sm text-muted-foreground">
                  Your conversation stays linked to this lesson. Pick a prompt or ask your own question.
                </p>
                <div className="mt-8 grid w-full max-w-lg gap-2 sm:grid-cols-2">
                  {SUGGESTIONS.map((prompt) => (
                    <button
                      key={prompt}
                      type="button"
                      onClick={() => handleSend(prompt)}
                      disabled={sending}
                      className="rounded-xl border border-border/60 bg-card px-4 py-3 text-left text-sm text-foreground transition hover:border-primary/35 hover:bg-primary/5"
                    >
                      {prompt}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <ul className="space-y-6 pb-4">
                {messages.map((m) => (
                  <li
                    key={m.id}
                    className={`flex gap-3 ${m.role === 'USER' ? 'justify-end' : 'justify-start'}`}
                  >
                    {m.role !== 'USER' && (
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/15 text-primary">
                        <Sparkles className="h-4 w-4" />
                      </div>
                    )}
                    {m.role === 'USER' ? (
                      <div className="flex max-w-[85%] items-center gap-2">
                        {m.failed && (
                          <button
                            type="button"
                            onClick={() => handleSend(m.content, { retryMessageId: m.id })}
                            disabled={sending}
                            title="Retry message"
                            aria-label="Retry message"
                            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-destructive/30 bg-destructive/10 text-destructive transition hover:bg-destructive/15 disabled:opacity-50"
                          >
                            <RotateCw className="h-4 w-4" />
                          </button>
                        )}
                        <div className="rounded-2xl bg-primary px-4 py-3 text-sm leading-relaxed text-primary-foreground">
                          <p className="whitespace-pre-wrap">{m.content}</p>
                        </div>
                      </div>
                    ) : (
                      <div className="max-w-[85%] rounded-2xl bg-muted/60 px-4 py-3 text-sm leading-relaxed text-foreground">
                        <MarkdownContent content={m.content} variant="chat" />
                      </div>
                    )}
                  </li>
                ))}
                {sending && (
                  <li className="flex gap-3">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/15">
                      <Sparkles className="h-4 w-4 animate-pulse text-primary" />
                    </div>
                    <div className="flex items-center gap-3 rounded-2xl bg-muted/60 px-4 py-3 text-sm text-muted-foreground">
                      <span className="inline-flex gap-1">
                        <span className="animate-bounce">·</span>
                        <span className="animate-bounce [animation-delay:120ms]">·</span>
                        <span className="animate-bounce [animation-delay:240ms]">·</span>
                      </span>
                      <button
                        type="button"
                        onClick={handleStop}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-border/60 bg-card px-2.5 py-1 text-xs font-medium text-foreground transition hover:border-destructive/40 hover:text-destructive"
                      >
                        <Square className="h-3 w-3 fill-current" />
                        Stop
                      </button>
                    </div>
                  </li>
                )}
                <li ref={bottomRef} aria-hidden />
              </ul>
            )}
          </div>
        </div>

        <div className="shrink-0 border-t border-border/50 bg-background px-4 py-4">
          <div className="mx-auto flex max-w-3xl items-end gap-2 rounded-2xl border border-border/70 bg-card p-2 shadow-sm focus-within:border-primary/40 focus-within:ring-2 focus-within:ring-primary/15">
            <textarea
              ref={inputRef}
              rows={1}
              placeholder={
                selectedLessonId
                  ? `Ask about ${activeLesson?.title ?? 'this lesson'}…`
                  : 'Select a lesson first…'
              }
              value={input}
              disabled={!selectedLessonId}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
              className="max-h-32 min-h-[44px] flex-1 resize-none border-0 bg-transparent px-2 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-0 disabled:opacity-50"
            />
            <button
              type="button"
              onClick={sending ? handleStop : () => handleSend()}
              disabled={!sending && (!input.trim() || !selectedLessonId)}
              className={`mb-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl transition hover:brightness-105 disabled:opacity-40 ${
                sending
                  ? 'bg-destructive text-destructive-foreground'
                  : 'bg-primary text-primary-foreground'
              }`}
              aria-label={sending ? 'Stop response' : 'Send message'}
            >
              {sending ? (
                <Square className="h-4 w-4 fill-current" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ChatExperience;
