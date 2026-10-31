'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { GreesalLogo } from '@/components/GreesalLogo';
import { TopLeftLeafBranch } from '@/components/LeafDecoration';
import { ProfileModal, OrderItem } from '@/components/ProfileModal';
import { InvoiceModal, InvoiceOrder } from '@/components/InvoiceModal';
import { LoginModal } from '@/components/LoginModal';
import { GoogleMapPickerModal } from '@/components/GoogleMapPickerModal';
import { getLiveDetailedLocation } from '@/lib/geolocation';
import { sendOrderToWhatsApp } from '@/lib/whatsapp';
import { DEFAULT_SALAD_ADDONS, getSaladByIdOrSlug, Salad, SaladAddOn, SaladPortion, getSaladPortions, getSaladIngredients, getSaladDressing, getSaladCrunch, slugify } from '@/lib/salads';
import {
  Sparkles,
  Leaf,
  ShoppingBag,
  Heart,
  User,
  Loader2,
  X,
  ShieldCheck,
  Zap,
  Activity,
  Flame,
  Info,
  Plus,
  Minus,
  Trash2,
  ShoppingCart,
  CheckCircle,
  CheckCircle2,
  MapPin,
  MessageSquare,
  LogIn,
  Search,
  Star,
  Clock,
  ArrowLeft,
  ChevronRight,
  Truck,
  Check,
  Utensils,
  Phone,
  Globe,
  Navigation,
  Edit3,
  ExternalLink
} from 'lucide-react';

interface CartItem {
  id: string;
  name: string;
  price: string;
  image: string;
  quantity: number;
  selectedAddOns?: Array<{ name: string; price: number }>;
}

