import React from 'react';
import { m } from 'framer-motion';
import { liftOnHover } from '../../motion/presets';
import { cx } from '../../utils/cx';
import styles from './GlassCard.module.css';

const paddingClass = { none: styles.paddingNone, sm: styles.paddingSm, md: styles.paddingMd, lg: styles.paddingLg };

const GlassCard = ({ as = 'div', interactive = false, padding = 'md', className, children, ...rest }) => {
  const Component = m[as];
  return (
    <Component
      className={cx(styles.card, paddingClass[padding], interactive && styles.interactive, className)}
      {...(interactive ? liftOnHover : {})}
      {...rest}
    >
      {children}
    </Component>
  );
};

export default GlassCard;
