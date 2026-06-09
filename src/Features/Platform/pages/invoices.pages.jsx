import { useCallback, useEffect, useState } from 'react';
import { notifications } from '@mantine/notifications';
import { PageHeader } from '../../../shared/components/PageShell';
import { AdesiaBadge } from '../../../shared/components/AdesiaBadge';
import { PageLoader } from '../../../shared/components/PageLoader';
import { GlassCard } from '../../../shared/components/GlassCard';
import { GradientButton } from '../../../shared/components/GradientButton';
import { formatDateTime, getErrorMessage } from '../../../shared/utils/formatters';
import {
  createPlatformInvoice,
  listPlatformInvoices,
  listPlatformOrganizations,
  updatePlatformInvoice,
} from '../services/platform.services';

const PLANS = ['FREE', 'BASIC', 'PRO', 'ENTERPRISE'];
const STATUSES = ['DRAFT', 'SENT', 'PAID', 'VOID'];

const InvoicesPage = () => {
  const [invoices, setInvoices] = useState([]);
  const [organizations, setOrganizations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({
    organizationId: '',
    plan: 'BASIC',
    amount: '',
    description: '',
  });

  const reload = useCallback(() => {
    setLoading(true);
    Promise.all([
      listPlatformInvoices({ limit: 50 }),
      listPlatformOrganizations({ limit: 100 }),
    ])
      .then(([invoiceData, orgData]) => {
        setInvoices(invoiceData.items ?? []);
        setOrganizations(orgData.items ?? []);
      })
      .catch((err) => notifications.show({ title: 'Invoices', message: getErrorMessage(err), color: 'red' }))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    reload();
  }, [reload]);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!form.organizationId) return;
    try {
      await createPlatformInvoice({
        organizationId: form.organizationId,
        plan: form.plan,
        amount: form.amount ? Number(form.amount) : undefined,
        description: form.description || undefined,
        status: 'SENT',
      });
      notifications.show({ title: 'Invoice', message: 'Invoice created', color: 'green' });
      setForm({ organizationId: '', plan: 'BASIC', amount: '', description: '' });
      reload();
    } catch (err) {
      notifications.show({ title: 'Invoice', message: getErrorMessage(err), color: 'red' });
    }
  };

  const handleStatus = async (id, status) => {
    try {
      await updatePlatformInvoice(id, { status });
      notifications.show({ title: 'Invoice', message: `Marked ${status}`, color: 'green' });
      reload();
    } catch (err) {
      notifications.show({ title: 'Invoice', message: getErrorMessage(err), color: 'red' });
    }
  };

  return (
    <>
      <PageHeader
        title="Invoices &"
        gradientWord="billing"
        description="Issue and track plan invoices. Online payments can be wired in later."
      />

      <GlassCard className="mb-6 p-5">
        <h3 className="mb-4 font-display font-semibold">Create invoice</h3>
        <form onSubmit={handleCreate} className="grid gap-4 md:grid-cols-2">
          <label className="block text-sm">
            <span className="mb-1 block text-muted-foreground">Organization</span>
            <select
              required
              value={form.organizationId}
              onChange={(e) => setForm((f) => ({ ...f, organizationId: e.target.value }))}
              className="w-full rounded-xl border border-border/60 bg-background px-3 py-2.5"
            >
              <option value="">Select organization</option>
              {organizations.map((org) => (
                <option key={org.id} value={org.id}>{org.name} ({org.subscriptionPlan})</option>
              ))}
            </select>
          </label>
          <label className="block text-sm">
            <span className="mb-1 block text-muted-foreground">Plan</span>
            <select
              value={form.plan}
              onChange={(e) => setForm((f) => ({ ...f, plan: e.target.value }))}
              className="w-full rounded-xl border border-border/60 bg-background px-3 py-2.5"
            >
              {PLANS.map((plan) => (
                <option key={plan} value={plan}>{plan}</option>
              ))}
            </select>
          </label>
          <label className="block text-sm">
            <span className="mb-1 block text-muted-foreground">Amount (USD, optional)</span>
            <input
              type="number"
              min="0"
              step="0.01"
              value={form.amount}
              onChange={(e) => setForm((f) => ({ ...f, amount: e.target.value }))}
              placeholder="Defaults to plan price"
              className="w-full rounded-xl border border-border/60 bg-background px-3 py-2.5"
            />
          </label>
          <label className="block text-sm md:col-span-2">
            <span className="mb-1 block text-muted-foreground">Description</span>
            <input
              value={form.description}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
              placeholder="Optional invoice description"
              className="w-full rounded-xl border border-border/60 bg-background px-3 py-2.5"
            />
          </label>
          <div className="md:col-span-2">
            <GradientButton type="submit">Issue invoice</GradientButton>
          </div>
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
                  <th className="px-4 py-3">Invoice</th>
                  <th className="px-4 py-3">Organization</th>
                  <th className="px-4 py-3">Plan</th>
                  <th className="px-4 py-3">Amount</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Due</th>
                  <th className="px-4 py-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {invoices.map((inv) => (
                  <tr key={inv.id} className="border-t border-border/40">
                    <td className="px-4 py-3">
                      <div className="font-medium">{inv.invoiceNumber}</div>
                      <div className="text-xs text-muted-foreground">{formatDateTime(inv.createdAt)}</div>
                    </td>
                    <td className="px-4 py-3">{inv.organizationName ?? inv.organizationId}</td>
                    <td className="px-4 py-3">{inv.plan}</td>
                    <td className="px-4 py-3">{inv.currency} {inv.amount}</td>
                    <td className="px-4 py-3"><AdesiaBadge status={inv.status === 'PAID' ? 'success' : 'draft'}>{inv.status}</AdesiaBadge></td>
                    <td className="px-4 py-3 text-muted-foreground">{inv.dueDate ? formatDateTime(inv.dueDate) : '—'}</td>
                    <td className="px-4 py-3">
                      <select
                        defaultValue=""
                        onChange={(e) => {
                          if (!e.target.value) return;
                          handleStatus(inv.id, e.target.value);
                          e.target.value = '';
                        }}
                        className="rounded-lg border border-border/60 bg-background px-2 py-1 text-xs"
                      >
                        <option value="">Update…</option>
                        {STATUSES.filter((s) => s !== inv.status).map((status) => (
                          <option key={status} value={status}>{status}</option>
                        ))}
                      </select>
                    </td>
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

export default InvoicesPage;
