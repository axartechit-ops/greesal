import React, { useState } from 'react';
import Link from 'next/link';
import { Salad, slugify } from '@/lib/salads';
import { 
  Plus, 
  Minus, 
  ShoppingCart, 
  Flame, 
  Zap, 
  ShieldCheck, 
  Info, 
  ArrowRight,
  Sparkles,
  Phone,
  Search,
  Check,
  Clock,
  Loader2
} from 'lucide-react';

import { SiteCategory, DEFAULT_CATEGORIES } from '@/lib/siteSettings';

interface SaladMenuSectionProps {
  salads: Salad[];
  categories?: SiteCategory[];
  cartItems: { [id: string]: number };
  onAddToCart: (salad: Salad) => void;
  onRemoveFromCart: (saladId: string) => void;
  onSelectSaladForModal: (salad: Salad) => void;
  onSubscriptionClick: () => void;
  onCateringClick: () => void;
  isOpen?: boolean;
  openingTime?: string;
  closingTime?: string;
  closedMessage?: string;
  isLoading?: boolean;
}

export const SaladMenuSection: React.FC<SaladMenuSectionProps> = ({
  salads,
  categories = DEFAULT_CATEGORIES,
  cartItems,
  onAddToCart,
  onRemoveFromCart,
  onSelectSaladForModal,
  onSubscriptionClick,
  onCateringClick,
  isOpen = true,
  openingTime = '08:00 AM',
  closingTime = '10:30 PM',
  closedMessage = 'Our kitchen is currently closed. Opening again at 08:00 AM. Pre-orders are welcome!',
  isLoading = false,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const displayCategories = categories && categories.length > 0 ? categories : DEFAULT_CATEGORIES;

  const matchesCategoryForSalad = (salad: Salad, categoryId: string) => {
    if (categoryId === 'all') return true;
    const catLower = categoryId.toLowerCase().trim();
    const tagLower = (salad.tag || '').toLowerCase().trim();
    const nameLower = (salad.name || '').toLowerCase().trim();

    if (tagLower === catLower) return true;
    if (tagLower.includes(catLower)) return true;

    if (catLower.includes('protein') && (tagLower.includes('protein') || nameLower.includes('protein'))) return true;
    if (catLower.includes('veggie') && (tagLower.includes('veggie') || tagLower.includes('sprout') || tagLower.includes('detox'))) return true;
    if (catLower.includes('paneer') && (tagLower.includes('paneer') || nameLower.includes('paneer'))) return true;
    if (catLower.includes('rice') && (tagLower.includes('rice') || nameLower.includes('rice') || nameLower.includes('burrito'))) return true;
    if (catLower.includes('exotic') && (tagLower.includes('exotic') || nameLower.includes('bundle') || nameLower.includes('mais'))) return true;

    return false;
  };

  const filteredSalads = salads.filter((salad) => {
    const matchesCategory = matchesCategoryForSalad(salad, selectedCategory);

    const matchesSearch =
      searchQuery.trim() === '' ||
      salad.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      salad.ingredients.some((ing) => ing.toLowerCase().includes(searchQuery.toLowerCase()));

    return matchesCategory && matchesSearch;
  });

  const handleQuickWhatsAppOrder = (salad: Salad) => {
    const text = encodeURIComponent(
      `🥗 *ORDER FROM GREESAL WEBSITE* 🥗\n\n` +
      `Item: *${salad.name}*\n` +
      `Price: *${salad.price}*\n` +
      `Delivery City: *Surat (Free Delivery)*\n\n` +
      `Please confirm availability for the next slot!`
    );
    window.open(`https://wa.me/919825144321?text=${text}`, '_blank');
  };

  return (
    <section id="menu" className="py-16 sm:py-24 bg-white relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header matching Salad India exact wording */}
        <div className="text-center mb-10 sm:mb-12">
          <p className="text-xs sm:text-sm font-bold uppercase tracking-widest text-[#6ac6ac] mb-2 font-montserrat">
            HANDCRAFTED CLEAN NUTRITION
          </p>
          <h2 className="font-montserrat font-extrabold text-3xl sm:text-5xl text-[#20493c] tracking-tight">
            Protein, Veggies &amp; Sprouts!
          </h2>
          <p className="font-dmsans text-lg sm:text-xl text-[#20493c]/80 font-medium mt-1">
            always fresh, healthy &amp; tasty....
          </p>
          <div className="w-20 h-1.5 bg-[#fbce45] mx-auto mt-4 rounded-full" />
        </div>

        {/* Salad India Guarantee Banner */}
        <div className="max-w-4xl mx-auto mb-10 bg-[#e8f7f2] border border-[#6ac6ac]/40 rounded-2xl p-4 sm:p-5 text-center shadow-sm">
          <div className="inline-flex items-center gap-2 text-xs sm:text-sm font-bold text-[#20493c]">
            <ShieldCheck className="w-4 h-4 text-[#20493c]" />
            <span>
              No Mayonnaise, No Preservatives, No Fatty Oil, No Onion &amp; Garlic — Fresh &amp; Healthy ingredients only!
            </span>
          </div>
        </div>

        {/* Quick action buttons matching Salad India Block zlRpM1 */}
        <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4 mb-8">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-5 py-2.5 rounded-full font-bold text-xs sm:text-sm transition-all shadow-sm ${
              selectedCategory === 'all'
                ? 'bg-[#20493c] text-white shadow-md'
                : 'bg-gray-100 hover:bg-gray-200 text-[#20493c]'
            }`}
          >
            Salad Menu
          </button>
          <button
            onClick={onSubscriptionClick}
            className="px-5 py-2.5 rounded-full bg-[#fbce45] text-[#20493c] hover:bg-[#e8b931] font-bold text-xs sm:text-sm transition-all shadow-sm flex items-center gap-1.5"
          >
            <span>Subscriptions</span>
            <span className="text-[10px] bg-[#20493c] text-white px-1.5 py-0.2 rounded-full font-black">
              Save ₹25
            </span>
          </button>
          <button
            onClick={onCateringClick}
            className="px-5 py-2.5 rounded-full bg-white border border-[#20493c] text-[#20493c] hover:bg-[#f2f8f5] font-bold text-xs sm:text-sm transition-all shadow-sm"
          >
            Bulk Orders &amp; Catering
          </button>
        </div>

        {/* Closed Announcement & Pre-Order Notification */}
        {!isOpen && (
          <div className="mb-8 p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-red-50 via-rose-50 to-amber-50 border border-red-200 text-red-900 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm text-left">
            <div className="flex items-start sm:items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center flex-shrink-0 text-red-700">
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-red-600 animate-pulse" />
                  <h4 className="font-extrabold text-sm sm:text-base text-[#123B2B]">
                    Store is Currently Closed • Accepting Pre-Orders!
                  </h4>
                </div>
                <p className="text-xs text-gray-700 font-medium mt-0.5">
                  {closedMessage || `Our kitchen is currently closed. Opening again at ${openingTime}. You can add items to cart and pre-order for the next scheduled delivery slot!`}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 self-start sm:self-auto flex-shrink-0">
              <span className="text-xs font-bold text-emerald-800 bg-emerald-100 border border-emerald-300 px-3 py-1 rounded-full">
                ✓ Pre-Orders Active
              </span>
            </div>
          </div>
        )}

        {/* Category Pills & Search */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-10">
          
          {/* Category Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-2 md:pb-0 no-scrollbar">
            {displayCategories.map((cat) => {
              const active = selectedCategory === cat.id;
              const countText = isLoading
                ? '...'
                : cat.count ||
                  (cat.id === 'all'
                    ? `${salads.length} items`
                    : `${salads.filter((s) => matchesCategoryForSalad(s, cat.id)).length} items`);

              return (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`px-4 py-2.5 rounded-2xl whitespace-nowrap text-xs sm:text-sm font-bold transition-all flex items-center gap-2 border ${
                    active
                      ? 'bg-[#20493c] text-white border-[#20493c] shadow-md'
                      : 'bg-white hover:bg-gray-50 text-[#1a1a1a] border-gray-200'
                  }`}
                >
                  {cat.icon && <span>{cat.icon}</span>}
                  <span>{cat.label}</span>
                  <span
                    className={`text-[10px] px-1.5 py-0.5 rounded-full font-normal ${
                      active ? 'bg-white/20 text-white' : 'bg-gray-100 text-[#20493c]'
                    }`}
                  >
                    {countText}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Search Box */}
          <div className="relative w-full md:w-72">
            <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search paneer, sprouts, corn..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 rounded-2xl border border-gray-200 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#20493c] bg-white text-[#1a1a1a]"
            />
          </div>

        </div>

        {/* Loading State Spinner & Skeleton Cards */}
        {isLoading ? (
          <div className="space-y-6">
            {/* Branded Loader Banner */}
            <div className="flex items-center justify-center gap-2.5 py-3.5 px-6 rounded-2xl bg-[#e8f7f2] border border-[#6ac6ac]/40 max-w-md mx-auto shadow-xs">
              <Loader2 className="w-5 h-5 text-[#20493c] animate-spin flex-shrink-0" />
              <span className="text-xs sm:text-sm font-bold text-[#20493c] tracking-wide">
                Loading Fresh Farm-Organic Salads...
              </span>
            </div>

            {/* Skeleton Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-6 lg:gap-8">
              {[1, 2, 3, 4, 5, 6, 7, 8].map((idx) => (
                <div
                  key={idx}
                  className="bg-white rounded-2xl sm:rounded-3xl overflow-hidden border border-[#e4eae7] shadow-xs flex flex-col justify-between animate-pulse"
                >
                  {/* Shimmer Image Box */}
                  <div className="relative w-full h-36 xs:h-44 sm:h-52 bg-gradient-to-tr from-gray-100 via-emerald-50/50 to-gray-100 flex items-center justify-center">
                    <div className="w-10 h-10 rounded-full bg-white/70 flex items-center justify-center shadow-xs">
                      <Sparkles className="w-5 h-5 text-[#6ac6ac]/60" />
                    </div>
                  </div>

                  {/* Shimmer Details */}
                  <div className="p-2.5 sm:p-5 flex-1 flex flex-col justify-between gap-3">
                    <div className="space-y-2">
                      <div className="h-4 sm:h-5 bg-gray-200 rounded-lg w-4/5" />
                      <div className="flex gap-1.5">
                        <div className="h-3.5 bg-[#e8f7f2] rounded-md w-14" />
                        <div className="h-3.5 bg-gray-100 rounded-md w-10" />
                      </div>
                      <div className="h-2.5 sm:h-3 bg-gray-100 rounded w-full" />
                      <div className="h-2.5 sm:h-3 bg-gray-100 rounded w-2/3" />
                    </div>

                    <div className="pt-2 sm:pt-3 border-t border-gray-100 flex items-center justify-between">
                      <div className="h-5 sm:h-6 bg-gray-200 rounded-md w-14" />
                      <div className="h-7 sm:h-8 bg-[#20493c]/15 rounded-xl w-14 sm:w-16" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : filteredSalads.length === 0 ? (
          /* Empty Search / Category State */
          <div className="text-center py-16 px-4 bg-[#FAF6F0] rounded-3xl border border-[#EBE2D3] max-w-lg mx-auto">
            <div className="w-14 h-14 mx-auto mb-3 rounded-full bg-amber-50 border border-amber-200 flex items-center justify-center text-2xl shadow-xs">
              🥗
            </div>
            <h3 className="text-base sm:text-lg font-bold text-[#123B2B]">
              No Salads Found
            </h3>
            <p className="text-xs sm:text-sm text-gray-500 mt-1">
              {searchQuery
                ? `No salads match "${searchQuery}". Try a different keyword or category.`
                : 'No salads available in this category right now.'}
            </p>
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="mt-4 px-4 py-2 rounded-xl bg-[#20493c] text-white text-xs font-bold hover:bg-[#15342a] transition-all cursor-pointer shadow-xs"
              >
                Clear Search
              </button>
            )}
          </div>
        ) : (
          /* Salads Grid - 2 in one row on mobile (grid-cols-2) */
          <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-6 lg:gap-8">
            {filteredSalads.map((salad) => {
              const saladId = salad.id || salad._id || salad.slug || salad.name;
              const quantity = cartItems[saladId] || 0;

              return (
                <div
                  key={saladId}
                  className="bg-white rounded-2xl sm:rounded-3xl overflow-hidden border border-[#e4eae7] hover:shadow-xl transition-all duration-300 flex flex-col justify-between group hover:-translate-y-1"
                >
                  {/* Image Section */}
                  <Link 
                    href={`/salads/${salad.slug || slugify(salad.name)}`}
                    className="relative block w-full h-36 xs:h-44 sm:h-52 bg-[#f2f8f5] overflow-hidden cursor-pointer" 
                  >
                    <img
                      src={salad.image}
                      alt={salad.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src =
                          'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=800&q=80';
                      }}
                    />

                  {/* Top Badge: Tag */}
                  <div className="absolute top-2 left-2 sm:top-3 sm:left-3 bg-white/95 backdrop-blur-sm px-1.5 py-0.5 sm:px-2.5 sm:py-1 rounded-full text-[9px] sm:text-[11px] font-bold text-[#20493c] shadow-xs border border-[#6ac6ac]/30 flex items-center gap-0.5 sm:gap-1 max-w-[70%] sm:max-w-none truncate">
                    <Sparkles className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-[#fbce45] flex-shrink-0" />
                    <span className="truncate">{salad.tag || 'Greesal Special'}</span>
                  </div>

                  {/* Top Right: Calories */}
                  {salad.calories && (
                    <div className="absolute top-2 right-2 sm:top-3 sm:right-3 bg-[#20493c]/90 text-white px-1.5 py-0.5 sm:px-2 sm:py-0.5 rounded-full text-[8px] sm:text-[10px] font-bold flex items-center gap-0.5 sm:gap-1 shadow-xs">
                      <Flame className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-[#fbce45] flex-shrink-0" />
                      <span>{salad.calories}</span>
                    </div>
                  )}

                  {/* Quick info overlay button */}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      onSelectSaladForModal(salad);
                    }}
                    className="absolute bottom-2 right-2 sm:bottom-3 sm:right-3 w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-white/90 hover:bg-white text-[#20493c] flex items-center justify-center shadow-xs transition-transform hover:scale-110 z-10"
                    title="Quick Preview"
                  >
                    <Info className="w-3 h-3 sm:w-4 sm:h-4" />
                  </button>
                </Link>

                {/* Content Section */}
                <div className="p-2.5 sm:p-5 flex-1 flex flex-col justify-between">
                  <div>
                    {/* Title */}
                    <Link
                      href={`/salads/${salad.slug || slugify(salad.name)}`}
                      className="font-montserrat font-bold text-xs sm:text-lg text-[#20493c] hover:text-[#15342a] transition-colors cursor-pointer line-clamp-1 mb-1 sm:mb-1.5 leading-snug block"
                    >
                      {salad.name}
                    </Link>

                      {/* Protein / Highlights pills */}
                      <div className="flex flex-wrap items-center gap-1 sm:gap-2 mb-1.5 sm:mb-3">
                        {salad.protein && (
                          <span className="inline-flex items-center gap-0.5 sm:gap-1 text-[9px] sm:text-[11px] font-bold bg-[#e8f7f2] text-[#20493c] px-1.5 sm:px-2 py-0.5 rounded-md border border-[#6ac6ac]/20">
                            <Zap className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-[#6ac6ac]" />
                            {salad.protein}
                          </span>
                        )}
                        <span className="hidden xs:inline text-[9px] sm:text-[10px] text-gray-500 font-medium truncate">
                          Satvik
                        </span>
                      </div>

                      {/* Key Ingredients Snippet */}
                      <p className="font-dmsans text-[10px] sm:text-xs text-gray-600 line-clamp-1 sm:line-clamp-2 leading-relaxed mb-2.5 sm:mb-4">
                        {salad.ingredients && salad.ingredients.length > 0
                          ? salad.ingredients.slice(0, 3).join(', ') + (salad.ingredients.length > 3 ? '...' : '')
                          : 'Fresh organic greens, handcrafted dressing.'}
                      </p>
                    </div>

                    {/* Bottom Row: Price & Actions */}
                    <div className="pt-2 sm:pt-3 border-t border-gray-100 flex items-center justify-between gap-1 sm:gap-2">
                      <div>
                        <span className="text-[9px] sm:text-[11px] text-gray-400 block font-medium leading-none mb-0.5">Price</span>
                        <span className="font-montserrat font-black text-xs sm:text-xl text-[#20493c] tracking-tight">
                          {salad.price.startsWith('₹') ? salad.price : `₹${salad.price}`}
                        </span>
                      </div>

                      {/* Cart / WhatsApp Actions */}
                      <div className="flex items-center gap-1 sm:gap-1.5">
                        {quantity === 0 ? (
                          <>
                            <button
                              onClick={() => onAddToCart(salad)}
                              className="inline-flex items-center gap-0.5 sm:gap-1.5 bg-[#20493c] hover:bg-[#15342a] text-white px-2.5 py-1.5 sm:px-3.5 sm:py-2 rounded-xl text-[10px] sm:text-xs font-bold transition-all active:scale-95 shadow-xs whitespace-nowrap"
                            >
                              <Plus className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-[#fbce45]" />
                              <span>Add</span>
                            </button>
                            <button
                              onClick={() => handleQuickWhatsAppOrder(salad)}
                              className="p-1.5 sm:p-2 rounded-xl border border-gray-200 hover:border-[#25D366] hover:bg-[#eafaf1] text-[#25D366] transition-colors"
                              title="Order via WhatsApp"
                            >
                              <Phone className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                            </button>
                          </>
                        ) : (
                          <div className="flex items-center gap-1 sm:gap-1.5 bg-[#e8f7f2] border border-[#6ac6ac]/40 rounded-xl p-0.5 sm:p-1 shadow-xs">
                            <button
                              onClick={() => onRemoveFromCart(saladId)}
                              className="w-5 h-5 sm:w-6 sm:h-6 rounded-lg bg-white text-[#20493c] flex items-center justify-center hover:bg-gray-100 active:scale-90"
                            >
                              <Minus className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                            </button>
                            <span className="w-4 sm:w-5 text-center font-bold text-[10px] sm:text-xs text-[#20493c]">
                              {quantity}
                            </span>
                            <button
                              onClick={() => onAddToCart(salad)}
                              className="w-5 h-5 sm:w-6 sm:h-6 rounded-lg bg-[#20493c] text-white flex items-center justify-center hover:bg-[#15342a] active:scale-90"
                            >
                              <Plus className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                            </button>
                          </div>
                        )}
                      </div>
                    </div>

                  </div>
                </div>
              );
            })}
          </div>
        )}

      </div>
    </section>
  );
};
