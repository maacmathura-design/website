import React from 'react';
import { cx } from '../../utils/cx';
import styles from './SectionHeading.module.css';

const SectionHeading = ({ eyebrow, title, description, level = 2, size, align = 'start', id, className }) => {
  const Heading = `h${level}`;
  const sizeClass = styles[size || (level === 1 ? 'xl' : 'lg')];

  return (
    <div className={cx(styles.root, styles[align], className)}>
      {eyebrow && <p className={styles.eyebrow}>{eyebrow}</p>}
      <Heading id={id} className={cx(styles.title, sizeClass)}>
        {title}
      </Heading>
      {description && <p className={styles.description}>{description}</p>}
    </div>
  );
};

export default SectionHeading;
