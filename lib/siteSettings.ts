export interface SiteCategory {
  id: string;
  label: string;
  count?: string;
  icon?: string;
}

export interface DifferenceCard {
  id: number;
  title: string;
  desc: string;
  badge: string;
  image?: string;
}

export interface ServiceCard {
  id: number;
  title: string;
  desc: string;
  badge: string;
  btnText: string;
  image?: string;
  fallbackImage?: string;
}

export interface SiteSettings {
  // Sticky Bar
  stickyBarOffer: string;
  stickyBarText: string;
  stickyBarBtnText: string;

  // Hero Section
  heroBadge: string;
  heroSlogan: string;
  heroStoryHeading: string;
  heroStoryBrand: string;
  heroStoryP1: string;
  heroStoryP2: string;
  heroStoryP3: string;
  heroStoryP4: string;
  heroImage: string;
  heroPill1: string;
  heroPill2: string;
  heroStatBadge: string;
  heroStatDelivered: string;

  // Banner Studio Aliases & Extras
  title?: string;
  badgeText?: string;
  description?: string;
  featuredSaladName?: string;
  featuredSaladTag?: string;
  pill1Text?: string;
  pill2Text?: string;
  highlight1Title?: string;
  highlight1Subtitle?: string;
  highlight2Title?: string;
  highlight2Subtitle?: string;
  highlight3Title?: string;
  highlight3Subtitle?: string;
  ctaText?: string;
  ctaLink?: string;

  // What Makes Difference
  differenceBadge: string;
  differenceTitle: string;
  differenceSubtitle: string;
  differenceImage1?: string;
  differenceImage2?: string;
  differenceImage3?: string;
  differenceImage4?: string;
  differenceCards: DifferenceCard[];

  // Stats
  statsTitle: string;
  statsSubtitle: string;
  stat1Num: string;
  stat1Label: string;
  stat1Desc: string;
  stat2Num: string;
  stat2Label: string;
  stat2Desc: string;
  stat3Num: string;
  stat3Label: string;
  stat3Desc: string;

  // Services
  servicesBadge: string;
  servicesTitle: string;
  servicesCards: ServiceCard[];

  // Categories
  categories: SiteCategory[];

  // Footer & Contact
  contactPhone: string;
  contactEmail: string;
  kitchenAddress: string;
  kitchenTiming: string;
  lunchSlot: string;
  eveningSlot: string;
  expressSlot: string;

  // Shop Timing & Notice
  isOpen: boolean;
  openingTime: string;
  closingTime: string;
  shopTimingText: string;
  notice: string;
  showNotice: boolean;
  noticeType: 'announcement' | 'info' | 'alert' | 'discount';
  closedMessage: string;
}

export const DEFAULT_CATEGORIES: SiteCategory[] = [
  { id: 'all', label: 'All Salads', count: '21+ varieties', icon: '🥗' },
  { id: 'Protein House', label: 'Protein House', count: '05 protein pack', icon: '⚡' },
  { id: 'Veggies Salad', label: 'Veggies Salad', count: '06 fatloss salad', icon: '🌱' },
  { id: 'Paneer Salad', label: 'Paneer Salad', count: '05 paneer punch', icon: '🧀' },
  { id: 'Exotic Salad', label: 'Exotic Salad', count: '06 exotic salad', icon: '✨' },
  { id: 'Rice Bowl', label: 'Rice Bowl', count: '03 hot rice bowls', icon: '🍚' },
];

