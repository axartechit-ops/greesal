'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { Salad, DEFAULT_SALADS } from '@/lib/salads';
import { SaladStickyBar } from '@/components/SaladStickyBar';
import { SaladIndiaHeader } from '@/components/SaladIndiaHeader';
import { SaladHeroSection } from '@/components/SaladHeroSection';
import { WhatMakesDifference } from '@/components/WhatMakesDifference';
import { SaladStatsSection } from '@/components/SaladStatsSection';
import { OurServicesSection } from '@/components/OurServicesSection';
import { CustomerReviewsSection } from '@/components/CustomerReviewsSection';
import { SaladIndiaFooter } from '@/components/SaladIndiaFooter';
import { FloatingWhatsAppBubble } from '@/components/FloatingWhatsAppBubble';
import { SubscriptionModal } from '@/components/SubscriptionModal';
import { EventCateringModal } from '@/components/EventCateringModal';
import { SaladCartDrawer, CartItem as DrawerCartItem } from '@/components/SaladCartDrawer';
import { ProfileModal } from '@/components/ProfileModal';
import { LoginModal } from '@/components/LoginModal';
import { InvoiceModal, InvoiceOrder } from '@/components/InvoiceModal';
import { TermsModal } from '@/components/TermsModal';

import { DEFAULT_SITE_SETTINGS, SiteSettings } from '@/lib/siteSettings';

interface CartMap {
  [saladId: string]: number;
}

