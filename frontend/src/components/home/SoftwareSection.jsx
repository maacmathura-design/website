import React from 'react';
import { softwareWithLogos } from '../../data/courses';
import { AnimatedSection, RevealItem } from '../ui';
import Section from './Section';
import styles from './SoftwareSection.module.css';

const SoftwareSection = () => (
  <Section
    id="software"
    align="center"
    eyebrow="Software"
    title="Learn the tools used in production"
    description="Software covered across MAAC courses. The exact set depends on the programme you choose."
  >
    <AnimatedSection as="ul" stagger={0.03} amount={0.1} className={styles.grid}>
      {softwareWithLogos.map((item) => (
        <RevealItem as="li" key={item.name} className={styles.item}>
          <span className={styles.tile}>
            <img src={item.icon} alt="" width="40" height="40" loading="lazy" decoding="async" />
          </span>
          <span className={styles.name}>{item.name}</span>
        </RevealItem>
      ))}
    </AnimatedSection>
  </Section>
);

export default SoftwareSection;
