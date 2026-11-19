import React from 'react';
import { LazyMotion, MotionConfig } from 'framer-motion';

// Animation features load in a separate chunk after first paint; `strict` keeps the full `motion` component out of the bundle.
const loadFeatures = () => import('./features').then((module) => module.default);

export function MotionProvider({ children }) {
  return (
    <LazyMotion features={loadFeatures} strict>
      <MotionConfig reducedMotion="user">{children}</MotionConfig>
    </LazyMotion>
  );
}
