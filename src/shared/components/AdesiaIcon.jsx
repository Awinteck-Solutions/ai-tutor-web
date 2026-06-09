import { useId } from 'react';

const INK = 'hsl(0, 0%, 6%)';

const GRADIENT_STOPS = (
  <>
    <stop offset="0%" stopColor="hsl(48, 96%, 53%)" />
    <stop offset="50%" stopColor="hsl(45, 100%, 48%)" />
    <stop offset="100%" stopColor="hsl(40, 90%, 38%)" />
  </>
);

/** Minimal open book — keep in sync with public/adesia-icon.svg and src/assets/logo.svg */
const MARK_PATHS = (
  <>
    <path
      d="M32 17C26 19 18 22 14 24V42C18 40 26 38 32 44V17Z"
      fill={INK}
    />
    <path
      d="M32 17C38 19 46 22 50 24V42C46 40 38 38 32 44V17Z"
      fill={INK}
    />
  </>
);

export const AdesiaIcon = ({ className = 'h-9 w-9', title = 'Adesia' }) => {
  const gradientId = useId().replace(/:/g, '');

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 64 64"
      fill="none"
      className={className}
      role="img"
      aria-label={title}
    >
      <defs>
        <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
          {GRADIENT_STOPS}
        </linearGradient>
      </defs>
      <rect width="64" height="64" rx="14" fill={`url(#${gradientId})`} />
      {MARK_PATHS}
    </svg>
  );
};

export default AdesiaIcon;
