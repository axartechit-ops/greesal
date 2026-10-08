'use client';

import React, { useState, useEffect } from 'react';
import { signOut } from 'next-auth/react';
import { getLiveDetailedLocation } from '@/lib/geolocation';
import { InvoiceModal, InvoiceOrder } from './InvoiceModal';
import { sendOrderToWhatsApp } from '@/lib/whatsapp';
import { WhatsAppIcon } from './WhatsAppIcon';
import { 
  User, 
  ShoppingBag, 
  PackageCheck, 
  Clock, 
  MapPin, 
  Phone, 
  Mail, 
  CheckCircle2, 
  RotateCcw, 
  FileText, 
  Sparkles, 
  X, 
  Edit3, 
  Save, 
  ShieldCheck, 
  Truck, 
  Calendar, 
  Search, 
  Heart,
  ChevronRight,
  Utensils,
  LogOut,
  Settings,
  Bell,
  Award,
  Flame,
  Check,
  AlertCircle,
  LocateFixed,
  Loader2,
  MessageSquare,
  Activity,
  Zap,
  TrendingUp
} from 'lucide-react';

export interface OrderItem {
  id: string;
  name: string;
  price: string;
  image: string;
  quantity: number;
  selectedAddOns?: Array<{ name: string; price: number }>;
}

export interface Order {
  id: string;
  date: string;
  timestamp: number;
  status: 'Delivered' | 'On the Way' | 'Preparing' | 'Placed';
  items: OrderItem[];
  subtotal: number;
  deliveryFee: number;
  total: number;
  deliveryAddress: string;
  paymentMethod: string;
}

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  displayName: string;
  displayEmail: string;
  displayMobile: string;
  userImage?: string | null;
  onUpdateProfile: (name: string, mobile: string, address: string) => void;
  onReorder: (items: OrderItem[]) => void;
}

// Realistic initial demo orders
const INITIAL_DEMO_ORDERS: Order[] = [
  {
    id: 'GRS-84920',
    date: 'Today, 1:15 PM',
    timestamp: Date.now() - 1000 * 60 * 60 * 2,
    status: 'Delivered',
    items: [
      {
        id: '1',
        name: 'Premium High Protein Salad',
        price: '₹349',
        image: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=600&q=80',
        quantity: 1
      },
      {
        id: '2',
        name: 'Premium Burrito Salad',
        price: '₹369',
        image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=600&q=80',
        quantity: 1
      }
    ],
    subtotal: 718,
    deliveryFee: 0,
    total: 718,
    deliveryAddress: 'Flat 402, Green Valley Heights, Katargam, Surat - 395004',
    paymentMethod: 'Google Pay (UPI)'
  },
  {
    id: 'GRS-79214',
    date: 'Yesterday, 7:45 PM',
    timestamp: Date.now() - 1000 * 60 * 60 * 26,
    status: 'Delivered',
    items: [
      {
        id: '3',
        name: 'Crunchy Peanut Butter Salad',
        price: '₹329',
        image: 'https://images.unsplash.com/photo-1505253716362-afaea1d3d1af?auto=format&fit=crop&w=600&q=80',
        quantity: 2
      }
    ],
    subtotal: 658,
    deliveryFee: 0,
    total: 658,
    deliveryAddress: 'Flat 402, Green Valley Heights, Katargam, Surat - 395004',
    paymentMethod: 'Online UPI'
  },
  {
    id: 'GRS-61803',
    date: '22 Aug 2026, 12:30 PM',
    timestamp: Date.now() - 1000 * 60 * 60 * 24 * 5,
    status: 'Delivered',
    items: [
      {
        id: '4',
        name: 'Super Sprout Salad Bowl',
        price: '₹299',
        image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&q=80',
        quantity: 1
      }
    ],
    subtotal: 299,
    deliveryFee: 0,
    total: 299,
    deliveryAddress: 'Katargam, Surat - 395004',
    paymentMethod: 'Cash on Delivery'
  }
];

