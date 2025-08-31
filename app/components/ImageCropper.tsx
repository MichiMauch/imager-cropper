'use client';

import React, { useEffect, useRef, useState } from 'react';
import { ShapeTemplate, createCustomShape, Point } from '../lib/shapes';
import { loadImage, cropImageWithShape } from '../lib/canvas-utils';

interface ImageCropperProps {
  imageFile: File | null;
  selectedShape: ShapeTemplate | null;
  customPoints?: Point[];
  customCanvasSize?: { width: number; height: number };
  onCropComplete: (canvas: HTMLCanvasElement) => void;
  onBackToSelection?: () => void;
}

export default function ImageCropper({ imageFile, selectedShape, customPoints, customCanvasSize, onCropComplete, onBackToSelection }: ImageCropperProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [originalImage, setOriginalImage] = useState<HTMLImageElement | null>(null);

  // Load image when file changes
  useEffect(() => {
    if (!imageFile) {
      setOriginalImage(null);
      return;
    }

    setLoading(true);
    setError(null);

    loadImage(imageFile)
      .then((img) => {
        setOriginalImage(img);
        setLoading(false);
      })
      .catch((err) => {
        setError('Failed to load image');
        setLoading(false);
        console.error(err);
      });
  }, [imageFile]);

  // Preview shape on original image
  useEffect(() => {
    if (!canvasRef.current || !originalImage || !selectedShape) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let shapeToUse = selectedShape;
    
    // Create custom shape for preview if we have custom points
    if (selectedShape.isCustom && customPoints && customCanvasSize) {
      shapeToUse = createCustomShape(customPoints, customCanvasSize.width, customCanvasSize.height);
    }

    // Use same logic as cropImageWithShape for consistent preview
    const outputSize = 512;
    const useOriginalSize = selectedShape.isCustom;
    
    // Set canvas size - match exactly what cropImageWithShape does
    const canvasWidth = useOriginalSize ? originalImage.width : outputSize;
    const canvasHeight = useOriginalSize ? originalImage.height : outputSize;
    
    // But for display, scale down if too large
    const maxDisplayWidth = 800;
    const maxDisplayHeight = 600;
    let displayWidth = canvasWidth;
    let displayHeight = canvasHeight;
    
    if (displayWidth > maxDisplayWidth || displayHeight > maxDisplayHeight) {
      const scale = Math.min(maxDisplayWidth / displayWidth, maxDisplayHeight / displayHeight);
      displayWidth = Math.round(displayWidth * scale);
      displayHeight = Math.round(displayHeight * scale);
    }
    
    canvas.width = displayWidth;
    canvas.height = displayHeight;
    
    // Clear canvas
    ctx.clearRect(0, 0, displayWidth, displayHeight);
    
    // Scale context if needed
    if (displayWidth !== canvasWidth || displayHeight !== canvasHeight) {
      ctx.scale(displayWidth / canvasWidth, displayHeight / canvasHeight);
    }
    
    // Now draw exactly like cropImageWithShape does
    if (useOriginalSize) {
      // For custom shapes with original size: draw image at 1:1 scale
      ctx.drawImage(originalImage, 0, 0, originalImage.width, originalImage.height);
    } else {
      // For predefined shapes: scale image to fit square canvas
      const imageAspect = originalImage.width / originalImage.height;
      const canvasAspect = 1; // Square canvas
      
      let drawWidth, drawHeight, offsetX, offsetY;
      
      if (imageAspect > canvasAspect) {
        // Image is wider - fit height and crop width
        drawHeight = outputSize;
        drawWidth = outputSize * imageAspect;
        offsetX = -(drawWidth - outputSize) / 2;
        offsetY = 0;
      } else {
        // Image is taller - fit width and crop height
        drawWidth = outputSize;
        drawHeight = outputSize / imageAspect;
        offsetX = 0;
        offsetY = -(drawHeight - outputSize) / 2;
      }
      
      // Draw the image
      ctx.drawImage(originalImage, offsetX, offsetY, drawWidth, drawHeight);
    }
    
    // Now cut out the shape area (make it transparent)
    ctx.save();
    ctx.globalCompositeOperation = 'destination-out';
    
    // Draw the shape path to cut it out
    shapeToUse.drawPath(ctx, canvasWidth, canvasHeight);
    ctx.fill();
    
    ctx.restore();

  }, [originalImage, selectedShape, customPoints, customCanvasSize]);

  const handleCrop = () => {
    if (!originalImage || !selectedShape) return;

    setLoading(true);
    setError(null);

    try {
      let shapeToUse = selectedShape;
      
      // Create custom shape if we have custom points
      if (selectedShape.isCustom && customPoints && customCanvasSize) {
        shapeToUse = createCustomShape(customPoints, customCanvasSize.width, customCanvasSize.height);
      }
      
      const croppedCanvas = cropImageWithShape(originalImage, shapeToUse, 512, selectedShape.isCustom);
      onCropComplete(croppedCanvas);
      setLoading(false);
    } catch (err) {
      setError('Failed to crop image');
      setLoading(false);
      console.error(err);
    }
  };

  if (!imageFile) {
    return null;
  }

  return (
    <div className="w-full flex flex-col items-center space-y-4">
      <h3 className="text-lg font-semibold text-white">Preview & Crop</h3>
      
      <div className="relative max-w-full overflow-auto border border-gray-700/50 rounded-xl p-6 bg-gray-800/50 backdrop-blur-sm">
        <canvas
          ref={canvasRef}
          className="max-w-full h-auto"
          style={{ display: 'block' }}
        />
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/75 rounded-xl backdrop-blur-sm">
            <div className="text-white">Loading...</div>
          </div>
        )}
      </div>

      {error && (
        <p className="text-sm text-red-600">{error}</p>
      )}

      {originalImage && selectedShape && (!selectedShape.isCustom || (selectedShape.isCustom && customPoints && customPoints.length > 0)) && (
        <div className="flex gap-4">
          {onBackToSelection && (
            <button
              onClick={onBackToSelection}
              className="group relative px-8 py-4 bg-gradient-to-br from-gray-500 via-gray-600 to-gray-700 hover:from-gray-400 hover:via-gray-500 hover:to-gray-600 text-white font-bold rounded-2xl shadow-2xl shadow-gray-600/40 hover:shadow-gray-500/60 transition-all duration-300 transform hover:scale-110 hover:-translate-y-2 cursor-pointer flex items-center space-x-3"
              style={{ transformStyle: 'preserve-3d' }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'perspective(1000px) rotateX(-5deg) rotateY(-5deg) translateY(-8px) scale(1.1)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) translateY(0px) scale(1)';
              }}
            >
              {/* 3D Border Effect */}
              <div className="absolute inset-0 bg-gradient-to-br from-gray-400/50 to-gray-700/50 rounded-2xl blur-sm -z-10 group-hover:blur-md transition-all duration-300"></div>
              <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent rounded-2xl"></div>
              
              <svg className="w-6 h-6 group-hover:scale-125 group-hover:-rotate-12 transition-all duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
              </svg>
              <span className="font-black text-lg tracking-wide">BACK</span>
              
              <div className="absolute inset-0 bg-gradient-to-br from-transparent via-white/10 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </button>
          )}
          <button
            onClick={handleCrop}
            disabled={loading}
            className="group relative px-8 py-4 bg-gradient-to-br from-pink-400 via-pink-500 to-pink-600 hover:from-pink-300 hover:via-pink-400 hover:to-pink-500 text-white font-bold rounded-2xl shadow-2xl shadow-pink-500/40 hover:shadow-pink-400/60 transition-all duration-300 transform hover:scale-110 hover:-translate-y-2 disabled:from-gray-600 disabled:to-gray-700 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none cursor-pointer flex items-center space-x-3"
            style={{ transformStyle: 'preserve-3d' }}
            onMouseEnter={(e) => {
              if (!loading) {
                e.currentTarget.style.transform = 'perspective(1000px) rotateX(-5deg) rotateY(5deg) translateY(-8px) scale(1.1)';
              }
            }}
            onMouseLeave={(e) => {
              if (!loading) {
                e.currentTarget.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) translateY(0px) scale(1)';
              }
            }}
          >
            {/* 3D Border Effect */}
            <div className="absolute inset-0 bg-gradient-to-br from-pink-300/50 to-pink-600/50 rounded-2xl blur-sm -z-10 group-hover:blur-md transition-all duration-300"></div>
            <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent rounded-2xl"></div>
            
            <div className="relative">
              <svg className={`w-6 h-6 group-hover:scale-125 transition-all duration-300 ${loading ? 'animate-spin' : 'group-hover:rotate-12'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
              </svg>
              <div className="absolute inset-0 bg-white/30 rounded-full blur-md group-hover:blur-lg transition-all duration-300"></div>
            </div>
            <span className="font-black text-lg tracking-wide">{loading ? 'CROPPING...' : 'CROP IMAGE'}</span>
            
            <div className="absolute inset-0 bg-gradient-to-br from-transparent via-white/10 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          </button>
        </div>
      )}

      {originalImage && !selectedShape && (
        <p className="text-sm text-gray-400">Please select a shape template above</p>
      )}
      
      {originalImage && selectedShape && selectedShape.isCustom && (!customPoints || customPoints.length === 0) && (
        <p className="text-sm text-gray-400">Please draw your custom shape first</p>
      )}
    </div>
  );
}