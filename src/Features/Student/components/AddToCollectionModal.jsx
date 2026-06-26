import { useCallback, useEffect, useState } from 'react';
import { Select, TextInput } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { FolderPlus } from 'lucide-react';
import { AdesiaModal } from '../../../shared/components/AdesiaModal';
import { GhostButton } from '../../../shared/components/GradientButton';
import { useAuth } from '../../../shared/context/AuthContext';
import { getErrorMessage } from '../../../shared/utils/formatters';
import {
  assignLessonToGroup,
  createLessonGroup,
  listLessonGroups,
  listPersonalLessons,
} from '../services/student.services';

const AddToCollectionModal = ({
  opened,
  onClose,
  organizationId,
  lessonId: initialLessonId = null,
  lessonTitle = '',
  currentGroupId = null,
  onChanged,
}) => {
  const { fetchProfile } = useAuth();
  const [groups, setGroups] = useState([]);
  const [lessons, setLessons] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [selectedLessonId, setSelectedLessonId] = useState(initialLessonId ?? '');
  const [selectedGroupId, setSelectedGroupId] = useState(currentGroupId ?? '');
  const [createOpen, setCreateOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');

  const syncWorkspace = useCallback(async (data) => {
    if (data?.organizationId && !organizationId) {
      await fetchProfile();
    }
  }, [organizationId, fetchProfile]);

  const reloadGroups = useCallback(async () => {
    setLoading(true);
    try {
      const data = await listLessonGroups(organizationId);
      setGroups(data?.groups ?? []);
      await syncWorkspace(data);
    } catch {
      setGroups([]);
    } finally {
      setLoading(false);
    }
  }, [organizationId, syncWorkspace]);

  useEffect(() => {
    if (!opened) return;
    setSelectedLessonId(initialLessonId ?? '');
    setSelectedGroupId(currentGroupId ?? '');
    reloadGroups();
    if (!initialLessonId && organizationId) {
      listPersonalLessons(organizationId, { limit: 50 })
        .then((data) => setLessons(data?.items ?? []))
        .catch(() => setLessons([]));
    }
  }, [opened, initialLessonId, currentGroupId, organizationId, reloadGroups]);

  const activeLessonId = initialLessonId || selectedLessonId;
  const activeLessonTitle = lessonTitle
    || lessons.find((l) => l.id === activeLessonId)?.title
    || '';

  const handleAssign = async (groupId) => {
    if (!activeLessonId) return;
    setSaving(true);
    try {
      await assignLessonToGroup(organizationId, activeLessonId, {
        groupId: groupId || null,
      });
      notifications.show({
        title: groupId ? 'Added to collection' : 'Removed from collection',
        color: 'green',
      });
      setSelectedGroupId(groupId || '');
      onChanged?.();
      onClose();
    } catch (err) {
      notifications.show({ title: 'Error', message: getErrorMessage(err), color: 'red' });
    } finally {
      setSaving(false);
    }
  };

  const handleCreateGroup = async () => {
    if (newTitle.trim().length < 2 || !activeLessonId) return;
    setSaving(true);
    try {
      const created = await createLessonGroup(organizationId, { title: newTitle.trim() });
      await syncWorkspace(created);
      await assignLessonToGroup(organizationId, activeLessonId, { groupId: created.id });
      notifications.show({
        title: 'Added to collection',
        message: created.title,
        color: 'green',
      });
      setCreateOpen(false);
      setNewTitle('');
      await reloadGroups();
      onChanged?.();
      onClose();
    } catch (err) {
      notifications.show({ title: 'Error', message: getErrorMessage(err), color: 'red' });
    } finally {
      setSaving(false);
    }
  };

  const groupOptions = [
    { value: '', label: 'No collection (ungrouped)' },
    ...groups.map((g) => ({ value: g.id, label: g.title })),
  ];

  return (
    <>
      <AdesiaModal
        opened={opened && !createOpen}
        onClose={onClose}
        title="Add to collection"
        size="sm"
        submitLabel="Save"
        onSubmit={() => handleAssign(selectedGroupId)}
        submitting={saving}
        submitDisabled={!activeLessonId}
      >
        <div className="space-y-4">
          {!initialLessonId && (
            <Select
              label="Lesson"
              description="Choose which lesson to organize."
              placeholder={lessons.length ? 'Select a lesson' : 'No lessons yet'}
              data={lessons.map((l) => ({ value: l.id, label: l.title }))}
              value={selectedLessonId || null}
              onChange={(value) => {
                setSelectedLessonId(value ?? '');
                const lesson = lessons.find((l) => l.id === value);
                setSelectedGroupId(lesson?.groupId ?? '');
              }}
              searchable
              nothingFoundMessage="No lessons found"
              disabled={loading || saving}
            />
          )}

          {initialLessonId && activeLessonTitle && (
            <p className="text-sm text-muted-foreground">
              Organize
              {' '}
              <span className="font-medium text-foreground">&quot;{activeLessonTitle}&quot;</span>
              {' '}
              into a collection.
            </p>
          )}

          <Select
            label="Collection"
            data={groupOptions}
            value={selectedGroupId}
            onChange={(value) => setSelectedGroupId(value ?? '')}
            disabled={loading || saving || !activeLessonId}
            searchable
          />

          <GhostButton
            type="button"
            className="!px-3 !py-2 text-sm"
            onClick={() => setCreateOpen(true)}
            disabled={!activeLessonId}
          >
            <FolderPlus className="mr-2 inline h-4 w-4" />
            New collection
          </GhostButton>
        </div>
      </AdesiaModal>

      <AdesiaModal
        opened={createOpen}
        onClose={() => { setCreateOpen(false); setNewTitle(''); }}
        title="New collection"
        size="sm"
        submitLabel="Create & add lesson"
        onSubmit={handleCreateGroup}
        submitting={saving}
        submitDisabled={newTitle.trim().length < 2 || !activeLessonId}
      >
        <TextInput
          label="Collection title"
          placeholder="e.g. Python fundamentals"
          value={newTitle}
          onChange={(e) => setNewTitle(e.currentTarget.value)}
          autoFocus
        />
      </AdesiaModal>
    </>
  );
};

export default AddToCollectionModal;
