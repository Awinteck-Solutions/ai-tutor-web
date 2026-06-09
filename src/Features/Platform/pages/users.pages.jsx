import { useCallback, useEffect, useState } from 'react';
import { notifications } from '@mantine/notifications';
import { PageHeader } from '../../../shared/components/PageShell';
import { AdesiaBadge } from '../../../shared/components/AdesiaBadge';
import { PageLoader } from '../../../shared/components/PageLoader';
import { GlassCard } from '../../../shared/components/GlassCard';
import { formatDateTime, getErrorMessage } from '../../../shared/utils/formatters';
import { listPlatformUsers, updatePlatformUser } from '../services/platform.services';

const ROLES = ['STUDENT', 'TEACHER', 'PARENT', 'SCHOOL_ADMIN', 'SUPER_ADMIN'];
const STATUSES = ['ACTIVE', 'INACTIVE', 'SUSPENDED'];

const UsersPage = () => {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  const reload = useCallback((q = search) => {
    setLoading(true);
    listPlatformUsers({ limit: 50, search: q || undefined })
      .then((data) => setUsers(data.items ?? []))
      .catch((err) => notifications.show({ title: 'Users', message: getErrorMessage(err), color: 'red' }))
      .finally(() => setLoading(false));
  }, [search]);

  useEffect(() => {
    reload();
  }, [reload]);

  const handleUpdate = async (id, payload) => {
    try {
      await updatePlatformUser(id, payload);
      notifications.show({ title: 'Users', message: 'User updated', color: 'green' });
      reload();
    } catch (err) {
      notifications.show({ title: 'Users', message: getErrorMessage(err), color: 'red' });
    }
  };

  return (
    <>
      <PageHeader
        title="Platform"
        gradientWord="users"
        description="Search and manage users across all organizations."
      />

      <GlassCard className="mb-4 p-4">
        <form
          className="flex flex-col gap-3 sm:flex-row"
          onSubmit={(e) => {
            e.preventDefault();
            reload(search);
          }}
        >
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name or email"
            className="flex-1 rounded-xl border border-border/60 bg-background px-4 py-2.5 text-sm"
          />
          <button type="submit" className="rounded-xl bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground">
            Search
          </button>
        </form>
      </GlassCard>

      {loading ? (
        <PageLoader />
      ) : (
        <GlassCard className="overflow-hidden p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-muted/40 text-xs uppercase text-muted-foreground">
                <tr>
                  <th className="px-4 py-3">User</th>
                  <th className="px-4 py-3">Role</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Organization</th>
                  <th className="px-4 py-3">Plan</th>
                  <th className="px-4 py-3">Last login</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.id} className="border-t border-border/40">
                    <td className="px-4 py-3">
                      <div className="font-medium">{u.firstName} {u.lastName}</div>
                      <div className="text-xs text-muted-foreground">{u.email}</div>
                    </td>
                    <td className="px-4 py-3">
                      <select
                        value={u.role}
                        onChange={(e) => handleUpdate(u.id, { role: e.target.value })}
                        className="rounded-lg border border-border/60 bg-background px-2 py-1 text-xs"
                      >
                        {ROLES.map((role) => (
                          <option key={role} value={role}>{role}</option>
                        ))}
                      </select>
                    </td>
                    <td className="px-4 py-3">
                      <select
                        value={u.status}
                        onChange={(e) => handleUpdate(u.id, { status: e.target.value })}
                        className="rounded-lg border border-border/60 bg-background px-2 py-1 text-xs"
                      >
                        {STATUSES.map((status) => (
                          <option key={status} value={status}>{status}</option>
                        ))}
                      </select>
                    </td>
                    <td className="px-4 py-3">
                      <div>{u.organizationName ?? '—'}</div>
                      {u.isPersonalWorkspace && (
                        <AdesiaBadge status="draft" className="mt-1">Personal</AdesiaBadge>
                      )}
                    </td>
                    <td className="px-4 py-3">{u.subscriptionPlan ?? '—'}</td>
                    <td className="px-4 py-3 text-muted-foreground">{u.lastLoginAt ? formatDateTime(u.lastLoginAt) : '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </GlassCard>
      )}
    </>
  );
};

export default UsersPage;
