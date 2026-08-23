import React from 'react';

export function SUVIcon({ className = '', color = 'currentColor' }: { className?: string; color?: string }) {
  return (
    <svg viewBox="0 0 100 48" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} style={{ width: '100%', height: '100%' }}>
      {/* High Ground Clearance SUV Body Silhouette */}
      <path
        d="M 8 32 H 18 C 19 26 27 26 28 32 H 68 C 69 26 77 26 78 32 H 92 C 94 32 95 30 94 28 L 90 22 C 89 20 86 19 82 19 H 70 L 56 10 C 53 8 46 8 36 8 H 22 C 18 8 15 12 12 18 L 8 26 C 6 28 6 32 8 32 Z"
        stroke={color}
        strokeWidth="2.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="rgba(8, 41, 50, 0.06)"
      />
      {/* Windows */}
      <path
        d="M 24 12 H 36 V 19 H 18 L 24 12 Z M 40 12 H 54 L 66 19 H 40 V 12 Z"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Wheels */}
      <circle cx="23" cy="32" r="6" stroke={color} strokeWidth="2.8" fill="var(--white)" />
      <circle cx="73" cy="32" r="6" stroke={color} strokeWidth="2.8" fill="var(--white)" />
      <circle cx="23" cy="32" r="2.2" fill={color} />
      <circle cx="73" cy="32" r="2.2" fill={color} />
    </svg>
  );
}

export function SedanIcon({ className = '', color = 'currentColor' }: { className?: string; color?: string }) {
  return (
    <svg viewBox="0 0 100 48" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} style={{ width: '100%', height: '100%' }}>
      {/* 3-Box Sedan Body Silhouette */}
      <path
        d="M 6 33 H 17 C 18 27 26 27 27 33 H 69 C 70 27 78 27 79 33 H 94 C 96 33 97 31 96 29 L 91 23 C 89 21 85 21 78 21 H 72 L 58 11 C 55 9 47 9 36 9 H 26 C 22 9 18 14 15 21 H 10 C 7 21 6 25 6 33 Z"
        stroke={color}
        strokeWidth="2.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="rgba(8, 41, 50, 0.06)"
      />
      {/* Windows */}
      <path
        d="M 27 13 H 38 V 21 H 19 L 27 13 Z M 42 13 H 55 L 68 21 H 42 V 13 Z"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Wheels */}
      <circle cx="22" cy="33" r="5.5" stroke={color} strokeWidth="2.8" fill="var(--white)" />
      <circle cx="74" cy="33" r="5.5" stroke={color} strokeWidth="2.8" fill="var(--white)" />
      <circle cx="22" cy="33" r="2" fill={color} />
      <circle cx="74" cy="33" r="2" fill={color} />
    </svg>
  );
}

export function HatchbackIcon({ className = '', color = 'currentColor' }: { className?: string; color?: string }) {
  return (
    <svg viewBox="0 0 100 48" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} style={{ width: '100%', height: '100%' }}>
      {/* Compact Hatchback Silhouette */}
      <path
        d="M 8 33 H 18 C 19 27 27 27 28 33 H 68 C 69 27 77 27 78 33 H 92 C 94 33 95 31 93 28 L 86 21 H 72 L 58 11 C 54 9 44 9 32 9 H 24 C 20 9 16 14 14 21 L 8 27 C 6 29 6 33 8 33 Z"
        stroke={color}
        strokeWidth="2.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="rgba(8, 41, 50, 0.06)"
      />
      {/* Windows */}
      <path
        d="M 25 13 H 36 V 21 H 17 L 25 13 Z M 40 13 H 54 L 78 21 H 40 V 13 Z"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Wheels */}
      <circle cx="23" cy="33" r="5.5" stroke={color} strokeWidth="2.8" fill="var(--white)" />
      <circle cx="73" cy="33" r="5.5" stroke={color} strokeWidth="2.8" fill="var(--white)" />
      <circle cx="23" cy="33" r="2" fill={color} />
      <circle cx="73" cy="33" r="2" fill={color} />
    </svg>
  );
}

export function CoupeIcon({ className = '', color = 'currentColor' }: { className?: string; color?: string }) {
  return (
    <svg viewBox="0 0 100 48" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} style={{ width: '100%', height: '100%' }}>
      {/* Fastback Sports Coupe Silhouette */}
      <path
        d="M 5 34 H 16 C 17 28 25 28 26 34 H 70 C 71 28 79 28 80 34 H 95 C 97 34 98 32 96 30 L 90 24 C 88 22 84 22 75 22 H 66 L 48 10 C 44 8 36 8 28 10 L 16 22 L 8 26 C 5 28 5 34 5 34 Z"
        stroke={color}
        strokeWidth="2.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="rgba(8, 41, 50, 0.06)"
      />
      {/* Windows */}
      <path
        d="M 29 13 H 44 L 62 22 H 20 L 29 13 Z"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Wheels */}
      <circle cx="21" cy="34" r="5.5" stroke={color} strokeWidth="2.8" fill="var(--white)" />
      <circle cx="75" cy="34" r="5.5" stroke={color} strokeWidth="2.8" fill="var(--white)" />
      <circle cx="21" cy="34" r="2" fill={color} />
      <circle cx="75" cy="34" r="2" fill={color} />
    </svg>
  );
}

export function ConvertibleIcon({ className = '', color = 'currentColor' }: { className?: string; color?: string }) {
  return (
    <svg viewBox="0 0 100 48" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} style={{ width: '100%', height: '100%' }}>
      {/* Open-Top Convertible Roadster Silhouette */}
      <path
        d="M 5 34 H 16 C 17 28 25 28 26 34 H 70 C 71 28 79 28 80 34 H 95 C 97 34 98 32 96 30 L 90 24 C 88 22 82 22 74 22 H 44 L 38 13 C 36 10 32 10 30 13 L 26 22 H 8 C 5 24 5 34 5 34 Z"
        stroke={color}
        strokeWidth="2.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="rgba(8, 41, 50, 0.06)"
      />
      {/* Windshield & Headrest Contour */}
      <path
        d="M 38 14 L 44 22 M 50 20 C 52 18 56 18 58 20"
        stroke={color}
        strokeWidth="2.2"
        strokeLinecap="round"
      />
      {/* Wheels */}
      <circle cx="21" cy="34" r="5.5" stroke={color} strokeWidth="2.8" fill="var(--white)" />
      <circle cx="75" cy="34" r="5.5" stroke={color} strokeWidth="2.8" fill="var(--white)" />
      <circle cx="21" cy="34" r="2" fill={color} />
      <circle cx="75" cy="34" r="2" fill={color} />
    </svg>
  );
}
