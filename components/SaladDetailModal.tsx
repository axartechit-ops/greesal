import React from 'react';
import Link from 'next/link';
import { Salad, slugify } from '@/lib/salads';
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
  ExternalLink
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

  const handleWhatsAppOrder = () => {
    const text = encodeURIComponent(
      `🥗 *ORDER FROM GREESAL WEBSITE* 🥗\n\n` +
      `Item: *${salad.name}*\n` +
      `Price: *${salad.price}*\n` +
      `Calories: *${salad.calories || 'Balanced'}*\n` +
      `Protein: *${salad.protein || 'High Protein'}*\n` +
      `City: *Surat (Free Delivery)*\n\n` +
      `Please confirm order delivery slot!`
    );
    window.open(`https://wa.me/919825144321?text=${text}`, '_blank');
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
              className="flex items-center justify-between p-3.5 sm:p-4 rounded-2xl bg-gradient-to-r from-[#123B2B] via-[#164634] to-[#1F5E46] text-white hover:opacity-95 transition-all shadow-md group"
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

            {/* Price and Add to Cart Bar */}
            <div className="flex items-center justify-between p-4 rounded-2xl bg-[#e8f7f2] border border-[#6ac6ac]/30">
              <div>
                <span className="text-xs text-[#20493c]/70 font-semibold block">Price (Free Surat Delivery)</span>
                <span className="font-montserrat font-black text-2xl sm:text-3xl text-[#20493c]">
                  {salad.price.startsWith('₹') ? salad.price : `₹${salad.price}`}
                </span>
              </div>

              <div className="flex items-center gap-2">
                {quantityInCart === 0 ? (
                  <button
                    onClick={() => onAddToCart(salad)}
                    className="flex items-center gap-2 bg-[#20493c] hover:bg-[#15342a] text-white px-5 py-2.5 rounded-xl font-bold text-sm shadow-md active:scale-95 transition-all"
                  >
                    <Plus className="w-4 h-4 text-[#fbce45]" />
                    <span>Add to Cart</span>
                  </button>
                ) : (
                  <div className="flex items-center gap-2 bg-white rounded-xl p-1.5 shadow-sm border border-[#6ac6ac]/30">
                    <button
                      onClick={() => onRemoveFromCart(saladId)}
                      className="w-8 h-8 rounded-lg bg-gray-100 hover:bg-gray-200 text-[#20493c] flex items-center justify-center font-bold"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <span className="w-8 text-center font-bold text-base text-[#20493c]">
                      {quantityInCart}
                    </span>
                    <button
                      onClick={() => onAddToCart(salad)}
                      className="w-8 h-8 rounded-lg bg-[#20493c] text-white flex items-center justify-center font-bold"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                )}

                <button
                  onClick={handleWhatsAppOrder}
                  className="p-2.5 rounded-xl bg-[#25D366] text-white hover:bg-[#20ba59] transition-colors shadow-sm"
                  title="Order direct via WhatsApp"
                >
                  <Phone className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Ingredients */}
            {salad.ingredients && salad.ingredients.length > 0 && (
              <div>
                <h4 className="font-montserrat font-bold text-sm uppercase tracking-wider text-[#20493c] mb-2 flex items-center gap-1.5">
                  <Leaf className="w-4 h-4 text-[#6ac6ac]" />
                  Fresh Ingredients
                </h4>
                <div className="flex flex-wrap gap-2">
                  {salad.ingredients.map((ing, idx) => (
                    <span
                      key={idx}
                      className="px-3 py-1 rounded-xl bg-gray-100 text-gray-800 text-xs font-medium"
                    >
                      {ing}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Handcrafted Dressing */}
            {salad.gravy && salad.gravy.length > 0 && (
              <div>
                <h4 className="font-montserrat font-bold text-sm uppercase tracking-wider text-[#20493c] mb-2">
                  100% Handmade Dressing &amp; Seasoning
                </h4>
                <p className="text-xs sm:text-sm text-gray-700 bg-[#f8faf9] p-3.5 rounded-xl border border-gray-100 leading-relaxed">
                  {salad.gravy.join(', ')}
                </p>
              </div>
            )}

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
