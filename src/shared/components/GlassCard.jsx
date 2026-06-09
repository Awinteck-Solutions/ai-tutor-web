export const GlassCard = ({ children, className = '', hover = false, ...props }) => (
  <div className={`${hover ? 'glass-card-hover' : 'glass-card'} ${className}`} {...props}>
    {children}
  </div>
);

export default GlassCard;
