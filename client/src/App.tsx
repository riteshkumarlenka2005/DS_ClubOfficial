import React, { Suspense, lazy, useEffect } from 'react';
import Lenis from 'lenis';
import 'lenis/dist/lenis.css';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);
import { Routes, Route, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ScrollToTop from './components/ScrollToTop';
import LoadingScreen from './components/LoadingScreen';
import CommunityMarquee from './components/CommunityMarquee';
import { AnimatePresence, motion } from 'framer-motion';
import ProtectedRoute from './components/auth/ProtectedRoute';
import RoleProtectedRoute from './components/auth/RoleProtectedRoute';

// Public pages
const Home = lazy(() => import('./pages/Home'));
const Alumni = lazy(() => import('./pages/Alumni'));
const Projects = lazy(() => import('./pages/Projects'));
const Events = lazy(() => import('./pages/Events'));
const Gallery = lazy(() => import('./pages/Gallery'));
const Blog = lazy(() => import('./pages/Blog'));
const About = lazy(() => import('./pages/About'));
const JoinUs = lazy(() => import('./pages/JoinUs'));
const TechResource = lazy(() => import('./pages/TechResource'));
const Profile = lazy(() => import('./pages/Profile'));
const EventRegister = lazy(() => import('./pages/EventRegister'));
const EventHighlights = lazy(() => import('./pages/EventHighlights'));
const PrivacyPolicy = lazy(() => import('./pages/PrivacyPolicy'));
const Terms = lazy(() => import('./pages/Terms'));

// Dashboard pages (all roles)
const DashboardLayout = lazy(() => import('./layouts/DashboardLayout'));
const DashboardHome = lazy(() => import('./pages/dashboard/DashboardHome'));
const DashboardOverview = lazy(() => import('./pages/dashboard/DashboardOverview'));
const MyEvents = lazy(() => import('./pages/dashboard/MyEvents'));
const MyBlogs = lazy(() => import('./pages/dashboard/MyBlogs'));
const MyGallery = lazy(() => import('./pages/dashboard/MyGallery'));
const MyRegistrations = lazy(() => import('./pages/dashboard/MyRegistrations'));
const ScanAttendance = lazy(() => import('./pages/dashboard/ScanAttendance'));
const MyCertificates = lazy(() => import('./pages/dashboard/MyCertificates'));
const MyContributions = lazy(() => import('./pages/dashboard/MyContributions'));

// Admin pages
const AdminOverview = lazy(() => import('./pages/admin/AdminOverview'));
const ManageUsers = lazy(() => import('./pages/admin/ManageUsers'));
const AdminEvents = lazy(() => import('./pages/admin/AdminEvents'));
const AdminBlogs = lazy(() => import('./pages/admin/AdminBlogs'));
const AdminGallery = lazy(() => import('./pages/admin/AdminGallery'));
const AdminProjects = lazy(() => import('./pages/admin/AdminProjects'));
const AdminAlumni = lazy(() => import('./pages/admin/AdminAlumni'));
const ActivityLog = lazy(() => import('./pages/admin/ActivityLog'));
const AdminTeam = lazy(() => import('./pages/admin/AdminTeam'));
const AdminMembers = lazy(() => import('./pages/admin/AdminMembers'));
const AttendanceManager = lazy(() => import('./pages/admin/AttendanceManager'));
const CertificateManager = lazy(() => import('./pages/admin/CertificateManager'));
const ContributionManager = lazy(() => import('./pages/admin/ContributionManager'));
const ReviewManagement = lazy(() => import('./pages/dashboard/ReviewManagement'));

const PageWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const location = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.3 }}
      className="w-full"
    >
      {children}
    </motion.div>
  );
};

