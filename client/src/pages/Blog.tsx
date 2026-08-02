import React, { useState, useEffect, useMemo, useRef } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Upload, Clock, Eye, Tag, X, AlertCircle, CheckCircle2, Newspaper, TrendingUp, PenTool, Sparkles, Filter, User, Heart, ChevronDown, ChevronUp } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useApi } from '../hooks/useApi';
import { blogService } from '../services/blog.service';
import SEO from '../components/SEO';

/* ═══════════════ TYPES ═══════════════ */

const CATEGORIES = ['All', 'Workshops', 'Tutorials', 'Events', 'Research', 'Community'];

const MAX_UPLOAD_MB = 50;
const MAX_UPLOAD_BYTES = MAX_UPLOAD_MB * 1024 * 1024;

interface BlogVideo {
  id: string;
  title: string;
  description: string;
  content: string;
  thumbnail: string;
  videoUrl: string;
  category: string;
  date: string;
  author: string;
  duration: string;
  views: string;
  tags: string[];
  isUserUpload?: boolean;
}

/* ═══════════════ API → UI TRANSFORM ═══════════════ */

interface BlogAPI {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt: string | null;
  cover_image: string | null;
  author_id: string;
  status: string;
  published_at: string | null;
  tags: string[];
  video_url: string | null;
  category: string | null;
  duration: string | null;
  views_count: number;
  is_user_upload: boolean;
  created_at: string;
  author: {
    id: string;
    full_name: string;
    avatar_url: string | null;
    email?: string;
  };
}

function formatViews(count: number): string {
  if (count >= 1000) {
    return `${(count / 1000).toFixed(1)}K`;
  }
  return count.toString();
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' });
}

function apiToBlogVideo(b: BlogAPI): BlogVideo {
  return {
    id: b.id,
    title: b.title,
    description: b.excerpt || '',
    content: b.content || '',
    thumbnail: b.cover_image || 'https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?auto=format&fit=crop&q=80&w=800',
    videoUrl: b.video_url || '',
    category: b.category || 'Community',
    date: formatDate(b.published_at || b.created_at),
    author: b.author?.full_name || 'DSC Team',
    duration: b.duration || '',
    views: formatViews(b.views_count || 0),
    tags: b.tags || [],
    isUserUpload: b.is_user_upload,
  };
}

/* ═══════════════ VIDEO CARD — IDENTICAL ═══════════════ */

