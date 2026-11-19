import React from 'react';
import { Container, SectionHeading } from '../ui';
import { cx } from '../../utils/cx';
import styles from './Section.module.css';

/** Homepage section shell: anchor id, heading wired to aria-labelledby, optional header action. */
const Section = ({ id, tone = 'default', eyebrow, title, description, align = 'start', action, className, containerSize, children }) => {
  const headingId = `${id}-title`;
  return (
    <section id={id} aria-labelledby={headingId} className={cx(styles.section, styles[tone], className)}>
      <Container size={containerSize}>
        <div className={cx(styles.header, action && styles.headerWithAction, align === 'center' && styles.headerCenter)}>
          <SectionHeading id={headingId} eyebrow={eyebrow} title={title} description={description} align={align} />
          {action && <div className={styles.action}>{action}</div>}
        </div>
        {children}
      </Container>
    </section>
  );
};

export default Section;
