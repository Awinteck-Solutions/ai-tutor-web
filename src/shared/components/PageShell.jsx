import { Link } from 'react-router-dom';
import { AdesiaLogo } from './AdesiaLogo';
import { GradientButton } from './GradientButton';
import { GlowOrbs } from './GlowOrbs';

export const PageHeader = ({ title, description, action, gradientWord }) => {
  const parts = gradientWord && title.includes(gradientWord)
    ? title.split(gradientWord)
    : null;

  return (
    <div className="mb-8 flex flex-wrap items-start justify-between gap-4">
      <div>
        <h1 className="font-display text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
          {parts ? (
            <>
              {parts[0]}
              <span className="gradient-text">{gradientWord}</span>
              {parts[1]}
            </>
          ) : (
            title
          )}
        </h1>
        {description && (
          <p className="mt-2 max-w-2xl text-sm text-muted-foreground">{description}</p>
        )}
      </div>
      {action}
    </div>
  );
};

export const EmptyState = ({ title, description, actionLabel, actionTo = '/teacher/materials', icon: Icon }) => (
  <div className="glass-card flex flex-col items-center px-8 py-16 text-center">
    {Icon && (
      <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/15 text-primary">
        <Icon className="h-7 w-7" />
      </div>
    )}
    <h3 className="font-display text-lg font-semibold">{title}</h3>
    <p className="mt-2 max-w-sm text-sm text-muted-foreground">{description}</p>
    {actionLabel && (
      <GradientButton to={actionTo} className="mt-6">
        {actionLabel}
      </GradientButton>
    )}
  </div>
);

export const NotFoundPage = () => (
  <div className="relative flex min-h-screen flex-col items-center justify-center gap-4 bg-background">
    <GlowOrbs />
    <AdesiaLogo className="mb-4" />
    <h1 className="font-display text-6xl font-bold">404</h1>
    <p className="text-muted-foreground">This page doesn’t exist.</p>
    <GradientButton to="/">Back to home</GradientButton>
  </div>
);

export const ForbiddenPage = () => (
  <div className="relative flex min-h-screen flex-col items-center justify-center gap-4 bg-background">
    <GlowOrbs />
    <h1 className="font-display text-6xl font-bold">403</h1>
    <p className="text-muted-foreground">You don’t have permission to view this page.</p>
    <Link to="/login" className="text-sm text-primary hover:underline">Sign in with a different account</Link>
  </div>
);
