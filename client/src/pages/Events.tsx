import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Calendar, MapPin, Clock, Users, ArrowRight,
  CheckCircle2, Star, Quote, ChevronLeft, ChevronRight, X
} from 'lucide-react';
import { useApi } from '../hooks/useApi';
import { eventService } from '../services/event.service';
import { eventHighlightService } from '../services/eventHighlight.service';
import { useAuth } from '../context/AuthContext';
import SEO from '../components/SEO';
import { AnimatedText } from './Home';

/* ═══════════════ TYPES ═══════════════ */

interface EventAPI {
  id: string;
  title: string;
  slug: string;
  description: string;
  short_description: string | null;
  event_date: string;
  end_date: string | null;
  venue: string | null;
  cover_image: string | null;
  max_participants: number | null;
  status: string;
  registration_count: number;
  creator: { id: string; full_name: string; avatar_url: string | null } | null;
}

interface MyRegistration { id: string; event_id: string; status: string; }

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

/* ═══════════════ HELPERS ═══════════════ */

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' });
}
function formatTime(dateStr: string) {
  return new Date(dateStr).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
}

/* ═══════════════ COUNTDOWN ═══════════════ */

const CountdownTimer = ({ targetDate }: { targetDate: string }) => {
  const [timeLeft, setTimeLeft] = React.useState({ days: '00', hours: '00', minutes: '00', seconds: '00' });

  React.useEffect(() => {
    const calc = () => {
      const diff = new Date(targetDate).getTime() - Date.now();
      if (diff > 0) {
        setTimeLeft({
          days: Math.floor(diff / 86400000).toString().padStart(2, '0'),
          hours: Math.floor((diff % 86400000) / 3600000).toString().padStart(2, '0'),
          minutes: Math.floor((diff % 3600000) / 60000).toString().padStart(2, '0'),
          seconds: Math.floor((diff % 60000) / 1000).toString().padStart(2, '0'),
        });
      } else {
        setTimeLeft({ days: '00', hours: '00', minutes: '00', seconds: '00' });
      }
    };
    calc();
    const t = setInterval(calc, 1000);
    return () => clearInterval(t);
  }, [targetDate]);

  return (
    <div className="flex items-center gap-3 mb-6">
      {[{ val: timeLeft.days, label: 'DAYS' }, { val: timeLeft.hours, label: 'HRS' },
      { val: timeLeft.minutes, label: 'MIN' }, { val: timeLeft.seconds, label: 'SEC' }].map((item, i) => (
        <React.Fragment key={i}>
          <div className="flex flex-col items-center bg-[#1A0B2E] px-3 py-2 rounded-xl min-w-[52px]">
            <span className="text-2xl font-black text-white font-mono tabular-nums leading-none">{item.val}</span>
            <span className="text-[8px] font-black text-[#9667E0] mt-1 tracking-widest">{item.label}</span>
          </div>
          {i < 3 && <span className="text-xl font-black text-[#9667E0]/60 mb-3">:</span>}
        </React.Fragment>
      ))}
    </div>
  );
};

/* ═══════════════ LIGHTBOX ═══════════════ */

