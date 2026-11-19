import React from 'react';
import { LuArrowRight, LuPhone } from 'react-icons/lu';
import { GlassCard, PrimaryButton, SecondaryButton, SectionHeading } from '../ui';
import { ROUTES } from '../../routes';
import { phone } from '../../data/site';
import { cx } from '../../utils/cx';
import styles from './EnquiryCTA.module.css';

/**
 * Admissions call to action. Without `onEnquire` the primary button links to the contact page;
 * pass `onEnquire` to open the enquiry form in place instead.
 */
const EnquiryCTA = ({
  eyebrow = 'Admissions',
  title = 'Start your creative career at MAAC Mathura',
  description = 'Tell us which course interests you and leave your details. MAAC Mathura will contact you about the next steps.',
  enquireLabel = 'Send an enquiry',
  onEnquire,
  headingLevel = 2,
  className,
}) => {
  const enquireProps = onEnquire ? { onClick: onEnquire } : { to: ROUTES.contact };

  return (
    <GlassCard as="aside" padding="lg" className={cx(styles.cta, className)}>
      <SectionHeading eyebrow={eyebrow} title={title} description={description} level={headingLevel} size="md" />
      <div className={styles.actions}>
        <PrimaryButton size="lg" icon={<LuArrowRight />} {...enquireProps}>
          {enquireLabel}
        </PrimaryButton>
        <SecondaryButton size="lg" href={`tel:${phone.tel}`} iconLeading={<LuPhone />}>
          Call {phone.display}
        </SecondaryButton>
      </div>
    </GlassCard>
  );
};

export default EnquiryCTA;
