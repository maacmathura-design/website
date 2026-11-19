import React from 'react';
import { AnimatePresence, m } from 'framer-motion';
import { LuMoon, LuSun } from 'react-icons/lu';
import { useTheme } from '../../theme/ThemeProvider';
import { pressable, transitions } from '../../motion/presets';
import { cx } from '../../utils/cx';
import styles from './ThemeToggle.module.css';

const iconMotion = {
  initial: { opacity: 0, rotate: -90, scale: 0.6 },
  animate: { opacity: 1, rotate: 0, scale: 1 },
  exit: { opacity: 0, rotate: 90, scale: 0.6 },
  transition: transitions.quick,
};

const ThemeToggle = ({ className }) => {
  const { theme, toggleTheme } = useTheme();
  const nextTheme = theme === 'dark' ? 'light' : 'dark';
  const label = `Switch to ${nextTheme} theme`;

  return (
    <m.button
      type="button"
      className={cx(styles.toggle, className)}
      onClick={toggleTheme}
      aria-label={label}
      title={label}
      {...pressable}
    >
      <AnimatePresence mode="wait" initial={false}>
        <m.span key={theme} className={styles.icon} aria-hidden="true" {...iconMotion}>
          {theme === 'dark' ? <LuSun /> : <LuMoon />}
        </m.span>
      </AnimatePresence>
    </m.button>
  );
};

export default ThemeToggle;
