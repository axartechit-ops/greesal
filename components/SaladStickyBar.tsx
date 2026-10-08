import React from 'react';
import Link from 'next/link';
import { Sparkles, Calendar, ArrowRight, Clock, AlertCircle, CheckCircle2 } from 'lucide-react';

interface SaladStickyBarProps {
  offer?: string;
  text?: string;
  buttonText?: string;
  onSubscribeClick?: () => void;
  isOpen?: boolean;
  openingTime?: string;
  closingTime?: string;
  shopTimingText?: string;
  notice?: string;
  showNotice?: boolean;
  noticeType?: 'announcement' | 'info' | 'alert' | 'discount';
  closedMessage?: string;
}

export const SaladStickyBar: React.FC<SaladStickyBarProps> = ({
  offer = 'Special Offer',
  text = 'Weekly Salad At ₹200/- | Monthly Salad At ₹175/- • Free Daily Delivery in Surat',
  buttonText = 'Subscribe Now',
  onSubscribeClick,
  isOpen = true,
  openingTime = '08:00 AM',
  closingTime = '10:30 PM',
  shopTimingText = 'Open Daily: 8:00 AM – 10:30 PM',
  notice = 'Fresh Organic Harvest Delivered in 30 Mins across Surat • Free Delivery on ₹499+',
  showNotice = true,
  noticeType = 'announcement',
  closedMessage = 'Our kitchen is currently closed. Opening again at 08:00 AM. Pre-orders are welcome!',
}) => {
  // 1. IF STORE IS CLOSED BY ADMIN
  if (!isOpen) {
    return (
      <aside
        aria-label="Store closed announcement banner"
        className="bg-gradient-to-r from-red-900 via-rose-950 to-red-900 text-white text-xs sm:text-sm font-semibold py-2.5 px-4 shadow-md relative z-30 transition-all duration-300 border-b border-red-700/50"
      >
        <div className="max-w-7xl mx-auto flex items-center justify-center gap-2 sm:gap-4 flex-wrap text-center">
          {/* Status Badge */}
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-red-600/90 text-white text-[11px] font-black tracking-wider uppercase border border-red-400/40 shadow-xs">
            <span className="w-2 h-2 rounded-full bg-white animate-ping" />
            Currently Closed
          </span>

          {/* Closed Message */}
          <p className="tracking-wide text-xs sm:text-sm font-medium text-rose-100 flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-rose-300 flex-shrink-0" />
            <span>{closedMessage || `Our kitchen is currently closed. Opening again at ${openingTime}. Pre-orders are welcome!`}</span>
          </p>

          {/* Action / Pre-order button */}
          <Link
            href="/salads"
            className="inline-flex items-center gap-1 text-[11px] sm:text-xs font-bold bg-white text-red-900 px-3 py-1 rounded-full hover:bg-rose-100 transition-all hover:scale-105 active:scale-95 shadow-sm whitespace-nowrap"
          >
            <span>Pre-Order For Next Slot</span>
            <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
      </aside>
    );
  }

  // 2. IF STORE IS OPEN - DYNAMIC NOTICE / ANNOUNCEMENT
  const displayText = (showNotice && notice) ? notice : text;

  return (
    <aside
      aria-label="Promotional and status banner"
      className={`text-xs sm:text-sm font-semibold py-2.5 px-4 shadow-sm relative z-30 transition-all duration-300 ${
        noticeType === 'discount'
          ? 'bg-gradient-to-r from-[#fbce45] via-[#f7c227] to-[#fbce45] text-[#1a1a1a]'
          : noticeType === 'alert'
          ? 'bg-gradient-to-r from-amber-600 via-amber-700 to-amber-600 text-white'
          : noticeType === 'info'
          ? 'bg-gradient-to-r from-[#20493c] via-[#2a5d4d] to-[#20493c] text-white'
          : 'bg-[#fbce45] text-[#1a1a1a]'
      }`}
    >
      <div className="max-w-7xl mx-auto flex items-center justify-center gap-2 sm:gap-4 flex-wrap text-center">
        {/* Live Open Status Indicator */}
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#20493c] text-white text-[11px] font-bold tracking-wider uppercase shadow-xs">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          Open Now
        </span>

        {/* Offer Tag */}
        {offer && (
          <span className="hidden md:inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#123B2B]/10 text-[#123B2B] text-[11px] font-bold">
            <Sparkles className="w-3 h-3 text-[#20493c]" /> {offer}
          </span>
        )}

        {/* Notice or announcement text */}
        <p className={`tracking-wide text-xs sm:text-sm font-bold ${
          noticeType === 'alert' || noticeType === 'info' ? 'text-white' : 'text-[#20493c]'
        }`}>
          {displayText}
        </p>

        {/* Subscribe / Action button */}
        {onSubscribeClick && (
          <button
            onClick={onSubscribeClick}
            className={`inline-flex items-center gap-1 text-[11px] sm:text-xs font-bold px-3 py-1 rounded-full transition-all hover:scale-105 active:scale-95 shadow-sm ${
              noticeType === 'alert' || noticeType === 'info'
                ? 'bg-[#fbce45] text-[#20493c] hover:bg-[#fad86e]'
                : 'bg-[#20493c] text-white hover:bg-[#15342a]'
            }`}
          >
            <Calendar className="w-3 h-3 text-[#fbce45]" />
            <span>{buttonText}</span>
            <ArrowRight className="w-3 h-3" />
          </button>
        )}
      </div>
    </aside>
  );
};
