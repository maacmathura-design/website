import React from 'react';
import { LuPhone } from 'react-icons/lu';
import { FaWhatsapp } from 'react-icons/fa';
import { phone, whatsappUrl } from '../../data/site';
import { HOME_SECTIONS } from '../../data/home';
import { AnimatedSection, Container, GlassCard, SectionHeading } from '../ui';
import EnquiryForm from '../enquiry/EnquiryForm';
import styles from './EnquirySection.module.css';

const EnquirySection = ({
  headingLevel = 2,
  eyebrow = 'Admission enquiry',
  title = 'Start your creative career with MAAC Mathura',
  defaultCourse,
}) => (
  <section id={HOME_SECTIONS.enquire} aria-labelledby="enquire-title" className={styles.section}>
    <Container className={styles.layout}>
      <div className={styles.intro}>
        <SectionHeading
          id="enquire-title"
          level={headingLevel}
          size="lg"
          eyebrow={eyebrow}
          title={title}
          description="Ask about courses, fees, duration and career opportunities. Share your details and our team will get back to you."
        />
        <ul className={styles.contacts}>
          <li>
            <a href={`tel:${phone.tel}`} className={styles.contact}>
              <span className={styles.contactIcon} aria-hidden="true"><LuPhone /></span>
              <span>
                <span className={styles.contactLabel}>Call us</span>
                <span className={styles.contactValue}>{phone.display}</span>
              </span>
            </a>
          </li>
          <li>
            <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" className={styles.contact}>
              <span className={styles.contactIcon} aria-hidden="true"><FaWhatsapp /></span>
              <span>
                <span className={styles.contactLabel}>WhatsApp</span>
                <span className={styles.contactValue}>Chat with our team</span>
              </span>
            </a>
          </li>
        </ul>
      </div>
      <AnimatedSection as="div">
        <GlassCard padding="lg" className={styles.card}>
          <p className={styles.formTitle}>Enquiry form</p>
          <EnquiryForm defaultCourse={defaultCourse} />
        </GlassCard>
      </AnimatedSection>
    </Container>
  </section>
);

export default EnquirySection;
