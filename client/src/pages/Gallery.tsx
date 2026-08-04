import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Maximize2, X, ArrowRight, Heart, Sparkles, Camera, History, ArrowLeft, LayoutGrid, Filter, Newspaper } from 'lucide-react';
import { AnimatedText } from './Home';
import { useApi } from '../hooks/useApi';
import { galleryService } from '../services/gallery.service';
import SEO from '../components/SEO';

/* ═══════════════ API TYPES ═══════════════ */

interface GalleryItemAPI {
  id: string;
  title: string | null;
  image_url: string;
  description: string | null;
  event_id: string | null;
  category: string | null;
  parent_id: string | null;
  is_cover: boolean;
  created_at: string;
  uploader: { id: string; full_name: string; avatar_url: string | null } | null;
  event: { id: string; title: string; slug: string } | null;
}

/* ═══════════════ INTERNAL UI TYPES ═══════════════ */

interface GalleryImage {
  id: string;
  url: string;
}

interface Collection {
  id: string;
  coverId: string;
  year: string;
  cat: string;
  title: string;
  subtitle: string;
  cover: string;
  desc: string;
  images: GalleryImage[];
}

/* ═══════════════ BUILD COLLECTIONS FROM FLAT API DATA ═══════════════ */

function buildCollections(items: GalleryItemAPI[]): Collection[] {
  // Each cover photo becomes its own collection
  return items.map(item => {
    const year = new Date(item.created_at).getFullYear().toString();
    const cat = item.category || 'Events';
    const title = item.event?.title || item.title || 'Highlights';

    return {
      id: item.id,
      coverId: item.id,
      year,
      cat,
      title,
      subtitle: item.description || 'Photo Collection',
      cover: item.image_url,
      desc: item.description || `Photos from ${title}.`,
      images: [
        { id: item.id, url: item.image_url },
      ],
    };
  });
}

interface CompositionBlockProps {
  collection: Collection;
  pattern: 'A' | 'B';
  onEnter: (col: Collection) => void;
}

