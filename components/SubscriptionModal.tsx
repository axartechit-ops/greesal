import React, { useState } from 'react';
import { X, Check, Sparkles, Phone, MapPin, Navigation, Loader2, CheckCircle2 } from 'lucide-react';
import { GoogleMapPickerModal } from './GoogleMapPickerModal';
import { OrderConfirmationModal, ConfirmedOrderData } from './OrderConfirmationModal';

interface SubscriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultPlan?: 'weekly' | 'monthly';
}

export const SubscriptionModal: React.FC<SubscriptionModalProps> = ({
  isOpen,
  onClose,
  defaultPlan = 'weekly',
}) => {
  const [selectedPlan, setSelectedPlan] = useState<'weekly' | 'monthly'>(defaultPlan);
  const [deliverySlot, setDeliverySlot] = useState<'lunch' | 'evening' | 'pickup'>('lunch');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [dietPreference, setDietPreference] = useState('Standard (High Protein & Veggies)');

  // GPS & Map Modal States
  const [isMapPickerOpen, setIsMapPickerOpen] = useState(false);
  const [isLocating, setIsLocating] = useState(false);
  const [locationCoords, setLocationCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [locationSuccessMsg, setLocationSuccessMsg] = useState<string | null>(null);

  // Order Confirmation State
  const [confirmedOrder, setConfirmedOrder] = useState<ConfirmedOrderData | null>(null);
  const [isConfirmationOpen, setIsConfirmationOpen] = useState(false);

  // Read saved fast checkout from localStorage on open
  React.useEffect(() => {
    if (isOpen) {
      const savedName = localStorage.getItem('greesal_custom_name') || '';
      const savedPhone = localStorage.getItem('greesal_custom_mobile') || '';
      const savedAddress = localStorage.getItem('greesal_user_address') || '';
      const savedLat = localStorage.getItem('greesal_user_lat');
      const savedLng = localStorage.getItem('greesal_user_lng');

      if (savedName && !fullName) setFullName(savedName);
      if (savedPhone && !phone) setPhone(savedPhone);
      if (savedAddress && !deliveryAddress) setDeliveryAddress(savedAddress);
      if (savedLat && savedLng && !locationCoords) {
        setLocationCoords({ lat: parseFloat(savedLat), lng: parseFloat(savedLng) });
      }
    }
  }, [isOpen]);

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

  const handleGetCurrentLocation = () => {
    if (!navigator.geolocation) return;
    setIsLocating(true);
    setLocationSuccessMsg(null);

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;
        const accuracyMeters = Math.round(position.coords.accuracy || 20);
        setLocationCoords({ lat, lng });

        try {
          const res = await fetch(`/api/location/reverse-geocode?lat=${lat}&lng=${lng}`);
          if (res.ok) {
            const data = await res.json();
            if (data.address) {
              setDeliveryAddress(data.address);
              setLocationSuccessMsg(`📍 GPS Attached (Accuracy ~${accuracyMeters}m)`);
            } else if (data.closestSuratArea) {
              setDeliveryAddress(`Near ${data.closestSuratArea}, Surat`);
              setLocationSuccessMsg(`📍 GPS Attached to ${data.closestSuratArea}`);
            } else {
              setDeliveryAddress(`GPS Pin: ${lat.toFixed(5)}, ${lng.toFixed(5)}, Surat`);
              setLocationSuccessMsg(`📍 GPS Captured (~${accuracyMeters}m)`);
            }
          } else {
            setDeliveryAddress(`GPS Pin: ${lat.toFixed(5)}, ${lng.toFixed(5)}, Surat`);
            setLocationSuccessMsg(`📍 GPS Captured (~${accuracyMeters}m)`);
          }
        } catch (err) {
          setDeliveryAddress(`GPS Pin: ${lat.toFixed(5)}, ${lng.toFixed(5)}, Surat`);
          setLocationSuccessMsg(`📍 GPS Captured (~${accuracyMeters}m)`);
        } finally {
          setIsLocating(false);
        }
      },
      () => {
        setIsLocating(false);
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
    );
  };

  const handleSelectSuratArea = (area: string) => {
    if (!deliveryAddress.includes(area)) {
      setDeliveryAddress((prev) => {
        const clean = prev.trim();
        return clean ? `${clean}, ${area}, Surat` : `${area}, Surat`;
      });
    }
    setLocationSuccessMsg(`📍 Area Set to ${area}, Surat`);
  };

  const planDetails = {
    weekly: {
      name: 'Weekly Salad Plan',
      duration: '6 Days (Mon - Sat)',
      pricePerSalad: 200,
      totalPrice: 1200,
      saving: 'Standard Plan',
      badge: 'Flexible Routine',
    },
    monthly: {
      name: 'Monthly Salad Plan',
      duration: '24 Days (4 Weeks)',
      pricePerSalad: 175,
      totalPrice: 4200,
      saving: 'Save ₹600 (₹25 OFF per salad)',
      badge: 'Best Value • Most Popular',
    },
  };

  const activePlan = planDetails[selectedPlan];

  const handleBookOnWhatsApp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim() || !phone.trim()) {
      alert('Please enter your Name and Mobile Number');
      return;
    }

    // Persist to localStorage
    try {
      localStorage.setItem('greesal_custom_name', fullName.trim());
      localStorage.setItem('greesal_custom_mobile', phone.trim());
      if (deliveryAddress.trim()) {
        localStorage.setItem('greesal_user_address', deliveryAddress.trim());
      }
    } catch (e) {
      // ignore
    }

    const slotNames = {
      lunch: 'Lunch Slot (11:00 AM - 2:00 PM)',
      evening: 'Evening Slot (4:00 PM - 7:00 PM)',
      pickup: 'Self PickUp (10:00 AM - 6:30 PM)',
    };

    const orderNumber = `SUB-${Math.floor(10000 + Math.random() * 90000)}`;

    const mapsLink = locationCoords
      ? `https://maps.google.com/?q=${locationCoords.lat},${locationCoords.lng}`
      : '';

    const orderPayload: ConfirmedOrderData = {
      orderNumber,
      customerName: fullName.trim(),
      customerMobile: phone.trim(),
      deliveryAddress: deliveryAddress.trim() || 'Surat Doorstep',
      deliverySlot: slotNames[deliverySlot],
      mapsUrl: mapsLink,
      notes: `Preference: ${dietPreference}`,
      items: [
        {
          name: `${activePlan.name} (${activePlan.duration})`,
          price: `₹${activePlan.totalPrice}`,
          image: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=600&q=80',
          quantity: 1,
        },
      ],
      total: activePlan.totalPrice,
      paymentMethod: 'Pre-Booking / Cash or UPI',
    };

    // Save Subscription Order in Database
    try {
      await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderNumber,
          customerName: fullName.trim(),
          customerMobile: phone.trim(),
          deliveryAddress: deliveryAddress.trim() || 'Surat Doorstep',
          deliverySlot: slotNames[deliverySlot],
          mapsUrl: mapsLink,
          locationCoords,
          notes: `Preference: ${dietPreference}`,
          items: orderPayload.items,
          subtotal: activePlan.totalPrice,
          deliveryFee: 0,
          total: activePlan.totalPrice,
          orderType: 'subscription',
          dietPreference,
          paymentMethod: 'Subscription / Post Delivery',
          status: 'Placed',
        }),
      });
    } catch (err) {
      console.warn('Failed to save subscription order:', err);
    }

    // Open WhatsApp Message
    const message = `🥗 *NEW SUBSCRIPTION REQUEST - GREESAL* 🥗\n\n` +
      `🆔 *Subscription ID:* ${orderNumber}\n` +
      `👤 *Customer Name:* ${fullName.trim()}\n` +
      `📞 *WhatsApp Mobile:* ${phone.trim()}\n` +
      `📋 *Plan Selected:* ${activePlan.name} (₹${activePlan.pricePerSalad}/salad - Total: ₹${activePlan.totalPrice})\n` +
      `⏰ *Delivery Slot:* ${slotNames[deliverySlot]}\n` +
      `🥗 *Diet Preference:* ${dietPreference}\n` +
      `📍 *Delivery Address:* ${deliveryAddress.trim() || 'Surat Doorstep'}\n` +
      (mapsLink ? `🗺️ *Live GPS Location Pin:* ${mapsLink}\n\n` : '\n') +
      `✨ *Farm-Fresh Organic Salad Bowls! Please confirm my subscription details.*`;

    const encoded = encodeURIComponent(message);
    window.open(`https://wa.me/919825144321?text=${encoded}`, '_blank');

    // Open confirmation modal
    setConfirmedOrder(orderPayload);
    setIsConfirmationOpen(true);
    onClose();
  };

  return (
    <>
      {isOpen && (
      <div className="fixed inset-0 z-50 overflow-y-auto font-dmsans">
        {/* Backdrop */}
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
          onClick={onClose}
        />

        <div className="flex min-h-full items-center justify-center p-4 text-center">
          <div className="w-full max-w-xl transform overflow-hidden rounded-3xl bg-white p-6 sm:p-8 text-left align-middle shadow-2xl transition-all border border-[#e4eae7] relative animate-fadeIn">
            
            {/* Close button */}
            <button
              onClick={onClose}
              className="absolute top-5 right-5 p-2 rounded-full hover:bg-gray-100 text-gray-500 hover:text-gray-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Modal Header */}
            <div className="mb-6">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#fbce45] text-[#20493c] text-xs font-bold uppercase tracking-wider mb-2">
                <Sparkles className="w-3.5 h-3.5" /> Farm-Fresh Organic Salad Bowls
              </span>
              <h3 className="font-montserrat font-extrabold text-2xl sm:text-3xl text-[#20493c]">
                Greesal Subscriptions
              </h3>
              <p className="text-xs sm:text-sm text-[#20493c]/80 mt-1">
                Daily rotation of 21+ varieties • 100% handmade dressings • Free delivery in Surat
              </p>
            </div>

            {/* Plan Selector Buttons */}
            <div className="grid grid-cols-2 gap-3 mb-6">
              <button
                type="button"
                onClick={() => setSelectedPlan('weekly')}
                className={`p-4 rounded-2xl border-2 text-left transition-all ${
                  selectedPlan === 'weekly'
                    ? 'border-[#20493c] bg-[#e8f7f2] shadow-sm'
                    : 'border-gray-200 hover:border-gray-300 bg-white'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-bold text-[#6ac6ac] uppercase">Weekly</span>
                  {selectedPlan === 'weekly' && <Check className="w-4 h-4 text-[#20493c]" />}
                </div>
                <div className="font-montserrat font-black text-2xl text-[#20493c]">
                  ₹200<span className="text-xs font-normal text-[#20493c]/70">/salad</span>
                </div>
                <p className="text-xs text-[#20493c]/80 font-medium mt-1">6 Days • Total ₹1,200</p>
              </button>

              <button
                type="button"
                onClick={() => setSelectedPlan('monthly')}
                className={`p-4 rounded-2xl border-2 text-left relative transition-all ${
                  selectedPlan === 'monthly'
                    ? 'border-[#20493c] bg-[#e8f7f2] shadow-sm'
                    : 'border-gray-200 hover:border-gray-300 bg-white'
                }`}
              >
                <span className="absolute -top-2.5 right-3 bg-[#fbce45] text-[#20493c] text-[10px] font-black px-2 py-0.5 rounded-full shadow-sm">
                  Save ₹25/day
                </span>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-bold text-[#20493c] uppercase">Monthly</span>
                  {selectedPlan === 'monthly' && <Check className="w-4 h-4 text-[#20493c]" />}
                </div>
                <div className="font-montserrat font-black text-2xl text-[#20493c]">
                  ₹175<span className="text-xs font-normal text-[#20493c]/70">/salad</span>
                </div>
                <p className="text-xs text-[#20493c]/80 font-medium mt-1">24 Days • Total ₹4,200</p>
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleBookOnWhatsApp} className="space-y-4 font-dmsans text-left">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#20493c] mb-1.5">
                  Delivery Slot
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  {[
                    { id: 'lunch', label: 'Lunch Slot', time: '11 am - 2 pm' },
                    { id: 'evening', label: 'Evening Slot', time: '4 pm - 7 pm' },
                    { id: 'pickup', label: 'Self PickUp', time: '10 am - 6:30 pm' },
                  ].map((slot) => (
                    <button
                      key={slot.id}
                      type="button"
                      onClick={() => setDeliverySlot(slot.id as any)}
                      className={`py-2 px-3 rounded-xl border text-xs font-semibold text-center transition-all ${
                        deliverySlot === slot.id
                          ? 'border-[#20493c] bg-[#20493c] text-white shadow-sm'
                          : 'border-gray-200 bg-gray-50 text-[#1a1a1a] hover:bg-gray-100'
                      }`}
                    >
                      <div>{slot.label}</div>
                      <div className="text-[10px] opacity-80">{slot.time}</div>
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#20493c] mb-1">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Rahul Patel"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#20493c] text-sm text-[#1a1a1a]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#20493c] mb-1">
                    WhatsApp Mobile *
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="e.g. 9876543210"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#20493c] text-sm text-[#1a1a1a]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#20493c] mb-1">
                  Diet / Goal Preference
                </label>
                <select
                  value={dietPreference}
                  onChange={(e) => setDietPreference(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#20493c] text-sm text-[#1a1a1a] bg-white"
                >
                  <option value="High Protein (Paneer, Sprouts, Chickpeas)">High Protein (Paneer, Sprouts, Chickpeas)</option>
                  <option value="Weight Loss & Fat Burn (Veggies & Detox)">Weight Loss &amp; Fat Burn (Veggies &amp; Detox)</option>
                  <option value="Exotic & Crunchy Mix">Exotic &amp; Crunchy Mix</option>
                  <option value="Jain / Strictly No Onion & Garlic">Satvik / Strictly No Onion &amp; Garlic</option>
                  <option value="Chef's Daily Surprise Rotation">Chef&apos;s Daily Surprise Rotation (All 21 Salads)</option>
                </select>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5 flex-wrap gap-1">
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#20493c]">
                    Surat Delivery Address
                  </label>
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => setIsMapPickerOpen(true)}
                      className="inline-flex items-center gap-1 text-[10px] font-bold text-[#20493c] hover:text-[#123B2B] bg-[#fbce45]/30 hover:bg-[#fbce45]/50 px-2.5 py-1 rounded-full border border-[#fbce45] transition-all cursor-pointer shadow-2xs active:scale-95"
                    >
                      <MapPin className="w-3 h-3 text-[#20493c]" />
                      <span>📍 Google Map Pin</span>
                    </button>

                    <button
                      type="button"
                      onClick={handleGetCurrentLocation}
                      disabled={isLocating}
                      className="inline-flex items-center gap-1 text-[10px] font-bold text-[#20493c] hover:text-[#123B2B] bg-[#e8f7f2] hover:bg-[#d5f0e6] px-2.5 py-1 rounded-full border border-[#6ac6ac]/40 transition-all cursor-pointer shadow-2xs active:scale-95"
                    >
                      {isLocating ? (
                        <>
                          <Loader2 className="w-3 h-3 animate-spin text-[#20493c]" />
                          <span>Detecting GPS...</span>
                        </>
                      ) : (
                        <>
                          <Navigation className="w-3 h-3 text-[#20493c]" />
                          <span>🎯 Live GPS</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {locationSuccessMsg && (
                  <div className="mb-1.5 flex items-center justify-between gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200 animate-fadeIn">
                    <div className="flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3 text-emerald-600 flex-shrink-0" />
                      <span>{locationSuccessMsg}</span>
                    </div>
                    {locationCoords && (
                      <a
                        href={`https://maps.google.com/?q=${locationCoords.lat},${locationCoords.lng}`}
                        target="_blank"
                        rel="noreferrer"
                        className="text-[10px] underline text-emerald-800 font-bold hover:text-emerald-950"
                      >
                        View Pin &rarr;
                      </a>
                    )}
                  </div>
                )}

                <textarea
                  rows={2}
                  placeholder="Flat / House No., Society / Building, Area, Surat (or tap Use Current Location / Quick Area below)"
                  value={deliveryAddress}
                  onChange={(e) => setDeliveryAddress(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#20493c] text-sm text-[#1a1a1a]"
                />

                {/* Quick Area Chips */}
                <div className="mt-2">
                  <span className="text-[10px] font-bold text-gray-500 block mb-1">
                    📍 Quick Tap Surat Area / Locality:
                  </span>
                  <div className="flex flex-wrap gap-1.5 max-h-16 overflow-y-auto pr-1">
                    {SURAT_POPULAR_AREAS.map((area) => (
                      <button
                        key={area}
                        type="button"
                        onClick={() => handleSelectSuratArea(area)}
                        className={`text-[10px] font-semibold px-2 py-0.5 rounded-lg border transition-all cursor-pointer ${
                          deliveryAddress.includes(area)
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

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full py-3.5 px-6 rounded-2xl bg-[#20493c] hover:bg-[#15342a] active:scale-95 text-white font-bold text-sm sm:text-base flex items-center justify-center gap-2 shadow-lg transition-all"
                >
                  <Phone className="w-4 h-4 text-[#fbce45]" />
                  <span>Confirm Subscription via WhatsApp</span>
                </button>
                <p className="text-[11px] text-center text-gray-500 mt-2">
                  🔒 No upfront card needed • Free sample day booking on request
                </p>
              </div>
            </form>

          </div>
        </div>
      </div>
      )}

      {/* Google Map Interactive Location Picker Modal */}
      <GoogleMapPickerModal
        isOpen={isMapPickerOpen}
        onClose={() => setIsMapPickerOpen(false)}
        initialAddress={deliveryAddress}
        initialLat={locationCoords?.lat || 21.1702}
        initialLng={locationCoords?.lng || 72.8311}
        onConfirmLocation={(loc) => {
          setDeliveryAddress(loc.address);
          setLocationCoords({ lat: loc.lat, lng: loc.lng });
          setLocationSuccessMsg('📍 Google Map Location Attached');
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
