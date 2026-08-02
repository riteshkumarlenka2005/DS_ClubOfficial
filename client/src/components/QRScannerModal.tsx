// FILE: frontend/src/components/QRScannerModal.tsx

import { useEffect, useRef, useState } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Camera, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';

interface QRScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onScanSuccess: (decodedText: string) => void;
  title?: string;
}

export default function QRScannerModal({ isOpen, onClose, onScanSuccess, title = 'Scan QR Code' }: QRScannerModalProps) {
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isStarting, setIsStarting] = useState(false);
  const scannerDivId = 'qr-reader-region';

  useEffect(() => {
    if (!isOpen) return;

    let mounted = true;

    const startScanner = async () => {
      setIsStarting(true);
      setError(null);

      try {
        const scanner = new Html5Qrcode(scannerDivId);
        scannerRef.current = scanner;

        await scanner.start(
          { facingMode: 'environment' },
          {
            fps: 10,
            qrbox: { width: 250, height: 250 },
            aspectRatio: 1,
          },
          (decodedText) => {
            if (mounted) {
              onScanSuccess(decodedText);
              scanner.stop().catch(() => {});
              onClose();
            }
          },
          () => {} // ignore errors during scanning
        );
      } catch (err: any) {
        if (mounted) {
          setError(err?.message || 'Camera access denied. Please allow camera permission.');
        }
      } finally {
        if (mounted) setIsStarting(false);
      }
    };

    // Small delay to ensure DOM element exists
    const timer = setTimeout(startScanner, 300);

    return () => {
      mounted = false;
      clearTimeout(timer);
      if (scannerRef.current) {
        scannerRef.current.stop().catch(() => {});
        scannerRef.current = null;
      }
    };
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-[#1A0B2E]/60 backdrop-blur-sm px-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-[2rem] w-full max-w-md overflow-hidden shadow-2xl"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-[#E0D4F5]">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#EEEAFD] flex items-center justify-center">
                  <Camera size={20} className="text-[#9667E0]" />
                </div>
                <h3 className="text-lg font-extrabold text-[#1A0B2E]">{title}</h3>
              </div>
              <button
                onClick={onClose}
                className="p-2 rounded-xl hover:bg-[#EEEAFD] text-[#4B2C82] transition"
              >
                <X size={20} />
              </button>
            </div>

            {/* Scanner Area */}
            <div className="p-6">
              {isStarting && (
                <div className="flex flex-col items-center justify-center py-12 gap-3">
                  <Loader2 size={32} className="text-[#9667E0] animate-spin" />
                  <p className="text-sm font-medium text-[#2D164B]/70">Starting camera...</p>
                </div>
              )}

              {error && (
                <div className="flex flex-col items-center justify-center py-12 gap-3">
                  <AlertCircle size={32} className="text-red-400" />
                  <p className="text-sm font-medium text-red-600 text-center">{error}</p>
                  <button
                    onClick={onClose}
                    className="px-6 py-2 bg-[#1A0B2E] text-white rounded-xl text-xs font-black tracking-widest uppercase mt-2"
                  >
                    Close
                  </button>
                </div>
              )}

              <div
                id={scannerDivId}
                className="rounded-2xl overflow-hidden"
                style={{ display: error ? 'none' : 'block' }}
              />

              <p className="text-center text-xs text-[#2D164B]/50 font-medium mt-4">
                Point your camera at the event QR code
              </p>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}