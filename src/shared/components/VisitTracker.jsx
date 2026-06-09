import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { recordVisit } from '../../Features/Platform/services/platform.services';

const detectPortal = (pathname) => {
  if (pathname.startsWith('/platform')) return 'platform';
  if (pathname.startsWith('/admin')) return 'admin';
  if (pathname.startsWith('/teacher')) return 'teacher';
  if (pathname.startsWith('/student')) return 'student';
  if (pathname.startsWith('/marketing') || pathname === '/') return 'marketing';
  if (pathname.startsWith('/login') || pathname.startsWith('/register')) return 'auth';
  return 'public';
};

const VisitTracker = () => {
  const location = useLocation();
  const { user } = useAuth();

  useEffect(() => {
    const portal = detectPortal(location.pathname);
    recordVisit({
      path: location.pathname + location.search,
      referrer: document.referrer || undefined,
      portal,
    }).catch(() => {
      /* analytics should not break navigation */
    });
  }, [location.pathname, location.search, user?.id]);

  return null;
};

export default VisitTracker;
