import React from 'react';
import { Sparkles } from 'lucide-react';

interface WhatMakesDifferenceProps {
  badge?: string;
  title?: string;
  subtitle?: string;
  image1?: string;
  image2?: string;
  image3?: string;
  image4?: string;
}

export const WhatMakesDifference: React.FC<WhatMakesDifferenceProps> = ({
  badge = 'THE GREESAL PROMISE',
  title = 'what makes the difference?',
  subtitle = 'Every bowl is handcrafted from farm-to-table with zero shortcuts, zero chemicals, and uncompromised love.',
  image1 = '/images/premium_fresh_ingredients.png',
  image2,
  image3,
  image4,
}) => {
  const validImages = [image1, image2, image3, image4].filter(
    (img): img is string => typeof img === 'string' && img.trim() !== ''
  );

  // If no images exist, do not render image container
  if (validImages.length === 0) {
    return null;
  }

  // Dynamic grid layout class: max 2 per row (2x2 grid layout)
  const getGridColsClass = (count: number) => {
    if (count === 1) return 'grid-cols-1 max-w-4xl mx-auto';
    return 'grid-cols-1 sm:grid-cols-2 max-w-6xl mx-auto';
  };

  return (
    <section id="difference" className="py-12 sm:py-16 bg-gradient-to-b from-[#f7fbf9] via-white to-[#f7fbf9] relative overflow-hidden border-b border-gray-100 font-dmsans">
      {/* Decorative background glows */}
      <div className="absolute top-1/4 -left-32 w-96 h-96 bg-[#6ac6ac]/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-[#fbce45]/15 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
        {/* Section Heading */}
        <div className="max-w-3xl mx-auto mb-8 sm:mb-12">
          {badge && (
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#e8f7f2] border border-[#6ac6ac]/30 text-xs font-bold uppercase tracking-wider text-[#20493c] mb-3 shadow-2xs">
              <Sparkles className="w-3.5 h-3.5 text-[#fbce45]" />
              {badge}
            </div>
          )}
          <h2 className="font-montserrat font-extrabold text-3xl sm:text-5xl text-[#20493c] tracking-tight capitalize">
            {title}
          </h2>
          {subtitle && (
            <p className="mt-3 text-sm sm:text-base text-[#20493c]/80 font-dmsans max-w-2xl mx-auto leading-relaxed">
              {subtitle}
            </p>
          )}
          <div className="w-16 h-1.5 bg-[#fbce45] mx-auto mt-4 rounded-full" />
        </div>

        {/* 4 Images Graphic Showcase - 2x2 Grid */}
        <div className="w-full">
          <div className={`grid ${getGridColsClass(validImages.length)} gap-6 lg:gap-8 items-stretch justify-center`}>
            {validImages.map((imgSrc, idx) => (
              <div
                key={idx}
                className="relative bg-white rounded-3xl p-3 sm:p-5 shadow-xl border border-emerald-100/80 overflow-hidden group transition-all duration-500 hover:shadow-2xl flex flex-col justify-center"
              >
                <div className="absolute inset-0 bg-gradient-to-tr from-emerald-500/5 to-amber-500/5 rounded-3xl pointer-events-none" />
                <img
                  src={imgSrc}
                  alt={`What Makes The Difference - Graphic ${idx + 1}`}
                  className="w-full h-auto max-h-[500px] object-contain rounded-2xl transition-transform duration-500 group-hover:scale-[1.01]"
                  loading="lazy"
                />
              </div>
            ))}
          </div>
        </div>

      </div>
    </section>
  );
};
