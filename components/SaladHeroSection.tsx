import React from 'react';
import { Sparkles, ArrowRight, ShieldCheck, Heart, Leaf, Clock, Utensils } from 'lucide-react';

interface SaladHeroSectionProps {
  badge?: string;
  slogan?: string;
  storyHeading?: string;
  storyBrand?: string;
  storyP1?: string;
  storyP2?: string;
  storyP3?: string;
  storyP4?: string;
  heroImage?: string;
  pill1?: string;
  pill2?: string;
  statBadge?: string;
  statDelivered?: string;
  highlight1Title?: string;
  highlight2Title?: string;
  highlight3Title?: string;
  ctaText?: string;
  ctaLink?: string;
  onExploreMenu: () => void;
  onSubscribeClick: () => void;
}

export const SaladHeroSection: React.FC<SaladHeroSectionProps> = ({
  badge = '#1 Fresh & Organic Salad Brand',
  slogan = 'Farm-Fresh Organic Salad Bowls',
  storyHeading = 'A short story about',
  storyBrand = 'GREESAL',
  storyP1 = 'GREESAL, Farm-Fresh Organic Salad Bowls! Idea comes from a small thing and now it’s become a trusted brand of salads and healthy food in Surat, Gujarat.',
  storyP2 = 'GREESAL — Slice of Green, where health meets Freshness & Deliciousness! One more thing comes to mind when we talk about healthy food is organic, natural, and fresh — and Greesal is committed to providing only fresh, healthy, and delicious salads with fresh and organic ingredients.',
  storyP3 = 'At GREESAL, we bring you 21 varieties of fresh, healthy, and delicious salads, carefully crafted to offer the perfect balance of taste and nutrition. Staying true to our tagline, “Farm-Fresh Organic Salad Bowls”, we deliver wholesome salads right to your doorstep, ensuring you enjoy a guilt-free, nutritious meal every day.',
  storyP4 = 'Our handcrafted salads are made using premium-quality ingredients, without onion and garlic, and paired with our signature homemade dressings. Whether you’re on a fitness journey, looking for a quick healthy meal, or simply love fresh greens, Greesal is your go-to destination for healthy eating.',
  heroImage = 'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=1000&q=85',
  pill1 = '100% Handmade Dressings',
  pill2 = 'No Onion • No Garlic',
  statBadge = 'Health Lovers',
  statDelivered = '72,600+ Salads Delivered',
  highlight1Title = 'Free Delivery in Surat',
  highlight2Title = 'Lunch & Evening Slots',
  highlight3Title = '100% Satvik Dressing',
  ctaText = 'Explore Salad Menu',
  ctaLink = '#menu',
  onExploreMenu,
  onSubscribeClick,
}) => {
  return (
    <section id="home" className="relative bg-white pt-8 pb-16 sm:py-16 overflow-hidden">

      {/* Background Soft Blobs */}
      <div className="absolute -top-32 -left-32 w-96 h-96 bg-[#6ac6ac]/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/2 -right-32 w-96 h-96 bg-[#fbce45]/15 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Main Brand Catchphrase in Josefin Sans 700 */}
        <div className="text-center mb-8 sm:mb-12">
          <h1 className="font-josefin font-bold text-4xl sm:text-6xl md:text-7xl lg:text-8xl tracking-tight text-[#fbce45] drop-shadow-sm uppercase">
            {slogan}
          </h1>
        </div>

        {/* Hero Grid: Story & Visual */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          
          {/* Left Column: Visual graphic with badges */}
          <div className="lg:col-span-5 flex justify-center order-2 lg:order-1">
            <div className="relative w-full max-w-md sm:max-w-lg">
              
              {/* Decorative circle glow */}
              <div className="absolute inset-0 bg-gradient-to-tr from-[#6ac6ac]/30 to-[#fbce45]/20 rounded-full blur-2xl transform scale-95" />
              
              {/* Salad Bowl Main Image */}
              <div className="relative rounded-3xl overflow-hidden shadow-2xl border-4 border-white bg-gradient-to-b from-[#f2f8f5] to-[#e4f4ed] p-3 transition-transform duration-500 hover:scale-[1.02]">
                <img
                  src={heroImage}
                  alt={storyBrand}
                  className="w-full h-72 sm:h-96 object-cover rounded-2xl shadow-inner"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = '/images/salad_bowl_hero.jpg';
                  }}
                />

                {/* Floating pill: 1 */}
                <div className="absolute top-6 left-6 bg-white/95 backdrop-blur-md px-3.5 py-1.5 rounded-full shadow-lg border border-[#6ac6ac]/30 flex items-center gap-2">
                  <Leaf className="w-4 h-4 text-[#20493c]" />
                  <span className="text-xs font-bold text-[#20493c]">{pill1}</span>
                </div>

                {/* Floating pill: 2 */}
                <div className="absolute bottom-6 right-6 bg-[#20493c] text-white px-4 py-2 rounded-2xl shadow-xl flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-[#fbce45]" />
                  <div className="text-left">
                    <p className="text-[10px] text-[#fbce45] font-bold uppercase tracking-wider">Purity Assured</p>
                    <p className="text-xs font-bold">{pill2}</p>
                  </div>
                </div>
              </div>

              {/* Floating review teaser */}
              <div className="absolute -bottom-6 -left-4 sm:left-4 bg-white p-3 sm:p-4 rounded-2xl shadow-xl border border-gray-100 flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#fbce45] flex items-center justify-center font-bold text-[#20493c]">
                  4.9★
                </div>
                <div>
                  <p className="text-xs font-bold text-[#1a1a1a]">{statBadge}</p>
                  <p className="text-[11px] text-[#20493c]/70">{statDelivered}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Story & Details */}
          <div className="lg:col-span-7 order-1 lg:order-2 flex flex-col justify-center text-center lg:text-left">
            
            <div className="mb-4">
              <span className="font-montserrat font-bold text-lg sm:text-2xl text-[#6ac6ac] uppercase tracking-wide block">
                {storyHeading}
              </span>
              <h2 className="font-montserrat font-extrabold text-3xl sm:text-5xl text-[#20493c] mt-1 tracking-tight">
                {storyBrand}
              </h2>
            </div>

            {/* Story Paragraphs - All Cohesive Green Frames & Proper Clean View */}
            <div className="space-y-3.5 font-dmsans text-[#123B2B] text-sm sm:text-base leading-relaxed max-w-2xl mx-auto lg:mx-0 text-left">
              {/* Story Paragraph 1: Origin & Vision */}
              {storyP1 && (
                <div className="bg-gradient-to-br from-[#eef8f3] to-[#f5fbf8] rounded-2xl p-4 sm:p-5 border border-[#a2dfcb] border-l-4 border-l-[#123B2B] shadow-xs transition-all hover:shadow-sm">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#123B2B] text-white text-[11px] font-bold uppercase tracking-wider mb-2.5 shadow-2xs">
                    <Leaf className="w-3.5 h-3.5 text-[#86efac]" />
                    <span>Origin &amp; Vision</span>
                  </div>
                  <p className="font-semibold text-base sm:text-lg text-[#123B2B] leading-relaxed whitespace-pre-line">
                    {storyP1}
                  </p>
                </div>
              )}

              {/* Story Paragraph 2: Freshness & Organic Ingredients */}
              {storyP2 && (
                <div className="bg-gradient-to-br from-[#f0f9f5] to-[#f7fcf9] rounded-2xl p-4 sm:p-4.5 border border-[#a2dfcb] border-l-4 border-l-[#25a87d] shadow-xs transition-all hover:shadow-sm">
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#25a87d]/15 text-[#1b5e46] text-[11px] font-bold uppercase tracking-wider mb-2 border border-[#25a87d]/20">
                    <Sparkles className="w-3 h-3 text-[#25a87d]" />
                    <span>100% Fresh &amp; Organic Goodness</span>
                  </div>
                  <p className="text-sm sm:text-base text-[#123B2B]/95 leading-relaxed whitespace-pre-line font-medium">
                    {storyP2}
                  </p>
                </div>
              )}

              {/* Story Paragraph 3: 21+ Varieties & Doorstep Delivery */}
              {storyP3 && (
                <div className="bg-gradient-to-br from-[#f0f9f5] to-[#f7fcf9] rounded-2xl p-4 sm:p-4.5 border border-[#a2dfcb] border-l-4 border-l-[#16805d] shadow-xs transition-all hover:shadow-sm">
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#16805d]/15 text-[#123B2B] text-[11px] font-bold uppercase tracking-wider mb-2 border border-[#16805d]/20">
                    <Utensils className="w-3 h-3 text-[#16805d]" />
                    <span>21+ Varieties &amp; Express Delivery</span>
                  </div>
                  <p className="text-sm sm:text-base text-[#123B2B]/95 leading-relaxed whitespace-pre-line font-medium">
                    {storyP3}
                  </p>
                </div>
              )}

              {/* Story Paragraph 4: Dedicated Satvik Callout Box */}
              {storyP4 && (
                <div className="rounded-2xl p-4 sm:p-5 bg-gradient-to-br from-[#e5f5ed] via-[#edf9f3] to-[#f4fbf7] border-2 border-[#3cae89] shadow-sm relative overflow-hidden">
                  <div className="flex items-center gap-2.5 mb-2.5">
                    <span className="p-1.5 rounded-xl bg-[#123B2B] text-white shadow-2xs">
                      <ShieldCheck className="w-4 h-4 text-[#86efac]" />
                    </span>
                    <div>
                      <span className="font-extrabold text-xs sm:text-sm text-[#123B2B] tracking-wide uppercase block">
                        100% Satvik Purity Guarantee
                      </span>
                      <span className="text-[10px] font-bold text-[#1b5e46] uppercase tracking-wider block">
                        Strictly No Onion • No Garlic
                      </span>
                    </div>
                  </div>
                  <p className="text-xs sm:text-sm text-[#123B2B] font-medium leading-relaxed whitespace-pre-line bg-white/85 backdrop-blur-xs p-3.5 rounded-xl border border-[#a2dfcb]/70 shadow-2xs">
                    {storyP4}
                  </p>
                </div>
              )}
            </div>

            {/* CTAs */}
            <div className="mt-8 flex flex-wrap items-center justify-center lg:justify-start gap-4">
              <button
                onClick={onExploreMenu}
                className="inline-flex items-center gap-2 bg-[#20493c] text-white px-7 py-3.5 rounded-full font-bold text-sm sm:text-base hover:bg-[#16372c] active:scale-95 transition-all shadow-lg hover:shadow-xl"
              >
                <Utensils className="w-4 h-4 text-[#fbce45]" />
                <span>{ctaText || 'Explore Salad Menu'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                onClick={onSubscribeClick}
                className="inline-flex items-center gap-2 bg-[#fbce45] text-[#20493c] px-6 py-3.5 rounded-full font-extrabold text-sm sm:text-base hover:bg-[#e6b933] active:scale-95 transition-all shadow-md hover:shadow-lg"
              >
                <Clock className="w-4 h-4" />
                <span>Daily Subscription Plans</span>
              </button>
            </div>

            {/* Quick feature highlights pills */}
            <div className="mt-8 pt-6 border-t border-gray-100 flex flex-wrap items-center justify-center lg:justify-start gap-4 text-xs font-semibold text-[#20493c]">
              <span className="inline-flex items-center gap-1.5 bg-[#f2f8f5] px-3 py-1.5 rounded-full border border-gray-100 shadow-2xs">
                <span className="w-2 h-2 rounded-full bg-[#6ac6ac]" /> {highlight1Title || 'Free Delivery in Surat'}
              </span>
              <span className="inline-flex items-center gap-1.5 bg-[#f2f8f5] px-3 py-1.5 rounded-full border border-gray-100 shadow-2xs">
                <span className="w-2 h-2 rounded-full bg-[#fbce45]" /> {highlight2Title || 'Lunch & Evening Slots'}
              </span>
              <span className="inline-flex items-center gap-1.5 bg-[#f2f8f5] px-3 py-1.5 rounded-full border border-gray-100 shadow-2xs">
                <span className="w-2 h-2 rounded-full bg-[#20493c]" /> {highlight3Title || '100% Satvik Dressing'}
              </span>
            </div>

          </div>

        </div>

      </div>
    </section>
  );
};
