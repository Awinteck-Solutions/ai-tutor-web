import { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { notifications } from '@mantine/notifications';
import { Switch } from '@mantine/core';
import { PageHeader } from '../../../shared/components/PageShell';
import { GlassCard } from '../../../shared/components/GlassCard';
import { GradientButton, GhostButton } from '../../../shared/components/GradientButton';
import { PageLoader } from '../../../shared/components/PageLoader';
import { getErrorMessage } from '../../../shared/utils/formatters';
import {
  getUnsubscribePreferences,
  postUnsubscribePreferences,
} from '../services/email.services';

const PREF_LABELS = {
  reminders: 'Study reminders (quizzes, flashcards, lessons)',
  digest: 'Weekly progress digests',
  productUpdates: 'Product updates and new features',
  marketing: 'Marketing and announcements',
};

const EmailUnsubscribePage = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') ?? '';
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [email, setEmail] = useState('');
  const [prefs, setPrefs] = useState({
    reminders: true,
    digest: true,
    productUpdates: true,
    marketing: true,
  });

  useEffect(() => {
    if (!token) {
      setLoading(false);
      return;
    }
    getUnsubscribePreferences(token)
      .then((data) => {
        setEmail(data.user?.email ?? '');
        setPrefs({
          reminders: data.preferences.reminders,
          digest: data.preferences.digest,
          productUpdates: data.preferences.productUpdates,
          marketing: data.preferences.marketing,
        });
      })
      .catch((err) => {
        notifications.show({ title: 'Error', message: getErrorMessage(err), color: 'red' });
      })
      .finally(() => setLoading(false));
  }, [token]);

  const save = async (extra = {}) => {
    setSaving(true);
    try {
      const updated = await postUnsubscribePreferences({ token, ...prefs, ...extra });
      setPrefs({
        reminders: updated.reminders,
        digest: updated.digest,
        productUpdates: updated.productUpdates,
        marketing: updated.marketing,
      });
      notifications.show({ title: 'Saved', message: 'Email preferences updated', color: 'green' });
    } catch (err) {
      notifications.show({ title: 'Error', message: getErrorMessage(err), color: 'red' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <PageLoader />;

  if (!token) {
    return (
      <div className="mx-auto max-w-lg px-4 py-16">
        <GlassCard className="p-8 text-center">
          <h1 className="font-display text-xl font-bold">Invalid link</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            This unsubscribe link is missing or invalid.
          </p>
        </GlassCard>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-lg px-4 py-16">
      <PageHeader
        title="Email"
        gradientWord="preferences"
        description={email ? `Manage emails sent to ${email}` : 'Manage your email preferences'}
      />

      <GlassCard className="space-y-5 p-6">
        {Object.entries(PREF_LABELS).map(([key, label]) => (
          <Switch
            key={key}
            label={label}
            checked={prefs[key]}
            onChange={(e) => setPrefs({ ...prefs, [key]: e.currentTarget.checked })}
          />
        ))}

        <div className="flex flex-col gap-3 pt-2 sm:flex-row">
          <GradientButton type="button" disabled={saving} onClick={() => save()} className="!px-4 !py-2">
            {saving ? 'Saving…' : 'Save preferences'}
          </GradientButton>
          <GhostButton type="button" disabled={saving} onClick={() => save({ unsubscribeAll: true })} className="!px-4 !py-2">
            Unsubscribe from all engagement emails
          </GhostButton>
        </div>

        <p className="text-xs text-muted-foreground">
          Transactional emails (password reset, invitations) are always sent.{' '}
          <Link to="/login" className="text-primary underline">
            Sign in
          </Link>{' '}
          to manage preferences from your account settings.
        </p>
      </GlassCard>
    </div>
  );
};

export default EmailUnsubscribePage;
