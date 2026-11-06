import React, { useState } from 'react';
import { Sparkles, Loader2 } from 'lucide-react';
import { DifferenceCard } from '@/lib/siteSettings';

interface WhatMakesDifferenceProps {
  badge?: string;
  title?: string;
  subtitle?: string;
  image1?: string;
  image2?: string;
  image3?: string;
  image4?: string;
  cards?: DifferenceCard[];
  isLoading?: boolean;
}

export const WhatMakesDifference: React.FC<WhatMakesDifferenceProps> = ({
  badge = 'THE GREESAL PROMISE',
  title = 'what makes the difference?',
  subtitle = 'Every bowl is handcrafted from farm-to-table with zero shortcuts, zero chemicals, and uncompromised love.',
  image1 = '',
  image2 = '',
  image3 = '',
  image4 = '',
  cards = [],
  isLoading = false,
}) => {
  const [loadedImages, setLoadedImages] = useState<Record<string, boolean>>({});
  const [failedImages, setFailedImages] = useState<Record<string, boolean>>({});

  // Keep uploaded images, including the premium ingredients showcase.
  const validImages = [image1, image2, image3, image4].filter(
    (img): img is string =>
      typeof img === 'string' &&
      img.trim() !== ''
  );

  // 1. During initial settings loading, show a fast, elegant loader (NO DEMO IMAGE)
  if (isLoading) {
    return (
      <section id="difference" className="py-12 sm:py-16 bg-gradient-to-b from-[#f7fbf9] via-white to-[#f7fbf9] relative overflow-hidden border-b border-gray-100 font-dmsans">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <div className="max-w-3xl mx-auto mb-8 sm:mb-10">
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

          {/* Loader Card */}
          <div className="max-w-3xl mx-auto p-12 sm:p-16 rounded-3xl bg-white border border-emerald-100 shadow-lg flex flex-col items-center justify-center min-h-[260px] animate-pulse">
            <Loader2 className="w-10 h-10 text-[#20493c] animate-spin mb-3" />
            <p className="text-sm font-extrabold text-[#20493c]">Loading Fresh Ingredients Showcase...</p>
            <p className="text-xs text-gray-400 mt-1">Greesal clean farm-to-table promise</p>
          </div>
        </div>
      </section>
    );
  }

  // Dynamic grid layout class: max 2 per row (2x2 grid layout)
  const getGridColsClass = (count: number) => {
    if (count === 1) return 'grid-cols-1 max-w-4xl mx-auto';
    return 'grid-cols-2 max-w-6xl mx-auto';
  };
  const visibleImages = validImages
    .map((src, idx) => ({ src, idx }))
    .filter(({ src }) => !failedImages[src]);

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

        {/* Dynamic Graphic Showcase (1-4 Images) */}
        {visibleImages.length > 0 ? (
          <div className="w-full">
            <div className={`grid ${getGridColsClass(visibleImages.length)} gap-6 lg:gap-8 items-stretch justify-center`}>
              {visibleImages.map(({ src: imgSrc, idx }) => {
              const isLoaded = loadedImages[imgSrc];

              return (
                <div
                  key={imgSrc}
                  className="relative aspect-video bg-white rounded-3xl p-3 sm:p-5 shadow-xl border border-emerald-100/80 overflow-hidden group transition-all duration-500 hover:shadow-2xl"
                >
                  <div className="absolute inset-0 bg-gradient-to-tr from-emerald-500/5 to-amber-500/5 rounded-3xl pointer-events-none" />

                  {/* Individual Image Loading Placeholder */}
                  {!isLoaded && (
                    <div className="absolute inset-3 sm:inset-5 rounded-2xl bg-emerald-50/50 flex flex-col items-center justify-center animate-pulse">
                      <Loader2 className="w-7 h-7 text-[#20493c] animate-spin mb-2" />
                      <span className="text-xs font-bold text-[#20493c]/70">Loading image...</span>
                    </div>
                  )}

                  <div className="absolute inset-3 sm:inset-5">
                    <img
                      src={imgSrc}
                      alt={`What Makes The Difference - Graphic ${idx + 1}`}
                      className={`h-full w-full object-contain rounded-2xl transition-all duration-500 group-hover:scale-[1.01] ${isLoaded ? 'opacity-100' : 'opacity-0'}`}
                      onLoad={() => setLoadedImages((prev) => ({ ...prev, [imgSrc]: true }))}
                      onError={() => setFailedImages((prev) => ({ ...prev, [imgSrc]: true }))}
                      loading="eager"
                    />
                  </div>
                </div>
              );
              })}
            </div>
          </div>
        ) : cards.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 lg:gap-7 text-left">
            {cards.map((card) => (
              <article
                key={card.id}
                className="overflow-hidden rounded-3xl border border-emerald-100 bg-white shadow-lg transition-shadow hover:shadow-xl"
              >
                {card.image && (
                  <img
                    src={card.image}
                    alt={card.title}
                    className="h-48 w-full object-cover"
                    loading="lazy"
                  />
                )}
                <div className="p-5">
                  {card.badge && (
                    <span className="inline-flex rounded-full bg-[#e8f7f2] px-3 py-1 text-[10px] font-black uppercase tracking-wider text-[#20493c]">
                      {card.badge}
                    </span>
                  )}
                  <h3 className="mt-3 text-lg font-extrabold text-[#20493c]">{card.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-[#20493c]/75">{card.desc}</p>
                </div>
              </article>
            ))}
          </div>
        ) : null}

      </div>
    </section>
  );
};
