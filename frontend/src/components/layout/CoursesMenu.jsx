import React, { useEffect, useId, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { AnimatePresence, m } from 'framer-motion';
import { LuArrowRight, LuChevronDown, LuPhone } from 'react-icons/lu';
import { ROUTES } from '../../routes';
import { phone } from '../../data/site';
import { featuredCourses } from '../../data/home';
import { useEnquiry } from '../enquiry/EnquiryProvider';
import { Container, PrimaryButton } from '../ui';
import { transitions } from '../../motion/presets';
import { cx } from '../../utils/cx';
import styles from './CoursesMenu.module.css';

const HOVER_CLOSE_DELAY_MS = 160;
const advanced = featuredCourses.slice(0, 4);
const career = featuredCourses.slice(4);

const panelMotion = {
  initial: { opacity: 0, y: -8 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -8 },
  transition: transitions.quick,
};

const CourseLink = ({ course }) => (
  <Link to={course.path} className={styles.courseLink}>
    <span className={styles.courseCode}>{course.code}</span>
    <span className={styles.courseTitle}>{course.title}</span>
    <span className={styles.courseMeta}>{course.duration} · {course.skillLevel}</span>
  </Link>
);

const CoursesMenu = ({ open, onOpenChange, linkClassName }) => {
  const { key } = useLocation();
  const { openEnquiry } = useEnquiry();
  const panelId = useId();
  const rootRef = useRef(null);
  const buttonRef = useRef(null);
  const closeTimer = useRef();
  const hoverCapable = useRef(false);

  useEffect(() => {
    hoverCapable.current = window.matchMedia?.('(hover: hover) and (pointer: fine)').matches ?? false;
  }, []);

  useEffect(() => {
    onOpenChange(false);
  }, [key, onOpenChange]);

  useEffect(() => {
    if (!open) return undefined;
    const onPointerDown = (event) => {
      if (!rootRef.current?.contains(event.target)) onOpenChange(false);
    };
    const onKeyDown = (event) => {
      if (event.key !== 'Escape') return;
      onOpenChange(false);
      buttonRef.current?.focus();
    };
    document.addEventListener('pointerdown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('pointerdown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [open, onOpenChange]);

  useEffect(() => () => clearTimeout(closeTimer.current), []);

  const handlePointerEnter = () => {
    if (!hoverCapable.current) return;
    clearTimeout(closeTimer.current);
    onOpenChange(true);
  };

  const handlePointerLeave = () => {
    if (!hoverCapable.current) return;
    closeTimer.current = setTimeout(() => onOpenChange(false), HOVER_CLOSE_DELAY_MS);
  };

  const handleBlur = (event) => {
    if (!rootRef.current?.contains(event.relatedTarget)) onOpenChange(false);
  };

  return (
    <div ref={rootRef} onMouseEnter={handlePointerEnter} onMouseLeave={handlePointerLeave} onBlur={handleBlur}>
      <button
        ref={buttonRef}
        type="button"
        className={linkClassName}
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => onOpenChange(!open)}
      >
        Courses
        <LuChevronDown aria-hidden="true" className={cx(styles.chevron, open && styles.chevronOpen)} />
      </button>

      <AnimatePresence>
        {open && (
          <m.div id={panelId} className={styles.panel} {...panelMotion}>
            <Container className={styles.grid}>
              <section aria-labelledby={`${panelId}-advanced`}>
                <h2 id={`${panelId}-advanced`} className={styles.heading}>Advanced programmes</h2>
                <ul className={styles.list}>
                  {advanced.map((course) => (
                    <li key={course.id}><CourseLink course={course} /></li>
                  ))}
                </ul>
              </section>

              <section aria-labelledby={`${panelId}-career`}>
                <h2 id={`${panelId}-career`} className={styles.heading}>Specialised &amp; career courses</h2>
                <ul className={cx(styles.list, styles.listSingle)}>
                  {career.map((course) => (
                    <li key={course.id}><CourseLink course={course} /></li>
                  ))}
                </ul>
                <Link to={ROUTES.courses} className={styles.allCourses}>
                  View all courses <LuArrowRight aria-hidden="true" />
                </Link>
              </section>

              <aside className={styles.promo} aria-labelledby={`${panelId}-promo`}>
                <h2 id={`${panelId}-promo`} className={styles.promoTitle}>Not sure where to start?</h2>
                <p className={styles.promoText}>
                  Ask the MAAC Mathura team about courses, fees, duration and career opportunities.
                </p>
                <PrimaryButton
                  size="sm"
                  onClick={() => {
                    onOpenChange(false);
                    openEnquiry();
                  }}
                >
                  Enquire Now
                </PrimaryButton>
                <a href={`tel:${phone.tel}`} className={styles.promoCall}>
                  <LuPhone aria-hidden="true" /> {phone.display}
                </a>
              </aside>
            </Container>
          </m.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default CoursesMenu;
