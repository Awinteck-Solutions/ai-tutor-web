import { useId } from 'react';
import { useTheme } from '../context/ThemeContext';

const ICON_THEMES = {
  light: {
    stops: [
      ['0%', 'hsl(48, 96%, 53%)'],
      ['50%', 'hsl(45, 100%, 48%)'],
      ['100%', 'hsl(36, 90%, 38%)'],
    ],
    ink: 'hsl(36, 90%, 14%)',
  },
  dark: {
    stops: [
      ['0%', 'hsl(48, 96%, 58%)'],
      ['50%', 'hsl(45, 100%, 50%)'],
      ['100%', 'hsl(40, 90%, 42%)'],
    ],
    ink: 'hsl(0, 0%, 6%)',
  },
  edu: {
    stops: [
      ['0%', 'hsl(221, 83%, 58%)'],
      ['50%', 'hsl(199, 89%, 48%)'],
      ['100%', 'hsl(262, 70%, 55%)'],
    ],
    ink: 'hsl(0, 0%, 100%)',
  },
};

/** Minimal open book — keep in sync with public/adesia-icon.svg and src/assets/logo.svg */
const BookMark = ({ ink }) => (
  <>
    <path
      d="M32 17C26 19 18 22 14 24V42C18 40 26 38 32 44V17Z"
      fill={ink}
    />
    <path
      d="M32 17C38 19 46 22 50 24V42C46 40 38 38 32 44V17Z"
      fill={ink}
    />
  </>
);

export const AdesiaIcon = ({ className = 'h-9 w-9', title = 'Adesia' }) => {
  const { theme } = useTheme();
  const gradientId = useId().replace(/:/g, '');
  const palette = ICON_THEMES[theme] ?? ICON_THEMES.light;

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
          {palette.stops.map(([offset, color]) => (
            <stop key={offset} offset={offset} stopColor={color} />
          ))}
        </linearGradient>
      </defs>
      <rect width="64" height="64" rx="14" fill={`url(#${gradientId})`} />
      <BookMark ink={palette.ink} />
    </svg>
  );
};

export default AdesiaIcon;
