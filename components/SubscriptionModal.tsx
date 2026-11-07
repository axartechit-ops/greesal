import React, { useState, useEffect, useMemo } from 'react';
import { X, Check, Sparkles, Phone, MapPin, Navigation, Loader2, CheckCircle2 } from 'lucide-react';
import { GoogleMapPickerModal } from './GoogleMapPickerModal';
import { OrderConfirmationModal, ConfirmedOrderData } from './OrderConfirmationModal';
import {
  SubscriptionDailyMenu,
  SubscriptionPlan,
  SubscriptionSaladSelection,
  DEFAULT_SUBSCRIPTION_PLANS,
} from '@/lib/siteSettings';
import { getSaladImages, Salad } from '@/lib/salads';

interface SubscriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultPlan?: string;
  plans?: SubscriptionPlan[];
  modalBadge?: string;
  modalTitle?: string;
  modalSubtitle?: string;
  dailyMenus?: SubscriptionDailyMenu[];
  salads?: Salad[];
  isLoadingSalads?: boolean;
  initialStartDate?: string;
  initialSaladSelections?: Record<string, string>;
}

const getSaladId = (salad: Salad) => salad.id || salad._id || salad.slug || salad.name;
const EMPTY_SUBSCRIPTION_DAILY_MENUS: SubscriptionDailyMenu[] = [];

const getWeekStartDate = (dateString: string) => {
  const date = new Date(`${dateString}T00:00:00`);
  date.setDate(date.getDate() - ((date.getDay() + 6) % 7));
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
};

const getNextDeliveryDates = (startDate: string, dayCount: number) => {
  const date = new Date(`${startDate}T00:00:00`);
  const dates: string[] = [];
  while (dates.length < dayCount) {
    if (date.getDay() === 0) date.setDate(date.getDate() + 1);
    dates.push(`${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`);
    date.setDate(date.getDate() + 1);
  }
  return dates;
};

