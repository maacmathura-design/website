import React from 'react';
import { useSearchParams } from 'react-router-dom';
import { LuArrowRight, LuClock, LuGauge } from 'react-icons/lu';
import { COURSE_CATEGORY, catalogueHero, courseCategories } from '../data/courses';
import { pageDescriptions, pageTitles } from '../data/seo';
import { ROUTES } from '../routes';
import usePageMeta from '../hooks/usePageMeta';
import { useEnquiry } from '../components/enquiry/EnquiryProvider';
import { AnimatedSection, PrimaryButton, RevealItem, SecondaryButton } from '../components/ui';
import PageHero from '../components/course/PageHero';
import CategoryNav, { ALL_COURSES } from '../components/course/CategoryNav';
import CourseCatalogCard from '../components/course/CourseCatalogCard';
import Section from '../components/home/Section';
import EnquirySection from '../components/home/EnquirySection';
import { cx } from '../utils/cx';
import styles from './CoursesPage.module.css';

const cardLabel = (course, category) => course.code ?? category.shortTitle;

const CategorySection = ({ category, tone }) => (
  <Section
    id={category.id}
    tone={tone}
    eyebrow={`${category.courses.length} courses`}
    title={category.title}
    description={category.description}
    action={
      category.id !== COURSE_CATEGORY.advanced && (
        <SecondaryButton to={category.path} icon={<LuArrowRight />}>
          {`Open ${category.title}`}
        </SecondaryButton>
      )
    }
  >
    {(category.duration || category.skillLevel) && (
      <ul className={styles.categoryFacts}>
        {category.duration && (
          <li><LuClock aria-hidden="true" /> <span className="visually-hidden">Duration: </span>{category.duration}</li>
        )}
        {category.skillLevel && (
          <li><LuGauge aria-hidden="true" /> <span className="visually-hidden">Skill level: </span>{category.skillLevel}</li>
        )}
      </ul>
    )}
    <AnimatedSection
      as="ul"
      stagger={0.06}
      amount={0.05}
      className={cx(styles.grid, category.courses.length % 2 === 0 && category.courses.length < 6 && styles.gridPairs)}
    >
      {category.courses.map((course) => (
        <RevealItem as="li" key={course.id} className={styles.item}>
          <CourseCatalogCard course={course} categoryId={category.id} label={cardLabel(course, category)} />
        </RevealItem>
      ))}
    </AnimatedSection>
  </Section>
);

const CoursesPage = () => {
  const [searchParams] = useSearchParams();
  const { openEnquiry } = useEnquiry();
  const requested = searchParams.get('category');
  const active = courseCategories.some((category) => category.id === requested) ? requested : ALL_COURSES;
  const visible = active === ALL_COURSES ? courseCategories : courseCategories.filter((category) => category.id === active);
  usePageMeta({
    title: pageTitles[ROUTES.courses],
    description: pageDescriptions[ROUTES.courses],
    path: ROUTES.courses,
    breadcrumbs: [
      { name: 'Home', path: ROUTES.home },
      { name: 'Courses', path: ROUTES.courses },
    ],
    itemList: courseCategories.map((category) => ({
      name: category.title,
      path: category.path,
    })),
  });

  return (
    <>
      <PageHero
        artwork={catalogueHero.artwork}
        breadcrumbs={[{ label: 'Home', to: ROUTES.home }, { label: 'Courses' }]}
        eyebrow="MAAC Mathura courses"
        title={catalogueHero.title}
        description={catalogueHero.description}
        facts={courseCategories.map((category) => ({ value: `${category.courses.length} ${category.title}` }))}
      >
        <PrimaryButton onClick={() => openEnquiry()}>Enquire Now</PrimaryButton>
        <SecondaryButton href={`#${visible[0].id}`}>Browse courses</SecondaryButton>
      </PageHero>

      <CategoryNav active={active} />

      {visible.map((category, index) => (
        <CategorySection key={category.id} category={category} tone={index % 2 ? 'alt' : 'default'} />
      ))}

      <EnquirySection title="Not sure which course is right for you?" />
    </>
  );
};

export default CoursesPage;
