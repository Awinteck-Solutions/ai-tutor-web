import { useCallback, useState } from 'react';
import { Modal, Select, Tabs, TextInput } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { notifications } from '@mantine/notifications';
import { Mail, UserPlus, Users } from 'lucide-react';
import { useAuth } from '../../../shared/context/AuthContext';
import { PageHeader } from '../../../shared/components/PageShell';
import { AdesiaBadge } from '../../../shared/components/AdesiaBadge';
import { EmptyOrgHint } from '../../../shared/components/PageLoader';
import { PageHeaderSkeleton } from '../../../shared/components/TableSkeleton';
import AdesiaDataTable from '../../../shared/components/AdesiaDataTable';
import DataListFooter from '../../../shared/components/DataListFooter';
import ListGridToolbar from '../../../shared/components/ListGridToolbar';
import { GlassCard } from '../../../shared/components/GlassCard';
import { AdesiaModal } from '../../../shared/components/AdesiaModal';
import { GradientButton } from '../../../shared/components/GradientButton';
import { useServerList } from '../../../shared/hooks/useServerList';
import { emptyPaginated, formatDateShort, getErrorMessage } from '../../../shared/utils/formatters';
import {
  createMember, getInvites, getMembers, removeMember, sendInvite, suspendMember,
} from '../services/organization.services';

const ROLES = [
  { value: 'TEACHER', label: 'Teacher' },
  { value: 'STUDENT', label: 'Student' },
  { value: 'PARENT', label: 'Parent' },
  { value: 'SCHOOL_ADMIN', label: 'School Admin' },
];

const MEMBERS_PAGE_SIZE = 12;

