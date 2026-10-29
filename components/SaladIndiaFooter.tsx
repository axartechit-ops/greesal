import React from 'react';
import Link from 'next/link';
import { GreesalLogo } from './GreesalLogo';
import { WhatsAppIcon } from './WhatsAppIcon';
import {
  MapPin,
  Clock,
  Phone,
  Mail,
  ShieldCheck,
  Leaf,
  ChevronRight,
  ArrowRight,
  Sparkles
} from 'lucide-react';

interface SaladIndiaFooterProps {
  phone?: string;
  email?: string;
  kitchenAddress?: string;
  kitchenTiming?: string;
  lunchSlot?: string;
  eveningSlot?: string;
  expressSlot?: string;
  onOpenPrivacy?: () => void;
  onOpenTerms?: () => void;
  onSubscriptionClick?: () => void;
  onCateringClick?: () => void;
}

export const SaladIndiaFooter: React.FC<SaladIndiaFooterProps> = ({
  phone = '+91 99258 36117',
  email = 'support@greesal.in',
  kitchenAddress = 'Katargam, Surat - 395004, Gujarat',
  kitchenTiming = '8:00 AM – 10:30 PM (Daily)',
  lunchSlot = '11:00 AM - 2:00 PM',
  eveningSlot = '4:00 PM - 7:00 PM',
  expressSlot = '30–45 Mins',
  onOpenPrivacy,
  onOpenTerms,
  onSubscriptionClick,
  onCateringClick,
}) => {
  const cleanPhone = phone.replace(/[^\d+]/g, '');
  const waPhone = phone.replace(/[^\d]/g, '');

  return (
    <footer id="contact" className="relative overflow-hidden bg-[#6ac6ac] text-[#0c2a20] pt-8 sm:pt-10 pb-5 sm:pb-6 border-t border-[#4fa88f] font-dmsans selection:bg-[#0c2a20] selection:text-white">
      {/* Decorative ambient background glows */}
      <div className="absolute -top-24 -left-24 w-96 h-96 bg-white/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-[#0c2a20]/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">

        {/* Compact Top Action Bar */}
        <div className="relative overflow-hidden bg-[#0c2a20] border border-[#144c38] rounded-2xl p-4 sm:p-5 mb-8 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xl">
          <div className="absolute -top-12 -right-12 w-32 h-32 bg-[#6ac6ac]/15 rounded-full blur-2xl pointer-events-none" />

          <div className="flex items-center gap-3 text-center sm:text-left relative z-10">
            <div className="w-10 h-10 rounded-xl bg-[#6ac6ac]/20 border border-[#6ac6ac]/30 flex items-center justify-center shrink-0">
              <Leaf className="w-5 h-5 text-[#6ac6ac]" />
            </div>
            <div>
              <h4 className="font-montserrat font-bold text-sm sm:text-base text-white">
                Craving clean, delicious organic nutrition
              </h4>
              <p className="text-xs text-[#a5ded0] font-medium">
                Hydroponic greens • Preservative-free • 30–45 min delivery
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 shrink-0 w-full sm:w-auto relative z-10">
            <a
              href={`https://wa.me/${waPhone || '919925836117'}?text=Hi%20Greesal!%20I%20would%20like%20to%20order%20salad%20bowls.`}
              target="_blank"
              rel="noreferrer"
              className="flex-1 sm:flex-none bg-[#25D366] hover:bg-[#20bd5a] text-white font-bold px-4 py-2 rounded-xl text-xs sm:text-sm flex items-center justify-center gap-2 transition-all hover:scale-105 active:scale-95 shadow-md"
            >
              <WhatsAppIcon className="w-4 h-4 text-white" />
              <span>WhatsApp Order</span>
            </a>

            <Link
              href="/salads"
              className="flex-1 sm:flex-none bg-[#fbce45] hover:bg-[#eab92d] text-[#061711] font-bold px-4 py-2 rounded-xl text-xs sm:text-sm flex items-center justify-center gap-1.5 transition-all hover:scale-105 active:scale-95 shadow-md"
            >
              <span>Menu</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* 4 Clean Columns */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-7 pb-8 text-xs sm:text-sm">

          {/* Col 1: Brand & FSSAI */}
          <div className="space-y-3">
            <div className="bg-white/95 p-2 rounded-xl inline-block shadow-sm border border-white/60">
              <GreesalLogo size="xs" />
            </div>
            <p className="text-xs text-[#0c2a20]/85 font-medium leading-relaxed">
              Wholesome gourmet salad bowls crafted with daily hydroponic greens and cold-blended artisan dressings.
            </p>

            {/* Compact FSSAI badge */}
            <div className="inline-flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-[#0c2a20] text-white text-[11px] shadow-sm">
              <ShieldCheck className="w-3.5 h-3.5 text-[#6ac6ac]" />
              <span className="font-semibold text-emerald-200">FSSAI Lic:</span>
              <span className="font-mono text-white font-bold">123456789412</span>
            </div>
          </div>

          {/* Col 2: Quick Links */}
          <div className="space-y-2.5">
            <h5 className="font-montserrat font-bold text-xs uppercase tracking-wider text-[#0c2a20] flex items-center gap-1.5">
              <span>Quick Links</span>
            </h5>
            <ul className="space-y-2 text-xs text-[#0c2a20]/85 font-medium">
              <li>
                <Link href="/" className="hover:text-black hover:font-bold transition-all flex items-center gap-1.5">
                  <ChevronRight className="w-3 h-3 text-[#0c2a20]" />
                  <span>Home</span>
                </Link>
              </li>
              <li>
                <Link href="/salads" className="hover:text-black hover:font-bold transition-all flex items-center gap-1.5">
                  <ChevronRight className="w-3 h-3 text-[#0c2a20]" />
                  <span>All Salad Bowls</span>
                </Link>
              </li>
              <li>
                {onSubscriptionClick ? (
                  <button onClick={onSubscriptionClick} className="hover:text-black hover:font-bold transition-all flex items-center gap-1.5 text-left cursor-pointer">
                    <ChevronRight className="w-3 h-3 text-[#0c2a20]" />
                    <span>Daily Subscriptions</span>
                  </button>
                ) : (
                  <Link href="/salads" className="hover:text-black hover:font-bold transition-all flex items-center gap-1.5">
                    <ChevronRight className="w-3 h-3 text-[#0c2a20]" />
                    <span>Daily Subscriptions</span>
                  </Link>
                )}
              </li>
              <li>
                {onCateringClick ? (
                  <button onClick={onCateringClick} className="hover:text-black hover:font-bold transition-all flex items-center gap-1.5 text-left cursor-pointer">
                    <ChevronRight className="w-3 h-3 text-[#0c2a20]" />
                    <span>Event &amp; Bulk Catering</span>
                  </button>
                ) : (
                  <a href={`https://wa.me/${waPhone || '919925836117'}?text=Hi%20Greesal,%20I%20am%20interested%20in%20Bulk%20Catering`} className="hover:text-black hover:font-bold transition-all flex items-center gap-1.5">
                    <ChevronRight className="w-3 h-3 text-[#0c2a20]" />
                    <span>Event &amp; Bulk Catering</span>
                  </a>
                )}
              </li>
            </ul>
          </div>

          {/* Col 3: Popular Bowls */}
          <div className="space-y-2.5">
            <h5 className="font-montserrat font-bold text-xs uppercase tracking-wider text-[#0c2a20]">
              Popular Bowls
            </h5>
            <ul className="space-y-2 text-xs text-[#0c2a20]/85 font-medium">
              <li>
                <Link href="/salads" className="hover:text-black hover:font-bold transition-all flex items-center gap-1.5">
                  <span className="text-[#0c2a20] font-bold">›</span>
                  <span>High Protein Bowl (19g Protein)</span>
                </Link>
              </li>
              <li>
                <Link href="/salads" className="hover:text-black hover:font-bold transition-all flex items-center gap-1.5">
                  <span className="text-[#0c2a20] font-bold">›</span>
                  <span>Chef Burrito Salad Bowl</span>
                </Link>
              </li>
              <li>
                <Link href="/salads" className="hover:text-black hover:font-bold transition-all flex items-center gap-1.5">
                  <span className="text-[#0c2a20] font-bold">›</span>
                  <span>Crunchy Peanut Butter Salad</span>
                </Link>
              </li>
              <li>
                <Link href="/salads" className="hover:text-black hover:font-bold transition-all flex items-center gap-1.5">
                  <span className="text-[#0c2a20] font-bold">›</span>
                  <span>Super Sprout Power Bowl</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 4: Kitchen & Contact */}
          <div className="space-y-2.5">
            <h5 className="font-montserrat font-bold text-xs uppercase tracking-wider text-[#0c2a20]">
              Kitchen &amp; Contact
            </h5>
            <div className="space-y-2 text-xs text-[#0c2a20]/85 font-medium">
              <div className="flex items-start gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-[#0c2a20] shrink-0 mt-0.5" />
                <span>{kitchenAddress}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-[#0c2a20] shrink-0" />
                <span>{kitchenTiming}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-[#0c2a20] shrink-0" />
                <a href={`tel:${cleanPhone}`} className="text-[#0c2a20] font-bold hover:underline transition-colors">
                  {phone}
                </a>
              </div>
              <div className="flex items-center gap-1.5">
                <WhatsAppIcon className="w-3.5 h-3.5 text-[#0c2a20] shrink-0" />
                <a
                  href={`https://wa.me/${waPhone || '919925836117'}?text=Hi%20Greesal!`}
                  target="_blank"
                  rel="noreferrer"
                  className="text-[#0c2a20] font-bold hover:underline transition-colors"
                >
                  WhatsApp: {phone}
                </a>
              </div>
              <div className="flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-[#0c2a20] shrink-0" />
                <a href={`mailto:${email}`} className="text-[#0c2a20] font-bold hover:underline transition-colors">
                  {email}
                </a>
              </div>
            </div>
          </div>

        </div>

        {/* Compact Bottom Bar */}
        <div className="pt-4 border-t border-[#0c2a20]/20 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-[#0c2a20]/80 text-center sm:text-left font-medium">
          <p>
            &copy; {new Date().getFullYear()} <strong className="text-[#0c2a20]">Greesal Kitchen</strong>. All rights reserved. Surat, Gujarat.
          </p>

          <div className="flex items-center gap-3 flex-wrap justify-center text-[11px]">
            <Link href="/admin" className="hover:text-black font-semibold transition-colors">
              Admin Portal
            </Link>
            <span className="text-[#0c2a20]/40">•</span>
            <button type="button" onClick={onOpenTerms} className="hover:text-black font-semibold transition-colors cursor-pointer">
              Terms &amp; Standards
            </button>
            <span className="text-[#0c2a20]/40">•</span>
            <button type="button" onClick={onOpenPrivacy} className="hover:text-black font-semibold transition-colors cursor-pointer">
              Privacy Policy
            </button>
          </div>
        </div>

      </div>
    </footer>
  );
};
