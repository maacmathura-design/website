import React from 'react';
import { whyMaac } from '../../data/home';
import { AnimatedSection, GlassCard, RevealItem } from '../ui';
import Section from './Section';
import styles from './WhyMaac.module.css';

const WhyMaac = ({ id = 'why-maac', eyebrow = whyMaac.eyebrow }) => (
  <Section id={id} eyebrow={eyebrow} title={whyMaac.title} description={whyMaac.description} className={styles.section}>
    <AnimatedSection as="ul" stagger={0.1} className={styles.grid}>
      {whyMaac.pillars.map(({ icon: Icon, title, text }, index) => (
        <RevealItem as="li" key={title} className={styles.item}>
          <GlassCard interactive padding="lg" className={styles.card}>
            <div className={styles.cardTop}>
              <span className={styles.icon} aria-hidden="true"><Icon /></span>
              <span className={styles.index} aria-hidden="true">{String(index + 1).padStart(2, '0')}</span>
            </div>
            <h3 className={styles.title}>{title}</h3>
            <p className={styles.text}>{text}</p>
          </GlassCard>
        </RevealItem>
      ))}
    </AnimatedSection>
  </Section>
);

export default WhyMaac;
