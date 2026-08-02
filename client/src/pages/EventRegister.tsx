import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Calendar, MapPin, Clock, Users, CheckCircle2, ArrowLeft, UserPlus, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import LoginModal from '../components/auth/LoginModal';
import { useApi } from '../hooks/useApi';
import { eventService } from '../services/event.service';

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
  is_registered: boolean;
  creator: {
    id: string;
    full_name: string;
    avatar_url: string | null;
  } | null;
}

/* ═══════════════ HELPERS ═══════════════ */

function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-US', {
    month: 'short',
    day: '2-digit',
    year: 'numeric',
  });
}

function formatTime(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
  });
}

/* ═══════════════ LOADING SKELETON ═══════════════ */

const RegisterSkeleton = () => (
  <div className="w-full min-h-screen px-4" style={{ background: 'linear-gradient(180deg, #FFFFFF 0%, #EEEAFD 100%)' }}>
    <div className="container mx-auto max-w-2xl py-12 md:py-20">
      <div className="h-4 w-32 bg-[#EEEAFD] rounded animate-pulse mb-8" />
      <div className="bg-white rounded-2xl border border-[#E0D4F5] shadow-sm overflow-hidden animate-pulse">
        <div className="h-48 md:h-56 bg-[#EEEAFD]" />
        <div className="p-6 md:p-10 space-y-4">
          <div className="h-4 w-full bg-[#EEEAFD]/60 rounded" />
          <div className="h-4 w-4/5 bg-[#EEEAFD]/60 rounded" />
          <div className="flex flex-wrap gap-3 mt-6">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-9 w-28 bg-[#EEEAFD]/40 rounded-xl" />
            ))}
          </div>
          <div className="h-20 w-full bg-[#EEEAFD]/30 rounded-xl mt-6" />
          <div className="h-12 w-full bg-[#EEEAFD]/50 rounded-xl mt-4" />
        </div>
      </div>
    </div>
  </div>
);

/* ═══════════════ EVENT REGISTER PAGE ═══════════════ */

