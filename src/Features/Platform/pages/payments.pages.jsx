import { useCallback, useEffect, useState } from 'react';
import { notifications } from '@mantine/notifications';
import { PageHeader } from '../../../shared/components/PageShell';
import { GlassCard } from '../../../shared/components/GlassCard';
import { PageLoader } from '../../../shared/components/PageLoader';
import { GradientButton } from '../../../shared/components/GradientButton';
import { getErrorMessage } from '../../../shared/utils/formatters';
import {
  getPlatformPaymentSettings,
  updatePlatformPaymentSettings,
} from '../services/platform.services';

const PaymentsPage = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    stripeEnabled: false,
    stripePublishableKey: '',
    stripeSecretKey: '',
    stripeWebhookSecret: '',
    paystackEnabled: false,
    paystackPublicKey: '',
    paystackSecretKey: '',
    defaultProvider: 'STRIPE',
  });

  const reload = useCallback(() => {
    setLoading(true);
    getPlatformPaymentSettings()
      .then((data) => setForm((f) => ({ ...f, ...data, stripeSecretKey: '', stripeWebhookSecret: '', paystackSecretKey: '' })))
      .catch((err) => notifications.show({ title: 'Payments', message: getErrorMessage(err), color: 'red' }))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { reload(); }, [reload]);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = { ...form };
      if (!payload.stripeSecretKey) delete payload.stripeSecretKey;
      if (!payload.stripeWebhookSecret) delete payload.stripeWebhookSecret;
      if (!payload.paystackSecretKey) delete payload.paystackSecretKey;
      await updatePlatformPaymentSettings(payload);
      notifications.show({ title: 'Payments', message: 'Settings saved', color: 'green' });
      reload();
    } catch (err) {
      notifications.show({ title: 'Payments', message: getErrorMessage(err), color: 'red' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <PageLoader />;

  return (
    <>
      <PageHeader
        title="Payment"
        gradientWord="gateways"
        description="Configure Stripe and Paystack. Toggle either or both for invoice checkout."
      />

      <form onSubmit={handleSave} className="grid gap-6 lg:grid-cols-2">
        <GlassCard className="space-y-4 p-6">
          <div className="flex items-center justify-between">
            <h3 className="font-display font-semibold">Stripe</h3>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={form.stripeEnabled}
                onChange={(e) => setForm({ ...form, stripeEnabled: e.target.checked })}
              />
              Enabled
            </label>
          </div>
          <input
            className="w-full rounded-xl border border-border/60 bg-background px-3 py-2 text-sm"
            placeholder="Publishable key"
            value={form.stripePublishableKey}
            onChange={(e) => setForm({ ...form, stripePublishableKey: e.target.value })}
          />
          <input
            className="w-full rounded-xl border border-border/60 bg-background px-3 py-2 text-sm"
            placeholder={form.stripeSecretKeySet ? 'Secret key (leave blank to keep)' : 'Secret key'}
            value={form.stripeSecretKey}
            onChange={(e) => setForm({ ...form, stripeSecretKey: e.target.value })}
          />
          <input
            className="w-full rounded-xl border border-border/60 bg-background px-3 py-2 text-sm"
            placeholder={form.stripeWebhookSecretSet ? 'Webhook secret (leave blank to keep)' : 'Webhook secret'}
            value={form.stripeWebhookSecret}
            onChange={(e) => setForm({ ...form, stripeWebhookSecret: e.target.value })}
          />
          <p className="text-xs text-muted-foreground">Webhook URL: /billing/webhooks/stripe</p>
        </GlassCard>

        <GlassCard className="space-y-4 p-6">
          <div className="flex items-center justify-between">
            <h3 className="font-display font-semibold">Paystack</h3>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={form.paystackEnabled}
                onChange={(e) => setForm({ ...form, paystackEnabled: e.target.checked })}
              />
              Enabled
            </label>
          </div>
          <input
            className="w-full rounded-xl border border-border/60 bg-background px-3 py-2 text-sm"
            placeholder="Public key"
            value={form.paystackPublicKey}
            onChange={(e) => setForm({ ...form, paystackPublicKey: e.target.value })}
          />
          <input
            className="w-full rounded-xl border border-border/60 bg-background px-3 py-2 text-sm"
            placeholder={form.paystackSecretKeySet ? 'Secret key (leave blank to keep)' : 'Secret key'}
            value={form.paystackSecretKey}
            onChange={(e) => setForm({ ...form, paystackSecretKey: e.target.value })}
          />
          <p className="text-xs text-muted-foreground">Webhook URL: /billing/webhooks/paystack</p>
        </GlassCard>

        <GlassCard className="space-y-4 p-6 lg:col-span-2">
          <label className="block text-sm">
            <span className="mb-1 block text-muted-foreground">Default provider</span>
            <select
              value={form.defaultProvider}
              onChange={(e) => setForm({ ...form, defaultProvider: e.target.value })}
              className="rounded-xl border border-border/60 bg-background px-3 py-2 text-sm"
            >
              <option value="STRIPE">Stripe</option>
              <option value="PAYSTACK">Paystack</option>
            </select>
          </label>
          <GradientButton type="submit" disabled={saving}>{saving ? 'Saving…' : 'Save payment settings'}</GradientButton>
        </GlassCard>
      </form>
    </>
  );
};

export default PaymentsPage;
