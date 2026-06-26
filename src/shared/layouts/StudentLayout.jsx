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
  Target,
  Trophy,
  Flag,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import StudentQuickActions from '../../Features/Student/components/StudentQuickActions';
import SetupWorkspaceBanner from '../../Features/Student/components/SetupWorkspaceBanner';
import StudentOnboardingWizard, {
  shouldShowStudentOnboarding,
} from '../../Features/Student/components/StudentOnboardingWizard';
import AppShell from './AppShell';
import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';

export const studentNavGroups = [
  {
    title: 'Home',
    items: [
      { label: 'Dashboard', path: '/student/dashboard', icon: LayoutDashboard, end: true },
    ],
  },
  {
    title: 'Study',
    items: [
      { label: 'Self-learn', path: '/student/self-learn', icon: Sparkles },
      { label: 'Lessons', path: '/student/lessons', icon: BookOpen },
      { label: 'Practice', path: '/student/practice', icon: Target },
    ],
  },
  {
    title: 'Tools',
    items: [
      { label: 'AI Chat', path: '/student/chat', icon: MessageSquare },
    ],
  },
  {
    title: 'Progress',
    items: [
      { label: 'Milestones', path: '/student/milestones', icon: Flag },
      { label: 'Achievements', path: '/student/achievements', icon: Award },
      { label: 'Leaderboard', path: '/student/leaderboard', icon: Trophy },
    ],
  },
  {
    title: 'Account',
    items: [
      { label: 'Subscription', path: '/student/subscription', icon: CreditCard },
      { label: 'Notifications', path: '/student/notifications', icon: Bell },
      { label: 'Settings', path: '/student/settings', icon: Settings },
    ],
  },
];

const OrgBanner = ({ organizationId }) =>
  !organizationId ? <SetupWorkspaceBanner /> : null;

const StudentLayout = () => {
  const { organizationId } = useAuth();
  const location = useLocation();
  const [onboardingOpen, setOnboardingOpen] = useState(false);

  useEffect(() => {
    if (!organizationId) return;
    const fromRegister = location.state?.showOnboarding === true;
    if (fromRegister || shouldShowStudentOnboarding()) {
      setOnboardingOpen(true);
    }
  }, [organizationId, location.state?.showOnboarding]);

  return (
    <>
      <AppShell
        navGroups={studentNavGroups}
        homePath="/student/dashboard"
        banner={<OrgBanner organizationId={organizationId} />}
      />
      <StudentQuickActions />
      <StudentOnboardingWizard
        opened={onboardingOpen}
        onClose={() => setOnboardingOpen(false)}
      />
    </>
  );
};

export default StudentLayout;
