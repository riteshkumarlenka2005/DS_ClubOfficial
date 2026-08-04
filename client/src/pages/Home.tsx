import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion, useReducedMotion, useScroll, useTransform, useSpring, useMotionValue, useMotionTemplate } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { TechnicalArsenal } from '../components/TechnicalArsenal';
import SEO from '../components/SEO';
import LightTunnelBackground from '../components/LightTunnelBackground';
import { useApi } from '../hooks/useApi';
import { latestUpdatesService, LatestUpdate } from '../services/latestUpdates.service';
import { membershipService } from '../services/membership.service';
import {
  Terminal, Database, Users, Rocket, Cpu, Zap,
  BrainCircuit, BarChart3, PieChart, MessageSquareCode,
  Table, Cloud, Binary, Sparkles, Flame,
  Languages, Package, DownloadCloud, Filter,
  TrendingUp, CheckCircle2, FlaskConical, Globe, Stethoscope, CloudRain, Focus, Scale, Atom,
  Eye
} from 'lucide-react';

/* ── Animated Counter Hook ── */
function useCountUp(target: number, duration = 2000, start = false) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!start) return;
    setCount(0);
    const startTime = performance.now();
    const step = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const ease = 1 - Math.pow(1 - progress, 3); // ease-out cubic
      setCount(Math.floor(ease * target));
      if (progress < 1) requestAnimationFrame(step);
      else setCount(target);
    };
    requestAnimationFrame(step);
  }, [start, target, duration]);
  return count;
}

/* ── Single Stat Card ── */
function StatCard({ value, suffix, label, delay }: { value: number; suffix: string; label: string; delay: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const [started, setStarted] = useState(false);
  const count = useCountUp(value, 2000, started);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setStarted(true); else setStarted(false); },
      { threshold: 0.5 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: false, amount: 0.5 }}
      transition={{ duration: 0.7, delay }}
      className="flex flex-col items-center text-center group"
    >
      <span className="text-3xl md:text-4xl font-black tracking-tighter leading-none text-white tabular-nums transition-transform duration-300 group-hover:scale-110">
        {count}{suffix}
      </span>
      <span className="mt-1.5 text-[10px] md:text-xs font-bold uppercase tracking-[0.2em] text-white/60">{label}</span>
    </motion.div>
  );
}

/**
 * Custom hook to handle responsive state safely with SSR/Hydration awareness.
 */
const useIsMobile = () => {
  const [isMobile, setIsMobile] = useState(() => typeof window !== 'undefined' ? window.innerWidth < 768 : false);
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);
  return isMobile;
};

/**
 * Animated Text Component for high-impact typography.
 * On mobile: word-level animation (not letter-level) for much better scroll perf.
 */
export const AnimatedText = ({ text, className, animateOnLoad = false }: { text: string; className?: string; animateOnLoad?: boolean }) => {
  const shouldReduceMotion = useReducedMotion();
  const isMob = useIsMobile();
  const words = text.split(" ");

  const container = {
    hidden: { opacity: 0 },
    visible: (i = 1) => ({
      opacity: 1,
      transition: { staggerChildren: isMob ? 0.04 : 0.08, delayChildren: 0.02 * i },
    }),
  };

  const child = {
    visible: {
      opacity: 1,
      y: 0,
      transition: isMob
        ? { duration: 0.3, ease: 'easeOut' as const }
        : { type: "spring" as const, damping: 15, stiffness: 100 }
    },
    hidden: {
      opacity: 0,
      y: shouldReduceMotion ? 0 : (isMob ? 15 : 40),
    },
  };

  const renderChildren = () => (
    words.map((word, index) => (
      <motion.span key={index} variants={child} className="inline-block whitespace-nowrap mr-[0.25em]">
        {word}
      </motion.span>
    ))
  );

  if (animateOnLoad) {
    return (
      <motion.div
        style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", overflow: "visible" }}
        variants={container}
        initial="hidden"
        animate="visible"
        className={className}
      >
        {renderChildren()}
      </motion.div>
    );
  }

  return (
    <motion.div
      style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", overflow: "visible" }}
      variants={container}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.1 }}
      className={className}
    >
      {renderChildren()}
    </motion.div>
  );
};


/**
 * Data Science Lifecycle Pipeline Section
 */
