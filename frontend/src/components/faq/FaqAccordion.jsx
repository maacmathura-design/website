import React, { useId, useState } from 'react';
import { AnimatePresence, m } from 'framer-motion';
import { LuPlus } from 'react-icons/lu';
import { transitions } from '../../motion/presets';
import { cx } from '../../utils/cx';
import styles from './FaqAccordion.module.css';

const panelMotion = {
  initial: { height: 0, opacity: 0 },
  animate: { height: 'auto', opacity: 1 },
  exit: { height: 0, opacity: 0 },
  transition: transitions.base,
};

const FaqItem = ({ faq, open, onToggle, headingLevel }) => {
  const id = useId();
  const Heading = `h${headingLevel}`;
  return (
    <li className={cx(styles.item, open && styles.open)}>
      <Heading className={styles.heading}>
        <button
          type="button"
          id={`${id}-button`}
          className={styles.trigger}
          aria-expanded={open}
          aria-controls={`${id}-panel`}
          onClick={onToggle}
        >
          <span>{faq.question}</span>
          <span className={styles.icon} aria-hidden="true"><LuPlus /></span>
        </button>
      </Heading>
      <AnimatePresence initial={false}>
        {open && (
          <m.div
            id={`${id}-panel`}
            role="region"
            aria-labelledby={`${id}-button`}
            className={styles.panel}
            {...panelMotion}
          >
            <p className={styles.answer}>{faq.answer}</p>
          </m.div>
        )}
      </AnimatePresence>
    </li>
  );
};

const FaqAccordion = ({ faqs, headingLevel = 3, defaultOpen = 0, className }) => {
  const [openIndex, setOpenIndex] = useState(defaultOpen);
  return (
    <ul className={cx(styles.list, className)}>
      {faqs.map((faq, index) => (
        <FaqItem
          key={faq.question}
          faq={faq}
          headingLevel={headingLevel}
          open={openIndex === index}
          onToggle={() => setOpenIndex((current) => (current === index ? null : index))}
        />
      ))}
    </ul>
  );
};

export default FaqAccordion;
