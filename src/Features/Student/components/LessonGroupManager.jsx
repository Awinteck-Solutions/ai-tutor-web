import { useCallback, useEffect, useState } from 'react';
import { ActionIcon, Menu, Select, TextInput } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { FolderPlus, Layers, MoreHorizontal, Pencil, Trash2 } from 'lucide-react';
import { GlassCard } from '../../../shared/components/GlassCard';
import { GhostButton } from '../../../shared/components/GradientButton';
import { AdesiaModal } from '../../../shared/components/AdesiaModal';
import { useAuth } from '../../../shared/context/AuthContext';
import { getErrorMessage } from '../../../shared/utils/formatters';
import {
  assignLessonToGroup,
  createLessonGroup,
  deleteLessonGroup,
  listLessonGroups,
  updateLessonGroup,
} from '../services/student.services';

const LessonGroupManager = ({
  organizationId,
  lessonId = null,
  currentGroupId = null,
  compact = false,
  onChanged,
  onGroupSelect,
  selectedGroupFilter = null,
}) => {
  const { fetchProfile } = useAuth();
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [createOpen, setCreateOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [editingGroup, setEditingGroup] = useState(null);
  const [newTitle, setNewTitle] = useState('');
  const [saving, setSaving] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState(currentGroupId ?? '');

  const syncWorkspace = useCallback(async (data) => {
    if (data?.organizationId && !organizationId) {
      await fetchProfile();
    }
  }, [organizationId, fetchProfile]);

  const reload = useCallback(async () => {
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
    reload();
  }, [reload]);

  useEffect(() => {
    setSelectedGroup(currentGroupId ?? '');
  }, [currentGroupId]);

  const handleCreateGroup = async () => {
    if (newTitle.trim().length < 2) return;
    setSaving(true);
    try {
      const created = await createLessonGroup(organizationId, { title: newTitle.trim() });
      await syncWorkspace(created);
      notifications.show({ title: 'Group created', message: created.title, color: 'green' });
      setCreateOpen(false);
      setNewTitle('');
      await reload();
      onChanged?.();
      const orgId = organizationId || created?.organizationId;
      if (lessonId && created?.id && orgId) {
        await assignLessonToGroup(orgId, lessonId, { groupId: created.id });
        setSelectedGroup(created.id);
      }
    } catch (err) {
      notifications.show({ title: 'Error', message: getErrorMessage(err), color: 'red' });
    } finally {
      setSaving(false);
    }
  };

  const handleUpdateGroup = async () => {
    if (!editingGroup?.id || newTitle.trim().length < 2) return;
    setSaving(true);
    try {
      await updateLessonGroup(organizationId, editingGroup.id, { title: newTitle.trim() });
      notifications.show({ title: 'Group updated', color: 'green' });
      setEditOpen(false);
      setEditingGroup(null);
      setNewTitle('');
      await reload();
      onChanged?.();
    } catch (err) {
      notifications.show({ title: 'Error', message: getErrorMessage(err), color: 'red' });
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteGroup = async () => {
    if (!editingGroup?.id) return;
    setSaving(true);
    try {
      await deleteLessonGroup(organizationId, editingGroup.id);
      notifications.show({ title: 'Group deleted', message: 'Lessons were moved to ungrouped.', color: 'green' });
      setDeleteOpen(false);
      setEditingGroup(null);
      if (selectedGroupFilter === editingGroup.id) {
        onGroupSelect?.('all');
      }
      await reload();
      onChanged?.();
    } catch (err) {
      notifications.show({ title: 'Error', message: getErrorMessage(err), color: 'red' });
    } finally {
      setSaving(false);
    }
  };

  const handleAssign = async (groupId) => {
    if (!lessonId) return;
    setSaving(true);
    try {
      await assignLessonToGroup(organizationId, lessonId, {
        groupId: groupId || null,
      });
      setSelectedGroup(groupId || '');
      notifications.show({
        title: groupId ? 'Added to group' : 'Removed from group',
        color: 'green',
      });
      onChanged?.();
    } catch (err) {
      notifications.show({ title: 'Error', message: getErrorMessage(err), color: 'red' });
    } finally {
      setSaving(false);
    }
  };

  const openEdit = (group) => {
    setEditingGroup(group);
    setNewTitle(group.title);
    setEditOpen(true);
  };

  const openDelete = (group) => {
    setEditingGroup(group);
    setDeleteOpen(true);
  };

  const selectData = [
    { value: '', label: 'No group' },
    ...groups.map((g) => ({ value: g.id, label: g.title })),
  ];

  if (compact && !lessonId) return null;

  const orgHint = !organizationId && (
    <p className="mb-3 text-xs text-muted-foreground">
      A free personal workspace will be created automatically when you add your first collection.
    </p>
  );

  return (
    <>
      <GlassCard className={`${compact ? 'p-4' : 'p-5'}`}>
        <div className="mb-3 flex items-center gap-2">
          <Layers className="h-4 w-4 text-primary" />
          <h3 className="text-sm font-semibold text-foreground">
            {lessonId ? 'Lesson collection' : 'Lesson collections'}
          </h3>
        </div>

        {orgHint}

        {lessonId ? (
          <div className="flex flex-wrap items-end gap-2">
            <Select
              label="Collection"
              description="Organize this lesson into a learning path."
              className="min-w-[220px] flex-1"
              data={selectData}
              value={selectedGroup}
              disabled={loading || saving}
              onChange={(value) => handleAssign(value ?? '')}
            />
            <GhostButton
              type="button"
              className="!px-3 !py-2 text-sm"
              onClick={() => setCreateOpen(true)}
            >
              <FolderPlus className="h-4 w-4" />
              New group
            </GhostButton>
          </div>
        ) : (
          <div className="space-y-2">
            {loading ? (
              <p className="text-sm text-muted-foreground">Loading collections…</p>
            ) : groups.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                Create a collection to organize self-learn lessons into a path.
              </p>
            ) : (
              <ul className="space-y-1">
                {groups.map((g) => (
                  <li
                    key={g.id}
                    className={`flex items-center justify-between gap-2 rounded-lg border px-3 py-2 text-sm transition ${
                      selectedGroupFilter === g.id
                        ? 'border-primary/40 bg-primary/5'
                        : 'border-border/40'
                    }`}
                  >
                    <button
                      type="button"
                      className="min-w-0 flex-1 text-left"
                      onClick={() => onGroupSelect?.(g.id)}
                    >
                      <span className="block truncate font-medium text-foreground">{g.title}</span>
                      <span className="text-xs text-muted-foreground">
                        {g.lessonCount ?? 0}
                        {' lesson'}
                        {(g.lessonCount ?? 0) !== 1 ? 's' : ''}
                      </span>
                    </button>
                    <Menu position="bottom-end" withinPortal>
                      <Menu.Target>
                        <ActionIcon variant="subtle" color="gray" aria-label="Group options">
                          <MoreHorizontal className="h-4 w-4" />
                        </ActionIcon>
                      </Menu.Target>
                      <Menu.Dropdown>
                        <Menu.Item
                          leftSection={<Pencil className="h-3.5 w-3.5" />}
                          onClick={() => openEdit(g)}
                        >
                          Rename
                        </Menu.Item>
                        <Menu.Item
                          color="red"
                          leftSection={<Trash2 className="h-3.5 w-3.5" />}
                          onClick={() => openDelete(g)}
                        >
                          Delete
                        </Menu.Item>
                      </Menu.Dropdown>
                    </Menu>
                  </li>
                ))}
              </ul>
            )}
            <GhostButton
              type="button"
              className="mt-2 !px-3 !py-2 text-sm"
              onClick={() => setCreateOpen(true)}
            >
              <FolderPlus className="h-4 w-4" />
              New collection
            </GhostButton>
          </div>
        )}
      </GlassCard>

      <AdesiaModal
        opened={createOpen}
        onClose={() => { setCreateOpen(false); setNewTitle(''); }}
        title="New lesson collection"
        size="sm"
        submitLabel="Create collection"
        onSubmit={handleCreateGroup}
        submitting={saving}
        submitDisabled={newTitle.trim().length < 2}
      >
        <TextInput
          label="Collection title"
          placeholder="e.g. Python fundamentals"
          value={newTitle}
          onChange={(e) => setNewTitle(e.currentTarget.value)}
          autoFocus
        />
      </AdesiaModal>

      <AdesiaModal
        opened={editOpen}
        onClose={() => { setEditOpen(false); setEditingGroup(null); setNewTitle(''); }}
        title="Rename collection"
        size="sm"
        submitLabel="Save"
        onSubmit={handleUpdateGroup}
        submitting={saving}
        submitDisabled={newTitle.trim().length < 2}
      >
        <TextInput
          label="Collection title"
          value={newTitle}
          onChange={(e) => setNewTitle(e.currentTarget.value)}
          autoFocus
        />
      </AdesiaModal>

      <AdesiaModal
        opened={deleteOpen}
        onClose={() => { setDeleteOpen(false); setEditingGroup(null); }}
        title="Delete collection?"
        size="sm"
        submitLabel="Delete collection"
        onSubmit={handleDeleteGroup}
        submitting={saving}
      >
        <p className="text-sm text-muted-foreground">
          Delete &quot;{editingGroup?.title}&quot;? Lessons in this collection will become ungrouped.
        </p>
      </AdesiaModal>
    </>
  );
};

export default LessonGroupManager;
