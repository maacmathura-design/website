import React, { useState } from 'react';
import { LuArrowRight, LuSend, LuSparkles } from 'react-icons/lu';
import {
  AnimatedSection,
  Badge,
  Container,
  GlassCard,
  Modal,
  PrimaryButton,
  RevealItem,
  SecondaryButton,
  SectionHeading,
  ThemeToggle,
} from '../components/ui';
import CourseCatalogCard from '../components/course/CourseCatalogCard';
import EnquiryCTA from '../components/enquiry/EnquiryCTA';
import { COURSE_CATEGORY, advancedPrograms, shortTermCatalog } from '../data/courses';
import { ROUTES } from '../routes';
import usePageMeta from '../hooks/usePageMeta';
import styles from './DesignSystemPage.module.css';

const SWATCHES = [
  'bg',
  'bg-secondary',
  'surface',
  'surface-muted',
  'text',
  'text-muted',
  'accent',
  'accent-text',
  'border-strong',
  'danger',
  'success',
];

const Showcase = ({ onOpenModal }) => (
  <div className={styles.showcase}>
    <section className={styles.group}>
      <h3 className={styles.groupTitle}>Colour tokens</h3>
      <ul className={styles.swatches}>
        {SWATCHES.map((name) => (
          <li key={name} className={styles.swatch}>
            <span className={styles.chip} style={{ background: `var(--color-${name})` }} />
            <code>--color-{name}</code>
          </li>
        ))}
      </ul>
    </section>

    <section className={styles.group}>
      <h3 className={styles.groupTitle}>Typography</h3>
      <p className={styles.display}>Animation, VFX and Gaming</p>
      <SectionHeading
        eyebrow="Section eyebrow"
        title="Section heading"
        description="Body copy uses Inter; headings use Space Grotesk. Muted text uses the secondary text token."
      />
    </section>

    <section className={styles.group}>
      <h3 className={styles.groupTitle}>Buttons</h3>
      <div className={styles.row}>
        <PrimaryButton icon={<LuArrowRight />}>Primary</PrimaryButton>
        <SecondaryButton>Secondary</SecondaryButton>
        <PrimaryButton size="sm">Small</PrimaryButton>
        <SecondaryButton size="lg" iconLeading={<LuSend />}>Large</SecondaryButton>
        <PrimaryButton disabled>Disabled</PrimaryButton>
        <SecondaryButton to={ROUTES.courses}>Router link</SecondaryButton>
        <SecondaryButton onClick={onOpenModal}>Open modal</SecondaryButton>
        <ThemeToggle />
      </div>
    </section>

    <section className={styles.group}>
      <h3 className={styles.groupTitle}>Badges</h3>
      <div className={styles.row}>
        <Badge>Neutral</Badge>
        <Badge variant="accent">Accent</Badge>
        <Badge variant="solid" icon={<LuSparkles />}>Solid</Badge>
        <Badge variant="outline">Outline</Badge>
      </div>
    </section>

    <section className={styles.group}>
      <h3 className={styles.groupTitle}>Glass cards</h3>
      <div className={styles.glassStage}>
        <GlassCard>
          <strong>Static glass</strong>
          <p className={styles.muted}>Blurred, semi-transparent surface with a subtle border.</p>
        </GlassCard>
        <GlassCard interactive tabIndex={0}>
          <strong>Interactive glass</strong>
          <p className={styles.muted}>Lifts on hover and keyboard focus.</p>
        </GlassCard>
      </div>
    </section>

    <section className={styles.group}>
      <h3 className={styles.groupTitle}>Course cards</h3>
      <div className={styles.cards}>
        <CourseCatalogCard course={advancedPrograms[1]} categoryId={COURSE_CATEGORY.advanced} />
        <CourseCatalogCard course={shortTermCatalog.courses[0]} categoryId={COURSE_CATEGORY.shortTerm} label="Short-term" />
      </div>
    </section>

    <section className={styles.group}>
      <h3 className={styles.groupTitle}>Enquiry call to action</h3>
      <EnquiryCTA headingLevel={4} onEnquire={onOpenModal} />
    </section>

    <section className={styles.group}>
      <h3 className={styles.groupTitle}>Scroll reveal</h3>
      <AnimatedSection as="div" stagger={0.08} className={styles.row}>
        {['One', 'Two', 'Three'].map((label) => (
          <RevealItem key={label}>
            <Badge variant="outline">{label}</Badge>
          </RevealItem>
        ))}
      </AnimatedSection>
    </section>
  </div>
);

const DesignSystemPage = () => {
  const [modalOpen, setModalOpen] = useState(false);
  const openModal = () => setModalOpen(true);
  usePageMeta({ title: 'Design system', description: 'Development-only component preview.' });

  return (
    <main className={styles.page}>
      <Container size="wide">
        <SectionHeading
          level={1}
          eyebrow="Development only"
          title="Design system"
          description="Every shared component rendered in both themes. This route is not registered in production builds."
        />
      </Container>

      <Container size="wide" className={styles.panes}>
        <div data-theme="light" className={styles.pane}>
          <h2 className={styles.paneTitle}>Light theme</h2>
          <Showcase onOpenModal={openModal} />
        </div>
        <div data-theme="dark" className={styles.pane}>
          <h2 className={styles.paneTitle}>Dark theme</h2>
          <Showcase onOpenModal={openModal} />
        </div>
      </Container>

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Modal preview"
        description="Follows the active site theme. Close with Escape, the close button or the backdrop."
      >
        <PrimaryButton onClick={() => setModalOpen(false)}>Done</PrimaryButton>
      </Modal>
    </main>
  );
};

export default DesignSystemPage;
