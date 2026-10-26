'use client';

import React from 'react';
import Link from 'next/link';

interface LogoProps {
  variant?: 'full' | 'mark' | 'text';
  theme?: 'light' | 'dark';
  size?: 'sm' | 'md' | 'lg';
  showStudioTag?: boolean;
  customLogoUrl?: string;
  href?: string;
  className?: string;
}

export default function Logo({
  variant = 'full',
  theme = 'light',
  size = 'md',
  showStudioTag = false,
  customLogoUrl,
  href = '/',
  className = '',
}: LogoProps) {
  // Dimensions
  const iconSizes = {
    sm: 'w-7 h-7',
    md: 'w-9 h-9',
    lg: 'w-12 h-12',
  };

  const textSizes = {
    sm: 'text-xl',
    md: 'text-2xl sm:text-3xl',
    lg: 'text-3xl sm:text-4xl',
  };

  const customLogoHeights = {
    sm: 'max-h-8',
    md: 'max-h-10',
    lg: 'max-h-14',
  };

  const isDark = theme === 'dark';

  // If a custom PNG/SVG logo was uploaded from the admin dashboard, render it directly!
  if (customLogoUrl) {
    const customContent = (
      <div className={`group inline-flex items-center gap-2.5 select-none focus:outline-none ${className}`}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={customLogoUrl}
          alt="WhereIsIt Studio"
          className={`${customLogoHeights[size]} w-auto object-contain transition-transform duration-300 group-hover:scale-102`}
        />
        {showStudioTag && (
          <span className="text-[9px] uppercase tracking-[0.25em] font-bold text-[#7A8E9E] font-mono">
            3D Studio
          </span>
        )}
      </div>
    );

    if (href) {
      return (
        <Link href={href} className="inline-flex items-center focus:outline-none">
          {customContent}
        </Link>
      );
    }
    return customContent;
  }

  // Default Editorial Vector Logo
  const markIcon = (
    <div className={`relative ${iconSizes[size]} shrink-0 transition-transform duration-300 group-hover:scale-105`}>
      <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full drop-shadow-sm">
        {/* Outer Isometric 3D Hexagonal Prism */}
        <path
          d="M24 4L42 14V34L24 44L6 34V14L24 4Z"
          fill={isDark ? '#14191F' : '#F8F6F1'}
          stroke="#5C7489"
          strokeWidth="2.5"
          strokeLinejoin="round"
        />
        {/* Top Plane: Precision Coordinate */}
        <path
          d="M24 4L42 14L24 24L6 14L24 4Z"
          fill="#5C7489"
          fillOpacity={isDark ? '0.45' : '0.25'}
        />
        {/* Right Plane: Dusty Slate Shadow */}
        <path
          d="M24 24L42 14V34L24 44V24Z"
          fill="#5C7489"
          fillOpacity="0.85"
        />
        {/* Left Plane: Sculptural Noir */}
        <path
          d="M24 24L6 14V34L24 44V24Z"
          fill={isDark ? '#0C1014' : '#14191F'}
        />
        {/* Center Coordinate Bead (The Found Point) */}
        <circle cx="24" cy="24" r="3.2" fill="#F8F6F1" />
        {/* Dynamic Architectural Extrusion Loop / Question Glyph */}
        <path
          d="M18 19C18 15.8 20.8 14 24 14C27.2 14 30 15.8 30 18.2C30 20.6 28 22 26 23.5"
          stroke="#F8F6F1"
          strokeWidth="2"
          strokeLinecap="round"
        />
      </svg>
    </div>
  );

  const wordmark = (
    <div className="flex flex-col">
      <div className="flex items-baseline gap-1">
        <span
          className={`font-black tracking-[-0.04em] lowercase ${textSizes[size]} ${
            isDark ? 'text-white' : 'text-[#14191F]'
          } group-hover:text-[#5C7489] transition-colors`}
        >
          where<span className="text-[#5C7489]">is</span>it
        </span>
        <span className="w-1.5 h-1.5 rounded-full bg-[#5C7489] inline-block mb-1"></span>
      </div>
      {showStudioTag && (
        <span className="text-[9px] uppercase tracking-[0.25em] font-bold text-[#7A8E9E] -mt-1 font-mono">
          3D Objects Studio
        </span>
      )}
    </div>
  );

  const content = (
    <div className={`group inline-flex items-center gap-2.5 select-none focus:outline-none ${className}`}>
      {variant !== 'text' && markIcon}
      {variant !== 'mark' && wordmark}
    </div>
  );

  if (href) {
    return (
      <Link href={href} className="inline-flex items-center focus:outline-none">
        {content}
      </Link>
    );
  }

  return content;
}
