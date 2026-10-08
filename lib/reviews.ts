export interface CustomerReview {
  _id?: string;
  id?: string | number;
  name: string;
  location: string;
  role: string;
  text: string;
  rating: number;
  isPinned?: boolean;
  order?: number;
  status?: 'approved' | 'hidden';
  createdAt?: string;
}

export const DEFAULT_REVIEWS: CustomerReview[] = [
  {
    id: '1',
    name: 'Megha Deora',
    location: 'Vesu, Surat',
    role: '2-Month Active Subscriber',
    text: 'I had the Greesal subscription for 2 months and I am really satisfied with it. I certainly believe this has completed my daily nutrient requirements. This is value for money food and fulfilling too. The dressings are 100% handmade and taste amazingly fresh!',
    rating: 5,
    isPinned: true,
    order: 1,
    status: 'approved',
    createdAt: new Date().toISOString(),
  },
  {
    id: '2',
    name: 'Dr. Saumya Gandhi',
    location: 'Adajan, Surat',
    role: 'Daily Subscriber (> 1 Year)',
    text: 'We are having Greesal salads almost daily since more than a year. Greesal has helped us attain a healthy lifestyle with effortless weight management. Salads are always crisp, fresh and the variety never makes it boring. Prompt delivery every single morning!',
    rating: 5,
    isPinned: true,
    order: 2,
    status: 'approved',
    createdAt: new Date().toISOString(),
  },
  {
    id: '3',
    name: 'Rohan Shah',
    location: 'Citylight, Surat',
    role: 'Fitness Enthusiast',
    text: 'The High-Protein Chickpea & Paneer Garden bowls are unmatched. 20g+ clean protein without heavy mayonnaise or junk oil. Truly the best healthy meal solution in Surat.',
    rating: 5,
    isPinned: true,
    order: 3,
    status: 'approved',
    createdAt: new Date().toISOString(),
  },
  {
    id: '4',
    name: 'Pooja Agarwal',
    location: 'Piplod, Surat',
    role: 'Monthly Wellness Member',
    text: 'No onion, no garlic pure satvik options that taste genuinely gourmet. The subscription flexibility is so easy to pause when travelling. Highly recommended!',
    rating: 5,
    isPinned: true,
    order: 4,
    status: 'approved',
    createdAt: new Date().toISOString(),
  },
];
