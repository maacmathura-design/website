import React from 'react';
import { Link } from 'react-router-dom';
import { LuArrowRight } from 'react-icons/lu';
import { advancedPrograms } from '../data/courses';
import { about, hero, howItWorks } from '../data/home';
import { ROUTES } from '../routes';
import { pageDescriptions, pageTitles } from '../data/seo';
import usePageMeta from '../hooks/usePageMeta';
import { useEnquiry } from '../components/enquiry/EnquiryProvider';
import { PrimaryButton, SecondaryButton } from '../components/ui';
import PageHero from '../components/course/PageHero';
import PageNav from '../components/layout/PageNav';
import Section from '../components/home/Section';
import WhyMaac from '../components/home/WhyMaac';
import EnquirySection from '../components/home/EnquirySection';
import styles from './AboutPage.module.css';

const [mathura, training, faculty] = about.highlights;

const NAV = [
  { href: '#about-maac', label: 'About MAAC' },
  { href: '#about-mathura', label: 'MAAC Mathura' },
  { href: '#training', label: 'Training' },
  { href: '#faculty', label: 'Faculty' },
  { href: '#why-maac', label: 'Why MAAC' },
  { href: '#enquire', label: 'Enquire' },
];

const AboutPage = () => {
  const { openEnquiry } = useEnquiry();
  usePageMeta({
    title: pageTitles[ROUTES.about],
    description: pageDescriptions[ROUTES.about],
    path: ROUTES.about,
    breadcrumbs: [
      { name: 'Home', path: ROUTES.home },
      { name: 'About', path: ROUTES.about },
    ],
  });

  return (
    <>
      <PageHero
        artwork={hero.slides.find((slide) => slide.id === 'animation')}
        breadcrumbs={[{ label: 'Home', to: ROUTES.home }, { label: 'About' }]}
        eyebrow="About"
        title="About MAAC Mathura"
        description={about.title}
      >
        <PrimaryButton onClick={() => openEnquiry()}>Enquire Now</PrimaryButton>
        <SecondaryButton href="#about-maac">Read about MAAC</SecondaryButton>
      </PageHero>

      <PageNav links={NAV} />

      <Section id="about-maac" eyebrow="MAAC" title="About MAAC">
        <div className={styles.prose}>
          <p>{about.title}</p>
          <p>{about.description}</p>
        </div>
      </Section>

      <Section id="about-mathura" tone="alt" eyebrow="MAAC Mathura" title={mathura.title} description={mathura.text}>
        <ul className={styles.programmes}>
          {advancedPrograms.map((program) => (
            <li key={program.id}>
              <Link to={program.path} className={styles.programme}>
                <span className={styles.programmeCode}>{program.code}</span>
                <span className={styles.programmeName}>{program.discipline}</span>
                <span className={styles.programmeMore}>
                  View the programme <LuArrowRight aria-hidden="true" />
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </Section>

      <Section id="training" eyebrow="Training environment" title={training.title} description={training.text}>
        <ol className={styles.steps}>
          {howItWorks.map((step, index) => (
            <li key={step.id} className={styles.step}>
              <span className={styles.stepNumber} aria-hidden="true">{String(index + 1).padStart(2, '0')}</span>
              <h3 className={styles.stepTitle}>
                <span className="visually-hidden">Step {index + 1}: </span>
                {step.title}
              </h3>
              <p className={styles.stepText}>{step.text}</p>
            </li>
          ))}
        </ol>
      </Section>

      <Section id="faculty" tone="alt" eyebrow="Faculty and facilities" title={faculty.title} description={faculty.text} />

      <WhyMaac eyebrow="Why choose MAAC" />

      <EnquirySection title="Ask about studying at MAAC Mathura" />
    </>
  );
};

export default AboutPage;
