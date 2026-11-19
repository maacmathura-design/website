import React from 'react';
import { cx } from '../../utils/cx';
import styles from './Badge.module.css';

const Badge = ({ variant = 'neutral', icon, className, children, ...rest }) => (
  <span className={cx(styles.badge, styles[variant], className)} {...rest}>
    {icon && <span className={styles.icon} aria-hidden="true">{icon}</span>}
    {children}
  </span>
);

export default Badge;
