'use client';

import React, { useState } from 'react';
import { canvasToBlob, downloadImage } from '../lib/canvas-utils';

interface DownloadButtonProps {
  canvas: HTMLCanvasElement | null;
  filename?: string;
}

export default function DownloadButton({ canvas, filename = 'cropped-image' }: DownloadButtonProps) {
  const [downloading, setDownloading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDownload = async () => {
    if (!canvas) return;

    setDownloading(true);
    setError(null);

    try {
      const blob = await canvasToBlob(canvas);
      const timestamp = new Date().toISOString().split('T')[0];
      downloadImage(blob, `${filename}-${timestamp}.png`);
      setDownloading(false);
    } catch (err) {
      setError('Failed to download image');
      setDownloading(false);
      console.error(err);
    }
  };

  if (!canvas) {
    return null;
  }

  return (
    <div className="flex flex-col items-center space-y-2">
      <button
        onClick={handleDownload}
        disabled={downloading}
        className="group relative px-8 py-4 bg-gradient-to-br from-emerald-400 via-emerald-500 to-emerald-600 hover:from-emerald-300 hover:via-emerald-400 hover:to-emerald-500 text-white font-bold rounded-2xl shadow-2xl shadow-emerald-500/40 hover:shadow-emerald-400/60 transition-all duration-300 transform hover:scale-110 hover:-translate-y-2 disabled:from-gray-600 disabled:to-gray-700 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none cursor-pointer flex items-center space-x-3 perspective-1000 preserve-3d"
        style={{
          transform: downloading ? 'none' : 'perspective(1000px) rotateX(0deg) rotateY(0deg)',
          transformStyle: 'preserve-3d'
        }}
        onMouseEnter={(e) => {
          if (!downloading) {
            e.currentTarget.style.transform = 'perspective(1000px) rotateX(-5deg) rotateY(5deg) translateY(-8px) scale(1.1)';
          }
        }}
        onMouseLeave={(e) => {
          if (!downloading) {
            e.currentTarget.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) translateY(0px) scale(1)';
          }
        }}
      >
        {/* 3D Border Effect */}
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-300/50 to-emerald-600/50 rounded-2xl blur-sm -z-10 group-hover:blur-md transition-all duration-300"></div>
        
        {/* Inner Glow */}
        <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent rounded-2xl"></div>
        {/* Animated Icon */}
        <div className="relative">
          <svg
            className={`w-6 h-6 relative z-10 transition-all duration-300 ${downloading ? 'animate-bounce' : 'group-hover:scale-125'}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2.5}
              d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
          {/* Icon Glow */}
          <div className="absolute inset-0 bg-white/30 rounded-full blur-md group-hover:blur-lg transition-all duration-300"></div>
        </div>
        
        {/* Animated Text */}
        <span className="relative z-10 font-black text-lg tracking-wide">
          {downloading ? (
            <span className="flex items-center space-x-2">
              <span>DOWNLOADING</span>
              <div className="flex space-x-1">
                <div className="w-1.5 h-1.5 bg-white rounded-full animate-pulse"></div>
                <div className="w-1.5 h-1.5 bg-white rounded-full animate-pulse delay-100"></div>
                <div className="w-1.5 h-1.5 bg-white rounded-full animate-pulse delay-200"></div>
              </div>
            </span>
          ) : (
            'DOWNLOAD PNG'
          )}
        </span>
        
        {/* Holographic Overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-transparent via-white/10 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
      </button>
      
      {error && (
        <p className="text-sm text-red-600">{error}</p>
      )}
    </div>
  );
}