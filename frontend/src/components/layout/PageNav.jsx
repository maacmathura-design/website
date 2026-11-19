import React from 'react';
import styles from './PageNav.module.css';

/** Horizontal in-page links. Shared by the secondary pages. */
const PageNav = ({ links, label = 'On this page' }) => (
  <nav aria-label={label} className={styles.nav}>
    <ul>
      {links.map((link) => (
        <li key={link.href}>
          <a href={link.href}>{link.label}</a>
        </li>
      ))}
    </ul>
  </nav>
);

export default PageNav;
