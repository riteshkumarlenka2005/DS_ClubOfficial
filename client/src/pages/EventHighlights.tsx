import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Calendar, MapPin, Clock, Camera, Star, Quote, Play, X, Video } from 'lucide-react';
import { useApi } from '../hooks/useApi';
import { eventHighlightService } from '../services/eventHighlight.service';
import { eventReviewService, EventReview as ReviewType } from '../services/eventReview.service';
import { useAuth } from '../context/AuthContext';

/* ═══════════════ TYPES ═══════════════ */

interface EventAPI {
  id: string;
  title: string;
  slug: string;
  description: string;
  event_date: string;
  end_date: string | null;
  venue: string | null;
  cover_image: string | null;
  status: string;
}

interface HighlightsAPI {
  id: string;
  event_id: string;
  summary: string;
  stats: { label: string; value: string }[];
  photos: string[];
  key_takeaways: string[];
  testimonial_text: string | null;
  testimonial_author: string | null;
}

interface GalleryImage {
  id: string;
  image_url: string;
  title: string | null;
  description: string | null;
  is_cover: boolean;
}

interface BlogVideo {
  id: string;
  title: string;
  slug: string;
  video_url: string | null;
  excerpt: string | null;
  cover_image: string | null;
  category: string | null;
}

interface HighlightsResponse {
  event: EventAPI;
  highlights: HighlightsAPI | null;
  galleryImages: GalleryImage[];
  blogVideos: BlogVideo[];
}

/* ═══════════════ HELPERS ═══════════════ */

function formatEventDate(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-US', {
    month: 'short',
    day: '2-digit',
    year: 'numeric',
  });
}

function formatEventTime(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
  });
}

/* ═══════════════ LIGHTBOX ═══════════════ */

