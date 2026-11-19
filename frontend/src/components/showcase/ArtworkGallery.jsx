import React, { useEffect, useState } from 'react';
import { LuChevronLeft, LuChevronRight, LuZoomIn } from 'react-icons/lu';
import { AnimatedSection, Modal, RevealItem, SecondaryButton } from '../ui';
import styles from './ArtworkGallery.module.css';

const Lightbox = ({ items, index, caption, onClose, onChange }) => {
  const open = index !== null;
  const item = open ? items[index] : null;
  const count = items.length;
  const go = (step) => onChange((index + step + count) % count);

  useEffect(() => {
    if (!open) return undefined;
    const onKeyDown = (event) => {
      if (event.key === 'ArrowRight') onChange((current) => (current + 1) % count);
      if (event.key === 'ArrowLeft') onChange((current) => (current - 1 + count) % count);
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [open, count, onChange]);

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Student artwork"
      description={open ? `Image ${index + 1} of ${count}` : undefined}
      size="lg"
      bodyClassName={styles.lightboxBody}
    >
      {item && (
        <>
          <figure className={styles.figure}>
            <img key={item.id} src={item.src} alt={item.alt} width={item.width} height={item.height} className={styles.preview} />
            {caption && <figcaption className={styles.caption}>{caption}</figcaption>}
          </figure>
          <div className={styles.lightboxNav}>
            <SecondaryButton size="sm" iconLeading={<LuChevronLeft />} onClick={() => go(-1)}>Previous</SecondaryButton>
            <SecondaryButton size="sm" icon={<LuChevronRight />} onClick={() => go(1)}>Next</SecondaryButton>
          </div>
        </>
      )}
    </Modal>
  );
};

/** Justified grid of artwork thumbnails; each opens a keyboard-navigable lightbox. */
const ArtworkGallery = ({ items, caption }) => {
  const [activeIndex, setActiveIndex] = useState(null);

  return (
    <>
      <AnimatedSection as="ul" stagger={0.04} amount={0.05} className={styles.grid}>
        {items.map((item, index) => (
          <RevealItem as="li" key={item.id} className={styles.cell} style={{ '--ratio': item.width / item.height }}>
            <button type="button" className={styles.thumb} onClick={() => setActiveIndex(index)} aria-label={`View ${item.alt.toLowerCase()} larger`}>
              <img src={item.src} alt="" width={item.width} height={item.height} loading="lazy" decoding="async" className={styles.image} />
              <span className={styles.zoom} aria-hidden="true"><LuZoomIn /></span>
            </button>
          </RevealItem>
        ))}
      </AnimatedSection>

      <Lightbox items={items} index={activeIndex} caption={caption} onClose={() => setActiveIndex(null)} onChange={setActiveIndex} />
    </>
  );
};

export default ArtworkGallery;
