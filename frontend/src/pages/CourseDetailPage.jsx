import React from 'react';
import {
  LuArrowRight,
  LuAward,
  LuClock,
  LuGauge,
  LuLayers,
  LuQuote,
  LuSparkles,
} from 'react-icons/lu';
import { COURSE_CATEGORY, getCategory, getCourse, uniqueSoftware } from '../data/courses';
import { pageDescriptions, pageTitles } from '../data/seo';
import usePageMeta from '../hooks/usePageMeta';
import { placements } from '../data/home';
import { recruiterLogos } from '../data/placements';
import { ROUTES } from '../routes';
import { useEnquiry } from '../components/enquiry/EnquiryProvider';
import { AnimatedSection, GlassCard, PrimaryButton, RevealItem, SecondaryButton } from '../components/ui';
import PageHero from '../components/course/PageHero';
import { SoftwareGrid } from '../components/course/Software';
import ArtworkGallery from '../components/showcase/ArtworkGallery';
import FaqAccordion from '../components/faq/FaqAccordion';
import Section from '../components/home/Section';
import EnquirySection from '../components/home/EnquirySection';
import styles from './CourseDetailPage.module.css';

const RECRUITER_PREVIEW = 8;

const Facts = ({ course }) => {
  const software = uniqueSoftware(course.software);
  const facts = [
    { icon: LuClock, label: 'Duration', value: course.duration },
    { icon: LuGauge, label: 'Skill level', value: course.skillLevel },
    { icon: LuAward, label: 'Certification', value: 'Certificate program by MAAC' },
    { icon: LuLayers, label: 'Software covered', value: `${software.length} tools` },
    course.electives && { icon: LuSparkles, label: 'Electives', value: `${course.electives.length} specialization options` },
  ].filter(Boolean);

  return (
    <GlassCard as="aside" padding="lg" className={styles.facts} aria-labelledby="facts-title">
      <h3 id="facts-title" className={styles.factsTitle}>At a glance</h3>
      <dl className={styles.factList}>
        {facts.map(({ icon: Icon, label, value }) => (
          <div key={label} className={styles.fact}>
            <dt><Icon aria-hidden="true" />{label}</dt>
            <dd>{value}</dd>
          </div>
        ))}
      </dl>
    </GlassCard>
  );
};

const Learning = ({ learning }) => (
  <div className={styles.learning}>
    {learning.intro && <p className={styles.lead}>{learning.intro}</p>}
    {learning.topics && (
      <div>
        <h3 className={styles.subheading}>{learning.topicsHeading}</h3>
        <ol className={styles.topics}>
          {learning.topics.map((topic, index) => (
            <li key={topic} className={styles.topic}>
              <span className={styles.topicIndex} aria-hidden="true">{String(index + 1).padStart(2, '0')}</span>
              <span className={styles.topicText}>{topic}</span>
            </li>
          ))}
        </ol>
      </div>
    )}
    {learning.skills && (
      <div>
        <h3 className={styles.subheading}>Skills you build</h3>
        <ul className={styles.skills}>
          {learning.skills.map((skill) => <li key={skill}>{skill}</li>)}
        </ul>
      </div>
    )}
  </div>
);

