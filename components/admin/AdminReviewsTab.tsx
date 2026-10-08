import React, { useState, useEffect } from 'react';
import { 
  Star, 
  Plus, 
  Trash2, 
  Check, 
  X, 
  Sparkles, 
  ArrowUp, 
  ArrowDown, 
  Loader2, 
  Search, 
  Eye, 
  EyeOff, 
  ThumbsUp, 
  MessageSquare,
  ShieldCheck,
  MapPin,
  User,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { CustomerReview, DEFAULT_REVIEWS } from '@/lib/reviews';

export const AdminReviewsTab: React.FC = () => {
  const [reviews, setReviews] = useState<CustomerReview[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'top4' | 'hidden'>('all');
  
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Modal / Form state for Add/Edit
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingReview, setEditingReview] = useState<CustomerReview | null>(null);
  const [formName, setFormName] = useState('');
  const [formLocation, setFormLocation] = useState('');
  const [formRole, setFormRole] = useState('');
  const [formRating, setFormRating] = useState(5);
  const [formText, setFormText] = useState('');
  const [formIsPinned, setFormIsPinned] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Fetch reviews from Admin API
  const fetchReviews = async () => {
    try {
      setIsLoading(true);
      const res = await fetch('/api/admin/reviews');
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data)) {
          setReviews(data);
        }
      }
    } catch (err: any) {
      setErrorMsg('Failed to load reviews.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, []);

  const notifySuccess = (msg: string) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(null), 3500);
  };

  const notifyError = (msg: string) => {
    setErrorMsg(msg);
    setTimeout(() => setErrorMsg(null), 4000);
  };

  // Open Create Modal
  const openCreateModal = () => {
    setEditingReview(null);
    setFormName('');
    setFormLocation('Surat');
    setFormRole('Verified Customer');
    setFormRating(5);
    setFormText('');
    setFormIsPinned(false);
    setIsModalOpen(true);
  };

  // Save Add/Edit
  const handleSaveReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim() || !formText.trim()) {
      notifyError('Name and review text are required.');
      return;
    }

    setIsSaving(true);
    try {
      if (editingReview) {
        const rawId: any = editingReview._id || editingReview.id || '';
        const revId = typeof rawId === 'object' ? (rawId?.toString ? rawId.toString() : JSON.stringify(rawId)) : String(rawId);

        const res = await fetch('/api/admin/reviews', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'update',
            reviewId: revId,
            data: {
              name: formName.trim(),
              location: formLocation.trim() || 'Surat',
              role: formRole.trim() || 'Verified Customer',
              rating: Number(formRating) || 5,
              text: formText.trim(),
              isPinned: formIsPinned,
            },
          }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Failed to update review');
        if (data.reviews && Array.isArray(data.reviews)) {
          setReviews(data.reviews);
        } else {
          await fetchReviews();
        }
        notifySuccess('Review updated successfully!');
      } else {
        const res = await fetch('/api/admin/reviews', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'create',
            data: {
              name: formName.trim(),
              location: formLocation.trim() || 'Surat',
              role: formRole.trim() || 'Verified Customer',
              rating: Number(formRating) || 5,
              text: formText.trim(),
              isPinned: formIsPinned,
            },
          }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Failed to add review');
        await fetchReviews();
        notifySuccess('New customer experience added!');
      }

      setIsModalOpen(false);
    } catch (err: any) {
      notifyError(err.message || 'Error saving review');
    } finally {
      setIsSaving(false);
    }
  };

  // Delete Review
  const handleDelete = async (rev: CustomerReview) => {
    const revId = rev._id || rev.id;
    if (!confirm(`Are you sure you want to delete the review from "${rev.name}"?`)) return;

    try {
      const res = await fetch(`/api/admin/reviews?id=${revId}`, { method: 'DELETE' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to delete review');

      setReviews((prev) => prev.filter((r) => (r._id || r.id) !== revId));
      notifySuccess('Review deleted successfully.');
    } catch (err: any) {
      notifyError(err.message || 'Failed to delete');
    }
  };

  // Toggle Visibility Status (Approved vs Hidden)
  const toggleVisibility = async (rev: CustomerReview) => {
    const revId = rev._id || rev.id;
    const newStatus = rev.status === 'hidden' ? 'approved' : 'hidden';

    try {
      const res = await fetch('/api/admin/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'update',
          reviewId: revId,
          data: { status: newStatus },
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to update visibility');
      if (data.reviews) setReviews(data.reviews);
      notifySuccess(`Review marked as ${newStatus === 'hidden' ? 'Hidden' : 'Active'}.`);
    } catch (err: any) {
      notifyError(err.message || 'Error updating status');
    }
  };

  // Reorder Top Pinned Reviews (Move Up / Down)
  const moveReviewOrder = async (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= reviews.length) return;

    const newOrder = [...reviews];
    const [moved] = newOrder.splice(index, 1);
    newOrder.splice(targetIndex, 0, moved);

    // Get ordered IDs for the first 4 (or all)
    const orderedIds = newOrder.map((r) => String(r._id || r.id));

    try {
      const res = await fetch('/api/admin/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'setTopFour',
          orderedIds: orderedIds.slice(0, 4),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to update order');
      if (data.reviews) setReviews(data.reviews);
      notifySuccess('Featured Top 4 order saved! Live website updated.');
    } catch (err: any) {
      notifyError(err.message || 'Failed to reorder');
    }
  };

  // Toggle Pin as one of top 4
  const togglePin = async (rev: CustomerReview, index: number) => {
    const revId = String(rev._id || rev.id);
    let currentlyPinned = reviews.filter((r) => r.isPinned).map((r) => String(r._id || r.id));

    if (rev.isPinned) {
      currentlyPinned = currentlyPinned.filter((id) => id !== revId);
    } else {
      if (currentlyPinned.length >= 4) {
        currentlyPinned = [revId, ...currentlyPinned.slice(0, 3)];
      } else {
        currentlyPinned = [revId, ...currentlyPinned];
      }
    }

    try {
      const res = await fetch('/api/admin/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'setTopFour',
          orderedIds: currentlyPinned,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to update pinned status');
      if (data.reviews) setReviews(data.reviews);
      notifySuccess(rev.isPinned ? 'Removed from Top 4.' : 'Featured in Top 4!');
    } catch (err: any) {
      notifyError(err.message || 'Failed to update pin');
    }
  };

  // Filtered List
  const filteredReviews = reviews.filter((r) => {
    const matchesSearch =
      (r.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (r.location || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (r.text || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (r.role || '').toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;
    if (filterType === 'top4') return Boolean(r.isPinned);
    if (filterType === 'hidden') return r.status === 'hidden';
    return true;
  });

  const top4Count = reviews.filter((r) => r.isPinned).length;

  return (
    <div className="space-y-6">
      {/* Alerts */}
      {successMsg && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs sm:text-sm font-semibold flex items-center gap-2.5">
          <CheckCircle className="w-5 h-5 text-emerald-600 flex-shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}
      {errorMsg && (
        <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-800 text-xs sm:text-sm font-semibold flex items-center gap-2.5">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Top Banner Guide */}
      <div className="bg-gradient-to-r from-[#20493c] to-[#123B2B] text-white p-6 sm:p-7 rounded-3xl shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#6ac6ac]/20 border border-[#6ac6ac]/30 text-xs font-bold text-[#fbce45] mb-2 uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" /> Homepage Top 4 Prioritizer
          </div>
          <h2 className="font-montserrat font-extrabold text-2xl sm:text-3xl text-white">
            Customer Experiences ({reviews.length})
          </h2>
          <p className="text-xs sm:text-sm text-gray-200 mt-1 max-w-2xl font-dmsans">
            The top 4 featured reviews are shown first on the home page. Users can click &ldquo;Show More Stories&rdquo; to explore other submitted experiences.
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="px-5 py-3 rounded-2xl bg-[#fbce45] hover:bg-[#f0c235] text-[#20493c] font-black text-xs sm:text-sm flex items-center gap-2 shadow-lg transition-transform active:scale-95 whitespace-nowrap cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Story</span>
        </button>
      </div>

      {/* Search & Filter Bar */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-gray-200 shadow-sm flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-3 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by customer name, location, or keywords..."
            className="w-full pl-10 pr-4 py-2 rounded-xl border border-gray-300 text-xs font-semibold focus:outline-none focus:border-[#20493c]"
          />
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setFilterType('all')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-colors ${
              filterType === 'all'
                ? 'bg-[#20493c] text-white shadow-sm'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            All ({reviews.length})
          </button>
          <button
            onClick={() => setFilterType('top4')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 ${
              filterType === 'top4'
                ? 'bg-[#20493c] text-white shadow-sm'
                : 'bg-amber-50 border border-amber-200 text-amber-900 hover:bg-amber-100'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>Top 4 Featured ({top4Count})</span>
          </button>
          <button
            onClick={() => setFilterType('hidden')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-colors ${
              filterType === 'hidden'
                ? 'bg-[#20493c] text-white shadow-sm'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Hidden
          </button>
        </div>
      </div>

      {/* Reviews List */}
      {isLoading ? (
        <div className="py-20 text-center text-gray-500 flex flex-col items-center gap-3 bg-white rounded-3xl border border-gray-200">
          <Loader2 className="w-8 h-8 animate-spin text-[#20493c]" />
          <p className="text-xs font-bold">Loading Customer Experiences...</p>
        </div>
      ) : filteredReviews.length === 0 ? (
        <div className="py-16 text-center text-gray-500 bg-white rounded-3xl border border-gray-200">
          <MessageSquare className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <h3 className="font-montserrat font-bold text-lg text-gray-700">No experiences found</h3>
          <p className="text-xs text-gray-500 mt-1">Try adjusting your search query or add a new customer experience.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
          {filteredReviews.map((rev, index) => {
            const isFeatured = Boolean(rev.isPinned);
            const isHidden = rev.status === 'hidden';

            return (
              <div
                key={rev._id || rev.id || index}
                className={`bg-white rounded-3xl p-5 sm:p-6 shadow-sm border transition-all relative flex flex-col justify-between ${
                  isFeatured
                    ? 'border-amber-300 ring-2 ring-amber-400/20 shadow-md'
                    : isHidden
                    ? 'border-gray-200 opacity-60 bg-gray-50'
                    : 'border-gray-200 hover:shadow-md'
                }`}
              >
                {/* Header info */}
                <div>
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <div className="flex items-center gap-1 text-[#fbce45]">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-3.5 h-3.5 ${
                            i < rev.rating ? 'fill-[#fbce45] text-[#fbce45]' : 'text-gray-300'
                          }`}
                        />
                      ))}
                      <span className="text-xs font-black text-[#20493c] ml-1.5">
                        {rev.rating.toFixed(1)}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      {isFeatured && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-100 text-amber-900 border border-amber-300 text-[10px] font-black uppercase">
                          <Sparkles className="w-3 h-3 text-amber-600" />
                          <span>Top #{rev.order || index + 1}</span>
                        </span>
                      )}
                      {isHidden && (
                        <span className="px-2 py-0.5 rounded-full bg-gray-200 text-gray-700 text-[10px] font-bold">
                          Hidden
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Review Text */}
                  <p className="text-xs sm:text-sm text-gray-800 leading-relaxed font-dmsans mb-4 italic">
                    &ldquo;{rev.text}&rdquo;
                  </p>
                </div>

                {/* Author Info & Actions */}
                <div className="pt-3 border-t border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h4 className="font-montserrat font-bold text-sm text-[#20493c]">
                      {rev.name}
                    </h4>
                    <div className="flex items-center gap-2 mt-0.5 text-xs text-gray-500">
                      <span className="text-emerald-700 font-semibold">{rev.role || 'Verified Customer'}</span>
                      <span>•</span>
                      <span>{rev.location || 'Surat'}</span>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center gap-1.5 self-end sm:self-auto">
                    {/* Move order up/down */}
                    <button
                      onClick={() => moveReviewOrder(index, 'up')}
                      disabled={index === 0}
                      title="Move Up"
                      className="p-1.5 rounded-lg border border-gray-200 hover:bg-gray-100 text-gray-600 disabled:opacity-30 cursor-pointer"
                    >
                      <ArrowUp className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => moveReviewOrder(index, 'down')}
                      disabled={index === reviews.length - 1}
                      title="Move Down"
                      className="p-1.5 rounded-lg border border-gray-200 hover:bg-gray-100 text-gray-600 disabled:opacity-30 cursor-pointer"
                    >
                      <ArrowDown className="w-3.5 h-3.5" />
                    </button>

                    {/* Toggle Pin / Top 4 */}
                    <button
                      onClick={() => togglePin(rev, index)}
                      title={isFeatured ? 'Remove from Top 4' : 'Pin to Top 4'}
                      className={`px-2.5 py-1.5 rounded-lg text-xs font-bold border transition-colors cursor-pointer flex items-center gap-1 ${
                        isFeatured
                          ? 'bg-amber-100 border-amber-300 text-amber-900 hover:bg-amber-200'
                          : 'border-gray-200 text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      <Sparkles className="w-3 h-3 text-amber-500" />
                      <span>{isFeatured ? 'Pinned' : 'Pin'}</span>
                    </button>

                    {/* Toggle Visibility */}
                    <button
                      onClick={() => toggleVisibility(rev)}
                      title={isHidden ? 'Show on Website' : 'Hide from Website'}
                      className="p-1.5 rounded-lg border border-gray-200 hover:bg-gray-100 text-gray-600 cursor-pointer"
                    >
                      {isHidden ? <Eye className="w-3.5 h-3.5 text-emerald-600" /> : <EyeOff className="w-3.5 h-3.5" />}
                    </button>



                    {/* Delete */}
                    <button
                      onClick={() => handleDelete(rev)}
                      title="Delete Story"
                      className="p-1.5 rounded-lg border border-red-200 hover:bg-red-50 text-red-600 cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add / Edit Experience Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div 
            className="bg-white w-full max-w-lg rounded-3xl p-6 sm:p-7 shadow-2xl border border-gray-100 relative animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 p-2 rounded-full text-gray-400 hover:text-gray-700 hover:bg-gray-100"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="font-montserrat font-extrabold text-2xl text-[#20493c] mb-1">
              Add Customer Experience
            </h3>
            <p className="text-xs text-gray-500 mb-5 font-dmsans">
              Add a verified review quote to display on the live website.
            </p>

            <form onSubmit={handleSaveReview} className="space-y-4">
              {/* Star Rating */}
              <div className="bg-[#f8faf9] p-3 rounded-2xl border border-gray-200 text-center">
                <label className="block text-xs font-bold text-[#20493c] mb-1">
                  Star Rating (1 - 5)
                </label>
                <div className="flex items-center justify-center gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      type="button"
                      key={star}
                      onClick={() => setFormRating(star)}
                      className="p-1 cursor-pointer transition-transform hover:scale-115"
                    >
                      <Star
                        className={`w-6 h-6 ${
                          formRating >= star
                            ? 'text-[#fbce45] fill-[#fbce45]'
                            : 'text-gray-300'
                        }`}
                      />
                    </button>
                  ))}
                </div>
              </div>

              {/* Name */}
              <div>
                <label className="block text-xs font-bold text-[#20493c] mb-1">
                  Customer Full Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="e.g. Dr. Saumya Gandhi"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-xs font-semibold focus:outline-none focus:border-[#20493c]"
                />
              </div>

              {/* Location & Role */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#20493c] mb-1">
                    Area / Location in Surat
                  </label>
                  <input
                    type="text"
                    value={formLocation}
                    onChange={(e) => setFormLocation(e.target.value)}
                    placeholder="e.g. Vesu, Surat"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-xs font-semibold focus:outline-none focus:border-[#20493c]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#20493c] mb-1">
                    Customer Tag / Role
                  </label>
                  <input
                    type="text"
                    value={formRole}
                    onChange={(e) => setFormRole(e.target.value)}
                    placeholder="e.g. 2-Month Active Subscriber"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-xs font-semibold focus:outline-none focus:border-[#20493c]"
                  />
                </div>
              </div>

              {/* Review Text */}
              <div>
                <label className="block text-xs font-bold text-[#20493c] mb-1">
                  Customer Review / Experience Text <span className="text-red-500">*</span>
                </label>
                <textarea
                  required
                  rows={4}
                  value={formText}
                  onChange={(e) => setFormText(e.target.value)}
                  placeholder="Enter the customer review story or feedback..."
                  className="w-full p-3.5 rounded-xl border border-gray-300 text-xs font-medium focus:outline-none focus:border-[#20493c]"
                />
              </div>

              {/* Pin to Top 4 checkbox */}
              <div className="p-3 bg-amber-50/60 rounded-xl border border-amber-200 flex items-center gap-2.5">
                <input
                  type="checkbox"
                  id="pinTop4"
                  checked={formIsPinned}
                  onChange={(e) => setFormIsPinned(e.target.checked)}
                  className="w-4 h-4 text-[#20493c] rounded border-gray-300 focus:ring-[#20493c]"
                />
                <label htmlFor="pinTop4" className="text-xs font-bold text-amber-900 cursor-pointer">
                  Feature in Top 4 Customer Experiences on Homepage
                </label>
              </div>

              {/* Action Buttons */}
              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-5 py-2.5 rounded-xl border border-gray-300 text-xs font-bold text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-6 py-2.5 rounded-xl bg-[#20493c] hover:bg-[#15342a] text-white text-xs font-bold shadow-md flex items-center gap-2 disabled:opacity-50 cursor-pointer"
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Saving...</span>
                    </>
                  ) : (
                    <span>Create Experience</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
