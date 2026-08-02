// FILE: frontend/src/pages/dashboard/StudentDashboard.tsx

import { useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ScanLine, Award, Wallet, CalendarCheck, ChevronRight,
  Clock, MapPin, CheckCircle2, Download, ArrowRight,
  Sparkles, QrCode, CreditCard, GraduationCap,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useApi } from '../../hooks/useApi';
import { attendanceService } from '../../services/attendance.service';
import { certificateService } from '../../services/certificate.service';
import { contributionService } from '../../services/contribution.service';
import { eventService } from '../../services/event.service';

/* ═══════════════ TYPES ═══════════════ */

interface Summary {
  total_attended: number;
  total_certificates: number;
  total_contributions: number;
}

interface AttendanceRecord {
  id: string;
  scanned_at: string;
  verified: boolean;
  events: {
    id: string;
    title: string;
    slug: string;
    event_date: string;
    venue: string | null;
    cover_image: string | null;
  };
}

interface Certificate {
  id: string;
  certificate_title: string;
  issued_at: string;
  events: { id: string; title: string; event_date: string } | null;
}

interface ContributionRequest {
  id: string;
  title: string;
  amount: number;
  qr_image_path: string;
  my_status: string | null;
  created_at: string;
}

interface MyRegistration {
  id: string;
  event_id: string;
  status: string;
}

interface EventAPI {
  id: string;
  title: string;
  slug: string;
  event_date: string;
  venue: string | null;
  cover_image: string | null;
  short_description: string | null;
}

/* ═══════════════ HELPERS ═══════════════ */

function formatDate(d: string) {
  return new Date(d).toLocaleDateString('en-US', {
    month: 'short', day: '2-digit', year: 'numeric',
  });
}

function formatTime(d: string) {
  return new Date(d).toLocaleTimeString('en-US', {
    hour: 'numeric', minute: '2-digit',
  });
}

function getGreeting(): string {
  const h = new Date().getHours();
  if (h < 12) return 'Good Morning';
  if (h < 17) return 'Good Afternoon';
  return 'Good Evening';
}

/* ═══════════════ ANIMATION VARIANTS ═══════════════ */

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] } },
};

/* ═══════════════ SUB-COMPONENTS ═══════════════ */

