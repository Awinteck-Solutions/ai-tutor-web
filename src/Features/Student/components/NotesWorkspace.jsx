import { useCallback, useEffect, useMemo, useState } from 'react';
import { SegmentedControl, TextInput } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import {
  BookOpen,
  ChevronRight,
  Globe,
  List,
  NotebookPen,
  Plus,
  Save,
  Search,
  Trash2,
  X,
} from 'lucide-react';
import { useAuth } from '../../../shared/context/AuthContext';
import { GradientButton } from '../../../shared/components/GradientButton';
import { formatDate, getErrorMessage } from '../../../shared/utils/formatters';
import {
  deleteNote,
  getLessons,
  getNotes,
  saveNote,
} from '../services/student.services';
import NotesRichTextEditor from './NotesRichTextEditor';

const emptyDraft = (defaultLessonId) => ({
  id: null,
  title: '',
  content: '',
  attachment: defaultLessonId ? 'lesson' : 'general',
  lessonId: defaultLessonId ?? null,
});

const NotesWorkspace = ({ defaultLessonId, embedded = false, onClose }) => {
  const { organizationId } = useAuth();
  const [notes, setNotes] = useState([]);
  const [lessons, setLessons] = useState([]);
  const [filter, setFilter] = useState(defaultLessonId ? 'lesson' : 'all');
  const [selectedId, setSelectedId] = useState(null);
  const [draft, setDraft] = useState(() => emptyDraft(defaultLessonId));
  const [lessonSearch, setLessonSearch] = useState('');
  const [showLessonPicker, setShowLessonPicker] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [mobileListOpen, setMobileListOpen] = useState(!defaultLessonId && !selectedId);

  const loadNotes = useCallback(async () => {
    if (!organizationId) return;
    const params = {};
    if (filter === 'general') params.scope = 'general';
    else if (filter === 'lesson' && defaultLessonId) params.lessonId = defaultLessonId;
    else if (filter === 'attached') params.scope = 'lesson';

    const list = await getNotes(organizationId, params);
    setNotes(Array.isArray(list) ? list : []);
  }, [organizationId, filter, defaultLessonId]);

  const loadLessons = useCallback(async () => {
    if (!organizationId) return;
    const list = await getLessons(organizationId);
    setLessons(Array.isArray(list) ? list : []);
  }, [organizationId]);

  useEffect(() => {
    if (!organizationId) {
      setLoading(false);
      return;
    }
    setLoading(true);
    Promise.all([loadNotes(), loadLessons()])
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [organizationId, loadNotes, loadLessons]);

  const filteredLessons = useMemo(() => {
    const q = lessonSearch.trim().toLowerCase();
    if (!q) return lessons;
    return lessons.filter((l) =>
      [l.title, l.summary].some((v) => v?.toLowerCase().includes(q)),
    );
  }, [lessons, lessonSearch]);

  const activeNote = useMemo(
    () => notes.find((n) => n.id === selectedId),
    [notes, selectedId],
  );

  const selectNote = (note) => {
    setSelectedId(note.id);
    setDraft({
      id: note.id,
      title: note.title ?? '',
      content: note.content ?? '',
      attachment: note.lessonId ? 'lesson' : 'general',
      lessonId: note.lessonId ?? null,
    });
    setShowLessonPicker(false);
    setMobileListOpen(false);
  };

  const startNewNote = () => {
    setSelectedId(null);
    setDraft(emptyDraft(defaultLessonId));
    setShowLessonPicker(false);
    setMobileListOpen(false);
  };

  const handleSave = async () => {
    if (!organizationId) return;
    if (draft.attachment === 'lesson' && !draft.lessonId) {
      notifications.show({
        title: 'Choose a lesson',
        message: 'Select a lesson to attach this note, or use General notes.',
        color: 'orange',
      });
      return;
    }
    setSaving(true);
    try {
      const payload = {
        title: draft.title.trim() || 'Untitled note',
        content: draft.content,
      };
      if (draft.id) payload.id = draft.id;
      if (draft.attachment === 'lesson' && draft.lessonId) {
        payload.lessonId = draft.lessonId;
      } else if (draft.id) {
        payload.lessonId = null;
      }

      const saved = await saveNote(organizationId, payload);
      setSelectedId(saved.id);
      setDraft((d) => ({ ...d, id: saved.id }));
      await loadNotes();
      notifications.show({ title: 'Saved', message: 'Note saved', color: 'green' });
    } catch (err) {
      notifications.show({ title: 'Notes', message: getErrorMessage(err), color: 'red' });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!draft.id) return;
    try {
      await deleteNote(draft.id);
      startNewNote();
      await loadNotes();
      notifications.show({ title: 'Deleted', message: 'Note removed', color: 'green' });
    } catch (err) {
      notifications.show({ title: 'Notes', message: getErrorMessage(err), color: 'red' });
    }
  };

  const filterData = defaultLessonId
    ? [
        { value: 'all', label: 'All' },
        { value: 'lesson', label: 'This lesson' },
        { value: 'general', label: 'General' },
      ]
    : [
        { value: 'all', label: 'All' },
        { value: 'general', label: 'General' },
        { value: 'attached', label: 'By lesson' },
      ];

  const noteList = (
    <>
      <GradientButton type="button" size="xs" onClick={startNewNote} className="w-full">
        <Plus className="mr-1 h-3 w-3" />
        New note
      </GradientButton>
      <div className="min-h-0 flex-1 space-y-1 overflow-y-auto rounded-xl border border-border/50 bg-card p-1">
        {loading ? (
          <p className="p-2 text-xs text-muted-foreground">Loading…</p>
        ) : notes.length === 0 ? (
          <p className="p-2 text-xs text-muted-foreground">No notes yet</p>
        ) : (
          notes.map((n) => (
            <button
              key={n.id}
              type="button"
              onClick={() => selectNote(n)}
              className={`w-full rounded-lg px-2.5 py-2.5 text-left text-xs transition ${
                selectedId === n.id
                  ? 'bg-primary/15 text-primary'
                  : 'text-foreground hover:bg-muted'
              }`}
            >
              <p className="line-clamp-2 font-medium leading-snug">{n.title || 'Untitled'}</p>
              <p className="mt-0.5 truncate text-[10px] text-muted-foreground">
                {n.isGeneral ? 'General' : n.lessonTitle ?? 'Lesson'}
              </p>
            </button>
          ))
        )}
      </div>
    </>
  );

  return (
    <div className={`flex min-h-0 flex-col ${embedded ? 'h-full bg-card' : 'min-h-[420px]'} gap-3 sm:gap-4`}>
      {embedded && (
        <header className="flex shrink-0 items-center justify-between gap-3 border-b border-border/50 px-3 py-3 sm:px-4">
          <span className="flex items-center gap-2 font-display text-sm font-semibold text-foreground sm:text-base">
            <NotebookPen className="h-4 w-4 text-accent" />
            My notes
          </span>
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-border/60 text-muted-foreground transition hover:bg-muted hover:text-foreground"
              aria-label="Close notes"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </header>
      )}

      <div className={`shrink-0 ${embedded ? 'px-3 sm:px-4' : ''}`}>
        <SegmentedControl
          value={filter}
          onChange={setFilter}
          data={filterData}
          size="xs"
          fullWidth
        />
      </div>

      <div className={`relative flex min-h-0 flex-1 ${embedded ? 'px-0' : ''}`}>
        {mobileListOpen && (
          <button
            type="button"
            className="fixed inset-0 z-20 bg-black/45 md:hidden"
            aria-label="Close note list"
            onClick={() => setMobileListOpen(false)}
          />
        )}

        <aside
          className={`flex w-[min(100vw-3rem,260px)] shrink-0 flex-col gap-2 bg-card p-3 max-md:fixed max-md:inset-y-0 max-md:left-0 max-md:z-30 max-md:shadow-xl max-md:transition-transform md:relative md:translate-x-0 md:p-0 ${
            mobileListOpen ? 'max-md:translate-x-0' : 'max-md:-translate-x-full'
          }`}
        >
          {noteList}
        </aside>

        <main className="flex min-w-0 flex-1 flex-col gap-3 px-3 pb-3 sm:px-0 sm:pb-0">
          <div className="flex items-center justify-between gap-2 md:hidden">
            <button
              type="button"
              onClick={() => setMobileListOpen(true)}
              className="inline-flex items-center gap-1.5 rounded-lg border border-border/60 px-2.5 py-1.5 text-xs font-medium text-foreground transition hover:bg-muted"
            >
              <List className="h-4 w-4" />
              {activeNote?.title || draft.title || 'Browse notes'}
            </button>
            {!selectedId && !draft.id && (
              <button
                type="button"
                onClick={startNewNote}
                className="rounded-lg border border-primary/30 bg-primary/10 px-2.5 py-1.5 text-xs font-medium text-primary"
              >
                New note
              </button>
            )}
          </div>

          <TextInput
            placeholder="Note title"
            value={draft.title}
            onChange={(e) => setDraft((d) => ({ ...d, title: e.currentTarget.value }))}
            disabled={loading}
          />

          <div className="rounded-xl border border-border/50 bg-muted/20 p-3">
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Attach to
            </p>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => {
                  setDraft((d) => ({
                    ...d,
                    attachment: 'general',
                    lessonId: null,
                  }));
                  setShowLessonPicker(false);
                }}
                className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium transition ${
                  draft.attachment === 'general'
                    ? 'border-primary bg-primary/10 text-primary'
                    : 'border-border text-muted-foreground hover:border-primary/30'
                }`}
              >
                <Globe className="h-3.5 w-3.5" />
                General notes
              </button>
              <button
                type="button"
                onClick={() => {
                  setDraft((d) => ({ ...d, attachment: 'lesson' }));
                  setShowLessonPicker(true);
                }}
                className={`inline-flex max-w-full items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium transition ${
                  draft.attachment === 'lesson'
                    ? 'border-primary bg-primary/10 text-primary'
                    : 'border-border text-muted-foreground hover:border-primary/30'
                }`}
              >
                <BookOpen className="h-3.5 w-3.5 shrink-0" />
                <span className="truncate">
                  {draft.lessonId
                    ? lessons.find((l) => l.id === draft.lessonId)?.title
                      ?? 'Lesson selected'
                    : 'Choose lesson…'}
                </span>
              </button>
            </div>

            {showLessonPicker && draft.attachment === 'lesson' && (
              <div className="mt-3 rounded-lg border border-border/60 bg-card p-2">
                <TextInput
                  placeholder="Search lessons…"
                  value={lessonSearch}
                  onChange={(e) => setLessonSearch(e.currentTarget.value)}
                  leftSection={<Search className="h-3.5 w-3.5 text-muted-foreground" />}
                  size="xs"
                  className="mb-2"
                />
                <ul className="max-h-40 space-y-0.5 overflow-y-auto">
                  {filteredLessons.length === 0 ? (
                    <li className="px-2 py-2 text-xs text-muted-foreground">No lessons found</li>
                  ) : (
                    filteredLessons.map((l) => (
                      <li key={l.id}>
                        <button
                          type="button"
                          onClick={() => {
                            setDraft((d) => ({
                              ...d,
                              attachment: 'lesson',
                              lessonId: l.id,
                            }));
                            setShowLessonPicker(false);
                          }}
                          className={`flex w-full items-center justify-between rounded-md px-2 py-2 text-left text-xs transition hover:bg-muted ${
                            draft.lessonId === l.id ? 'bg-primary/10 text-primary' : 'text-foreground'
                          }`}
                        >
                          <span className="truncate pr-2">{l.title}</span>
                          <ChevronRight className="h-3 w-3 shrink-0 opacity-50" />
                        </button>
                      </li>
                    ))
                  )}
                </ul>
              </div>
            )}
          </div>

          {loading ? (
            <div className="min-h-[200px] animate-pulse rounded-xl bg-muted/40" />
          ) : (
            <NotesRichTextEditor
              value={draft.content}
              onChange={(html) => setDraft((d) => ({ ...d, content: html }))}
              placeholder="Write your note…"
            />
          )}

          <div className="flex flex-col gap-2 border-t border-border/50 pt-3 sm:flex-row sm:items-center sm:justify-between">
            {draft.id ? (
              <span className="text-[10px] text-muted-foreground">
                Updated
                {' '}
                {formatDate(notes.find((n) => n.id === draft.id)?.updatedAt)}
              </span>
            ) : (
              <span className="hidden text-[10px] text-muted-foreground sm:inline" />
            )}
            <div className="flex gap-2 sm:ml-auto">
              {draft.id && (
                <button
                  type="button"
                  onClick={handleDelete}
                  className="inline-flex flex-1 items-center justify-center gap-1 rounded-lg border border-destructive/30 px-3 py-2 text-xs text-destructive hover:bg-destructive/10 sm:flex-none sm:py-1.5"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  Delete
                </button>
              )}
              <GradientButton
                type="button"
                size="xs"
                onClick={handleSave}
                disabled={saving || loading}
                className="flex-1 sm:flex-none"
              >
                <Save className="mr-1 h-3 w-3" />
                Save
              </GradientButton>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default NotesWorkspace;
