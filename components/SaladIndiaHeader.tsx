import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { GreesalLogo } from './GreesalLogo';
import { 
  ShoppingCart, 
  User, 
  Menu, 
  X, 
  Phone, 
  Calendar, 
  ChevronRight, 
  UtensilsCrossed, 
  PartyPopper, 
  HelpCircle,
  LogIn
} from 'lucide-react';

interface SaladIndiaHeaderProps {
  cartCount: number;
  cartTotal?: number;
  onCartClick: () => void;
  onProfileClick: () => void;
  onSubscriptionClick: () => void;
  onCateringClick: () => void;
  userName?: string | null;
  userImage?: string | null;
  isLoggedIn?: boolean;
  isOpen?: boolean;
  openingTime?: string;
  closingTime?: string;
  shopTimingText?: string;
  closedMessage?: string;
}

export const SaladIndiaHeader: React.FC<SaladIndiaHeaderProps> = ({
  cartCount,
  cartTotal = 0,
  onCartClick,
  onProfileClick,
  onSubscriptionClick,
  onCateringClick,
  userName,
  userImage,
  isLoggedIn = false,
  isOpen = true,
  openingTime = '08:00 AM',
  closingTime = '10:30 PM',
  shopTimingText = 'Open Daily: 8:00 AM – 10:30 PM',
  closedMessage = 'Our kitchen is currently closed. Opening again at 08:00 AM. Pre-orders are welcome!',
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <>
      <header
        className={`sticky top-0 z-40 bg-white transition-all duration-300 ${
          scrolled ? 'shadow-md' : 'shadow-2xs'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 sm:py-4 lg:py-4.5">
          <div className="flex items-center justify-between">
            
            {/* Left: Clean Brand Logo without any cluttering pills */}
            <div className="flex items-center flex-shrink-0">
              <Link href="/" className="flex items-center group focus:outline-none flex-shrink-0" aria-label="Greesal Home">
                <GreesalLogo size="md" className="sm:scale-105" />
              </Link>
            </div>

            {/* Right: Clean, Spacious Desktop Navigation Menu (Matching Salad India Reference) */}
            <nav className="hidden lg:flex items-center gap-7 xl:gap-9 2xl:gap-11 text-[15px] xl:text-[16px] font-medium text-[#1a1a1a]">
              {/* 1. Home */}
              <Link
                href="/"
                className="text-[#1a1a1a] font-semibold pb-1 border-b-2 border-transparent hover:border-[#20493c] hover:text-[#20493c] transition-all"
              >
                Home
              </Link>

              {/* 2. Salads */}
              <Link
                href="/salads"
                className="text-[#1a1a1a] pb-1 border-b-2 border-transparent hover:border-[#20493c] hover:text-[#20493c] transition-all font-semibold text-[#20493c]"
              >
                Salads
              </Link>

              {/* 3. Subscriptions */}
              <button
                onClick={onSubscriptionClick}
                className="text-[#1a1a1a] pb-1 border-b-2 border-transparent hover:border-[#20493c] hover:text-[#20493c] transition-all cursor-pointer font-medium"
              >
                Subscriptions
              </button>

              {/* 4. Event & Catering */}
              <button
                onClick={onCateringClick}
                className="text-[#1a1a1a] pb-1 border-b-2 border-transparent hover:border-[#20493c] hover:text-[#20493c] transition-all cursor-pointer font-medium"
              >
                Event &amp; Catering
              </button>

              {/* 5. Contact */}
              <a
                href="#contact"
                className="text-[#1a1a1a] pb-1 border-b-2 border-transparent hover:border-[#20493c] hover:text-[#20493c] transition-all"
              >
                Contact
              </a>

              {/* 6. Cart Button (Outline bag icon + "Cart" text matching reference) */}
              <button
                onClick={onCartClick}
                className="inline-flex items-center gap-2 text-[#1a1a1a] pb-1 border-b-2 border-transparent hover:border-[#20493c] hover:text-[#20493c] transition-all cursor-pointer group font-medium"
                aria-label="View Shopping Cart"
              >
                <div className="relative flex items-center justify-center">
                  <ShoppingCart className="w-5 h-5 text-[#1a1a1a] group-hover:text-[#20493c] transition-colors" strokeWidth={1.75} />
                  {cartCount > 0 && (
                    <span className="absolute -top-1.5 -right-2 bg-[#20493c] text-[#fbce45] text-[10px] font-black w-4 h-4 rounded-full flex items-center justify-center shadow-xs">
                      {cartCount}
                    </span>
                  )}
                </div>
                <span>Cart</span>
                {cartTotal > 0 && (
                  <span className="text-xs font-bold text-[#20493c] bg-[#eef8f3] px-2 py-0.5 rounded-full ml-0.5">
                    ₹{cartTotal}
                  </span>
                )}
              </button>

              {/* 7. Login / Customer Account */}
              <button
                onClick={onProfileClick}
                className="inline-flex items-center gap-1.5 text-[#1a1a1a] pb-1 border-b-2 border-transparent hover:border-[#20493c] hover:text-[#20493c] transition-all cursor-pointer font-medium"
                title={isLoggedIn ? `Logged in as ${userName || 'User'}` : 'Login to Greesal'}
              >
                {userImage ? (
                  <img
                    src={userImage}
                    alt={userName || 'User'}
                    className="w-5 h-5 rounded-full object-cover border border-[#6ac6ac]"
                  />
                ) : (
                  <User className="w-4.5 h-4.5 text-[#1a1a1a] group-hover:text-[#20493c]" strokeWidth={1.75} />
                )}
                <span>{isLoggedIn ? (userName ? userName.split(' ')[0] : 'Account') : 'Login'}</span>
              </button>
            </nav>

            {/* Mobile Actions: Salads, Cart & Hamburger */}
            <div className="flex lg:hidden items-center gap-1.5 sm:gap-2.5">
              {/* Quick Jump to All Salads */}
              <Link
                href="/salads"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#e8f7f2] hover:bg-[#d5f0e6] text-[#20493c] font-bold text-xs border border-[#6ac6ac]/40 transition-all shadow-2xs active:scale-95 cursor-pointer"
                aria-label="Browse All Salads"
              >
                <UtensilsCrossed className="w-3.5 h-3.5 text-[#20493c]" />
                <span>Salads</span>
              </Link>

              {/* Cart Button */}
              <button
                onClick={onCartClick}
                className="relative p-2 text-[#20493c] hover:bg-[#f2f8f5] rounded-xl transition-colors cursor-pointer"
                aria-label="Cart"
              >
                <ShoppingCart className="w-5 h-5" />
                {cartCount > 0 && (
                  <span className="absolute top-0.5 right-0.5 bg-[#20493c] text-[#fbce45] text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center shadow-xs">
                    {cartCount}
                  </span>
                )}
              </button>

              {/* Hamburger Menu Toggle */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 rounded-xl text-[#20493c] hover:bg-[#f2f8f5] focus:outline-none transition-colors cursor-pointer"
                aria-label="Toggle mobile menu"
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>

          </div>
        </div>

        {/* Decorative Mint Stripe Directly Under Header Matching Salad India Reference */}
        <div className="h-2 sm:h-2.5 bg-[#6ac6ac] w-full" />
      </header>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
            onClick={() => setMobileMenuOpen(false)}
          />

          {/* Drawer content */}
          <div className="fixed inset-y-0 right-0 max-w-xs w-full bg-white shadow-2xl p-6 flex flex-col justify-between z-10 animate-fadeIn">
            <div>
              {/* Header inside drawer */}
              <div className="flex items-center justify-between pb-4 border-b border-[#e4eae7]">
                <GreesalLogo size="sm" />
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-1.5 rounded-full hover:bg-gray-100 text-gray-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Mobile Drawer Store Status Badge */}
              <div className={`mt-3 p-3 rounded-2xl border text-left flex items-center justify-between ${
                isOpen
                  ? 'bg-emerald-50/80 border-emerald-200 text-emerald-900'
                  : 'bg-red-50/80 border-red-200 text-red-900'
              }`}>
                <div className="flex items-center gap-2">
                  <span className={`w-2.5 h-2.5 rounded-full ${isOpen ? 'bg-emerald-500 animate-pulse' : 'bg-red-500'}`} />
                  <div>
                    <p className="text-xs font-black">
                      {isOpen ? 'Store is Open' : 'Store is Closed'}
                    </p>
                    <p className="text-[10px] opacity-80">
                      {isOpen ? `${openingTime} – ${closingTime}` : `Opens again at ${openingTime}`}
                    </p>
                  </div>
                </div>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                  isOpen ? 'bg-emerald-200/60 text-emerald-900' : 'bg-red-200/60 text-red-900'
                }`}>
                  {isOpen ? 'Live' : 'Pre-Order'}
                </span>
              </div>

              {/* Mobile Links */}
              <nav className="mt-6 flex flex-col gap-3 font-dmsans">
                <Link
                  href="/"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-between px-3 py-2.5 rounded-xl hover:bg-[#f2f8f5] text-[#1a1a1a] font-medium"
                >
                  <span>Home</span>
                  <ChevronRight className="w-4 h-4 text-gray-400" />
                </Link>
                <Link
                  href="/salads"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-between px-3 py-2.5 rounded-xl hover:bg-[#f2f8f5] text-[#1a1a1a] font-medium"
                >
                  <div className="flex items-center gap-2">
                    <UtensilsCrossed className="w-4 h-4 text-[#20493c]" />
                    <span>Salad Menu (21+ Varieties)</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-gray-400" />
                </Link>
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onSubscriptionClick();
                  }}
                  className="flex items-center justify-between px-3 py-2.5 rounded-xl hover:bg-[#f2f8f5] text-[#20493c] font-semibold text-left w-full"
                >
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-[#fbce45]" />
                    <span>Subscriptions (Weekly & Monthly)</span>
                  </div>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#fbce45] text-[#20493c] font-bold">
                    Save ₹25
                  </span>
                </button>
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onCateringClick();
                  }}
                  className="flex items-center justify-between px-3 py-2.5 rounded-xl hover:bg-[#f2f8f5] text-[#1a1a1a] font-medium text-left w-full"
                >
                  <div className="flex items-center gap-2">
                    <PartyPopper className="w-4 h-4 text-[#6ac6ac]" />
                    <span>Event & Catering</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-gray-400" />
                </button>
                <a
                  href="#reviews"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-between px-3 py-2.5 rounded-xl hover:bg-[#f2f8f5] text-[#1a1a1a] font-medium"
                >
                  <span>Customer Reviews</span>
                  <ChevronRight className="w-4 h-4 text-gray-400" />
                </a>
                <a
                  href="#contact"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-between px-3 py-2.5 rounded-xl hover:bg-[#f2f8f5] text-[#1a1a1a] font-medium"
                >
                  <span>Contact & Store Timings</span>
                  <ChevronRight className="w-4 h-4 text-gray-400" />
                </a>
              </nav>
            </div>

            {/* Bottom drawer actions */}
            <div className="pt-6 border-t border-[#e4eae7] flex flex-col gap-3">
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  onProfileClick();
                }}
                className="w-full py-2.5 px-4 rounded-xl border border-[#20493c] text-[#20493c] font-bold text-sm flex items-center justify-center gap-2 hover:bg-[#f2f8f5]"
              >
                {isLoggedIn ? (
                  <>
                    <User className="w-4 h-4" />
                    <span>{userName || 'My Profile & Orders'}</span>
                  </>
                ) : (
                  <>
                    <LogIn className="w-4 h-4" />
                    <span>Login / Create Account</span>
                  </>
                )}
              </button>

              <a
                href="https://wa.me/919825144321"
                target="_blank"
                rel="noreferrer"
                className="w-full py-2.5 px-4 rounded-xl bg-[#20493c] text-white font-bold text-sm flex items-center justify-center gap-2 shadow-sm"
              >
                <Phone className="w-4 h-4 text-[#fbce45]" />
                <span>Call / WhatsApp Order (+91 98251 44321)</span>
              </a>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