export const SubscriptionModal: React.FC<SubscriptionModalProps> = ({
  isOpen,
  onClose,
  defaultPlan = 'weekly',
  plans,
  modalBadge,
  modalTitle,
  modalSubtitle,
  dailyMenus = EMPTY_SUBSCRIPTION_DAILY_MENUS,
  salads = [],
  isLoadingSalads = false,
  initialStartDate,
  initialSaladSelections,
}) => {
  const [loadedPlans, setLoadedPlans] = useState<SubscriptionPlan[]>(plans || DEFAULT_SUBSCRIPTION_PLANS);
  const [loadedDailyMenus, setLoadedDailyMenus] = useState<SubscriptionDailyMenu[]>(dailyMenus);
  const [badgeText, setBadgeText] = useState(modalBadge || 'Farm-Fresh Organic Salad Bowls');
  const [titleText, setTitleText] = useState(modalTitle || 'Greesal Subscriptions');
  const [subtitleText, setSubtitleText] = useState(
    modalSubtitle || 'Daily rotation of 21+ varieties • 100% handmade dressings • Free delivery in Surat'
  );

  useEffect(() => {
    if (plans && plans.length > 0) {
      setLoadedPlans(plans);
    }
  }, [plans]);

  useEffect(() => {
    setLoadedDailyMenus(dailyMenus);
  }, [dailyMenus]);

  useEffect(() => {
    if (modalBadge) setBadgeText(modalBadge);
    if (modalTitle) setTitleText(modalTitle);
    if (modalSubtitle) setSubtitleText(modalSubtitle);
  }, [modalBadge, modalTitle, modalSubtitle]);

  useEffect(() => {
    if (isOpen) {
      fetch('/api/settings')
        .then((res) => res.json())
        .then((data) => {
          if (Array.isArray(data.subscriptionPlans) && data.subscriptionPlans.length > 0) {
            setLoadedPlans(data.subscriptionPlans);
          }
          if (Array.isArray(data.subscriptionDailyMenus)) {
            setLoadedDailyMenus(data.subscriptionDailyMenus);
          }
          if (data.subscriptionModalBadge) setBadgeText(data.subscriptionModalBadge);
          if (data.subscriptionModalTitle) setTitleText(data.subscriptionModalTitle);
          if (data.subscriptionModalSubtitle) setSubtitleText(data.subscriptionModalSubtitle);
        })
        .catch(() => {});
    }
  }, [isOpen]);

  const activePlans = loadedPlans.filter((p) => p.isActive !== false);
  const plansList = activePlans.length > 0 ? activePlans : DEFAULT_SUBSCRIPTION_PLANS;

  const [selectedPlanId, setSelectedPlanId] = useState<string>(() => {
    return defaultPlan || plansList.find((p) => p.isPopular)?.id || plansList[0]?.id || 'weekly';
  });

  useEffect(() => {
    if (!plansList.some((p) => p.id === selectedPlanId)) {
      setSelectedPlanId(plansList.find((p) => p.isPopular)?.id || plansList[0]?.id || 'weekly');
    }
  }, [plansList, selectedPlanId]);

  const activePlan = plansList.find((p) => p.id === selectedPlanId) || plansList[0];
  const planDayCount = Math.max(
    1,
    Math.floor(Number(activePlan?.daysCount) || Number.parseInt(activePlan?.duration || '', 10) || 1)
  );

  const availableDailyMenus = useMemo(() => {
    const now = new Date();
    const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;

    const menusByDate = new Map(
      loadedDailyMenus
        .filter((menu) => menu.date >= today && Array.isArray(menu.saladIds))
        .map((menu) => [menu.date, menu])
    );
    return [...menusByDate.values()]
      .map((menu) => ({
        date: menu.date,
        options: menu.saladIds
          .map((saladId) => salads.find((salad) => getSaladId(salad) === saladId))
          .filter((salad): salad is Salad => Boolean(salad)),
      }))
      .filter((menu) => menu.options.length === 2 && getSaladId(menu.options[0]) !== getSaladId(menu.options[1]))
      .sort((a, b) => a.date.localeCompare(b.date));
  }, [loadedDailyMenus, salads]);

  const menusByDate = useMemo(
    () => new Map(availableDailyMenus.map((menu) => [menu.date, menu])),
    [availableDailyMenus]
  );
  const eligibleStartDates = useMemo(
    () => availableDailyMenus
      .filter((menu) => new Date(`${menu.date}T00:00:00`).getDay() === 1)
      .filter((menu) => getNextDeliveryDates(menu.date, planDayCount).every((date) => menusByDate.has(date)))
      .map((menu) => menu.date),
    [availableDailyMenus, menusByDate, planDayCount]
  );
  const [selectedSubscriptionStartDate, setSelectedSubscriptionStartDate] = useState('');
  const [selectedSubscriptionSalads, setSelectedSubscriptionSalads] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!isOpen) return;
    if (initialStartDate && eligibleStartDates.includes(initialStartDate)) {
      setSelectedSubscriptionStartDate(initialStartDate);
      setSelectedSubscriptionSalads(initialSaladSelections || {});
      return;
    }
    if (!eligibleStartDates.includes(selectedSubscriptionStartDate)) {
      setSelectedSubscriptionStartDate(eligibleStartDates[0] || '');
      setSelectedSubscriptionSalads({});
    }
  }, [
    eligibleStartDates,
    initialSaladSelections,
    initialStartDate,
    isOpen,
  ]);

  const subscriptionMenus = eligibleStartDates.includes(selectedSubscriptionStartDate)
    ? getNextDeliveryDates(selectedSubscriptionStartDate, planDayCount)
        .map((date) => menusByDate.get(date))
        .filter((menu): menu is (typeof availableDailyMenus)[number] => Boolean(menu))
    : [];
  const subscriptionWeeks = subscriptionMenus.reduce<Array<{
    weekStart: string;
    menus: Array<(typeof availableDailyMenus)[number]>;
  }>>(
    (weeks, menu) => {
      const weekStart = getWeekStartDate(menu.date);
      const currentWeek = weeks[weeks.length - 1];
      if (currentWeek?.weekStart === weekStart) currentWeek.menus.push(menu);
      else weeks.push({ weekStart, menus: [menu] });
      return weeks;
    },
    []
  );
  const selectedSubscriptionSaladsForPlan = subscriptionMenus.flatMap((menu) => {
    const salad = menu.options.find((option) => getSaladId(option) === selectedSubscriptionSalads[menu.date]);
    return salad
      ? [{
          date: menu.date,
          saladId: getSaladId(salad),
          saladName: salad.name,
          salad,
        }]
      : [];
  });
  const isSubscriptionSelectionComplete =
    subscriptionMenus.length === planDayCount && selectedSubscriptionSaladsForPlan.length === planDayCount;

  const [deliverySlot, setDeliverySlot] = useState<'lunch' | 'evening' | 'pickup'>('lunch');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [dietPreference, setDietPreference] = useState('Standard (High Protein & Veggies)');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

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



  const handleBookOnWhatsApp = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);
    if (!fullName.trim() || phone.replace(/\D/g, '').length < 10 || !deliveryAddress.trim()) {
      setSubmitError('Enter your name, a valid 10-digit mobile number, and delivery address to continue.');
      return;
    }
    if (!isSubscriptionSelectionComplete) {
      setSubmitError(`Choose one scheduled salad for each of the ${planDayCount} delivery days.`);
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

    const slotNames: Record<string, string> = {
      immediate: 'Immediate Delivery (30-45 Mins)',
      lunch: 'Lunch Slot (11:00 AM - 2:00 PM)',
      evening: 'Evening Slot (4:00 PM - 7:00 PM)',
      pickup: 'Self PickUp (10:00 AM - 6:30 PM)',
    };

    const orderNumber = `SUB-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).slice(2, 7).toUpperCase()}`;
    const subscriptionSelections: SubscriptionSaladSelection[] = selectedSubscriptionSaladsForPlan.map(
      ({ date, saladId, saladName }) => ({ date, saladId, saladName })
    );
    const formattedSelections = subscriptionSelections.map(({ date, saladName }) => {
      const formattedDate = new Date(`${date}T00:00:00`).toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      });
      return `${formattedDate}: ${saladName}`;
    });
    const subscriptionId = orderNumber;
    const subscriptionNotes =
      `Plan: ${activePlan.name}; Daily choices: ${formattedSelections.join('; ')}; ` +
      `Preference: ${dietPreference}`;
    const totalPrice = Math.round(activePlan.totalPrice);
    const dailyPrice = Math.floor(totalPrice / planDayCount);
    const extraRupees = totalPrice - dailyPrice * planDayCount;

    const mapsLink = locationCoords
      ? `https://maps.google.com/?q=${locationCoords.lat},${locationCoords.lng}`
      : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(deliveryAddress.trim())}`;

    const orderPayload: ConfirmedOrderData = {
      orderNumber,
      orderType: 'subscription',
      subscriptionId,
      subscriptionPlan: activePlan.name,
      subscriptionDate: subscriptionSelections[0].date,
      subscriptionSalad: subscriptionSelections[0].saladName,
      subscriptionSelections,
      customerName: fullName.trim(),
      customerMobile: phone.trim(),
      deliveryAddress: deliveryAddress.trim(),
      deliverySlot: slotNames[deliverySlot],
      mapsUrl: mapsLink,
      notes: subscriptionNotes,
      items: selectedSubscriptionSaladsForPlan.map(({ date, salad }, index) => ({
        name: `${salad.name} (${new Date(`${date}T00:00:00`).toLocaleDateString('en-IN', {
          day: 'numeric',
          month: 'short',
          year: 'numeric',
        })})`,
        price: `₹${dailyPrice + (index < extraRupees ? 1 : 0)}`,
        image: getSaladImages(salad)[0],
        quantity: 1,
      })),
      total: totalPrice,
      paymentMethod: 'Pre-Booking / Cash or UPI',
    };

    setIsSubmitting(true);
    try {
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderNumber,
          subscriptionId,
          subscriptionPlan: activePlan.name,
          subscriptionDate: subscriptionSelections[0].date,
          subscriptionSalad: subscriptionSelections[0].saladName,
          subscriptionSelections,
          customerName: fullName.trim(),
          customerMobile: phone.trim(),
          deliveryAddress: deliveryAddress.trim(),
          deliverySlot: slotNames[deliverySlot],
          mapsUrl: mapsLink,
          locationCoords,
          notes: subscriptionNotes,
          items: orderPayload.items,
          subtotal: totalPrice,
          deliveryFee: 0,
          total: totalPrice,
          orderType: 'subscription',
          dietPreference,
          paymentMethod: 'Subscription / Post Delivery',
          status: 'Placed',
        }),
      });
      if (!response.ok) {
        const data = await response.json().catch(() => null);
        throw new Error(data?.detail || data?.error || 'Could not save your subscription. Please try again.');
      }
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'Could not save your subscription. Please try again.');
      return;
    } finally {
      setIsSubmitting(false);
    }

    try {
      localStorage.setItem('greesal_custom_name', fullName.trim());
      localStorage.setItem('greesal_custom_mobile', phone.trim());
      localStorage.setItem('greesal_user_address', deliveryAddress.trim());
      const orderHistory = JSON.parse(localStorage.getItem('greesal_orders_history') || '[]');
      const historyRecord = {
        id: subscriptionId,
        orderNumber: subscriptionId,
        subscriptionId,
        orderType: 'subscription',
        subscriptionPlan: activePlan.name,
        subscriptionDate: subscriptionSelections[0].date,
        subscriptionSalad: subscriptionSelections[0].saladName,
        subscriptionSelections,
        date: `Today, ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`,
        timestamp: Date.now(),
        status: 'Placed',
        items: orderPayload.items,
        subtotal: totalPrice,
        deliveryFee: 0,
        total: totalPrice,
        deliveryAddress: deliveryAddress.trim(),
        paymentMethod: 'Subscription / Post Delivery',
      };
      localStorage.setItem(
        'greesal_orders_history',
        JSON.stringify([historyRecord, ...(Array.isArray(orderHistory) ? orderHistory : [])])
      );
    } catch (err) {
      console.warn('Subscription was saved, but local order history could not be updated:', err);
    }

    // Open WhatsApp Message
    const message = `🥗 *NEW SUBSCRIPTION REQUEST - GREESAL* 🥗\n\n` +
      `🆔 *Subscription ID:* ${orderNumber}\n` +
      `👤 *Customer Name:* ${fullName.trim()}\n` +
      `📞 *WhatsApp Mobile:* ${phone.trim()}\n` +
      `📋 *Plan Selected:* ${activePlan.name} (₹${activePlan.pricePerSalad}/salad - Total: ₹${totalPrice})\n` +
      `🥗 *Daily salad choices:*\n${formattedSelections.map((selection) => `• ${selection}`).join('\n')}\n` +
      `⏰ *Delivery Slot:* ${slotNames[deliverySlot]}\n` +
      `🥗 *Diet Preference:* ${dietPreference}\n` +
      `📍 *Delivery Address:* ${deliveryAddress.trim()}\n` +
      (mapsLink ? `🗺️ *Live GPS Location Pin:* ${mapsLink}\n\n` : '\n') +
      `✨ *Farm-Fresh Organic Salad Bowls! Please confirm my subscription details.*`;

    const encoded = encodeURIComponent(message);
    window.open(`https://wa.me/919925836117?text=${encoded}`, '_blank');

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
                <Sparkles className="w-3.5 h-3.5" /> {badgeText}
              </span>
              <h3 className="font-montserrat font-extrabold text-2xl sm:text-3xl text-[#20493c]">
                {titleText}
              </h3>
              <p className="text-xs sm:text-sm text-[#20493c]/80 mt-1">
                {subtitleText}
              </p>
            </div>

            {/* Dynamic Plan Selector Buttons */}
            <div className={`grid gap-3 mb-6 ${plansList.length === 1 ? 'grid-cols-1' : plansList.length === 2 ? 'grid-cols-2' : 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3'}`}>
              {plansList.map((plan) => {
                const isSelected = selectedPlanId === plan.id;
                return (
                  <button
                    key={plan.id}
                    type="button"
                    onClick={() => {
                      setSelectedPlanId(plan.id);
                      setSelectedSubscriptionSalads({});
                    }}
                    className={`p-4 rounded-2xl border-2 text-left relative transition-all cursor-pointer ${
                      isSelected
                        ? 'border-[#20493c] bg-[#e8f7f2] shadow-sm'
                        : 'border-gray-200 hover:border-gray-300 bg-white'
                    }`}
                  >
                    {(plan.badge || plan.saving) && (
                      <span className="absolute -top-2.5 right-3 bg-[#fbce45] text-[#20493c] text-[10px] font-black px-2 py-0.5 rounded-full shadow-sm">
                        {plan.badge || plan.saving}
                      </span>
                    )}
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-bold text-[#20493c] uppercase">{plan.name}</span>
                      {isSelected && <Check className="w-4 h-4 text-[#20493c]" />}
                    </div>
                    <div className="font-montserrat font-black text-2xl text-[#20493c]">
                      ₹{plan.pricePerSalad}<span className="text-xs font-normal text-[#20493c]/70">/salad</span>
                    </div>
                    <p className="text-xs text-[#20493c]/80 font-medium mt-1">
                      {plan.duration} • Total ₹{plan.totalPrice.toLocaleString('en-IN')}
                    </p>
                    {plan.saving && plan.saving !== 'Standard Plan' && (
                      <p className="text-[10px] text-emerald-700 font-bold mt-0.5">
                        {plan.saving}
                      </p>
                    )}
                  </button>
                );
              })}
            </div>

            <section className="mb-6 rounded-2xl border border-emerald-100 bg-emerald-50/60 p-4">
              <div className="mb-3">
                <h4 className="text-sm font-extrabold text-[#20493c]">Your weekly salad schedule</h4>
                <p className="text-xs text-[#20493c]/75 mt-1">
                  Starts Monday. Choose one of the two salads for each delivery day, Monday to Saturday. Sunday is a holiday.
                </p>
              </div>
              {eligibleStartDates.length > 0 ? (
                <>
                  {eligibleStartDates.length > 1 && (
                    <label className="block text-xs font-bold text-[#20493c] mb-3">
                      Start date
                      <select
                        value={selectedSubscriptionStartDate}
                        onChange={(event) => {
                          setSelectedSubscriptionStartDate(event.target.value);
                          setSelectedSubscriptionSalads({});
                        }}
                        className="mt-1 w-full rounded-xl border border-emerald-200 bg-white px-3 py-2.5 text-sm"
                      >
                        {eligibleStartDates.map((date) => (
                          <option key={date} value={date}>
                            {new Date(`${date}T00:00:00`).toLocaleDateString('en-IN', {
                              weekday: 'long',
                              day: 'numeric',
                              month: 'short',
                              year: 'numeric',
                            })}
                          </option>
                        ))}
                      </select>
                    </label>
                  )}
                  <div className="space-y-4">
                    {subscriptionWeeks.map((week, weekIndex) => (
                      <section key={week.weekStart} className="overflow-hidden rounded-2xl border border-emerald-200 bg-white shadow-sm">
                        <div className="flex items-center justify-between gap-3 bg-[#20493c] px-4 py-3 text-white">
                          <div>
                            <h5 className="text-sm font-black">Week {weekIndex + 1}</h5>
                            <p className="mt-0.5 text-[11px] text-white/75">
                              {new Date(`${week.weekStart}T00:00:00`).toLocaleDateString('en-IN', {
                                day: 'numeric',
                                month: 'short',
                              })} – {new Date(`${week.menus[week.menus.length - 1].date}T00:00:00`).toLocaleDateString('en-IN', {
                                day: 'numeric',
                                month: 'short',
                                year: 'numeric',
                              })}
                            </p>
                          </div>
                          <span className="rounded-full bg-white/15 px-3 py-1 text-[10px] font-bold">
                            {week.menus.length} delivery days
                          </span>
                        </div>
                        <div className="space-y-3 p-3">
                          {week.menus.map((menu) => {
                            const dayDate = new Date(`${menu.date}T00:00:00`);
                            const dayName = dayDate.toLocaleDateString('en-IN', { weekday: 'long' });
                            return (
                              <div key={menu.date} className="rounded-xl border border-gray-100 bg-gray-50/80 p-3">
                                <div className="mb-2 flex items-center justify-between gap-2">
                                  <p className="text-xs font-extrabold text-[#20493c]">
                                    {dayName} · {dayDate.toLocaleDateString('en-IN', {
                                      day: 'numeric',
                                      month: 'short',
                                      year: 'numeric',
                                    })}
                                  </p>
                                  {selectedSubscriptionSalads[menu.date] && (
                                    <span className="rounded-full bg-emerald-100 px-2.5 py-1 text-[10px] font-bold text-emerald-800">
                                      Selected
                                    </span>
                                  )}
                                </div>
                                <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                                  {menu.options.map((salad, optionIndex) => {
                                    const saladId = getSaladId(salad);
                                    const isSelected = selectedSubscriptionSalads[menu.date] === saladId;
                                    return (
                                      <button
                                        key={saladId}
                                        type="button"
                                        onClick={() => setSelectedSubscriptionSalads((current) => ({
                                          ...current,
                                          [menu.date]: saladId,
                                        }))}
                                        aria-pressed={isSelected}
                                        className={`flex items-center justify-between gap-3 rounded-xl border-2 px-3 py-3 text-left transition-colors ${
                                          isSelected
                                            ? 'border-[#20493c] bg-emerald-50 shadow-sm'
                                            : 'border-gray-100 bg-white hover:border-emerald-200'
                                        }`}
                                      >
                                        <span className="flex min-w-0 items-center gap-2.5">
                                          <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-[10px] font-black text-[#20493c]">
                                            {optionIndex + 1}
                                          </span>
                                          <span className="min-w-0">
                                            <span className="block text-sm font-bold text-[#20493c]">{salad.name}</span>
                                            <span className="mt-0.5 block text-[11px] text-gray-500">{salad.tag}</span>
                                          </span>
                                        </span>
                                        {isSelected && <Check className="h-4 w-4 shrink-0 text-[#20493c]" />}
                                      </button>
                                    );
                                  })}
                                </div>
                              </div>
                            );
                          })}
                          <div className="flex items-center gap-2 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2.5 text-xs font-bold text-amber-900">
                            <span aria-hidden="true">☀️</span>
                            Sunday · Holiday — no delivery
                          </div>
                        </div>
                      </section>
                    ))}
                  </div>
                </>
              ) : (
                <p className="rounded-xl border border-amber-200 bg-amber-50 px-3 py-2.5 text-xs font-semibold text-amber-800">
                  {isLoadingSalads
                    ? 'Loading the daily salad choices...'
                    : `Greesal has not published two salad choices for every day of an upcoming Monday–Saturday week yet. Sunday is a holiday. Please try again after the admin publishes the full week.`}
                </p>
              )}
              {eligibleStartDates.length > 0 && (
                <p className="mt-3 text-[11px] font-semibold text-[#20493c]/75">
                  {selectedSubscriptionSaladsForPlan.length} of {planDayCount} delivery days selected.
                </p>
              )}
            </section>

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
                  required
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

              {submitError && (
                <p role="alert" className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-xs font-semibold text-red-700">
                  {submitError}
                </p>
              )}

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={!isSubscriptionSelectionComplete || isSubmitting}
                  className="w-full py-3.5 px-6 rounded-2xl bg-[#20493c] hover:bg-[#15342a] active:scale-95 text-white font-bold text-sm sm:text-base flex items-center justify-center gap-2 shadow-lg transition-all disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <Phone className="w-4 h-4 text-[#fbce45]" />
                  <span>{isSubmitting ? 'Saving Subscription...' : 'Buy Subscription via WhatsApp'}</span>
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
