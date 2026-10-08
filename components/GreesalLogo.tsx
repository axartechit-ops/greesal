import React from 'react';

interface GreesalLogoProps {
  className?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
}

export const GreesalLogo: React.FC<GreesalLogoProps> = ({ className = '', size = 'md' }) => {
  const sizeMap = {
    xs: 'h-7 sm:h-8',
    sm: 'h-8 sm:h-10',
    md: 'h-10 sm:h-12 md:h-13',
    lg: 'h-14 sm:h-16',
    xl: 'h-20 sm:h-24',
  };

  return (
    <div className={`inline-flex items-center justify-center select-none ${className}`}>
      <div className={`relative ${sizeMap[size]} w-auto flex items-center justify-center transition-transform duration-300 hover:scale-105`}>
        <img
          src="/images/greesal_clean_logo.png"
          alt="Greesal - Slice of Green"
          className="h-full w-auto object-contain"
        />
      </div>
    </div>
  );
};

