import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { ArrowRight, Mail, Lock } from 'lucide-react';
import { notifications } from '@mantine/notifications';
import { AdesiaLogo } from '../../../shared/components/AdesiaLogo';
import { GlowOrbs } from '../../../shared/components/GlowOrbs';
import { GlassCard } from '../../../shared/components/GlassCard';
import { GradientText } from '../../../shared/components/GradientText';
import { GradientButton, GhostButton } from '../../../shared/components/GradientButton';
import { ThemeToggle } from '../../../shared/components/ThemeToggle';
import { useAuth } from '../../../shared/context/AuthContext';
import { capitalizeWords } from '../../../utils/page.helper';
import { ForgetPasswordModal } from '../components/modals/forgetPasswordModal';

const LoginPage = () => {
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();
  const { login, getPortalPath, user } = useAuth();

  useEffect(() => {
    if (user) navigate(getPortalPath(user.role), { replace: true });
  }, [user, navigate, getPortalPath]);

  const formik = useFormik({
    initialValues: { email: '', password: '' },
    validationSchema: Yup.object({
      email: Yup.string().email('Invalid email').required('Email is required'),
      password: Yup.string().required('Password is required'),
    }),
    onSubmit: async (values) => {
      setSubmitting(true);
      try {
        const loggedInUser = await login(values);
        notifications.show({ title: 'Welcome back', message: 'Signed in successfully', color: 'green' });
        navigate(getPortalPath(loggedInUser.role));
      } catch (error) {
        notifications.show({
          title: 'Sign in failed',
          message: capitalizeWords(error?.response?.data?.message || 'Invalid credentials'),
          color: 'red',
        });
      } finally {
        setSubmitting(false);
      }
    },
  });

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-background p-4">
      <GlowOrbs />
      <div className="absolute right-4 top-4 z-10">
        <ThemeToggle />
      </div>

      <div className="relative w-full max-w-md">
        <div className="mb-8 text-center">
          <AdesiaLogo className="justify-center" size="lg" />
          <h1 className="mt-6 font-display text-2xl font-bold">
            Welcome to <GradientText>Adesia</GradientText>
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Sign in to your organization or teacher workspace
          </p>
        </div>

        <GlassCard className="p-8">
          <form onSubmit={formik.handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="email" className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  id="email"
                  type="email"
                  className="input-adesia pl-10"
                  placeholder="you@school.edu"
                  {...formik.getFieldProps('email')}
                />
              </div>
              {formik.touched.email && formik.errors.email && (
                <p className="mt-1 text-xs text-destructive">{formik.errors.email}</p>
              )}
            </div>

            <div>
              <label htmlFor="password" className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  id="password"
                  type="password"
                  className="input-adesia pl-10"
                  placeholder="••••••••"
                  {...formik.getFieldProps('password')}
                />
              </div>
              {formik.touched.password && formik.errors.password && (
                <p className="mt-1 text-xs text-destructive">{formik.errors.password}</p>
              )}
            </div>

            <div className="flex justify-end">
              <ForgetPasswordModal>
                <button type="button" className="text-xs text-muted-foreground transition-colors hover:text-primary">
                  Forgot password?
                </button>
              </ForgetPasswordModal>
            </div>

            <GradientButton type="submit" className="w-full" disabled={submitting}>
              {submitting ? 'Signing in…' : 'Sign in'}
              {!submitting && <ArrowRight className="h-4 w-4" />}
            </GradientButton>
          </form>
        </GlassCard>

        <p className="mt-6 text-center text-sm text-muted-foreground">
          New to Adesia?{' '}
          <Link to="/register" className="font-medium text-primary hover:underline">
            Create a free student account
          </Link>
        </p>
        <p className="mt-4 text-center text-sm text-muted-foreground">
          <Link to="/" className="font-medium text-primary hover:underline">
            ← Back to home
          </Link>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
