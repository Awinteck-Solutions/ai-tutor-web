import { Link } from 'react-router-dom';

export const AdesiaLogo = ({ className = '', showText = true, size = 'md' }) => {
  const sizes = { sm: 'h-7 w-7', md: 'h-9 w-9', lg: 'h-11 w-11' };
  const textSizes = { sm: 'text-lg', md: 'text-xl', lg: 'text-2xl' };

  return (
    <Link to="/" className={`inline-flex items-center gap-2.5 no-underline ${className}`}>
      <div
        className={`${sizes[size]} relative flex shrink-0 items-center justify-center rounded-xl bg-gradient-cta shadow-glow-sm ring-1 ring-primary/30`}
      >
        <span className="font-display text-sm font-black text-primary-foreground">A</span>
      </div>
      {showText && (
        <span className={`font-display font-bold tracking-tight text-foreground ${textSizes[size]}`}>
          Adesia
        </span>
      )}
    </Link>
  );
};

export default AdesiaLogo;
