'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { useApp } from '../contexts/AppContext';
import ImageCropper from '../components/ImageCropper';

export default function CropPage() {
  const router = useRouter();
  const { 
    imageFile, 
    selectedShape,
    customPoints,
    customCanvasSize,
    setCroppedCanvas,
    setCurrentStep 
  } = useApp();

  // Redirect if no image or shape selected
  useEffect(() => {
    if (!imageFile) {
      router.push('/upload');
    } else if (!selectedShape) {
      router.push('/shapes');
    }
  }, [imageFile, selectedShape, router]);

  const handleCropComplete = (canvas: HTMLCanvasElement) => {
    setCroppedCanvas(canvas);
    setCurrentStep('download');
    router.push('/download');
  };

  const handleBackToSelection = () => {
    if (selectedShape?.isCustom) {
      setCurrentStep('custom-draw');
      router.push('/custom-draw');
    } else {
      setCurrentStep('shapes');
      router.push('/shapes');
    }
  };

  if (!imageFile || !selectedShape) {
    return null; // Will redirect in useEffect
  }

  return (
    <div className="min-h-screen bg-black text-white overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gradient-to-br from-teal-400/5 to-transparent rounded-full blur-3xl animate-floating"></div>
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-gradient-to-br from-green-400/5 to-transparent rounded-full blur-3xl animate-floating delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-gradient-to-br from-slate-400/5 to-transparent rounded-full blur-3xl animate-floating delay-500"></div>
      </div>

      {/* Scrollable Content Container */}
      <div className="h-screen overflow-y-auto">
        <div className="flex flex-col min-h-full">
          {/* Header */}
          <div className="relative z-10 text-center pt-8 pb-6 flex-shrink-0">
            <h1 className="text-4xl font-black mb-4 tracking-tight leading-none">
              <span className="bg-gradient-to-r from-teal-400 to-green-500 bg-clip-text text-transparent">
                CROP & PREVIEW
              </span>
            </h1>
            
            <div className="text-lg text-gray-300 font-extralight tracking-wide opacity-80">
              Preview your image and crop it with the selected shape
            </div>
          </div>

          {/* Step Indicator */}
          <div className="relative z-10 flex items-center justify-center mb-8 flex-shrink-0">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gradient-to-br from-teal-500 to-teal-700 rounded-2xl flex items-center justify-center shadow-lg shadow-teal-500/20 active-shadow-teal">
                <span className="text-xl font-bold text-white">04</span>
              </div>
              <div className="text-2xl font-black text-teal-400">
                CROP & PREVIEW
              </div>
            </div>
          </div>

          {/* Crop Component */}
          <div className="relative z-10 flex-1 px-8 pb-8">
            <div className="max-w-6xl mx-auto">
              <ImageCropper
                imageFile={imageFile}
                selectedShape={selectedShape}
                customPoints={customPoints}
                customCanvasSize={customCanvasSize || undefined}
                onCropComplete={handleCropComplete}
                onBackToSelection={handleBackToSelection}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}