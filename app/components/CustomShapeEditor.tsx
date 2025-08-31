'use client';

import React, { useRef, useEffect, useState, useCallback } from 'react';
import { Point } from '../lib/shapes';

interface CustomShapeEditorProps {
  imageFile: File | null;
  onShapeComplete: (points: Point[]) => void;
  onCancel: () => void;
  initialPoints?: Point[];
  initialCanvasSize?: { width: number; height: number };
}

export default function CustomShapeEditor({ imageFile, onShapeComplete, onCancel, initialPoints, initialCanvasSize }: CustomShapeEditorProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [points, setPoints] = useState<Point[]>(initialPoints || []);
  const [isDrawing, setIsDrawing] = useState(!initialPoints || initialPoints.length === 0);
  const [isEditing, setIsEditing] = useState(initialPoints && initialPoints.length > 0);
  const [draggedPointIndex, setDraggedPointIndex] = useState<number | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [originalPoints, setOriginalPoints] = useState<Point[]>(initialPoints || []);
  const [mousePosition, setMousePosition] = useState<Point | null>(null);
  const [image, setImage] = useState<HTMLImageElement | null>(null);
  const [canvasSize, setCanvasSize] = useState(initialCanvasSize || { width: 600, height: 400 });

  // Load image
  useEffect(() => {
    if (!imageFile) return;

    const img = new Image();
    const url = URL.createObjectURL(imageFile);
    
    img.onload = () => {
      setImage(img);
      // Calculate canvas size based on image aspect ratio - optimized for embedded context
      const maxWidth = 700;
      const maxHeight = 500;
      const aspect = img.width / img.height;
      
      let width = maxWidth;
      let height = maxWidth / aspect;
      
      if (height > maxHeight) {
        height = maxHeight;
        width = maxHeight * aspect;
      }
      
      setCanvasSize({ width, height });
      URL.revokeObjectURL(url);
    };
    
    img.src = url;
    
    return () => {
      URL.revokeObjectURL(url);
    };
  }, [imageFile]);

  // Draw canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !image) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    canvas.width = canvasSize.width;
    canvas.height = canvasSize.height;
    
    // Clear canvas
    ctx.clearRect(0, 0, canvasSize.width, canvasSize.height);
    
    // Draw image
    ctx.drawImage(image, 0, 0, canvasSize.width, canvasSize.height);
    
    // Draw semi-transparent overlay
    ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
    ctx.fillRect(0, 0, canvasSize.width, canvasSize.height);
    
    // Draw edge guide lines (snap zones)
    const snapDistance = 10;
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
    ctx.lineWidth = 1;
    ctx.setLineDash([5, 5]);
    
    // Top edge guide
    ctx.beginPath();
    ctx.moveTo(0, snapDistance);
    ctx.lineTo(canvasSize.width, snapDistance);
    ctx.stroke();
    
    // Bottom edge guide
    ctx.beginPath();
    ctx.moveTo(0, canvasSize.height - snapDistance);
    ctx.lineTo(canvasSize.width, canvasSize.height - snapDistance);
    ctx.stroke();
    
    // Left edge guide
    ctx.beginPath();
    ctx.moveTo(snapDistance, 0);
    ctx.lineTo(snapDistance, canvasSize.height);
    ctx.stroke();
    
    // Right edge guide
    ctx.beginPath();
    ctx.moveTo(canvasSize.width - snapDistance, 0);
    ctx.lineTo(canvasSize.width - snapDistance, canvasSize.height);
    ctx.stroke();
    
    ctx.setLineDash([]);
    
    // Draw the shape being created
    if (points.length > 0) {
      ctx.strokeStyle = '#3B82F6';
      ctx.lineWidth = 2;
      ctx.fillStyle = 'rgba(59, 130, 246, 0.1)';
      
      ctx.beginPath();
      ctx.moveTo(points[0].x, points[0].y);
      
      for (let i = 1; i < points.length; i++) {
        ctx.lineTo(points[i].x, points[i].y);
      }
      
      // Draw line to mouse position if drawing
      if (isDrawing && mousePosition) {
        ctx.lineTo(mousePosition.x, mousePosition.y);
      }
      
      // Close path if shape is complete
      if (!isDrawing && points.length > 2) {
        ctx.closePath();
        ctx.fill();
      }
      
      ctx.stroke();
      
      // Draw points (larger and more visible in edit mode)
      points.forEach((point, index) => {
        ctx.beginPath();
        const radius = isEditing ? 8 : 5;
        ctx.arc(point.x, point.y, radius, 0, Math.PI * 2);
        
        if (isEditing) {
          ctx.fillStyle = index === draggedPointIndex ? '#EF4444' : (index === 0 ? '#10B981' : '#3B82F6');
          ctx.fill();
          ctx.strokeStyle = 'white';
          ctx.lineWidth = 3;
          ctx.stroke();
          
          // Add a second ring for better visibility in edit mode
          ctx.beginPath();
          ctx.arc(point.x, point.y, radius + 2, 0, Math.PI * 2);
          ctx.strokeStyle = 'rgba(59, 130, 246, 0.3)';
          ctx.lineWidth = 1;
          ctx.stroke();
        } else {
          ctx.fillStyle = index === 0 ? '#10B981' : '#3B82F6';
          ctx.fill();
          ctx.strokeStyle = 'white';
          ctx.lineWidth = 2;
          ctx.stroke();
        }
      });
      
      // Draw starting point indicator
      if (points.length > 0 && isDrawing) {
        ctx.beginPath();
        ctx.arc(points[0].x, points[0].y, 8, 0, Math.PI * 2);
        ctx.strokeStyle = '#10B981';
        ctx.lineWidth = 2;
        ctx.stroke();
      }
    }
    
    // Draw helper text
    if (points.length === 0) {
      ctx.fillStyle = 'white';
      ctx.font = '16px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('Click to add points to create your shape', canvasSize.width / 2, canvasSize.height / 2);
    } else if (isDrawing) {
      ctx.fillStyle = 'white';
      ctx.font = '14px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('Click near the green starting point to close the shape', canvasSize.width / 2, 30);
    } else if (isEditing) {
      ctx.fillStyle = 'white';
      ctx.font = '14px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('Drag points to adjust the shape', canvasSize.width / 2, 30);
    }
    
  }, [image, points, mousePosition, isDrawing, isEditing, isDragging, draggedPointIndex, canvasSize]);

  const handleCanvasClick = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    // Only handle clicks in drawing mode, not in editing mode
    if (!isDrawing || isEditing) return;
    
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    
    const x = (e.clientX - rect.left) * scaleX;
    const y = (e.clientY - rect.top) * scaleY;
    
    // Snap to edges
    const snapDistance = 10;
    let snappedX = x;
    let snappedY = y;
    
    if (Math.abs(x - 0) < snapDistance) snappedX = 0;
    if (Math.abs(x - canvasSize.width) < snapDistance) snappedX = canvasSize.width;
    if (Math.abs(y - 0) < snapDistance) snappedY = 0;
    if (Math.abs(y - canvasSize.height) < snapDistance) snappedY = canvasSize.height;
    
    const newPoint = { x: snappedX, y: snappedY };
    
    // Check if click is close to starting point (for closing the shape)
    if (points.length >= 3) {
      const startPoint = points[0];
      const distance = Math.sqrt(
        Math.pow(newPoint.x - startPoint.x, 2) + Math.pow(newPoint.y - startPoint.y, 2)
      );
      
      if (distance < 20) {
        // Close the shape
        setIsDrawing(false);
        setIsEditing(true);
        setOriginalPoints([...points]);
        return;
      }
    }
    
    // Add the new point
    setPoints([...points, newPoint]);
  }, [isDrawing, isEditing, points, canvasSize]);

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    
    const x = (e.clientX - rect.left) * scaleX;
    const y = (e.clientY - rect.top) * scaleY;
    
    // Snap to edges
    const snapDistance = 10;
    let snappedX = x;
    let snappedY = y;
    
    if (Math.abs(x - 0) < snapDistance) snappedX = 0;
    if (Math.abs(x - canvasSize.width) < snapDistance) snappedX = canvasSize.width;
    if (Math.abs(y - 0) < snapDistance) snappedY = 0;
    if (Math.abs(y - canvasSize.height) < snapDistance) snappedY = canvasSize.height;
    
    setMousePosition({ x: snappedX, y: snappedY });
    
    // Handle dragging in edit mode
    if (isDragging && draggedPointIndex !== null) {
      const newPoints = [...points];
      newPoints[draggedPointIndex] = { x: snappedX, y: snappedY };
      setPoints(newPoints);
    }
  }, [isDragging, draggedPointIndex, points, canvasSize]);

  const handleMouseDown = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isEditing) return;
    
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    
    const x = (e.clientX - rect.left) * scaleX;
    const y = (e.clientY - rect.top) * scaleY;
    
    // Check if mouse is over a point
    for (let i = 0; i < points.length; i++) {
      const point = points[i];
      const distance = Math.sqrt(Math.pow(x - point.x, 2) + Math.pow(y - point.y, 2));
      
      if (distance < 10) {
        setDraggedPointIndex(i);
        setIsDragging(true);
        break;
      }
    }
  }, [isEditing, points]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
    setDraggedPointIndex(null);
  }, []);

  const handleUndo = useCallback(() => {
    if (points.length > 0) {
      setPoints(points.slice(0, -1));
    }
  }, [points]);

  const handleClear = useCallback(() => {
    setPoints([]);
    setIsDrawing(true);
    setIsEditing(false);
  }, []);

  const handleCloseShape = useCallback(() => {
    if (points.length >= 3) {
      setIsDrawing(false);
      setIsEditing(true);
      setOriginalPoints([...points]);
    }
  }, [points]);

  const handleResetPoints = useCallback(() => {
    setPoints([...originalPoints]);
  }, [originalPoints]);

  const handleStartOver = useCallback(() => {
    setPoints([]);
    setIsDrawing(true);
    setIsEditing(false);
    setOriginalPoints([]);
    setDraggedPointIndex(null);
    setIsDragging(false);
  }, []);

  const handleComplete = useCallback(() => {
    if (points.length >= 3 && !isDrawing) {
      onShapeComplete(points);
    }
  }, [points, isDrawing, onShapeComplete]);

  return (
    <div className="w-full max-w-6xl">
      {/* Title Section */}
      <div className="text-center mb-6">
        <h3 className="text-xl font-bold text-pink-400 mb-2">Custom Shape Editor</h3>
        <p className="text-gray-300 text-sm">
          {points.length === 0 && "Click to start drawing"}
          {points.length === 1 && isDrawing && "Add more points"}
          {points.length === 2 && isDrawing && "Add at least one more point"}
          {points.length > 2 && isDrawing && "Click near start point (green) to close"}
          {points.length > 2 && !isDrawing && !isEditing && "Shape complete! Click 'Use This Shape' to continue"}
          {isEditing && "Drag the blue points to adjust your shape"}
        </p>
      </div>

      {/* Horizontal Split Layout */}
      <div className="flex gap-8 items-start">
        {/* Canvas Section - Left Side */}
        <div className="flex-1 flex justify-center">
          <div className="relative border border-purple-500/30 rounded-2xl p-4 bg-gray-800/30 backdrop-blur-sm shadow-2xl shadow-purple-500/20">
            <canvas
              ref={canvasRef}
              onMouseDown={handleMouseDown}
              onMouseUp={handleMouseUp}
              onClick={handleCanvasClick}
              onMouseMove={handleMouseMove}
              onMouseLeave={() => {
                setMousePosition(null);
                // Also end any active dragging when mouse leaves canvas
                setIsDragging(false);
                setDraggedPointIndex(null);
              }}
              className={`rounded-lg ${
                isEditing ? 'cursor-pointer' : 'cursor-crosshair'
              }`}
              style={{ maxWidth: '100%', height: 'auto' }}
            />
          </div>
        </div>

        {/* Controls Panel - Right Side */}
        <div className="flex flex-col space-y-6 min-w-[240px] max-w-[280px]">
          {/* Drawing Mode Controls */}
          {isDrawing && (
            <div className="space-y-3">
              <h4 className="text-lg font-semibold text-pink-300 border-b border-pink-400/30 pb-2">
                Drawing Tools
              </h4>
              <button
                onClick={handleClear}
                disabled={points.length === 0}
                className="w-full px-4 py-3 text-sm bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white rounded-lg shadow-md shadow-red-500/25 hover:shadow-red-500/40 border border-red-400/20 backdrop-blur-sm transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer flex items-center justify-center space-x-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                <span>Clear</span>
              </button>
            </div>
          )}

          {/* Edit Mode Controls */}
          {isEditing && (
            <div className="space-y-3">
              <h4 className="text-lg font-semibold text-pink-300 border-b border-pink-400/30 pb-2">
                Edit Tools
              </h4>
              <button
                onClick={handleResetPoints}
                className="w-full px-4 py-3 text-sm bg-gradient-to-r from-yellow-500 to-amber-600 hover:from-yellow-600 hover:to-amber-700 text-white rounded-lg shadow-md shadow-yellow-500/25 hover:shadow-yellow-500/40 border border-yellow-400/20 backdrop-blur-sm transition-all duration-200 cursor-pointer flex items-center justify-center space-x-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                <span>Reset</span>
              </button>
              <button
                onClick={handleStartOver}
                className="w-full px-4 py-3 text-sm bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-500 hover:to-gray-600 text-white rounded-lg shadow-md shadow-gray-600/25 hover:shadow-gray-500/40 border border-gray-500/20 backdrop-blur-sm transition-all duration-200 cursor-pointer flex items-center justify-center space-x-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                <span>Start Over</span>
              </button>
            </div>
          )}

          {/* Action Buttons */}
          <div className="space-y-3 pt-4 border-t border-gray-700/50">
            <h4 className="text-lg font-semibold text-pink-300 pb-2">
              Actions
            </h4>
            <button
              onClick={onCancel}
              className="group relative w-full px-6 py-4 bg-gradient-to-br from-red-500 via-red-600 to-red-700 hover:from-red-400 hover:via-red-500 hover:to-red-600 text-white font-bold rounded-xl shadow-xl shadow-red-600/30 hover:shadow-red-500/50 transition-all duration-300 transform hover:scale-105 cursor-pointer flex items-center justify-center space-x-2"
            >
              <svg className="w-5 h-5 group-hover:scale-110 group-hover:rotate-90 transition-all duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
              </svg>
              <span className="font-bold tracking-wide">CANCEL</span>
            </button>
            <button
              onClick={handleComplete}
              disabled={points.length < 3 || isDrawing}
              className="group relative w-full px-6 py-4 bg-gradient-to-br from-emerald-400 via-emerald-500 to-emerald-600 hover:from-emerald-300 hover:via-emerald-400 hover:to-emerald-500 text-white font-bold rounded-xl shadow-xl shadow-emerald-500/30 hover:shadow-emerald-400/50 transition-all duration-300 transform hover:scale-105 disabled:from-gray-600 disabled:to-gray-700 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none cursor-pointer flex items-center justify-center space-x-2"
            >
              <svg className="w-5 h-5 group-hover:scale-110 group-hover:rotate-12 transition-all duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
              </svg>
              <span className="font-bold tracking-wide">USE SHAPE</span>
            </button>
          </div>

          {/* Info Panel */}
          <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-600/30">
            <h5 className="text-sm font-semibold text-gray-300 mb-2">Shape Info</h5>
            <div className="text-xs text-gray-400 space-y-1">
              <p>Points: {points.length}</p>
              <p>Status: {isDrawing ? 'Drawing...' : isEditing ? 'Editing' : 'Complete'}</p>
              <p className="mt-2 text-gray-500">
                {isDrawing ? 'Click near the green point to close the shape' : 
                 isEditing ? 'Drag blue points to adjust the shape' : 
                 'Shape is ready to use'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}