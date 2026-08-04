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
    <div 
      className="relative w-full min-h-screen flex items-center justify-center pt-32 pb-24 px-6"
      style={{
        backgroundColor: '#F4F4F4',
        backgroundImage: `
          radial-gradient(circle at 0% 0%, rgba(255, 204, 230, 0.4) 0%, transparent 40vw), 
          radial-gradient(circle at 0% 100%, rgba(212, 196, 251, 0.4) 0%, transparent 40vw),
          radial-gradient(circle at 100% 0%, rgba(255, 204, 230, 0.4) 0%, transparent 40vw), 
          radial-gradient(circle at 100% 100%, rgba(212, 196, 251, 0.4) 0%, transparent 40vw)
        `
      }}
    >
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="relative z-10 w-full max-w-2xl mx-auto"
      >
        <div className="w-full">
          
          {/* ── Header ── */}
          <div className="mb-16 md:mb-24 text-center md:text-left">
            <h1
              className="text-5xl sm:text-6xl md:text-8xl font-black tracking-tight mb-4 text-[#111111] leading-[0.9]"
              style={{ fontFamily: "'Helvetica', 'Arial', sans-serif" }}
            >
              Join <br className="hidden md:block" /> the Team.
            </h1>
            <p className="text-base md:text-lg font-semibold opacity-70 text-[#111111] mt-6 md:mt-8 max-w-md">
              Launch your data science career at GIETU. Build real projects, learn from peers, and connect with our alumni network.
            </p>
          </div>

          {/* ── Existing application state ── */}
          {checkingStatus ? (
            <div className="py-12 md:text-left text-center">
              <div className="w-8 h-8 border-2 border-[#111111]/20 border-t-[#111111] rounded-full animate-spin md:mx-0 mx-auto" />
            </div>
          ) : existingStatus ? (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="py-8 md:text-left text-center">
              <div
                className="w-16 h-16 rounded-full flex items-center justify-center mb-6 bg-[#111111] md:mx-0 mx-auto"
              >
                {existingStatus === 'approved' && <CheckCircle className="w-8 h-8 text-[#F4F4F4]" />}
                {existingStatus === 'pending' && <Clock className="w-8 h-8 text-[#F4F4F4]" />}
                {existingStatus === 'rejected' && <XCircle className="w-8 h-8 text-[#F4F4F4]" />}
              </div>
              <h2 className="text-2xl font-black mb-3 uppercase tracking-widest text-[#111111]">
                {existingStatus === 'approved' && 'Application Approved'}
                {existingStatus === 'pending' && 'Under Review'}
                {existingStatus === 'rejected' && 'Not Accepted'}
              </h2>
              <p className="text-base font-semibold text-[#111111]/70 leading-relaxed max-w-md md:mx-0 mx-auto">
                {existingStatus === 'approved' && 'Welcome aboard! You\'re now part of the DSC GIETU family.'}
                {existingStatus === 'pending' && 'We received your application and are reviewing it. Hang tight!'}
                {existingStatus === 'rejected' && 'Unfortunately your application wasn\'t accepted this time. Feel free to reapply next semester.'}
              </p>
            </motion.div>
          ) : submitted ? (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="py-8 md:text-left text-center">
              <div className="w-16 h-16 rounded-full flex items-center justify-center mb-6 bg-[#111111] md:mx-0 mx-auto">
                <Zap className="w-8 h-8 text-[#F4F4F4]" />
              </div>
              <h2 className="text-2xl font-black mb-3 uppercase tracking-widest text-[#111111]">
                Application Submitted
              </h2>
              <p className="text-base font-semibold text-[#111111]/70 leading-relaxed max-w-md md:mx-0 mx-auto">
                We'll review your application and get back to you soon. Stay tuned.
              </p>
            </motion.div>
          ) : (
            /* ── Form ── */
            <form onSubmit={handleSubmit} className="space-y-12">
              
              {/* Full Name */}
              <div className="relative group">
                <label className="text-[10px] uppercase font-black tracking-widest text-[#111111]/50 absolute -top-4 left-0 transition-all group-focus-within:text-[#111111]">
                  Full Name
                </label>
                <input
                  required
                  type="text"
                  value={formState.name}
                  onChange={e => setFormState({ ...formState, name: e.target.value })}
                  className="w-full bg-transparent border-b border-[#111111]/20 py-3 outline-none transition-colors font-semibold text-[#111111] text-base focus:border-[#111111] placeholder:text-[#111111]/30"
                  placeholder="John Doe"
                />
              </div>

              {/* Email + Year row */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-8">
                <div className="relative group">
                  <label className="text-[10px] uppercase font-black tracking-widest text-[#111111]/50 absolute -top-4 left-0 transition-all group-focus-within:text-[#111111]">
                    University Email
                  </label>
                  <input
                    required
                    type="email"
                    value={formState.email}
                    onChange={e => setFormState({ ...formState, email: e.target.value })}
                    className="w-full bg-transparent border-b border-[#111111]/20 py-3 outline-none transition-colors font-semibold text-[#111111] text-base focus:border-[#111111] placeholder:text-[#111111]/30"
                    placeholder="name@giet.edu"
                  />
                </div>
                <div className="relative group">
                  <label className="text-[10px] uppercase font-black tracking-widest text-[#111111]/50 absolute -top-4 left-0 transition-all group-focus-within:text-[#111111]">
                    Academic Year
                  </label>
                  <select
                    required
                    value={formState.year}
                    onChange={e => setFormState({ ...formState, year: e.target.value })}
                    className="w-full bg-transparent border-b border-[#111111]/20 py-3 outline-none transition-colors font-semibold text-[#111111] text-base focus:border-[#111111] appearance-none cursor-pointer"
                    style={{
                      backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%23111111' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E")`,
                      backgroundRepeat: 'no-repeat',
                      backgroundPosition: 'right 0px center',
                    }}
                  >
                    <option value="" disabled hidden>Select Year</option>
                    <option value="1">1st Year</option>
                    <option value="2">2nd Year</option>
                    <option value="3">3rd Year</option>
                    <option value="4">4th Year</option>
                  </select>
                </div>
              </div>

              {/* Areas of Interest */}
              <div className="relative group">
                <label className="text-[10px] uppercase font-black tracking-widest text-[#111111]/50 absolute -top-4 left-0 transition-all group-focus-within:text-[#111111]">
                  Areas of Interest
                </label>
                <textarea
                  required
                  rows={2}
                  value={formState.why}
                  onChange={e => setFormState({ ...formState, why: e.target.value })}
                  className="w-full bg-transparent border-b border-[#111111]/20 py-3 outline-none transition-colors font-semibold text-[#111111] text-base focus:border-[#111111] placeholder:text-[#111111]/30 resize-none"
                  placeholder="ML, NLP, Computer Vision..."
                />
              </div>

              {/* Error message */}
              {error && (
                <div className="px-0 py-2 text-sm font-semibold text-red-600">
                  {error}
                </div>
              )}

              {/* Submit button */}
              <div className="pt-4">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full md:w-auto bg-[#111111] text-[#F3F2EE] px-12 py-5 text-[10px] font-black tracking-widest uppercase flex items-center justify-center gap-3 transition-opacity hover:opacity-70 disabled:opacity-50 disabled:cursor-not-allowed group"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-[#F3F2EE]/30 border-t-[#F3F2EE] rounded-full animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    <>
                      ( INITIALIZE MY JOURNEY )
                      <motion.span
                        initial={{ x: 0 }}
                        whileHover={{ x: 5 }}
                        className="opacity-70 group-hover:opacity-100 transition-opacity"
                      >
                        →
                      </motion.span>
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </motion.div>
    </div>
    </>
  );
};

export default JoinUs;