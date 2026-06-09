import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { ArrowRight, Lock, Mail, User } from 'lucide-react';
import { notifications } from '@mantine/notifications';
import { AdesiaLogo } from '../../../shared/components/AdesiaLogo';
import { GlowOrbs } from '../../../shared/components/GlowOrbs';
import { GlassCard } from '../../../shared/components/GlassCard';
import { GradientText } from '../../../shared/components/GradientText';
import { GradientButton, GhostButton } from '../../../shared/components/GradientButton';
import { ThemeToggle } from '../../../shared/components/ThemeToggle';
import { useAuth } from '../../../shared/context/AuthContext';
import { capitalizeWords } from '../../../utils/page.helper';

const RegisterPage = () => {
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();
  const { register, getPortalPath, user } = useAuth();

  useEffect(() => {
    if (user) navigate(getPortalPath(user.role), { replace: true });
  }, [user, navigate, getPortalPath]);

  const formik = useFormik({
    initialValues: {
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      confirmPassword: '',
    },
    validationSchema: Yup.object({
      firstName: Yup.string().trim().required('First name is required'),
      lastName: Yup.string().trim().required('Last name is required'),
      email: Yup.string().email('Invalid email').required('Email is required'),
      password: Yup.string().min(8, 'At least 8 characters').required('Password is required'),
      confirmPassword: Yup.string()
        .oneOf([Yup.ref('password')], 'Passwords must match')
        .required('Confirm your password'),
    }),
    onSubmit: async (values) => {
      setSubmitting(true);
      try {
        const registered = await register({
          firstName: values.firstName.trim(),
          lastName: values.lastName.trim(),
          email: values.email.trim(),
          password: values.password,
        });
        notifications.show({
          title: 'Welcome to Adesia',
          message: 'Your free learning workspace is ready.',
          color: 'green',
        });
        navigate(getPortalPath(registered.role), {
          replace: true,
          state: { showOnboarding: true },
        });
      } catch (error) {
        notifications.show({
          title: 'Sign up failed',
          message: capitalizeWords(error?.response?.data?.message || 'Could not create account'),
          color: 'red',
        });
      } finally {
        setSubmitting(false);
      }
    },
  });

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-background p-4 py-10">
      <GlowOrbs />
      <div className="absolute right-4 top-4 z-10">
        <ThemeToggle />
      </div>

      <div className="relative w-full max-w-lg">
        <div className="mb-8 text-center">
          <AdesiaLogo className="justify-center" size="lg" />
          <h1 className="mt-6 font-display text-2xl font-bold">
            Create your <GradientText>student account</GradientText>
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Free plan includes 10 MB storage and 10 lessons per day — upgrade options coming soon.
          </p>
        </div>

        <GlassCard className="p-8">
          <form onSubmit={formik.handleSubmit} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="firstName" className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  First name
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <input id="firstName" className="input-adesia pl-10" {...formik.getFieldProps('firstName')} />
                </div>
                {formik.touched.firstName && formik.errors.firstName && (
                  <p className="mt-1 text-xs text-destructive">{formik.errors.firstName}</p>
                )}
              </div>
              <div>
                <label htmlFor="lastName" className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Last name
                </label>
                <input id="lastName" className="input-adesia" {...formik.getFieldProps('lastName')} />
                {formik.touched.lastName && formik.errors.lastName && (
                  <p className="mt-1 text-xs text-destructive">{formik.errors.lastName}</p>
                )}
              </div>
            </div>

            <div>
              <label htmlFor="email" className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <input id="email" type="email" className="input-adesia pl-10" placeholder="you@email.com" {...formik.getFieldProps('email')} />
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
                <input id="password" type="password" className="input-adesia pl-10" {...formik.getFieldProps('password')} />
              </div>
              {formik.touched.password && formik.errors.password && (
                <p className="mt-1 text-xs text-destructive">{formik.errors.password}</p>
              )}
            </div>

            <div>
              <label htmlFor="confirmPassword" className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Confirm password
              </label>
              <input id="confirmPassword" type="password" className="input-adesia" {...formik.getFieldProps('confirmPassword')} />
              {formik.touched.confirmPassword && formik.errors.confirmPassword && (
                <p className="mt-1 text-xs text-destructive">{formik.errors.confirmPassword}</p>
              )}
            </div>

            <GradientButton type="submit" className="mt-2 w-full" disabled={submitting}>
              {submitting ? 'Creating account…' : 'Create free account'}
              {!submitting && <ArrowRight className="h-4 w-4" />}
            </GradientButton>
          </form>
        </GlassCard>

        <p className="mt-6 text-center text-sm text-muted-foreground">
          Already have an account?{' '}
          <Link to="/login" className="font-medium text-primary hover:underline">
            Sign in
          </Link>
        </p>
        <p className="mt-2 text-center text-xs text-muted-foreground">
          Teachers and admins need an invitation from their organization.
        </p>
      </div>
    </div>
  );
};

export default RegisterPage;
