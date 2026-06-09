export const GlowOrbs = ({ className = '' }) => (
  <div className={`pointer-events-none fixed inset-0 overflow-hidden ${className}`} aria-hidden>
    <div className="absolute -left-32 top-1/4 h-96 w-96 animate-float rounded-full bg-primary/15 blur-[100px]" />
    <div className="absolute -right-24 top-1/3 h-80 w-80 animate-float-delayed rounded-full bg-primary/10 blur-[90px]" />
    <div className="absolute bottom-1/4 left-1/3 h-72 w-72 animate-float-slow rounded-full bg-secondary/8 blur-[80px]" />
    <div className="absolute right-1/4 top-2/3 h-64 w-64 animate-float rounded-full bg-amber-500/5 blur-[70px]" />
  </div>
);

export default GlowOrbs;
