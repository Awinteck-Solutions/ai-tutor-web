import { useEffect, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { ArrowRight, Building2, Lock, Mail, User } from 'lucide-react';
import { notifications } from '@mantine/notifications';
import { AdesiaLogo } from '../../../shared/components/AdesiaLogo';
import { GlowOrbs } from '../../../shared/components/GlowOrbs';
import { GlassCard } from '../../../shared/components/GlassCard';
import { GradientText } from '../../../shared/components/GradientText';
import { GradientButton, GhostButton } from '../../../shared/components/GradientButton';
import { ThemeToggle } from '../../../shared/components/ThemeToggle';
import { useAuth } from '../../../shared/context/AuthContext';
import { getErrorMessage } from '../../../shared/utils/formatters';
import { capitalizeWords } from '../../../utils/page.helper';
import { acceptInvite, previewInvite } from '../services/organization.services';

const ROLE_LABELS = {
  SCHOOL_ADMIN: 'School admin',
  TEACHER: 'Teacher',
  STUDENT: 'Student',
  PARENT: 'Parent',
};

const AcceptInvitePage = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') ?? '';
  const navigate = useNavigate();
  const { login, getPortalPath } = useAuth();

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [preview, setPreview] = useState(null);
  const [loadError, setLoadError] = useState(null);

  useEffect(() => {
    if (!token) {
      setLoadError('This invitation link is missing a token.');
      setLoading(false);
      return;
    }

    let cancelled = false;

    (async () => {
      try {
        const data = await previewInvite(token);
        if (!cancelled) setPreview(data);
      } catch (error) {
        if (!cancelled) {
          setLoadError(getErrorMessage(error, 'This invitation is invalid or has expired.'));
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [token]);

  const formik = useFormik({
    enableReinitialize: true,
    initialValues: {
      firstName: '',
      lastName: '',
      password: '',
      confirmPassword: '',
    },
    validationSchema: Yup.object({
      firstName: preview?.requiresRegistration
        ? Yup.string().trim().required('First name is required')
        : Yup.string(),
      lastName: preview?.requiresRegistration
        ? Yup.string().trim().required('Last name is required')
        : Yup.string(),
      password: preview?.requiresRegistration
        ? Yup.string().min(8, 'At least 8 characters').required('Password is required')
        : Yup.string(),
      confirmPassword: preview?.requiresRegistration
        ? Yup.string()
            .oneOf([Yup.ref('password')], 'Passwords must match')
            .required('Confirm your password')
        : Yup.string(),
    }),
    onSubmit: async (values) => {
      setSubmitting(true);
      try {
        const payload = { token };
        if (preview?.requiresRegistration) {
          payload.firstName = values.firstName.trim();
          payload.lastName = values.lastName.trim();
          payload.password = values.password;
        }

        const result = await acceptInvite(payload);

        if (preview?.requiresRegistration) {
          const loggedInUser = await login({
            email: preview.email,
            password: values.password,
          });
          notifications.show({
            title: 'Welcome to Adesia',
            message: `You have joined ${preview.organizationName}.`,
            color: 'green',
          });
          navigate(getPortalPath(loggedInUser.role ?? result?.role ?? preview.role));
          return;
        }

        notifications.show({
          title: 'Invitation accepted',
          message: 'Sign in with your existing account to continue.',
          color: 'green',
        });
        navigate('/login');
      } catch (error) {
        notifications.show({
          title: 'Could not accept invitation',
          message: capitalizeWords(getErrorMessage(error)),
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
            Accept <GradientText>invitation</GradientText>
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Join your organization on Adesia
          </p>
        </div>

        <GlassCard className="p-8">
          {loading && (
            <p className="text-center text-sm text-muted-foreground">Loading invitation…</p>
          )}

          {!loading && loadError && (
            <div className="space-y-4 text-center">
              <p className="text-sm text-destructive">{loadError}</p>
              <GhostButton to="/login" className="mx-auto">
                Go to sign in
              </GhostButton>
            </div>
          )}

          {!loading && preview && (
            <>
              <div className="mb-6 space-y-3 rounded-xl border border-border/50 bg-muted/30 p-4">
                <div className="flex items-start gap-3">
                  <Building2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                  <div>
                    <p className="text-xs uppercase tracking-wide text-muted-foreground">Organization</p>
                    <p className="font-medium text-foreground">{preview.organizationName}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Mail className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                  <div>
                    <p className="text-xs uppercase tracking-wide text-muted-foreground">Invited as</p>
                    <p className="font-medium text-foreground">{preview.email}</p>
                    <p className="text-xs text-muted-foreground">
                      Role: {ROLE_LABELS[preview.role] ?? preview.role}
                    </p>
                  </div>
                </div>
              </div>

              <form onSubmit={formik.handleSubmit} className="space-y-5">
                {preview.requiresRegistration ? (
                  <>
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div>
                        <label htmlFor="firstName" className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-muted-foreground">
                          First name
                        </label>
                        <div className="relative">
                          <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                          <input
                            id="firstName"
                            className="input-adesia pl-10"
                            {...formik.getFieldProps('firstName')}
                          />
                        </div>
                        {formik.touched.firstName && formik.errors.firstName && (
                          <p className="mt-1 text-xs text-destructive">{formik.errors.firstName}</p>
                        )}
                      </div>
                      <div>
                        <label htmlFor="lastName" className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-muted-foreground">
                          Last name
                        </label>
                        <input
                          id="lastName"
                          className="input-adesia"
                          {...formik.getFieldProps('lastName')}
                        />
                        {formik.touched.lastName && formik.errors.lastName && (
                          <p className="mt-1 text-xs text-destructive">{formik.errors.lastName}</p>
                        )}
                      </div>
                    </div>

                    <div>
                      <label htmlFor="password" className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-muted-foreground">
                        Create password
                      </label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <input
                          id="password"
                          type="password"
                          className="input-adesia pl-10"
                          {...formik.getFieldProps('password')}
                        />
                      </div>
                      {formik.touched.password && formik.errors.password && (
                        <p className="mt-1 text-xs text-destructive">{formik.errors.password}</p>
                      )}
                    </div>

                    <div>
                      <label htmlFor="confirmPassword" className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-muted-foreground">
                        Confirm password
                      </label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <input
                          id="confirmPassword"
                          type="password"
                          className="input-adesia pl-10"
                          {...formik.getFieldProps('confirmPassword')}
                        />
                      </div>
                      {formik.touched.confirmPassword && formik.errors.confirmPassword && (
                        <p className="mt-1 text-xs text-destructive">{formik.errors.confirmPassword}</p>
                      )}
                    </div>
                  </>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    You already have an Adesia account for this email. Accept the invitation, then sign in with your existing password.
                  </p>
                )}

                <GradientButton type="submit" className="w-full" disabled={submitting}>
                  {submitting ? 'Accepting…' : 'Accept invitation'}
                  {!submitting && <ArrowRight className="h-4 w-4" />}
                </GradientButton>
              </form>
            </>
          )}
        </GlassCard>

        <p className="mt-6 text-center text-sm text-muted-foreground">
          Already signed in elsewhere?{' '}
          <Link to="/login" className="text-primary hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
};

export default AcceptInvitePage;
