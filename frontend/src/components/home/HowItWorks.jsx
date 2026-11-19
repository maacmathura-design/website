import React from 'react';
import { howItWorks } from '../../data/home';
import { AnimatedSection, RevealItem } from '../ui';
import Section from './Section';
import styles from './HowItWorks.module.css';

const HowItWorks = () => (
  <Section
    id="how-it-works"
    tone="alt"
    align="center"
    eyebrow="How it works"
    title="From first enquiry to your first studio role"
    description="Six steps that take you from finding the right course to preparing for placements."
  >
    <AnimatedSection as="ol" stagger={0.08} amount={0.1} className={styles.steps}>
      {howItWorks.map((step, index) => (
        <RevealItem as="li" key={step.id} className={styles.step}>
          <div className={styles.art}>
            <img src={step.image} alt="" width="348" height="348" loading="lazy" decoding="async" />
          </div>
          <div className={styles.copy}>
            <span className={styles.number} aria-hidden="true">{String(index + 1).padStart(2, '0')}</span>
            <h3 className={styles.title}>
              <span className="visually-hidden">Step {index + 1}: </span>
              {step.title}
            </h3>
            <p className={styles.text}>{step.text}</p>
          </div>
        </RevealItem>
      ))}
    </AnimatedSection>
  </Section>
);

export default HowItWorks;
