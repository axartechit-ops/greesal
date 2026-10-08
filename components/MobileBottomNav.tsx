'use client';

import React from 'react';
import { Home, Utensils, Heart, ShoppingBag, User, ChevronRight } from 'lucide-react';

interface MobileBottomNavProps {
  activeTab: 'home' | 'menu' | 'favorites' | 'profile';
  cartCount: number;
  cartTotal: number;
  favoritesCount: number;
  onSelectTab: (tab: 'home' | 'menu' | 'favorites' | 'profile') => void;
  onOpenCart: () => void;
}

export function MobileBottomNav({
  activeTab,
  cartCount,
  cartTotal,
  favoritesCount,
  onSelectTab,
  onOpenCart,
}: MobileBottomNavProps) {
  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 md:hidden pointer-events-none">
      <div className="max-w-md mx-auto px-3 pb-2 pt-1 pointer-events-auto">
        
        {/* Floating Cart Banner (Swiggy / Zomato style) */}
        {cartCount > 0 && (
          <div
            onClick={onOpenCart}
            className="mb-2 bg-gradient-to-r from-[#123B2B] via-[#1A4D3A] to-[#123B2B] text-white px-4 py-2.5 rounded-2xl shadow-xl border border-[#C89D4B]/40 flex items-center justify-between cursor-pointer transform active:scale-[0.98] transition-all animate-in slide-in-from-bottom-3 duration-300"
          >
            <div className="flex items-center gap-3">
              <div className="relative w-8 h-8 rounded-xl bg-[#C89D4B] text-[#123B2B] flex items-center justify-center font-black shadow-md">
                <ShoppingBag className="w-4 h-4 text-[#123B2B]" />
                <span className="absolute -top-1.5 -right-1.5 bg-[#DC2626] text-white text-[10px] font-black w-4 h-4 rounded-full flex items-center justify-center border border-white">
                  {cartCount}
                </span>
              </div>
              <div>
                <div className="text-xs font-black tracking-tight flex items-center gap-1.5">
                  <span>{cartCount} {cartCount === 1 ? 'Item' : 'Items'} Added</span>
                  <span className="text-[#C89D4B]">•</span>
                  <span className="text-emerald-300 font-extrabold">₹{cartTotal}</span>
                </div>
                <div className="text-[10px] text-emerald-200/80 font-medium">
                  Tap to review &amp; place order
                </div>
              </div>
            </div>

            <div className="flex items-center gap-1 text-xs font-bold text-[#E8C782] bg-white/10 px-2.5 py-1 rounded-xl">
              <span>View Cart</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </div>
          </div>
        )}

        {/* Bottom App Navigation Bar */}
        <nav className="bg-white/95 backdrop-blur-md rounded-2xl shadow-[0_-4px_20px_rgba(0,0,0,0.08)] border border-[#E8E1D5]/80 px-2 py-1.5 flex items-center justify-around">
          
          {/* Home Tab */}
          <button
            type="button"
            onClick={() => onSelectTab('home')}
            className={`flex flex-col items-center justify-center py-1 px-3 rounded-xl transition-all duration-200 relative ${
              activeTab === 'home'
                ? 'text-[#123B2B] font-extrabold'
                : 'text-gray-400 hover:text-gray-600 font-medium'
            }`}
          >
            <div className={`p-1 rounded-xl transition-all ${activeTab === 'home' ? 'bg-[#E8F3EE] text-[#123B2B]' : ''}`}>
              <Home className="w-5 h-5" />
            </div>
            <span className="text-[10px] mt-0.5 tracking-tight">Home</span>
            {activeTab === 'home' && (
              <span className="absolute -bottom-1 w-1.5 h-1.5 bg-[#123B2B] rounded-full" />
            )}
          </button>

          {/* Menu / Bowls Tab */}
          <button
            type="button"
            onClick={() => onSelectTab('menu')}
            className={`flex flex-col items-center justify-center py-1 px-3 rounded-xl transition-all duration-200 relative ${
              activeTab === 'menu'
                ? 'text-[#123B2B] font-extrabold'
                : 'text-gray-400 hover:text-gray-600 font-medium'
            }`}
          >
            <div className={`p-1 rounded-xl transition-all ${activeTab === 'menu' ? 'bg-[#E8F3EE] text-[#123B2B]' : ''}`}>
              <Utensils className="w-5 h-5" />
            </div>
            <span className="text-[10px] mt-0.5 tracking-tight">Bowls</span>
            {activeTab === 'menu' && (
              <span className="absolute -bottom-1 w-1.5 h-1.5 bg-[#123B2B] rounded-full" />
            )}
          </button>

          {/* Favorites Tab */}
          <button
            type="button"
            onClick={() => onSelectTab('favorites')}
            className={`flex flex-col items-center justify-center py-1 px-3 rounded-xl transition-all duration-200 relative ${
              activeTab === 'favorites'
                ? 'text-[#DC2626] font-extrabold'
                : 'text-gray-400 hover:text-gray-600 font-medium'
            }`}
          >
            <div className={`p-1 rounded-xl relative transition-all ${activeTab === 'favorites' ? 'bg-red-50 text-[#DC2626]' : ''}`}>
              <Heart className={`w-5 h-5 ${activeTab === 'favorites' ? 'fill-[#DC2626]' : ''}`} />
              {favoritesCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-[#DC2626] text-white text-[9px] font-black w-3.5 h-3.5 rounded-full flex items-center justify-center">
                  {favoritesCount}
                </span>
              )}
            </div>
            <span className="text-[10px] mt-0.5 tracking-tight">Saved</span>
            {activeTab === 'favorites' && (
              <span className="absolute -bottom-1 w-1.5 h-1.5 bg-[#DC2626] rounded-full" />
            )}
          </button>

          {/* Cart Tab */}
          <button
            type="button"
            onClick={onOpenCart}
            className="flex flex-col items-center justify-center py-1 px-3 rounded-xl transition-all duration-200 relative text-gray-500 hover:text-gray-700 font-medium"
          >
            <div className="p-1 rounded-xl relative">
              <ShoppingBag className="w-5 h-5 text-[#C89D4B]" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-[#123B2B] text-[#C89D4B] text-[9px] font-black w-4 h-4 rounded-full flex items-center justify-center border border-white">
                  {cartCount}
                </span>
              )}
            </div>
            <span className="text-[10px] mt-0.5 tracking-tight text-[#123B2B] font-bold">Cart</span>
          </button>

          {/* Profile / Account Tab */}
          <button
            type="button"
            onClick={() => onSelectTab('profile')}
            className={`flex flex-col items-center justify-center py-1 px-3 rounded-xl transition-all duration-200 relative ${
              activeTab === 'profile'
                ? 'text-[#123B2B] font-extrabold'
                : 'text-gray-400 hover:text-gray-600 font-medium'
            }`}
          >
            <div className={`p-1 rounded-xl transition-all ${activeTab === 'profile' ? 'bg-[#E8F3EE] text-[#123B2B]' : ''}`}>
              <User className="w-5 h-5" />
            </div>
            <span className="text-[10px] mt-0.5 tracking-tight">Profile</span>
            {activeTab === 'profile' && (
              <span className="absolute -bottom-1 w-1.5 h-1.5 bg-[#123B2B] rounded-full" />
            )}
          </button>

        </nav>
      </div>
    </div>
  );
}
