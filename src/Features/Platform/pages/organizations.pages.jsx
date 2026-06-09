import { useCallback, useEffect, useState } from 'react';
import { notifications } from '@mantine/notifications';
import { PageHeader } from '../../../shared/components/PageShell';
import { AdesiaBadge } from '../../../shared/components/AdesiaBadge';
import { PageLoader } from '../../../shared/components/PageLoader';
import { GlassCard } from '../../../shared/components/GlassCard';
import { formatDateTime, getErrorMessage } from '../../../shared/utils/formatters';
import { listPlatformOrganizations, upgradeOrganizationPlan } from '../services/platform.services';

const PLANS = ['FREE', 'BASIC', 'PRO', 'ENTERPRISE'];

const OrganizationsPage = () => {
  const [organizations, setOrganizations] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  const reload = useCallback((q = search) => {
    setLoading(true);
    listPlatformOrganizations({ limit: 50, search: q || undefined })
      .then((data) => setOrganizations(data.items ?? []))
      .catch((err) => notifications.show({ title: 'Organizations', message: getErrorMessage(err), color: 'red' }))
      .finally(() => setLoading(false));
  }, [search]);

  useEffect(() => {
    reload();
  }, [reload]);

  const handleUpgrade = async (orgId, plan) => {
    try {
      const result = await upgradeOrganizationPlan(orgId, plan);
      notifications.show({
        title: 'Plan upgraded',
        message: `Invoice ${result.invoice?.invoiceNumber} issued (${result.invoice?.status})`,
        color: 'green',
      });
      reload();
    } catch (err) {
      notifications.show({ title: 'Upgrade', message: getErrorMessage(err), color: 'red' });
    }
  };

  return (
    <>
      <PageHeader
        title="Organizations &"
        gradientWord="plans"
        description="Upgrade subscription packages and issue invoices (payment collection coming later)."
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
            placeholder="Search organizations"
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
                  <th className="px-4 py-3">Organization</th>
                  <th className="px-4 py-3">Type</th>
                  <th className="px-4 py-3">Members</th>
                  <th className="px-4 py-3">Current plan</th>
                  <th className="px-4 py-3">Upgrade</th>
                  <th className="px-4 py-3">Created</th>
                </tr>
              </thead>
              <tbody>
                {organizations.map((org) => (
                  <tr key={org.id} className="border-t border-border/40">
                    <td className="px-4 py-3">
                      <div className="font-medium">{org.name}</div>
                      <div className="text-xs text-muted-foreground">{org.slug}</div>
                    </td>
                    <td className="px-4 py-3">
                      {org.isPersonalWorkspace ? (
                        <AdesiaBadge status="draft">Personal</AdesiaBadge>
                      ) : (
                        <AdesiaBadge status="active">School</AdesiaBadge>
                      )}
                    </td>
                    <td className="px-4 py-3">{org.memberCount}</td>
                    <td className="px-4 py-3">
                      <AdesiaBadge status="success">{org.subscriptionPlan}</AdesiaBadge>
                    </td>
                    <td className="px-4 py-3">
                      <select
                        defaultValue=""
                        onChange={(e) => {
                          if (!e.target.value) return;
                          handleUpgrade(org.id, e.target.value);
                          e.target.value = '';
                        }}
                        className="rounded-lg border border-border/60 bg-background px-2 py-1 text-xs"
                      >
                        <option value="">Upgrade…</option>
                        {PLANS.filter((p) => p !== org.subscriptionPlan).map((plan) => (
                          <option key={plan} value={plan}>{plan}</option>
                        ))}
                      </select>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">{formatDateTime(org.createdAt)}</td>
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

export default OrganizationsPage;
