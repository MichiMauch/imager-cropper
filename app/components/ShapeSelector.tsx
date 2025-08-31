'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { ShapeTemplate, shapes, createCustomShape } from '../lib/shapes';
import { CustomShape } from '../lib/turso';
import { generateShapePreview } from '../lib/shape-preview';

interface ShapeSelectorProps {
  selectedShape: ShapeTemplate | null;
  onShapeSelect: (shape: ShapeTemplate) => void;
  onCustomShapeClick: () => void;
  onShowSuccess?: (title: string, message: string) => void;
  onShowError?: (title: string, message: string) => void;
  onShowConfirm?: (title: string, message: string, onConfirm: () => void, onCancel?: () => void) => void;
}

export default function ShapeSelector({ selectedShape, onShapeSelect, onCustomShapeClick, onShowSuccess, onShowError, onShowConfirm }: ShapeSelectorProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'standard'>('all');
  const [savedShapes, setSavedShapes] = useState<CustomShape[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasSetInitialCategory, setHasSetInitialCategory] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [hoveredShapeId, setHoveredShapeId] = useState<string | null>(null);

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

  const handleDeleteShape = async (e: React.MouseEvent, shapeId: string, shapeName: string) => {
    e.stopPropagation(); // Prevent shape selection
    
    // Show confirmation toast instead of browser alert
    if (onShowConfirm) {
      onShowConfirm(
        'Delete Shape',
        `Are you sure you want to delete "${shapeName}"?`,
        () => performDelete(shapeId, shapeName), // onConfirm
        () => {} // onCancel (do nothing)
      );
    } else {
      // Fallback to browser confirm if toast system is not available
      if (!window.confirm(`Are you sure you want to delete "${shapeName}"?`)) {
        return;
      }
      performDelete(shapeId, shapeName);
    }
  };

  const performDelete = async (shapeId: string, shapeName: string) => {
    setDeletingId(shapeId);
    
    try {
      const response = await fetch(`/api/shapes/${shapeId}`, {
        method: 'DELETE',
      });
      
      if (response.ok) {
        // Remove the shape from local state
        setSavedShapes(prev => prev.filter(shape => shape.id !== shapeId));
        
        // If the deleted shape was selected, clear selection
        if (selectedShape?.id === shapeId) {
          onShapeSelect(null as unknown as ShapeTemplate);
        }
        
        // Show success toast
        onShowSuccess?.('Shape deleted', `"${shapeName}" has been successfully deleted.`);
      } else {
        const error = await response.json();
        onShowError?.('Delete failed', `Failed to delete shape: ${error.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Failed to delete shape:', error);
      onShowError?.('Delete failed', 'Failed to delete shape. Please try again.');
    } finally {
      setDeletingId(null);
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
          <h3 className="text-lg font-semibold text-white">My Shapes</h3>
          <p className="text-sm text-gray-300">
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
            className="pl-8 pr-3 py-2 text-sm bg-gray-800/50 border border-gray-600/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 text-white placeholder-gray-400 backdrop-blur-sm cursor-text"
          />
          <svg className="w-4 h-4 absolute left-2 top-2.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
                className={`px-3 py-1 text-xs font-medium rounded-full transition-all duration-200 cursor-pointer ${
                  selectedCategory === 'standard'
                    ? 'bg-gradient-to-r from-yellow-500 to-amber-500 text-white shadow-lg shadow-yellow-500/25'
                    : 'bg-gray-700/50 text-gray-300 hover:bg-gray-600/50 border border-gray-600/50 backdrop-blur-sm'
                }`}
              >
                ⭐ Standard ({standardShapesCount})
              </button>
            )}
            <button
              onClick={() => setSelectedCategory('all')}
              className={`px-3 py-1 text-xs font-medium rounded-full transition-all duration-200 cursor-pointer ${
                selectedCategory === 'all'
                  ? 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-lg shadow-blue-500/25'
                  : 'bg-gray-700/50 text-gray-300 hover:bg-gray-600/50 border border-gray-600/50 backdrop-blur-sm'
              }`}
            >
              📁 All Shapes ({savedShapes.length})
            </button>
          </div>
        </div>
      )}

      {/* Revolutionary 3D Shapes Grid */}
      <div className="grid grid-cols-3 gap-6 perspective-1000" style={{ perspective: '1000px' }}>
        {currentShapes.map((shape) => {
          const isStandard = shape.is_standard;
          const shapePreview = shape.customPoints && shape.canvasSize 
            ? generateShapePreview(shape.customPoints, shape.canvasSize, 60)
            : null;
          
          return (
            <div
              key={shape.id}
              className="relative"
              onMouseEnter={() => setHoveredShapeId(shape.id)}
              onMouseLeave={() => setHoveredShapeId(null)}
            >
              <button
                onClick={() => handleShapeClick(shape)}
                disabled={deletingId === shape.id}
                className={`
                  group relative w-full p-6 rounded-2xl transition-all duration-500
                  flex flex-col items-center justify-center space-y-3 min-h-[140px]
                  glass-morphism border transform-gpu
                  ${selectedShape?.id === shape.id && shape.id !== 'custom'
                    ? 'bg-gradient-to-br from-indigo-500/30 to-indigo-600/30 border-indigo-400/60 shadow-2xl shadow-indigo-500/30 scale-110 -rotate-2 subtle-shadow-lg'
                    : 'bg-gray-800/20 border-gray-600/40 hover:bg-gray-700/30 hover:border-gray-500/60'
                  }
                  ${shape.id === 'custom' ? 'border-dashed border-teal-400/60 hover:border-teal-400/80 hover:bg-teal-500/20 hover:subtle-shadow' : ''}
                  ${isStandard ? 'ring-2 ring-yellow-400/60 ring-offset-2 ring-offset-transparent' : ''}
                  ${deletingId === shape.id ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:scale-105 hover:-translate-y-2 hover:rotate-1'}
                  preserve-3d
                `}
                style={{
                  transformStyle: 'preserve-3d',
                  transform: selectedShape?.id === shape.id && shape.id !== 'custom' 
                    ? 'perspective(1000px) rotateX(-5deg) rotateY(5deg) scale(1.1) translateY(-8px)'
                    : 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale(1) translateY(0px)'
                }}
                onMouseEnter={(e) => {
                  if (deletingId !== shape.id && selectedShape?.id !== shape.id) {
                    e.currentTarget.style.transform = 'perspective(1000px) rotateX(-10deg) rotateY(10deg) scale(1.05) translateY(-12px)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (deletingId !== shape.id && selectedShape?.id !== shape.id) {
                    e.currentTarget.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale(1) translateY(0px)';
                  }
                }}
                title={shape.description || shape.name}
              >
                {/* 3D Depth Effect */}
                <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent rounded-2xl transform translate-z-4"></div>
                
                {/* Floating Background Morphs */}
                <div className="absolute -top-2 -right-2 w-8 h-8 bg-gradient-to-br from-slate-400/10 to-transparent animate-morphing blur-sm"></div>
                <div className="absolute -bottom-2 -left-2 w-6 h-6 bg-gradient-to-br from-indigo-400/10 to-transparent animate-morphing blur-sm delay-1000"></div>
                {/* 3D Shape Preview or Icon */}
                <div className="relative group-hover:scale-110 transition-transform duration-500 transform-gpu">
                  {shapePreview ? (
                    <div className="relative">
                      <img 
                        src={shapePreview} 
                        alt={shape.name}
                        className="w-16 h-16 object-contain transform group-hover:rotate-12 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent blur-md group-hover:blur-lg transition-all duration-500"></div>
                    </div>
                  ) : (
                    <div className="relative">
                      <span className="text-4xl transform group-hover:rotate-12 group-hover:scale-125 transition-all duration-500 inline-block">
                        {shape.icon}
                      </span>
                      <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent blur-lg group-hover:blur-xl transition-all duration-500"></div>
                    </div>
                  )}
                </div>
                
                {/* 3D Text Labels */}
                <div className="relative z-10 text-center space-y-1">
                  <span className="text-sm font-bold text-white text-center block transform group-hover:scale-110 transition-transform duration-300">
                    {shape.name}
                  </span>
                  
                  {shape.id === 'custom' && (
                    <span className="text-xs text-teal-300 block">
                      Draw your own
                    </span>
                  )}
                  
                  {shape.category && shape.id !== 'custom' && (
                    <span className="text-xs text-indigo-300 glass-morphism px-2 py-1 rounded-full inline-block transform group-hover:scale-105 transition-transform duration-300">
                      {shape.category}
                    </span>
                  )}
                </div>
                
                {/* Holographic Overlay */}
                <div className="absolute inset-0 holographic-overlay opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl pointer-events-none"></div>
              </button>
              
              {/* 3D Floating Delete Button */}
              {shape.id !== 'custom' && hoveredShapeId === shape.id && (
                <button
                  onClick={(e) => handleDeleteShape(e, shape.id, shape.name)}
                  className="absolute top-3 right-3 p-2 bg-gradient-to-br from-red-500 via-red-600 to-red-700 hover:from-red-400 hover:via-red-500 hover:to-red-600 text-white rounded-full shadow-2xl shadow-red-500/50 backdrop-blur-sm transition-all duration-300 z-20 cursor-pointer transform hover:scale-125 hover:-translate-y-1 hover:rotate-12"
                  style={{ transformStyle: 'preserve-3d' }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'perspective(500px) rotateX(-10deg) rotateY(10deg) scale(1.25) translateY(-4px) rotate(12deg)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'perspective(500px) rotateX(0deg) rotateY(0deg) scale(1) translateY(0px) rotate(0deg)';
                  }}
                  title="Delete shape"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-red-400/50 to-red-700/50 rounded-full blur-sm -z-10"></div>
                  <svg className="w-5 h-5 relative z-10 group-hover:rotate-90 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              )}
              
              {/* 3D Standard Badge */}
              {isStandard && (
                <div 
                  className="absolute -top-3 -right-3 bg-gradient-to-br from-yellow-400 via-yellow-500 to-amber-500 text-white rounded-full w-8 h-8 flex items-center justify-center text-lg shadow-2xl shadow-yellow-500/40 backdrop-blur-sm border-2 border-yellow-300/50 transform hover:scale-125 hover:rotate-12 transition-all duration-300"
                  style={{ transformStyle: 'preserve-3d' }}
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-yellow-300/50 to-amber-600/50 rounded-full blur-sm -z-10"></div>
                  <span className="relative z-10">⭐</span>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Empty State */}
      {currentShapes.length === 0 && (
        <div className="text-center py-8 text-gray-300">
          {searchQuery ? (
            <p>No shapes found matching &quot;{searchQuery}&quot;</p>
          ) : (
            <div>
              <p className="mb-2">No saved shapes yet!</p>
              <p className="text-sm text-gray-400">Create and save custom shapes to build your personal collection.</p>
            </div>
          )}
        </div>
      )}

    </div>
  );
}