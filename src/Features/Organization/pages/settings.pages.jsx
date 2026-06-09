import { useEffect, useState } from 'react';
import { Tabs, TextInput } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { useAuth } from '../../../shared/context/AuthContext';
import { PageHeader } from '../../../shared/components/PageShell';
import { AdesiaBadge } from '../../../shared/components/AdesiaBadge';
import { PageLoader, EmptyOrgHint } from '../../../shared/components/PageLoader';
import { PageHeaderSkeleton } from '../../../shared/components/TableSkeleton';
import { GlassCard } from '../../../shared/components/GlassCard';
import { GradientButton } from '../../../shared/components/GradientButton';
import { updateProfile, changePassword } from '../../Auth/services/auth.service';
import { getErrorMessage } from '../../../shared/utils/formatters';
import { getOrganization, updateOrganization } from '../services/organization.services';

const SettingsPage = () => {
  const { organizationId, user, fetchProfile } = useAuth();
  const [activeTab, setActiveTab] = useState('organization');
  const [loading, setLoading] = useState(true);
  const [savingOrg, setSavingOrg] = useState(false);
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);
  const [orgForm, setOrgForm] = useState({ name: '', logo: '' });
  const [profileForm, setProfileForm] = useState({ firstName: '', lastName: '' });
  const [passwordForm, setPasswordForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });

  useEffect(() => {
    if (!organizationId) { setLoading(false); return; }
    getOrganization(organizationId)
      .then((org) => setOrgForm({ name: org?.name || '', logo: org?.logo || '' }))
      .catch((err) => notifications.show({ title: 'Error', message: getErrorMessage(err), color: 'red' }))
      .finally(() => setLoading(false));
  }, [organizationId]);

  useEffect(() => {
    if (user) {
      setProfileForm({ firstName: user.firstName || '', lastName: user.lastName || '' });
    }
  }, [user]);

  const handleSaveOrg = async () => {
    setSavingOrg(true);
    try {
      await updateOrganization(organizationId, { name: orgForm.name, logo: orgForm.logo || undefined });
      notifications.show({ title: 'Saved', message: 'Organization updated', color: 'green' });
    } catch (err) {
      notifications.show({ title: 'Error', message: getErrorMessage(err), color: 'red' });
    } finally {
      setSavingOrg(false);
    }
  };

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

  if (loading) return <PageLoader />;
  if (!organizationId) return <EmptyOrgHint />;

  return (
    <>
      <PageHeader
        title="Settings"
        gradientWord="Settings"
        description="Manage your organization profile and personal account."
      />

      <Tabs value={activeTab} onChange={setActiveTab}>
        <Tabs.List className="mb-6 flex-wrap gap-1 rounded-xl border border-border/50 bg-card/50 p-1">
          <Tabs.Tab value="organization">Organization</Tabs.Tab>
          <Tabs.Tab value="account">My account</Tabs.Tab>
        </Tabs.List>

        <Tabs.Panel value="organization">
          <GlassCard className="max-w-lg space-y-4 p-6">
            <div>
              <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-muted-foreground">Organization name</label>
              <TextInput value={orgForm.name} onChange={(e) => setOrgForm({ ...orgForm, name: e.target.value })} />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-muted-foreground">Logo URL</label>
              <TextInput value={orgForm.logo} onChange={(e) => setOrgForm({ ...orgForm, logo: e.target.value })} placeholder="https://..." />
            </div>
            <GradientButton type="button" onClick={handleSaveOrg} disabled={savingOrg} className="w-full justify-center">
              {savingOrg ? 'Saving…' : 'Save organization'}
            </GradientButton>
          </GlassCard>
        </Tabs.Panel>

        <Tabs.Panel value="account">
          <div className="grid gap-6 lg:grid-cols-2">
            <GlassCard className="space-y-4 p-6">
              <h3 className="font-display text-sm font-semibold">Profile</h3>
              <p className="text-xs text-muted-foreground">{user?.email}</p>
              <TextInput label="First name" value={profileForm.firstName} onChange={(e) => setProfileForm({ ...profileForm, firstName: e.target.value })} />
              <TextInput label="Last name" value={profileForm.lastName} onChange={(e) => setProfileForm({ ...profileForm, lastName: e.target.value })} />
              <div className="pt-1">
                <AdesiaBadge status="draft">{user?.role}</AdesiaBadge>
              </div>
              <GradientButton type="button" onClick={handleSaveProfile} disabled={savingProfile} className="w-full justify-center">
                {savingProfile ? 'Saving…' : 'Save profile'}
              </GradientButton>
            </GlassCard>

            <GlassCard className="space-y-4 p-6">
              <h3 className="font-display text-sm font-semibold">Change password</h3>
              <TextInput label="Current password" type="password" value={passwordForm.currentPassword} onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })} />
              <TextInput label="New password" type="password" value={passwordForm.newPassword} onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })} />
              <TextInput label="Confirm new password" type="password" value={passwordForm.confirmPassword} onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })} />
              <GradientButton type="button" onClick={handleChangePassword} disabled={savingPassword} className="w-full justify-center">
                {savingPassword ? 'Updating…' : 'Update password'}
              </GradientButton>
            </GlassCard>
          </div>
        </Tabs.Panel>
      </Tabs>
    </>
  );
};

export default SettingsPage;
