import { useCallback, useEffect, useState } from 'react';
import { ActionIcon, Menu, Select, TextInput } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { BookOpen, FolderPlus, Layers, MoreHorizontal, Pencil, Trash2 } from 'lucide-react';
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

const CollectionRow = ({
  active,
  title,
  count,
  onClick,
  onEdit,
  onDelete,
  showMenu = true,
  icon: Icon = Layers,
}) => (
  <div
    className={`flex min-w-0 items-center gap-2 rounded-xl border px-3 py-3 transition sm:px-3.5 ${
      active
        ? 'border-primary/40 bg-primary/5 ring-1 ring-primary/20'
        : 'border-border/40 bg-card/40 hover:border-primary/25 hover:bg-primary/[0.03]'
    }`}
  >
    <button
      type="button"
      onClick={onClick}
      className="flex min-w-0 flex-1 items-center gap-3 text-left"
    >
      <div
        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${
          active ? 'bg-primary/15 text-primary' : 'bg-muted/60 text-muted-foreground'
        }`}
      >
        <Icon className="h-4 w-4" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="line-clamp-2 font-medium leading-snug text-foreground">{title}</p>
        {typeof count === 'number' && (
          <p className="mt-0.5 text-xs text-muted-foreground">
            {count}
            {' lesson'}
            {count !== 1 ? 's' : ''}
          </p>
        )}
      </div>
    </button>
    {showMenu && onEdit && onDelete && (
      <Menu position="bottom-end" withinPortal>
        <Menu.Target>
          <ActionIcon
            variant="subtle"
            color="gray"
            aria-label={`Options for ${title}`}
            className="shrink-0"
          >
            <MoreHorizontal className="h-4 w-4" />
          </ActionIcon>
        </Menu.Target>
        <Menu.Dropdown>
          <Menu.Item
            leftSection={<Pencil className="h-3.5 w-3.5" />}
            onClick={onEdit}
          >
            Rename
          </Menu.Item>
          <Menu.Item
            color="red"
            leftSection={<Trash2 className="h-3.5 w-3.5" />}
            onClick={onDelete}
          >
            Delete
          </Menu.Item>
        </Menu.Dropdown>
      </Menu>
    )}
  </div>
);

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

  const showAllActive = onGroupSelect && !selectedGroupFilter;

  return (
    <>
      <GlassCard className={`min-w-0 ${compact ? 'p-4' : 'p-4 sm:p-5'}`}>
        <div className="mb-3 flex items-center gap-2">
          <Layers className="h-4 w-4 shrink-0 text-primary" />
          <h3 className="text-sm font-semibold text-foreground">
            {lessonId ? 'Lesson collection' : 'Lesson collections'}
          </h3>
        </div>

        {orgHint}

        {lessonId ? (
          <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-end">
            <Select
              label="Collection"
              description="Organize this lesson into a learning path."
              className="min-w-0 w-full flex-1 sm:min-w-[220px]"
              data={selectData}
              value={selectedGroup}
              disabled={loading || saving}
              onChange={(value) => handleAssign(value ?? '')}
            />
            <GhostButton
              type="button"
              className="w-full !px-3 !py-2.5 text-sm sm:w-auto"
              onClick={() => setCreateOpen(true)}
            >
              <FolderPlus className="h-4 w-4" />
              New group
            </GhostButton>
          </div>
        ) : (
          <div className="space-y-3">
            {loading ? (
              <p className="text-sm text-muted-foreground">Loading collections…</p>
            ) : groups.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                Create a collection to organize self-learn lessons into a path.
              </p>
            ) : (
              <>
                {onGroupSelect && groups.length > 0 && (
                  <div className="flex gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] sm:hidden [&::-webkit-scrollbar]:hidden">
                    <button
                      type="button"
                      onClick={() => onGroupSelect('all')}
                      className={`shrink-0 rounded-full border px-3 py-1.5 text-xs font-medium transition ${
                        showAllActive
                          ? 'border-primary bg-primary/10 text-primary'
                          : 'border-border/60 text-muted-foreground'
                      }`}
                    >
                      All
                    </button>
                    {groups.map((g) => (
                      <button
                        key={g.id}
                        type="button"
                        onClick={() => onGroupSelect(g.id)}
                        className={`max-w-[10rem] shrink-0 truncate rounded-full border px-3 py-1.5 text-xs font-medium transition ${
                          selectedGroupFilter === g.id
                            ? 'border-primary bg-primary/10 text-primary'
                            : 'border-border/60 text-muted-foreground'
                        }`}
                      >
                        {g.title}
                      </button>
                    ))}
                  </div>
                )}

                <ul className="space-y-2">
                  {onGroupSelect && (
                    <li>
                      <CollectionRow
                        active={showAllActive}
                        title="All lessons"
                        icon={BookOpen}
                        showMenu={false}
                        onClick={() => onGroupSelect('all')}
                      />
                    </li>
                  )}
                  {groups.map((g) => (
                    <li key={g.id}>
                      <CollectionRow
                        active={selectedGroupFilter === g.id}
                        title={g.title}
                        count={g.lessonCount ?? 0}
                        onClick={() => onGroupSelect?.(g.id)}
                        onEdit={() => openEdit(g)}
                        onDelete={() => openDelete(g)}
                      />
                    </li>
                  ))}
                </ul>
              </>
            )}
            <GhostButton
              type="button"
              className="w-full !px-3 !py-2.5 text-sm sm:w-auto"
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
