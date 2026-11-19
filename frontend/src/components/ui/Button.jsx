import React from 'react';
import { Link } from 'react-router-dom';
import { m } from 'framer-motion';
import { pressable } from '../../motion/presets';
import { cx } from '../../utils/cx';
import styles from './Button.module.css';

const MotionLink = m.create(Link);

/**
 * Renders a router link when `to` is set, an anchor when `href` is set, otherwise a <button>.
 */
const Button = React.forwardRef(function Button(
  { variant = 'primary', size = 'md', fullWidth = false, icon, iconLeading, to, href, disabled, className, children, ...rest },
  ref,
) {
  const classNames = cx(styles.button, styles[variant], styles[size], fullWidth && styles.fullWidth, className);
  const motionProps = disabled ? {} : pressable;
  const content = (
    <>
      {iconLeading && <span className={styles.icon} aria-hidden="true">{iconLeading}</span>}
      <span>{children}</span>
      {icon && <span className={styles.icon} aria-hidden="true">{icon}</span>}
    </>
  );

  if (to) {
    return (
      <MotionLink ref={ref} to={to} className={classNames} aria-disabled={disabled || undefined} {...motionProps} {...rest}>
        {content}
      </MotionLink>
    );
  }

  if (href) {
    return (
      <m.a ref={ref} href={href} className={classNames} aria-disabled={disabled || undefined} {...motionProps} {...rest}>
        {content}
      </m.a>
    );
  }

  return (
    <m.button ref={ref} type="button" className={classNames} disabled={disabled} {...motionProps} {...rest}>
      {content}
    </m.button>
  );
});

export const PrimaryButton = React.forwardRef((props, ref) => <Button ref={ref} {...props} variant="primary" />);
PrimaryButton.displayName = 'PrimaryButton';

export const SecondaryButton = React.forwardRef((props, ref) => <Button ref={ref} {...props} variant="secondary" />);
SecondaryButton.displayName = 'SecondaryButton';

export default Button;
