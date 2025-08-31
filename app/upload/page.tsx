'use client';

import { useRouter } from 'next/navigation';
import { useApp } from '../contexts/AppContext';
import ImageUploader from '../components/ImageUploader';

export default function UploadPage() {
  const router = useRouter();
  const { setImageFile, setCurrentStep, resetApp } = useApp();

  const handleImageUpload = (file: File) => {
    setImageFile(file);
    setCurrentStep('shapes');
    router.push('/shapes');
  };

  return (
    <div className="min-h-screen bg-black text-white overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gradient-to-br from-slate-400/5 to-transparent rounded-full blur-3xl animate-floating"></div>
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-gradient-to-br from-indigo-400/5 to-transparent rounded-full blur-3xl animate-floating delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-gradient-to-br from-slate-600/5 to-transparent rounded-full blur-3xl animate-floating delay-500"></div>
      </div>

      {/* Scrollable Content Container */}
      <div className="h-screen overflow-y-auto">
        <div className="flex items-center justify-center min-h-full">
          <div className="relative z-10 w-full max-w-4xl mx-auto px-8 py-12">
            {/* Header */}
            <div className="text-center mb-12">
              <h1 className="text-6xl font-black mb-6 tracking-tight leading-none">
                <span className="bg-gradient-to-r from-slate-300 to-slate-500 bg-clip-text text-transparent">
                  SHAPE CROPPER
                </span>
              </h1>
              
              <div className="text-2xl text-gray-300 font-extralight tracking-wide opacity-80 animate-fadeIn">
                <span className="relative">
                  Revolutionary Image Editing Experience
                  <div className="absolute inset-0 bg-gradient-to-r from-slate-400/5 to-slate-600/5 blur-lg -z-10"></div>
                </span>
              </div>
              
              <div className="absolute left-1/2 transform -translate-x-1/2 mt-6 w-32 h-1 bg-gradient-to-r from-transparent via-slate-400 to-transparent opacity-30"></div>
            </div>

            {/* Step Indicator */}
            <div className="flex items-center justify-center mb-12">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-gradient-to-br from-slate-500 to-slate-700 rounded-2xl flex items-center justify-center shadow-lg shadow-slate-500/20 subtle-shadow">
                  <span className="text-xl font-bold text-white">01</span>
                </div>
                <div className="text-2xl font-black text-slate-400">
                  UPLOAD IMAGE
                </div>
              </div>
            </div>

            {/* Upload Component */}
            <div className="max-w-2xl mx-auto">
              <ImageUploader onImageUpload={handleImageUpload} />
            </div>

            {/* Instructions */}
            <div className="text-center mt-8">
              <p className="text-gray-400 text-lg">
                Start by uploading your image to begin the cropping process
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Reset Button */}
      <div className="fixed top-8 right-8">
        <button
          onClick={resetApp}
          className="w-14 h-14 bg-gradient-to-r from-gray-700 to-gray-800 hover:from-gray-600 hover:to-gray-700 text-white rounded-full shadow-2xl shadow-gray-700/30 hover:shadow-gray-600/40 backdrop-blur-sm border border-gray-600/30 transition-all duration-300 transform hover:scale-110 cursor-pointer group"
          title="Reset App"
        >
          <svg className="w-6 h-6 mx-auto group-hover:rotate-180 transition-transform duration-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
        </button>
      </div>
    </div>
  );
}