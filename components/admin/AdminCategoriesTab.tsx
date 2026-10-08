import React, { useState } from 'react';
import { Plus, Edit2, Trash2, RotateCcw, Save, Filter, Sparkles, Loader2, CheckCircle2 } from 'lucide-react';
import { SiteCategory, DEFAULT_CATEGORIES } from '@/lib/siteSettings';

interface AdminCategoriesTabProps {
  categories: SiteCategory[];
  onSaveCategories: (updatedCategories: SiteCategory[]) => Promise<void>;
  isSaving: boolean;
  salads: any[];
}

export const AdminCategoriesTab: React.FC<AdminCategoriesTabProps> = ({
  categories,
  onSaveCategories,
  isSaving,
  salads,
}) => {
  const [localCategories, setLocalCategories] = useState<SiteCategory[]>(
    categories && categories.length > 0 ? categories : DEFAULT_CATEGORIES
  );

  // New Category Form state
  const [isAdding, setIsAdding] = useState(false);
  const [newId, setNewId] = useState('');
  const [newLabel, setNewLabel] = useState('');
  const [newIcon, setNewIcon] = useState('🥗');
  const [newCount, setNewCount] = useState('');

  // Editing state
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editLabel, setEditLabel] = useState('');
  const [editIcon, setEditIcon] = useState('');
  const [editCount, setEditCount] = useState('');

  const emojiPresets = ['🥗', '⚡', '🌱', '🧀', '✨', '🍚', '🥑', '🥦', '🌶️', '🥣', '🥕', '🥜'];

  const getSaladCount = (catId: string) => {
    if (catId === 'all') return salads.length;
    const lower = catId.toLowerCase().trim();
    return salads.filter((s) => {
      const tagLower = (s.tag || '').toLowerCase().trim();
      const nameLower = (s.name || '').toLowerCase().trim();
      return tagLower === lower || tagLower.includes(lower) || nameLower.includes(lower);
    }).length;
  };

  const handleAddCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLabel.trim()) return;

    const id = (newId.trim() || newLabel.trim()).replace(/\s+/g, ' ');
    if (localCategories.some((c) => c.id.toLowerCase() === id.toLowerCase())) {
      alert('A category with this ID/Name already exists!');
      return;
    }

    const newCat: SiteCategory = {
      id,
      label: newLabel.trim(),
      icon: newIcon.trim() || '🥗',
      count: newCount.trim() || undefined,
    };

    setLocalCategories([...localCategories, newCat]);
    setNewId('');
    setNewLabel('');
    setNewIcon('🥗');
    setNewCount('');
    setIsAdding(false);
  };

  const handleStartEdit = (cat: SiteCategory) => {
    setEditingId(cat.id);
    setEditLabel(cat.label);
    setEditIcon(cat.icon || '🥗');
    setEditCount(cat.count || '');
  };

  const handleSaveEdit = (catId: string) => {
    setLocalCategories(
      localCategories.map((c) =>
        c.id === catId
          ? {
              ...c,
              label: editLabel.trim() || c.label,
              icon: editIcon.trim() || c.icon,
              count: editCount.trim() || undefined,
            }
          : c
      )
    );
    setEditingId(null);
  };

  const handleDeleteCategory = (catId: string) => {
    if (catId === 'all') {
      alert('The "All Salads" category cannot be removed.');
      return;
    }
    if (confirm(`Are you sure you want to remove category "${catId}"?`)) {
      setLocalCategories(localCategories.filter((c) => c.id !== catId));
    }
  };

  const handleResetDefaults = () => {
    if (confirm('Reset all categories back to default Greesal categories?')) {
      setLocalCategories(DEFAULT_CATEGORIES);
    }
  };

  const handleSaveToBackend = () => {
    onSaveCategories(localCategories);
  };

  return (
    <div className="space-y-6 text-left">
      {/* Header */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-greesal-beige/60 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#123B2B]/10 text-[#123B2B] text-xs font-bold uppercase tracking-wider mb-2 border border-[#123B2B]/20">
            <Filter className="w-3.5 h-3.5" />
            <span>Category &amp; Menu Filter Management</span>
          </div>
          <h2 className="text-2xl font-black text-[#123B2B] tracking-tight">
            Menu Categories ({localCategories.length})
          </h2>
          <p className="text-xs text-gray-500 font-medium mt-1">
            Create, rename, or reorganize category tabs shown on the customer menu. Salads with matching tags will automatically filter under them.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={handleResetDefaults}
            className="px-4 py-2.5 rounded-xl border border-gray-300 text-gray-600 hover:text-[#123B2B] hover:bg-gray-50 text-xs font-bold flex items-center gap-1.5 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Defaults</span>
          </button>

          <button
            type="button"
            onClick={() => setIsAdding(!isAdding)}
            className="px-4 py-2.5 rounded-xl bg-[#123B2B] hover:bg-[#1C4D3A] text-white text-xs font-bold flex items-center gap-1.5 transition-all shadow-sm"
          >
            <Plus className="w-3.5 h-3.5 text-[#fbce45]" />
            <span>Add Category</span>
          </button>
        </div>
      </div>

      {/* Add Category Form Card */}
      {isAdding && (
        <form
          onSubmit={handleAddCategory}
          className="bg-[#f7faf8] rounded-3xl p-6 border-2 border-dashed border-[#20493c]/30 animate-fadeIn space-y-4"
        >
          <h3 className="text-sm font-black text-[#20493c] flex items-center gap-2">
            <Plus className="w-4 h-4 text-[#fbce45]" />
            <span>Create New Category</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div className="space-y-1 sm:col-span-1">
              <label className="text-[11px] font-bold text-gray-700 block">Emoji Icon</label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={newIcon}
                  onChange={(e) => setNewIcon(e.target.value)}
                  maxLength={4}
                  className="w-14 text-center px-2 py-2 rounded-xl border border-gray-300 bg-white text-lg font-bold"
                />
                <div className="flex flex-wrap gap-1">
                  {emojiPresets.slice(0, 6).map((em) => (
                    <button
                      key={em}
                      type="button"
                      onClick={() => setNewIcon(em)}
                      className="w-7 h-7 rounded-lg bg-white border border-gray-200 text-xs hover:scale-110 transition-transform"
                    >
                      {em}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="space-y-1 sm:col-span-1">
              <label className="text-[11px] font-bold text-gray-700 block">
                Category Display Name *
              </label>
              <input
                type="text"
                value={newLabel}
                onChange={(e) => setNewLabel(e.target.value)}
                placeholder="e.g. Avocado Crunch"
                required
                className="w-full px-3 py-2 rounded-xl border border-gray-300 bg-white text-xs font-bold text-gray-800 focus:outline-none focus:ring-1 focus:ring-[#20493c]"
              />
            </div>

            <div className="space-y-1 sm:col-span-1">
              <label className="text-[11px] font-bold text-gray-700 block">
                Category ID / Tag Key
              </label>
              <input
                type="text"
                value={newId}
                onChange={(e) => setNewId(e.target.value)}
                placeholder="Auto-matches salad tag"
                className="w-full px-3 py-2 rounded-xl border border-gray-300 bg-white text-xs font-medium text-gray-800 focus:outline-none focus:ring-1 focus:ring-[#20493c]"
              />
            </div>

            <div className="space-y-1 sm:col-span-1">
              <label className="text-[11px] font-bold text-gray-700 block">
                Badge / Count Subtitle
              </label>
              <input
                type="text"
                value={newCount}
                onChange={(e) => setNewCount(e.target.value)}
                placeholder="e.g. 05 protein pack"
                className="w-full px-3 py-2 rounded-xl border border-gray-300 bg-white text-xs font-medium text-gray-800 focus:outline-none focus:ring-1 focus:ring-[#20493c]"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setIsAdding(false)}
              className="px-4 py-2 rounded-xl border border-gray-300 text-gray-600 text-xs font-bold hover:bg-gray-100"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-[#20493c] text-white text-xs font-bold hover:bg-[#16372c] shadow-sm"
            >
              Save New Category
            </button>
          </div>
        </form>
      )}

      {/* Categories Grid List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {localCategories.map((cat, idx) => {
          const isEditing = editingId === cat.id;
          const count = getSaladCount(cat.id);

          return (
            <div
              key={cat.id}
              className={`bg-white rounded-2xl p-5 border transition-all duration-200 ${
                isEditing
                  ? 'border-[#20493c] ring-2 ring-[#20493c]/20 shadow-md'
                  : 'border-gray-200 hover:border-[#6ac6ac]/60 hover:shadow-md'
              }`}
            >
              {!isEditing ? (
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <span className="w-11 h-11 rounded-2xl bg-[#e8f7f2] flex items-center justify-center text-xl shadow-xs">
                      {cat.icon || '🥗'}
                    </span>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-bold text-sm text-[#20493c]">{cat.label}</h4>
                        <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-gray-100 text-gray-600 font-semibold">
                          #{idx + 1}
                        </span>
                      </div>
                      <p className="text-[11px] text-gray-500 font-medium">
                        Tag: <code className="text-[#20493c] font-bold">{cat.id}</code> • {count} salads active
                      </p>
                      {cat.count && (
                        <span className="inline-block text-[10px] text-[#20493c] font-semibold bg-[#fbce45]/30 px-2 py-0.5 rounded-full mt-1">
                          {cat.count}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => handleStartEdit(cat)}
                      className="p-1.5 rounded-lg text-gray-400 hover:text-[#20493c] hover:bg-gray-100 transition-colors"
                      title="Edit Category"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    {cat.id !== 'all' && (
                      <button
                        type="button"
                        onClick={() => handleDeleteCategory(cat.id)}
                        className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                        title="Delete Category"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-black uppercase text-[#20493c]">Editing Category</span>
                    <span className="text-[10px] text-gray-400">ID: {cat.id}</span>
                  </div>

                  <div className="grid grid-cols-4 gap-2">
                    <input
                      type="text"
                      value={editIcon}
                      onChange={(e) => setEditIcon(e.target.value)}
                      maxLength={4}
                      className="col-span-1 text-center py-1.5 rounded-xl border border-gray-300 text-base"
                    />
                    <input
                      type="text"
                      value={editLabel}
                      onChange={(e) => setEditLabel(e.target.value)}
                      placeholder="Category Label"
                      className="col-span-3 px-3 py-1.5 rounded-xl border border-gray-300 text-xs font-bold"
                    />
                  </div>

                  <input
                    type="text"
                    value={editCount}
                    onChange={(e) => setEditCount(e.target.value)}
                    placeholder="Subtitle (e.g. 05 protein pack)"
                    className="w-full px-3 py-1.5 rounded-xl border border-gray-300 text-xs"
                  />

                  <div className="flex justify-end gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => setEditingId(null)}
                      className="px-3 py-1 rounded-lg border border-gray-300 text-xs font-bold text-gray-600"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={() => handleSaveEdit(cat.id)}
                      className="px-3 py-1 rounded-lg bg-[#20493c] text-white text-xs font-bold"
                    >
                      Done
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Save All Categories Button Banner */}
      <div className="bg-white rounded-3xl p-6 shadow-sm border border-greesal-beige/60 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <p className="text-xs font-bold text-gray-700">Ready to update your website?</p>
          <p className="text-[11px] text-gray-400">Click save to immediately publish the new categories to the customer menu.</p>
        </div>

        <button
          type="button"
          onClick={handleSaveToBackend}
          disabled={isSaving}
          className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-[#20493c] hover:bg-[#16372c] text-white font-black text-sm flex items-center justify-center gap-2 shadow-lg transition-all disabled:opacity-80"
        >
          {isSaving ? (
            <Loader2 className="w-4 h-4 animate-spin text-[#fbce45]" />
          ) : (
            <Save className="w-4 h-4 text-[#fbce45]" />
          )}
          <span>Save Categories Live</span>
        </button>
      </div>
    </div>
  );
};