const VideoCard: React.FC<{ video: BlogVideo }> = ({ video }) => {
  const [playing, setPlaying] = useState(false);
  const [expanded, setExpanded] = useState(false);
  
  // Mobile Blob Strategy
  const [isLoadingBlob, setIsLoadingBlob] = useState(false);
  const [localBlobUrl, setLocalBlobUrl] = useState<string | null>(null);

  const handlePlayClick = async () => {
    if (localBlobUrl) {
      setPlaying(true);
      return;
    }

    if (!video.videoUrl) return;

    try {
      setIsLoadingBlob(true);
      const response = await fetch(video.videoUrl);
      const blob = await response.blob();
      const objectUrl = URL.createObjectURL(blob);
      setLocalBlobUrl(objectUrl);
      setPlaying(true);
    } catch (err) {
      console.error("Failed to load video blob, falling back to stream", err);
      // Fallback: just play the stream directly
      setPlaying(true);
    } finally {
      setIsLoadingBlob(false);
    }
  };

  // Cleanup object url to prevent memory leaks
  useEffect(() => {
    return () => {
      if (localBlobUrl) {
        URL.revokeObjectURL(localBlobUrl);
      }
    };
  }, [localBlobUrl]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="group relative"
    >
      <div className="relative rounded-3xl overflow-hidden border border-[#DED4C7]/40 aspect-video bg-[#0F172A] mb-5 shadow-sm group-hover:shadow-2xl transition-all duration-500">
        {playing ? (
          <video
            controls
            autoPlay
            playsInline
            preload="auto"
            poster={video.thumbnail}
            className="w-full h-full object-cover"
            controlsList="nodownload"
            disablePictureInPicture
          >
            <source src={localBlobUrl || video.videoUrl} type="video/mp4" />
            Your browser does not support the video tag.
          </video>
        ) : (
          <>
            <img
              src={video.thumbnail}
              alt={video.title}
              className={`w-full h-full object-cover transition-all duration-700 ease-out ${isLoadingBlob ? 'opacity-50 blur-sm scale-110' : 'opacity-90 group-hover:opacity-100 group-hover:scale-110'}`}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0F172A]/80 via-transparent to-transparent opacity-60 group-hover:opacity-40 transition-opacity" />

            <button
              onClick={handlePlayClick}
              disabled={isLoadingBlob}
              className="absolute inset-0 flex items-center justify-center cursor-pointer z-20"
            >
              <motion.div
                whileHover={{ scale: 1.15 }}
                whileTap={{ scale: 0.95 }}
                className="w-16 h-16 rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center shadow-2xl transition-all duration-300 group-hover:bg-white/20"
              >
                {isLoadingBlob ? (
                  <div className="w-6 h-6 border-3 rounded-full animate-spin border-white/20 border-t-white" />
                ) : (
                  <Play size={24} className="text-white ml-1 transition-transform group-hover:translate-x-0.5" fill="white" />
                )}
              </motion.div>
            </button>

            <div className="absolute top-4 left-4 flex gap-2 z-20">
              <span className="bg-white/10 backdrop-blur-md border border-white/20 text-white px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest">
                {video.category}
              </span>
              {video.isUserUpload && (
                <span className="bg-[#10B981] text-white px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest shadow-lg">
                  Author
                </span>
              )}
            </div>

            {video.duration && (
              <div className="absolute bottom-4 right-4 bg-black/40 backdrop-blur-md px-2.5 py-1 rounded-lg border border-white/10 z-20">
                <span className="text-[10px] font-black text-white tracking-tighter">{video.duration}</span>
              </div>
            )}
          </>
        )}
      </div>

      <div className="px-1">
        <h3 className="text-xl font-black text-[#1A0B2E] leading-tight mb-2 group-hover:text-[#9667E0] transition-colors line-clamp-2" style={{ fontFamily: "'Poppins', sans-serif" }}>
          {video.title}
        </h3>
        <p className={`text-sm text-[#2D164B]/80 font-medium mb-3 leading-relaxed ${expanded ? '' : 'line-clamp-3'}`}>
          {video.description}
        </p>

        {/* Expanded Content */}
        <AnimatePresence>
          {expanded && video.content && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden mb-3"
            >
              <div className="text-sm text-[#2D164B]/70 font-medium leading-relaxed whitespace-pre-wrap border-t border-[#D8CAF6]/20 pt-3">
                {video.content}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {video.tags && video.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-3">
            {video.tags.map((tag: string) => (
              <span
                key={tag}
                className="px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider bg-[#EEEAFD] text-[#4B2C82] rounded-full"
              >
                {tag}
              </span>
            ))}
          </div>
        )}
        <div className="flex items-center justify-between pt-4 border-t border-[#D8CAF6]/30 text-[10px] font-black text-[#9667E0] uppercase tracking-[0.2em]">
          <span>{video.date}</span>
          <button
            onClick={() => setExpanded(!expanded)}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-[#EEEAFD] hover:bg-[#D8CAF6] text-[#4B2C82] transition-all cursor-pointer"
          >
            {expanded ? (
              <><ChevronUp size={14} /> Less</>
            ) : (
              <><ChevronDown size={14} /> More</>
            )}
          </button>
        </div>
      </div>
    </motion.div>
  );
};

/* ═══════════════ UPLOAD MODAL — IDENTICAL UI ═══════════════ */

