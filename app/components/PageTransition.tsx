'use client';

import { motion } from 'framer-motion';
import { ReactNode } from 'react';

export type TransitionDirection = 'right' | 'left' | 'up' | 'down';

interface PageTransitionProps {
  children: ReactNode;
  direction?: TransitionDirection;
  duration?: number;
}

const getTransitionVariants = (direction: TransitionDirection) => {
  const variants = {
    right: {
      initial: { x: '100%', opacity: 0 },
      animate: { x: 0, opacity: 1 },
      exit: { x: '-100%', opacity: 0 }
    },
    left: {
      initial: { x: '-100%', opacity: 0 },
      animate: { x: 0, opacity: 1 },
      exit: { x: '100%', opacity: 0 }
    },
    up: {
      initial: { y: '100%', opacity: 0 },
      animate: { y: 0, opacity: 1 },
      exit: { y: '-100%', opacity: 0 }
    },
    down: {
      initial: { y: '-100%', opacity: 0 },
      animate: { y: 0, opacity: 1 },
      exit: { y: '100%', opacity: 0 }
    }
  };
  
  return variants[direction];
};

export default function PageTransition({ 
  children, 
  direction = 'right',
  duration = 0.7
}: PageTransitionProps) {
  const variants = getTransitionVariants(direction);

  return (
    <motion.div
      initial={variants.initial}
      animate={variants.animate}
      exit={variants.exit}
      transition={{
        duration,
        ease: [0.25, 0.46, 0.45, 0.94], // Softer easing for more natural feel
        type: "tween"
      }}
      className="fixed inset-0 z-50"
      style={{
        willChange: 'transform, opacity'
      }}
    >
      {children}
    </motion.div>
  );
}