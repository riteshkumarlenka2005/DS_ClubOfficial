
import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { User, LayoutDashboard, ShieldCheck, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import LoginModal from './auth/LoginModal';

const navLinks = [
  { name: 'Home', path: '/' },
  { name: 'Alumni', path: '/alumni' },
  { name: 'Events', path: '/events' },
  { name: 'Media', path: '/media' },
  { name: 'About', path: '/about' },
  { name: 'Join Us', path: '/join' },
];

const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const userMenuRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isAuthenticated, isLoading: authLoading, logout, hasRole } = useAuth();
  const isHome = location.pathname === '/';

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close menus on route change
  useEffect(() => {
    setShowUserMenu(false);
    setIsMenuOpen(false);
  }, [location]);

  // Close user dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setShowUserMenu(false);
      }
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Open login modal if redirected from ProtectedRoute
  useEffect(() => {
    if (location.state?.showLogin) {
      setShowLogin(true);
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  const handleLogout = async () => {
    setShowUserMenu(false);
    await logout();
  };

  const handleHomeClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (location.pathname === '/') {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <>


      {/* ── Right side: Auth + Menu (hover-based) ── */}
      <div className="fixed top-[12px] right-[15px] md:top-[16px] md:right-[20px] z-[100] flex items-center gap-3">

        {/* Auth avatar / sign in button */}
        {!authLoading && (
          isAuthenticated && user ? (
            <div className="relative" ref={userMenuRef}>
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="rounded-full hover:ring-2 hover:ring-[#D8CAF6] transition-all"
                aria-label="User menu"
              >
                <img
                  src={user.avatar_url || '/default-avatar.png'}
                  alt={user.full_name}
                  className="w-9 h-9 rounded-full border-2 border-[#D8CAF6] object-cover"
                  referrerPolicy="no-referrer"
                />
              </button>

              <AnimatePresence>
                {showUserMenu && (
                  <motion.div
                    initial={{ opacity: 0, y: -8, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -8, scale: 0.95 }}
                    transition={{ duration: 0.15 }}
                    className="absolute right-0 mt-2 w-60 bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden"
                  >
                    <div className="px-4 py-3 bg-gradient-to-r from-[#EEEAFD] to-white border-b border-gray-100">
                      <p className="text-sm font-bold text-[#1A0B2E] truncate">{user.full_name}</p>
                      <p className="text-xs text-gray-500 truncate">{user.email}</p>
                      <span className="inline-block mt-1 px-2 py-0.5 text-[10px] font-bold bg-[#1A0B2E] text-white rounded-full capitalize">{user.role}</span>
                    </div>
                    <div className="py-1">
                      <Link to="/profile" onClick={() => setShowUserMenu(false)} className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-[#EEEAFD] transition-colors">
                        <User size={16} className="text-[#9667E0]" /> My Profile
                      </Link>
                      {hasRole('student', 'member', 'admin') && (
                        <Link to="/dashboard" onClick={() => setShowUserMenu(false)} className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-[#EEEAFD] transition-colors">
                          <LayoutDashboard size={16} className="text-[#9667E0]" /> Dashboard
                        </Link>
                      )}
                      {hasRole('admin') && (
                        <Link to="/admin" onClick={() => setShowUserMenu(false)} className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-[#EEEAFD] transition-colors">
                          <ShieldCheck size={16} className="text-[#9667E0]" /> Admin Panel
                        </Link>
                      )}
                    </div>
                    <div className="border-t border-gray-100">
                      <button onClick={handleLogout} className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors">
                        <LogOut size={16} /> Sign Out
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ) : (
            <button
              onClick={() => setShowLogin(true)}
              className="flex items-center justify-center px-4 py-2 md:px-6 md:py-3 h-[36px] md:h-[48px] rounded-full md:rounded-lg text-xs font-bold tracking-widest uppercase text-white bg-black/70 backdrop-blur-md border border-white/10 hover:opacity-75 transition-all"
            >
              Sign In
            </button>
          )
        )}

        {/* ── Menu: State-based Toggle ── */}
        <div className="relative" ref={menuRef}>
          <div 
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="flex items-center justify-center w-[36px] h-[36px] md:w-[48px] md:h-[48px] text-white cursor-pointer transition-opacity hover:opacity-75 bg-black/70 backdrop-blur-md rounded-full border border-white/10"
          >
            {isMenuOpen ? (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            ) : (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="3" y1="6" x2="21" y2="6" />
                <line x1="3" y1="12" x2="21" y2="12" />
                <line x1="3" y1="18" x2="21" y2="18" />
              </svg>
            )}
          </div>

          {/* Dropdown */}
          <AnimatePresence>
            {isMenuOpen && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                transition={{ duration: 0.2 }}
                className="absolute top-[52px] right-0 z-[99] w-[280px]"
              >
                <div
                  style={{
                    background: 'rgba(10,10,10,0.9)',
                    backdropFilter: 'blur(20px)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    boxShadow: '0 24px 60px rgba(0,0,0,0.6)',
                  }}
                >
                  {navLinks.map((item, index) => (
                    <Link
                      key={item.name}
                      to={item.path}
                      onClick={(e) => {
                        if (item.path === '/') handleHomeClick(e);
                        setIsMenuOpen(false);
                      }}
                      className={`group/item relative flex items-center justify-between px-6 py-5 text-white hover:text-black transition-colors duration-[700ms] ease-[cubic-bezier(0.22,1,0.36,1)] overflow-hidden ${
                        index !== navLinks.length - 1 ? 'border-b border-white/10' : ''
                      }`}
                    >
                      {/* Bottom-to-top white fill */}
                      <div className="absolute bottom-0 left-0 right-0 h-0 bg-white transition-all duration-[700ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover/item:h-full z-0" />
                      <span className="text-[16px] tracking-wide relative z-10 font-medium">{item.name}</span>
                      <span className="text-lg font-light relative z-10">
                        <span className="block group-hover/item:hidden">→</span>
                        <span className="hidden group-hover/item:block">↗</span>
                      </span>
                    </Link>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Login Modal */}
      <LoginModal isOpen={showLogin} onClose={() => setShowLogin(false)} />
    </>
  );
};

export default Navbar;
