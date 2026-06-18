import { useEffect, useState } from 'react';
import { TextInput, Switch } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { useAuth } from '../../../shared/context/AuthContext';
import { PageHeader } from '../../../shared/components/PageShell';
import { PageLoader, EmptyOrgHint } from '../../../shared/components/PageLoader';
import { GlassCard } from '../../../shared/components/GlassCard';
import { GradientButton } from '../../../shared/components/GradientButton';
import { AdesiaBadge } from '../../../shared/components/AdesiaBadge';
import { updateProfile, changePassword } from '../../Auth/services/auth.service';
import { getEmailPreferences, updateEmailPreferences } from '../../Email/services/email.services';
import { getErrorMessage } from '../../../shared/utils/formatters';

const EMAIL_PREF_LABELS = {
  reminders: 'Class & content reminders',
  digest: 'Weekly digest',
  productUpdates: 'Product updates',
  marketing: 'Marketing emails',
};

const TeacherSettingsPage = () => {
  const { organizationId, user, fetchProfile } = useAuth();
  const [loading, setLoading] = useState(true);
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);
  const [savingEmailPrefs, setSavingEmailPrefs] = useState(false);
  const [profileForm, setProfileForm] = useState({ firstName: '', lastName: '' });
  const [emailPrefs, setEmailPrefs] = useState({
    reminders: true,
    digest: true,
    productUpdates: true,
    marketing: true,
  });
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  useEffect(() => {
    if (user) {
      setProfileForm({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
      });
    }
    getEmailPreferences()
      .then((prefs) => {
        setEmailPrefs({
          reminders: prefs.reminders,
          digest: prefs.digest,
          productUpdates: prefs.productUpdates,
          marketing: prefs.marketing,
        });
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [user]);

  const handleSaveProfile = async () => {
    setSavingProfile(true);
    try {
      await updateProfile(profileForm);
      await fetchProfile();
      notifications.show({ title: 'Saved', message: 'Profile updated', color: 'green' });
    } catch (err) {
      notifications.show({ title: 'Error', message: getErrorMessage(err), color: 'red' });
    } finally {
      setSavingProfile(false);
    }
  };

  const handleSaveEmailPrefs = async () => {
    setSavingEmailPrefs(true);
    try {
      await updateEmailPreferences(emailPrefs);
      notifications.show({ title: 'Saved', message: 'Email preferences updated', color: 'green' });
    } catch (err) {
      notifications.show({ title: 'Error', message: getErrorMessage(err), color: 'red' });
    } finally {
      setSavingEmailPrefs(false);
    }
  };

  const handleChangePassword = async () => {
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      notifications.show({ title: 'Error', message: 'Passwords do not match', color: 'red' });
      return;
    }
    setSavingPassword(true);
    try {
      await changePassword({
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
      });
      notifications.show({ title: 'Saved', message: 'Password changed', color: 'green' });
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      notifications.show({ title: 'Error', message: getErrorMessage(err), color: 'red' });
    } finally {
      setSavingPassword(false);
    }
  };

  if (loading) return <PageLoader />;
  if (!organizationId) return <EmptyOrgHint />;

  return (
    <>
      <PageHeader
        title="Settings"
        gradientWord="Settings"
        description="Update your profile, password, and email preferences."
      />

      <div className="grid gap-6 lg:grid-cols-2">
        <GlassCard className="space-y-4 p-6">
          <h3 className="font-display text-sm font-semibold">Profile</h3>
          <p className="text-xs text-muted-foreground">{user?.email}</p>
          <TextInput
            label="First name"
            value={profileForm.firstName}
            onChange={(e) => setProfileForm({ ...profileForm, firstName: e.target.value })}
          />
          <TextInput
            label="Last name"
            value={profileForm.lastName}
            onChange={(e) => setProfileForm({ ...profileForm, lastName: e.target.value })}
          />
          <div className="pt-1">
            <AdesiaBadge status="ready">{user?.role}</AdesiaBadge>
          </div>
          <GradientButton
            type="button"
            onClick={handleSaveProfile}
            disabled={savingProfile}
            className="w-full justify-center"
          >
            {savingProfile ? 'Saving…' : 'Save profile'}
          </GradientButton>
        </GlassCard>

        <GlassCard className="space-y-4 p-6">
          <h3 className="font-display text-sm font-semibold">Change password</h3>
          <TextInput
            label="Current password"
            type="password"
            value={passwordForm.currentPassword}
            onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
          />
          <TextInput
            label="New password"
            type="password"
            value={passwordForm.newPassword}
            onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
          />
          <TextInput
            label="Confirm new password"
            type="password"
            value={passwordForm.confirmPassword}
            onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
          />
          <GradientButton
            type="button"
            onClick={handleChangePassword}
            disabled={savingPassword}
            className="w-full justify-center"
          >
            {savingPassword ? 'Updating…' : 'Update password'}
          </GradientButton>
        </GlassCard>

        <GlassCard className="space-y-4 p-6 lg:col-span-2">
          <h3 className="font-display text-sm font-semibold">Email preferences</h3>
          <p className="text-xs text-muted-foreground">
            Transactional emails (password reset, invitations) are always sent.
          </p>
          {Object.entries(EMAIL_PREF_LABELS).map(([key, label]) => (
            <Switch
              key={key}
              label={label}
              checked={emailPrefs[key]}
              onChange={(e) => setEmailPrefs({ ...emailPrefs, [key]: e.currentTarget.checked })}
            />
          ))}
          <GradientButton
            type="button"
            disabled={savingEmailPrefs}
            onClick={handleSaveEmailPrefs}
            className="w-full justify-center sm:w-auto"
          >
            {savingEmailPrefs ? 'Saving…' : 'Save email preferences'}
          </GradientButton>
        </GlassCard>
      </div>
    </>
  );
};

export default TeacherSettingsPage;
