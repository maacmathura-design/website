import React, { useEffect, useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { LuMenu, LuPhone } from 'react-icons/lu';
import { ROUTES } from '../../routes';
import { phone } from '../../data/site';
import { useEnquiry } from '../enquiry/EnquiryProvider';
import { Container, PrimaryButton, ThemeToggle } from '../ui';
import { cx } from '../../utils/cx';
import CoursesMenu from './CoursesMenu';
import MobileMenu from './MobileMenu';
import maacLogo from '../../images/maac.png';
import styles from './Header.module.css';

const SCROLL_THRESHOLD = 24;

export const primaryLinks = [
  { label: 'Home', to: ROUTES.home, end: true },
  { label: 'About', to: ROUTES.about },
  { label: 'Courses', courses: true },
  { label: 'Student Showcase', to: ROUTES.showcase },
  { label: 'Placements', to: ROUTES.placement },
  { label: 'Contact', to: ROUTES.contact },
];

const navLinkClass = ({ isActive }) => cx(styles.navLink, isActive && styles.active);

const Header = () => {
  const { pathname } = useLocation();
  const { openEnquiry } = useEnquiry();
  const [scrolled, setScrolled] = useState(false);
  const [coursesOpen, setCoursesOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > SCROLL_THRESHOLD);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const overHero = pathname === ROUTES.home && !scrolled && !coursesOpen;

  return (
    <header
      className={cx(styles.header, overHero ? styles.overHero : styles.solid)}
      data-theme={overHero ? 'dark' : undefined}
    >
      <a href="#main" className={styles.skip}>Skip to main content</a>
      <Container className={styles.bar}>
        <Link to={ROUTES.home} className={styles.brand}>
          <img src={maacLogo} alt="MAAC Mathura home" width="206" height="76" className={styles.logo} />
        </Link>

        <nav aria-label="Primary" className={styles.nav}>
          <ul className={styles.navList}>
            {primaryLinks.map((link) => (
              <li key={link.label}>
                {link.courses ? (
                  <CoursesMenu open={coursesOpen} onOpenChange={setCoursesOpen} linkClassName={styles.navLink} />
                ) : link.anchor ? (
                  <Link to={link.to} className={styles.navLink}>{link.label}</Link>
                ) : (
                  <NavLink to={link.to} end={link.end} className={navLinkClass}>{link.label}</NavLink>
                )}
              </li>
            ))}
          </ul>
        </nav>

        <div className={styles.actions}>
          <a href={`tel:${phone.tel}`} className={styles.call} aria-label={`Call Now: ${phone.display}`}>
            <LuPhone aria-hidden="true" />
            <span className={styles.callLabel}>Call Now</span>
          </a>
          <ThemeToggle />
          <PrimaryButton size="sm" className={styles.enquire} onClick={() => openEnquiry()}>
            Enquire Now
          </PrimaryButton>
          <button
            type="button"
            className={styles.menuButton}
            aria-label="Open menu"
            aria-haspopup="dialog"
            aria-expanded={mobileOpen}
            onClick={() => setMobileOpen(true)}
          >
            <LuMenu aria-hidden="true" />
          </button>
        </div>
      </Container>

      <MobileMenu open={mobileOpen} onClose={() => setMobileOpen(false)} links={primaryLinks} />
    </header>
  );
};

export default Header;