const MembersPage = () => {
  const { organizationId } = useAuth();
  const [submitting, setSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState('members');
  const [inviteOpen, { open: openInvite, close: closeInvite }] = useDisclosure(false);
  const [addOpen, { open: openAdd, close: closeAdd }] = useDisclosure(false);
  const [confirmOpen, { open: openConfirm, close: closeConfirm }] = useDisclosure(false);
  const [pendingRemoveId, setPendingRemoveId] = useState(null);
  const [inviteForm, setInviteForm] = useState({ email: '', role: 'TEACHER' });
  const [addForm, setAddForm] = useState({
    firstName: '', lastName: '', email: '', password: '', role: 'TEACHER',
  });
  const [view, setView] = useState('grid');

  const fetchMembers = useCallback(async (params) => {
    if (!organizationId) return emptyPaginated(params.limit);
    try {
      return await getMembers(organizationId, {
        page: params.page,
        limit: params.limit,
        search: params.search,
      });
    } catch (err) {
      notifications.show({ title: 'Error', message: getErrorMessage(err), color: 'red' });
      return emptyPaginated(params.limit);
    }
  }, [organizationId]);

  const fetchInvites = useCallback(async (params) => {
    if (!organizationId) return emptyPaginated(params.limit);
    try {
      return await getInvites(organizationId, {
        page: params.page,
        limit: params.limit,
        search: params.search,
      });
    } catch (err) {
      notifications.show({ title: 'Error', message: getErrorMessage(err), color: 'red' });
      return emptyPaginated(params.limit);
    }
  }, [organizationId]);

  const {
    items: members,
    loading: membersLoading,
    page: memberPage,
    setPage: setMemberPage,
    search: memberSearch,
    setSearch: setMemberSearch,
    meta: memberMeta,
    reload: reloadMembers,
    rangeStart: memberRangeStart,
    rangeEnd: memberRangeEnd,
  } = useServerList(fetchMembers, [organizationId], MEMBERS_PAGE_SIZE);

  const {
    items: invites,
    loading: invitesLoading,
    page: invitePage,
    setPage: setInvitePage,
    search: inviteSearch,
    setSearch: setInviteSearch,
    meta: inviteMeta,
    reload: reloadInvites,
    rangeStart: inviteRangeStart,
    rangeEnd: inviteRangeEnd,
  } = useServerList(fetchInvites, [organizationId], MEMBERS_PAGE_SIZE);

  const reloadAll = () => {
    reloadMembers();
    reloadInvites();
  };

  const handleInvite = async () => {
    setSubmitting(true);
    try {
      await sendInvite(organizationId, inviteForm);
      notifications.show({ title: 'Sent', message: 'Invitation sent', color: 'green' });
      closeInvite();
      setInviteForm({ email: '', role: 'TEACHER' });
      reloadAll();
    } catch (err) {
      notifications.show({ title: 'Error', message: getErrorMessage(err), color: 'red' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleAdd = async () => {
    setSubmitting(true);
    try {
      await createMember(organizationId, addForm);
      notifications.show({ title: 'Added', message: 'Member added', color: 'green' });
      closeAdd();
      setAddForm({ firstName: '', lastName: '', email: '', password: '', role: 'TEACHER' });
      reloadAll();
    } catch (err) {
      notifications.show({ title: 'Error', message: getErrorMessage(err), color: 'red' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleRemove = async () => {
    if (!pendingRemoveId) return;
    try {
      await removeMember(organizationId, pendingRemoveId);
      notifications.show({ title: 'Removed', message: 'Member removed', color: 'green' });
      closeConfirm();
      setPendingRemoveId(null);
      reloadAll();
    } catch (err) {
      notifications.show({ title: 'Error', message: getErrorMessage(err), color: 'red' });
    }
  };

  const handleSuspend = async (userId) => {
    try {
      await suspendMember(organizationId, userId, true);
      notifications.show({ title: 'Updated', message: 'Member suspended', color: 'green' });
      reloadMembers();
    } catch (err) {
      notifications.show({ title: 'Error', message: getErrorMessage(err), color: 'red' });
    }
  };

  if (!organizationId) return <EmptyOrgHint />;

  const inviteColumns = [
    { key: 'email', header: 'Email', className: 'font-medium' },
    {
      key: 'role',
      header: 'Role',
      render: (row) => <AdesiaBadge status="draft">{row.role}</AdesiaBadge>,
    },
    {
      key: 'expiresAt',
      header: 'Expires',
      render: (row) => formatDateShort(row.expiresAt),
    },
  ];

  const memberColumns = [
    {
      key: 'name',
      header: 'Name',
      className: 'font-medium',
      render: (row) => `${row.firstName} ${row.lastName}`,
    },
    { key: 'email', header: 'Email', className: 'text-muted-foreground' },
    {
      key: 'role',
      header: 'Role',
      render: (row) => <AdesiaBadge status="draft">{row.role}</AdesiaBadge>,
    },
    {
      key: 'status',
      header: 'Status',
      render: (row) => (
        <AdesiaBadge status={row.status === 'ACTIVE' ? 'active' : 'draft'}>
          {row.status}
        </AdesiaBadge>
      ),
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (row) => (
        <div className="flex flex-wrap gap-2">
          <button type="button" className="btn-outline !px-2 !py-1 text-xs" onClick={() => handleSuspend(row.id || row._id)}>
            Suspend
          </button>
          <button
            type="button"
            className="btn-danger !px-2 !py-1 text-xs"
            onClick={() => {
              setPendingRemoveId(row.id || row._id);
              openConfirm();
            }}
          >
            Remove
          </button>
        </div>
      ),
    },
  ];

  const headerLoading = membersLoading && !members.length && invitesLoading && !invites.length;

  return (
    <>
      {headerLoading ? <PageHeaderSkeleton /> : (
        <PageHeader
          title="Members"
          gradientWord="Members"
          description="Manage organization users, roles, and invitations."
          action={(
            <div className="flex flex-wrap gap-2">
              <button type="button" className="btn-outline" onClick={openInvite}>
                <Mail className="h-4 w-4" />
                Invite
              </button>
              <GradientButton type="button" onClick={openAdd} className="!px-4 !py-2">
                <UserPlus className="h-4 w-4" />
                Add member
              </GradientButton>
            </div>
          )}
        />
      )}

      <Tabs value={activeTab} onChange={setActiveTab}>
        <Tabs.List className="mb-6 flex-wrap gap-1 rounded-xl border border-border/50 bg-card/50 p-1">
          <Tabs.Tab value="members" leftSection={<Users className="h-4 w-4" />}>
            Members ({memberMeta.total ?? 0})
          </Tabs.Tab>
          <Tabs.Tab value="invites" leftSection={<Mail className="h-4 w-4" />}>
            Invitations ({inviteMeta.total ?? 0})
          </Tabs.Tab>
        </Tabs.List>

        <Tabs.Panel value="members">
          <ListGridToolbar
            view={view}
            onViewChange={setView}
            search={memberSearch}
            onSearchChange={setMemberSearch}
            searchPlaceholder="Search members…"
          />
          {view === 'grid' ? (
            <div className="glass-card overflow-hidden">
              <div className="grid gap-4 p-5 sm:grid-cols-2 lg:grid-cols-3">
                {members.length ? members.map((row) => (
                  <GlassCard key={row.id || row._id} className="flex h-full flex-col p-5">
                    <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-primary/15 text-primary">
                      <Users className="h-5 w-5" />
                    </div>
                    <h3 className="font-display text-sm font-semibold text-foreground">
                      {row.firstName} {row.lastName}
                    </h3>
                    <p className="mt-1 text-sm text-muted-foreground">{row.email}</p>
                    <div className="mt-2 flex flex-wrap gap-2">
                      <AdesiaBadge status="draft">{row.role}</AdesiaBadge>
                      <AdesiaBadge status={row.status === 'ACTIVE' ? 'active' : 'draft'}>
                        {row.status}
                      </AdesiaBadge>
                    </div>
                    <div className="mt-4 flex flex-wrap gap-2">
                      <button type="button" className="btn-outline !px-2 !py-1 text-xs" onClick={() => handleSuspend(row.id || row._id)}>
                        Suspend
                      </button>
                      <button
                        type="button"
                        className="btn-danger !px-2 !py-1 text-xs"
                        onClick={() => {
                          setPendingRemoveId(row.id || row._id);
                          openConfirm();
                        }}
                      >
                        Remove
                      </button>
                    </div>
                  </GlassCard>
                )) : (
                  <p className="col-span-full py-12 text-center text-muted-foreground">
                    {membersLoading ? 'Loading members…' : 'No members yet — invite your team to get started.'}
                  </p>
                )}
              </div>
              <DataListFooter
                rangeStart={memberRangeStart}
                rangeEnd={memberRangeEnd}
                totalItems={memberMeta.total ?? 0}
                page={memberPage}
                totalPages={memberMeta.totalPages ?? 1}
                pageSize={MEMBERS_PAGE_SIZE}
                onPageChange={setMemberPage}
              />
            </div>
          ) : (
            <AdesiaDataTable
              title="Organization members"
              description="Active users with access to your Adesia workspace."
              data={members}
              columns={memberColumns}
              loading={membersLoading}
              pageSize={MEMBERS_PAGE_SIZE}
              serverPagination
              page={memberPage}
              totalPages={memberMeta.totalPages ?? 1}
              totalItems={memberMeta.total ?? 0}
              rangeStart={memberRangeStart}
              rangeEnd={memberRangeEnd}
              onPageChange={setMemberPage}
              paginate={false}
              emptyMessage="No members yet — invite your team to get started."
            />
          )}
        </Tabs.Panel>

        <Tabs.Panel value="invites">
          <ListGridToolbar
            view={view}
            onViewChange={setView}
            search={inviteSearch}
            onSearchChange={setInviteSearch}
            searchPlaceholder="Search invites…"
          />
          {view === 'grid' ? (
            <div className="glass-card overflow-hidden">
              <div className="grid gap-4 p-5 sm:grid-cols-2 lg:grid-cols-3">
                {invites.length ? invites.map((row) => (
                  <GlassCard key={row.id || row._id || row.email} className="p-5">
                    <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-primary/15 text-primary">
                      <Mail className="h-5 w-5" />
                    </div>
                    <h3 className="font-display text-sm font-semibold text-foreground">{row.email}</h3>
                    <div className="mt-2">
                      <AdesiaBadge status="draft">{row.role}</AdesiaBadge>
                    </div>
                    <p className="mt-2 text-xs text-muted-foreground">
                      Expires {formatDateShort(row.expiresAt)}
                    </p>
                  </GlassCard>
                )) : (
                  <p className="col-span-full py-12 text-center text-muted-foreground">
                    {invitesLoading ? 'Loading invites…' : 'No pending invites.'}
                  </p>
                )}
              </div>
              <DataListFooter
                rangeStart={inviteRangeStart}
                rangeEnd={inviteRangeEnd}
                totalItems={inviteMeta.total ?? 0}
                page={invitePage}
                totalPages={inviteMeta.totalPages ?? 1}
                pageSize={MEMBERS_PAGE_SIZE}
                onPageChange={setInvitePage}
              />
            </div>
          ) : (
            <AdesiaDataTable
              title="Pending invitations"
              description="Outstanding invites waiting to be accepted."
              data={invites}
              columns={inviteColumns}
              loading={invitesLoading}
              pageSize={MEMBERS_PAGE_SIZE}
              serverPagination
              page={invitePage}
              totalPages={inviteMeta.totalPages ?? 1}
              totalItems={inviteMeta.total ?? 0}
              rangeStart={inviteRangeStart}
              rangeEnd={inviteRangeEnd}
              onPageChange={setInvitePage}
              paginate={false}
              emptyMessage="No pending invites."
            />
          )}
        </Tabs.Panel>
      </Tabs>

      <AdesiaModal
        opened={inviteOpen}
        onClose={closeInvite}
        title="Send invitation"
        submitLabel="Send invite"
        onSubmit={handleInvite}
        submitting={submitting}
        submitDisabled={!inviteForm.email.trim()}
      >
        <div className="space-y-4">
          <TextInput
            label="Email"
            type="email"
            placeholder="colleague@school.edu"
            value={inviteForm.email}
            onChange={(e) => setInviteForm({ ...inviteForm, email: e.target.value })}
          />
          <Select
            label="Role"
            data={ROLES}
            value={inviteForm.role}
            onChange={(v) => setInviteForm({ ...inviteForm, role: v })}
          />
        </div>
      </AdesiaModal>

      <AdesiaModal
        opened={addOpen}
        onClose={closeAdd}
        title="Add member directly"
        submitLabel="Add member"
        onSubmit={handleAdd}
        submitting={submitting}
        submitDisabled={!addForm.firstName || !addForm.lastName || !addForm.email || !addForm.password}
      >
        <div className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <TextInput label="First name" value={addForm.firstName} onChange={(e) => setAddForm({ ...addForm, firstName: e.target.value })} />
            <TextInput label="Last name" value={addForm.lastName} onChange={(e) => setAddForm({ ...addForm, lastName: e.target.value })} />
          </div>
          <TextInput label="Email" type="email" value={addForm.email} onChange={(e) => setAddForm({ ...addForm, email: e.target.value })} />
          <TextInput label="Password" type="password" value={addForm.password} onChange={(e) => setAddForm({ ...addForm, password: e.target.value })} />
          <Select label="Role" data={ROLES} value={addForm.role} onChange={(v) => setAddForm({ ...addForm, role: v })} />
        </div>
      </AdesiaModal>

      <Modal opened={confirmOpen} onClose={closeConfirm} title="Remove member?" centered>
        <p className="mb-4 text-sm text-muted-foreground">
          This user will lose access to your organization immediately.
        </p>
        <div className="flex justify-end gap-2">
          <button type="button" className="btn-outline" onClick={closeConfirm}>Cancel</button>
          <button type="button" className="btn-danger" onClick={handleRemove}>Remove</button>
        </div>
      </Modal>
    </>
  );
};

export default MembersPage;
