import React from 'react';
import { Link } from 'react-router-dom';
import { LuArrowRight, LuPhone } from 'react-icons/lu';
import { FaFacebookF, FaInstagram, FaWhatsapp } from 'react-icons/fa';
import { ROUTES } from '../../routes';
import { phone, social, whatsappUrl } from '../../data/site';
import { featuredCourses, HOME_SECTIONS, homeHash } from '../../data/home';
import { useEnquiry } from '../enquiry/EnquiryProvider';
import { Container } from '../ui';
import maacLogo from '../../images/maac.png';
import styles from './Footer.module.css';

const exploreLinks = [
  { label: 'Home', to: ROUTES.home },
  { label: 'About MAAC', to: ROUTES.about },
  { label: 'All courses', to: ROUTES.courses },
  { label: 'Student Showcase', to: ROUTES.showcase },
  { label: 'Placements', to: ROUTES.placement },
  { label: 'FAQs', to: homeHash(HOME_SECTIONS.faq) },
  { label: 'Contact', to: ROUTES.contact },
];

const socialLinks = [
  { label: 'MAAC Mathura on Instagram', href: social.instagram, icon: FaInstagram },
  { label: 'MAAC Mathura on Facebook', href: social.facebook, icon: FaFacebookF },
  { label: 'Chat with MAAC Mathura on WhatsApp', href: social.whatsapp, icon: FaWhatsapp },
];

const Footer = () => {
  const { openEnquiry } = useEnquiry();

  return (
    <footer className={styles.footer}>
      <Container>
        <div className={styles.grid}>
          <div className={styles.brandColumn}>
            <Link to={ROUTES.home} className={styles.brand}>
              <img src={maacLogo} alt="MAAC Mathura home" width="206" height="76" className={styles.logo} />
            </Link>
            <p className={styles.about}>
              MAAC is the high-end 3D Animation &amp; VFX education vertical of Aptech Ltd. Through its wide network of
              centres, MAAC has prepared thousands of students for careers in Animation, VFX, Filmmaking, Gaming, Web
              and Graphic Design.
            </p>
            <ul className={styles.social}>
              {socialLinks.map(({ label, href, icon: Icon }) => (
                <li key={label}>
                  <a href={href} target="_blank" rel="noopener noreferrer" className={styles.socialLink} aria-label={`${label} (opens in a new tab)`}>
                    <Icon aria-hidden="true" />
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <nav aria-labelledby="footer-courses">
            <h2 id="footer-courses" className={styles.heading}>Courses</h2>
            <ul className={styles.links}>
              {featuredCourses.map((course) => (
                <li key={course.id}><Link to={course.path} className={styles.link}>{course.title}</Link></li>
              ))}
            </ul>
          </nav>

          <nav aria-labelledby="footer-explore">
            <h2 id="footer-explore" className={styles.heading}>Explore</h2>
            <ul className={styles.links}>
              {exploreLinks.map((link) => (
                <li key={link.label}><Link to={link.to} className={styles.link}>{link.label}</Link></li>
              ))}
            </ul>
          </nav>

          <div>
            <h2 className={styles.heading}>Get in touch</h2>
            <ul className={styles.links}>
              <li>
                <a href={`tel:${phone.tel}`} className={styles.contactLink}>
                  <LuPhone aria-hidden="true" /> {phone.display}
                </a>
              </li>
              <li>
                <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" className={styles.contactLink}>
                  <FaWhatsapp aria-hidden="true" /> WhatsApp us
                </a>
              </li>
            </ul>
            <button type="button" className={styles.enquire} onClick={() => openEnquiry()}>
              Enquire Now <LuArrowRight aria-hidden="true" />
            </button>
          </div>
        </div>

        <div className={styles.bottom}>
          <p>© {new Date().getFullYear()} MAAC Mathura. All rights reserved.</p>
          <p>Company logos and course artwork belong to their respective owners.</p>
        </div>
      </Container>
    </footer>
  );
};

export default Footer;