export const DEFAULT_SITE_SETTINGS: SiteSettings = {
  // Sticky Bar
  stickyBarOffer: 'Special Offer',
  stickyBarText: 'Weekly Salad At ₹200/- | Monthly Salad At ₹175/- • Free Daily Delivery in Surat',
  stickyBarBtnText: 'Subscribe Now',

  // Hero Section
  heroBadge: '',
  heroSlogan: 'Farm-Fresh Organic Salad Bowls',
  heroStoryHeading: 'A short story about',
  heroStoryBrand: 'GREESAL',
  heroStoryP1: 'GREESAL, Farm-Fresh Organic Salad Bowls! Idea comes from a small thing and now it’s become a trusted brand of salads and healthy food in Surat, Gujarat.',
  heroStoryP2: 'GREESAL — Slice of Green, where health meets Freshness & Deliciousness! One more thing comes to mind when we talk about healthy food is organic, natural, and fresh — and Greesal is committed to providing only fresh, healthy, and delicious salads with fresh and organic ingredients.',
  heroStoryP3: 'At GREESAL, we bring you 21 varieties of fresh, healthy, and delicious salads, carefully crafted to offer the perfect balance of taste and nutrition. Staying true to our tagline, “Farm-Fresh Organic Salad Bowls”, we deliver wholesome salads right to your doorstep, ensuring you enjoy a guilt-free, nutritious meal every day.',
  heroStoryP4: 'Our handcrafted salads are made using premium-quality ingredients, without onion and garlic, and paired with our signature homemade dressings. Whether you’re on a fitness journey, looking for a quick healthy meal, or simply love fresh greens, Greesal is your go-to destination for healthy eating.',
  heroImage: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=1000&q=85',
  heroPill1: '100% Handmade Dressings',
  heroPill2: 'No Onion • No Garlic',
  heroStatBadge: 'Health Lovers',
  heroStatDelivered: '72,600+ Salads Delivered',

  // What Makes Difference
  differenceBadge: 'THE GREESAL PROMISE',
  differenceTitle: 'what makes the difference?',
  differenceSubtitle: 'Every bowl is handcrafted from farm-to-table with zero shortcuts, zero chemicals, and uncompromised love.',
  differenceImage1: '/images/premium_fresh_ingredients.png',
  differenceImage2: '',
  differenceImage3: '',
  differenceImage4: '',
  differenceCards: [
    {
      id: 1,
      image: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=800&q=80',
      title: '100% In-House Handmade Dressings',
      desc: 'Crafted without chemical preservatives, artificial emulsifiers, or thickeners. Made fresh every morning with cold-pressed olive oil, Greek yogurt, raw seeds, and mountain herbs.',
      badge: 'Cold-Pressed & Clean',
    },
    {
      id: 2,
      image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=800&q=80',
      title: 'Zero Compromise On Purity',
      desc: 'Zero Mayonnaise, Zero Fatty Palm Oils, Zero Preservatives, and Strictly No Onion & Garlic. 100% Satvik, pure, clean nutrition made for daily wellness.',
      badge: 'Satvik Goodness',
    },

    {
      id: 4,
      image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=800&q=80',
      title: '21+ Chef-Crafted Daily Varieties',
      desc: 'From 22g protein power bowls to keto avocado crunch, detox sprout bowls, and Mediterranean grains — enjoy a fresh, exciting menu that keeps your healthy lifestyle joyful.',
      badge: 'Nutritional Balance',
    },
  ],

  // Stats
  statsTitle: 'what are you waiting for, Get your spot now!',
  statsSubtitle: 'Join thousands of health enthusiasts in Surat enjoying daily fresh clean nutrition',
  stat1Num: '24 +',
  stat1Label: 'different varieties of salad!',
  stat1Desc: 'Rotating fresh weekly menu',
  stat2Num: '2.7k +',
  stat2Label: 'happy subscribers!',
  stat2Desc: 'Active fitness & office members',
  stat3Num: '72.6 K +',
  stat3Label: 'salad delivered!',
  stat3Desc: 'Across Surat doorsteps on time',

  // Services
  servicesBadge: 'CONVENIENT ORDERING OPTIONS',
  servicesTitle: 'Our services',
  servicesCards: [
    {
      id: 1,
      image: '/images/salad_single_order.jpg',
      title: 'Salad - Single Order',
      desc: '10 Different Types of Fresh Handcrafted Salads with Free Delivery in Surat!',
      btnText: 'Order Now',
      badge: 'Daily Express • 30 Mins',
    },

    {
      id: 3,
      image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=800&q=80',
      title: 'Salad - Subscriptions',
      desc: '21 Different Types of Salad with Free Delivery! (Weekly & Monthly Plans)',
      btnText: 'Book Now',
      badge: 'Best Value • Save up to ₹25/day',
    },
  ],

  // Categories
  categories: DEFAULT_CATEGORIES,

  // Footer & Contact
  contactPhone: '+91 98251 44321',
  contactEmail: 'support@greesal.in',
  kitchenAddress: 'Greesal Gourmet Cloud Kitchen, VIP Road, Vesu, Surat, Gujarat 395007',
  kitchenTiming: '9:00 AM - 8:30 PM (Mon to Sat)',
  lunchSlot: '11:00 AM - 2:00 PM',
  eveningSlot: '4:00 PM - 7:00 PM',
  expressSlot: 'Within 30-45 Mins',

  // Shop Timing & Notice
  isOpen: true,
  openingTime: '08:00 AM',
  closingTime: '10:30 PM',
  shopTimingText: 'Open Daily: 8:00 AM – 10:30 PM',
  notice: 'Fresh Organic Harvest Delivered in 30 Mins across Surat • Free Delivery on ₹499+',
  showNotice: true,
  noticeType: 'announcement',
  closedMessage: 'Our kitchen is currently closed. Opening again at 08:00 AM. Pre-orders are welcome!',
};
