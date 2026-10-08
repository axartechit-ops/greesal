export interface NutritionInfo {
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
}

export interface SaladAddOn {
  id?: string;
  name: string;
  price: number;
}

export interface Salad {
  _id?: string;
  id?: string;
  slug?: string;
  name: string;
  calories: string;
  protein: string;
  price: string;
  tag: string;
  image: string;
  ingredients: string[];
  gravy: string[];
  healthBenefits: string[];
  additionalBenefits?: string[];
  perfectFor?: string[];
  nutrition?: NutritionInfo;
  addOns?: SaladAddOn[];
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export const DEFAULT_SALAD_ADDONS: SaladAddOn[] = [
  { name: 'Extra Organic Paneer / Tofu', price: 40 },
  { name: 'Extra Cold-Blended Herb Dressing', price: 30 },
  { name: 'Roasted Almonds, Walnuts & Seeds Mix', price: 35 },
  { name: 'Fresh Hass Avocado Slices', price: 50 },
  { name: 'Organic Boiled Chickpeas & Sprout Beans', price: 25 },
];

export const DEFAULT_SALADS: Salad[] = [
  {
    _id: 'chickpea-sprout-fusion-bowl',
    id: 'chickpea-sprout-fusion-bowl',
    slug: 'vibrant-vegan-salad',
    name: 'Chickpea & Sprout Fusion Bowl!',
    calories: '310 Kcal',
    protein: '18g Protein',
    price: '₹220',
    tag: 'Protein House',
    image: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=800&q=80',
    ingredients: [
      'Protein-packed Chickpeas',
      'Crunchy Cucumbers',
      'Tender Red Cabbage',
      'Sweet Corn',
      'Organic Moong Sprouts',
      'Pomegranate Pearls',
      'Sunflower & Pumpkin Seeds'
    ],
    gravy: ['100% Handmade Herb Dressing', 'Cold Pressed Olive Oil & Lemon Zing', 'Rock Salt & Crushed Black Pepper'],
    healthBenefits: [
      'High Protein & Plant Fiber: 18g plant protein accelerates lean muscle repair and sustained fullness.',
      'Antioxidant Rich: Red cabbage and fresh sprouts boost immunity and gut digestion.',
      'No Onion, No Garlic, No Mayonnaise: Clean satvik goodness prepared fresh daily.'
    ],
    additionalBenefits: ['Gut Health', 'Weight Management', 'Clean Energy', 'Sugar Regulation'],
    perfectFor: ['Weight Loss', 'Fitness', 'Healthy Lunch'],
  },
  {
    _id: 'rich-protein-salad',
    id: 'rich-protein-salad',
    slug: 'mixed-salad-platter',
    name: 'Rich Protein Salad',
    calories: '345 Kcal',
    protein: '21g Protein',
    price: '₹240',
    tag: 'Protein House',
    image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=800&q=80',
    ingredients: [
      'Fresh Organic Paneer Cubes',
      'Sprouted Moong & Chana',
      'Crisp Cucumber Slices',
      'Juicy Fresh Tomatoes',
      'Zesty Lemon Slices',
      'Medley of Roasted Nuts & Seeds'
    ],
    gravy: ['Tantalizing Signature Homemade Dip', 'Cold Pressed Olive Dressing', 'Himalayan Pink Salt'],
    healthBenefits: [
      '21g Lean Dairy & Sprout Protein for optimum athletic recovery.',
      'Loaded with Micronutrients: Vitamin C, Calcium, Zinc & Healthy Fats.',
      'Zero Preservatives, No Palm Oil, Pure Freshness.'
    ],
    additionalBenefits: ['Muscle Growth', 'Metabolism Boost', 'Heart Health', 'Bone Density'],
    perfectFor: ['Gym Goers', 'Daily Subscription', 'High Protein Diet'],
  },
  {
    _id: 'paneer-garden-salad',
    id: 'paneer-garden-salad',
    slug: 'paneer-garden-salad',
    name: 'Paneer Garden Salad',
    calories: '360 Kcal',
    protein: '22g Protein',
    price: '₹250',
    tag: 'Paneer Salad',
    image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=800&q=80',
    ingredients: [
      'Fresh Creamy Organic Paneer (100g)',
      'Crunchy Steamed Broccoli',
      'Sweet Cherry Tomatoes',
      'Tricolor Bell Peppers',
      'Black Olives',
      'Crisp Garden Greens'
    ],
    gravy: ['Greesal White Cheese Dip', 'Herbed Olive Vinaigrette', 'Cracked Pepper'],
    healthBenefits: [
      '22g Premium Protein from farm-fresh paneer.',
      'Broccoli and bell peppers supply 120% of daily Vitamin C.',
      'Satiating healthy fats without greasy oils.'
    ],
    additionalBenefits: ['Skin Glow', 'Cellular Health', 'Keto Friendly', 'Satisfying Crunch'],
    perfectFor: ['Keto', 'Paneer Lovers', 'Evening Dinner'],
  },
  {
    _id: 'summer-garden-salad',
    id: 'summer-garden-salad',
    slug: 'summer-garden-salad',
    name: 'Summer Garden Salad',
    calories: '280 Kcal',
    protein: '16g Protein',
    price: '₹220',
    tag: 'Veggies Salad',
    image: 'https://images.unsplash.com/photo-1505253716362-afaea1d3d1af?auto=format&fit=crop&w=800&q=80',
    ingredients: [
      'Exotic Veggies Fusion',
      'Fresh Paneer',
      'Broccoli Florets',
      'Cherry Tomatoes',
      'Boiled Chickpeas',
      'Fresh Sprouts',
      'Sweet American Corn',
      'Crisp Romaine Lettuce'
    ],
    gravy: ['Homemade Greek Yogurt Dip', 'Mint-Coriander Dressing', 'Lemon Vinaigrette'],
    healthBenefits: [
      'Cooling and refreshing gut-friendly Greek yogurt base.',
      'Rich in hydration with high-water veggies.',
      'Balanced macro ratio for everyday lunch.'
    ],
    additionalBenefits: ['Detoxification', 'Hydration', 'Light on Stomach'],
    perfectFor: ['Summer Wellness', 'Fat Loss', 'Office Lunch'],
  },
  {
    _id: 'healthy-sprout-bowl',
    id: 'healthy-sprout-bowl',
    slug: 'healthy-mixed-sprout-salad',
    name: 'Healthy Sprout Bowl',
    calories: '260 Kcal',
    protein: '15g Protein',
    price: '₹200',
    tag: 'Veggies Salad',
    image: 'https://images.unsplash.com/photo-1623428187969-5da2dcea5ebf?auto=format&fit=crop&w=800&q=80',
    ingredients: [
      'Multi-sprout Blend (Moong, Methi, Chana)',
      'Sweet Pomegranate Arils',
      'Crisp Organic Greens',
      'Cucumber and Diced Carrots',
      'Roasted Sesame & Chia'
    ],
    gravy: ['Zesty Spicy Handmade Dipping Sauce', 'Fresh Lime Wedge', 'Rock Salt Blend'],
    healthBenefits: [
      'Live enzymes and high active fiber for digestive vitality.',
      'Iron and folate rich for hemoglobin elevation.',
      'Low calorie density for effective weight loss.'
    ],
    additionalBenefits: ['Gut Detox', 'Hair Strength', 'Immunity Boost'],
    perfectFor: ['Fat Loss', 'Breakfast/Snack', 'Detox'],
  },
  {
    _id: 'little-bundle',
    id: 'little-bundle',
    slug: 'little-bundle',
    name: 'Little Bundle (5 Salad Platter)',
    calories: '580 Kcal',
    protein: '28g Protein',
    price: '₹550',
    tag: 'Exotic Salad',
    image: 'https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?auto=format&fit=crop&w=800&q=80',
    ingredients: [
      '5 Different Salads (150g portion each):',
      '1. Paneer & Vegetable Salad',
      '2. Sweet Corn Bowl',
      '3. Mexican Rice Bowl & Nachos',
      '4. Fresh Fruit Bowl',
      '5. Protein Pulse Salad'
    ],
    gravy: ['Assorted Trio of Signature Dressings', 'Greek Yogurt Dip', 'Salsa'],
    healthBenefits: [
      'Perfect for family sharing, office group meals, or healthy party cravings.',
      'Complete nutritional spectrum: Fruits, Veggies, Protein, and Healthy Carbs.'
    ],
    additionalBenefits: ['Group Sharing', 'Complete Meal', 'Diverse Flavors'],
    perfectFor: ['Team Lunch', 'Party', 'Variety Lovers'],
  },
  {
    _id: 'mexican-rice-bowl',
    id: 'mexican-rice-bowl',
    slug: 'mexican-rice-bowl',
    name: 'Mexican Rice Bowl',
    calories: '390 Kcal',
    protein: '14g Protein',
    price: '₹260',
    tag: 'Rice Bowl',
    image: 'https://images.unsplash.com/photo-1543339308-43e59d6b73a6?auto=format&fit=crop&w=800&q=80',
    ingredients: [
      'Steamed Brown Rice / Quinoa',
      'Spiced Rajma & Black Beans',
      'Golden Sweet Corn',
      'Fresh Roasted Tomato Salsa',
      'Avocado / Fresh Guacamole',
      'Crispy Baked Tortilla Strips'
    ],
    gravy: ['Homemade Zesty Lime Salsa', 'Mild Jalapeño Herb Dressing'],
    healthBenefits: [
      'Complex carbohydrates supply long-lasting sustained energy.',
      'Wholesome vegan nutrition with high dietary fiber.'
    ],
    additionalBenefits: ['Fulfilling Lunch', 'Cardiovascular Support', 'Clean Carbs'],
    perfectFor: ['Lunch Bowl', 'Energy Boost', 'Post-Workout'],
  },
  {
    _id: 'mexican-mais-salad',
    id: 'mexican-mais-salad',
    slug: 'mexican-mais-salad',
    name: 'Mexican Mais Salad',
    calories: '310 Kcal',
    protein: '12g Protein',
    price: '₹230',
    tag: 'Exotic Salad',
    image: 'https://images.unsplash.com/photo-1515543237350-b3eea1ec8082?auto=format&fit=crop&w=800&q=80',
    ingredients: [
      'Sweet Corn Mais',
      'Bell Peppers',
      'Diced Zucchini',
      'Purple Onions (Optional/Omitted)',
      'Coriander & Lime Herb Mix'
    ],
    gravy: ['Tangy Mexican Dip', 'Lemon Chili Glaze'],
    healthBenefits: [
      'Crisp texture, vibrant taste, loaded with beta-carotene.'
    ],
    additionalBenefits: ['Immunity', 'Digestive Ease'],
    perfectFor: ['Snack', 'Light Meal'],
  },
  {
    _id: 'high-protein-salad',
    id: 'high-protein-salad',
    slug: 'premium-high-protein-salad',
    name: 'Premium High Protein Salad',
    calories: '387 Kcal',
    protein: '19g Protein',
    price: '₹349',
    tag: 'High Protein',
    addOns: [
      { name: 'Extra Organic Paneer / Tofu', price: 40 },
      { name: 'Extra Cold-Blended Herb Dressing', price: 30 },
      { name: 'Roasted Almonds, Walnuts & Seeds Mix', price: 35 },
      { name: 'Organic Boiled Chickpeas & Sprout Beans', price: 25 },
    ],
    image: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=600&q=80',
    ingredients: [
      'Boiled Chickpeas',
      'Beetroot',
      'Cabbage',
      'Zucchini - yellow + green',
      'Carrot',
      'Capsicum',
      'Pomegranate',
      'Pumpkin Seeds',
      'Watermelon Seeds',
      'Sunflower Seeds',
      'Flax Seeds'
    ],
    gravy: [
      'Cashew',
      'Parsley',
      'Mint',
      'Honey',
      'Watermelon Seeds',
      'Black Pepper Powder',
      'Basil',
      'Chilli Flakes',
      'Chat Masala'
    ],
    healthBenefits: [
      'High Protein Boost: Supplies 19g of natural plant protein. Helps in muscle building, strength & faster recovery.',
      'All-Day Energy Increase: Complex natural carbs & healthy fats prevent mid-day slumps and reduce fatigue.',
      'Heart Health Support: Flax seeds, sunflower seeds & raw nuts provide Omega-3 and help manage cholesterol.',
      'Improves Digestion: High dietary fiber from crunchy cabbage, carrots & beetroot improves gut microbiome.',
      'Blood Purification & Hemoglobin: Fresh beetroot & antioxidant-rich pomegranate enhance oxygen circulation.'
    ],
    additionalBenefits: ['Immunity Boost', 'Skin & Hair Health', 'Brain Function Support', 'Detox & Refreshing'],
    perfectFor: ['Diet', 'Fitness', 'Muscle Building', 'Healthy Lifestyle'],
    nutrition: {
      carbs: '67g',
      fiber: '13g',
      sugarAdded: '5g',
      sugarTotal: '4g',
      totalFat: '5g',
      saturatedFat: '5g',
      transFat: '0.68g',
      cholesterol: '0g',
      vitaminA: '42.14 µg',
      vitaminC: '3.61 mg',
      vitaminD: '0 µg',
      vitaminE: '1.15 mg',
      sodium: '42 mg',
      calcium: '124 mg',
      iron: '6 mg',
      potassium: '685 mg'
    }
  },
  {
    _id: 'burrito-salad',
    id: 'burrito-salad',
    slug: 'premium-burrito-salad',
    name: 'Premium Burrito Salad',
    calories: '367 Kcal',
    protein: '13g Protein',
    price: '₹369',
    tag: 'Chef Choice',
    image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=600&q=80',
    ingredients: [
      'Rajma (Kidney Beans)',
      'Brown Rice',
      'Fresh Organic Paneer',
      'Fresh Herb Salsa',
      'Sweet Corn',
      'Cabbage - green + purple',
      'Zucchini - yellow + green',
      'Carrot',
      'Tricolor Bell Peppers'
    ],
    gravy: [
      'Paneer Base',
      'Walnuts',
      'Pistachios',
      'Organic Honey',
      'Watermelon Seeds',
      'Black Pepper Powder',
      'Fresh Basil',
      'Chilli Flakes',
      'Chat Masala'
    ],
    healthBenefits: [
      'High Protein Boost: Supports lean muscle maintenance and keeps you satiated for 4+ hours.',
      'Rich in Soluble Fiber: Slow-digesting legumes improve digestion and maintain a balanced gut flora.',
      'Weight Management: Low glycemic index and nutrient-dense ingredients prevent unhealthy snacking.',
      'Steady Energy Provider: Balanced ratio of complex carbs, clean protein, and essential micronutrients.',
      'Cardiovascular Support: High potassium and antioxidant levels promote optimal cardiovascular health.'
    ],
    additionalBenefits: ['Improves Metabolism', 'Vitamin Rich', 'Blood Sugar Control', 'Hydration Support'],
    perfectFor: ['Lunch Fuel', 'Diet', 'Fitness', 'Weight Control'],
    nutrition: {
      carbs: '72g',
      fiber: '11g',
      sugarTotal: '6g',
      sugarAdded: '4g',
      totalFat: '3g',
      saturatedFat: '0g',
      transFat: '0g',
      cholesterol: '0mg',
      vitaminA: '185.51 µg',
      vitaminC: '24.8 mg',
      vitaminD: '0 µg',
      vitaminE: '1.25 mg',
      sodium: '52 mg',
      calcium: '64 mg',
      iron: '6 mg',
      potassium: '785 mg'
    }
  },
  {
    _id: 'peanut-salad',
    id: 'peanut-salad',
    slug: 'premium-peanut-salad',
    name: 'Premium Peanut Salad',
    calories: '495 Kcal',
    protein: '17g Protein',
    price: '₹329',
    tag: 'Bestseller',
    image: 'https://images.unsplash.com/photo-1511690656952-34342bb7c2f2?auto=format&fit=crop&w=600&q=80',
    ingredients: [
      'Mix Sprout Bean',
      'Crunchy Masala Peanuts',
      'Organic Paneer',
      'Cabbage - green + purple',
      'Zucchini',
      'Carrot',
      'Capsicum',
      'Beetroot',
      'Pumpkin Seeds',
      'Watermelon Seeds',
      'Sunflower Seeds',
      'Flax Seeds'
    ],
    gravy: [
      'Cold-Pressed Olive Oil',
      'Raw Organic Honey',
      'Wild Oregano',
      'Black Pepper Powder',
      'Chilli Flakes',
      'Chat Masala',
      'Fresh Lemon Juice'
    ],
    healthBenefits: [
      'Rich Plant Protein: High biological value plant protein supports cellular repair and muscle recovery.',
      'Heart-Healthy Monounsaturated Fats: Natural peanut lipids help optimize good HDL cholesterol.',
      'Sustained Fuel & Stamina: Calorie-dense good fats supply steady endurance for active lifestyles.',
      'Gut Health & Smooth Digestion: Sprouted legumes provide bioavailable enzymes and dietary roughage.',
      'Antioxidant Rich: Packed with resveratrol and Vitamin E to fight oxidative stress.'
    ],
    additionalBenefits: ['Rich in Antioxidants', 'Supports Skin Health', 'Regulates Blood Sugar', 'Strengthens Immunity'],
    perfectFor: ['Pre-Workout', 'Energy Boost', 'High Calorie Nutrition', 'Diet'],
    nutrition: {
      carbs: '52g',
      fiber: '9g',
      sugarTotal: '6g',
      sugarAdded: '4g',
      totalFat: '25g',
      saturatedFat: '3.95g',
      transFat: '0g',
      cholesterol: '0mg',
      vitaminA: '145.51 µg',
      vitaminC: '4.88 mg',
      vitaminD: '0 µg',
      vitaminE: '6.23 mg',
      sodium: '32 mg',
      calcium: '68 mg',
      iron: '4 mg',
      potassium: '542 mg'
    }
  },
  {
    _id: 'sprout-salad',
    id: 'sprout-salad',
    slug: 'premium-sprout-salad',
    name: 'Premium Sprout Salad',
    calories: '379 Kcal',
    protein: '21g Protein',
    price: '₹339',
    tag: 'Organic',
    image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&q=80',
    ingredients: [
      'Sprouted Moong & Matki',
      'Organic Soft Paneer',
      'Cabbage - green + purple',
      'Crisp Zucchini',
      'Farm Carrots',
      'Capsicum',
      'Beetroot',
      'Pomegranate Seeds',
      'Pumpkin Seeds',
      'Sunflower Seeds',
      'Flax Seeds'
    ],
    gravy: [
      'Cashew Puree',
      'Fresh Parsley',
      'Mint Leaves',
      'Honey',
      'Watermelon Seeds',
      'Cracked Black Pepper',
      'Basil',
      'Chilli Flakes',
      'Chat Masala'
    ],
    healthBenefits: [
      'Maximum Protein Density (21g): Sprouting increases amino acid bioavailability for peak strength.',
      'Active Digestive Enzymes: Live enzymes eliminate bloating and promote seamless digestive transit.',
      'Natural Detoxification: Chlorophyll and fiber work together to flush toxins naturally.',
      'Cellular Rejuvenation: High trace minerals (iron, zinc, magnesium) support vibrant hair and skin.',
      'Immune Defense: Rich in Vitamin C and polyphenols for strong daily immunity.'
    ],
    additionalBenefits: ['Controls Blood Sugar', 'Supports Hair Growth', 'Detoxifies Body', 'Improves Immunity'],
    perfectFor: ['Detox', 'High Protein Diet', 'Clean Eating', 'Fitness'],
    nutrition: {
      carbs: '66g',
      fiber: '15g',
      sugarTotal: '5g',
      sugarAdded: '3g',
      totalFat: '3g',
      saturatedFat: '0g',
      transFat: '0g',
      cholesterol: '0mg',
      vitaminA: '118.12 µg',
      vitaminC: '12.49 mg',
      vitaminD: '0 µg',
      vitaminE: '1.86 mg',
      sodium: '39 mg',
      calcium: '94 mg',
      iron: '8 mg',
      potassium: '742 mg'
    }
  },
  {
    _id: 'mushroom-fry-salad',
    id: 'mushroom-fry-salad',
    slug: 'premium-mushroom-fry-salad',
    name: 'Premium Mushroom Fry Salad',
    calories: '366 Kcal',
    protein: '15g Protein',
    price: '₹389',
    tag: 'New Item',
    image: 'https://images.unsplash.com/photo-1505253716362-afaea1d3d1af?auto=format&fit=crop&w=600&q=80',
    ingredients: [
      'Sauteed Button Mushrooms',
      'Organic Paneer',
      'Broccoli Florets',
      'Cabbage - green + purple',
      'Zucchini - yellow + green',
      'Carrot',
      'Capsicum - yellow + green',
      'Pumpkin Seeds',
      'Watermelon Seeds',
      'Sunflower Seeds',
      'Flax Seeds'
    ],
    gravy: [
      'Artisan Tomato Glaze',
      'Natural Soy Reduction',
      'Chilli Flakes',
      'Chat Masala',
      'Cold-Pressed Olive Oil'
    ],
    healthBenefits: [
      'Immunity Fortification: Beta-glucans and selenium in mushrooms support white blood cell response.',
      'Low Glycemic Load: High satiety with low net impact on blood glucose.',
      'Bone & Vitamin D Support: Mushrooms provide bio-available Vitamin D for calcium absorption.',
      'Metabolic Boost: B-vitamins convert healthy nutrients into sustained cellular ATP energy.',
      'Gut Microbiome Fuel: Prebiotic mushroom polysaccharides feed beneficial gut bacteria.'
    ],
    additionalBenefits: ['Boosts Energy Levels', 'Supports Skin Health', 'Controls Blood Sugar', 'Detoxifies Body'],
    perfectFor: ['Gourmet Diet', 'Immunity Boost', 'Keto Friendly', 'Dinner Bowl'],
    nutrition: {
      carbs: '72g',
      fiber: '18g',
      sugarTotal: '5g',
      sugarAdded: '2g',
      totalFat: '2g',
      saturatedFat: '0g',
      transFat: '0g',
      cholesterol: '0mg',
      vitaminA: '215.46 µg',
      vitaminC: '32.45 mg',
      vitaminD: '3.21 µg',
      vitaminE: '1.12 mg',
      sodium: '51 mg',
      calcium: '58 mg',
      iron: '4 mg',
      potassium: '1245 mg'
    }
  },
  {
    _id: 'mexican-fry-salad',
    id: 'mexican-fry-salad',
    slug: 'premium-mexican-fry-salad',
    name: 'Premium Mexican Fry Salad',
    calories: '379 Kcal',
    protein: '19g Protein',
    price: '₹359',
    tag: 'Spicy & Tangy',
    image: 'https://images.unsplash.com/photo-1513456852971-30c0b8199d4d?auto=format&fit=crop&w=600&q=80',
    ingredients: [
      'Seasoned Rajma Beans',
      'House Salsa',
      'Sweet Golden Corn',
      'Cabbage - green + purple',
      'Zucchini - yellow + green',
      'Carrots',
      'Capsicum - yellow + green',
      'Baked Corn Crisps',
      'Pumpkin Seeds',
      'Watermelon Seeds',
      'Sunflower Seeds',
      'Flax Seeds'
    ],
    gravy: [
      'Extra Virgin Olive Oil',
      'Raw Honey',
      'Mexican Oregano',
      'Black Pepper Powder',
      'Chilli Flakes',
      'Chat Masala',
      'Fresh Lemon'
    ],
    healthBenefits: [
      'Exciting Tangy Flavor: Satisfies fast-food cravings with 100% clean, non-greasy ingredients.',
      'Fiber Powerhouse (13g): Regulates blood sugar spikes and sustains optimal digestion.',
      'Natural Carotenoids: Bell peppers and corn provide lutein & zeaxanthin for vision health.',
      'Metabolic Thermogenesis: Mild chili spices gently stimulate calorie expenditure.',
      'Hydration & Vitality: Fresh crisp vegetables maintain cellular fluid balance.'
    ],
    additionalBenefits: ['Mood Booster', 'Hydration Support', 'Quick Filling Meal', 'Customizable Nutrition'],
    perfectFor: ['Craving Satisfaction', 'Lunch Fuel', 'Fitness', 'Healthy'],
    nutrition: {
      carbs: '69g',
      fiber: '13g',
      sugarTotal: '6g',
      sugarAdded: '3g',
      totalFat: '3g',
      saturatedFat: '0g',
      transFat: '0g',
      cholesterol: '0mg',
      vitaminA: '132.31 µg',
      vitaminC: '15.63 mg',
      vitaminD: '0 µg',
      vitaminE: '1.45 mg',
      sodium: '45 mg',
      calcium: '82 mg',
      iron: '6 mg',
      potassium: '815 mg'
    }
  },
  {
    _id: 'quinoa-avocado-salad',
    id: 'quinoa-avocado-salad',
    slug: 'premium-quinoa-with-avocado-salad',
    name: 'Premium Quinoa with Avocado Salad',
    calories: '446 Kcal',
    protein: '8.54g Protein',
    price: '₹399',
    tag: 'Superfood',
    image: 'https://images.unsplash.com/photo-1505576399279-565b52d4ac71?auto=format&fit=crop&w=600&q=80',
    ingredients: [
      'Fresh Ripe Hass Avocado',
      'Fluffy Andean Quinoa',
      'Organic Paneer',
      'Sweet Corn',
      'Cabbage',
      'Zucchini',
      'Carrot',
      'Capsicum - yellow + green',
      'Beetroot',
      'Pomegranate Seeds',
      'Flax Seeds'
    ],
    gravy: [
      'Cold-Pressed Olive Oil',
      'Organic Honey',
      'Wild Oregano',
      'Black Pepper Powder',
      'Chilli Flakes',
      'Chat Masala',
      'Fresh Lime Juice'
    ],
    healthBenefits: [
      'Complete Amino Acid Profile: Quinoa supplies all 9 essential amino acids for total cellular wellness.',
      'Brain & Heart Monounsaturated Fats: Avocado oleic acid supports sharp cognition and heart elasticity.',
      'Skin Radiance & Glow: High Vitamin E and essential fatty acids nourish skin hydration from within.',
      'Long-Burning Clean Energy: Complex quinoa starches prevent fatigue and sugar cravings.',
      'Anti-Inflammatory Defense: Polyphenols and healthy fats calm systemic cellular inflammation.'
    ],
    additionalBenefits: ['Brain Function Support', 'Cholesterol Control', 'Skin Health Improvement', 'Bone Strength'],
    perfectFor: ['Superfood Diet', 'Anti-Aging', 'Wellness', 'Clean Nutrition'],
    nutrition: {
      carbs: '66g',
      fiber: '11g',
      sugarTotal: '9g',
      sugarAdded: '6g',
      totalFat: '18g',
      saturatedFat: '3.1g',
      transFat: '0g',
      cholesterol: '0mg',
      vitaminA: '168.42 µg',
      vitaminC: '18.9 mg',
      vitaminD: '0 µg',
      vitaminE: '4.85 mg',
      sodium: '38 mg',
      calcium: '76 mg',
      iron: '5 mg',
      potassium: '920 mg'
    }
  }
];

export function getSaladByIdOrSlug(idOrSlug: string, saladsList: Salad[] = DEFAULT_SALADS): Salad | undefined {
  if (!idOrSlug) return undefined;
  const target = decodeURIComponent(idOrSlug).toLowerCase().trim();
  const targetSlug = slugify(target);

  return (
    saladsList.find((s) => {
      const sSlug = s.slug || slugify(s.name);
      const sId = s._id || s.id || '';
      return (
        sSlug === target ||
        sSlug === targetSlug ||
        sId.toLowerCase() === target ||
        slugify(s.name) === targetSlug ||
        s.name.toLowerCase() === target
      );
    }) ||
    saladsList.find((s) => {
      const sSlug = s.slug || slugify(s.name);
      return sSlug.includes(targetSlug) || targetSlug.includes(sSlug);
    })
  );
}
