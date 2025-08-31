'use client';

import { createContext, useContext, useState, ReactNode } from 'react';
import { TransitionDirection } from '../components/PageTransition';

interface NavigationContextType {
  transitionDirection: TransitionDirection;
  setTransitionDirection: (direction: TransitionDirection) => void;
  navigateWithDirection: (path: string, direction: TransitionDirection) => void;
}

const NavigationContext = createContext<NavigationContextType | undefined>(undefined);

export function NavigationProvider({ children }: { children: ReactNode }) {
  const [transitionDirection, setTransitionDirection] = useState<TransitionDirection>('right');

  const navigateWithDirection = (path: string, direction: TransitionDirection) => {
    setTransitionDirection(direction);
    // The actual navigation will be handled by the component calling this
  };

  return (
    <NavigationContext.Provider value={{
      transitionDirection,
      setTransitionDirection,
      navigateWithDirection
    }}>
      {children}
    </NavigationContext.Provider>
  );
}

export function useNavigation() {
  const context = useContext(NavigationContext);
  if (!context) {
    throw new Error('useNavigation must be used within NavigationProvider');
  }
  return context;
}