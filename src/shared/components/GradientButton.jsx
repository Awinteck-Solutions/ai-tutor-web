import { Link } from 'react-router-dom';

export const GradientButton = ({ children, className = '', to, href, type = 'button', ...props }) => {
  const classes = `btn-gradient ${className}`;

  if (to) {
    return (
      <Link to={to} className={classes} {...props}>
        {children}
      </Link>
    );
  }

  if (href) {
    return (
      <a href={href} className={classes} {...props}>
        {children}
      </a>
    );
  }

  return (
    <button type={type} className={classes} {...props}>
      {children}
    </button>
  );
};

export const GhostButton = ({ children, className = '', to, ...props }) => {
  const classes = `btn-ghost ${className}`;
  if (to) return <Link to={to} className={classes} {...props}>{children}</Link>;
  return <button type="button" className={classes} {...props}>{children}</button>;
};

export default GradientButton;