const AppContent: React.FC = () => {
  const location = useLocation();
  const isDashboard = location.pathname.startsWith('/dashboard') || location.pathname.startsWith('/admin');
  const isHome = location.pathname === '/';

  return (
    <div className="relative min-h-screen w-full bg-white flex flex-col">
      {!isDashboard && <Navbar />}
      <main className={`flex-1 relative z-0 ${isDashboard || isHome ? '' : 'pt-14 md:pt-12'}`}>
        <AnimatePresence mode="wait">
          <Suspense fallback={<LoadingScreen />}>
            <Routes>
              {/* ── Public Routes ── */}
              <Route path="/" element={<PageWrapper><Home /></PageWrapper>} />
              <Route path="/alumni" element={<PageWrapper><Alumni /></PageWrapper>} />
              <Route path="/projects" element={<PageWrapper><Projects /></PageWrapper>} />
              <Route path="/events" element={<PageWrapper><Events /></PageWrapper>} />
              <Route path="/events/:eventSlug/register" element={<PageWrapper><EventRegister /></PageWrapper>} />
              <Route path="/events/:eventSlug/highlights" element={<PageWrapper><EventHighlights /></PageWrapper>} />
              <Route path="/gallery" element={<PageWrapper><Gallery /></PageWrapper>} />
              <Route path="/blog" element={<PageWrapper><Blog /></PageWrapper>} />
              <Route path="/about" element={<PageWrapper><About /></PageWrapper>} />
              <Route path="/join" element={<PageWrapper><JoinUs /></PageWrapper>} />
              <Route path="/resource/:slug" element={<PageWrapper><TechResource /></PageWrapper>} />
              <Route path="/privacy" element={<PageWrapper><PrivacyPolicy /></PageWrapper>} />
              <Route path="/terms" element={<PageWrapper><Terms /></PageWrapper>} />

              {/* ── Authenticated Routes ── */}
              <Route path="/profile" element={
                <ProtectedRoute>
                  <PageWrapper><Profile /></PageWrapper>
                </ProtectedRoute>
              } />

              {/* ── Dashboard Routes (member + admin) ── */}
              <Route path="/dashboard" element={
                <RoleProtectedRoute allowedRoles={['student', 'member', 'admin']}>
                  <DashboardLayout />
                </RoleProtectedRoute>
              }>
                <Route index element={<DashboardHome />} />
                <Route path="events" element={<MyEvents />} />
                <Route path="blogs" element={<MyBlogs />} />
                <Route path="gallery" element={<MyGallery />} />
                <Route path="registrations" element={<MyRegistrations />} />
                <Route path="scan-qr" element={<ScanAttendance />} />
                <Route path="attendance" element={<ScanAttendance />} />
                <Route path="certificates" element={<MyCertificates />} />
                <Route path="contributions" element={<MyContributions />} />
              </Route>

              {/* ── Admin Routes ── */}
              <Route path="/admin" element={
                <RoleProtectedRoute allowedRoles={['admin']}>
                  <DashboardLayout />
                </RoleProtectedRoute>
              }>
                <Route index element={<AdminOverview />} />
                <Route path="users" element={<ManageUsers />} />
                <Route path="events" element={<AdminEvents />} />
                <Route path="blogs" element={<AdminBlogs />} />
                <Route path="gallery" element={<AdminGallery />} />
                <Route path="projects" element={<AdminProjects />} />
                <Route path="alumni" element={<AdminAlumni />} />
                <Route path="activity" element={<ActivityLog />} />
                <Route path="team" element={<AdminTeam />} />
                <Route path="members" element={<AdminMembers />} />
                <Route path="attendance" element={<AttendanceManager />} />
                <Route path="certificates" element={<CertificateManager />} />
                <Route path="contributions" element={<ContributionManager />} />
                <Route path="reviews" element={<ReviewManagement />} />
              </Route>

              {/* ── Fallback ── */}
              <Route path="*" element={<PageWrapper><Home /></PageWrapper>} />
            </Routes>
          </Suspense>
        </AnimatePresence>
      </main>
      <ScrollToTop />
      {!isDashboard && (
        <>
          <div className="relative z-10">
            <CommunityMarquee />
          </div>
          <Footer />
        </>
      )}
    </div>
  );
};

const App: React.FC = () => {
  useEffect(() => {
    const lenis = new Lenis({
      lerp: 0.05,
      smoothWheel: true,
      wheelMultiplier: 0.8,
      touchMultiplier: 1.5,
    });

    lenis.on('scroll', ScrollTrigger.update);

    const update = (time: number) => {
      lenis.raf(time * 1000);
    };

    gsap.ticker.add(update);
    gsap.ticker.lagSmoothing(0);

    return () => {
      gsap.ticker.remove(update);
      lenis.destroy();
    };
  }, []);

  return <AppContent />;
};

export default App;
