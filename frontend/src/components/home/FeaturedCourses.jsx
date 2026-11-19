import React from 'react';
import { LuArrowRight, LuClock, LuGauge } from 'react-icons/lu';
import { ROUTES } from '../../routes';
import { featuredCourses, HOME_SECTIONS } from '../../data/home';
import { useEnquiry } from '../enquiry/EnquiryProvider';
import { AnimatedSection, GlassCard, PrimaryButton, RevealItem, SecondaryButton } from '../ui';
import CourseArtwork from './CourseArtwork';
import Section from './Section';
import styles from './FeaturedCourses.module.css';

const CourseCategoryCard = ({ course, onEnquire }) => (
  <GlassCard as="article" interactive padding="none" className={styles.card} aria-labelledby={`course-${course.id}`}>
    <div className={styles.media}>
      <CourseArtwork src={course.video} className={styles.video} />
      <span className={styles.code}>{course.code}</span>
    </div>
    <div className={styles.body}>
      <h3 id={`course-${course.id}`} className={styles.title}>{course.title}</h3>
      <ul className={styles.meta}>
        <li>
          <LuClock aria-hidden="true" />
          <span className="visually-hidden">Duration: </span>
          {course.duration}
        </li>
        <li>
          <LuGauge aria-hidden="true" />
          <span className="visually-hidden">Skill level: </span>
          {course.skillLevel}
        </li>
      </ul>
      <div className={styles.actions}>
        <SecondaryButton to={course.path} size="sm" aria-label={`View details: ${course.title}`}>
          View details
        </SecondaryButton>
        <PrimaryButton size="sm" onClick={() => onEnquire(course.enquiryValue)} aria-label={`Enquire Now about ${course.title}`}>
          Enquire Now
        </PrimaryButton>
      </div>
    </div>
  </GlassCard>
);

const FeaturedCourses = () => {
  const { openEnquiry } = useEnquiry();

  return (
    <Section
      id={HOME_SECTIONS.courses}
      tone="alt"
      eyebrow="Courses"
      title="Find the programme that fits your ambition"
      description="Advanced programmes in 3D Animation, VFX, Gaming and Web & Graphic Design, plus short-term and career courses."
      action={
        <SecondaryButton to={ROUTES.courses} icon={<LuArrowRight />}>
          View all courses
        </SecondaryButton>
      }
    >
      <AnimatedSection as="ul" stagger={0.08} amount={0.1} className={styles.grid}>
        {featuredCourses.map((course) => (
          <RevealItem as="li" key={course.id} className={styles.item}>
            <CourseCategoryCard course={course} onEnquire={openEnquiry} />
          </RevealItem>
        ))}
      </AnimatedSection>
    </Section>
  );
};

export default FeaturedCourses;
