import { useEffect, useMemo, useState } from 'react';
import { TextInput, Switch, Select, MultiSelect, SegmentedControl } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { useTranslation } from 'react-i18next';
import { Bell, BookOpen, HelpCircle, Palette, User } from 'lucide-react';
import { useAuth } from '../../../shared/context/AuthContext';
import { EmptyOrgHint } from '../../../shared/components/PageLoader';
import { StudentSettingsSkeleton } from '../components/StudentPageSkeleton';
import { GlassCard } from '../../../shared/components/GlassCard';
import { GradientButton } from '../../../shared/components/GradientButton';
import { AdesiaBadge } from '../../../shared/components/AdesiaBadge';
import StudentOnboardingWizard from '../components/StudentOnboardingWizard';
import SettingsPageShell from '../../../shared/components/settings/SettingsPageShell';
import AppearanceSettingsSection from '../../../shared/components/settings/AppearanceSettingsSection';
import { updateProfile, changePassword, updateLearningProfile } from '../../Auth/services/auth.service';
import { getEmailPreferences, updateEmailPreferences } from '../../Email/services/email.services';
import { getErrorMessage } from '../../../shared/utils/formatters';
import {
  AGE_GROUPS,
  COUNTRIES,
  EDUCATION_LEVELS,
  LANGUAGE_OPTIONS,
  LEARNING_GOALS,
  STUDENT_LEVELS,
  getCountryLabel,
} from '../../../shared/constants/learningProfile.constants';

const EMAIL_PREF_KEYS = ['reminders', 'digest', 'productUpdates', 'marketing'];

