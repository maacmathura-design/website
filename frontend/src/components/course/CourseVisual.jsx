import React from 'react';
import { uniqueSoftware } from '../../data/courses';
import { cx } from '../../utils/cx';
import ResponsiveImage from '../media/ResponsiveImage';
import styles from './CourseVisual.module.css';

const POSTER_LOGOS = 3;

/**
 * Card artwork. Advanced programmes use their original banner; other courses have no artwork
 * of their own, so they get a poster built from the logos of the software they teach.
 */
const CourseVisual = ({ course, label, sizes = '(min-width: 1024px) 400px, (min-width: 640px) 50vw, 100vw', className }) => {
  const { artwork } = course;
  const logos = uniqueSoftware(course.software).filter((item) => item.icon).slice(0, POSTER_LOGOS);

  return (
    <div className={cx(styles.visual, !artwork && styles.poster, className)}>
      {artwork ? (
        <ResponsiveImage
          artwork={artwork}
          sizes={sizes}
          alt=""
          loading="lazy"
          className={styles.image}
          style={{ objectPosition: artwork.focus }}
        />
      ) : (
        <ul className={styles.logos} aria-hidden="true">
          {logos.map((item) => (
            <li key={item.name} className={styles.logo}>
              <img src={item.icon} alt="" loading="lazy" decoding="async" />
            </li>
          ))}
        </ul>
      )}
      {label && <span className={styles.label}>{label}</span>}
    </div>
  );
};

export default CourseVisual;
