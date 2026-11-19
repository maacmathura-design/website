export const easeOut = [0.22, 1, 0.36, 1];

export const transitions = {
  quick: { duration: 0.18, ease: easeOut },
  base: { duration: 0.3, ease: easeOut },
  reveal: { duration: 0.6, ease: easeOut },
  spring: { type: 'spring', stiffness: 420, damping: 30, mass: 0.8 },
};

export const pressable = {
  whileHover: { y: -2 },
  whileTap: { scale: 0.97, y: 0 },
  transition: transitions.spring,
};

export const liftOnHover = {
  whileHover: { y: -6 },
  transition: transitions.spring,
};

export const revealVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0 },
};

export const fadeVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
};

export const modalVariants = {
  hidden: { opacity: 0, y: 24, scale: 0.98 },
  visible: { opacity: 1, y: 0, scale: 1 },
  exit: { opacity: 0, y: 16, scale: 0.98 },
};
