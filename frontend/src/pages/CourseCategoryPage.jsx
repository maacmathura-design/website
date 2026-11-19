import React from 'react';
import { useLocation } from 'react-router-dom';
import { LuArrowRight, LuClock, LuGauge } from 'react-icons/lu';
import { courseCategories, courseHref, getCategory } from '../data/courses';
import { pageDescriptions, pageTitles } from '../data/seo';
import usePageMeta from '../hooks/usePageMeta';
import { ROUTES } from '../routes';
import { useEnquiry } from '../components/enquiry/EnquiryProvider';
import { AnimatedSection, Container, PrimaryButton, RevealItem, SecondaryButton } from '../components/ui';
import PageHero from '../components/course/PageHero';
import CategoryNav from '../components/course/CategoryNav';
import CourseCatalogCard from '../components/course/CourseCatalogCard';
import EnquirySection from '../components/home/EnquirySection';
import styles from './CourseCategoryPage.module.css';

/** Full listing for a course category. Each card is the course's detail, anchored by its id. */
const CourseCategoryPage = ({ categoryId }) => {
  const category = getCategory(categoryId);
  const { hash } = useLocation();
  const { openEnquiry } = useEnquiry();
  const others = courseCategories.filter((item) => item.id !== categoryId);
  usePageMeta({
    title: pageTitles[category.path],
    description: pageDescriptions[category.path],
    path: category.path,
    breadcrumbs: [
      { name: 'Home', path: ROUTES.home },
      { name: 'Courses', path: ROUTES.courses },
      { name: category.title, path: category.path },
    ],
    itemList: category.courses.map((course) => ({ name: course.title, path: courseHref(course, category.id) })),
  });

  return (
    <>
      <PageHero
        artwork={category.artwork}
        breadcrumbs={[
          { label: 'Home', to: ROUTES.home },
          { label: 'Courses', to: ROUTES.courses },
          { label: category.title },
        ]}
        eyebrow={`${category.courses.length} courses`}
        title={category.title}
        description={category.description}
        facts={[
          { icon: LuClock, label: 'Duration', value: category.duration },
          { icon: LuGauge, label: 'Skill level', value: category.skillLevel },
        ]}
      >
        <PrimaryButton onClick={() => openEnquiry(category.enquiry.value)}>Enquire Now</PrimaryButton>
        <SecondaryButton href="#course-list">View courses</SecondaryButton>
      </PageHero>

      <CategoryNav active={categoryId} />

      <section id="course-list" aria-labelledby="course-list-title" className={styles.section}>
        <Container>
          <h2 id="course-list-title" className="visually-hidden">{category.title}</h2>
          <AnimatedSection as="ul" stagger={0.06} amount={0.05} className={styles.grid}>
            {category.courses.map((course) => (
              <RevealItem as="li" key={course.id} className={styles.item}>
                <CourseCatalogCard
                  id={course.id}
                  course={course}
                  categoryId={categoryId}
                  label={category.shortTitle}
                  expanded
                  highlighted={hash === `#${course.id}`}
                />
              </RevealItem>
            ))}
          </AnimatedSection>

          <nav aria-label="Other course categories" className={styles.related}>
            <p className={styles.relatedTitle}>Explore other categories</p>
            <ul className={styles.relatedList}>
              {others.map((item) => (
                <li key={item.id}>
                  <SecondaryButton to={item.path} size="sm" icon={<LuArrowRight />}>{item.title}</SecondaryButton>
                </li>
              ))}
            </ul>
          </nav>
        </Container>
      </section>

      <EnquirySection title={`Enquire about ${category.title}`} defaultCourse={category.enquiry.value} />
    </>
  );
};

export default CourseCategoryPage;
