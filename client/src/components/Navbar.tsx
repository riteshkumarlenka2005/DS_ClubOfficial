
import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, Sparkles, ChevronRight, User, LogIn, LayoutDashboard, ShieldCheck, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import LoginModal from './auth/LoginModal';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const location = useLocation();
  const { user, isAuthenticated, isLoading: authLoading, logout, hasRole } = useAuth();

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'Alumni', path: '/alumni' },
    { name: 'Projects', path: '/projects' },
    { name: 'Events', path: '/events' },
    { name: 'Gallery', path: '/gallery' },
    { name: 'Blog', path: '/blog' },
    { name: 'About', path: '/about' },
  ];

  const isActive = (path: string) => location.pathname === path;

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setIsOpen(false);
    setShowUserMenu(false);
  }, [location]);

  // Close user menu on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setShowUserMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Open login modal if redirected from ProtectedRoute
  useEffect(() => {
    if (location.state?.showLogin) {
      setShowLogin(true);
      // Clear the state so it doesn't re-trigger
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  const handleLogout = async () => {
    setShowUserMenu(false);
    await logout();
  };

  return (
    <>
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 border-b bg-black/30 backdrop-blur-md border-white/10 ${scrolled
          ? 'py-3 md:py-2.5 shadow-sm'
          : 'py-4 md:py-4 border-transparent'
          }`}
        aria-label="Primary Navigation"
      >
        <div className="w-full px-4 md:px-12 flex items-center justify-between">
          {/* Brand Logo & Name */}
          <Link
            to="/"
            className="flex items-center gap-2 md:gap-5 group outline-none focus-visible:ring-2 focus-visible:ring-[#9667E0] rounded-lg"
            aria-label="DSC GIETU Home"
          >
            <div className="flex items-center justify-center transition-all duration-500 group-hover:scale-110">
              <img
                src="/DSC_LogoV2.png"
                alt="DSC Logo"
                className="w-9 h-9 md:w-11 md:h-11 object-contain"
              />
            </div>
            <div className="flex flex-col justify-center">
              <span className="text-base md:text-2xl font-black tracking-tighter leading-none text-white drop-shadow-md">
                DSC <span className="text-[#9667E0]">GIETU</span>
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <ul className="hidden lg:flex items-center gap-4">
            {navLinks.map((link) => (
              <li key={link.name}>
                <Link
                  to={link.path}
                  className={`relative px-4 py-1.5 rounded-xl text-[10px] md:text-xs font-black uppercase tracking-widest transition-all duration-300 outline-none focus-visible:ring-2 focus-visible:ring-[#9667E0] ${
                    isActive(link.path)
                      ? 'text-white drop-shadow-md'
                      : 'text-white/80 hover:text-white drop-shadow-sm'
                    }`}
                >
                  {link.name}
                  {isActive(link.path) && (
                    <motion.div
                      layoutId="nav-pill-active"
                      className="absolute inset-0 rounded-xl -z-10 bg-white/20 border border-white/30 backdrop-blur-sm"
                      transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                    />
                  )}
                </Link>
              </li>
            ))}
          </ul>

          {/* Action Buttons */}
          <div className="flex items-center gap-3">
            {/* Auth-aware section */}
            {authLoading ? (
              <div className="w-9 h-9 rounded-full bg-gray-100 animate-pulse" />
            ) : isAuthenticated && user ? (
              /* ── Logged In: Avatar + Dropdown ── */
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

                {/* Dropdown */}
                <AnimatePresence>
                  {showUserMenu && (
                    <motion.div
                      initial={{ opacity: 0, y: -8, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -8, scale: 0.95 }}
                      transition={{ duration: 0.15 }}
                      className="absolute right-0 mt-2 w-60 bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden z-50"
                    >
                      {/* User info */}
                      <div className="px-4 py-3 bg-gradient-to-r from-[#EEEAFD] to-white border-b border-gray-100">
                        <p className="text-sm font-bold text-[#1A0B2E] truncate">{user.full_name}</p>
                        <p className="text-xs text-gray-500 truncate">{user.email}</p>
                        <span className="inline-block mt-1 px-2 py-0.5 text-[10px] font-bold bg-[#1A0B2E] text-white rounded-full capitalize">
                          {user.role}
                        </span>
                      </div>

                      <div className="py-1">
                        <Link
                          to="/profile"
                          onClick={() => setShowUserMenu(false)}
                          className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-[#EEEAFD] transition-colors"
                        >
                          <User size={16} className="text-[#9667E0]" />
                          My Profile
                        </Link>

                        {hasRole('student', 'member', 'admin') && (
                          <Link
                            to="/dashboard"
                            onClick={() => setShowUserMenu(false)}
                            className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-[#EEEAFD] transition-colors"
                          >
                            <LayoutDashboard size={16} className="text-[#9667E0]" />
                            Dashboard
                          </Link>
                        )}

                        {hasRole('admin') && (
                          <Link
                            to="/admin"
                            onClick={() => setShowUserMenu(false)}
                            className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-[#EEEAFD] transition-colors"
                          >
                            <ShieldCheck size={16} className="text-[#9667E0]" />
                            Admin Panel
                          </Link>
                        )}
                      </div>

                      <div className="border-t border-gray-100">
                        <button
                          onClick={handleLogout}
                          className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors"
                        >
                          <LogOut size={16} />
                          Sign Out
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              /* ── Not Logged In: Sign In button ── */
              <button
                onClick={() => setShowLogin(true)}
                className="flex items-center px-4 py-2 rounded-xl text-xs font-bold transition-colors text-white bg-white/10 border border-white/20 hover:bg-white/20 backdrop-blur-sm"
              >
                Sign In
              </button>
            )}


            {/* Mobile Menu Toggle */}
            <button
              className="lg:hidden p-2 md:p-3 rounded-xl transition-colors outline-none focus-visible:ring-2 focus-visible:ring-[#9667E0] text-white hover:bg-white/10"
              onClick={() => setIsOpen(!isOpen)}
              aria-expanded={isOpen}
              aria-label="Toggle mobile menu"
            >
              {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Overlay */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="lg:hidden bg-white border-b border-[#D8CAF6] overflow-hidden"
            >
              <div className="px-6 py-8 flex flex-col gap-3">
                {navLinks.map((link, idx) => (
                  <motion.div
                    key={link.name}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.05 }}
                  >
                    <Link
                      to={link.path}
                      className={`flex items-center justify-between text-base font-black uppercase tracking-widest p-5 rounded-2xl transition-all ${isActive(link.path)
                        ? 'bg-[#1A0B2E] text-white shadow-xl'
                        : 'text-[#1A0B2E] hover:bg-[#EEEAFD]'
                        }`}
                    >
                      {link.name}
                      <ChevronRight size={20} className={isActive(link.path) ? 'text-[#9667E0]' : 'text-current'} />
                    </Link>
                  </motion.div>
                ))}

                {/* Mobile: Auth-aware links */}
                {isAuthenticated && user ? (
                  <>
                    <motion.div
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: navLinks.length * 0.05 }}
                    >
                      <Link
                        to="/profile"
                        className={`flex items-center justify-between text-base font-black uppercase tracking-widest p-5 rounded-2xl transition-all ${isActive('/profile')
                          ? 'bg-[#1A0B2E] text-white shadow-xl'
                          : 'text-[#1A0B2E] hover:bg-[#EEEAFD]'
                          }`}
                      >
                        Profile
                        <ChevronRight size={20} className={isActive('/profile') ? 'text-[#9667E0]' : 'text-current'} />
                      </Link>
                    </motion.div>

                    {hasRole('student', 'member', 'admin') && (
                      <motion.div
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: (navLinks.length + 1) * 0.05 }}
                      >
                        <Link
                          to="/dashboard"
                          className={`flex items-center justify-between text-base font-black uppercase tracking-widest p-5 rounded-2xl transition-all ${location.pathname.startsWith('/dashboard')
                            ? 'bg-[#1A0B2E] text-white shadow-xl'
                            : 'text-[#1A0B2E] hover:bg-[#EEEAFD]'
                            }`}
                        >
                          Dashboard
                          <ChevronRight size={20} />
                        </Link>
                      </motion.div>
                    )}

                    {hasRole('admin') && (
                      <motion.div
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: (navLinks.length + 2) * 0.05 }}
                      >
                        <Link
                          to="/admin"
                          className={`flex items-center justify-between text-base font-black uppercase tracking-widest p-5 rounded-2xl transition-all ${location.pathname.startsWith('/admin')
                            ? 'bg-[#1A0B2E] text-white shadow-xl'
                            : 'text-[#1A0B2E] hover:bg-[#EEEAFD]'
                            }`}
                        >
                          Admin
                          <ChevronRight size={20} />
                        </Link>
                      </motion.div>
                    )}

                    <button
                      onClick={handleLogout}
                      className="flex items-center justify-center gap-2 text-base font-black uppercase tracking-widest p-5 rounded-2xl text-red-600 hover:bg-red-50 transition-all mt-2"
                    >
                      <LogOut size={20} />
                      Sign Out
                    </button>
                  </>
                ) : (
                  <motion.div
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: navLinks.length * 0.05 }}
                  >
                    <button
                      onClick={() => { setIsOpen(false); setShowLogin(true); }}
                      className="flex items-center justify-center text-base font-black uppercase tracking-widest p-5 rounded-2xl text-[#9667E0] bg-[#EEEAFD] border border-[#D8CAF6] hover:bg-[#D8CAF6] transition-all w-full"
                    >
                      Sign In
                    </button>
                  </motion.div>
                )}

                <Link
                  to="/join"
                  className="bg-gradient-to-r from-[#1A0B2E] to-[#4B2C82] text-white text-center p-6 rounded-2xl font-black uppercase tracking-widest mt-4 shadow-xl"
                >
                  Launch Your Journey
                </Link>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      {/* Login Modal */}
      <LoginModal
        isOpen={showLogin}
        onClose={() => setShowLogin(false)}
      />
    </>
  );
};

export default Navbar;
