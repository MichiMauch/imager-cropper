'use client';

import React, { useState } from 'react';
import { Point } from '../lib/shapes';

interface SaveShapeDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (shapeData: {
    name: string;
    description: string;
    is_standard: boolean;
  }) => void;
  points: Point[];
  canvasSize: { width: number; height: number } | null;
}

export default function SaveShapeDialog({
  isOpen,
  onClose,
  onSave,
  points,
  canvasSize
}: SaveShapeDialogProps) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    is_standard: false
  });

  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      alert('Please enter a name for your shape');
      return;
    }

    setSaving(true);
    
    try {
      await onSave(formData);
      
      // Reset form
      setFormData({
        name: '',
        description: '',
        is_standard: false
      });
      
      onClose();
    } catch (error) {
      console.error('Failed to save shape:', error);
      // Error handling is done in parent component via toast
    } finally {
      setSaving(false);
    }
  };

  const handleClose = () => {
    if (!saving) {
      onClose();
    }
  };


  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">
              Save Custom Shape
            </h3>
            <button
              onClick={handleClose}
              disabled={saving}
              className="text-gray-400 hover:text-gray-600 disabled:cursor-not-allowed"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Shape Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Shape Name *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                placeholder="e.g., Custom Arrow, My Logo Shape"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
                disabled={saving}
              />
            </div>



            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description (Optional)
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                placeholder="Brief description of the shape's purpose..."
                rows={2}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={saving}
              />
            </div>

            {/* Standard Shape Checkbox */}
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="is_standard"
                checked={formData.is_standard}
                onChange={(e) => setFormData({...formData, is_standard: e.target.checked})}
                disabled={saving}
                className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
              />
              <label htmlFor="is_standard" className="text-sm font-medium text-gray-700">
                Als Standard-Shape markieren ⭐
              </label>
            </div>
            <p className="text-xs text-gray-500 -mt-2">
              Standard-Shapes werden oben in der Liste angezeigt und sind schnell verfügbar.
            </p>

            {/* Shape Info */}
            <div className="bg-gray-50 p-3 rounded-md">
              <h4 className="text-sm font-medium text-gray-700 mb-1">Shape Details</h4>
              <div className="text-xs text-gray-600 space-y-1">
                <div>Points: {points.length}</div>
                <div>Canvas: {canvasSize?.width}x{canvasSize?.height}px</div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex space-x-3 pt-4">
              <button
                type="button"
                onClick={handleClose}
                disabled={saving}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 disabled:cursor-not-allowed disabled:bg-gray-100"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving || !formData.name.trim()}
                className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:cursor-not-allowed disabled:bg-gray-400"
              >
                {saving ? 'Saving...' : 'Save Shape'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}