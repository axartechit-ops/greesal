import React from 'react';

interface WhatsAppIconProps {
  className?: string;
  size?: number | string;
  color?: string;
}

export const WhatsAppIcon: React.FC<WhatsAppIconProps> = ({
  className = 'w-5 h-5',
  size,
  color,
}) => {
  return (
    <svg
      viewBox="0 0 24 24"
      width={size || '1em'}
      height={size || '1em'}
      fill={color || 'currentColor'}
      className={`inline-block shrink-0 ${className}`}
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21 5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01C17.18 3.04 14.69 2 12.04 2zm5.79 14.16c-.24.67-1.39 1.29-1.95 1.37-.5.07-1.15.1-1.84-.12-.42-.14-.96-.32-1.65-.62-2.89-1.25-4.77-4.16-4.91-4.35-.14-.19-1.18-1.57-1.18-2.99 0-1.42.74-2.12 1.01-2.41.26-.29.58-.36.77-.36.19 0 .38 0 .55.01.18.01.42-.07.65.49.24.58.82 2 .89 2.15.07.14.12.31.02.5-.1.19-.15.31-.29.48-.14.17-.3.38-.43.51-.15.14-.3.3-.13.59.17.29.76 1.25 1.63 2.03 1.12.99 2.06 1.3 2.35 1.44.29.15.46.12.63-.07.17-.19.73-.85.92-1.14.19-.29.38-.24.63-.15.25.1.58.27 1.58.77.29.14.48.24.55.36.07.12.07.69-.17 1.36z"
      />
    </svg>
  );
};
