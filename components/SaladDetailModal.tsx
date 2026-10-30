import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Salad, slugify, SaladPortion, getSaladPortions, getSaladPriceForPortion, getSaladIngredients, getSaladDressing, getSaladCrunch } from '@/lib/salads';
import { 
  X, 
  Flame, 
  Zap, 
  ShieldCheck, 
  Check, 
  HeartPulse, 
  Leaf, 
  Plus, 
  Minus, 
  ShoppingCart, 
  Phone, 
  Sparkles, 
  ExternalLink,
  Utensils
} from 'lucide-react';

interface SaladDetailModalProps {
  salad: Salad | null;
  isOpen: boolean;
  onClose: () => void;
  quantityInCart: number;
  onAddToCart: (salad: Salad) => void;
  onRemoveFromCart: (saladId: string) => void;
}

export const SaladDetailModal: React.FC<SaladDetailModalProps> = ({
  salad,
  isOpen,
  onClose,
  quantityInCart,
  onAddToCart,
  onRemoveFromCart,
}) => {
  if (!isOpen || !salad) return null;

  const saladId = salad.id || salad._id || salad.slug || salad.name;
  const portions = getSaladPortions(salad);
  const [removedItems, setRemovedItems] = useState<string[]>([]);

  const toggleRemoveItem = (item: string) => {
    setRemovedItems((prev) =>
      prev.includes(item) ? prev.filter((i) => i !== item) : [...prev, item]
    );
  };

  const [selectedPortion, setSelectedPortion] = useState<SaladPortion>(() => {
    return portions.find((p) => p.isDefault) || portions[0];
  });

  useEffect(() => {
    if (salad) {
      const pList = getSaladPortions(salad);
      setSelectedPortion(pList.find((p) => p.isDefault) || pList[0]);
      setRemovedItems([]);
    }
  }, [salad]);

  const activePrice = selectedPortion ? `₹${selectedPortion.price}` : (salad.price.startsWith('₹') ? salad.price : `₹${salad.price}`);
  const preparedSalad: Salad = {
    ...salad,
    name: removedItems.length > 0 ? `${salad.name} (Without: ${removedItems.join(', ')})` : salad.name,
    price: activePrice,
    selectedPortion,
  };

  const handleWhatsAppOrder = () => {
    const withoutText = removedItems.length > 0 ? `\nWithout: *${removedItems.join(', ')}*` : '';
    const text = encodeURIComponent(
      `🥗 *ORDER FROM GREESAL WEBSITE* 🥗\n\n` +
      `Item: *${salad.name}*\n` +
      `Portion Size: *${selectedPortion ? `${selectedPortion.grams}g (${selectedPortion.label || 'Standard'})` : 'Standard Bowl'}*` +
      withoutText +
      `\nPrice: *${activePrice}*\n` +
      `Calories: *${salad.calories || 'Balanced'}*\n` +
      `Protein: *${salad.protein || 'High Protein'}*\n` +
      `City: *Surat (Free Delivery)*\n\n` +
      `Please confirm order delivery slot!`
    );
    window.open(`https://wa.me/919925836117?text=${text}`, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity" onClick={onClose} />

      <div className="flex min-h-full items-center justify-center p-4 text-center">
        <div className="w-full max-w-2xl transform overflow-hidden rounded-3xl bg-white text-left align-middle shadow-2xl transition-all border border-[#e4eae7] relative animate-fadeIn flex flex-col max-h-[90vh]">
          
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-10 p-2 rounded-full bg-white/80 hover:bg-white text-gray-700 shadow-md transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Modal Hero Image */}
          <div className="relative h-64 sm:h-72 w-full bg-gray-100 flex-shrink-0">
            <img
              src={salad.image}
              alt={salad.name}
              className="w-full h-full object-cover"
              onError={(e) => {
                (e.target as HTMLImageElement).src =
                  'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=800&q=80';
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

            <div className="absolute bottom-4 left-6 right-6 text-white">
              <span className="inline-block px-2.5 py-0.5 rounded-full bg-[#fbce45] text-[#20493c] text-[11px] font-extrabold uppercase tracking-wider mb-1.5">
                {salad.tag || 'Greesal Special'}
              </span>
              <h3 className="font-montserrat font-extrabold text-2xl sm:text-3xl text-white drop-shadow-md">
                {salad.name}
              </h3>
              <div className="flex items-center gap-3 mt-1.5 text-xs font-semibold">
                {salad.protein && (
                  <span className="flex items-center gap-1 text-[#b0ffd7]">
                    <Zap className="w-3.5 h-3.5" /> {salad.protein}
                  </span>
                )}
                {salad.calories && (
                  <span className="flex items-center gap-1 text-[#fbce45]">
                    <Flame className="w-3.5 h-3.5" /> {salad.calories}
                  </span>
                )}
                <span className="flex items-center gap-1 text-white/90">
                  <ShieldCheck className="w-3.5 h-3.5 text-[#6ac6ac]" /> No Onion &amp; Garlic
                </span>
              </div>
            </div>
          </div>

          {/* Modal Scrollable Content */}
          <div className="p-6 sm:p-8 overflow-y-auto space-y-6 font-dmsans">
            
            {/* Dedicated Product Page Link Banner */}
            <Link
              href={`/salads/${salad.slug || slugify(salad.name)}`}
              onClick={onClose}
              className="flex items-center justify-between p-3.5 sm:p-4 rounded-2xl bg-gradient-to-r from-[#6ac6ac] via-[#164634] to-[#1F5E46] text-white hover:opacity-95 transition-all shadow-md group"
            >
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-white/15 flex items-center justify-center text-[#fbce45]">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <h5 className="font-extrabold text-xs sm:text-sm text-white">Full Product Details &amp; Nutrition Facts</h5>
                  <p className="text-[11px] text-emerald-200">View full ingredients, macro breakdown &amp; custom add-ons</p>
                </div>
              </div>
              <span className="text-xs font-bold text-[#fbce45] group-hover:translate-x-1 transition-transform flex items-center gap-1 pl-2">
                <span>Open Page</span>
                <span>&rarr;</span>
              </span>
            </Link>

            {/* Gram Portion Weights */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h4 className="font-montserrat font-bold text-xs uppercase tracking-wider text-[#20493c] flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-[#fbce45]" />
                  <span>Select Bowl Size / Weight</span>
                </h4>
                <span className="text-[11px] font-extrabold text-[#20493c] bg-[#e8f7f2] px-2.5 py-0.5 rounded-full border border-[#6ac6ac]/30">
                  {selectedPortion?.grams}g Selected
                </span>
              </div>

              <div className="grid grid-cols-3 gap-2.5">
                {portions.map((portion) => {
                  const isSelected = selectedPortion?.grams === portion.grams;
                  return (
                    <button
                      key={portion.grams}
                      type="button"
                      onClick={() => setSelectedPortion(portion)}
                      className={`p-3 rounded-2xl border text-center transition-all cursor-pointer flex flex-col items-center justify-center gap-1 ${
                        isSelected
                          ? 'bg-[#20493c] text-white border-[#20493c] shadow-md ring-2 ring-[#fbce45]'
                          : 'bg-[#FAF6F0] hover:bg-white text-[#20493c] border-[#E8E1D5]'
                      }`}
                    >
                      <span className={`text-xs font-black ${isSelected ? 'text-[#fbce45]' : 'text-[#20493c]'}`}>
                        {portion.grams}g
                      </span>
                      <span className={`text-xs font-black ${isSelected ? 'text-white' : 'text-emerald-700'}`}>
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

            {/* Price and Add to Cart Bar */}
            <div className="flex items-center justify-between p-4 rounded-2xl bg-[#e8f7f2] border border-[#6ac6ac]/30">
              <div>
                <span className="text-xs text-[#20493c]/70 font-semibold block">Price (Free Surat Delivery)</span>
                <span className="font-montserrat font-black text-2xl sm:text-3xl text-[#20493c]">
                  {activePrice}
                </span>
              </div>

              <div className="flex items-center gap-2">
                {quantityInCart === 0 ? (
                  <button
                    onClick={() => onAddToCart(preparedSalad)}
                    className="flex items-center gap-2 bg-[#20493c] hover:bg-[#15342a] text-white px-5 py-2.5 rounded-xl font-bold text-sm shadow-md active:scale-95 transition-all cursor-pointer"
                  >
                    <Plus className="w-4 h-4 text-[#fbce45]" />
                    <span>Add to Cart</span>
                  </button>
                ) : (
                  <div className="flex items-center gap-2 bg-white rounded-xl p-1.5 shadow-sm border border-[#6ac6ac]/30">
                    <button
                      onClick={() => onRemoveFromCart(saladId)}
                      className="w-8 h-8 rounded-lg bg-gray-100 hover:bg-gray-200 text-[#20493c] flex items-center justify-center font-bold cursor-pointer"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <span className="w-8 text-center font-bold text-base text-[#20493c]">
                      {quantityInCart}
                    </span>
                    <button
                      onClick={() => onAddToCart(preparedSalad)}
                      className="w-8 h-8 rounded-lg bg-[#20493c] text-white flex items-center justify-center font-bold cursor-pointer"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                )}

                <button
                  onClick={handleWhatsAppOrder}
                  className="p-2.5 rounded-xl bg-[#25D366] text-white hover:bg-[#20ba59] transition-colors shadow-sm cursor-pointer"
                  title="Order direct via WhatsApp"
                >
                  <Phone className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* 3-Part Modular Ingredients: Ingredients, Dressing, Crunch */}
            <div className="space-y-4 pt-1">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-black uppercase tracking-wider text-[#20493c] flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#C89D4B]" />
                  <span>Crafted in 3 Parts (Tap − to remove)</span>
                </span>
                <div className="flex items-center gap-1.5">
                  {removedItems.length > 0 && (
                    <button
                      type="button"
                      onClick={() => setRemovedItems([])}
                      className="text-[10px] font-bold text-red-700 bg-red-50 hover:bg-red-100 border border-red-200 px-2 py-0.5 rounded-full transition-colors cursor-pointer"
                    >
                      Reset ({removedItems.length})
                    </button>
                  )}
                  <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                    100% Satvik Clean
                  </span>
                </div>
              </div>

              {/* Part 1: Fresh Base Ingredients */}
              {getSaladIngredients(salad).length > 0 && (
                <div className="bg-[#FAF6F0] p-3 rounded-2xl border border-[#E8E1D5] space-y-2">
                  <h4 className="font-montserrat font-bold text-xs uppercase tracking-wider text-[#20493c] flex items-center gap-1.5">
                    <Leaf className="w-3.5 h-3.5 text-[#237357]" />
                    <span>Part 1: Fresh Ingredients ({getSaladIngredients(salad).length})</span>
                  </h4>
                  <div className="flex flex-wrap gap-1.5">
                    {getSaladIngredients(salad).map((ing, idx) => {
                      const isRemoved = removedItems.includes(ing);
                      return (
                        <span
                          key={idx}
                          className={`px-2.5 py-1 rounded-lg border text-[11px] font-semibold shadow-2xs inline-flex items-center gap-1.5 transition-all ${
                            isRemoved
                              ? 'bg-red-50/80 border-red-200 text-red-600 line-through opacity-70'
                              : 'bg-white border-[#EBE2D3] text-gray-800'
                          }`}
                        >
                          <span>{ing}</span>
                          <button
                            type="button"
                            onClick={() => toggleRemoveItem(ing)}
                            className={`w-3.5 h-3.5 rounded-full flex items-center justify-center text-[10px] font-black transition-all hover:scale-110 cursor-pointer ${
                              isRemoved
                                ? 'bg-emerald-600 text-white'
                                : 'bg-red-100 text-red-700 hover:bg-red-200'
                            }`}
                            title={isRemoved ? `Re-add ${ing}` : `Remove ${ing} using -`}
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
                <div className="bg-amber-50/60 p-3 rounded-2xl border border-amber-200/80 space-y-2">
                  <h4 className="font-montserrat font-bold text-xs uppercase tracking-wider text-amber-950 flex items-center gap-1.5">
                    <Utensils className="w-3.5 h-3.5 text-amber-700" />
                    <span>Part 2: Handcrafted Dressing ({getSaladDressing(salad).length})</span>
                  </h4>
                  <div className="flex flex-wrap gap-1.5">
                    {getSaladDressing(salad).map((item, idx) => {
                      const isRemoved = removedItems.includes(item);
                      return (
                        <span
                          key={idx}
                          className={`px-2.5 py-1 rounded-lg border text-[11px] font-semibold shadow-2xs inline-flex items-center gap-1 transition-all ${
                            isRemoved
                              ? 'bg-red-50/80 border-red-200 text-red-600 line-through opacity-70'
                              : 'bg-white border-amber-200 text-amber-950'
                          }`}
                        >
                          <Sparkles className={`w-2.5 h-2.5 ${isRemoved ? 'text-red-400' : 'text-amber-600'}`} />
                          <span>{item}</span>
                          <button
                            type="button"
                            onClick={() => toggleRemoveItem(item)}
                            className={`w-3.5 h-3.5 rounded-full flex items-center justify-center text-[10px] font-black transition-all hover:scale-110 cursor-pointer ${
                              isRemoved
                                ? 'bg-emerald-600 text-white'
                                : 'bg-red-100 text-red-700 hover:bg-red-200'
                            }`}
                            title={isRemoved ? `Re-add ${item}` : `Remove ${item} using -`}
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
                <div className="bg-[#FAF6F0] p-3 rounded-2xl border border-stone-200 space-y-2">
                  <h4 className="font-montserrat font-bold text-xs uppercase tracking-wider text-stone-900 flex items-center gap-1.5">
                    <Zap className="w-3.5 h-3.5 text-[#C89D4B]" />
                    <span>Part 3: Signature Crunch ({getSaladCrunch(salad).length})</span>
                  </h4>
                  <div className="flex flex-wrap gap-1.5">
                    {getSaladCrunch(salad).map((item, idx) => {
                      const isRemoved = removedItems.includes(item);
                      return (
                        <span
                          key={idx}
                          className={`px-2.5 py-1 rounded-lg border text-[11px] font-semibold shadow-2xs inline-flex items-center gap-1 transition-all ${
                            isRemoved
                              ? 'bg-red-50/80 border-red-200 text-red-600 line-through opacity-70'
                              : 'bg-white border-stone-200 text-stone-900'
                          }`}
                        >
                          <span className="text-[10px]">✨</span>
                          <span>{item}</span>
                          <button
                            type="button"
                            onClick={() => toggleRemoveItem(item)}
                            className={`w-3.5 h-3.5 rounded-full flex items-center justify-center text-[10px] font-black transition-all hover:scale-110 cursor-pointer ${
                              isRemoved
                                ? 'bg-emerald-600 text-white'
                                : 'bg-red-100 text-red-700 hover:bg-red-200'
                            }`}
                            title={isRemoved ? `Re-add ${item}` : `Remove ${item} using -`}
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

            {/* Health Benefits */}
            {salad.healthBenefits && salad.healthBenefits.length > 0 && (
              <div>
                <h4 className="font-montserrat font-bold text-sm uppercase tracking-wider text-[#20493c] mb-2 flex items-center gap-1.5">
                  <HeartPulse className="w-4 h-4 text-red-600" />
                  Health &amp; Nutritional Benefits
                </h4>
                <ul className="space-y-2 text-xs sm:text-sm text-gray-700">
                  {salad.healthBenefits.map((benefit, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-[#6ac6ac] flex-shrink-0 mt-0.5" />
                      <span>{benefit}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Purity Assurance */}
            <div className="p-4 rounded-2xl bg-[#fbce45]/15 border border-[#fbce45]/40 flex items-center gap-3">
              <ShieldCheck className="w-6 h-6 text-[#20493c] flex-shrink-0" />
              <p className="text-xs text-[#20493c] font-medium leading-relaxed">
                <strong>Greesal Clean Kitchen:</strong> Free of preservatives, no artificial coloring, no mayonnaise, and 100% prepared hygienically on order.
              </p>
            </div>

          </div>

        </div>
      </div>
    </div>
  );
};
