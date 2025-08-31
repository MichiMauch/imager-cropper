'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';
import { ShapeTemplate, Point } from '../lib/shapes';

export type Step = 'upload' | 'shapes' | 'custom-draw' | 'crop' | 'download';

interface AppState {
  // Core state
  imageFile: File | null;
  selectedShape: ShapeTemplate | null;
  croppedCanvas: HTMLCanvasElement | null;
  currentStep: Step;
  
  // Custom shape state
  customPoints: Point[];
  customCanvasSize: { width: number; height: number } | null;
  showCustomEditor: boolean;
  showSaveShapeDialog: boolean;
}

interface AppContextType extends AppState {
  // State setters
  setImageFile: (file: File | null) => void;
  setSelectedShape: (shape: ShapeTemplate | null) => void;
  setCroppedCanvas: (canvas: HTMLCanvasElement | null) => void;
  setCurrentStep: (step: Step) => void;
  setCustomPoints: (points: Point[]) => void;
  setCustomCanvasSize: (size: { width: number; height: number } | null) => void;
  setShowCustomEditor: (show: boolean) => void;
  setShowSaveShapeDialog: (show: boolean) => void;
  
  // Helper actions
  resetApp: () => void;
  goToNextStep: () => void;
  goToPreviousStep: () => void;
}

const initialState: AppState = {
  imageFile: null,
  selectedShape: null,
  croppedCanvas: null,
  currentStep: 'upload',
  customPoints: [],
  customCanvasSize: null,
  showCustomEditor: false,
  showSaveShapeDialog: false,
};

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AppState>(initialState);

  const setImageFile = (file: File | null) => {
    setState(prev => ({ ...prev, imageFile: file }));
  };

  const setSelectedShape = (shape: ShapeTemplate | null) => {
    setState(prev => ({ ...prev, selectedShape: shape }));
  };

  const setCroppedCanvas = (canvas: HTMLCanvasElement | null) => {
    setState(prev => ({ ...prev, croppedCanvas: canvas }));
  };

  const setCurrentStep = (step: Step) => {
    setState(prev => ({ ...prev, currentStep: step }));
  };

  const setCustomPoints = (points: Point[]) => {
    setState(prev => ({ ...prev, customPoints: points }));
  };

  const setCustomCanvasSize = (size: { width: number; height: number } | null) => {
    setState(prev => ({ ...prev, customCanvasSize: size }));
  };

  const setShowCustomEditor = (show: boolean) => {
    setState(prev => ({ ...prev, showCustomEditor: show }));
  };

  const setShowSaveShapeDialog = (show: boolean) => {
    setState(prev => ({ ...prev, showSaveShapeDialog: show }));
  };

  const resetApp = () => {
    setState(initialState);
  };

  const stepOrder: Step[] = ['upload', 'shapes', 'custom-draw', 'crop', 'download'];

  const goToNextStep = () => {
    const currentIndex = stepOrder.indexOf(state.currentStep);
    if (currentIndex < stepOrder.length - 1) {
      const nextStep = stepOrder[currentIndex + 1];
      setCurrentStep(nextStep);
    }
  };

  const goToPreviousStep = () => {
    const currentIndex = stepOrder.indexOf(state.currentStep);
    if (currentIndex > 0) {
      const prevStep = stepOrder[currentIndex - 1];
      setCurrentStep(prevStep);
    }
  };

  const contextValue: AppContextType = {
    ...state,
    setImageFile,
    setSelectedShape,
    setCroppedCanvas,
    setCurrentStep,
    setCustomPoints,
    setCustomCanvasSize,
    setShowCustomEditor,
    setShowSaveShapeDialog,
    resetApp,
    goToNextStep,
    goToPreviousStep,
  };

  return (
    <AppContext.Provider value={contextValue}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}