const LifecycleSection = () => {
  const isMobile = useIsMobile();
  const steps = [
    {
      title: "Data Ingestion",
      desc: "Gathering diverse signals from databases, cloud logs, and sensors across the digital landscape.",
      icon: DownloadCloud,
      color: "#9667E0"
    },
    {
      title: "Refinement",
      desc: "Cleansing noise and engineering features to ensure high-fidelity inputs for analytical models.",
      icon: Filter,
      color: "#4B2C82"
    },
    {
      title: "Synthesis",
      desc: "Applying neural architectures and statistical models to architect predictive intelligence.",
      icon: BrainCircuit,
      color: "#1A0B2E"
    },
    {
      title: "Impact",
      desc: "Transforming complex model outputs into strategic insights that drive real-world transformation.",
      icon: TrendingUp,
      color: "#9667E0"
    }
  ];

  return (
    <div className="py-12 sm:py-24 md:py-40 bg-white relative overflow-hidden">
      <div className="container mx-auto px-6 relative z-10">
        <div className="text-center mb-16 md:mb-32">
          <span className="text-[10px] md:text-xs font-black text-[#9667E0] uppercase tracking-[0.4em] mb-6 block">The Pipeline</span>
          <AnimatedText text="FROM RAW DATA TO INTELLIGENCE" className="text-2xl sm:text-3xl md:text-7xl font-black text-3d mb-8" />
        </div>

        <div className="relative flex flex-col md:flex-row items-center justify-between gap-12 md:gap-0">
          {/* Connecting Path Animation */}
          {!isMobile && (
            <div className="absolute top-1/2 left-0 w-full -translate-y-1/2 px-12 pointer-events-none">
              <svg width="100%" height="2" viewBox="0 0 1000 2" fill="none" preserveAspectRatio="none">
                <motion.path
                  d="M0 1H1000"
                  stroke="#D8CAF6"
                  strokeWidth="2"
                  strokeDasharray="10 10"
                  initial={{ pathLength: 0, opacity: 0 }}
                  whileInView={{ pathLength: 1, opacity: 1 }}
                  transition={{ duration: 1.5, ease: "easeInOut" }}
                />
              </svg>
            </div>
          )}

          {steps.map((step, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.2 }}
              className="relative z-10 w-full md:w-[22%] flex flex-col items-center"
            >
              {/* Step Icon Hexagon/Circle */}
              <motion.div
                whileHover={{ scale: 1.1, rotate: 5 }}
                className="w-20 h-20 md:w-32 md:h-32 rounded-3xl bg-white border-2 border-[#D8CAF6] shadow-xl flex items-center justify-center mb-8 relative group"
              >
                <step.icon size={isMobile ? 32 : 54} style={{ color: step.color }} />
                <div className="absolute -inset-2 bg-[#9667E0]/5 rounded-[2rem] -z-10 group-hover:scale-110 transition-transform" />

                {/* Step Number Badge */}
                <div className="absolute -top-3 -right-3 bg-[#1A0B2E] text-white w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center text-xs md:text-sm font-black border-2 border-white shadow-lg">
                  0{idx + 1}
                </div>
              </motion.div>

              {/* Text Content */}
              <div className="text-center md:px-4">
                <h3 className="text-xl md:text-2xl font-black text-[#1A0B2E] mb-4 uppercase tracking-tight">{step.title}</h3>
                <p className="text-sm md:text-base font-bold text-[#2D164B] opacity-70 leading-relaxed">
                  {step.desc}
                </p>
              </div>

              {/* Mobile Connector */}
              {isMobile && idx < steps.length - 1 && (
                <div className="h-12 w-[2px] bg-gradient-to-b from-[#9667E0]/40 to-transparent my-4" />
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

/**
 * Research Frontiers Section
 */
const ResearchFrontiers = () => {
  const frontiers = [
    { title: "Generative AI", icon: Sparkles, desc: "Architecting advanced prompt systems and fine-tuning neural architectures.", tag: "Frontier" },
    { title: "Healthcare Analytics", icon: Stethoscope, desc: "Predictive diagnostics and personalized medicine through data synthesis.", tag: "High Impact" },
    { title: "Climate Science", icon: CloudRain, desc: "Modeling environmental signals to mitigate global ecological shifts.", tag: "Research" },
    { title: "Computer Vision", icon: Focus, desc: "Real-time perception and autonomous navigation in complex environments.", tag: "Advanced" },
    { title: "MLOps Scaling", icon: Zap, desc: "Bridging the gap between experimental models and production-grade pipelines.", tag: "Infrastructure" },
    { title: "Ethical AI", icon: Scale, desc: "Ensuring algorithmic transparency and fairness in automated decisioning.", tag: "Governance" }
  ];

  return (
    <section className="py-12 sm:py-24 md:py-40 bg-[#1A0B2E] relative overflow-hidden text-white">
      {/* Decorative Radar Rings — static on mobile */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-7xl aspect-square flex items-center justify-center opacity-10 pointer-events-none">
        {[1, 2, 3].map(ring => (
          <div
            key={ring}
            className="absolute rounded-full border border-white"
            style={{ width: `${ring * 33}%`, height: `${ring * 33}%`, opacity: 0.4 }}
          />
        ))}
      </div>

      <div className="container mx-auto px-6 relative z-10">
        <div className="text-center mb-16 md:mb-32">
          <span className="text-[10px] md:text-xs font-black text-[#9667E0] uppercase tracking-[0.4em] mb-6 block">Future Ready</span>
          <AnimatedText text="RESEARCH FRONTIERS" className="text-3xl md:text-8xl font-black text-white mb-8 drop-shadow-2xl" />
          <p className="text-white/60 max-w-3xl mx-auto font-bold text-sm md:text-xl leading-relaxed">
            Exploring the horizon of machine intelligence and analytical disruption. We evolve with the industry.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-12">
          {frontiers.map((node, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              whileHover={{ y: -15, scale: 1.02 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1 }}
              className="bg-white/5 p-8 md:p-12 rounded-[2.5rem] md:rounded-[3.5rem] border border-white/10 flex flex-col gap-6 group hover:bg-white/10 transition-all hover:border-[#9667E0]/50"
            >
              <div className="p-5 bg-[#9667E0]/20 w-fit rounded-2xl group-hover:bg-[#9667E0] group-hover:text-white transition-all">
                <node.icon size={32} />
              </div>
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl md:text-2xl font-black uppercase tracking-tight">{node.title}</h3>
                  <span className="text-[9px] font-black uppercase tracking-widest bg-white/10 px-3 py-1 rounded-full text-white/40 group-hover:text-white group-hover:bg-[#9667E0] transition-all">
                    {node.tag}
                  </span>
                </div>
                <p className="text-sm md:text-base font-bold text-white/50 group-hover:text-white/80 transition-colors leading-relaxed">
                  {node.desc}
                </p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Rotating Atom — disabled on mobile for perf */}
        <div className="absolute -bottom-40 -left-40 opacity-5 pointer-events-none hidden md:block">
          <Atom size={600} />
        </div>
      </div>
    </section>
  );
};

const BigCountdown = () => {
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    const target = new Date("Feb 14, 2026 18:00:00").getTime();
    const interval = setInterval(() => {
      const now = new Date().getTime();
      const distance = target - now;
      if (distance < 0) {
        clearInterval(interval);
        return;
      }
      setTimeLeft({
        days: Math.floor(distance / (1000 * 60 * 60 * 24)),
        hours: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        minutes: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((distance % (1000 * 60)) / 1000)
      });
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8 max-w-5xl mx-auto px-4">
      {Object.entries(timeLeft).map(([label, value]) => (
        <div key={label} className="relative group">
          <div className="absolute inset-0 bg-[#9667E0]/20 rounded-[2rem] blur-xl opacity-0 group-hover:opacity-100 transition-opacity" />
          <div className="relative bg-[#1A0B2E] border-2 border-[#D8CAF6] p-4 sm:p-6 md:p-10 rounded-2xl sm:rounded-[2.5rem] md:rounded-[3rem] shadow-2xl flex flex-col items-center">
            <span className="text-3xl sm:text-4xl md:text-8xl font-black text-white leading-none mb-2 tabular-nums">
              {(value as number) < 10 ? `0${value}` : value}
            </span>
            <span className="text-[10px] md:text-xs uppercase font-black text-[#D8CAF6] tracking-[0.3em]">{label}</span>
          </div>
        </div>
      ))}
    </div>
  );
};

const Home = () => {
  const navigate = useNavigate();
  const isMobile = useIsMobile();

  // Fetch latest updates (events, projects, blogs combined)
  const { data: latestUpdates, isLoading: updatesLoading } = useApi<LatestUpdate[]>(
    () => latestUpdatesService.get(),
    []
  );



  // Mouse tracking for 3D tilt effect (desktop only)
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  // Smooth springs for professional feel
  const springConfig = { damping: 25, stiffness: 150 };
  const rotateX = useSpring(useTransform(mouseY, [-0.5, 0.5], [15, -15]), springConfig);
  const rotateY = useSpring(useTransform(mouseX, [-0.5, 0.5], [-15, 15]), springConfig);

  // Vertical parallax effects
  const { scrollY } = useScroll();

  // Memoize random positions so they don't recalculate on re-render
  const particlePositions = useMemo(() =>
    Array.from({ length: 10 }, () => ({
      left: `${Math.random() * 100}%`,
      top: `${Math.random() * 100}%`,
      delay: Math.random() * 5,
      duration: 2 + Math.random() * 3,
    })), []
  );
  const nodePositions = useMemo(() =>
    Array.from({ length: 6 }, () => ({
      width: Math.random() * 100 + 50,
      height: Math.random() * 100 + 50,
      left: `${Math.random() * 100}%`,
      top: `${Math.random() * 100}%`,
    })), []
  );

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isMobile) return; // Skip 3D tilt on mobile
    const rect = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    mouseX.set(x);
    mouseY.set(y);
  };

  const handleMouseLeave = () => {
    mouseX.set(0);
    mouseY.set(0);
  };

  return (
    <div className="w-full">
      <SEO title="Home" description="Official Data Science Club of GIET University. Explore workshops, AI/ML projects, hackathons, alumni network and student research initiatives." />
      {/* ══ Hero Section ══ */}
      <section
        className="relative flex flex-col justify-center items-center overflow-hidden z-0"
        style={{ minHeight: '100vh', background: '#F4F1EA' }}
      >
        {/* Dot-grid overlay */}
        <div
          className="absolute inset-0 pointer-events-none opacity-60"
          style={{
            backgroundImage: 'radial-gradient(circle, rgba(0,0,0,0.15) 1.5px, transparent 1.5px)',
            backgroundSize: '32px 32px',
          }}
        />

        {/* Floating Geometric Elements (CSS based) */}
        {!isMobile && (
          <>
            {/* Top Left Floating Logo */}
            <motion.div
              className="absolute left-[10%] top-[15%] w-[140px] h-[140px] md:w-[180px] md:h-[180px]"
              animate={{ y: [-10, 10, -10], rotate: [-10, 5, -10] }}
              transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
            >
              <img
                src="/DSC_LogoV2.png"
                alt="Floating DSC Logo"
                className="w-full h-full object-contain opacity-80"
                style={{ filter: 'drop-shadow(12px 12px 10px rgba(0,0,0,0.1))' }}
              />
            </motion.div>
            {/* Bottom Right Cylinder/Spring shape */}
            <motion.div
              className="absolute right-[10%] bottom-[15%] flex flex-col gap-2 opacity-90"
              style={{ transform: 'rotate(20deg)' }}
              animate={{ y: [10, -10, 10], rotate: [20, 25, 20] }}
              transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut' }}
            >
              {[...Array(5)].map((_, i) => (
                <div key={i} className="w-[100px] h-[30px] bg-[#3B4DFF] rounded-full" style={{ boxShadow: 'inset -6px -6px 12px rgba(0,0,0,0.2), 6px 6px 0px rgba(0,0,0,0.05)' }} />
              ))}
            </motion.div>
          </>
        )}

        <div className="relative z-10 flex flex-col items-center pt-13 md:pt-15 w-full max-w-[1200px] px-4 md:px-8">

          {/* Typographic Group */}
          <div className="flex flex-col items-center relative w-full">

            {/* BUILD THE (Top row) */}
            <div className="flex flex-col md:flex-row items-center md:items-end justify-center w-full gap-4 md:gap-8">
              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="font-black leading-[0.85] tracking-tighter text-[#1A1A1A] text-center uppercase"
                style={{ fontSize: 'clamp(4.5rem, 12vw, 11rem)' }}
              >
                BUILD THE
              </motion.h1>

              {/* Small supporting paragraph (next to top row on desktop) */}
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8 }}
                className="hidden lg:block max-w-[320px] text-xs md:text-sm font-medium text-gray-700 leading-relaxed text-left pb-3"
              >
                The largest and most vibrant community for developers, creative minds and digital wizards who want to design and build with the best AI tools. Here we help each other and create magic together.
              </motion.p>
            </div>

            {/* FUTURE (Orange pixel text) */}
            <motion.h1
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="leading-[1] tracking-normal text-center mt-4 mb-4"
              style={{
                fontFamily: "'Silkscreen', cursive",
                color: '#FF6B00',
                fontSize: 'clamp(3.5rem, 11vw, 10rem)',
                textShadow: '3px 3px 0px rgba(255,107,0,0.2)'
              }}
            >
              FUTURE
            </motion.h1>

            {/* WITH DATA (In selection box) */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="relative mt-2 md:mt-4 inline-block"
            >
              <div className="relative border-2 border-[#3B4DFF] px-6 md:px-12 py-2 md:py-4 bg-[#F4F1EA]">
                {/* 4 corner anchors */}
                <div className="absolute -top-[5px] -left-[5px] w-2.5 h-2.5 bg-[#3B4DFF]" />
                <div className="absolute -top-[5px] -right-[5px] w-2.5 h-2.5 bg-[#3B4DFF]" />
                <div className="absolute -bottom-[5px] -left-[5px] w-2.5 h-2.5 bg-[#3B4DFF]" />
                <div className="absolute -bottom-[5px] -right-[5px] w-2.5 h-2.5 bg-[#3B4DFF]" />

                <h1
                  className="font-black leading-[0.85] tracking-tighter text-[#1A1A1A] text-center uppercase"
                  style={{ fontSize: 'clamp(4rem, 10vw, 9.5rem)' }}
                >
                  WITH DATA
                </h1>
              </div>

            </motion.div>
          </div>

          {/* CTA Button */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="mt-16 md:mt-24 flex flex-col items-center"
          >
            <button
              onClick={() => navigate('/join')}
              className="group flex items-center gap-3 px-8 py-3.5 rounded-full font-bold text-xs tracking-widest uppercase cursor-pointer hover:-translate-y-1 transition-all duration-300"
              style={{ background: '#3B4DFF', color: '#FFFFFF', boxShadow: '0 10px 30px rgba(59,77,255,0.2)' }}
            >
              Join The Community
              <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center group-hover:bg-white/30 transition-colors">
                <span className="text-white text-sm leading-none transform -rotate-45 block relative top-[1px] left-[1px]">→</span>
              </div>
            </button>

          </motion.div>

        </div>
      </section>

      {/* ── Latest Updates Section ── */}
      <section
        className="relative py-16 md:py-32 px-4 md:px-6 overflow-hidden z-20 shadow-[0_-20px_50px_rgba(0,0,0,0.1)]"
        style={{
          background: 'linear-gradient(135deg, #EEEAFD 0%, #D8CAF6 25%, #E8E0F5 50%, #F5F0FF 75%, #EEEAFD 100%)'
        }}
      >
        {/* Background decorations */}
        <div className="absolute inset-0 pointer-events-none" style={{
          background: 'radial-gradient(ellipse 80% 50% at 20% 40%, rgba(150,103,224,0.15) 0%, transparent 50%), radial-gradient(ellipse 60% 80% at 80% 60%, rgba(75,44,130,0.2) 0%, transparent 50%)',
        }} />
        <div className="absolute inset-0 pointer-events-none opacity-[0.04]" style={{
          backgroundImage: 'linear-gradient(rgba(150,103,224,1) 1px, transparent 1px), linear-gradient(90deg, rgba(150,103,224,1) 1px, transparent 1px)',
          backgroundSize: '60px 60px',
        }} />

        <div className="container mx-auto max-w-6xl relative z-10">
          {/* Section Header */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="text-center mb-10 md:mb-16"
          >

            <div className="relative inline-flex items-center justify-center p-[4px] rounded-xl mb-6 shadow-2xl overflow-hidden">
              {/* Spinning RGB Gradient Edge */}
              <div
                className="absolute left-1/2 top-1/2 w-[200vw] aspect-square -translate-x-1/2 -translate-y-1/2 animate-[spin_3s_linear_infinite]"
                style={{
                  background: 'conic-gradient(from 0deg, #ff0000, #ff8000, #ffff00, #00ff00, #00ffff, #0000ff, #8000ff, #ff00ff, #ff0000)'
                }}
              />
              {/* Inner Black Box */}
              <div className="relative bg-[#050505] py-6 px-10 rounded-[10px] w-full h-full z-10">
                <h2
                  className="font-black uppercase tracking-tight text-center m-0 leading-none"
                  style={{
                    fontFamily: "'Silkscreen', cursive",
                    fontSize: 'clamp(2.8rem, 5.5vw, 5.5rem)',
                    color: '#FFFFFF',
                    textShadow: `
                      -2px -2px 0 #1A0B2E, 2px -2px 0 #1A0B2E, -2px 2px 0 #1A0B2E, 2px 2px 0 #1A0B2E,
                      -3px 0 0 #1A0B2E, 3px 0 0 #1A0B2E, 0 -3px 0 #1A0B2E, 0 3px 0 #1A0B2E,
                      6px 6px 0 #FFFFFF, 
                      10px 10px 0 #1A0B2E
                    `,
                  }}
                >
                  LATEST UPDATE
                </h2>
              </div>
            </div>

          </motion.div>

          {/* Girl Image + Cards Layout */}
          <div className="flex flex-col md:flex-row items-stretch gap-6 md:gap-10">
            {/* Announcement Girl — hidden on mobile when updates exist */}
            <motion.div
              initial={{ opacity: 0, x: -100 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: false, amount: 0.2 }}
              transition={{ duration: 0.8, type: "spring", bounce: 0.3 }}
              className="relative shrink-0 w-[240px] md:w-[350px] self-center md:self-end mx-auto md:mx-0"
            >
              <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[220px] h-[220px] md:w-[320px] md:h-[320px] rounded-full pointer-events-none" style={{
                background: 'radial-gradient(circle, rgba(150,103,224,0.25) 0%, transparent 70%)',
                filter: isMobile ? undefined : 'blur(40px)',
              }} />
              <img
                src="/announcement.png"
                alt="Announcement"
                className="relative z-10 w-full h-auto object-contain drop-shadow-2xl hidden md:block"
              />
              <img
                src="/announcement2.png"
                alt="Announcement"
                className="relative z-10 w-full h-auto object-contain drop-shadow-2xl block md:hidden"
              />
            </motion.div>

            {/* Update Cards */}
            <div className="flex-1 min-w-0">
              {updatesLoading ? (
                /* Loading skeleton */
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {[1, 2, 3, 4].map(i => (
                    <div key={i} className="animate-pulse rounded-2xl p-5 bg-white border border-[#E0D4F5]">
                      <div className="flex items-center gap-2 mb-3">
                        <div className="h-5 w-20 bg-[#EEEAFD] rounded-full" />
                      </div>
                      <div className="h-5 w-3/4 bg-[#EEEAFD]/60 rounded mb-2" />
                      <div className="h-3 w-full bg-[#EEEAFD]/40 rounded mb-1" />
                      <div className="h-3 w-5/6 bg-[#EEEAFD]/40 rounded" />
                    </div>
                  ))}
                </div>
              ) : latestUpdates && latestUpdates.length > 0 ? (
                /* Cards + Timer layout */
                <div className="flex flex-col xl:flex-row items-stretch gap-6 w-full">
                  {/* Left: Cards List */}
                  <div className="flex-1 flex flex-col gap-6">
                    {latestUpdates.map((item, idx) => {
                      const typeConfig = {
                        event: { emoji: '📅', label: 'Event', color: '#9667E0', bg: 'rgba(150,103,224,0.1)', border: 'rgba(150,103,224,0.25)', route: `/events` },
                        project: { emoji: '🚀', label: 'Project', color: '#059669', bg: 'rgba(5,150,105,0.1)', border: 'rgba(5,150,105,0.25)', route: `/` },
                        blog: { emoji: '✍️', label: 'Blog', color: '#D97706', bg: 'rgba(217,119,6,0.1)', border: 'rgba(217,119,6,0.25)', route: `/blog` },
                      }[item.type];

                      return (
                        <motion.div
                          key={item.id}
                          initial={{ opacity: 0, x: 100 }}
                          whileInView={{ opacity: 1, x: 0 }}
                          viewport={{ once: false, amount: 0.2 }}
                          transition={{ duration: 0.6, type: "spring", bounce: 0.3, delay: idx * 0.1 }}
                          whileHover={{ y: -4, scale: 1.02 }}
                          onClick={() => navigate(typeConfig.route)}
                          className="relative group cursor-pointer flex flex-col-reverse md:flex-row rounded-2xl bg-black border border-white/10 p-5 md:p-8 hover:shadow-xl hover:shadow-[#9667E0]/20 transition-shadow overflow-hidden h-full gap-6 items-stretch"
                        >
                          {/* Shimmer on hover — desktop only */}
                          {!isMobile && (
                            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" style={{
                              background: 'linear-gradient(135deg, rgba(150,103,224,0.08) 0%, transparent 60%)',
                            }} />
                          )}

                          {/* Details Container (Left side on md) */}
                          <div className="flex-1 flex flex-col justify-center relative z-10">
                            {/* Type badge + date */}
                            <div className="flex items-center justify-between gap-2 mb-4 md:mb-6">
                              <span
                                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] md:text-xs font-black uppercase tracking-[0.2em]"
                                style={{
                                  background: typeConfig.bg,
                                  color: typeConfig.color,
                                  border: `1px solid ${typeConfig.border}`,
                                }}
                              >
                                {typeConfig.emoji} {typeConfig.label}
                              </span>
                              <span className="text-xs md:text-sm !text-white/40 font-semibold shrink-0">
                                {new Date(item.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                              </span>
                            </div>

                            {/* Title */}
                            <h4 className="text-xl md:text-3xl font-bold !text-white leading-snug mb-3 line-clamp-2">
                              {item.title}
                            </h4>

                            {/* Description */}
                            <p className="text-base md:text-lg !text-white/60 font-medium leading-relaxed line-clamp-4">
                              {item.short_description || item.description}
                            </p>

                            <div className="mt-auto pt-4">
                              {/* Event-specific meta */}
                              {item.type === 'event' && item.meta?.event_date && (
                                <div className="flex items-center gap-3 mt-3 text-xs md:text-sm text-[#9667E0] font-semibold">
                                  <span>📅 {new Date(item.meta.event_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                                  {item.meta?.location && <span>📍 {item.meta.location}</span>}
                                </div>
                              )}

                              {/* Project tech stack */}
                              {item.type === 'project' && item.meta?.tech_stack?.length > 0 && (
                                <div className="flex flex-wrap gap-1 mt-3">
                                  {item.meta.tech_stack.slice(0, 3).map((t: string) => (
                                    <span key={t} className="px-2 py-0.5 text-[10px] md:text-xs font-bold bg-[#EEEAFD] text-[#4B2C82] rounded-full">{t}</span>
                                  ))}
                                  {item.meta.tech_stack.length > 3 && (
                                    <span className="px-2 py-0.5 text-[10px] md:text-xs font-bold bg-[#EEEAFD] text-[#4B2C82] rounded-full">+{item.meta.tech_stack.length - 3}</span>
                                  )}
                                </div>
                              )}

                              {/* Blog category */}
                              {item.type === 'blog' && item.meta?.category && (
                                <div className="mt-3">
                                  <span className="px-2 py-0.5 text-[10px] md:text-xs font-bold bg-orange-50 text-orange-600 rounded-full">{item.meta.category}</span>
                                </div>
                              )}

                              {/* Register Soon button — events only */}
                              {item.type === 'event' && (
                                <div className="mt-5">
                                  <button
                                    onClick={(e) => { e.stopPropagation(); navigate('/events'); }}
                                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-xs md:text-sm font-black uppercase tracking-widest text-white border border-white/20 hover:border-[#9667E0] hover:bg-[#9667E0]/20 transition-all duration-300"
                                    style={{ background: 'rgba(150,103,224,0.15)' }}
                                  >
                                    🔔 Register Soon
                                  </button>
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Image Container (Right side on md) */}
                          {item.image_url && (
                            <div className="w-full md:w-[40%] h-48 md:h-auto rounded-xl overflow-hidden relative z-10 shrink-0">
                              <img
                                loading="lazy"
                                src={item.image_url}
                                alt={item.title}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                              />
                            </div>
                          )}
                        </motion.div>
                      );
                    })}
                  </div>

                </div>
              ) : (
                /* Empty state — no updates yet */
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5 }}
                  className="flex flex-col items-center justify-center rounded-3xl bg-white border border-[#E0D4F5] p-8 md:p-14 text-center min-h-[250px]"
                >
                  <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-[#EEEAFD] flex items-center justify-center mb-5">
                    <Sparkles size={28} className="text-[#9667E0]" />
                  </div>
                  <h3 className="text-lg md:text-2xl font-black text-[#1A0B2E] mb-2">
                    Coming Soon!
                  </h3>
                  <p className="text-sm md:text-base text-[#2D164B]/60 font-medium max-w-sm">
                    We'll bring exciting updates soon — new events, projects, hackathons, and workshops. Stay tuned!
                  </p>
                </motion.div>
              )}
            </div>
          </div>
        </div>

        <div className="absolute bottom-0 left-0 right-0 h-20 pointer-events-none" style={{
          background: 'linear-gradient(to bottom, transparent, #EEEAFD)',
        }} />
      </section>

      {/* ── Who We Are Section ── */}
      <section className="relative pt-16 lg:pt-20 pb-0 overflow-hidden bg-white z-10 border-t border-[#E0D4F5] min-h-screen flex flex-col justify-between">
        {/* Full-width Door Overlay */}
        <motion.div
          initial={{ x: "0%" }}
          whileInView={{ x: "-105%" }}
          viewport={{ once: false, margin: "0px 0px -15% 0px" }}
          transition={{ duration: 1.8, ease: [0.77, 0, 0.175, 1] }}
          className="absolute top-0 bottom-0 left-0 w-full bg-[#222F30] z-50 shadow-[30px_0_50px_rgba(0,0,0,0.5)] pointer-events-none"
        />

        <div className="container mx-auto max-w-6xl px-4 md:px-6 relative z-40 mb-10 lg:mb-12 pt-4 lg:pt-0">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: false, amount: 0.2 }}
            transition={{ duration: 0.8, delay: 0.5 }}
            className="text-center mb-10 lg:mb-14"
          >
            <h2
              className="font-black leading-[1.0] tracking-tight uppercase"
              style={{
                fontSize: 'clamp(2.8rem, 5.5vw, 5.5rem)',
                color: '#1A0B2E',
              }}
            >
              WHO WE ARE
            </h2>
            <div className="w-24 h-1 bg-[#9667E0] mx-auto mt-4 rounded-full"></div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: false, amount: 0.2 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="max-w-4xl mx-auto text-center"
          >
            <p className="text-[#2D164B] text-base md:text-xl font-medium leading-relaxed opacity-80">
              The Data Science Club at GIET University is a student-driven community where curiosity meets innovation. We bring together aspiring data scientists, AI enthusiasts, developers, designers, and problem-solvers to learn, collaborate, and build impactful projects that solve real-world challenges.
            </p>
          </motion.div>
        </div>

        {/* 3 Cards Edge-to-Edge Grid */}
        <div className="w-full grid grid-cols-1 md:grid-cols-3 relative z-40">

          {/* Card 1: Learn */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: false, amount: 0.1 }}
            transition={{ duration: 0.8, delay: 0.7 }}
            className="bg-[#DDF8A1] aspect-square md:aspect-auto md:h-[320px] lg:h-[360px] p-6 lg:p-10 flex flex-col justify-between group"
          >
            <div className="flex justify-between items-start">
              <div className="w-12 h-12 lg:w-16 lg:h-16 opacity-80">
                {/* Sunburst Icon */}
                <svg viewBox="0 0 24 24" fill="none" stroke="#1A0B2E" strokeWidth="1" className="w-full h-full group-hover:scale-110 group-hover:rotate-45 transition-all duration-700">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 2v20M17 5l-10 14M22 12H2M19.07 19.07L4.93 4.93M5 17l14-10" />
                </svg>
              </div>
              {/* Distressed hatched number */}
              <svg width="80" height="80" viewBox="0 0 80 80" className="opacity-70">
                <defs>
                  <pattern id="hatch1" patternUnits="userSpaceOnUse" width="4" height="4" patternTransform="rotate(45)">
                    <line x1="0" y1="0" x2="0" y2="4" stroke="#1A0B2E" strokeWidth="1.8" />
                  </pattern>
                  <mask id="mask1">
                    <text x="50%" y="80%" textAnchor="middle" fontSize="82" fontFamily="Georgia, serif" fontWeight="900" fill="white">1</text>
                  </mask>
                </defs>
                <rect width="80" height="80" fill="url(#hatch1)" mask="url(#mask1)" />
              </svg>
            </div>
            <div>
              <h3 className="text-3xl md:text-4xl font-medium text-[#1A0B2E] mb-3 tracking-tight">Learn</h3>
              <p className="text-[#1A0B2E]/80 text-sm md:text-base font-medium max-w-xs leading-relaxed">
                Master the latest tools, frameworks, and concepts through intensive hands-on workshops and peer sessions.
              </p>
            </div>
          </motion.div>

          {/* Card 2: Build */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: false, amount: 0.1 }}
            transition={{ duration: 0.8, delay: 0.8 }}
            className="bg-[#B49DF8] aspect-square md:aspect-auto md:h-[320px] lg:h-[360px] p-6 lg:p-10 flex flex-col justify-between group"
          >
            <div className="flex justify-between items-start">
              <div className="w-12 h-12 lg:w-16 lg:h-16 opacity-80">
                {/* Concentric Hexagon Icon */}
                <svg viewBox="0 0 24 24" fill="none" stroke="#1A0B2E" strokeWidth="1" className="w-full h-full group-hover:scale-110 transition-transform duration-700">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 2L3 7l0 10 9 5 9-5 0-10-9-5z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 5.5L6 9l0 6 6 3.5 6-3.5 0-6-6-3.5z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9L9 11l0 2 3 2 3-2 0-2-3-2z" />
                </svg>
              </div>
              {/* Distressed hatched number */}
              <svg width="80" height="80" viewBox="0 0 80 80" className="opacity-70">
                <defs>
                  <pattern id="hatch2" patternUnits="userSpaceOnUse" width="4" height="4" patternTransform="rotate(45)">
                    <line x1="0" y1="0" x2="0" y2="4" stroke="#1A0B2E" strokeWidth="1.8" />
                  </pattern>
                  <mask id="mask2">
                    <text x="50%" y="80%" textAnchor="middle" fontSize="82" fontFamily="Georgia, serif" fontWeight="900" fill="white">2</text>
                  </mask>
                </defs>
                <rect width="80" height="80" fill="url(#hatch2)" mask="url(#mask2)" />
              </svg>
            </div>
            <div>
              <h3 className="text-3xl md:text-4xl font-medium text-[#1A0B2E] mb-3 tracking-tight">Build</h3>
              <p className="text-[#1A0B2E]/80 text-sm md:text-base font-medium max-w-xs leading-relaxed">
                Apply your knowledge to solve real-world problems and create impactful data-driven applications.
              </p>
            </div>
          </motion.div>

          {/* Card 3: Grow */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: false, amount: 0.1 }}
            transition={{ duration: 0.8, delay: 0.9 }}
            className="bg-[#F1F0E9] aspect-square md:aspect-auto md:h-[320px] lg:h-[360px] p-6 lg:p-10 flex flex-col justify-between group"
          >
            <div className="flex justify-between items-start">
              <div className="w-12 h-12 lg:w-16 lg:h-16 opacity-80">
                {/* Geometric Network Icon */}
                <svg viewBox="0 0 24 24" fill="none" stroke="#1A0B2E" strokeWidth="1" className="w-full h-full group-hover:scale-110 transition-transform duration-700">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 2L4 7l8 5 8-5-8-5z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 12l-8 5 8 5 8-5-8-5z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 7v10" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M20 7v10" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 2v20" />
                </svg>
              </div>
              {/* Distressed hatched number */}
              <svg width="80" height="80" viewBox="0 0 80 80" className="opacity-70">
                <defs>
                  <pattern id="hatch3" patternUnits="userSpaceOnUse" width="4" height="4" patternTransform="rotate(45)">
                    <line x1="0" y1="0" x2="0" y2="4" stroke="#1A0B2E" strokeWidth="1.8" />
                  </pattern>
                  <mask id="mask3">
                    <text x="50%" y="80%" textAnchor="middle" fontSize="82" fontFamily="Georgia, serif" fontWeight="900" fill="white">3</text>
                  </mask>
                </defs>
                <rect width="80" height="80" fill="url(#hatch3)" mask="url(#mask3)" />
              </svg>
            </div>
            <div>
              <h3 className="text-3xl md:text-4xl font-medium text-[#1A0B2E] mb-3 tracking-tight">Grow</h3>
              <p className="text-[#1A0B2E]/80 text-sm md:text-base font-medium max-w-xs leading-relaxed">
                Expand your professional network, build your portfolio, and prepare for a successful career in tech.
              </p>
            </div>
          </motion.div>

        </div>
      </section>



      {/* Main Content Sections */}
      <section
        className="relative py-24 md:py-40 px-4 md:px-6 overflow-hidden z-20"
        style={{ background: 'linear-gradient(180deg, #FFFFFF 0%, #EEEAFD 40%, #D8CAF6 100%)' }}
      >
        <div className="container mx-auto relative z-10">
          {/* ── What We Do ── */}
          <div className="mb-24 md:mb-48">
            <div className="text-center mb-12 md:mb-16">
              <span className="text-[10px] md:text-xs font-black text-[#9667E0] uppercase tracking-[0.4em] mb-4 block">Our Activities</span>
              <motion.h2
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, delay: 0.1 }}
                className="font-black leading-[1.0] tracking-tight mb-4 text-center uppercase"
                style={{
                  fontSize: 'clamp(2.8rem, 5.5vw, 5.5rem)',
                  color: '#1A0B2E',
                }}
              >
                WHAT WE DO
              </motion.h2>
              <p className="text-[#1A0B2E] max-w-xl mx-auto font-bold opacity-60 text-sm md:text-base">
                From intensive workshops to innovation labs — everything we do is designed to accelerate your data science journey.
              </p>
            </div>

            {/* Masonry Archive Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-0 border border-[#E0D4F5]">

              {/* Card 1 — Workshops */}
              <motion.div
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0 }}
                className="group relative border-r border-b border-[#E0D4F5] p-8 md:p-10 flex flex-col items-center justify-center min-h-[280px] md:min-h-[360px] overflow-hidden cursor-default text-center"
              >
                <img src="/card_workshops.png" alt="" className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                <div className="absolute inset-0 bg-black/55 group-hover:bg-black/65 transition-colors duration-500" />
                <div className="relative z-10">
                  <h4 className="text-2xl md:text-3xl font-black mb-3 tracking-tight leading-tight" style={{ color: '#ffffff' }}>Workshops &amp; Bootcamps</h4>
                  <p className="text-white text-base md:text-lg font-semibold leading-relaxed">Intensive training covering Python, SQL, ML frameworks, and advanced data science techniques.</p>
                </div>
              </motion.div>

              {/* Card 2 — AI/ML */}
              <motion.div
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.08 }}
                className="group relative border-r border-b border-[#E0D4F5] p-8 md:p-10 flex flex-col items-center justify-center min-h-[280px] md:min-h-[360px] overflow-hidden cursor-default text-center"
              >
                <img src="/card_ai_ml.png" alt="" className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                <div className="absolute inset-0 bg-black/55 group-hover:bg-black/65 transition-colors duration-500" />
                <div className="relative z-10">
                  <h4 className="text-2xl md:text-3xl font-black mb-3 tracking-tight leading-tight" style={{ color: '#ffffff' }}>AI / ML Projects</h4>
                  <p className="text-white text-base md:text-lg font-semibold leading-relaxed">Collaborate on real-world projects applying machine learning to solve practical problems.</p>
                </div>
              </motion.div>

              {/* Card 3 — Speaker */}
              <motion.div
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.16 }}
                className="group relative border-b border-[#E0D4F5] p-8 md:p-10 flex flex-col items-center justify-center min-h-[280px] md:min-h-[360px] overflow-hidden cursor-default text-center col-span-2 lg:col-span-1"
              >
                <img src="/card_speaker.png" alt="" className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                <div className="absolute inset-0 bg-black/55 group-hover:bg-black/65 transition-colors duration-500" />
                <div className="relative z-10">
                  <h4 className="text-2xl md:text-3xl font-black mb-3 tracking-tight leading-tight" style={{ color: '#ffffff' }}>Speaker Sessions</h4>
                  <p className="text-white text-base md:text-lg font-semibold leading-relaxed">Learn from industry experts sharing insights on cutting-edge data science trends.</p>
                </div>
              </motion.div>

              {/* Card 4 — Hackathon */}
              <motion.div
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.24 }}
                className="group relative border-r border-[#E0D4F5] p-8 md:p-10 flex flex-col items-center justify-center min-h-[240px] md:min-h-[300px] overflow-hidden cursor-default text-center col-span-2 lg:col-span-1"
              >
                <img src="/card_hackathon.png" alt="" className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                <div className="absolute inset-0 bg-black/55 group-hover:bg-black/65 transition-colors duration-500" />
                <div className="relative z-10">
                  <h4 className="text-2xl md:text-3xl font-black mb-3 tracking-tight leading-tight" style={{ color: '#ffffff' }}>Hackathons &amp; Competitions</h4>
                  <p className="text-white text-base md:text-lg font-semibold leading-relaxed">Showcase your skills, win prizes, and gain recognition in the data science community.</p>
                </div>
              </motion.div>

              {/* Card 5 — Peer Learning */}
              <motion.div
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.32 }}
                className="group relative border-r border-[#E0D4F5] p-8 md:p-10 flex flex-col items-center justify-center min-h-[240px] md:min-h-[300px] overflow-hidden cursor-default text-center"
              >
                <img src="/card_peer_learning.png" alt="" className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                <div className="absolute inset-0 bg-black/55 group-hover:bg-black/65 transition-colors duration-500" />
                <div className="relative z-10">
                  <h4 className="text-2xl md:text-3xl font-black mb-3 tracking-tight leading-tight" style={{ color: '#ffffff' }}>Peer Learning</h4>
                  <p className="text-white text-base md:text-lg font-semibold leading-relaxed">Study groups, code reviews, and collaborative learning to strengthen skills together.</p>
                </div>
              </motion.div>

              {/* Card 6 — Innovation Lab */}
              <motion.div
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.40 }}
                className="group relative p-8 md:p-10 flex flex-col items-center justify-center min-h-[240px] md:min-h-[300px] overflow-hidden cursor-default text-center"
              >
                <img src="/card_innovation_lab.png" alt="" className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                <div className="absolute inset-0 bg-black/55 group-hover:bg-black/65 transition-colors duration-500" />
                <div className="relative z-10">
                  <h4 className="text-2xl md:text-3xl font-black mb-3 tracking-tight leading-tight" style={{ color: '#ffffff' }}>Innovation Lab</h4>
                  <p className="text-white text-base md:text-lg font-semibold leading-relaxed">Ideate and experiment with emerging technologies and novel data science approaches.</p>
                </div>
              </motion.div>

            </div>
          </div>


          {/* ── Stats / Impact Numbers Section ── */}
          <div className="relative -mx-4 md:-mx-6 my-12 bg-[#050505] py-6 md:py-8 px-4 md:px-6 overflow-hidden">
            {/* Thin top & bottom borders */}
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />
            <div className="container mx-auto max-w-6xl relative z-10">
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 md:gap-4">
                <StatCard value={200} suffix="+" label="Active Members" delay={0} />
                <StatCard value={12} suffix="+" label="Events Hosted" delay={0.1} />
                <StatCard value={15} suffix="+" label="Projects Built" delay={0.2} />
                <StatCard value={5} suffix="+" label="Workshops Run" delay={0.3} />
              </div>
            </div>
          </div>

          <TechnicalArsenal />

          {/* ── Our Mission & Vision ── */}
          <div className="mt-24 md:mt-40 mb-8 md:mb-12">
            <div className="text-center mb-12 md:mb-16">
              <motion.h2
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, delay: 0.1 }}
                className="font-black leading-[1.0] tracking-tight mb-4 text-center uppercase"
                style={{
                  fontSize: 'clamp(2.8rem, 5.5vw, 5.5rem)',
                  color: '#1A0B2E',
                }}
              >
                OUR MISSION & VISION
              </motion.h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 max-w-7xl mx-auto">
              {/* Mission */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
                className="p-3 md:p-5 bg-[#ADC178] transition-all hover:-translate-y-2 hover:shadow-2xl flex flex-col"
              >
                <div className="bg-gradient-to-br from-[#FFFFFF] via-[#F5F5F5] to-[#E0E0E0] h-full flex flex-col justify-between p-10 md:p-12 relative overflow-hidden">

                  {/* Dark Box Icon */}
                  <div className="absolute top-8 right-8 w-32 h-32 md:w-48 md:h-48 bg-[#1A1A1A] flex items-center justify-center shadow-lg">
                    <div className="absolute top-2 left-2 w-1.5 h-1.5 bg-white/40 rounded-full"></div>
                    <div className="absolute top-2 right-2 w-1.5 h-1.5 bg-white/40 rounded-full"></div>
                    <div className="absolute bottom-2 left-2 w-1.5 h-1.5 bg-white/40 rounded-full"></div>
                    <div className="absolute bottom-2 right-2 w-1.5 h-1.5 bg-white/40 rounded-full"></div>
                    <Rocket size={56} className="text-white/80" strokeWidth={1} />
                  </div>

                  {/* Spacer for top box */}
                  <div className="h-32 md:h-48 w-full"></div>

                  {/* Content */}
                  <div className="flex flex-col items-start text-left mt-14 md:mt-20 z-10">

                    <h3 className="text-2xl md:text-3xl font-extrabold text-[#1A0B2E] mb-6 tracking-tight">
                      Our Mission
                    </h3>
                    <div className="flex gap-4 text-sm md:text-base text-[#2D164B] opacity-80 font-medium leading-relaxed">
                      <span className="mt-0.5 shrink-0 text-[#1A0B2E] font-bold">→</span>
                      <p>
                        To empower students with cutting-edge data science skills through hands-on learning, collaborative projects, and industry exposure — transforming curious minds into confident data professionals ready to solve real-world problems.
                      </p>
                    </div>
                  </div>

                </div>
              </motion.div>
              {/* Vision */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.15 }}
                className="p-3 md:p-5 bg-[#ADC178] transition-all hover:-translate-y-2 hover:shadow-2xl flex flex-col"
              >
                <div className="bg-gradient-to-br from-[#FFFFFF] via-[#F5F5F5] to-[#E0E0E0] h-full flex flex-col justify-between p-10 md:p-12 relative overflow-hidden">

                  {/* Dark Box Icon */}
                  <div className="absolute top-8 right-8 w-32 h-32 md:w-48 md:h-48 bg-[#1A1A1A] flex items-center justify-center shadow-lg">
                    <div className="absolute top-2 left-2 w-1.5 h-1.5 bg-white/40 rounded-full"></div>
                    <div className="absolute top-2 right-2 w-1.5 h-1.5 bg-white/40 rounded-full"></div>
                    <div className="absolute bottom-2 left-2 w-1.5 h-1.5 bg-white/40 rounded-full"></div>
                    <div className="absolute bottom-2 right-2 w-1.5 h-1.5 bg-white/40 rounded-full"></div>
                    <Eye size={56} className="text-white/80" strokeWidth={1} />
                  </div>

                  {/* Spacer for top box */}
                  <div className="h-32 md:h-48 w-full"></div>

                  {/* Content */}
                  <div className="flex flex-col items-start text-left mt-14 md:mt-20 z-10">

                    <h3 className="text-2xl md:text-3xl font-extrabold text-[#1A0B2E] mb-6 tracking-tight">
                      Our Vision
                    </h3>
                    <div className="flex gap-4 text-sm md:text-base text-[#2D164B] opacity-80 font-medium leading-relaxed">
                      <span className="mt-0.5 shrink-0 text-[#1A0B2E] font-bold">→</span>
                      <p>
                        To build GIET University's most impactful student community — a knowledge hub where innovation meets execution, producing future-ready analysts, engineers, and researchers who lead the data revolution.
                      </p>
                    </div>
                  </div>

                </div>
              </motion.div>
            </div>
          </div>





        </div>
      </section>

      {/* ── Internal Linking + Keyword Content Section ── */}
      <section className="relative z-20 py-16 md:py-24 px-4 md:px-6 bg-white">
        <div className="container mx-auto max-w-5xl">
          {/* Keyword-rich description for SEO */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12 md:mb-16"
          >
            <h2 className="text-2xl md:text-4xl font-black text-[#1A0B2E] mb-6 tracking-tight">
              Explore <span className="text-[#9667E0]">DSC GIETU</span>
            </h2>
            <p className="text-[#2D164B] text-sm md:text-base font-medium opacity-70 max-w-3xl mx-auto leading-relaxed">
              The Data Science Club at GIET University (DSC GIETU) is a student-led community focused on artificial intelligence, machine learning, data science research, hackathons, and technical workshops. Discover what we do and join our growing community.
            </p>
          </motion.div>

          {/* Quick-link cards for sitelinks */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 md:gap-6">
            {[
              { title: 'Explore Our Events', desc: 'Workshops, hackathons, tech talks and more.', path: '/events', emoji: '📅' },
              { title: 'Meet Our Alumni', desc: 'Graduates making impact in data science.', path: '/alumni', emoji: '🎓' },
              { title: 'Browse the Gallery', desc: 'Photos and highlights from club activities.', path: '/gallery', emoji: '📸' },
            ].map((item, idx) => (
              <motion.div
                key={item.path}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                onClick={() => navigate(item.path)}
                className="group cursor-pointer bg-[#FAFAFE] border border-[#E0D4F5] rounded-2xl p-6 hover:shadow-lg hover:border-[#9667E0]/40 hover:-translate-y-1 transition-all"
              >
                <span className="text-2xl mb-3 block">{item.emoji}</span>
                <h3 className="text-base font-extrabold text-[#1A0B2E] mb-2 group-hover:text-[#9667E0] transition-colors">{item.title}</h3>
                <p className="text-xs text-[#2D164B] font-medium opacity-60 leading-relaxed">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer CTA: Optimized Conversion Tier */}
      <section className="relative z-20 py-12 sm:py-24 md:py-40 px-4 md:px-6 bg-[#D8CAF6] flex flex-col items-center justify-center text-center">
        <motion.h2
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.1 }}
          className="font-black leading-[1.0] tracking-tight mb-10 text-center uppercase"
          style={{
            fontSize: 'clamp(2.8rem, 5.5vw, 5.5rem)',
            color: '#1A0B2E',
          }}
        >
          READY TO DECODE?
        </motion.h2>
        <p className="text-[#2D164B] text-lg md:text-2xl font-bold mb-12 md:mb-16 max-w-3xl px-4 leading-relaxed">
          The barrier to entry is curiosity. Join the most active technical community at GIET University.
        </p>
        <button
          onClick={() => navigate('/join')}
          className="w-full sm:w-auto px-16 py-6 bg-[#1A0B2E] text-white rounded-3xl font-black text-lg md:text-2xl tracking-widest uppercase shadow-2xl hover:bg-[#4B2C82] transition-all transform hover:scale-105 active:scale-95"
        >
          Join The Mission
        </button>
      </section>
    </div>
  );
};

export default Home;
