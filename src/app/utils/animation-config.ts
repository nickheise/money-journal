// Unified animation configuration for consistent, bouncy animations throughout the app
// Mobile-optimized for better performance on resource-constrained devices

export const spring = {
  // Snappy spring for quick UI responses (buttons, toggles)
  // Reduced stiffness for better mobile performance
  snappy: {
    type: "spring" as const,
    stiffness: 400,
    damping: 25,
    mass: 0.4,
  },
  // Bouncy spring for playful interactions (modals, dialogs)
  bouncy: {
    type: "spring" as const,
    stiffness: 500,
    damping: 22,
    mass: 0.5,
  },
  // Smooth spring for subtle movements
  smooth: {
    type: "spring" as const,
    stiffness: 300,
    damping: 30,
    mass: 0.5,
  },
  // Elastic spring for shared element transitions (layoutId)
  elastic: {
    type: "spring" as const,
    stiffness: 500,
    damping: 25,
    mass: 0.4,
  },
  // Gentle spring for large elements
  gentle: {
    type: "spring" as const,
    stiffness: 250,
    damping: 28,
    mass: 0.6,
  },
};

// Duration-based transitions for simple animations
export const duration = {
  fast: 0.15,
  normal: 0.2,
  slow: 0.3,
};

// Helper to respect reduced motion preferences
export function getTransition(
  springConfig: typeof spring[keyof typeof spring],
  prefersReducedMotion: boolean = false
) {
  return prefersReducedMotion 
    ? { duration: 0.01 } 
    : springConfig;
}

// Legacy exports for backward compatibility
export const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 },
  transition: spring.bouncy,
};

export const fadeInScale = {
  initial: { opacity: 0, scale: 0.95 },
  animate: { opacity: 1, scale: 1 },
  exit: { opacity: 0, scale: 0.95 },
  transition: spring.bouncy,
};

export const fadeIn = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
  transition: spring.smooth,
};

export const scaleIn = {
  initial: { scale: 0.9, opacity: 0 },
  animate: { scale: 1, opacity: 1 },
  exit: { scale: 0.9, opacity: 0 },
  transition: spring.bouncy,
};

export const slideInFromRight = {
  initial: { x: 50, opacity: 0 },
  animate: { x: 0, opacity: 1 },
  exit: { x: -50, opacity: 0 },
  transition: spring.smooth,
};

export const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.07,
    },
  },
};

export const staggerItem = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: spring.bouncy,
};

// Hover and tap animations for interactive elements
export const hoverScale = {
  scale: 1.05,
  transition: spring.snappy,
};

export const tapScale = {
  scale: 0.95,
  transition: spring.snappy,
};

// Modal animations with elastic bounce
export const modalBackdrop = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
  transition: { duration: 0.2 },
};

export const modalContent = {
  initial: { opacity: 0, scale: 0.92, y: 30 },
  animate: { opacity: 1, scale: 1, y: 0 },
  exit: { opacity: 0, scale: 0.95, y: 20 },
  transition: spring.elastic,
};

// Dialog animation - consistent elastic bounce for all dialogs
export const dialog = {
  backdrop: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
    transition: { duration: 0.15 },
  },
  content: {
    initial: { opacity: 0, scale: 0.9 },
    animate: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 0.95 },
    transition: spring.elastic,
  },
};