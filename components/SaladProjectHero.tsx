'use client';

import React, { useRef, useState } from 'react';
import Link from 'next/link';
import { Leaf, ArrowRight, Volume2, VolumeX, Sparkles, ShieldCheck, Clock, Play, Pause } from 'lucide-react';

interface SaladProjectHeroProps {
  onExploreMenu?: () => void;
  onSubscribeClick?: () => void;
  cityName?: string;
  howToOrderBadge?: string;
  howToOrderHeading?: string;
  howToOrderCardNumber?: string;
  howToOrderCardTitle?: string;
  howToOrderCardDesc?: string;
  howToOrderVideoUrl?: string;
  howToOrderVideoPoster?: string;
  howToOrderHighlight1?: string;
  howToOrderHighlight2?: string;
  howToOrderHighlight3?: string;
  howToOrderBtnText?: string;
  howToOrderBtnLink?: string;
}

export const SaladProjectHero: React.FC<SaladProjectHeroProps> = ({
  onExploreMenu,
  onSubscribeClick,
  cityName = 'Surat',
  howToOrderBadge = 'How We Craft Your Salad',
  howToOrderHeading = 'Get more from your lunch and dinner.',
  howToOrderCardNumber = '01',
  howToOrderCardTitle = 'How to Order Fresh Salad at Greesal',
  howToOrderCardDesc = '1. Select your favorite nutrient-packed salad bowl.\n2. Choose portion size (250g / 350g) and custom artisan dressing.\n3. Order via WhatsApp or instant online checkout for 30–45 min express delivery!',
  howToOrderVideoUrl = 'https://www.saladproject.co.uk/cdn/shop/videos/c/vp/ac39289fd8c543e9a83c9a7f8fcb0ad6/ac39289fd8c543e9a83c9a7f8fcb0ad6.HD-1080p-7.2Mbps-90049490.mp4?v=0',
  howToOrderVideoPoster = 'https://www.saladproject.co.uk/cdn/shop/files/preview_images/ac39289fd8c543e9a83c9a7f8fcb0ad6.thumbnail.0000000000.jpg?v=1785184737&width=1200',
  howToOrderHighlight1 = '⚡ 30–45 Min Express Delivery',
  howToOrderHighlight2 = '🥗 100% Satvik • No Onion Garlic',
  howToOrderHighlight3 = '✨ Free Delivery in Surat',
  howToOrderBtnText = 'Order Fresh Salad Now',
  howToOrderBtnLink = '/salads',
}) => {
  const [isSecondVideoMuted, setIsSecondVideoMuted] = useState(true);
  const secondVideoRef = useRef<HTMLVideoElement>(null);

  const [isHowToOrderMuted, setIsHowToOrderMuted] = useState(true);
  const [isHowToOrderPlaying, setIsHowToOrderPlaying] = useState(true);
  const howToOrderVideoRef = useRef<HTMLVideoElement>(null);

  const toggleSound = () => {
    if (secondVideoRef.current) {
      secondVideoRef.current.muted = !secondVideoRef.current.muted;
      setIsSecondVideoMuted(secondVideoRef.current.muted);
    }
  };

  const toggleHowToOrderSound = () => {
    if (howToOrderVideoRef.current) {
      howToOrderVideoRef.current.muted = !howToOrderVideoRef.current.muted;
      setIsHowToOrderMuted(howToOrderVideoRef.current.muted);
    }
  };

  const toggleHowToOrderPlay = () => {
    if (howToOrderVideoRef.current) {
      if (howToOrderVideoRef.current.paused) {
        howToOrderVideoRef.current.play();
        setIsHowToOrderPlaying(true);
      } else {
        howToOrderVideoRef.current.pause();
        setIsHowToOrderPlaying(false);
      }
    }
  };

  const handleOrderClick = (e: React.MouseEvent) => {
    if (onExploreMenu) {
      e.preventDefault();
      onExploreMenu();
    }
  };

  return (
    <div className="w-full bg-[#F1ECDE] font-dmsans text-[#123B2B] selection:bg-[#E5F97A] selection:text-[#123B2B]">
      
      {/* =========================================================================
          SECTION 1: DUAL-SPLIT HERO BANNER (Salad Eating Scene + Corn Sizzle Video)
          ========================================================================= */}
      <section className="relative w-full h-[85vh] min-h-[560px] max-h-[850px] overflow-hidden bg-[#0A1F18]">
        
        {/* Top Floating Floating Pill Navigation - Salad Project Aesthetic */}
        <div className="absolute top-5 left-4 right-4 sm:top-6 sm:left-8 sm:right-8 z-30 flex items-center justify-between pointer-events-auto">
          {/* Left Pill: Brand & Quick Links */}
          <div className="bg-white/95 backdrop-blur-md px-4 py-2 sm:px-5 sm:py-2.5 rounded-full shadow-lg border border-black/5 flex items-center gap-3 sm:gap-5 text-xs sm:text-sm font-bold text-[#123B2B] transition-transform hover:scale-[1.02]">
            <Link href="/" className="flex items-center gap-1.5 font-montserrat font-extrabold tracking-tight">
              <span className="w-6 h-6 rounded-full bg-[#123B2B] text-[#E5F97A] flex items-center justify-center text-xs font-black">
                G
              </span>
              <span className="hidden sm:inline uppercase">GREESAL</span>
            </Link>
            <span className="text-gray-300 font-normal">|</span>
            <Link
              href="/salads"
              onClick={handleOrderClick}
              className="hover:text-[#25A87D] transition-colors uppercase tracking-wider text-[11px] sm:text-xs"
            >
              Order
            </Link>
            <Link
              href="/salads"
              onClick={handleOrderClick}
              className="hover:text-[#25A87D] transition-colors uppercase tracking-wider text-[11px] sm:text-xs hidden xs:inline"
            >
              Menu
            </Link>
            <a
              href="#story"
              className="hover:text-[#25A87D] transition-colors uppercase tracking-wider text-[11px] sm:text-xs hidden md:inline"
            >
              Story
            </a>
          </div>
        </div>

        {/* The 50/50 Split Canvas */}
        <div className="grid grid-cols-1 md:grid-cols-2 w-full h-full">
          
          {/* Left Panel: High Fashion Salad Eating Scene */}
          <div className="relative w-full h-full overflow-hidden bg-[#123B2B]">
            <img
              src="https://www.saladproject.co.uk/cdn/shop/files/HeroSalad.jpg?v=1777326186&width=1200"
              alt="Fresh Gourmet Salad at Greesal Kitchen"
              className="w-full h-full object-cover object-center filter brightness-[0.96]"
            />
            {/* Subtle Gradient Veil */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/10 to-black/25 pointer-events-none" />
          </div>

          {/* Right Panel: Golden Grilled Sweet Corn Video */}
          <div className="relative w-full h-full overflow-hidden bg-[#19140E]">
            <video
              autoPlay
              muted
              loop
              playsInline
              poster="https://www.saladproject.co.uk/cdn/shop/files/preview_images/0a1ad6bc1a6c4be898e0df00208dbb4e.thumbnail.0000000000.jpg?v=1777326233&width=1200"
              className="w-full h-full object-cover object-center filter brightness-[0.96]"
            >
              <source
                src="https://www.saladproject.co.uk/cdn/shop/videos/c/vp/0a1ad6bc1a6c4be898e0df00208dbb4e/0a1ad6bc1a6c4be898e0df00208dbb4e.HD-1080p-3.3Mbps-82813362.mp4?v=0"
                type="video/mp4"
              />
            </video>
            {/* Subtle Gradient Veil */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/10 to-black/25 pointer-events-none" />
          </div>

        </div>

        {/* Center Overlay Heading (Identical to Salad Project Reference) */}
        <div className="absolute inset-0 z-20 flex flex-col items-center justify-center text-center px-4 pointer-events-none select-none">
          <h1 className="font-montserrat font-extrabold text-3xl sm:text-5xl md:text-6xl lg:text-7xl text-white tracking-tight leading-[1.1] drop-shadow-[0_4px_24px_rgba(0,0,0,0.7)] max-w-4xl mx-auto">
            Your new habit, made
            <br />
            fresh at Greesal Kitchen.
          </h1>
          <p className="mt-4 text-xs sm:text-sm md:text-base text-white/90 font-medium tracking-wide drop-shadow-md max-w-lg">
            Hydroponic greens • Cold-blended dressings • 30–45 min express delivery
          </p>
        </div>

        {/* Bottom Scroll Indicator Pill */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 pointer-events-none">
          <div className="w-6 h-10 rounded-full border-2 border-white/60 flex items-start justify-center p-1.5 backdrop-blur-xs">
            <div className="w-1.5 h-2.5 bg-white rounded-full animate-bounce" />
          </div>
        </div>

      </section>

      {/* =========================================================================
          SECTION 2: FULL-WIDTH CINEMATIC TABLE SCENE (London/Paris Style Hero)
          ========================================================================= */}
      <section className="relative w-full p-3 sm:p-6 md:p-8 bg-[#F1ECDE]">
        <div className="relative w-full h-[70vh] sm:h-[80vh] min-h-[500px] max-h-[780px] rounded-2xl sm:rounded-3xl overflow-hidden shadow-2xl bg-black">
          
          {/* Flatlay Table Video from Salad Project */}
          <video
            ref={secondVideoRef}
            autoPlay
            muted={isSecondVideoMuted}
            loop
            playsInline
            poster="https://www.saladproject.co.uk/cdn/shop/files/preview_images/bec2d7b520d34e448f8c3127933c7db2.thumbnail.0000000000.jpg?v=1785165919&width=2400"
            className="w-full h-full object-cover object-center"
          >
            <source
              src="https://www.saladproject.co.uk/cdn/shop/videos/c/vp/bec2d7b520d34e448f8c3127933c7db2/bec2d7b520d34e448f8c3127933c7db2.HD-1080p-7.2Mbps-90024182.mp4?v=0"
              type="video/mp4"
            />
          </video>

          {/* Dark Cinematic Tint for Text Contrast */}
          <div className="absolute inset-0 bg-black/35 backdrop-brightness-95 pointer-events-none" />

          {/* Center Content Overlay */}
          <div className="absolute inset-0 z-10 flex flex-col items-center justify-center text-center px-4">
            <h2 className="font-montserrat font-extrabold text-2xl sm:text-4xl md:text-5xl lg:text-6xl text-white tracking-tight leading-tight drop-shadow-[0_4px_20px_rgba(0,0,0,0.8)] max-w-2xl mx-auto mb-6 sm:mb-8">
              {cityName}&apos;s new
              <br />
              favourite salad bar.
            </h2>

            {/* Signature Lime Pill Button - Salad Project Style */}
            <Link
              href="/salads"
              onClick={handleOrderClick}
              className="group bg-[#E5F97A] hover:bg-[#d9f257] active:scale-95 text-[#123B2B] font-montserrat font-extrabold text-xs sm:text-sm uppercase tracking-widest px-8 sm:px-10 py-3.5 sm:py-4 rounded-full shadow-[0_10px_30px_rgba(229,249,122,0.35)] transition-all duration-300 hover:shadow-[0_15px_35px_rgba(229,249,122,0.5)] hover:scale-105 flex items-center gap-2 cursor-pointer"
            >
              <span>ORDER NOW</span>
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1 text-[#123B2B]" />
            </Link>
          </div>

          {/* Audio Toggle in bottom corner */}
          <button
            type="button"
            onClick={toggleSound}
            aria-label="Toggle sound"
            className="absolute bottom-5 right-5 z-20 w-10 h-10 rounded-full bg-white/80 hover:bg-white text-[#123B2B] backdrop-blur-md flex items-center justify-center transition-all hover:scale-110 shadow-lg cursor-pointer"
          >
            {isSecondVideoMuted ? (
              <VolumeX className="w-4 h-4" />
            ) : (
              <Volume2 className="w-4 h-4 text-emerald-600" />
            )}
          </button>

        </div>
      </section>

      {/* =========================================================================
          SECTION 3: HOW TO ORDER - EDITORIAL VIDEO SHOWCASE (SINGLE FEATURED OPTION)
          ========================================================================= */}
      <section className="w-full px-4 sm:px-6 lg:px-8 py-12 sm:py-16 max-w-7xl mx-auto">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8 sm:mb-12">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#123B2B] text-[#E5F97A] text-[11px] font-bold uppercase tracking-wider mb-2">
              <Leaf className="w-3 h-3 text-[#E5F97A]" />
              <span>{howToOrderBadge}</span>
            </div>
            <h3 className="font-montserrat font-black text-2xl sm:text-3xl md:text-4xl text-[#123B2B] tracking-tight">
              {howToOrderHeading}
            </h3>
          </div>

          <Link
            href={howToOrderBtnLink || '/salads'}
            onClick={handleOrderClick}
            className="inline-flex items-center gap-2 font-montserrat font-bold text-xs uppercase tracking-wider text-[#123B2B] border-b-2 border-[#123B2B] pb-1 hover:text-[#25A87D] hover:border-[#25A87D] transition-colors self-start md:self-auto cursor-pointer"
          >
            <span>{howToOrderBtnText || 'Explore Full Menu'}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* ONLY ONE OPTION: The Editorial How-To-Order Video Showcase Card */}
        <div className="max-w-5xl mx-auto bg-white rounded-3xl overflow-hidden border border-[#E4DEC9] shadow-sm hover:shadow-xl transition-all duration-300 grid grid-cols-1 lg:grid-cols-12">
          
          {/* Left: High-Energy Video Player */}
          <div className="lg:col-span-6 relative aspect-video lg:aspect-auto w-full min-h-[300px] sm:min-h-[420px] bg-black overflow-hidden flex items-center justify-center group">
            <video
              ref={howToOrderVideoRef}
              autoPlay
              muted={isHowToOrderMuted}
              loop
              playsInline
              poster={howToOrderVideoPoster}
              src={howToOrderVideoUrl}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
              key={howToOrderVideoUrl}
            >
              <source src={howToOrderVideoUrl} type="video/mp4" />
            </video>

            {/* Step/Number Badge */}
            <div className="absolute top-4 left-4 z-20 flex items-center gap-2">
              <span className="w-9 h-9 rounded-full bg-[#123B2B] text-white flex items-center justify-center font-montserrat font-extrabold text-xs shadow-md">
                {howToOrderCardNumber || '01'}
              </span>
              <span className="bg-[#123B2B]/90 backdrop-blur-md text-[#E5F97A] text-[10px] font-extrabold uppercase tracking-widest px-3 py-1 rounded-full shadow-md border border-[#E5F97A]/20">
                HOW TO ORDER
              </span>
            </div>

            {/* Video Controls (Play/Pause & Sound Toggle) */}
            <div className="absolute bottom-4 right-4 z-20 flex items-center gap-2">
              <button
                type="button"
                onClick={toggleHowToOrderPlay}
                aria-label="Play or pause video"
                className="w-9 h-9 rounded-full bg-white/85 hover:bg-white text-[#123B2B] backdrop-blur-md flex items-center justify-center transition-all hover:scale-110 shadow-lg cursor-pointer"
              >
                {isHowToOrderPlaying ? (
                  <Pause className="w-4 h-4" />
                ) : (
                  <Play className="w-4 h-4 ml-0.5" />
                )}
              </button>

              <button
                type="button"
                onClick={toggleHowToOrderSound}
                aria-label="Toggle sound"
                className="w-9 h-9 rounded-full bg-white/85 hover:bg-white text-[#123B2B] backdrop-blur-md flex items-center justify-center transition-all hover:scale-110 shadow-lg cursor-pointer"
              >
                {isHowToOrderMuted ? (
                  <VolumeX className="w-4 h-4" />
                ) : (
                  <Volume2 className="w-4 h-4 text-emerald-600" />
                )}
              </button>
            </div>
          </div>

          {/* Right: Order Steps & Details (Matches current details aesthetic) */}
          <div className="lg:col-span-6 p-6 sm:p-8 md:p-10 flex flex-col justify-between">
            <div className="space-y-4">
              <div>
                <span className="text-[11px] font-black uppercase tracking-wider text-[#25A87D] inline-block mb-1">
                  ORDER IN 3 SIMPLE STEPS
                </span>
                <h4 className="font-montserrat font-extrabold text-xl sm:text-2xl text-[#123B2B] tracking-tight">
                  {howToOrderCardTitle}
                </h4>
              </div>

              {/* Steps / Description */}
              <div className="text-xs sm:text-sm text-gray-700 leading-relaxed space-y-2 whitespace-pre-line font-medium bg-[#fcfbf7] p-4 rounded-2xl border border-gray-100">
                {howToOrderCardDesc}
              </div>

              {/* 3 Value Pillars (Matches current cards details) */}
              <div className="space-y-2.5 pt-2">
                {howToOrderHighlight1 && (
                  <div className="flex items-center gap-2.5 text-xs font-bold text-[#123B2B]">
                    <div className="w-6 h-6 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0">
                      <Clock className="w-3.5 h-3.5" />
                    </div>
                    <span>{howToOrderHighlight1}</span>
                  </div>
                )}

                {howToOrderHighlight2 && (
                  <div className="flex items-center gap-2.5 text-xs font-bold text-[#123B2B]">
                    <div className="w-6 h-6 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center shrink-0">
                      <ShieldCheck className="w-3.5 h-3.5" />
                    </div>
                    <span>{howToOrderHighlight2}</span>
                  </div>
                )}

                {howToOrderHighlight3 && (
                  <div className="flex items-center gap-2.5 text-xs font-bold text-[#123B2B]">
                    <div className="w-6 h-6 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0">
                      <Sparkles className="w-3.5 h-3.5" />
                    </div>
                    <span>{howToOrderHighlight3}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="mt-6 pt-5 border-t border-gray-100 flex flex-col sm:flex-row items-center gap-3">
              <Link
                href={howToOrderBtnLink || '/salads'}
                onClick={handleOrderClick}
                className="w-full sm:w-auto flex-1 bg-[#123B2B] hover:bg-[#1a4f3b] text-[#E5F97A] font-montserrat font-extrabold text-xs uppercase tracking-wider py-3.5 px-6 rounded-2xl text-center shadow-md transition-all hover:shadow-lg hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>{howToOrderBtnText || 'Order Fresh Salad Now'}</span>
                <ArrowRight className="w-4 h-4 text-[#E5F97A]" />
              </Link>
            </div>

          </div>

        </div>

      </section>

    </div>
  );
};
