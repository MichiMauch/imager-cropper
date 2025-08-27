'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { ShapeTemplate, shapes, createCustomShape } from '../lib/shapes';
import { CustomShape } from '../lib/turso';
import { generateShapePreview } from '../lib/shape-preview';

interface ShapeSelectorProps {
  selectedShape: ShapeTemplate | null;
  onShapeSelect: (shape: ShapeTemplate) => void;
  onCustomShapeClick: () => void;
}

export default function ShapeSelector({ selectedShape, onShapeSelect, onCustomShapeClick }: ShapeSelectorProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'standard'>('all');
  const [savedShapes, setSavedShapes] = useState<CustomShape[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasSetInitialCategory, setHasSetInitialCategory] = useState(false);

  // Load saved shapes from Turso
  useEffect(() => {
    const loadSavedShapes = async () => {
      setLoading(true);
      try {
        const response = await fetch('/api/shapes');
        if (response.ok) {
          const data = await response.json();
          setSavedShapes(data.shapes || []);
        }
      } catch (error) {
        console.error('Failed to load saved shapes:', error);
      } finally {
        setLoading(false);
      }
    };

    loadSavedShapes();
  }, []);

  const standardShapesCount = useMemo(() => {
    return savedShapes.filter(shape => shape.is_standard).length;
  }, [savedShapes]);

  // Set default selection to 'standard' if standard shapes exist (only once)
  useEffect(() => {
    if (standardShapesCount > 0 && !hasSetInitialCategory) {
      setSelectedCategory('standard');
      setHasSetInitialCategory(true);
    }
  }, [standardShapesCount, hasSetInitialCategory]);

  const handleShapeClick = (shape: ShapeTemplate) => {
    if (shape.id === 'custom') {
      onCustomShapeClick();
    } else {
      onShapeSelect(shape);
    }
  };

  const filteredSavedShapes = useMemo(() => {
    return savedShapes.filter(shape => {
      const matchesSearch = searchQuery === '' || 
        shape.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        shape.description?.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesFilter = selectedCategory === 'all' || 
        (selectedCategory === 'standard' && shape.is_standard);
      
      return matchesSearch && matchesFilter;
    });
  }, [savedShapes, searchQuery, selectedCategory]);

  // Combine saved shapes with the custom draw option
  const allShapes = useMemo(() => {
    const savedShapeTemplates = filteredSavedShapes.map((shape): ShapeTemplate => ({
      id: shape.id,
      name: shape.name,
      icon: shape.icon || '🎨',
      category: shape.category,
      description: shape.description,
      isCustom: true,
      customPoints: shape.points,
      canvasSize: shape.canvas_size,
      is_standard: shape.is_standard,
      drawPath: (ctx: CanvasRenderingContext2D, width: number, height: number) => {
        const customShapeTemplate = createCustomShape(shape.points, shape.canvas_size.width, shape.canvas_size.height);
        customShapeTemplate.drawPath(ctx, width, height);
      }
    }));
    
    // Add the custom draw option at the end
    return [...savedShapeTemplates, ...shapes];
  }, [filteredSavedShapes]);

  const currentShapes = allShapes.filter(shape => {
    const matchesSearch = shape.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      shape.description?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-800">My Shapes</h3>
          <p className="text-sm text-gray-600">
            {savedShapes.length} saved shapes {loading && '⟳'}
          </p>
        </div>
        
        {/* Search Input */}
        <div className="relative">
          <input
            type="text"
            placeholder="Search shapes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-8 pr-3 py-1 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <svg className="w-4 h-4 absolute left-2 top-1.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
      </div>

      {/* Standard/All Shapes Filter */}
      {savedShapes.length > 0 && (
        <div className="mb-4">
          <div className="flex flex-wrap gap-2">
            {standardShapesCount > 0 && (
              <button
                onClick={() => setSelectedCategory('standard')}
                className={`px-3 py-1 text-xs font-medium rounded-full transition-colors ${
                  selectedCategory === 'standard'
                    ? 'bg-yellow-500 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                ⭐ Standard ({standardShapesCount})
              </button>
            )}
            <button
              onClick={() => setSelectedCategory('all')}
              className={`px-3 py-1 text-xs font-medium rounded-full transition-colors ${
                selectedCategory === 'all'
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              📁 All Shapes ({savedShapes.length})
            </button>
          </div>
        </div>
      )}

      {/* Shapes Grid */}
      <div className="grid grid-cols-3 gap-3">
        {currentShapes.map((shape) => {
          const isStandard = shape.is_standard;
          const shapePreview = shape.customPoints && shape.canvasSize 
            ? generateShapePreview(shape.customPoints, shape.canvasSize, 60)
            : null;
          
          return (
            <button
              key={shape.id}
              onClick={() => handleShapeClick(shape)}
              className={`
                relative p-4 rounded-lg border-2 transition-all duration-200
                flex flex-col items-center justify-center space-y-2 min-h-[120px]
                ${selectedShape?.id === shape.id && shape.id !== 'custom'
                  ? 'border-blue-500 bg-blue-50 shadow-md transform scale-105'
                  : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                }
                ${shape.id === 'custom' ? 'border-dashed border-green-400 hover:border-green-500 hover:bg-green-50' : ''}
                ${isStandard ? 'ring-2 ring-yellow-300 ring-offset-2' : ''}
              `}
              title={shape.description || shape.name}
            >
              {/* Standard Badge */}
              {isStandard && (
                <div className="absolute -top-2 -right-2 bg-yellow-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm">
                  ⭐
                </div>
              )}
              
              {/* Shape Preview or Icon */}
              {shapePreview ? (
                <img 
                  src={shapePreview} 
                  alt={shape.name}
                  className="w-12 h-12 object-contain"
                />
              ) : (
                <span className="text-3xl">{shape.icon}</span>
              )}
              
              <span className="text-sm font-medium text-gray-700 text-center">{shape.name}</span>
              
              {shape.id === 'custom' && (
                <span className="text-xs text-gray-500">Draw your own</span>
              )}
              
              {shape.category && shape.id !== 'custom' && (
                <span className="text-xs text-gray-400 bg-gray-100 px-2 py-1 rounded">
                  {shape.category}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Empty State */}
      {currentShapes.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          {searchQuery ? (
            <p>No shapes found matching &quot;{searchQuery}&quot;</p>
          ) : (
            <div>
              <p className="mb-2">No saved shapes yet!</p>
              <p className="text-sm">Create and save custom shapes to build your personal collection.</p>
            </div>
          )}
        </div>
      )}

    </div>
  );
}