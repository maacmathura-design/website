import React from 'react';
import { Link } from 'react-router-dom';
import { ROUTES } from '../../routes';
import { courseCategories, courses } from '../../data/courses';
import { Container } from '../ui';
import { cx } from '../../utils/cx';
import styles from './CategoryNav.module.css';

export const ALL_COURSES = 'all';

const items = [
  { id: ALL_COURSES, label: 'All courses', to: ROUTES.courses, count: courses.length },
  ...courseCategories.map((category) => ({
    id: category.id,
    label: category.title,
    to: category.path,
    count: category.courses.length,
  })),
];

/** Category switcher shared by the catalogue and the category pages. */
const CategoryNav = ({ active }) => (
  <nav aria-label="Course categories" className={styles.nav}>
    <Container>
      <ul className={styles.list}>
        {items.map((item) => (
          <li key={item.id}>
            <Link
              to={item.to}
              className={cx(styles.link, item.id === active && styles.active)}
              aria-current={item.id === active ? 'page' : undefined}
            >
              {item.label}
              <span className={styles.count}>
                <span className="visually-hidden">(</span>
                {item.count}
                <span className="visually-hidden"> courses)</span>
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </Container>
  </nav>
);

export default CategoryNav;
