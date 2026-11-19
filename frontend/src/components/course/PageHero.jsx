import React from 'react';
import { Link } from 'react-router-dom';
import { m } from 'framer-motion';
import { LuChevronRight } from 'react-icons/lu';
import { Container } from '../ui';
import { easeOut } from '../../motion/presets';
import { cx } from '../../utils/cx';
import ResponsiveImage from '../media/ResponsiveImage';
import styles from './PageHero.module.css';

const LONG_TITLE = 30;

const contentVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08, delayChildren: 0.05 } },
};

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: easeOut } },
};

/**
 * Banner hero for course pages. The text sits on darkened artwork, so the content subtree is
 * forced to the dark theme to keep buttons and badges legible in light mode too.
 */
const PageHero = ({ artwork, breadcrumbs = [], eyebrow, title, description, facts = [], children }) => (
  <section className={styles.hero} aria-labelledby="page-title">
    {artwork && (
      <div className={styles.media} aria-hidden="true">
        <ResponsiveImage
          artwork={artwork}
          sizes="100vw"
          alt=""
          fetchPriority="high"
          className={styles.image}
          style={{ objectPosition: artwork.focus }}
        />
      </div>
    )}
    <div className={styles.overlay} aria-hidden="true" />

    <Container className={styles.inner} data-theme="dark">
      {breadcrumbs.length > 0 && (
        <nav aria-label="Breadcrumb" className={styles.breadcrumbs}>
          <ol>
            {breadcrumbs.map((crumb, index) => {
              const last = index === breadcrumbs.length - 1;
              return (
                <li key={crumb.label}>
                  {last || !crumb.to ? (
                    <span aria-current={last ? 'page' : undefined}>{crumb.label}</span>
                  ) : (
                    <Link to={crumb.to}>{crumb.label}</Link>
                  )}
                  {!last && <LuChevronRight aria-hidden="true" className={styles.separator} />}
                </li>
              );
            })}
          </ol>
        </nav>
      )}

      <m.div className={styles.content} variants={contentVariants} initial="hidden" animate="visible">
        {eyebrow && <m.p variants={fadeUp} className={styles.eyebrow}>{eyebrow}</m.p>}
        <m.h1 variants={fadeUp} id="page-title" className={cx(styles.title, title.length > LONG_TITLE && styles.titleLong)}>
          {title}
        </m.h1>
        {description && <m.p variants={fadeUp} className={styles.description}>{description}</m.p>}
        {facts.length > 0 && (
          <m.ul variants={fadeUp} className={styles.facts}>
            {facts.map(({ icon: Icon, label, value }) => (
              <li key={value} className={styles.fact}>
                {Icon && <Icon aria-hidden="true" />}
                {label && <span className="visually-hidden">{label}: </span>}
                {value}
              </li>
            ))}
          </m.ul>
        )}
        {children && <m.div variants={fadeUp} className={styles.actions}>{children}</m.div>}
      </m.div>
    </Container>
  </section>
);

export default PageHero;
