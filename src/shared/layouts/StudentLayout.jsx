import {
  Award,
  Bell,
  BookOpen,
  Brain,
  CreditCard,
  LayoutDashboard,
  MessageSquare,
  Settings,
  Sparkles,
  Store,
  Target,
  Trophy,
  Flag,
} from 'lucide-react';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import StudentQuickActions from '../../Features/Student/components/StudentQuickActions';
import SetupWorkspaceBanner from '../../Features/Student/components/SetupWorkspaceBanner';
import StudentOnboardingWizard, {
  shouldShowStudentOnboarding,
} from '../../Features/Student/components/StudentOnboardingWizard';
import StudentLearningProfileSetup from '../../Features/Student/components/StudentLearningProfileSetup';
import AppShell from './AppShell';
import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';

export const buildStudentNavGroups = (t) => [
  {
    title: 'Home',
    items: [
      { label: t('student.dashboard'), path: '/student/dashboard', icon: LayoutDashboard, end: true },
    ],
  },
  {
    title: 'Study',
    items: [
      { label: t('student.selfLearn'), path: '/student/self-learn', icon: Sparkles },
      { label: t('student.lessons'), path: '/student/lessons', icon: BookOpen },
      { label: t('student.marketplace'), path: '/student/marketplace', icon: Store },
      { label: t('student.practice'), path: '/student/practice', icon: Target },
    ],
  },
  {
    title: 'Tools',
    items: [
      { label: t('student.chat'), path: '/student/chat', icon: MessageSquare },
    ],
  },
  {
    title: 'Progress',
    items: [
      { label: t('student.analyse'), path: '/student/analyse', icon: Brain },
      { label: t('student.milestones'), path: '/student/milestones', icon: Flag },
      { label: t('student.achievements'), path: '/student/achievements', icon: Award },
      { label: t('student.leaderboard'), path: '/student/leaderboard', icon: Trophy },
    ],
  },
  {
    title: 'Account',
    items: [
      { label: t('student.subscription'), path: '/student/subscription', icon: CreditCard },
      { label: t('student.notifications'), path: '/student/notifications', icon: Bell },
      { label: t('student.settings'), path: '/student/settings', icon: Settings },
    ],
  },
];

/** @deprecated use buildStudentNavGroups inside layout */
export const studentNavGroups = [];

const OrgBanner = ({ organizationId }) =>
  !organizationId ? <SetupWorkspaceBanner /> : null;

const StudentLayout = () => {
  const { t } = useTranslation('nav');
  const { organizationId, user, isStudent, fetchProfile } = useAuth();
  const navGroups = useMemo(() => buildStudentNavGroups(t), [t]);
  const location = useLocation();
  const [profileSetupOpen, setProfileSetupOpen] = useState(false);
  const [onboardingOpen, setOnboardingOpen] = useState(false);
  const [pendingOnboarding, setPendingOnboarding] = useState(false);

  useEffect(() => {
    if (!isStudent || !user) return;

    const wantsTour =
      location.state?.showOnboarding === true || shouldShowStudentOnboarding();

    if (user.needsLearningProfileSetup) {
      setProfileSetupOpen(true);
      if (wantsTour) {
        setPendingOnboarding(true);
      }
      return;
    }

    setProfileSetupOpen(false);
    if (organizationId && wantsTour) {
      setOnboardingOpen(true);
    }
  }, [
    isStudent,
    user,
    user?.needsLearningProfileSetup,
    organizationId,
    location.state?.showOnboarding,
  ]);

  const handleProfileSetupComplete = async () => {
    await fetchProfile();
    setProfileSetupOpen(false);
    if (pendingOnboarding && organizationId) {
      setOnboardingOpen(true);
    }
    setPendingOnboarding(false);
  };

  return (
    <>
      <AppShell
        navGroups={navGroups}
        homePath="/student/dashboard"
        banner={<OrgBanner organizationId={organizationId} />}
      />
      <StudentQuickActions />
      <StudentLearningProfileSetup
        opened={profileSetupOpen}
        initialProfile={user?.learningProfile}
        onComplete={handleProfileSetupComplete}
      />
      <StudentOnboardingWizard
        opened={onboardingOpen}
        onClose={() => setOnboardingOpen(false)}
      />
    </>
  );
};

export default StudentLayout;
