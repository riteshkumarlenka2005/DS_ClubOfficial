
import React from 'react';
import { motion } from 'framer-motion';

const LoadingScreen = () => {
  return (
    <div className="fixed inset-0 z-[100] bg-white flex flex-col items-center justify-center">
      <motion.div
        animate={{
          scale: [0.9, 1.1, 0.9],
          rotate: [0, 5, -5, 0],
          opacity: [0.8, 1, 0.8]
        }}
        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        className="mb-8"
      >
        <img
          src="/DSC_LogoV2.png"
          alt="DSC Logo"
          className="w-24 h-24 md:w-32 md:h-32 object-contain filter drop-shadow-xl"
        />
      </motion.div>
      <div className="text-[#2D164B] font-mono tracking-widest uppercase text-[10px] md:text-xs font-black">
        Initializing Neural Pathways...
      </div>
      <div className="mt-6 w-48 h-1.5 bg-[#EEEAFD] rounded-full overflow-hidden border border-[#D8CAF6]">
        <motion.div
          animate={{ x: [-200, 200] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
          className="w-full h-full bg-gradient-to-r from-transparent via-[#9667E0] to-transparent"
        />
      </div>
    </div>
  );
};

export default LoadingScreen;