const Lightbox = ({ src, alt, onClose }: { src: string; alt: string; onClose: () => void }) => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    className="fixed inset-0 z-[100] bg-black/90 flex items-center justify-center p-4 cursor-pointer"
    onClick={onClose}
  >
    <button
      onClick={onClose}
      className="absolute top-4 right-4 text-white/80 hover:text-white z-10 cursor-pointer"
    >
      <X size={28} />
    </button>
    <motion.img
      initial={{ scale: 0.85, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      src={src}
      alt={alt}
      className="max-w-full max-h-[90vh] object-contain rounded-lg"
      onClick={(e) => e.stopPropagation()}
    />
  </motion.div>
);

/* ═══════════════ LOADING SKELETON ═══════════════ */

const HighlightsSkeleton = () => (
  <div className="w-full min-h-screen" style={{ background: 'linear-gradient(180deg, #FFFFFF 0%, #EEEAFD 40%, #D8CAF6 100%)' }}>
    <div className="container mx-auto max-w-4xl px-4 py-12 md:py-20">
      <div className="h-4 w-32 bg-[#EEEAFD] rounded animate-pulse mb-8" />
      <div className="rounded-2xl overflow-hidden mb-10">
        <div className="w-full h-56 md:h-72 bg-[#EEEAFD] animate-pulse" />
      </div>
      <div className="bg-white rounded-2xl border border-[#E0D4F5] p-6 md:p-10 mb-8 animate-pulse">
        <div className="h-6 w-40 bg-[#EEEAFD] rounded mb-4" />
        <div className="space-y-2">
          <div className="h-4 w-full bg-[#EEEAFD]/60 rounded" />
          <div className="h-4 w-4/5 bg-[#EEEAFD]/60 rounded" />
          <div className="h-4 w-3/5 bg-[#EEEAFD]/60 rounded" />
        </div>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-8">
        {[1, 2, 3, 4, 5, 6].map(i => (
          <div key={i} className="rounded-xl aspect-[3/2] bg-[#EEEAFD]/60 animate-pulse" />
        ))}
      </div>
    </div>
  </div>
);

/* ═══════════════ REVIEWS SECTION COMPONENT ═══════════════ */

const ParticipantReviews = ({ eventId }: { eventId: string }) => {
  const { user } = useAuth();
  
  // States
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [reviewText, setReviewText] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [submitSuccess, setSubmitSuccess] = useState(false);

  // Fetch reviews and stats
  const { data: reviewsData, refetch } = useApi<{ reviews: ReviewType[], stats: { averageRating: number, totalCount: number } }>(
    () => eventReviewService.getByEventId(eventId),
    [eventId]
  );

  // Fetch eligibility if logged in
  const { data: eligibilityData } = useApi<{ eligible: boolean, reason: string | null }>(
    async () => {
      if (!user) return { eligible: false, reason: null };
      return eventReviewService.checkEligibility(eventId);
    },
    [eventId, user]
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting) return;
    setSubmitError('');
    
    if (rating === 0) return setSubmitError('Please select a rating star.');
    if (reviewText.length < 10) return setSubmitError('Review must be at least 10 characters.');
    if (reviewText.length > 500) return setSubmitError('Review is too long (max 500 characters).');

    setSubmitting(true);
    try {
      await eventReviewService.submitReview(eventId, { rating, review_text: reviewText });
      setSubmitSuccess(true);
      setRating(0);
      setReviewText('');
      refetch(); // Reload to perhaps show pending or if auto-approved
    } catch (err: any) {
      setSubmitError(err.response?.data?.message || err.message || 'Error submitting review');
    } finally {
      setSubmitting(false);
    }
  };

  const reviews = reviewsData?.reviews || [];
  const stats = reviewsData?.stats;

  return (
    <div className="mb-10">
      {/* Header & Stats */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl md:text-2xl font-extrabold text-[#1A0B2E] flex items-center gap-2">
          <Star size={24} className="text-amber-500 fill-amber-500" /> 
          Participant Reviews
        </h2>
        {stats && stats.totalCount > 0 && (
          <div className="text-right">
            <div className="font-extrabold text-[#1A0B2E] text-lg">
              {stats.averageRating} / 5
            </div>
            <div className="text-xs font-bold uppercase tracking-widest text-[#9667E0]/60">
              {stats.totalCount} {stats.totalCount === 1 ? 'Review' : 'Reviews'}
            </div>
          </div>
        )}
      </div>

      {/* Write a Review Form */}
      {user && eligibilityData?.eligible && !submitSuccess && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white rounded-2xl border border-[#D8CAF6] p-6 mb-8 shadow-sm"
        >
          <h3 className="text-sm font-bold uppercase tracking-widest text-[#9667E0] mb-4">Write a Review</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Interactive Stars */}
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  onClick={() => setRating(star)}
                  className="p-1 cursor-pointer transition-transform hover:scale-110 focus:outline-none"
                >
                  <Star
                    size={28}
                    className={`${
                      star <= (hoverRating || rating)
                        ? 'text-amber-500 fill-amber-500'
                        : 'text-[#E0D4F5] fill-[#E0D4F5]/20'
                    } transition-colors`}
                  />
                </button>
              ))}
            </div>
            
            <textarea
              value={reviewText}
              onChange={(e) => setReviewText(e.target.value)}
              placeholder="What did you learn? How was the experience?"
              rows={3}
              className="w-full px-4 py-3 bg-[#FAFAFE] border border-[#D8CAF6] rounded-xl focus:ring-2 focus:ring-[#9667E0] outline-none resize-none text-sm text-[#2D164B]"
            />
            
            <div className="flex items-center justify-between">
              <span className={`text-[10px] font-bold ${reviewText.length > 500 ? 'text-red-500' : 'text-[#9667E0]/60'}`}>
                {reviewText.length} / 500 chars 
                {(reviewText.length > 0 && reviewText.length < 10) && ' (minimum 10 needed)'}
              </span>
              <button
                type="submit"
                disabled={submitting || rating === 0 || reviewText.length < 10 || reviewText.length > 500}
                className="px-6 py-2 bg-[#1A0B2E] text-white rounded-xl text-xs font-black tracking-widest hover:bg-[#4B2C82] transition-colors disabled:opacity-50 disabled:cursor-not-allowed uppercase"
              >
                {submitting ? 'Submitting...' : 'Post Review'}
              </button>
            </div>
            {submitError && <div className="text-red-500 text-xs font-bold mt-2">{submitError}</div>}
          </form>
        </motion.div>
      )}

      {/* Success Message UI after Submit */}
      {submitSuccess && (
        <div className="bg-[#EEEAFD] border border-[#D8CAF6] rounded-2xl p-6 mb-8 text-center">
          <h3 className="text-[#9667E0] font-bold mb-1">Thank you for your review!</h3>
          <p className="text-sm text-[#2D164B]/70">Your review has been submitted and is pending admin approval.</p>
        </div>
      )}

      {/* Ineligible messages (already reviewed, not registered, etc) */}
      {user && eligibilityData && !eligibilityData.eligible && !submitSuccess && (
        <div className="mb-8 p-4 bg-white/50 border border-[#E0D4F5] rounded-xl text-center">
          <p className="text-xs font-bold text-[#9667E0]">{eligibilityData.reason}</p>
        </div>
      )}

      {/* Reviews List */}
      <div className="space-y-4">
        {reviews.length === 0 ? (
          <div className="text-center py-8 border border-dashed border-[#D8CAF6] rounded-2xl bg-white/50">
             <p className="text-sm text-[#2D164B]/60 font-medium">No reviews yet for this event.</p>
          </div>
        ) : (
          reviews.map((rev) => (
            <motion.div
              key={rev.id}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="bg-white rounded-2xl border border-[#E0D4F5] p-5 shadow-sm"
            >
              <div className="flex justify-between items-start mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-[#9667E0] to-[#E0D4F5] shrink-0 overflow-hidden">
                    {rev.user?.avatar_url ? (
                       <img src={rev.user.avatar_url} alt={rev.user.full_name} className="w-full h-full object-cover" />
                    ) : (
                       <div className="w-full h-full flex items-center justify-center text-white font-bold text-xs uppercase">
                         {rev.user?.full_name?.substring(0,2) || 'US'}
                       </div>
                    )}
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-[#1A0B2E]">{rev.user?.full_name || 'Anonymous user'}</h4>
                    <p className="text-[10px] uppercase font-bold text-[#9667E0]/60 tracking-wider">
                      {new Date(rev.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                {/* Static Stars Display */}
                <div className="flex gap-0.5">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      size={14}
                      className={star <= rev.rating ? 'text-amber-500 fill-amber-500' : 'text-[#E0D4F5] fill-[#E0D4F5]'}
                    />
                  ))}
                </div>
              </div>
              <p className="text-sm text-[#2D164B]/80 font-medium leading-relaxed bg-[#FAFAFE] p-4 rounded-xl">
                {rev.review_text}
              </p>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
};


/* ═══════════════ EVENT HIGHLIGHTS PAGE ═══════════════ */

const EventHighlights = () => {
  const { eventSlug } = useParams<{ eventSlug: string }>();
  const navigate = useNavigate();
  const [lightboxImg, setLightboxImg] = useState<string | null>(null);

  const { data, isLoading, error } = useApi<HighlightsResponse>(
    () => eventHighlightService.getBySlug(eventSlug!),
    [eventSlug]
  );

  if (isLoading) return <HighlightsSkeleton />;

  // Determine if there's anything to show
  const hasHighlights = data?.highlights;
  const hasGallery = data?.galleryImages && data.galleryImages.length > 0;
  const hasVideos = data?.blogVideos && data.blogVideos.length > 0;
  const hasAnything = hasHighlights || hasGallery || hasVideos;

  if (error || !data || !hasAnything) {
    return (
      <div className="w-full min-h-screen flex items-center justify-center" style={{ background: 'linear-gradient(180deg, #FFFFFF 0%, #EEEAFD 100%)' }}>
        <div className="text-center">
          <h1 className="text-3xl font-extrabold text-[#1A0B2E] mb-4">Highlights Not Available</h1>
          <p className="text-sm text-[#2D164B] opacity-60 mb-6">
            {error || "This event doesn't have highlights yet. Link gallery images or blog videos to this event to see them here."}
          </p>
          <button onClick={() => navigate('/events')} className="text-[#9667E0] font-bold hover:underline cursor-pointer">
            ← Back to Events
          </button>
        </div>
      </div>
    );
  }

  const event = data.event;
  const highlights = data.highlights;
  const galleryImages = data.galleryImages;
  const blogVideos = data.blogVideos;

  // Combine all photos: highlight photos + gallery images
  const allPhotos: string[] = [
    ...(highlights?.photos || []),
    ...galleryImages.map(img => img.image_url),
  ];

  return (
    <div className="w-full min-h-screen" style={{ background: 'linear-gradient(180deg, #FFFFFF 0%, #EEEAFD 40%, #D8CAF6 100%)' }}>
      <div className="container mx-auto max-w-4xl px-4 py-12 md:py-20">
        {/* Back button */}
        <button
          onClick={() => navigate('/events')}
          className="flex items-center gap-2 text-xs font-bold text-[#9667E0] hover:text-[#1A0B2E] transition-colors uppercase tracking-widest mb-8 cursor-pointer"
        >
          <ArrowLeft size={14} /> Back to Events
        </button>

        {/* Hero Banner */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative rounded-2xl overflow-hidden mb-10"
        >
          <img
            src={event.cover_image || `https://picsum.photos/seed/${event.slug}/1200/500`}
            className="w-full h-56 md:h-72 object-cover"
            alt={event.title}
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#1A0B2E] via-[#1A0B2E]/40 to-transparent" />
          <div className="absolute bottom-6 left-6 right-6">
            <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-[#D8CAF6] mb-1 block">Event Highlights</span>
            <h1 className="text-2xl md:text-4xl font-extrabold text-white tracking-tight">{event.title}</h1>
            <div className="flex flex-wrap gap-4 mt-3">
              {[
                { icon: Calendar, text: formatEventDate(event.event_date) },
                { icon: MapPin, text: event.venue || 'TBA' },
                { icon: Clock, text: formatEventTime(event.event_date) },
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-1.5 text-[10px] font-bold text-white/80 uppercase tracking-wider">
                  <item.icon size={12} /> {item.text}
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* --- REVIEWS SECTION --- */}
        <ParticipantReviews eventId={event.id} />

        {/* Summary (from highlights record) */}
        {highlights?.summary && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-2xl border border-[#E0D4F5] p-6 md:p-10 shadow-sm mb-8"
          >
            <h2 className="text-lg font-extrabold text-[#1A0B2E] mb-3 flex items-center gap-2">
              <Star size={18} className="text-[#9667E0]" /> Event Summary
            </h2>
            <p className="text-sm md:text-base text-[#2D164B] font-medium leading-relaxed opacity-80">{highlights.summary}</p>
          </motion.div>
        )}

        {/* Stats */}
        {highlights?.stats && highlights.stats.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8"
          >
            {highlights.stats.map((stat, i) => (
              <div key={i} className="bg-white rounded-2xl border border-[#E0D4F5] p-5 text-center shadow-sm">
                <div className="text-2xl md:text-3xl font-extrabold text-[#1A0B2E]">{stat.value}</div>
                <div className="text-[9px] font-bold uppercase tracking-[0.2em] text-[#9667E0] mt-1">{stat.label}</div>
              </div>
            ))}
          </motion.div>
        )}

        {/* Photo Gallery — combined from highlights.photos + galleryImages */}
        {allPhotos.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-2xl border border-[#E0D4F5] p-6 md:p-10 shadow-sm mb-8"
          >
            <h2 className="text-lg font-extrabold text-[#1A0B2E] mb-5 flex items-center gap-2">
              <Camera size={18} className="text-[#9667E0]" /> Photo Gallery
              <span className="text-xs font-medium text-[#9667E0]/60 ml-auto">{allPhotos.length} photos</span>
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {allPhotos.map((photo, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.25 + i * 0.03 }}
                  className="rounded-xl overflow-hidden aspect-[3/2] group cursor-pointer"
                  onClick={() => setLightboxImg(photo)}
                >
                  <img
                    src={photo}
                    alt={`${event.title} photo ${i + 1}`}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    loading="lazy"
                  />
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Blog Videos */}
        {blogVideos.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
            className="bg-white rounded-2xl border border-[#E0D4F5] p-6 md:p-10 shadow-sm mb-8"
          >
            <h2 className="text-lg font-extrabold text-[#1A0B2E] mb-5 flex items-center gap-2">
              <Video size={18} className="text-[#9667E0]" /> Videos
              <span className="text-xs font-medium text-[#9667E0]/60 ml-auto">{blogVideos.length} videos</span>
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {blogVideos.map((video) => (
                <div key={video.id} className="rounded-xl overflow-hidden border border-[#E0D4F5] bg-[#FAFAFE]">
                  {video.video_url ? (
                    <video
                      src={video.video_url}
                      controls
                      preload="metadata"
                      playsInline
                      muted
                      className="w-full aspect-video bg-black"
                      poster={video.cover_image || undefined}
                    />
                  ) : video.cover_image ? (
                    <img
                      src={video.cover_image}
                      alt={video.title}
                      className="w-full aspect-video object-cover"
                      loading="lazy"
                    />
                  ) : null}
                  <div className="p-4">
                    <h3 className="font-bold text-sm text-[#1A0B2E] mb-1">{video.title}</h3>
                    {video.excerpt && (
                      <p className="text-xs text-[#2D164B]/60 line-clamp-2">{video.excerpt}</p>
                    )}
                    {video.category && (
                      <span className="inline-block mt-2 text-[9px] font-bold uppercase tracking-widest text-[#9667E0] bg-[#EEEAFD] px-2 py-0.5 rounded-full">
                        {video.category}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Key Takeaways */}
        {highlights?.key_takeaways && highlights.key_takeaways.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-2xl border border-[#E0D4F5] p-6 md:p-10 shadow-sm mb-8"
          >
            <h2 className="text-lg font-extrabold text-[#1A0B2E] mb-4">Key Takeaways</h2>
            <ul className="space-y-3">
              {highlights.key_takeaways.map((item, i) => (
                <li key={i} className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-lg bg-[#EEEAFD] flex items-center justify-center shrink-0 mt-0.5">
                    <span className="text-[10px] font-bold text-[#9667E0]">{i + 1}</span>
                  </div>
                  <span className="text-sm font-semibold text-[#2D164B]">{item}</span>
                </li>
              ))}
            </ul>
          </motion.div>
        )}

        {/* Testimonial */}
        {highlights?.testimonial_text && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35 }}
            className="bg-[#1A0B2E] rounded-2xl p-6 md:p-10 text-white mb-8"
          >
            <Quote size={28} className="text-[#9667E0] mb-4" />
            <p className="text-base md:text-lg font-medium leading-relaxed italic mb-4 opacity-90">
              "{highlights.testimonial_text}"
            </p>
            {highlights.testimonial_author && (
              <div className="text-xs font-bold uppercase tracking-widest text-[#9667E0]">
                — {highlights.testimonial_author}
              </div>
            )}
          </motion.div>
        )}

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="text-center pt-8"
        >
          <button
            onClick={() => navigate('/events')}
            className="px-8 py-3 bg-[#1A0B2E] text-white rounded-2xl text-xs font-black tracking-widest hover:bg-[#4B2C82] transition-colors uppercase cursor-pointer shadow-lg"
          >
            View Upcoming Events
          </button>
        </motion.div>
      </div>

      {/* Lightbox */}
      <AnimatePresence>
        {lightboxImg && (
          <Lightbox
            src={lightboxImg}
            alt={event.title}
            onClose={() => setLightboxImg(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default EventHighlights;