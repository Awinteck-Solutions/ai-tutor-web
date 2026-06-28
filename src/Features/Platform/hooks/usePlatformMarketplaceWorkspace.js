import { useEffect, useState } from 'react';
import { useAuth } from '../../../shared/context/AuthContext';
import { getAdminMarketplaceWorkspace } from '../../Marketplace/services/marketplace.services';

export function usePlatformMarketplaceWorkspace() {
  const { organizationId: userOrganizationId, organizationName: userOrganizationName } = useAuth();
  const [workspace, setWorkspace] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getAdminMarketplaceWorkspace()
      .then(setWorkspace)
      .catch(() => setWorkspace(null))
      .finally(() => setLoading(false));
  }, []);

  const organizationId = userOrganizationId ?? workspace?.organizationId ?? null;
  const organizationName = userOrganizationName ?? workspace?.organizationName ?? 'Adesia Platform';

  return {
    workspace,
    workspaceLoading: loading,
    organizationId,
    organizationName,
  };
}
