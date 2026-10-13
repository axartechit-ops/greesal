'use client';

import React, { useState, useMemo } from 'react';
import { Salad } from '@/lib/salads';
import { SiteSettings } from '@/lib/siteSettings';
import { 
  Sparkles, 
  Check, 
  Search, 
  Save, 
  Loader2, 
  Eye, 
  Sliders, 
  CheckCircle2, 
  X,
  Flame,
  ShieldCheck,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

interface AdminSliderTabProps {
  settings: SiteSettings;
  salads: Salad[];
  onSave: (updatedSettings: Partial<SiteSettings>) => Promise<void>;
  isSaving: boolean;
}

export const AdminSliderTab: React.FC<AdminSliderTabProps> = ({
  settings,
  salads,
  onSave,
  isSaving,
}) => {
  const [showSlider, setShowSlider] = useState<boolean>(settings.showTopSlider ?? true);
  const [title, setTitle] = useState<string>(settings.topSliderTitle || "Chef's Handcrafted Picks");
  const [subtitle, setSubtitle] = useState<string>(
    settings.topSliderSubtitle || "Fresh daily organic bowls prepared fresh & delivered in 30 mins"
  );
  const [badge, setBadge] = useState<string>(settings.topSliderBadge || "TRENDING BOWLS");

  // Selected Salad IDs or names
  const [selectedIds, setSelectedIds] = useState<string[]>(() => {
    if (Array.isArray(settings.topSliderSaladIds) && settings.topSliderSaladIds.length > 0) {
      return settings.topSliderSaladIds;
    }
    // Default to first 5 salads if none specified
    return salads.slice(0, 5).map((s) => s._id || s.id || s.slug || s.name);
  });

  const [searchQuery, setSearchQuery] = useState('');
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Filter salads by search query
  const filteredSalads = useMemo(() => {
    if (!searchQuery.trim()) return salads;
    const q = searchQuery.toLowerCase();
    return salads.filter(
      (s) =>
        s.name.toLowerCase().includes(q) ||
        (s.tag && s.tag.toLowerCase().includes(q)) ||
        (s.calories && s.calories.toLowerCase().includes(q))
    );
  }, [salads, searchQuery]);

  const toggleSalad = (salad: Salad) => {
    const key = salad._id || salad.id || salad.slug || salad.name;
    setSelectedIds((prev) => {
      const exists = prev.some((id) => id === key || id === salad._id || id === salad.id || id === salad.name);
      if (exists) {
        return prev.filter((id) => id !== key && id !== salad._id && id !== salad.id && id !== salad.name);
      } else {
        return [...prev, key];
      }
    });
  };

  const isSaladSelected = (salad: Salad) => {
    const key = salad._id || salad.id || salad.slug || salad.name;
    return selectedIds.some(
      (id) => id === key || id === salad._id || id === salad.id || id === salad.slug || id === salad.name
    );
  };

  const handleSelectAll = () => {
    const allKeys = salads.map((s) => s._id || s.id || s.slug || s.name);
    setSelectedIds(allKeys);
  };

  const handleClearAll = () => {
    setSelectedIds([]);
  };

  const handleSave = async () => {
    await onSave({
      showTopSlider: showSlider,
      topSliderTitle: title.trim(),
      topSliderSubtitle: subtitle.trim(),
      topSliderBadge: badge.trim(),
      topSliderSaladIds: selectedIds,
    });
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  // Salads that are currently selected for preview
  const previewSalads = useMemo(() => {
    return salads.filter((s) => isSaladSelected(s));
  }, [salads, selectedIds]);

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      
      {/* Top Banner Info */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#56aa52]/15 text-[#20493c] text-xs font-bold uppercase tracking-wider mb-2 border border-[#56aa52]/30">
            <Sliders className="w-3.5 h-3.5 text-[#56aa52]" />
            <span>Top Header Slider Controls</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-[#123B2B] tracking-tight">
            Home Top Slider Items
          </h2>
          <p className="text-xs sm:text-sm text-gray-500 font-medium mt-1">
            Highlight trending salad bowls directly beneath the navbar and before the main hero banner.
          </p>
        </div>

        <button
          type="button"
          onClick={handleSave}
          disabled={isSaving}
          className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-2xl bg-[#123B2B] hover:bg-[#1a523c] text-white font-bold text-sm shadow-md transition-all active:scale-95 cursor-pointer disabled:opacity-50 shrink-0"
        >
          {isSaving ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : saveSuccess ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          ) : (
            <Save className="w-4 h-4 text-[#fbce45]" />
          )}
          <span>{isSaving ? 'Saving...' : saveSuccess ? 'Saved Live!' : 'Save Slider Items'}</span>
        </button>
      </div>

      {/* Main Settings Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-200 shadow-sm space-y-6">
        
        {/* Toggle Switch */}
        <div className="flex items-center justify-between pb-6 border-b border-gray-100">
          <div>
            <h3 className="font-bold text-base text-[#1a1a1a]">
              Display Top Slider on Home Page
            </h3>
            <p className="text-xs text-gray-500 font-medium mt-0.5">
              Turn off anytime to temporarily hide the slider from customer view.
            </p>
          </div>

          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={showSlider}
              onChange={(e) => setShowSlider(e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-14 h-7 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-[#56aa52]" />
          </label>
        </div>

        {/* Text Customization Fields */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
              Top Badge Text
            </label>
            <input
              type="text"
              value={badge}
              onChange={(e) => setBadge(e.target.value)}
              placeholder="e.g. TRENDING BOWLS"
              className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#56aa52] text-sm font-medium"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
              Slider Section Title
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Chef's Handcrafted Picks"
              className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#56aa52] text-sm font-medium"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
              Slider Subtitle
            </label>
            <input
              type="text"
              value={subtitle}
              onChange={(e) => setSubtitle(e.target.value)}
              placeholder="e.g. Fresh daily organic bowls..."
              className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#56aa52] text-sm font-medium"
            />
          </div>
        </div>
      </div>

      {/* Item Picker Grid */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-200 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="font-bold text-lg text-[#123B2B] flex items-center gap-2">
              <span>Select Salads to Include</span>
              <span className="px-2.5 py-0.5 rounded-full bg-[#56aa52]/15 text-[#20493c] text-xs font-black">
                {selectedIds.length} Selected
              </span>
            </h3>
            <p className="text-xs text-gray-500 font-medium mt-0.5">
              Click any salad card to add or remove it from the top home slider.
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              type="button"
              onClick={handleSelectAll}
              className="px-3 py-1.5 rounded-xl text-xs font-bold bg-gray-100 hover:bg-gray-200 text-gray-700 transition-colors cursor-pointer"
            >
              Select All ({salads.length})
            </button>
            <button
              type="button"
              onClick={handleClearAll}
              className="px-3 py-1.5 rounded-xl text-xs font-bold bg-gray-100 hover:bg-red-50 hover:text-red-600 text-gray-700 transition-colors cursor-pointer"
            >
              Clear All
            </button>
          </div>
        </div>

        {/* Search bar */}
        <div className="relative">
          <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search salads by name, protein, or category tag..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#56aa52]"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Salads Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3.5">
          {filteredSalads.map((salad) => {
            const isSelected = isSaladSelected(salad);

            return (
              <div
                key={salad._id || salad.id || salad.name}
                onClick={() => toggleSalad(salad)}
                className={`p-3 rounded-2xl border-2 transition-all cursor-pointer flex items-center gap-3 select-none ${
                  isSelected
                    ? 'border-[#56aa52] bg-[#f2f8f5] shadow-xs'
                    : 'border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50/50'
                }`}
              >
                {/* Thumbnail */}
                <div className="relative w-14 h-14 rounded-xl overflow-hidden bg-gray-100 shrink-0">
                  <img
                    src={salad.image || 'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=300&q=80'}
                    alt={salad.name}
                    className="w-full h-full object-cover"
                  />
                  {isSelected && (
                    <div className="absolute inset-0 bg-[#56aa52]/75 flex items-center justify-center text-white">
                      <Check className="w-5 h-5 stroke-[3]" />
                    </div>
                  )}
                </div>

                {/* Details */}
                <div className="flex-1 min-w-0">
                  <h4 className="font-bold text-xs sm:text-sm text-[#1a1a1a] truncate">
                    {salad.name}
                  </h4>
                  <div className="flex items-center gap-1.5 mt-0.5 text-[11px] text-gray-500">
                    <span className="font-extrabold text-[#20493c]">{salad.price}</span>
                    <span>•</span>
                    <span className="truncate">{salad.tag || 'Salad'}</span>
                  </div>
                  <span
                    className={`inline-block mt-1 text-[10px] font-bold px-1.5 py-0.5 rounded ${
                      isSelected ? 'bg-[#56aa52] text-white' : 'bg-gray-100 text-gray-500'
                    }`}
                  >
                    {isSelected ? '✓ In Top Slider' : '+ Add to Slider'}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Live Preview Box */}
      {previewSalads.length > 0 && (
        <div className="bg-[#FAF6F0] rounded-3xl p-6 sm:p-8 border border-[#EBE2D3] shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-black text-sm uppercase tracking-wider text-[#123B2B] flex items-center gap-2">
              <Eye className="w-4 h-4 text-[#56aa52]" />
              <span>Live Home Preview ({previewSalads.length} Items)</span>
            </h3>
            <span className="text-xs font-semibold text-gray-500">
              This is how customer sees it under the menu bar
            </span>
          </div>

          <div className="flex gap-3 overflow-x-auto pb-2 no-scrollbar pt-1">
            {previewSalads.map((salad) => (
              <div
                key={salad._id || salad.id || salad.name}
                className="w-48 shrink-0 bg-white rounded-xl border border-emerald-100 p-2.5 shadow-xs flex flex-col justify-between"
              >
                <div className="h-24 rounded-lg overflow-hidden bg-gray-100 mb-2">
                  <img
                    src={salad.image}
                    alt={salad.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <h5 className="font-bold text-xs text-gray-900 truncate">{salad.name}</h5>
                <div className="flex items-center justify-between mt-1 text-xs">
                  <span className="font-black text-[#20493c]">{salad.price}</span>
                  <span className="text-[10px] text-gray-500">{salad.protein || 'High Protein'}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Save Button Bar */}
      <div className="flex justify-end pt-2">
        <button
          type="button"
          onClick={handleSave}
          disabled={isSaving}
          className="inline-flex items-center gap-2 px-8 py-3.5 rounded-2xl bg-[#123B2B] hover:bg-[#1a523c] text-white font-bold text-sm shadow-lg transition-all active:scale-95 cursor-pointer disabled:opacity-50"
        >
          {isSaving ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Save className="w-4 h-4 text-[#fbce45]" />
          )}
          <span>{isSaving ? 'Saving Changes...' : 'Save & Publish Top Slider'}</span>
        </button>
      </div>

    </div>
  );
};
