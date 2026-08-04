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
      {/* ── ALUMNI HERO (Minimal Typographic) ── */}
      <section 
        className="w-full min-h-[90vh] md:min-h-screen pt-24 pb-8 px-6 md:px-12 flex flex-col justify-between relative overflow-hidden"
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
        
        {/* Typography Area */}
        <div className="flex-1 flex flex-col justify-center max-w-[1400px] w-full mx-auto relative z-10 gap-1 md:gap-3 py-10 md:py-20">
          
          {/* Line 1 */}
          <div className="w-full flex justify-between items-start">
             <div className="flex-1 flex flex-col">
               <motion.div 
                 initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                 className="text-4xl sm:text-6xl md:text-[8vw] xl:text-[120px] leading-[1.1] md:leading-[0.9] font-black text-[#111111] tracking-[-0.02em] md:tracking-[-0.04em] uppercase flex items-center flex-wrap md:flex-nowrap"
                 style={{ fontFamily: 'Helvetica, Arial, sans-serif' }}
               >
                 <svg width="0.75em" height="0.75em" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" className="mr-3 md:mr-5 -mt-[1%] opacity-90 shrink-0">
                   <path d="M12 2v20M2 12h20M4.93 4.93l14.14 14.14M4.93 19.07L19.07 4.93"/>
                 </svg>
                 LEGACIES WORTH
               </motion.div>
               
               <motion.div 
                 initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1, delay: 0.5 }}
                 className="mt-6 md:mt-8 ml-0 md:ml-[12%]"
               >
                 <p className="text-[#111111] font-semibold text-[13px] md:text-[14px] leading-[1.6] max-w-[340px]">
                    Celebrating our legacy. Our alumni are shaping the tech landscape at world-renowned organizations, launching startups, and leading innovation across the globe.
                 </p>
               </motion.div>
             </div>
          </div>

          {/* Line 2 */}
          <div className="w-full flex justify-end mt-4 md:mt-0">
             <motion.div 
               initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
               className="text-4xl sm:text-6xl md:text-[8vw] xl:text-[120px] leading-[1.1] md:leading-[0.9] font-black text-[#111111] tracking-[-0.02em] md:tracking-[-0.04em] uppercase pr-0 md:pr-[8%]"
               style={{ fontFamily: 'Helvetica, Arial, sans-serif' }}
             >
               CELEBRATING
             </motion.div>
          </div>

          {/* Line 3 */}
          <div className="w-full flex justify-center pl-[5%] md:pl-[8%] mt-2 md:mt-0">
             <motion.div 
               initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
               className="text-4xl sm:text-6xl md:text-[8vw] xl:text-[120px] leading-[1.1] md:leading-[0.9] font-black text-[#111111] tracking-[-0.02em] md:tracking-[-0.04em] uppercase flex items-start pl-0 md:pl-[8%]"
               style={{ fontFamily: 'Helvetica, Arial, sans-serif' }}
             >
               ALWAYS<span className="text-xl md:text-[2vw] xl:text-[30px] mt-[1%] ml-1 md:ml-2 font-bold">™</span>
             </motion.div>
          </div>

        </div>

        {/* Bottom Footer Area */}
        <div className="w-full max-w-[1400px] mx-auto flex flex-row items-end justify-between relative z-20 pb-4 md:pb-8">
           <div className="relative z-20">
             <button 
               onClick={() => {
                 window.scrollTo({ top: window.innerHeight, behavior: 'smooth' });
               }}
               className="text-[#111111] font-bold text-[12px] md:text-[14px] tracking-wide uppercase pb-1 border-b-[1.5px] border-[#111111] hover:opacity-60 transition-opacity cursor-pointer"
             >
               Meet our alumni
             </button>
           </div>
           <div className="relative z-20">
             <span className="text-[#111111] font-bold text-[12px] md:text-[14px] tracking-wide uppercase">
               (SCROLL)
             </span>
           </div>
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
