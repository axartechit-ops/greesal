import React, { useState, useEffect } from 'react';
import { 
  Save, 
  FileText, 
  Sparkles, 
  Phone, 
  MapPin, 
  Clock, 
  Truck, 
  Award, 
  Utensils, 
  Layers, 
  Loader2, 
  RotateCcw,
  ChevronDown,
  ChevronUp,
  Leaf,
  ShieldCheck,
  UploadCloud,
  ImageIcon,
  Trash2
} from 'lucide-react';
import { SiteSettings, DEFAULT_SITE_SETTINGS } from '@/lib/siteSettings';

interface AdminSiteTextsTabProps {
  settings: SiteSettings;
  onSaveSettings: (updatedSettings: Partial<SiteSettings>) => Promise<void>;
  isSaving: boolean;
}

export const AdminSiteTextsTab: React.FC<AdminSiteTextsTabProps> = ({
  settings,
  onSaveSettings,
  isSaving,
}) => {
  const [formData, setFormData] = useState<SiteSettings>({
    ...DEFAULT_SITE_SETTINGS,
    ...settings,
  });

  useEffect(() => {
    if (settings) {
      setFormData((prev) => ({
        ...DEFAULT_SITE_SETTINGS,
        ...settings,
      }));
    }
  }, [settings]);

  const [activeSection, setActiveSection] = useState<
    'sticky' | 'hero' | 'difference' | 'stats' | 'services' | 'contact'
  >('hero');

  const handleChange = (key: keyof SiteSettings, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleDifferenceCardChange = (idx: number, field: string, value: string) => {
    const updatedCards = [...formData.differenceCards];
    updatedCards[idx] = {
      ...updatedCards[idx],
      [field]: value,
    };
    setFormData((prev) => ({
      ...prev,
      differenceCards: updatedCards,
    }));
  };

  const handleServiceCardChange = (idx: number, field: string, value: string) => {
    const updatedCards = [...formData.servicesCards];
    updatedCards[idx] = {
      ...updatedCards[idx],
      [field]: value,
    };
    setFormData((prev) => ({
      ...prev,
      servicesCards: updatedCards,
    }));
  };

  const handleResetSection = (section: string) => {
    if (confirm(`Reset ${section} text back to defaults?`)) {
      setFormData((prev) => ({
        ...prev,
        ...DEFAULT_SITE_SETTINGS,
      }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveSettings(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 text-left">
      {/* Header Banner */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-greesal-beige/60 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#123B2B]/10 text-[#123B2B] text-xs font-bold uppercase tracking-wider mb-2 border border-[#123B2B]/20">
            <FileText className="w-3.5 h-3.5" />
            <span>Website Copywriting &amp; Content Management</span>
          </div>
          <h2 className="text-2xl font-black text-[#123B2B] tracking-tight">
            Manage All Site Texts
          </h2>
          <p className="text-xs text-gray-500 font-medium mt-1">
            Customize slogans, hero story, value propositions, stats counters, services, and cloud kitchen details.
          </p>
        </div>

        <button
          type="submit"
          disabled={isSaving}
          className="px-8 py-3.5 rounded-2xl bg-[#123B2B] hover:bg-[#1C4D3A] text-white font-black text-sm flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transition-all disabled:opacity-80"
        >
          {isSaving ? (
            <Loader2 className="w-4 h-4 animate-spin text-[#fbce45]" />
          ) : (
            <Save className="w-4 h-4 text-[#fbce45]" />
          )}
          <span>Save All Site Texts</span>
        </button>
      </div>

      {/* Navigation Pills between content blocks */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 no-scrollbar">
        {[
          { id: 'sticky', label: 'Sticky Top Bar', icon: Sparkles },
          { id: 'hero', label: 'Hero Slogan & Story', icon: Utensils },
          { id: 'difference', label: 'What Makes Difference', icon: Layers },
          { id: 'stats', label: 'Stats Counters', icon: Award },
          { id: 'services', label: 'Our Services', icon: Truck },
          { id: 'contact', label: 'Contact & Kitchen', icon: Phone },
        ].map((sec) => {
          const Icon = sec.icon;
          const active = activeSection === sec.id;
          return (
            <button
              key={sec.id}
              type="button"
              onClick={() => setActiveSection(sec.id as any)}
              className={`px-4 py-2.5 rounded-2xl font-bold text-xs sm:text-sm whitespace-nowrap transition-all flex items-center gap-2 border ${
                active
                  ? 'bg-[#123B2B] text-white border-[#123B2B] shadow-sm'
                  : 'bg-white hover:bg-gray-50 text-gray-700 border-gray-200'
              }`}
            >
              <Icon className={`w-3.5 h-3.5 ${active ? 'text-[#fbce45]' : 'text-gray-400'}`} />
              <span>{sec.label}</span>
            </button>
          );
        })}
      </div>

      {/* SECTION 1: STICKY TOP BAR */}
      {activeSection === 'sticky' && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-gray-200 space-y-5 animate-fadeIn">
          <div className="border-b border-gray-100 pb-3">
            <h3 className="text-base font-extrabold text-[#123B2B]">1. Sticky Top Bar</h3>
            <p className="text-xs text-gray-500">The yellow announcement bar fixed at the very top of the website.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-1 sm:col-span-1">
              <label className="text-xs font-bold text-gray-700 block">Offer Tag</label>
              <input
                type="text"
                value={formData.stickyBarOffer}
                onChange={(e) => handleChange('stickyBarOffer', e.target.value)}
                placeholder="Special Offer"
                className="w-full px-3 py-2 rounded-xl border border-gray-300 text-xs font-bold"
              />
            </div>

            <div className="space-y-1 sm:col-span-2">
              <label className="text-xs font-bold text-gray-700 block">Button Text</label>
              <input
                type="text"
                value={formData.stickyBarBtnText}
                onChange={(e) => handleChange('stickyBarBtnText', e.target.value)}
                placeholder="Subscribe Now"
                className="w-full px-3 py-2 rounded-xl border border-gray-300 text-xs font-bold"
              />
            </div>

            <div className="space-y-1 sm:col-span-3">
              <label className="text-xs font-bold text-gray-700 block">Main Announcement Line</label>
              <input
                type="text"
                value={formData.stickyBarText}
                onChange={(e) => handleChange('stickyBarText', e.target.value)}
                placeholder="Weekly Salad At ₹200/- | Monthly Salad At ₹175/- • Free Daily Delivery in Surat"
                className="w-full px-3 py-2 rounded-xl border border-gray-300 text-xs font-medium"
              />
            </div>
          </div>
        </div>
      )}

      {/* SECTION 2: HERO & STORY */}
      {activeSection === 'hero' && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-gray-200 space-y-6 animate-fadeIn">
          <div className="border-b border-gray-100 pb-3">
            <h3 className="text-base font-extrabold text-[#123B2B]">2. Hero Catchphrase &amp; Greesal Story</h3>
            <p className="text-xs text-gray-500">Edit the primary headline, story text, and badge pills on the hero bowl.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-700 block">Hero Badge Text</label>
              <input
                type="text"
                value={formData.heroBadge}
                onChange={(e) => handleChange('heroBadge', e.target.value)}
                placeholder="#1 Fresh &amp; Organic Salad Brand"
                className="w-full px-3 py-2 rounded-xl border border-gray-300 text-xs font-bold"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-700 block">Main Slogan (Josefin Sans)</label>
              <input
                type="text"
                value={formData.heroSlogan}
                onChange={(e) => handleChange('heroSlogan', e.target.value)}
                placeholder="Farm-Fresh Organic Salad Bowls"
                className="w-full px-3 py-2 rounded-xl border border-gray-300 text-xs font-bold text-[#fbce45] bg-[#123B2B]"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-700 block">Floating Pill 1 (Top Left)</label>
              <input
                type="text"
                value={formData.heroPill1}
                onChange={(e) => handleChange('heroPill1', e.target.value)}
                placeholder="100% Handmade Dressings"
                className="w-full px-3 py-2 rounded-xl border border-gray-300 text-xs font-medium"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-700 block">Floating Pill 2 (Bottom Right)</label>
              <input
                type="text"
                value={formData.heroPill2}
                onChange={(e) => handleChange('heroPill2', e.target.value)}
                placeholder="No Onion • No Garlic"
                className="w-full px-3 py-2 rounded-xl border border-gray-300 text-xs font-medium"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-700 block">Customer Rating Badge Text</label>
              <input
                type="text"
                value={formData.heroStatBadge}
                onChange={(e) => handleChange('heroStatBadge', e.target.value)}
                placeholder="Health Lovers"
                className="w-full px-3 py-2 rounded-xl border border-gray-300 text-xs font-medium"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-700 block">Delivered Count Subtitle</label>
              <input
                type="text"
                value={formData.heroStatDelivered}
                onChange={(e) => handleChange('heroStatDelivered', e.target.value)}
                placeholder="72,600+ Salads Delivered"
                className="w-full px-3 py-2 rounded-xl border border-gray-300 text-xs font-medium"
              />
            </div>
          </div>

          {/* Story Texts */}
          <div className="space-y-3 pt-3 border-t border-gray-100">
            <h4 className="text-xs font-black uppercase text-[#123B2B] tracking-wider">Story Narrative Texts</h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-gray-700 block">Story Heading</label>
                <input
                  type="text"
                  value={formData.heroStoryHeading}
                  onChange={(e) => handleChange('heroStoryHeading', e.target.value)}
                  placeholder="A short story about"
                  className="w-full px-3 py-2 rounded-xl border border-gray-300 text-xs font-medium"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold text-gray-700 block">Brand Name</label>
                <input
                  type="text"
                  value={formData.heroStoryBrand}
                  onChange={(e) => handleChange('heroStoryBrand', e.target.value)}
                  placeholder="GREESAL"
                  className="w-full px-3 py-2 rounded-xl border border-gray-300 text-xs font-bold"
                />
              </div>
            </div>

            {/* Line by Line Story Paragraph Inputs */}
            <div className="space-y-4 pt-2">
              <div className="p-4 rounded-2xl bg-[#F7FAF8] border border-[#6ac6ac]/30 space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-black text-[#123B2B] flex items-center gap-1.5">
                    <Leaf className="w-3.5 h-3.5 text-[#20493c]" />
                    <span>Story Paragraph 1 (Brand Origin &amp; Vision)</span>
                  </label>
                  <span className="text-[10px] text-gray-400 font-semibold">Supports line-by-line formatting</span>
                </div>
                <textarea
                  rows={3}
                  value={formData.heroStoryP1}
                  onChange={(e) => handleChange('heroStoryP1', e.target.value)}
                  placeholder="GREESAL, Farm-Fresh Organic Salad Bowls!..."
                  className="w-full px-3 py-2.5 rounded-xl border border-gray-300 text-xs font-medium bg-white focus:outline-none focus:ring-1 focus:ring-[#123B2B] leading-relaxed"
                />
              </div>

              <div className="p-4 rounded-2xl bg-white border border-gray-200 border-l-4 border-l-[#6ac6ac] space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-gray-700 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-[#6ac6ac]" />
                    <span>Story Paragraph 2 (Freshness &amp; Organic Goodness)</span>
                  </label>
                  <span className="text-[10px] text-gray-400 font-semibold">Line-by-line readable</span>
                </div>
                <textarea
                  rows={3}
                  value={formData.heroStoryP2}
                  onChange={(e) => handleChange('heroStoryP2', e.target.value)}
                  placeholder="GREESAL — Slice of Green, where health meets Freshness..."
                  className="w-full px-3 py-2.5 rounded-xl border border-gray-300 text-xs font-medium bg-white focus:outline-none focus:ring-1 focus:ring-[#123B2B] leading-relaxed"
                />
              </div>

              <div className="p-4 rounded-2xl bg-white border border-gray-200 border-l-4 border-l-[#fbce45] space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-gray-700 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-[#fbce45]" />
                    <span>Story Paragraph 3 (21+ Varieties &amp; Doorstep Delivery)</span>
                  </label>
                  <span className="text-[10px] text-gray-400 font-semibold">Line-by-line readable</span>
                </div>
                <textarea
                  rows={3}
                  value={formData.heroStoryP3}
                  onChange={(e) => handleChange('heroStoryP3', e.target.value)}
                  placeholder="At GREESAL, we bring you 21 varieties of fresh, healthy, and delicious salads..."
                  className="w-full px-3 py-2.5 rounded-xl border border-gray-300 text-xs font-medium bg-white focus:outline-none focus:ring-1 focus:ring-[#123B2B] leading-relaxed"
                />
              </div>

              <div className="p-4 rounded-2xl bg-gradient-to-r from-[#eef8f3] via-[#f7fcf9] to-[#fffdf5] border-2 border-[#6ac6ac]/60 space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-black text-[#123B2B] flex items-center gap-2">
                    <span className="p-1 rounded-md bg-[#20493c] text-[#fbce45]">
                      <ShieldCheck className="w-3.5 h-3.5" />
                    </span>
                    <span>Story Paragraph 4 (Satvik Callout • 100% Satvik Purity Guarantee)</span>
                  </label>
                  <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100/80 px-2 py-0.5 rounded-full">
                    No Onion • No Garlic
                  </span>
                </div>
                <p className="text-[11px] text-gray-500 font-medium">
                  This text appears prominently in a specialized highlight callout box directly on the homepage.
                </p>
                <textarea
                  rows={3}
                  value={formData.heroStoryP4}
                  onChange={(e) => handleChange('heroStoryP4', e.target.value)}
                  placeholder="Our handcrafted salads are made using premium-quality ingredients, without onion and garlic..."
                  className="w-full px-3 py-2.5 rounded-xl border border-[#6ac6ac]/40 text-xs font-medium bg-white focus:outline-none focus:ring-1 focus:ring-[#123B2B] leading-relaxed"
                />
              </div>
            </div>

            {/* Live Line-by-Line Preview Card in Admin */}
            <div className="mt-4 p-4 rounded-2xl bg-gray-50 border border-gray-200 space-y-3">
              <span className="text-[11px] font-black uppercase text-[#123B2B] tracking-wider block">
                👀 Live Line-by-Line Story Formatting Preview:
              </span>

              <div className="space-y-3 text-left">
                {formData.heroStoryP1 && (
                  <div className="bg-gradient-to-br from-[#eef8f3] to-[#f5fbf8] rounded-xl p-3 border border-[#a2dfcb] border-l-4 border-l-[#123B2B]">
                    <span className="text-[10px] font-bold text-[#123B2B] uppercase block mb-1">
                      🌿 Origin &amp; Vision
                    </span>
                    <p className="text-xs font-semibold text-[#123B2B] whitespace-pre-line leading-relaxed">
                      {formData.heroStoryP1}
                    </p>
                  </div>
                )}

                {formData.heroStoryP2 && (
                  <div className="bg-gradient-to-br from-[#f0f9f5] to-[#f7fcf9] rounded-xl p-3 border border-[#a2dfcb] border-l-4 border-l-[#25a87d]">
                    <span className="text-[10px] font-bold text-[#1b5e46] uppercase block mb-1">
                      ✨ 100% Fresh &amp; Organic Goodness
                    </span>
                    <p className="text-xs text-[#123B2B]/95 whitespace-pre-line leading-relaxed font-medium">
                      {formData.heroStoryP2}
                    </p>
                  </div>
                )}

                {formData.heroStoryP3 && (
                  <div className="bg-gradient-to-br from-[#f0f9f5] to-[#f7fcf9] rounded-xl p-3 border border-[#a2dfcb] border-l-4 border-l-[#16805d]">
                    <span className="text-[10px] font-bold text-[#16805d] uppercase block mb-1">
                      🥗 21+ Varieties &amp; Express Delivery
                    </span>
                    <p className="text-xs text-[#123B2B]/95 whitespace-pre-line leading-relaxed font-medium">
                      {formData.heroStoryP3}
                    </p>
                  </div>
                )}

                {formData.heroStoryP4 && (
                  <div className="rounded-xl p-3.5 bg-gradient-to-br from-[#e5f5ed] via-[#edf9f3] to-[#f4fbf7] border-2 border-[#3cae89]">
                    <div className="flex items-center gap-1.5 mb-1.5">
                      <ShieldCheck className="w-3.5 h-3.5 text-[#123B2B]" />
                      <span className="text-[10px] font-black uppercase text-[#123B2B]">
                        100% Satvik Purity Guarantee (No Onion • No Garlic)
                      </span>
                    </div>
                    <p className="text-xs font-medium text-[#123B2B] whitespace-pre-line leading-relaxed bg-white/80 p-2.5 rounded-lg border border-[#a2dfcb]">
                      {formData.heroStoryP4}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SECTION 3: WHAT MAKES DIFFERENCE */}
      {activeSection === 'difference' && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-gray-200 space-y-6 animate-fadeIn">
          <div className="border-b border-gray-100 pb-3">
            <h3 className="text-base font-extrabold text-[#123B2B]">3. What Makes The Difference (4 Pillars)</h3>
            <p className="text-xs text-gray-500">Configure the 4 core trust pillars displayed on the home page.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-1 sm:col-span-1">
              <label className="text-xs font-bold text-gray-700 block">Section Badge</label>
              <input
                type="text"
                value={formData.differenceBadge}
                onChange={(e) => handleChange('differenceBadge', e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-gray-300 text-xs font-bold"
              />
            </div>

            <div className="space-y-1 sm:col-span-2">
              <label className="text-xs font-bold text-gray-700 block">Main Heading</label>
              <input
                type="text"
                value={formData.differenceTitle}
                onChange={(e) => handleChange('differenceTitle', e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-gray-300 text-xs font-bold text-[#123B2B]"
              />
            </div>

            <div className="space-y-1 sm:col-span-3">
              <label className="text-xs font-bold text-gray-700 block">Subtitle</label>
              <input
                type="text"
                value={formData.differenceSubtitle}
                onChange={(e) => handleChange('differenceSubtitle', e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-gray-300 text-xs font-medium"
              />
            </div>
          </div>

          {/* Upload 4 Showcase Images */}
          <div className="pt-4 border-t border-gray-100 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-xs font-black uppercase text-[#123B2B] tracking-wider flex items-center gap-2">
                  <ImageIcon className="w-4 h-4 text-[#20493c]" />
                  <span>Showcase Images (Up to 4 Images)</span>
                </h4>
                <p className="text-[11px] text-gray-500 mt-0.5">
                  Upload or paste image URLs for up to 4 graphic cards. Uploaded images will be displayed in an optimized responsive grid.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Image 1 Upload Box */}
              <div className="p-4 bg-[#fbfdfb] rounded-2xl border border-emerald-200/80 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-[#123B2B] flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-[#123B2B]" />
                    <span>Image 1</span>
                  </span>
                  {formData.differenceImage1 && (
                    <button
                      type="button"
                      onClick={() => handleChange('differenceImage1', '')}
                      className="text-xs text-red-500 hover:text-red-700 font-semibold flex items-center gap-1 cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Remove</span>
                    </button>
                  )}
                </div>

                <div
                  onClick={() => document.getElementById('diff-img1-file')?.click()}
                  className="border-2 border-dashed border-emerald-300/80 hover:border-[#123B2B] bg-white rounded-xl p-4 text-center cursor-pointer transition-all flex flex-col items-center justify-center group"
                >
                  <input
                    id="diff-img1-file"
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        const reader = new FileReader();
                        reader.onload = (ev) => {
                          if (ev.target?.result) handleChange('differenceImage1', ev.target.result as string);
                        };
                        reader.readAsDataURL(e.target.files[0]);
                      }
                    }}
                    className="hidden"
                  />
                  <UploadCloud className="w-6 h-6 text-[#20493c] mb-1 group-hover:scale-110 transition-transform" />
                  <p className="text-xs font-bold text-[#123B2B]">Click to browse Image 1</p>
                  <p className="text-[10px] text-gray-400">PNG, JPG, WEBP</p>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-500 block">Or Image URL:</label>
                  <input
                    type="text"
                    value={formData.differenceImage1 || ''}
                    onChange={(e) => handleChange('differenceImage1', e.target.value)}
                    placeholder="/images/... or https://..."
                    className="w-full px-3 py-1.5 rounded-lg border border-gray-300 text-xs font-medium"
                  />
                </div>

                {formData.differenceImage1 && (
                  <div className="mt-2 p-2 bg-white rounded-xl border border-gray-200">
                    <img
                      src={formData.differenceImage1}
                      alt="Preview 1"
                      className="w-full h-32 object-contain rounded-lg bg-gray-50"
                    />
                  </div>
                )}
              </div>

              {/* Image 2 Upload Box */}
              <div className="p-4 bg-[#fbfdfb] rounded-2xl border border-emerald-200/80 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-[#123B2B] flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-[#25a87d]" />
                    <span>Image 2</span>
                  </span>
                  {formData.differenceImage2 && (
                    <button
                      type="button"
                      onClick={() => handleChange('differenceImage2', '')}
                      className="text-xs text-red-500 hover:text-red-700 font-semibold flex items-center gap-1 cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Remove</span>
                    </button>
                  )}
                </div>

                <div
                  onClick={() => document.getElementById('diff-img2-file')?.click()}
                  className="border-2 border-dashed border-emerald-300/80 hover:border-[#123B2B] bg-white rounded-xl p-4 text-center cursor-pointer transition-all flex flex-col items-center justify-center group"
                >
                  <input
                    id="diff-img2-file"
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        const reader = new FileReader();
                        reader.onload = (ev) => {
                          if (ev.target?.result) handleChange('differenceImage2', ev.target.result as string);
                        };
                        reader.readAsDataURL(e.target.files[0]);
                      }
                    }}
                    className="hidden"
                  />
                  <UploadCloud className="w-6 h-6 text-[#20493c] mb-1 group-hover:scale-110 transition-transform" />
                  <p className="text-xs font-bold text-[#123B2B]">Click to browse Image 2</p>
                  <p className="text-[10px] text-gray-400">PNG, JPG, WEBP</p>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-500 block">Or Image URL:</label>
                  <input
                    type="text"
                    value={formData.differenceImage2 || ''}
                    onChange={(e) => handleChange('differenceImage2', e.target.value)}
                    placeholder="/images/... or https://..."
                    className="w-full px-3 py-1.5 rounded-lg border border-gray-300 text-xs font-medium"
                  />
                </div>

                {formData.differenceImage2 && (
                  <div className="mt-2 p-2 bg-white rounded-xl border border-gray-200">
                    <img
                      src={formData.differenceImage2}
                      alt="Preview 2"
                      className="w-full h-32 object-contain rounded-lg bg-gray-50"
                    />
                  </div>
                )}
              </div>

              {/* Image 3 Upload Box */}
              <div className="p-4 bg-[#fbfdfb] rounded-2xl border border-emerald-200/80 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-[#123B2B] flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-[#16805d]" />
                    <span>Image 3</span>
                  </span>
                  {formData.differenceImage3 && (
                    <button
                      type="button"
                      onClick={() => handleChange('differenceImage3', '')}
                      className="text-xs text-red-500 hover:text-red-700 font-semibold flex items-center gap-1 cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Remove</span>
                    </button>
                  )}
                </div>

                <div
                  onClick={() => document.getElementById('diff-img3-file')?.click()}
                  className="border-2 border-dashed border-emerald-300/80 hover:border-[#123B2B] bg-white rounded-xl p-4 text-center cursor-pointer transition-all flex flex-col items-center justify-center group"
                >
                  <input
                    id="diff-img3-file"
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        const reader = new FileReader();
                        reader.onload = (ev) => {
                          if (ev.target?.result) handleChange('differenceImage3', ev.target.result as string);
                        };
                        reader.readAsDataURL(e.target.files[0]);
                      }
                    }}
                    className="hidden"
                  />
                  <UploadCloud className="w-6 h-6 text-[#20493c] mb-1 group-hover:scale-110 transition-transform" />
                  <p className="text-xs font-bold text-[#123B2B]">Click to browse Image 3</p>
                  <p className="text-[10px] text-gray-400">PNG, JPG, WEBP</p>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-500 block">Or Image URL:</label>
                  <input
                    type="text"
                    value={formData.differenceImage3 || ''}
                    onChange={(e) => handleChange('differenceImage3', e.target.value)}
                    placeholder="/images/... or https://..."
                    className="w-full px-3 py-1.5 rounded-lg border border-gray-300 text-xs font-medium"
                  />
                </div>

                {formData.differenceImage3 && (
                  <div className="mt-2 p-2 bg-white rounded-xl border border-gray-200">
                    <img
                      src={formData.differenceImage3}
                      alt="Preview 3"
                      className="w-full h-32 object-contain rounded-lg bg-gray-50"
                    />
                  </div>
                )}
              </div>

              {/* Image 4 Upload Box */}
              <div className="p-4 bg-[#fbfdfb] rounded-2xl border border-emerald-200/80 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-[#123B2B] flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-[#fbce45]" />
                    <span>Image 4</span>
                  </span>
                  {formData.differenceImage4 && (
                    <button
                      type="button"
                      onClick={() => handleChange('differenceImage4', '')}
                      className="text-xs text-red-500 hover:text-red-700 font-semibold flex items-center gap-1 cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Remove</span>
                    </button>
                  )}
                </div>

                <div
                  onClick={() => document.getElementById('diff-img4-file')?.click()}
                  className="border-2 border-dashed border-emerald-300/80 hover:border-[#123B2B] bg-white rounded-xl p-4 text-center cursor-pointer transition-all flex flex-col items-center justify-center group"
                >
                  <input
                    id="diff-img4-file"
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        const reader = new FileReader();
                        reader.onload = (ev) => {
                          if (ev.target?.result) handleChange('differenceImage4', ev.target.result as string);
                        };
                        reader.readAsDataURL(e.target.files[0]);
                      }
                    }}
                    className="hidden"
                  />
                  <UploadCloud className="w-6 h-6 text-[#20493c] mb-1 group-hover:scale-110 transition-transform" />
                  <p className="text-xs font-bold text-[#123B2B]">Click to browse Image 4</p>
                  <p className="text-[10px] text-gray-400">PNG, JPG, WEBP</p>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-500 block">Or Image URL:</label>
                  <input
                    type="text"
                    value={formData.differenceImage4 || ''}
                    onChange={(e) => handleChange('differenceImage4', e.target.value)}
                    placeholder="/images/... or https://..."
                    className="w-full px-3 py-1.5 rounded-lg border border-gray-300 text-xs font-medium"
                  />
                </div>

                {formData.differenceImage4 && (
                  <div className="mt-2 p-2 bg-white rounded-xl border border-gray-200">
                    <img
                      src={formData.differenceImage4}
                      alt="Preview 4"
                      className="w-full h-32 object-contain rounded-lg bg-gray-50"
                    />
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-3 border-t border-gray-100">
            {formData.differenceCards.map((card, idx) => (
              <div key={card.id || idx} className="p-4 bg-[#fbfdfb] rounded-2xl border border-gray-200 space-y-2">
                <span className="text-[10px] font-black uppercase text-[#20493c]">Pillar #{idx + 1}</span>
                <input
                  type="text"
                  value={card.badge}
                  onChange={(e) => handleDifferenceCardChange(idx, 'badge', e.target.value)}
                  placeholder="Card Badge (e.g. Cold-Pressed & Clean)"
                  className="w-full px-3 py-1.5 rounded-lg border border-gray-300 text-xs font-bold text-[#20493c]"
                />
                <input
                  type="text"
                  value={card.title}
                  onChange={(e) => handleDifferenceCardChange(idx, 'title', e.target.value)}
                  placeholder="Card Title"
                  className="w-full px-3 py-1.5 rounded-lg border border-gray-300 text-xs font-bold"
                />
                <textarea
                  rows={2}
                  value={card.desc}
                  onChange={(e) => handleDifferenceCardChange(idx, 'desc', e.target.value)}
                  placeholder="Card Description"
                  className="w-full px-3 py-1.5 rounded-lg border border-gray-300 text-xs font-medium"
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SECTION 4: STATS COUNTERS */}
      {activeSection === 'stats' && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-gray-200 space-y-6 animate-fadeIn">
          <div className="border-b border-gray-100 pb-3">
            <h3 className="text-base font-extrabold text-[#123B2B]">4. Stats Counters</h3>
            <p className="text-xs text-gray-500">Edit the numbers, labels, and descriptions on the 3 stats cards.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-700 block">Section Title Question</label>
              <input
                type="text"
                value={formData.statsTitle}
                onChange={(e) => handleChange('statsTitle', e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-gray-300 text-xs font-bold"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-700 block">Section Subtitle</label>
              <input
                type="text"
                value={formData.statsSubtitle}
                onChange={(e) => handleChange('statsSubtitle', e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-gray-300 text-xs font-medium"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-3 border-t border-gray-100">
            {/* Stat 1 */}
            <div className="p-4 bg-[#fbfdfb] rounded-2xl border border-gray-200 space-y-2">
              <span className="text-[10px] font-black uppercase text-[#20493c]">Stat 1 (Varieties)</span>
              <input
                type="text"
                value={formData.stat1Num}
                onChange={(e) => handleChange('stat1Num', e.target.value)}
                placeholder="24 +"
                className="w-full px-3 py-1.5 rounded-lg border border-gray-300 text-base font-black text-[#20493c]"
              />
              <input
                type="text"
                value={formData.stat1Label}
                onChange={(e) => handleChange('stat1Label', e.target.value)}
                placeholder="different varieties of salad!"
                className="w-full px-3 py-1.5 rounded-lg border border-gray-300 text-xs font-bold"
              />
              <input
                type="text"
                value={formData.stat1Desc}
                onChange={(e) => handleChange('stat1Desc', e.target.value)}
                placeholder="Rotating fresh weekly menu"
                className="w-full px-3 py-1.5 rounded-lg border border-gray-300 text-xs font-medium"
              />
            </div>

            {/* Stat 2 */}
            <div className="p-4 bg-[#fbfdfb] rounded-2xl border border-gray-200 space-y-2">
              <span className="text-[10px] font-black uppercase text-[#20493c]">Stat 2 (Subscribers)</span>
              <input
                type="text"
                value={formData.stat2Num}
                onChange={(e) => handleChange('stat2Num', e.target.value)}
                placeholder="2.7k +"
                className="w-full px-3 py-1.5 rounded-lg border border-gray-300 text-base font-black text-[#20493c]"
              />
              <input
                type="text"
                value={formData.stat2Label}
                onChange={(e) => handleChange('stat2Label', e.target.value)}
                placeholder="happy subscribers!"
                className="w-full px-3 py-1.5 rounded-lg border border-gray-300 text-xs font-bold"
              />
              <input
                type="text"
                value={formData.stat2Desc}
                onChange={(e) => handleChange('stat2Desc', e.target.value)}
                placeholder="Active fitness & office members"
                className="w-full px-3 py-1.5 rounded-lg border border-gray-300 text-xs font-medium"
              />
            </div>

            {/* Stat 3 */}
            <div className="p-4 bg-[#fbfdfb] rounded-2xl border border-gray-200 space-y-2">
              <span className="text-[10px] font-black uppercase text-[#20493c]">Stat 3 (Delivered)</span>
              <input
                type="text"
                value={formData.stat3Num}
                onChange={(e) => handleChange('stat3Num', e.target.value)}
                placeholder="72.6 K +"
                className="w-full px-3 py-1.5 rounded-lg border border-gray-300 text-base font-black text-[#20493c]"
              />
              <input
                type="text"
                value={formData.stat3Label}
                onChange={(e) => handleChange('stat3Label', e.target.value)}
                placeholder="salad delivered!"
                className="w-full px-3 py-1.5 rounded-lg border border-gray-300 text-xs font-bold"
              />
              <input
                type="text"
                value={formData.stat3Desc}
                onChange={(e) => handleChange('stat3Desc', e.target.value)}
                placeholder="Across Surat doorsteps on time"
                className="w-full px-3 py-1.5 rounded-lg border border-gray-300 text-xs font-medium"
              />
            </div>
          </div>

          {/* Live Preview Box */}
          <div className="mt-4 p-5 rounded-2xl bg-gradient-to-b from-[#6ac6ac]/20 to-white border border-[#6ac6ac]/40 space-y-3">
            <span className="text-[11px] font-black uppercase text-[#123B2B] tracking-wider block">
              👀 Live Home Page Stats Preview:
            </span>
            <div className="text-center mb-2">
              <p className="font-montserrat font-extrabold text-base sm:text-lg text-[#20493c]">
                {formData.statsTitle || 'what are you waiting for, Get your spot now!'}
              </p>
              <p className="text-[11px] text-[#20493c]/80 mt-0.5">
                {formData.statsSubtitle || 'Join thousands of health enthusiasts in Surat enjoying daily fresh clean nutrition'}
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="bg-white rounded-xl p-3 text-center border border-gray-200 shadow-2xs">
                <div className="font-black text-xl text-[#20493c]">{formData.stat1Num}</div>
                <div className="text-xs font-bold text-[#20493c] capitalize">{formData.stat1Label}</div>
                <div className="text-[10px] text-gray-500 mt-0.5">{formData.stat1Desc}</div>
              </div>
              <div className="bg-white rounded-xl p-3 text-center border border-gray-200 shadow-2xs">
                <div className="font-black text-xl text-[#20493c]">{formData.stat2Num}</div>
                <div className="text-xs font-bold text-[#20493c] capitalize">{formData.stat2Label}</div>
                <div className="text-[10px] text-gray-500 mt-0.5">{formData.stat2Desc}</div>
              </div>
              <div className="bg-white rounded-xl p-3 text-center border border-gray-200 shadow-2xs">
                <div className="font-black text-xl text-[#20493c]">{formData.stat3Num}</div>
                <div className="text-xs font-bold text-[#20493c] capitalize">{formData.stat3Label}</div>
                <div className="text-[10px] text-gray-500 mt-0.5">{formData.stat3Desc}</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SECTION 5: OUR SERVICES */}
      {activeSection === 'services' && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-gray-200 space-y-6 animate-fadeIn">
          <div className="border-b border-gray-100 pb-3">
            <h3 className="text-base font-extrabold text-[#123B2B]">5. Our Services Section</h3>
            <p className="text-xs text-gray-500">Edit titles, descriptions, and button texts of the 3 services cards.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-700 block">Section Badge</label>
              <input
                type="text"
                value={formData.servicesBadge}
                onChange={(e) => handleChange('servicesBadge', e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-gray-300 text-xs font-bold"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-700 block">Section Title</label>
              <input
                type="text"
                value={formData.servicesTitle}
                onChange={(e) => handleChange('servicesTitle', e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-gray-300 text-xs font-bold"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-3 border-t border-gray-100">
            {formData.servicesCards.map((srv, idx) => (
              <div key={srv.id || idx} className="p-4 bg-[#fbfdfb] rounded-2xl border border-gray-200 space-y-2">
                <span className="text-[10px] font-black uppercase text-[#20493c]">Service #{idx + 1}</span>
                <input
                  type="text"
                  value={srv.badge}
                  onChange={(e) => handleServiceCardChange(idx, 'badge', e.target.value)}
                  placeholder="Badge"
                  className="w-full px-3 py-1.5 rounded-lg border border-gray-300 text-xs font-bold"
                />
                <input
                  type="text"
                  value={srv.title}
                  onChange={(e) => handleServiceCardChange(idx, 'title', e.target.value)}
                  placeholder="Title"
                  className="w-full px-3 py-1.5 rounded-lg border border-gray-300 text-xs font-bold text-[#20493c]"
                />
                <textarea
                  rows={2}
                  value={srv.desc}
                  onChange={(e) => handleServiceCardChange(idx, 'desc', e.target.value)}
                  placeholder="Description"
                  className="w-full px-3 py-1.5 rounded-lg border border-gray-300 text-xs font-medium"
                />
                <input
                  type="text"
                  value={srv.btnText}
                  onChange={(e) => handleServiceCardChange(idx, 'btnText', e.target.value)}
                  placeholder="Button Text"
                  className="w-full px-3 py-1.5 rounded-lg border border-gray-300 text-xs font-bold"
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SECTION 6: CONTACT & CLOUD KITCHEN INFO */}
      {activeSection === 'contact' && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-gray-200 space-y-6 animate-fadeIn">
          <div className="border-b border-gray-100 pb-3">
            <h3 className="text-base font-extrabold text-[#123B2B]">6. Contact &amp; Cloud Kitchen Information</h3>
            <p className="text-xs text-gray-500">Edit WhatsApp numbers, support email, kitchen address in Surat, and delivery slots.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-700 block">WhatsApp / Phone Number</label>
              <input
                type="text"
                value={formData.contactPhone}
                onChange={(e) => handleChange('contactPhone', e.target.value)}
                placeholder="+91 98251 44321"
                className="w-full px-3 py-2 rounded-xl border border-gray-300 text-xs font-bold text-[#20493c]"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-700 block">Support Email</label>
              <input
                type="email"
                value={formData.contactEmail}
                onChange={(e) => handleChange('contactEmail', e.target.value)}
                placeholder="support@greesal.in"
                className="w-full px-3 py-2 rounded-xl border border-gray-300 text-xs font-bold text-[#20493c]"
              />
            </div>

            <div className="space-y-1 sm:col-span-2">
              <label className="text-xs font-bold text-gray-700 block">Cloud Kitchen Physical Address</label>
              <input
                type="text"
                value={formData.kitchenAddress}
                onChange={(e) => handleChange('kitchenAddress', e.target.value)}
                placeholder="Greesal Gourmet Cloud Kitchen, VIP Road, Vesu, Surat, Gujarat 395007"
                className="w-full px-3 py-2 rounded-xl border border-gray-300 text-xs font-medium"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-700 block">Kitchen Working Hours</label>
              <input
                type="text"
                value={formData.kitchenTiming}
                onChange={(e) => handleChange('kitchenTiming', e.target.value)}
                placeholder="9:00 AM - 8:30 PM (Mon to Sat)"
                className="w-full px-3 py-2 rounded-xl border border-gray-300 text-xs font-medium"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-700 block">Lunch Slot Delivery Timing</label>
              <input
                type="text"
                value={formData.lunchSlot}
                onChange={(e) => handleChange('lunchSlot', e.target.value)}
                placeholder="11:00 AM - 2:00 PM"
                className="w-full px-3 py-2 rounded-xl border border-gray-300 text-xs font-medium"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-700 block">Evening Slot Delivery Timing</label>
              <input
                type="text"
                value={formData.eveningSlot}
                onChange={(e) => handleChange('eveningSlot', e.target.value)}
                placeholder="4:00 PM - 7:00 PM"
                className="w-full px-3 py-2 rounded-xl border border-gray-300 text-xs font-medium"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-700 block">Express Delivery Time</label>
              <input
                type="text"
                value={formData.expressSlot}
                onChange={(e) => handleChange('expressSlot', e.target.value)}
                placeholder="Within 30-45 Mins"
                className="w-full px-3 py-2 rounded-xl border border-gray-300 text-xs font-medium"
              />
            </div>
          </div>
        </div>
      )}

      {/* Floating Action Save Banner at bottom */}
      <div className="bg-white rounded-3xl p-6 shadow-md border border-gray-200 flex flex-col sm:flex-row items-center justify-between gap-4 sticky bottom-4 z-20">
        <div>
          <p className="text-xs font-bold text-gray-800">Unsaved changes will be published live to Greesal customers</p>
          <p className="text-[11px] text-gray-500">All updates sync across web and mobile versions automatically.</p>
        </div>

        <button
          type="submit"
          disabled={isSaving}
          className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-[#123B2B] hover:bg-[#1C4D3A] text-white font-black text-sm flex items-center justify-center gap-2 shadow-lg transition-all disabled:opacity-80"
        >
          {isSaving ? (
            <Loader2 className="w-4 h-4 animate-spin text-[#fbce45]" />
          ) : (
            <Save className="w-4 h-4 text-[#fbce45]" />
          )}
          <span>Save All Site Texts Live</span>
        </button>
      </div>
    </form>
  );
};
