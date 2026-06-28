/** Client-side platform portal paths (React Router). */
export const platformUserPreviewPath = (userId) =>
  `/platform/users/${userId}/preview`;

export const platformOrganizationPreviewPath = (organizationId) =>
  `/platform/organizations/${organizationId}/preview`;

export const platformMarketplaceLessonsPath = '/platform/marketplace/lessons';
export const platformMarketplaceCreatePath = '/platform/marketplace/create';
export const platformMarketplaceAnalyticsPath = '/platform/marketplace/analytics';
export const platformMarketplaceStudentViewPath = (idOrSlug) =>
  `/platform/marketplace/view/${idOrSlug}`;

export const platformContentPath = ({ organizationId, type = 'lessons' } = {}) => {
  const params = new URLSearchParams();
  if (organizationId) params.set('organizationId', organizationId);
  if (type) params.set('type', type);
  const query = params.toString();
  return query ? `/platform/content?${query}` : '/platform/content';
};

export const platformLessonPreviewPath = (lessonId, organizationId) => {
  const query = organizationId ? `?organizationId=${organizationId}` : '';
  return `/platform/content/lessons/${lessonId}/preview${query}`;
};

export const platformMaterialPreviewPath = (materialId, organizationId) => {
  const query = organizationId ? `?organizationId=${organizationId}` : '';
  return `/platform/content/materials/${materialId}/preview${query}`;
};

/**
 * Rewrite student/admin/teacher links into /platform routes for super-admin UI.
 */
export const resolvePlatformPortalLink = (rawPath, { organizationId } = {}) => {
  const path = toRelativeAppPath(rawPath);
  const { pathname } = splitPath(path);

  if (pathname.startsWith('/platform/') || pathname.startsWith('/email/')) {
    return path;
  }

  const studentMarketplace = pathname.match(/^\/student\/marketplace\/([^/]+)$/);
  if (studentMarketplace) {
    return platformMarketplaceStudentViewPath(studentMarketplace[1]);
  }

  const adminLesson = pathname.match(/^\/admin\/lessons\/([^/]+)\/preview$/);
  if (adminLesson) {
    return platformLessonPreviewPath(adminLesson[1], organizationId);
  }

  const adminMaterial = pathname.match(/^\/admin\/materials\/([^/]+)\/preview$/);
  if (adminMaterial) {
    return platformMaterialPreviewPath(adminMaterial[1], organizationId);
  }

  const teacherLesson = pathname.match(/^\/teacher\/lessons\/([^/]+)\/preview$/);
  if (teacherLesson) {
    return platformLessonPreviewPath(teacherLesson[1], organizationId);
  }

  if (pathname.includes('/materials')) {
    return platformContentPath({ organizationId, type: 'materials' });
  }

  if (pathname.includes('/lessons')) {
    return platformContentPath({ organizationId, type: 'lessons' });
  }

  if (organizationId && pathname.startsWith('/admin/')) {
    return platformOrganizationPreviewPath(organizationId);
  }

  return path;
};

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

  const studentMarketplace = pathname.match(/^\/student\/marketplace\/([^/]+)$/);
  if (studentMarketplace) {
    return platformMarketplaceStudentViewPath(studentMarketplace[1]);
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
