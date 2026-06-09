import { PageHeader } from '../../../shared/components/PageShell';
import LeaderboardPanel from '../components/LeaderboardPanel';

const StudentLeaderboardPage = () => (
  <>
    <PageHeader
      title="Leaderboard"
      gradientWord="Leaderboard"
      description="Compare XP with classmates and learners worldwide."
    />
    <LeaderboardPanel />
  </>
);

export default StudentLeaderboardPage;
