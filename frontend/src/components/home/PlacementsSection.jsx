import React, { useRef, useState } from 'react';
import { useInView } from 'framer-motion';
import { LuArrowRight, LuPause, LuPlay } from 'react-icons/lu';
import { ROUTES } from '../../routes';
import { HOME_SECTIONS, placements } from '../../data/home';
import { recruiterLogos } from '../../data/placements';
import { SecondaryButton } from '../ui';
import { cx } from '../../utils/cx';
import Section from './Section';
import styles from './PlacementsSection.module.css';

const LogoRow = ({ hidden = false }) => (
  <ul className={styles.row} aria-hidden={hidden || undefined}>
    {recruiterLogos.map((company) => (
      <li key={company.name} className={styles.logo}>
        <img src={company.logo} alt={hidden ? '' : company.name} decoding="async" />
      </li>
    ))}
  </ul>
);

const PlacementsSection = () => {
  const sectionRef = useRef(null);
  const inView = useInView(sectionRef, { amount: 0.15 });
  const [paused, setPaused] = useState(false);

  return (
    <Section
      id={HOME_SECTIONS.placements}
      eyebrow={placements.eyebrow}
      title={placements.title}
      description={placements.description}
      action={
        <SecondaryButton to={ROUTES.placement} icon={<LuArrowRight />}>
          Placement details
        </SecondaryButton>
      }
    >
      <div className={styles.logosHeader}>
        <h3 className={styles.logosHeading}>{placements.logosHeading}</h3>
        <button
          type="button"
          className={styles.pause}
          onClick={() => setPaused((value) => !value)}
          aria-label={paused ? 'Play logo carousel' : 'Pause logo carousel'}
        >
          {paused ? <LuPlay aria-hidden="true" /> : <LuPause aria-hidden="true" />}
        </button>
      </div>
      <div ref={sectionRef} className={cx(styles.marquee, (paused || !inView) && styles.paused)}>
        <div className={styles.track}>
          <LogoRow />
          <LogoRow hidden />
        </div>
      </div>
      <p className={styles.disclaimer}>{placements.disclaimer}</p>
    </Section>
  );
};

export default PlacementsSection;