const UploadModal: React.FC<{ onClose: () => void; onUpload: (video: BlogVideo) => void }> = ({ onClose, onUpload }) => {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const fileRef = useRef<HTMLInputElement>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  if (!isAuthenticated || !user) {
    return createPortal(
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] flex items-center justify-center bg-[#0F172A]/80 backdrop-blur-xl px-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.95, y: 20 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.95, y: 20 }}
          onClick={e => e.stopPropagation()}
          className="bg-white rounded-[2.5rem] border border-[#DED4C7]/30 shadow-2xl p-10 max-w-md w-full text-center"
        >
          <div className="w-20 h-20 bg-[#FDFBF7] rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-sm border border-[#DED4C7]/30">
            <User size={40} className="text-[#8C7A66]" />
          </div>
          <h3 className="text-2xl font-serif text-[#4A3F35] italic mb-3">Profile Required</h3>
          <p className="text-[#6D5F52]/60 font-medium mb-8 leading-relaxed">Join the GIETU Data Science Club community by creating a profile to share your stories.</p>
          <button
            onClick={() => { onClose(); navigate('/profile'); }}
            className="w-full py-4 bg-[#4A3F35] text-white rounded-2xl font-black uppercase tracking-[0.2em] text-xs shadow-xl hover:bg-black transition-all"
          >
            Create Profile
          </button>
          <button onClick={onClose} className="mt-6 text-[10px] font-black text-[#8C7A66] uppercase tracking-widest opacity-60 hover:opacity-100 transition-opacity">Cancel</button>
        </motion.div>
      </motion.div>,
      document.body
    );
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    setError('');
    if (!f) return;
    if (!f.type.startsWith('video/')) {
      setError('Please select a video file (MP4, WebM, MOV).');
      return;
    }
    if (f.size > MAX_UPLOAD_BYTES) {
      setError(`File too large. Maximum size is ${MAX_UPLOAD_MB}MB.`);
      return;
    }
    setFile(f);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !category || !file) {
      setError('Please fill in all required fields.');
      return;
    }

    try {
      // Submit to backend as draft
      await blogService.create({
        title,
        content: description || title,
        excerpt: description || undefined,
        cover_image: 'https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?auto=format&fit=crop&q=80&w=800',
        category,
        duration: 'New',
        tags: [category.toLowerCase()],
      });

      // Optimistic local update with blob URL
      const videoUrl = URL.createObjectURL(file);
      const newVideo: BlogVideo = {
        id: `local-${Date.now()}`,
        title,
        description,
        content: description || title,
        thumbnail: 'https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?auto=format&fit=crop&q=80&w=800',
        videoUrl,
        category,
        date: new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }),
        author: user.full_name,
        duration: 'New',
        views: '0',
        tags: [category.toLowerCase()],
        isUserUpload: true,
      };
      onUpload(newVideo);
      setSuccess(true);
      setTimeout(() => { onClose(); }, 1500);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Upload failed. Please try again.');
    }
  };

  return createPortal(
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] flex items-center justify-center bg-[#0F172A]/80 backdrop-blur-xl p-4 sm:p-6 overflow-y-auto"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, y: 30 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.95, y: 30 }}
        onClick={e => e.stopPropagation()}
        className="bg-[#FDFBF7] rounded-[2rem] md:rounded-[3rem] border border-[#DED4C7]/30 shadow-2xl p-6 sm:p-8 md:p-12 max-w-2xl w-full relative my-auto"
      >
        <button onClick={onClose} className="absolute top-4 right-4 md:top-8 md:right-8 p-2 bg-white/50 backdrop-blur-sm border border-[#DED4C7]/40 shadow-sm md:bg-transparent md:border-transparent md:shadow-none hover:bg-[#DED4C7]/20 rounded-full transition-colors text-[#4A3F35]/60 z-10">
          <X size={20} className="md:w-[24px] md:h-[24px]" />
        </button>

        {success ? (
          <div className="text-center py-12">
            <CheckCircle2 size={64} className="text-[#10B981] mx-auto mb-6" />
            <h3 className="text-3xl font-serif text-[#443B33] italic mb-2">Upload Successful</h3>
            <p className="text-[#6D5F52]/60 font-medium">Your story is being finalized.</p>
          </div>
        ) : (
          <>
            <div className="mb-10 text-center md:text-left">
              <span className="text-[10px] font-black text-[#9667E0] uppercase tracking-[0.5em] mb-3 block">Contribution</span>
              <h2 className="text-3xl md:text-5xl font-black text-[#1A0B2E] leading-tight" style={{ fontFamily: "'Poppins', sans-serif" }}>Share Your Lab Notes</h2>
            </div>

            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 md:gap-8">
              <div className="space-y-4 sm:space-y-6">
                <div>
                  <label className="text-[9px] font-black uppercase tracking-[0.3em] text-[#9667E0] mb-1.5 block">Story Title</label>
                  <input
                    type="text"
                    value={title}
                    onChange={e => setTitle(e.target.value)}
                    placeholder="e.g. My Neural Net Breakthrough"
                    required
                    className="w-full bg-white border border-[#D8CAF6]/50 rounded-xl md:rounded-2xl px-4 py-3 sm:px-5 sm:py-4 text-xs sm:text-sm font-semibold text-[#1A0B2E] outline-none focus:border-[#9667E0] transition-all"
                  />
                </div>
                <div>
                  <label className="text-[9px] font-black uppercase tracking-[0.3em] text-[#9667E0] mb-1.5 block">Category</label>
                  <div className="relative">
                    <select
                      value={category}
                      onChange={e => setCategory(e.target.value)}
                      required
                      className="w-full bg-white border border-[#D8CAF6]/50 rounded-xl md:rounded-2xl px-4 py-3 sm:px-5 sm:py-4 pr-10 text-xs sm:text-sm font-semibold text-[#1A0B2E] outline-none focus:border-[#9667E0] transition-all cursor-pointer appearance-none"
                    >
                      <option value="">Select Domain</option>
                      {CATEGORIES.filter(c => c !== 'All').map(c => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                    <div className="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none text-[#9667E0]">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6" /></svg>
                    </div>
                  </div>
                </div>
                <div>
                  <label className="text-[9px] font-black uppercase tracking-[0.3em] text-[#9667E0] mb-1.5 block">Narrative Description</label>
                  <textarea
                    value={description}
                    onChange={e => setDescription(e.target.value)}
                    placeholder="Briefly describe the insight..."
                    rows={2}
                    className="w-full bg-white border border-[#D8CAF6]/50 rounded-xl md:rounded-2xl px-4 py-3 sm:px-5 sm:py-4 text-xs sm:text-sm font-semibold text-[#1A0B2E] outline-none focus:border-[#9667E0] transition-all resize-none"
                  />
                </div>
              </div>

              <div className="flex flex-col h-full">
                <label className="text-[9px] font-black uppercase tracking-[0.3em] text-[#9667E0] mb-1.5 block">Source Video</label>
                <div
                  onClick={() => fileRef.current?.click()}
                  className="flex-1 min-h-[120px] md:min-h-0 border-2 border-dashed border-[#D8CAF6]/50 hover:border-[#9667E0] rounded-xl md:rounded-3xl p-4 sm:p-6 md:p-8 transition-all flex flex-col items-center justify-center text-center cursor-pointer bg-white group hover:bg-[#EEEAFD]"
                >
                  <input type="file" ref={fileRef} accept="video/*" onChange={handleFileChange} className="hidden" />
                  {file ? (
                    <div className="space-y-2 sm:space-y-4">
                      <CheckCircle2 size={24} className="text-[#10B981] mx-auto md:w-8 md:h-8" />
                      <div>
                        <p className="text-xs sm:text-sm font-black text-[#1A0B2E] truncate max-w-[150px] sm:max-w-[200px] mx-auto">{file.name}</p>
                        <p className="text-[8px] sm:text-[10px] text-[#2D164B]/80 font-bold uppercase tracking-widest mt-1">{(file.size / (1024 * 1024)).toFixed(1)}MB — Ready</p>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-2 sm:space-y-4">
                      <div className="w-10 h-10 sm:w-16 sm:h-16 bg-[#EEEAFD] rounded-xl sm:rounded-2xl flex items-center justify-center mx-auto shadow-sm group-hover:scale-110 transition-transform">
                        <Upload size={16} className="text-[#9667E0] sm:w-[24px] sm:h-[24px]" />
                      </div>
                      <div>
                        <p className="text-[10px] sm:text-xs font-black text-[#1A0B2E] uppercase tracking-widest">Select Narrative</p>
                        <p className="text-[8px] sm:text-[10px] text-[#2D164B]/80 font-medium mt-1 italic">MP4/MOV Max {MAX_UPLOAD_MB}MB</p>
                      </div>
                    </div>
                  )}
                </div>
                {error && <p className="mt-2 sm:mt-4 text-[10px] sm:text-xs font-bold text-red-500 uppercase tracking-widest text-center">{error}</p>}
                <button type="submit" className="mt-4 sm:mt-6 md:mt-8 py-3 sm:py-4 md:py-5 bg-[#1A0B2E] text-white rounded-xl md:rounded-3xl font-black uppercase tracking-[0.3em] text-[9px] md:text-[10px] shadow-2xl hover:bg-[#4B2C82] transition-all">Publish Story</button>
              </div>
            </form>
          </>
        )}
      </motion.div>
    </motion.div>,
    document.body
  );
};

/* ═══════════════ LOADING SKELETON ═══════════════ */

const BlogSkeleton = () => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12 md:gap-16">
    {[1, 2, 3, 4, 5, 6].map(i => (
      <div key={i} className="animate-pulse">
        <div className="rounded-3xl aspect-video bg-[#EEEAFD]/60 mb-5" />
        <div className="px-1 space-y-3">
          <div className="h-6 w-4/5 bg-[#EEEAFD]/60 rounded-lg" />
          <div className="h-4 w-full bg-[#EEEAFD]/40 rounded-lg" />
          <div className="h-4 w-3/5 bg-[#EEEAFD]/40 rounded-lg" />
          <div className="flex justify-between pt-4 border-t border-[#D8CAF6]/20">
            <div className="h-3 w-32 bg-[#EEEAFD]/40 rounded" />
            <div className="h-5 w-14 bg-[#EEEAFD]/50 rounded-md" />
          </div>
        </div>
      </div>
    ))}
  </div>
);

