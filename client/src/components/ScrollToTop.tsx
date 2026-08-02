import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowUp } from 'lucide-react';

/**
 * ScrollToTop button — appears only when user scrolls UP
 * (i.e. the user wants to go back to top). Hidden when scrolling down.
 * Clicking smoothly scrolls to the very top.
 */
const ScrollToTop: React.FC = () => {
    const [visible, setVisible] = useState(false);
    const [lastScrollY, setLastScrollY] = useState(0);

    useEffect(() => {
        const handleScroll = () => {
            const currentScrollY = window.scrollY;

            // Show the button only when:
            // 1. User is scrolling UP (currentScrollY < lastScrollY)
            // 2. User has scrolled past a minimum threshold (100px)
            if (currentScrollY < lastScrollY && currentScrollY > 100) {
                setVisible(true);
            } else {
                setVisible(false);
            }

            setLastScrollY(currentScrollY);
        };

        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, [lastScrollY]);

    const scrollToTop = () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    return (
        <AnimatePresence>
            {visible && (
                <motion.button
                    initial={{ opacity: 0, scale: 0.5, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.5, y: 20 }}
                    transition={{ duration: 0.25, ease: 'easeOut' }}
                    onClick={scrollToTop}
                    className="fixed bottom-6 right-6 z-50 w-12 h-12 md:w-14 md:h-14 rounded-full
                     bg-[#1A0B2E] text-white shadow-xl
                     hover:bg-[#4B2C82] hover:shadow-2xl hover:scale-110
                     active:scale-95 transition-all duration-200
                     flex items-center justify-center
                     border-2 border-[#9667E0]/40"
                    aria-label="Scroll to top"
                >
                    <ArrowUp size={22} strokeWidth={2.5} />
                </motion.button>
            )}
        </AnimatePresence>
    );
};

export default ScrollToTop;
