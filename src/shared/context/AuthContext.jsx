import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import api, { tokenStorage } from '../api/axios.instance';

const AuthContext = createContext(null);

const ADMIN_ROLES = ['SCHOOL_ADMIN', 'SUPER_ADMIN'];
const PLATFORM_ROLES = ['SUPER_ADMIN'];
const TEACHER_ROLES = ['TEACHER'];
const STUDENT_ROLES = ['STUDENT'];

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const organizationId = user?.organizationId ?? null;
  const organizationName = user?.organizationName ?? null;
  const isPersonalWorkspace = Boolean(user?.isPersonalWorkspace);
  const isSchoolStudent = Boolean(organizationId && !isPersonalWorkspace);

  const fetchProfile = useCallback(async () => {
    const token = tokenStorage.getAccessToken();
    if (!token) {
      setUser(null);
      setLoading(false);
      return null;
    }

    try {
      const { data } = await api.get('/auth/profile');
      const profile = data?.data ?? data;
      setUser(profile);
      return profile;
    } catch {
      tokenStorage.clear();
      setUser(null);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const login = useCallback(async (credentials) => {
    const { data } = await api.post('/auth/login', credentials);
    const payload = data?.data ?? data;
    tokenStorage.setTokens(payload.tokens);
    setUser(payload.user);
    const profile = await fetchProfile();
    return profile ?? payload.user;
  }, [fetchProfile]);

  const register = useCallback(async (payload) => {
    const { data } = await api.post('/auth/register', payload);
    const result = data?.data ?? data;
    tokenStorage.setTokens(result.tokens);
    setUser(result.user);
    const profile = await fetchProfile();
    return profile ?? result.user;
  }, [fetchProfile]);

  const loginWithGoogle = useCallback(async (credential) => {
    const { data } = await api.post('/auth/google', { credential });
    const payload = data?.data ?? data;
    tokenStorage.setTokens(payload.tokens);
    setUser(payload.user);
    const profile = await fetchProfile();
    return profile ?? payload.user;
  }, [fetchProfile]);

  const logout = useCallback(async () => {
    const refreshToken = tokenStorage.getRefreshToken();
    try {
      if (refreshToken) {
        await api.post('/auth/logout', { refreshToken });
      }
    } catch {
      // ignore logout errors
    } finally {
      tokenStorage.clear();
      setUser(null);
    }
  }, []);

  const getPortalPath = useCallback((role) => {
    if (role === 'SUPER_ADMIN') return '/platform/dashboard';
    if (ADMIN_ROLES.includes(role)) return '/admin/dashboard';
    if (TEACHER_ROLES.includes(role)) return '/teacher/dashboard';
    if (STUDENT_ROLES.includes(role)) return '/student/dashboard';
    return '/login';
  }, []);

  const value = useMemo(
    () => ({
      user,
      loading,
      organizationId,
      organizationName,
      isPersonalWorkspace,
      isSchoolStudent,
      isAdmin: user ? ADMIN_ROLES.includes(user.role) : false,
      isPlatformAdmin: user ? PLATFORM_ROLES.includes(user.role) : false,
      isTeacher: user ? TEACHER_ROLES.includes(user.role) : false,
      isStudent: user ? STUDENT_ROLES.includes(user.role) : false,
      login,
      loginWithGoogle,
      register,
      logout,
      fetchProfile,
      getPortalPath,
      adminRoles: ADMIN_ROLES,
      teacherRoles: TEACHER_ROLES,
      studentRoles: STUDENT_ROLES,
    }),
    [user, loading, organizationId, organizationName, isPersonalWorkspace, isSchoolStudent, login, loginWithGoogle, register, logout, fetchProfile, getPortalPath]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
