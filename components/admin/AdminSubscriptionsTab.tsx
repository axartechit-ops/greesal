'use client';

import React, { useState } from 'react';
import {
  Calendar,
  Sparkles,
  Plus,
  Trash2,
  Edit3,
  Check,
  RotateCcw,
  Save,
  CheckCircle2,
  Star,
  Eye,
  DollarSign,
  Clock,
  Layers,
  Info,
  ShieldCheck,
  X
} from 'lucide-react';
import { SubscriptionPlan, DEFAULT_SUBSCRIPTION_PLANS, SiteSettings } from '@/lib/siteSettings';

interface AdminSubscriptionsTabProps {
  settings: SiteSettings;
  onSaveSettings: (updated: Partial<SiteSettings>) => Promise<void>;
  isSaving?: boolean;
}

export const AdminSubscriptionsTab: React.FC<AdminSubscriptionsTabProps> = ({
  settings,
  onSaveSettings,
  isSaving = false,
}) => {
  const [plans, setPlans] = useState<SubscriptionPlan[]>(() => {
    if (Array.isArray(settings.subscriptionPlans) && settings.subscriptionPlans.length > 0) {
      return settings.subscriptionPlans;
    }
    return DEFAULT_SUBSCRIPTION_PLANS;
  });

  const [modalBadge, setModalBadge] = useState<string>(
    settings.subscriptionModalBadge || 'Farm-Fresh Organic Salad Bowls'
  );
  const [modalTitle, setModalTitle] = useState<string>(
    settings.subscriptionModalTitle || 'Greesal Subscriptions'
  );
  const [modalSubtitle, setModalSubtitle] = useState<string>(
    settings.subscriptionModalSubtitle ||
      'Daily rotation of 21+ varieties • 100% handmade dressings • Free delivery in Surat'
  );

  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Edit / Create Plan Modal State
  const [editingPlan, setEditingPlan] = useState<SubscriptionPlan | null>(null);
  const [isPlanModalOpen, setIsPlanModalOpen] = useState(false);

  // Form states for the plan modal
  const [formId, setFormId] = useState('');
  const [formName, setFormName] = useState('');
  const [formDuration, setFormDuration] = useState('');
  const [formDaysCount, setFormDaysCount] = useState<number>(6);
  const [formPricePerSalad, setFormPricePerSalad] = useState<number>(200);
  const [formTotalPrice, setFormTotalPrice] = useState<number>(1200);
  const [formSaving, setFormSaving] = useState('');
  const [formBadge, setFormBadge] = useState('');
  const [formDesc, setFormDesc] = useState('');
  const [formIsActive, setFormIsActive] = useState(true);
  const [formIsPopular, setFormIsPopular] = useState(false);

  // Open Plan Modal for Add New
  const handleAddNewPlan = () => {
    const newId = `plan_${Date.now()}`;
    setEditingPlan(null);
    setFormId(newId);
    setFormName('12-Day Fitness Plan');
    setFormDuration('12 Days (2 Weeks)');
    setFormDaysCount(12);
    setFormPricePerSalad(185);
    setFormTotalPrice(2220);
    setFormSaving('Save ₹180 (₹15 OFF per salad)');
    setFormBadge('Special Trial');
    setFormDesc('Wholesome 2-week salad routine with rotating fresh menu.');
    setFormIsActive(true);
    setFormIsPopular(false);
    setIsPlanModalOpen(true);
  };

  // Open Plan Modal for Edit
  const handleEditPlan = (plan: SubscriptionPlan) => {
    setEditingPlan(plan);
    setFormId(plan.id);
    setFormName(plan.name);
    setFormDuration(plan.duration);
    setFormDaysCount(plan.daysCount || 6);
    setFormPricePerSalad(plan.pricePerSalad);
    setFormTotalPrice(plan.totalPrice);
    setFormSaving(plan.saving);
    setFormBadge(plan.badge);
    setFormDesc(plan.description || '');
    setFormIsActive(plan.isActive !== false);
    setFormIsPopular(Boolean(plan.isPopular));
    setIsPlanModalOpen(true);
  };

  // Auto calculate total price when days or rate changes
  const handleDaysChange = (days: number) => {
    setFormDaysCount(days);
    setFormTotalPrice(days * formPricePerSalad);
  };

  const handleRateChange = (rate: number) => {
    setFormPricePerSalad(rate);
    setFormTotalPrice(formDaysCount * rate);
  };

  // Save Plan into list
  const handleSavePlanForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) {
      alert('Plan Name is required');
      return;
    }

    const updatedPlan: SubscriptionPlan = {
      id: formId || `plan_${Date.now()}`,
      name: formName.trim(),
      duration: formDuration.trim() || `${formDaysCount} Days`,
      daysCount: formDaysCount,
      pricePerSalad: formPricePerSalad,
      totalPrice: formTotalPrice,
      saving: formSaving.trim(),
      badge: formBadge.trim(),
      description: formDesc.trim(),
      isActive: formIsActive,
      isPopular: formIsPopular,
    };

    if (editingPlan) {
      setPlans((prev) => prev.map((p) => (p.id === editingPlan.id ? updatedPlan : p)));
    } else {
      setPlans((prev) => [...prev, updatedPlan]);
    }

    setIsPlanModalOpen(false);
  };

  // Delete Plan
  const handleDeletePlan = (id: string, name: string) => {
    if (confirm(`Are you sure you want to delete the plan "${name}"?`)) {
      setPlans((prev) => prev.filter((p) => p.id !== id));
    }
  };

  // Toggle Active
  const handleToggleActive = (id: string) => {
    setPlans((prev) =>
      prev.map((p) => (p.id === id ? { ...p, isActive: !(p.isActive !== false) } : p))
    );
  };

  // Toggle Popular
  const handleTogglePopular = (id: string) => {
    setPlans((prev) =>
      prev.map((p) => (p.id === id ? { ...p, isPopular: !p.isPopular } : p))
    );
  };

  // Reset to Defaults
  const handleResetDefaults = () => {
    if (confirm('Reset all subscription plans and modal texts back to standard Greesal defaults?')) {
      setPlans(DEFAULT_SUBSCRIPTION_PLANS);
      setModalBadge('Farm-Fresh Organic Salad Bowls');
      setModalTitle('Greesal Subscriptions');
      setModalSubtitle(
        'Daily rotation of 21+ varieties • 100% handmade dressings • Free delivery in Surat'
      );
    }
  };

  // Save All Changes to Backend
  const handleSaveAll = async () => {
    try {
      await onSaveSettings({
        subscriptionPlans: plans,
        subscriptionModalBadge: modalBadge.trim(),
        subscriptionModalTitle: modalTitle.trim(),
        subscriptionModalSubtitle: modalSubtitle.trim(),
      });
      setSuccessMessage('Subscription plans & settings saved successfully! Changes are now live.');
      setTimeout(() => setSuccessMessage(null), 5000);
    } catch (err) {
      alert('Failed to save subscription settings. Please try again.');
    }
  };

  return (
    <div className="space-y-8 animate-fadeIn text-left">
      {/* 1. TOP HEADER BANNER */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-greesal-beige/60 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-100 pb-5">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100/80 border border-emerald-300 text-emerald-900 text-xs font-black uppercase tracking-wider mb-2">
              <Calendar className="w-3.5 h-3.5 text-emerald-700" />
              <span>Greesal Subscriptions Studio</span>
            </div>
            <h2 className="text-2xl font-black text-[#123B2B] tracking-tight">
              Subscriptions &amp; Meal Plans Manager
            </h2>
            <p className="text-xs text-gray-500 font-medium mt-1">
              Customise weekly, monthly, and special subscription plans, pricing per salad, discounts, savings badges, and customer modal settings.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto">
            <button
              type="button"
              onClick={handleAddNewPlan}
              className="px-4 py-2.5 rounded-xl bg-[#123B2B] hover:bg-[#1b4d39] text-white text-xs font-bold transition-all shadow-xs cursor-pointer flex items-center gap-2"
            >
              <Plus className="w-4 h-4 text-emerald-300" />
              <span>Add New Plan</span>
            </button>

            <button
              type="button"
              onClick={handleResetDefaults}
              className="px-3.5 py-2.5 rounded-xl bg-[#FAF6F0] hover:bg-[#F3EDE2] text-[#123B2B] border border-[#E2DCD2] text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5"
            >
              <RotateCcw className="w-3.5 h-3.5 text-amber-600" />
              <span>Reset Defaults</span>
            </button>

            <button
              type="button"
              onClick={handleSaveAll}
              disabled={isSaving}
              className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-extrabold transition-all shadow-md cursor-pointer flex items-center gap-2 disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              <span>{isSaving ? 'Saving Changes...' : 'Save All Changes'}</span>
            </button>
          </div>
        </div>

        {/* Success Alert Banner */}
        {successMessage && (
          <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-bold flex items-center gap-2.5 animate-in fade-in slide-in-from-top-2 duration-200">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
            <span>{successMessage}</span>
          </div>
        )}

        {/* 2. CUSTOMER MODAL HEADINGS CONFIGURATION */}
        <div className="p-5 rounded-2xl bg-[#FAF6F0] border border-greesal-beige/80 space-y-4">
          <div className="flex items-center justify-between border-b border-greesal-beige/60 pb-2">
            <h3 className="text-xs font-black uppercase text-[#123B2B] tracking-wider flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-500" />
              <span>Customer Subscription Modal Header Texts</span>
            </h3>
            <span className="text-[11px] text-gray-500 font-medium">Visible on Web &amp; Mobile</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
            <div className="space-y-1">
              <label className="font-bold text-gray-700">Top Yellow Pill Badge</label>
              <input
                type="text"
                value={modalBadge}
                onChange={(e) => setModalBadge(e.target.value)}
                placeholder="Farm-Fresh Organic Salad Bowls"
                className="w-full px-3 py-2 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-emerald-600 font-semibold"
              />
            </div>

            <div className="space-y-1">
              <label className="font-bold text-gray-700">Modal Main Heading</label>
              <input
                type="text"
                value={modalTitle}
                onChange={(e) => setModalTitle(e.target.value)}
                placeholder="Greesal Subscriptions"
                className="w-full px-3 py-2 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-emerald-600 font-extrabold text-[#123B2B]"
              />
            </div>

            <div className="space-y-1">
              <label className="font-bold text-gray-700">Modal Subtitle / Rotation Promise</label>
              <input
                type="text"
                value={modalSubtitle}
                onChange={(e) => setModalSubtitle(e.target.value)}
                placeholder="Daily rotation of 21+ varieties • 100% handmade dressings • Free delivery in Surat"
                className="w-full px-3 py-2 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-emerald-600 font-medium text-gray-600"
              />
            </div>
          </div>
        </div>

        {/* 3. SUBSCRIPTION PLANS LIST & MANAGEMENT */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h3 className="text-base font-black text-[#123B2B]">
                Active Subscription Plans ({plans.filter((p) => p.isActive !== false).length} of {plans.length} Live)
              </h3>
            </div>
            <span className="text-xs text-gray-500 font-medium">
              Customers can choose from any enabled plan in the subscription drawer.
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {plans.map((plan) => {
              const isActive = plan.isActive !== false;
              const isPopular = Boolean(plan.isPopular);

              return (
                <div
                  key={plan.id}
                  className={`p-5 rounded-2xl border-2 transition-all space-y-3 relative flex flex-col justify-between ${
                    isActive
                      ? isPopular
                        ? 'bg-gradient-to-br from-amber-50/50 to-emerald-50/30 border-amber-300 shadow-xs'
                        : 'bg-white border-greesal-beige/90 shadow-2xs'
                      : 'bg-gray-50/70 border-gray-200 opacity-60'
                  }`}
                >
                  {/* Top Badges Row */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-1.5">
                        <span className="text-xs font-black uppercase tracking-wider text-[#123B2B]">
                          {plan.name}
                        </span>
                        {isPopular && (
                          <span className="bg-[#fbce45] text-[#20493c] text-[10px] font-black px-2 py-0.5 rounded-full shadow-2xs flex items-center gap-1">
                            <Star className="w-2.5 h-2.5 fill-current" />
                            <span>Featured</span>
                          </span>
                        )}
                        {!isActive && (
                          <span className="bg-gray-200 text-gray-700 text-[10px] font-bold px-2 py-0.5 rounded-full">
                            Inactive / Hidden
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-gray-500 font-bold">{plan.duration}</p>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => handleTogglePopular(plan.id)}
                        className={`p-1.5 rounded-lg border transition-all cursor-pointer ${
                          isPopular
                            ? 'bg-amber-100 text-amber-900 border-amber-300'
                            : 'bg-gray-100 text-gray-400 border-gray-200 hover:text-amber-600'
                        }`}
                        title={isPopular ? 'Remove Popular Tag' : 'Mark as Most Popular / Featured'}
                      >
                        <Star className={`w-3.5 h-3.5 ${isPopular ? 'fill-amber-500 text-amber-500' : ''}`} />
                      </button>

                      <button
                        type="button"
                        onClick={() => handleToggleActive(plan.id)}
                        className={`px-2 py-1 rounded-lg text-[10px] font-bold border transition-all cursor-pointer ${
                          isActive
                            ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                            : 'bg-red-100 text-red-800 border-red-300'
                        }`}
                        title={isActive ? 'Click to Disable / Hide' : 'Click to Enable / Make Live'}
                      >
                        {isActive ? 'Active' : 'Paused'}
                      </button>
                    </div>
                  </div>

                  {/* Pricing Display */}
                  <div className="p-3 rounded-xl bg-[#FAF6F0] border border-greesal-beige/80 space-y-1">
                    <div className="flex items-baseline justify-between">
                      <div>
                        <span className="text-2xl font-black text-[#123B2B]">₹{plan.pricePerSalad}</span>
                        <span className="text-xs text-gray-500 font-normal"> /salad bowl</span>
                      </div>
                      <div className="text-right">
                        <span className="text-xs font-bold text-gray-500">Total:</span>{' '}
                        <strong className="text-sm font-black text-emerald-800">
                          ₹{plan.totalPrice.toLocaleString('en-IN')}
                        </strong>
                      </div>
                    </div>

                    {plan.saving && (
                      <div className="text-[11px] font-bold text-amber-800 flex items-center gap-1 pt-0.5">
                        <Sparkles className="w-3 h-3 text-amber-600" />
                        <span>{plan.saving}</span>
                      </div>
                    )}
                  </div>

                  {/* Badge & Description */}
                  <div className="text-xs space-y-1">
                    {plan.badge && (
                      <div className="inline-block px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-800 font-bold text-[10px] border border-emerald-200">
                        Pill Tag: {plan.badge}
                      </div>
                    )}
                    {plan.description && (
                      <p className="text-[11px] text-gray-600 font-medium line-clamp-2">
                        {plan.description}
                      </p>
                    )}
                  </div>

                  {/* Card Actions Footer */}
                  <div className="flex items-center justify-between pt-3 border-t border-gray-100 text-xs">
                    <button
                      type="button"
                      onClick={() => handleEditPlan(plan)}
                      className="px-3 py-1.5 rounded-lg bg-[#FAF6F0] hover:bg-[#F3EDE2] text-[#123B2B] font-bold text-xs flex items-center gap-1.5 border border-greesal-beige transition-all cursor-pointer"
                    >
                      <Edit3 className="w-3.5 h-3.5 text-emerald-700" />
                      <span>Edit Plan</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleDeletePlan(plan.id, plan.name)}
                      className="px-2.5 py-1.5 rounded-lg bg-red-50 hover:bg-red-100 text-red-700 font-bold text-xs flex items-center gap-1 transition-all cursor-pointer"
                      title="Delete Plan"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Delete</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* 4. LIVE CUSTOMER SUBSCRIPTION PREVIEW */}
        <div className="p-6 rounded-3xl bg-[#FAF6F0] border border-greesal-beige space-y-4">
          <div className="flex items-center justify-between border-b border-greesal-beige/80 pb-3">
            <div>
              <h3 className="text-sm font-black text-[#123B2B] uppercase tracking-wider flex items-center gap-2">
                <Eye className="w-4 h-4 text-emerald-700" />
                <span>Live Customer Modal Preview</span>
              </h3>
              <p className="text-[11px] text-gray-500 font-medium">
                This is exactly how customers see the subscription plans in the ordering popup.
              </p>
            </div>
            <span className="text-xs font-bold bg-white px-2.5 py-1 rounded-full border border-greesal-beige text-gray-600">
              Interactive Preview
            </span>
          </div>

          <div className="bg-white p-5 sm:p-6 rounded-2xl border border-gray-200 space-y-4 max-w-xl mx-auto shadow-sm">
            {/* Modal Header */}
            <div>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#fbce45] text-[#20493c] text-xs font-bold uppercase tracking-wider mb-2">
                <Sparkles className="w-3.5 h-3.5" /> {modalBadge}
              </span>
              <h3 className="font-montserrat font-extrabold text-2xl text-[#20493c]">
                {modalTitle}
              </h3>
              <p className="text-xs text-[#20493c]/80 mt-1 font-medium">{modalSubtitle}</p>
            </div>

            {/* Plan Selector Buttons Preview */}
            <div className={`grid gap-3 ${plans.filter((p) => p.isActive !== false).length === 1 ? 'grid-cols-1' : 'grid-cols-1 sm:grid-cols-2'}`}>
              {plans
                .filter((p) => p.isActive !== false)
                .map((plan, idx) => (
                  <div
                    key={plan.id}
                    className={`p-4 rounded-2xl border-2 text-left relative transition-all ${
                      idx === 0
                        ? 'border-[#20493c] bg-[#e8f7f2] shadow-sm'
                        : 'border-gray-200 bg-white'
                    }`}
                  >
                    {(plan.badge || plan.saving) && (
                      <span className="absolute -top-2.5 right-3 bg-[#fbce45] text-[#20493c] text-[10px] font-black px-2 py-0.5 rounded-full shadow-sm">
                        {plan.badge || plan.saving}
                      </span>
                    )}
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-bold text-[#20493c] uppercase">{plan.name}</span>
                      {idx === 0 && <Check className="w-4 h-4 text-[#20493c]" />}
                    </div>
                    <div className="font-montserrat font-black text-2xl text-[#20493c]">
                      ₹{plan.pricePerSalad}
                      <span className="text-xs font-normal text-[#20493c]/70">/salad</span>
                    </div>
                    <p className="text-xs text-[#20493c]/80 font-medium mt-1">
                      {plan.duration} • Total ₹{plan.totalPrice.toLocaleString('en-IN')}
                    </p>
                  </div>
                ))}
            </div>
          </div>
        </div>
      </div>

      {/* 5. ADD / EDIT PLAN MODAL DIALOG */}
      {isPlanModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-gray-200 text-left animate-in zoom-in-95 duration-200 my-auto">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3 mb-4">
              <h3 className="text-lg font-black text-[#123B2B] flex items-center gap-2">
                <Calendar className="w-5 h-5 text-emerald-600" />
                <span>{editingPlan ? 'Edit Subscription Plan' : 'Create New Subscription Plan'}</span>
              </h3>
              <button
                type="button"
                onClick={() => setIsPlanModalOpen(false)}
                className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600 flex items-center justify-center transition-all cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSavePlanForm} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-gray-700">Plan Name *</label>
                  <input
                    type="text"
                    required
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    placeholder="e.g. Monthly Salad Plan"
                    className="w-full px-3 py-2 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-emerald-600 font-bold"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-gray-700">Duration Label *</label>
                  <input
                    type="text"
                    required
                    value={formDuration}
                    onChange={(e) => setFormDuration(e.target.value)}
                    placeholder="e.g. 24 Days (4 Weeks)"
                    className="w-full px-3 py-2 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-emerald-600 font-semibold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-gray-700">Number of Days / Bowls</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={formDaysCount}
                    onChange={(e) => handleDaysChange(Number(e.target.value) || 1)}
                    className="w-full px-3 py-2 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-emerald-600 font-bold"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-gray-700">Rate per Salad (₹) *</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={formPricePerSalad}
                    onChange={(e) => handleRateChange(Number(e.target.value) || 1)}
                    className="w-full px-3 py-2 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-emerald-600 font-bold text-emerald-800"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-gray-700">Total Price (₹) *</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={formTotalPrice}
                    onChange={(e) => setFormTotalPrice(Number(e.target.value) || 0)}
                    className="w-full px-3 py-2 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-emerald-600 font-black text-[#123B2B]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-gray-700">Customer Saving Note</label>
                  <input
                    type="text"
                    value={formSaving}
                    onChange={(e) => setFormSaving(e.target.value)}
                    placeholder="e.g. Save ₹600 (₹25 OFF per salad)"
                    className="w-full px-3 py-2 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-emerald-600 font-medium"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-gray-700">Badge / Top Pill Tag</label>
                  <input
                    type="text"
                    value={formBadge}
                    onChange={(e) => setFormBadge(e.target.value)}
                    placeholder="e.g. Best Value • Most Popular"
                    className="w-full px-3 py-2 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-emerald-600 font-medium"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-gray-700">Plan Description / Inclusions</label>
                <textarea
                  rows={2}
                  value={formDesc}
                  onChange={(e) => setFormDesc(e.target.value)}
                  placeholder="Daily rotation of fresh salads delivered right to your office or home."
                  className="w-full px-3 py-2 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-emerald-600 font-medium"
                />
              </div>

              <div className="p-3 rounded-xl bg-gray-50 border border-gray-200 flex flex-wrap items-center justify-between gap-3">
                <label className="flex items-center gap-2 cursor-pointer font-bold text-gray-800">
                  <input
                    type="checkbox"
                    checked={formIsActive}
                    onChange={(e) => setFormIsActive(e.target.checked)}
                    className="w-4 h-4 rounded text-emerald-600"
                  />
                  <span>Active &amp; Visible to Customers</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer font-bold text-amber-900">
                  <input
                    type="checkbox"
                    checked={formIsPopular}
                    onChange={(e) => setFormIsPopular(e.target.checked)}
                    className="w-4 h-4 rounded text-amber-500"
                  />
                  <span>Highlight as Featured / Popular ⭐</span>
                </label>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setIsPlanModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#123B2B] hover:bg-[#1b4d39] text-white font-extrabold transition-all shadow-md cursor-pointer flex items-center gap-1.5"
                >
                  <Check className="w-4 h-4" />
                  <span>{editingPlan ? 'Update Plan' : 'Add Plan'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

