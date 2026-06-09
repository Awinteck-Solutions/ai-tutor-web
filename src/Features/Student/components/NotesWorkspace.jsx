import { useCallback, useEffect, useMemo, useState } from 'react';
import { SegmentedControl, TextInput } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import {
  BookOpen,
  ChevronRight,
  Globe,
  Plus,
  Save,
  Search,
  Trash2,
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

const NotesWorkspace = ({ defaultLessonId, embedded = false }) => {
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
  };

  const startNewNote = () => {
    setSelectedId(null);
    setDraft(emptyDraft(defaultLessonId));
    setShowLessonPicker(false);
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

  return (
    <div className={`flex min-h-[420px] flex-col gap-4 ${embedded ? '' : ''}`}>
      <SegmentedControl
        value={filter}
        onChange={setFilter}
        data={filterData}
        size="xs"
        fullWidth
      />

      <div className="flex min-h-0 flex-1 gap-4">
        <div className="flex w-36 shrink-0 flex-col gap-2 sm:w-40">
          <GradientButton type="button" size="xs" onClick={startNewNote} className="w-full">
            <Plus className="mr-1 h-3 w-3" />
            New note
          </GradientButton>
          <div className="flex-1 space-y-1 overflow-y-auto rounded-xl border border-border/50 bg-muted/20 p-1">
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
                  className={`w-full rounded-lg px-2 py-2 text-left text-xs transition ${
                    selectedId === n.id
                      ? 'bg-primary/15 text-primary'
                      : 'text-foreground hover:bg-muted'
                  }`}
                >
                  <p className="truncate font-medium">{n.title || 'Untitled'}</p>
                  <p className="mt-0.5 truncate text-[10px] text-muted-foreground">
                    {n.isGeneral ? 'General' : n.lessonTitle ?? 'Lesson'}
                  </p>
                </button>
              ))
            )}
          </div>
        </div>

        <div className="flex min-w-0 flex-1 flex-col gap-3">
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
                className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium transition ${
                  draft.attachment === 'lesson'
                    ? 'border-primary bg-primary/10 text-primary'
                    : 'border-border text-muted-foreground hover:border-primary/30'
                }`}
              >
                <BookOpen className="h-3.5 w-3.5" />
                {draft.lessonId
                  ? lessons.find((l) => l.id === draft.lessonId)?.title
                    ?? 'Lesson selected'
                  : 'Choose lesson…'}
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

          <div className="flex items-center justify-between gap-2 border-t border-border/50 pt-3">
            {draft.id && (
              <span className="text-[10px] text-muted-foreground">
                Updated
                {' '}
                {formatDate(notes.find((n) => n.id === draft.id)?.updatedAt)}
              </span>
            )}
            <div className="ml-auto flex gap-2">
              {draft.id && (
                <button
                  type="button"
                  onClick={handleDelete}
                  className="inline-flex items-center gap-1 rounded-lg border border-destructive/30 px-3 py-1.5 text-xs text-destructive hover:bg-destructive/10"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  Delete
                </button>
              )}
              <GradientButton type="button" size="xs" onClick={handleSave} disabled={saving || loading}>
                <Save className="mr-1 h-3 w-3" />
                Save
              </GradientButton>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotesWorkspace;
