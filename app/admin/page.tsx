'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { GreesalLogo } from '@/components/GreesalLogo';
import { InvoiceModal, InvoiceOrder } from '@/components/InvoiceModal';
import { sendOrderToWhatsApp } from '@/lib/whatsapp';
import { AdminCategoriesTab } from '@/components/admin/AdminCategoriesTab';
import { AdminSiteTextsTab } from '@/components/admin/AdminSiteTextsTab';
import { AdminReviewsTab } from '@/components/admin/AdminReviewsTab';
import { SiteCategory, SiteSettings, DEFAULT_CATEGORIES, DEFAULT_SITE_SETTINGS } from '@/lib/siteSettings';
import { 
  Save, 
  Plus, 
  Edit2, 
  Trash2, 
  ArrowLeft, 
  ArrowRight,
  Loader2, 
  Sparkles, 
  Settings, 
  Utensils, 
  Image as ImageIcon,
  CheckCircle,
  AlertCircle,
  Activity,
  Droplets,
  HeartPulse,
  Leaf,
  PackageCheck,
  Truck,
  Clock,
  Search,
  Phone,
  Mail,
  MapPin,
  RotateCcw,
  Check,
  ChevronRight,
  Filter,
  ShoppingBag,
  DollarSign,
  User,
  ExternalLink,
  Upload,
  UploadCloud,
  X,
  Link as LinkIcon,
  FileText,
  MessageSquare,
  LogOut,
  ShieldCheck,
  Zap,
  Star,
  FolderTree,
  Monitor,
  Smartphone,
  Eye
} from 'lucide-react';

interface Salad {
  _id?: string;
  name: string;
  calories: string;
  protein: string;
  price: string;
  tag: string;
  image: string;
  ingredients?: string[];
  gravy?: string[];
  healthBenefits?: string[];
  additionalBenefits?: string[];
  perfectFor?: string[];
  addOns?: Array<{ name: string; price: number }>;
  nutrition?: {
    carbs?: string;
    fiber?: string;
    sugarTotal?: string;
    sugarAdded?: string;
    totalFat?: string;
    saturatedFat?: string;
    transFat?: string;
    cholesterol?: string;
    vitaminA?: string;
    vitaminC?: string;
    vitaminD?: string;
    vitaminE?: string;
    sodium?: string;
    calcium?: string;
    iron?: string;
    potassium?: string;
  };
}

interface OrderItem {
  id: string;
  name: string;
  price: string;
  image: string;
  quantity: number;
}

interface AdminOrder {
  _id?: string;
  id: string;
  orderNumber?: string;
  customerName?: string;
  customerEmail?: string;
  customerMobile?: string;
  date: string;
  timestamp: number;
  status: 'Placed' | 'Preparing' | 'On the Way' | 'Delivered' | 'Cancelled';
  items: OrderItem[];
  subtotal: number;
  deliveryFee: number;
  total: number;
  deliveryAddress: string;
  deliverySlot?: string;
  mapsUrl?: string;
  notes?: string;
  orderType?: string;
  dietPreference?: string;
  paymentMethod: string;
}

