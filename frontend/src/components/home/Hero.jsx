import React, { useEffect, useState } from 'react';
import { AnimatePresence, m, useReducedMotion } from 'framer-motion';
import { LuArrowRight, LuPause, LuPlay } from 'react-icons/lu';
import { hero, HOME_SECTIONS, homeHash } from '../../data/home';
import { useEnquiry } from '../enquiry/EnquiryProvider';
import { Container, PrimaryButton, SecondaryButton } from '../ui';
import { easeOut } from '../../motion/presets';
import { cx } from '../../utils/cx';
import styles from './Hero.module.css';

const SLIDE_INTERVAL_MS = 6500;
const { slides } = hero;

const contentVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.12, delayChildren: 0.15 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 28 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: easeOut } },
};

const Hero = () => {
  const reduceMotion = useReducedMotion();
  const { openEnquiry } = useEnquiry();
  const [index, setIndex] = useState(0);
  const [userPaused, setUserPaused] = useState(false);
  const playing = !userPaused && !reduceMotion;

  useEffect(() => {
    if (!playing) return undefined;
    const timer = setTimeout(() => setIndex((current) => (current + 1) % slides.length), SLIDE_INTERVAL_MS);
    return () => clearTimeout(timer);
  }, [index, playing]);

  useEffect(() => {
    const next = slides[(index + 1) % slides.length];
    const preload = new Image();
    preload.sizes = '100vw';
    const full = next.avif || next.webp || next.src;
    const small = next.avifSmall || next.webpSmall || next.srcSmall;
    preload.srcset = `${small} ${next.widthSmall}w, ${full} ${next.width}w`;
  }, [index]);

  const slide = slides[index];
  const imageMotion = reduceMotion
    ? { initial: false, animate: { opacity: 1 }, exit: { opacity: 0, transition: { duration: 0 } } }
    : {
        initial: { opacity: 0 },
        animate: { opacity: 1, transition: { duration: 1.2, ease: easeOut } },
        exit: { opacity: 0, transition: { duration: 1.2, ease: easeOut } },
      };

  return (
    <section className={styles.hero} aria-labelledby="hero-title">
      <div className={styles.media}>
        <AnimatePresence initial={false}>
          <m.picture key={slide.id} className={styles.frame} {...imageMotion}>
            {slide.avif && (
              <source
                type="image/avif"
                srcSet={[slide.avifSmall && `${slide.avifSmall} ${slide.widthSmall}w`, `${slide.avif} ${slide.width}w`].filter(Boolean).join(', ')}
                sizes="100vw"
              />
            )}
            {slide.webp && (
              <source
                type="image/webp"
                srcSet={[slide.webpSmall && `${slide.webpSmall} ${slide.widthSmall}w`, `${slide.webp} ${slide.width}w`].filter(Boolean).join(', ')}
                sizes="100vw"
              />
            )}
            <img
              className={styles.image}
              src={slide.src}
              srcSet={`${slide.srcSmall} ${slide.widthSmall}w, ${slide.src} ${slide.width}w`}
              sizes="100vw"
              width={slide.width}
              height={slide.height}
              alt=""
              fetchpriority={index === 0 ? 'high' : undefined}
              decoding="async"
              style={{ objectPosition: slide.focus }}
            />
          </m.picture>
        </AnimatePresence>
        <div className={styles.overlay} />
        <div className={styles.fade} />
      </div>

      <Container className={styles.inner} data-theme="dark">
        <m.div className={styles.content} variants={contentVariants} initial="hidden" animate="visible">
          <m.p className={styles.eyebrow} variants={itemVariants}>{hero.eyebrow}</m.p>
          <m.h1 id="hero-title" className={styles.title} variants={itemVariants}>
            Turn Your Creativity Into <span className={styles.highlight}>Your Career.</span>
          </m.h1>
          <m.p className={styles.description} variants={itemVariants}>{hero.description}</m.p>
          <m.div className={styles.actions} variants={itemVariants}>
            <PrimaryButton to={homeHash(HOME_SECTIONS.courses)} size="lg" icon={<LuArrowRight />}>
              Explore Courses
            </PrimaryButton>
            <SecondaryButton size="lg" onClick={() => openEnquiry()}>
              Enquire Now
            </SecondaryButton>
          </m.div>
        </m.div>

        <div className={styles.controls}>
          <div className={styles.tabs} role="group" aria-label="Featured disciplines">
            {slides.map((item, slideIndex) => (
              <button
                key={item.id}
                type="button"
                className={cx(styles.tab, slideIndex === index && styles.tabActive)}
                aria-pressed={slideIndex === index}
                onClick={() => setIndex(slideIndex)}
              >
                <span className={styles.tabBar}>
                  {slideIndex === index && playing && (
                    <span key={`${item.id}-${index}`} className={styles.tabProgress} style={{ animationDuration: `${SLIDE_INTERVAL_MS}ms` }} />
                  )}
                </span>
                <span className={styles.tabLabel}>{item.label}</span>
              </button>
            ))}
          </div>
          {!reduceMotion && (
            <button
              type="button"
              className={styles.pause}
              onClick={() => setUserPaused((value) => !value)}
              aria-label={userPaused ? 'Play background slideshow' : 'Pause background slideshow'}
            >
              {userPaused ? <LuPlay aria-hidden="true" /> : <LuPause aria-hidden="true" />}
            </button>
          )}
        </div>
      </Container>
    </section>
  );
};

export default Hero;
