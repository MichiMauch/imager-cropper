'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { useApp } from '../contexts/AppContext';
import { useToast } from '../hooks/useToast';
import ShapeSelector from '../components/ShapeSelector';
import { ToastContainer } from '../components/Toast';
import { ShapeTemplate } from '../lib/shapes';

export default function ShapesPage() {
  const router = useRouter();
  const { 
    imageFile, 
    selectedShape, 
    setSelectedShape, 
    setCurrentStep, 
    setCustomPoints,
    setCustomCanvasSize,
    setShowCustomEditor 
  } = useApp();
  
  const { toasts, removeToast, success, error: showError, confirm } = useToast();

  // Redirect if no image
  useEffect(() => {
    if (!imageFile) {
      router.push('/upload');
    }
  }, [imageFile, router]);

  const handleShapeSelect = (shape: ShapeTemplate) => {
    setSelectedShape(shape);
    setShowCustomEditor(false);
    
    // If this is a saved custom shape, open the editor for editing
    if (shape.isCustom && shape.customPoints) {
      setCustomPoints(shape.customPoints);
      // Try to get canvas size from the shape's metadata or calculate it
      if (shape.canvasSize) {
        setCustomCanvasSize(shape.canvasSize);
        setShowCustomEditor(true);
        setCurrentStep('custom-draw');
        router.push('/custom-draw');
      } else {
        // Fallback: calculate canvas size from image if available
        if (imageFile) {
          const img = new Image();
          const url = URL.createObjectURL(imageFile);
          img.onload = () => {
            // Use the same dimensions as in CustomShapeEditor
            const maxWidth = 700;
            const maxHeight = 500;
            const aspect = img.width / img.height;
            
            let width = maxWidth;
            let height = maxWidth / aspect;
            
            if (height > maxHeight) {
              height = maxHeight;
              width = maxHeight * aspect;
            }
            
            setCustomCanvasSize({ width, height });
            setShowCustomEditor(true);
            setCurrentStep('custom-draw');
            router.push('/custom-draw');
            URL.revokeObjectURL(url);
          };
          img.src = url;
        }
      }
    } else {
      // For standard shapes, clear custom data and go directly to crop
      setCustomPoints([]);
      setCustomCanvasSize(null);
      setShowCustomEditor(false);
      if (imageFile) {
        setCurrentStep('crop');
        router.push('/crop');
      }
    }
  };

  const handleCustomShapeClick = () => {
    setShowCustomEditor(true);
    setCurrentStep('custom-draw');
    router.push('/custom-draw');
  };

  const handleBack = () => {
    setCurrentStep('upload');
    router.push('/upload');
  };

  if (!imageFile) {
    return null; // Will redirect in useEffect
  }

  return (
    <div className="min-h-screen bg-black text-white overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gradient-to-br from-indigo-400/5 to-transparent rounded-full blur-3xl animate-floating"></div>
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-gradient-to-br from-violet-400/5 to-transparent rounded-full blur-3xl animate-floating delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-gradient-to-br from-slate-400/5 to-transparent rounded-full blur-3xl animate-floating delay-500"></div>
      </div>

      {/* Scrollable Content Container */}
      <div className="h-screen overflow-y-auto">
        <div className="flex items-center justify-center min-h-full">
          <div className="relative z-10 w-full max-w-6xl mx-auto px-8 py-12">
            {/* Header */}
            <div className="text-center mb-12">
              <h1 className="text-5xl font-black mb-6 tracking-tight leading-none">
                <span className="bg-gradient-to-r from-indigo-400 to-violet-500 bg-clip-text text-transparent">
                  SELECT SHAPE
                </span>
              </h1>
              
              <div className="text-xl text-gray-300 font-extralight tracking-wide opacity-80 animate-fadeIn">
                Choose a shape template or draw your own custom shape
              </div>
            </div>

            {/* Step Indicator */}
            <div className="flex items-center justify-center mb-12">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-indigo-700 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-500/20 subtle-shadow">
                  <span className="text-xl font-bold text-white">02</span>
                </div>
                <div className="text-2xl font-black text-indigo-400">
                  SHAPE SELECTION
                </div>
              </div>
            </div>

            {/* Shape Selector */}
            <div className="max-w-5xl mx-auto">
              <ShapeSelector 
                selectedShape={selectedShape}
                onShapeSelect={handleShapeSelect}
                onCustomShapeClick={handleCustomShapeClick}
                onShowSuccess={success}
                onShowError={showError}
                onShowConfirm={confirm}
              />
            </div>

            {/* Navigation */}
            <div className="flex justify-between items-center mt-12 max-w-5xl mx-auto">
              <button
                onClick={handleBack}
                className="px-8 py-4 bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-500 hover:to-gray-600 text-white font-medium rounded-xl shadow-lg transition-all duration-200 transform hover:scale-105 flex items-center space-x-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                <span>Back to Upload</span>
              </button>
              
              {selectedShape && !selectedShape.isCustom && (
                <button
                  onClick={() => {
                    setCurrentStep('crop');
                    router.push('/crop');
                  }}
                  className="px-8 py-4 bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700 text-white font-medium rounded-xl shadow-lg transition-all duration-200 transform hover:scale-105 flex items-center space-x-2"
                >
                  <span>Continue to Crop</span>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Toast Container */}
      <ToastContainer toasts={toasts} onClose={removeToast} />
    </div>
  );
}