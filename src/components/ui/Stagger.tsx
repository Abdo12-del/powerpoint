import { motion, type HTMLMotionProps } from 'framer-motion';
import { staggerContainer } from './motion';

type StaggerProps = HTMLMotionProps<'div'> & { stagger?: number; delay?: number };

/** حاوية تُظهر أبناءها (Card / motion.*) تباعاً. */
export function Stagger({ stagger = 0.08, delay = 0.1, children, ...rest }: StaggerProps) {
  return (
    <motion.div variants={staggerContainer(stagger, delay)} initial="hidden" animate="show" {...rest}>
      {children}
    </motion.div>
  );
}
