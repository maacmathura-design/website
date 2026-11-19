import React, { useEffect, useId, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { AnimatePresence, m } from 'framer-motion';
import { LuChevronDown, LuPhone, LuX } from 'react-icons/lu';
import { FaWhatsapp } from 'react-icons/fa';
import { ROUTES } from '../../routes';
import { phone, whatsappUrl } from '../../data/site';
import { featuredCourses } from '../../data/home';
import { useDialogBehaviour } from '../../hooks/useDialogBehaviour';
import { useEnquiry } from '../enquiry/EnquiryProvider';
import { PrimaryButton, SecondaryButton } from '../ui';
import { fadeVariants, transitions } from '../../motion/presets';
import { cx } from '../../utils/cx';
import maacLogo from '../../images/maac.png';
import styles from './MobileMenu.module.css';

const drawerVariants = {
  hidden: { x: '100%' },
  visible: { x: 0 },
};

const MobileMenu = ({ open, onClose, links }) => {
  const { key } = useLocation();
  const { openEnquiry } = useEnquiry();
  const drawerRef = useRef(null);
  const coursesId = useId();
  const [coursesOpen, setCoursesOpen] = useState(false);
  useDialogBehaviour(open, drawerRef, onClose);

  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;
  useEffect(() => {
    onCloseRef.current();
  }, [key]);

  useEffect(() => {
    if (!open) setCoursesOpen(false);
  }, [open]);

  const linkClass = ({ isActive }) => cx(styles.link, isActive && styles.active);

  return createPortal(
    <AnimatePresence>
      {open && (
        <div className={styles.root}>
          <m.div
            className={styles.backdrop}
            variants={fadeVariants}
            initial="hidden"
            animate="visible"
            exit="hidden"
            transition={transitions.base}
            onClick={onClose}
          />
          <m.div
            ref={drawerRef}
            role="dialog"
            aria-modal="true"
            aria-label="Site menu"
            tabIndex={-1}
            className={styles.drawer}
            variants={drawerVariants}
            initial="hidden"
            animate="visible"
            exit="hidden"
            transition={transitions.base}
          >
            <div className={styles.top}>
              <Link to={ROUTES.home} className={styles.brand}>
                <img src={maacLogo} alt="MAAC Mathura home" width="206" height="76" className={styles.logo} />
              </Link>
              <button type="button" className={styles.close} onClick={onClose} aria-label="Close menu">
                <LuX aria-hidden="true" />
              </button>
            </div>

            <nav aria-label="Mobile" className={styles.nav}>
              <ul className={styles.list}>
                {links.map((link) => (
                  <li key={link.label}>
                    {link.courses ? (
                      <>
                        <button
                          type="button"
                          className={styles.link}
                          aria-expanded={coursesOpen}
                          aria-controls={coursesId}
                          onClick={() => setCoursesOpen((value) => !value)}
                        >
                          Courses
                          <LuChevronDown aria-hidden="true" className={cx(styles.chevron, coursesOpen && styles.chevronOpen)} />
                        </button>
                        <ul id={coursesId} className={styles.subList} hidden={!coursesOpen}>
                          {featuredCourses.map((course) => (
                            <li key={course.id}>
                              <Link to={course.path} className={styles.subLink}>
                                <span>{course.title}</span>
                                <span className={styles.subMeta}>{course.duration}</span>
                              </Link>
                            </li>
                          ))}
                          <li>
                            <Link to={ROUTES.courses} className={cx(styles.subLink, styles.allCourses)}>View all courses</Link>
                          </li>
                        </ul>
                      </>
                    ) : link.anchor ? (
                      <Link to={link.to} className={styles.link}>{link.label}</Link>
                    ) : (
                      <NavLink to={link.to} end={link.end} className={linkClass}>{link.label}</NavLink>
                    )}
                  </li>
                ))}
              </ul>
            </nav>

            <div className={styles.footer}>
              <PrimaryButton
                fullWidth
                onClick={() => {
                  onClose();
                  openEnquiry();
                }}
              >
                Enquire Now
              </PrimaryButton>
              <div className={styles.contactRow}>
                <SecondaryButton href={`tel:${phone.tel}`} iconLeading={<LuPhone />} fullWidth>
                  Call Now
                </SecondaryButton>
                <SecondaryButton href={whatsappUrl} target="_blank" rel="noopener noreferrer" iconLeading={<FaWhatsapp />} fullWidth>
                  WhatsApp
                </SecondaryButton>
              </div>
              <p className={styles.phone}>{phone.display}</p>
            </div>
          </m.div>
        </div>
      )}
    </AnimatePresence>,
    document.body,
  );
};

export default MobileMenu;