/** Shared template for the four advanced programme pages. Sections without source content are omitted. */
const CourseDetailPage = ({ courseId }) => {
  const course = getCourse(courseId);
  const category = getCategory(COURSE_CATEGORY.advanced);
  const { openEnquiry } = useEnquiry();
  const enquire = () => openEnquiry(course.enquiry.value);
  usePageMeta({
    title: pageTitles[course.path],
    description: pageDescriptions[course.path],
    path: course.path,
    breadcrumbs: [
      { name: 'Home', path: ROUTES.home },
      { name: 'Courses', path: ROUTES.courses },
      { name: category.title, path: category.path },
      { name: course.code, path: course.path },
    ],
    course: { name: course.title, description: pageDescriptions[course.path], path: course.path },
  });

  const sections = [
    {
      id: 'overview',
      label: 'Overview',
      eyebrow: 'Overview',
      title: `About ${course.code}`,
      content: (
        <div className={styles.overview}>
          <div className={styles.prose}>
            {course.description.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
          </div>
          <Facts course={course} />
        </div>
      ),
    },
    course.learning && {
      id: 'learning',
      label: 'What you learn',
      eyebrow: 'Learning',
      title: 'What you will learn',
      content: <Learning learning={course.learning} />,
    },
    {
      id: 'software',
      label: 'Software',
      eyebrow: 'Tools',
      title: 'Software covered',
      content: <SoftwareGrid software={course.software} />,
    },
    course.electives && {
      id: 'electives',
      label: 'Electives',
      eyebrow: 'Specialise',
      title: 'Elective specialization options',
      content: (
        <AnimatedSection as="ul" stagger={0.08} className={styles.electives}>
          {course.electives.map((elective) => (
            <RevealItem as="li" key={elective.name} className={styles.elective}>
              <img src={elective.image} alt="" width="336" height="251" loading="lazy" decoding="async" />
              <h3 className={styles.electiveName}>{elective.name}</h3>
            </RevealItem>
          ))}
        </AnimatedSection>
      ),
    },
    course.studentWork && {
      id: 'student-work',
      label: 'Student work',
      eyebrow: 'Student showcase',
      title: 'Student Works',
      description: `Artwork by students of the MAAC ${course.code} programme. Select any piece to view it larger.`,
      content: <ArtworkGallery items={course.studentWork.items} caption={`From the MAAC ${course.code} programme.`} />,
    },
    {
      id: 'careers',
      label: 'Careers',
      eyebrow: 'Careers',
      title: 'Career support',
      description: placements.description,
      action: (
        <SecondaryButton to={ROUTES.placement} icon={<LuArrowRight />}>Placement details</SecondaryButton>
      ),
      content: (
        <div className={styles.career}>
          {course.careerHighlight && (
            <figure className={styles.quote}>
              <LuQuote aria-hidden="true" className={styles.quoteIcon} />
              <blockquote>{course.careerHighlight}</blockquote>
              <figcaption>From the {course.code} programme description</figcaption>
            </figure>
          )}
          <div>
            <p className={styles.subheading}>{placements.logosHeading}</p>
            <ul className={styles.logos}>
              {recruiterLogos.slice(0, RECRUITER_PREVIEW).map((company) => (
                <li key={company.name} className={styles.logo}>
                  <img src={company.logo} alt={company.name} loading="lazy" decoding="async" />
                </li>
              ))}
            </ul>
            <p className={styles.disclaimer}>{placements.disclaimer}</p>
          </div>
        </div>
      ),
    },
    {
      id: 'faq',
      label: 'FAQs',
      eyebrow: 'FAQs',
      title: 'Frequently Asked Questions',
      containerSize: 'narrow',
      content: <FaqAccordion faqs={course.faqs} />,
    },
  ].filter(Boolean);

  return (
    <>
      <PageHero
        artwork={course.artwork}
        breadcrumbs={[
          { label: 'Home', to: ROUTES.home },
          { label: 'Courses', to: ROUTES.courses },
          { label: category.title, to: category.path },
          { label: course.code },
        ]}
        eyebrow={`${course.discipline} · Advanced programme`}
        title={course.title}
        description={course.tagline}
        facts={[
          { icon: LuClock, label: 'Duration', value: course.duration },
          { icon: LuGauge, label: 'Skill level', value: course.skillLevel },
        ]}
      >
        <PrimaryButton onClick={enquire} aria-label={`Enquire Now about ${course.code}`}>Enquire Now</PrimaryButton>
        <SecondaryButton href="#overview">Explore the programme</SecondaryButton>
      </PageHero>

      <nav aria-label="On this page" className={styles.pageNav}>
        <ul>
          {sections.map((section) => (
            <li key={section.id}><a href={`#${section.id}`}>{section.label}</a></li>
          ))}
          <li><a href="#enquire">Enquire</a></li>
        </ul>
      </nav>

      {sections.map(({ id, label, content, ...section }, index) => (
        <Section key={id} id={id} tone={index % 2 ? 'alt' : 'default'} {...section}>
          {content}
        </Section>
      ))}

      <EnquirySection
        eyebrow="Admission enquiry"
        title={`Enquire about ${course.code}`}
        defaultCourse={course.enquiry.value}
      />
    </>
  );
};

export default CourseDetailPage;