export function ProfileModal({
  isOpen,
  onClose,
  displayName,
  displayEmail,
  displayMobile,
  userImage,
  onUpdateProfile,
  onReorder
}: ProfileModalProps) {
  const [activeTab, setActiveTab] = useState<'orders' | 'profile' | 'nutrition' | 'settings'>('orders');
  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Invoice Bill modal state
  const [invoiceOrder, setInvoiceOrder] = useState<InvoiceOrder | null>(null);
  const [isInvoiceOpen, setIsInvoiceOpen] = useState(false);

  // Editable Profile States
  const [isEditing, setIsEditing] = useState(false);
  const [nameInput, setNameInput] = useState(displayName);
  const [mobileInput, setMobileInput] = useState(displayMobile);
  const [addressInput, setAddressInput] = useState('Flat 402, Green Valley Heights, Katargam, Surat - 395004');
  const [addressLabel, setAddressLabel] = useState('Home');
  const [dietPreference, setDietPreference] = useState('High Protein / Low Carb');
  const [healthGoal, setHealthGoal] = useState('Muscle Building & Active Energy');
  const [allergiesInput, setAllergiesInput] = useState('None (All fresh greens welcome)');
  const [dailyWaterGoal, setDailyWaterGoal] = useState('3.5 Liters');
  const [saveSuccessMsg, setSaveSuccessMsg] = useState(false);
  const [showSignOutConfirm, setShowSignOutConfirm] = useState(false);
  const [isDetectingLocation, setIsDetectingLocation] = useState(false);

  // Load profile and orders from localStorage
  useEffect(() => {
    if (!isOpen) return;

    setNameInput(displayName);
    setMobileInput(displayMobile);

    const savedAddress = localStorage.getItem('greesal_user_address');
    if (savedAddress) setAddressInput(savedAddress);

    const savedAddressLabel = localStorage.getItem('greesal_user_address_label');
    if (savedAddressLabel) setAddressLabel(savedAddressLabel);

    const savedDiet = localStorage.getItem('greesal_user_diet');
    if (savedDiet) setDietPreference(savedDiet);

    const savedGoal = localStorage.getItem('greesal_user_goal');
    if (savedGoal) setHealthGoal(savedGoal);

    const savedAllergies = localStorage.getItem('greesal_user_allergies');
    if (savedAllergies) setAllergiesInput(savedAllergies);

    const storedOrders = localStorage.getItem('greesal_orders_history');
    if (storedOrders) {
      try {
        const parsed = JSON.parse(storedOrders);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setOrders(parsed);
          return;
        }
      } catch (e) {
        console.error('Failed to parse orders:', e);
      }
    }

    setOrders(INITIAL_DEMO_ORDERS);
    localStorage.setItem('greesal_orders_history', JSON.stringify(INITIAL_DEMO_ORDERS));
  }, [isOpen, displayName, displayMobile]);

  if (!isOpen) return null;

  const handleUseCurrentLocation = async () => {
    setIsDetectingLocation(true);
    try {
      const loc = await getLiveDetailedLocation();
      setAddressInput(loc.formattedAddress);
      setIsEditing(true);
    } catch (err: any) {
      alert(err.message || 'Could not detect location. Please enter address manually.');
    } finally {
      setIsDetectingLocation(false);
    }
  };

  const handleSaveProfile = () => {
    localStorage.setItem('greesal_user_address', addressInput);
    localStorage.setItem('greesal_user_address_label', addressLabel);
    localStorage.setItem('greesal_user_diet', dietPreference);
    localStorage.setItem('greesal_user_goal', healthGoal);
    localStorage.setItem('greesal_user_allergies', allergiesInput);
    onUpdateProfile(nameInput, mobileInput, addressInput);
    setIsEditing(false);
    setSaveSuccessMsg(true);
    setTimeout(() => setSaveSuccessMsg(false), 3000);
  };

  const handleSignOut = async () => {
    localStorage.removeItem('greesal_custom_name');
    localStorage.removeItem('greesal_custom_mobile');
    document.cookie = 'greesal_auth_mode=; path=/; max-age=0';
    document.cookie = 'greesal_custom_mobile=; path=/; max-age=0';
    try {
      await signOut({ redirect: false });
    } catch (e) {
      console.error('SignOut error:', e);
    }
    window.location.href = '/';
  };

  const initialLetter = (nameInput || displayName || 'G').charAt(0).toUpperCase();

  // Filtered orders
  const filteredOrders = orders.filter(order => {
    const matchesFilter = filterStatus === 'all' || order.status.toLowerCase() === filterStatus.toLowerCase();
    const matchesSearch = searchQuery === '' || 
      order.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.items.some(item => item.name.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesFilter && matchesSearch;
  });

  const getStatusColor = (status: Order['status']) => {
    switch (status) {
      case 'Delivered':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'On the Way':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'Preparing':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'Placed':
        return 'bg-purple-50 text-purple-700 border-purple-200';
      default:
        return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  const totalSpent = orders.reduce((sum, o) => sum + o.total, 0);
  const totalSaladBowls = orders.reduce((sum, o) => sum + o.items.reduce((s, i) => s + i.quantity, 0), 0);

  return (
    <div className="fixed inset-0 z-50 bg-[#0C2A20]/65 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-white rounded-[32px] max-w-4xl w-full shadow-2xl border border-greesal-beige/80 relative flex flex-col max-h-[92vh] overflow-hidden">
        
        {/* Top Header Banner */}
        <div className="relative bg-gradient-to-br from-[#123B2B] via-[#174634] to-[#0A231A] p-5 sm:p-7 text-white flex-shrink-0 overflow-hidden">
          {/* Subtle decorative background circles */}
          <div className="absolute -top-16 -right-16 w-56 h-56 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />
          <div className="absolute -bottom-20 -left-20 w-48 h-48 bg-[#C89D4B]/10 rounded-full blur-2xl pointer-events-none" />

          {/* Top Utilities Row: Section Tag & Action Controls */}
          <div className="flex items-center justify-between gap-3 pb-3.5 mb-4 border-b border-white/10 relative z-10">
            <div className="flex items-center gap-2 text-xs font-bold text-greesal-beige/80 uppercase tracking-widest">
              <Sparkles className="w-3.5 h-3.5 text-[#C89D4B]" />
              <span>Greesal Member Profile</span>
            </div>

            <div className="flex items-center gap-2">
              {/* Direct Sign Out Button */}
              <button
                type="button"
                onClick={() => setShowSignOutConfirm(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-red-500/20 hover:bg-red-500 text-red-100 hover:text-white border border-red-400/30 text-xs font-bold transition-all cursor-pointer shadow-sm backdrop-blur-sm"
                title="Sign Out of Greesal"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Sign Out</span>
              </button>

              {/* Close Modal Button */}
              <button
                type="button"
                onClick={onClose}
                className="w-8 h-8 rounded-xl bg-white/10 hover:bg-white/20 backdrop-blur-md flex items-center justify-center text-white border border-white/20 transition-all cursor-pointer"
                title="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* User Hero Section & Metrics */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-5 relative z-10">
            <div className="flex items-center gap-4 sm:gap-5">
              <div className="relative group">
                {userImage ? (
                  <img
                    src={userImage}
                    alt={displayName}
                    className="w-16 h-16 sm:w-18 sm:h-18 rounded-2xl object-cover border-2 border-[#C89D4B] shadow-xl ring-4 ring-emerald-900/40"
                  />
                ) : (
                  <div className="w-16 h-16 sm:w-18 sm:h-18 rounded-2xl bg-gradient-to-tr from-[#1E5640] to-[#2D7A5B] text-white flex items-center justify-center font-serif font-black text-2xl sm:text-3xl border-2 border-[#C89D4B] shadow-xl ring-4 ring-emerald-900/40">
                    {initialLetter}
                  </div>
                )}
                <span className="absolute -bottom-1 -right-1 bg-emerald-400 w-3.5 h-3.5 rounded-full border-2 border-[#123B2B] shadow-xs" title="Active Verified Member" />
              </div>

              <div className="text-left space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white leading-tight">
                    {nameInput || displayName}
                  </h2>
                  <span className="bg-white/20 text-white text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider shadow-sm flex items-center gap-1 border border-white/20">
                    <ShieldCheck className="w-3 h-3 text-emerald-300" /> Google Verified
                  </span>
                </div>

                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-greesal-beige/85 font-medium">
                  {displayEmail && (
                    <span className="flex items-center gap-1">
                      <Mail className="w-3.5 h-3.5 text-[#C89D4B]" /> {displayEmail}
                    </span>
                  )}
                  {(mobileInput || displayMobile) && (
                    <span className="flex items-center gap-1 font-semibold text-emerald-200">
                      <Phone className="w-3.5 h-3.5 text-[#C89D4B]" /> {mobileInput || displayMobile}
                    </span>
                  )}
                </div>

                <p className="text-[11px] text-emerald-300/90 flex items-center gap-1.5 font-medium pt-0.5">
                  <Sparkles className="w-3 h-3 text-[#C89D4B]" /> 100% Organic &bull; Surat Farm Fresh Club
                </p>
              </div>
            </div>

            {/* Quick Metrics Badge Summary */}
            <div className="flex items-center justify-around sm:justify-start gap-3 bg-black/25 backdrop-blur-md p-3 rounded-2xl border border-white/10 shadow-inner flex-shrink-0">
              <div className="text-center px-2.5 sm:px-3">
                <span className="block text-lg sm:text-xl font-black text-white">{orders.length}</span>
                <span className="text-[9px] text-greesal-beige/70 uppercase font-extrabold tracking-wider">Orders</span>
              </div>
              <div className="w-[1px] h-8 bg-white/15" />
              <div className="text-center px-2.5 sm:px-3">
                <span className="block text-lg sm:text-xl font-black text-[#C89D4B]">{totalSaladBowls}</span>
                <span className="text-[9px] text-greesal-beige/70 uppercase font-extrabold tracking-wider">Bowls</span>
              </div>
              <div className="w-[1px] h-8 bg-white/15" />
              <div className="text-center px-2.5 sm:px-3">
                <span className="block text-lg sm:text-xl font-black text-emerald-400">₹{totalSpent}</span>
                <span className="text-[9px] text-greesal-beige/70 uppercase font-extrabold tracking-wider">Healthy Spend</span>
              </div>
            </div>
          </div>

          {/* Navigation Tabs Bar */}
          <div className="flex items-center gap-2 mt-5 pt-3.5 border-t border-white/15 overflow-x-auto no-scrollbar">
            <button
              onClick={() => { setActiveTab('orders'); setSelectedOrder(null); }}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer whitespace-nowrap ${
                activeTab === 'orders'
                  ? 'bg-white text-[#123B2B] shadow-md scale-100'
                  : 'text-white/80 hover:text-white hover:bg-white/10'
              }`}
            >
              <PackageCheck className="w-4 h-4" />
              <span>Order History ({orders.length})</span>
            </button>

            <button
              onClick={() => { setActiveTab('profile'); setSelectedOrder(null); }}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer whitespace-nowrap ${
                activeTab === 'profile'
                  ? 'bg-white text-[#123B2B] shadow-md scale-100'
                  : 'text-white/80 hover:text-white hover:bg-white/10'
              }`}
            >
              <User className="w-4 h-4" />
              <span>Personal Details</span>
            </button>

            <button
              onClick={() => { setActiveTab('nutrition'); setSelectedOrder(null); }}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer whitespace-nowrap ${
                activeTab === 'nutrition'
                  ? 'bg-white text-[#123B2B] shadow-md scale-100'
                  : 'text-white/80 hover:text-white hover:bg-white/10'
              }`}
            >
              <Utensils className="w-4 h-4" />
              <span>Dietary DNA</span>
            </button>

            <button
              onClick={() => { setActiveTab('settings'); setSelectedOrder(null); }}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer whitespace-nowrap ${
                activeTab === 'settings'
                  ? 'bg-white text-[#123B2B] shadow-md scale-100'
                  : 'text-white/80 hover:text-white hover:bg-white/10'
              }`}
            >
              <Settings className="w-4 h-4" />
              <span>Security &amp; Logout</span>
            </button>
          </div>
        </div>

        {/* Modal Body Container */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-7 bg-[#FAF6F0]/70">
          
          {/* TAB 1: ORDER HISTORY & TRACKING */}
          {activeTab === 'orders' && (
            <div className="space-y-5">
              {selectedOrder ? (
                /* Selected Order Detailed View */
                <div className="bg-white rounded-2xl p-6 border border-greesal-beige/90 shadow-sm space-y-6 animate-in slide-in-from-left duration-200 text-left">
                  <div className="flex items-center justify-between border-b border-gray-100 pb-4">
                    <button
                      onClick={() => setSelectedOrder(null)}
                      className="text-xs font-bold text-greesal-forest hover:text-emerald-700 flex items-center gap-1.5 cursor-pointer bg-greesal-lightgreen/60 px-3 py-1.5 rounded-lg border border-greesal-emerald/20 transition-colors"
                    >
                      &larr; Back to Order History
                    </button>
                    <span className={`px-3 py-1 rounded-full text-xs font-extrabold border uppercase tracking-wider ${getStatusColor(selectedOrder.status)}`}>
                      {selectedOrder.status}
                    </span>
                  </div>

                  {/* Summary Card */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs bg-greesal-cream p-4 rounded-xl border border-greesal-beige/80">
                    <div>
                      <p className="text-gray-500 font-semibold">Order ID</p>
                      <p className="font-extrabold text-greesal-dark text-sm mt-0.5">{selectedOrder.id}</p>
                    </div>
                    <div>
                      <p className="text-gray-500 font-semibold">Order Date</p>
                      <p className="font-bold text-greesal-dark mt-0.5">{selectedOrder.date}</p>
                    </div>
                    <div>
                      <p className="text-gray-500 font-semibold">Payment Mode</p>
                      <p className="font-bold text-emerald-800 mt-0.5">{selectedOrder.paymentMethod}</p>
                    </div>
                    <div>
                      <p className="text-gray-500 font-semibold">Delivery Fee</p>
                      <p className="font-bold text-emerald-600 mt-0.5">FREE (₹0)</p>
                    </div>
                  </div>

                  {/* Visual Tracker */}
                  <div className="bg-emerald-50/70 p-5 rounded-2xl border border-emerald-200/70">
                    <h4 className="text-xs font-black text-emerald-950 uppercase tracking-wider mb-4 flex items-center gap-2">
                      <Truck className="w-4 h-4 text-emerald-700" /> Real-Time Kitchen &amp; Delivery Status
                    </h4>
                    <div className="flex items-center justify-between relative px-2">
                      <div className="absolute left-6 right-6 top-1/2 -translate-y-1/2 h-1 bg-emerald-200/80 z-0" />
                      <div className="relative z-10 flex flex-col items-center gap-1.5 bg-emerald-50/90 px-1">
                        <div className="w-8 h-8 rounded-full bg-emerald-700 text-white flex items-center justify-center text-xs font-black shadow-sm">
                          <Check className="w-4 h-4 text-white" />
                        </div>
                        <span className="text-[10px] font-bold text-emerald-950">Placed</span>
                      </div>
                      <div className="relative z-10 flex flex-col items-center gap-1.5 bg-emerald-50/90 px-1">
                        <div className="w-8 h-8 rounded-full bg-emerald-700 text-white flex items-center justify-center text-xs font-black shadow-sm">
                          <Check className="w-4 h-4 text-white" />
                        </div>
                        <span className="text-[10px] font-bold text-emerald-950">Chef Prep</span>
                      </div>
                      <div className="relative z-10 flex flex-col items-center gap-1.5 bg-emerald-50/90 px-1">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-black shadow-sm ${
                          selectedOrder.status === 'Delivered' || selectedOrder.status === 'On the Way' ? 'bg-emerald-700 text-white' : 'bg-gray-200 text-gray-500'
                        }`}>
                          <Truck className="w-4 h-4" />
                        </div>
                        <span className="text-[10px] font-bold text-emerald-950">On the Way</span>
                      </div>
                      <div className="relative z-10 flex flex-col items-center gap-1.5 bg-emerald-50/90 px-1">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-black shadow-sm ${
                          selectedOrder.status === 'Delivered' ? 'bg-emerald-700 text-white' : 'bg-gray-200 text-gray-500'
                        }`}>
                          <CheckCircle2 className="w-4 h-4" />
                        </div>
                        <span className="text-[10px] font-bold text-emerald-950">Delivered</span>
                      </div>
                    </div>
                  </div>

                  {/* Items List */}
                  <div className="space-y-3">
                    <h4 className="font-bold text-sm text-greesal-dark flex items-center gap-2">
                      <ShoppingBag className="w-4 h-4 text-[#123B2B]" /> Salad Bowls in this Order
                    </h4>
                    {selectedOrder.items.map((item, idx) => (
                      <div key={idx} className="flex items-center justify-between p-3.5 rounded-xl border border-gray-100 bg-[#FAFAF8] hover:bg-white transition-colors">
                        <div className="flex items-center gap-3.5">
                          <img src={item.image} alt={item.name} className="w-14 h-14 object-cover rounded-xl border border-greesal-beige/80 flex-shrink-0" />
                          <div>
                            <p className="font-bold text-sm text-greesal-dark">{item.name}</p>
                            {item.selectedAddOns && item.selectedAddOns.length > 0 && (
                              <div className="flex flex-wrap gap-1 mt-1">
                                {item.selectedAddOns.map((addon, aIdx) => (
                                  <span key={aIdx} className="text-[10px] font-semibold bg-[#E8F3EE] text-[#144C38] px-1.5 py-0.5 rounded border border-[#237357]/20">
                                    + {addon.name} (+₹{addon.price})
                                  </span>
                                ))}
                              </div>
                            )}
                            <p className="text-xs text-gray-500 mt-0.5">Quantity: {item.quantity} &bull; {item.price} per bowl</p>
                          </div>
                        </div>
                        <span className="font-extrabold text-sm text-[#123B2B]">
                          ₹{(parseInt(item.price.replace(/[^\d]/g, '')) || 0) * item.quantity}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Delivery Location & Total */}
                  <div className="border-t border-gray-100 pt-4 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                    <div className="bg-gray-50 p-3.5 rounded-xl border border-gray-100 space-y-1">
                      <p className="text-gray-500 font-bold flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-emerald-700" /> Delivered To:
                      </p>
                      <p className="font-medium text-greesal-dark leading-relaxed">{selectedOrder.deliveryAddress}</p>
                    </div>

                    <div className="bg-greesal-cream p-3.5 rounded-xl border border-greesal-beige/80 space-y-1.5">
                      <div className="flex justify-between text-gray-600">
                        <span>Subtotal:</span>
                        <span className="font-bold">₹{selectedOrder.subtotal}</span>
                      </div>
                      <div className="flex justify-between text-gray-600">
                        <span>Express Delivery:</span>
                        <span className="text-emerald-700 font-bold">FREE</span>
                      </div>
                      <div className="border-t border-greesal-beige pt-1.5 flex justify-between text-sm font-black text-greesal-dark">
                        <span>Total Paid:</span>
                        <span className="text-[#123B2B] text-base">₹{selectedOrder.total}</span>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons: WhatsApp, Download Bill & Reorder */}
                  <div className="flex flex-col sm:flex-row gap-2.5">
                    <button
                      onClick={() => sendOrderToWhatsApp({
                        ...selectedOrder,
                        customerName: displayName,
                        customerEmail: displayEmail,
                        customerMobile: displayMobile
                      }, '9825144321')}
                      className="py-3 px-4 rounded-xl bg-[#25D366] hover:bg-[#20BD5A] text-white text-xs font-extrabold flex items-center justify-center gap-2 transition-all cursor-pointer shadow-xs"
                    >
                      <WhatsAppIcon className="w-4 h-4 text-white" />
                      <span>WhatsApp (9825144321)</span>
                    </button>

                    <button
                      onClick={() => {
                        setInvoiceOrder({
                          ...selectedOrder,
                          customerName: displayName,
                          customerEmail: displayEmail,
                          customerMobile: displayMobile
                        });
                        setIsInvoiceOpen(true);
                      }}
                      className="flex-1 py-3 px-4 rounded-xl bg-[#FAF6F0] hover:bg-[#F3EDE2] text-[#123B2B] border border-[#EBE2D3] text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer shadow-2xs"
                    >
                      <FileText className="w-4 h-4 text-[#C89D4B]" />
                      <span>Download Bill</span>
                    </button>

                    <button
                      onClick={() => {
                        onReorder(selectedOrder.items);
                        onClose();
                      }}
                      className="flex-1 py-3 px-4 rounded-xl bg-[#123B2B] hover:bg-[#1C4D3A] text-white text-xs font-bold flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer"
                    >
                      <RotateCcw className="w-4 h-4" />
                      <span>Reorder These Bowls</span>
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  {/* Search & Filter Header */}
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
                    <div className="relative w-full sm:w-80">
                      <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        placeholder="Search by order ID or salad name..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-9 pr-4 py-2 bg-white rounded-xl border border-greesal-beige text-xs text-greesal-dark focus:outline-none focus:border-greesal-emerald shadow-2xs"
                      />
                    </div>

                    <div className="flex items-center gap-1.5 self-start sm:self-auto overflow-x-auto w-full sm:w-auto">
                      {['all', 'Delivered', 'Preparing', 'On the Way'].map((st) => (
                        <button
                          key={st}
                          onClick={() => setFilterStatus(st)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-bold capitalize transition-all cursor-pointer whitespace-nowrap ${
                            filterStatus === st
                              ? 'bg-[#123B2B] text-white shadow-sm'
                              : 'bg-white text-gray-600 border border-greesal-beige/80 hover:bg-gray-50'
                          }`}
                        >
                          {st}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* List of Orders */}
                  {filteredOrders.length === 0 ? (
                    <div className="bg-white rounded-2xl p-12 text-center border border-greesal-beige/70 space-y-3">
                      <ShoppingBag className="w-10 h-10 text-emerald-800/40 mx-auto stroke-[1.5]" />
                      <h4 className="font-bold text-greesal-dark text-base">No orders found</h4>
                      <p className="text-xs text-greesal-muted max-w-sm mx-auto">
                        {searchQuery ? 'No past orders matched your search criteria.' : 'You haven\'t placed any orders yet. Try one of our organic salad bowls!'}
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-3.5 text-left">
                      {filteredOrders.map((order) => (
                        <div
                          key={order.id}
                          className="bg-white rounded-2xl p-5 border border-greesal-beige/80 shadow-2xs hover:shadow-md transition-all space-y-3.5"
                        >
                          {/* Order Row Top */}
                          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-gray-100 pb-3">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-xl bg-greesal-lightgreen border border-greesal-emerald/20 flex items-center justify-center text-greesal-forest font-bold text-xs shadow-2xs">
                                <ShoppingBag className="w-5 h-5 text-emerald-700" />
                              </div>
                              <div>
                                <h4 className="font-bold text-sm text-greesal-dark flex items-center gap-2">
                                  {order.id}
                                </h4>
                                <p className="text-[11px] text-gray-400 font-medium flex items-center gap-1 mt-0.5">
                                  <Clock className="w-3 h-3" /> {order.date}
                                </p>
                              </div>
                            </div>

                            <div className="flex items-center gap-2.5">
                              <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black border uppercase tracking-wider ${getStatusColor(order.status)}`}>
                                {order.status}
                              </span>
                              <span className="font-black text-[#123B2B] text-base">
                                ₹{order.total}
                              </span>
                            </div>
                          </div>

                          {/* Order Items Preview */}
                          <div className="flex flex-wrap items-center gap-2.5">
                            {order.items.map((item, idx) => (
                              <div key={idx} className="flex items-center gap-2 bg-[#FAF6F0] px-3 py-1.5 rounded-xl border border-greesal-beige/60 text-xs">
                                <img src={item.image} alt={item.name} className="w-7 h-7 rounded-md object-cover" />
                                <span className="font-semibold text-greesal-dark truncate max-w-[150px]">{item.name}</span>
                                <span className="text-[10px] bg-white px-1.5 py-0.5 rounded-md font-bold text-gray-600 border border-gray-100">x{item.quantity}</span>
                              </div>
                            ))}
                          </div>

                          {/* Footer Actions */}
                          <div className="flex flex-wrap items-center justify-between pt-1 gap-2">
                            <button
                              onClick={() => setSelectedOrder(order)}
                              className="text-xs font-bold text-greesal-forest hover:text-emerald-700 flex items-center gap-1 cursor-pointer"
                            >
                              <span>View Receipt &amp; Tracking</span>
                              <ChevronRight className="w-3.5 h-3.5" />
                            </button>

                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => sendOrderToWhatsApp({
                                  ...order,
                                  customerName: displayName,
                                  customerEmail: displayEmail,
                                  customerMobile: displayMobile
                                }, '9825144321')}
                                className="px-3 py-1.5 rounded-xl bg-[#25D366] hover:bg-[#20BD5A] text-white text-xs font-bold flex items-center gap-1 transition-colors cursor-pointer"
                                title="Send Order to Greesal WhatsApp 9825144321"
                              >
                                <WhatsAppIcon className="w-3.5 h-3.5 text-white" />
                                <span className="hidden sm:inline">WhatsApp</span>
                              </button>

                              <button
                                onClick={() => {
                                  setInvoiceOrder({
                                    ...order,
                                    customerName: displayName,
                                    customerEmail: displayEmail,
                                    customerMobile: displayMobile
                                  });
                                  setIsInvoiceOpen(true);
                                }}
                                className="px-3 py-1.5 rounded-xl bg-[#FAF6F0] hover:bg-[#F3EDE2] text-[#123B2B] border border-[#EBE2D3] text-xs font-bold flex items-center gap-1 transition-colors cursor-pointer"
                                title="Download Bill"
                              >
                                <FileText className="w-3.5 h-3.5 text-[#C89D4B]" />
                                <span>Bill</span>
                              </button>

                              <button
                                onClick={() => {
                                  onReorder(order.items);
                                  onClose();
                                }}
                                className="px-3.5 py-1.5 rounded-xl bg-greesal-lightgreen hover:bg-emerald-100 text-greesal-forest border border-greesal-emerald/30 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                              >
                                <RotateCcw className="w-3.5 h-3.5" />
                                <span>Reorder</span>
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </>
              )}
            </div>
          )}

          {/* TAB 2: PERSONAL DETAILS & ADDRESS */}
          {activeTab === 'profile' && (
            <div className="bg-white rounded-2xl p-6 sm:p-7 border border-greesal-beige/90 shadow-sm space-y-6 text-left">
              <div className="flex items-center justify-between border-b border-gray-100 pb-4">
                <div>
                  <h3 className="font-bold text-greesal-dark text-base flex items-center gap-2">
                    <User className="w-4 h-4 text-[#123B2B]" /> Member Account Details
                  </h3>
                  <p className="text-xs text-greesal-muted mt-0.5">Manage your personal profile and primary delivery address.</p>
                </div>
                {!isEditing ? (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-greesal-lightgreen text-greesal-forest border border-greesal-emerald/30 text-xs font-bold hover:bg-emerald-100 transition-colors cursor-pointer shadow-2xs"
                  >
                    <Edit3 className="w-3.5 h-3.5" /> Edit Profile
                  </button>
                ) : (
                  <button
                    onClick={handleSaveProfile}
                    className="flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-[#123B2B] text-white text-xs font-bold hover:bg-[#1C4D3A] transition-colors cursor-pointer shadow"
                  >
                    <Save className="w-3.5 h-3.5" /> Save Changes
                  </button>
                )}
              </div>

              {saveSuccessMsg && (
                <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2 animate-in fade-in">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                  <span>Profile updated successfully!</span>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 text-xs">
                <div>
                  <label className="block text-gray-500 font-bold mb-1.5">Full Name</label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={nameInput}
                      onChange={(e) => setNameInput(e.target.value)}
                      className="w-full p-2.5 bg-[#FAF6F0] rounded-xl border border-greesal-beige text-greesal-dark font-semibold focus:outline-none focus:border-greesal-emerald text-xs"
                    />
                  ) : (
                    <div className="p-2.5 bg-gray-50 rounded-xl border border-gray-100 font-bold text-greesal-dark">
                      {nameInput || displayName || 'Not specified'}
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-gray-500 font-bold mb-1.5">Email Address (Google Account)</label>
                  <div className="p-2.5 bg-gray-50 rounded-xl border border-gray-100 font-bold text-gray-700 flex items-center justify-between">
                    <span className="truncate">{displayEmail || 'user@greesal.in'}</span>
                    <span className="text-[10px] bg-emerald-100 text-emerald-800 font-black px-2 py-0.5 rounded-md flex items-center gap-1">
                      <Check className="w-3 h-3" /> Verified
                    </span>
                  </div>
                </div>

                <div>
                  <label className="block text-gray-500 font-bold mb-1.5">Mobile Number</label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={mobileInput}
                      onChange={(e) => setMobileInput(e.target.value)}
                      placeholder="+91 99258 36117"
                      className="w-full p-2.5 bg-[#FAF6F0] rounded-xl border border-greesal-beige text-greesal-dark font-semibold focus:outline-none focus:border-greesal-emerald text-xs"
                    />
                  ) : (
                    <div className="p-2.5 bg-gray-50 rounded-xl border border-gray-100 font-bold text-greesal-dark flex items-center justify-between">
                      <span>{mobileInput || displayMobile || 'Not provided'}</span>
                      <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-md">SMS Active</span>
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-gray-500 font-bold mb-1.5">Account Status</label>
                  <div className="p-2.5 bg-greesal-lightgreen/60 rounded-xl border border-greesal-emerald/20 font-bold text-[#123B2B] flex items-center justify-between">
                    <span>Verified Member</span>
                    <span className="text-[10px] bg-emerald-600 text-white px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider">Active</span>
                  </div>
                </div>

                <div className="sm:col-span-2 space-y-2.5">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <label className="block text-gray-500 font-bold flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-greesal-forest" /> Default Delivery Address
                    </label>

                    <div className="flex items-center gap-2">
                      {/* Use Current Location Button */}
                      <button
                        type="button"
                        disabled={isDetectingLocation}
                        onClick={handleUseCurrentLocation}
                        className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300/80 text-[11px] font-bold transition-all cursor-pointer shadow-2xs disabled:opacity-60"
                        title="Detect and use current GPS location"
                      >
                        {isDetectingLocation ? (
                          <Loader2 className="w-3 h-3 animate-spin text-emerald-700" />
                        ) : (
                          <LocateFixed className="w-3 h-3 text-emerald-700" />
                        )}
                        <span>{isDetectingLocation ? 'Detecting Location...' : 'Use Current Location'}</span>
                      </button>

                      {isEditing && (
                        <div className="flex items-center gap-1">
                          {['Home', 'Office', 'Other'].map(lbl => (
                            <button
                              key={lbl}
                              type="button"
                              onClick={() => setAddressLabel(lbl)}
                              className={`px-2 py-0.5 rounded-md text-[10px] font-bold border transition-colors cursor-pointer ${
                                addressLabel === lbl ? 'bg-[#123B2B] text-white border-[#123B2B]' : 'bg-white text-gray-600 border-gray-200'
                              }`}
                            >
                              {lbl}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  {isEditing ? (
                    <textarea
                      rows={2}
                      value={addressInput}
                      onChange={(e) => setAddressInput(e.target.value)}
                      placeholder="Enter flat/house no, apartment, street, area, Surat - Pincode"
                      className="w-full p-2.5 bg-[#FAF6F0] rounded-xl border border-greesal-beige text-greesal-dark font-medium focus:outline-none focus:border-greesal-emerald text-xs"
                    />
                  ) : (
                    <div className="p-3 bg-gray-50 rounded-xl border border-gray-100 font-medium text-greesal-dark leading-relaxed flex items-start gap-2.5">
                      <span className="bg-greesal-lightgreen text-greesal-forest font-bold px-2 py-0.5 rounded text-[10px] border border-greesal-emerald/20 flex-shrink-0 mt-0.5">
                        {addressLabel}
                      </span>
                      <span>{addressInput}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: DIETARY DNA & NUTRITION GOALS */}
          {activeTab === 'nutrition' && (
            <div className="space-y-5 text-left">
              <div className="bg-white rounded-2xl p-6 sm:p-7 border border-greesal-beige/90 shadow-sm space-y-5">
                <div className="border-b border-gray-100 pb-3">
                  <h3 className="font-bold text-greesal-dark text-base flex items-center gap-2">
                    <Utensils className="w-4 h-4 text-[#123B2B]" /> Nutritional DNA &amp; Fitness Target
                  </h3>
                  <p className="text-xs text-greesal-muted mt-0.5">Customize your wellness targets so our chefs curate optimal nutrient balances.</p>
                </div>

                <div className="space-y-4 text-xs">
                  <div>
                    <label className="block font-bold text-greesal-dark mb-2">Select Your Primary Health Target</label>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                      {[
                        { title: 'Muscle Building', desc: 'High Protein & Natural Carbs', iconType: 'activity' },
                        { title: 'Weight Management', desc: 'Low Calorie & High Fiber', iconType: 'trending' },
                        { title: 'Energy & Detox', desc: 'Antioxidants & Clean Greens', iconType: 'zap' }
                      ].map((goal, idx) => (
                        <div
                          key={idx}
                          onClick={() => {
                            setHealthGoal(goal.title);
                            localStorage.setItem('greesal_user_goal', goal.title);
                          }}
                          className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                            healthGoal.includes(goal.title)
                              ? 'bg-greesal-lightgreen border-greesal-emerald text-greesal-forest font-bold shadow-2xs ring-1 ring-greesal-emerald/40'
                              : 'bg-gray-50 border-gray-100 text-gray-600 hover:bg-gray-100'
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            {goal.iconType === 'activity' && <Activity className="w-4 h-4 text-emerald-700" />}
                            {goal.iconType === 'trending' && <TrendingUp className="w-4 h-4 text-emerald-700" />}
                            {goal.iconType === 'zap' && <Zap className="w-4 h-4 text-emerald-700" />}
                            <span className="font-bold">{goal.title}</span>
                          </div>
                          <p className="text-[11px] text-gray-500 font-normal mt-1 leading-snug">{goal.desc}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block font-bold text-greesal-dark mb-2">Dietary Pattern</label>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      {['100% Vegetarian', 'Vegan Organic', 'Keto / Low-Carb', 'Gluten-Free'].map((pref, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => {
                            setDietPreference(pref);
                            localStorage.setItem('greesal_user_diet', pref);
                          }}
                          className={`p-2.5 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                            dietPreference === pref
                              ? 'bg-[#123B2B] text-white border-[#123B2B] shadow-2xs'
                              : 'bg-white text-gray-700 border-greesal-beige/80 hover:bg-gray-50'
                          }`}
                        >
                          {pref}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                    <div className="p-3.5 rounded-xl bg-gray-50 border border-gray-100 space-y-1">
                      <p className="font-bold text-gray-700">Allergies / Special Instructions</p>
                      <input
                        type="text"
                        value={allergiesInput}
                        onChange={(e) => setAllergiesInput(e.target.value)}
                        onBlur={() => localStorage.setItem('greesal_user_allergies', allergiesInput)}
                        placeholder="e.g. No peanuts, extra dressing..."
                        className="w-full bg-white p-2 rounded-lg border border-gray-200 text-xs text-greesal-dark font-medium focus:outline-none focus:border-greesal-emerald"
                      />
                    </div>

                    <div className="p-3.5 rounded-xl bg-gray-50 border border-gray-100 space-y-1">
                      <p className="font-bold text-gray-700">Target Daily Hydration</p>
                      <select
                        value={dailyWaterGoal}
                        onChange={(e) => setDailyWaterGoal(e.target.value)}
                        className="w-full bg-white p-2 rounded-lg border border-gray-200 text-xs text-greesal-dark font-medium focus:outline-none focus:border-greesal-emerald"
                      >
                        <option>2.5 Liters</option>
                        <option>3.0 Liters</option>
                        <option>3.5 Liters</option>
                        <option>4.0 Liters</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: SECURITY & LOGOUT */}
          {activeTab === 'settings' && (
            <div className="space-y-5 text-left">
              <div className="bg-white rounded-2xl p-6 sm:p-7 border border-greesal-beige/90 shadow-sm space-y-5">
                <div className="border-b border-gray-100 pb-3">
                  <h3 className="font-bold text-greesal-dark text-base flex items-center gap-2">
                    <Settings className="w-4 h-4 text-[#123B2B]" /> Account Security &amp; Session
                  </h3>
                  <p className="text-xs text-greesal-muted mt-0.5">Manage your active authentication session and sign out.</p>
                </div>

                <div className="space-y-4 text-xs">
                  <div className="p-4 rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-between">
                    <div>
                      <p className="font-bold text-greesal-dark text-sm">Google Authentication</p>
                      <p className="text-[11px] text-gray-500 mt-0.5">Connected with {displayEmail || 'Google Sign-In'}</p>
                    </div>
                    <span className="px-3 py-1 bg-emerald-100 text-emerald-800 rounded-full font-bold text-[10px] flex items-center gap-1">
                      <ShieldCheck className="w-3.5 h-3.5" /> Secured
                    </span>
                  </div>

                  {/* Sign Out Card */}
                  <div className="p-5 rounded-2xl bg-red-50/70 border border-red-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <h4 className="font-extrabold text-sm text-red-900 flex items-center gap-2">
                        <LogOut className="w-4 h-4 text-red-600" /> Sign Out of Your Account
                      </h4>
                      <p className="text-xs text-red-700/80 mt-1 leading-relaxed">
                        End your current session on this device. Your orders and preferences remain saved.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={handleSignOut}
                      className="px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs shadow-md transition-all cursor-pointer whitespace-nowrap flex items-center justify-center gap-2"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>Confirm Sign Out</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Modal Footer with Quick Sign Out and Close */}
        <div className="bg-white p-4 sm:p-5 border-t border-greesal-beige/80 flex items-center justify-between text-xs text-greesal-muted">
          <button
            type="button"
            onClick={handleSignOut}
            className="flex items-center gap-1.5 text-red-600 hover:text-red-800 font-bold hover:underline transition-colors cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>

          <button
            onClick={onClose}
            className="px-6 py-2 rounded-xl bg-greesal-dark hover:bg-black text-white font-bold transition-colors cursor-pointer shadow-sm"
          >
            Done
          </button>
        </div>

      </div>

      {/* Quick Sign Out Confirmation Dialog */}
      {showSignOutConfirm && (
        <div className="fixed inset-0 z-60 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-xs w-full p-5 border border-gray-200 shadow-2xl text-center space-y-3 animate-in zoom-in-95 duration-150">
            <div className="w-12 h-12 rounded-full bg-red-50 text-red-600 flex items-center justify-center mx-auto text-xl font-bold">
              <LogOut className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-base text-gray-900">Sign Out of Greesal?</h3>
            <p className="text-xs text-gray-500">
              Are you sure you want to end your current session?
            </p>
            <div className="pt-2 flex items-center gap-2">
              <button
                onClick={() => setShowSignOutConfirm(false)}
                className="flex-1 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleSignOut}
                className="flex-1 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold transition-colors cursor-pointer shadow"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Tax Invoice Modal Dialog */}
      <InvoiceModal
        isOpen={isInvoiceOpen}
        onClose={() => setIsInvoiceOpen(false)}
        order={invoiceOrder}
      />
    </div>
  );
}
