'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { useApp } from '../contexts/AppContext';
import DownloadButton from '../components/DownloadButton';
import SaveShapeDialog from '../components/SaveShapeDialog';

export default function DownloadPage() {
  const router = useRouter();
  const { 
    imageFile,
    selectedShape,
    croppedCanvas,
    customPoints,
    showSaveShapeDialog,
    setShowSaveShapeDialog,
    setCurrentStep,
    resetApp
  } = useApp();

  // Redirect if no cropped canvas
  useEffect(() => {
    if (!croppedCanvas) {
      if (!imageFile) {
        router.push('/upload');
      } else if (!selectedShape) {
        router.push('/shapes');
      } else {
        router.push('/crop');
      }
    }
  }, [croppedCanvas, imageFile, selectedShape, router]);

  const handleSaveShape = (shapeData: { name: string; description: string; is_standard: boolean; }) => {
    if (selectedShape?.isCustom && customPoints && customPoints.length > 0) {
      const savedShapes = JSON.parse(localStorage.getItem('customShapes') || '[]');
      const newShape = {
        id: Date.now().toString(),
        name: shapeData.name,
        icon: '⭐',
        type: 'custom' as const,
        isCustom: true,
        customPoints: customPoints,
        canvasSize: selectedShape.canvasSize
      };
      savedShapes.push(newShape);
      localStorage.setItem('customShapes', JSON.stringify(savedShapes));
    }
    setShowSaveShapeDialog(false);
  };

  const handleStartOver = () => {
    resetApp();
    router.push('/upload');
  };

  const handleBackToCrop = () => {
    setCurrentStep('crop');
    router.push('/crop');
  };

  if (!croppedCanvas) {
    return null; // Will redirect in useEffect
  }

  return (
    <div className="min-h-screen bg-black text-white overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gradient-to-br from-blue-400/5 to-transparent rounded-full blur-3xl animate-floating"></div>
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-gradient-to-br from-indigo-400/5 to-transparent rounded-full blur-3xl animate-floating delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-gradient-to-br from-slate-400/5 to-transparent rounded-full blur-3xl animate-floating delay-500"></div>
      </div>

      {/* Scrollable Content Container */}
      <div className="h-screen overflow-y-auto">
        <div className="flex items-center justify-center min-h-full">
          <div className="relative z-10 w-full max-w-6xl mx-auto px-8 py-12">
            {/* Header */}
            <div className="text-center mb-12">
              <h1 className="text-5xl font-black mb-6 tracking-tight leading-none">
                <span className="bg-gradient-to-r from-blue-400 to-indigo-500 bg-clip-text text-transparent">
                  DOWNLOAD RESULT
                </span>
              </h1>
              
              <div className="text-xl text-gray-300 font-extralight tracking-wide opacity-80 animate-fadeIn">
                Your cropped image is ready for download
              </div>
            </div>

            {/* Step Indicator */}
            <div className="flex items-center justify-center mb-12">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-700 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/20 active-shadow-blue">
                  <span className="text-xl font-bold text-white">05</span>
                </div>
                <div className="text-2xl font-black text-blue-400">
                  DOWNLOAD COMPLETE
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="glass-morphism progressive-blur-dark border border-blue-500/30 rounded-3xl shadow-2xl shadow-blue-500/20 p-8">
              <div className="flex flex-col lg:flex-row gap-8 items-center">
                {/* Preview */}
                <div className="flex-1 max-w-2xl">
                  <div className="border border-blue-500/30 rounded-2xl p-4 bg-gray-800/30 mb-6">
                    <canvas
                      ref={(canvas) => {
                        if (canvas && croppedCanvas) {
                          const ctx = canvas.getContext('2d');
                          if (ctx) {
                            canvas.width = croppedCanvas.width;
                            canvas.height = croppedCanvas.height;
                            ctx.drawImage(croppedCanvas, 0, 0);
                          }
                        }
                      }}
                      className="max-w-full h-auto rounded-lg shadow-lg"
                    />
                  </div>
                  
                  {/* Image Info */}
                  <div className="text-center text-gray-400 text-sm">
                    <p>Dimensions: {croppedCanvas.width} × {croppedCanvas.height}px</p>
                    <p>Format: PNG with transparency</p>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-col space-y-6 min-w-[280px]">
                  {/* Download Button */}
                  <div className="space-y-4">
                    <DownloadButton canvas={croppedCanvas} />
                    
                    {/* Save Custom Shape Button */}
                    {selectedShape?.isCustom && customPoints && customPoints.length > 0 && (
                      <button
                        onClick={() => setShowSaveShapeDialog(true)}
                        className="w-full px-6 py-4 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-medium rounded-xl shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 border border-blue-400/20 backdrop-blur-sm transform hover:scale-105 transition-all duration-200 flex items-center justify-center space-x-2"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3-3m0 0l-3 3m3-3v12" />
                        </svg>
                        <span>Save Custom Shape</span>
                      </button>
                    )}
                  </div>

                  {/* Navigation */}
                  <div className="space-y-3 pt-6 border-t border-gray-700/50">
                    <button
                      onClick={handleBackToCrop}
                      className="w-full px-6 py-3 bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-500 hover:to-gray-600 text-white font-medium rounded-xl shadow-lg transition-all duration-200 transform hover:scale-105 flex items-center justify-center space-x-2"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                      </svg>
                      <span>Back to Crop</span>
                    </button>
                    
                    <button
                      onClick={handleStartOver}
                      className="w-full px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-medium rounded-xl shadow-lg transition-all duration-200 transform hover:scale-105 flex items-center justify-center space-x-2"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                      </svg>
                      <span>Start Over</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Success Message */}
            <div className="text-center mt-8">
              <div className="inline-flex items-center space-x-2 px-6 py-3 bg-green-900/30 border border-green-500/30 rounded-xl backdrop-blur-sm">
                <svg className="w-6 h-6 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span className="text-green-400 font-medium">Image successfully cropped and ready!</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Save Shape Dialog */}
      <SaveShapeDialog
        isOpen={showSaveShapeDialog}
        onClose={() => setShowSaveShapeDialog(false)}
        onSave={handleSaveShape}
        points={customPoints}
        canvasSize={selectedShape?.canvasSize || null}
      />
    </div>
  );
}