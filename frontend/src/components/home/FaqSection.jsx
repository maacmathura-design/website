import React from 'react';
import { programFaqs } from '../../data/courses';
import { HOME_SECTIONS } from '../../data/home';
import FaqAccordion from '../faq/FaqAccordion';
import Section from './Section';
import styles from './FaqSection.module.css';

const FaqSection = () => (
  <Section
    id={HOME_SECTIONS.faq}
    tone="alt"
    eyebrow="FAQs"
    title="Questions students often ask"
    description="Answers about our programmes, certification and what you will learn."
    className={styles.section}
    containerSize="narrow"
  >
    <FaqAccordion faqs={programFaqs} />
  </Section>
);

export default FaqSection;
