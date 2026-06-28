import { useEffect, useState } from 'react';
import { notifications } from '@mantine/notifications';
import { Award, Flame, Lock, Target, Zap } from 'lucide-react';
import { useAuth } from '../../../shared/context/AuthContext';
import { PageHeader } from '../../../shared/components/PageShell';
import { CardGridSkeleton, PageHeaderSkeleton } from '../../../shared/components/TableSkeleton';
import { GlassCard } from '../../../shared/components/GlassCard';
import { AdesiaBadge } from '../../../shared/components/AdesiaBadge';
import { StatCard } from '../../../shared/components/AdesiaBadge';
import { formatNumber, getErrorMessage } from '../../../shared/utils/formatters';
import { getAchievements } from '../services/student.services';

const StudentAchievementsPage = () => {
  const [data, setData] = useState({ achievements: [], stats: null });
  const [loading, setLoading] = useState(true);
  const { organizationId } = useAuth();

  useEffect(() => {
    if (!organizationId) { setLoading(false); return; }
    getAchievements(organizationId)
      .then((res) => setData({
        achievements: res?.achievements ?? [],
        stats: res?.stats ?? null,
      }))
      .catch((err) => notifications.show({ title: 'Error', message: getErrorMessage(err), color: 'red' }))
      .finally(() => setLoading(false));
  }, [organizationId]);

  const stats = data.stats;
  const unlockedCount = data.achievements.filter((a) => a.unlocked).length;

  return (
    <>
      {loading ? <PageHeaderSkeleton /> : (
        <PageHeader
          title="Achievements"
          gradientWord="Achievements"
          description="Unlock badges as you learn — you will get a notification when each one unlocks."
        />
      )}

      {!loading && stats && (
        <div className="mb-6 grid grid-cols-2 gap-2.5 sm:gap-4 sm:grid-cols-4">
          <StatCard icon={Zap} label="Total XP" value={formatNumber(stats.totalXp)} highlight />
          <StatCard icon={Award} label="Unlocked" value={`${unlockedCount}/${data.achievements.length}`} />
          <StatCard icon={Target} label="Quizzes" value={formatNumber(stats.quizzesTaken)} />
          <StatCard icon={Flame} label="Streak" value={formatNumber(stats.currentStreak)} />
        </div>
      )}

      <div className="grid min-w-0 gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3">
        {loading ? <CardGridSkeleton count={6} /> : data.achievements.map((a) => (
          <GlassCard
            key={a.id}
            className={`flex min-w-0 items-start gap-3 p-4 transition sm:gap-4 sm:p-6 ${
              a.unlocked ? 'border-primary/30' : 'opacity-75'
            }`}
          >
            <div
              className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl sm:h-12 sm:w-12 ${
                a.unlocked ? 'bg-primary/15 text-primary' : 'bg-muted text-muted-foreground'
              }`}
            >
              {a.unlocked ? <Award className="h-5 w-5 sm:h-6 sm:w-6" /> : <Lock className="h-4 w-4 sm:h-5 sm:w-5" />}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-start gap-x-2 gap-y-1">
                <p className="line-clamp-2 min-w-0 flex-1 font-display font-semibold leading-snug text-foreground">{a.title}</p>
                <AdesiaBadge status={a.unlocked ? 'active' : 'draft'}>
                  {a.unlocked ? 'Unlocked' : 'Locked'}
                </AdesiaBadge>
              </div>
              <p className="mt-1 line-clamp-3 text-sm text-muted-foreground">{a.description}</p>
            </div>
          </GlassCard>
        ))}
      </div>
    </>
  );
};

export default StudentAchievementsPage;
