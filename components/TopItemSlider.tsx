'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Salad, slugify, SaladPortion, getSaladPortions, getSaladPriceForPortion } from '@/lib/salads';
import { 
  ChevronLeft, 
  ChevronRight, 
  Flame, 
  Activity, 
  Leaf, 
  ShoppingCart, 
  Check, 
  Plus, 
  ArrowRight,
  ShieldCheck,
  Clock
} from 'lucide-react';

interface TopItemSliderProps {
  salads: Salad[];
  onAddToCart: (salad: Salad) => void;
  onSelectSalad?: (salad: Salad) => void;
  title?: string;
  subtitle?: string;
  badge?: string;
  showSlider?: boolean;
}

export const TopItemSlider: React.FC<TopItemSliderProps> = ({
  salads = [],
  onAddToCart,
  onSelectSalad,
  title = "Chef's Handcrafted Picks",
  subtitle = "Fresh daily organic bowls prepared fresh & delivered in 30 mins",
  badge = "Trending Bowls",
  showSlider = true,
}) => {
  const router = useRouter();
  const [activeIndex, setActiveIndex] = useState(0);
  const [addedItemMap, setAddedItemMap] = useState<Record<string, boolean>>({});
  const [selectedPortionMap, setSelectedPortionMap] = useState<Record<string, SaladPortion>>({});
  const [isPaused, setIsPaused] = useState(false);

  // Auto-advance timer (gentle pause on hover)
  useEffect(() => {
    if (isPaused || salads.length <= 1) return;
    const timer = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % salads.length);
    }, 5500);
    return () => clearInterval(timer);
  }, [isPaused, salads.length]);

  if (!showSlider || salads.length === 0) {
    return null;
  }

  const currentSalad = salads[activeIndex] || salads[0];
  const prevIndex = (activeIndex - 1 + salads.length) % salads.length;
  const nextIndex = (activeIndex + 1) % salads.length;
  const prevSalad = salads[prevIndex];
  const nextSalad = salads[nextIndex];

  const handlePrev = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    setActiveIndex(prevIndex);
  };

  const handleNext = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    setActiveIndex(nextIndex);
  };

  const getSaladUrl = (salad: Salad) => {
    const slug = salad.slug || salad.id || salad._id || slugify(salad.name);
    return `/salads/${slug}`;
  };

  const navigateToSalad = (salad: Salad) => {
    if (onSelectSalad) {
      onSelectSalad(salad);
    }
    const slug = salad.slug || salad.id || salad._id || slugify(salad.name);
    router.push(`/salads/${slug}`);
  };

  const handleAdd = (e: React.MouseEvent, salad: Salad, portion?: SaladPortion) => {
    e.stopPropagation();
    const key = salad._id || salad.id || salad.name;
    const portions = getSaladPortions(salad);
    const activePortion = portion || selectedPortionMap[key] || portions.find(p => p.isDefault) || portions[0];
    const activePrice = activePortion ? `₹${activePortion.price}` : salad.price;
    onAddToCart({
      ...salad,
      price: activePrice,
      selectedPortion: activePortion,
    });
    setAddedItemMap((prev) => ({ ...prev, [key]: true }));
    setTimeout(() => {
      setAddedItemMap((prev) => ({ ...prev, [key]: false }));
    }, 1400);
  };

  // Render title with green highlight on second word
  const renderTitle = (rawTitle: string) => {
    const parts = rawTitle.split(' ');
    if (parts.length >= 2) {
      return (
        <>
          {parts[0]}{' '}
          <span className="text-[#56aa52]">{parts[1]}</span>{' '}
          {parts.slice(2).join(' ')}
        </>
      );
    }
    return rawTitle;
  };

  // Helper to parse calories into { number, label }
  const parseCalories = (cal?: string) => {
    if (!cal) return { num: '387', unit: 'Kcal' };
    const parts = cal.trim().split(/\s+/);
    if (parts.length >= 2) {
      return { num: parts[0], unit: parts[1] };
    }
    const match = cal.match(/(\d+)\s*(.*)/);
    if (match) {
      return { num: match[1], unit: match[2] || 'Kcal' };
    }
    return { num: cal, unit: 'Kcal' };
  };

  // Helper to parse protein into { number, label }
  const parseProtein = (prot?: string) => {
    if (!prot) return { num: '19g', unit: 'Protein' };
    const parts = prot.trim().split(/\s+/);
    if (parts.length >= 2) {
      return { num: parts[0], unit: parts[1] };
    }
    const match = prot.match(/(\d+g?)\s*(.*)/i);
    if (match) {
      return { num: match[1], unit: match[2] || 'Protein' };
    }
    return { num: prot, unit: 'Protein' };
  };

  const calData = parseCalories(currentSalad.calories);
  const protData = parseProtein(currentSalad.protein);
  const isCurrentAdded = Boolean(addedItemMap[currentSalad._id || currentSalad.id || currentSalad.name]);

  return (
    <section 
      aria-label="Chef's Handcrafted Picks Top Slider"
      className="relative bg-gradient-to-b from-[#f3faf6] via-[#fafdfb] to-[#f3faf6] pt-8 sm:pt-10 pb-10 sm:pb-12 overflow-hidden font-dmsans select-none border-b border-emerald-100/60"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Decorative Organic Leaf Illustrations in Corners (Matches reference screenshot) */}
      
      {/* Top Left Leaves */}
      <div className="absolute -top-6 -left-6 sm:-top-8 sm:-left-8 w-36 h-36 sm:w-48 sm:h-48 pointer-events-none opacity-85 z-0">
        <svg viewBox="0 0 200 200" fill="none" className="w-full h-full drop-shadow-md">
          <path d="M-20 -20 C40 10, 80 50, 110 110 C80 120, 30 90, -20 -20 Z" fill="url(#leaf-grad-1)" />
          <path d="M10 -10 C60 10, 100 60, 120 130 C90 140, 50 100, 10 -10 Z" fill="url(#leaf-grad-2)" opacity="0.9" />
          <path d="M-30 30 C20 50, 60 90, 80 150 C50 160, 10 120, -30 30 Z" fill="url(#leaf-grad-1)" opacity="0.85" />
          <defs>
            <linearGradient id="leaf-grad-1" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#43983f" />
              <stop offset="100%" stopColor="#1a5a3a" />
            </linearGradient>
            <linearGradient id="leaf-grad-2" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#67bf63" />
              <stop offset="100%" stopColor="#2e7d32" />
            </linearGradient>
          </defs>
        </svg>
      </div>

      {/* Top Right Background Leaf Blur */}
      <div className="absolute top-4 -right-10 w-40 h-40 sm:w-56 sm:h-56 pointer-events-none opacity-50 blur-[1px] z-0">
        <svg viewBox="0 0 200 200" fill="none" className="w-full h-full">
          <path d="M220 -20 C160 20, 120 70, 90 130 C120 140, 170 100, 220 -20 Z" fill="url(#leaf-grad-2)" />
        </svg>
      </div>

      {/* Bottom Left Fresh Salad Leaves */}
      <div className="absolute -bottom-8 -left-6 sm:-bottom-10 sm:-left-8 w-44 h-44 sm:w-60 sm:h-60 pointer-events-none opacity-90 z-0">
        <svg viewBox="0 0 240 240" fill="none" className="w-full h-full drop-shadow-xl">
          <path d="M-20 260 C30 180, 90 130, 170 100 C150 160, 90 220, -20 260 Z" fill="url(#leaf-grad-1)" />
          <path d="M20 250 C70 180, 130 140, 200 120 C180 180, 120 230, 20 250 Z" fill="url(#leaf-grad-2)" opacity="0.9" />
          <path d="M-30 200 C20 140, 70 110, 140 90 C120 140, 70 190, -30 200 Z" fill="url(#leaf-grad-1)" opacity="0.8" />
        </svg>
      </div>

      {/* Bottom Right Fresh Leaves */}
      <div className="absolute -bottom-8 -right-6 sm:-bottom-10 sm:-right-8 w-44 h-44 sm:w-60 sm:h-60 pointer-events-none opacity-90 z-0">
        <svg viewBox="0 0 240 240" fill="none" className="w-full h-full drop-shadow-xl">
          <path d="M260 260 C210 180, 150 130, 70 100 C90 160, 150 220, 260 260 Z" fill="url(#leaf-grad-1)" />
          <path d="M220 250 C170 180, 110 140, 40 120 C60 180, 120 230, 220 250 Z" fill="url(#leaf-grad-2)" opacity="0.9" />
          <path d="M270 200 C220 140, 170 110, 100 90 C120 140, 170 190, 270 200 Z" fill="url(#leaf-grad-1)" opacity="0.8" />
        </svg>
      </div>

      {/* Ambient background soft glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3/4 h-72 bg-[#56aa52]/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Top Header: Badge, Title & Explore All Link */}
        <div className="relative text-center mb-6 sm:mb-8">
          {/* Centered Badge: "🌱 Trending Bowls" */}
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-[#e8f7ee] text-[#1c483a] text-xs font-bold border border-[#56aa52]/30 shadow-2xs mb-2.5">
            <Leaf className="w-3.5 h-3.5 text-[#56aa52]" />
            <span>{badge || 'Trending Bowls'}</span>
          </div>

          {/* Heading */}
          <h2 className="font-montserrat font-black text-2xl sm:text-4xl lg:text-[44px] text-[#123B2B] tracking-tight leading-tight">
            {renderTitle(title || "Chef's Handcrafted Picks")}
          </h2>

          {/* Subtitle */}
          {subtitle && (
            <p className="text-xs sm:text-sm md:text-[15px] text-gray-600 font-medium mt-1.5 max-w-xl mx-auto">
              {subtitle}
            </p>
          )}

          {/* Top Right: "Explore All Salads →" Pill */}
          <div className="sm:absolute sm:right-0 sm:top-1/2 sm:-translate-y-1/2 mt-3.5 sm:mt-0 flex justify-center sm:justify-end">
            <Link
              href="/salads"
              className="inline-flex items-center gap-2 px-4 py-1.5 sm:py-2 rounded-full border border-[#123B2B]/30 bg-white/90 hover:bg-[#123B2B] text-xs sm:text-sm font-bold text-[#123B2B] hover:text-white transition-all shadow-2xs hover:shadow-md cursor-pointer group"
            >
              <span>Explore All Salads</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </div>
        </div>

        {/* 3D Center-Focus Carousel Showcase */}
        <div className="relative flex items-center justify-center gap-3 sm:gap-6 lg:gap-8 my-2 sm:my-4">
          
          {/* Floating Left Arrow */}
          <button
            type="button"
            onClick={handlePrev}
            aria-label="Previous salad"
            className="absolute -left-2 sm:left-1 lg:left-4 z-30 w-11 h-11 sm:w-13 sm:h-13 rounded-full bg-white text-[#123B2B] hover:bg-[#56aa52] hover:text-white shadow-xl hover:shadow-2xl border border-gray-100 flex items-center justify-center transition-all duration-200 active:scale-95 cursor-pointer"
          >
            <ChevronLeft className="w-6 h-6 stroke-[2.5]" />
          </button>

          {/* Left Preview Card (Scaled Down, Routes on click) */}
          {salads.length > 1 && (
            <div
              onClick={() => navigateToSalad(prevSalad)}
              className="hidden md:flex flex-col justify-between w-60 lg:w-72 bg-white rounded-3xl p-3.5 sm:p-4 shadow-md hover:shadow-xl border border-gray-200/80 transform scale-[0.88] hover:scale-[0.92] opacity-80 hover:opacity-100 transition-all duration-300 cursor-pointer shrink-0 group select-none"
              title={`Click to view ${prevSalad.name}`}
            >
              {/* Image with Tag */}
              <div className="relative w-full h-44 rounded-2xl overflow-hidden bg-gray-100 mb-3">
                <img
                  src={prevSalad.image || 'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=600&q=80'}
                  alt={prevSalad.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <span className="absolute top-2.5 left-2.5 px-2.5 py-0.5 rounded-full bg-black/60 backdrop-blur-xs text-[10px] font-bold text-white uppercase tracking-wider">
                  {prevSalad.tag || 'New'}
                </span>
              </div>

              {/* Title & Price */}
              <div className="space-y-1">
                <h3 className="font-montserrat font-bold text-sm text-[#123B2B] truncate group-hover:text-[#56aa52] transition-colors">
                  {prevSalad.name}
                </h3>
                <div className="flex items-center justify-between pt-1">
                  <span className="font-montserrat font-extrabold text-base text-[#123B2B]">
                    {prevSalad.price}
                  </span>
                  <button
                    type="button"
                    onClick={(e) => handleAdd(e, prevSalad)}
                    className="inline-flex items-center gap-1 px-3 py-1 rounded-xl bg-emerald-50/70 hover:bg-[#123B2B] text-xs font-bold text-[#123B2B] hover:text-white border border-[#56aa52]/40 transition-all cursor-pointer active:scale-95"
                  >
                    <span>Add</span>
                    <Plus className="w-3 h-3 stroke-[2.5]" />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* MAIN HERO CENTER CARD (Big, Split Layout, Highlight Green Border) */}
          <div
            onClick={() => navigateToSalad(currentSalad)}
            className="w-full max-w-2xl lg:max-w-3xl bg-white rounded-3xl sm:rounded-[34px] p-4 sm:p-6 lg:p-7 shadow-2xl border-[2.5px] border-[#56aa52] relative z-20 transition-all duration-300 hover:shadow-[0_20px_50px_rgba(86,170,82,0.22)] cursor-pointer group select-none"
            title={`Click to view full details of ${currentSalad.name}`}
          >
            {/* Playful Green Radiant Accent on Top-Right Corner (Matches reference screenshot doodle) */}
            <div className="absolute -top-3.5 -right-3.5 sm:-top-4 sm:-right-4 pointer-events-none z-30">
              <svg width="42" height="42" viewBox="0 0 42 42" fill="none">
                <path d="M10 26 C14 18, 22 12, 34 8" stroke="#56aa52" strokeWidth="3" strokeLinecap="round" />
                <path d="M18 32 C24 24, 30 18, 38 14" stroke="#56aa52" strokeWidth="3" strokeLinecap="round" />
                <path d="M6 18 C12 12, 18 8, 24 2" stroke="#56aa52" strokeWidth="3" strokeLinecap="round" />
              </svg>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-12 gap-5 sm:gap-7 items-center">
              
              {/* Left Column: Big Salad Bowl Image */}
              <div className="sm:col-span-5 relative w-full h-56 sm:h-64 lg:h-72 rounded-2xl sm:rounded-3xl overflow-hidden bg-gray-100 shadow-inner">
                <img
                  src={currentSalad.image || 'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=800&q=80'}
                  alt={currentSalad.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                />

                {/* Popular Badge */}
                <div className="absolute top-3 left-3 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#123B2B]/90 backdrop-blur-md text-white text-xs font-bold shadow-md border border-white/20">
                  <Flame className="w-3.5 h-3.5 text-[#fbce45]" />
                  <span>{currentSalad.tag || 'Popular'}</span>
                </div>
              </div>

              {/* Right Column: Title, Ingredients, 3 Metrics & CTA */}
              <div className="sm:col-span-7 flex flex-col justify-between space-y-4">
                
                {/* Salad Name */}
                <div>
                  <h3 className="font-montserrat font-extrabold text-2xl sm:text-[28px] lg:text-3xl text-[#123B2B] group-hover:text-[#56aa52] transition-colors leading-tight">
                    {currentSalad.name}
                  </h3>
                  
                  {/* Ingredients summary */}
                  <p className="text-xs sm:text-sm text-gray-500 font-medium mt-2 leading-relaxed line-clamp-2">
                    {Array.isArray(currentSalad.ingredients) && currentSalad.ingredients.length > 0
                      ? currentSalad.ingredients.slice(0, 7).join(', ')
                      : 'Boiled Chickpeas, Beetroot, Cabbage, Cucumber, Cherry Tomato, Mixed Lettuce'}
                  </p>
                </div>

                {/* 3 Metric Columns (Icon on top, stat below - matches screenshot) */}
                <div className="flex items-center gap-6 sm:gap-8 pt-1">
                  
                  {/* Metric 1: Calories */}
                  <div className="flex flex-col items-center text-center">
                    <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-amber-50 flex items-center justify-center text-amber-500 mb-1 shadow-2xs">
                      <Flame className="w-5 h-5 fill-amber-500/20" />
                    </div>
                    <span className="font-montserrat font-bold text-xs sm:text-sm text-[#123B2B] leading-tight">
                      {calData.num}
                    </span>
                    <span className="text-[11px] font-semibold text-gray-500 leading-tight">
                      {calData.unit}
                    </span>
                  </div>

                  {/* Metric 2: Protein */}
                  <div className="flex flex-col items-center text-center">
                    <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-emerald-50 flex items-center justify-center text-[#56aa52] mb-1 shadow-2xs">
                      <Activity className="w-5 h-5 stroke-[2.5]" />
                    </div>
                    <span className="font-montserrat font-bold text-xs sm:text-sm text-[#123B2B] leading-tight">
                      {protData.num}
                    </span>
                    <span className="text-[11px] font-semibold text-gray-500 leading-tight">
                      {protData.unit}
                    </span>
                  </div>

                  {/* Metric 3: 100% Fresh */}
                  <div className="flex flex-col items-center text-center">
                    <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-teal-50 flex items-center justify-center text-teal-600 mb-1 shadow-2xs">
                      <Leaf className="w-5 h-5 text-[#56aa52]" />
                    </div>
                    <span className="font-montserrat font-bold text-xs sm:text-sm text-[#123B2B] leading-tight">
                      100%
                    </span>
                    <span className="text-[11px] font-semibold text-gray-500 leading-tight">
                      Fresh
                    </span>
                  </div>

                </div>

                {/* Gram Portions Selector */}
                {(() => {
                  const saladKey = currentSalad._id || currentSalad.id || currentSalad.name;
                  const portions = getSaladPortions(currentSalad);
                  const activePortion = selectedPortionMap[saladKey] || portions.find((p) => p.isDefault) || portions[0];

                  return (
                    <div className="pt-2 border-t border-gray-100">
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-[10px] sm:text-[11px] font-bold text-gray-500 uppercase tracking-wider">
                          Bowl Weight:
                        </span>
                        <span className="text-xs font-black text-[#123B2B] bg-[#e8f7ee] px-2 py-0.5 rounded-full border border-[#56aa52]/30">
                          {activePortion?.grams}g Bowl
                        </span>
                      </div>
                      <div className="grid grid-cols-3 gap-2">
                        {portions.map((p) => {
                          const isSelected = activePortion?.grams === p.grams;
                          return (
                            <button
                              key={p.grams}
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedPortionMap((prev) => ({ ...prev, [saladKey]: p }));
                              }}
                              className={`py-1.5 px-2 rounded-xl text-center transition-all cursor-pointer border flex flex-col items-center justify-center ${
                                isSelected
                                  ? 'bg-[#123B2B] text-white border-[#123B2B] shadow-sm ring-1 ring-[#56aa52]'
                                  : 'bg-gray-50 hover:bg-gray-100 text-[#123B2B] border-gray-200'
                              }`}
                            >
                              <span className={`text-xs font-black leading-tight ${isSelected ? 'text-[#56aa52]' : 'text-[#123B2B]'}`}>
                                {p.grams}g
                              </span>
                              <span className={`text-[11px] font-extrabold leading-tight ${isSelected ? 'text-white' : 'text-emerald-700'}`}>
                                ₹{p.price}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  );
                })()}

                {/* Bottom Row: Price & Add to Cart Button */}
                <div className="pt-2 flex items-center justify-between gap-3">
                  <div>
                    <span className="font-montserrat font-black text-2xl sm:text-3xl lg:text-[34px] text-[#123B2B]">
                      {(() => {
                        const saladKey = currentSalad._id || currentSalad.id || currentSalad.name;
                        const portions = getSaladPortions(currentSalad);
                        const activePortion = selectedPortionMap[saladKey] || portions.find((p) => p.isDefault) || portions[0];
                        return activePortion ? `₹${activePortion.price}` : currentSalad.price;
                      })()}
                    </span>
                  </div>

                  {/* Add to Cart CTA */}
                  <button
                    type="button"
                    onClick={(e) => handleAdd(e, currentSalad)}
                    className={`px-5 sm:px-7 py-3 sm:py-3.5 rounded-2xl font-bold text-xs sm:text-sm flex items-center gap-2 transition-all shadow-lg active:scale-95 cursor-pointer ${
                      isCurrentAdded
                        ? 'bg-emerald-600 text-white shadow-emerald-600/30'
                        : 'bg-[#123B2B] hover:bg-[#1a523c] text-white shadow-[#123B2B]/20 hover:scale-105'
                    }`}
                    title="Add directly to cart"
                  >
                    {isCurrentAdded ? (
                      <>
                        <Check className="w-4 h-4 stroke-[3]" />
                        <span>Added to Cart!</span>
                      </>
                    ) : (
                      <>
                        <ShoppingCart className="w-4 h-4 text-[#56aa52]" />
                        <span>Add to Cart →</span>
                      </>
                    )}
                  </button>
                </div>

              </div>

            </div>
          </div>

          {/* Right Preview Card (Scaled Down, Routes on click) */}
          {salads.length > 2 && (
            <div
              onClick={() => navigateToSalad(nextSalad)}
              className="hidden md:flex flex-col justify-between w-60 lg:w-72 bg-white rounded-3xl p-3.5 sm:p-4 shadow-md hover:shadow-xl border border-gray-200/80 transform scale-[0.88] hover:scale-[0.92] opacity-80 hover:opacity-100 transition-all duration-300 cursor-pointer shrink-0 group select-none"
              title={`Click to view ${nextSalad.name}`}
            >
              {/* Image with Tag */}
              <div className="relative w-full h-44 rounded-2xl overflow-hidden bg-gray-100 mb-3">
                <img
                  src={nextSalad.image || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&q=80'}
                  alt={nextSalad.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <span className="absolute top-2.5 left-2.5 px-2.5 py-0.5 rounded-full bg-black/60 backdrop-blur-xs text-[10px] font-bold text-white uppercase tracking-wider">
                  {nextSalad.tag || 'Popular'}
                </span>
              </div>

              {/* Title & Price */}
              <div className="space-y-1">
                <h3 className="font-montserrat font-bold text-sm text-[#123B2B] truncate group-hover:text-[#56aa52] transition-colors">
                  {nextSalad.name}
                </h3>
                <div className="flex items-center justify-between pt-1">
                  <span className="font-montserrat font-extrabold text-base text-[#123B2B]">
                    {nextSalad.price}
                  </span>
                  <button
                    type="button"
                    onClick={(e) => handleAdd(e, nextSalad)}
                    className="inline-flex items-center gap-1 px-3 py-1 rounded-xl bg-emerald-50/70 hover:bg-[#123B2B] text-xs font-bold text-[#123B2B] hover:text-white border border-[#56aa52]/40 transition-all cursor-pointer active:scale-95"
                  >
                    <span>Add</span>
                    <Plus className="w-3 h-3 stroke-[2.5]" />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Floating Right Arrow */}
          <button
            type="button"
            onClick={handleNext}
            aria-label="Next salad"
            className="absolute -right-2 sm:right-1 lg:right-4 z-30 w-11 h-11 sm:w-13 sm:h-13 rounded-full bg-white text-[#123B2B] hover:bg-[#56aa52] hover:text-white shadow-xl hover:shadow-2xl border border-gray-100 flex items-center justify-center transition-all duration-200 active:scale-95 cursor-pointer"
          >
            <ChevronRight className="w-6 h-6 stroke-[2.5]" />
          </button>

        </div>

        {/* Pagination Dots Indicator */}
        <div className="flex items-center justify-center gap-2 mt-5 sm:mt-6">
          {salads.map((s, idx) => (
            <button
              key={s._id || s.id || idx}
              type="button"
              onClick={() => setActiveIndex(idx)}
              aria-label={`Go to slide ${idx + 1}`}
              className={`transition-all duration-300 rounded-full cursor-pointer ${
                idx === activeIndex
                  ? 'w-7 h-2 bg-[#123B2B]'
                  : 'w-2 h-2 bg-gray-300 hover:bg-gray-400'
              }`}
            />
          ))}
        </div>

        {/* Bottom Feature Trust Badges */}
        <div className="flex flex-wrap items-center justify-center gap-6 sm:gap-12 mt-6 pt-5 border-t border-emerald-100/60 text-xs sm:text-sm font-bold text-[#123B2B]">
          <span className="flex items-center gap-2">
            <Leaf className="w-4 h-4 text-[#56aa52]" />
            <span>100% Organic</span>
          </span>
          <span className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-[#56aa52]" />
            <span>Fresh &amp; Healthy</span>
          </span>
          <span className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-[#56aa52]" />
            <span>Delivered in 30 Mins</span>
          </span>
        </div>

      </div>
    </section>
  );
};
