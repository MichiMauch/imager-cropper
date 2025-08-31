'use client';

import React, { useState } from 'react';

interface SectionProps {
  id: string;
  stepNumber: string;
  title: string;
  description: string;
  isActive: boolean;
  isCompleted: boolean;
  color: 'cyan' | 'purple' | 'pink' | 'emerald' | 'blue';
  children: React.ReactNode;
  className?: string;
  defaultExpanded?: boolean;
}

const colorConfig = {
  cyan: {
    gradient: 'from-slate-500 to-slate-700',
    border: 'border-slate-500/30',
    shadow: 'shadow-slate-500/20',
    activeGlow: 'active-shadow-slate',
    bg: 'from-slate-500/10',
    text: 'text-slate-400'
  },
  purple: {
    gradient: 'from-indigo-500 to-indigo-700',
    border: 'border-indigo-500/30',
    shadow: 'shadow-indigo-500/20',
    activeGlow: 'active-shadow-indigo',
    bg: 'from-indigo-500/10',
    text: 'text-indigo-400'
  },
  pink: {
    gradient: 'from-violet-500 to-violet-700',
    border: 'border-violet-500/30',
    shadow: 'shadow-violet-500/20',
    activeGlow: 'active-shadow-violet',
    bg: 'from-violet-500/10',
    text: 'text-violet-400'
  },
  emerald: {
    gradient: 'from-teal-500 to-teal-700',
    border: 'border-teal-500/30',
    shadow: 'shadow-teal-500/20',
    activeGlow: 'active-shadow-teal',
    bg: 'from-teal-500/10',
    text: 'text-teal-400'
  },
  blue: {
    gradient: 'from-blue-500 to-blue-700',
    border: 'border-blue-500/30',
    shadow: 'shadow-blue-500/20',
    activeGlow: 'active-shadow-blue',
    bg: 'from-blue-500/10',
    text: 'text-blue-400'
  }
};

export default function Section({
  id,
  stepNumber,
  title,
  description,
  isActive,
  isCompleted,
  color,
  children,
  className = '',
  defaultExpanded = true
}: SectionProps) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded || isActive);
  const colors = colorConfig[color];

  // Auto-expand when section becomes active
  React.useEffect(() => {
    if (isActive) {
      setIsExpanded(true);
    }
  }, [isActive]);

  const toggleExpanded = () => {
    setIsExpanded(!isExpanded);
  };

  return (
    <section 
      id={id} 
      className={`transition-all duration-700 ${
        isActive
          ? 'scale-105' 
          : isCompleted
          ? 'opacity-70 scale-98'
          : 'opacity-90 scale-100'
      } ${className}`}
    >
      <div className={`glass-morphism progressive-blur-dark border ${colors.border} rounded-3xl shadow-2xl ${colors.shadow} relative overflow-hidden ${
        isExpanded ? 'min-h-[300px]' : 'min-h-[100px]'
      } ${isActive ? colors.activeGlow : ''}`}>
        <div className={`absolute inset-0 bg-gradient-to-r ${colors.bg} to-transparent opacity-50`}></div>
        
        {/* Header - Always Visible */}
        <div 
          className="flex items-center justify-between p-8 cursor-pointer hover:bg-white/5 transition-colors duration-200"
          onClick={toggleExpanded}
        >
          <div className="flex items-center space-x-4">
            <div className={`w-12 h-12 bg-gradient-to-br ${colors.gradient} rounded-2xl flex items-center justify-center shadow-lg ${colors.shadow.replace('shadow-', 'shadow-lg shadow-')}`}>
              <span className="text-xl font-bold text-white">{stepNumber}</span>
            </div>
            <div>
              <h2 className={`text-3xl font-black ${colors.text} flex items-center space-x-3`}>
                <span>{title}</span>
                {isCompleted && (
                  <svg className="w-8 h-8 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </h2>
              <p className="text-gray-300">{description}</p>
            </div>
          </div>
          
          {/* Expand/Collapse Icon */}
          <div className="flex items-center space-x-2">
            <div className={`w-8 h-8 rounded-full bg-gradient-to-r ${colors.gradient} flex items-center justify-center transition-transform duration-300 ${
              isExpanded ? 'rotate-180' : ''
            }`}>
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
        </div>

        {/* Content - Collapsible */}
        <div className={`relative z-10 transition-all duration-500 overflow-hidden ${
          isExpanded 
            ? 'max-h-[2000px] opacity-100 pb-8 px-8' 
            : 'max-h-0 opacity-0'
        }`}>
          <div className="transform transition-transform duration-500">
            {children}
          </div>
        </div>
      </div>
    </section>
  );
}