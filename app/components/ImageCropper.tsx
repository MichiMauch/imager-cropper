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
}

export default function ImageCropper({ imageFile, selectedShape, customPoints, customCanvasSize, onCropComplete }: ImageCropperProps) {
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

    let canvasWidth, canvasHeight;
    
    // For custom shapes, use original image proportions; for others, use square
    if (selectedShape.isCustom && customPoints && customCanvasSize) {
      // Calculate preview size maintaining original aspect ratio
      const maxPreviewSize = 400;
      const imageAspect = originalImage.width / originalImage.height;
      
      if (imageAspect > 1) {
        canvasWidth = Math.min(maxPreviewSize, originalImage.width);
        canvasHeight = canvasWidth / imageAspect;
      } else {
        canvasHeight = Math.min(maxPreviewSize, originalImage.height);
        canvasWidth = canvasHeight * imageAspect;
      }
    } else {
      // For predefined shapes, use square preview
      canvasWidth = canvasHeight = 300;
    }

    // Set canvas size
    canvas.width = canvasWidth;
    canvas.height = canvasHeight;

    // Clear canvas
    ctx.clearRect(0, 0, canvasWidth, canvasHeight);

    let shapeToUse = selectedShape;
    
    // Create custom shape for preview if we have custom points
    if (selectedShape.isCustom && customPoints && customCanvasSize) {
      shapeToUse = createCustomShape(customPoints, customCanvasSize.width, customCanvasSize.height);
    }

    // Draw shape preview
    ctx.save();
    
    // Draw the shape path
    shapeToUse.drawPath(ctx, canvasWidth, canvasHeight);
    
    // Clip to the shape
    ctx.clip();
    
    if (selectedShape.isCustom) {
      // For custom shapes, draw image at scaled size maintaining aspect ratio
      const scale = Math.min(canvasWidth / originalImage.width, canvasHeight / originalImage.height);
      const scaledWidth = originalImage.width * scale;
      const scaledHeight = originalImage.height * scale;
      const offsetX = (canvasWidth - scaledWidth) / 2;
      const offsetY = (canvasHeight - scaledHeight) / 2;
      
      ctx.drawImage(originalImage, offsetX, offsetY, scaledWidth, scaledHeight);
    } else {
      // For predefined shapes, use the existing scaling logic
      const imageAspect = originalImage.width / originalImage.height;
      let drawWidth, drawHeight, offsetX, offsetY;
      
      if (imageAspect > 1) {
        drawHeight = canvasHeight;
        drawWidth = canvasHeight * imageAspect;
        offsetX = -(drawWidth - canvasWidth) / 2;
        offsetY = 0;
      } else {
        drawWidth = canvasWidth;
        drawHeight = canvasWidth / imageAspect;
        offsetX = 0;
        offsetY = -(drawHeight - canvasHeight) / 2;
      }
      
      ctx.drawImage(originalImage, offsetX, offsetY, drawWidth, drawHeight);
    }
    
    ctx.restore();

    // Draw shape outline for clarity
    ctx.strokeStyle = '#3B82F6';
    ctx.lineWidth = 2;
    shapeToUse.drawPath(ctx, canvasWidth, canvasHeight);
    ctx.stroke();

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
      <h3 className="text-lg font-semibold text-gray-800">Preview & Crop</h3>
      
      <div className="relative">
        <canvas
          ref={canvasRef}
          className="border border-gray-300 rounded-lg shadow-sm"
          width={300}
          height={300}
        />
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-75 rounded-lg">
            <div className="text-gray-600">Loading...</div>
          </div>
        )}
      </div>

      {error && (
        <p className="text-sm text-red-600">{error}</p>
      )}

      {originalImage && selectedShape && (!selectedShape.isCustom || (selectedShape.isCustom && customPoints && customPoints.length > 0)) && (
        <button
          onClick={handleCrop}
          disabled={loading}
          className="px-6 py-2 bg-blue-500 text-white font-medium rounded-lg hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
        >
          Crop Image
        </button>
      )}

      {originalImage && !selectedShape && (
        <p className="text-sm text-gray-500">Please select a shape template above</p>
      )}
      
      {originalImage && selectedShape && selectedShape.isCustom && (!customPoints || customPoints.length === 0) && (
        <p className="text-sm text-gray-500">Please draw your custom shape first</p>
      )}
    </div>
  );
}