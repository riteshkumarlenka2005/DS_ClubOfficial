import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Send, Zap, CheckCircle, Clock, XCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { membershipService } from '../services/membership.service';
import SEO from '../components/SEO';

type AppStatus = 'pending' | 'approved' | 'rejected';

const JoinUs = () => {
  const { user, isAuthenticated } = useAuth();
  const [formState, setFormState] = useState({ name: '', email: '', year: '', why: '' });
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [existingStatus, setExistingStatus] = useState<AppStatus | null>(null);
  const [checkingStatus, setCheckingStatus] = useState(false);

  // Pre-fill from auth context + check existing application
  useEffect(() => {
    if (isAuthenticated && user) {
      setFormState(prev => ({
        ...prev,
        name: prev.name || user.full_name || '',
        email: prev.email || user.email || '',
      }));
      // Check if they already applied
      setCheckingStatus(true);
      membershipService.checkStatus(user.email)
        .then(res => {
          if (res.data) {
            setExistingStatus(res.data.status as AppStatus);
          }
        })
        .catch(() => {})
        .finally(() => setCheckingStatus(false));
    }
  }, [isAuthenticated, user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      await membershipService.apply({
        full_name: formState.name,
        email: formState.email,
        academic_year: Number(formState.year),
        interests: formState.why,
      });
      setSubmitted(true);
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Something went wrong. Please try again.';
      setError(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
    <SEO title="Join Us" description="Apply to join the Data Science Club at GIET University. Be part of a student-led community focused on AI, ML, and data science." />
    <div className="relative w-full min-h-screen overflow-hidden flex items-center justify-center pt-24 pb-8"
      style={{ background: '#1A0B2E' }}
    >
      {/* ── Geometric background: two diagonal triangular sections ── */}
      {/* Deep purple upper-left triangle */}
      <div
        className="absolute inset-0 z-0"
        style={{
          background: 'linear-gradient(135deg, #0D0519 0%, #1A0B2E 100%)',
          clipPath: 'polygon(0 0, 100% 0, 0 100%)',
        }}
      />
      {/* Lighter purple lower-right triangle */}
      <div
        className="absolute inset-0 z-0"
        style={{
          background: 'linear-gradient(315deg, #9667E0 0%, #4B2C82 60%, #2D164B 100%)',
          clipPath: 'polygon(100% 0, 100% 100%, 0 100%)',
        }}
      />

      {/* ── Subtle accent line along the diagonal ── */}
      <div
        className="absolute inset-0 z-[1] pointer-events-none"
        style={{
          background: 'linear-gradient(135deg, transparent 49.3%, rgba(150,103,224,0.15) 49.3%, rgba(150,103,224,0.15) 50.7%, transparent 50.7%)',
        }}
      />

      {/* ── Centered elevated form card ── */}
      <motion.div
        initial={{ opacity: 0, y: 40, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        className="relative z-10 w-full max-w-xl mx-4"
      >
        <div
          className="rounded-2xl p-6 sm:p-10 md:p-14"
          style={{
            background: '#FAF9FE',
            boxShadow: '0 25px 60px -12px rgba(0,0,0,0.5), 0 0 0 1px rgba(216,202,246,0.3), inset 0 1px 0 rgba(255,255,255,0.8)',
          }}
        >
          {/* ── Header ── */}
          <div className="text-center mb-6 sm:mb-10">
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.6 }}
              className="text-2xl sm:text-4xl md:text-5xl font-extrabold tracking-tight mb-3"
              style={{ color: '#1A0B2E', fontFamily: "'Poppins', sans-serif" }}
            >
              Join the Team
            </motion.h1>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="text-base font-medium"
              style={{ color: '#4B2C82' }}
            >
              Launch your data science career at GIETU.
            </motion.p>
          </div>

          {/* ── Existing application state ── */}
          {checkingStatus ? (
            <div className="text-center py-8 sm:py-12">
              <div
                className="w-9 h-9 border-4 rounded-full animate-spin mx-auto"
                style={{ borderColor: '#9667E0', borderTopColor: 'transparent' }}
              />
            </div>
          ) : existingStatus ? (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-8 sm:py-12">
              <div
                className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6"
                style={{
                  background: existingStatus === 'approved' ? '#ECFDF5' : existingStatus === 'pending' ? '#EEEAFD' : '#FEF2F2',
                  border: `1px solid ${existingStatus === 'approved' ? '#A7F3D0' : existingStatus === 'pending' ? '#D8CAF6' : '#FECACA'}`,
                }}
              >
                {existingStatus === 'approved' && <CheckCircle className="w-10 h-10" style={{ color: '#059669' }} />}
                {existingStatus === 'pending' && <Clock className="w-10 h-10" style={{ color: '#9667E0' }} />}
                {existingStatus === 'rejected' && <XCircle className="w-10 h-10" style={{ color: '#DC2626' }} />}
              </div>
              <h2 className="text-2xl font-extrabold mb-3 uppercase" style={{ color: '#1A0B2E' }}>
                {existingStatus === 'approved' && 'Application Approved!'}
                {existingStatus === 'pending' && 'Application Under Review'}
                {existingStatus === 'rejected' && 'Application Not Accepted'}
              </h2>
              <p className="text-base font-semibold" style={{ color: '#2D164B' }}>
                {existingStatus === 'approved' && 'Welcome aboard! You\'re now part of the DSC GIETU family 🎉'}
                {existingStatus === 'pending' && 'We received your application and are reviewing it. Hang tight!'}
                {existingStatus === 'rejected' && 'Unfortunately your application wasn\'t accepted this time. Feel free to reapply next semester.'}
              </p>
            </motion.div>
          ) : submitted ? (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-8 sm:py-12">
              <div
                className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6"
                style={{ background: '#EEEAFD', border: '1px solid #D8CAF6' }}
              >
                <Zap className="w-10 h-10" style={{ color: '#9667E0' }} />
              </div>
              <h2 className="text-2xl font-extrabold mb-3 uppercase" style={{ color: '#1A0B2E' }}>
                Application Submitted!
              </h2>
              <p className="text-base font-semibold" style={{ color: '#2D164B' }}>
                We'll review your application and get back to you soon. Stay tuned!
              </p>
            </motion.div>
          ) : (
            /* ── Form ── */
            <form onSubmit={handleSubmit} className="space-y-5 sm:space-y-7">
              {/* Full Name */}
              <div className="space-y-2">
                <label className="text-[10px] uppercase font-bold tracking-[0.2em] px-1" style={{ color: '#9667E0' }}>
                  Full Name
                </label>
                <input
                  required
                  type="text"
                  value={formState.name}
                  onChange={e => setFormState({ ...formState, name: e.target.value })}
                  className="w-full rounded-xl px-5 py-3.5 outline-none transition-all font-semibold"
                  style={{
                    background: 'rgba(238,234,253,0.4)',
                    border: '1px solid #E0D4F5',
                    color: '#1A0B2E',
                  }}
                  onFocus={e => { e.target.style.borderColor = '#9667E0'; e.target.style.background = '#FFFFFF'; }}
                  onBlur={e => { e.target.style.borderColor = '#E0D4F5'; e.target.style.background = 'rgba(238,234,253,0.4)'; }}
                  placeholder="Student Name"
                />
              </div>

              {/* Email + Year row */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-2">
                  <label className="text-[10px] uppercase font-bold tracking-[0.2em] px-1" style={{ color: '#9667E0' }}>
                    University Email
                  </label>
                  <input
                    required
                    type="email"
                    value={formState.email}
                    onChange={e => setFormState({ ...formState, email: e.target.value })}
                    className="w-full rounded-xl px-5 py-3.5 outline-none transition-all font-semibold"
                    style={{
                      background: 'rgba(238,234,253,0.4)',
                      border: '1px solid #E0D4F5',
                      color: '#1A0B2E',
                    }}
                    onFocus={e => { e.target.style.borderColor = '#9667E0'; e.target.style.background = '#FFFFFF'; }}
                    onBlur={e => { e.target.style.borderColor = '#E0D4F5'; e.target.style.background = 'rgba(238,234,253,0.4)'; }}
                    placeholder="name@giet.edu"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] uppercase font-bold tracking-[0.2em] px-1" style={{ color: '#9667E0' }}>
                    Academic Year
                  </label>
                  <select
                    required
                    value={formState.year}
                    onChange={e => setFormState({ ...formState, year: e.target.value })}
                    className="w-full rounded-xl px-5 py-3.5 pr-10 outline-none transition-all font-semibold appearance-none cursor-pointer"
                    style={{
                      background: 'rgba(238,234,253,0.4)',
                      border: '1px solid #E0D4F5',
                      color: '#1A0B2E',
                      backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%239667E0' stroke-width='2.5' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E")`,
                      backgroundRepeat: 'no-repeat',
                      backgroundPosition: 'right 14px center',
                      backgroundSize: '16px',
                    }}
                    onFocus={e => { e.target.style.borderColor = '#9667E0'; e.target.style.backgroundColor = '#FFFFFF'; }}
                    onBlur={e => { e.target.style.borderColor = '#E0D4F5'; e.target.style.backgroundColor = 'rgba(238,234,253,0.4)'; }}
                  >
                    <option value="">Select Year</option>
                    <option value="1">1st Year</option>
                    <option value="2">2nd Year</option>
                    <option value="3">3rd Year</option>
                    <option value="4">4th Year</option>
                  </select>
                </div>
              </div>

              {/* Areas of Interest */}
              <div className="space-y-2">
                <label className="text-[10px] uppercase font-bold tracking-[0.2em] px-1" style={{ color: '#9667E0' }}>
                  Areas of Interest
                </label>
                <textarea
                  required
                  rows={4}
                  value={formState.why}
                  onChange={e => setFormState({ ...formState, why: e.target.value })}
                  className="w-full rounded-xl px-5 py-3.5 outline-none transition-all font-semibold resize-none"
                  style={{
                    background: 'rgba(238,234,253,0.4)',
                    border: '1px solid #E0D4F5',
                    color: '#1A0B2E',
                  }}
                  onFocus={e => { e.target.style.borderColor = '#9667E0'; e.target.style.background = '#FFFFFF'; }}
                  onBlur={e => { e.target.style.borderColor = '#E0D4F5'; e.target.style.background = 'rgba(238,234,253,0.4)'; }}
                  placeholder="ML, NLP, Computer Vision, Data Viz..."
                />
              </div>

              {/* Error message */}
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="rounded-xl px-5 py-3 text-sm font-semibold"
                  style={{ background: '#FEF2F2', border: '1px solid #FECACA', color: '#DC2626' }}
                >
                  {error}
                </motion.div>
              )}

              {/* Submit button */}
              <motion.button
                type="submit"
                disabled={isSubmitting}
                whileHover={isSubmitting ? {} : { scale: 1.01 }}
                whileTap={isSubmitting ? {} : { scale: 0.98 }}
                className="w-full py-4 text-white rounded-xl font-bold text-sm tracking-widest uppercase flex items-center justify-center gap-3 transition-all mt-4 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
                style={{
                  background: 'linear-gradient(135deg, #1A0B2E 0%, #2D164B 100%)',
                  boxShadow: '0 4px 20px rgba(26,11,46,0.4)',
                }}
                onMouseEnter={e => { if (!isSubmitting) (e.target as HTMLElement).style.boxShadow = '0 4px 30px rgba(150,103,224,0.5), 0 0 60px rgba(150,103,224,0.2)'; }}
                onMouseLeave={e => { (e.target as HTMLElement).style.boxShadow = '0 4px 20px rgba(26,11,46,0.4)'; }}
              >
                {isSubmitting ? (
                  <>
                    <div
                      className="w-5 h-5 border-2 rounded-full animate-spin"
                      style={{ borderColor: '#FFFFFF', borderTopColor: 'transparent' }}
                    />
                    Submitting...
                  </>
                ) : (
                  <>Initialize My Journey <Send size={18} /></>
                )}
              </motion.button>
            </form>
          )}
        </div>
      </motion.div>
    </div>
    </>
  );
};

export default JoinUs;