export default function SaladIndiaHome() {
  const router = useRouter();
  const { data: session, status } = useSession();

  // Site dynamic content settings & categories managed by admin
  const [siteSettings, setSiteSettings] = useState<SiteSettings>(DEFAULT_SITE_SETTINGS);

  // Salads list state
  const [salads, setSalads] = useState<Salad[]>([]);
  const [isLoadingSalads, setIsLoadingSalads] = useState<boolean>(true);

  // Cart state: map of saladId -> quantity
  const [cartQuantities, setCartQuantities] = useState<CartMap>({});

  // Modals state
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isSubscriptionModalOpen, setIsSubscriptionModalOpen] = useState(false);
  const [isCateringModalOpen, setIsCateringModalOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isTermsModalOpen, setIsTermsModalOpen] = useState(false);

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

    // 1. Fetch dynamic site content settings & categories from admin settings API
    const fetchSettings = async () => {
      try {
        const res = await fetch('/api/admin/settings');
        if (res.ok) {
          const data = await res.json();
          if (data && typeof data === 'object') {
            setSiteSettings((prev) => ({ ...prev, ...data }));
          }
        }
      } catch (e) {
        // Fallback to DEFAULT_SITE_SETTINGS
      }
    };
    fetchSettings();

    // 2. Fetch dynamic salad list from backend if available
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

  const handleClearCart = () => {
    saveCart({});
  };

  // Convert cart map to drawer items list
  const drawerCartItems: DrawerCartItem[] = useMemo(() => {
    const items: DrawerCartItem[] = [];
    Object.entries(cartQuantities).forEach(([saladId, qty]) => {
      const salad = salads.find(
        (s) => (s.id || s._id || s.slug || s.name) === saladId
      );
      if (salad && qty > 0) {
        items.push({ salad, quantity: qty });
      }
    });
    return items;
  }, [cartQuantities, salads]);

  const totalCartCount = useMemo(() => {
    return Object.values(cartQuantities).reduce((acc, qty) => acc + qty, 0);
  }, [cartQuantities]);

  const totalCartPrice = useMemo(() => {
    return drawerCartItems.reduce((sum, item) => {
      const price = parseInt(item.salad.price.replace(/[^\d]/g, ''), 10) || 0;
      return sum + price * item.quantity;
    }, 0);
  }, [drawerCartItems]);

  const userName = session?.user?.name || customName || null;
  const userImage = session?.user?.image || null;
  const isLoggedIn = status === 'authenticated' || Boolean(customName);

  const navigateToSalads = () => {
    router.push('/salads');
  };

  return (
    <div className="min-h-screen bg-[#fcfdfc] text-[#1a1a1a] flex flex-col font-dmsans selection:bg-[#20493c] selection:text-white">
      
      {/* 1. Sticky Top Announcement Bar in #fbce45 */}
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

      {/* 2. Main Navigation Header */}
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

      {/* Main Content Area */}
      <main className="flex-1">
        {/* 3. Hero Section ("Farm-Fresh Organic Salad Bowls" & Story) */}
        <SaladHeroSection
          badge={siteSettings.heroBadge || siteSettings.badgeText}
          slogan={siteSettings.heroSlogan || siteSettings.title}
          storyHeading={siteSettings.heroStoryHeading}
          storyBrand={siteSettings.heroStoryBrand}
          storyP1={siteSettings.heroStoryP1 || siteSettings.description}
          storyP2={siteSettings.heroStoryP2}
          storyP3={siteSettings.heroStoryP3}
          storyP4={siteSettings.heroStoryP4}
          heroImage={siteSettings.heroImage}
          pill1={siteSettings.heroPill1 || siteSettings.pill1Text}
          pill2={siteSettings.heroPill2 || siteSettings.pill2Text}
          statBadge={siteSettings.heroStatBadge || siteSettings.highlight3Subtitle}
          statDelivered={siteSettings.heroStatDelivered || siteSettings.highlight3Title}
          highlight1Title={siteSettings.highlight1Title}
          highlight2Title={siteSettings.highlight2Title}
          highlight3Title={siteSettings.highlight3Title}
          ctaText={siteSettings.ctaText || 'Order Fresh Salads'}
          ctaLink="/salads"
          onExploreMenu={navigateToSalads}
          onSubscribeClick={() => setIsSubscriptionModalOpen(true)}
        />

        {/* 4. What Makes The Difference? Section (Up to 4 Images Showcase) */}
        <WhatMakesDifference
          badge={siteSettings.differenceBadge}
          title={siteSettings.differenceTitle}
          subtitle={siteSettings.differenceSubtitle}
          image1={siteSettings.differenceImage1}
          image2={siteSettings.differenceImage2}
          image3={siteSettings.differenceImage3}
          image4={siteSettings.differenceImage4}
        />

        {/* 5. Stats Counter Bar */}
        <SaladStatsSection
          title={siteSettings.statsTitle}
          subtitle={siteSettings.statsSubtitle}
          stat1Num={siteSettings.stat1Num}
          stat1Label={siteSettings.stat1Label}
          stat1Desc={siteSettings.stat1Desc}
          stat2Num={siteSettings.stat2Num}
          stat2Label={siteSettings.stat2Label}
          stat2Desc={siteSettings.stat2Desc}
          stat3Num={siteSettings.stat3Num}
          stat3Label={siteSettings.stat3Label}
          stat3Desc={siteSettings.stat3Desc}
        />

        {/* 6. Our Services Section */}
        <OurServicesSection
          badge={siteSettings.servicesBadge}
          title={siteSettings.servicesTitle}
          cards={siteSettings.servicesCards}
          onOrderSingle={navigateToSalads}
          onSubscribeClick={() => setIsSubscriptionModalOpen(true)}
        />

        {/* 7. Customers Says Testimonial Section */}
        <CustomerReviewsSection />
      </main>

      {/* 8. Comprehensive Pastel Mint Footer */}
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

      {/* 9. Floating WhatsApp Chat Bubble */}
      <FloatingWhatsAppBubble />

      {/* Modals & Drawers */}
      <SaladCartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cartItems={drawerCartItems}
        onUpdateQuantity={handleUpdateQuantity}
        onRemoveItem={handleRemoveFromCart}
        onClearCart={handleClearCart}
        userName={userName || customName}
        userPhone={customMobile}
        isLoggedIn={isLoggedIn}
        onRequireFastCheckout={() => setIsLoginModalOpen(true)}
        isStoreOpen={siteSettings.isOpen}
        closedMessage={siteSettings.closedMessage}
      />

      <SubscriptionModal
        isOpen={isSubscriptionModalOpen}
        onClose={() => setIsSubscriptionModalOpen(false)}
      />

      <EventCateringModal
        isOpen={isCateringModalOpen}
        onClose={() => setIsCateringModalOpen(false)}
      />

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
          navigateToSalads();
        }}
      />

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
