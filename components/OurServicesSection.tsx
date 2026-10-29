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
          'https://wa.me/919925836117?text=Hi%20Greesal!%20I%20would%20like%20to%20place%20an%20instant%20fresh%20salad%20order.',
          '_blank'
        );
      },
      isExternal: true,
    };
  };

  return (
    <section id="services" className="py-16 sm:py-24 bg-[#6ac6ac] text-[#0c2a20] relative overflow-hidden font-dmsans">
      {/* Decorative ambient background glows */}
      <div className="absolute -top-24 -left-24 w-96 h-96 bg-white/25 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-[#20493c]/15 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Header */}
        <div className="text-center mb-14 sm:mb-18">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white/85 backdrop-blur-sm border border-[#20493c]/15 text-xs font-bold uppercase tracking-wider text-[#144c38] mb-3 shadow-2xs">
            {badge}
          </div>
          <h2 className="font-montserrat font-extrabold text-3xl sm:text-5xl text-[#0c2a20] tracking-tight">
            Our <span className="text-white">services</span>
          </h2>
          <div className="w-20 h-1.5 bg-[#0c2a20] mx-auto mt-4 rounded-full" />
        </div>

        {/* Services Cards */}
        <div className={`grid ${cards.length <= 2 ? 'grid-cols-1 md:grid-cols-2 max-w-4xl mx-auto' : 'grid-cols-1 md:grid-cols-3'} gap-8`}>
          {cards.map((item) => {
            const cardAction = getActionForCard(item.id);
            return (
              <div
                key={item.id}
                className="bg-white rounded-3xl overflow-hidden shadow-xl hover:shadow-2xl flex flex-col justify-between transition-all duration-300 transform hover:-translate-y-2 group border border-white/60"
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
                  className="w-full py-3.5 px-6 rounded-2xl bg-[#20493c] text-white font-bold text-sm sm:text-base flex items-center justify-center gap-2 hover:bg-[#15342a] active:scale-95 transition-all shadow-md group/btn cursor-pointer"
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
        <div className="mt-12 bg-[#0c2a20] rounded-3xl p-5 sm:p-7 border border-[#20493c] shadow-2xl flex flex-col sm:flex-row items-center justify-between gap-5 text-center sm:text-left">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-[#fbce45] flex items-center justify-center text-[#20493c] shrink-0 shadow-md">
              <Calendar className="w-6 h-6" />
            </div>
            <div>
              <p className="font-bold text-base sm:text-lg text-white">Need Customized Office or Corporate Salads?</p>
              <p className="text-xs sm:text-sm text-[#a5ded0]">Bulk pre-orders, corporate wellness desks &amp; custom calorie counting available.</p>
            </div>
          </div>
          <button
            onClick={onSubscribeClick}
            className="px-6 py-3 rounded-full bg-[#fbce45] text-[#0c2a20] font-bold text-xs sm:text-sm hover:bg-[#f0c235] transition-all whitespace-nowrap shadow-md hover:scale-105 active:scale-95 shrink-0 cursor-pointer"
          >
            Inquire Bulk / Subscription
          </button>
        </div>

      </div>
    </section>
  );
};
