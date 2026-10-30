import React, { useState } from 'react';
import { Salad } from '@/lib/salads';
import { 
  X, 
  Trash2, 
  Plus, 
  Minus, 
  ShoppingCart, 
  Phone, 
  Clock, 
  MapPin, 
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Navigation,
  Loader2,
  CheckCircle2,
  Map,
  Edit3,
  Building,
  Compass,
  ExternalLink
} from 'lucide-react';
import { GoogleMapPickerModal } from '@/components/GoogleMapPickerModal';
import { OrderConfirmationModal, ConfirmedOrderData } from '@/components/OrderConfirmationModal';

export interface CartItem {
  salad: Salad;
  quantity: number;
}

interface SaladCartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  cartItems: CartItem[];
  onUpdateQuantity: (saladId: string, delta: number) => void;
  onRemoveItem: (saladId: string) => void;
  onClearCart: () => void;
  userName?: string | null;
  userPhone?: string | null;
  isLoggedIn?: boolean;
  onRequireFastCheckout?: () => void;
  isStoreOpen?: boolean;
  closedMessage?: string;
}

export const SaladCartDrawer: React.FC<SaladCartDrawerProps> = ({
  isOpen,
  onClose,
  cartItems,
  onUpdateQuantity,
  onRemoveItem,
  onClearCart,
  userName = '',
  userPhone = '',
  isLoggedIn = false,
  onRequireFastCheckout,
  isStoreOpen = true,
  closedMessage = '',
}) => {
  const [slot, setSlot] = useState<'immediate' | 'lunch' | 'evening' | 'pickup'>('immediate');
  const [customerName, setCustomerName] = useState(userName || '');
  const [customerPhone, setCustomerPhone] = useState(userPhone || '');
  const [address, setAddress] = useState('');
  const [notes, setNotes] = useState('');
  const [validationError, setValidationError] = useState<string | null>(null);

  // Address Input Mode: 'google_map' or 'manual'
  const [addressMode, setAddressMode] = useState<'google_map' | 'manual'>('google_map');
  const [flatNo, setFlatNo] = useState('');
  const [areaLocality, setAreaLocality] = useState('');
  const [landmark, setLandmark] = useState('');
  const [cityPincode, setCityPincode] = useState('Surat - 395007');

  // GPS & Google Map Location States
  const [isLocating, setIsLocating] = useState(false);
  const [locationCoords, setLocationCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [locationSuccessMsg, setLocationSuccessMsg] = useState<string | null>(null);
  const [isMapPickerOpen, setIsMapPickerOpen] = useState(false);

  // Order Confirmation State
  const [confirmedOrder, setConfirmedOrder] = useState<ConfirmedOrderData | null>(null);
  const [isConfirmationOpen, setIsConfirmationOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Sync props when updated from parent
  React.useEffect(() => {
    if (userName && !customerName) setCustomerName(userName);
    if (userPhone && !customerPhone) setCustomerPhone(userPhone);
  }, [userName, userPhone]);

  // Read saved fast checkout from localStorage on open
  React.useEffect(() => {
    if (isOpen) {
      setValidationError(null);
      const savedName = localStorage.getItem('greesal_custom_name') || '';
      const savedPhone = localStorage.getItem('greesal_custom_mobile') || '';
      const savedAddress = localStorage.getItem('greesal_user_address') || '';
      const savedLat = localStorage.getItem('greesal_user_lat');
      const savedLng = localStorage.getItem('greesal_user_lng');
      const savedFlat = localStorage.getItem('greesal_user_flat') || '';
      const savedArea = localStorage.getItem('greesal_user_area') || '';
      const savedLandmark = localStorage.getItem('greesal_user_landmark') || '';

      if (savedName && !customerName) setCustomerName(savedName);
      if (savedPhone && !customerPhone) setCustomerPhone(savedPhone);
      if (savedAddress && !address) setAddress(savedAddress);
      if (savedFlat && !flatNo) setFlatNo(savedFlat);
      if (savedArea && !areaLocality) setAreaLocality(savedArea);
      if (savedLandmark && !landmark) setLandmark(savedLandmark);
      if (savedLat && savedLng && !locationCoords) {
        setLocationCoords({ lat: parseFloat(savedLat), lng: parseFloat(savedLng) });
      }
    }
  }, [isOpen]);

  // Surat Quick Localities List for Instant 1-Tap Area Selection
  const SURAT_POPULAR_AREAS = [
    'Vesu',
    'Adajan',
    'Pal',
    'Piplod',
    'City Light',
    'Althan',
    'VIP Road',
    'Ghod Dod Rd',
    'Varachha',
    'Katargam',
  ];

  // GPS Location Handler with High Accuracy & Server-Side Geocoding
  const handleGetCurrentLocation = () => {
    if (!navigator.geolocation) {
      setValidationError('GPS Geolocation is not supported by your browser.');
      return;
    }

    setIsLocating(true);
    setValidationError(null);
    setLocationSuccessMsg(null);

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;
        const accuracyMeters = Math.round(position.coords.accuracy || 20);
        setLocationCoords({ lat, lng });

        try {
          // Call our server-side reverse geocode API
          const res = await fetch(`/api/location/reverse-geocode?lat=${lat}&lng=${lng}`);
          if (res.ok) {
            const data = await res.json();
            if (data.address) {
              setAddress(data.address);
              setLocationSuccessMsg(`📍 GPS Location Attached (Accuracy ~${accuracyMeters}m)`);
            } else if (data.closestSuratArea) {
              setAddress(`Near ${data.closestSuratArea}, Surat`);
              setLocationSuccessMsg(`📍 GPS Attached to ${data.closestSuratArea}`);
            } else {
              setAddress(`GPS Pin: ${lat.toFixed(5)}, ${lng.toFixed(5)}, Surat`);
              setLocationSuccessMsg(`📍 GPS Coordinates Captured (~${accuracyMeters}m)`);
            }
          } else {
            setAddress(`GPS Pin: ${lat.toFixed(5)}, ${lng.toFixed(5)}, Surat`);
            setLocationSuccessMsg(`📍 GPS Coordinates Captured (~${accuracyMeters}m)`);
          }
        } catch (err) {
          setAddress(`GPS Pin: ${lat.toFixed(5)}, ${lng.toFixed(5)}, Surat`);
          setLocationSuccessMsg(`📍 GPS Coordinates Captured (~${accuracyMeters}m)`);
        } finally {
          setIsLocating(false);
        }
      },
      (error) => {
        setIsLocating(false);
        if (error.code === error.PERMISSION_DENIED) {
          setValidationError('⚠️ Location permission was denied. Please enable GPS in browser or select your Surat area below.');
        } else if (error.code === error.TIMEOUT) {
          setValidationError('⚠️ GPS request timed out. Please select your Surat area below or type address.');
        } else {
          setValidationError('⚠️ Could not detect GPS. Please select your Surat area below.');
        }
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
    );
  };

  // Quick Area Select Handler
  const handleSelectSuratArea = (area: string) => {
    setValidationError(null);
    if (addressMode === 'manual') {
      setAreaLocality(area);
      setLocationSuccessMsg(`📍 Selected Surat Area: ${area}`);
    } else {
      if (!address.includes(area)) {
        setAddress((prev) => {
          const cleanPrev = prev.replace(/^Near\s+/i, '').trim();
          return cleanPrev ? `${cleanPrev}, ${area}, Surat` : `${area}, Surat`;
        });
      }
      setLocationSuccessMsg(`📍 Area Set to ${area}, Surat`);
    }
  };

  const totalAmount = cartItems.reduce((sum, item) => {
    const rawPrice = item.salad.price.replace(/[^\d]/g, '');
    const price = parseInt(rawPrice, 10) || 0;
    return sum + price * item.quantity;
  }, 0);

  const totalItemsCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  const isFastCheckoutCompleted = Boolean(
    customerName.trim().length >= 2 && customerPhone.trim().replace(/\D/g, '').length >= 10
  );

  const handleCheckoutWhatsApp = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);

    if (cartItems.length === 0) return;

    const trimmedName = customerName.trim();
    const cleanDigits = customerPhone.replace(/\D/g, '');

    // 1. Strict Compulsory Fast Checkout Validation
    if (!trimmedName) {
      setValidationError('⚠️ Fast Checkout Required: Please enter your Full Name before placing order.');
      const nameInput = document.getElementById('cart-customer-name');
      if (nameInput) nameInput.focus();
      return;
    }

    if (!cleanDigits || cleanDigits.length < 10) {
      setValidationError('⚠️ Fast Checkout Required: Please enter a valid 10-digit WhatsApp mobile number.');
      const phoneInput = document.getElementById('cart-customer-phone');
      if (phoneInput) phoneInput.focus();
      return;
    }

    // 2. Validate and build Delivery Address
    let finalDeliveryAddress = '';
    if (addressMode === 'manual') {
      const parts = [
        flatNo.trim(),
        areaLocality.trim(),
        landmark.trim() ? `Near ${landmark.trim()}` : '',
        cityPincode.trim() || 'Surat'
      ].filter(Boolean);
      finalDeliveryAddress = parts.join(', ');
    } else {
      // Google Map mode
      const parts = [
        flatNo.trim(),
        address.trim() || 'Surat'
      ].filter(Boolean);
      finalDeliveryAddress = parts.join(', ');
    }

    if (!finalDeliveryAddress || finalDeliveryAddress === 'Surat') {
      setValidationError('⚠️ Delivery Address Required: Please select your Google Map location or enter address manually below.');
      return;
    }

    // 3. Persist verified Fast Checkout details
    try {
      localStorage.setItem('greesal_custom_name', trimmedName);
      localStorage.setItem('greesal_custom_mobile', customerPhone.trim());
      localStorage.setItem('greesal_user_address', finalDeliveryAddress);
      if (flatNo.trim()) localStorage.setItem('greesal_user_flat', flatNo.trim());
      if (areaLocality.trim()) localStorage.setItem('greesal_user_area', areaLocality.trim());
      if (landmark.trim()) localStorage.setItem('greesal_user_landmark', landmark.trim());
      if (locationCoords) {
        localStorage.setItem('greesal_user_lat', locationCoords.lat.toString());
        localStorage.setItem('greesal_user_lng', locationCoords.lng.toString());
      }
    } catch (e) {}

    const slotNames = {
      immediate: 'Immediate Delivery (30-45 Mins)',
      lunch: 'Lunch Slot (11:00 AM - 2:00 PM)',
      evening: 'Evening Slot (4:00 PM - 7:00 PM)',
      pickup: 'Self PickUp (10:00 AM - 6:30 PM)',
    };

    const orderNumber = `GRS-${Math.floor(10000 + Math.random() * 90000)}`;

    const mapsLink = locationCoords
      ? `https://maps.google.com/?q=${locationCoords.lat},${locationCoords.lng}`
      : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(finalDeliveryAddress)}`;

    const orderPayload: ConfirmedOrderData = {
      orderNumber,
      customerName: trimmedName,
      customerMobile: customerPhone.trim(),
      deliveryAddress: finalDeliveryAddress,
      deliverySlot: slotNames[slot],
      mapsUrl: mapsLink,
      locationCoords,
      addressMode,
      manualAddressDetails: {
        flatNo: flatNo.trim(),
        areaLocality: areaLocality.trim(),
        landmark: landmark.trim(),
        cityPincode: cityPincode.trim(),
      },
      notes: notes.trim(),
      items: cartItems.map((it) => {
        const portionText = it.salad.selectedPortion ? ` (${it.salad.selectedPortion.grams}g)` : '';
        const displayName = it.salad.name.includes('(') ? it.salad.name : `${it.salad.name}${portionText}`;
        return {
          id: it.salad.id || it.salad._id || it.salad.slug || it.salad.name,
          name: displayName,
          price: it.salad.price,
          image: it.salad.image,
          quantity: it.quantity,
        };
      }),
      total: totalAmount,
      paymentMethod: 'Cash on Delivery / UPI',
    };

    // 4. Save Order into MongoDB Database via /api/orders
    setIsSubmitting(true);
    try {
      await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderNumber,
          customerName: trimmedName,
          customerMobile: customerPhone.trim(),
          deliveryAddress: finalDeliveryAddress,
          deliverySlot: slotNames[slot],
          addressMode,
          manualAddressDetails: {
            flatNo: flatNo.trim(),
            areaLocality: areaLocality.trim(),
            landmark: landmark.trim(),
            cityPincode: cityPincode.trim(),
          },
          mapsUrl: mapsLink,
          locationCoords,
          notes: notes.trim(),
          items: orderPayload.items,
          subtotal: totalAmount,
          deliveryFee: 0,
          total: totalAmount,
          paymentMethod: 'Cash on Delivery / UPI',
          status: 'Placed',
        }),
      });
    } catch (err) {
      console.warn('Failed to post order to backend:', err);
    } finally {
      setIsSubmitting(false);
    }

    // Save locally into order history for immediate display in Profile Modal
    try {
      localStorage.setItem('greesal_custom_name', trimmedName);
      localStorage.setItem('greesal_custom_mobile', customerPhone.trim());
      if (address.trim()) {
        localStorage.setItem('greesal_user_address', address.trim());
      }

      const existingHistoryStr = localStorage.getItem('greesal_orders_history');
      const existingHistory = existingHistoryStr ? JSON.parse(existingHistoryStr) : [];
      const historyRecord = {
        id: orderNumber,
        date: `Today, ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`,
        timestamp: Date.now(),
        status: 'Placed',
        items: orderPayload.items,
        subtotal: totalAmount,
        deliveryFee: 0,
        total: totalAmount,
        deliveryAddress: address.trim() || 'Surat Doorstep',
        paymentMethod: 'Cash on Delivery / UPI',
      };
      localStorage.setItem('greesal_orders_history', JSON.stringify([historyRecord, ...(Array.isArray(existingHistory) ? existingHistory : [])]));
    } catch (e) {}

    // 4. Construct WhatsApp Message and Open in Background
    let itemsList = cartItems
      .map((item, i) => {
        const portionText = item.salad.selectedPortion ? ` (${item.salad.selectedPortion.grams}g)` : '';
        const displayName = item.salad.name.includes('(') ? item.salad.name : `${item.salad.name}${portionText}`;
        const unitPrice = parseInt(item.salad.price.replace(/[^\d]/g, ''), 10) || 0;
        return `${i + 1}. *${displayName}* x ${item.quantity} = ₹${unitPrice * item.quantity}`;
      })
      .join('\n');

    const message =
      `🥗 *NEW ORDER - GREESAL* 🥗\n\n` +
      `🆔 *Order ID:* ${orderNumber}\n` +
      `👤 *Customer Name:* ${trimmedName}\n` +
      `📞 *WhatsApp Mobile:* ${customerPhone.trim()}\n` +
      `⏰ *Delivery Slot:* ${slotNames[slot]}\n` +
      `📍 *Delivery Address:* ${address.trim() || 'Surat Doorstep'}\n` +
      (mapsLink ? `🗺️ *Live GPS Location Pin:* ${mapsLink}\n` : '') +
      (notes.trim() ? `📝 *Special Notes:* ${notes.trim()}\n` : '') +
      `\n🛒 *ORDER ITEMS:*\n${itemsList}\n\n` +
      `💰 *Grand Total:* ₹${totalAmount} (Free Delivery Included)\n\n` +
      `✨ *Farm-Fresh Organic Salad Bowls! Please confirm and schedule my delivery.*`;

    const encoded = encodeURIComponent(message);
    window.open(`https://wa.me/919925836117?text=${encoded}`, '_blank');

    // 5. Open Order Confirmation Modal and Clear Cart
    setConfirmedOrder(orderPayload);
    setIsConfirmationOpen(true);
    onClearCart();
    onClose();
  };

  return (
    <>
      {isOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
            onClick={onClose}
          />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col justify-between animate-fadeIn border-l border-[#e4eae7]">
          
          {/* Drawer Top Header */}
          <div className="p-5 border-b border-gray-100 flex items-center justify-between bg-[#f8faf9]">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-full bg-[#20493c] text-white flex items-center justify-center">
                <ShoppingCart className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-montserrat font-bold text-lg text-[#20493c]">
                  Your Cart
                </h3>
                <span className="text-xs text-[#20493c]/70 font-semibold">
                  {totalItemsCount} {totalItemsCount === 1 ? 'item' : 'items'}
                </span>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 rounded-full hover:bg-gray-200 text-gray-500 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Drawer Scrollable Body */}
          <div className="p-5 flex-1 overflow-y-auto space-y-5 font-dmsans">
            {cartItems.length === 0 ? (
              <div className="h-64 flex flex-col items-center justify-center text-center p-6">
                <div className="w-16 h-16 rounded-full bg-[#e8f7f2] flex items-center justify-center text-[#20493c] mb-3">
                  <ShoppingCart className="w-8 h-8 opacity-60" />
                </div>
                <h4 className="font-montserrat font-bold text-base text-[#20493c] mb-1">
                  Your cart is empty
                </h4>
                <p className="text-xs text-gray-500 mb-4">
                  Add fresh handcrafted salads to start your healthy meal today.
                </p>
                <button
                  onClick={onClose}
                  className="px-5 py-2.5 rounded-full bg-[#20493c] text-white text-xs font-bold shadow-md"
                >
                  Browse Salad Menu
                </button>
              </div>
            ) : (
              <>
                {/* List of Cart Items */}
                <div className="space-y-3">
                  {cartItems.map((item) => {
                    const saladId = item.salad.id || item.salad._id || item.salad.slug || item.salad.name;
                    const pricePerUnit = parseInt(item.salad.price.replace(/[^\d]/g, ''), 10) || 0;
                    const itemTotal = pricePerUnit * item.quantity;

                    return (
                      <div
                        key={saladId}
                        className="flex items-center gap-3 p-3 rounded-2xl border border-gray-100 bg-[#fbfdfb] hover:shadow-sm transition-all"
                      >
                        <img
                          src={item.salad.image}
                          alt={item.salad.name}
                          className="w-16 h-16 rounded-xl object-cover flex-shrink-0"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src =
                              'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=800&q=80';
                          }}
                        />

                        <div className="flex-1 min-w-0">
                          <h4 className="font-montserrat font-bold text-xs sm:text-sm text-[#20493c] truncate">
                            {item.salad.name}
                          </h4>
                          <div className="flex items-center gap-1.5 flex-wrap mt-0.5">
                            {item.salad.selectedPortion && (
                              <span className="text-[10px] font-black text-[#123B2B] bg-[#e8f7ee] px-1.5 py-0.2 rounded border border-[#56aa52]/30">
                                {item.salad.selectedPortion.grams}g
                              </span>
                            )}
                            <span className="text-xs font-semibold text-[#20493c]/80">
                              ₹{pricePerUnit} each
                            </span>
                          </div>

                          <div className="flex items-center justify-between mt-2">
                            <div className="flex items-center gap-1.5 bg-gray-100 rounded-lg p-0.5">
                              <button
                                onClick={() => onUpdateQuantity(saladId, -1)}
                                className="w-5 h-5 rounded flex items-center justify-center bg-white text-gray-700 hover:bg-gray-200"
                              >
                                <Minus className="w-3 h-3" />
                              </button>
                              <span className="w-5 text-center text-xs font-bold text-[#1a1a1a]">
                                {item.quantity}
                              </span>
                              <button
                                onClick={() => onUpdateQuantity(saladId, 1)}
                                className="w-5 h-5 rounded flex items-center justify-center bg-[#20493c] text-white hover:bg-[#15342a]"
                              >
                                <Plus className="w-3 h-3" />
                              </button>
                            </div>

                            <span className="font-montserrat font-bold text-sm text-[#20493c]">
                              ₹{itemTotal}
                            </span>
                          </div>
                        </div>

                        <button
                          onClick={() => onRemoveItem(saladId)}
                          className="text-gray-400 hover:text-red-500 p-1 transition-colors"
                          title="Remove item"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    );
                  })}
                </div>

                {/* Delivery Slot Selection */}
                <div className="pt-2">
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#20493c] mb-2">
                    Delivery Slot in Surat
                  </label>
                  <div className="grid grid-cols-4 gap-1.5">
                    {[
                      { id: 'immediate', label: 'Express', time: '30-45 min' },
                      { id: 'lunch', label: 'Lunch', time: '11am-2pm' },
                      { id: 'evening', label: 'Evening', time: '4pm-7pm' },
                      { id: 'pickup', label: 'PickUp', time: '10am-6:30pm' },
                    ].map((s) => (
                      <button
                        key={s.id}
                        type="button"
                        onClick={() => setSlot(s.id as any)}
                        className={`py-2 px-1 rounded-xl border text-center transition-all ${
                          slot === s.id
                            ? 'border-[#20493c] bg-[#20493c] text-white shadow-sm'
                            : 'border-gray-200 bg-gray-50 text-[#1a1a1a] hover:bg-gray-100'
                        }`}
                      >
                        <div className="text-[11px] sm:text-xs font-bold leading-tight">{s.label}</div>
                        <div className="text-[9px] sm:text-[10px] opacity-80 mt-0.5 leading-tight">{s.time}</div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Compulsory Fast Checkout Details Card */}
                <div className={`p-4 rounded-2xl border transition-all ${
                  isFastCheckoutCompleted
                    ? 'bg-[#eef8f3] border-[#6ac6ac]/60'
                    : 'bg-[#fffdf5] border-[#fbce45]'
                }`}>
                  <div className="flex items-center justify-between mb-2.5">
                    <div className="flex items-center gap-1.5">
                      <ShieldCheck className={`w-4 h-4 ${isFastCheckoutCompleted ? 'text-emerald-600' : 'text-[#fbce45]'}`} />
                      <span className="text-xs font-black text-[#123B2B] uppercase tracking-wide">
                        ⚡ Fast Checkout {isFastCheckoutCompleted ? '✓ Verified' : '(Required)'}
                      </span>
                    </div>
                    {isFastCheckoutCompleted && (
                      <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full">
                        Ready to Order
                      </span>
                    )}
                  </div>

                  {validationError && (
                    <div className="mb-3 p-2.5 rounded-xl bg-red-50 border border-red-300 text-red-700 text-xs font-bold animate-pulse">
                      {validationError}
                    </div>
                  )}

                  <div className="space-y-2.5">
                    <div>
                      <label className="block text-[11px] font-bold text-[#123B2B] mb-1">
                        Full Name <span className="text-red-500">* (Compulsory)</span>
                      </label>
                      <input
                        id="cart-customer-name"
                        type="text"
                        required
                        placeholder="e.g. Rahul Patel"
                        value={customerName}
                        onChange={(e) => {
                          setCustomerName(e.target.value);
                          if (validationError) setValidationError(null);
                        }}
                        className="w-full px-3 py-2 rounded-xl border border-gray-300 bg-white text-xs text-[#1a1a1a] focus:outline-none focus:ring-2 focus:ring-[#20493c]/40 font-medium"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-[#123B2B] mb-1">
                        WhatsApp Mobile <span className="text-red-500">* (Compulsory 10 digits)</span>
                      </label>
                      <input
                        id="cart-customer-phone"
                        type="tel"
                        required
                        maxLength={15}
                        placeholder="e.g. 9925836117"
                        value={customerPhone}
                        onChange={(e) => {
                          setCustomerPhone(e.target.value);
                          if (validationError) setValidationError(null);
                        }}
                        className="w-full px-3 py-2 rounded-xl border border-gray-300 bg-white text-xs text-[#1a1a1a] focus:outline-none focus:ring-2 focus:ring-[#20493c]/40 font-medium"
                      />
                    </div>

                    {/* Delivery Address Section with Google Map & Manual Tabs */}
                    <div className="pt-1 space-y-2">
                      <div className="flex items-center justify-between">
                        <label className="block text-[11px] font-bold text-[#123B2B]">
                          Delivery Address in Surat <span className="text-red-500">*</span>
                        </label>
                        <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                          Doorstep Delivery
                        </span>
                      </div>

                      {/* Mode Switcher Tabs */}
                      <div className="grid grid-cols-2 p-1 rounded-xl bg-gray-100 border border-gray-200">
                        <button
                          type="button"
                          onClick={() => {
                            setAddressMode('google_map');
                            if (validationError) setValidationError(null);
                          }}
                          className={`py-1.5 px-2 rounded-lg text-[11px] font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                            addressMode === 'google_map'
                              ? 'bg-[#123B2B] text-white shadow-xs'
                              : 'text-gray-600 hover:text-gray-900'
                          }`}
                        >
                          <MapPin className="w-3.5 h-3.5" />
                          <span>Google Map / GPS</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            setAddressMode('manual');
                            if (validationError) setValidationError(null);
                          }}
                          className={`py-1.5 px-2 rounded-lg text-[11px] font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                            addressMode === 'manual'
                              ? 'bg-[#123B2B] text-white shadow-xs'
                              : 'text-gray-600 hover:text-gray-900'
                          }`}
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                          <span>Manual Address</span>
                        </button>
                      </div>

                      {/* Tab 1: Google Map / GPS Mode */}
                      {addressMode === 'google_map' ? (
                        <div className="space-y-2">
                          <div className="grid grid-cols-2 gap-2">
                            <button
                              type="button"
                              onClick={() => setIsMapPickerOpen(true)}
                              className="py-2 px-3 rounded-xl bg-[#fbce45]/20 hover:bg-[#fbce45]/35 text-[#20493c] border border-[#fbce45] text-xs font-bold transition-all flex items-center justify-center gap-1.5 shadow-2xs active:scale-95 cursor-pointer"
                            >
                              <MapPin className="w-4 h-4 text-[#20493c]" />
                              <span>Pick on Google Map</span>
                            </button>

                            <button
                              type="button"
                              onClick={handleGetCurrentLocation}
                              disabled={isLocating}
                              className="py-2 px-3 rounded-xl bg-[#e8f7f2] hover:bg-[#d5f0e6] text-[#123B2B] border border-[#6ac6ac]/50 text-xs font-bold transition-all flex items-center justify-center gap-1.5 shadow-2xs active:scale-95 cursor-pointer disabled:opacity-60"
                            >
                              {isLocating ? (
                                <>
                                  <Loader2 className="w-4 h-4 animate-spin text-[#20493c]" />
                                  <span>Locating...</span>
                                </>
                              ) : (
                                <>
                                  <Navigation className="w-4 h-4 text-[#20493c]" />
                                  <span>Use Live GPS</span>
                                </>
                              )}
                            </button>
                          </div>

                          {locationSuccessMsg && (
                            <div className="p-2 rounded-xl bg-emerald-50 border border-emerald-200 text-[11px] font-bold text-emerald-800 flex items-center justify-between">
                              <div className="flex items-center gap-1.5">
                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                                <span className="truncate">{locationSuccessMsg}</span>
                              </div>
                              {locationCoords && (
                                <a
                                  href={`https://maps.google.com/?q=${locationCoords.lat},${locationCoords.lng}`}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="text-[10px] underline text-emerald-900 font-bold hover:text-black flex items-center gap-0.5 flex-shrink-0"
                                >
                                  <span>Map</span>
                                  <ExternalLink className="w-2.5 h-2.5" />
                                </a>
                              )}
                            </div>
                          )}

                          {/* Flat / House No field for Google Map mode */}
                          <div>
                            <input
                              type="text"
                              placeholder="Flat / Floor / House No. & Building Name"
                              value={flatNo}
                              onChange={(e) => setFlatNo(e.target.value)}
                              className="w-full px-3 py-2 rounded-xl border border-gray-300 bg-white text-xs text-[#1a1a1a] focus:outline-none focus:ring-2 focus:ring-[#20493c]/40 font-medium"
                            />
                          </div>

                          {/* Selected Location / Area text */}
                          <div>
                            <input
                              type="text"
                              placeholder="Street / Area in Surat (or pick on map above)"
                              value={address}
                              onChange={(e) => setAddress(e.target.value)}
                              className="w-full px-3 py-2 rounded-xl border border-gray-300 bg-white text-xs text-[#1a1a1a] focus:outline-none focus:ring-2 focus:ring-[#20493c]/40 font-medium"
                            />
                          </div>

                          {/* Surat Quick Area Selector Chips */}
                          <div>
                            <span className="text-[10px] font-bold text-gray-500 block mb-1">
                              📍 Or quick select your Surat area:
                            </span>
                            <div className="flex flex-wrap gap-1 max-h-16 overflow-y-auto pr-1">
                              {SURAT_POPULAR_AREAS.map((area) => (
                                <button
                                  key={area}
                                  type="button"
                                  onClick={() => handleSelectSuratArea(area)}
                                  className={`text-[10px] font-semibold px-2 py-0.5 rounded-lg border transition-all cursor-pointer ${
                                    address.includes(area)
                                      ? 'bg-[#20493c] text-white border-[#20493c]'
                                      : 'bg-white text-gray-700 border-gray-200 hover:border-[#6ac6ac] hover:bg-[#eef8f3]'
                                  }`}
                                >
                                  + {area}
                                </button>
                              ))}
                            </div>
                          </div>
                        </div>
                      ) : (
                        /* Tab 2: Manual Address Entry Mode */
                        <div className="space-y-2">
                          <div>
                            <input
                              type="text"
                              required
                              placeholder="Flat / House / Floor No. & Apartment / Building Name *"
                              value={flatNo}
                              onChange={(e) => {
                                setFlatNo(e.target.value);
                                if (validationError) setValidationError(null);
                              }}
                              className="w-full px-3 py-2 rounded-xl border border-gray-300 bg-white text-xs text-[#1a1a1a] focus:outline-none focus:ring-2 focus:ring-[#20493c]/40 font-medium"
                            />
                          </div>

                          <div>
                            <input
                              type="text"
                              required
                              placeholder="Street / Road / Locality in Surat *"
                              value={areaLocality}
                              onChange={(e) => {
                                setAreaLocality(e.target.value);
                                if (validationError) setValidationError(null);
                              }}
                              className="w-full px-3 py-2 rounded-xl border border-gray-300 bg-white text-xs text-[#1a1a1a] focus:outline-none focus:ring-2 focus:ring-[#20493c]/40 font-medium"
                            />
                          </div>

                          {/* Quick Surat Area Chips for quick filling */}
                          <div>
                            <span className="text-[10px] font-bold text-gray-500 block mb-1">
                              📍 Tap to fill Surat Area:
                            </span>
                            <div className="flex flex-wrap gap-1 max-h-16 overflow-y-auto pr-1">
                              {SURAT_POPULAR_AREAS.map((area) => (
                                <button
                                  key={area}
                                  type="button"
                                  onClick={() => handleSelectSuratArea(area)}
                                  className={`text-[10px] font-semibold px-2 py-0.5 rounded-lg border transition-all cursor-pointer ${
                                    areaLocality.includes(area)
                                      ? 'bg-[#20493c] text-white border-[#20493c]'
                                      : 'bg-white text-gray-700 border-gray-200 hover:border-[#6ac6ac] hover:bg-[#eef8f3]'
                                  }`}
                                >
                                  + {area}
                                </button>
                              ))}
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-2">
                            <div>
                              <input
                                type="text"
                                placeholder="Nearby Landmark (Optional)"
                                value={landmark}
                                onChange={(e) => setLandmark(e.target.value)}
                                className="w-full px-3 py-2 rounded-xl border border-gray-300 bg-white text-xs text-[#1a1a1a] focus:outline-none focus:ring-2 focus:ring-[#20493c]/40 font-medium"
                              />
                            </div>

                            <div>
                              <input
                                type="text"
                                placeholder="City / Pincode"
                                value={cityPincode}
                                onChange={(e) => setCityPincode(e.target.value)}
                                className="w-full px-3 py-2 rounded-xl border border-gray-300 bg-white text-xs text-[#1a1a1a] focus:outline-none focus:ring-2 focus:ring-[#20493c]/40 font-medium font-bold text-gray-700"
                              />
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Closed Store Pre-Order Alert */}
                {!isStoreOpen && (
                  <div className="p-3 rounded-xl bg-amber-50 border border-amber-300 flex items-start gap-2 text-xs font-semibold text-amber-900">
                    <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse mt-1 flex-shrink-0" />
                    <div>
                      <p className="font-extrabold text-[#123B2B]">Pre-Order Active (Store Closed)</p>
                      <p className="text-[11px] text-gray-700 font-normal mt-0.5">
                        {closedMessage || 'Kitchen is currently resting. Order will be freshly prepared for the next delivery slot!'}
                      </p>
                    </div>
                  </div>
                )}

                {/* Free Delivery Callout */}
                <div className="p-3 rounded-xl bg-[#fbce45]/20 border border-[#fbce45]/40 flex items-center gap-2 text-xs font-semibold text-[#20493c]">
                  <Sparkles className="w-4 h-4 text-[#20493c] flex-shrink-0" />
                  <span>Free Pre-booking &amp; Daily Doorstep Delivery in Surat!</span>
                </div>
              </>
            )}
          </div>

          {/* Drawer Bottom Bar */}
          {cartItems.length > 0 && (
            <div className="p-5 border-t border-gray-200 bg-[#f8faf9] space-y-3 font-dmsans">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600 font-medium">Subtotal</span>
                <span className="font-bold text-gray-800">₹{totalAmount}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600 font-medium">Delivery</span>
                <span className="font-bold text-[#6ac6ac] uppercase">FREE</span>
              </div>
              <div className="flex items-center justify-between text-base pt-2 border-t border-gray-200">
                <span className="font-montserrat font-bold text-[#20493c]">Grand Total</span>
                <span className="font-montserrat font-black text-2xl text-[#20493c]">
                  ₹{totalAmount}
                </span>
              </div>

              <button
                onClick={handleCheckoutWhatsApp}
                className={`w-full py-3.5 px-6 rounded-2xl text-white font-bold text-sm sm:text-base flex items-center justify-center gap-2 shadow-lg transition-all cursor-pointer active:scale-95 ${
                  isFastCheckoutCompleted
                    ? 'bg-[#20493c] hover:bg-[#15342a]'
                    : 'bg-[#123B2B] hover:bg-[#1C4D3A]'
                }`}
              >
                <Phone className="w-4 h-4 text-[#fbce45]" />
                <span>
                  {isFastCheckoutCompleted
                    ? isStoreOpen
                      ? 'Place Order via WhatsApp'
                      : 'Place Pre-Order via WhatsApp'
                    : 'Complete Fast Checkout & Order'}
                </span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}

        </div>
      </div>
    </div>
    )}

    {/* Interactive Google Map Picker Modal */}
    <GoogleMapPickerModal
      isOpen={isMapPickerOpen}
      onClose={() => setIsMapPickerOpen(false)}
      initialAddress={address}
      initialLat={locationCoords?.lat}
      initialLng={locationCoords?.lng}
      onConfirmLocation={(loc) => {
        setAddress(loc.address);
        setLocationCoords({ lat: loc.lat, lng: loc.lng });
        setLocationSuccessMsg(`📍 Google Map Pin Attached (${loc.lat.toFixed(4)}, ${loc.lng.toFixed(4)})`);
        setAddressMode('google_map');
      }}
    />

    {/* Post-Order Instant Confirmation Modal */}
    <OrderConfirmationModal
      isOpen={isConfirmationOpen}
      onClose={() => setIsConfirmationOpen(false)}
      order={confirmedOrder}
    />
  </>
  );
};
