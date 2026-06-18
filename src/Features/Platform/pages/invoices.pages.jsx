import { useCallback, useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { modals } from '@mantine/modals';
import { notifications } from '@mantine/notifications';
import { SimpleGrid } from '@mantine/core';
import { PageHeader } from '../../../shared/components/PageShell';
import { AdesiaBadge } from '../../../shared/components/AdesiaBadge';
import { PageLoader } from '../../../shared/components/PageLoader';
import { GlassCard } from '../../../shared/components/GlassCard';
import { GradientButton } from '../../../shared/components/GradientButton';
import { AdesiaModal } from '../../../shared/components/AdesiaModal';
import { formatDateTime, getErrorMessage } from '../../../shared/utils/formatters';
import {
  createPlatformInvoice,
  deletePlatformInvoice,
  generatePlatformInvoicePaymentLink,
  getPlatformInvoiceStats,
  listPlatformInvoices,
  listPlatformOrganizations,
  sendPlatformInvoice,
  updatePlatformInvoice,
} from '../services/platform.services';

const PLANS = ['FREE', 'BASIC', 'PRO', 'ENTERPRISE'];
const STATUSES = ['DRAFT', 'SENT', 'PAID', 'VOID'];

const InvoicesPage = () => {
  const [searchParams] = useSearchParams();
  const orgFilter = searchParams.get('organizationId') ?? '';
  const [invoices, setInvoices] = useState([]);
  const [organizations, setOrganizations] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editInvoice, setEditInvoice] = useState(null);
  const [form, setForm] = useState({ organizationId: '', plan: 'BASIC', amount: '', description: '' });

  const reload = useCallback(() => {
    setLoading(true);
    Promise.all([
      listPlatformInvoices({ limit: 50, organizationId: orgFilter || undefined }),
      listPlatformOrganizations({ limit: 100 }),
      getPlatformInvoiceStats(),
    ])
      .then(([invoiceData, orgData, statsData]) => {
        setInvoices(invoiceData.items ?? []);
        setOrganizations(orgData.items ?? []);
        setStats(statsData);
      })
      .catch((err) => notifications.show({ title: 'Invoices', message: getErrorMessage(err), color: 'red' }))
      .finally(() => setLoading(false));
  }, [orgFilter]);

  useEffect(() => { reload(); }, [reload]);

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

  const handleDelete = (inv) => {
    modals.openConfirmModal({
      title: 'Delete invoice',
      children: `Delete ${inv.invoiceNumber}? This cannot be undone.`,
      labels: { confirm: 'Delete', cancel: 'Cancel' },
      confirmProps: { color: 'red' },
      onConfirm: async () => {
        try {
          await deletePlatformInvoice(inv.id);
          notifications.show({ title: 'Invoice', message: 'Deleted', color: 'green' });
          reload();
        } catch (err) {
          notifications.show({ title: 'Invoice', message: getErrorMessage(err), color: 'red' });
        }
      },
    });
  };

  const handleSend = async (id) => {
    try {
      await sendPlatformInvoice(id);
      notifications.show({ title: 'Invoice', message: 'Invoice emailed to org admin', color: 'green' });
      reload();
    } catch (err) {
      notifications.show({ title: 'Invoice', message: getErrorMessage(err), color: 'red' });
    }
  };

  const handlePaymentLink = async (id) => {
    try {
      const result = await generatePlatformInvoicePaymentLink(id);
      if (result.paymentLink) {
        await navigator.clipboard.writeText(result.paymentLink);
        notifications.show({ title: 'Payment link', message: 'Link copied to clipboard', color: 'green' });
      }
      reload();
    } catch (err) {
      notifications.show({ title: 'Payment link', message: getErrorMessage(err), color: 'red' });
    }
  };

  const handleSaveEdit = async (e) => {
    e.preventDefault();
    if (!editInvoice) return;
    try {
      await updatePlatformInvoice(editInvoice.id, {
        plan: editInvoice.plan,
        amount: Number(editInvoice.amount),
        description: editInvoice.description,
        notes: editInvoice.notes,
        dueDate: editInvoice.dueDate || undefined,
        status: editInvoice.status,
      });
      notifications.show({ title: 'Invoice', message: 'Updated', color: 'green' });
      setEditInvoice(null);
      reload();
    } catch (err) {
      notifications.show({ title: 'Invoice', message: getErrorMessage(err), color: 'red' });
    }
  };

  return (
    <>
      <PageHeader title="Invoices &" gradientWord="billing" description="Issue invoices, email clients, and generate payment links." />

      {orgFilter && (
        <GlassCard className="mb-4 flex flex-wrap items-center justify-between gap-3 p-4 text-sm">
          <span>Showing invoices for one organization.</span>
          <Link to="/platform/invoices" className="text-primary hover:underline">Clear filter</Link>
        </GlassCard>
      )}

      {stats && (
        <SimpleGrid cols={{ base: 1, sm: 2, lg: 4 }} spacing="md" className="mb-6">
          <GlassCard className="p-5"><p className="text-xs uppercase text-muted-foreground">Total invoices</p><p className="mt-1 text-2xl font-bold">{stats.total}</p></GlassCard>
          <GlassCard className="p-5"><p className="text-xs uppercase text-muted-foreground">Paid revenue</p><p className="mt-1 text-2xl font-bold">${stats.paidRevenue?.toFixed?.(2) ?? stats.paidRevenue}</p></GlassCard>
          <GlassCard className="p-5"><p className="text-xs uppercase text-muted-foreground">Outstanding (sent)</p><p className="mt-1 text-2xl font-bold">{stats.byStatus?.SENT?.count ?? 0}</p></GlassCard>
          <GlassCard className="p-5"><p className="text-xs uppercase text-muted-foreground">Draft</p><p className="mt-1 text-2xl font-bold">{stats.byStatus?.DRAFT?.count ?? 0}</p></GlassCard>
        </SimpleGrid>
      )}

      <GlassCard className="mb-6 p-5">
        <h3 className="mb-4 font-display font-semibold">Create invoice</h3>
        <form onSubmit={handleCreate} className="grid gap-4 md:grid-cols-2">
          <label className="block text-sm">
            <span className="mb-1 block text-muted-foreground">Organization</span>
            <select required value={form.organizationId} onChange={(e) => setForm((f) => ({ ...f, organizationId: e.target.value }))} className="w-full rounded-xl border border-border/60 bg-background px-3 py-2.5">
              <option value="">Select organization</option>
              {organizations.map((org) => <option key={org.id} value={org.id}>{org.name}</option>)}
            </select>
          </label>
          <label className="block text-sm">
            <span className="mb-1 block text-muted-foreground">Plan</span>
            <select value={form.plan} onChange={(e) => setForm((f) => ({ ...f, plan: e.target.value }))} className="w-full rounded-xl border border-border/60 bg-background px-3 py-2.5">
              {PLANS.map((plan) => <option key={plan} value={plan}>{plan}</option>)}
            </select>
          </label>
          <label className="block text-sm">
            <span className="mb-1 block text-muted-foreground">Amount (USD)</span>
            <input type="number" min="0" step="0.01" value={form.amount} onChange={(e) => setForm((f) => ({ ...f, amount: e.target.value }))} className="w-full rounded-xl border border-border/60 bg-background px-3 py-2.5" />
          </label>
          <label className="block text-sm md:col-span-2">
            <span className="mb-1 block text-muted-foreground">Description</span>
            <input value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} className="w-full rounded-xl border border-border/60 bg-background px-3 py-2.5" />
          </label>
          <div className="md:col-span-2"><GradientButton type="submit">Issue invoice</GradientButton></div>
        </form>
      </GlassCard>

      {loading ? <PageLoader /> : (
        <GlassCard className="overflow-hidden p-0">
          <table className="w-full text-left text-sm">
            <thead className="bg-muted/40 text-xs uppercase text-muted-foreground">
              <tr>
                <th className="px-4 py-3">Invoice</th>
                <th className="px-4 py-3">Organization</th>
                <th className="px-4 py-3">Amount</th>
                <th className="px-4 py-3">Status</th>
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
                  <td className="px-4 py-3">{inv.currency} {inv.amount}</td>
                  <td className="px-4 py-3"><AdesiaBadge status={inv.status === 'PAID' ? 'success' : 'draft'}>{inv.status}</AdesiaBadge></td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-2 text-xs">
                      <button type="button" className="text-primary" onClick={() => setEditInvoice({ ...inv })}>Edit</button>
                      <button type="button" className="text-primary" onClick={() => handleSend(inv.id)}>Email</button>
                      {inv.status !== 'PAID' && inv.status !== 'VOID' && (
                        <button type="button" className="text-primary" onClick={() => handlePaymentLink(inv.id)}>Payment link</button>
                      )}
                      {inv.paymentLink && (
                        <a href={inv.paymentLink} target="_blank" rel="noreferrer" className="text-primary">Open link</a>
                      )}
                      {inv.status !== 'PAID' && (
                        <button type="button" className="text-red-500" onClick={() => handleDelete(inv)}>Delete</button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </GlassCard>
      )}

      <AdesiaModal opened={Boolean(editInvoice)} onClose={() => setEditInvoice(null)} title="Edit invoice">
        {editInvoice && (
          <form className="space-y-3" onSubmit={handleSaveEdit}>
            <select value={editInvoice.plan} onChange={(e) => setEditInvoice({ ...editInvoice, plan: e.target.value })} className="w-full rounded-xl border border-border/60 px-3 py-2 text-sm">
              {PLANS.map((p) => <option key={p} value={p}>{p}</option>)}
            </select>
            <input type="number" value={editInvoice.amount} onChange={(e) => setEditInvoice({ ...editInvoice, amount: e.target.value })} className="w-full rounded-xl border border-border/60 px-3 py-2 text-sm" />
            <input value={editInvoice.description ?? ''} onChange={(e) => setEditInvoice({ ...editInvoice, description: e.target.value })} className="w-full rounded-xl border border-border/60 px-3 py-2 text-sm" placeholder="Description" />
            <select value={editInvoice.status} onChange={(e) => setEditInvoice({ ...editInvoice, status: e.target.value })} className="w-full rounded-xl border border-border/60 px-3 py-2 text-sm">
              {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
            <GradientButton type="submit">Save changes</GradientButton>
          </form>
        )}
      </AdesiaModal>
    </>
  );
};

export default InvoicesPage;
