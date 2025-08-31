'use client';

import React, { useCallback, useState } from 'react';

interface ImageUploaderProps {
  onImageUpload: (file: File) => void;
}

export default function ImageUploader({ onImageUpload }: ImageUploaderProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);

  const handleFile = useCallback(async (file: File) => {
    setError(null);
    setIsUploading(true);
    
    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('Please upload an image file');
      setIsUploading(false);
      return;
    }
    
    // Validate file size (max 10MB)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      setError('Image size must be less than 10MB');
      setIsUploading(false);
      return;
    }
    
    // Simulate processing with satisfying animation
    await new Promise(resolve => setTimeout(resolve, 800));
    
    setIsUploading(false);
    setUploadSuccess(true);
    
    // Show success animation briefly before calling onImageUpload
    setTimeout(() => {
      onImageUpload(file);
    }, 600);
  }, [onImageUpload]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFile(files[0]);
    }
  }, [handleFile]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFile(files[0]);
    }
  }, [handleFile]);

  return (
    <div className="w-full">
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        className={`
          group relative border-2 border-dashed rounded-3xl p-8 text-center transition-all duration-500 transform
          glass-morphism backdrop-blur-xl cursor-pointer
          ${isDragging 
            ? 'border-slate-400/80 bg-slate-500/20 scale-105 subtle-shadow' 
            : 'border-gray-600/50 hover:border-slate-500/60 hover:bg-slate-500/10 hover:scale-102'
          }
          ${isUploading ? 'animate-pulse border-indigo-400/80 bg-indigo-500/20' : ''}
          ${uploadSuccess ? 'border-teal-400/80 bg-teal-500/20 subtle-shadow' : ''}
        `}
      >
        {/* Floating Morphing Backgrounds */}
        <div className="absolute top-4 right-4 w-16 h-16 bg-gradient-to-br from-slate-400/10 to-transparent animate-morphing blur-lg"></div>
        <div className="absolute bottom-4 left-4 w-12 h-12 bg-gradient-to-br from-indigo-400/10 to-transparent animate-morphing blur-md delay-1000"></div>
        
        <input
          type="file"
          accept="image/*"
          onChange={handleFileInput}
          disabled={isUploading}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
        />
        
        {/* Dynamic Icon */}
        <div className="relative mb-4">
          {uploadSuccess ? (
            <div className="mx-auto h-12 w-12 text-teal-400 animate-bounce">
              <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-full h-full">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
              </svg>
              <div className="absolute inset-0 bg-teal-400/20 rounded-full blur-lg"></div>
            </div>
          ) : isUploading ? (
            <div className="mx-auto h-12 w-12 text-indigo-400 animate-spin">
              <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-full h-full">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              <div className="absolute inset-0 bg-indigo-400/20 rounded-full blur-lg"></div>
            </div>
          ) : (
            <div className="mx-auto h-12 w-12 text-slate-400 group-hover:scale-125 group-hover:rotate-12 transition-transform duration-500">
              <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-full h-full">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
              <div className="absolute inset-0 bg-slate-400/10 rounded-full blur-lg group-hover:blur-xl transition-all duration-300"></div>
            </div>
          )}
        </div>
        
        {/* Dynamic Text */}
        <div className="relative z-10">
          {uploadSuccess ? (
            <div className="space-y-2 animate-fadeIn">
              <p className="text-xl font-bold text-teal-400">
                Upload Successful!
              </p>
              <p className="text-sm text-teal-300">
                Processing your image...
              </p>
            </div>
          ) : isUploading ? (
            <div className="space-y-2">
              <p className="text-xl font-bold text-indigo-400">
                Processing...
              </p>
              <div className="flex justify-center space-x-1">
                <div className="w-2 h-2 bg-indigo-400 rounded-full animate-pulse"></div>
                <div className="w-2 h-2 bg-indigo-400 rounded-full animate-pulse delay-100"></div>
                <div className="w-2 h-2 bg-indigo-400 rounded-full animate-pulse delay-200"></div>
              </div>
            </div>
          ) : (
            <div className="space-y-3 animate-fadeIn">
              <p className="text-2xl font-black text-white group-hover:text-slate-400 transition-colors duration-300">
                {isDragging ? 'DROP IT HERE!' : 'UPLOAD IMAGE'}
              </p>
              <p className="text-sm text-gray-300 group-hover:text-slate-300 transition-colors duration-300">
                Drag & drop or click to browse
              </p>
              <p className="text-xs text-gray-400 glass-morphism px-3 py-1 rounded-full inline-block">
                JPG, PNG, GIF, WEBP (max 10MB)
              </p>
            </div>
          )}
        </div>
        
        {/* Holographic Overlay */}
        <div className="absolute inset-0 holographic-overlay opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-3xl pointer-events-none"></div>
      </div>
      
      {error && (
        <div className="mt-4 p-3 bg-gradient-to-r from-red-900/50 to-red-800/50 border border-red-500/50 rounded-xl backdrop-blur-sm animate-slideUp">
          <p className="text-sm text-red-400 text-center">{error}</p>
        </div>
      )}
    </div>
  );
}