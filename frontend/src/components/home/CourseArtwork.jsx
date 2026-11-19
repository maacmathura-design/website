import React, { useEffect, useRef, useState } from 'react';
import { useInView, useReducedMotion } from 'framer-motion';

/**
 * Decorative clip. The file is requested only once the card is near the viewport,
 * and it plays only while visible. Reduced motion keeps it paused.
 */
const CourseArtwork = ({ src, className }) => {
  const videoRef = useRef(null);
  const inView = useInView(videoRef, { amount: 0.05, margin: '240px 0px' });
  const reduceMotion = useReducedMotion();
  const [activeSrc, setActiveSrc] = useState(null);

  useEffect(() => {
    if (inView) setActiveSrc(src);
  }, [inView, src]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !activeSrc) return undefined;
    if (inView && !reduceMotion) {
      video.play?.()?.catch?.(() => {});
    } else {
      video.pause?.();
    }
    return undefined;
  }, [inView, reduceMotion, activeSrc]);

  return (
    <video
      ref={videoRef}
      className={className}
      src={activeSrc ? `${activeSrc}#t=0.1` : undefined}
      muted
      loop
      playsInline
      preload={activeSrc ? 'metadata' : 'none'}
      aria-hidden="true"
      tabIndex={-1}
      disablePictureInPicture
    />
  );
};

export default CourseArtwork;
