import React from 'react';
import { ArrowRight, ShoppingBag, Utensils, Calendar, ExternalLink } from 'lucide-react';

import { ServiceCard, DEFAULT_SITE_SETTINGS } from '@/lib/siteSettings';

interface OurServicesSectionProps {
  badge?: string;
  title?: string;
  cards?: ServiceCard[];
  onOrderSingle: () => void;
  onSubscribeClick: () => void;
}

export const OurServicesSection: React.FC<OurServicesSectionProps> = ({
  badge = 'CONVENIENT ORDERING OPTIONS',
  title = 'Our services',
  cards = DEFAULT_SITE_SETTINGS.servicesCards,
  onOrderSingle,
  onSubscribeClick,
}) => {
  const getActionForCard = (id: number) => {
    if (id === 1) return { action: onOrderSingle, isExternal: false };
    if (id === 3) return { action: onSubscribeClick, isExternal: false };
    return {
      action: () => {
        window.open(
          'https://wa.me/919825144321?text=Hi%20Greesal!%20I%20would%20like%20to%20place%20an%20instant%20fresh%20salad%20order.',
          '_blank'
        );
      },
      isExternal: true,
    };
  };

  return (
    <section id="services" className="py-16 sm:py-24 bg-[#20493c] text-white relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center mb-14 sm:mb-18">
          <p className="text-xs sm:text-sm font-bold uppercase tracking-widest text-[#6ac6ac] mb-2 font-montserrat">
            CONVENIENT ORDERING OPTIONS
          </p>
          <h2 className="font-montserrat font-extrabold text-3xl sm:text-5xl text-white tracking-tight">
            Our <span className="text-[#fbce45]">services</span>
          </h2>
          <div className="w-20 h-1.5 bg-[#fbce45] mx-auto mt-4 rounded-full" />
        </div>

        {/* Services Cards */}
        <div className={`grid ${cards.length <= 2 ? 'grid-cols-1 md:grid-cols-2 max-w-4xl mx-auto' : 'grid-cols-1 md:grid-cols-3'} gap-8`}>
          {cards.map((item) => {
            const cardAction = getActionForCard(item.id);
            return (
              <div
                key={item.id}
                className="bg-white rounded-3xl overflow-hidden shadow-2xl flex flex-col justify-between transition-all duration-300 transform hover:-translate-y-2 group"
              >
              {/* Card Image */}
              <div className="relative w-full h-56 sm:h-64 bg-gray-100 overflow-hidden">
                <img
                  src={item.image}
                  alt={item.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = item.fallbackImage || '/images/salad_single_order.jpg';
                  }}
                />
                <div className="absolute top-4 left-4 bg-[#20493c]/90 backdrop-blur-sm px-3 py-1 rounded-full text-[11px] font-bold text-[#fbce45] shadow-md">
                  {item.badge}
                </div>
              </div>

              {/* Card Content */}
              <div className="p-6 sm:p-7 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="font-montserrat font-bold text-xl sm:text-2xl text-[#20493c] mb-2">
                    {item.title}
                  </h3>
                  <p className="font-dmsans text-sm text-[#1a1a1a]/80 leading-relaxed mb-6">
                    {item.desc}
                  </p>
                </div>

                {/* Card Button */}
                <button
                  onClick={cardAction.action}
                  className="w-full py-3.5 px-6 rounded-2xl bg-[#20493c] text-white font-bold text-sm sm:text-base flex items-center justify-center gap-2 hover:bg-[#15342a] active:scale-95 transition-all shadow-md group/btn"
                >
                  <span>{item.btnText}</span>
                  {cardAction.isExternal ? (
                    <ExternalLink className="w-4 h-4 text-[#fbce45]" />
                  ) : (
                    <ArrowRight className="w-4 h-4 text-[#fbce45] group-hover/btn:translate-x-1 transition-transform" />
                  )}
                </button>
              </div>
            </div>
            );
          })}
        </div>

        {/* Promo strip */}
        <div className="mt-12 bg-white/10 backdrop-blur-md rounded-2xl p-4 sm:p-6 border border-white/15 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#fbce45] flex items-center justify-center text-[#20493c]">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <p className="font-bold text-sm sm:text-base text-white">Need Customized Office or Corporate Salads?</p>
              <p className="text-xs text-[#b0ffd7]">Bulk pre-orders, corporate wellness desks &amp; custom calorie counting available.</p>
            </div>
          </div>
          <button
            onClick={onSubscribeClick}
            className="px-5 py-2.5 rounded-full bg-[#fbce45] text-[#20493c] font-bold text-xs sm:text-sm hover:bg-[#f0c235] transition-colors whitespace-nowrap shadow-sm"
          >
            Inquire Bulk / Subscription
          </button>
        </div>

      </div>
    </section>
  );
};
