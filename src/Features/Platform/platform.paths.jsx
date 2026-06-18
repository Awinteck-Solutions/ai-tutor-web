/** Client-side platform portal paths (React Router). */
export const platformUserPreviewPath = (userId) =>
  `/platform/users/${userId}/preview`;

export const platformOrganizationPreviewPath = (organizationId) =>
  `/platform/organizations/${organizationId}/preview`;

/** Normalize API paths that may still be absolute URLs. */
export const toRelativeAppPath = (path) => {
  if (!path) return '/';
  if (path.startsWith('/')) return path;
  try {
    const url = new URL(path);
    return `${url.pathname}${url.search}${url.hash}`;
  } catch {
    return path.startsWith('/') ? path : `/${path}`;
  }
};

/**
 * Map portal routes to pages a platform admin can open in-app
 * (student/teacher/admin portals require those roles otherwise).
 */
export const resolvePreviewPortalLink = (rawPath, { userId, organizationId } = {}) => {
  const path = toRelativeAppPath(rawPath);
  const { pathname } = splitPath(path);

  if (pathname.startsWith('/platform/') || pathname.startsWith('/email/')) {
    return path;
  }

  if (organizationId) {
    if (pathname.startsWith('/admin/')) {
      if (pathname.includes('/materials')) {
        return `/platform/content?organizationId=${organizationId}&type=materials`;
      }
      if (pathname.includes('/lessons')) {
        return `/platform/content?organizationId=${organizationId}&type=lessons`;
      }
      return platformOrganizationPreviewPath(organizationId);
    }

    if (pathname.startsWith('/teacher/materials')) {
      return `/platform/content?organizationId=${organizationId}&type=materials`;
    }
    if (pathname.startsWith('/teacher/lessons')) {
      return `/platform/content?organizationId=${organizationId}&type=lessons`;
    }
    if (pathname.startsWith('/teacher/')) {
      return platformOrganizationPreviewPath(organizationId);
    }
  }

  if (pathname.startsWith('/student/')) {
    const tab = pathname.includes('/chat')
      ? 'comms'
      : pathname.includes('/subscription') || pathname.includes('/settings')
        ? 'overview'
        : 'learning';
    return userId ? `${platformUserPreviewPath(userId)}?tab=${tab}` : path;
  }

  if (pathname.startsWith('/teacher/students/') && userId) {
    const tab = pathname.includes('/analyse') ? 'learning' : 'overview';
    return `${platformUserPreviewPath(userId)}?tab=${tab}`;
  }

  if (pathname.startsWith('/teacher/') && userId) {
    return `${platformUserPreviewPath(userId)}?tab=learning`;
  }

  if (pathname.startsWith('/admin/') && organizationId) {
    return platformOrganizationPreviewPath(organizationId);
  }

  return path;
};

function splitPath(path) {
  const url = new URL(path, 'http://local');
  return { pathname: url.pathname };
}