const StudentSettingsPage = () => {
  const { t } = useTranslation(['settings', 'common']);
  const { organizationId, user, fetchProfile } = useAuth();
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('account');
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingLearningProfile, setSavingLearningProfile] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);
  const [savingEmailPrefs, setSavingEmailPrefs] = useState(false);
  const [tourOpen, setTourOpen] = useState(false);
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
  const [learningProfileForm, setLearningProfileForm] = useState({
    educationLevel: '',
    countryCode: '',
    studentLevel: 'intermediate',
    ageGroup: '',
    learningGoals: [],
    preferredLanguage: 'English',
  });

  const tabs = useMemo(
    () => [
      { value: 'account', label: t('tabs.account'), icon: <User className="h-4 w-4" /> },
      { value: 'learning', label: t('tabs.learning'), icon: <BookOpen className="h-4 w-4" /> },
      { value: 'notifications', label: t('tabs.notifications'), icon: <Bell className="h-4 w-4" /> },
      { value: 'appearance', label: t('tabs.appearance'), icon: <Palette className="h-4 w-4" /> },
      { value: 'help', label: t('tabs.help'), icon: <HelpCircle className="h-4 w-4" /> },
    ],
    [t]
  );

  useEffect(() => {
    if (user) {
      setProfileForm({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
      });

      const profile = user.learningProfile ?? {};
      const matchedCountry = COUNTRIES.find(
        (country) =>
          country.value === profile.countryCode || country.label === profile.country
      );

      setLearningProfileForm({
        educationLevel: profile.educationLevel || '',
        countryCode: matchedCountry?.value || profile.countryCode || '',
        studentLevel: profile.studentLevel || 'intermediate',
        ageGroup: profile.ageGroup || '',
        learningGoals: profile.learningGoals || [],
        preferredLanguage: profile.preferredLanguage || 'English',
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
      notifications.show({ title: t('messages.profileUpdated'), message: '', color: 'green' });
    } catch (err) {
      notifications.show({ title: t('common:error'), message: getErrorMessage(err), color: 'red' });
    } finally {
      setSavingProfile(false);
    }
  };

  const handleSaveLearningProfile = async () => {
    if (!learningProfileForm.educationLevel || !learningProfileForm.countryCode) {
      notifications.show({ title: t('learning.missing'), message: '', color: 'orange' });
      return;
    }

    setSavingLearningProfile(true);
    try {
      await updateLearningProfile({
        educationLevel: learningProfileForm.educationLevel,
        country: getCountryLabel(learningProfileForm.countryCode),
        countryCode: learningProfileForm.countryCode,
        studentLevel: learningProfileForm.studentLevel,
        ageGroup: learningProfileForm.ageGroup || undefined,
        learningGoals: learningProfileForm.learningGoals.length
          ? learningProfileForm.learningGoals
          : undefined,
        preferredLanguage: learningProfileForm.preferredLanguage || undefined,
      });
      await fetchProfile();
      notifications.show({ title: t('messages.learningUpdated'), message: '', color: 'green' });
    } catch (err) {
      notifications.show({ title: t('common:error'), message: getErrorMessage(err), color: 'red' });
    } finally {
      setSavingLearningProfile(false);
    }
  };

  const handleSaveEmailPrefs = async () => {
    setSavingEmailPrefs(true);
    try {
      await updateEmailPreferences(emailPrefs);
      notifications.show({ title: t('messages.emailUpdated'), message: '', color: 'green' });
    } catch (err) {
      notifications.show({ title: t('common:error'), message: getErrorMessage(err), color: 'red' });
    } finally {
      setSavingEmailPrefs(false);
    }
  };

  const handleChangePassword = async () => {
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      notifications.show({ title: t('password.mismatch'), message: '', color: 'red' });
      return;
    }
    setSavingPassword(true);
    try {
      await changePassword({
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
      });
      notifications.show({ title: t('messages.passwordChanged'), message: '', color: 'green' });
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      notifications.show({ title: t('common:error'), message: getErrorMessage(err), color: 'red' });
    } finally {
      setSavingPassword(false);
    }
  };

  if (loading) return <StudentSettingsSkeleton />;
  if (!organizationId) return <EmptyOrgHint />;

  const renderTab = (tab) => {
    if (tab === 'account') {
      return (
        <>
          <GlassCard className="space-y-4 p-4 sm:p-6 lg:col-span-2">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h3 className="font-display text-base font-semibold sm:text-lg">{t('profile.title')}</h3>
                <p className="mt-1 text-xs text-muted-foreground sm:text-sm">{user?.email}</p>
              </div>
              <AdesiaBadge status="active">Student</AdesiaBadge>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <TextInput
                label={t('profile.firstName')}
                value={profileForm.firstName}
                onChange={(e) => setProfileForm({ ...profileForm, firstName: e.target.value })}
              />
              <TextInput
                label={t('profile.lastName')}
                value={profileForm.lastName}
                onChange={(e) => setProfileForm({ ...profileForm, lastName: e.target.value })}
              />
            </div>
            <GradientButton
              type="button"
              disabled={savingProfile}
              onClick={handleSaveProfile}
              className="w-full !px-4 !py-2.5 sm:w-auto"
            >
              {savingProfile ? t('common:loading') : t('profile.save')}
            </GradientButton>
          </GlassCard>

          <GlassCard className="space-y-4 p-4 sm:p-6 lg:col-span-2">
            <h3 className="font-display text-base font-semibold sm:text-lg">{t('password.title')}</h3>
            <TextInput
              label={t('password.current')}
              type="password"
              value={passwordForm.currentPassword}
              onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
            />
            <div className="grid gap-4 sm:grid-cols-2">
              <TextInput
                label={t('password.new')}
                type="password"
                value={passwordForm.newPassword}
                onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
              />
              <TextInput
                label={t('password.confirm')}
                type="password"
                value={passwordForm.confirmPassword}
                onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
              />
            </div>
            <GradientButton
              type="button"
              disabled={savingPassword}
              onClick={handleChangePassword}
              className="w-full !px-4 !py-2.5 sm:w-auto"
            >
              {savingPassword ? t('common:loading') : t('password.save')}
            </GradientButton>
          </GlassCard>
        </>
      );
    }

    if (tab === 'learning') {
      return (
        <GlassCard className="space-y-4 p-4 sm:p-6 lg:col-span-2">
          <div>
            <h3 className="font-display text-base font-semibold sm:text-lg">{t('learning.title')}</h3>
            <p className="mt-1 text-sm text-muted-foreground">{t('learning.hint')}</p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <Select
              label={t('learning.educationLevel')}
              data={EDUCATION_LEVELS}
              value={learningProfileForm.educationLevel}
              onChange={(value) =>
                setLearningProfileForm({ ...learningProfileForm, educationLevel: value ?? '' })
              }
              searchable
            />
            <Select
              label={t('learning.country')}
              data={COUNTRIES}
              value={learningProfileForm.countryCode}
              onChange={(value) =>
                setLearningProfileForm({ ...learningProfileForm, countryCode: value ?? '' })
              }
              searchable
            />
          </div>
          <div>
            <p className="mb-2 text-sm font-medium">{t('learning.difficulty')}</p>
            <SegmentedControl
              fullWidth
              value={learningProfileForm.studentLevel}
              onChange={(value) =>
                setLearningProfileForm({ ...learningProfileForm, studentLevel: value })
              }
              data={STUDENT_LEVELS.map((level) => ({ value: level.value, label: level.label }))}
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <Select
              label={t('learning.ageGroup')}
              data={AGE_GROUPS}
              value={learningProfileForm.ageGroup}
              onChange={(value) =>
                setLearningProfileForm({ ...learningProfileForm, ageGroup: value ?? '' })
              }
              clearable
            />
            <Select
              label={t('learning.language')}
              data={LANGUAGE_OPTIONS}
              value={learningProfileForm.preferredLanguage}
              onChange={(value) =>
                setLearningProfileForm({
                  ...learningProfileForm,
                  preferredLanguage: value ?? 'English',
                })
              }
            />
          </div>
          <MultiSelect
            label={t('learning.goals')}
            data={LEARNING_GOALS}
            value={learningProfileForm.learningGoals}
            onChange={(value) =>
              setLearningProfileForm({ ...learningProfileForm, learningGoals: value })
            }
            clearable
          />
          <GradientButton
            type="button"
            disabled={savingLearningProfile}
            onClick={handleSaveLearningProfile}
            className="w-full !px-4 !py-2.5 sm:w-auto"
          >
            {savingLearningProfile ? t('common:loading') : t('learning.save')}
          </GradientButton>
        </GlassCard>
      );
    }

    if (tab === 'notifications') {
      return (
        <GlassCard className="space-y-4 p-4 sm:p-6 lg:col-span-2">
          <div>
            <h3 className="font-display text-base font-semibold sm:text-lg">{t('emailPrefs.title')}</h3>
            <p className="mt-1 text-sm text-muted-foreground">{t('emailPrefs.hint')}</p>
          </div>
          {EMAIL_PREF_KEYS.map((key) => (
            <Switch
              key={key}
              label={t(`emailPrefs.${key}`)}
              checked={emailPrefs[key]}
              onChange={(e) => setEmailPrefs({ ...emailPrefs, [key]: e.currentTarget.checked })}
            />
          ))}
          <GradientButton
            type="button"
            disabled={savingEmailPrefs}
            onClick={handleSaveEmailPrefs}
            className="w-full !px-4 !py-2.5 sm:w-auto"
          >
            {savingEmailPrefs ? t('common:loading') : t('emailPrefs.save')}
          </GradientButton>
        </GlassCard>
      );
    }

    if (tab === 'appearance') {
      return <AppearanceSettingsSection />;
    }

    if (tab === 'help') {
      return (
        <GlassCard className="flex flex-col gap-4 p-4 sm:p-6 lg:col-span-2">
          <div>
            <h3 className="font-display text-base font-semibold sm:text-lg">{t('help.title')}</h3>
            <p className="mt-2 text-sm text-muted-foreground">{t('help.hint')}</p>
          </div>
          <GradientButton
            type="button"
            className="w-full !px-4 !py-2.5 sm:w-fit"
            onClick={() => setTourOpen(true)}
          >
            {t('help.replay')}
          </GradientButton>
        </GlassCard>
      );
    }

    return null;
  };

  return (
    <>
      <SettingsPageShell activeTab={activeTab} onTabChange={setActiveTab} tabs={tabs}>
        {renderTab}
      </SettingsPageShell>
      <StudentOnboardingWizard opened={tourOpen} onClose={() => setTourOpen(false)} />
    </>
  );
};

export default StudentSettingsPage;
