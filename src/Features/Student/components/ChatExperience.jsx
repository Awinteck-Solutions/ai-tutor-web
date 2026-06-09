import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Check,
  MessageCircle,
  Pencil,
  Plus,
  Search,
  Send,
  Sparkles,
  Trash2,
  X,
} from 'lucide-react';
import { notifications } from '@mantine/notifications';
import { useAuth } from '../../../shared/context/AuthContext';
import { getErrorMessage } from '../../../shared/utils/formatters';
import {
  deleteChatSession,
  getChatSession,
  listChatSessions,
  renameChatSession,
  sendChatMessage,
} from '../services/student.services';

const SUGGESTIONS = [
  'Explain this topic in simple terms',
  'What are the key ideas I should remember?',
  'Give me practice questions',
  'Summarize what I need to know for a test',
];

const startOfDay = (d) => {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
};

const sessionGroupLabel = (updatedAt) => {
  const date = new Date(updatedAt);
  const today = startOfDay(new Date());
  const then = startOfDay(date);
  const diffDays = Math.round((today - then) / 86400000);
  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return 'Previous 7 days';
  return 'Older';
};

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

const groupSessions = (sessions) => {
  const order = ['Today', 'Yesterday', 'Previous 7 days', 'Older'];
  const buckets = Object.fromEntries(order.map((k) => [k, []]));
  sessions.forEach((s) => {
    const label = sessionGroupLabel(s.updatedAt ?? s.lastMessageAt ?? s.createdAt);
    buckets[label].push(s);
  });
  return order
    .filter((label) => buckets[label].length > 0)
    .map((label) => ({ label, items: buckets[label] }));
};

