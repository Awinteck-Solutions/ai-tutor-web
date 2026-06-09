import { Link } from 'react-router-dom';
import { AdesiaIcon } from './AdesiaIcon';

export const AdesiaLogo = ({ className = '', showText = true, size = 'md', to = '/' }) => {
  const sizes = { sm: 'h-7 w-7', md: 'h-9 w-9', lg: 'h-11 w-11' };
  const textSizes = { sm: 'text-lg', md: 'text-xl', lg: 'text-2xl' };

  return (
    <Link to={to} className={`inline-flex items-center gap-2.5 no-underline ${className}`}>
      <AdesiaIcon
        className={`${sizes[size]} shrink-0 rounded-xl shadow-glow-sm ring-1 ring-primary/30`}
      />
      {showText && (
        <span className={`font-display font-bold tracking-tight text-foreground ${textSizes[size]}`}>
          Adesia Tutor
        </span>
      )}
    </Link>
  );
};

export default AdesiaLogo;
