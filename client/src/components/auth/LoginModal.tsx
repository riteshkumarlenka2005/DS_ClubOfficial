import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ShieldCheck } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  redirectMessage?: string;
}

export default function LoginModal({ isOpen, onClose, redirectMessage }: LoginModalProps) {
  const { login } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const googleBtnRef = useRef<HTMLDivElement>(null);
  const scriptRef = useRef<HTMLScriptElement | null>(null);

  const handleCredentialResponse = useCallback(
    async (response: any) => {
      try {
        setIsLoading(true);
        setError(null);

        if (!response?.credential) {
          setError('Google Sign-In did not return a credential. Please try again.');
          setIsLoading(false);
          return;
        }

        await login(response.credential);
        onClose();
      } catch (err: any) {
        console.error('Login error:', err);
        const msg = err.message || 'Login failed. Please try again.';
        setError(msg);
      } finally {
        setIsLoading(false);
      }
    },
    [login, onClose]
  );

  // Google Sign-In error callback — fires when Google itself fails
  const handleGoogleError = useCallback(() => {
    console.error('Google Sign-In error callback triggered');
    setError(
      'Google Sign-In failed. Make sure popups are not blocked and you are using a @giet.edu account.'
    );
    setIsLoading(false);
  }, []);

  useEffect(() => {
    if (!isOpen) return;

    // Reset state when opening
    setError(null);
    setIsLoading(false);

    const initializeGoogle = () => {
      if (window.google && googleBtnRef.current) {
        window.google.accounts.id.initialize({
          client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
          callback: handleCredentialResponse,
          error_callback: handleGoogleError,
          auto_select: false,
        });
        window.google.accounts.id.renderButton(googleBtnRef.current, {
          theme: 'outline',
          size: 'large',
          width: 320,
          text: 'signin_with',
          shape: 'rectangular',
          logo_alignment: 'left',
        });
      }
    };

    // If Google SDK already loaded
    if (window.google) {
      // Small delay to ensure the DOM ref is mounted
      const timerId = setTimeout(initializeGoogle, 50);
      return () => clearTimeout(timerId);
    }

    // Load Google SDK
    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    script.onload = initializeGoogle;
    document.head.appendChild(script);
    scriptRef.current = script;

    return () => {
      if (scriptRef.current && document.head.contains(scriptRef.current)) {
        document.head.removeChild(scriptRef.current);
        scriptRef.current = null;
      }
    };
  }, [isOpen, handleCredentialResponse, handleGoogleError]);

  // Close on Escape key
  useEffect(() => {
    if (!isOpen) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [isOpen, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center p-4"
          onClick={onClose}
        >
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden"
          >
            {/* Close button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-gray-100 transition-colors z-10"
              aria-label="Close"
            >
              <X size={20} className="text-gray-400" />
            </button>

            {/* Header */}
            <div className="bg-gradient-to-br from-[#1A0B2E] to-[#4B2C82] px-8 pt-10 pb-8 text-center">
              <div className="w-16 h-16 mx-auto mb-4 bg-white/10 rounded-2xl flex items-center justify-center backdrop-blur-sm border border-white/20">
                <img
                  src="/DSC_LogoV2.png"
                  alt="DSC GIETU"
                  className="w-10 h-10 object-contain"
                />
              </div>
              <h2 className="text-xl font-bold text-white">
                Welcome to <span className="text-[#D8CAF6]">DSC GIETU</span>
              </h2>
              <p className="text-sm text-white/60 mt-1">
                Data Science Club — GIET University
              </p>
            </div>

            {/* Body */}
            <div className="px-8 py-8">
              {redirectMessage && (
                <div className="mb-5 p-3 bg-amber-50 border border-amber-200 rounded-xl text-center">
                  <p className="text-sm text-amber-700">{redirectMessage}</p>
                </div>
              )}

              {error && (
                <div className="mb-5 p-3 bg-red-50 border border-red-200 rounded-xl text-center">
                  <p className="text-sm text-red-600">{error}</p>
                </div>
              )}

              {isLoading ? (
                <div className="flex flex-col items-center gap-3 py-4">
                  <div className="w-8 h-8 border-3 border-gray-200 border-t-[#9667E0] rounded-full animate-spin" />
                  <p className="text-sm text-gray-500">Signing you in...</p>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-4">
                  <p className="text-sm text-gray-600 text-center">
                    Sign in with your university Google account
                  </p>
                  {/* Google renders its button here */}
                  <div ref={googleBtnRef} className="min-h-[44px]" />
                </div>
              )}

              <div className="mt-6 flex items-center gap-2 justify-center text-xs text-gray-400">
                <ShieldCheck size={14} />
                <span>Only <strong className="text-gray-600">@giet.edu</strong> emails are allowed</span>
              </div>
            </div>

            {/* Footer */}
            <div className="px-8 pb-6 text-center">
              <p className="text-[11px] text-gray-400 leading-relaxed">
                By signing in, you agree to our{' '}
                <a href="/terms" className="text-[#9667E0] hover:underline">Terms</a>{' '}
                and{' '}
                <a href="/privacy" className="text-[#9667E0] hover:underline">Privacy Policy</a>
              </p>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