const EventRegister = () => {
  const { eventSlug } = useParams<{ eventSlug: string }>();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();

  const [showLogin, setShowLogin] = useState(false);
  const [registering, setRegistering] = useState(false);
  const [registered, setRegistered] = useState(false);
  const [regError, setRegError] = useState<string | null>(null);

  // ← DYNAMIC: fetch event from API
  const { data: event, isLoading, error } = useApi<EventAPI>(
    () => eventService.getBySlug(eventSlug!),
    [eventSlug]
  );

  // Sync registered state from API data
  React.useEffect(() => {
    if (event?.is_registered) {
      setRegistered(true);
    }
  }, [event]);

  // Loading
  if (isLoading) {
    return <RegisterSkeleton />;
  }

  // Event not found — IDENTICAL to original UI
  if (error || !event) {
    return (
      <div className="w-full min-h-screen flex items-center justify-center" style={{ background: 'linear-gradient(180deg, #FFFFFF 0%, #EEEAFD 100%)' }}>
        <div className="text-center">
          <h1 className="text-3xl font-extrabold text-[#1A0B2E] mb-4">Event Not Found</h1>
          <button onClick={() => navigate('/events')} className="text-[#9667E0] font-bold hover:underline cursor-pointer">← Back to Events</button>
        </div>
      </div>
    );
  }

  // No profile / not logged in → show sign-in prompt with login modal
  if (!isAuthenticated || !user) {
    return (
      <>
        <div className="w-full min-h-screen flex items-center justify-center px-4" style={{ background: 'linear-gradient(180deg, #FFFFFF 0%, #EEEAFD 100%)' }}>
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl border border-[#E0D4F5] shadow-lg p-8 md:p-12 max-w-md w-full text-center"
          >
            <div className="w-16 h-16 rounded-full bg-[#EEEAFD] flex items-center justify-center mx-auto mb-5">
              <UserPlus size={28} className="text-[#9667E0]" />
            </div>
            <h2 className="text-2xl font-extrabold text-[#1A0B2E] mb-3">Sign In Required</h2>
            <p className="text-sm text-[#2D164B] opacity-70 font-medium mb-6 leading-relaxed">
              You need to sign in before registering for <strong>{event.title}</strong>. It only takes a moment!
            </p>
            <button
              onClick={() => setShowLogin(true)}
              className="w-full py-3.5 bg-[#1A0B2E] text-white rounded-xl font-bold uppercase tracking-widest text-sm hover:bg-[#4B2C82] transition-all cursor-pointer"
            >
              Sign In with Google
            </button>
            <button
              onClick={() => navigate('/events')}
              className="mt-3 text-xs font-bold text-[#9667E0] hover:text-[#1A0B2E] transition-colors uppercase tracking-widest cursor-pointer"
            >
              ← Back to Events
            </button>
          </motion.div>
        </div>
        <LoginModal
          isOpen={showLogin}
          onClose={() => setShowLogin(false)}
          redirectMessage={`Sign in to register for ${event.title}`}
        />
      </>
    );
  }

  const handleRegister = async () => {
    if (registering || registered) return;
    try {
      setRegistering(true);
      setRegError(null);
      await eventService.register(event.id);
      setRegistered(true);
    } catch (err: any) {
      const message = err.response?.data?.message || 'Registration failed. Please try again.';
      // If already registered, show success state
      if (message.includes('Already registered')) {
        setRegistered(true);
      } else {
        setRegError(message);
      }
    } finally {
      setRegistering(false);
    }
  };

  return (
    <div className="w-full min-h-screen px-4" style={{ background: 'linear-gradient(180deg, #FFFFFF 0%, #EEEAFD 100%)' }}>
      <div className="container mx-auto max-w-2xl py-12 md:py-20">
        {/* Back button */}
        <button
          onClick={() => navigate('/events')}
          className="flex items-center gap-2 text-xs font-bold text-[#9667E0] hover:text-[#1A0B2E] transition-colors uppercase tracking-widest mb-8 cursor-pointer"
        >
          <ArrowLeft size={14} /> Back to Events
        </button>

        {/* Event Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl border border-[#E0D4F5] shadow-sm overflow-hidden"
        >
          {/* Event Image */}
          <div className="h-48 md:h-56 bg-[#EEEAFD] relative overflow-hidden">
            <img
              src={event.cover_image || `https://picsum.photos/seed/${event.slug}/800/400`}
              loading="lazy"
              className="w-full h-full object-cover"
              alt={event.title}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#1A0B2E]/60 to-transparent" />
            <div className="absolute bottom-4 left-6 right-6">
              <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">{event.title}</h1>
            </div>
          </div>

          {/* Event Details */}
          <div className="p-6 md:p-10">
            <p className="text-sm md:text-base text-[#2D164B] font-medium leading-relaxed mb-6">
              {event.short_description || event.description}
            </p>

            <div className="flex flex-wrap gap-4 mb-8">
              {[
                { icon: Calendar, text: formatDate(event.event_date) },
                { icon: Clock, text: formatTime(event.event_date) },
                { icon: MapPin, text: event.venue || 'TBA' },
                {
                  icon: Users,
                  text: event.max_participants
                    ? `${event.registration_count}/${event.max_participants} RSVPs`
                    : `${event.registration_count}+ RSVPs`,
                },
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-2 bg-[#FAF9FE] border border-[#E0D4F5] rounded-xl px-4 py-2">
                  <item.icon size={14} className="text-[#9667E0]" />
                  <span className="text-[11px] font-bold text-[#1A0B2E] uppercase tracking-wider">{item.text}</span>
                </div>
              ))}
            </div>

            {/* Registrant info */}
            <div className="bg-[#FAF9FE] border border-[#E0D4F5] rounded-xl p-4 mb-6">
              <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-[#9667E0] block mb-2">Registering as</span>
              <div className="flex items-center gap-3">
                {user.avatar_url && (
                  <img
                    src={user.avatar_url}
                    alt={user.full_name}
                    className="w-9 h-9 rounded-full border border-[#E0D4F5]"
                    referrerPolicy="no-referrer"
                  />
                )}
                <div>
                  <div className="text-sm font-bold text-[#1A0B2E]">{user.full_name}</div>
                  <div className="text-xs text-[#2D164B] opacity-60 font-medium">{user.email}</div>
                </div>
              </div>
            </div>

            {/* Error message */}
            {regError && (
              <motion.div
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-3 bg-red-50 border border-red-200 rounded-xl px-6 py-4 mb-6"
              >
                <AlertCircle size={20} className="text-red-500 shrink-0" />
                <div>
                  <span className="text-sm font-bold text-red-700 block">{regError}</span>
                </div>
              </motion.div>
            )}

            {/* Action */}
            {registered ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex items-center gap-3 bg-green-50 border border-green-200 rounded-xl px-6 py-4"
              >
                <CheckCircle2 size={24} className="text-green-500 shrink-0" />
                <div>
                  <span className="text-sm font-bold text-green-700 block">You're registered!</span>
                  <span className="text-xs text-green-600 font-medium">We'll see you at {event.title}. Check your profile for all registrations.</span>
                </div>
              </motion.div>
            ) : (
              <button
                onClick={handleRegister}
                disabled={registering}
                className="w-full py-4 bg-[#1A0B2E] text-white rounded-xl font-bold uppercase tracking-widest text-sm hover:bg-[#4B2C82] transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:scale-100"
              >
                {registering ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Registering...
                  </span>
                ) : (
                  'Confirm Registration'
                )}
              </button>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default EventRegister;