const Lightbox = ({ src, onClose }: { src: string; onClose: () => void }) => (
  <motion.div
    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
    className="fixed inset-0 z-[200] bg-black/95 flex items-center justify-center p-4"
    onClick={onClose}
  >
    <button onClick={onClose} className="absolute top-5 right-5 text-white/70 hover:text-white z-10 cursor-pointer bg-white/10 p-2 rounded-full">
      <X size={24} />
    </button>
    <motion.img
      initial={{ scale: 0.85, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
      src={src} alt="Gallery" className="max-w-full max-h-[90vh] object-contain rounded-xl"
      onClick={e => e.stopPropagation()}
    />
  </motion.div>
);

/* ═══════════════ HIGHLIGHTS BLOCK (inline) ═══════════════ */

const EventHighlightsBlock = ({ eventId }: { eventId: string }) => {
  const [lightbox, setLightbox] = useState<string | null>(null);
  const [photoIdx, setPhotoIdx] = useState(0);

  const { data: hlData } = useApi<{ highlights: HighlightsAPI | null; galleryImages: any[] }>(
    () => eventHighlightService.getByEventId(eventId),
    [eventId]
  );

  const hl = hlData?.highlights;
  const gallery = hlData?.galleryImages ?? [];
  const photos = hl?.photos?.length ? hl.photos : gallery.map((g: any) => g.image_url).filter(Boolean);

  if (!hl) return null;

  return (
    <div className="mt-10 border-t border-[#E8E0FF] pt-8">
      {/* Stats */}
      {hl.stats?.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          {hl.stats.map((s, i) => (
            <div key={i} className="bg-[#F5F0FF] rounded-2xl p-4 text-center border border-[#D8CAF6]">
              <div className="text-2xl md:text-3xl font-black text-[#9667E0] leading-none mb-1">{s.value}</div>
              <div className="text-[10px] font-bold uppercase tracking-widest text-[#1A0B2E]/60">{s.label}</div>
            </div>
          ))}
        </div>
      )}

      {/* Summary */}
      {hl.summary && (
        <p className="text-[#2D164B] font-medium leading-relaxed mb-6 text-sm md:text-base border-l-4 border-[#9667E0] pl-4 italic">
          {hl.summary}
        </p>
      )}

      {/* Key Takeaways */}
      {hl.key_takeaways?.length > 0 && (
        <div className="mb-6">
          <h4 className="text-xs font-black uppercase tracking-[0.2em] text-[#9667E0] mb-3">Key Takeaways</h4>
          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {hl.key_takeaways.map((t, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-[#2D164B] font-medium">
                <span className="mt-1 shrink-0 w-4 h-4 rounded-full bg-[#9667E0]/15 flex items-center justify-center">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#9667E0] block" />
                </span>
                {t}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Testimonial */}
      {hl.testimonial_text && (
        <div className="bg-[#1A0B2E] rounded-2xl p-5 mb-6 relative">
          <Quote size={20} className="text-[#9667E0] mb-2" />
          <p className="text-white/90 text-sm font-medium italic leading-relaxed mb-3">"{hl.testimonial_text}"</p>
          {hl.testimonial_author && (
            <p className="text-[#9667E0] text-xs font-black tracking-widest uppercase">— {hl.testimonial_author}</p>
          )}
        </div>
      )}

      {/* Photos */}
      {photos.length > 0 && (
        <div>
          <h4 className="text-xs font-black uppercase tracking-[0.2em] text-[#9667E0] mb-3">Event Photos</h4>
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
            {photos.map((photo, i) => (
              <div
                key={i}
                className="aspect-square rounded-xl overflow-hidden cursor-pointer group relative bg-[#EEEAFD]"
                onClick={() => setLightbox(photo)}
              >
                <img src={photo} alt={`Photo ${i + 1}`} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />
              </div>
            ))}
          </div>
        </div>
      )}

      <AnimatePresence>
        {lightbox && <Lightbox src={lightbox} onClose={() => setLightbox(null)} />}
      </AnimatePresence>
    </div>
  );
};

/* ═══════════════ FULL-WIDTH EVENT SECTION ═══════════════ */

const EventSection = ({
  event,
  registered,
  index,
  isPast,
}: {
  event: EventAPI;
  registered: boolean;
  index: number;
  isPast: boolean;
}) => {
  const navigate = useNavigate();
  const [expanded, setExpanded] = useState(false);
  const imageLeft = index % 2 === 0;

  const imageEl = (
    <motion.div
      initial={{ opacity: 0, x: imageLeft ? -60 : 60 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: false, amount: 0.2 }}
      transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
      className="relative w-full lg:w-[38%] h-[400px] md:h-[480px] lg:h-[600px] shrink-0 overflow-hidden self-stretch"
    >
      <img
        src={event.cover_image || `https://picsum.photos/seed/${event.slug}/800/600`}
        alt={event.title}
        className="w-full h-full object-cover"
      />

    </motion.div>
  );

  const contentEl = (
    <motion.div
      initial={{ opacity: 0, x: imageLeft ? 60 : -60 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: false, amount: 0.2 }}
      transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1], delay: 0.1 }}
      className="flex-1 flex flex-col justify-center px-6 md:px-8 lg:px-10 py-7 lg:py-10"
    >
      {/* Index label */}
      <div className="text-[10px] font-black uppercase tracking-[0.3em] text-[#9667E0] mb-3">
        {isPast ? 'Past Event' : 'Upcoming Event'} &nbsp;/&nbsp; {String(index + 1).padStart(2, '0')}
      </div>

      {/* Title */}
      <h2 className="text-2xl md:text-3xl lg:text-4xl font-black text-[#1A0B2E] leading-tight tracking-tight mb-3">
        {event.title}
      </h2>



      {/* Description */}
      <p className="text-[#2D164B] font-medium leading-relaxed text-sm md:text-base mb-6 opacity-85">
        {event.description || event.short_description}
      </p>

      {/* Countdown for upcoming */}
      {!isPast && <CountdownTimer targetDate={event.event_date} />}

      {/* CTA */}
      {!isPast && (
        <div className="mb-6">
          {registered ? (
            <div className="inline-flex items-center gap-2 px-6 py-3 bg-green-50 border border-green-200 rounded-2xl">
              <CheckCircle2 size={16} className="text-green-500" />
              <span className="text-sm font-black text-green-700 uppercase tracking-widest">Registered ✅</span>
            </div>
          ) : (
            <button
              onClick={() => navigate(`/events/${event.slug}/register`)}
              className="px-8 py-3.5 bg-[#1A0B2E] text-white rounded-2xl text-xs font-black tracking-widest hover:bg-[#9667E0] transition-colors shadow-lg uppercase cursor-pointer"
            >
              Register Now →
            </button>
          )}
        </div>
      )}

      {/* Highlights toggle for past events */}
      {isPast && (
        <button
          onClick={() => setExpanded(e => !e)}
          className="flex items-center gap-2 text-[#9667E0] text-sm font-black hover:gap-3 transition-all tracking-widest uppercase cursor-pointer w-fit mb-2"
        >
          {expanded ? 'Hide Highlights' : 'View Highlights'}
          <motion.span animate={{ rotate: expanded ? 90 : 0 }} transition={{ duration: 0.2 }}>
            <ArrowRight size={16} />
          </motion.span>
        </button>
      )}

      {/* Inline highlights */}
      <AnimatePresence>
        {isPast && expanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.4 }}
            className="overflow-hidden"
          >
            <EventHighlightsBlock eventId={event.id} />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );

  return (
    <div className={`flex flex-col lg:flex-row ${!imageLeft ? 'lg:flex-row-reverse' : ''} border-b border-[#E8E0FF] last:border-b-0`}>
      {imageEl}
      {contentEl}
    </div>
  );
};

/* ═══════════════ LOADING SKELETON ═══════════════ */

const Skeleton = () => (
  <div className="animate-pulse">
    {[1, 2, 3].map(i => (
      <div key={i} className={`flex ${i % 2 === 0 ? 'flex-row-reverse' : 'flex-row'} min-h-[420px] border-b border-[#E8E0FF]`}>
        <div className="w-1/2 bg-[#EEEAFD]" />
        <div className="flex-1 p-14 space-y-5">
          <div className="h-3 w-24 bg-[#D8CAF6] rounded" />
          <div className="h-12 w-3/4 bg-[#EEEAFD] rounded-xl" />
          <div className="h-4 w-full bg-[#EEEAFD]/70 rounded" />
          <div className="h-4 w-5/6 bg-[#EEEAFD]/70 rounded" />
          <div className="flex gap-3">
            {[1, 2, 3].map(j => <div key={j} className="h-8 w-28 bg-[#EEEAFD]/50 rounded-lg" />)}
          </div>
        </div>
      </div>
    ))}
  </div>
);

/* ═══════════════ SECTION DIVIDER ═══════════════ */

const SectionDivider = ({ label }: { label: string }) => (
  <div className="flex items-center gap-4 px-6 md:px-14 py-8 bg-[#1A0B2E]">
    <div className="flex-1 h-px bg-[#9667E0]/30" />
    <span className="text-[10px] font-black uppercase tracking-[0.4em] text-[#9667E0]">{label}</span>
    <div className="flex-1 h-px bg-[#9667E0]/30" />
  </div>
);

/* ═══════════════ MAIN PAGE ═══════════════ */

const Events = () => {
  const { isAuthenticated } = useAuth();

  const { data: events, isLoading, error, refetch } = useApi<EventAPI[]>(
    () => eventService.getPublished(), []
  );

  const { data: myRegistrations } = useApi<MyRegistration[]>(
    () => isAuthenticated
      ? eventService.getMyRegistrations()
      : Promise.resolve({ success: true, data: [], message: '' }),
    [isAuthenticated]
  );

  const registeredIds = useMemo(() => {
    if (!myRegistrations) return new Set<string>();
    return new Set(myRegistrations.filter(r => r.status === 'registered').map(r => r.event_id));
  }, [myRegistrations]);

  const { upcoming, past } = useMemo(() => {
    if (!events) return { upcoming: [], past: [] };
    const now = new Date();
    const up: EventAPI[] = [], ps: EventAPI[] = [];
    for (const ev of events) {
      const d = new Date(ev.event_date);
      if (d >= now || (ev.status === 'published' && new Date(ev.end_date || ev.event_date) >= now)) up.push(ev);
      else ps.push(ev);
    }
    up.sort((a, b) => new Date(a.event_date).getTime() - new Date(b.event_date).getTime());
    ps.sort((a, b) => new Date(b.event_date).getTime() - new Date(a.event_date).getTime());
    return { upcoming: up, past: ps };
  }, [events]);

  return (
    <div className="w-full bg-white">
      <SEO title="Events" description="Discover upcoming and past events by DSC GIETU — workshops, hackathons, tech talks and more." />

      {/* ── Hero Header (Bento Box Design) ── */}
      <section className="w-full bg-[#f4f4f4] p-4 md:p-8 lg:p-12 flex justify-center min-h-[90vh]">
        <div className="max-w-[1400px] w-full grid grid-cols-1 lg:grid-cols-2 bg-white overflow-hidden relative">

          {/* Floating Orb (Center bridge) */}
          <div className="hidden lg:block absolute left-1/2 top-[55%] -translate-x-1/2 -translate-y-1/2 z-20">
            <div className="relative flex items-center justify-center">
              <div className="w-24 h-24 rounded-full shadow-[0_20px_40px_rgba(219,39,119,0.4)] z-10 relative"
                style={{ background: 'radial-gradient(circle at 35% 35%, #fff 0%, #fda4af 20%, #d946ef 60%, #4c1d95 100%)' }} />
              {/* Faint concentric rings */}
              <div className="absolute w-40 h-40 border border-pink-200/50 rounded-full" />
              <div className="absolute w-56 h-56 border border-pink-200/30 rounded-full" />
            </div>
          </div>

          {/* ── Left Column ── */}
          <div className="relative p-6 sm:p-10 md:p-16 lg:p-20 flex flex-col justify-between bg-[#FAFAFA]">


            {/* Subtle radial lines background */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-50">
              <div className="absolute top-1/2 right-0 w-[600px] h-[600px] border border-gray-200 rounded-full -translate-y-1/2 translate-x-1/2" />
              <div className="absolute top-1/2 right-0 w-[800px] h-[800px] border border-gray-100 rounded-full -translate-y-1/2 translate-x-1/2" />
            </div>

            <div className="relative z-10 flex-1">
              <h1 className="text-4xl sm:text-[2.75rem] md:text-6xl lg:text-[4.5rem] font-medium tracking-tight text-[#1A1A1A] leading-[1.05] mb-6 md:mb-8"
                style={{ fontFamily: 'Helvetica, Arial, sans-serif' }}>
                TECH-DRIVEN<br />EVENTS FOR<br />STUDENT DEVELOPERS
              </h1>
              <button
                onClick={() => window.scrollBy({ top: window.innerHeight * 0.8, behavior: 'smooth' })}
                className="inline-flex items-center gap-3 bg-[#1A1A1A] text-white px-8 py-4 hover:bg-black transition-colors text-sm font-semibold cursor-pointer border border-[#1A1A1A]"
              >
                Explore Events <ArrowRight size={18} />
              </button>
            </div>

            {/* Bottom info row */}
            <div className="relative z-10 flex flex-col xl:flex-row justify-between items-start xl:items-end mt-12 md:mt-24 gap-6 md:gap-8">
              <p className="text-gray-500 text-[15px] leading-relaxed max-w-[220px] font-medium">
                Connecting our community with advanced tech for faster, smarter, and more informed careers.
              </p>

              <div className="flex items-center gap-4 bg-white/50 py-2 pl-4 pr-2 rounded-full backdrop-blur-sm border border-gray-100">
                <span className="text-sm font-bold text-[#1A1A1A]">500+ Participants</span>
                <div className="flex -space-x-3">
                  <img src="https://i.pravatar.cc/100?img=11" className="w-9 h-9 rounded-full border-2 border-white grayscale object-cover" alt="User" />
                  <img src="https://i.pravatar.cc/100?img=12" className="w-9 h-9 rounded-full border-2 border-white grayscale object-cover" alt="User" />
                  <img src="https://i.pravatar.cc/100?img=15" className="w-9 h-9 rounded-full border-2 border-white grayscale object-cover" alt="User" />
                  <div className="w-9 h-9 rounded-full border-2 border-white bg-gray-200 flex items-center justify-center text-[10px] font-bold text-gray-600 grayscale">
                    +
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ── Right Column (Grid) ── */}
          <div className="flex flex-col h-[600px] lg:h-auto">

            {/* Top Right Pane */}
            <div className="relative h-[55%] bg-[#dcdcdc] p-10 flex items-center overflow-hidden">
              {/* 3D Wave Mock (Gradient Mesh + Ribs) */}
              <div className="absolute inset-0 opacity-80"
                style={{
                  background: 'radial-gradient(ellipse at 70% 40%, rgba(219,39,119,0.4) 0%, transparent 60%), radial-gradient(ellipse at 30% 60%, rgba(59,130,246,0.3) 0%, transparent 60%)'
                }} />
              <div className="absolute top-1/4 right-0 w-3/4 h-1/2 opacity-30 shadow-2xl"
                style={{
                  background: 'repeating-linear-gradient(90deg, transparent, transparent 4px, rgba(0,0,0,0.1) 4px, rgba(0,0,0,0.1) 8px)',
                  transform: 'skewY(-10deg)',
                }} />

              <div className="relative z-10 flex flex-col justify-end h-full w-full pb-4">
                <div className="flex items-baseline gap-4 max-w-sm flex-wrap sm:flex-nowrap">
                  <h2 className="text-6xl md:text-[5rem] font-bold text-white drop-shadow-md leading-none tracking-tighter">+15</h2>
                  <p className="text-white/95 text-base font-medium drop-shadow-md leading-snug">Total number of tech events and hackathons hosted this year.</p>
                </div>
              </div>
            </div>

            {/* Bottom Right Split */}
            <div className="flex flex-col sm:flex-row h-auto sm:h-[45%]">

              {/* Bottom Right - Left Pane (Purple) */}
              <div className="w-full sm:w-1/2 h-48 sm:h-auto bg-gradient-to-br from-[#c4b5fd] to-[#a855f7] p-8 relative overflow-hidden flex items-center justify-center">
                {/* Ribbed ripple effect */}
                <div className="absolute inset-0 opacity-40 mix-blend-overlay"
                  style={{
                    background: 'repeating-radial-gradient(circle at 50% 50%, transparent, transparent 8px, rgba(255,255,255,0.4) 8px, rgba(255,255,255,0.4) 16px)',
                    transform: 'scaleY(1.5)'
                  }} />
                <div className="absolute inset-0 bg-gradient-to-b from-transparent to-[#a855f7]/50" />

                {/* Abstract light bloom */}
                <div className="w-32 h-48 rounded-full bg-white/30 blur-2xl absolute opacity-60" />
              </div>

              {/* Bottom Right - Right Pane (Orange) */}
              <div className="w-full sm:w-1/2 min-h-[200px] sm:h-auto bg-gradient-to-br from-[#fdba74] to-[#ea580c] p-8 relative flex flex-col justify-end overflow-hidden">
                {/* Ribbed vertical effect */}
                <div className="absolute inset-0 opacity-20 mix-blend-overlay"
                  style={{ background: 'repeating-linear-gradient(90deg, transparent, transparent 2px, rgba(255,255,255,0.8) 2px, rgba(255,255,255,0.8) 4px)' }} />
                <div className="absolute inset-0 bg-gradient-to-t from-[#ea580c]/80 to-transparent" />

                <ul className="space-y-4 relative z-10 w-full">
                  {['Hackathons', 'Workshops', 'Tech Talks', 'Study Jams'].map((item, i) => (
                    <li key={i} className="flex justify-between items-center text-white/90 font-medium text-[15px] hover:text-white transition-colors cursor-pointer group border-b border-white/20 pb-2">
                      <span>{item}</span>
                      <ArrowRight size={16} className="opacity-70 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                    </li>
                  ))}
                </ul>
              </div>

            </div>
          </div>

        </div>
      </section>

      {/* ── Events Body ── */}
      {isLoading ? (
        <Skeleton />
      ) : error ? (
        <div className="py-24 text-center">
          <h2 className="text-2xl font-black text-[#1A0B2E] mb-3">Something went wrong</h2>
          <p className="text-[#2D164B] opacity-60 mb-6 text-sm">{error}</p>
          <button onClick={refetch} className="px-8 py-3 bg-[#1A0B2E] text-white rounded-2xl text-xs font-black tracking-widest hover:bg-[#9667E0] transition-colors uppercase cursor-pointer">
            Try Again
          </button>
        </div>
      ) : (
        <>
          {/* Upcoming */}
          {upcoming.length > 0 && (
            <>
              {upcoming.map((ev, i) => (
                <EventSection key={ev.id} event={ev} registered={registeredIds.has(ev.id)} index={i} isPast={false} />
              ))}
            </>
          )}

          {/* Past */}
          {past.length > 0 && (
            <>
              {past.map((ev, i) => (
                <EventSection key={ev.id} event={ev} registered={false} index={i} isPast={true} />
              ))}
            </>
          )}

          {/* Empty */}
          {upcoming.length === 0 && past.length === 0 && (
            <div className="py-32 text-center">
              <Calendar size={56} className="text-[#D8CAF6] mx-auto mb-4" />
              <h3 className="text-2xl font-black text-[#1A0B2E] mb-2">No Events Yet</h3>
              <p className="text-sm text-[#2D164B] opacity-60 font-medium">Check back later for updates!</p>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Events;