/* ═══════════════ BLOG PAGE ═══════════════ */

const Blog = () => {
  const [activeCategory, setActiveCategory] = useState('All');
  const [showUpload, setShowUpload] = useState(false);
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [localVideos, setLocalVideos] = useState<BlogVideo[]>([]);
  const navigate = useNavigate();

  // ← DYNAMIC: fetch from API
  const { data: rawBlogs, isLoading, error } = useApi<BlogAPI[]>(
    () => blogService.getPublished()
  );

  // Transform API data
  const apiVideos: BlogVideo[] = rawBlogs ? rawBlogs.map(apiToBlogVideo) : [];

  // Merge local uploads (optimistic) with API data
  const allVideos = [...localVideos, ...apiVideos];

  const filteredVideos = useMemo(
    () => activeCategory === 'All' ? allVideos : allVideos.filter(v => v.category === activeCategory),
    [activeCategory, localVideos, apiVideos]
  );

  const handleUpload = (video: BlogVideo) => {
    setLocalVideos(prev => [video, ...prev]);
  };

  return (
    <div className="w-full bg-[#FCFAFE] relative min-h-screen">
      <SEO title="Blog" description="Read articles, tutorials and insights from DSC GIETU members on data science, AI, machine learning and more." />
      {/* Immersive Background Texture */}
      <div className="fixed inset-0 opacity-[0.03] pointer-events-none z-0" style={{ backgroundImage: 'url("https://www.transparenttextures.com/patterns/paper-fibers.png")' }} />

      {/* Animated Orbs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0 opacity-40">
        <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] rounded-full bg-[#10B981]/10 blur-[150px] animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-5%] w-[50%] h-[50%] rounded-full bg-[#8B5CF6]/10 blur-[150px]" />
      </div>

      <div className="relative z-10">
        {/* ── Formal Hero — IDENTICAL ── */}
        <section className="relative py-20 md:py-32 text-center px-4 md:px-6 overflow-hidden" style={{
          background: 'linear-gradient(135deg, #0D0221 0%, #1A0B2E 40%, #2D164B 70%, #1A0B2E 100%)',
        }}>
          <div className="absolute inset-0 pointer-events-none" style={{
            background: 'radial-gradient(ellipse 60% 50% at 30% 40%, rgba(150,103,224,0.2) 0%, transparent 60%), radial-gradient(ellipse 50% 60% at 70% 60%, rgba(75,44,130,0.15) 0%, transparent 50%)',
          }} />

          {[
            { size: 60, x: '15%', y: '20%', delay: 0, duration: 6, rotate: 45 },
            { size: 40, x: '80%', y: '25%', delay: 1, duration: 8, rotate: -30 },
            { size: 80, x: '70%', y: '65%', delay: 2, duration: 7, rotate: 60 },
            { size: 50, x: '25%', y: '70%', delay: 0.5, duration: 9, rotate: -45 },
            { size: 35, x: '50%', y: '15%', delay: 3, duration: 10, rotate: 20 },
            { size: 45, x: '90%', y: '50%', delay: 1.5, duration: 6.5, rotate: -60 },
          ].map((shape, i) => (
            <motion.div
              key={i}
              className="absolute pointer-events-none"
              style={{
                left: shape.x, top: shape.y,
                width: shape.size, height: shape.size,
                border: `2px solid rgba(150,103,224,${0.15 + i * 0.03})`,
                borderRadius: i % 3 === 0 ? '50%' : i % 3 === 1 ? '8px' : '0px',
                transform: `rotate(${shape.rotate}deg)`,
              }}
              animate={{
                y: [0, -30, 10, 0],
                x: [0, 15, -10, 0],
                rotate: [shape.rotate, shape.rotate + 180, shape.rotate + 360],
                scale: [1, 1.1, 0.9, 1],
              }}
              transition={{ duration: shape.duration, repeat: Infinity, delay: shape.delay, ease: 'easeInOut' }}
            />
          ))}

          {[
            { size: 250, x: '10%', y: '30%', color: '#9667E0' },
            { size: 200, x: '75%', y: '50%', color: '#4B2C82' },
            { size: 180, x: '50%', y: '10%', color: '#D8CAF6' },
          ].map((orb, i) => (
            <motion.div
              key={`orb-${i}`}
              className="absolute rounded-full pointer-events-none"
              style={{
                width: orb.size, height: orb.size,
                left: orb.x, top: orb.y,
                background: `radial-gradient(circle, ${orb.color}18 0%, transparent 70%)`,
                filter: 'blur(50px)',
              }}
              animate={{
                scale: [1, 1.3, 1],
                opacity: [0.4, 0.7, 0.4],
              }}
              transition={{ duration: 5 + i * 2, repeat: Infinity, ease: 'easeInOut' }}
            />
          ))}

          <div className="absolute inset-0 pointer-events-none overflow-hidden" style={{ perspective: '600px' }}>
            <motion.div
              className="absolute w-[200%] h-[200%] -left-1/2 -top-1/2"
              style={{
                backgroundImage: 'linear-gradient(rgba(150,103,224,0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(150,103,224,0.08) 1px, transparent 1px)',
                backgroundSize: '50px 50px',
                transformOrigin: 'center center',
                transform: 'rotateX(60deg) translateZ(-100px)',
              }}
              animate={{ y: ['0%', '2.5%'] }}
              transition={{ duration: 4, repeat: Infinity, repeatType: 'reverse', ease: 'linear' }}
            />
          </div>

          <motion.div
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none"
            animate={{ rotate: 360 }}
            transition={{ duration: 30, repeat: Infinity, ease: 'linear' }}
          >
            <div className="w-[350px] h-[350px] md:w-[500px] md:h-[500px] rounded-full border border-[#9667E0]/10" />
          </motion.div>
          <motion.div
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none"
            animate={{ rotate: -360 }}
            transition={{ duration: 45, repeat: Infinity, ease: 'linear' }}
          >
            <div className="w-[280px] h-[280px] md:w-[400px] md:h-[400px] rounded-full border border-dashed border-[#D8CAF6]/8" />
          </motion.div>

          <div className="relative z-10 text-center flex flex-col items-center justify-center">
            <h1 className="text-3xl sm:text-4xl md:text-9xl font-black mb-6 md:mb-8 text-white tracking-tight drop-shadow-[0_0_40px_rgba(150,103,224,0.4)]" style={{ fontFamily: "'Poppins', sans-serif", color: 'white' }}>
              Blog & Updates
            </h1>
            <p className="text-white/70 text-lg md:text-2xl max-w-2xl mx-auto font-bold leading-relaxed px-4">
              Technical articles, workshop recordings, and stories from the Data Science Club GIETU.
            </p>
          </div>
        </section>

        {/* ── Editorial Filters — IDENTICAL ── */}
        <section className="px-4 md:px-12 py-4 md:py-10 sticky top-[72px] md:top-20 z-40 bg-white/95 backdrop-blur-sm border-b border-[#DED4C7]/40 shadow-sm">
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
              <div className="hidden md:flex items-center gap-3 overflow-x-auto pb-4 md:pb-0 scrollbar-hide">
                {CATEGORIES.map(cat => (
                  <button
                    key={cat}
                    onClick={() => setActiveCategory(cat)}
                    className={`relative px-8 py-3 rounded-full text-[10px] font-black uppercase tracking-[0.3em] transition-all whitespace-nowrap cursor-pointer z-10 ${activeCategory === cat
                      ? 'bg-[#1A0B2E] text-white shadow-xl scale-105'
                      : 'bg-white text-[#4B2C82] border border-[#D8CAF6] hover:bg-[#EEEAFD] hover:text-[#1A0B2E]'
                      }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              <div className="md:hidden flex items-center justify-between w-full">
                <div className="flex flex-col">
                  <span className="text-xs font-black uppercase tracking-widest text-[#1A0B2E]">{activeCategory}</span>
                </div>
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => setShowUpload(true)}
                    className="flex items-center justify-center w-10 h-10 bg-[#1A0B2E] text-white rounded-full shadow-md hover:bg-[#4B2C82] transition-colors"
                  >
                    <Upload size={16} strokeWidth={2} />
                  </button>
                  <button
                    onClick={() => setShowMobileFilters(!showMobileFilters)}
                    className="flex items-center justify-center w-10 h-10 bg-white border border-[#DED4C7]/40 text-[#1A0B2E] rounded-full shadow-sm hover:bg-[#EEEAFD] transition-colors"
                  >
                    <Filter size={18} strokeWidth={2} />
                  </button>
                </div>
              </div>

              {showMobileFilters && (
              <div className="md:hidden w-full flex flex-col gap-2 pt-4 border-t border-[#DED4C7]/30">
                <div className="flex flex-wrap gap-2">
                  {CATEGORIES.map(cat => (
                    <button
                      key={cat}
                      onClick={() => {
                        setActiveCategory(cat);
                        setShowMobileFilters(false);
                      }}
                      className={`px-4 py-2 rounded-full text-[9px] font-black uppercase tracking-[0.2em] transition-all ${activeCategory === cat ? 'bg-[#1A0B2E] text-white' : 'bg-[#EEEAFD] text-[#4B2C82]'}`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>
              )}

              <div className="hidden md:flex items-center gap-4 text-[#0F172A]/60">
                <span className="text-[10px] font-black uppercase tracking-widest">
                  {isLoading ? '...' : `${filteredVideos.length} Documented Stories`}
                </span>
                <div className="w-px h-6 bg-[#DED4C7]/50" />
                <button
                  onClick={() => setShowUpload(true)}
                  className="flex items-center gap-2 hover:text-[#1A0B2E] transition-colors text-[10px] font-black uppercase tracking-widest bg-white px-4 py-2 rounded-full border border-[#D8CAF6] text-[#9667E0]"
                >
                  <Upload size={14} /> Contribute
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* ── Content Archive — DYNAMIC ── */}
        <section className="px-6 md:px-12 pb-32">
          <div className="max-w-7xl mx-auto">
            {isLoading ? (
              <BlogSkeleton />
            ) : error ? (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-40">
                <div className="w-20 h-20 bg-white rounded-[2rem] flex items-center justify-center mx-auto mb-6 shadow-sm border border-red-200 opacity-80">
                  <AlertCircle size={32} className="text-red-400" />
                </div>
                <p className="text-lg font-black text-red-400 mb-4" style={{ fontFamily: "'Poppins', sans-serif" }}>{error}</p>
                <button
                  onClick={() => window.location.reload()}
                  className="px-6 py-3 bg-[#1A0B2E] text-white rounded-2xl font-bold hover:bg-[#4B2C82] transition-colors"
                >
                  Retry
                </button>
              </motion.div>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12 md:gap-16">
                  <AnimatePresence mode="popLayout">
                    {filteredVideos.map(video => (
                      <VideoCard key={video.id} video={video} />
                    ))}
                  </AnimatePresence>
                </div>

                {filteredVideos.length === 0 && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-40">
                    <div className="w-20 h-20 bg-white rounded-[2rem] flex items-center justify-center mx-auto mb-6 shadow-sm border border-[#D8CAF6] opacity-60">
                      <Sparkles size={32} className="text-[#9667E0]" />
                    </div>
                    <p className="text-lg font-black text-[#2D164B]/40" style={{ fontFamily: "'Poppins', sans-serif" }}>The lab is silent in this domain... for now.</p>
                  </motion.div>
                )}
              </>
            )}
          </div>
        </section>
      </div>

      {/* ── Upload Modal ── */}
      <AnimatePresence>
        {showUpload && <UploadModal onClose={() => setShowUpload(false)} onUpload={handleUpload} />}
      </AnimatePresence>
    </div>
  );
};

export default Blog;

