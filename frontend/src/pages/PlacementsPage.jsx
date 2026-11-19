import React from 'react';
import { Link } from 'react-router-dom';
import { hero, placements, whyMaac } from '../data/home';
import { advancedPrograms } from '../data/courses';
import { placementRoles, placementWorkplaces, recognitionLogos, recruiterLogos } from '../data/placements';
import { pageDescriptions, pageTitles } from '../data/seo';
import { ROUTES } from '../routes';
import usePageMeta from '../hooks/usePageMeta';
import { useEnquiry } from '../components/enquiry/EnquiryProvider';
import { PrimaryButton, SecondaryButton } from '../components/ui';
import PageHero from '../components/course/PageHero';
import PageNav from '../components/layout/PageNav';
import Section from '../components/home/Section';
import EnquirySection from '../components/home/EnquirySection';
import styles from './PlacementsPage.module.css';

const NAV = [
  { href: '#assistance', label: 'Placement assistance' },
  { href: '#employers', label: 'Employers' },
  { href: '#careers', label: 'Careers' },
  { href: '#recognition', label: 'Recognition' },
  { href: '#enquire', label: 'Enquire' },
];

const LogoGrid = ({ logos }) => (
  <ul className={styles.logos}>
    {logos.map((company) => (
      <li key={company.name}>
        <figure className={styles.logo}>
          <img src={company.logo} alt="" width="160" height="64" loading="lazy" decoding="async" />
          <figcaption>{company.name}</figcaption>
        </figure>
      </li>
    ))}
  </ul>
);

const NameList = ({ label, items }) => (
  <div>
    <h3 className={styles.listTitle}>{label}</h3>
    <ul className={styles.names}>
      {items.map((item) => <li key={item}>{item}</li>)}
    </ul>
  </div>
);

const PlacementsPage = () => {
  const { openEnquiry } = useEnquiry();
  usePageMeta({
    title: pageTitles[ROUTES.placement],
    description: pageDescriptions[ROUTES.placement],
    path: ROUTES.placement,
    breadcrumbs: [
      { name: 'Home', path: ROUTES.home },
      { name: 'Placements', path: ROUTES.placement },
    ],
  });

  return (
    <>
      <PageHero
        artwork={hero.slides.find((slide) => slide.id === 'vfx')}
        breadcrumbs={[{ label: 'Home', to: ROUTES.home }, { label: 'Placements' }]}
        eyebrow={placements.eyebrow}
        title="Placements"
        description={placements.description}
      >
        <PrimaryButton onClick={() => openEnquiry()}>Enquire Now</PrimaryButton>
        <SecondaryButton href="#employers">View employer logos</SecondaryButton>
      </PageHero>

      <PageNav links={NAV} />

      <Section id="assistance" eyebrow="Placement assistance" title={placements.title} description={whyMaac.description}>
        <p className={styles.disclaimer}>{placements.disclaimer}</p>
      </Section>

      <Section
        id="employers"
        tone="alt"
        eyebrow="Employers"
        title={placements.logosHeading}
        description="Each name is the wording printed on that logo. Logos are trademarks of their respective owners."
      >
        <LogoGrid logos={recruiterLogos} />
      </Section>

      <Section
        id="careers"
        eyebrow="Careers"
        title="Workplaces and roles named on this page"
        description="The original placements page names these kinds of workplaces, and these roles within them. It does not say which role belongs to which workplace, and it gives no placement counts."
      >
        <div className={styles.lists}>
          <NameList label="Workplaces" items={placementWorkplaces} />
          <NameList label="Roles" items={placementRoles} />
        </div>
        <div className={styles.programmes}>
          <h3 className={styles.listTitle}>Programmes</h3>
          <ul className={styles.names}>
            {advancedPrograms.map((program) => (
              <li key={program.id}>
                <Link to={program.path}>{program.discipline}</Link>
              </li>
            ))}
          </ul>
        </div>
      </Section>

      <Section
        id="recognition"
        tone="alt"
        eyebrow="Recognition"
        title="Skill and education bodies"
        description="These marks were on the original placements page. The names are the words printed on each logo. They identify skill and education bodies, and this page does not present them as employers or hiring partners."
      >
        <LogoGrid logos={recognitionLogos} />
      </Section>

      <EnquirySection title="Ask about career training at MAAC Mathura" />
    </>
  );
};

export default PlacementsPage;
