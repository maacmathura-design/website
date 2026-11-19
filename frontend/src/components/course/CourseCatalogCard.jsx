import React from 'react';
import { LuArrowRight, LuClock, LuGauge } from 'react-icons/lu';
import { courseHref } from '../../data/courses';
import { useEnquiry } from '../enquiry/EnquiryProvider';
import { GlassCard, PrimaryButton, SecondaryButton } from '../ui';
import { cx } from '../../utils/cx';
import CourseVisual from './CourseVisual';
import { SoftwareChips } from './Software';
import styles from './CourseCatalogCard.module.css';

const SOFTWARE_PREVIEW = 4;

/** Distinguishes cards that share a title (the two "MAX PRO" cards) for assistive tech. */
export const accessibleCourseName = (course) =>
  course.variantLabel ? `${course.title} (${course.variantLabel})` : course.title;

/**
 * Course card for catalogue grids. `expanded` shows the full description and every software
 * item and drops "View details", for category pages where the card is the detail.
 */
const CourseCatalogCard = ({ course, categoryId, label, headingLevel = 3, expanded = false, highlighted = false, id, className }) => {
  const { openEnquiry } = useEnquiry();
  const Heading = `h${headingLevel}`;
  const headingId = `${id ?? `${categoryId}-${course.id}`}-title`;
  const name = accessibleCourseName(course);

  return (
    <GlassCard
      as="article"
      id={id}
      interactive
      padding="none"
      className={cx(styles.card, expanded && styles.expanded, highlighted && styles.highlighted, className)}
      aria-labelledby={headingId}
    >
      <CourseVisual course={course} label={label ?? course.code} className={styles.visual} />
      <div className={styles.body}>
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

        <Heading id={headingId} className={styles.title}>{course.title}</Heading>

        {expanded ? (
          course.description.map((paragraph) => (
            <p key={paragraph} className={styles.description}>{paragraph}</p>
          ))
        ) : (
          <p className={cx(styles.description, styles.clamped)}>{course.description[0]}</p>
        )}

        <SoftwareChips software={course.software} limit={expanded ? undefined : SOFTWARE_PREVIEW} />

        <div className={styles.actions}>
          {!expanded && (
            <SecondaryButton to={courseHref(course, categoryId)} size="sm" icon={<LuArrowRight />} aria-label={`View details: ${name}`}>
              View details
            </SecondaryButton>
          )}
          <PrimaryButton size="sm" onClick={() => openEnquiry(course.enquiry.value)} aria-label={`Enquire Now about ${name}`}>
            Enquire Now
          </PrimaryButton>
        </div>
      </div>
    </GlassCard>
  );
};

export default CourseCatalogCard;
