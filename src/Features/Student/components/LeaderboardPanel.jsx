import { useEffect, useState } from 'react';
import { Tabs } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { Medal, Trophy } from 'lucide-react';
import { useAuth } from '../../../shared/context/AuthContext';
import { GlassCard } from '../../../shared/components/GlassCard';
import { formatNumber, getErrorMessage } from '../../../shared/utils/formatters';
import { LeaderboardSkeleton } from '../../../shared/components/LoadingPrimitives';
import { getLeaderboard } from '../services/student.services';

const rankStyle = (rank) => {
  if (rank === 1) return 'text-amber-800 dark:text-amber-400';
  if (rank === 2) return 'text-slate-600 dark:text-slate-400';
  if (rank === 3) return 'text-orange-800 dark:text-amber-600';
  return 'text-muted-foreground';
};

const LeaderboardPanel = ({ compact = false }) => {
  const {
    organizationId,
    user,
    isPersonalWorkspace,
    organizationName,
  } = useAuth();
  const showSchoolRank = Boolean(organizationId && !isPersonalWorkspace);
  const [scope, setScope] = useState(showSchoolRank ? 'organization' : 'global');
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!showSchoolRank && scope === 'organization') {
      setScope('global');
    }
  }, [showSchoolRank, scope]);

  useEffect(() => {
    if (!organizationId) return undefined;
    setLoading(true);
    getLeaderboard(organizationId, scope)
      .then(setData)
      .catch((err) => notifications.show({ title: 'Error', message: getErrorMessage(err), color: 'red' }))
      .finally(() => setLoading(false));
    return undefined;
  }, [organizationId, scope]);

  const entries = (compact ? data?.entries?.slice(0, 5) : data?.entries) ?? [];
  const isMe = (entry) => entry.userId === user?.id || entry.userId === user?._id;
  const schoolTabLabel = organizationName ? organizationName : 'My school';

  return (
    <GlassCard className="min-w-0 overflow-hidden p-4 sm:p-6">
      <div className="mb-4 flex items-center gap-2">
        <Trophy className="h-5 w-5 shrink-0 text-primary" />
        <h3 className="font-display text-sm font-semibold text-foreground">Leaderboard</h3>
      </div>

      {showSchoolRank ? (
        <Tabs value={scope} onChange={setScope}>
          <Tabs.List className="mb-4 flex max-w-full flex-wrap gap-1 overflow-x-auto rounded-xl border border-border/50 bg-card/50 p-1">
            <Tabs.Tab value="organization" className="max-w-[10rem] truncate sm:max-w-none" title={schoolTabLabel}>
              {schoolTabLabel}
            </Tabs.Tab>
            <Tabs.Tab value="global">Global</Tabs.Tab>
          </Tabs.List>
        </Tabs>
      ) : (
        <p className="mb-4 text-xs text-muted-foreground">Global rankings</p>
      )}

      {data?.myRank && (
        <div className="mb-4 min-w-0 rounded-xl border border-primary/30 bg-primary/10 px-4 py-3 text-sm">
          <span className="text-muted-foreground">Your rank: </span>
          <span className="font-bold text-primary">#{data.myRank.rank}</span>
          <span className="text-muted-foreground"> · </span>
          <span className="font-medium">{formatNumber(data.myRank.totalXp)} XP</span>
        </div>
      )}

      {loading ? (
        <LeaderboardSkeleton compact={compact} />
      ) : entries.length ? (
        <ul className="space-y-2">
          {entries.map((entry) => (
            <li
              key={`${entry.userId}-${entry.rank}`}
              className={`flex min-w-0 items-center gap-2 rounded-xl border px-3 py-2.5 sm:gap-3 sm:px-4 ${
                isMe(entry)
                  ? 'border-primary/40 bg-primary/10'
                  : 'border-border/50 bg-muted/20'
              }`}
            >
              <Medal className={`h-4 w-4 shrink-0 ${rankStyle(entry.rank)}`} />
              <span className={`w-5 shrink-0 text-sm font-bold tabular-nums sm:w-6 ${rankStyle(entry.rank)}`}>
                {entry.rank}
              </span>
              <span className="min-w-0 flex-1 truncate text-sm font-medium text-foreground">
                {entry.name}
                {isMe(entry) && <span className="text-muted-foreground"> (you)</span>}
              </span>
              <span className="shrink-0 text-xs font-semibold tabular-nums text-primary sm:text-sm">
                {formatNumber(entry.totalXp)} XP
              </span>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-sm text-muted-foreground">No XP earned yet — be the first on the board.</p>
      )}
    </GlassCard>
  );
};

export default LeaderboardPanel;
