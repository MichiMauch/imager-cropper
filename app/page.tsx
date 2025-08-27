'use client';

import { useState } from 'react';
import ImageUploader from './components/ImageUploader';
import ShapeSelector from './components/ShapeSelector';
import ImageCropper from './components/ImageCropper';
import DownloadButton from './components/DownloadButton';
import CustomShapeEditor from './components/CustomShapeEditor';
import SaveShapeDialog from './components/SaveShapeDialog';
import { ToastContainer } from './components/Toast';
import { useToast } from './hooks/useToast';
import { ShapeTemplate, Point } from './lib/shapes';

export default function Home() {
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [selectedShape, setSelectedShape] = useState<ShapeTemplate | null>(null);
  const [croppedCanvas, setCroppedCanvas] = useState<HTMLCanvasElement | null>(null);
  const [step, setStep] = useState<'upload' | 'select' | 'crop' | 'download' | 'custom-draw'>('upload');
  const [customPoints, setCustomPoints] = useState<Point[]>([]);
  const [customCanvasSize, setCustomCanvasSize] = useState<{ width: number; height: number } | null>(null);
  const [showCustomEditor, setShowCustomEditor] = useState(false);
  const [showSaveShapeDialog, setShowSaveShapeDialog] = useState(false);
  
  const { toasts, removeToast, success, error: showError } = useToast();

  const handleImageUpload = (file: File) => {
    setImageFile(file);
    setCroppedCanvas(null);
    setCustomPoints([]);
    setCustomCanvasSize(null);
    setShowCustomEditor(false);
    setStep('select');
  };

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
        setStep('custom-draw');
      } else {
        // Fallback: calculate canvas size from image if available
        if (imageFile) {
          const img = new Image();
          const url = URL.createObjectURL(imageFile);
          img.onload = () => {
            const maxWidth = 600;
            const maxHeight = 400;
            const aspect = img.width / img.height;
            
            let width = maxWidth;
            let height = maxWidth / aspect;
            
            if (height > maxHeight) {
              height = maxHeight;
              width = maxHeight * aspect;
            }
            
            setCustomCanvasSize({ width, height });
            setShowCustomEditor(true);
            setStep('custom-draw');
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
        setStep('crop');
      }
    }
  };

  const handleCustomShapeClick = () => {
    setShowCustomEditor(true);
    setStep('custom-draw');
  };

  const handleCustomShapeComplete = (points: Point[]) => {
    setCustomPoints(points);
    // Get canvas size from the CustomShapeEditor
    if (imageFile) {
      const img = new Image();
      const url = URL.createObjectURL(imageFile);
      img.onload = () => {
        const maxWidth = 600;
        const maxHeight = 400;
        const aspect = img.width / img.height;
        
        let width = maxWidth;
        let height = maxWidth / aspect;
        
        if (height > maxHeight) {
          height = maxHeight;
          width = maxHeight * aspect;
        }
        
        setCustomCanvasSize({ width, height });
        URL.revokeObjectURL(url);
      };
      img.src = url;
    }
    
    // Create a custom shape template
    const customShape: ShapeTemplate = {
      id: 'custom',
      name: 'Custom Shape',
      icon: '✏️',
      isCustom: true,
      customPoints: points,
      drawPath: () => {} // Will be handled by createCustomShape
    };
    
    setSelectedShape(customShape);
    setShowCustomEditor(false);
    setStep('crop');
  };

  const handleCustomShapeCancel = () => {
    setShowCustomEditor(false);
    setStep('select');
  };

  const handleCropComplete = (canvas: HTMLCanvasElement) => {
    setCroppedCanvas(canvas);
    setStep('download');
  };

  const handleSaveShape = async (shapeData: {
    name: string;
    description: string;
    is_standard: boolean;
  }) => {
    if (!customPoints.length || !customCanvasSize) {
      throw new Error('No shape data available');
    }

    try {
      const response = await fetch('/api/shapes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: shapeData.name,
          points: customPoints,
          canvas_size: customCanvasSize,
          category: 'My Shapes', // Default category
          description: shapeData.description,
          icon: '🎨', // Default icon since we use previews now
          created_by: 'User',
          is_standard: shapeData.is_standard
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to save shape');
      }

      const result = await response.json();
      console.log('Shape saved successfully:', result);
      
      // Show success toast
      success(
        'Shape saved successfully!',
        `${shapeData.name} is now available${shapeData.is_standard ? ' as a standard shape' : ''} for everyone to use.`
      );
      
    } catch (error) {
      console.error('Error saving shape:', error);
      // Show error toast
      showError(
        'Failed to save shape',
        'Please try again. If the problem persists, check your internet connection.'
      );
      throw error;
    }
  };

  const handleReset = () => {
    setImageFile(null);
    setSelectedShape(null);
    setCroppedCanvas(null);
    setCustomPoints([]);
    setCustomCanvasSize(null);
    setShowCustomEditor(false);
    setShowSaveShapeDialog(false);
    setStep('upload');
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold text-gray-900 mb-3">
            Image Shape Cropper
          </h1>
          <p className="text-lg text-gray-600">
            Upload an image, select a shape template, and download as transparent PNG
          </p>
        </div>

        {/* Progress Steps */}
        <div className="flex items-center justify-center mb-10">
          <div className="flex items-center space-x-4">
            <Step number={1} label="Upload" isActive={step === 'upload'} isComplete={imageFile !== null} />
            <Connector isActive={imageFile !== null} />
            <Step number={2} label="Select Shape" isActive={step === 'select' || step === 'custom-draw'} isComplete={selectedShape !== null && (!selectedShape.isCustom || customPoints.length > 0)} />
            <Connector isActive={selectedShape !== null && (!selectedShape.isCustom || customPoints.length > 0)} />
            <Step number={3} label="Crop" isActive={step === 'crop'} isComplete={croppedCanvas !== null} />
            <Connector isActive={croppedCanvas !== null} />
            <Step number={4} label="Download" isActive={step === 'download'} isComplete={false} />
          </div>
        </div>

        {/* Main Content */}
        <div className="bg-white rounded-xl shadow-lg p-8">
          <div className="space-y-8">
            {/* Image Upload Section */}
            {step === 'upload' && (
              <div className="animate-fadeIn">
                <ImageUploader onImageUpload={handleImageUpload} />
              </div>
            )}

            {/* Shape Selection Section */}
            {(step === 'select' || step === 'crop' || step === 'download') && imageFile && !showCustomEditor && (
              <div className="animate-fadeIn">
                <ShapeSelector 
                  selectedShape={selectedShape}
                  onShapeSelect={handleShapeSelect}
                  onCustomShapeClick={handleCustomShapeClick}
                />
              </div>
            )}

            {/* Custom Shape Editor Section */}
            {step === 'custom-draw' && imageFile && showCustomEditor && (
              <div className="animate-fadeIn">
                <CustomShapeEditor
                  imageFile={imageFile}
                  onShapeComplete={handleCustomShapeComplete}
                  onCancel={handleCustomShapeCancel}
                  initialPoints={customPoints}
                  initialCanvasSize={customCanvasSize || undefined}
                />
              </div>
            )}

            {/* Image Cropper Section */}
            {(step === 'crop' || step === 'download') && imageFile && !showCustomEditor && (
              <div className="animate-fadeIn">
                <ImageCropper
                  imageFile={imageFile}
                  selectedShape={selectedShape}
                  customPoints={customPoints}
                  customCanvasSize={customCanvasSize || undefined}
                  onCropComplete={handleCropComplete}
                />
              </div>
            )}

            {/* Download Section */}
            {step === 'download' && croppedCanvas && (
              <div className="animate-fadeIn space-y-6">
                <div className="flex flex-col items-center">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">Result</h3>
                  <div className="border border-gray-300 rounded-lg p-4 bg-gray-50">
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
                      className="max-w-full h-auto"
                    />
                  </div>
                </div>
                <div className="flex justify-center space-x-4">
                  <DownloadButton canvas={croppedCanvas} />
                  {selectedShape?.isCustom && customPoints.length > 0 && (
                    <button
                      onClick={() => setShowSaveShapeDialog(true)}
                      className="px-6 py-3 bg-green-500 text-white font-medium rounded-lg hover:bg-green-600 transition-colors flex items-center space-x-2"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span>Save This Shape</span>
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Reset Button */}
          {imageFile && (
            <div className="mt-8 flex justify-center">
              <button
                onClick={handleReset}
                className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Start Over
              </button>
            </div>
          )}
        </div>

        {/* Save Shape Dialog */}
        <SaveShapeDialog
          isOpen={showSaveShapeDialog}
          onClose={() => setShowSaveShapeDialog(false)}
          onSave={handleSaveShape}
          points={customPoints}
          canvasSize={customCanvasSize}
        />
        
        {/* Toast Container */}
        <ToastContainer toasts={toasts} onClose={removeToast} />
      </div>
    </main>
  );
}

// Helper Components
function Step({ number, label, isActive, isComplete }: { number: number; label: string; isActive: boolean; isComplete: boolean }) {
  return (
    <div className="flex flex-col items-center">
      <div
        className={`
          w-10 h-10 rounded-full flex items-center justify-center font-semibold
          transition-all duration-300
          ${isComplete ? 'bg-green-500 text-white' : isActive ? 'bg-blue-500 text-white' : 'bg-gray-300 text-gray-600'}
        `}
      >
        {isComplete ? '✓' : number}
      </div>
      <span className={`mt-2 text-sm ${isActive ? 'text-blue-600 font-semibold' : 'text-gray-600'}`}>
        {label}
      </span>
    </div>
  );
}

function Connector({ isActive }: { isActive: boolean }) {
  return (
    <div
      className={`
        w-20 h-1 transition-all duration-300
        ${isActive ? 'bg-green-500' : 'bg-gray-300'}
      `}
    />
  );
}