import React from 'react';
import { m } from 'framer-motion';
import { revealVariants, transitions } from '../../motion/presets';

const staggerVariants = (stagger, delay) => ({
  hidden: {},
  visible: { transition: { staggerChildren: stagger, delayChildren: delay } },
});

/**
 * Reveals its content once when scrolled into view. With `stagger`, the section itself does not
 * move; wrap each child in <RevealItem> and they reveal one after another.
 */
const AnimatedSection = ({ as = 'section', delay = 0, stagger, amount = 0.2, children, ...rest }) => {
  const Component = m[as];
  const motionProps = stagger
    ? { variants: staggerVariants(stagger, delay) }
    : { variants: revealVariants, transition: { ...transitions.reveal, delay } };

  return (
    <Component initial="hidden" whileInView="visible" viewport={{ once: true, amount }} {...motionProps} {...rest}>
      {children}
    </Component>
  );
};

export const RevealItem = ({ as = 'div', children, ...rest }) => {
  const Component = m[as];
  return (
    <Component variants={revealVariants} transition={transitions.reveal} {...rest}>
      {children}
    </Component>
  );
};

export default AnimatedSection;
