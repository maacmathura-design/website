import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { m } from 'framer-motion';
import { LuMessageSquare, LuPhone } from 'react-icons/lu';
import { FaFacebookF, FaInstagram, FaWhatsapp } from 'react-icons/fa';
import { phone, social, whatsappUrl } from '../../data/site';
import { HOME_SECTIONS } from '../../data/home';
import { enquiryCourseForPage } from '../../data/courses';
import { useEnquiry } from '../enquiry/EnquiryProvider';
import { pressable } from '../../motion/presets';
import { cx } from '../../utils/cx';
import styles from './FloatingContact.module.css';

/** True while the page's own enquiry section is on screen, so the floating CTA can step aside. */
function useInlineEnquiryVisible(pathname) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    setVisible(false);
    const section = document.getElementById(HOME_SECTIONS.enquire);
    if (!section || typeof IntersectionObserver === 'undefined') return undefined;
    const observer = new IntersectionObserver(([entry]) => setVisible(entry.isIntersecting), { threshold: 0.2 });
    observer.observe(section);
    return () => observer.disconnect();
  }, [pathname]);

  return visible;
}

/**
 * Desktop: WhatsApp, Call, Facebook, Instagram and an "Enquire" pill floating bottom-right.
 * Mobile: a fixed bottom bar with the same actions.
 */
const FloatingContact = () => {
  const { openEnquiry } = useEnquiry();
  const { pathname, hash } = useLocation();
  const inlineFormVisible = useInlineEnquiryVisible(pathname);
  const course = enquiryCourseForPage(pathname, hash);

  return (
    <aside className={cx(styles.dock, inlineFormVisible && styles.formInView)} aria-label="Quick contact">
      <m.a
        href={whatsappUrl}
        target="_blank"
        rel="noopener noreferrer"
        className={cx(styles.round, styles.whatsapp)}
        aria-label="Chat with MAAC Mathura on WhatsApp (opens in a new tab)"
        data-tooltip="WhatsApp"
        {...pressable}
      >
        <FaWhatsapp aria-hidden="true" />
      </m.a>
      <m.a
        href={`tel:${phone.tel}`}
        className={styles.round}
        aria-label={`Call MAAC Mathura on ${phone.display}`}
        data-tooltip="Call"
        {...pressable}
      >
        <LuPhone aria-hidden="true" />
      </m.a>
      <m.a
        href={social.facebook}
        target="_blank"
        rel="noopener noreferrer"
        className={cx(styles.round, styles.facebook)}
        aria-label="MAAC Mathura on Facebook (opens in a new tab)"
        data-tooltip="Facebook"
        {...pressable}
      >
        <FaFacebookF aria-hidden="true" />
      </m.a>
      <m.a
        href={social.instagram}
        target="_blank"
        rel="noopener noreferrer"
        className={cx(styles.round, styles.instagram)}
        aria-label="MAAC Mathura on Instagram (opens in a new tab)"
        data-tooltip="Instagram"
        {...pressable}
      >
        <FaInstagram aria-hidden="true" />
      </m.a>
      <m.button
        type="button"
        className={styles.enquire}
        onClick={() => openEnquiry(course)}
        aria-haspopup="dialog"
        {...pressable}
      >
        <LuMessageSquare aria-hidden="true" />
        <span>Enquire Now</span>
      </m.button>
    </aside>
  );
};

export default FloatingContact;
