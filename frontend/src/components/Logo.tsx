"use client";

import { useState } from "react";

interface LogoProps {
  className?: string;
  showText?: boolean;
  height?: number;
}

export default function Logo({ className = "", showText = true, height = 48 }: LogoProps) {
  const [error, setError] = useState(false);

  if (error) {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        <svg viewBox="0 0 200 200" style={{ height }} aria-label="Eletox logo">
          <defs>
            <linearGradient id="eGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#1e3a8a" />
              <stop offset="100%" stopColor="#2563eb" />
            </linearGradient>
            <linearGradient id="boltGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#fbbf24" />
              <stop offset="100%" stopColor="#f97316" />
            </linearGradient>
          </defs>
          <rect x="35" y="35" width="130" height="130" rx="24" fill="url(#eGrad)" />
          <path d="M155 45 L85 95 L125 95 L65 165 L115 105 L75 105 L145 45 Z" fill="url(#boltGrad)" stroke="#fff" strokeWidth="3" />
          <text x="100" y="125" fontSize="78" fontWeight="bold" fill="white" textAnchor="middle" fontFamily="Arial, sans-serif">E</text>
        </svg>
        {showText && (
          <span className="text-2xl md:text-3xl font-bold tracking-tight">
            <span className="text-blue-800">El</span>
            <span className="text-orange-500">et</span>
            <span className="text-blue-800">o</span>
            <span className="text-orange-500">x</span>
          </span>
        )}
      </div>
    );
  }

  return (
    <img
      src="/logo.png"
      alt="Eletox"
      style={{ height }}
      className={`object-contain ${className}`}
      onError={() => setError(true)}
    />
  );
}
