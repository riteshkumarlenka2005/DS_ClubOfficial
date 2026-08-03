import React from 'react';
import { motion } from 'framer-motion';
import { 
  BrainCircuit, Database, Terminal, Cloud, Network, Code2, 
  BarChart, Cpu, LineChart, Globe, Bot, Activity, Server, 
  Shield, Smartphone, Box 
} from 'lucide-react';

const TECH_ITEMS = [
  { icon: BrainCircuit, bg: '#9667E0', color: '#FFF' },
  { icon: Database, bg: '#FF6B00', color: '#FFF' },
  { icon: Terminal, bg: '#1A0B2E', color: '#FFF' },
  { icon: Cloud, bg: '#0284C7', color: '#FFF' },
  { icon: Network, bg: '#10A37F', color: '#FFF' },
  { icon: Code2, bg: '#E11D48', color: '#FFF' },
  { icon: BarChart, bg: '#D97706', color: '#FFF' },
  { icon: Cpu, bg: '#C026D3', color: '#FFF' },
  { icon: LineChart, bg: '#4C1D95', color: '#FFF' },
  { icon: Globe, bg: '#0F766E', color: '#FFF' },
  { icon: Bot, bg: '#B91C1C', color: '#FFF' },
  { icon: Activity, bg: '#C2410C', color: '#FFF' },
  { icon: Server, bg: '#4338CA', color: '#FFF' },
  { icon: Shield, bg: '#15803D', color: '#FFF' },
  { icon: Smartphone, bg: '#0369A1', color: '#FFF' },
  { icon: Box, bg: '#A21CAF', color: '#FFF' },
];

// Define fixed patterns for the 4 columns (8 items each). 
// Using exactly identical sets of 8 items twice guarantees a seamless 50% translation loop.
// Numbers correspond to TECH_ITEMS index. null means empty cell.
const COLUMNS = [
  [0, null, 1, null, null, 2, 3, null],
  [null, 4, 5, null, 6, null, null, 7],
  [8, null, null, 9, 10, null, 11, null],
  [null, null, 12, 13, null, 14, null, 15]
];

export const TechnicalArsenal = () => {
  return (
    <section className="relative w-full h-[600px] md:h-[800px] bg-[#F1F0E9] overflow-hidden flex items-center border-t border-[#E0D4F5]">
      
      {/* ── Left Content (Text) ── */}
      <div className="container mx-auto max-w-6xl px-4 md:px-6 relative z-20 flex justify-start pointer-events-none">
        <div className="w-full md:w-[45%] lg:w-[40%] pointer-events-auto mt-[-100px] md:mt-0">
          <motion.h2 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: false, amount: 0.3 }}
            transition={{ duration: 0.8 }}
            className="text-5xl md:text-7xl lg:text-[5.5rem] font-medium leading-[0.9] tracking-tighter text-[#1A0B2E] mb-6"
            style={{ fontFamily: 'Georgia, serif' }}
          >
            Technical<br/>Arsenal.
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: false, amount: 0.3 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-[#2D164B] text-lg md:text-xl font-medium leading-relaxed opacity-80 max-w-sm"
          >
            Master the modern data stack. From machine learning frameworks to cloud architecture, we build with the tools that power the future.
          </motion.p>
        </div>
      </div>

      {/* ── Right Content (Isometric Animated Grid) ── */}
      <div className="absolute top-1/2 left-[30%] md:left-[50%] lg:left-[45%] w-[1000px] h-[1000px] -translate-y-1/2 pointer-events-none">
        <div 
          className="w-full h-full flex gap-0"
          style={{ 
            transform: 'rotateX(60deg) rotateZ(-45deg) scale(1.4)',
            transformStyle: 'preserve-3d'
          }}
        >
          {/* Column 1 - Moves Up */}
          <div className="flex-1 flex flex-col gap-0 animate-[reelUp_20s_linear_infinite]">
            {COLUMNS[0].map((techIdx, i) => <GridCell key={`c1a-${i}`} techIdx={techIdx} />)}
            {COLUMNS[0].map((techIdx, i) => <GridCell key={`c1b-${i}`} techIdx={techIdx} />)}
          </div>

          {/* Column 2 - Moves Down */}
          {/* Using translateY(-50%) on the container and sliding to 0% creates the downward loop */}
          <div className="flex-1 flex flex-col gap-0 animate-[reelDown_25s_linear_infinite]" style={{ marginTop: '-100%' }}>
            {COLUMNS[1].map((techIdx, i) => <GridCell key={`c2a-${i}`} techIdx={techIdx} />)}
            {COLUMNS[1].map((techIdx, i) => <GridCell key={`c2b-${i}`} techIdx={techIdx} />)}
          </div>

          {/* Column 3 - Moves Up */}
          <div className="flex-1 flex flex-col gap-0 animate-[reelUp_22s_linear_infinite]">
            {COLUMNS[2].map((techIdx, i) => <GridCell key={`c3a-${i}`} techIdx={techIdx} />)}
            {COLUMNS[2].map((techIdx, i) => <GridCell key={`c3b-${i}`} techIdx={techIdx} />)}
          </div>

          {/* Column 4 - Moves Down */}
          <div className="flex-1 flex flex-col gap-0 animate-[reelDown_18s_linear_infinite]" style={{ marginTop: '-100%' }}>
            {COLUMNS[3].map((techIdx, i) => <GridCell key={`c4a-${i}`} techIdx={techIdx} />)}
            {COLUMNS[3].map((techIdx, i) => <GridCell key={`c4b-${i}`} techIdx={techIdx} />)}
          </div>
          
        </div>
      </div>
      
      <style>{`
        @keyframes reelUp {
          0% { transform: translateY(0); }
          100% { transform: translateY(-50%); }
        }
        @keyframes reelDown {
          0% { transform: translateY(-50%); }
          100% { transform: translateY(0); }
        }
      `}</style>
    </section>
  );
};

// Subcomponent for each square in the grid
function GridCell({ techIdx }: { techIdx: number | null }) {
  const tech = techIdx !== null ? TECH_ITEMS[techIdx] : null;
  const Icon = tech?.icon;

  return (
    <div 
      className="w-[250px] h-[250px] shrink-0 border border-black/10 flex items-center justify-center relative overflow-hidden"
      style={{
        backgroundColor: tech ? tech.bg : '#F1F0E9',
      }}
    >
      {tech && Icon && (
        <div className="absolute inset-0 flex flex-col items-center justify-center opacity-90">
          <Icon size={64} color={tech.color} strokeWidth={1.5} />
        </div>
      )}
      <div className="absolute -top-[2px] -left-[2px] w-1 h-1 rounded-full bg-black z-10" />
      <div className="absolute -bottom-[2px] -right-[2px] w-1 h-1 rounded-full bg-black z-10" />
    </div>
  );
}

