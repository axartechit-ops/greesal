import React from 'react';

export const TopLeftLeafBranch: React.FC<{ className?: string }> = ({ className = '' }) => (
  <div className={`pointer-events-none absolute select-none ${className}`}>
    <svg
      width="220"
      height="220"
      viewBox="0 0 220 220"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="text-greesal-green/40 opacity-80"
    >
      <path
        d="M-20 -20 Q40 50 120 100 Q180 140 220 180"
        stroke="#1A5C45"
        strokeWidth="2.5"
        strokeLinecap="round"
        fill="none"
      />
      {/* Leaf pairs */}
      <path d="M15 15 C30 0 60 5 50 30 C35 30 15 25 15 15Z" fill="#144C38" opacity="0.7" />
      <path d="M35 35 C55 15 85 25 70 50 C50 50 30 40 35 35Z" fill="#1D694F" opacity="0.65" />
      <path d="M60 55 C85 35 115 50 95 75 C75 75 55 65 60 55Z" fill="#144C38" opacity="0.75" />
      <path d="M90 75 C120 55 145 75 125 100 C100 95 85 85 90 75Z" fill="#227A5B" opacity="0.7" />
      <path d="M120 95 C150 80 170 105 150 125 C130 120 115 110 120 95Z" fill="#144C38" opacity="0.6" />
      {/* Reverse side leaves */}
      <path d="M25 25 C10 40 15 70 35 55 C35 40 30 25 25 25Z" fill="#1D694F" opacity="0.65" />
      <path d="M50 45 C30 65 40 95 60 80 C60 60 50 45 50 45Z" fill="#144C38" opacity="0.7" />
      <path d="M75 70 C55 90 70 115 90 100 C85 80 75 70 75 70Z" fill="#227A5B" opacity="0.65" />
    </svg>
  </div>
);

export const CardTopRightLeaf: React.FC<{ className?: string }> = ({ className = '' }) => (
  <div className={`pointer-events-none absolute select-none ${className}`}>
    <svg
      width="160"
      height="160"
      viewBox="0 0 160 160"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="opacity-90"
    >
      <path
        d="M160 -10 C120 20 80 60 30 130"
        stroke="#144C38"
        strokeWidth="2"
        strokeLinecap="round"
      />
      {/* Branch Leaves */}
      <path d="M140 10 C110 5 95 30 115 45 C135 45 145 25 140 10Z" fill="#144C38" opacity="0.85" />
      <path d="M115 35 C85 25 70 55 95 70 C115 65 125 45 115 35Z" fill="#1D694F" opacity="0.8" />
      <path d="M90 60 C65 50 50 80 75 95 C95 85 100 70 90 60Z" fill="#227A5B" opacity="0.75" />
      <path d="M145 25 C130 50 155 70 160 45 C160 30 150 20 145 25Z" fill="#144C38" opacity="0.7" />
      <path d="M120 50 C100 75 125 95 135 75 C135 55 125 45 120 50Z" fill="#1D694F" opacity="0.75" />
    </svg>
  </div>
);

export const FloatingLeaf: React.FC<{ className?: string; rotation?: number }> = ({
  className = '',
  rotation = 15,
}) => (
  <div
    className={`pointer-events-none absolute select-none transition-transform duration-700 ${className}`}
    style={{ transform: `rotate(${rotation}deg)` }}
  >
    <svg width="42" height="42" viewBox="0 0 42 42" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M5 37 C5 37 12 12 37 5 C37 5 30 30 5 37 Z"
        fill="#1A5C45"
        opacity="0.45"
      />
      <path d="M5 37 Q21 21 37 5" stroke="#FAF6F0" strokeWidth="1" opacity="0.7" />
    </svg>
  </div>
);
