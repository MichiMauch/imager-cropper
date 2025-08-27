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
        className="px-6 py-3 bg-green-500 text-white font-medium rounded-lg hover:bg-green-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
      >
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
          />
        </svg>
        <span>{downloading ? 'Downloading...' : 'Download PNG'}</span>
      </button>
      
      {error && (
        <p className="text-sm text-red-600">{error}</p>
      )}
    </div>
  );
}