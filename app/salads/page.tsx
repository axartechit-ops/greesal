'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { DEFAULT_SALADS, Salad } from '@/lib/salads';
import { SaladIndiaHeader } from '@/components/SaladIndiaHeader';
import { SaladStickyBar } from '@/components/SaladStickyBar';
import { SaladMenuSection } from '@/components/SaladMenuSection';
import { SaladIndiaFooter } from '@/components/SaladIndiaFooter';
import { FloatingWhatsAppBubble } from '@/components/FloatingWhatsAppBubble';
import { SubscriptionModal } from '@/components/SubscriptionModal';
import { EventCateringModal } from '@/components/EventCateringModal';
import { SaladDetailModal } from '@/components/SaladDetailModal';
import { SaladCartDrawer, CartItem } from '@/components/SaladCartDrawer';
import { ProfileModal } from '@/components/ProfileModal';
import { LoginModal } from '@/components/LoginModal';
import { TermsModal } from '@/components/TermsModal';
import { DEFAULT_SITE_SETTINGS, SiteSettings } from '@/lib/siteSettings';

interface CartMap {
  [saladId: string]: number;
}

export default function SaladsPage() {
  const { data: session, status } = useSession();
  const [siteSettings, setSiteSettings] = useState<SiteSettings>(DEFAULT_SITE_SETTINGS);

  const [salads, setSalads] = useState<Salad[]>([]);
  const [isLoadingSalads, setIsLoadingSalads] = useState<boolean>(true);
  const [cartQuantities, setCartQuantities] = useState<CartMap>({});

  // Modals state
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isSubscriptionModalOpen, setIsSubscriptionModalOpen] = useState(false);
  const [isCateringModalOpen, setIsCateringModalOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isTermsModalOpen, setIsTermsModalOpen] = useState(false);
  const [selectedSalad, setSelectedSalad] = useState<Salad | null>(null);

  // User details from localStorage
  const [customName, setCustomName] = useState<string>('');
  const [customMobile, setCustomMobile] = useState<string>('');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const authError = params.get('error');
      if (authError) {
        if (authError === 'OAuthCallback') {
          setToastMessage('Google Login setup incomplete (GOOGLE_CLIENT_SECRET is missing in .env.local). Please use Email or Mobile OTP login.');
          setIsLoginModalOpen(true);
        } else if (authError === 'OAuthAccountNotLinked') {
          setToastMessage('Email already exists. Please log in with your email/password or OTP.');
          setIsLoginModalOpen(true);
        } else {
          setToastMessage(`Sign in message: ${authError}`);
        }
        // Clean URL cleanly without reloading
        window.history.replaceState({}, document.title, window.location.pathname);
      }
    }

    if (session?.user && !sessionStorage.getItem('greesal_login_greeted')) {
      sessionStorage.setItem('greesal_login_greeted', 'true');
      setToastMessage(`Welcome back, ${session.user.name || 'Customer'}! Logged in successfully.`);
      setTimeout(() => setToastMessage(null), 4000);
    }
  }, [session]);

  useEffect(() => {
    // Load saved cart from localStorage if present
    const savedCart = localStorage.getItem('salad_india_cart');
    if (savedCart) {
      try {
        setCartQuantities(JSON.parse(savedCart));
      } catch (e) {}
    }

    const savedName = localStorage.getItem('greesal_custom_name');
    if (savedName) setCustomName(savedName);

    const savedMobile = localStorage.getItem('greesal_custom_mobile');
    if (savedMobile) setCustomMobile(savedMobile);

    // 1. Fetch dynamic site content settings from admin API
    const fetchSettings = async () => {
      try {
        const res = await fetch('/api/admin/settings');
        if (res.ok) {
          const data = await res.json();
          if (data && typeof data === 'object') {
            setSiteSettings((prev) => ({ ...prev, ...data }));
          }
        }
      } catch (e) {}
    };
    fetchSettings();

    // 2. Fetch salads from API
    const fetchSalads = async () => {
      try {
        setIsLoadingSalads(true);
        const res = await fetch('/api/salads');
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data) && data.length > 0) {
            setSalads(data);
          } else {
            setSalads(DEFAULT_SALADS);
          }
        } else {
          setSalads(DEFAULT_SALADS);
        }
      } catch (err) {
        setSalads(DEFAULT_SALADS);
      } finally {
        setIsLoadingSalads(false);
      }
    };
    fetchSalads();
  }, []);

  // Save cart changes
  const saveCart = (newCart: CartMap) => {
    setCartQuantities(newCart);
    try {
      localStorage.setItem('salad_india_cart', JSON.stringify(newCart));
    } catch (e) {}
  };

  const handleAddToCart = (salad: Salad) => {
    const id = salad.id || salad._id || salad.slug || salad.name;
    const currentQty = cartQuantities[id] || 0;
    saveCart({
      ...cartQuantities,
      [id]: currentQty + 1,
    });
  };

  const handleRemoveFromCart = (saladId: string) => {
    const currentQty = cartQuantities[saladId] || 0;
    if (currentQty <= 1) {
      const updated = { ...cartQuantities };
      delete updated[saladId];
      saveCart(updated);
    } else {
      saveCart({
        ...cartQuantities,
        [saladId]: currentQty - 1,
      });
    }
  };

  const handleUpdateQuantity = (saladId: string, delta: number) => {
    const currentQty = cartQuantities[saladId] || 0;
    const nextQty = currentQty + delta;
    if (nextQty <= 0) {
      const updated = { ...cartQuantities };
      delete updated[saladId];
      saveCart(updated);
    } else {
      saveCart({
        ...cartQuantities,
        [saladId]: nextQty,
      });
    }
  };

  const drawerCartItems: CartItem[] = Object.entries(cartQuantities)
    .map(([id, qty]) => {
      const salad = salads.find((s) => (s.id || s._id || s.slug || s.name) === id);
      return salad ? { salad, quantity: qty } : null;
    })
    .filter(Boolean) as CartItem[];

  const totalCartCount = Object.values(cartQuantities).reduce((acc, q) => acc + q, 0);
  const totalCartPrice = drawerCartItems.reduce((sum, item) => {
    const price = parseInt(item.salad.price.replace(/[^\d]/g, ''), 10) || 0;
    return sum + price * item.quantity;
  }, 0);

  const isLoggedIn = status === 'authenticated' || Boolean(customName || customMobile);
  const userName = session?.user?.name || customName || null;
  const userImage = session?.user?.image || null;

  return (
    <div className="min-h-screen bg-[#fcfdfc] text-[#1a1a1a] flex flex-col font-dmsans selection:bg-[#20493c] selection:text-white">
      {/* 1. Sticky Bar */}
      <SaladStickyBar
        offer={siteSettings.stickyBarOffer}
        text={siteSettings.stickyBarText}
        buttonText={siteSettings.stickyBarBtnText}
        onSubscribeClick={() => setIsSubscriptionModalOpen(true)}
        isOpen={siteSettings.isOpen}
        openingTime={siteSettings.openingTime}
        closingTime={siteSettings.closingTime}
        shopTimingText={siteSettings.shopTimingText}
        notice={siteSettings.notice}
        showNotice={siteSettings.showNotice}
        noticeType={siteSettings.noticeType}
        closedMessage={siteSettings.closedMessage}
      />
      
      {/* 2. Header */}
      <SaladIndiaHeader
        cartCount={totalCartCount}
        cartTotal={totalCartPrice}
        onCartClick={() => setIsCartOpen(true)}
        onProfileClick={() => {
          if (isLoggedIn) {
            setIsProfileModalOpen(true);
          } else {
            setIsLoginModalOpen(true);
          }
        }}
        onSubscriptionClick={() => setIsSubscriptionModalOpen(true)}
        onCateringClick={() => setIsCateringModalOpen(true)}
        userName={userName}
        userImage={userImage}
        isLoggedIn={isLoggedIn}
        isOpen={siteSettings.isOpen}
        openingTime={siteSettings.openingTime}
        closingTime={siteSettings.closingTime}
        shopTimingText={siteSettings.shopTimingText}
        closedMessage={siteSettings.closedMessage}
      />

      <main className="flex-1">
        {/* Page Top Banner */}
        <div className="bg-[#20493c] text-white py-12 sm:py-16 text-center px-4">
          <p className="text-xs font-bold uppercase tracking-widest text-[#fbce45] mb-2 font-montserrat">
            GREESAL FRESH SALAD MENU
          </p>
          <h1 className="font-montserrat font-black text-3xl sm:text-5xl text-white">
            Daily Fresh Salads in Surat
          </h1>
          <p className="text-xs sm:text-sm text-[#b0ffd7] mt-2 max-w-lg mx-auto">
            100% handmade dressings, no onion &amp; garlic, zero preservatives. Delivered fresh to your doorstep with free pre-booking.
          </p>
        </div>

        {/* Full Salads Menu Section */}
        <SaladMenuSection
          salads={salads}
          isLoading={isLoadingSalads}
          categories={siteSettings.categories}
          cartItems={cartQuantities}
          onAddToCart={handleAddToCart}
          onRemoveFromCart={handleRemoveFromCart}
          onSelectSaladForModal={(salad) => setSelectedSalad(salad)}
          onSubscriptionClick={() => setIsSubscriptionModalOpen(true)}
          onCateringClick={() => setIsCateringModalOpen(true)}
          isOpen={siteSettings.isOpen}
          openingTime={siteSettings.openingTime}
          closingTime={siteSettings.closingTime}
          closedMessage={siteSettings.closedMessage}
        />
      </main>

      {/* Footer */}
      <SaladIndiaFooter
        phone={siteSettings.contactPhone}
        email={siteSettings.contactEmail}
        kitchenAddress={siteSettings.kitchenAddress}
        kitchenTiming={siteSettings.kitchenTiming}
        lunchSlot={siteSettings.lunchSlot}
        eveningSlot={siteSettings.eveningSlot}
        expressSlot={siteSettings.expressSlot}
        onOpenPrivacy={() => setIsTermsModalOpen(true)}
        onOpenTerms={() => setIsTermsModalOpen(true)}
        onSubscriptionClick={() => setIsSubscriptionModalOpen(true)}
        onCateringClick={() => setIsCateringModalOpen(true)}
      />

      <FloatingWhatsAppBubble />

      {/* Cart Drawer */}
      <SaladCartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cartItems={drawerCartItems}
        onUpdateQuantity={handleUpdateQuantity}
        onRemoveItem={handleRemoveFromCart}
        onClearCart={() => saveCart({})}
      />

      {/* Subscription Modal */}
      <SubscriptionModal
        isOpen={isSubscriptionModalOpen}
        onClose={() => setIsSubscriptionModalOpen(false)}
      />

      {/* Event Catering Modal */}
      <EventCateringModal
        isOpen={isCateringModalOpen}
        onClose={() => setIsCateringModalOpen(false)}
      />

      {/* Salad Detail Modal */}
      <SaladDetailModal
        salad={selectedSalad}
        isOpen={Boolean(selectedSalad)}
        onClose={() => setSelectedSalad(null)}
        quantityInCart={
          selectedSalad
            ? cartQuantities[
                selectedSalad.id ||
                  selectedSalad._id ||
                  selectedSalad.slug ||
                  selectedSalad.name
              ] || 0
            : 0
        }
        onAddToCart={handleAddToCart}
        onRemoveFromCart={handleRemoveFromCart}
      />

      {/* Profile Modal */}
      <ProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        displayName={userName || 'Greesal Member'}
        displayEmail={session?.user?.email || 'customer@greesal.in'}
        displayMobile={customMobile || '+91 98251 44321'}
        userImage={userImage}
        onUpdateProfile={(name, mobile, address) => {
          setCustomName(name);
          setCustomMobile(mobile);
          localStorage.setItem('greesal_custom_name', name);
          localStorage.setItem('greesal_custom_mobile', mobile);
          localStorage.setItem('greesal_user_address', address);
        }}
        onReorder={(items) => {
          setIsProfileModalOpen(false);
          const newCart = { ...cartQuantities };
          items.forEach((item) => {
            newCart[item.id] = (newCart[item.id] || 0) + (item.quantity || 1);
          });
          saveCart(newCart);
          setIsCartOpen(true);
        }}
      />

      {/* Login Modal */}
      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        onSuccess={(user) => {
          setIsLoginModalOpen(false);
          if (user?.name) setCustomName(user.name);
          if (user?.mobile) setCustomMobile(user.mobile);
          setIsProfileModalOpen(true);
          setToastMessage(`Welcome back, ${user?.name || 'Customer'}! Logged in successfully.`);
          setTimeout(() => setToastMessage(null), 4000);
        }}
      />

      {/* Terms / Privacy Modal */}
      <TermsModal
        isOpen={isTermsModalOpen}
        type="terms"
        onClose={() => setIsTermsModalOpen(false)}
      />

      {/* Floating Login Success Toast */}
      {toastMessage && (
        <div className="fixed top-5 left-1/2 -translate-x-1/2 z-50 px-5 py-3 rounded-full bg-[#123B2B] text-white text-xs sm:text-sm font-bold shadow-2xl border border-emerald-400/40 flex items-center gap-2.5 animate-in fade-in slide-in-from-top-4 duration-300 pointer-events-none">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
}