const ChatExperience = ({
  context = {},
  onClose,
  fullPage = false,
}) => {
  const { organizationId } = useAuth();
  const [sessions, setSessions] = useState([]);
  const [sessionId, setSessionId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [renamingId, setRenamingId] = useState(null);
  const [renameValue, setRenameValue] = useState('');
  const bottomRef = useRef(null);
  const inputRef = useRef(null);

  const activeSession = useMemo(
    () => sessions.find((s) => s.id === sessionId),
    [sessions, sessionId],
  );

  const refreshSessions = useCallback(async () => {
    if (!organizationId) return [];
    const list = await listChatSessions(organizationId);
    const arr = Array.isArray(list) ? list : [];
    setSessions(arr);
    return arr;
  }, [organizationId]);

  const loadSession = useCallback(async (id) => {
    if (!id) return;
    setLoading(true);
    try {
      const data = await getChatSession(id);
      setMessages(data?.messages ?? []);
      setSessionId(id);
    } catch (err) {
      notifications.show({ title: 'Chat', message: getErrorMessage(err), color: 'red' });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!organizationId) return;
    refreshSessions().then((arr) => {
      const match = arr.find((s) => {
        if (context.lessonId && s.lessonId === context.lessonId) return true;
        if (context.quizId && s.quizId === context.quizId) return true;
        if (context.flashcardId && s.flashcardId === context.flashcardId) return true;
        return false;
      });
      if (match?.id) loadSession(match.id);
    });
  }, [organizationId, context.lessonId, context.quizId, context.flashcardId, refreshSessions, loadSession]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, sending]);

  const filteredSessions = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return sessions;
    return sessions.filter(
      (s) =>
        s.title?.toLowerCase().includes(q)
        || s.preview?.toLowerCase().includes(q),
    );
  }, [sessions, search]);

  const grouped = useMemo(() => groupSessions(filteredSessions), [filteredSessions]);

  const startNewChat = () => {
    setSessionId(null);
    setMessages([]);
    setInput('');
    setRenamingId(null);
    inputRef.current?.focus();
  };

  const handleSend = async (textOverride) => {
    const text = (textOverride ?? input).trim();
    if (!text || !organizationId || sending) return;

    setSending(true);
    if (!textOverride) setInput('');
    setMessages((prev) => [
      ...prev,
      { id: `u-${Date.now()}`, role: 'USER', content: text },
    ]);

    try {
      const chatOpts = { ...context };
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

      await refreshSessions();
    } catch (err) {
      notifications.show({ title: 'Chat', message: getErrorMessage(err), color: 'red' });
      setMessages((prev) => prev.slice(0, -1));
    } finally {
      setSending(false);
    }
  };

  const startRename = (session, e) => {
    e?.stopPropagation();
    setRenamingId(session.id);
    setRenameValue(session.title ?? '');
  };

  const commitRename = async (id) => {
    const title = renameValue.trim();
    if (!title) {
      setRenamingId(null);
      return;
    }
    try {
      await renameChatSession(id, title);
      setSessions((prev) =>
        prev.map((s) => (s.id === id ? { ...s, title } : s)),
      );
      setRenamingId(null);
    } catch (err) {
      notifications.show({ title: 'Rename failed', message: getErrorMessage(err), color: 'red' });
    }
  };

  const handleDelete = async (id, e) => {
    e?.stopPropagation();
    try {
      await deleteChatSession(id);
      const list = await refreshSessions();
      if (sessionId === id) {
        if (list[0]?.id) loadSession(list[0].id);
        else startNewChat();
      }
      notifications.show({ title: 'Deleted', message: 'Chat removed', color: 'green' });
    } catch (err) {
      notifications.show({ title: 'Error', message: getErrorMessage(err), color: 'red' });
    }
  };

  const shellClass = fullPage
    ? 'flex h-[calc(100dvh-10rem)] min-h-[520px] overflow-hidden rounded-2xl border border-border/60 bg-card shadow-card'
    : 'flex h-full min-h-[100dvh] overflow-hidden bg-card';

  return (
    <div className={shellClass}>
      {/* Sidebar */}
      <aside className="flex w-[280px] shrink-0 flex-col border-r border-border/60 bg-muted/25">
        <div className="border-b border-border/50 p-3">
          <div className="mb-3 flex items-center justify-between gap-2">
            <span className="flex items-center gap-2 font-display text-sm font-semibold text-foreground">
              <Sparkles className="h-4 w-4 text-primary" />
              AI Tutor
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
            className="flex w-full items-center justify-center gap-2 rounded-xl border border-border/70 bg-card px-3 py-2.5 text-sm font-medium text-foreground shadow-sm transition hover:border-primary/40 hover:bg-primary/5"
          >
            <Plus className="h-4 w-4" />
            New chat
          </button>
        </div>

        <div className="border-b border-border/50 px-3 py-2">
          <div className="relative">
            <Search className="pointer-events-none absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <input
              type="search"
              placeholder="Search chats"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-lg border border-border/60 bg-card py-2 pl-9 pr-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary/50 focus:outline-none focus:ring-1 focus:ring-primary/25"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-2">
          {grouped.length === 0 ? (
            <p className="px-2 py-4 text-center text-xs text-muted-foreground">
              {search ? 'No chats match your search' : 'No conversations yet'}
            </p>
          ) : (
            grouped.map((group) => (
              <div key={group.label} className="mb-3">
                <p className="mb-1 px-2 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                  {group.label}
                </p>
                <ul className="space-y-0.5">
                  {group.items.map((s) => (
                    <li key={s.id}>
                      {renamingId === s.id ? (
                        <div className="flex items-center gap-1 rounded-lg bg-card p-1.5">
                          <input
                            value={renameValue}
                            onChange={(e) => setRenameValue(e.target.value)}
                            className="min-w-0 flex-1 rounded border border-border bg-background px-2 py-1 text-xs"
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') commitRename(s.id);
                              if (e.key === 'Escape') setRenamingId(null);
                            }}
                            autoFocus
                          />
                          <button
                            type="button"
                            onClick={() => commitRename(s.id)}
                            className="rounded p-1 text-primary hover:bg-primary/10"
                          >
                            <Check className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => loadSession(s.id)}
                          className={`group relative w-full rounded-lg px-2.5 py-2.5 text-left transition ${
                            sessionId === s.id
                              ? 'bg-card shadow-sm ring-1 ring-primary/25'
                              : 'hover:bg-card/80'
                          }`}
                        >
                          <div className="flex items-start justify-between gap-1">
                            <p className="truncate pr-6 text-sm font-medium text-foreground">
                              {s.title || 'New chat'}
                            </p>
                            <span className="shrink-0 text-[10px] text-muted-foreground">
                              {formatRelative(s.updatedAt ?? s.lastMessageAt)}
                            </span>
                          </div>
                          {s.preview && (
                            <p className="mt-0.5 truncate text-xs text-muted-foreground">
                              {s.preview}
                            </p>
                          )}
                          <div className="absolute right-1 top-1.5 hidden gap-0.5 group-hover:flex">
                            <button
                              type="button"
                              onClick={(e) => startRename(s, e)}
                              className="rounded p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
                              aria-label="Rename"
                            >
                              <Pencil className="h-3 w-3" />
                            </button>
                            <button
                              type="button"
                              onClick={(e) => handleDelete(s.id, e)}
                              className="rounded p-1 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                              aria-label="Delete"
                            >
                              <Trash2 className="h-3 w-3" />
                            </button>
                          </div>
                        </button>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            ))
          )}
        </div>
      </aside>

      {/* Main thread */}
      <main className="flex min-w-0 flex-1 flex-col bg-background">
        <header className="flex shrink-0 items-center justify-between gap-3 border-b border-border/50 px-4 py-3">
          <div className="min-w-0">
            <h2 className="truncate font-display text-base font-semibold text-foreground">
              {activeSession?.title ?? 'New conversation'}
            </h2>
            <p className="text-xs text-muted-foreground">
              {context.lessonId
                ? 'Lesson context enabled'
                : 'Ask about your courses and study materials'}
            </p>
          </div>
          {activeSession && renamingId !== activeSession.id && (
            <button
              type="button"
              onClick={() => startRename(activeSession)}
              className="shrink-0 rounded-lg border border-border/60 px-2.5 py-1.5 text-xs text-muted-foreground hover:text-foreground"
            >
              <Pencil className="mr-1 inline h-3 w-3" />
              Rename
            </button>
          )}
        </header>

        <div className="flex-1 overflow-y-auto">
          <div className="mx-auto flex min-h-full max-w-3xl flex-col px-4 py-6">
            {loading ? (
              <div className="flex flex-1 items-center justify-center py-20">
                <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
              </div>
            ) : messages.length === 0 ? (
              <div className="flex flex-1 flex-col items-center justify-center py-12 text-center">
                <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/15">
                  <MessageCircle className="h-7 w-7 text-primary" />
                </div>
                <h3 className="font-display text-xl font-semibold text-foreground">
                  How can I help you study?
                </h3>
                <p className="mt-2 max-w-md text-sm text-muted-foreground">
                  Your conversation history is saved. Pick a prompt or type your own question below.
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
                    <div
                      className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                        m.role === 'USER'
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-muted/60 text-foreground'
                      }`}
                    >
                      <p className="whitespace-pre-wrap">{m.content}</p>
                    </div>
                  </li>
                ))}
                {sending && (
                  <li className="flex gap-3">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/15">
                      <Sparkles className="h-4 w-4 animate-pulse text-primary" />
                    </div>
                    <div className="rounded-2xl bg-muted/60 px-4 py-3 text-sm text-muted-foreground">
                      <span className="inline-flex gap-1">
                        <span className="animate-bounce">·</span>
                        <span className="animate-bounce [animation-delay:120ms]">·</span>
                        <span className="animate-bounce [animation-delay:240ms]">·</span>
                      </span>
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
              placeholder="Message AI tutor…"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
              className="max-h-32 min-h-[44px] flex-1 resize-none border-0 bg-transparent px-2 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-0"
            />
            <button
              type="button"
              onClick={() => handleSend()}
              disabled={sending || !input.trim()}
              className="mb-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground transition hover:brightness-105 disabled:opacity-40"
              aria-label="Send message"
            >
              <Send className="h-4 w-4" />
            </button>
          </div>
          <p className="mx-auto mt-2 max-w-3xl text-center text-[10px] text-muted-foreground">
            Enter to send · Shift+Enter for new line
          </p>
        </div>
      </main>
    </div>
  );
};

export default ChatExperience;
