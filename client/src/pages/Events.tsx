
import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, MapPin, Clock, Users, ArrowRight, CheckCircle2 } from 'lucide-react';
import { useApi } from '../hooks/useApi';
import { eventService } from '../services/event.service';
import { useAuth } from '../context/AuthContext';
import SEO from '../components/SEO';

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
  creator: {
    id: string;
    full_name: string;
    avatar_url: string | null;
  } | null;
}

interface MyRegistration {
  id: string;
  event_id: string;
  status: string;
}

/* ═══════════════ HELPERS ═══════════════ */

function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' });
}

function formatTime(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
}

/* ── Hero Slider Images ── */
const HERO_IMAGES = [
  { src: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=900&q=80&auto=format', alt: 'Tech conference keynote' },
  { src: 'https://images.unsplash.com/photo-1523580494863-6f3031224c94?w=900&q=80&auto=format', alt: 'Students collaborating' },
  { src: 'https://images.unsplash.com/photo-1591115765373-5207764f72e7?w=900&q=80&auto=format', alt: 'Hackathon coding session' },
  { src: 'https://images.unsplash.com/photo-1505373877841-8d25f7d46678?w=900&q=80&auto=format', alt: 'Workshop presentation' },
  { src: 'https://images.unsplash.com/photo-1475721027785-f74eccf877e2?w=900&q=80&auto=format', alt: 'Speaker on stage' },
  { src: 'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=900&q=80&auto=format', alt: 'Classroom learning' },
  { src: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=900&q=80&auto=format', alt: 'Team brainstorming' },
  { src: 'https://images.unsplash.com/photo-1492538368677-f6e0afe31dcc?w=900&q=80&auto=format', alt: 'Campus event crowd' },
];

/* ── Cinematic Hero Slider ── */
const EventsHeroSlider = () => {
  const doubled = [...HERO_IMAGES, ...HERO_IMAGES];
  const [tileWidth, setTileWidth] = useState(480);

  useEffect(() => {
    const updateWidth = () => setTileWidth(window.innerWidth < 768 ? 300 : 480);
    updateWidth();
    window.addEventListener('resize', updateWidth);
    return () => window.removeEventListener('resize', updateWidth);
  }, []);

  return (
    <div className="events-hero w-full overflow-hidden relative bg-[#1A0B2E]">
      {/* Sliding strip */}
      <div
        className="flex h-full"
        style={{
          width: `${doubled.length * tileWidth}px`,
          animation: 'marquee 25s linear infinite',
        }}
      >
        {doubled.map((img, i) => (
          <div
            key={i}
            className="events-hero-tile flex-shrink-0 h-full"
            style={{ padding: '0 3px' }}
          >
            <img
              src={img.src}
              alt={img.alt}
              loading={i < 8 ? 'eager' : 'lazy'}
              draggable={false}
              className="w-full h-full object-cover select-none"
            />
          </div>
        ))}
      </div>

      {/* Soft edge fades */}
      <div className="absolute inset-y-0 left-0 w-16 md:w-24 pointer-events-none" style={{ background: 'linear-gradient(to right, #1A0B2E, transparent)' }} />
      <div className="absolute inset-y-0 right-0 w-16 md:w-24 pointer-events-none" style={{ background: 'linear-gradient(to left, #1A0B2E, transparent)' }} />

      {/* Bottom gradient for visual separation */}
      <div className="absolute bottom-0 left-0 right-0 h-24 pointer-events-none" style={{ background: 'linear-gradient(to top, white, transparent)' }} />
    </div>
  );
};

/* ── Countdown Timer Component ── */
const CountdownTimer = ({ targetDate }: { targetDate: string }) => {
  const [timeLeft, setTimeLeft] = React.useState({
    days: '00',
    hours: '00',
    minutes: '00',
    seconds: '00'
  });

  React.useEffect(() => {
    const calculateTime = () => {
      const target = new Date(targetDate).getTime();
      const now = new Date().getTime();
      const difference = target - now;

      if (difference > 0) {
        const d = Math.floor(difference / (1000 * 60 * 60 * 24));
        const h = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const m = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
        const s = Math.floor((difference % (1000 * 60)) / 1000);

        setTimeLeft({
          days: d.toString().padStart(2, '0'),
          hours: h.toString().padStart(2, '0'),
          minutes: m.toString().padStart(2, '0'),
          seconds: s.toString().padStart(2, '0')
        });
      } else {
        setTimeLeft({ days: '00', hours: '00', minutes: '00', seconds: '00' });
      }
    };

    calculateTime();
    const timer = setInterval(calculateTime, 1000);
    return () => clearInterval(timer);
  }, [targetDate]);

  return (
    <div className="flex items-center gap-1 md:gap-3 bg-[#F5F1FF] px-4 py-3 rounded-2xl border border-[#D8CAF6] shadow-inner mb-6 w-fit">
      {[
        { val: timeLeft.days, label: 'DAY' },
        { val: timeLeft.hours, label: 'HOUR' },
        { val: timeLeft.minutes, label: 'MIN' },
        { val: timeLeft.seconds, label: 'SEC' }
      ].map((item, i) => (
        <React.Fragment key={i}>
          <div className="flex flex-col items-center min-w-[40px] md:min-w-[50px]">
            <span className="text-lg md:text-2xl font-black text-[#1A0B2E] font-mono tracking-tighter tabular-nums leading-none">
              {item.val}
            </span>
            <span className="text-[8px] md:text-[9px] font-black text-[#9667E0] mt-1 tracking-widest leading-none">
              {item.label}
            </span>
          </div>
          {i < 3 && <span className="text-lg md:text-2xl font-black text-[#D8CAF6] mb-4">:</span>}
        </React.Fragment>
      ))}
    </div>
  );
};

/* ── Upcoming Event Card (horizontal layout — unchanged) ── */
const EventCard = ({ event, registered }: { event: EventAPI; registered: boolean }) => {
  const navigate = useNavigate();

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="bg-white p-5 md:p-8 rounded-[2rem] md:rounded-[2.5rem] border border-[#D8CAF6] shadow-sm flex flex-col md:flex-row gap-6 md:gap-10 group hover:shadow-lg hover:border-[#9667E0] transition-all"
    >
      <div className="w-full md:w-72 h-48 bg-[#EEEAFD] rounded-2xl overflow-hidden relative flex-shrink-0 border border-[#D8CAF6]">
        <img src={event.cover_image || `https://picsum.photos/seed/${event.slug}/600/400`} alt={event.title} loading="lazy" className="w-full h-full object-cover transition-all duration-700 group-hover:scale-110" />
        <div className="absolute top-4 left-4 bg-[#1A0B2E] text-white px-4 py-1 rounded-lg text-xs font-black shadow-lg uppercase tracking-widest">{formatDate(event.event_date)}</div>
      </div>
      <div className="flex-1 flex flex-col justify-between">
        <div>
          <h3 className="text-xl md:text-3xl font-black mb-3 md:mb-4 text-[#1A0B2E] group-hover:text-[#9667E0] transition-colors">{event.title}</h3>
          <p className="text-[#2D164B] mb-5 md:mb-8 text-sm md:text-base font-medium leading-relaxed">{event.short_description || event.description}</p>
          <div className="flex flex-wrap gap-6 text-[10px] text-[#1A0B2E] font-black uppercase tracking-[0.15em] mb-7">
            <div className="flex items-center gap-2 bg-[#EEEAFD] px-3 py-1.5 rounded-lg border border-[#D8CAF6]"><MapPin size={14} className="text-[#9667E0]" /> {event.venue || 'TBA'}</div>
            <div className="flex items-center gap-2 bg-[#EEEAFD] px-3 py-1.5 rounded-lg border border-[#D8CAF6]"><Clock size={14} className="text-[#9667E0]" /> {formatTime(event.event_date)}</div>
            <div className="flex items-center gap-2 bg-[#EEEAFD] px-3 py-1.5 rounded-lg border border-[#D8CAF6]"><Users size={14} className="text-[#9667E0]" /> {event.registration_count}+ RSVPs</div>
          </div>

          {/* Countdown Clock */}
          <CountdownTimer targetDate={event.event_date} />
        </div>
        <div className="mt-8">
          {registered ? (
            <div className="inline-flex items-center gap-2 px-6 py-3 bg-green-50 border border-green-200 rounded-2xl">
              <CheckCircle2 size={18} className="text-green-500" />
              <span className="text-sm font-bold text-green-700 uppercase tracking-widest">Registered ✅</span>
            </div>
          ) : (
            <button
              onClick={() => navigate(`/events/${event.slug}/register`)}
              className="px-6 md:px-10 py-3 md:py-3.5 bg-[#1A0B2E] text-white rounded-2xl text-xs md:text-sm font-black tracking-widest hover:bg-[#4B2C82] transition-colors shadow-lg uppercase cursor-pointer"
            >
              REGISTER FOR EVENT
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
};

/* ── Past Event Card (vertical grid layout) ── */
const PastEventCard = ({ event }: { event: EventAPI }) => {
  const navigate = useNavigate();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="bg-white rounded-2xl overflow-hidden border border-[#D8CAF6] shadow-sm group hover:shadow-xl hover:border-[#9667E0] transition-all flex flex-col"
    >
      {/* Image with date badge */}
      <div className="relative w-full h-52 md:h-56 overflow-hidden bg-[#EEEAFD]">
        <img
          src={event.cover_image || `https://picsum.photos/seed/${event.slug}/600/400`}
          alt={event.title}
          loading="lazy"
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
        />
        <div className="absolute bottom-3 left-3 bg-[#1A0B2E] text-white px-3 py-1 rounded-lg text-[11px] font-black shadow-lg tracking-wider">
          {formatDate(event.event_date)}
        </div>
      </div>

      {/* Content */}
      <div className="p-5 flex flex-col flex-1">
        <h3 className="text-base md:text-lg font-extrabold text-[#1A0B2E] mb-2 leading-snug group-hover:text-[#9667E0] transition-colors">
          {event.title}
        </h3>
        <p className="text-[#2D164B] text-sm font-medium leading-relaxed opacity-80 mb-4 flex-1">
          {event.short_description || event.description}
        </p>
        <button
          onClick={() => navigate(`/events/${event.slug}/highlights`)}
          className="flex items-center gap-2 text-[#9667E0] text-sm font-black hover:gap-3 transition-all tracking-widest uppercase cursor-pointer mt-auto"
        >
          VIEW HIGHLIGHTS <ArrowRight size={18} />
        </button>
      </div>
    </motion.div>
  );
};

/* ── Loading Skeleton ── */
const EventsSkeleton = () => (
  <section className="py-24 px-6 min-h-[600px]" style={{ background: 'linear-gradient(180deg, #FFFFFF 0%, #EEEAFD 100%)' }}>
    <div className="max-w-6xl mx-auto flex flex-col gap-10 max-w-5xl">
      {[1, 2].map(i => (
        <div key={i} className="bg-white p-5 md:p-8 rounded-[2rem] md:rounded-[2.5rem] border border-[#D8CAF6] shadow-sm flex flex-col md:flex-row gap-6 md:gap-10 animate-pulse">
          <div className="w-full md:w-72 h-48 bg-[#EEEAFD] rounded-2xl flex-shrink-0" />
          <div className="flex-1 space-y-4">
            <div className="h-8 w-3/4 bg-[#EEEAFD]/60 rounded-lg" />
            <div className="h-4 w-full bg-[#EEEAFD]/40 rounded" />
            <div className="h-4 w-5/6 bg-[#EEEAFD]/40 rounded" />
            <div className="flex gap-4 mt-4">
              {[1, 2, 3].map(j => <div key={j} className="h-8 w-28 bg-[#EEEAFD]/30 rounded-lg" />)}
            </div>
            <div className="h-12 w-48 bg-[#EEEAFD]/50 rounded-2xl mt-6" />
          </div>
        </div>
      ))}
    </div>
  </section>
);

/* ── Error State ── */
const EventsError = ({ message, onRetry }: { message: string; onRetry: () => void }) => (
  <section className="py-24 px-6 min-h-[600px] flex items-center justify-center" style={{ background: 'linear-gradient(180deg, #FFFFFF 0%, #EEEAFD 100%)' }}>
    <div className="text-center">
      <h2 className="text-2xl font-extrabold text-[#1A0B2E] mb-3">Something went wrong</h2>
      <p className="text-sm text-[#2D164B] opacity-70 font-medium mb-6">{message}</p>
      <button onClick={onRetry} className="px-8 py-3 bg-[#1A0B2E] text-white rounded-2xl text-xs font-black tracking-widest hover:bg-[#4B2C82] transition-colors uppercase cursor-pointer">
        Try Again
      </button>
    </div>
  </section>
);

/* ── Empty State ── */
const EventsEmpty = ({ label }: { label: string }) => (
  <div className="text-center py-20">
    <Calendar size={48} className="text-[#D8CAF6] mx-auto mb-4" />
    <h3 className="text-xl font-extrabold text-[#1A0B2E] mb-2">No {label} Events</h3>
    <p className="text-sm text-[#2D164B] opacity-60 font-medium">Check back later for updates!</p>
  </div>
);

const Events = () => {
  const [activeTab, setActiveTab] = useState('upcoming');
  const { isAuthenticated } = useAuth();

  // Fetch all published events from API
  const { data: events, isLoading, error, refetch } = useApi<EventAPI[]>(
    () => eventService.getPublished(),
    []
  );

  // Fetch user's registrations if logged in
  const { data: myRegistrations } = useApi<MyRegistration[]>(
    () => isAuthenticated
      ? eventService.getMyRegistrations()
      : Promise.resolve({ success: true, data: [], message: '' }),
    [isAuthenticated]
  );

  // Build a set of registered event IDs for quick lookup
  const registeredIds = useMemo(() => {
    if (!myRegistrations) return new Set<string>();
    return new Set(
      myRegistrations
        .filter((r) => r.status === 'registered')
        .map((r) => r.event_id)
    );
  }, [myRegistrations]);

  // Split events into upcoming and past
  const { upcoming, past } = useMemo(() => {
    if (!events) return { upcoming: [], past: [] };
    const now = new Date();
    const upcomingEvents: EventAPI[] = [];
    const pastEvents: EventAPI[] = [];

    for (const ev of events) {
      const eventDate = new Date(ev.event_date);
      if (eventDate >= now || ev.status === 'published' && new Date(ev.end_date || ev.event_date) >= now) {
        upcomingEvents.push(ev);
      } else {
        pastEvents.push(ev);
      }
    }

    // Upcoming: nearest first
    upcomingEvents.sort((a, b) => new Date(a.event_date).getTime() - new Date(b.event_date).getTime());
    // Past: most recent first
    pastEvents.sort((a, b) => new Date(b.event_date).getTime() - new Date(a.event_date).getTime());

    return { upcoming: upcomingEvents, past: pastEvents };
  }, [events]);

  return (
    <div className="w-full">
      <SEO title="Events" description="Discover upcoming and past events by DSC GIETU — workshops, hackathons, tech talks and more at GIET University." />
      {/* ── Hero: Cinematic Photo Slider ── */}
      <EventsHeroSlider />

      {/* ── Tab Buttons (unchanged) ── */}
      <section className="bg-white py-10 text-center px-6">
        <div className="flex justify-center gap-4">
          {['upcoming', 'past'].map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)} className={`px-6 md:px-10 py-2.5 md:py-3 rounded-full font-black text-xs md:text-sm tracking-widest uppercase transition-all ${activeTab === tab ? 'bg-[#1A0B2E] text-white shadow-xl' : 'bg-white text-[#1A0B2E] border border-[#D8CAF6] hover:bg-[#EEEAFD]'}`}>
              {tab} Events
            </button>
          ))}
        </div>
      </section>

      {/* ── Event Cards ── */}
      {isLoading ? (
        <EventsSkeleton />
      ) : error ? (
        <EventsError message={error} onRetry={refetch} />
      ) : (
        <section
          className="py-24 px-6 min-h-[600px]"
          style={{ background: 'linear-gradient(180deg, #FFFFFF 0%, #EEEAFD 100%)' }}
        >
          <div className="max-w-6xl mx-auto">
            <AnimatePresence mode="wait">
              {activeTab === 'upcoming' ? (
                <motion.div
                  key="upcoming"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="flex flex-col gap-10 max-w-5xl mx-auto"
                >
                  {upcoming.length === 0 ? (
                    <EventsEmpty label="Upcoming" />
                  ) : (
                    upcoming.map(event => (
                      <EventCard key={event.id} event={event} registered={registeredIds.has(event.id)} />
                    ))
                  )}
                </motion.div>
              ) : (
                <motion.div
                  key="past"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
                >
                  {past.length === 0 ? (
                    <EventsEmpty label="Past" />
                  ) : (
                    past.map(event => (
                      <PastEventCard key={event.id} event={event} />
                    ))
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </section>
      )}
    </div>
  );
};

export default Events;