const CompositionBlock = ({ collection, pattern, onEnter }: CompositionBlockProps) => {
  const isPatternA = pattern === 'A';
  const isPatternB = pattern === 'B';

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className={`flex flex-col md:flex-row items-center gap-6 md:gap-24 mb-12 md:mb-48 ${isPatternB ? 'md:flex-row-reverse' : ''}`}
    >
      <div className="w-full md:w-1/2 space-y-4 md:space-y-8 pl-2 md:pl-0">
        <div className="space-y-2 md:space-y-4">
          <div className="flex items-center gap-2 md:gap-4">
            <div className="w-4 md:w-8 h-[1px] bg-[#9667E0]" />
            <span className="text-[7px] md:text-[10px] font-black uppercase tracking-[0.2em] md:tracking-[0.4em] text-[#9667E0] line-clamp-1">{collection.subtitle}</span>
          </div>
          <h2 className="text-2xl sm:text-4xl md:text-7xl lg:text-8xl font-black text-[#1A0B2E] leading-[1] md:leading-[0.9] tracking-tight uppercase" style={{ fontFamily: "'Poppins', sans-serif" }}>
            <span className="line-clamp-1">{collection.title.split(' ')[0]}</span>
            <span className="font-black lowercase text-[#9667E0] line-clamp-1">{collection.title.split(' ').slice(1).join(' ')}</span>
          </h2>
        </div>
        <p className="text-[10px] md:text-lg text-[#2D164B]/80 leading-relaxed max-w-md font-medium line-clamp-3 md:line-clamp-none">
          {collection.desc}
        </p>
        <button
          onClick={() => onEnter(collection)}
          className="group flex w-min md:w-auto items-center justify-start gap-2 md:gap-4 px-4 py-2 md:px-8 md:py-4 bg-[#1A0B2E] text-white rounded-full shadow-lg uppercase text-[7px] md:text-[10px] font-black tracking-[0.2em] md:tracking-[0.3em] hover:bg-[#4B2C82] transition-all cursor-pointer whitespace-nowrap"
        >
          View <span className="hidden md:inline">Collection</span> <ArrowRight size={10} className="md:w-[14px] md:h-[14px] group-hover:translate-x-1 md:group-hover:translate-x-2 transition-transform" />
        </button>
      </div>

      <div className="w-full md:w-1/2 relative px-2 md:px-0">
        <div className={`absolute -top-4 -bottom-4 md:-top-12 md:-bottom-12 ${isPatternA ? '-right-2 md:-right-12' : '-left-2 md:-left-12'} w-2/3 bg-[#E5E7EB]/40 -z-10`} />
        <div className={`absolute top-8 bottom-8 md:top-24 md:bottom-24 ${isPatternA ? '-left-2 md:-left-8' : '-right-2 md:-right-8'} w-full bg-[#0F172A] -z-20`} />

        <div className="grid grid-cols-12 gap-2 md:gap-4 items-start">
          <motion.div
            whileHover={{ y: -5 }}
            onClick={() => onEnter(collection)}
            className="col-span-12 md:col-span-8 rounded-none overflow-hidden cursor-pointer shadow-2xl relative z-10 aspect-[4/3] md:aspect-[3/4]"
          >
            <img loading="lazy" src={collection.cover} className="w-full h-full object-cover group-hover:scale-105 transition-all duration-700" alt={collection.title} />
          </motion.div>

          <div className="col-span-12 md:col-span-4 flex flex-row md:flex-col gap-2 md:gap-4 pt-2 md:pt-12">
            {[0, 1].map(i => (
              <motion.div
                key={i}
                whileHover={{ x: isPatternA ? 3 : -3 }}
                className="flex-1 rounded-none overflow-hidden shadow-xl aspect-square bg-gray-200"
              >
                <img loading="lazy" src={collection.images[i]?.url || collection.cover} className="w-full h-full object-cover" alt="Gallery image" />
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

const DeepGallery = ({ collection, onBack }: { collection: Collection, onBack: () => void }) => {
  const [selectedImg, setSelectedImg] = useState<GalleryImage | null>(null);
  const [subPhotos, setSubPhotos] = useState<GalleryImage[]>([]);
  const [loadingSubs, setLoadingSubs] = useState(true);

  useEffect(() => {
    window.scrollTo(0, 0);
    // Fetch sub-photos for this cover
    setLoadingSubs(true);
    galleryService.getSubPhotos(collection.coverId)
      .then((res: any) => {
        const photos: GalleryImage[] = (res.data || []).map((p: any) => ({
          id: p.id,
          url: p.image_url,
        }));
        setSubPhotos(photos);
      })
      .catch(() => setSubPhotos([]))
      .finally(() => setLoadingSubs(false));
  }, [collection.coverId]);

  // Merge cover image + sub-photos
  const allImages = [...collection.images, ...subPhotos];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen bg-white"
    >
      <div className="px-4 md:px-12 py-8 md:py-24 max-w-[1800px] mx-auto">
        <button
          onClick={onBack}
          className="group flex w-full md:w-auto justify-center md:justify-start items-center gap-4 text-[10px] md:text-xs font-black uppercase tracking-[0.4em] text-[#9667E0] hover:text-[#1A0B2E] mb-8 md:mb-12 hover:translate-x-[-8px] transition-all cursor-pointer bg-white/50 md:bg-transparent py-4 md:py-0 rounded-xl md:rounded-none shadow-sm md:shadow-none border md:border-transparent border-[#D8CAF6]/30"
        >
          <ArrowLeft size={16} /> Back to Archive
        </button>

        <div className="mb-12 md:mb-24 space-y-4 md:space-y-8 text-center md:text-left">
          <div className="flex items-center justify-center md:justify-start gap-4">
            <span className="text-[9px] md:text-[10px] font-black uppercase tracking-[0.5em] text-[#9667E0]">{collection.year} / {collection.cat}</span>
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-6xl lg:text-9xl font-black text-[#1A0B2E] leading-[1.1] md:leading-none tracking-tight uppercase" style={{ fontFamily: "'Poppins', sans-serif" }}>
            {collection.title}
          </h1>
          <p className="text-sm md:text-xl text-[#2D164B]/70 max-w-2xl font-medium leading-relaxed mx-auto md:mx-0">
            {collection.desc}
          </p>
        </div>

        {/* Masonry Grid Implementation */}
        {loadingSubs ? (
          <div className="columns-2 sm:columns-3 md:columns-3 lg:columns-4 xl:columns-5 gap-2 md:gap-6 space-y-2 md:space-y-6">
            {[1,2,3,4].map(i => (
              <div key={i} className="aspect-square bg-[#EEEAFD]/40 rounded-lg animate-pulse break-inside-avoid" />
            ))}
          </div>
        ) : (
          <div className="columns-2 sm:columns-3 md:columns-3 lg:columns-4 xl:columns-5 gap-2 md:gap-6 space-y-2 md:space-y-6">
            {allImages.map((img) => (
              <motion.div
                key={img.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                onClick={() => setSelectedImg(img)}
                className="relative group cursor-pointer overflow-hidden bg-gray-100 break-inside-avoid"
              >
                <img
                  loading="lazy"
                  src={img.url}
                  className="w-full group-hover:scale-105 transition-all duration-700 ease-out"
                  alt="DSC GIETU Gallery photo"
                />
                <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <Maximize2 className="text-white w-4 h-4 md:w-8 md:h-8" strokeWidth={1} />
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      <AnimatePresence>
        {selectedImg && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[300] bg-white/95 backdrop-blur-xl flex items-center justify-center p-2 sm:p-4 md:p-12 overflow-y-auto"
            onClick={() => setSelectedImg(null)}
          >
            <button className="absolute top-4 right-4 md:top-12 md:right-12 bg-white/50 backdrop-blur-sm p-2 rounded-full text-[#0F172A] hover:rotate-90 transition-transform cursor-pointer shadow-sm border border-[#D8CAF6]/30 z-50">
              <X size={24} className="md:w-10 md:h-10" strokeWidth={1.5} />
            </button>
            <motion.img
              initial={{ y: 20, opacity: 0, scale: 0.95 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              src={selectedImg.url}
              className="max-h-full max-w-full object-contain shadow-4xl"
              onClick={e => e.stopPropagation()}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

/* ── Loading Skeleton ── */
const GallerySkeleton = () => (
  <div className="w-full bg-[#F4F4F4] min-h-screen pb-32">
    <div className="relative pt-32 pb-12 md:py-32 text-center px-6">
      <div className="h-20 md:h-32 w-[80%] md:w-[700px] bg-gray-200 rounded-2xl mx-auto mb-6 animate-pulse" />
      <div className="h-6 w-[60%] md:w-96 bg-gray-200 rounded mx-auto animate-pulse" />
    </div>
    <div className="px-6 md:px-12 py-10 max-w-7xl mx-auto">
      {[1, 2].map(i => (
        <div key={i} className={`flex flex-col md:flex-row items-center gap-4 md:gap-24 mb-12 md:mb-48 animate-pulse ${i % 2 === 0 ? 'md:flex-row-reverse' : ''}`}>
          <div className="w-full md:w-1/2 space-y-4 md:space-y-8">
            <div className="h-3 w-20 bg-gray-200 rounded" />
            <div className="h-12 md:h-20 w-4/5 bg-gray-200 rounded-lg" />
            <div className="h-4 w-full bg-gray-200 rounded" />
            <div className="h-4 w-3/4 bg-gray-200 rounded" />
            <div className="h-12 w-40 bg-gray-200 rounded-full" />
          </div>
          <div className="w-full md:w-1/2">
            <div className="aspect-[3/4] bg-gray-200 rounded-3xl" />
          </div>
        </div>
      ))}
    </div>
  </div>
);

/* ── Error State ── */
const GalleryError = ({ message, onRetry }: { message: string; onRetry: () => void }) => (
  <div className="w-full bg-[#FCFAFE] min-h-screen flex items-center justify-center pb-32">
    <div className="text-center">
      <Camera size={48} className="text-[#D8CAF6] mx-auto mb-6" />
      <h2 className="text-2xl font-extrabold text-[#1A0B2E] mb-3">Something went wrong</h2>
      <p className="text-sm text-[#2D164B] opacity-70 font-medium mb-6">{message}</p>
      <button onClick={onRetry} className="px-8 py-3 bg-[#1A0B2E] text-white rounded-full text-xs font-black tracking-widest hover:bg-[#4B2C82] transition-colors uppercase cursor-pointer">
        Try Again
      </button>
    </div>
  </div>
);

const Gallery: React.FC<{ onSwitchToBlog?: () => void }> = ({ onSwitchToBlog }) => {
  const [yearFilter, setYearFilter] = useState<string>('');
  const [catFilter, setCatFilter] = useState<string>('All');
  const [activeCollection, setActiveCollection] = useState<Collection | null>(null);
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);

  // Fetch approved gallery items from API
  const { data: galleryItems, isLoading, error, refetch } = useApi<GalleryItemAPI[]>(
    () => galleryService.getApproved(),
    []
  );

  // Build collections by grouping items by event
  const collections = useMemo(() => {
    if (!galleryItems || galleryItems.length === 0) return [];
    return buildCollections(galleryItems);
  }, [galleryItems]);

  // Extract dynamic years from data
  const years = useMemo(() => {
    const yrs = [...new Set(collections.map(c => c.year))];
    yrs.sort((a, b) => parseInt(b) - parseInt(a));
    return yrs;
  }, [collections]);

  // Extract dynamic categories from data
  const categories = useMemo(() => {
    const cats = [...new Set(collections.map(c => c.cat))];
    return ['All', ...cats];
  }, [collections]);

  // Set default year filter to latest year
  useEffect(() => {
    if (years.length > 0 && !yearFilter) {
      setYearFilter(years[0]);
    }
  }, [years, yearFilter]);

  const filtered = useMemo(() => {
    return collections.filter(c => {
      const matchesYear = !yearFilter || c.year === yearFilter;
      const matchesCat = catFilter === 'All' || c.cat === catFilter;
      return matchesYear && matchesCat;
    });
  }, [collections, yearFilter, catFilter]);

  if (isLoading) return <GallerySkeleton />;
  if (error) return <GalleryError message={error} onRetry={refetch} />;

  return (
    <div className="w-full bg-[#FCFAFE] relative min-h-screen font-sans selection:bg-[#8C7A66] selection:text-white pb-32">
      <SEO title="Gallery" description="Browse photos and highlights from DSC GIETU events, workshops and community activities at GIET University." />
      <AnimatePresence mode="wait">
        {!activeCollection ? (
          <motion.div
            key="archive"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="fixed inset-0 opacity-[0.03] pointer-events-none z-0" style={{ backgroundImage: 'url("https://www.transparenttextures.com/patterns/paper-fibers.png")' }} />

            <div className="relative z-10">
              {/* ── GALLERY HERO (Minimal Typographic) ── */}
              <section 
                className="w-full min-h-[90vh] md:min-h-screen pt-24 pb-8 px-6 md:px-12 flex flex-col justify-between relative overflow-hidden"
                style={{
                  backgroundColor: '#F8F9FA',
                  backgroundImage: `
                    radial-gradient(circle at 0% 100%, rgba(136, 212, 231, 0.4) 0%, transparent 55vw), 
                    radial-gradient(circle at 100% 100%, rgba(144, 228, 187, 0.4) 0%, transparent 55vw)
                  `
                }}
              >
                
                {/* Typography Area */}
                <div className="flex-1 flex flex-col justify-center max-w-[1400px] w-full mx-auto relative z-10 gap-1 md:gap-3 py-10 md:py-20">
                  
                  {/* Line 1 */}
                  <div className="w-full flex justify-between items-start">
                     <div className="flex-1 flex flex-col">
                       <motion.div 
                         initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                         className="text-[11vw] sm:text-[9.5vw] md:text-[8vw] xl:text-[120px] leading-[0.9] font-black text-[#111111] tracking-[-0.04em] uppercase whitespace-nowrap flex items-center"
                         style={{ fontFamily: 'Helvetica, Arial, sans-serif' }}
                       >
                         <svg width="0.75em" height="0.75em" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" className="mr-3 md:mr-5 -mt-[1%] opacity-90 shrink-0">
                           <path d="M12 2v20M2 12h20M4.93 4.93l14.14 14.14M4.93 19.07L19.07 4.93"/>
                         </svg>
                         VISUALS WORTH
                       </motion.div>
                       
                       <motion.div 
                         initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1, delay: 0.5 }}
                         className="mt-6 md:mt-8 ml-[10%] md:ml-[12%]"
                       >
                         <p className="text-[#111111] font-semibold text-[13px] md:text-[14px] leading-[1.6] max-w-[340px]">
                            DSC GIETU is a strategic tech community that works with innovative, high-growth students looking to launch, learn, or refresh their skills.
                         </p>
                       </motion.div>
                     </div>
                  </div>

                  {/* Line 2 */}
                  <div className="w-full flex justify-end mt-4 md:mt-0">
                     <motion.div 
                       initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
                       className="text-[11vw] sm:text-[9.5vw] md:text-[8vw] xl:text-[120px] leading-[0.9] font-black text-[#111111] tracking-[-0.04em] uppercase whitespace-nowrap pr-[5%] md:pr-[8%]"
                       style={{ fontFamily: 'Helvetica, Arial, sans-serif' }}
                     >
                       RELIVING
                     </motion.div>
                  </div>

                  {/* Line 3 */}
                  <div className="w-full flex justify-center pl-[5%] md:pl-[8%] mt-2 md:mt-0">
                     <motion.div 
                       initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
                       className="text-[11vw] sm:text-[9.5vw] md:text-[8vw] xl:text-[120px] leading-[0.9] font-black text-[#111111] tracking-[-0.04em] uppercase whitespace-nowrap flex items-start"
                       style={{ fontFamily: 'Helvetica, Arial, sans-serif' }}
                     >
                       AGAIN<span className="text-[3vw] md:text-[2vw] xl:text-[30px] mt-[1%] ml-1 md:ml-2 font-bold">™</span>
                     </motion.div>
                  </div>

                </div>

                {/* Bottom Footer Area */}
                <div className="w-full max-w-[1400px] mx-auto flex flex-row items-end justify-between relative z-20 pb-4 md:pb-8">
                   <div className="relative z-20">
                     <button 
                       onClick={() => {
                         const el = document.getElementById('gallery-grid');
                         if (el) el.scrollIntoView({ behavior: 'smooth' });
                       }}
                       className="text-[#111111] font-bold text-[12px] md:text-[14px] tracking-wide uppercase pb-1 border-b-[1.5px] border-[#111111] hover:opacity-60 transition-opacity cursor-pointer"
                     >
                       Here's our gallery
                     </button>
                   </div>
                   <div className="relative z-20">
                     <span className="text-[#111111] font-bold text-[12px] md:text-[14px] tracking-wide uppercase">
                       (SCROLL)
                     </span>
                   </div>
                </div>

              </section>


              <section id="gallery-grid" className="px-4 md:px-12 py-4 md:py-10 sticky top-[72px] md:top-20 z-40 bg-white/95 backdrop-blur-sm border-b border-[#DED4C7]/40 shadow-sm mb-12 md:mb-32">
                <div className="max-w-7xl mx-auto">
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 md:gap-8">
                    {/* Desktop Filters */}
                    <div className="hidden md:flex flex-col lg:flex-row lg:items-center justify-between gap-6 md:gap-8 w-full">
                      <div className="flex items-center gap-2 md:gap-3 overflow-x-auto pb-2 md:pb-0 scrollbar-hide -mx-4 px-4 md:mx-0 md:px-0">
                        {categories.map(cat => (
                          <button
                            key={cat}
                            onClick={() => setCatFilter(cat)}
                            className={`relative px-5 md:px-8 py-2 md:py-3 rounded-full text-[9px] md:text-[10px] font-black uppercase tracking-[0.2em] md:tracking-[0.3em] transition-all whitespace-nowrap cursor-pointer z-10 ${catFilter === cat
                              ? 'bg-[#1A0B2E] text-white shadow-xl translate-y-[-2px]'
                              : 'bg-white text-[#4B2C82] border-transparent hover:bg-[#EEEAFD] hover:text-[#1A0B2E]'
                              }`}
                          >
                            {cat}
                          </button>
                        ))}
                      </div>

                      <div className="flex items-center justify-center lg:justify-end gap-6 border-t md:border-t-0 pt-4 md:pt-0 border-[#DED4C7]/20">
                        {years.map(year => (
                          <button
                            key={year}
                            onClick={() => setYearFilter(year)}
                            className={`text-[9px] md:text-[10px] font-black uppercase tracking-widest transition-all ${yearFilter === year ? 'text-[#1A0B2E] border-b-2 border-[#1A0B2E]' : 'text-[#4B2C82]/60 hover:text-[#1A0B2E]'}`}
                          >
                            {year}
                          </button>
                        ))}
                        {onSwitchToBlog && (
                          <button
                            onClick={onSwitchToBlog}
                            className="flex items-center gap-1.5 px-4 py-1.5 rounded-full text-[9px] md:text-[10px] font-black uppercase tracking-widest bg-[#1A0B2E] text-white hover:bg-[#4B2C82] transition-all cursor-pointer"
                          >
                            <Newspaper size={12} /> Blog
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Mobile Filters */}
                    <div className="md:hidden flex items-center justify-between">
                      <div className="flex flex-col">
                        <span className="text-xs font-black uppercase tracking-widest text-[#1A0B2E]">{catFilter}</span>
                        <span className="text-[10px] font-bold text-[#9667E0]">{yearFilter}</span>
                      </div>
                      <button
                        onClick={() => setIsMobileFilterOpen(!isMobileFilterOpen)}
                        className="flex items-center justify-center w-10 h-10 bg-white border border-[#DED4C7]/40 text-[#1A0B2E] rounded-full shadow-sm hover:bg-[#EEEAFD] transition-colors"
                      >
                        <Filter size={18} strokeWidth={2} />
                      </button>
                    </div>

                    <AnimatePresence>
                      {isMobileFilterOpen && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          className="md:hidden flex flex-col gap-4 overflow-hidden pt-4 border-t border-[#DED4C7]/30 mt-2"
                        >
                          <div className="flex flex-wrap gap-2">
                            {categories.map(cat => (
                              <button
                                key={cat}
                                onClick={() => { setCatFilter(cat); setIsMobileFilterOpen(false); }}
                                className={`px-4 py-2 rounded-full text-[9px] font-black uppercase tracking-[0.2em] transition-all ${catFilter === cat ? 'bg-[#1A0B2E] text-white' : 'bg-[#EEEAFD] text-[#4B2C82]'}`}
                              >
                                {cat}
                              </button>
                            ))}
                          </div>
                          <div className="flex flex-wrap gap-4 pt-4 border-t border-[#DED4C7]/20">
                            {years.map(year => (
                              <button
                                key={year}
                                onClick={() => { setYearFilter(year); setIsMobileFilterOpen(false); }}
                                className={`text-[9px] font-black uppercase tracking-widest transition-all ${yearFilter === year ? 'text-[#1A0B2E] border-b border-[#1A0B2E] pb-1' : 'text-[#4B2C82]/60'}`}
                              >
                                {year}
                              </button>
                            ))}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
              </section>

              <section className="px-6 md:px-12 max-w-7xl mx-auto">
                {filtered.length > 0 ? (
                  filtered.map((col, idx) => (
                    <div key={col.id}>
                      <CompositionBlock
                        collection={col}
                        pattern={idx % 2 === 0 ? 'A' : 'B'}
                        onEnter={setActiveCollection}
                      />
                    </div>
                  ))
                ) : (
                  <div className="py-48 text-center bg-white border border-dashed border-[#D8CAF6] rounded-3xl">
                    <History size={48} className="mx-auto text-[#D8CAF6] mb-6" />
                    <h3 className="text-2xl font-black text-[#2D164B]" style={{ fontFamily: "'Poppins', sans-serif" }}>No records found in this partition.</h3>
                  </div>
                )}
              </section>
            </div>
          </motion.div>
        ) : (
          <div key="deep-gallery-wrapper">
            <DeepGallery
              collection={activeCollection}
              onBack={() => setActiveCollection(null)}
            />
          </div>
        )}
      </AnimatePresence>

      <style>{`.scrollbar-hide::-webkit-scrollbar { display: none; }`}</style>
    </div>
  );
};

export default Gallery;
