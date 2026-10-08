import React from 'react';
import { WhatsAppIcon } from './WhatsAppIcon';

export const FloatingWhatsAppBubble: React.FC = () => {
  const handleClick = () => {
    const text = encodeURIComponent('Hi Greesal! I would like to order fresh healthy salads.');
    window.open(`https://wa.me/919825144321?text=${text}`, '_blank');
  };

  return (
    <div className="fixed bottom-6 right-5 z-40 flex items-center">

      {/* Floating WhatsApp Button */}
      <button
        onClick={handleClick}
        className="w-14 h-14 rounded-full bg-[#25D366] hover:bg-[#20ba59] text-white flex items-center justify-center shadow-2xl transition-all duration-300 hover:scale-110 active:scale-95 border-2 border-white group relative cursor-pointer"
        aria-label="Chat with Greesal on WhatsApp"
      >
        <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-[#fbce45] border-2 border-white rounded-full animate-ping" />
        <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-[#fbce45] border-2 border-white rounded-full" />
        
        {/* Crisp Official WhatsApp Icon */}
        <WhatsAppIcon className="w-8 h-8 text-white transition-transform group-hover:scale-110" />
      </button>
    </div>
  );
};
