'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { Salad, DEFAULT_SALADS, SaladPortion, getSaladPortions, getSaladNumericPrice } from '@/lib/salads';
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
import { SaladProjectHero } from '@/components/SaladProjectHero';
import { SaladDetailModal } from '@/components/SaladDetailModal';

import { DEFAULT_SITE_SETTINGS, SiteSettings } from '@/lib/siteSettings';

interface CartMap {
  [saladId: string]: number;
}

export default function SaladIndiaHome() {
  const router = useRouter();
  const { data: session, status } = useSession();

  // Site dynamic content settings & categories managed by admin
  const [siteSettings, setSiteSettings] = useState<SiteSettings>(DEFAULT_SITE_SETTINGS);

  // Salads list state - pre-populated with DEFAULT_SALADS for instant zero-latency load
  const [salads, setSalads] = useState<Salad[]>(DEFAULT_SALADS);
  const [isLoadingSalads, setIsLoadingSalads] = useState<boolean>(false);

  // Cart state: map of saladId -> quantity
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
  const [isMounted, setIsMounted] = useState<boolean>(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

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
    const baseId = salad.id || salad._id || salad.slug || salad.name;
    const portionKey = salad.selectedPortion ? `__${salad.selectedPortion.grams}g` : '';
    const id = `${baseId}${portionKey}`;
    const currentQty = cartQuantities[id] || 0;
    saveCart({
      ...cartQuantities,
      [id]: currentQty + 1,
    });
  };

  const handleRemoveFromCart = (saladId: string) => {
    if (cartQuantities[saladId]) {
      handleUpdateQuantity(saladId, -1);
      return;
    }
    const matchingKey = Object.keys(cartQuantities).find(
      (k) => k === saladId || k.startsWith(`${saladId}__`)
    );
    if (matchingKey) {
      handleUpdateQuantity(matchingKey, -1);
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

  // Convert cart map to drawer items list with portion decoding
  const drawerCartItems: DrawerCartItem[] = useMemo(() => {
    const items: DrawerCartItem[] = [];
    Object.entries(cartQuantities).forEach(([key, qty]) => {
      if (qty <= 0) return;
      const [baseId, gramPart] = key.split('__');
      const salad = salads.find(
        (s) => (s.id || s._id || s.slug || s.name) === baseId
      );
      if (!salad) return;

      if (gramPart) {
        const grams = parseInt(gramPart, 10);
        const portions = getSaladPortions(salad);
        const portion =
          portions.find((p) => p.grams === grams) || {
            grams,
            price: getSaladNumericPrice(salad),
            label: `${grams}g Bowl`,
          };
        items.push({
          salad: {
            ...salad,
            id: key,
            price: `₹${portion.price}`,
            selectedPortion: portion,
          },
          quantity: qty,
        });
      } else {
        const portions = getSaladPortions(salad);
        const defaultPortion = portions.find((p) => p.isDefault) || portions[0];
        items.push({
          salad: {
            ...salad,
            id: key,
            price: defaultPortion ? `₹${defaultPortion.price}` : salad.price,
            selectedPortion: defaultPortion,
          },
          quantity: qty,
        });
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

  const cartAggregatedQuantities = useMemo(() => {
    const agg: Record<string, number> = {};
    Object.entries(cartQuantities).forEach(([k, q]) => {
      const [baseId] = k.split('__');
      agg[baseId] = (agg[baseId] || 0) + q;
      agg[k] = q;
    });
    return agg;
  }, [cartQuantities]);

  // Compute salads selected by admin for top slider
  const sliderSalads = useMemo(() => {
    if (!salads || salads.length === 0) return [];
    const selectedIds = siteSettings.topSliderSaladIds;
    if (Array.isArray(selectedIds) && selectedIds.length > 0) {
      const filtered = salads.filter((s) => {
        const key = s._id || s.id || s.slug || s.name;
        return selectedIds.some(
          (id) => id === key || id === s._id || id === s.id || id === s.slug || id === s.name
        );
      });
      if (filtered.length > 0) return filtered;
    }
    // Default fallback to first 6 salads if none selected
    return salads.slice(0, 6);
  }, [salads, siteSettings.topSliderSaladIds]);

  const userName = isMounted ? (session?.user?.name || customName || null) : null;
  const userImage = isMounted ? (session?.user?.image || null) : null;
  const isLoggedIn = isMounted && (status === 'authenticated' || Boolean(customName || customMobile));

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
        {/* The Salad Project Inspired Dual-Split & Full-Width Cinematic Video Hero */}
        <SaladProjectHero
          onExploreMenu={navigateToSalads}
          onSubscribeClick={() => setIsSubscriptionModalOpen(true)}
          cityName="Surat"
          tableVideoUrl={siteSettings.tableVideoUrl}
          tableVideoPoster={siteSettings.tableVideoPoster}
          howToOrderBadge={siteSettings.howToOrderBadge}
          howToOrderHeading={siteSettings.howToOrderHeading}
          howToOrderCardNumber={siteSettings.howToOrderCardNumber}
          howToOrderCardTitle={siteSettings.howToOrderCardTitle}
          howToOrderCardDesc={siteSettings.howToOrderCardDesc}
          howToOrderVideoUrl={siteSettings.howToOrderVideoUrl}
          howToOrderVideoPoster={siteSettings.howToOrderVideoPoster}
          howToOrderHighlight1={siteSettings.howToOrderHighlight1}
          howToOrderHighlight2={siteSettings.howToOrderHighlight2}
          howToOrderHighlight3={siteSettings.howToOrderHighlight3}
          howToOrderBtnText={siteSettings.howToOrderBtnText}
          howToOrderBtnLink={siteSettings.howToOrderBtnLink}
        />

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
        plans={siteSettings.subscriptionPlans}
        modalBadge={siteSettings.subscriptionModalBadge}
        modalTitle={siteSettings.subscriptionModalTitle}
        modalSubtitle={siteSettings.subscriptionModalSubtitle}
      />

      <EventCateringModal
        isOpen={isCateringModalOpen}
        onClose={() => setIsCateringModalOpen(false)}
      />

      <SaladDetailModal
        salad={selectedSalad}
        isOpen={Boolean(selectedSalad)}
        onClose={() => setSelectedSalad(null)}
        quantityInCart={selectedSalad ? cartAggregatedQuantities[selectedSalad.id || selectedSalad._id || selectedSalad.slug || selectedSalad.name] || 0 : 0}
        onAddToCart={handleAddToCart}
        onRemoveFromCart={(id) => handleRemoveFromCart(id)}
      />

      <ProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        displayName={userName || 'Greesal Member'}
        displayEmail={session?.user?.email || 'customer@greesal.in'}
        displayMobile={customMobile || ''}
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
