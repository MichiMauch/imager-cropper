'use client';

import { AnimatePresence } from 'framer-motion';
import { usePathname } from 'next/navigation';
import { ReactNode, useEffect, useRef } from 'react';
import { useNavigation } from '../contexts/NavigationContext';
import PageTransition, { TransitionDirection } from './PageTransition';

interface TransitionLayoutProps {
  children: ReactNode;
}

// Map routes to their order for determining direction
const getRouteOrder = (path: string): number => {
  const routeOrder = ['/', '/upload', '/shapes', '/custom-draw', '/crop', '/download'];
  return routeOrder.indexOf(path);
};

export default function TransitionLayout({ children }: TransitionLayoutProps) {
  const pathname = usePathname();
  const { transitionDirection, setTransitionDirection } = useNavigation();
  const previousPathnameRef = useRef<string | null>(null);

  useEffect(() => {
    // Always use 'left' direction - page exits right, new page enters from left
    setTransitionDirection('left');
    previousPathnameRef.current = pathname;
  }, [pathname, setTransitionDirection]);

  return (
    <AnimatePresence mode="wait" initial={false}>
      <PageTransition 
        key={pathname} 
        direction={transitionDirection}
        duration={0.8}
      >
        {children}
      </PageTransition>
    </AnimatePresence>
  );
}