import React from 'react';
import { motion } from 'framer-motion';
import { Linkedin, Github, ExternalLink, Quote } from 'lucide-react';
import { AnimatedText } from './Home';
import { useApi } from '../hooks/useApi';
import { alumniService } from '../services/alumni.service';
import SEO from '../components/SEO';

// ═══════════════ TYPES ═══════════════

interface AlumniPerson {
  id: string;
  name: string;
  batch: string;
  role: string;
  company: string;
  quote: string;
  skills: string[];
  image: string;
  bgColor: string;
  linkedin?: string;
  github?: string;
}

// ═══════════════ API → UI TRANSFORM ═══════════════

interface AlumniAPI {
  id: string;
  full_name: string;
  batch_year: number;
  designation: string | null;
  company: string | null;
  testimonial: string | null;
  skills: string[];
  avatar_url: string | null;
  img_seed: string | null;
  bg_color: string | null;
  linkedin_url: string | null;
  github_url: string | null;
  display_order: number;
}

function apiToAlumni(a: AlumniAPI): AlumniPerson {
  return {
    id: a.id,
    name: a.full_name,
    batch: a.batch_year.toString(),
    role: a.designation || '',
    company: a.company || '',
    quote: a.testimonial || '',
    skills: a.skills || [],
    image: a.avatar_url || `https://picsum.photos/seed/${a.img_seed || a.full_name}/600/750`,
    bgColor: a.bg_color || '#F9F7FF',
    linkedin: a.linkedin_url || undefined,
    github: a.github_url || undefined,
  };
}

// ═══════════════ ALUMNI SECTION — IDENTICAL UI ═══════════════