export default function SaladDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { data: session, status } = useSession();
  const rawId = Array.isArray(params?.id) ? params.id[0] : (params?.id as string) || '';

  const [allSalads, setAllSalads] = useState<Salad[]>([]);
  const [isLoadingSalads, setIsLoadingSalads] = useState<boolean>(true);
  const [activeSalad, setActiveSalad] = useState<Salad | null>(null);
  const salad: Salad | null = activeSalad || getSaladByIdOrSlug(rawId, allSalads) || (allSalads.length > 0 ? allSalads[0] : null);
  const portions = useMemo(() => getSaladPortions(salad), [salad]);
  const [selectedPortion, setSelectedPortion] = useState<SaladPortion>(() => {
    const list = getSaladPortions(salad);
    return list.find((p) => p.isDefault) || list[0];
  });

  useEffect(() => {
    if (salad) {
      const list = getSaladPortions(salad);
      setSelectedPortion((prev) => {
        const match = list.find((p) => p.grams === prev?.grams);
        return match || list.find((p) => p.isDefault) || list[0];
      });
    }
  }, [salad]);

  const [quantity, setQuantity] = useState<number>(1);
  const [selectedAddOns, setSelectedAddOns] = useState<Array<{ name: string; price: number }>>([]);
  const [isAddedAnimation, setIsAddedAnimation] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const [removedItems, setRemovedItems] = useState<string[]>([]);

  useEffect(() => {
    setRemovedItems([]);
  }, [salad?.id, salad?._id, salad?.name]);

  const toggleRemoveItem = (item: string) => {
    setRemovedItems((prev) =>
      prev.includes(item) ? prev.filter((i) => i !== item) : [...prev, item]
    );
  };

  // User Profile and Auth state
  const [customName, setCustomName] = useState<string | null>(null);
  const [customMobile, setCustomMobile] = useState<string | null>(null);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
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

  // Cart & Checkout state
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutSuccess, setIsCheckoutSuccess] = useState(false);
  const [latestPlacedOrder, setLatestPlacedOrder] = useState<InvoiceOrder | null>(null);
  const [isInvoiceOpen, setIsInvoiceOpen] = useState(false);

  // Delivery Address & Google Map State
  const [deliveryAddress, setDeliveryAddress] = useState('Katargam, Surat - 395004');
  const [isEditingAddressInCart, setIsEditingAddressInCart] = useState(false);
  const [cartAddressInput, setCartAddressInput] = useState('Katargam, Surat - 395004');
  const [isDetectingLocationInCart, setIsDetectingLocationInCart] = useState(false);
  const [deliveryNote, setDeliveryNote] = useState('');
  const [addressMode, setAddressMode] = useState<'google_map' | 'manual'>('google_map');
  const [isMapPickerOpen, setIsMapPickerOpen] = useState(false);
  const [locationCoords, setLocationCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [mapsUrl, setMapsUrl] = useState<string>('');
  const [flatNo, setFlatNo] = useState<string>('');
  const [areaLocality, setAreaLocality] = useState<string>('');
  const [landmark, setLandmark] = useState<string>('');
  const [cityPincode, setCityPincode] = useState<string>('Surat - 395007');
  const [deliverySlot, setDeliverySlot] = useState<'immediate' | 'lunch' | 'evening' | 'pickup'>('immediate');
  const [validationError, setValidationError] = useState<string | null>(null);
  const [locationSuccessMsg, setLocationSuccessMsg] = useState<string | null>(null);
  const [isSubmittingOrder, setIsSubmittingOrder] = useState<boolean>(false);

  // Shop Timing & Notice Settings from Admin
  const [isOpen, setIsOpen] = useState<boolean>(true);
  const [openingTime, setOpeningTime] = useState<string>('08:00 AM');
  const [closingTime, setClosingTime] = useState<string>('10:30 PM');
  const [shopTimingText, setShopTimingText] = useState<string>('Open Daily: 8:00 AM – 10:30 PM');
  const [notice, setNotice] = useState<string>('Fresh Organic Harvest Delivered in 30 Mins across Surat • Free Delivery on ₹499+');
  const [showNotice, setShowNotice] = useState<boolean>(true);
  const [noticeType, setNoticeType] = useState<'announcement' | 'info' | 'alert' | 'discount'>('announcement');
  const [closedMessage, setClosedMessage] = useState<string>('Our kitchen is currently closed. Opening again at 08:00 AM. Pre-orders are welcome!');

  // Fetch / Sync Salads & Settings from API if modified in admin
  useEffect(() => {
    fetch('/api/salads')
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          const realSalads = data.filter((s: any) => !String(s.id || '').startsWith('fallback-') && !String(s._id || '').startsWith('fallback-'));
          setAllSalads(realSalads);
          const found = getSaladByIdOrSlug(rawId, realSalads);
          if (found) setActiveSalad(found);
        }
      })
      .catch(() => { })
      .finally(() => {
        setIsLoadingSalads(false);
      });

    fetch('/api/admin/settings')
      .then((res) => res.json())
      .then((settingsData) => {
        if (settingsData) {
          if (settingsData.isOpen !== undefined) setIsOpen(Boolean(settingsData.isOpen));
          if (settingsData.openingTime) setOpeningTime(settingsData.openingTime);
          if (settingsData.closingTime) setClosingTime(settingsData.closingTime);
          if (settingsData.shopTimingText) setShopTimingText(settingsData.shopTimingText);
          if (settingsData.notice) setNotice(settingsData.notice);
          if (settingsData.showNotice !== undefined) setShowNotice(Boolean(settingsData.showNotice));
          if (settingsData.noticeType) setNoticeType(settingsData.noticeType);
          if (settingsData.closedMessage) setClosedMessage(settingsData.closedMessage);
        }
      })
      .catch(() => { });
  }, []);

  // Resolve current salad and reset selected add-ons
  useEffect(() => {
    if (rawId) {
      setSelectedAddOns([]);
      const found = getSaladByIdOrSlug(rawId, allSalads);
      if (found) {
        setActiveSalad(found);
      } else {
        // Fallback to first salad
        setActiveSalad(allSalads[0] || null);
      }
    }
  }, [rawId, allSalads]);

  // Load cart and user details from localStorage
  useEffect(() => {
    try {
      const savedCart = localStorage.getItem('greesal_cart');
      if (savedCart) setCart(JSON.parse(savedCart));

      const savedName = localStorage.getItem('greesal_custom_name');
      if (savedName) setCustomName(savedName);

      const savedMobile = localStorage.getItem('greesal_custom_mobile');
      if (savedMobile) setCustomMobile(savedMobile);

      const savedAddress = localStorage.getItem('greesal_user_address');
      if (savedAddress) {
        setDeliveryAddress(savedAddress);
        setCartAddressInput(savedAddress);
      }
      const savedFlat = localStorage.getItem('greesal_flat_no');
      if (savedFlat) setFlatNo(savedFlat);
      const savedArea = localStorage.getItem('greesal_area_locality');
      if (savedArea) setAreaLocality(savedArea);
      const savedLandmark = localStorage.getItem('greesal_landmark');
      if (savedLandmark) setLandmark(savedLandmark);

      const savedFavs = JSON.parse(localStorage.getItem('greesal_favorites') || '[]');
      if (salad && savedFavs.includes(salad._id || salad.name)) {
        setIsFavorite(true);
      }
    } catch (e) { }
  }, [salad]);

  const toggleFavorite = () => {
    if (!salad) return;
    const saladId = salad._id || salad.name;
    try {
      const savedFavs = JSON.parse(localStorage.getItem('greesal_favorites') || '[]');
      let updated;
      if (savedFavs.includes(saladId)) {
        updated = savedFavs.filter((id: string) => id !== saladId);
        setIsFavorite(false);
      } else {
        updated = [...savedFavs, saladId];
        setIsFavorite(true);
      }
      localStorage.setItem('greesal_favorites', JSON.stringify(updated));
    } catch (e) { }
  };

  const saveCart = (newCart: CartItem[]) => {
    setCart(newCart);
    localStorage.setItem('greesal_cart', JSON.stringify(newCart));
  };

  const toggleAddOn = (addon: { name: string; price: number }) => {
    setSelectedAddOns((prev) => {
      const exists = prev.some((a) => a.name === addon.name);
      if (exists) {
        return prev.filter((a) => a.name !== addon.name);
      } else {
        return [...prev, addon];
      }
    });
  };

  const rawBasePrice = selectedPortion ? selectedPortion.price : (salad ? (parseInt(salad.price.replace(/[^\d]/g, '')) || 240) : 240);
  const addOnsTotal = selectedAddOns.reduce((sum, a) => sum + (a.price || 0), 0);
  const mainItemCalculatedPrice = rawBasePrice + addOnsTotal;
  const mainItemTotalPrice = mainItemCalculatedPrice * quantity;

  const addToCartWithQuantity = () => {
    if (!salad) return;
    const portionKey = `${selectedPortion.grams}g`;
    const addOnKey = selectedAddOns.map(a => a.name).sort().join('|');
    const removedKey = removedItems.sort().join('|');
    const itemId = `${salad._id || salad.name}_${portionKey}${addOnKey ? `_${addOnKey}` : ''}${removedKey ? `_no_${removedKey}` : ''}`;
    const existing = cart.find((i) => i.id === itemId);

    const nameSuffix = removedItems.length > 0 ? ` (Without: ${removedItems.join(', ')})` : '';

    let updatedCart: CartItem[];
    if (existing) {
      updatedCart = cart.map((i) =>
        i.id === itemId ? { ...i, quantity: i.quantity + quantity } : i
      );
    } else {
      updatedCart = [
        ...cart,
        {
          id: itemId,
          name: `${salad.name} (${selectedPortion.grams}g)${nameSuffix}`,
          price: `₹${mainItemCalculatedPrice}`,
          image: salad.image,
          quantity: quantity,
          selectedAddOns: selectedAddOns.length > 0 ? [...selectedAddOns] : undefined,
        }
      ];
    }
    saveCart(updatedCart);
    setIsAddedAnimation(true);
    setTimeout(() => setIsAddedAnimation(false), 1800);
    setIsCartOpen(true);
  };

  const updateCartQuantity = (id: string, delta: number) => {
    const updated = cart
      .map((item) => {
        if (item.id === id) {
          const newQty = item.quantity + delta;
          return newQty > 0 ? { ...item, quantity: newQty } : null;
        }
        return item;
      })
      .filter(Boolean) as CartItem[];
    saveCart(updated);
  };

  const removeFromCart = (id: string) => {
    const updated = cart.filter((item) => item.id !== id);
    saveCart(updated);
  };

  const getSubtotal = () => {
    return cart.reduce((total, item) => {
      const num = parseInt(String(item.price || 0).replace(/[^\d]/g, ''), 10) || 0;
      return total + num * (item.quantity || 1);
    }, 0);
  };

  const cartItemsCount = cart.reduce((count, item) => count + item.quantity, 0);

  const isAuthenticated = status === 'authenticated' || (customMobile && customMobile.length >= 10);
  const displayName = customName || session?.user?.name || (customMobile ? `Customer (${customMobile.slice(-4)})` : 'Guest');
  const userImage = session?.user?.image || null;
  const initialLetter = displayName.charAt(0).toUpperCase() || 'G';

  const handleGetCurrentLocation = async () => {
    setIsDetectingLocationInCart(true);
    setValidationError(null);
    try {
      if (typeof window !== 'undefined' && navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          async (pos) => {
            const lat = pos.coords.latitude;
            const lng = pos.coords.longitude;
            setLocationCoords({ lat, lng });
            const directMap = `https://maps.google.com/?q=${lat},${lng}`;
            setMapsUrl(directMap);

            try {
              const res = await fetch(`/api/location/reverse-geocode?lat=${lat}&lng=${lng}`);
              if (res.ok) {
                const data = await res.json();
                if (data.address) {
                  setDeliveryAddress(data.address);
                  setCartAddressInput(data.address);
                  setLocationSuccessMsg(`📍 GPS Location Verified (${lat.toFixed(4)}, ${lng.toFixed(4)})`);
                  localStorage.setItem('greesal_user_address', data.address);
                  setIsDetectingLocationInCart(false);
                  return;
                }
              }
            } catch (e) {}

            try {
              const loc = await getLiveDetailedLocation();
              if (loc.formattedAddress) {
                setDeliveryAddress(loc.formattedAddress);
                setCartAddressInput(loc.formattedAddress);
                setLocationSuccessMsg(`📍 GPS Location Verified (${lat.toFixed(4)}, ${lng.toFixed(4)})`);
                localStorage.setItem('greesal_user_address', loc.formattedAddress);
                setIsDetectingLocationInCart(false);
                return;
              }
            } catch (e) {}

            const fallbackAddr = `GPS Pin (${lat.toFixed(4)}, ${lng.toFixed(4)}), Surat, Gujarat`;
            setDeliveryAddress(fallbackAddr);
            setCartAddressInput(fallbackAddr);
            setLocationSuccessMsg(`📍 GPS Pinned (${lat.toFixed(4)}, ${lng.toFixed(4)})`);
            setIsDetectingLocationInCart(false);
          },
          (err) => {
            console.warn('Geolocation error:', err);
            setIsDetectingLocationInCart(false);
            setValidationError('⚠️ Location permission denied or unavailable. Please pick your location on Google Map or enter address manually.');
          },
          { enableHighAccuracy: true, timeout: 12000, maximumAge: 0 }
        );
      } else {
        setIsDetectingLocationInCart(false);
        setValidationError('⚠️ Geolocation not supported by your browser.');
      }
    } catch (err: any) {
      setIsDetectingLocationInCart(false);
      setValidationError(err.message || '⚠️ Could not detect live GPS.');
    }
  };

  const handleConfirmMapLocation = (locationData: { address: string; lat: number; lng: number; mapsUrl: string }) => {
    setDeliveryAddress(locationData.address);
    setCartAddressInput(locationData.address);
    setLocationCoords({ lat: locationData.lat, lng: locationData.lng });
    setMapsUrl(locationData.mapsUrl);
    setLocationSuccessMsg(`📍 Location selected from Google Map`);
    localStorage.setItem('greesal_user_address', locationData.address);
    setIsMapPickerOpen(false);
    if (validationError) setValidationError(null);
  };

  const executeOrder = async (userData?: { name: string; email: string; mobile: string }) => {
    if (cart.length === 0) return;
    setValidationError(null);

    const trimmedName = (userData?.name || customName || session?.user?.name || '').trim();
    const phoneRaw = (userData?.mobile || customMobile || '').replace(/\D/g, '');

    if (!trimmedName) {
      setValidationError('⚠️ Please enter your Full Name to place order.');
      return;
    }
    if (!phoneRaw || phoneRaw.length < 10) {
      setValidationError('⚠️ Please enter a valid 10-digit WhatsApp mobile number.');
      return;
    }

    // Address verification
    let finalDeliveryAddress = '';
    if (addressMode === 'manual') {
      if (!areaLocality.trim() && !deliveryAddress.trim()) {
        setValidationError('⚠️ Please select or enter your Area / Locality in Surat.');
        return;
      }
      const parts = [
        flatNo.trim(),
        areaLocality.trim() || deliveryAddress.trim(),
        landmark.trim() ? `Landmark: ${landmark.trim()}` : '',
        cityPincode.trim() || 'Surat'
      ].filter(Boolean);
      finalDeliveryAddress = parts.join(', ');
    } else {
      // google_map mode
      if (!deliveryAddress.trim()) {
        setValidationError('⚠️ Please click "Pick on Google Map" or "Use Live GPS" to set your delivery address.');
        return;
      }
      finalDeliveryAddress = flatNo.trim() ? `${flatNo.trim()}, ${deliveryAddress.trim()}` : deliveryAddress.trim();
    }

    const mapsLink = mapsUrl || (locationCoords
      ? `https://maps.google.com/?q=${locationCoords.lat},${locationCoords.lng}`
      : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(finalDeliveryAddress + ' Surat')}`);

    const slotLabels: Record<string, string> = {
      immediate: 'Immediate (30-45m)',
      lunch: 'Lunch (11:00 AM - 02:00 PM)',
      evening: 'Evening (04:00 PM - 07:00 PM)',
      pickup: 'Store PickUp (Katargam)'
    };

    const customerEmail = userData?.email || session?.user?.email || 'customer@greesal.in';
    const orderId = `GRS-${Math.floor(100000 + Math.random() * 900000)}`;
    const now = new Date();
    const timeString = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const orderPayload = {
      id: orderId,
      orderNumber: orderId,
      customerName: trimmedName,
      customerEmail,
      customerMobile: phoneRaw,
      date: `Today, ${timeString}`,
      timestamp: Date.now(),
      status: 'Placed' as const,
      items: [...cart],
      subtotal: getSubtotal(),
      deliveryFee: 0,
      total: getSubtotal(),
      deliveryAddress: finalDeliveryAddress,
      deliverySlot: slotLabels[deliverySlot] || 'Immediate (30-45m)',
      addressMode,
      manualAddressDetails: {
        flatNo: flatNo.trim(),
        areaLocality: areaLocality.trim(),
        landmark: landmark.trim(),
        cityPincode: cityPincode.trim()
      },
      mapsUrl: mapsLink,
      locationCoords,
      notes: deliveryNote.trim(),
      paymentMethod: 'Cash on Delivery / UPI on Delivery'
    };

    setIsSubmittingOrder(true);
    try {
      localStorage.setItem('greesal_custom_name', trimmedName);
      localStorage.setItem('greesal_custom_mobile', phoneRaw);
      localStorage.setItem('greesal_user_address', finalDeliveryAddress);
      if (flatNo.trim()) localStorage.setItem('greesal_flat_no', flatNo.trim());
      if (areaLocality.trim()) localStorage.setItem('greesal_area_locality', areaLocality.trim());
      if (landmark.trim()) localStorage.setItem('greesal_landmark', landmark.trim());

      const existingOrders = JSON.parse(localStorage.getItem('greesal_orders_history') || '[]');
      const updated = [orderPayload, ...existingOrders];
      localStorage.setItem('greesal_orders_history', JSON.stringify(updated));

      // Post to backend database
      await fetch('/api/admin/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderPayload)
      });
      await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderPayload)
      }).catch(() => {});
    } catch (e) {
      console.warn('Backend order save warning:', e);
    } finally {
      setIsSubmittingOrder(false);
    }

    setLatestPlacedOrder(orderPayload);
    saveCart([]);
    setIsCartOpen(false);
    setIsCheckoutSuccess(true);
    sendOrderToWhatsApp(orderPayload, '9925836117');
  };

  const handleProceedToCheckout = () => {
    if (cart.length === 0) return;
    executeOrder();
  };

  const handleLoginModalSuccess = (userData: { name: string; email: string; mobile: string }) => {
    setIsLoginModalOpen(false);
    if (userData.name) setCustomName(userData.name);
    if (userData.mobile) setCustomMobile(userData.mobile);
    setToastMessage(`Welcome back, ${userData.name || 'Customer'}! Logged in successfully.`);
    setTimeout(() => setToastMessage(null), 4000);

    if (cart.length > 0) {
      executeOrder(userData);
    } else {
      setIsProfileOpen(true);
    }
  };

  if (isLoadingSalads && !salad) {
    return (
      <div className="min-h-screen bg-[#FDFBF7] flex flex-col items-center justify-center p-6 text-center">
        <div className="w-16 h-16 rounded-full bg-[#123B2B]/10 flex items-center justify-center mb-4 text-[#123B2B]">
          <Loader2 className="w-8 h-8 animate-spin" />
        </div>
        <h2 className="text-xl font-black text-[#123B2B] mb-2 font-montserrat">Loading Fresh Salad Bowl...</h2>
        <p className="text-sm text-gray-500 mb-6">Fetching handcrafted ingredients and portions</p>
        <Link
          href="/salads"
          className="px-5 py-2.5 rounded-xl bg-[#123B2B] text-white text-xs font-bold hover:bg-[#1b4d39] transition-all"
        >
          &larr; Back to Salad Menu
        </Link>
      </div>
    );
  }

  if (!salad) {
    return (
      <div className="min-h-screen bg-[#FDFBF7] flex flex-col items-center justify-center p-6 text-center">
        <div className="w-16 h-16 rounded-full bg-amber-100 flex items-center justify-center mb-4 text-amber-700">
          <Utensils className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-black text-[#123B2B] mb-2 font-montserrat">Salad Bowl Not Found</h2>
        <p className="text-sm text-gray-500 mb-6">This bowl may have been updated or removed from the kitchen menu.</p>
        <Link
          href="/salads"
          className="px-5 py-2.5 rounded-xl bg-[#123B2B] text-white text-xs font-bold hover:bg-[#1b4d39] transition-all"
        >
          &larr; View Available Salads
        </Link>
      </div>
    );
  }

  const rawPrice = parseInt(salad.price.replace(/[^\d]/g, '')) || 299;
  const originalPrice = Math.round(rawPrice * 1.15);
  const discountAmount = originalPrice - rawPrice;
  const hasNutrition = !!salad.nutrition && Object.keys(salad.nutrition).length > 0;

  // Other related salads to explore
  const otherSalads = allSalads.filter((s) => (s.slug || slugify(s.name)) !== (salad.slug || slugify(salad.name))).slice(0, 3);

  return (
    <div className="relative min-h-screen bg-[#FDFBF7] font-sans selection:bg-[#123B2B] selection:text-white overflow-x-hidden flex flex-col justify-between">

      {/* Background Leaves */}
      <TopLeftLeafBranch className="top-0 left-0 opacity-15 pointer-events-none" />

      {/* Top Shop Timing & Admin Announcement Bar */}
      {showNotice && (
        <div className={`relative z-50 text-xs px-3 sm:px-8 py-2 transition-all shadow-xs ${noticeType === 'discount'
          ? 'bg-gradient-to-r from-amber-600 via-amber-700 to-amber-800 text-amber-50 border-b border-amber-500/40'
          : noticeType === 'alert'
            ? 'bg-gradient-to-r from-red-700 via-red-800 to-red-900 text-white border-b border-red-600/40'
            : noticeType === 'info'
              ? 'bg-gradient-to-r from-sky-700 via-sky-800 to-sky-900 text-white border-b border-sky-600/40'
              : 'bg-gradient-to-r from-[#081f17] via-[#123B2B] to-[#1C533A] text-emerald-100 border-b border-[#237357]/30'
          }`}>
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-1.5 sm:gap-4">
            <div className="flex items-center gap-2 text-center sm:text-left truncate font-medium">
              <span className="flex-shrink-0 text-sm">✨</span>
              <span className="truncate tracking-tight font-semibold">{notice}</span>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white/15 backdrop-blur-xs border border-white/20 text-[11px] font-bold">
                <span className={`w-2 h-2 rounded-full ${isOpen ? 'bg-emerald-400 animate-pulse' : 'bg-red-400'}`} />
                <span>
                  {isOpen
                    ? `Open: ${openingTime} – ${closingTime}`
                    : `Closed: Opens ${openingTime}`}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Sticky Navigation Header */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-[#EBE3D5] shadow-xs px-3.5 sm:px-8 py-3.5 sm:py-4.5 transition-all">

        <div className="max-w-7xl mx-auto flex items-center justify-between gap-3 sm:gap-4">

          <div className="flex items-center gap-3 sm:gap-6">
            <Link href="/" className="flex items-center group">
              <GreesalLogo size="lg" />
            </Link>

            <Link
              href="/#menu"
              className="hidden md:inline-flex items-center gap-1 text-xs font-bold text-[#123B2B] hover:text-[#C89D4B] transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Menu</span>
            </Link>

            {/* Live Store Online Hours Badge */}
            <div className="hidden lg:flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FAF6F0] border border-[#E8E1D5] text-[11px] font-extrabold text-[#123B2B]">
              <span className={`w-2 h-2 rounded-full ${isOpen ? 'bg-emerald-500 animate-pulse' : 'bg-red-500'}`} />
              <span>{isOpen ? `${openingTime} – ${closingTime}` : 'Currently Closed'}</span>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3.5">
            {/* Cart Button */}
            <button
              onClick={() => setIsCartOpen(true)}
              className="relative px-3 sm:px-3.5 py-1.5 sm:py-2 rounded-full bg-[#123B2B] hover:bg-[#174634] text-white flex items-center gap-1.5 sm:gap-2.5 shadow-md hover:shadow-lg transition-all duration-200 cursor-pointer group"
              title="View Cart & Checkout"
            >
              <ShoppingCart className="w-4 h-4 text-[#C89D4B] group-hover:scale-110 transition-transform" />
              <span className="text-xs font-bold hidden sm:inline">Cart</span>
              {cartItemsCount > 0 ? (
                <span className="bg-[#C89D4B] text-white font-black text-[10px] sm:text-[11px] px-1.5 sm:px-2 py-0.5 rounded-full shadow-xs">
                  {cartItemsCount} <span className="hidden sm:inline">{cartItemsCount === 1 ? 'item' : 'items'} •</span> ₹{getSubtotal()}
                </span>
              ) : (
                <span className="text-[10px] sm:text-[11px] text-emerald-200/80">Empty</span>
              )}
            </button>

            {/* Profile */}
            {isAuthenticated ? (
              <button
                type="button"
                onClick={() => setIsProfileOpen(true)}
                className="flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1.5 rounded-full bg-white hover:bg-[#FAF6F0] text-[#123B2B] border border-[#123B2B]/20 text-xs font-bold shadow-xs transition-all cursor-pointer group"
              >
                {userImage ? (
                  <img
                    src={userImage}
                    alt={displayName}
                    className="w-5 h-5 sm:w-6 sm:h-6 rounded-full object-cover border border-[#C89D4B]"
                  />
                ) : (
                  <span className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-[#123B2B] text-[#C89D4B] flex items-center justify-center font-black text-[10px] sm:text-[11px] flex-shrink-0">
                    {initialLetter}
                  </span>
                )}
                <span className="hidden sm:inline font-extrabold truncate max-w-[120px]">{displayName}</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setIsLoginModalOpen(true)}
                className="flex items-center gap-1.5 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full bg-[#FAF6F0] hover:bg-[#F3EDE2] text-[#123B2B] border border-[#E2DCD2] text-xs font-extrabold shadow-2xs transition-all cursor-pointer group"
              >
                <LogIn className="w-3.5 h-3.5 text-[#237357]" />
                <span>Sign In</span>
              </button>
            )}
          </div>

        </div>
      </header>

      {/* Main Content Body */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-5 sm:pt-8 pb-14 w-full text-left">

        {/* Breadcrumb Navigation */}
        <div className="flex items-center gap-2 text-xs font-semibold text-gray-500 mb-6">
          <Link href="/" className="hover:text-[#123B2B] transition-colors">Home</Link>
          <ChevronRight className="w-3.5 h-3.5 text-gray-400" />
          <Link href="/#menu" className="hover:text-[#123B2B] transition-colors">Menu</Link>
          <ChevronRight className="w-3.5 h-3.5 text-gray-400" />
          <span className="text-[#123B2B] font-bold truncate max-w-[200px] sm:max-w-none">{salad.name}</span>
        </div>

        {/* 2-Column Product Detail Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">

          {/* Left Column: Product Visuals, Ingredients & Dressing (7 Cols) */}
          <div className="lg:col-span-7 space-y-6">

            {/* Main Showcase Hero Image Card */}
            <div className="relative rounded-[32px] overflow-hidden bg-white border border-[#E8E1D5] shadow-lg">
              <div className="relative aspect-[4/3] sm:aspect-[16/11] w-full bg-[#FAF6F0] overflow-hidden">
                <img
                  src={salad.image}
                  alt={salad.name}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=800&q=80';
                  }}
                />

                {/* Top Badges */}
                <div className="absolute top-4 left-4 flex flex-col gap-2 z-10">
                  <span className="bg-[#123B2B]/95 backdrop-blur-md text-white text-xs font-black px-3.5 py-1.5 rounded-full uppercase tracking-wider shadow-md border border-white/20 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block shadow-xs"></span>
                    <span>{salad.tag || '100% Certified Organic'}</span>
                  </span>
                </div>

                {/* Wishlist Button */}
                <button
                  type="button"
                  onClick={toggleFavorite}
                  className={`absolute top-4 right-4 w-10 h-10 rounded-full backdrop-blur-md flex items-center justify-center transition-all shadow-md z-10 cursor-pointer ${isFavorite ? 'bg-red-50 text-red-500 scale-110' : 'bg-white/90 text-gray-400 hover:text-red-500 hover:bg-white'
                    }`}
                  title="Add to wishlist"
                >
                  <Heart className={`w-5 h-5 transition-colors ${isFavorite ? 'fill-red-500' : ''}`} />
                </button>

                {/* Live Macro Nutrition Overlay */}
                <div className="absolute bottom-4 left-4 right-4 bg-[#081F17]/85 backdrop-blur-md rounded-2xl p-3 sm:p-3.5 flex items-center justify-around text-white border border-white/15 shadow-xl">
                  <div className="flex items-center gap-1.5 text-xs sm:text-sm font-extrabold text-amber-300">
                    <Flame className="w-4 h-4 text-[#C89D4B]" />
                    <span>{salad.calories}</span>
                  </div>
                  <div className="h-4 w-px bg-white/20" />
                  <div className="flex items-center gap-1.5 text-xs sm:text-sm font-extrabold text-emerald-300">
                    <Activity className="w-4 h-4" />
                    <span>{salad.protein}</span>
                  </div>
                  <div className="h-4 w-px bg-white/20" />
                  <div className="flex items-center gap-1.5 text-xs sm:text-sm font-extrabold text-cyan-200">
                    <Leaf className="w-4 h-4" />
                    <span>{salad.nutrition?.fiber || '11g'} Fiber</span>
                  </div>
                </div>
              </div>

              {/* Freeze Dried Seal Callout */}
              <div className="p-4 sm:p-5 bg-gradient-to-r from-[#E8F3EE] to-[#FAF6F0] border-t border-[#E8E1D5] flex items-center gap-3.5">
                <ShieldCheck className="w-7 h-7 text-[#123B2B] flex-shrink-0" />
                <div>
                  <h4 className="font-extrabold text-xs sm:text-sm text-[#123B2B]">100% Freeze-Dried Nutrient Lock</h4>
                  <p className="text-xs text-gray-600 mt-0.5">Retains natural cellular vitamins, rich crunch, and authentic flavors without artificial preservatives.</p>
                </div>
              </div>
            </div>

            {/* 3-Part Architecture Container: Ingredients, Dressing, Crunch */}
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 px-1">
                <div>
                  <h3 className="text-sm font-black text-[#123B2B] tracking-wide uppercase flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-[#C89D4B]" />
                    <span>Crafted in 3 Fresh Parts</span>
                  </h3>
                  <p className="text-xs text-gray-500">
                    Handcrafted layers. Tap <strong className="text-red-700 bg-red-50 px-1 py-0.2 rounded border border-red-200">−</strong> on any item to remove it.
                  </p>
                </div>
                <div className="flex items-center gap-2 self-start sm:self-auto">
                  {removedItems.length > 0 && (
                    <button
                      type="button"
                      onClick={() => setRemovedItems([])}
                      className="text-xs font-bold text-red-700 hover:text-red-900 bg-red-50 hover:bg-red-100 border border-red-200 px-2.5 py-1 rounded-full transition-colors cursor-pointer"
                    >
                      Reset ({removedItems.length} removed)
                    </button>
                  )}
                  <span className="text-xs font-black text-[#237357] bg-[#E8F3EE] px-3 py-1 rounded-full border border-[#237357]/20">
                    100% Satvik Goodness
                  </span>
                </div>
              </div>

              {/* Part 1: Farm-Fresh Ingredients */}
              {getSaladIngredients(salad).length > 0 && (
                <div className="bg-white rounded-[26px] p-5 sm:p-6 border border-[#E8E1D5] shadow-xs space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="font-sans font-black text-base text-[#123B2B] flex items-center gap-2">
                      <span className="w-7 h-7 rounded-lg bg-[#E8F3EE] text-[#237357] flex items-center justify-center">
                        <Leaf className="w-4 h-4" />
                      </span>
                      <span>Part 1: Fresh Ingredients</span>
                      <span className="text-xs font-bold text-gray-500">({getSaladIngredients(salad).length})</span>
                    </h4>
                    <span className="text-[11px] font-bold text-[#237357] bg-[#E8F3EE] px-2.5 py-0.5 rounded-full">
                      Farm Harvested
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 font-medium">
                    Hydroponic crisp greens, sprouted organic legumes, crunchy garden veggies, and protein cubes.
                  </p>
                  <div className="flex flex-wrap gap-2 pt-1">
                    {getSaladIngredients(salad).map((ing, idx) => {
                      const isRemoved = removedItems.includes(ing);
                      return (
                        <span
                          key={idx}
                          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                            isRemoved
                              ? 'bg-red-50/80 border border-red-200 text-red-600 line-through opacity-70'
                              : 'bg-[#FAF6F0] border border-[#EBE2D3] text-[#123B2B] hover:border-[#123B2B]/40'
                          }`}
                        >
                          <Leaf className={`w-3 h-3 ${isRemoved ? 'text-red-400' : 'text-[#237357]'}`} />
                          <span>{ing}</span>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.preventDefault();
                              toggleRemoveItem(ing);
                            }}
                            className={`ml-1 w-4 h-4 rounded-full flex items-center justify-center text-xs font-black transition-all hover:scale-110 cursor-pointer ${
                              isRemoved
                                ? 'bg-emerald-600 text-white hover:bg-emerald-700 no-underline'
                                : 'bg-red-100 text-red-700 hover:bg-red-200'
                            }`}
                            title={isRemoved ? `Re-add ${ing}` : `Remove ${ing} using -`}
                            aria-label={isRemoved ? `Re-add ${ing}` : `Remove ${ing}`}
                          >
                            {isRemoved ? '+' : '−'}
                          </button>
                        </span>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Part 2: Handcrafted Dressing */}
              {getSaladDressing(salad).length > 0 && (
                <div className="bg-white rounded-[26px] p-5 sm:p-6 border border-[#E8E1D5] shadow-xs space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="font-sans font-black text-base text-[#123B2B] flex items-center gap-2">
                      <span className="w-7 h-7 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center">
                        <Utensils className="w-4 h-4" />
                      </span>
                      <span>Part 2: Handcrafted Dressing</span>
                      <span className="text-xs font-bold text-gray-500">({getSaladDressing(salad).length})</span>
                    </h4>
                    <span className="text-[11px] font-bold text-amber-800 bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-200">
                      Cold-Blended
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 font-medium">
                    Crafted daily in small batches with cold-pressed olive oil, herbs, lemon zing, and zero preservatives.
                  </p>
                  <div className="flex flex-wrap gap-2 pt-1">
                    {getSaladDressing(salad).map((item, idx) => {
                      const isRemoved = removedItems.includes(item);
                      return (
                        <span
                          key={idx}
                          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                            isRemoved
                              ? 'bg-red-50/80 border border-red-200 text-red-600 line-through opacity-70'
                              : 'bg-amber-50/60 border border-amber-200/70 text-amber-950 hover:border-amber-400'
                          }`}
                        >
                          <Sparkles className={`w-3 h-3 ${isRemoved ? 'text-red-400' : 'text-amber-600'}`} />
                          <span>{item}</span>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.preventDefault();
                              toggleRemoveItem(item);
                            }}
                            className={`ml-1 w-4 h-4 rounded-full flex items-center justify-center text-xs font-black transition-all hover:scale-110 cursor-pointer ${
                              isRemoved
                                ? 'bg-emerald-600 text-white hover:bg-emerald-700 no-underline'
                                : 'bg-red-100 text-red-700 hover:bg-red-200'
                            }`}
                            title={isRemoved ? `Re-add ${item}` : `Remove ${item} using -`}
                            aria-label={isRemoved ? `Re-add ${item}` : `Remove ${item}`}
                          >
                            {isRemoved ? '+' : '−'}
                          </button>
                        </span>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Part 3: Signature Crunch */}
              {getSaladCrunch(salad).length > 0 && (
                <div className="bg-white rounded-[26px] p-5 sm:p-6 border border-[#E8E1D5] shadow-xs space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="font-sans font-black text-base text-[#123B2B] flex items-center gap-2">
                      <span className="w-7 h-7 rounded-lg bg-stone-100 text-stone-700 flex items-center justify-center">
                        <Zap className="w-4 h-4 text-[#C89D4B]" />
                      </span>
                      <span>Part 3: Signature Crunch</span>
                      <span className="text-xs font-bold text-gray-500">({getSaladCrunch(salad).length})</span>
                    </h4>
                    <span className="text-[11px] font-bold text-stone-800 bg-stone-100 px-2.5 py-0.5 rounded-full border border-stone-200">
                      Slow Roasted
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 font-medium">
                    Toasted seeds, crunchy nuts, and crisp croutons that deliver maximum taste & satisfying crunch.
                  </p>
                  <div className="flex flex-wrap gap-2 pt-1">
                    {getSaladCrunch(salad).map((item, idx) => {
                      const isRemoved = removedItems.includes(item);
                      return (
                        <span
                          key={idx}
                          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                            isRemoved
                              ? 'bg-red-50/80 border border-red-200 text-red-600 line-through opacity-70'
                              : 'bg-[#FAF6F0] border border-[#EBE2D3] text-stone-900 hover:border-stone-400'
                          }`}
                        >
                          <span className="text-amber-600 text-xs font-black">✨</span>
                          <span>{item}</span>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.preventDefault();
                              toggleRemoveItem(item);
                            }}
                            className={`ml-1 w-4 h-4 rounded-full flex items-center justify-center text-xs font-black transition-all hover:scale-110 cursor-pointer ${
                              isRemoved
                                ? 'bg-emerald-600 text-white hover:bg-emerald-700 no-underline'
                                : 'bg-red-100 text-red-700 hover:bg-red-200'
                            }`}
                            title={isRemoved ? `Re-add ${item}` : `Remove ${item} using -`}
                            aria-label={isRemoved ? `Re-add ${item}` : `Remove ${item}`}
                          >
                            {isRemoved ? '+' : '−'}
                          </button>
                        </span>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

          </div>

          {/* Right Column: Pricing, Fast Order, Nutrition Facts & Health Benefits (5 Cols) */}
          <div className="lg:col-span-5 space-y-6">

            {/* Purchase & Pricing Card */}
            <div className="bg-white rounded-[32px] p-6 sm:p-8 border border-[#E8E1D5] shadow-md space-y-5">

              {/* Header Details */}
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1 bg-amber-50 border border-amber-200 px-2.5 py-0.5 rounded-full text-amber-800 text-[11px] font-black">
                    <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-500" />
                    <span>4.9 / 5.0 (Customer Reviews)</span>
                  </div>
                  <span className="text-xs text-emerald-700 font-bold bg-emerald-50 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                    <span>In Stock</span>
                  </span>
                </div>

                <h1 className="text-2xl sm:text-3xl md:text-[32px] font-black text-[#0C2A20] tracking-tight leading-snug">
                  {salad.name}
                </h1>
              </div>

              {/* Select Bowl Portion Weight in Grams */}
              <div className="space-y-2 pt-1">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-black uppercase tracking-wider text-[#123B2B] flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-[#C89D4B]" />
                    <span>Select Bowl Gram Weight</span>
                  </h3>
                  <span className="text-[11px] font-extrabold text-[#237357] bg-[#E8F3EE] px-2.5 py-0.5 rounded-full border border-[#237357]/20">
                    {selectedPortion.grams}g Selected (₹{selectedPortion.price})
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  {portions.map((portion) => {
                    const isSelected = selectedPortion.grams === portion.grams;
                    return (
                      <button
                        key={portion.grams}
                        type="button"
                        onClick={() => setSelectedPortion(portion)}
                        className={`p-3 rounded-2xl border text-center transition-all cursor-pointer flex flex-col items-center justify-center gap-1 ${
                          isSelected
                            ? 'bg-[#123B2B] text-white border-[#123B2B] shadow-md ring-2 ring-[#C89D4B]'
                            : 'bg-[#FAF6F0] hover:bg-white text-[#123B2B] border-[#E8E1D5]'
                        }`}
                      >
                        <span className={`text-xs font-black ${isSelected ? 'text-[#C89D4B]' : 'text-[#123B2B]'}`}>
                          {portion.grams}g
                        </span>
                        <span className={`text-xs font-extrabold ${isSelected ? 'text-white' : 'text-emerald-700'}`}>
                          ₹{portion.price}
                        </span>
                        {portion.label && (
                          <span className={`text-[10px] line-clamp-1 opacity-80 ${isSelected ? 'text-gray-200' : 'text-gray-500'}`}>
                            {portion.label.replace(`(${portion.grams}g)`, '').trim()}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Price Row */}
              <div className="p-4 rounded-2xl bg-[#FAF6F0] border border-[#EBE2D3] flex items-center justify-between">
                <div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-black text-[#123B2B] tracking-tight">₹{mainItemCalculatedPrice}</span>
                    <span className="text-sm text-gray-400 line-through font-bold">₹{Math.round(mainItemCalculatedPrice * 1.15)}</span>
                  </div>
                  <p className="text-[11px] text-emerald-700 font-extrabold uppercase tracking-wide mt-0.5">
                    {addOnsTotal > 0 ? `BASE ₹${rawBasePrice} + EXTRA ₹${addOnsTotal} ADD-ONS` : `SAVE ₹${Math.round(mainItemCalculatedPrice * 0.15)} • 100% ORGANIC BOWL`}
                  </p>
                </div>

                {/* Quantity Stepper */}
                <div className="flex items-center gap-2 bg-white rounded-xl border border-gray-300 p-1 shadow-2xs">
                  <button
                    type="button"
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    className="w-7 h-7 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold flex items-center justify-center transition-colors cursor-pointer"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <span className="text-sm font-black text-[#123B2B] w-6 text-center">{quantity}</span>
                  <button
                    type="button"
                    onClick={() => setQuantity((q) => q + 1)}
                    className="w-7 h-7 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold flex items-center justify-center transition-colors cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Extra Add-ons Customization Section */}
              {(() => {
                const availableAddOns = (salad.addOns && salad.addOns.length > 0) ? salad.addOns : DEFAULT_SALAD_ADDONS;
                if (!availableAddOns || availableAddOns.length === 0) return null;

                return (
                  <div className="space-y-2.5 pt-1">
                    <div className="flex items-center justify-between">
                      <h3 className="text-xs font-black uppercase tracking-wider text-[#123B2B] flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-[#C89D4B]" />
                        <span>Extra Add-on Options</span>
                      </h3>
                      {selectedAddOns.length > 0 && (
                        <span className="text-[10px] font-extrabold text-[#237357] bg-[#E8F3EE] px-2 py-0.5 rounded-full border border-[#237357]/20">
                          +{selectedAddOns.length} selected (+₹{addOnsTotal})
                        </span>
                      )}
                    </div>

                    <div className="space-y-1.5">
                      {availableAddOns.map((addon, aIdx) => {
                        const isSelected = selectedAddOns.some((a) => a.name === addon.name);
                        return (
                          <button
                            type="button"
                            key={aIdx}
                            onClick={() => toggleAddOn(addon)}
                            className={`w-full p-2.5 sm:p-3 rounded-2xl border text-left flex items-center justify-between transition-all duration-200 cursor-pointer ${isSelected
                              ? 'bg-[#E8F3EE] border-[#237357] shadow-xs ring-1 ring-[#237357]'
                              : 'bg-[#FAFAF8] border-[#E8E1D5] hover:border-[#123B2B]/40 hover:bg-white'
                              }`}
                          >
                            <div className="flex items-center gap-2.5 min-w-0">
                              <div className={`w-4.5 h-4.5 rounded-md flex items-center justify-center transition-colors flex-shrink-0 ${isSelected ? 'bg-[#123B2B] text-white' : 'border border-gray-300 bg-white text-transparent'
                                }`}>
                                <Check className="w-3 h-3 stroke-[3]" />
                              </div>
                              <span className="text-xs font-bold text-[#0C2A20] truncate">{addon.name}</span>
                            </div>
                            <span className="text-xs font-black text-[#123B2B] bg-white px-2 py-0.5 rounded-lg border border-[#E8E1D5] flex-shrink-0 ml-2">
                              +₹{addon.price}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })()}

              {/* Action Buttons */}
              <div className="space-y-3 pt-1">
                <button
                  type="button"
                  onClick={addToCartWithQuantity}
                  className={`w-full py-3.5 px-6 rounded-2xl font-sans font-black text-sm sm:text-base shadow-lg hover:shadow-xl transition-all duration-200 cursor-pointer flex items-center justify-center gap-2.5 active:scale-98 ${isAddedAnimation ? 'bg-emerald-600 text-white' : 'bg-[#123B2B] hover:bg-[#1C4D3A] text-white'
                    }`}
                >
                  {isAddedAnimation ? (
                    <>
                      <Check className="w-5 h-5 text-white stroke-[3]" />
                      <span>Added to Salad Cart!</span>
                    </>
                  ) : (
                    <>
                      <ShoppingBag className="w-5 h-5 text-[#C89D4B]" />
                      <span>Add to Salad Cart (₹{mainItemTotalPrice})</span>
                    </>
                  )}
                </button>

                <a
                  href={`https://wa.me/919925836117?text=Hi%20Greesal!%20I%20would%20like%20to%20order%20${quantity}x%20${encodeURIComponent(salad.name)}%20(${selectedPortion.grams}g)${selectedAddOns.length > 0 ? encodeURIComponent(` (with Add-ons: ${selectedAddOns.map(a => `${a.name} +₹${a.price}`).join(', ')})`) : ''}%20(Total:%20₹${mainItemTotalPrice}).`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-3 px-5 rounded-2xl bg-[#25D366] hover:bg-[#20BD5A] text-white font-black text-xs sm:text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-98"
                >
                  <MessageSquare className="w-4 h-4 fill-white" />
                  <span>Instant Order on WhatsApp (+91 99258 36117)</span>
                </a>
              </div>

              {/* 30-Min Delivery Promise Box */}
              <div className="p-3.5 rounded-2xl bg-[#E8F3EE] border border-[#237357]/20 flex items-start gap-3">
                <Truck className="w-5 h-5 text-[#237357] flex-shrink-0 mt-0.5" />
                <div className="text-xs text-[#144C38] leading-tight">
                  <strong className="font-extrabold block text-[#0C2A20]">30-Min Surat Express Delivery</strong>
                  <span className="text-[11px] text-gray-600">Freshly prepared upon order &amp; delivered cold-sealed to your doorstep in Surat.</span>
                </div>
              </div>

            </div>

            {/* Health Benefits Card */}
            {salad.healthBenefits && salad.healthBenefits.length > 0 && (
              <div className="bg-white rounded-[32px] p-6 sm:p-7 border border-[#E8E1D5] shadow-xs space-y-4">
                <h3 className="font-sans font-black text-lg text-[#123B2B] flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-[#C89D4B]" />
                  <span>Doctor &amp; Nutritionist Health Benefits</span>
                </h3>

                <ul className="space-y-3">
                  {salad.healthBenefits.map((benefit, idx) => {
                    const parts = benefit.split(':');
                    return (
                      <li key={idx} className="flex items-start gap-2.5 text-xs text-gray-700 leading-relaxed">
                        <CheckCircle className="w-4 h-4 text-[#237357] flex-shrink-0 mt-0.5" />
                        <div>
                          {parts.length > 1 ? (
                            <>
                              <strong className="font-black text-[#0C2A20]">{parts[0]}:</strong>
                              <span>{parts.slice(1).join(':')}</span>
                            </>
                          ) : (
                            <span>{benefit}</span>
                          )}
                        </div>
                      </li>
                    );
                  })}
                </ul>

                {/* Additional Highlights */}
                {salad.additionalBenefits && salad.additionalBenefits.length > 0 && (
                  <div className="pt-2 border-t border-gray-100 flex flex-wrap gap-2">
                    {salad.additionalBenefits.map((hl, idx) => (
                      <span key={idx} className="text-[11px] font-extrabold text-[#144C38] bg-[#E8F3EE] px-3 py-1 rounded-lg border border-[#237357]/20 flex items-center gap-1.5">
                        <Sparkles className="w-3 h-3 text-[#C89D4B]" />
                        <span>{hl}</span>
                      </span>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Official Nutrition Facts Panel */}
            <div className="border-[3px] border-black rounded-2xl p-5 bg-white font-sans text-black leading-tight select-none shadow-sm">
              <h3 className="font-black text-2xl tracking-tighter border-b-8 border-black pb-1 uppercase text-center">
                Nutrition Facts
              </h3>
              <div className="text-xs py-1.5 border-b-4 border-black font-semibold flex justify-between">
                <span>Serving Size</span>
                <span>1 Salad Bowl ({salad.name})</span>
              </div>

              <div className="font-extrabold text-sm py-1 border-b-2 border-black flex justify-between uppercase">
                <span>Amount Per Serving</span>
              </div>

              <div className="flex justify-between items-end border-b-8 border-black py-1">
                <span className="font-black text-2xl leading-none">Calories</span>
                <span className="font-black text-3xl leading-none">{salad.calories.replace(/\D/g, '')}</span>
              </div>

              <div className="text-right text-[10px] font-bold border-b border-black py-1 uppercase">
                % Daily Value*
              </div>

              {/* Nutrition Parameter Rows */}
              <div className="space-y-1 text-xs border-b-8 border-black pb-1">
                <div className="border-b border-gray-200 py-1 flex justify-between">
                  <span><strong className="font-bold">Protein</strong> {salad.protein}</span>
                  <span className="font-bold">
                    {Math.round(parseInt(salad.protein) * 2)}%
                  </span>
                </div>
                {hasNutrition && salad.nutrition ? (
                  <>
                    <div className="border-b border-gray-200 py-1 flex justify-between">
                      <span><strong className="font-bold">Total Carbohydrate</strong> {salad.nutrition.carbs || '0g'}</span>
                      <span className="font-bold">
                        {Math.round(parseInt(salad.nutrition.carbs || '0') * 0.3)}%
                      </span>
                    </div>
                    <div className="border-b border-gray-200 py-0.5 pl-3 flex justify-between text-gray-700">
                      <span>Dietary Fiber {salad.nutrition.fiber || '0g'}</span>
                      <span className="font-bold">
                        {Math.round(parseInt(salad.nutrition.fiber || '0') * 4.0)}%
                      </span>
                    </div>
                    <div className="border-b border-gray-200 py-0.5 pl-3 flex justify-between text-gray-700">
                      <span>Total Sugars {salad.nutrition.sugarTotal || '0g'}</span>
                      <span></span>
                    </div>
                    <div className="border-b border-gray-200 py-1 flex justify-between">
                      <span><strong className="font-bold">Total Fat</strong> {salad.nutrition.totalFat || '0g'}</span>
                      <span className="font-bold">
                        {Math.round(parseInt(salad.nutrition.totalFat || '0') * 1.5)}%
                      </span>
                    </div>
                    <div className="border-b border-gray-200 py-0.5 pl-3 flex justify-between text-gray-700">
                      <span>Saturated Fat {salad.nutrition.saturatedFat || '0g'}</span>
                      <span className="font-bold">
                        {Math.round(parseFloat(salad.nutrition.saturatedFat || '0') * 5.0)}%
                      </span>
                    </div>
                    <div className="border-b border-gray-200 py-1 flex justify-between">
                      <span><strong className="font-bold">Sodium</strong> {salad.nutrition.sodium || '0mg'}</span>
                      <span className="font-bold">
                        {Math.round(parseInt(salad.nutrition.sodium || '0') * 0.04)}%
                      </span>
                    </div>
                    <div className="border-b border-gray-200 py-1 flex justify-between">
                      <span><strong className="font-bold">Potassium</strong> {salad.nutrition.potassium || '0mg'}</span>
                      <span className="font-bold">
                        {Math.round(parseInt(salad.nutrition.potassium || '0') * 0.02)}%
                      </span>
                    </div>
                  </>
                ) : null}
              </div>

              {/* Vitamins & Minerals Grid */}
              {hasNutrition && salad.nutrition && (
                <div className="grid grid-cols-2 gap-x-4 pt-1.5 text-[10px] font-semibold text-gray-800">
                  <div className="border-b border-gray-200 py-0.5 flex justify-between">
                    <span>Vitamin A</span>
                    <span>{salad.nutrition.vitaminA || '0µg'}</span>
                  </div>
                  <div className="border-b border-gray-200 py-0.5 flex justify-between">
                    <span>Vitamin C</span>
                    <span>{salad.nutrition.vitaminC || '0mg'}</span>
                  </div>
                  <div className="border-b border-gray-200 py-0.5 flex justify-between">
                    <span>Calcium</span>
                    <span>{salad.nutrition.calcium || '0mg'}</span>
                  </div>
                  <div className="border-b border-gray-200 py-0.5 flex justify-between">
                    <span>Iron</span>
                    <span>{salad.nutrition.iron || '0mg'}</span>
                  </div>
                </div>
              )}

              <div className="text-[9px] text-gray-500 mt-2 text-left leading-normal">
                * The % Daily Value (DV) tells you how much a nutrient in a serving of food contributes to a daily diet. 2,000 calories a day is used for general nutrition advice.
              </div>
            </div>

          </div>

        </div>

        {/* Other Recommended Salads Carousel/Grid */}
        {otherSalads.length > 0 && (
          <div className="mt-16 pt-10 border-t border-[#E8E1D5]">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-xl sm:text-2xl font-black text-[#123B2B] tracking-tight">
                  Explore Other Farm-Fresh Bowls
                </h3>
                <p className="text-xs text-gray-500 mt-1">Handcrafted with clean organic nutrition in Surat</p>
              </div>

              <Link
                href="/#menu"
                className="text-xs font-bold text-[#C89D4B] hover:underline flex items-center gap-1"
              >
                <span>View All 7 Bowls</span>
                <span>&rarr;</span>
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {otherSalads.map((item) => {
                const sSlug = item.slug || slugify(item.name);
                return (
                  <Link
                    key={sSlug}
                    href={`/salads/${sSlug}`}
                    className="group bg-white rounded-[28px] p-4 border border-[#E8E1D5] shadow-xs hover:shadow-lg hover:-translate-y-1.5 transition-all duration-300 flex flex-col justify-between"
                  >
                    <div>
                      <div className="relative aspect-[16/11] rounded-2xl overflow-hidden bg-[#FAF6F0] mb-3">
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                        <div className="absolute top-2.5 left-2.5">
                          <span className="bg-[#123B2B]/90 text-white text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                            {item.tag}
                          </span>
                        </div>
                      </div>

                      <h4 className="font-sans font-black text-base text-[#123B2B] group-hover:text-[#237357] transition-colors line-clamp-1">
                        {item.name}
                      </h4>
                      <p className="text-xs text-gray-500 mt-1">{item.calories} • {item.protein}</p>
                    </div>

                    <div className="pt-3 mt-3 border-t border-gray-100 flex items-center justify-between">
                      <span className="text-lg font-black text-[#123B2B]">{item.price}</span>
                      <span className="text-xs font-bold text-[#C89D4B] group-hover:underline flex items-center gap-1">
                        <span>View Bowl</span>
                        <span>&rarr;</span>
                      </span>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        )}

      </main>

      {/* Comprehensive Professional Brand Footer */}
      <footer className="relative overflow-hidden bg-[#6ac6ac] text-[#0c2a20] pt-10 sm:pt-12 pb-20 md:pb-8 z-10 border-t border-[#4fa88f] shadow-[0_-10px_30px_rgba(0,0,0,0.06)] font-dmsans">
        {/* Decorative ambient background glows */}
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-white/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-[#0c2a20]/10 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">

          {/* Top Value Banner inside Footer */}
          <div className="relative overflow-hidden bg-[#0c2a20] rounded-2xl sm:rounded-3xl p-5 sm:p-6 md:p-7 border border-[#144c38] shadow-xl mb-8 sm:mb-10">
            <div className="absolute -top-12 -right-12 w-36 h-36 bg-[#6ac6ac]/15 rounded-full blur-2xl pointer-events-none" />
            <div className="flex flex-col lg:flex-row items-center justify-between gap-5 text-center lg:text-left relative z-10">
              <div className="space-y-1.5 max-w-2xl">
                <span className="inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-[#fbce45] bg-[#fbce45]/10 px-2.5 py-0.5 rounded-full border border-[#fbce45]/30">
                  <Leaf className="w-3 h-3 text-[#fbce45]" />
                  <span>DAILY FARM-TO-BOWL PROMISE</span>
                </span>
                <h3 className="text-lg sm:text-xl font-black text-white tracking-tight">
                  Craving clean, delicious organic nutrition
                </h3>
                <p className="text-xs text-[#a5ded0] font-medium">
                  Freshly prepared within 15 minutes of ordering and delivered in sealed eco-friendly packaging across Surat in 30 mins.
                </p>
              </div>

              <div className="flex flex-wrap items-center justify-center gap-3 flex-shrink-0">
                <a
                  href="https://wa.me/919925836117?text=Hi%20Greesal!%20I%20would%20like%20to%20order%20fresh%20organic%20salads."
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 sm:px-5 py-2.5 rounded-xl bg-[#25D366] hover:bg-[#20BD5A] text-white font-black text-xs shadow-md hover:shadow-lg transition-all flex items-center gap-2 cursor-pointer active:scale-95"
                >
                  <MessageSquare className="w-4 h-4 fill-white" />
                  <span>Order via WhatsApp (+91 99258 36117)</span>
                </a>
                <Link
                  href="/salads"
                  className="px-4 sm:px-5 py-2.5 rounded-xl bg-[#fbce45] hover:bg-[#eab92d] text-[#081F17] font-black text-xs shadow-md transition-all cursor-pointer active:scale-95"
                >
                  Browse Menu
                </Link>
              </div>
            </div>
          </div>

          {/* 4-Column Main Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-8 lg:gap-8 text-left pb-8 sm:pb-10 border-b border-[#0c2a20]/15">

            {/* Column 1: Brand & Mission */}
            <div className="lg:col-span-4 space-y-3.5">
              <div className="flex items-center gap-3">
                <div className="bg-white/95 px-3 py-1.5 rounded-xl inline-block shadow-sm border border-white/60">
                  <GreesalLogo size="sm" />
                </div>
              </div>

              <p className="text-xs text-[#0c2a20]/85 leading-relaxed font-medium">
                Greesal (Slice of Green) crafts nutrient-dense, 100% organic gourmet salad bowls. We source crisp hydroponic greens daily, paired with high-protein plant grains and cold-blended artisan gravies.
              </p>

              <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
                <span className="text-[10px] font-bold bg-[#0c2a20] px-2.5 py-1 rounded-lg text-emerald-200 flex items-center gap-1.5 shadow-xs">
                  <Leaf className="w-3 h-3 text-[#6ac6ac]" />
                  <span>100% Hydroponic</span>
                </span>
                <span className="text-[10px] font-bold bg-[#0c2a20] px-2.5 py-1 rounded-lg text-emerald-200 flex items-center gap-1.5 shadow-xs">
                  <ShieldCheck className="w-3 h-3 text-[#6ac6ac]" />
                  <span>Freeze-Dried Lock</span>
                </span>
                <span className="text-[10px] font-bold bg-[#0c2a20] px-2.5 py-1 rounded-lg text-emerald-200 flex items-center gap-1.5 shadow-xs">
                  <Truck className="w-3 h-3 text-[#6ac6ac]" />
                  <span>30-Min Surat Express</span>
                </span>
              </div>
            </div>

            {/* Column 2: Popular Salad Bowls */}
            <div className="lg:col-span-3 space-y-3">
              <h4 className="text-xs font-black uppercase tracking-widest text-[#0c2a20] flex items-center gap-1.5">
                <Utensils className="w-3.5 h-3.5 text-[#0c2a20]" />
                <span>Popular Salad Bowls</span>
              </h4>
              <ul className="space-y-2 text-xs font-medium text-[#0c2a20]/85">
                {(allSalads.length > 0 ? allSalads : []).slice(0, 4).map((s) => (
                  <li key={s.slug}>
                    <Link
                      href={`/salads/${s.slug}`}
                      className="hover:text-black hover:font-bold transition-all flex items-center gap-1.5 cursor-pointer text-left group"
                    >
                      <span className="text-[#0c2a20] font-bold group-hover:translate-x-0.5 transition-transform">›</span>
                      <span>{s.name}</span>
                    </Link>
                  </li>
                ))}
                <li>
                  <Link href="/salads" className="text-[#0c2a20] font-extrabold hover:underline flex items-center gap-1 pt-0.5 text-xs">
                    <span>View All Salad Bowls</span>
                    <span>&rarr;</span>
                  </Link>
                </li>
              </ul>
            </div>

            {/* Column 3: Surat Delivery Areas */}
            <div className="lg:col-span-3 space-y-3">
              <h4 className="text-xs font-black uppercase tracking-widest text-[#0c2a20] flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-[#0c2a20]" /> Surat Delivery Hubs
              </h4>
              <div className="space-y-2 text-xs text-[#0c2a20]/85 font-medium">
                <div className="flex items-start gap-2">
                  <MapPin className="w-3.5 h-3.5 text-[#0c2a20] flex-shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-[#0c2a20] font-bold block text-xs">Central Organic Kitchen:</strong>
                    <span className="text-[#0c2a20]/75 text-[11px]">Katargam, Surat - 395004</span>
                  </div>
                </div>

                <div className="flex items-start gap-2">
                  <Clock className="w-3.5 h-3.5 text-[#0c2a20] flex-shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-[#0c2a20] font-bold block text-xs">Operating Hours:</strong>
                    <span className="text-[#0c2a20]/75 text-[11px]">Mon – Sun: 8:00 AM – 10:30 PM</span>
                  </div>
                </div>

                <div className="p-2.5 rounded-xl bg-white/70 border border-[#0c2a20]/15 text-[11px] text-[#0c2a20] leading-snug">
                  <strong className="text-[#0c2a20] block mb-0.5 font-bold">Active Zones:</strong>
                  Katargam, Adajan, Vesu, Pal, City Light, Piplod, Varachha, Althan.
                </div>
              </div>
            </div>

            {/* Column 4: Contact & Food Safety */}
            <div className="lg:col-span-2 space-y-3">
              <h4 className="text-xs font-black uppercase tracking-widest text-[#0c2a20] flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-[#0c2a20]" /> Contact &amp; Safety
              </h4>

              <div className="space-y-2 text-xs text-[#0c2a20]/85 font-medium">
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-md bg-[#0c2a20] flex items-center justify-center">
                    <Phone className="w-3 h-3 text-[#fbce45]" />
                  </span>
                  <a href="tel:+919925836117" className="hover:underline font-bold text-[#0c2a20]">+91 99258 36117</a>
                </div>

                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-md bg-[#0c2a20] flex items-center justify-center">
                    <Globe className="w-3 h-3 text-[#fbce45]" />
                  </span>
                  <a href="https://www.greesal.in" target="_blank" rel="noopener noreferrer" className="hover:underline font-bold text-[#0c2a20]">www.greesal.in</a>
                </div>
              </div>

              <div className="p-2.5 rounded-xl bg-[#0c2a20] text-center space-y-0.5 shadow-md text-white">
                <div className="text-[10px] font-black uppercase tracking-wider text-[#fbce45] flex items-center justify-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-[#6ac6ac]" />
                  <span>fssai Registered</span>
                </div>
                <div className="text-[11px] font-black text-white">
                  LIC NO. 123456789412
                </div>
                <p className="text-[9px] text-[#a5ded0]">Govt. Certified Clean Food Safety</p>
              </div>
            </div>

          </div>

          {/* Bottom Legal Sub-Footer */}
          <div className="pt-6 flex flex-col md:flex-row items-center justify-between gap-3 text-xs text-[#0c2a20]/80 font-medium text-center md:text-left">
            <div>
              <p>© {new Date().getFullYear()} <strong className="text-[#0c2a20]">Greesal Organic Kitchen</strong>. All rights reserved.</p>
              <p className="text-[10px] text-[#0c2a20]/60 mt-0.5">Handcrafted with passion in Surat, Gujarat.</p>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-3 text-xs font-semibold">
              <Link href="/admin" className="hover:text-black transition-colors">
                Admin Portal
              </Link>
              <span className="text-[#0c2a20]/40">•</span>
              <a href="https://wa.me/919925836117" target="_blank" rel="noopener noreferrer" className="hover:text-black transition-colors">
                Support
              </a>
            </div>
          </div>

        </div>
      </footer>

      {/* Shopping Cart Drawer */}
      {isCartOpen && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div
            onClick={() => setIsCartOpen(false)}
            className="fixed inset-0 bg-black/40 backdrop-blur-xs transition-opacity duration-300"
          />

          <div className="relative w-full max-w-md bg-white h-full shadow-2xl z-10 flex flex-col border-l border-[#E8E1D5] animate-in slide-in-from-right duration-200 text-left">
            <div className="p-5 border-b border-[#E8E1D5] flex items-center justify-between bg-[#FAF6F0]">
              <div className="flex items-center gap-2 text-[#123B2B] font-extrabold text-lg">
                <ShoppingCart className="w-5 h-5 text-[#C89D4B]" />
                <span>Your Salad Cart</span>
                <span className="text-xs bg-[#123B2B] text-white px-2 py-0.5 rounded-full font-bold ml-1">
                  {cartItemsCount}
                </span>
              </div>
              <button
                onClick={() => setIsCartOpen(false)}
                className="p-1.5 rounded-full hover:bg-gray-100 text-gray-500 hover:text-black transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-5 space-y-4">
              {cart.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center text-gray-400 space-y-3">
                  <ShoppingBag className="w-12 h-12 text-[#123B2B]/30 mx-auto stroke-[1.5]" />
                  <div>
                    <h4 className="font-bold text-[#123B2B] text-base">Your cart is empty</h4>
                    <p className="text-xs text-gray-500 mt-1">Explore our fresh salads and fuel your day!</p>
                  </div>
                  <button
                    onClick={() => setIsCartOpen(false)}
                    className="px-5 py-2.5 rounded-xl bg-[#123B2B] text-white text-xs font-bold shadow-sm cursor-pointer"
                  >
                    Browse Salads
                  </button>
                </div>
              ) : (
                cart.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center gap-3.5 p-3.5 rounded-2xl border border-[#E8E1D5] bg-[#FAFBF9] shadow-2xs"
                  >
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-16 h-16 object-cover rounded-xl border border-[#E8E1D5] flex-shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <h4 className="font-bold text-[#123B2B] text-sm leading-tight truncate">{item.name}</h4>
                      {item.selectedAddOns && item.selectedAddOns.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-1">
                          {item.selectedAddOns.map((addon, aIdx) => (
                            <span key={aIdx} className="text-[10px] font-semibold bg-[#E8F3EE] text-[#144C38] px-1.5 py-0.5 rounded border border-[#237357]/20">
                              + {addon.name} (+₹{addon.price})
                            </span>
                          ))}
                        </div>
                      )}
                      <p className="text-xs text-emerald-700 font-extrabold mt-1">{item.price}</p>

                      <div className="flex items-center gap-2.5 mt-2">
                        <button
                          onClick={() => updateCartQuantity(item.id, -1)}
                          className="w-6 h-6 rounded-lg border border-gray-300 flex items-center justify-center text-gray-700 hover:bg-red-50 hover:text-red-600 transition-colors cursor-pointer"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <span className="text-xs font-bold text-gray-900 w-4 text-center">{item.quantity}</span>
                        <button
                          onClick={() => updateCartQuantity(item.id, 1)}
                          className="w-6 h-6 rounded-lg border border-gray-300 flex items-center justify-center text-gray-700 hover:bg-emerald-50 hover:text-emerald-700 transition-colors cursor-pointer"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    <button
                      onClick={() => removeFromCart(item.id)}
                      className="p-1.5 rounded-xl border border-red-100 hover:bg-red-50 text-red-500 hover:text-red-700 transition-colors cursor-pointer"
                      title="Remove Item"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))
              )}

              {cart.length > 0 && (
                <div className="space-y-4 pt-3 border-t border-[#E8E1D5]">
                  {/* 1. Delivery Slot Selection */}
                  <div className="space-y-1.5">
                    <label className="block text-[11px] font-extrabold uppercase tracking-wider text-[#123B2B]">
                      ⏰ Delivery Slot in Surat
                    </label>
                    <div className="grid grid-cols-4 gap-1.5">
                      {[
                        { id: 'immediate', label: 'Express', time: '30-45 min' },
                        { id: 'lunch', label: 'Lunch', time: '11am-2pm' },
                        { id: 'evening', label: 'Dinner', time: '4pm-7pm' },
                        { id: 'pickup', label: 'PickUp', time: 'Katargam' },
                      ].map((s) => (
                        <button
                          key={s.id}
                          type="button"
                          onClick={() => setDeliverySlot(s.id as any)}
                          className={`py-2 px-1 rounded-xl border text-center transition-all cursor-pointer ${
                            deliverySlot === s.id
                              ? 'border-[#123B2B] bg-[#123B2B] text-white shadow-2xs font-bold'
                              : 'border-gray-200 bg-[#FAF6F0] text-gray-700 hover:bg-gray-100'
                          }`}
                        >
                          <div className="text-[11px] font-bold leading-tight">{s.label}</div>
                          <div className="text-[9px] opacity-75 mt-0.5 leading-tight">{s.time}</div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* 2. Customer Fast Checkout Card */}
                  <div className="p-3.5 rounded-2xl bg-[#FAF6F0] border border-[#E8E1D5] space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-black uppercase text-[#123B2B] tracking-wide flex items-center gap-1.5">
                        <User className="w-3.5 h-3.5 text-[#C89D4B]" />
                        <span>Customer Information</span>
                      </span>
                      <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full">
                        Instant Order
                      </span>
                    </div>

                    {validationError && (
                      <div className="p-2.5 rounded-xl bg-red-50 border border-red-300 text-red-700 text-xs font-bold animate-pulse">
                        {validationError}
                      </div>
                    )}

                    <div className="space-y-2">
                      <div>
                        <label className="block text-[10px] font-bold text-gray-600 mb-1">
                          Full Name <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          placeholder="e.g. Sanket Patel"
                          value={customName || ''}
                          onChange={(e) => {
                            setCustomName(e.target.value);
                            if (validationError) setValidationError(null);
                          }}
                          className="w-full px-3 py-2 rounded-xl border border-gray-300 bg-white text-xs text-greesal-dark focus:outline-none focus:border-[#123B2B]"
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold text-gray-600 mb-1">
                          WhatsApp Mobile <span className="text-red-500">* (10 digits)</span>
                        </label>
                        <input
                          type="tel"
                          maxLength={10}
                          placeholder="e.g. 9825112345"
                          value={customMobile || ''}
                          onChange={(e) => {
                            setCustomMobile(e.target.value);
                            if (validationError) setValidationError(null);
                          }}
                          className="w-full px-3 py-2 rounded-xl border border-gray-300 bg-white text-xs text-greesal-dark focus:outline-none focus:border-[#123B2B]"
                        />
                      </div>
                    </div>
                  </div>

                  {/* 3. Delivery Address Section with Google Map & Manual Tabs */}
                  <div className="p-3.5 rounded-2xl bg-[#FAF6F0] border border-[#E8E1D5] space-y-3">
                    <div className="flex items-center justify-between">
                      <label className="block text-[11px] font-black uppercase text-[#123B2B] tracking-wide flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-emerald-700" />
                        <span>Delivery Address in Surat <span className="text-red-500">*</span></span>
                      </label>
                      <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full">
                        Doorstep Delivery
                      </span>
                    </div>

                    {/* Mode Switcher Tabs */}
                    <div className="grid grid-cols-2 p-1 rounded-xl bg-gray-200/70 border border-gray-300">
                      <button
                        type="button"
                        onClick={() => {
                          setAddressMode('google_map');
                          if (validationError) setValidationError(null);
                        }}
                        className={`py-1.5 px-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                          addressMode === 'google_map'
                            ? 'bg-[#123B2B] text-white shadow-xs'
                            : 'text-gray-600 hover:text-gray-900'
                        }`}
                      >
                        <MapPin className="w-3.5 h-3.5" />
                        <span>📍 Google Map / GPS</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setAddressMode('manual');
                          if (validationError) setValidationError(null);
                        }}
                        className={`py-1.5 px-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                          addressMode === 'manual'
                            ? 'bg-[#123B2B] text-white shadow-xs'
                            : 'text-gray-600 hover:text-gray-900'
                        }`}
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                        <span>✍️ Manual Address</span>
                      </button>
                    </div>

                    {/* Tab 1: Google Map / GPS Mode */}
                    {addressMode === 'google_map' ? (
                      <div className="space-y-2.5">
                        <div className="grid grid-cols-2 gap-2">
                          <button
                            type="button"
                            onClick={() => setIsMapPickerOpen(true)}
                            className="py-2.5 px-3 rounded-xl bg-amber-100/70 hover:bg-amber-100 text-amber-950 border border-amber-300 text-xs font-bold transition-all flex items-center justify-center gap-1.5 shadow-2xs active:scale-95 cursor-pointer"
                          >
                            <MapPin className="w-4 h-4 text-amber-800" />
                            <span>Pick on Google Map</span>
                          </button>

                          <button
                            type="button"
                            onClick={handleGetCurrentLocation}
                            disabled={isDetectingLocationInCart}
                            className="py-2.5 px-3 rounded-xl bg-emerald-100/70 hover:bg-emerald-100 text-emerald-950 border border-emerald-300 text-xs font-bold transition-all flex items-center justify-center gap-1.5 shadow-2xs active:scale-95 cursor-pointer disabled:opacity-60"
                          >
                            {isDetectingLocationInCart ? (
                              <>
                                <Loader2 className="w-4 h-4 animate-spin text-emerald-700" />
                                <span>Detecting GPS...</span>
                              </>
                            ) : (
                              <>
                                <Navigation className="w-4 h-4 text-emerald-700" />
                                <span>Use Live GPS</span>
                              </>
                            )}
                          </button>
                        </div>

                        {locationSuccessMsg && (
                          <div className="p-2 rounded-xl bg-emerald-50 border border-emerald-200 text-[11px] font-bold text-emerald-800 flex items-center justify-between">
                            <div className="flex items-center gap-1.5 truncate">
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                              <span className="truncate">{locationSuccessMsg}</span>
                            </div>
                            {mapsUrl && (
                              <a
                                href={mapsUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="text-[10px] text-emerald-900 underline flex items-center gap-0.5 ml-1 flex-shrink-0"
                              >
                                <span>View</span>
                                <ExternalLink className="w-2.5 h-2.5" />
                              </a>
                            )}
                          </div>
                        )}

                        {/* Current Detected Address Textarea */}
                        <div>
                          <label className="block text-[10px] font-bold text-gray-500 mb-1">
                            Pinned Delivery Address
                          </label>
                          <textarea
                            rows={2}
                            value={deliveryAddress}
                            onChange={(e) => {
                              setDeliveryAddress(e.target.value);
                              if (validationError) setValidationError(null);
                            }}
                            placeholder="Address will be auto-filled by Google Map or GPS..."
                            className="w-full px-3 py-2 rounded-xl border border-gray-300 bg-white text-xs text-greesal-dark focus:outline-none focus:border-[#123B2B] resize-none"
                          />
                        </div>

                        {/* Flat / House No / Floor */}
                        <div>
                          <label className="block text-[10px] font-bold text-gray-600 mb-1">
                            Flat / House No. / Building Floor <span className="text-gray-400 font-normal">(Optional)</span>
                          </label>
                          <input
                            type="text"
                            placeholder="e.g. Flat 402, Block B, Someshwara Enclave"
                            value={flatNo}
                            onChange={(e) => setFlatNo(e.target.value)}
                            className="w-full px-3 py-2 rounded-xl border border-gray-300 bg-white text-xs text-greesal-dark focus:outline-none focus:border-[#123B2B]"
                          />
                        </div>
                      </div>
                    ) : (
                      /* Tab 2: Manual Structured Address Mode */
                      <div className="space-y-2.5">
                        <div>
                          <label className="block text-[10px] font-bold text-gray-600 mb-1">
                            Flat / House No. / Building <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            placeholder="e.g. Flat 301, Silver Leaf Apartments"
                            value={flatNo}
                            onChange={(e) => {
                              setFlatNo(e.target.value);
                              if (validationError) setValidationError(null);
                            }}
                            className="w-full px-3 py-2 rounded-xl border border-gray-300 bg-white text-xs text-greesal-dark focus:outline-none focus:border-[#123B2B]"
                          />
                        </div>

                        <div>
                          <label className="block text-[10px] font-bold text-gray-600 mb-1">
                            Street / Area / Locality <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            placeholder="e.g. VIP Road, Vesu"
                            value={areaLocality}
                            onChange={(e) => {
                              setAreaLocality(e.target.value);
                              if (validationError) setValidationError(null);
                            }}
                            className="w-full px-3 py-2 rounded-xl border border-gray-300 bg-white text-xs text-greesal-dark focus:outline-none focus:border-[#123B2B]"
                          />
                        </div>

                        {/* Quick Surat Locality Selector Pills */}
                        <div>
                          <label className="block text-[10px] font-bold text-gray-500 mb-1.5">
                            Quick Select Surat Area:
                          </label>
                          <div className="flex flex-wrap gap-1.5">
                            {['Vesu', 'Adajan', 'Pal', 'Piplod', 'City Light', 'Althan', 'Varachha', 'Katargam'].map((loc) => (
                              <button
                                key={loc}
                                type="button"
                                onClick={() => {
                                  setAreaLocality(loc + ', Surat');
                                  if (validationError) setValidationError(null);
                                }}
                                className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all cursor-pointer ${
                                  areaLocality.includes(loc)
                                    ? 'bg-[#123B2B] text-white shadow-2xs'
                                    : 'bg-white text-gray-700 border border-gray-300 hover:border-[#123B2B]'
                                }`}
                              >
                                + {loc}
                              </button>
                            ))}
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className="block text-[10px] font-bold text-gray-600 mb-1">
                              Landmark
                            </label>
                            <input
                              type="text"
                              placeholder="e.g. Opp. Star Bazaar"
                              value={landmark}
                              onChange={(e) => setLandmark(e.target.value)}
                              className="w-full px-3 py-2 rounded-xl border border-gray-300 bg-white text-xs text-greesal-dark focus:outline-none focus:border-[#123B2B]"
                            />
                          </div>
                          <div>
                            <label className="block text-[10px] font-bold text-gray-600 mb-1">
                              City &amp; Pincode
                            </label>
                            <input
                              type="text"
                              value={cityPincode}
                              onChange={(e) => setCityPincode(e.target.value)}
                              className="w-full px-3 py-2 rounded-xl border border-gray-300 bg-white text-xs text-greesal-dark focus:outline-none focus:border-[#123B2B]"
                            />
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Special Kitchen Notes */}
                    <div>
                      <label className="block text-[10px] font-bold text-gray-600 mb-1">
                        Delivery / Kitchen Instructions <span className="text-gray-400 font-normal">(Optional)</span>
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Please ring the doorbell twice, less dressing..."
                        value={deliveryNote}
                        onChange={(e) => setDeliveryNote(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-gray-300 bg-white text-xs text-greesal-dark focus:outline-none focus:border-[#123B2B]"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {cart.length > 0 && (
              <div className="p-5 border-t border-[#E8E1D5] bg-[#FAF6F0] space-y-4">
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between text-gray-600 font-medium">
                    <span>Subtotal</span>
                    <span className="font-bold text-gray-900">₹{getSubtotal()}</span>
                  </div>
                  <div className="flex justify-between text-emerald-700 font-bold">
                    <span>Express Surat Delivery</span>
                    <span>FREE</span>
                  </div>
                  <div className="border-t border-[#E8E1D5] pt-2 flex justify-between text-base font-extrabold text-[#123B2B]">
                    <span>Total Amount</span>
                    <span>₹{getSubtotal()}</span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleProceedToCheckout}
                  disabled={isSubmittingOrder}
                  className="w-full py-3.5 rounded-2xl bg-[#123B2B] hover:bg-[#1C4D3A] text-white font-extrabold text-sm shadow-md hover:shadow-lg transition-all cursor-pointer flex items-center justify-center gap-2 active:scale-98 disabled:opacity-50"
                >
                  {isSubmittingOrder ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin text-[#C89D4B]" />
                      <span>Placing Your Order...</span>
                    </>
                  ) : (
                    <>
                      <ShoppingBag className="w-4 h-4 text-[#C89D4B]" />
                      <span>Place Order (₹{getSubtotal()})</span>
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Checkout Success Modal */}
      {isCheckoutSuccess && latestPlacedOrder && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full text-center space-y-4 shadow-2xl border border-[#E8E1D5] animate-in zoom-in-95 duration-200">
            <div className="w-16 h-16 bg-[#E8F3EE] text-[#123B2B] rounded-full flex items-center justify-center mx-auto text-2xl shadow-inner">
              <CheckCircle className="w-10 h-10 text-emerald-600" />
            </div>
            <h3 className="font-black text-2xl text-[#123B2B]">Order Placed Successfully!</h3>
            <p className="text-xs text-gray-600 leading-relaxed">
              Thank you, <strong>{latestPlacedOrder.customerName}</strong>! Your order <strong>#{latestPlacedOrder.orderNumber}</strong> has been sent to our central kitchen.
            </p>

            <div className="p-3 bg-[#FAF6F0] rounded-2xl text-xs space-y-1 text-left border border-[#E8E1D5]">
              <div className="flex justify-between text-gray-600">
                <span>Amount Paid (COD/UPI):</span>
                <span className="font-bold text-[#123B2B]">₹{latestPlacedOrder.total}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Estimated Delivery:</span>
                <span className="font-bold text-emerald-700">30 Mins (Surat Express)</span>
              </div>
            </div>

            <div className="space-y-2 pt-2">
              <button
                onClick={() => setIsInvoiceOpen(true)}
                className="w-full py-2.5 rounded-xl bg-[#FAF6F0] hover:bg-[#F3EDE2] text-[#123B2B] border border-[#EBE2D3] text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow-2xs"
              >
                <span>Download Tax Invoice &amp; Bill</span>
              </button>

              <button
                onClick={() => {
                  setIsCheckoutSuccess(false);
                  setLatestPlacedOrder(null);
                }}
                className="w-full py-2.5 rounded-xl bg-[#123B2B] text-white text-xs font-bold transition-all cursor-pointer hover:bg-[#1C4D3A]"
              >
                Back to Salads Menu
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Profile & Order History Modal */}
      <ProfileModal
        isOpen={isProfileOpen}
        onClose={() => setIsProfileOpen(false)}
        displayName={displayName}
        displayEmail={session?.user?.email || 'customer@greesal.in'}
        displayMobile={customMobile || ''}
        userImage={userImage}
        onUpdateProfile={(name, mobile) => {
          setCustomName(name);
          setCustomMobile(mobile);
        }}
        onReorder={(items) => {
          let newCart = [...cart];
          items.forEach((item) => {
            const existing = newCart.find((i) => i.id === item.id);
            if (existing) {
              newCart = newCart.map((i) =>
                i.id === item.id ? { ...i, quantity: i.quantity + item.quantity } : i
              );
            } else {
              newCart.push({
                id: item.id,
                name: item.name,
                price: typeof item.price === 'number' ? `₹${item.price}` : String(item.price || '₹0'),
                image: item.image || '',
                quantity: item.quantity
              });
            }
          });
          saveCart(newCart);
          setIsCartOpen(true);
        }}
      />

      {/* Invoice Modal */}
      <InvoiceModal
        isOpen={isInvoiceOpen}
        onClose={() => setIsInvoiceOpen(false)}
        order={latestPlacedOrder}
      />

      {/* Google Map Picker Modal */}
      <GoogleMapPickerModal
        isOpen={isMapPickerOpen}
        onClose={() => setIsMapPickerOpen(false)}
        onConfirmLocation={handleConfirmMapLocation}
        initialAddress={deliveryAddress}
        initialLat={locationCoords?.lat}
        initialLng={locationCoords?.lng}
      />

      {/* Login Modal */}
      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        onSuccess={handleLoginModalSuccess}
        title="Complete Your Order"
        subtitle="Sign in or enter your contact details to place your organic salad order"
      />

      {/* Mobile Sticky Add-To-Cart Action Bar */}
      <div className="fixed bottom-0 left-0 right-0 z-40 md:hidden bg-white/95 backdrop-blur-md border-t border-[#E8E1D5] px-4 py-3 shadow-[0_-4px_20px_rgba(0,0,0,0.08)] flex items-center justify-between gap-3">
        <div className="flex flex-col">
          <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Total Price</span>
          <span className="text-lg font-black text-[#123B2B] leading-tight">₹{mainItemTotalPrice}</span>
        </div>
        <button
          type="button"
          onClick={addToCartWithQuantity}
          className={`flex-1 py-3 px-5 rounded-2xl font-bold text-xs sm:text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95 ${isAddedAnimation ? 'bg-emerald-600 text-white' : 'bg-[#123B2B] text-white'
            }`}
        >
          {isAddedAnimation ? (
            <>
              <Check className="w-4 h-4 text-white stroke-[3]" />
              <span>Added to Cart!</span>
            </>
          ) : (
            <>
              <ShoppingBag className="w-4 h-4 text-[#C89D4B]" />
              <span>Add to Salad Cart</span>
            </>
          )}
        </button>
      </div>

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
