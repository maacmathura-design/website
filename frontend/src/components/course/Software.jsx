import React, { useState } from 'react';
import { uniqueSoftware } from '../../data/courses';
import { cx } from '../../utils/cx';
import styles from './Software.module.css';

const initials = (name) =>
  name
    .replace(/^(Adobe|Autodesk|Blackmagic)\s+/i, '')
    .split(/\s+/)
    .map((word) => word[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

const SoftwareMark = ({ name, icon, className }) => {
  const [failed, setFailed] = useState(false);
  return (
    <span className={cx(styles.mark, className)} aria-hidden="true">
      {icon && !failed ? (
        <img src={icon} alt="" loading="lazy" decoding="async" onError={() => setFailed(true)} />
      ) : (
        <span className={styles.monogram}>{initials(name)}</span>
      )}
    </span>
  );
};

/** Compact pill list; `limit` collapses the rest into a "+N more" pill. */
export const SoftwareChips = ({ software, limit, label = 'Software covered', className }) => {
  const items = uniqueSoftware(software);
  const shown = limit ? items.slice(0, limit) : items;
  const hidden = items.length - shown.length;

  return (
    <div className={cx(styles.chipsRoot, className)}>
      <p className={styles.label}>{label}</p>
      <ul className={styles.chips}>
        {shown.map((item) => (
          <li key={item.name} className={styles.chip}>
            <SoftwareMark name={item.name} icon={item.icon} className={styles.chipMark} />
            <span>{item.name}</span>
          </li>
        ))}
        {hidden > 0 && (
          <li className={cx(styles.chip, styles.more)}>
            +{hidden} more<span className="visually-hidden"> software</span>
          </li>
        )}
      </ul>
    </div>
  );
};

/** Logo tiles for course detail pages. */
export const SoftwareGrid = ({ software, className }) => (
  <ul className={cx(styles.grid, className)}>
    {uniqueSoftware(software).map((item) => (
      <li key={item.name} className={styles.tile}>
        <SoftwareMark name={item.name} icon={item.icon} className={styles.tileMark} />
        <span className={styles.tileName}>{item.name}</span>
      </li>
    ))}
  </ul>
);
