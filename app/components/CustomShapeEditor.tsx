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
      // Calculate canvas size based on image aspect ratio
      const maxWidth = 600;
      const maxHeight = 400;
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
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    // Check if clicking near the first point to close shape
    if (points.length > 2) {
      const firstPoint = points[0];
      const distance = Math.sqrt(Math.pow(x - firstPoint.x, 2) + Math.pow(y - firstPoint.y, 2));
      
      if (distance < 15) {
        // Close the shape and enter edit mode
        setIsDrawing(false);
        setIsEditing(true);
        setOriginalPoints([...points]);
        return;
      }
    }
    
    // Add new point
    setPoints(prev => [...prev, { x, y }]);
  }, [isDrawing, isEditing, points]);

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    // Handle dragging in edit mode (only if actively dragging)
    if (isEditing && isDragging && draggedPointIndex !== null) {
      setPoints(prev => 
        prev.map((point, index) => 
          index === draggedPointIndex ? { x, y } : point
        )
      );
      return;
    }
    
    // Handle drawing mode
    if (isDrawing && !isEditing) {
      setMousePosition({ x, y });
    }
  }, [isDrawing, isEditing, isDragging, draggedPointIndex]);

  const handleMouseUp = useCallback(() => {
    // End dragging - "drop" the point
    setIsDragging(false);
    setDraggedPointIndex(null);
  }, []);

  const handleMouseDown = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    // Only handle mouse down in editing mode
    if (!isEditing) return;
    
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    // Check if clicking on a point
    const clickedPointIndex = points.findIndex(point => {
      const distance = Math.sqrt(Math.pow(x - point.x, 2) + Math.pow(y - point.y, 2));
      return distance < 10;
    });
    
    if (clickedPointIndex >= 0) {
      // Start dragging this point
      setDraggedPointIndex(clickedPointIndex);
      setIsDragging(true);
    }
  }, [isEditing, points]);

  const handleUndo = () => {
    if (points.length > 0) {
      setPoints(prev => prev.slice(0, -1));
      setIsDrawing(true);
    }
  };

  const handleClear = () => {
    setPoints([]);
    setIsDrawing(true);
  };

  const handleComplete = () => {
    if (points.length > 2) {
      onShapeComplete(points);
    }
  };

  const handleCloseShape = () => {
    if (points.length > 2) {
      setIsDrawing(false);
      setIsEditing(true);
      setOriginalPoints([...points]);
    }
  };

  const handleResetPoints = () => {
    setPoints([...originalPoints]);
  };

  const handleDoneEditing = () => {
    setIsEditing(false);
    setOriginalPoints([...points]);
  };

  const handleStartOver = () => {
    setPoints([]);
    setIsDrawing(true);
    setIsEditing(false);
    setOriginalPoints([]);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-800">
          {isEditing ? 'Edit Your Shape Points' : 'Draw Your Custom Shape'}
        </h3>
        <div className="flex gap-2">
          {isDrawing && (
            <>
              <button
                onClick={handleUndo}
                disabled={points.length === 0}
                className="px-3 py-1 text-sm bg-gray-200 text-gray-700 rounded hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Undo
              </button>
              <button
                onClick={handleClear}
                disabled={points.length === 0}
                className="px-3 py-1 text-sm bg-gray-200 text-gray-700 rounded hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Clear
              </button>
              <button
                onClick={handleCloseShape}
                disabled={points.length < 3}
                className="px-3 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Close Shape
              </button>
            </>
          )}
          {isEditing && (
            <>
              <button
                onClick={handleResetPoints}
                className="px-3 py-1 text-sm bg-yellow-500 text-white rounded hover:bg-yellow-600"
              >
                Reset
              </button>
              <button
                onClick={handleStartOver}
                className="px-3 py-1 text-sm bg-gray-500 text-white rounded hover:bg-gray-600"
              >
                Start Over
              </button>
            </>
          )}
        </div>
      </div>
      
      <div className="relative inline-block">
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
          className={`border border-gray-300 ${
            isEditing ? 'cursor-pointer' : 'cursor-crosshair'
          }`}
          style={{ maxWidth: '100%', height: 'auto' }}
        />
      </div>
      
      <div className="flex justify-between items-center">
        <div className="text-sm text-gray-600">
          {points.length === 0 && "Click to start drawing"}
          {points.length === 1 && isDrawing && "Add more points"}
          {points.length === 2 && isDrawing && "Add at least one more point"}
          {points.length > 2 && isDrawing && "Click near start point (green) to close"}
          {points.length > 2 && !isDrawing && !isEditing && "Shape complete! Click 'Use This Shape' to continue"}
          {isEditing && "Drag the blue points to adjust your shape. Click 'Use This Shape' when satisfied."}
        </div>
        
        <div className="flex gap-2">
          <button
            onClick={onCancel}
            className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400"
          >
            Cancel
          </button>
          <button
            onClick={handleComplete}
            disabled={points.length < 3 || isDrawing}
            className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Use This Shape
          </button>
        </div>
      </div>
    </div>
  );
}