/* ── Welcome Banner ── */
const WelcomeBanner = ({ name, avatar }: { name: string; avatar?: string | null }) => (
  <motion.div
    variants={itemVariants}
    className="relative overflow-hidden rounded-[2rem] p-6 md:p-8"
    style={{
      background: 'linear-gradient(135deg, #1A0B2E 0%, #4B2C82 50%, #9667E0 100%)',
    }}
  >
    {/* Decorative shapes */}
    <div className="absolute top-0 right-0 w-64 h-64 rounded-full bg-white/5 -translate-y-1/2 translate-x-1/3" />
    <div className="absolute bottom-0 left-1/3 w-40 h-40 rounded-full bg-white/5 translate-y-1/2" />
    <div className="absolute top-6 right-8 hidden md:block">
      <Sparkles size={80} className="text-white/10" />
    </div>

    <div className="relative z-10 flex items-center gap-5">
      <img
        src={avatar || '/default-avatar.png'}
        alt={name}
        className="w-16 h-16 md:w-20 md:h-20 rounded-2xl ring-4 ring-white/20 object-cover"
        referrerPolicy="no-referrer"
      />
      <div>
        <p className="text-white/60 text-sm font-semibold mb-0.5">{getGreeting()} 👋</p>
        <h1 className="text-2xl md:text-3xl font-black text-white tracking-tight">{name}</h1>
        <div className="flex items-center gap-2 mt-2">
          <span className="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest bg-white/15 text-white/80 border border-white/10">
            Student
          </span>
          <span className="text-white/40 text-xs font-medium">
            {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
          </span>
        </div>
      </div>
    </div>
  </motion.div>
);

/* ── Stat Card ── */
const StatCard = ({
  label, value, icon: Icon, color, bgColor, delay,
}: {
  label: string;
  value: number | string;
  icon: any;
  color: string;
  bgColor: string;
  delay: number;
}) => (
  <motion.div
    variants={itemVariants}
    className="bg-white rounded-2xl p-5 border border-[#D8CAF6] shadow-sm hover:shadow-md hover:border-[#9667E0] transition-all group"
  >
    <div className="flex items-center justify-between mb-3">
      <div className={`w-11 h-11 rounded-xl ${bgColor} flex items-center justify-center group-hover:scale-110 transition-transform`}>
        <Icon size={20} className={color} />
      </div>
    </div>
    <p className="text-3xl font-black text-[#1A0B2E] mb-0.5">{value}</p>
    <p className="text-[10px] font-bold text-[#4B2C82]/50 uppercase tracking-[0.2em]">{label}</p>
  </motion.div>
);

/* ── Quick Action Card ── */
const QuickActionCard = ({
  title, description, icon: Icon, to, color, bgColor,
}: {
  title: string;
  description: string;
  icon: any;
  to: string;
  color: string;
  bgColor: string;
}) => {
  const navigate = useNavigate();
  return (
    <motion.button
      variants={itemVariants}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={() => navigate(to)}
      className="bg-white rounded-2xl p-5 border border-[#D8CAF6] shadow-sm hover:shadow-lg hover:border-[#9667E0] transition-all text-left group cursor-pointer w-full"
    >
      <div className={`w-12 h-12 rounded-2xl ${bgColor} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-sm`}>
        <Icon size={22} className={color} />
      </div>
      <h4 className="font-bold text-[#1A0B2E] text-sm mb-1 group-hover:text-[#9667E0] transition-colors">
        {title}
      </h4>
      <p className="text-[11px] text-[#2D164B]/50 font-medium leading-relaxed">
        {description}
      </p>
      <div className="flex items-center gap-1 mt-3 text-[#9667E0] text-[10px] font-bold uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">
        Go <ArrowRight size={12} />
      </div>
    </motion.button>
  );
};

/* ── Section Header ── */
const SectionHeader = ({ icon: Icon, title, actionLabel, actionTo }: {
  icon: any; title: string; actionLabel?: string; actionTo?: string;
}) => (
  <div className="flex items-center justify-between mb-4">
    <div className="flex items-center gap-2.5">
      <Icon size={18} className="text-[#9667E0]" />
      <h3 className="text-base font-extrabold text-[#1A0B2E]">{title}</h3>
    </div>
    {actionLabel && actionTo && (
      <Link
        to={actionTo}
        className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest text-[#9667E0] hover:text-[#4B2C82] transition-colors"
      >
        {actionLabel} <ChevronRight size={14} />
      </Link>
    )}
  </div>
);

/* ═══════════════ LOADING SKELETON ═══════════════ */

const DashboardSkeleton = () => (
  <div className="space-y-6 animate-pulse">
    <div className="rounded-[2rem] h-36 bg-[#EEEAFD]" />
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {[1, 2, 3, 4].map(i => (
        <div key={i} className="bg-white rounded-2xl p-5 border border-[#D8CAF6] h-28" />
      ))}
    </div>
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {[1, 2, 3].map(i => (
        <div key={i} className="bg-white rounded-2xl p-5 border border-[#D8CAF6] h-40" />
      ))}
    </div>
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="bg-white rounded-2xl p-6 border border-[#D8CAF6] h-64" />
      <div className="bg-white rounded-2xl p-6 border border-[#D8CAF6] h-64" />
    </div>
  </div>
);

/* ═══════════════ MAIN COMPONENT ═══════════════ */

export default function StudentDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();

  // ── API Calls ──
  const { data: summary, isLoading: loadingSummary } = useApi<Summary>(
    () => attendanceService.getMySummary(), []
  );

  const { data: attendance, isLoading: loadingAttendance } = useApi<AttendanceRecord[]>(
    () => attendanceService.getMyAttendance(), []
  );

  const { data: certificates, isLoading: loadingCerts } = useApi<Certificate[]>(
    () => certificateService.getMyCertificates(), []
  );

  const { data: activeRequests } = useApi<ContributionRequest[]>(
    () => contributionService.getActiveRequests(), []
  );

  const { data: allEvents } = useApi<EventAPI[]>(
    () => eventService.getPublished(), []
  );

  const { data: myRegistrations } = useApi<MyRegistration[]>(
    () => eventService.getMyRegistrations(), []
  );

  // ── Derived Data ──
  const isLoading = loadingSummary;

  // Recent attendance (last 5)
  const recentAttendance = useMemo(
    () => (attendance || []).slice(0, 5),
    [attendance]
  );

  // Recent certificates (last 4)
  const recentCertificates = useMemo(
    () => (certificates || []).slice(0, 4),
    [certificates]
  );

  // Active pending contributions
  const pendingContributions = useMemo(
    () => (activeRequests || []).filter(r => !r.my_status),
    [activeRequests]
  );

  // Upcoming registered events
  const upcomingRegistered = useMemo(() => {
    if (!allEvents || !myRegistrations) return [];
    const regIds = new Set(
      myRegistrations
        .filter(r => r.status === 'registered')
        .map(r => r.event_id)
    );
    const now = new Date();
    return allEvents
      .filter(e => regIds.has(e.id) && new Date(e.event_date) >= now)
      .sort((a, b) => new Date(a.event_date).getTime() - new Date(b.event_date).getTime())
      .slice(0, 3);
  }, [allEvents, myRegistrations]);

  // ── Show skeleton while initial data loads ──
  if (isLoading) return <DashboardSkeleton />;

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      {/* ── 1. Welcome Banner ── */}
      <WelcomeBanner
        name={user?.full_name || 'Student'}
        avatar={user?.avatar_url}
      />

      {/* ── 2. Stats Row ── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          label="Events Attended"
          value={summary?.total_attended || 0}
          icon={CalendarCheck}
          color="text-[#9667E0]"
          bgColor="bg-[#EEEAFD]"
          delay={0}
        />
        <StatCard
          label="Certificates"
          value={summary?.total_certificates || 0}
          icon={Award}
          color="text-[#4B2C82]"
          bgColor="bg-[#EEEAFD]"
          delay={0.1}
        />
        <StatCard
          label="Contributions"
          value={summary?.total_contributions || 0}
          icon={Wallet}
          color="text-green-600"
          bgColor="bg-green-50"
          delay={0.2}
        />
        <StatCard
          label="Registered Events"
          value={myRegistrations?.filter(r => r.status === 'registered').length || 0}
          icon={GraduationCap}
          color="text-blue-600"
          bgColor="bg-blue-50"
          delay={0.3}
        />
      </div>

      {/* ── 3. Quick Actions ── */}
      <div>
        <motion.p
          variants={itemVariants}
          className="text-[10px] font-bold text-[#4B2C82]/50 uppercase tracking-[0.2em] mb-3 px-1"
        >
          Quick Actions
        </motion.p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <QuickActionCard
            title="Scan Attendance QR"
            description="Mark your attendance at ongoing events"
            icon={QrCode}
            to="/dashboard/scan-qr"
            color="text-white"
            bgColor="bg-gradient-to-br from-[#9667E0] to-[#4B2C82]"
          />
          <QuickActionCard
            title="My Certificates"
            description="View and download your earned certificates"
            icon={Award}
            to="/dashboard/certificates"
            color="text-[#4B2C82]"
            bgColor="bg-[#EEEAFD]"
          />
          <QuickActionCard
            title="Contributions"
            description="View payment requests and submit contributions"
            icon={CreditCard}
            to="/dashboard/contributions"
            color="text-green-600"
            bgColor="bg-green-50"
          />
          <QuickActionCard
            title="Browse Events"
            description="Discover and register for upcoming events"
            icon={CalendarCheck}
            to="/events"
            color="text-blue-600"
            bgColor="bg-blue-50"
          />
        </div>
      </div>

      {/* ── 4. Two-Column: Attendance + Certificates ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Attendance */}
        <motion.div
          variants={itemVariants}
          className="bg-white rounded-[2rem] p-6 border border-[#D8CAF6] shadow-sm"
        >
          <SectionHeader
            icon={CalendarCheck}
            title="Recent Attendance"
            actionLabel="View All"
            actionTo="/dashboard/scan-qr"
          />

          {recentAttendance.length === 0 ? (
            <div className="text-center py-10">
              <div className="w-14 h-14 rounded-2xl bg-[#EEEAFD] flex items-center justify-center mx-auto mb-3">
                <ScanLine size={24} className="text-[#D8CAF6]" />
              </div>
              <p className="text-sm font-bold text-[#1A0B2E] mb-1">No attendance yet</p>
              <p className="text-[11px] text-[#2D164B]/40 font-medium mb-4">
                Scan a QR code at an event to get started
              </p>
              <button
                onClick={() => navigate('/dashboard/scan-qr')}
                className="px-5 py-2 bg-[#1A0B2E] text-white rounded-xl text-[10px] font-black tracking-widest uppercase hover:bg-[#4B2C82] transition-colors cursor-pointer"
              >
                Open Scanner
              </button>
            </div>
          ) : (
            <div className="space-y-2">
              {recentAttendance.map((record, i) => (
                <motion.div
                  key={record.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 + i * 0.06 }}
                  className="flex items-center gap-3 p-3 rounded-xl hover:bg-[#F5F1FE] transition-colors group"
                >
                  <div className="w-9 h-9 rounded-lg bg-green-50 flex items-center justify-center flex-shrink-0 border border-green-200">
                    <CheckCircle2 size={16} className="text-green-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-[#1A0B2E] truncate group-hover:text-[#9667E0] transition-colors">
                      {record.events?.title}
                    </p>
                    <p className="text-[10px] font-bold text-[#4B2C82]/40 uppercase tracking-wider">
                      {formatDate(record.scanned_at)}
                    </p>
                  </div>
                  <span className="px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider bg-green-50 text-green-600 border border-green-200">
                    Present
                  </span>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>

        {/* My Certificates */}
        <motion.div
          variants={itemVariants}
          className="bg-white rounded-[2rem] p-6 border border-[#D8CAF6] shadow-sm"
        >
          <SectionHeader
            icon={Award}
            title="My Certificates"
            actionLabel="View All"
            actionTo="/dashboard/certificates"
          />

          {recentCertificates.length === 0 ? (
            <div className="text-center py-10">
              <div className="w-14 h-14 rounded-2xl bg-[#EEEAFD] flex items-center justify-center mx-auto mb-3">
                <Award size={24} className="text-[#D8CAF6]" />
              </div>
              <p className="text-sm font-bold text-[#1A0B2E] mb-1">No certificates yet</p>
              <p className="text-[11px] text-[#2D164B]/40 font-medium">
                Attend events to earn certificates
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {recentCertificates.map((cert, i) => (
                <motion.div
                  key={cert.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 + i * 0.06 }}
                  className="flex items-center gap-3 p-3 rounded-xl hover:bg-[#F5F1FE] transition-colors group"
                >
                  <div className="w-9 h-9 rounded-lg bg-[#EEEAFD] flex items-center justify-center flex-shrink-0 border border-[#D8CAF6]">
                    <Award size={16} className="text-[#9667E0]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-[#1A0B2E] truncate group-hover:text-[#9667E0] transition-colors">
                      {cert.certificate_title}
                    </p>
                    <p className="text-[10px] font-bold text-[#4B2C82]/40 uppercase tracking-wider">
                      {cert.events?.title || formatDate(cert.issued_at)}
                    </p>
                  </div>
                  <Link
                    to="/dashboard/certificates"
                    className="p-1.5 rounded-lg bg-[#EEEAFD] text-[#9667E0] hover:bg-[#D8CAF6] transition opacity-0 group-hover:opacity-100"
                  >
                    <Download size={14} />
                  </Link>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      </div>

      {/* ── 5. Upcoming Registered Events ── */}
      <motion.div variants={itemVariants}>
        <SectionHeader
          icon={CalendarCheck}
          title="Upcoming Registered Events"
          actionLabel="Browse Events"
          actionTo="/events"
        />

        {upcomingRegistered.length === 0 ? (
          <div className="bg-white rounded-[2rem] p-10 border border-[#D8CAF6] shadow-sm text-center">
            <div className="w-14 h-14 rounded-2xl bg-[#EEEAFD] flex items-center justify-center mx-auto mb-3">
              <CalendarCheck size={24} className="text-[#D8CAF6]" />
            </div>
            <p className="text-sm font-bold text-[#1A0B2E] mb-1">No upcoming events</p>
            <p className="text-[11px] text-[#2D164B]/40 font-medium mb-4">
              Register for events to see them here
            </p>
            <button
              onClick={() => navigate('/events')}
              className="px-6 py-2.5 bg-[#1A0B2E] text-white rounded-xl text-[10px] font-black tracking-widest uppercase hover:bg-[#4B2C82] transition-colors cursor-pointer"
            >
              Explore Events
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {upcomingRegistered.map((event, i) => (
              <motion.div
                key={event.id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 + i * 0.08 }}
                className="bg-white rounded-2xl overflow-hidden border border-[#D8CAF6] shadow-sm hover:shadow-lg hover:border-[#9667E0] transition-all group cursor-pointer"
                onClick={() => navigate(`/events/${event.slug}`)}
              >
                <div className="relative h-36 bg-[#EEEAFD] overflow-hidden">
                  <img
                    src={event.cover_image || `https://picsum.photos/seed/${event.slug}/400/200`}
                    alt={event.title}
                    loading="lazy"
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                  />
                  <div className="absolute top-3 left-3 px-2.5 py-1 bg-[#1A0B2E] text-white rounded-lg text-[10px] font-black tracking-wider shadow-md">
                    {formatDate(event.event_date)}
                  </div>
                  <div className="absolute top-3 right-3 px-2 py-0.5 bg-green-500 text-white rounded-full text-[9px] font-bold uppercase tracking-wider">
                    Registered ✓
                  </div>
                </div>
                <div className="p-4">
                  <h4 className="font-bold text-[#1A0B2E] text-sm mb-2 group-hover:text-[#9667E0] transition-colors truncate">
                    {event.title}
                  </h4>
                  <div className="flex items-center gap-3 text-[10px] font-bold text-[#4B2C82]/50 uppercase tracking-wider">
                    <div className="flex items-center gap-1">
                      <Clock size={10} className="text-[#9667E0]" />
                      {formatTime(event.event_date)}
                    </div>
                    {event.venue && (
                      <div className="flex items-center gap-1">
                        <MapPin size={10} className="text-[#9667E0]" />
                        {event.venue}
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>

      {/* ── 6. Pending Contributions Alert ── */}
      {pendingContributions.length > 0 && (
        <motion.div
          variants={itemVariants}
          className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-[2rem] p-6 border border-amber-200 shadow-sm"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-amber-100 flex items-center justify-center">
                <Wallet size={18} className="text-amber-600" />
              </div>
              <div>
                <h3 className="text-sm font-extrabold text-[#1A0B2E]">
                  Pending Contributions
                </h3>
                <p className="text-[10px] text-amber-700/60 font-medium">
                  {pendingContributions.length} payment{pendingContributions.length > 1 ? 's' : ''} awaiting
                </p>
              </div>
            </div>
            <Link
              to="/dashboard/contributions"
              className="px-4 py-2 bg-amber-600 text-white rounded-xl text-[10px] font-black tracking-widest uppercase hover:bg-amber-700 transition-colors"
            >
              Pay Now
            </Link>
          </div>
          <div className="flex flex-wrap gap-2">
            {pendingContributions.slice(0, 3).map(r => (
              <div
                key={r.id}
                className="flex items-center gap-2 px-3 py-2 bg-white rounded-xl border border-amber-200"
              >
                <span className="text-sm font-bold text-[#1A0B2E]">{r.title}</span>
                <span className="text-xs font-black text-amber-600">₹{r.amount}</span>
              </div>
            ))}
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}