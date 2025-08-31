'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useApp } from './contexts/AppContext';

export default function Home() {
  const router = useRouter();

  // Redirect to upload page on initial load
  useEffect(() => {
    router.push('/upload');
  }, [router]);

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gradient-to-br from-cyan-400/10 to-transparent rounded-full blur-3xl animate-floating"></div>
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-gradient-to-br from-purple-400/10 to-transparent rounded-full blur-3xl animate-floating delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-gradient-to-br from-pink-400/10 to-transparent rounded-full blur-3xl animate-floating delay-500"></div>
      </div>

      <div className="relative z-10 text-center">
        <div className="animate-spin w-16 h-16 border-4 border-cyan-400/30 border-t-cyan-400 rounded-full mx-auto mb-8"></div>
        <p className="text-xl text-gray-300">Redirecting to upload page...</p>
      </div>
    </div>
  );
}