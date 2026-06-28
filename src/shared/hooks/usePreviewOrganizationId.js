import { useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/** Auth org, or ?organizationId= for platform super-admin previews. */
export function usePreviewOrganizationId() {
  const { organizationId: authOrganizationId } = useAuth();
  const [searchParams] = useSearchParams();
  const queryOrganizationId = searchParams.get('organizationId');

  return useMemo(
    () => authOrganizationId ?? queryOrganizationId ?? null,
    [authOrganizationId, queryOrganizationId]
  );
}
