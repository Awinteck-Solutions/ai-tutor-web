import { useTheme, THEMES } from '../context/ThemeContext';

const THEME_OPTIONS = [
  {
    id: 'light',
    label: 'Light',
    title: 'Warm light — gold accents',
    swatchClass: 'bg-[hsl(48,96%,53%)]',
    ringClass: 'ring-amber-600',
  },
  {
    id: 'dark',
    label: 'Dark',
    title: 'Dark — gold brand',
    swatchClass: 'bg-[hsl(0,0%,12%)]',
    ringClass: 'ring-yellow-400',
  },
  {
    id: 'edu',
    label: 'Edu',
    title: 'Edu — indigo & teal',
    swatchClass: 'bg-[hsl(221,83%,53%)]',
    ringClass: 'ring-indigo-500',
  },
];

export const ThemeToggle = ({ className = '' }) => {
  const { theme, setTheme } = useTheme();

  return (
    <div
      className={`inline-flex items-center gap-1 rounded-full border border-border/50 bg-card/60 p-0.5 backdrop-blur-sm ${className}`}
      role="group"
      aria-label="Color theme"
    >
      {THEME_OPTIONS.filter(({ id }) => THEMES.includes(id)).map(({ id, label, title, swatchClass, ringClass }) => {
        const active = theme === id;
        return (
          <button
            key={id}
            type="button"
            onClick={() => setTheme(id)}
            title={title}
            aria-label={`${label} theme${active ? ' (active)' : ''}`}
            aria-pressed={active}
            className={`h-5 w-5 rounded-full transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 ${
              active ? `ring-[1.5px] ring-offset-1 ring-offset-background ${ringClass}` : 'opacity-75 hover:opacity-100'
            }`}
          >
            <span className={`block h-full w-full rounded-full border border-black/10 ${swatchClass}`} />
            <span className="sr-only">{label}</span>
          </button>
        );
      })}
    </div>
  );
};

export default ThemeToggle;
