'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { useApp } from '../contexts/AppContext';
import CustomShapeEditor from '../components/CustomShapeEditor';
import { Point } from '../lib/shapes';

export default function CustomDrawPage() {
  const router = useRouter();
  const { 
    imageFile, 
    customPoints, 
    customCanvasSize,
    setSelectedShape,
    setCustomPoints,
    setCustomCanvasSize,
    setCurrentStep,
    setShowCustomEditor
  } = useApp();

  // Redirect if no image
  useEffect(() => {
    if (!imageFile) {
      router.push('/upload');
    }
  }, [imageFile, router]);

  const handleShapeComplete = (points: Point[]) => {
    setCustomPoints(points);
    
    // Get canvas size from the CustomShapeEditor - must match the editor dimensions
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
        
        // Create a temporary custom shape
        const customShape = {
          id: 'temp-custom',
          name: 'Custom Shape',
          icon: '✏️',
          type: 'custom' as const,
          isCustom: true,
          customPoints: points,
          canvasSize: { width, height },
          drawPath: () => {} // Custom shapes don't use drawPath
        };
        
        setSelectedShape(customShape);
        setCurrentStep('crop');
        router.push('/crop');
        
        URL.revokeObjectURL(url);
      };
      img.src = url;
    }
  };

  const handleCancel = () => {
    setShowCustomEditor(false);
    setCurrentStep('shapes');
    router.push('/shapes');
  };

  const handleBack = () => {
    setCurrentStep('shapes');
    router.push('/shapes');
  };

  if (!imageFile) {
    return null; // Will redirect in useEffect
  }

  return (
    <div className="min-h-screen bg-black text-white overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gradient-to-br from-violet-400/5 to-transparent rounded-full blur-3xl animate-floating"></div>
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-gradient-to-br from-indigo-400/5 to-transparent rounded-full blur-3xl animate-floating delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-gradient-to-br from-slate-400/5 to-transparent rounded-full blur-3xl animate-floating delay-500"></div>
      </div>

      {/* Scrollable Content Container */}
      <div className="h-screen overflow-y-auto">
        <div className="flex flex-col min-h-full">
          {/* Header */}
          <div className="relative z-10 text-center pt-8 pb-6 flex-shrink-0">
            <h1 className="text-4xl font-black mb-4 tracking-tight leading-none">
              <span className="bg-gradient-to-r from-violet-400 to-indigo-500 bg-clip-text text-transparent">
                DRAW CUSTOM SHAPE
              </span>
            </h1>
            
            <div className="text-lg text-gray-300 font-extralight tracking-wide opacity-80">
              Draw your custom shape with precision
            </div>
          </div>

          {/* Step Indicator */}
          <div className="relative z-10 flex items-center justify-center mb-8 flex-shrink-0">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gradient-to-br from-violet-500 to-violet-700 rounded-2xl flex items-center justify-center shadow-lg shadow-violet-500/20 subtle-shadow">
                <span className="text-xl font-bold text-white">03</span>
              </div>
              <div className="text-2xl font-black text-violet-400">
                CUSTOM SHAPE EDITOR
              </div>
            </div>
          </div>

          {/* Navigation */}
          <div className="relative z-10 flex justify-between items-center px-8 mb-6 flex-shrink-0">
            <button
              onClick={handleBack}
              className="px-6 py-3 bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-500 hover:to-gray-600 text-white font-medium rounded-xl shadow-lg transition-all duration-200 transform hover:scale-105 flex items-center space-x-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              <span>Back to Shapes</span>
            </button>
          </div>

          {/* Custom Shape Editor */}
          <div className="relative z-10 flex-1 px-8 pb-8">
            <div className="w-full max-w-6xl mx-auto">
              <CustomShapeEditor
                imageFile={imageFile}
                onShapeComplete={handleShapeComplete}
                onCancel={handleCancel}
                initialPoints={customPoints}
                initialCanvasSize={customCanvasSize || undefined}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}