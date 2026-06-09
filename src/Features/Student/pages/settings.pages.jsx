import { useEffect, useState } from 'react';
import { TextInput } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { useAuth } from '../../../shared/context/AuthContext';
import { PageHeader } from '../../../shared/components/PageShell';
import { EmptyOrgHint } from '../../../shared/components/PageLoader';
import { StudentSettingsSkeleton } from '../components/StudentPageSkeleton';
import { GlassCard } from '../../../shared/components/GlassCard';
import { GradientButton } from '../../../shared/components/GradientButton';
import { AdesiaBadge } from '../../../shared/components/AdesiaBadge';
import StudentOnboardingWizard from '../components/StudentOnboardingWizard';
import { updateProfile, changePassword } from '../../Auth/services/auth.service';
import { getErrorMessage } from '../../../shared/utils/formatters';

const StudentSettingsPage = () => {
  const { organizationId, user, fetchProfile } = useAuth();
  const [loading, setLoading] = useState(true);
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);
  const [tourOpen, setTourOpen] = useState(false);
  const [profileForm, setProfileForm] = useState({ firstName: '', lastName: '' });
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
    setLoading(false);
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

  if (loading) return <StudentSettingsSkeleton />;
  if (!organizationId) return <EmptyOrgHint />;

  return (
    <>
      <PageHeader
        title="Settings"
        gradientWord="Settings"
        description="Update your profile and account password."
      />

      <div className="grid gap-6 lg:grid-cols-2">
        <GlassCard className="space-y-4 p-6">
          <h3 className="font-display text-sm font-semibold text-foreground">Profile</h3>
          <p className="text-xs text-muted-foreground">{user?.email}</p>
          <AdesiaBadge status="active">Student</AdesiaBadge>
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
          <GradientButton
            type="button"
            disabled={savingProfile}
            onClick={handleSaveProfile}
            className="!px-4 !py-2"
          >
            {savingProfile ? 'Saving…' : 'Save profile'}
          </GradientButton>
        </GlassCard>

        <GlassCard className="space-y-4 p-6">
          <h3 className="font-display text-sm font-semibold text-foreground">Password</h3>
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
            disabled={savingPassword}
            onClick={handleChangePassword}
            className="!px-4 !py-2"
          >
            {savingPassword ? 'Updating…' : 'Change password'}
          </GradientButton>
        </GlassCard>

        <GlassCard className="flex flex-col gap-4 p-6">
          <h3 className="font-display text-sm font-semibold text-foreground">Help</h3>
          <p className="text-sm text-muted-foreground">
            Replay the guided tour to learn how Self-learn, Practice, and subscriptions work.
          </p>
          <GradientButton type="button" className="w-fit !px-4 !py-2" onClick={() => setTourOpen(true)}>
            Replay onboarding tour
          </GradientButton>
        </GlassCard>
      </div>

      <StudentOnboardingWizard opened={tourOpen} onClose={() => setTourOpen(false)} />
    </>
  );
};

export default StudentSettingsPage;