export default function AdminPage() {
  const router = useRouter();
  const [isAdminChecking, setIsAdminChecking] = useState(true);
  const [adminUser, setAdminUser] = useState<{ username: string } | null>(null);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const [activeTab, setActiveTab] = useState<'orders' | 'salads' | 'timing' | 'banner' | 'categories' | 'siteTexts' | 'reviews'>('orders');
  const [formTab, setFormTab] = useState<'general' | 'ingredients' | 'benefits' | 'nutrition' | 'addons'>('general');
  
  // Dynamic categories & site settings state
  const [categoriesState, setCategoriesState] = useState<SiteCategory[]>(DEFAULT_CATEGORIES);
  const [fullSiteSettings, setFullSiteSettings] = useState<SiteSettings>(DEFAULT_SITE_SETTINGS);

  const [isLoading, setIsLoading] = useState(false);
  const [isActionLoading, setIsActionLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Orders State
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [orderFilter, setOrderFilter] = useState<string>('all');
  const [orderSearch, setOrderSearch] = useState<string>('');
  const [updatingOrderId, setUpdatingOrderId] = useState<string | null>(null);

  // Admin Invoice Modal State
  const [adminInvoiceOrder, setAdminInvoiceOrder] = useState<InvoiceOrder | null>(null);
  const [isAdminInvoiceOpen, setIsAdminInvoiceOpen] = useState(false);

  // Shop Timing & Notice Settings state
  const [isOpen, setIsOpen] = useState<boolean>(true);
  const [openingTime, setOpeningTime] = useState<string>('08:00 AM');
  const [closingTime, setClosingTime] = useState<string>('10:30 PM');
  const [shopTimingText, setShopTimingText] = useState<string>('Open Daily: 8:00 AM – 10:30 PM');
  const [notice, setNotice] = useState<string>('Fresh Organic Harvest Delivered in 30 Mins across Surat • Free Delivery on ₹499+');
  const [showNotice, setShowNotice] = useState<boolean>(true);
  const [noticeType, setNoticeType] = useState<'announcement' | 'info' | 'alert' | 'discount'>('announcement');
  const [closedMessage, setClosedMessage] = useState<string>('Our kitchen is currently closed. Opening again at 08:00 AM. Pre-orders are welcome!');

  // Banner Settings state
  const [bannerTitle, setBannerTitle] = useState('Farm-Fresh Organic Salad Bowls');
  const [bannerDescription, setBannerDescription] = useState(
    'GREESAL, Farm-Fresh Organic Salad Bowls! Idea comes from a small thing and now it’s become a trusted brand of salads and healthy food in Surat, Gujarat.'
  );
  const [bannerStoryP1, setBannerStoryP1] = useState(
    'GREESAL, Farm-Fresh Organic Salad Bowls! Idea comes from a small thing and now it’s become a trusted brand of salads and healthy food in Surat, Gujarat.'
  );
  const [bannerStoryP2, setBannerStoryP2] = useState(
    'GREESAL — Slice of Green, where health meets Freshness & Deliciousness! One more thing comes to mind when we talk about healthy food is organic, natural, and fresh — and Greesal is committed to providing only fresh, healthy, and delicious salads with fresh and organic ingredients.'
  );
  const [bannerStoryP3, setBannerStoryP3] = useState(
    'At GREESAL, we bring you 21 varieties of fresh, healthy, and delicious salads, carefully crafted to offer the perfect balance of taste and nutrition. Staying true to our tagline, “Farm-Fresh Organic Salad Bowls”, we deliver wholesome salads right to your doorstep, ensuring you enjoy a guilt-free, nutritious meal every day.'
  );
  const [bannerStoryP4, setBannerStoryP4] = useState(
    'Our handcrafted salads are made using premium-quality ingredients, without onion and garlic, and paired with our signature homemade dressings. Whether you’re on a fitness journey, looking for a quick healthy meal, or simply love fresh greens, Greesal is your go-to destination for healthy eating.'
  );
  const [bannerStoryHeading, setBannerStoryHeading] = useState('A short story about');
  const [bannerStoryBrand, setBannerStoryBrand] = useState('GREESAL');
  const [bannerBadge, setBannerBadge] = useState('');
  const [bannerImage, setBannerImage] = useState('https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=1000&q=85');
  const [bannerPill1, setBannerPill1] = useState('100% Handmade Dressings');
  const [bannerPill2, setBannerPill2] = useState('No Onion • No Garlic');
  const [bannerStatBadge, setBannerStatBadge] = useState('Health Lovers');
  const [bannerStatDelivered, setBannerStatDelivered] = useState('72,600+ Salads Delivered');
  const [bannerHighlight1Title, setBannerHighlight1Title] = useState('Free Delivery in Surat');
  const [bannerHighlight2Title, setBannerHighlight2Title] = useState('Lunch & Evening Slots');
  const [bannerHighlight3Title, setBannerHighlight3Title] = useState('100% Satvik Dressing');
  const [bannerCtaText, setBannerCtaText] = useState('Explore Salad Menu');
  const [bannerCtaLink, setBannerCtaLink] = useState('#menu');
  const [bannerImageSourceType, setBannerImageSourceType] = useState<'file' | 'url'>('url');
  const [bannerPreviewDevice, setBannerPreviewDevice] = useState<'desktop' | 'mobile'>('desktop');

  const processBannerImageFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      setErrorMessage('Please select a valid image file (PNG, JPG, WEBP, etc.)');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;
      img.onload = () => {
        const maxDim = 1200;
        let width = img.width;
        let height = img.height;
        if (width > maxDim || height > maxDim) {
          if (width > height) {
            height = Math.round((height * maxDim) / width);
            width = maxDim;
          } else {
            width = Math.round((width * maxDim) / height);
            height = maxDim;
          }
        }
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.88);
          setBannerImage(compressedDataUrl);
        } else {
          setBannerImage(event.target?.result as string);
        }
        setErrorMessage(null);
      };
    };
    reader.readAsDataURL(file);
  };

  // Salads list state
  const [salads, setSalads] = useState<Salad[]>([]);
  const [newAddOnName, setNewAddOnName] = useState('');
  const [newAddOnPrice, setNewAddOnPrice] = useState('');
  const [currentSalad, setCurrentSalad] = useState<Salad>({
    name: '',
    calories: '',
    protein: '',
    price: '',
    tag: 'Chef Choice',
    image: '',
    ingredients: [],
    gravy: [],
    healthBenefits: [],
    additionalBenefits: [],
    perfectFor: ['Diet', 'Fitness', 'Healthy'],
    addOns: [],
    nutrition: {
      carbs: '', fiber: '', sugarTotal: '', sugarAdded: '',
      totalFat: '', saturatedFat: '', transFat: '', cholesterol: '',
      vitaminA: '', vitaminC: '', vitaminD: '', vitaminE: '',
      sodium: '', calcium: '', iron: '', potassium: ''
    }
  });

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSaladId, setEditingSaladId] = useState<string | null>(null);
  const [imageSourceType, setImageSourceType] = useState<'file' | 'url'>('file');

  const processImageFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      setErrorMessage('Please select a valid image file (PNG, JPG, WEBP, etc.)');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;
      img.onload = () => {
        const maxDim = 800;
        let width = img.width;
        let height = img.height;
        if (width > maxDim || height > maxDim) {
          if (width > height) {
            height = Math.round((height * maxDim) / width);
            width = maxDim;
          } else {
            width = Math.round((width * maxDim) / height);
            height = maxDim;
          }
        }
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.85);
          setCurrentSalad(prev => ({ ...prev, image: compressedDataUrl }));
        } else {
          setCurrentSalad(prev => ({ ...prev, image: event.target?.result as string }));
        }
        setErrorMessage(null);
      };
    };
    reader.readAsDataURL(file);
  };

  // Check Admin Authentication on mount
  useEffect(() => {
    async function checkAdminAuth() {
      try {
        const res = await fetch('/api/admin/auth');
        if (!res.ok) {
          router.replace('/admin/login');
          return;
        }
        const data = await res.json();
        if (!data.authenticated) {
          router.replace('/admin/login');
          return;
        }
        setAdminUser(data.user || { username: 'admin' });
        setIsAdminChecking(false);
        fetchData();
      } catch (err) {
        router.replace('/admin/login');
      }
    }
    checkAdminAuth();
  }, [router]);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await fetch('/api/admin/auth', { method: 'DELETE' });
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      router.replace('/admin/login');
    }
  };

  const fetchData = async () => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      // 1. Fetch Store & Banner Settings
      const settingsRes = await fetch('/api/admin/settings');
      const settingsData = await settingsRes.json();
      if (settingsRes.ok) {
        setFullSiteSettings(settingsData);
        if (Array.isArray(settingsData.categories) && settingsData.categories.length > 0) {
          setCategoriesState(settingsData.categories);
        }
        if (settingsData.isOpen !== undefined) setIsOpen(Boolean(settingsData.isOpen));
        if (settingsData.openingTime) setOpeningTime(settingsData.openingTime);
        if (settingsData.closingTime) setClosingTime(settingsData.closingTime);
        if (settingsData.shopTimingText) setShopTimingText(settingsData.shopTimingText);
        if (settingsData.notice) setNotice(settingsData.notice);
        if (settingsData.showNotice !== undefined) setShowNotice(Boolean(settingsData.showNotice));
        if (settingsData.noticeType) setNoticeType(settingsData.noticeType);
        if (settingsData.closedMessage) setClosedMessage(settingsData.closedMessage);

        if (settingsData.heroSlogan) setBannerTitle(settingsData.heroSlogan);
        else if (settingsData.title) setBannerTitle(settingsData.title);

        if (settingsData.heroBadge) setBannerBadge(settingsData.heroBadge);
        else if (settingsData.badgeText) setBannerBadge(settingsData.badgeText);

        if (settingsData.heroStoryHeading) setBannerStoryHeading(settingsData.heroStoryHeading);
        if (settingsData.heroStoryBrand) setBannerStoryBrand(settingsData.heroStoryBrand);

        if (settingsData.heroStoryP1) {
          setBannerDescription(settingsData.heroStoryP1);
          setBannerStoryP1(settingsData.heroStoryP1);
        } else if (settingsData.description) {
          setBannerDescription(settingsData.description);
          setBannerStoryP1(settingsData.description);
        }

        if (settingsData.heroStoryP2) setBannerStoryP2(settingsData.heroStoryP2);
        if (settingsData.heroStoryP3) setBannerStoryP3(settingsData.heroStoryP3);
        if (settingsData.heroStoryP4) setBannerStoryP4(settingsData.heroStoryP4);

        if (settingsData.heroImage) {
          setBannerImage(settingsData.heroImage);
          if (settingsData.heroImage.startsWith('data:')) {
            setBannerImageSourceType('file');
          } else {
            setBannerImageSourceType('url');
          }
        }

        if (settingsData.heroPill1) setBannerPill1(settingsData.heroPill1);
        else if (settingsData.pill1Text) setBannerPill1(settingsData.pill1Text);

        if (settingsData.heroPill2) setBannerPill2(settingsData.heroPill2);
        else if (settingsData.pill2Text) setBannerPill2(settingsData.pill2Text);

        if (settingsData.heroStatBadge) setBannerStatBadge(settingsData.heroStatBadge);
        else if (settingsData.highlight3Subtitle) setBannerStatBadge(settingsData.highlight3Subtitle);

        if (settingsData.heroStatDelivered) setBannerStatDelivered(settingsData.heroStatDelivered);
        else if (settingsData.highlight3Title) setBannerStatDelivered(settingsData.highlight3Title);

        if (settingsData.highlight1Title) setBannerHighlight1Title(settingsData.highlight1Title);
        if (settingsData.highlight2Title) setBannerHighlight2Title(settingsData.highlight2Title);
        if (settingsData.highlight3Title) setBannerHighlight3Title(settingsData.highlight3Title);

        if (settingsData.ctaText) setBannerCtaText(settingsData.ctaText);
        if (settingsData.ctaLink) setBannerCtaLink(settingsData.ctaLink);
      }

      // 2. Fetch Salads list
      const saladsRes = await fetch('/api/admin/salads');
      const saladsData = await saladsRes.json();
      if (saladsRes.ok) {
        setSalads(saladsData || []);
      }

      // 3. Fetch Orders list
      const ordersRes = await fetch('/api/admin/orders');
      const ordersData = await ordersRes.json();
      if (ordersRes.ok) {
        setOrders(Array.isArray(ordersData) ? ordersData : []);
      }
    } catch (err: any) {
      setErrorMessage('Failed to load page data. Please verify database connection.');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchOrdersOnly = async () => {
    try {
      const ordersRes = await fetch('/api/admin/orders');
      const ordersData = await ordersRes.json();
      if (ordersRes.ok && Array.isArray(ordersData)) {
        setOrders(ordersData);
      }
    } catch (e) {
      // ignore
    }
  };

  // Poll orders every 12 seconds when on Orders tab
  useEffect(() => {
    if (activeTab === 'orders') {
      const interval = setInterval(() => {
        fetchOrdersOnly();
      }, 12000);
      return () => clearInterval(interval);
    }
  }, [activeTab]);

  // Update Order Status
  const handleUpdateOrderStatus = async (order: AdminOrder, newStatus: string) => {
    const targetId = order._id || order.id || order.orderNumber || '';
    setUpdatingOrderId(targetId);
    setSuccessMessage(null);
    setErrorMessage(null);

    try {
      const res = await fetch('/api/admin/orders', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          _id: order._id,
          id: order.id || order.orderNumber,
          status: newStatus
        })
      });

      if (!res.ok) {
        throw new Error('Failed to update order status');
      }

      setOrders(prev => prev.map(o => (o._id === order._id || o.id === order.id || o.orderNumber === order.orderNumber) ? { ...o, status: newStatus as any } : o));
      setSuccessMessage(`Order #${order.orderNumber || order.id} status updated to "${newStatus}"!`);
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err: any) {
      setErrorMessage(err.message || 'Error updating order status');
    } finally {
      setUpdatingOrderId(null);
    }
  };

  // Delete Order
  const handleDeleteOrder = async (orderId: string) => {
    if (!window.confirm(`Are you sure you want to delete order #${orderId}?`)) return;
    setSuccessMessage(null);
    setErrorMessage(null);

    try {
      const res = await fetch(`/api/admin/orders?id=${orderId}`, {
        method: 'DELETE'
      });

      if (!res.ok) {
        throw new Error('Failed to delete order');
      }

      setOrders(prev => prev.filter(o => o._id !== orderId && o.id !== orderId && o.orderNumber !== orderId));
      setSuccessMessage(`Order #${orderId} deleted successfully!`);
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to delete order');
    }
  };

  // Save Shop Timing & Announcement Settings
  const handleSaveStoreTiming = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsActionLoading(true);
    setSuccessMessage(null);
    setErrorMessage(null);

    try {
      const res = await fetch('/api/admin/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          isOpen,
          openingTime,
          closingTime,
          shopTimingText,
          notice,
          showNotice,
          noticeType,
          closedMessage,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to update store timing and notice settings');
      }

      setFullSiteSettings((prev) => ({
        ...prev,
        isOpen,
        openingTime,
        closingTime,
        shopTimingText,
        notice,
        showNotice,
        noticeType,
        closedMessage,
      }));

      setSuccessMessage('Shop online hours & announcement message saved! Live website and mobile app updated.');
      setTimeout(() => setSuccessMessage(null), 4000);
    } catch (err: any) {
      setErrorMessage(err.message || 'An error occurred while saving store timing.');
    } finally {
      setIsActionLoading(false);
    }
  };

  // Save Banner Settings
  const handleSaveBanner = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsActionLoading(true);
    setSuccessMessage(null);
    setErrorMessage(null);

    try {
      const payload = {
        title: bannerTitle,
        heroSlogan: bannerTitle,
        description: bannerStoryP1,
        heroStoryP1: bannerStoryP1,
        heroStoryP2: bannerStoryP2,
        heroStoryP3: bannerStoryP3,
        heroStoryP4: bannerStoryP4,
        heroStoryHeading: bannerStoryHeading,
        heroStoryBrand: bannerStoryBrand,
        badgeText: bannerBadge,
        heroBadge: bannerBadge,
        heroImage: bannerImage,
        pill1Text: bannerPill1,
        heroPill1: bannerPill1,
        pill2Text: bannerPill2,
        heroPill2: bannerPill2,
        heroStatBadge: bannerStatBadge,
        heroStatDelivered: bannerStatDelivered,
        highlight1Title: bannerHighlight1Title,
        highlight2Title: bannerHighlight2Title,
        highlight3Title: bannerHighlight3Title,
        ctaText: bannerCtaText,
        ctaLink: bannerCtaLink,
      };

      const res = await fetch('/api/admin/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to update banner settings');
      }

      setFullSiteSettings((prev) => ({
        ...prev,
        ...payload,
      }));

      setSuccessMessage('Homepage Hero banner image, slogan & features updated successfully! Live website refreshed.');
      setTimeout(() => setSuccessMessage(null), 4000);
    } catch (err: any) {
      setErrorMessage(err.message || 'An error occurred while saving.');
    } finally {
      setIsActionLoading(false);
    }
  };

  // Save dynamic categories
  const handleSaveCategories = async (updatedCategories: SiteCategory[]) => {
    setIsActionLoading(true);
    setSuccessMessage(null);
    setErrorMessage(null);
    try {
      const res = await fetch('/api/admin/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          categories: updatedCategories
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to save categories');
      setCategoriesState(updatedCategories);
      setFullSiteSettings(prev => ({ ...prev, categories: updatedCategories }));
      setSuccessMessage('Menu categories updated successfully! Live website refreshed.');
      setTimeout(() => setSuccessMessage(null), 4000);
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to save categories');
    } finally {
      setIsActionLoading(false);
    }
  };

  // Save dynamic site texts & sections
  const handleSaveSiteTexts = async (updatedSettings: Partial<SiteSettings>) => {
    setIsActionLoading(true);
    setSuccessMessage(null);
    setErrorMessage(null);
    try {
      const res = await fetch('/api/admin/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedSettings)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to save site texts');
      setFullSiteSettings(prev => ({ ...prev, ...updatedSettings }));
      setSuccessMessage('Website content, texts & sections saved! Live website updated.');
      setTimeout(() => setSuccessMessage(null), 4000);
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to save site texts');
    } finally {
      setIsActionLoading(false);
    }
  };

  // Open modal to add salad
  const handleOpenAddModal = () => {
    setFormTab('general');
    setEditingSaladId(null);
    setImageSourceType('file');
    setNewAddOnName('');
    setNewAddOnPrice('');
    setCurrentSalad({
      name: '',
      calories: '',
      protein: '',
      price: '',
      tag: 'Chef Choice',
      image: '',
      ingredients: [],
      gravy: [],
      healthBenefits: [],
      additionalBenefits: [],
      perfectFor: ['Diet', 'Fitness', 'Healthy'],
      addOns: [
        { name: 'Extra Organic Paneer / Tofu', price: 40 },
        { name: 'Extra Cold-Blended Herb Dressing', price: 30 },
        { name: 'Roasted Almonds, Walnuts & Seeds Mix', price: 35 },
        { name: 'Fresh Hass Avocado Slices', price: 50 },
        { name: 'Organic Boiled Chickpeas & Sprout Beans', price: 25 },
      ],
      nutrition: {
        carbs: '', fiber: '', sugarTotal: '', sugarAdded: '',
        totalFat: '', saturatedFat: '', transFat: '', cholesterol: '',
        vitaminA: '', vitaminC: '', vitaminD: '', vitaminE: '',
        sodium: '', calcium: '', iron: '', potassium: ''
      }
    });
    setIsModalOpen(true);
  };

  // Open modal to edit salad
  const handleOpenEditModal = (salad: Salad) => {
    setFormTab('general');
    setEditingSaladId(salad._id || null);
    setImageSourceType(salad.image && !salad.image.startsWith('data:') ? 'url' : 'file');
    setNewAddOnName('');
    setNewAddOnPrice('');
    setCurrentSalad({ 
      ...salad,
      ingredients: salad.ingredients || [],
      gravy: salad.gravy || [],
      healthBenefits: salad.healthBenefits || [],
      additionalBenefits: salad.additionalBenefits || [],
      perfectFor: salad.perfectFor || ['Diet', 'Fitness', 'Healthy'],
      addOns: Array.isArray(salad.addOns) ? salad.addOns : [
        { name: 'Extra Organic Paneer / Tofu', price: 40 },
        { name: 'Extra Cold-Blended Herb Dressing', price: 30 },
        { name: 'Roasted Almonds, Walnuts & Seeds Mix', price: 35 },
        { name: 'Fresh Hass Avocado Slices', price: 50 },
      ],
      nutrition: {
        carbs: '', fiber: '', sugarTotal: '', sugarAdded: '',
        totalFat: '', saturatedFat: '', transFat: '', cholesterol: '',
        vitaminA: '', vitaminC: '', vitaminD: '', vitaminE: '',
        sodium: '', calcium: '', iron: '', potassium: '',
        ...(salad.nutrition || {})
      }
    });
    setIsModalOpen(true);
  };

  // Save Salad (Add or Update)
  const handleSaveSalad = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsActionLoading(true);
    setSuccessMessage(null);
    setErrorMessage(null);

    try {
      const url = editingSaladId 
        ? `/api/admin/salads/${editingSaladId}` 
        : '/api/admin/salads';
      const method = editingSaladId ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(currentSalad),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to save salad');
      }

      setSuccessMessage(editingSaladId ? 'Salad updated successfully!' : 'New salad added successfully!');
      setIsModalOpen(false);
      await fetchData(); // refresh list
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err: any) {
      setErrorMessage(err.message || 'An error occurred while saving salad.');
    } finally {
      setIsActionLoading(false);
    }
  };

  // Delete Salad
  const handleDeleteSalad = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this salad?')) return;
    setIsActionLoading(true);
    setSuccessMessage(null);
    setErrorMessage(null);

    try {
      const res = await fetch(`/api/admin/salads/${id}`, {
        method: 'DELETE',
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to delete salad');
      }

      setSuccessMessage('Salad deleted successfully!');
      await fetchData(); // refresh list
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err: any) {
      setErrorMessage(err.message || 'An error occurred while deleting salad.');
    } finally {
      setIsActionLoading(false);
    }
  };

  if (isAdminChecking) {
    return (
      <div className="min-h-screen bg-greesal-cream flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-greesal-dark flex items-center justify-center shadow-lg animate-pulse">
            <ShieldCheck className="w-6 h-6 text-emerald-400" />
          </div>
          <p className="text-sm font-semibold text-greesal-forest">Verifying Admin Access...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-greesal-cream font-sans pb-16">
      {/* Top Navbar */}
      <header className="sticky top-0 z-40 bg-white border-b border-greesal-beige/60 px-4 sm:px-6 py-3.5 sm:py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2 sm:gap-3">
            <GreesalLogo size="sm" />
            <div className="w-1.5 h-6 bg-greesal-emerald/20 rounded-full hidden sm:block" />
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-greesal-forest tracking-tight uppercase hidden sm:block">Admin Panel</span>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-100/80 border border-emerald-200 text-emerald-900 text-xs font-semibold">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className="capitalize">{adminUser?.username || 'admin'}</span>
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <Link
              href="/dashboard"
              className="flex items-center gap-1.5 px-3 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-bold text-[#123B2B] hover:bg-greesal-lightgreen border border-greesal-emerald/20 transition-all duration-200 cursor-pointer shadow-[0_2px_8px_rgba(0,0,0,0.02)]"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="hidden sm:inline">Customer</span>
              <span>Dashboard</span>
            </Link>

            <button
              onClick={handleLogout}
              disabled={isLoggingOut}
              className="flex items-center gap-1.5 px-3 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-bold text-red-700 bg-red-50 hover:bg-red-100 border border-red-200 transition-all duration-200 cursor-pointer disabled:opacity-50"
              title="Log out of admin session"
            >
              {isLoggingOut ? (
                <Loader2 className="w-4 h-4 animate-spin text-red-600" />
              ) : (
                <LogOut className="w-4 h-4 text-red-600" />
              )}
              <span className="hidden sm:inline">Log Out</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 pt-10">
        
        {/* Banner Headers */}
        <div className="mb-8 text-left">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-greesal-emerald/10 border border-greesal-emerald/30 text-greesal-forest text-xs font-bold uppercase tracking-widest mb-3">
            <Sparkles className="w-3.5 h-3.5" /> Greesal Operations &amp; Content Manager
          </div>
          <h1 className="text-3xl font-extrabold text-[#123B2B] tracking-tight">
            Admin Management Console
          </h1>
          <p className="text-sm text-greesal-muted font-medium mt-1.5">
            Monitor real-time customer salad bowl orders, track delivery status, and customize the live catalog.
          </p>
        </div>

        {/* Success/Error Alerts */}
        {successMessage && (
          <div className="mb-6 p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm font-semibold flex items-center gap-2.5 animate-in fade-in slide-in-from-top-4 duration-300 text-left">
            <CheckCircle className="w-5 h-5 text-emerald-600 flex-shrink-0" />
            <span>{successMessage}</span>
          </div>
        )}

        {errorMessage && (
          <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 text-red-800 text-sm font-semibold flex items-center gap-2.5 animate-in fade-in slide-in-from-top-4 duration-300 text-left">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Tab switchers */}
        <div className="flex border-b border-gray-200 mb-8 gap-2 sm:gap-6 font-semibold text-sm overflow-x-auto no-scrollbar">
          <button
            onClick={() => setActiveTab('orders')}
            className={`pb-4 px-2 transition-all flex items-center gap-2 cursor-pointer whitespace-nowrap ${
              activeTab === 'orders'
                ? 'border-b-2 border-[#123B2B] text-[#123B2B] font-black'
                : 'text-gray-500 hover:text-[#123B2B]'
            }`}
          >
            <PackageCheck className="w-4 h-4" />
            <span>Customer Orders ({orders.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('salads')}
            className={`pb-4 px-2 transition-all flex items-center gap-2 cursor-pointer whitespace-nowrap ${
              activeTab === 'salads'
                ? 'border-b-2 border-[#123B2B] text-[#123B2B] font-black'
                : 'text-gray-500 hover:text-[#123B2B]'
            }`}
          >
            <Utensils className="w-4 h-4" />
            <span>Manage Salads ({salads.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('timing')}
            className={`pb-4 px-2 transition-all flex items-center gap-2 cursor-pointer whitespace-nowrap ${
              activeTab === 'timing'
                ? 'border-b-2 border-[#123B2B] text-[#123B2B] font-black'
                : 'text-gray-500 hover:text-[#123B2B]'
            }`}
          >
            <Clock className="w-4 h-4 text-emerald-600" />
            <span>Shop Timing &amp; Notice</span>
            <span className={`w-2 h-2 rounded-full ${isOpen ? 'bg-emerald-500 animate-pulse' : 'bg-red-500'}`} />
          </button>
          <button
            onClick={() => setActiveTab('banner')}
            className={`pb-4 px-2 transition-all flex items-center gap-2 cursor-pointer whitespace-nowrap ${
              activeTab === 'banner'
                ? 'border-b-2 border-[#123B2B] text-[#123B2B] font-black'
                : 'text-gray-500 hover:text-[#123B2B]'
            }`}
          >
            <Settings className="w-4 h-4" />
            <span>Hero Banner</span>
          </button>
          <button
            onClick={() => setActiveTab('categories')}
            className={`pb-4 px-2 transition-all flex items-center gap-2 cursor-pointer whitespace-nowrap ${
              activeTab === 'categories'
                ? 'border-b-2 border-[#123B2B] text-[#123B2B] font-black'
                : 'text-gray-500 hover:text-[#123B2B]'
            }`}
          >
            <FolderTree className="w-4 h-4 text-emerald-600" />
            <span>Categories ({categoriesState.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('siteTexts')}
            className={`pb-4 px-2 transition-all flex items-center gap-2 cursor-pointer whitespace-nowrap ${
              activeTab === 'siteTexts'
                ? 'border-b-2 border-[#123B2B] text-[#123B2B] font-black'
                : 'text-gray-500 hover:text-[#123B2B]'
            }`}
          >
            <FileText className="w-4 h-4 text-emerald-600" />
            <span>Site Texts &amp; Sections</span>
          </button>
          <button
            onClick={() => setActiveTab('reviews')}
            className={`pb-4 px-2 transition-all flex items-center gap-2 cursor-pointer whitespace-nowrap ${
              activeTab === 'reviews'
                ? 'border-b-2 border-[#123B2B] text-[#123B2B] font-black'
                : 'text-gray-500 hover:text-[#123B2B]'
            }`}
          >
            <Star className="w-4 h-4 text-[#fbce45] fill-[#fbce45]" />
            <span>Customer Experiences</span>
          </button>
        </div>

        {/* Tab Content */}
        {isLoading ? (
          <div className="h-64 flex items-center justify-center bg-white rounded-3xl border border-greesal-beige/60">
            <Loader2 className="w-8 h-8 text-[#123B2B] animate-spin" />
          </div>
        ) : activeTab === 'orders' ? (
          /* TAB 1: CUSTOMER ORDERS MANAGEMENT */
          <div className="space-y-6 text-left">
            {/* KPI Summary Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white p-5 rounded-2xl border border-greesal-beige shadow-2xs">
                <div className="flex items-center justify-between text-gray-500 text-xs font-bold uppercase tracking-wider">
                  <span>Total Orders</span>
                  <PackageCheck className="w-4 h-4 text-greesal-forest" />
                </div>
                <p className="text-2xl sm:text-3xl font-black text-greesal-dark mt-2">{orders.length}</p>
                <p className="text-[11px] text-gray-400 mt-1 font-medium">All recorded orders</p>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-greesal-beige shadow-2xs">
                <div className="flex items-center justify-between text-gray-500 text-xs font-bold uppercase tracking-wider">
                  <span>Total Revenue</span>
                  <DollarSign className="w-4 h-4 text-emerald-600" />
                </div>
                <p className="text-2xl sm:text-3xl font-black text-emerald-700 mt-2">
                  ₹{orders.reduce((sum, o) => sum + (o.total || 0), 0)}
                </p>
                <p className="text-[11px] text-gray-400 mt-1 font-medium">Gross salad sales</p>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-greesal-beige shadow-2xs">
                <div className="flex items-center justify-between text-gray-500 text-xs font-bold uppercase tracking-wider">
                  <span>In-Kitchen / Active</span>
                  <Clock className="w-4 h-4 text-amber-600" />
                </div>
                <p className="text-2xl sm:text-3xl font-black text-amber-600 mt-2">
                  {orders.filter(o => o.status === 'Placed' || o.status === 'Preparing' || o.status === 'On the Way').length}
                </p>
                <p className="text-[11px] text-gray-400 mt-1 font-medium">Requiring fulfillment</p>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-greesal-beige shadow-2xs">
                <div className="flex items-center justify-between text-gray-500 text-xs font-bold uppercase tracking-wider">
                  <span>Delivered Meals</span>
                  <Truck className="w-4 h-4 text-emerald-600" />
                </div>
                <p className="text-2xl sm:text-3xl font-black text-emerald-800 mt-2">
                  {orders.filter(o => o.status === 'Delivered').length}
                </p>
                <p className="text-[11px] text-gray-400 mt-1 font-medium">Successfully completed</p>
              </div>
            </div>

            {/* Filter & Search Bar */}
            <div className="bg-white p-4 rounded-2xl border border-greesal-beige shadow-2xs flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="relative w-full md:w-96">
                <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search customer, phone, order ID, or salad..."
                  value={orderSearch}
                  onChange={(e) => setOrderSearch(e.target.value)}
                  className="w-full pl-9 pr-4 py-2.5 bg-[#FAF6F0] rounded-xl border border-greesal-beige text-xs text-greesal-dark font-medium focus:outline-none focus:border-greesal-emerald"
                />
              </div>

              <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto">
                <button
                  onClick={fetchOrdersOnly}
                  className="px-3 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs active:scale-95"
                  title="Reload Latest Orders from Database"
                >
                  <RotateCcw className="w-3.5 h-3.5 text-emerald-700" />
                  <span>Refresh Orders</span>
                </button>

                <div className="h-5 w-px bg-gray-200 hidden sm:block" />

                {['all', 'Placed', 'Preparing', 'On the Way', 'Delivered'].map((st) => (
                  <button
                    key={st}
                    onClick={() => setOrderFilter(st)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                      orderFilter === st
                        ? 'bg-[#123B2B] text-white shadow-sm'
                        : 'bg-[#FAF6F0] text-gray-600 border border-greesal-beige/80 hover:bg-gray-100'
                    }`}
                  >
                    {st === 'all' ? 'All Orders' : st}
                  </button>
                ))}
              </div>
            </div>

            {/* Orders List Table / Card View */}
            {(() => {
              const query = orderSearch.toLowerCase().trim();
              const filtered = orders.filter(order => {
                const matchesFilter = orderFilter === 'all' || order.status.toLowerCase() === orderFilter.toLowerCase();
                const matchesSearch = query === '' ||
                  (order.id && order.id.toLowerCase().includes(query)) ||
                  (order.orderNumber && order.orderNumber.toLowerCase().includes(query)) ||
                  (order.customerName && order.customerName.toLowerCase().includes(query)) ||
                  (order.customerMobile && order.customerMobile.includes(query)) ||
                  (order.customerEmail && order.customerEmail.toLowerCase().includes(query)) ||
                  (order.deliveryAddress && order.deliveryAddress.toLowerCase().includes(query)) ||
                  order.items.some(item => item.name.toLowerCase().includes(query));
                return matchesFilter && matchesSearch;
              });

              if (filtered.length === 0) {
                return (
                  <div className="bg-white rounded-3xl p-12 text-center border border-greesal-beige space-y-3">
                    <ShoppingBag className="w-12 h-12 text-[#123B2B]/30 mx-auto stroke-[1.5]" />
                    <h3 className="font-extrabold text-lg text-greesal-dark">No Orders Found</h3>
                    <p className="text-xs text-greesal-muted max-w-sm mx-auto">
                      {orderSearch ? 'No orders match your search keyword. Try adjusting filters.' : 'No customer orders have been placed yet.'}
                    </p>
                  </div>
                );
              }

              const getStatusBadge = (status: AdminOrder['status']) => {
                switch (status) {
                  case 'Delivered':
                    return 'bg-emerald-100 text-emerald-800 border-emerald-300';
                  case 'On the Way':
                    return 'bg-blue-100 text-blue-800 border-blue-300';
                  case 'Preparing':
                    return 'bg-amber-100 text-amber-800 border-amber-300';
                  case 'Placed':
                    return 'bg-purple-100 text-purple-800 border-purple-300';
                  default:
                    return 'bg-gray-100 text-gray-800 border-gray-300';
                }
              };

              return (
                <div className="space-y-4">
                  {filtered.map((order) => {
                    const orderId = order.orderNumber || order.id || 'GRS-ORDER';
                    const isUpdating = updatingOrderId === (order._id || order.id || order.orderNumber);

                    return (
                      <div
                        key={order._id || order.id}
                        className="bg-white rounded-3xl p-5 sm:p-6 border border-greesal-beige/90 shadow-sm hover:shadow-md transition-all space-y-4 text-left"
                      >
                        {/* Order Header: ID, Customer & Status */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-100 pb-4">
                          <div className="flex items-start sm:items-center gap-3">
                            <div className="w-12 h-12 rounded-2xl bg-greesal-lightgreen/70 border border-greesal-emerald/25 flex items-center justify-center text-greesal-forest font-black text-sm flex-shrink-0 shadow-2xs">
                              <ShoppingBag className="w-5 h-5 text-emerald-700" />
                            </div>
                            <div>
                              <div className="flex flex-wrap items-center gap-2">
                                <h3 className="font-extrabold text-base text-greesal-dark">{orderId}</h3>
                                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black border uppercase tracking-wider ${getStatusBadge(order.status)}`}>
                                  {order.status}
                                </span>
                              </div>
                              <p className="text-xs text-gray-400 font-medium flex items-center gap-1.5 mt-0.5">
                                <Clock className="w-3.5 h-3.5" /> {order.date}
                              </p>
                            </div>
                          </div>

                          {/* Customer Details Pill */}
                          <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-xs bg-gray-50 p-2.5 rounded-2xl border border-gray-100">
                            <div className="flex items-center gap-1.5 font-bold text-greesal-dark">
                              <User className="w-3.5 h-3.5 text-greesal-forest" />
                              <span>{order.customerName || 'Greesal Member'}</span>
                            </div>
                            {order.customerMobile && (
                              <a
                                href={`tel:${order.customerMobile}`}
                                className="flex items-center gap-1 text-emerald-700 font-bold hover:underline"
                              >
                                <Phone className="w-3 h-3" />
                                <span>{order.customerMobile}</span>
                              </a>
                            )}
                            {order.customerEmail && (
                              <span className="hidden md:flex items-center gap-1 text-gray-500">
                                <Mail className="w-3 h-3" />
                                <span>{order.customerEmail}</span>
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Order Items Table / Visual Grid */}
                        <div className="space-y-2.5">
                          <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center gap-1.5">
                            <ShoppingBag className="w-3.5 h-3.5 text-[#123B2B]" />
                            <span>Ordered Salad Bowls ({order.items.reduce((acc, i) => acc + i.quantity, 0)})</span>
                          </h4>

                          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                            {order.items.map((item, idx) => (
                              <div
                                key={idx}
                                className="flex items-center gap-3 p-3 rounded-2xl bg-[#FAF6F0] border border-greesal-beige/80 text-xs"
                              >
                                <img
                                  src={item.image}
                                  alt={item.name}
                                  className="w-12 h-12 object-cover rounded-xl border border-greesal-beige flex-shrink-0"
                                />
                                <div className="min-w-0 flex-1">
                                  <p className="font-bold text-greesal-dark truncate">{item.name}</p>
                                  <p className="text-[11px] text-gray-500 mt-0.5">
                                    Qty: <strong className="text-greesal-dark font-bold">{item.quantity}</strong> &bull; {item.price}
                                  </p>
                                </div>
                                <span className="font-black text-greesal-forest text-xs">
                                  ₹{(parseInt(item.price.replace(/[^\d]/g, '')) || 0) * item.quantity}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Delivery Location, Slot & Bill Row */}
                        <div className="grid grid-cols-1 md:grid-cols-12 gap-3 pt-2 text-xs">
                          <div className="md:col-span-8 p-3 rounded-xl bg-gray-50 border border-gray-100 space-y-2">
                            <div className="flex items-start gap-2">
                              <MapPin className="w-4 h-4 text-emerald-700 flex-shrink-0 mt-0.5" />
                              <div className="flex-1">
                                <p className="font-bold text-gray-600 text-[11px]">Delivery Destination:</p>
                                <p className="text-greesal-dark font-semibold leading-relaxed">{order.deliveryAddress || 'Standard Delivery Location'}</p>
                              </div>
                            </div>

                            {/* Slot, Google Maps Pin & Notes */}
                            <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-gray-200/60">
                              {order.deliverySlot && (
                                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-100 text-emerald-900 font-bold text-[11px]">
                                  <Clock className="w-3 h-3 text-emerald-700" />
                                  <span>{order.deliverySlot}</span>
                                </span>
                              )}

                              {order.mapsUrl && (
                                <a
                                  href={order.mapsUrl}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#20493c] text-white hover:bg-[#123B2B] font-bold text-[11px] transition-colors shadow-2xs"
                                >
                                  <MapPin className="w-3 h-3 text-[#fbce45]" />
                                  <span>📍 View Google Maps Pin</span>
                                  <ExternalLink className="w-2.5 h-2.5 opacity-70" />
                                </a>
                              )}

                              {order.notes && (
                                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-50 border border-amber-200 text-amber-900 font-medium text-[11px]">
                                  <span>📝 Note: {order.notes}</span>
                                </span>
                              )}
                            </div>
                          </div>

                          <div className="md:col-span-4 p-3 rounded-xl bg-greesal-cream border border-greesal-beige/80 flex flex-col justify-between">
                            <div>
                              <p className="text-[11px] text-gray-500 font-bold">Total Bill Amount</p>
                              <p className="text-[10px] text-emerald-700 font-medium">Mode: {order.paymentMethod || 'Online UPI / COD'}</p>
                            </div>
                            <span className="text-2xl font-black text-[#123B2B] mt-1">₹{order.total}</span>
                          </div>
                        </div>

                        {/* Admin Status Controls & Action Bar */}
                        <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-gray-100">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-xs font-bold text-gray-600">Update Status:</span>
                            {(['Placed', 'Preparing', 'On the Way', 'Delivered'] as const).map((st) => (
                              <button
                                key={st}
                                disabled={isUpdating || order.status === st}
                                onClick={() => handleUpdateOrderStatus(order, st)}
                                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1 ${
                                  order.status === st
                                    ? 'bg-[#123B2B] text-white shadow-xs'
                                    : 'bg-gray-100 hover:bg-emerald-50 text-gray-700 hover:text-emerald-900 border border-gray-200'
                                } disabled:opacity-60`}
                              >
                                {order.status === st && <Check className="w-3 h-3 text-emerald-300" />}
                                <span>{st}</span>
                              </button>
                            ))}
                          </div>

                          <div className="flex items-center gap-2 flex-wrap">
                            {/* Contact Customer on WhatsApp */}
                            {order.customerMobile && (
                              <button
                                onClick={() => {
                                  const cleanPhone = order.customerMobile?.replace(/\D/g, '') || '';
                                  const msg = `Hello ${order.customerName || 'Customer'}, your Greesal order *${orderId}* is currently *${order.status}*. Let us know if you need anything! 🥗`;
                                  window.open(`https://wa.me/91${cleanPhone}?text=${encodeURIComponent(msg)}`, '_blank');
                                }}
                                className="px-3 py-1.5 rounded-xl bg-[#25D366] hover:bg-[#20BD5A] text-white text-xs font-bold flex items-center gap-1 transition-colors cursor-pointer"
                                title="Chat with customer on WhatsApp"
                              >
                                <Phone className="w-3.5 h-3.5 fill-white" />
                                <span>Notify Customer</span>
                              </button>
                            )}

                            <button
                              onClick={() => {
                                setAdminInvoiceOrder({
                                  id: order.id || order.orderNumber || 'GRS-ORDER',
                                  orderNumber: order.orderNumber || order.id,
                                  customerName: order.customerName || 'Greesal Member',
                                  customerEmail: order.customerEmail || 'customer@greesal.com',
                                  customerMobile: order.customerMobile || '+91 98765 43210',
                                  date: order.date,
                                  timestamp: order.timestamp,
                                  status: order.status,
                                  items: order.items,
                                  subtotal: order.subtotal,
                                  deliveryFee: order.deliveryFee,
                                  total: order.total,
                                  deliveryAddress: order.deliveryAddress,
                                  paymentMethod: order.paymentMethod
                                });
                                setIsAdminInvoiceOpen(true);
                              }}
                              className="px-3 py-1.5 rounded-xl bg-[#FAF6F0] hover:bg-[#F3EDE2] text-[#123B2B] border border-[#EBE2D3] text-xs font-bold flex items-center gap-1 transition-colors cursor-pointer"
                              title="Download/Print Bill"
                            >
                              <FileText className="w-3.5 h-3.5 text-[#C89D4B]" />
                              <span>Bill Receipt</span>
                            </button>

                            <button
                              onClick={() => handleDeleteOrder(order._id || order.id || order.orderNumber || '')}
                              className="p-2 rounded-xl text-red-500 hover:text-red-700 hover:bg-red-50 border border-transparent hover:border-red-100 transition-colors cursor-pointer text-xs font-bold flex items-center gap-1"
                              title="Delete Order"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                              <span className="hidden sm:inline">Delete</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              );
            })()}
          </div>
        ) : activeTab === 'timing' ? (
          /* TAB: SHOP ONLINE TIMING & ANNOUNCEMENT NOTICE MANAGER */
          <div className="space-y-8">
            <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-greesal-beige/60 space-y-6">
              
              {/* Header with Preset Loader */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-100 pb-5">
                <div>
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100/80 border border-emerald-300 text-emerald-900 text-xs font-black uppercase tracking-wider mb-2">
                    <Clock className="w-3.5 h-3.5 text-emerald-700" />
                    <span>Store Operations &amp; Announcement Center</span>
                  </div>
                  <h2 className="text-2xl font-black text-[#123B2B] tracking-tight">
                    Online Shop Hours &amp; Live Notice Manager
                  </h2>
                  <p className="text-xs text-gray-500 font-medium mt-1">
                    Control online shop status (open/closed), set daily ordering hours, and publish announcement notices visible across both Web and Mobile App.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setIsOpen(true);
                      setOpeningTime('08:00 AM');
                      setClosingTime('10:30 PM');
                      setShopTimingText('Open Daily: 8:00 AM – 10:30 PM');
                      setNotice('Fresh Organic Harvest Delivered in 30 Mins across Surat • Free Delivery on ₹499+');
                      setShowNotice(true);
                      setNoticeType('announcement');
                      setClosedMessage('Our kitchen is currently closed. Opening again at 08:00 AM. Pre-orders are welcome!');
                    }}
                    className="px-3.5 py-2 rounded-xl bg-[#FAF6F0] hover:bg-[#F3EDE2] text-[#123B2B] border border-[#E2DCD2] text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 self-start sm:self-auto flex-shrink-0"
                  >
                    <RotateCcw className="w-3.5 h-3.5 text-[#C89D4B]" />
                    <span>Reset Standard Hours</span>
                  </button>
                </div>
              </div>

              <form onSubmit={handleSaveStoreTiming} className="space-y-7">
                
                {/* 1. ONLINE STORE STATUS TOGGLE */}
                <div className={`p-5 sm:p-6 rounded-3xl border transition-all text-left ${
                  isOpen 
                    ? 'bg-emerald-50/60 border-emerald-200' 
                    : 'bg-red-50/60 border-red-200'
                }`}>
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className={`w-3 h-3 rounded-full ${isOpen ? 'bg-emerald-500 animate-pulse' : 'bg-red-500'}`} />
                        <h3 className="text-base font-black text-[#123B2B]">
                          Online Ordering Status: {isOpen ? (
                            <span className="text-emerald-700 font-black">OPEN &amp; ACCEPTING ORDERS</span>
                          ) : (
                            <span className="text-red-700 font-black">CLOSED / PAUSED</span>
                          )}
                        </h3>
                      </div>
                      <p className="text-xs text-gray-600 font-medium">
                        {isOpen 
                          ? 'Customers can browse full salad menu and place real-time delivery orders.'
                          : 'Store is temporarily marked closed on web & mobile app. Closed notice will be displayed.'}
                      </p>
                    </div>

                    {/* Toggle Button */}
                    <button
                      type="button"
                      onClick={() => setIsOpen(!isOpen)}
                      className={`px-5 py-3 rounded-2xl font-black text-xs sm:text-sm flex items-center gap-2 transition-all cursor-pointer shadow-sm ${
                        isOpen
                          ? 'bg-emerald-700 hover:bg-emerald-800 text-white'
                          : 'bg-red-600 hover:bg-red-700 text-white'
                      }`}
                    >
                      {isOpen ? (
                        <>
                          <CheckCircle className="w-4 h-4 text-emerald-200" />
                          <span>Store Is LIVE (Click to Close)</span>
                        </>
                      ) : (
                        <>
                          <AlertCircle className="w-4 h-4 text-red-200" />
                          <span>Store Is CLOSED (Click to Open)</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {/* 2. OPERATING HOURS & DELIVERY SCHEDULE */}
                <div className="bg-[#FAF6F0] p-5 sm:p-6 rounded-3xl border border-[#EBE2D3] space-y-4 text-left">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <h3 className="text-sm font-black text-[#123B2B] flex items-center gap-2">
                        <Clock className="w-4 h-4 text-[#237357]" />
                        <span>Online Shop Timing &amp; Ordering Hours</span>
                      </h3>
                      <p className="text-[11px] text-gray-500 mt-0.5">
                        These hours are displayed on the top notification bar, home screen, and product pages on both Web and Mobile.
                      </p>
                    </div>

                    {/* Quick Presets */}
                    <div className="flex flex-wrap gap-1.5 self-start">
                      <button
                        type="button"
                        onClick={() => {
                          setOpeningTime('08:00 AM');
                          setClosingTime('10:30 PM');
                          setShopTimingText('Open Daily: 8:00 AM – 10:30 PM');
                        }}
                        className="px-2.5 py-1 rounded-lg bg-white hover:bg-gray-50 border border-gray-200 text-[11px] font-bold text-[#123B2B] cursor-pointer"
                      >
                        8 AM - 10:30 PM
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setOpeningTime('09:00 AM');
                          setClosingTime('11:00 PM');
                          setShopTimingText('Open Daily: 9:00 AM – 11:00 PM');
                        }}
                        className="px-2.5 py-1 rounded-lg bg-white hover:bg-gray-50 border border-gray-200 text-[11px] font-bold text-[#123B2B] cursor-pointer"
                      >
                        9 AM - 11 PM
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setOpeningTime('07:00 AM');
                          setClosingTime('10:00 PM');
                          setShopTimingText('Open Daily: 7:00 AM – 10:00 PM');
                        }}
                        className="px-2.5 py-1 rounded-lg bg-white hover:bg-gray-50 border border-gray-200 text-[11px] font-bold text-[#123B2B] cursor-pointer"
                      >
                        7 AM - 10 PM
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setOpeningTime('12:00 AM');
                          setClosingTime('11:59 PM');
                          setShopTimingText('24 Hours Online Delivery (Open All Days)');
                        }}
                        className="px-2.5 py-1 rounded-lg bg-white hover:bg-gray-50 border border-gray-200 text-[11px] font-bold text-[#123B2B] cursor-pointer"
                      >
                        24/7 Always Open
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-[#123B2B] block">
                        Opening Time
                      </label>
                      <div className="relative">
                        <Clock className="w-4 h-4 text-emerald-600 absolute left-3.5 top-1/2 -translate-y-1/2" />
                        <input
                          type="text"
                          value={openingTime}
                          onChange={(e) => setOpeningTime(e.target.value)}
                          placeholder="08:00 AM"
                          required
                          className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-300 bg-white text-gray-800 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-[#123B2B]/40 focus:border-[#123B2B]"
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-[#123B2B] block">
                        Closing Time
                      </label>
                      <div className="relative">
                        <Clock className="w-4 h-4 text-amber-600 absolute left-3.5 top-1/2 -translate-y-1/2" />
                        <input
                          type="text"
                          value={closingTime}
                          onChange={(e) => setClosingTime(e.target.value)}
                          placeholder="10:30 PM"
                          required
                          className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-300 bg-white text-gray-800 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-[#123B2B]/40 focus:border-[#123B2B]"
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-[#123B2B] block">
                        Display Tagline / Schedule Text
                      </label>
                      <input
                        type="text"
                        value={shopTimingText}
                        onChange={(e) => setShopTimingText(e.target.value)}
                        placeholder="Open Daily: 8:00 AM – 10:30 PM"
                        required
                        className="w-full px-4 py-2.5 rounded-xl border border-gray-300 bg-white text-gray-800 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#123B2B]/40 focus:border-[#123B2B]"
                      />
                    </div>
                  </div>
                </div>

                {/* 3. ANNOUNCEMENT / NOTICE MESSAGE (ENTERED BY ADMIN) */}
                <div className="bg-[#FAF6F0] p-5 sm:p-6 rounded-3xl border border-[#EBE2D3] space-y-4 text-left">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <h3 className="text-sm font-black text-[#123B2B] flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-[#C89D4B]" />
                        <span>Live Announcement &amp; Notification Message</span>
                      </h3>
                      <p className="text-[11px] text-gray-500 mt-0.5">
                        This message is broadcast at the top header of both the Web and Mobile App.
                      </p>
                    </div>

                    {/* Enable / Disable Banner Toggle */}
                    <label className="flex items-center gap-2 cursor-pointer bg-white px-3.5 py-1.5 rounded-xl border border-gray-200 self-start">
                      <input
                        type="checkbox"
                        checked={showNotice}
                        onChange={(e) => setShowNotice(e.target.checked)}
                        className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500"
                      />
                      <span className="text-xs font-bold text-[#123B2B]">
                        {showNotice ? 'Announcement Bar: ENABLED' : 'Announcement Bar: DISABLED'}
                      </span>
                    </label>
                  </div>

                  {/* Notice Style Selector */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-[#123B2B] block">
                      Announcement Theme Style
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                      {[
                        { id: 'announcement', label: '🌿 Organic Emerald', desc: 'Fresh & harvest updates' },
                        { id: 'discount', label: '⭐ Golden Promo', desc: 'Discounts & special deals' },
                        { id: 'alert', label: '🚨 Urgent / Holiday', desc: 'Kitchen notice or alerts' },
                        { id: 'info', label: 'ℹ️ Sky Blue Info', desc: 'General information' }
                      ].map((th) => (
                        <button
                          key={th.id}
                          type="button"
                          onClick={() => setNoticeType(th.id as any)}
                          className={`p-3 rounded-2xl text-left border-2 transition-all cursor-pointer ${
                            noticeType === th.id
                              ? 'border-[#123B2B] ring-2 ring-[#123B2B]/20 bg-white shadow-sm'
                              : 'border-transparent bg-white/70 hover:bg-white'
                          }`}
                        >
                          <p className="text-xs font-bold text-[#123B2B]">{th.label}</p>
                          <p className="text-[10px] text-gray-500 mt-0.5">{th.desc}</p>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Main Notice Text */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-[#123B2B] block">
                      Announcement Message (Live Text)
                    </label>
                    <textarea
                      value={notice}
                      onChange={(e) => setNotice(e.target.value)}
                      placeholder="e.g. Fresh Organic Harvest Delivered in 30 Mins across Surat • Free Delivery on orders above ₹499!"
                      rows={2}
                      required
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-300 bg-white text-gray-800 text-xs font-medium leading-relaxed focus:outline-none focus:ring-2 focus:ring-[#123B2B]/40 focus:border-[#123B2B]"
                    />
                  </div>

                  {/* Closed Kitchen Custom Message */}
                  <div className="space-y-1.5 pt-2 border-t border-gray-200/80">
                    <label className="text-xs font-bold text-[#123B2B] block">
                      Custom Message When Store is Closed / After-Hours
                    </label>
                    <input
                      type="text"
                      value={closedMessage}
                      onChange={(e) => setClosedMessage(e.target.value)}
                      placeholder="e.g. Our kitchen is currently closed. Opening again at 08:00 AM. Pre-orders are welcome!"
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-300 bg-white text-gray-800 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#123B2B]/40 focus:border-[#123B2B]"
                    />
                  </div>
                </div>

                {/* 4. REAL-TIME INTERACTIVE DUAL PREVIEW (WEB & MOBILE APP) */}
                <div className="space-y-3 text-left">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-black text-[#123B2B] flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-[#C89D4B]" />
                      <span>Live Customer View Preview (Web &amp; Mobile App)</span>
                    </h3>
                    <span className="text-[10px] text-gray-400 font-bold uppercase">
                      Instant Live Rendering
                    </span>
                  </div>

                  {/* Preview Container */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    {/* Desktop Web Preview Mock */}
                    <div className="bg-[#FAF6F0] rounded-2xl p-4 border border-[#EBE2D3] space-y-3">
                      <div className="flex items-center justify-between text-[11px] font-bold text-gray-500">
                        <span>💻 Desktop Web Header Preview</span>
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                          Live Responsive
                        </span>
                      </div>

                      {/* Banner Mock */}
                      {showNotice && (
                        <div className={`px-3 py-2 rounded-xl text-xs font-semibold flex items-center justify-between shadow-xs ${
                          noticeType === 'discount'
                            ? 'bg-gradient-to-r from-amber-600 via-amber-700 to-amber-800 text-amber-50'
                            : noticeType === 'alert'
                            ? 'bg-gradient-to-r from-red-700 via-red-800 to-red-900 text-white'
                            : noticeType === 'info'
                            ? 'bg-gradient-to-r from-sky-700 via-sky-800 to-sky-900 text-white'
                            : 'bg-gradient-to-r from-[#0C2A20] via-[#123B2B] to-[#1C533A] text-emerald-100'
                        }`}>
                          <div className="flex items-center gap-2 truncate">
                            <span className="flex-shrink-0 text-xs">✨</span>
                            <span className="truncate">{notice}</span>
                          </div>
                          <div className="flex items-center gap-1.5 flex-shrink-0 text-[10px] font-bold px-2 py-0.5 rounded-full bg-white/20">
                            <span className={`w-1.5 h-1.5 rounded-full ${isOpen ? 'bg-emerald-400 animate-pulse' : 'bg-red-400'}`} />
                            <span>{isOpen ? `Open: ${openingTime} - ${closingTime}` : `Closed`}</span>
                          </div>
                        </div>
                      )}

                      {/* Mock Navigation Bar with Status */}
                      <div className="bg-white p-3 rounded-xl border border-gray-200 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <GreesalLogo size="sm" />
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold border ${
                            isOpen 
                              ? 'bg-emerald-50 text-emerald-800 border-emerald-200' 
                              : 'bg-red-50 text-red-800 border-red-200'
                          }`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${isOpen ? 'bg-emerald-500 animate-pulse' : 'bg-red-500'}`} />
                            <span>{isOpen ? `${openingTime} – ${closingTime}` : 'Currently Closed'}</span>
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Mobile App Preview Mock */}
                    <div className="bg-[#FAF6F0] rounded-2xl p-4 border border-[#EBE2D3] space-y-3">
                      <div className="flex items-center justify-between text-[11px] font-bold text-gray-500">
                        <span>📱 Mobile App (Expo &amp; Capacitor) Preview</span>
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#123B2B] text-white">
                          Mobile View
                        </span>
                      </div>

                      {/* Mobile Top Bar Mock */}
                      <div className="max-w-xs mx-auto bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-xs">
                        {showNotice && (
                          <div className={`px-2.5 py-1.5 text-[10px] font-bold flex items-center justify-between ${
                            noticeType === 'discount'
                              ? 'bg-amber-700 text-amber-50'
                              : noticeType === 'alert'
                              ? 'bg-red-700 text-white'
                              : noticeType === 'info'
                              ? 'bg-sky-700 text-white'
                              : 'bg-[#123B2B] text-emerald-100'
                          }`}>
                            <span className="truncate">{notice}</span>
                            <span className="text-[9px] px-1.5 py-0.2 rounded bg-white/20 whitespace-nowrap ml-1">
                              {isOpen ? `${openingTime}` : 'Closed'}
                            </span>
                          </div>
                        )}
                        <div className="p-2.5 flex items-center justify-between border-b border-gray-100">
                          <GreesalLogo size="sm" />
                          <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${
                            isOpen ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'
                          }`}>
                            {isOpen ? `🟢 ${openingTime} - ${closingTime}` : '🔴 Closed'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Save Submission Button */}
                <div className="pt-4 border-t border-gray-100 flex items-center justify-between gap-4">
                  <span className="text-xs text-gray-400 font-medium hidden sm:inline">
                    Updates will sync to all connected web and mobile app users immediately.
                  </span>

                  <button
                    type="submit"
                    disabled={isActionLoading}
                    className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-[#123B2B] hover:bg-[#1C4D3A] text-white font-black text-sm flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transition-all duration-200 cursor-pointer disabled:opacity-85"
                  >
                    {isActionLoading ? (
                      <Loader2 className="w-4 h-4 animate-spin text-[#C89D4B]" />
                    ) : (
                      <Save className="w-4 h-4 text-[#C89D4B]" />
                    )}
                    <span>Save Shop Timing &amp; Notice Settings</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        ) : activeTab === 'banner' ? (
          /* Tab 4: Hero Banner & Image Manager - Proper Perfect View */
          <div className="space-y-6 text-left">
            <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-greesal-beige/60 space-y-6">
              
              {/* Studio Header & Quick Action Toolbar */}
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-gray-100 pb-5">
                <div>
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#C89D4B]/15 border border-[#C89D4B]/40 text-[#123B2B] text-xs font-black uppercase tracking-wider mb-2">
                    <Sparkles className="w-3.5 h-3.5 text-[#C89D4B]" />
                    <span>Homepage Hero Studio</span>
                  </div>
                  <h2 className="text-2xl font-black text-[#123B2B] tracking-tight">
                    Hero Banner &amp; Image Manager
                  </h2>
                  <p className="text-xs text-gray-500 font-medium mt-1">
                    Design the customer's first impression with live 1:1 desktop and mobile preview simulation.
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2.5">
                  {/* Viewport Mode Switcher (Desktop vs Mobile) */}
                  <div className="flex bg-[#F4EFE6] rounded-2xl p-1 border border-[#E2DCD2] shadow-2xs">
                    <button
                      type="button"
                      onClick={() => setBannerPreviewDevice('desktop')}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                        bannerPreviewDevice === 'desktop'
                          ? 'bg-[#123B2B] text-white shadow-xs'
                          : 'text-gray-600 hover:text-[#123B2B]'
                      }`}
                      title="Preview in full desktop widescreen"
                    >
                      <Monitor className="w-3.5 h-3.5" />
                      <span>Desktop View</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setBannerPreviewDevice('mobile')}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                        bannerPreviewDevice === 'mobile'
                          ? 'bg-[#123B2B] text-white shadow-xs'
                          : 'text-gray-600 hover:text-[#123B2B]'
                      }`}
                      title="Preview in customer smartphone view"
                    >
                      <Smartphone className="w-3.5 h-3.5" />
                      <span>Mobile View</span>
                    </button>
                  </div>

                  {/* Reset to Brand Defaults */}
                  <button
                    type="button"
                    onClick={() => {
                      setBannerTitle('Farm-Fresh Organic Salad Bowls');
                      setBannerBadge('');
                      setBannerStoryHeading('A short story about');
                      setBannerStoryBrand('GREESAL');
                      setBannerStoryP1(
                        'GREESAL, Farm-Fresh Organic Salad Bowls! Idea comes from a small thing and now it’s become a trusted brand of salads and healthy food in Surat, Gujarat.'
                      );
                      setBannerStoryP2(
                        'GREESAL — Slice of Green, where health meets Freshness & Deliciousness! One more thing comes to mind when we talk about healthy food is organic, natural, and fresh — and Greesal is committed to providing only fresh, healthy, and delicious salads with fresh and organic ingredients.'
                      );
                      setBannerStoryP3(
                        'At GREESAL, we bring you 21 varieties of fresh, healthy, and delicious salads, carefully crafted to offer the perfect balance of taste and nutrition. Staying true to our tagline, “Farm-Fresh Organic Salad Bowls”, we deliver wholesome salads right to your doorstep, ensuring you enjoy a guilt-free, nutritious meal every day.'
                      );
                      setBannerStoryP4(
                        'Our handcrafted salads are made using premium-quality ingredients, without onion and garlic, and paired with our signature homemade dressings. Whether you’re on a fitness journey, looking for a quick healthy meal, or simply love fresh greens, Greesal is your go-to destination for healthy eating.'
                      );
                      setBannerImage('https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=1000&q=85');
                      setBannerPill1('100% Handmade Dressings');
                      setBannerPill2('No Onion • No Garlic');
                      setBannerStatBadge('Health Lovers');
                      setBannerStatDelivered('72,600+ Salads Delivered');
                      setBannerHighlight1Title('Free Delivery in Surat');
                      setBannerHighlight2Title('Lunch & Evening Slots');
                      setBannerHighlight3Title('100% Satvik Dressing');
                      setBannerCtaText('Explore Salad Menu');
                      setBannerCtaLink('#menu');
                      setBannerImageSourceType('url');
                    }}
                    className="px-3 py-2 rounded-xl bg-[#FAF6F0] hover:bg-[#F3EDE2] text-[#123B2B] border border-[#E2DCD2] text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5"
                  >
                    <RotateCcw className="w-3.5 h-3.5 text-[#C89D4B]" />
                    <span>Reset Brand Defaults</span>
                  </button>

                  {/* Top Direct Save Button */}
                  <button
                    type="button"
                    onClick={handleSaveBanner}
                    disabled={isActionLoading}
                    className="px-5 py-2 rounded-xl bg-[#123B2B] hover:bg-[#1C4D3A] text-white font-bold text-xs flex items-center gap-1.5 shadow-sm hover:shadow transition-all disabled:opacity-80 cursor-pointer"
                  >
                    {isActionLoading ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin text-[#fbce45]" />
                    ) : (
                      <Save className="w-3.5 h-3.5 text-[#fbce45]" />
                    )}
                    <span>Save Changes</span>
                  </button>
                </div>
              </div>

              {/* 1:1 REAL-TIME LIVE SIMULATION VIEWPORT */}
              <div className="space-y-3 text-left">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Eye className="w-4 h-4 text-[#20493c]" />
                    <h3 className="text-sm font-black text-[#123B2B]">
                      Live Interactive Hero Simulation
                    </h3>
                    <span className="text-[10px] text-gray-500 font-semibold hidden sm:inline">
                      (Updates instantly as you edit the fields below)
                    </span>
                  </div>
                  <span className="text-[10px] text-emerald-800 font-bold uppercase bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                    {bannerPreviewDevice === 'desktop' ? '🖥️ Desktop 1536px' : '📱 Mobile 375px'}
                  </span>
                </div>

                {/* Simulation Canvas Container */}
                <div className="bg-[#FAF6F0] p-4 sm:p-6 rounded-3xl border border-[#EBE2D3] flex justify-center overflow-hidden">
                  <div
                    className={`transition-all duration-300 ${
                      bannerPreviewDevice === 'mobile'
                        ? 'w-full max-w-[390px] bg-white rounded-[40px] border-8 border-gray-800 shadow-2xl p-4 overflow-hidden relative'
                        : 'w-full bg-white rounded-3xl border border-gray-200 shadow-lg p-6 sm:p-8 relative overflow-hidden'
                    }`}
                  >
                    {/* Top Mint Border Bar */}
                    <div className="absolute top-0 left-0 right-0 h-1.5 bg-[#6ac6ac]" />

                    {/* Slogan Header */}
                    <div className="text-center mb-6 pt-2">
                      {bannerBadge ? (
                        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#fbce45]/20 text-[#20493c] text-[11px] font-bold tracking-wider uppercase mb-2 border border-[#fbce45]/40">
                          <Sparkles className="w-3 h-3 text-[#20493c]" />
                          <span>{bannerBadge}</span>
                        </div>
                      ) : null}
                      <h4
                        className={`font-josefin font-bold text-[#fbce45] uppercase tracking-tight drop-shadow-xs ${
                          bannerPreviewDevice === 'mobile' ? 'text-2xl sm:text-3xl' : 'text-3xl sm:text-5xl lg:text-6xl'
                        }`}
                      >
                        {bannerTitle || 'FARM-FRESH ORGANIC SALAD BOWLS'}
                      </h4>
                    </div>

                    {/* Content Grid */}
                    <div
                      className={`grid gap-6 items-center ${
                        bannerPreviewDevice === 'mobile' ? 'grid-cols-1' : 'grid-cols-1 lg:grid-cols-12'
                      }`}
                    >
                      {/* Left: Graphic with Floating Badges */}
                      <div
                        className={`flex justify-center ${
                          bannerPreviewDevice === 'mobile' ? 'order-1' : 'lg:col-span-5 order-2 lg:order-1'
                        }`}
                      >
                        <div className="relative w-full max-w-xs sm:max-w-sm">
                          <div className="relative rounded-3xl overflow-hidden shadow-xl border-4 border-white bg-gradient-to-b from-[#f2f8f5] to-[#e4f4ed] p-2 sm:p-3">
                            <img
                              src={bannerImage || '/images/salad_bowl_hero.jpg'}
                              alt="Hero Bowl"
                              className="w-full h-48 sm:h-64 object-cover rounded-2xl"
                              onError={(e) => {
                                (e.target as HTMLImageElement).src =
                                  'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=1000&q=85';
                              }}
                            />

                            {/* Floating Micro-Badge 1 */}
                            <div className="absolute top-4 left-4 bg-white/95 backdrop-blur-md px-3 py-1 rounded-full shadow-md border border-[#6ac6ac]/30 flex items-center gap-1.5">
                              <Leaf className="w-3.5 h-3.5 text-[#20493c]" />
                              <span className="text-[11px] font-bold text-[#20493c]">
                                {bannerPill1 || '100% Handmade Dressings'}
                              </span>
                            </div>

                            {/* Floating Micro-Badge 2 */}
                            <div className="absolute bottom-4 right-4 bg-[#20493c] text-white px-3 py-1.5 rounded-xl shadow-lg flex items-center gap-1.5">
                              <ShieldCheck className="w-3.5 h-3.5 text-[#fbce45]" />
                              <div className="text-left">
                                <p className="text-[8px] text-[#fbce45] font-bold uppercase tracking-wider">
                                  Purity Assured
                                </p>
                                <p className="text-[10px] font-bold">{bannerPill2 || 'No Onion • No Garlic'}</p>
                              </div>
                            </div>
                          </div>

                          {/* Customer Rating Teaser Card */}
                          <div className="absolute -bottom-4 -left-2 bg-white px-3 py-2 rounded-2xl shadow-xl border border-gray-100 flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-full bg-[#fbce45] flex items-center justify-center font-bold text-xs text-[#20493c]">
                              4.9★
                            </div>
                            <div className="text-left">
                              <p className="text-[11px] font-bold text-[#1a1a1a]">
                                {bannerStatBadge || 'Health Lovers'}
                              </p>
                              <p className="text-[10px] text-[#20493c]/70 font-semibold">
                                {bannerStatDelivered || '72,600+ Salads Delivered'}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Right: Story Details & CTAs */}
                      <div
                        className={`space-y-3.5 text-left ${
                          bannerPreviewDevice === 'mobile' ? 'order-2' : 'lg:col-span-7 order-1 lg:order-2'
                        }`}
                      >
                        <div>
                          <span className="font-montserrat font-bold text-xs sm:text-sm text-[#6ac6ac] uppercase tracking-wide block">
                            {bannerStoryHeading || 'A short story about'}
                          </span>
                          <h5 className="font-montserrat font-extrabold text-2xl sm:text-3xl text-[#20493c] tracking-tight">
                            {bannerStoryBrand || 'GREESAL'}
                          </h5>
                        </div>

                        {/* Story Paragraphs Line-by-Line Formatted View */}
                        <div className="space-y-3 font-dmsans">
                          {/* Story Paragraph 1 */}
                          {bannerStoryP1 && (
                            <div className="bg-gradient-to-br from-[#eef8f3] to-[#f5fbf8] rounded-2xl p-3.5 sm:p-4 border border-[#a2dfcb] border-l-4 border-l-[#123B2B] shadow-2xs">
                              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#123B2B] text-white text-[10px] font-bold uppercase tracking-wider mb-1.5">
                                <Leaf className="w-3 h-3 text-[#86efac]" />
                                <span>Origin &amp; Vision</span>
                              </div>
                              <p className="font-semibold text-xs sm:text-sm text-[#123B2B] leading-relaxed whitespace-pre-line">
                                {bannerStoryP1}
                              </p>
                            </div>
                          )}

                          {/* Story Paragraph 2 */}
                          {bannerStoryP2 && (
                            <div className="bg-gradient-to-br from-[#f0f9f5] to-[#f7fcf9] rounded-2xl p-3.5 sm:p-4 border border-[#a2dfcb] border-l-4 border-l-[#25a87d] shadow-2xs">
                              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#25a87d]/15 text-[#1b5e46] text-[10px] font-bold uppercase tracking-wider mb-1.5 border border-[#25a87d]/20">
                                <Sparkles className="w-3 h-3 text-[#25a87d]" />
                                <span>100% Fresh &amp; Organic Goodness</span>
                              </div>
                              <p className="text-xs sm:text-sm text-[#123B2B]/95 leading-relaxed whitespace-pre-line font-medium">
                                {bannerStoryP2}
                              </p>
                            </div>
                          )}

                          {/* Story Paragraph 3 */}
                          {bannerStoryP3 && (
                            <div className="bg-gradient-to-br from-[#f0f9f5] to-[#f7fcf9] rounded-2xl p-3.5 sm:p-4 border border-[#a2dfcb] border-l-4 border-l-[#16805d] shadow-2xs">
                              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#16805d]/15 text-[#123B2B] text-[10px] font-bold uppercase tracking-wider mb-1.5 border border-[#16805d]/20">
                                <Utensils className="w-3 h-3 text-[#16805d]" />
                                <span>21+ Varieties &amp; Express Delivery</span>
                              </div>
                              <p className="text-xs sm:text-sm text-[#123B2B]/95 leading-relaxed whitespace-pre-line font-medium">
                                {bannerStoryP3}
                              </p>
                            </div>
                          )}

                          {/* Story Paragraph 4: Dedicated Satvik Callout Box */}
                          {bannerStoryP4 && (
                            <div className="rounded-2xl p-3.5 sm:p-4 bg-gradient-to-br from-[#e5f5ed] via-[#edf9f3] to-[#f4fbf7] border-2 border-[#3cae89] shadow-xs relative overflow-hidden">
                              <div className="flex items-center gap-2 mb-2">
                                <span className="p-1 rounded-lg bg-[#123B2B] text-white">
                                  <ShieldCheck className="w-3.5 h-3.5 text-[#86efac]" />
                                </span>
                                <div>
                                  <span className="font-extrabold text-[11px] sm:text-xs text-[#123B2B] tracking-wide uppercase block">
                                    100% Satvik Purity Guarantee
                                  </span>
                                  <span className="text-[9px] font-bold text-[#1b5e46] uppercase tracking-wider block">
                                    Strictly No Onion • No Garlic
                                  </span>
                                </div>
                              </div>
                              <p className="text-xs text-[#123B2B] font-medium leading-relaxed whitespace-pre-line bg-white/85 backdrop-blur-xs p-2.5 rounded-xl border border-[#a2dfcb]/70">
                                {bannerStoryP4}
                              </p>
                            </div>
                          )}
                        </div>

                        {/* CTA Buttons */}
                        <div className="pt-2 flex flex-wrap items-center gap-2.5">
                          <span className="inline-flex items-center gap-1.5 bg-[#20493c] text-white px-5 py-2.5 rounded-full font-bold text-xs shadow-sm">
                            <Utensils className="w-3.5 h-3.5 text-[#fbce45]" />
                            <span>{bannerCtaText || 'Explore Salad Menu'}</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                          </span>
                          <span className="inline-flex items-center gap-1.5 bg-[#fbce45] text-[#20493c] px-4 py-2.5 rounded-full font-extrabold text-xs shadow-xs">
                            <Clock className="w-3.5 h-3.5" />
                            <span>Daily Subscription Plans</span>
                          </span>
                        </div>

                        {/* 3 Bottom Feature Highlight Badges */}
                        <div className="pt-2 flex flex-wrap items-center gap-2 text-[11px] font-semibold text-[#20493c]">
                          <span className="inline-flex items-center gap-1.5 bg-[#f2f8f5] px-2.5 py-1 rounded-full border border-gray-100">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#6ac6ac]" /> {bannerHighlight1Title || 'Free Delivery in Surat'}
                          </span>
                          <span className="inline-flex items-center gap-1.5 bg-[#f2f8f5] px-2.5 py-1 rounded-full border border-gray-100">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#fbce45]" /> {bannerHighlight2Title || 'Lunch & Evening Slots'}
                          </span>
                          <span className="inline-flex items-center gap-1.5 bg-[#f2f8f5] px-2.5 py-1 rounded-full border border-gray-100">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#20493c]" /> {bannerHighlight3Title || '100% Satvik Dressing'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* MAIN FORM: 4 STRUCTURED CONTROL CARDS */}
              <form onSubmit={handleSaveBanner} className="space-y-6">
                
                {/* CARD 1: HERO PRODUCT IMAGE & MICRO-BADGES */}
                <div className="bg-[#FAF6F0] p-5 sm:p-6 rounded-3xl border border-[#EBE2D3] space-y-5">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#E2DCD2] pb-3">
                    <div>
                      <h3 className="text-sm font-black text-[#123B2B] flex items-center gap-2">
                        <ImageIcon className="w-4 h-4 text-[#237357]" />
                        <span>1. Hero Banner Product Image &amp; Badges</span>
                      </h3>
                      <p className="text-[11px] text-gray-500 mt-0.5">
                        Upload or select a high-resolution photo of your featured salad bowl, plus the floating micro-badges.
                      </p>
                    </div>

                    {/* Mode Selector */}
                    <div className="flex bg-white rounded-xl p-1 border border-gray-200 shadow-2xs self-start">
                      <button
                        type="button"
                        onClick={() => setBannerImageSourceType('file')}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                          bannerImageSourceType === 'file'
                            ? 'bg-[#123B2B] text-white shadow-2xs'
                            : 'text-gray-500 hover:text-[#123B2B]'
                        }`}
                      >
                        <UploadCloud className="w-3.5 h-3.5" />
                        <span>Upload File</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setBannerImageSourceType('url')}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                          bannerImageSourceType === 'url'
                            ? 'bg-[#123B2B] text-white shadow-2xs'
                            : 'text-gray-500 hover:text-[#123B2B]'
                        }`}
                      >
                        <LinkIcon className="w-3.5 h-3.5" />
                        <span>Image URL</span>
                      </button>
                    </div>
                  </div>

                  {/* Curated 1-Click Salad Photo Presets */}
                  <div className="space-y-1.5">
                    <span className="text-[11px] font-black uppercase text-[#123B2B] tracking-wider block">
                      ⚡ Quick One-Click Salad Photo Presets:
                    </span>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                      {[
                        {
                          name: 'Signature Greek Salad',
                          url: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=1000&q=85',
                        },
                        {
                          name: 'Avocado Detox Harvest',
                          url: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=1000&q=85',
                        },
                        {
                          name: 'High-Protein Quinoa',
                          url: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=1000&q=85',
                        },
                        {
                          name: 'Crisp Green Mix',
                          url: 'https://images.unsplash.com/photo-1526367790999-0150786686a2?auto=format&fit=crop&w=1000&q=85',
                        },
                      ].map((preset, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => {
                            setBannerImage(preset.url);
                            setBannerImageSourceType('url');
                          }}
                          className={`p-2 rounded-2xl border text-left flex items-center gap-2.5 transition-all cursor-pointer ${
                            bannerImage === preset.url
                              ? 'bg-white border-[#20493c] ring-2 ring-[#20493c]/30 shadow-xs'
                              : 'bg-white/80 hover:bg-white border-gray-200'
                          }`}
                        >
                          <img
                            src={preset.url}
                            alt={preset.name}
                            className="w-10 h-10 rounded-xl object-cover flex-shrink-0"
                          />
                          <div className="min-w-0">
                            <p className="text-[11px] font-bold text-[#123B2B] truncate">{preset.name}</p>
                            <span className="text-[9px] text-[#6ac6ac] font-bold">Use Preset</span>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {bannerImageSourceType === 'file' ? (
                    <div className="space-y-3">
                      <div
                        onClick={() => document.getElementById('banner-image-file-input')?.click()}
                        className="border-2 border-dashed border-[#123B2B]/30 hover:border-[#123B2B] bg-white rounded-2xl p-6 text-center cursor-pointer transition-all group flex flex-col items-center justify-center"
                      >
                        <input
                          id="banner-image-file-input"
                          type="file"
                          accept="image/*"
                          onChange={(e) => {
                            if (e.target.files && e.target.files[0]) {
                              processBannerImageFile(e.target.files[0]);
                            }
                          }}
                          className="hidden"
                        />
                        <div className="w-12 h-12 rounded-2xl bg-[#E8F3EE] text-[#123B2B] flex items-center justify-center mb-2 group-hover:scale-110 transition-transform shadow-xs">
                          <UploadCloud className="w-6 h-6 text-[#237357]" />
                        </div>
                        <p className="text-xs font-extrabold text-[#123B2B]">
                          Click to browse or drop hero image here
                        </p>
                        <p className="text-[11px] text-gray-400 mt-0.5">
                          PNG, JPG, WEBP • Automatically optimized
                        </p>
                      </div>

                      {bannerImage && (
                        <div className="flex items-center justify-between p-3 bg-white rounded-2xl border border-gray-200 shadow-2xs">
                          <div className="flex items-center gap-3 min-w-0">
                            <img
                              src={bannerImage}
                              alt="Hero Preview"
                              className="w-12 h-12 rounded-xl object-cover border border-gray-100 flex-shrink-0"
                            />
                            <div className="min-w-0">
                              <span className="inline-block px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-800 text-[10px] font-extrabold border border-emerald-200">
                                ✓ Custom Hero Photo Ready
                              </span>
                              <p className="text-xs text-gray-500 font-medium truncate mt-0.5">
                                {bannerImage.startsWith('data:') ? 'Custom uploaded image from local device' : bannerImage}
                              </p>
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => setBannerImage('')}
                            className="p-2 rounded-xl text-red-500 hover:bg-red-50 transition-colors cursor-pointer"
                            title="Remove image"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <div className="relative">
                        <ImageIcon className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                        <input
                          type="url"
                          value={bannerImage}
                          onChange={(e) => setBannerImage(e.target.value)}
                          placeholder="https://images.unsplash.com/... or /images/..."
                          className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-300 bg-white text-gray-800 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#123B2B]/40 focus:border-[#123B2B]"
                        />
                      </div>
                      {bannerImage && (
                        <div className="flex items-center gap-3 p-3 bg-white rounded-2xl border border-gray-200 shadow-2xs">
                          <img
                            src={bannerImage}
                            alt="URL Preview"
                            className="w-12 h-12 rounded-xl object-cover border border-gray-100 flex-shrink-0"
                          />
                          <div className="min-w-0">
                            <p className="text-xs font-bold text-[#123B2B]">Live Image Source</p>
                            <p className="text-[11px] text-gray-400 truncate mt-0.5">{bannerImage}</p>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Floating Micro-Badges & Review Counter Inputs */}
                  <div className="pt-2 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 border-t border-gray-200/80">
                    <div className="space-y-1">
                      <label className="text-[11px] font-bold text-[#123B2B] flex items-center gap-1">
                        <Leaf className="w-3 h-3 text-[#20493c]" />
                        <span>Floating Pill 1 (Top Left)</span>
                      </label>
                      <input
                        type="text"
                        value={bannerPill1}
                        onChange={(e) => setBannerPill1(e.target.value)}
                        placeholder="100% Handmade Dressings"
                        className="w-full px-3 py-2 rounded-xl border border-gray-300 bg-white text-xs font-medium text-gray-800 focus:outline-none focus:ring-1 focus:ring-[#123B2B]"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[11px] font-bold text-[#123B2B] flex items-center gap-1">
                        <ShieldCheck className="w-3 h-3 text-[#fbce45]" />
                        <span>Floating Pill 2 (Bottom Right)</span>
                      </label>
                      <input
                        type="text"
                        value={bannerPill2}
                        onChange={(e) => setBannerPill2(e.target.value)}
                        placeholder="No Onion • No Garlic"
                        className="w-full px-3 py-2 rounded-xl border border-gray-300 bg-white text-xs font-medium text-gray-800 focus:outline-none focus:ring-1 focus:ring-[#123B2B]"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[11px] font-bold text-gray-600 block">Rating Badge Subtitle</label>
                      <input
                        type="text"
                        value={bannerStatBadge}
                        onChange={(e) => setBannerStatBadge(e.target.value)}
                        placeholder="Health Lovers"
                        className="w-full px-3 py-2 rounded-xl border border-gray-300 bg-white text-xs font-medium text-gray-800 focus:outline-none focus:ring-1 focus:ring-[#123B2B]"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[11px] font-bold text-gray-600 block">Total Delivery Counter</label>
                      <input
                        type="text"
                        value={bannerStatDelivered}
                        onChange={(e) => setBannerStatDelivered(e.target.value)}
                        placeholder="72,600+ Salads Delivered"
                        className="w-full px-3 py-2 rounded-xl border border-gray-300 bg-white text-xs font-medium text-gray-800 focus:outline-none focus:ring-1 focus:ring-[#123B2B]"
                      />
                    </div>
                  </div>
                </div>

                {/* CARD 2: HERO CATCHPHRASE & HEADLINE */}
                <div className="bg-white p-5 sm:p-6 rounded-3xl border border-gray-200 shadow-sm space-y-4">
                  <div className="border-b border-gray-100 pb-3">
                    <h3 className="text-sm font-black text-[#123B2B] flex items-center gap-2">
                      <FileText className="w-4 h-4 text-[#237357]" />
                      <span>2. Hero Catchphrase &amp; Brand Headline</span>
                    </h3>
                    <p className="text-[11px] text-gray-500 mt-0.5">
                      Configure the prominent slogan and story title.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-[#123B2B] block">
                        Top Pill Badge Text
                      </label>
                      <input
                        type="text"
                        value={bannerBadge}
                        onChange={(e) => setBannerBadge(e.target.value)}
                        placeholder="#1 Fresh &amp; Organic Salad Brand"
                        required
                        className="w-full px-3 py-2.5 rounded-xl border border-gray-300 bg-white text-xs font-medium focus:outline-none focus:ring-1 focus:ring-[#123B2B]"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-bold text-[#123B2B] block">
                        Main Slogan (Josefin Sans H1 Headline)
                      </label>
                      <input
                        type="text"
                        value={bannerTitle}
                        onChange={(e) => setBannerTitle(e.target.value)}
                        placeholder="Farm-Fresh Organic Salad Bowls"
                        required
                        className="w-full px-3 py-2.5 rounded-xl border border-gray-300 bg-[#123B2B] text-[#fbce45] text-xs font-bold focus:outline-none focus:ring-1 focus:ring-[#123B2B]"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-bold text-gray-700 block">
                        Story Pre-Heading
                      </label>
                      <input
                        type="text"
                        value={bannerStoryHeading}
                        onChange={(e) => setBannerStoryHeading(e.target.value)}
                        placeholder="A short story about"
                        className="w-full px-3 py-2.5 rounded-xl border border-gray-300 bg-white text-xs font-medium focus:outline-none focus:ring-1 focus:ring-[#123B2B]"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-bold text-gray-700 block">
                        Story Brand Name
                      </label>
                      <input
                        type="text"
                        value={bannerStoryBrand}
                        onChange={(e) => setBannerStoryBrand(e.target.value)}
                        placeholder="GREESAL"
                        className="w-full px-3 py-2.5 rounded-xl border border-gray-300 bg-white text-xs font-bold text-[#20493c] focus:outline-none focus:ring-1 focus:ring-[#123B2B]"
                      />
                    </div>
                  </div>
                </div>

                {/* CARD 3: 4 STORY PARAGRAPHS WITH LINE-BY-LINE & SATVIK CALLOUT */}
                <div className="bg-white p-5 sm:p-6 rounded-3xl border border-gray-200 shadow-sm space-y-4">
                  <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                    <div>
                      <h3 className="text-sm font-black text-[#123B2B] flex items-center gap-2">
                        <Leaf className="w-4 h-4 text-[#20493c]" />
                        <span>3. Story Paragraphs (Line-by-Line &amp; Satvik Callout)</span>
                      </h3>
                      <p className="text-[11px] text-gray-500 mt-0.5">
                        Each paragraph is displayed in a dedicated formatted container with line break preservation.
                      </p>
                    </div>
                    <span className="text-[10px] text-gray-400 font-semibold hidden sm:inline">
                      Supports multiline line-by-line formatting
                    </span>
                  </div>

                  <div className="space-y-4">
                    {/* Paragraph 1 */}
                    <div className="p-4 rounded-2xl bg-[#F7FAF8] border border-[#6ac6ac]/30 space-y-1.5">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-black text-[#123B2B] flex items-center gap-1.5">
                          <Leaf className="w-3.5 h-3.5 text-[#20493c]" />
                          <span>Story Paragraph 1 (Origin &amp; Vision)</span>
                        </label>
                        <span className="text-[10px] text-gray-500 font-medium">Hero Top Highlight</span>
                      </div>
                      <textarea
                        value={bannerStoryP1}
                        onChange={(e) => {
                          setBannerStoryP1(e.target.value);
                          setBannerDescription(e.target.value);
                        }}
                        placeholder="GREESAL, Farm-Fresh Organic Salad Bowls! Idea comes from a small thing..."
                        required
                        rows={3}
                        className="w-full px-3 py-2 rounded-xl border border-gray-300 bg-white text-gray-800 text-xs font-medium leading-relaxed focus:outline-none focus:ring-1 focus:ring-[#123B2B]"
                      />
                    </div>

                    {/* Paragraph 2 */}
                    <div className="p-4 rounded-2xl bg-white border border-gray-200 border-l-4 border-l-[#6ac6ac] space-y-1.5">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-bold text-gray-700 flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full bg-[#6ac6ac]" />
                          <span>Story Paragraph 2 (Freshness &amp; Organic Goodness)</span>
                        </label>
                        <span className="text-[10px] text-gray-400 font-medium">Line by line view</span>
                      </div>
                      <textarea
                        value={bannerStoryP2}
                        onChange={(e) => setBannerStoryP2(e.target.value)}
                        placeholder="GREESAL — Slice of Green, where health meets Freshness & Deliciousness!..."
                        rows={3}
                        className="w-full px-3 py-2 rounded-xl border border-gray-300 bg-white text-gray-800 text-xs font-medium leading-relaxed focus:outline-none focus:ring-1 focus:ring-[#123B2B]"
                      />
                    </div>

                    {/* Paragraph 3 */}
                    <div className="p-4 rounded-2xl bg-white border border-gray-200 border-l-4 border-l-[#fbce45] space-y-1.5">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-bold text-gray-700 flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full bg-[#fbce45]" />
                          <span>Story Paragraph 3 (21+ Varieties &amp; Doorstep Delivery)</span>
                        </label>
                        <span className="text-[10px] text-gray-400 font-medium">Line by line view</span>
                      </div>
                      <textarea
                        value={bannerStoryP3}
                        onChange={(e) => setBannerStoryP3(e.target.value)}
                        placeholder="At GREESAL, we bring you 21 varieties of fresh, healthy, and delicious salads..."
                        rows={3}
                        className="w-full px-3 py-2 rounded-xl border border-gray-300 bg-white text-gray-800 text-xs font-medium leading-relaxed focus:outline-none focus:ring-1 focus:ring-[#123B2B]"
                      />
                    </div>

                    {/* Paragraph 4: Dedicated Satvik Callout */}
                    <div className="p-4 rounded-2xl bg-gradient-to-r from-[#eef8f3] via-[#f7fcf9] to-[#fffdf5] border-2 border-[#6ac6ac]/60 space-y-2">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-black text-[#123B2B] flex items-center gap-2">
                          <span className="p-1 rounded-md bg-[#20493c] text-[#fbce45]">
                            <ShieldCheck className="w-3.5 h-3.5" />
                          </span>
                          <span>Story Paragraph 4 (Satvik Callout Box)</span>
                        </label>
                        <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100/90 px-2 py-0.5 rounded-full">
                          100% Satvik Purity • No Onion • No Garlic
                        </span>
                      </div>
                      <p className="text-[11px] text-gray-500 font-medium">
                        Prominently styled inside a dedicated purity callout container with handcrafted dressing highlights.
                      </p>
                      <textarea
                        value={bannerStoryP4}
                        onChange={(e) => setBannerStoryP4(e.target.value)}
                        placeholder="Our handcrafted salads are made using premium-quality ingredients, without onion and garlic..."
                        rows={3}
                        className="w-full px-3 py-2 rounded-xl border border-[#6ac6ac]/40 bg-white text-gray-800 text-xs font-medium leading-relaxed focus:outline-none focus:ring-1 focus:ring-[#123B2B]"
                      />
                    </div>
                  </div>
                </div>

                {/* CARD 4: CTA BUTTONS & 3 FEATURE HIGHLIGHTS */}
                <div className="bg-white p-5 sm:p-6 rounded-3xl border border-gray-200 shadow-sm space-y-4">
                  <div className="border-b border-gray-100 pb-3">
                    <h3 className="text-sm font-black text-[#123B2B] flex items-center gap-2">
                      <ArrowRight className="w-4 h-4 text-[#237357]" />
                      <span>4. Action Buttons &amp; Bottom Feature Highlights</span>
                    </h3>
                    <p className="text-[11px] text-gray-500 mt-0.5">
                      Configure button labels and the 3 quick service guarantee pills.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-gray-700 block">Primary Button Text</label>
                      <input
                        type="text"
                        value={bannerCtaText}
                        onChange={(e) => setBannerCtaText(e.target.value)}
                        placeholder="Explore Salad Menu"
                        className="w-full px-3 py-2.5 rounded-xl border border-gray-300 text-xs font-bold focus:outline-none focus:ring-1 focus:ring-[#123B2B]"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-gray-700 block">Button Link Target</label>
                      <input
                        type="text"
                        value={bannerCtaLink}
                        onChange={(e) => setBannerCtaLink(e.target.value)}
                        placeholder="#menu"
                        className="w-full px-3 py-2.5 rounded-xl border border-gray-300 text-xs font-medium focus:outline-none focus:ring-1 focus:ring-[#123B2B]"
                      />
                    </div>
                  </div>

                  {/* 3 Quick Highlight Pills */}
                  <div className="pt-2 border-t border-gray-100">
                    <span className="text-[11px] font-bold text-gray-700 block mb-2">
                      3 Bottom Highlight Feature Badges:
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-gray-500 block">Highlight 1</label>
                        <input
                          type="text"
                          value={bannerHighlight1Title}
                          onChange={(e) => setBannerHighlight1Title(e.target.value)}
                          placeholder="Free Delivery in Surat"
                          className="w-full px-3 py-2 rounded-xl border border-gray-300 text-xs font-medium focus:outline-none focus:ring-1 focus:ring-[#123B2B]"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-gray-500 block">Highlight 2</label>
                        <input
                          type="text"
                          value={bannerHighlight2Title}
                          onChange={(e) => setBannerHighlight2Title(e.target.value)}
                          placeholder="Lunch &amp; Evening Slots"
                          className="w-full px-3 py-2 rounded-xl border border-gray-300 text-xs font-medium focus:outline-none focus:ring-1 focus:ring-[#123B2B]"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-gray-500 block">Highlight 3</label>
                        <input
                          type="text"
                          value={bannerHighlight3Title}
                          onChange={(e) => setBannerHighlight3Title(e.target.value)}
                          placeholder="100% Satvik Dressing"
                          className="w-full px-3 py-2 rounded-xl border border-gray-300 text-xs font-medium focus:outline-none focus:ring-1 focus:ring-[#123B2B]"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Bottom Action Save Bar */}
                <div className="p-4 bg-white rounded-2xl border border-gray-200 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="text-xs text-gray-500 font-medium">
                    <span>Changes take effect on customer website and mobile app immediately upon saving.</span>
                  </div>

                  <div className="flex items-center gap-3 w-full sm:w-auto">
                    <button
                      type="submit"
                      disabled={isActionLoading}
                      className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-[#123B2B] hover:bg-[#1C4D3A] text-white font-black text-sm flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transition-all duration-200 cursor-pointer disabled:opacity-85"
                    >
                      {isActionLoading ? (
                        <Loader2 className="w-4 h-4 animate-spin text-[#C89D4B]" />
                      ) : (
                        <Save className="w-4 h-4 text-[#C89D4B]" />
                      )}
                      <span>Save Hero Banner &amp; Image</span>
                    </button>
                  </div>
                </div>

              </form>
            </div>
          </div>
        ) : activeTab === 'salads' ? (
          /* Tab 2: Salads management table/list */
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-greesal-dark">
                Salad Menu List ({salads.length})
              </h2>
              <button
                type="button"
                onClick={handleOpenAddModal}
                className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#123B2B] hover:bg-[#1C4D3A] text-white text-xs font-bold transition-all shadow-sm cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Add Salad Item</span>
              </button>
            </div>

            {/* Salads list grid */}
            <div className="grid grid-cols-1 gap-4 text-left">
              {salads.map((salad) => (
                <div
                  key={salad._id}
                  className="bg-white rounded-2xl p-4 border border-greesal-beige/60 flex flex-col sm:flex-row items-center justify-between gap-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center gap-4 w-full sm:w-auto">
                    <img
                      src={salad.image}
                      alt={salad.name}
                      className="w-16 h-16 rounded-xl object-cover border border-gray-100 flex-shrink-0"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=100&q=80';
                      }}
                    />
                    <div>
                      <span className="text-[10px] font-bold text-[#123B2B] bg-greesal-lightgreen px-2 py-0.5 rounded-full border border-greesal-emerald/10 uppercase tracking-wider">
                        {salad.tag}
                      </span>
                      <h3 className="font-bold text-greesal-dark text-base mt-1">
                        {salad.name}
                      </h3>
                      <div className="flex flex-wrap gap-2 text-xs text-greesal-muted font-semibold mt-1 items-center">
                        <span>{salad.calories}</span>
                        <span>•</span>
                        <span>{salad.protein}</span>
                        <span>•</span>
                        <span className="text-[#123B2B] font-extrabold">{salad.price}</span>
                        <span>•</span>
                        <span className="text-[11px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200/60">
                          {salad.addOns && salad.addOns.length > 0 ? `${salad.addOns.length} Extra Add-ons` : '5 Default Add-ons'}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 w-full sm:w-auto justify-end border-t sm:border-t-0 pt-3 sm:pt-0 border-gray-100">
                    <button
                      type="button"
                      onClick={() => handleOpenEditModal(salad)}
                      className="p-2 rounded-xl text-gray-500 hover:text-[#123B2B] hover:bg-gray-50 transition-colors border border-gray-200 cursor-pointer"
                      title="Edit Salad"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => salad._id && handleDeleteSalad(salad._id)}
                      className="p-2 rounded-xl text-gray-500 hover:text-red-600 hover:bg-red-50 transition-colors border border-gray-200 cursor-pointer"
                      title="Delete Salad"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}

              {salads.length === 0 && (
                <div className="h-48 flex flex-col items-center justify-center bg-white rounded-3xl border border-dashed border-gray-300 text-gray-400">
                  <Utensils className="w-8 h-8 mb-2" />
                  <p className="text-sm font-semibold">No salad items found in database.</p>
                </div>
              )}
            </div>
          </div>
        ) : activeTab === 'categories' ? (
          <AdminCategoriesTab
            categories={categoriesState}
            salads={salads}
            onSaveCategories={handleSaveCategories}
            isSaving={isActionLoading}
          />
        ) : activeTab === 'siteTexts' ? (
          <AdminSiteTextsTab
            settings={fullSiteSettings}
            onSaveSettings={handleSaveSiteTexts}
            isSaving={isActionLoading}
          />
        ) : activeTab === 'reviews' ? (
          <AdminReviewsTab />
        ) : null}
      </main>

      {/* Add / Edit Salad Modal Dialog */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-[#123B2B]/40 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-[28px] max-w-2xl w-full p-6 sm:p-8 shadow-xl border border-gray-200 text-left animate-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto flex flex-col">
            
            <div className="flex justify-between items-center mb-5">
              <h3 className="text-xl font-bold text-[#123B2B]">
                {editingSaladId ? 'Edit Salad Item' : 'Add New Salad'}
              </h3>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 text-2xl font-semibold focus:outline-none cursor-pointer"
              >
                &times;
              </button>
            </div>

            {/* Inner Dialog Form Tab Selectors */}
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-1.5 p-1.5 bg-[#F4EFE6] rounded-2xl border border-[#E8E1D5] mb-5 select-none">
              <button
                type="button"
                onClick={() => setFormTab('general')}
                className={`py-2 px-2.5 rounded-xl text-xs font-bold transition-all duration-200 cursor-pointer flex items-center justify-center gap-1.5 ${
                  formTab === 'general'
                    ? 'bg-[#123B2B] text-white shadow-sm'
                    : 'text-gray-600 hover:text-[#123B2B] hover:bg-white/60'
                }`}
              >
                <FileText className="w-3.5 h-3.5" />
                <span>General</span>
              </button>
              
              <button
                type="button"
                onClick={() => setFormTab('ingredients')}
                className={`py-2 px-2.5 rounded-xl text-xs font-bold transition-all duration-200 cursor-pointer flex items-center justify-center gap-1.5 ${
                  formTab === 'ingredients'
                    ? 'bg-[#123B2B] text-white shadow-sm'
                    : 'text-gray-600 hover:text-[#123B2B] hover:bg-white/60'
                }`}
              >
                <Utensils className="w-3.5 h-3.5" />
                <span>Ingredients</span>
              </button>

              <button
                type="button"
                onClick={() => setFormTab('benefits')}
                className={`py-2 px-2.5 rounded-xl text-xs font-bold transition-all duration-200 cursor-pointer flex items-center justify-center gap-1.5 ${
                  formTab === 'benefits'
                    ? 'bg-[#123B2B] text-white shadow-sm'
                    : 'text-gray-600 hover:text-[#123B2B] hover:bg-white/60'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Benefits</span>
              </button>

              <button
                type="button"
                onClick={() => setFormTab('nutrition')}
                className={`py-2 px-2.5 rounded-xl text-xs font-bold transition-all duration-200 cursor-pointer flex items-center justify-center gap-1.5 ${
                  formTab === 'nutrition'
                    ? 'bg-[#123B2B] text-white shadow-sm'
                    : 'text-gray-600 hover:text-[#123B2B] hover:bg-white/60'
                }`}
              >
                <Activity className="w-3.5 h-3.5" />
                <span>Nutrition</span>
              </button>

              <button
                type="button"
                onClick={() => setFormTab('addons')}
                className={`py-2 px-2.5 rounded-xl text-xs font-bold transition-all duration-200 cursor-pointer flex items-center justify-center gap-1.5 col-span-2 sm:col-span-1 ${
                  formTab === 'addons'
                    ? 'bg-[#123B2B] text-white shadow-sm'
                    : 'text-gray-600 hover:text-[#123B2B] hover:bg-white/60'
                }`}
              >
                <Leaf className="w-3.5 h-3.5 text-[#C89D4B]" />
                <span>Add-ons</span>
                {(currentSalad.addOns || []).length > 0 && (
                  <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-black ${
                    formTab === 'addons' ? 'bg-[#C89D4B] text-[#123B2B]' : 'bg-[#123B2B] text-white'
                  }`}>
                    {(currentSalad.addOns || []).length}
                  </span>
                )}
              </button>
            </div>

            <form onSubmit={handleSaveSalad} className="space-y-5 flex-1">
              
              {/* Tab 1: General Info */}
              {formTab === 'general' && (
                <div className="space-y-4 animate-in fade-in duration-150">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-[#123B2B] block">
                      Salad Name
                    </label>
                    <input
                      type="text"
                      value={currentSalad.name}
                      onChange={(e) => setCurrentSalad({ ...currentSalad, name: e.target.value })}
                      placeholder="e.g. Premium Burrito Salad"
                      required
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-300 bg-white text-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-[#123B2B]/40 focus:border-[#123B2B]"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-[#123B2B] block">
                        Calories
                      </label>
                      <input
                        type="text"
                        value={currentSalad.calories}
                        onChange={(e) => setCurrentSalad({ ...currentSalad, calories: e.target.value })}
                        placeholder="e.g. 367 Kcal"
                        required
                        className="w-full px-4 py-2.5 rounded-xl border border-gray-300 bg-white text-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-[#123B2B]/40 focus:border-[#123B2B]"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-[#123B2B] block">
                        Protein
                      </label>
                      <input
                        type="text"
                        value={currentSalad.protein}
                        onChange={(e) => setCurrentSalad({ ...currentSalad, protein: e.target.value })}
                        placeholder="e.g. 13g Protein"
                        required
                        className="w-full px-4 py-2.5 rounded-xl border border-gray-300 bg-white text-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-[#123B2B]/40 focus:border-[#123B2B]"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-[#123B2B] block">
                        Price
                      </label>
                      <input
                        type="text"
                        value={currentSalad.price}
                        onChange={(e) => setCurrentSalad({ ...currentSalad, price: e.target.value })}
                        placeholder="e.g. ₹369"
                        required
                        className="w-full px-4 py-2.5 rounded-xl border border-gray-300 bg-white text-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-[#123B2B]/40 focus:border-[#123B2B]"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-[#123B2B] block">
                        Category / Tag
                      </label>
                      <select
                        value={currentSalad.tag}
                        onChange={(e) => setCurrentSalad({ ...currentSalad, tag: e.target.value })}
                        className="w-full px-4 py-2.5 rounded-xl border border-gray-300 bg-white text-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-[#123B2B]/40 focus:border-[#123B2B]"
                      >
                        <option value="Bestseller">Bestseller</option>
                        <option value="Chef Choice">Chef Choice</option>
                        {categoriesState
                          .filter(c => c.id !== 'all')
                          .map(c => (
                            <option key={c.id} value={c.label}>
                              {c.icon || '🥗'} {c.label}
                            </option>
                          ))
                        }
                      </select>
                    </div>
                  </div>

                  {/* Salad Image Selection & Upload */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold text-[#123B2B] block">
                        Salad Image
                      </label>
                      <div className="flex items-center gap-1 bg-gray-100 p-0.5 rounded-lg text-[11px] font-bold">
                        <button
                          type="button"
                          onClick={() => setImageSourceType('file')}
                          className={`px-2.5 py-1 rounded-md transition-all cursor-pointer flex items-center gap-1 ${
                            imageSourceType === 'file'
                              ? 'bg-[#123B2B] text-white shadow-xs'
                              : 'text-gray-600 hover:text-[#123B2B]'
                          }`}
                        >
                          <Upload className="w-3 h-3" />
                          <span>Upload from Device</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setImageSourceType('url')}
                          className={`px-2.5 py-1 rounded-md transition-all cursor-pointer flex items-center gap-1 ${
                            imageSourceType === 'url'
                              ? 'bg-[#123B2B] text-white shadow-xs'
                              : 'text-gray-600 hover:text-[#123B2B]'
                          }`}
                        >
                          <LinkIcon className="w-3 h-3" />
                          <span>Image URL</span>
                        </button>
                      </div>
                    </div>

                    {imageSourceType === 'file' ? (
                      <div className="space-y-3">
                        <div
                          onClick={() => document.getElementById('salad-image-file-input')?.click()}
                          onDragOver={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                          }}
                          onDrop={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            const files = e.dataTransfer.files;
                            if (files && files[0]) {
                              processImageFile(files[0]);
                            }
                          }}
                          className="border-2 border-dashed border-greesal-emerald/40 hover:border-[#123B2B] bg-[#FAF6F0]/60 hover:bg-[#FAF6F0] p-4 rounded-2xl transition-all cursor-pointer text-center group flex flex-col items-center justify-center min-h-[120px]"
                        >
                          <input
                            id="salad-image-file-input"
                            type="file"
                            accept="image/*"
                            onChange={(e) => {
                              if (e.target.files && e.target.files[0]) {
                                processImageFile(e.target.files[0]);
                              }
                            }}
                            className="hidden"
                          />
                          <div className="w-10 h-10 rounded-full bg-greesal-emerald/10 text-[#123B2B] flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                            <UploadCloud className="w-5 h-5" />
                          </div>
                          <p className="text-xs font-bold text-[#123B2B]">
                            Click or drag &amp; drop to upload image from device
                          </p>
                          <p className="text-[11px] text-gray-400 mt-0.5">
                            Supports PNG, JPG, WEBP (Auto-optimized)
                          </p>
                        </div>

                        {currentSalad.image && (
                          <div className="flex items-center gap-3 p-3 bg-white rounded-xl border border-gray-200 shadow-2xs">
                            <img
                              src={currentSalad.image}
                              alt="Selected Salad Preview"
                              className="w-16 h-16 rounded-lg object-cover border border-gray-100 flex-shrink-0"
                            />
                            <div className="flex-1 min-w-0">
                              <span className="inline-block px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-800 text-[10px] font-bold border border-emerald-200">
                                Image Ready
                              </span>
                              <p className="text-xs text-gray-500 font-medium truncate mt-1">
                                {currentSalad.image.startsWith('data:')
                                  ? 'Custom image uploaded from device'
                                  : currentSalad.image}
                              </p>
                            </div>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setCurrentSalad({ ...currentSalad, image: '' });
                              }}
                              className="p-1.5 rounded-lg text-red-500 hover:bg-red-50 hover:text-red-700 transition-colors cursor-pointer"
                              title="Remove Image"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="space-y-3">
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                            <ImageIcon className="w-4 h-4" />
                          </div>
                          <input
                            type="url"
                            value={currentSalad.image}
                            onChange={(e) => setCurrentSalad({ ...currentSalad, image: e.target.value })}
                            placeholder="https://images.unsplash.com/..."
                            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-300 bg-white text-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-[#123B2B]/40 focus:border-[#123B2B]"
                          />
                        </div>
                        {currentSalad.image && (
                          <div className="flex items-center gap-3 p-3 bg-white rounded-xl border border-gray-200 shadow-2xs">
                            <img
                              src={currentSalad.image}
                              alt="URL Salad Preview"
                              className="w-16 h-16 rounded-lg object-cover border border-gray-100 flex-shrink-0"
                            />
                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-bold text-[#123B2B]">Live Preview</p>
                              <p className="text-[11px] text-gray-500 truncate mt-0.5">{currentSalad.image}</p>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-[#123B2B] block">Perfect For</label>
                    <div className="flex gap-4 text-sm font-semibold text-greesal-dark">
                      {['Diet', 'Fitness', 'Healthy'].map((option) => {
                        const active = (currentSalad.perfectFor || []).includes(option);
                        return (
                          <label key={option} className="flex items-center gap-1.5 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={active}
                              onChange={(e) => {
                                const checked = e.target.checked;
                                setCurrentSalad(prev => ({
                                  ...prev,
                                  perfectFor: checked
                                    ? [...(prev.perfectFor || []), option]
                                    : (prev.perfectFor || []).filter(o => o !== option)
                                }));
                              }}
                              className="w-4 h-4 rounded border-gray-300 text-[#123B2B] focus:ring-[#123B2B]"
                            />
                            <span>{option}</span>
                          </label>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}

              {/* Tab 2: Ingredients & Gravy */}
              {formTab === 'ingredients' && (
                <div className="space-y-5 animate-in fade-in duration-150">
                  {/* Ingredients Builder */}
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-[#123B2B] block">Ingredients List</label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="Type and press Enter, or click Add"
                        id="new-ingredient-input"
                        className="flex-1 px-3 py-2 rounded-xl border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#123B2B]/30"
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            const val = (e.target as HTMLInputElement).value.trim();
                            if (val) {
                              setCurrentSalad(prev => ({
                                ...prev,
                                ingredients: [...(prev.ingredients || []), val]
                              }));
                              (e.target as HTMLInputElement).value = '';
                            }
                          }
                        }}
                      />
                      <button
                        type="button"
                        onClick={() => {
                          const el = document.getElementById('new-ingredient-input') as HTMLInputElement;
                          const val = el?.value.trim();
                          if (val) {
                            setCurrentSalad(prev => ({
                              ...prev,
                              ingredients: [...(prev.ingredients || []), val]
                            }));
                            el.value = '';
                          }
                        }}
                        className="px-4 py-2 bg-[#123B2B] text-white text-xs font-bold rounded-xl hover:bg-[#1C4D3A] cursor-pointer"
                      >
                        Add
                      </button>
                    </div>
                    <div className="flex flex-wrap gap-1.5 max-h-32 overflow-y-auto pt-1">
                      {(currentSalad.ingredients || []).map((ing, idx) => (
                        <span key={idx} className="inline-flex items-center gap-1 px-2.5 py-1 bg-greesal-lightgreen border border-greesal-emerald/10 text-[#123B2B] text-xs font-semibold rounded-lg">
                          <span>{ing}</span>
                          <button
                            type="button"
                            onClick={() => {
                              setCurrentSalad(prev => ({
                                ...prev,
                                ingredients: (prev.ingredients || []).filter((_, i) => i !== idx)
                              }));
                            }}
                            className="text-red-500 hover:text-red-700 font-bold ml-1 focus:outline-none cursor-pointer"
                          >
                            &times;
                          </button>
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Gravy Builder */}
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-[#123B2B] block">Gravy Ingredients List</label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="Type and press Enter, or click Add"
                        id="new-gravy-input"
                        className="flex-1 px-3 py-2 rounded-xl border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#123B2B]/30"
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            const val = (e.target as HTMLInputElement).value.trim();
                            if (val) {
                              setCurrentSalad(prev => ({
                                ...prev,
                                gravy: [...(prev.gravy || []), val]
                              }));
                              (e.target as HTMLInputElement).value = '';
                            }
                          }
                        }}
                      />
                      <button
                        type="button"
                        onClick={() => {
                          const el = document.getElementById('new-gravy-input') as HTMLInputElement;
                          const val = el?.value.trim();
                          if (val) {
                            setCurrentSalad(prev => ({
                              ...prev,
                              gravy: [...(prev.gravy || []), val]
                            }));
                            el.value = '';
                          }
                        }}
                        className="px-4 py-2 bg-[#123B2B] text-white text-xs font-bold rounded-xl hover:bg-[#1C4D3A] cursor-pointer"
                      >
                        Add
                      </button>
                    </div>
                    <div className="flex flex-wrap gap-1.5 max-h-32 overflow-y-auto pt-1">
                      {(currentSalad.gravy || []).map((gr, idx) => (
                        <span key={idx} className="inline-flex items-center gap-1 px-2.5 py-1 bg-greesal-lightgreen border border-greesal-emerald/10 text-greesal-gold font-bold text-xs rounded-lg">
                          <span>{gr}</span>
                          <button
                            type="button"
                            onClick={() => {
                              setCurrentSalad(prev => ({
                                ...prev,
                                gravy: (prev.gravy || []).filter((_, i) => i !== idx)
                              }));
                            }}
                            className="text-red-500 hover:text-red-700 font-bold ml-1 focus:outline-none cursor-pointer"
                          >
                            &times;
                          </button>
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Tab 3: Benefits & Highlights */}
              {formTab === 'benefits' && (
                <div className="space-y-5 animate-in fade-in duration-150">
                  {/* Health Benefits Builder */}
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-[#123B2B] block">Health Benefits (Format: Title: Description)</label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="e.g. Energy Boost: Natural carbs reduce fatigue"
                        id="new-benefit-input"
                        className="flex-1 px-3 py-2 rounded-xl border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#123B2B]/30"
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            const val = (e.target as HTMLInputElement).value.trim();
                            if (val) {
                              setCurrentSalad(prev => ({
                                ...prev,
                                healthBenefits: [...(prev.healthBenefits || []), val]
                              }));
                              (e.target as HTMLInputElement).value = '';
                            }
                          }
                        }}
                      />
                      <button
                        type="button"
                        onClick={() => {
                          const el = document.getElementById('new-benefit-input') as HTMLInputElement;
                          const val = el?.value.trim();
                          if (val) {
                            setCurrentSalad(prev => ({
                              ...prev,
                              healthBenefits: [...(prev.healthBenefits || []), val]
                            }));
                            el.value = '';
                          }
                        }}
                        className="px-4 py-2 bg-[#123B2B] text-white text-xs font-bold rounded-xl hover:bg-[#1C4D3A] cursor-pointer"
                      >
                        Add
                      </button>
                    </div>
                    <div className="space-y-1.5 max-h-36 overflow-y-auto pt-1">
                      {(currentSalad.healthBenefits || []).map((benefit, idx) => (
                        <div key={idx} className="flex items-center justify-between bg-greesal-lightgreen/50 border border-greesal-emerald/10 p-2 rounded-xl text-xs text-greesal-dark font-medium">
                          <span>{benefit}</span>
                          <button
                            type="button"
                            onClick={() => {
                              setCurrentSalad(prev => ({
                                ...prev,
                                healthBenefits: (prev.healthBenefits || []).filter((_, i) => i !== idx)
                              }));
                            }}
                            className="text-red-500 hover:text-red-700 font-bold focus:outline-none ml-2 cursor-pointer"
                          >
                            &times;
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Highlights/Additional Benefits Builder */}
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-[#123B2B] block">Highlights / Additional Benefits</label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="e.g. Immunity Boost"
                        id="new-highlight-input"
                        className="flex-1 px-3 py-2 rounded-xl border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#123B2B]/30"
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            const val = (e.target as HTMLInputElement).value.trim();
                            if (val) {
                              setCurrentSalad(prev => ({
                                ...prev,
                                additionalBenefits: [...(prev.additionalBenefits || []), val]
                              }));
                              (e.target as HTMLInputElement).value = '';
                            }
                          }
                        }}
                      />
                      <button
                        type="button"
                        onClick={() => {
                          const el = document.getElementById('new-highlight-input') as HTMLInputElement;
                          const val = el?.value.trim();
                          if (val) {
                            setCurrentSalad(prev => ({
                              ...prev,
                              additionalBenefits: [...(prev.additionalBenefits || []), val]
                            }));
                            el.value = '';
                          }
                        }}
                        className="px-4 py-2 bg-[#123B2B] text-white text-xs font-bold rounded-xl hover:bg-[#1C4D3A] cursor-pointer"
                      >
                        Add
                      </button>
                    </div>
                    <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto pt-1">
                      {(currentSalad.additionalBenefits || []).map((hl, idx) => (
                        <span key={idx} className="inline-flex items-center gap-1 px-2.5 py-1 bg-greesal-lightgreen border border-greesal-emerald/10 text-emerald-800 text-xs font-semibold rounded-lg">
                          <span>{hl}</span>
                          <button
                            type="button"
                            onClick={() => {
                              setCurrentSalad(prev => ({
                                ...prev,
                                additionalBenefits: (prev.additionalBenefits || []).filter((_, i) => i !== idx)
                              }));
                            }}
                            className="text-red-500 hover:text-red-700 font-bold ml-1 focus:outline-none cursor-pointer"
                          >
                            &times;
                          </button>
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Tab 4: Nutritional Facts */}
              {formTab === 'nutrition' && (
                <div className="space-y-4 animate-in fade-in duration-150 max-h-[50vh] overflow-y-auto pr-1">
                  <p className="text-xs text-greesal-muted">Enter nutritional facts as they will appear on the customer food label (e.g. 72g, 11g, 0mg, 685mg).</p>
                  
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-left">
                    {/* Carbs */}
                    <div className="space-y-1">
                      <label className="text-[11px] font-bold text-gray-500 block">Carbs (e.g. 72g)</label>
                      <input
                        type="text"
                        value={currentSalad.nutrition?.carbs || ''}
                        onChange={(e) => {
                          setCurrentSalad(prev => ({
                            ...prev,
                            nutrition: { ...(prev.nutrition || {}), carbs: e.target.value }
                          }));
                        }}
                        className="w-full px-3 py-2 rounded-xl border border-gray-300 text-xs focus:outline-none focus:ring-1 focus:ring-[#123B2B]"
                      />
                    </div>

                    {/* Fiber */}
                    <div className="space-y-1">
                      <label className="text-[11px] font-bold text-gray-500 block">Fiber (e.g. 11g)</label>
                      <input
                        type="text"
                        value={currentSalad.nutrition?.fiber || ''}
                        onChange={(e) => {
                          setCurrentSalad(prev => ({
                            ...prev,
                            nutrition: { ...(prev.nutrition || {}), fiber: e.target.value }
                          }));
                        }}
                        className="w-full px-3 py-2 rounded-xl border border-gray-300 text-xs focus:outline-none focus:ring-1 focus:ring-[#123B2B]"
                      />
                    </div>

                    {/* Total Sugar */}
                    <div className="space-y-1">
                      <label className="text-[11px] font-bold text-gray-500 block">Total Sugar (e.g. 6g)</label>
                      <input
                        type="text"
                        value={currentSalad.nutrition?.sugarTotal || ''}
                        onChange={(e) => {
                          setCurrentSalad(prev => ({
                            ...prev,
                            nutrition: { ...(prev.nutrition || {}), sugarTotal: e.target.value }
                          }));
                        }}
                        className="w-full px-3 py-2 rounded-xl border border-gray-300 text-xs focus:outline-none focus:ring-1 focus:ring-[#123B2B]"
                      />
                    </div>

                    {/* Added Sugar */}
                    <div className="space-y-1">
                      <label className="text-[11px] font-bold text-gray-500 block">Added Sugar (e.g. 4g)</label>
                      <input
                        type="text"
                        value={currentSalad.nutrition?.sugarAdded || ''}
                        onChange={(e) => {
                          setCurrentSalad(prev => ({
                            ...prev,
                            nutrition: { ...(prev.nutrition || {}), sugarAdded: e.target.value }
                          }));
                        }}
                        className="w-full px-3 py-2 rounded-xl border border-gray-300 text-xs focus:outline-none focus:ring-1 focus:ring-[#123B2B]"
                      />
                    </div>

                    {/* Total Fat */}
                    <div className="space-y-1">
                      <label className="text-[11px] font-bold text-gray-500 block">Total Fat (e.g. 3g)</label>
                      <input
                        type="text"
                        value={currentSalad.nutrition?.totalFat || ''}
                        onChange={(e) => {
                          setCurrentSalad(prev => ({
                            ...prev,
                            nutrition: { ...(prev.nutrition || {}), totalFat: e.target.value }
                          }));
                        }}
                        className="w-full px-3 py-2 rounded-xl border border-gray-300 text-xs focus:outline-none focus:ring-1 focus:ring-[#123B2B]"
                      />
                    </div>

                    {/* Saturated Fat */}
                    <div className="space-y-1">
                      <label className="text-[11px] font-bold text-gray-500 block">Saturated Fat</label>
                      <input
                        type="text"
                        value={currentSalad.nutrition?.saturatedFat || ''}
                        onChange={(e) => {
                          setCurrentSalad(prev => ({
                            ...prev,
                            nutrition: { ...(prev.nutrition || {}), saturatedFat: e.target.value }
                          }));
                        }}
                        className="w-full px-3 py-2 rounded-xl border border-gray-300 text-xs focus:outline-none focus:ring-1 focus:ring-[#123B2B]"
                      />
                    </div>

                    {/* Trans Fat */}
                    <div className="space-y-1">
                      <label className="text-[11px] font-bold text-gray-500 block">Trans Fat</label>
                      <input
                        type="text"
                        value={currentSalad.nutrition?.transFat || ''}
                        onChange={(e) => {
                          setCurrentSalad(prev => ({
                            ...prev,
                            nutrition: { ...(prev.nutrition || {}), transFat: e.target.value }
                          }));
                        }}
                        className="w-full px-3 py-2 rounded-xl border border-gray-300 text-xs focus:outline-none focus:ring-1 focus:ring-[#123B2B]"
                      />
                    </div>

                    {/* Cholesterol */}
                    <div className="space-y-1">
                      <label className="text-[11px] font-bold text-gray-500 block">Cholesterol (e.g. 0mg)</label>
                      <input
                        type="text"
                        value={currentSalad.nutrition?.cholesterol || ''}
                        onChange={(e) => {
                          setCurrentSalad(prev => ({
                            ...prev,
                            nutrition: { ...(prev.nutrition || {}), cholesterol: e.target.value }
                          }));
                        }}
                        className="w-full px-3 py-2 rounded-xl border border-gray-300 text-xs focus:outline-none focus:ring-1 focus:ring-[#123B2B]"
                      />
                    </div>

                    {/* Vitamin A */}
                    <div className="space-y-1">
                      <label className="text-[11px] font-bold text-gray-500 block">Vitamin A (e.g. 185µg)</label>
                      <input
                        type="text"
                        value={currentSalad.nutrition?.vitaminA || ''}
                        onChange={(e) => {
                          setCurrentSalad(prev => ({
                            ...prev,
                            nutrition: { ...(prev.nutrition || {}), vitaminA: e.target.value }
                          }));
                        }}
                        className="w-full px-3 py-2 rounded-xl border border-gray-300 text-xs focus:outline-none focus:ring-1 focus:ring-[#123B2B]"
                      />
                    </div>

                    {/* Vitamin C */}
                    <div className="space-y-1">
                      <label className="text-[11px] font-bold text-gray-500 block">Vitamin C (e.g. 24.8mg)</label>
                      <input
                        type="text"
                        value={currentSalad.nutrition?.vitaminC || ''}
                        onChange={(e) => {
                          setCurrentSalad(prev => ({
                            ...prev,
                            nutrition: { ...(prev.nutrition || {}), vitaminC: e.target.value }
                          }));
                        }}
                        className="w-full px-3 py-2 rounded-xl border border-gray-300 text-xs focus:outline-none focus:ring-1 focus:ring-[#123B2B]"
                      />
                    </div>

                    {/* Vitamin D */}
                    <div className="space-y-1">
                      <label className="text-[11px] font-bold text-gray-500 block">Vitamin D</label>
                      <input
                        type="text"
                        value={currentSalad.nutrition?.vitaminD || ''}
                        onChange={(e) => {
                          setCurrentSalad(prev => ({
                            ...prev,
                            nutrition: { ...(prev.nutrition || {}), vitaminD: e.target.value }
                          }));
                        }}
                        className="w-full px-3 py-2 rounded-xl border border-gray-300 text-xs focus:outline-none focus:ring-1 focus:ring-[#123B2B]"
                      />
                    </div>

                    {/* Vitamin E */}
                    <div className="space-y-1">
                      <label className="text-[11px] font-bold text-gray-500 block">Vitamin E</label>
                      <input
                        type="text"
                        value={currentSalad.nutrition?.vitaminE || ''}
                        onChange={(e) => {
                          setCurrentSalad(prev => ({
                            ...prev,
                            nutrition: { ...(prev.nutrition || {}), vitaminE: e.target.value }
                          }));
                        }}
                        className="w-full px-3 py-2 rounded-xl border border-gray-300 text-xs focus:outline-none focus:ring-1 focus:ring-[#123B2B]"
                      />
                    </div>

                    {/* Sodium */}
                    <div className="space-y-1">
                      <label className="text-[11px] font-bold text-gray-500 block">Sodium (e.g. 52mg)</label>
                      <input
                        type="text"
                        value={currentSalad.nutrition?.sodium || ''}
                        onChange={(e) => {
                          setCurrentSalad(prev => ({
                            ...prev,
                            nutrition: { ...(prev.nutrition || {}), sodium: e.target.value }
                          }));
                        }}
                        className="w-full px-3 py-2 rounded-xl border border-gray-300 text-xs focus:outline-none focus:ring-1 focus:ring-[#123B2B]"
                      />
                    </div>

                    {/* Calcium */}
                    <div className="space-y-1">
                      <label className="text-[11px] font-bold text-gray-500 block">Calcium (e.g. 64mg)</label>
                      <input
                        type="text"
                        value={currentSalad.nutrition?.calcium || ''}
                        onChange={(e) => {
                          setCurrentSalad(prev => ({
                            ...prev,
                            nutrition: { ...(prev.nutrition || {}), calcium: e.target.value }
                          }));
                        }}
                        className="w-full px-3 py-2 rounded-xl border border-gray-300 text-xs focus:outline-none focus:ring-1 focus:ring-[#123B2B]"
                      />
                    </div>

                    {/* Iron */}
                    <div className="space-y-1">
                      <label className="text-[11px] font-bold text-gray-500 block">Iron (e.g. 6mg)</label>
                      <input
                        type="text"
                        value={currentSalad.nutrition?.iron || ''}
                        onChange={(e) => {
                          setCurrentSalad(prev => ({
                            ...prev,
                            nutrition: { ...(prev.nutrition || {}), iron: e.target.value }
                          }));
                        }}
                        className="w-full px-3 py-2 rounded-xl border border-gray-300 text-xs focus:outline-none focus:ring-1 focus:ring-[#123B2B]"
                      />
                    </div>

                    {/* Potassium */}
                    <div className="space-y-1">
                      <label className="text-[11px] font-bold text-gray-500 block">Potassium (e.g. 785mg)</label>
                      <input
                        type="text"
                        value={currentSalad.nutrition?.potassium || ''}
                        onChange={(e) => {
                          setCurrentSalad(prev => ({
                            ...prev,
                            nutrition: { ...(prev.nutrition || {}), potassium: e.target.value }
                          }));
                        }}
                        className="w-full px-3 py-2 rounded-xl border border-gray-300 text-xs focus:outline-none focus:ring-1 focus:ring-[#123B2B]"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Tab 5: Extra Add-ons */}
              {formTab === 'addons' && (
                <div className="space-y-5 animate-in fade-in duration-150 max-h-[50vh] overflow-y-auto pr-1">
                  <div className="bg-[#E8F3EE] p-3.5 rounded-2xl border border-[#237357]/20 flex flex-col sm:flex-row items-start justify-between gap-3">
                    <div className="space-y-1">
                      <p className="text-xs font-bold text-[#144C38] flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-[#C89D4B]" />
                        <span>Extra Add-on Customization</span>
                      </p>
                      <p className="text-[11px] text-gray-600 leading-relaxed">
                        Configure extra add-ons (with item name and extra price) for this salad bowl. Customers can select these on the salad menu and product detail page, and the money will automatically add into the main item price!
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        const standardList = [
                          { name: 'Extra Organic Paneer / Tofu', price: 40 },
                          { name: 'Extra Cold-Blended Herb Dressing', price: 30 },
                          { name: 'Roasted Almonds, Walnuts & Seeds Mix', price: 35 },
                          { name: 'Fresh Hass Avocado Slices', price: 50 },
                          { name: 'Organic Boiled Chickpeas & Sprout Beans', price: 25 },
                        ];
                        setCurrentSalad(prev => ({
                          ...prev,
                          addOns: standardList
                        }));
                      }}
                      className="text-[11px] font-bold text-[#123B2B] bg-white hover:bg-[#FAF6F0] px-3 py-1.5 rounded-xl border border-[#C89D4B]/40 shadow-2xs whitespace-nowrap cursor-pointer transition-all flex-shrink-0"
                    >
                      + Load 5 Presets
                    </button>
                  </div>

                  {/* Add New Add-on Input Fields */}
                  <div className="space-y-2 bg-[#FAF6F0] p-3.5 rounded-2xl border border-[#EBE2D3]">
                    <label className="text-xs font-bold text-[#123B2B] block">Add New Extra Add-on Option</label>
                    <div className="flex flex-col sm:flex-row gap-2">
                      <input
                        type="text"
                        placeholder="Add-on item name (e.g. Extra Organic Paneer)"
                        value={newAddOnName}
                        onChange={(e) => setNewAddOnName(e.target.value)}
                        className="flex-1 px-3 py-2 rounded-xl border border-gray-300 bg-white text-xs font-medium text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#123B2B]/30"
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            if (newAddOnName.trim() && newAddOnPrice) {
                              const p = parseFloat(newAddOnPrice.replace(/[^\d.]/g, '')) || 0;
                              setCurrentSalad(prev => ({
                                ...prev,
                                addOns: [...(prev.addOns || []), { name: newAddOnName.trim(), price: p }]
                              }));
                              setNewAddOnName('');
                              setNewAddOnPrice('');
                            }
                          }
                        }}
                      />
                      <div className="flex gap-2">
                        <div className="relative w-28">
                          <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs font-bold text-gray-400">₹</span>
                          <input
                            type="number"
                            placeholder="Price"
                            value={newAddOnPrice}
                            onChange={(e) => setNewAddOnPrice(e.target.value)}
                            className="w-full pl-6 pr-2.5 py-2 rounded-xl border border-gray-300 bg-white text-xs font-bold text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#123B2B]/30"
                          />
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            if (newAddOnName.trim() && newAddOnPrice) {
                              const p = parseFloat(newAddOnPrice.replace(/[^\d.]/g, '')) || 0;
                              setCurrentSalad(prev => ({
                                ...prev,
                                addOns: [...(prev.addOns || []), { name: newAddOnName.trim(), price: p }]
                              }));
                              setNewAddOnName('');
                              setNewAddOnPrice('');
                            }
                          }}
                          disabled={!newAddOnName.trim() || !newAddOnPrice}
                          className="px-4 py-2 bg-[#123B2B] text-white text-xs font-bold rounded-xl hover:bg-[#1C4D3A] cursor-pointer disabled:opacity-50 flex items-center gap-1"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>Add</span>
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* List of Configured Add-ons */}
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <label className="text-xs font-bold text-[#123B2B]">
                        Configured Add-on Items ({(currentSalad.addOns || []).length})
                      </label>
                      {(currentSalad.addOns || []).length > 0 && (
                        <button
                          type="button"
                          onClick={() => setCurrentSalad(prev => ({ ...prev, addOns: [] }))}
                          className="text-[11px] font-bold text-red-600 hover:text-red-800 cursor-pointer"
                        >
                          Clear All
                        </button>
                      )}
                    </div>

                    {(currentSalad.addOns || []).length === 0 ? (
                      <div className="p-6 text-center rounded-2xl border border-dashed border-gray-300 bg-gray-50/50">
                        <p className="text-xs text-gray-400 font-semibold">No extra add-on items configured yet.</p>
                        <p className="text-[11px] text-gray-400 mt-1">Add custom options above or click "+ Load 5 Presets".</p>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {(currentSalad.addOns || []).map((addon, idx) => (
                          <div
                            key={idx}
                            className="flex items-center justify-between p-3 rounded-xl bg-white border border-[#E8E1D5] shadow-2xs hover:border-[#123B2B]/40 transition-colors"
                          >
                            <div className="flex items-center gap-2.5">
                              <span className="w-6 h-6 rounded-lg bg-[#E8F3EE] text-[#144C38] flex items-center justify-center font-bold text-xs">
                                {idx + 1}
                              </span>
                              <div>
                                <h4 className="text-xs font-bold text-[#0C2A20]">{addon.name}</h4>
                                <span className="text-[11px] text-emerald-700 font-extrabold">+₹{addon.price} added to main item</span>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-black text-[#123B2B] bg-[#FAF6F0] px-2.5 py-1 rounded-lg border border-[#EBE2D3]">
                                +₹{addon.price}
                              </span>
                              <button
                                type="button"
                                onClick={() => {
                                  setCurrentSalad(prev => ({
                                    ...prev,
                                    addOns: (prev.addOns || []).filter((_, i) => i !== idx)
                                  }));
                                }}
                                className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                                title="Remove add-on"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

              <div className="pt-4 mt-4 border-t border-gray-100 flex justify-between items-center gap-3">
                <span className="text-xs text-[#6B7280]">
                  * Save updates settings on all tabs.
                </span>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2.5 rounded-xl border border-gray-300 text-gray-700 text-xs font-bold hover:bg-gray-50 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isActionLoading}
                    className="px-5 py-2.5 rounded-xl bg-[#123B2B] hover:bg-[#1C4D3A] text-white text-xs font-bold flex items-center gap-1.5 shadow-sm cursor-pointer disabled:opacity-85"
                  >
                    {isActionLoading ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Save className="w-3.5 h-3.5" />
                    )}
                    <span>{editingSaladId ? 'Update Salad' : 'Add Salad'}</span>
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Tax Invoice Modal Dialog */}
      <InvoiceModal
        isOpen={isAdminInvoiceOpen}
        onClose={() => setIsAdminInvoiceOpen(false)}
        order={adminInvoiceOrder}
      />
    </div>
  );
}
