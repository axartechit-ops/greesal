import React from 'react';

interface GreesalLogoProps {
  className?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
}

export const GreesalLogo: React.FC<GreesalLogoProps> = ({ className = '', size = 'md' }) => {
  const sizeMap = {
    xs: 'h-7 sm:h-8',
    sm: 'h-8 sm:h-10',
    md: 'h-11 sm:h-13 md:h-14',
    lg: 'h-[52px] sm:h-[64px] lg:h-[72px]',
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

