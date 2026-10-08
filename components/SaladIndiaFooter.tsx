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
  phone = '+91 98251 44321',
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
    <footer id="contact" className="bg-[#061711] text-white pt-10 pb-24 md:pb-8 border-t border-[#12382b] font-dmsans selection:bg-[#fbce45] selection:text-[#061711]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Compact Top Action Bar */}
        <div className="bg-[#0b241c] border border-[#164434] rounded-2xl p-4 sm:p-5 mb-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3 text-center sm:text-left">
            <div className="w-10 h-10 rounded-xl bg-[#fbce45]/15 border border-[#fbce45]/30 flex items-center justify-center shrink-0">
              <Leaf className="w-5 h-5 text-[#fbce45]" />
            </div>
            <div>
              <h4 className="font-montserrat font-bold text-sm sm:text-base text-white">
                Craving clean, delicious organic nutrition
              </h4>
              <p className="text-xs text-[#8ebfb0]">
                Hydroponic greens • Preservative-free • 30–45 min delivery
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 shrink-0 w-full sm:w-auto">
            <a
              href={`https://wa.me/${waPhone || '919825144321'}?text=Hi%20Greesal!%20I%20would%20like%20to%20order%20salad%20bowls.`}
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
            <div className="bg-white/95 p-2 rounded-xl inline-block shadow-sm">
              <GreesalLogo size="xs" />
            </div>
            <p className="text-xs text-[#8ebfb0] leading-relaxed">
              Wholesome gourmet salad bowls crafted with daily hydroponic greens and cold-blended artisan dressings.
            </p>

            {/* Compact FSSAI badge */}
            <div className="inline-flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-[#0b241c] border border-[#164434] text-[11px] text-[#7ce0c3]">
              <ShieldCheck className="w-3.5 h-3.5 text-[#25d366]" />
              <span className="font-semibold">FSSAI Lic:</span>
              <span className="font-mono text-white font-bold">123456789412</span>
            </div>
          </div>

          {/* Col 2: Quick Links */}
          <div className="space-y-2.5">
            <h5 className="font-montserrat font-bold text-xs uppercase tracking-wider text-[#fbce45]">
              Quick Links
            </h5>
            <ul className="space-y-2 text-xs text-[#c2dfd5]">
              <li>
                <Link href="/" className="hover:text-[#fbce45] transition-colors flex items-center gap-1.5">
                  <ChevronRight className="w-3 h-3 text-[#fbce45]" />
                  <span>Home</span>
                </Link>
              </li>
              <li>
                <Link href="/salads" className="hover:text-[#fbce45] transition-colors flex items-center gap-1.5">
                  <ChevronRight className="w-3 h-3 text-[#fbce45]" />
                  <span>All Salad Bowls</span>
                </Link>
              </li>
              <li>
                {onSubscriptionClick ? (
                  <button onClick={onSubscriptionClick} className="hover:text-[#fbce45] transition-colors flex items-center gap-1.5 text-left">
                    <ChevronRight className="w-3 h-3 text-[#fbce45]" />
                    <span>Daily Subscriptions</span>
                  </button>
                ) : (
                  <Link href="/salads" className="hover:text-[#fbce45] transition-colors flex items-center gap-1.5">
                    <ChevronRight className="w-3 h-3 text-[#fbce45]" />
                    <span>Daily Subscriptions</span>
                  </Link>
                )}
              </li>
              <li>
                {onCateringClick ? (
                  <button onClick={onCateringClick} className="hover:text-[#fbce45] transition-colors flex items-center gap-1.5 text-left">
                    <ChevronRight className="w-3 h-3 text-[#fbce45]" />
                    <span>Event &amp; Bulk Catering</span>
                  </button>
                ) : (
                  <a href={`https://wa.me/${waPhone || '919825144321'}?text=Hi%20Greesal,%20I%20am%20interested%20in%20Bulk%20Catering`} className="hover:text-[#fbce45] transition-colors flex items-center gap-1.5">
                    <ChevronRight className="w-3 h-3 text-[#fbce45]" />
                    <span>Event &amp; Bulk Catering</span>
                  </a>
                )}
              </li>
            </ul>
          </div>

          {/* Col 3: Popular Bowls */}
          <div className="space-y-2.5">
            <h5 className="font-montserrat font-bold text-xs uppercase tracking-wider text-[#fbce45]">
              Popular Bowls
            </h5>
            <ul className="space-y-2 text-xs text-[#c2dfd5]">
              <li>
                <Link href="/salads" className="hover:text-[#fbce45] transition-colors flex items-center gap-1.5">
                  <span className="text-[#fbce45] font-bold">›</span>
                  <span>High Protein Bowl (19g Protein)</span>
                </Link>
              </li>
              <li>
                <Link href="/salads" className="hover:text-[#fbce45] transition-colors flex items-center gap-1.5">
                  <span className="text-[#fbce45] font-bold">›</span>
                  <span>Chef Burrito Salad Bowl</span>
                </Link>
              </li>
              <li>
                <Link href="/salads" className="hover:text-[#fbce45] transition-colors flex items-center gap-1.5">
                  <span className="text-[#fbce45] font-bold">›</span>
                  <span>Crunchy Peanut Butter Salad</span>
                </Link>
              </li>
              <li>
                <Link href="/salads" className="hover:text-[#fbce45] transition-colors flex items-center gap-1.5">
                  <span className="text-[#fbce45] font-bold">›</span>
                  <span>Super Sprout Power Bowl</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 4: Kitchen & Contact */}
          <div className="space-y-2.5">
            <h5 className="font-montserrat font-bold text-xs uppercase tracking-wider text-[#fbce45]">
              Kitchen &amp; Contact
            </h5>
            <div className="space-y-2 text-xs text-[#c2dfd5]">
              <div className="flex items-start gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-[#7ce0c3] shrink-0 mt-0.5" />
                <span>{kitchenAddress}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-[#7ce0c3] shrink-0" />
                <span>{kitchenTiming}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-[#7ce0c3] shrink-0" />
                <a href={`tel:${cleanPhone}`} className="text-white font-bold hover:text-[#fbce45] transition-colors">
                  {phone}
                </a>
              </div>
              <div className="flex items-center gap-1.5">
                <WhatsAppIcon className="w-3.5 h-3.5 text-[#25d366] shrink-0" />
                <a
                  href={`https://wa.me/${waPhone || '919825144321'}?text=Hi%20Greesal!`}
                  target="_blank"
                  rel="noreferrer"
                  className="text-[#25d366] hover:text-[#46e683] font-medium transition-colors"
                >
                  WhatsApp: +91 {waPhone ? waPhone.replace(/^91/, '') : '98251 44321'}
                </a>
              </div>
              <div className="flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-[#7ce0c3] shrink-0" />
                <a href={`mailto:${email}`} className="text-[#8ebfb0] hover:text-white transition-colors">
                  {email}
                </a>
              </div>
            </div>
          </div>

        </div>

        {/* Compact Bottom Bar */}
        <div className="pt-4 border-t border-[#12382b] flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-[#7ca89b] text-center sm:text-left">
          <p>
            &copy; {new Date().getFullYear()} <strong className="text-[#c2dfd5]">Greesal Kitchen</strong>. All rights reserved. Surat, Gujarat.
          </p>

          <div className="flex items-center gap-3 flex-wrap justify-center text-[11px]">
            <Link href="/admin" className="text-[#fbce45] hover:underline font-semibold">
              Admin
            </Link>
            <span>•</span>
            <button type="button" onClick={onOpenTerms} className="hover:text-white transition-colors cursor-pointer">
              Terms &amp; Standards
            </button>
            <span>•</span>
            <button type="button" onClick={onOpenPrivacy} className="hover:text-white transition-colors cursor-pointer">
              Privacy Policy
            </button>
          </div>
        </div>

      </div>
    </footer>
  );
};
