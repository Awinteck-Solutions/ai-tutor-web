import { motion } from 'framer-motion';

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, delay: i * 0.08, ease: [0.22, 1, 0.36, 1] },
  }),
};

export const FadeUp = ({ children, className = '', delay = 0, as = 'div' }) => {
  const Component = motion[as] || motion.div;
  return (
    <Component
      className={className}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: '-40px' }}
      variants={fadeUp}
      custom={delay}
    >
      {children}
    </Component>
  );
};

export const StaggerContainer = ({ children, className = '' }) => (
  <motion.div
    className={className}
    initial="hidden"
    whileInView="visible"
    viewport={{ once: true, margin: '-40px' }}
    variants={{
      hidden: {},
      visible: { transition: { staggerChildren: 0.1 } },
    }}
  >
    {children}
  </motion.div>
);

export default FadeUp;
