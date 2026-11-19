import React from 'react';
import { LuArrowRight, LuBuilding2, LuMapPin, LuUsers } from 'react-icons/lu';
import { ROUTES } from '../../routes';
import { about, HOME_SECTIONS } from '../../data/home';
import { AnimatedSection, GlassCard, RevealItem, SecondaryButton } from '../ui';
import Section from './Section';
import styles from './AboutSection.module.css';

const ICONS = [LuMapPin, LuBuilding2, LuUsers];

const AboutSection = () => (
  <Section
    id={HOME_SECTIONS.about}
    eyebrow={about.eyebrow}
    title={about.title}
    description={about.description}
    action={<SecondaryButton to={ROUTES.about} icon={<LuArrowRight />}>About MAAC Mathura</SecondaryButton>}
  >
    <AnimatedSection as="div" stagger={0.1} className={styles.grid}>
      {about.highlights.map((item, index) => {
        const Icon = ICONS[index];
        return (
          <RevealItem key={item.title} className={styles.item}>
            <GlassCard padding="lg" className={styles.card}>
              <span className={styles.icon} aria-hidden="true"><Icon /></span>
              <h3 className={styles.title}>{item.title}</h3>
              <p className={styles.text}>{item.text}</p>
            </GlassCard>
          </RevealItem>
        );
      })}
    </AnimatedSection>
  </Section>
);

export default AboutSection;
