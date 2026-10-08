import React, { useState, useEffect } from 'react';
import {
  Star,
  MessageSquare,
  ThumbsUp,
  Quote,
  Plus,
  ChevronDown,
  ChevronUp,
  X,
  CheckCircle,
  Loader2,
  Sparkles,
  MapPin,
  User,
  Heart
} from 'lucide-react';
import { CustomerReview, DEFAULT_REVIEWS } from '@/lib/reviews';

export const CustomerReviewsSection: React.FC = () => {
  const [reviews, setReviews] = useState<CustomerReview[]>(DEFAULT_REVIEWS);
  const [showAll, setShowAll] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Form State
  const [name, setName] = useState('');
  const [location, setLocation] = useState('');
  const [role, setRole] = useState('');
  const [rating, setRating] = useState(5);
  const [text, setText] = useState('');
  const [hoverRating, setHoverRating] = useState(0);

  // Load reviews from API
  useEffect(() => {
    const fetchReviews = async () => {
      try {
        setIsLoading(true);
        const res = await fetch('/api/reviews');
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data) && data.length > 0) {
            setReviews(data);
          }
        }
      } catch (err) {
        console.error('Failed to load reviews:', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchReviews();
  }, []);

  // Handle Form Submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !text.trim()) {
      setSubmitError('Please enter your name and review details.');
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          location: location.trim() || 'Surat',
          role: role.trim() || 'Verified Customer',
          rating,
          text: text.trim(),
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to submit review');
      }

      // Add newly created review to state
      if (data.review) {
        setReviews((prev) => [data.review, ...prev]);
      }

      setSubmitSuccess(true);
      setTimeout(() => {
        setIsModalOpen(false);
        setSubmitSuccess(false);
        // Reset form
        setName('');
        setLocation('');
        setRole('');
        setText('');
        setRating(5);
      }, 2000);
    } catch (err: any) {
      setSubmitError(err.message || 'Something went wrong while submitting.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Only show first 4 unless expanded
  const displayedReviews = showAll ? reviews : reviews.slice(0, 4);

  return (
    <section id="reviews" className="py-16 sm:py-24 bg-[#f8faf9] relative overflow-hidden font-dmsans">
      {/* Background glows */}
      <div className="absolute top-0 right-0 w-80 h-80 bg-[#6ac6ac]/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-[#fbce45]/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">

        {/* Section Header */}
        <div className="text-center mb-12 sm:mb-16">
          <p className="text-xs sm:text-sm font-bold uppercase tracking-widest text-[#6ac6ac] mb-2 font-montserrat">

          </p>
          <h2 className="font-montserrat font-extrabold text-3xl sm:text-5xl text-[#20493c] tracking-tight">
            Customer <span className="text-[#fbce45]">Experiences</span>
          </h2>
          <div className="w-20 h-1.5 bg-[#fbce45] mx-auto mt-4 rounded-full" />
          <p className="text-sm text-[#20493c]/80 mt-3 font-dmsans max-w-lg mx-auto">
            Loved by over 1,200+ healthy eaters and families across Surat with a verified 4.9★ rating.
          </p>
        </div>

        {/* Customer Experiences Grid (2x2 initial layout) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 max-w-6xl mx-auto">
          {displayedReviews.map((rev, index) => (
            <div
              key={rev._id || rev.id || index}
              className="bg-white rounded-3xl p-6 sm:p-8 shadow-md border border-[#e4eae7] hover:shadow-xl transition-all duration-300 relative flex flex-col justify-between hover:-translate-y-1 group"
            >
              <Quote className="absolute top-6 right-6 w-9 h-9 text-[#6ac6ac]/20 group-hover:text-[#6ac6ac]/40 transition-colors" />

              <div>
                {/* Rating Stars */}
                <div className="flex items-center gap-1.5 text-[#fbce45] mb-3">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-4 h-4 ${i < rev.rating ? 'fill-[#fbce45] text-[#fbce45]' : 'text-gray-300'}`}
                    />
                  ))}
                  <span className="text-xs font-extrabold text-[#20493c] ml-1.5">
                    {rev.rating.toFixed(1)} / 5.0
                  </span>
                  {rev.isPinned && (
                    <span className="ml-2 inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-50 border border-amber-200 text-[10px] font-bold text-amber-800">
                      <Sparkles className="w-2.5 h-2.5 text-amber-500" /> Featured
                    </span>
                  )}
                </div>

                {/* Review Message */}
                <p className="font-montserrat text-sm text-[#20493c] leading-relaxed mb-6 italic">
                  &ldquo;{rev.text}&rdquo;
                </p>
              </div>

              {/* Author Info Footer */}
              <div className="pt-4 border-t border-gray-100 flex items-center justify-between">
                <div>
                  <h4 className="font-montserrat font-bold text-sm sm:text-base text-[#20493c]">
                    {rev.name}
                  </h4>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-xs text-[#6ac6ac] font-semibold">{rev.role || 'Verified Customer'}</span>
                    <span className="text-[10px] text-gray-400">•</span>
                    <span className="text-xs text-gray-500">{rev.location || 'Surat'}</span>
                  </div>
                </div>
                <div className="w-8 h-8 rounded-full bg-[#e8f7f2] flex items-center justify-center text-[#20493c]">
                  <ThumbsUp className="w-4 h-4 text-[#20493c]" />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Show More / Show Less Toggle Button */}
        {reviews.length > 4 && (
          <div className="mt-8 text-center">
            <button
              onClick={() => setShowAll(!showAll)}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-white hover:bg-emerald-50 text-[#20493c] border border-emerald-200 text-xs sm:text-sm font-bold shadow-sm transition-all hover:shadow hover:border-emerald-300"
            >
              {showAll ? (
                <>
                  <span>Show Less Experiences</span>
                  <ChevronUp className="w-4 h-4 text-[#20493c]" />
                </>
              ) : (
                <>
                  <span>Show More Customer Stories ({reviews.length - 4} more)</span>
                  <ChevronDown className="w-4 h-4 text-[#20493c]" />
                </>
              )}
            </button>
          </div>
        )}

        {/* Action Buttons: Add Review & Menu Link */}
        <div className="mt-12 flex flex-wrap items-center justify-center gap-4">
          <button
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full bg-[#20493c] text-white font-bold text-sm sm:text-base hover:bg-[#15342a] active:scale-95 transition-all shadow-md cursor-pointer group"
          >
            <Plus className="w-4 h-4 text-[#fbce45] group-hover:rotate-90 transition-transform duration-300" />
            <span>Share Your Experience</span>
          </button>

          <a
            href="#menu"
            className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full bg-white text-[#20493c] border-2 border-[#20493c] font-bold text-sm sm:text-base hover:bg-[#f2f8f5] active:scale-95 transition-all shadow-sm"
          >
            <MessageSquare className="w-4 h-4 text-[#20493c]" />
            <span>Order A Fresh Salad Today</span>
          </a>
        </div>

      </div>

      {/* Write Experience Modal (Direct In-Page) */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div
            className="bg-white w-full max-w-lg rounded-3xl p-6 sm:p-8 shadow-2xl border border-gray-100 relative animate-in zoom-in-95 duration-200 overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Top decorative stripe */}
            <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-[#20493c] via-[#6ac6ac] to-[#fbce45]" />

            {/* Close Button */}
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 p-2 rounded-full text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            {submitSuccess ? (
              <div className="py-10 text-center space-y-3">
                <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
                  <CheckCircle className="w-8 h-8" />
                </div>
                <h3 className="text-2xl font-montserrat font-extrabold text-[#20493c]">
                  Thank You for Sharing!
                </h3>
                <p className="text-sm text-gray-600 max-w-sm mx-auto">
                  Your review has been successfully submitted and added to Greesal Customer Experiences.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#e8f7f2] text-[#20493c] text-xs font-bold uppercase tracking-wider mb-2">
                    <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" /> Share Your Story
                  </div>
                  <h3 className="font-montserrat font-extrabold text-2xl text-[#20493c]">
                    How was your experience?
                  </h3>
                  <p className="text-xs text-gray-500 mt-1">
                    Help other health-conscious food lovers in Surat discover clean and fresh nutrition.
                  </p>
                </div>

                {submitError && (
                  <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl font-medium">
                    {submitError}
                  </div>
                )}

                {/* Rating Selector */}
                <div className="bg-[#f8faf9] p-3.5 rounded-2xl border border-gray-200 text-center">
                  <label className="block text-xs font-bold text-[#20493c] mb-1.5">
                    Your Overall Rating
                  </label>
                  <div className="flex items-center justify-center gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        type="button"
                        key={star}
                        onClick={() => setRating(star)}
                        onMouseEnter={() => setHoverRating(star)}
                        onMouseLeave={() => setHoverRating(0)}
                        className="p-1 cursor-pointer transition-transform hover:scale-115 active:scale-95"
                      >
                        <Star
                          className={`w-7 h-7 transition-colors ${(hoverRating || rating) >= star
                            ? 'text-[#fbce45] fill-[#fbce45] drop-shadow-xs'
                            : 'text-gray-300'
                            }`}
                        />
                      </button>
                    ))}
                  </div>
                  <span className="text-[11px] font-bold text-gray-500 mt-1 block">
                    {rating === 5 ? '⭐⭐⭐⭐⭐ Excellent (5.0)' : `${rating}.0 Stars`}
                  </span>
                </div>

                {/* Name */}
                <div>
                  <label className="block text-xs font-bold text-[#20493c] mb-1">
                    Your Full Name <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <User className="absolute left-3.5 top-3 w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. Yashvi Sharma"
                      className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-gray-300 text-xs font-semibold focus:outline-none focus:border-[#20493c] focus:ring-1 focus:ring-[#20493c]"
                    />
                  </div>
                </div>

                {/* Location & Role Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-[#20493c] mb-1">
                      Area / Location
                    </label>
                    <div className="relative">
                      <MapPin className="absolute left-3.5 top-3 w-4 h-4 text-gray-400" />
                      <input
                        type="text"
                        value={location}
                        onChange={(e) => setLocation(e.target.value)}
                        placeholder="e.g. Vesu, Surat"
                        className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-gray-300 text-xs font-semibold focus:outline-none focus:border-[#20493c] focus:ring-1 focus:ring-[#20493c]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#20493c] mb-1">
                      Your Tag / Role
                    </label>
                    <input
                      type="text"
                      value={role}
                      onChange={(e) => setRole(e.target.value)}
                      placeholder="e.g. Daily Subscriber, Fitness"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-xs font-semibold focus:outline-none focus:border-[#20493c] focus:ring-1 focus:ring-[#20493c]"
                    />
                  </div>
                </div>

                {/* Review Message */}
                <div>
                  <label className="block text-xs font-bold text-[#20493c] mb-1">
                    Your Experience &amp; Feedback <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    required
                    rows={4}
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    placeholder="Tell us what you liked about Greesal salads, taste, packaging, delivery or health results..."
                    className="w-full p-3.5 rounded-xl border border-gray-300 text-xs font-medium focus:outline-none focus:border-[#20493c] focus:ring-1 focus:ring-[#20493c]"
                  />
                </div>

                {/* Buttons */}
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
                    disabled={isSubmitting}
                    className="px-6 py-2.5 rounded-xl bg-[#20493c] hover:bg-[#15342a] text-white text-xs font-bold shadow-md flex items-center gap-2 disabled:opacity-50"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        <span>Submitting...</span>
                      </>
                    ) : (
                      <span>Post Experience</span>
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </section>
  );
};
