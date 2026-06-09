import { useEffect, useMemo, useState } from 'react';
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
import ListGridToolbar from '../../../shared/components/ListGridToolbar';
import { GlassCard } from '../../../shared/components/GlassCard';
import { AdesiaModal } from '../../../shared/components/AdesiaModal';
import { GradientButton } from '../../../shared/components/GradientButton';
import { formatDateShort, getErrorMessage } from '../../../shared/utils/formatters';
import {
  createMember, getInvites, getMembers, removeMember, sendInvite, suspendMember,
} from '../services/organization.services';

const ROLES = [
  { value: 'TEACHER', label: 'Teacher' },
  { value: 'STUDENT', label: 'Student' },
  { value: 'PARENT', label: 'Parent' },
  { value: 'SCHOOL_ADMIN', label: 'School Admin' },
];

const MembersPage = () => {
  const { organizationId } = useAuth();
  const [members, setMembers] = useState([]);
  const [invites, setInvites] = useState([]);
  const [loading, setLoading] = useState(true);
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
  const [search, setSearch] = useState('');

  const load = () => {
    if (!organizationId) return;
    setLoading(true);
    Promise.all([
      getMembers(organizationId, { limit: 100, search: '' }),
      getInvites(organizationId, { limit: 100 }),
    ])
      .then(([membersData, invitesData]) => {
        setMembers(membersData?.items ?? []);
        setInvites(invitesData?.items ?? []);
      })
      .catch((err) => notifications.show({ title: 'Error', message: getErrorMessage(err), color: 'red' }))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [organizationId]);

  const handleInvite = async () => {
    setSubmitting(true);
    try {
      await sendInvite(organizationId, inviteForm);
      notifications.show({ title: 'Sent', message: 'Invitation sent', color: 'green' });
      closeInvite();
      setInviteForm({ email: '', role: 'TEACHER' });
      load();
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
      load();
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
      load();
    } catch (err) {
      notifications.show({ title: 'Error', message: getErrorMessage(err), color: 'red' });
    }
  };

  const handleSuspend = async (userId) => {
    try {
      await suspendMember(organizationId, userId, true);
      notifications.show({ title: 'Updated', message: 'Member suspended', color: 'green' });
      load();
    } catch (err) {
      notifications.show({ title: 'Error', message: getErrorMessage(err), color: 'red' });
    }
  };

  const filteredMembers = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return members;
    return members.filter((row) => ['firstName', 'lastName', 'email', 'role', 'status'].some((key) =>
      String(row[key] ?? '').toLowerCase().includes(q)));
  }, [members, search]);

  const filteredInvites = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return invites;
    return invites.filter((row) => ['email', 'role'].some((key) =>
      String(row[key] ?? '').toLowerCase().includes(q)));
  }, [invites, search]);

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

  return (
    <>
      {loading ? <PageHeaderSkeleton /> : (
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
            Members ({members.length})
          </Tabs.Tab>
          <Tabs.Tab value="invites" leftSection={<Mail className="h-4 w-4" />}>
            Invitations ({invites.length})
          </Tabs.Tab>
        </Tabs.List>

        <Tabs.Panel value="members">
          <ListGridToolbar
            view={view}
            onViewChange={setView}
            search={search}
            onSearchChange={setSearch}
            searchPlaceholder="Search members…"
          />
          {view === 'grid' ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {filteredMembers.length ? filteredMembers.map((row) => (
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
                  No members yet — invite your team to get started.
                </p>
              )}
            </div>
          ) : (
            <AdesiaDataTable
              title="Organization members"
              description="Active users with access to your Adesia workspace."
              data={filteredMembers}
              columns={memberColumns}
              loading={loading}
              pageSize={10}
              emptyMessage="No members yet — invite your team to get started."
            />
          )}
        </Tabs.Panel>

        <Tabs.Panel value="invites">
          <ListGridToolbar
            view={view}
            onViewChange={setView}
            search={search}
            onSearchChange={setSearch}
            searchPlaceholder="Search invites…"
          />
          {view === 'grid' ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {filteredInvites.length ? filteredInvites.map((row) => (
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
                <p className="col-span-full py-12 text-center text-muted-foreground">No pending invites.</p>
              )}
            </div>
          ) : (
            <AdesiaDataTable
              title="Pending invitations"
              description="Outstanding invites waiting to be accepted."
              data={filteredInvites}
              columns={inviteColumns}
              loading={loading}
              pageSize={10}
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
