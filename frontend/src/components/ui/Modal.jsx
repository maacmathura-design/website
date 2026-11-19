import React, { useId, useRef } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, m } from 'framer-motion';
import { LuX } from 'react-icons/lu';
import { useDialogBehaviour } from '../../hooks/useDialogBehaviour';
import { fadeVariants, modalVariants, transitions } from '../../motion/presets';
import { cx } from '../../utils/cx';
import styles from './Modal.module.css';

const Modal = ({ open, onClose, title, description, size = 'md', className, bodyClassName, children }) => {
  const dialogRef = useRef(null);
  const titleId = useId();
  const descriptionId = useId();
  useDialogBehaviour(open, dialogRef, onClose);

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
            ref={dialogRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
            aria-describedby={description ? descriptionId : undefined}
            tabIndex={-1}
            className={cx(styles.dialog, styles[size], className)}
            variants={modalVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            transition={transitions.spring}
          >
            <header className={styles.header}>
              <div>
                <h2 id={titleId} className={styles.title}>{title}</h2>
                {description && <p id={descriptionId} className={styles.description}>{description}</p>}
              </div>
              <button type="button" className={styles.close} onClick={onClose} aria-label="Close dialog">
                <LuX aria-hidden="true" />
              </button>
            </header>
            <div className={cx(styles.body, bodyClassName)}>{children}</div>
          </m.div>
        </div>
      )}
    </AnimatePresence>,
    document.body,
  );
};

export default Modal;
