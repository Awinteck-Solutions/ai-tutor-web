import { NavLink } from 'react-router-dom';
import { BarChart3, List, Sparkles } from 'lucide-react';
import { GlassCard } from '../../../shared/components/GlassCard';
import {
  platformMarketplaceAnalyticsPath,
  platformMarketplaceCreatePath,
  platformMarketplaceLessonsPath,
} from '../platform.paths';

const TABS = [
  { label: 'Listings', path: platformMarketplaceLessonsPath, icon: List },
  { label: 'Create lesson', path: platformMarketplaceCreatePath, icon: Sparkles },
  { label: 'Analytics', path: platformMarketplaceAnalyticsPath, icon: BarChart3 },
];

export default function PlatformMarketplaceNav() {
  return (
    <GlassCard className="p-2">
      <nav className="flex flex-wrap gap-1">
        {TABS.map((tab) => {
          const Icon = tab.icon;
          return (
            <NavLink
              key={tab.path}
              to={tab.path}
              className={({ isActive }) =>
                `inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition ${
                  isActive
                    ? 'bg-primary/10 text-primary'
                    : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground'
                }`
              }
            >
              <Icon className="h-4 w-4 shrink-0" />
              {tab.label}
            </NavLink>
          );
        })}
      </nav>
    </GlassCard>
  );
}
