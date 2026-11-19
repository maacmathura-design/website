import React from 'react';
import { LuClock, LuMail, LuMapPin, LuPhone } from 'react-icons/lu';
import { FaFacebookF, FaInstagram, FaWhatsapp } from 'react-icons/fa';
import { contactDetails } from '../data/contact';
import { hero } from '../data/home';
import { ROUTES } from '../routes';
import { pageDescriptions, pageTitles } from '../data/seo';
import usePageMeta from '../hooks/usePageMeta';
import { useEnquiry } from '../components/enquiry/EnquiryProvider';
import { GlassCard, PrimaryButton, SecondaryButton } from '../components/ui';
import PageHero from '../components/course/PageHero';
import PageNav from '../components/layout/PageNav';
import Section from '../components/home/Section';
import EnquirySection from '../components/home/EnquirySection';
import styles from './ContactPage.module.css';

const { phone, whatsappUrl, email, address, hours, mapEmbedUrl, channels } = contactDetails;

const ICONS = {
  instagram: FaInstagram,
  facebook: FaFacebookF,
};

const NAV = [
  { href: '#contact-details', label: 'Contact details' },
  { href: '#enquire', label: 'Admission enquiry' },
];

const Detail = ({ icon: Icon, label, value, href, external = false }) => {
  const inner = (
    <>
      <span className={styles.icon} aria-hidden="true"><Icon /></span>
      <span>
        <span className={styles.label}>{label}</span>
        <span className={styles.value}>{value}</span>
      </span>
    </>
  );

  return (
    <li>
      <GlassCard padding="md" className={styles.card}>
        {href ? (
          <a
            href={href}
            className={styles.link}
            {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
          >
            {inner}
            {external && <span className="visually-hidden"> (opens in a new tab)</span>}
          </a>
        ) : (
          <div className={styles.link}>{inner}</div>
        )}
      </GlassCard>
    </li>
  );
};

const ContactPage = () => {
  const { openEnquiry } = useEnquiry();
  usePageMeta({
    title: pageTitles[ROUTES.contact],
    description: pageDescriptions[ROUTES.contact],
    path: ROUTES.contact,
    breadcrumbs: [
      { name: 'Home', path: ROUTES.home },
      { name: 'Contact', path: ROUTES.contact },
    ],
  });

  return (
    <>
      <PageHero
        artwork={hero.slides.find((slide) => slide.id === 'multimedia')}
        breadcrumbs={[{ label: 'Home', to: ROUTES.home }, { label: 'Contact' }]}
        eyebrow="Contact"
        title="Contact MAAC Mathura"
        description={`Call or WhatsApp the centre on ${phone.display}, or send an admission enquiry.`}
        facts={[{ icon: LuPhone, label: 'Phone', value: phone.display }]}
      >
        <PrimaryButton onClick={() => openEnquiry()}>Enquire Now</PrimaryButton>
        <SecondaryButton href={`tel:${phone.tel}`}>Call {phone.display}</SecondaryButton>
      </PageHero>

      <PageNav links={NAV} />

      <Section
        id="contact-details"
        eyebrow="Contact information"
        title="Talk to MAAC Mathura"
        description="Phone and WhatsApp are the contact details published for this centre."
      >
        <ul className={styles.list}>
          <Detail icon={LuPhone} label="Phone" value={phone.display} href={`tel:${phone.tel}`} />
          <Detail icon={FaWhatsapp} label="WhatsApp" value="Chat with our team" href={whatsappUrl} external />
          {email && <Detail icon={LuMail} label="Email" value={email} href={`mailto:${email}`} />}
          {channels.map((channel) => (
            <Detail
              key={channel.id}
              icon={ICONS[channel.id]}
              label={channel.label}
              value={channel.value}
              href={channel.href}
              external
            />
          ))}
          {address && <Detail icon={LuMapPin} label="Centre address" value={address} />}
          {hours && <Detail icon={LuClock} label="Opening hours" value={hours} />}
        </ul>
        {mapEmbedUrl && (
          <div className={styles.map}>
            <iframe title="Map showing the MAAC Mathura centre" src={mapEmbedUrl} loading="lazy" referrerPolicy="no-referrer" />
          </div>
        )}
      </Section>

      <EnquirySection eyebrow="Admission enquiry" title="Send an admission enquiry" />
    </>
  );
};

export default ContactPage;