const AlumniSection = ({ person, index }: { person: AlumniPerson; index: number }) => {
  const isEven = index % 2 === 0;

  return (
    <div className="py-16 md:py-24 px-4 md:px-6" style={{ background: person.bgColor }}>
      <div className="container mx-auto max-w-6xl">
        <div className={`flex flex-col ${isEven ? 'md:flex-row' : 'md:flex-row-reverse'} items-center gap-10 md:gap-16 lg:gap-24`}>
          {/* Content */}
          <motion.div
            initial={{ opacity: 0, x: isEven ? -30 : 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="flex-1"
          >
            <span className="text-[10px] md:text-xs font-black text-[#9667E0] uppercase tracking-[0.4em] mb-4 block">
              Class of {person.batch}
            </span>

            <h2 className="text-3xl md:text-5xl lg:text-6xl font-black text-[#1A0B2E] tracking-tight mb-2 leading-tight">
              {person.name}
            </h2>

            <p className="text-base md:text-xl font-bold text-[#2D164B]/70 mb-6 md:mb-8">
              {person.role} <span className="text-[#9667E0]">@{person.company}</span>
            </p>

            {person.quote && (
              <div className="relative mb-8 md:mb-10">
                <Quote size={28} className="text-[#D8CAF6] mb-3" />
                <p className="text-sm md:text-lg text-[#2D164B] font-medium leading-relaxed opacity-80 italic max-w-lg">
                  {person.quote}
                </p>
              </div>
            )}

            {person.skills.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-8 md:mb-10">
                {person.skills.map(skill => (
                  <span
                    key={skill}
                    className="px-4 py-1.5 bg-[#EEEAFD] border border-[#D8CAF6] rounded-full text-[10px] md:text-xs font-black uppercase tracking-widest text-[#4B2C82]"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            )}

            <div className="flex items-center gap-4">
              <a
                href={person.linkedin || 'javascript:void(0)'}
                target={person.linkedin ? '_blank' : undefined}
                rel={person.linkedin ? 'noopener noreferrer' : undefined}
                className="w-10 h-10 flex items-center justify-center rounded-full bg-[#1A0B2E] text-white hover:bg-[#9667E0] transition-colors"
                aria-label="LinkedIn"
              >
                <Linkedin size={18} />
              </a>
              <a
                href={person.github || 'javascript:void(0)'}
                target={person.github ? '_blank' : undefined}
                rel={person.github ? 'noopener noreferrer' : undefined}
                className="w-10 h-10 flex items-center justify-center rounded-full bg-[#1A0B2E] text-white hover:bg-[#9667E0] transition-colors"
                aria-label="GitHub"
              >
                <Github size={18} />
              </a>
              <button className="ml-2 flex items-center gap-2 text-[10px] md:text-xs font-black text-[#1A0B2E] uppercase tracking-widest hover:text-[#9667E0] transition-colors">
                View Profile <ExternalLink size={14} />
              </button>
            </div>
          </motion.div>

          {/* Photo with Frame */}
          <motion.div
            initial={{ opacity: 0, x: isEven ? 30 : -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.15 }}
            className="relative shrink-0 w-[200px] sm:w-[240px] md:w-[300px] lg:w-[340px]"
          >
            {/* Back frame layer */}
            <div
              className="absolute inset-0 rounded-2xl"
              style={{
                background: '#E8E0F5',
                transform: 'rotate(-4deg) translate(8px, 8px)',
                boxShadow: '0 8px 30px rgba(150,103,224,0.15)',
              }}
            />
            {/* Middle frame layer */}
            <div
              className="absolute inset-0 rounded-2xl"
              style={{
                background: '#F0EBF9',
                transform: 'rotate(-2deg) translate(4px, 4px)',
                boxShadow: '0 4px 20px rgba(150,103,224,0.1)',
              }}
            />
            {/* Main photo frame */}
            <div
              className="relative rounded-2xl overflow-hidden bg-white p-3 md:p-4"
              style={{
                boxShadow: '0 20px 60px rgba(26,11,46,0.15), 0 4px 16px rgba(150,103,224,0.1)',
                transform: 'rotate(1deg)',
              }}
            >
              <div className="rounded-xl overflow-hidden aspect-[4/5]">
                <img
                  src={person.image}
                  alt={person.name}
                  loading="lazy"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="mt-3 text-center">
                <p className="text-xs md:text-sm font-black text-[#1A0B2E] tracking-tight">{person.name}</p>
                <p className="text-[9px] md:text-[10px] font-bold text-[#9667E0] uppercase tracking-widest">{person.company}</p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

// ═══════════════ LOADING SKELETON ═══════════════

const AlumniSkeleton = () => (
  <>
    {[1, 2, 3].map((i) => (
      <div key={i} className="py-16 md:py-24 px-4 md:px-6" style={{ background: i === 1 ? '#E8F5E9' : i === 2 ? '#FFF3E0' : '#E3F2FD' }}>
        <div className="container mx-auto max-w-6xl">
          <div className={`flex flex-col ${i % 2 !== 0 ? 'md:flex-row' : 'md:flex-row-reverse'} items-center gap-10 md:gap-16 lg:gap-24`}>
            {/* Content skeleton */}
            <div className="flex-1 space-y-4">
              <div className="h-3 w-28 bg-white/60 rounded animate-pulse" />
              <div className="h-12 w-64 bg-white/60 rounded-xl animate-pulse" />
              <div className="h-5 w-48 bg-white/60 rounded animate-pulse" />
              <div className="space-y-2 mt-6">
                <div className="h-4 w-full max-w-lg bg-white/40 rounded animate-pulse" />
                <div className="h-4 w-4/5 max-w-lg bg-white/40 rounded animate-pulse" />
                <div className="h-4 w-3/5 max-w-lg bg-white/40 rounded animate-pulse" />
              </div>
              <div className="flex gap-2 mt-6">
                <div className="h-7 w-20 bg-white/50 rounded-full animate-pulse" />
                <div className="h-7 w-20 bg-white/50 rounded-full animate-pulse" />
                <div className="h-7 w-20 bg-white/50 rounded-full animate-pulse" />
              </div>
            </div>

            {/* Photo skeleton */}
            <div className="relative shrink-0 w-[240px] md:w-[300px] lg:w-[340px]">
              <div className="rounded-2xl bg-white/60 aspect-[4/5] animate-pulse p-3">
                <div className="rounded-xl bg-white/40 w-full h-full" />
              </div>
            </div>
          </div>
        </div>
      </div>
    ))}
  </>
);

// ═══════════════ MAIN ALUMNI PAGE ═══════════════

const Alumni = () => {
  // ← THE ONLY DATA CHANGE: fetch from API
  const { data: rawAlumni, isLoading, error } = useApi<AlumniAPI[]>(
    () => alumniService.getVisible()
  );

  // Transform API data to UI format
  const alumniData: AlumniPerson[] = rawAlumni ? rawAlumni.map(apiToAlumni) : [];

  return (
    <div className="w-full">
      <SEO title="Alumni" description="Meet the alumni of DSC GIETU — graduates making an impact in data science, AI and tech industries worldwide." />
      {/* Header with 3D Background — COMPLETELY UNCHANGED */}
      <section className="relative py-20 md:py-32 text-center px-4 md:px-6 overflow-hidden sticky top-0 z-0" style={{
        background: 'linear-gradient(135deg, #0D0221 0%, #1A0B2E 40%, #2D164B 70%, #1A0B2E 100%)',
      }}>
        {/* Animated gradient mesh */}
        <div className="absolute inset-0 pointer-events-none" style={{
          background: 'radial-gradient(ellipse 60% 50% at 30% 40%, rgba(150,103,224,0.2) 0%, transparent 60%), radial-gradient(ellipse 50% 60% at 70% 60%, rgba(75,44,130,0.15) 0%, transparent 50%)',
        }} />

        {/* 3D Floating shapes */}
        {[
          { size: 60, x: '15%', y: '20%', delay: 0, duration: 6, rotate: 45 },
          { size: 40, x: '80%', y: '25%', delay: 1, duration: 8, rotate: -30 },
          { size: 80, x: '70%', y: '65%', delay: 2, duration: 7, rotate: 60 },
          { size: 50, x: '25%', y: '70%', delay: 0.5, duration: 9, rotate: -45 },
          { size: 35, x: '50%', y: '15%', delay: 3, duration: 10, rotate: 20 },
          { size: 45, x: '90%', y: '50%', delay: 1.5, duration: 6.5, rotate: -60 },
        ].map((shape, i) => (
          <motion.div
            key={i}
            className="absolute pointer-events-none"
            style={{
              left: shape.x, top: shape.y,
              width: shape.size, height: shape.size,
              border: `2px solid rgba(150,103,224,${0.15 + i * 0.03})`,
              borderRadius: i % 3 === 0 ? '50%' : i % 3 === 1 ? '8px' : '0px',
              transform: `rotate(${shape.rotate}deg)`,
            }}
            animate={{
              y: [0, -30, 10, 0],
              x: [0, 15, -10, 0],
              rotate: [shape.rotate, shape.rotate + 180, shape.rotate + 360],
              scale: [1, 1.1, 0.9, 1],
            }}
            transition={{ duration: shape.duration, repeat: Infinity, delay: shape.delay, ease: 'easeInOut' }}
          />
        ))}

        {/* Glowing orbs */}
        {[
          { size: 250, x: '10%', y: '30%', color: '#9667E0' },
          { size: 200, x: '75%', y: '50%', color: '#4B2C82' },
          { size: 180, x: '50%', y: '10%', color: '#D8CAF6' },
        ].map((orb, i) => (
          <motion.div
            key={`orb-${i}`}
            className="absolute rounded-full pointer-events-none"
            style={{
              width: orb.size, height: orb.size,
              left: orb.x, top: orb.y,
              background: `radial-gradient(circle, ${orb.color}18 0%, transparent 70%)`,
              filter: 'blur(50px)',
            }}
            animate={{
              scale: [1, 1.3, 1],
              opacity: [0.4, 0.7, 0.4],
            }}
            transition={{ duration: 5 + i * 2, repeat: Infinity, ease: 'easeInOut' }}
          />
        ))}

        {/* 3D perspective grid */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden" style={{ perspective: '600px' }}>
          <motion.div
            className="absolute w-[200%] h-[200%] -left-1/2 -top-1/2"
            style={{
              backgroundImage: 'linear-gradient(rgba(150,103,224,0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(150,103,224,0.08) 1px, transparent 1px)',
              backgroundSize: '50px 50px',
              transformOrigin: 'center center',
              transform: 'rotateX(60deg) translateZ(-100px)',
            }}
            animate={{ y: ['0%', '2.5%'] }}
            transition={{ duration: 4, repeat: Infinity, repeatType: 'reverse', ease: 'linear' }}
          />
        </div>

        {/* Rotating rings */}
        <motion.div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none"
          animate={{ rotate: 360 }}
          transition={{ duration: 30, repeat: Infinity, ease: 'linear' }}
        >
          <div className="w-[350px] h-[350px] md:w-[500px] md:h-[500px] rounded-full border border-[#9667E0]/10" />
        </motion.div>
        <motion.div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none"
          animate={{ rotate: -360 }}
          transition={{ duration: 45, repeat: Infinity, ease: 'linear' }}
        >
          <div className="w-[280px] h-[280px] md:w-[400px] md:h-[400px] rounded-full border border-dashed border-[#D8CAF6]/8" />
        </motion.div>

        {/* Content */}
        <div className="relative z-10">
          <AnimatedText text="ALUMNI HALL" animateOnLoad className="text-3xl sm:text-4xl md:text-9xl font-black mb-6 md:mb-8 text-white tracking-tight drop-shadow-[0_0_40px_rgba(150,103,224,0.4)]" />
          <p className="text-white/70 text-lg md:text-2xl max-w-2xl mx-auto font-bold leading-relaxed px-4">
            Celebrating our legacy. Our alumni are shaping the tech landscape at world-renowned organizations.
          </p>
        </div>
      </section>

      {/* All Alumni Sections — dynamic */}
      <div className="relative z-10">
        {isLoading ? (
          <AlumniSkeleton />
        ) : error ? (
          <div className="py-24 text-center px-4" style={{ background: '#F9F7FF' }}>
            <p className="text-red-500 text-lg mb-4">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-3 bg-[#1A0B2E] text-white rounded-2xl font-bold hover:bg-[#4B2C82] transition-colors"
            >
              Retry
            </button>
          </div>
        ) : alumniData.length > 0 ? (
          alumniData.map((person, idx) => (
            <React.Fragment key={person.id}>
              <AlumniSection person={person} index={idx} />
            </React.Fragment>
          ))
        ) : (
          <div className="py-24 text-center px-4" style={{ background: '#F9F7FF' }}>
            <p className="text-[#2D164B]/60 text-xl font-bold">No alumni featured yet.</p>
            <p className="text-[#2D164B]/40 text-sm mt-2">Check back soon — we're building our hall of fame.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Alumni;
