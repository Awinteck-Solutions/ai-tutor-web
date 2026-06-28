import { Outlet } from 'react-router-dom';
import { PageHeader } from '../../../shared/components/PageShell';
import PlatformMarketplaceNav from '../components/PlatformMarketplaceNav';
import { usePlatformMarketplaceWorkspace } from '../hooks/usePlatformMarketplaceWorkspace';

export default function PlatformMarketplaceLayout() {
  const workspaceState = usePlatformMarketplaceWorkspace();

  return (
    <div className="min-w-0 space-y-6">
      <PageHeader
        title="Marketplace"
        description="Manage catalog listings, create lessons from materials, and track marketplace performance."
      />
      <PlatformMarketplaceNav />
      <Outlet context={workspaceState} />
    </div>
  );
}
