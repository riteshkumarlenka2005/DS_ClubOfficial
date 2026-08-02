import React, { useState } from 'react';
import { useApi } from '../../hooks/useApi';
import { eventReviewService, EventReview } from '../../services/eventReview.service';
import { motion } from 'framer-motion';
import { Check, X, Star, Calendar, MessageSquareOff } from 'lucide-react';

export default function ReviewManagement() {
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved'>('pending');

  const { data: reviews, isLoading, refetch } = useApi<EventReview[]>(
    () => eventReviewService.getAllAdmin(),
    []
  );

  const handleStatusUpdate = async (id: string, is_approved: boolean) => {
    try {
      await eventReviewService.updateStatus(id, is_approved);
      alert(is_approved ? 'Review approved' : 'Review unapproved');
      refetch();
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to update review status');
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this review?')) return;
    try {
      await eventReviewService.deleteReview(id);
      alert('Review deleted');
      refetch();
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to delete review');
    }
  };

  if (isLoading) {
    return (
      <div className="flex animate-pulse space-x-4 p-8">
        <div className="flex-1 space-y-6 py-1">
          <div className="h-4 bg-[#E0D4F5] rounded w-3/4"></div>
          <div className="space-y-3">
            <div className="grid grid-cols-3 gap-4">
              <div className="h-20 bg-[#E0D4F5] rounded col-span-2"></div>
              <div className="h-20 bg-[#E0D4F5] rounded col-span-1"></div>
            </div>
            <div className="h-20 bg-[#E0D4F5] rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  const safeReviews = reviews || [];
  const filteredReviews = safeReviews.filter((r) => {
    if (filter === 'pending') return !r.is_approved;
    if (filter === 'approved') return r.is_approved;
    return true;
  });

  if (safeReviews.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-12 bg-white rounded-2xl border border-[#E0D4F5] text-center h-[50vh]">
        <div className="w-16 h-16 bg-[#EEEAFD] rounded-full flex items-center justify-center mb-4">
          <MessageSquareOff size={28} className="text-[#9667E0]" />
        </div>
        <h3 className="text-xl font-bold text-[#1A0B2E] mb-2">No Reviews Yet</h3>
        <p className="text-[#2D164B]/60 max-w-sm">
          When participants write reviews for your events, they will appear here for your approval.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="flex gap-2 p-1 bg-white border border-[#E0D4F5] rounded-xl w-fit">
        {(['pending', 'approved', 'all'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setFilter(tab)}
            className={`px-4 py-2 rounded-lg text-sm font-bold capitalize transition-all ${
              filter === tab
                ? 'bg-[#9667E0] text-white shadow-md shadow-[#9667E0]/20'
                : 'text-[#2D164B]/60 hover:text-[#1A0B2E] hover:bg-[#EEEAFD]'
            }`}
          >
            {tab}
            {tab === 'pending' && (
              <span className="ml-2 px-1.5 py-0.5 rounded-full bg-red-100 text-red-600 text-[10px]">
                {safeReviews.filter((r) => !r.is_approved).length}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Reviews List */}
      <div className="grid gap-4">
        {filteredReviews.length === 0 ? (
          <div className="text-center py-12 text-[#2D164B]/50 font-medium">
            No {filter} reviews found.
          </div>
        ) : (
          filteredReviews.map((review) => (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              key={review.id}
              className="bg-white border border-[#E0D4F5] rounded-2xl p-5 md:p-6 flex flex-col md:flex-row gap-6 relative overflow-hidden"
            >
              {/* Approval status banner */}
              <div className={`absolute top-0 left-0 w-1.5 h-full ${review.is_approved ? 'bg-green-500' : 'bg-amber-500'}`} />
              
              <div className="flex-1 space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <img
                      src={review.user?.avatar_url || `https://api.dicebear.com/7.x/initials/svg?seed=${review.user?.full_name}`}
                      alt="avatar"
                      className="w-10 h-10 rounded-full border border-[#D8CAF6]"
                    />
                    <div>
                      <h4 className="font-bold text-[#1A0B2E] text-sm">{review.user?.full_name || 'Anonymous User'}</h4>
                      <p className="text-[10px] uppercase font-bold text-[#9667E0]/60 tracking-wider">
                         {review.user?.student_id || 'N/A'}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex bg-[#FAFAFE] border border-[#E0D4F5] px-3 py-1.5 rounded-lg gap-0.5 items-center">
                    <span className="text-xs font-black mr-1 text-[#1A0B2E]">{review.rating}.0</span>
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        size={12}
                        className={star <= review.rating ? 'fill-amber-500 text-amber-500' : 'fill-[#E0D4F5] text-[#E0D4F5]'}
                      />
                    ))}
                  </div>
                </div>

                <div className="bg-[#FAFAFE] border border-[#E0D4F5]/50 rounded-xl p-4">
                  <p className="text-[#2D164B]/80 text-sm leading-relaxed whitespace-pre-wrap">
                    {review.review_text}
                  </p>
                </div>

                <div className="flex items-center gap-4 text-[11px] font-bold uppercase tracking-wider text-[#9667E0]/70">
                    <div className="flex items-center gap-1.5">
                      <Calendar size={12} />
                      {new Date(review.created_at).toLocaleDateString()}
                    </div>
                    {/* Event title relation */}
                    {review.event?.title && (
                      <div className="flex items-center gap-1.5 line-clamp-1">
                        • {review.event.title}
                      </div>
                    )}
                </div>
              </div>

              {/* Actions */}
              <div className="flex md:flex-col items-center justify-center gap-2 border-t md:border-t-0 md:border-l border-[#E0D4F5] pt-4 md:pt-0 md:pl-6 shrink-0">
                {!review.is_approved ? (
                  <button
                    onClick={() => handleStatusUpdate(review.id, true)}
                    className="w-full md:w-auto px-4 py-2 bg-green-50 text-green-600 hover:bg-green-100 hover:text-green-700 rounded-lg text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <Check size={14} /> Approve
                  </button>
                ) : (
                  <button
                    onClick={() => handleStatusUpdate(review.id, false)}
                    className="w-full md:w-auto px-4 py-2 bg-amber-50 text-amber-600 hover:bg-amber-100 hover:text-amber-700 rounded-lg text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <X size={14} /> Unapprove
                  </button>
                )}
                
                <button
                  onClick={() => handleDelete(review.id)}
                  className="w-full md:w-auto px-4 py-2 text-red-500 hover:bg-red-50 rounded-lg text-xs font-bold uppercase tracking-wider transition-colors"
                >
                  Delete
                </button>
              </div>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
}
