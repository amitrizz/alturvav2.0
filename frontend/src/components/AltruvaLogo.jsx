import React from 'react';

export default function AltruvaLogo({ size = 42, className = '' }) {
  return (
    <div className={`altruva-logo-wrap ${className}`} style={{ width: size, height: size }}>
      <svg
        viewBox="0 0 120 120"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{ width: '100%', height: '100%', filter: 'drop-shadow(0 0 12px rgba(0,229,255,0.45))' }}
      >
        <defs>
          <linearGradient id="cyanWingGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#00f7ff" />
            <stop offset="60%" stopColor="#0088ff" />
            <stop offset="100%" stopColor="#0033aa" />
          </linearGradient>
          <linearGradient id="goldCoreGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#fff4cc" />
            <stop offset="40%" stopColor="#ffd700" />
            <stop offset="80%" stopColor="#d4af37" />
            <stop offset="100%" stopColor="#996515" />
          </linearGradient>
          <linearGradient id="goldAccent" x1="0%" y1="100%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#aa771c" />
            <stop offset="50%" stopColor="#ffd700" />
            <stop offset="100%" stopColor="#ffffff" />
          </linearGradient>
        </defs>

        {/* Outer Glow Ring */}
        <circle cx="60" cy="60" r="54" stroke="url(#cyanWingGrad)" strokeWidth="1.5" strokeDasharray="6 4" opacity="0.6" />
        <circle cx="60" cy="60" r="48" stroke="url(#goldCoreGrad)" strokeWidth="1" opacity="0.4" />

        {/* Left Wing */}
        <path
          d="M60 22 C48 38 24 48 18 64 C14 74 20 86 32 86 C40 86 50 72 60 52 Z"
          fill="url(#cyanWingGrad)"
          opacity="0.9"
        />
        {/* Left Wing Inner Feather */}
        <path
          d="M60 35 C52 46 36 54 30 68 C34 76 44 76 50 64 C54 56 58 46 60 35 Z"
          fill="#00e5ff"
          opacity="0.75"
        />

        {/* Right Wing */}
        <path
          d="M60 22 C72 38 96 48 102 64 C106 74 100 86 88 86 C80 86 70 72 60 52 Z"
          fill="url(#cyanWingGrad)"
          opacity="0.9"
        />
        {/* Right Wing Inner Feather */}
        <path
          d="M60 35 C68 46 84 54 90 68 C86 76 76 76 70 64 C66 56 62 46 60 35 Z"
          fill="#00e5ff"
          opacity="0.75"
        />

        {/* Center Golden Crystal / Spearhead */}
        <path
          d="M60 12 L70 56 L60 102 L50 56 Z"
          fill="url(#goldCoreGrad)"
        />
        {/* Diamond Core Highlights */}
        <path
          d="M60 12 L60 102 L50 56 Z"
          fill="url(#goldAccent)"
          opacity="0.7"
        />
        <path
          d="M60 32 L68 56 L60 76 L52 56 Z"
          fill="#ffffff"
          opacity="0.85"
        />

        {/* Base Diamond Node */}
        <polygon points="60,96 66,104 60,112 54,104" fill="url(#goldCoreGrad)" />
      </svg>
    </div>
  );
}
