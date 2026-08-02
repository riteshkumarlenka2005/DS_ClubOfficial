import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { motion, useReducedMotion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  Target, Lightbulb, TrendingUp, ShieldCheck,
  BrainCircuit, ArrowRight, Layout,
  X, Linkedin, Github, Instagram, Mail, FileText
} from 'lucide-react';
import { useApi } from '../hooks/useApi';
import { teamService } from '../services/team.service';
import SEO from '../components/SEO';

// ═══════════════ TYPES ═══════════════

interface TeamMember {
  name: string;
  id: string;
  role: string;
  imgSeed?: string;
  avatar_url?: string;
  bio?: string;
  linkedin?: string;
  github?: string;
  instagram?: string;
  portfolio_url?: string;
  email?: string;
}

interface GroupedTeam {
  leadership: TeamMember[];
  technical: {
    heads: TeamMember[];
    core: TeamMember[];
    coMembers: TeamMember[];
  };
  management: {
    heads: TeamMember[];
    core: TeamMember[];
    coMembers: TeamMember[];
  };
  creative: {
    social: TeamMember[];
    design: TeamMember[];
    video: TeamMember[];
  };
}

// ═══════════════ API → GROUPED STRUCTURE ═══════════════

interface TeamMemberAPI {
  id: string;
  name: string;
  student_id: string;
  role: string;
  department: string;
  tier: string;
  sub_category: string | null;
  bio: string | null;
  avatar_url: string | null;
  img_seed: string | null;
  linkedin_url: string | null;
  github_url: string | null;
  instagram_url: string | null;
  portfolio_url: string | null;
  email: string | null;
  display_order: number;
}

function apiToMember(m: TeamMemberAPI): TeamMember {
  return {
    name: m.name,
    id: m.student_id,
    role: m.role,
    imgSeed: m.img_seed || m.name,
    avatar_url: m.avatar_url || undefined,
    bio: m.bio || undefined,
    linkedin: m.linkedin_url || undefined,
    github: m.github_url || undefined,
    instagram: m.instagram_url || undefined,
    portfolio_url: m.portfolio_url || undefined,
    email: m.email || undefined,
  };
}

function groupTeamMembers(members: TeamMemberAPI[]): GroupedTeam {
  const result: GroupedTeam = {
    leadership: [],
    technical: { heads: [], core: [], coMembers: [] },
    management: { heads: [], core: [], coMembers: [] },
    creative: { social: [], design: [], video: [] },
  };

  members.forEach((m) => {
    const member = apiToMember(m);

    switch (m.department) {
      case 'leadership':
        result.leadership.push(member);
        break;

      case 'technical':
        if (m.tier === 'head') result.technical.heads.push(member);
        else if (m.tier === 'core') result.technical.core.push(member);
        else result.technical.coMembers.push(member);
        break;

      case 'management':
        if (m.tier === 'head') result.management.heads.push(member);
        else if (m.tier === 'core') result.management.core.push(member);
        else result.management.coMembers.push(member);
        break;

      case 'creative':
        if (m.sub_category === 'social') result.creative.social.push(member);
        else if (m.sub_category === 'design') result.creative.design.push(member);
        else if (m.sub_category === 'video') result.creative.video.push(member);
        break;
    }
  });

  return result;
}

// ═══════════════ HOOKS ═══════════════

const useIsMobile = () => {
  const [isMobile, setIsMobile] = React.useState(() => typeof window !== 'undefined' ? window.innerWidth < 768 : false);
  React.useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);
  return isMobile;
};

// ═══════════════ ANIMATED TEXT ═══════════════

const AnimatedText = ({ text, className, animateOnMount }: { text: string; className?: string; animateOnMount?: boolean }) => {
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

  const animationProps = animateOnMount
    ? { initial: "hidden" as const, animate: "visible" as const }
    : { initial: "hidden" as const, whileInView: "visible" as const, viewport: { once: true } };

  return (
    <motion.div
      style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", overflow: "hidden" }}
      variants={container}
      {...animationProps}
      className={className}
    >
      {words.map((word, index) => (
        <motion.span key={index} variants={child} className="inline-block whitespace-nowrap mr-[0.25em]">
          {word}
        </motion.span>
      ))}
    </motion.div>
  );
};

// ═══════════════ MEMBER MODAL ═══════════════

const MemberModal: React.FC<{ member: TeamMember; onClose: () => void }> = ({ member, onClose }) => {
  return createPortal(
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm px-4 py-8 overflow-y-auto"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.92, opacity: 0, y: 30 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.92, opacity: 0, y: 30 }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        onClick={e => e.stopPropagation()}
        className="relative bg-white rounded-3xl border border-[#E0D4F5] shadow-2xl max-w-md w-full overflow-hidden"
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 w-9 h-9 flex items-center justify-center rounded-full bg-white/80 backdrop-blur-sm border border-[#E0D4F5] hover:bg-[#EEEAFD] transition-colors cursor-pointer"
        >
          <X size={16} className="text-[#1A0B2E]" />
        </button>

        <div className="relative w-full aspect-square max-h-72 bg-[#EEEAFD] overflow-hidden">
          <img
            src={member.avatar_url || `https://picsum.photos/seed/${member.imgSeed || member.name}/600`}
            alt={member.name}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-white via-transparent to-transparent" />
        </div>

        <div className="px-8 pb-8 -mt-10 relative z-10 text-center md:text-left">
          <h3 className="text-2xl font-black text-[#1A0B2E] uppercase tracking-tight mb-1" style={{ fontFamily: "'Poppins', sans-serif" }}>{member.name}</h3>
          <p className="text-xs font-black uppercase text-[#9667E0] tracking-widest mb-1">{member.role}</p>
          <span className="text-[10px] font-mono text-[#2D164B]/40 block mb-5">{member.id}</span>

          {member.bio && (
            <p className="text-sm text-[#2D164B]/80 font-medium leading-relaxed mb-6">{member.bio}</p>
          )}

          {(member.linkedin || member.github || member.instagram || member.portfolio_url || member.email) && (
            <div className="flex items-center gap-3">
              {member.portfolio_url && (
                <a href={member.portfolio_url} target="_blank" rel="noopener noreferrer"
                  className="w-10 h-10 rounded-xl bg-[#EEEAFD] border border-[#E0D4F5] flex items-center justify-center hover:bg-[#5AA6C5] hover:text-white hover:border-[#5AA6C5] transition-all text-[#5AA6C5]"
                  title="Portfolio Website"
                >
                  <FileText size={16} />
                </a>
              )}
              {member.linkedin && (
                <a href={member.linkedin} target="_blank" rel="noopener noreferrer"
                  className="w-10 h-10 rounded-xl bg-[#EEEAFD] border border-[#E0D4F5] flex items-center justify-center hover:bg-[#9667E0] hover:text-white hover:border-[#9667E0] transition-all text-[#9667E0]"
                >
                  <Linkedin size={16} />
                </a>
              )}
              {member.github && (
                <a href={member.github} target="_blank" rel="noopener noreferrer"
                  className="w-10 h-10 rounded-xl bg-[#EEEAFD] border border-[#E0D4F5] flex items-center justify-center hover:bg-[#1A0B2E] hover:text-white hover:border-[#1A0B2E] transition-all text-[#1A0B2E]"
                >
                  <Github size={16} />
                </a>
              )}
              {member.instagram && (
                <a href={member.instagram} target="_blank" rel="noopener noreferrer"
                  className="w-10 h-10 rounded-xl bg-[#EEEAFD] border border-[#E0D4F5] flex items-center justify-center hover:bg-gradient-to-br hover:from-[#f09433] hover:to-[#dc2743] hover:text-white hover:border-transparent transition-all text-[#E1306C]"
                >
                  <Instagram size={16} />
                </a>
              )}
              {member.email && (
                <a href={`mailto:${member.email}`}
                  className="w-10 h-10 rounded-xl bg-[#EEEAFD] border border-[#E0D4F5] flex items-center justify-center hover:bg-[#4B2C82] hover:text-white hover:border-[#4B2C82] transition-all text-[#4B2C82]"
                >
                  <Mail size={16} />
                </a>
              )}
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>,
    document.body
  );
};

// ═══════════════ MEMBER CARD ═══════════════

const MemberCard = ({ member, size = "md", onClick }: { member: TeamMember; size?: "sm" | "md" | "lg"; onClick?: () => void; [key: string]: any }) => (
  <motion.div
    whileHover={{ y: -5, scale: 1.02 }}
    className="flex flex-col items-center group cursor-pointer"
    onClick={onClick}
  >
    <div className={`relative ${size === 'lg' ? 'w-48 h-48 md:w-64 md:h-64' : size === 'md' ? 'w-36 h-36 md:w-48 md:h-48' : 'w-24 h-24 md:w-32 md:h-32'} rounded-2xl overflow-hidden border-2 border-[#5AA6C5] shadow-sm mb-4 bg-white p-1`}>
      <img
        src={member.avatar_url || `https://picsum.photos/seed/${member.imgSeed || member.name}/500`}
        loading="lazy"
        alt={member.name}
        className="w-full h-full object-cover rounded-xl"
      />
      <div className="absolute inset-0 bg-[#1A0B2E]/0 group-hover:bg-[#1A0B2E]/40 transition-all duration-300 rounded-2xl flex items-center justify-center">
        <span className="text-white text-[10px] font-bold uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity duration-300">View Profile</span>
      </div>
    </div>
    <div className="text-center">
      <h4 className="text-sm md:text-lg font-black uppercase text-[#1A0B2E] tracking-tight mb-1">{member.name}</h4>
      <p className="text-[10px] md:text-xs font-black uppercase text-[#4B2C82] tracking-widest">{member.role}</p>
      <span className="text-[8px] md:text-[10px] font-mono text-gray-400">({member.id})</span>
    </div>
  </motion.div>
);

// ═══════════════ EDITORIAL HERO ═══════════════

const EditorialHero = () => {
  return (
    <section className="relative w-full flex flex-col md:flex-row min-h-[70vh] overflow-hidden">
      <div className="md:flex-1 bg-[#B3C8E8] flex flex-col justify-center px-8 md:px-20 py-16 md:py-20">
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
          className="max-w-xl"
        >
          <h1 className="text-3xl sm:text-4xl md:text-7xl font-black text-[#1A0B2E] leading-[1.1] mb-8 tracking-tight" style={{ fontFamily: "'Poppins', sans-serif" }}>
            From Research Labs <br /> to your Horizon
          </h1>
          <p className="text-sm md:text-base text-[#1A0B2E]/70 font-medium leading-relaxed max-w-md">
            It all started with DSC GIETU's love for data science. We wanted to connect fellow learners by sharing stories centered around intelligence to elevate their voices. We began sharing our monthly research, and the world caught on. Now, we invite you to join the journey.
          </p>
        </motion.div>
      </div>

      <div className="relative h-[45vh] md:flex-1 md:h-auto min-h-[300px]">
        <img
          src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&q=80&w=1200"
          alt="Students collaborating"
          className="absolute inset-0 w-full h-full object-cover"
        />
      </div>
    </section>
  );
};

const IntroStatement = () => {
  return (
    <section className="py-24 px-4 md:px-6 bg-[#F9F7FF] text-center border-t border-[#B3C8E8]/30">
      <div className="max-w-4xl mx-auto">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-2xl sm:text-4xl md:text-6xl font-black text-[#1A0B2E] mb-10 tracking-tight" style={{ fontFamily: "'Poppins', sans-serif" }}
        >
          Oh The Places We'll Grow
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
          className="text-base md:text-lg text-[#2D164B]/80 font-medium leading-relaxed"
        >
          We are a vibrant community propelled by the meaningful connections we make with different researchers,
          protagonists, and fellow learners. We consciously curate workshops that celebrate the stories and autonomy of
          student innovators, championing voices and platforming authors too often overlooked. And we do it together, because to
          us, learning is joy—joy that's intimate, and contagious, and true. So—we think—the more of us learning together,
          the better.
        </motion.p>
      </div>
    </section>
  );
};


// ═══════════════ TEAM SECTION (DYNAMIC) ═══════════════

const TeamSection = ({ team, onSelectMember }: { team: GroupedTeam; onSelectMember: (m: TeamMember) => void }) => {
  return (
    <section className="relative py-12 sm:py-24 px-4 md:px-6 bg-white overflow-hidden shadow-[0_-10px_30px_rgba(0,0,0,0.03)]">
      <div className="absolute inset-0 opacity-[0.02] pointer-events-none" style={{ backgroundImage: 'radial-gradient(#1A0B2E 1px, transparent 1px)', backgroundSize: '32px 32px' }} />

      <div className="container mx-auto max-w-7xl relative z-10">
        <div className="text-center mb-12 sm:mb-24">
          <h2 className="text-3xl sm:text-5xl md:text-9xl font-black text-[#1A0B2E] tracking-tighter opacity-10 absolute -top-12 left-1/2 -translate-x-1/2 w-full uppercase whitespace-nowrap overflow-hidden" style={{ fontFamily: "'Poppins', sans-serif" }}>THE ORCHESTRATORS</h2>
          <AnimatedText text="CLUB LEADERSHIP" className="text-2xl sm:text-4xl md:text-7xl font-black text-[#1A0B2E] mb-8 sm:mb-12 tracking-tighter" />

          {/* Leadership Tier */}
          <div className="flex flex-wrap justify-center gap-6 sm:gap-12 md:gap-24 mb-16 sm:mb-32">
            {team.leadership.map(m => <MemberCard key={m.id} member={m} size="lg" onClick={() => onSelectMember(m)} />)}
          </div>

          {/* Technical Team */}
          {(team.technical.heads.length > 0 || team.technical.core.length > 0 || team.technical.coMembers.length > 0) && (
            <div className="mb-16 sm:mb-32">
              <h3 className="text-xl sm:text-3xl md:text-5xl font-black text-[#1A0B2E] mb-8 sm:mb-12 tracking-tight underline decoration-[#5AA6C5] decoration-4 underline-offset-8 flex items-center justify-center gap-2 sm:gap-4" style={{ fontFamily: "'Poppins', sans-serif" }}>
                <BrainCircuit className="text-[#5AA6C5] w-6 h-6 sm:w-10 sm:h-10" /> TECHNICAL TEAM
              </h3>
              {team.technical.heads.length > 0 && (
                <div className="flex flex-wrap justify-center gap-6 sm:gap-12 mb-16">
                  {team.technical.heads.map(m => <MemberCard key={m.id} member={m} onClick={() => onSelectMember(m)} />)}
                </div>
              )}
              {team.technical.core.length > 0 && (
                <div className="flex flex-wrap justify-center gap-6 sm:gap-10 mb-16">
                  {team.technical.core.map(m => <MemberCard key={m.id} member={m} size="sm" onClick={() => onSelectMember(m)} />)}
                </div>
              )}
              {team.technical.coMembers.length > 0 && (
                <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-4 sm:gap-6 bg-[#EEEAFD]/20 p-4 sm:p-8 rounded-2xl sm:rounded-[3rem] border border-[#D8CAF6]/50">
                  {team.technical.coMembers.map(m => <MemberCard key={m.id} member={m} size="sm" onClick={() => onSelectMember(m)} />)}
                </div>
              )}
            </div>
          )}

          {/* Management Team */}
          {(team.management.heads.length > 0 || team.management.core.length > 0 || team.management.coMembers.length > 0) && (
            <div className="mb-16 sm:mb-32">
              <h3 className="text-xl sm:text-3xl md:text-5xl font-black text-[#1A0B2E] mb-8 sm:mb-12 tracking-tight underline decoration-[#9667E0] decoration-4 underline-offset-8 flex items-center justify-center gap-2 sm:gap-4" style={{ fontFamily: "'Poppins', sans-serif" }}>
                <Target className="text-[#9667E0] w-6 h-6 sm:w-10 sm:h-10" /> MANAGEMENT & OPS
              </h3>
              {team.management.heads.length > 0 && (
                <div className="flex flex-wrap justify-center gap-6 sm:gap-12 mb-16">
                  {team.management.heads.map(m => <MemberCard key={m.id} member={m} onClick={() => onSelectMember(m)} />)}
                </div>
              )}
              {team.management.core.length > 0 && (
                <div className="flex flex-wrap justify-center gap-6 sm:gap-10 mb-16">
                  {team.management.core.map(m => <MemberCard key={m.id} member={m} size="sm" onClick={() => onSelectMember(m)} />)}
                </div>
              )}
              {team.management.coMembers.length > 0 && (
                <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-4 sm:gap-6 bg-[#FDFBF7] p-4 sm:p-8 rounded-2xl sm:rounded-[3rem] border border-[#D8CAF6]/50">
                  {team.management.coMembers.map(m => <MemberCard key={m.id} member={m} size="sm" onClick={() => onSelectMember(m)} />)}
                </div>
              )}
            </div>
          )}

          {/* Creative & Media */}
          {(team.creative.social.length > 0 || team.creative.design.length > 0 || team.creative.video.length > 0) && (
            <div>
              <h3 className="text-xl sm:text-3xl md:text-5xl font-black text-[#1A0B2E] mb-8 sm:mb-12 tracking-tight underline decoration-[#4B2C82] decoration-4 underline-offset-8 flex items-center justify-center gap-2 sm:gap-4" style={{ fontFamily: "'Poppins', sans-serif" }}>
                <Layout className="text-[#4B2C82] w-6 h-6 sm:w-10 sm:h-10" /> CREATIVE & MEDIA
              </h3>
              {team.creative.social.length > 0 && (
                <div className="flex flex-wrap justify-center gap-6 sm:gap-12 mb-16">
                  {team.creative.social.map(m => <MemberCard key={m.id} member={m} onClick={() => onSelectMember(m)} />)}
                </div>
              )}
              {team.creative.design.length > 0 && (
                <div className="flex flex-wrap justify-center gap-6 sm:gap-10 mb-16">
                  {team.creative.design.map(m => <MemberCard key={m.id} member={m} size="md" onClick={() => onSelectMember(m)} />)}
                </div>
              )}
              {team.creative.video.length > 0 && (
                <div className="flex flex-wrap justify-center gap-6 sm:gap-10">
                  {team.creative.video.map(m => <MemberCard key={m.id} member={m} size="md" onClick={() => onSelectMember(m)} />)}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

// ═══════════════ TEAM LOADING SKELETON ═══════════════

const TeamSkeleton = () => (
  <section className="relative py-12 sm:py-24 px-4 md:px-6 bg-white overflow-hidden">
    <div className="container mx-auto max-w-7xl">
      <div className="text-center mb-12 sm:mb-24">
        <div className="h-16 w-96 bg-gray-100 rounded-2xl mx-auto mb-12 animate-pulse" />

        {/* Leadership skeleton */}
        <div className="flex justify-center gap-6 sm:gap-12 md:gap-24 mb-16 sm:mb-32">
          {[1, 2].map(i => (
            <div key={i} className="flex flex-col items-center">
              <div className="w-48 h-48 md:w-64 md:h-64 rounded-2xl bg-gray-100 animate-pulse mb-4" />
              <div className="h-5 w-32 bg-gray-100 rounded animate-pulse mb-2" />
              <div className="h-3 w-24 bg-gray-100 rounded animate-pulse" />
            </div>
          ))}
        </div>

        {/* Technical skeleton */}
        <div className="mb-16 sm:mb-32">
          <div className="h-12 w-72 bg-gray-100 rounded-2xl mx-auto mb-12 animate-pulse" />
          <div className="flex justify-center gap-6 sm:gap-12 mb-16">
            {[1, 2, 3].map(i => (
              <div key={i} className="flex flex-col items-center">
                <div className="w-36 h-36 md:w-48 md:h-48 rounded-2xl bg-gray-100 animate-pulse mb-4" />
                <div className="h-4 w-28 bg-gray-100 rounded animate-pulse mb-2" />
                <div className="h-3 w-20 bg-gray-100 rounded animate-pulse" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  </section>
);

// ═══════════════ ABOUT PAGE ═══════════════

const About = () => {
  const navigate = useNavigate();
  const [selectedMember, setSelectedMember] = useState<TeamMember | null>(null);

  // ← THE ONLY DATA CHANGE: fetch from API instead of hardcoded constant
  const { data: rawMembers, isLoading, error } = useApi<TeamMemberAPI[]>(
    () => teamService.getVisible()
  );

  // Group into the exact same structure the UI expects
  const TEAM: GroupedTeam | null = rawMembers ? groupTeamMembers(rawMembers) : null;

  return (
    <div className="w-full bg-white">
      <SEO title="About" description="Learn about the Data Science Club at GIET University — our mission, team, values and how we're building the future of data science." />
      {/* Editorial Hero & Intro — unchanged, fully static */}
      <EditorialHero />
      <IntroStatement />


      {/* Main Content Sections */}
      <div className="relative z-10">
        {/* TEAM SECTION — now dynamic */}
        {isLoading ? (
          <TeamSkeleton />
        ) : error ? (
          <section className="py-24 px-4 text-center">
            <p className="text-red-500 mb-4">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-3 bg-[#1A0B2E] text-white rounded-2xl font-bold"
            >
              Retry
            </button>
          </section>
        ) : TEAM ? (
          <TeamSection team={TEAM} onSelectMember={setSelectedMember} />
        ) : null}

        {/* STRATEGIC PILLARS — unchanged, fully static */}
        <section className="relative py-16 sm:py-32 px-4 md:px-6 bg-white overflow-hidden border-t border-[#D8CAF6]/30">
          <div className="container mx-auto relative z-10">
            <div className="text-center mb-12 sm:mb-24">
              <motion.span
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                className="text-[10px] font-black text-[#9667E0] uppercase tracking-[0.6em] mb-4 block"
              >
                The DSC GIETU Foundations
              </motion.span>
              <h2 className="text-2xl sm:text-4xl md:text-6xl font-black text-[#1A0B2E] tracking-tight leading-none" style={{ fontFamily: "'Poppins', sans-serif" }}>
                Strategic Pillars
              </h2>
              <div className="w-12 h-[1px] bg-[#9667E0] mx-auto mt-8" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-10 max-w-6xl mx-auto">
              {[
                {
                  icon: Target,
                  title: "Benchmarks",
                  desc: "Setting national records in top-tier hackathons through consistent, data-driven methodology and collaborative grit.",
                  color: "#9667E0",
                  bgLeft: "bg-[#EEEAFD]",
                  accent: "✦"
                },
                {
                  icon: Lightbulb,
                  title: "Disruptive Logic",
                  desc: "Moving beyond tutorials to engineer novel solutions for campus-wide challenges and regional analytical gaps.",
                  color: "#5AA6C5",
                  bgLeft: "bg-[#E2F1F8]",
                  accent: "✧"
                },
                {
                  icon: TrendingUp,
                  title: "Career Mobility",
                  desc: "Catalyzing student professional trajectories toward leaders through technical mastery and alumni bridges.",
                  color: "#4B2C82",
                  bgLeft: "bg-[#D8CAF6]",
                  accent: "✦"
                },
                {
                  icon: ShieldCheck,
                  title: "Research Integrity",
                  desc: "Upholding high-fidelity ethical standards in AI development, ensuring transparency and fairness in every model built.",
                  color: "#1A0B2E",
                  bgLeft: "bg-[#E5DFEF]",
                  accent: "✧"
                },
              ].map((item, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  whileHover={{ y: -8 }}
                  className="flex flex-col sm:flex-row min-h-[280px] bg-white rounded-sm overflow-hidden shadow-[0_4px_25px_rgba(0,0,0,0.03)] border border-[#D8CAF6]/40 group"
                >
                  <div className={`w-full sm:w-1/3 ${item.bgLeft} p-8 flex flex-col justify-between relative overflow-hidden`}>
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-[0.05] group-hover:opacity-[0.08] transition-opacity duration-700">
                      <item.icon size={120} strokeWidth={1} style={{ color: item.color }} />
                    </div>

                    <div className="text-[10px] font-bold tracking-[0.3em] uppercase relative z-10" style={{ color: item.color }}>
                      GIETU • DSC
                    </div>

                    <div className="relative z-10">
                      <div className="text-2xl font-black mb-1" style={{ color: item.color }}>{item.accent}</div>
                      <div className="w-8 h-[1px] opacity-30" style={{ backgroundColor: item.color }} />
                    </div>
                  </div>

                  <div className="flex-1 p-10 flex flex-col justify-center bg-[#FFFEFD] relative">
                    <div className="absolute inset-0 opacity-[0.015] pointer-events-none" style={{ backgroundImage: 'url("https://www.transparenttextures.com/patterns/paper-fibers.png")' }} />

                    <h3 className="text-2xl font-black text-[#1A0B2E] mb-4 tracking-tight leading-tight group-hover:text-[#9667E0] transition-colors" style={{ fontFamily: "'Poppins', sans-serif" }}>
                      {item.title}
                    </h3>

                    <div className="w-full h-[0.5px] bg-[#D8CAF6]/50 mb-6" />

                    <p className="text-[#2D164B] text-sm md:text-base font-medium leading-relaxed opacity-80 group-hover:opacity-100 transition-opacity">
                      {item.desc}
                    </p>

                    <div className="mt-8 flex items-center gap-2 group-hover:translate-x-2 transition-transform duration-500">
                      <div className="w-4 h-4 rounded-full flex items-center justify-center border" style={{ borderColor: item.color, opacity: 0.5 }}>
                        <item.icon size={8} style={{ color: item.color }} />
                      </div>
                      <span className="text-[9px] font-black tracking-[0.2em] uppercase" style={{ color: item.color }}>Structure • 0{i + 1}</span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* JOIN CALL TO ACTION — unchanged */}
        <section className="px-4 sm:px-6 py-12 sm:py-24 md:py-40 bg-white">
          <div className="container mx-auto">
            <motion.div whileHover={{ y: -10 }} className="bg-gradient-to-br from-[#1A0B2E] to-[#4B2C82] rounded-2xl sm:rounded-[4rem] md:rounded-[6rem] p-8 sm:p-12 md:p-32 text-center text-white relative overflow-hidden shadow-2xl">
              <h2 className="text-2xl sm:text-4xl md:text-8xl font-black mb-6 sm:mb-10 uppercase tracking-tighter leading-none text-white">COMMITMENT <br className="hidden sm:block" /> LEADS TO IMPACT</h2>
              <button
                onClick={() => navigate('/join')}
                className="w-full sm:w-auto px-8 sm:px-16 py-4 sm:py-6 bg-white text-[#1A0B2E] rounded-2xl sm:rounded-3xl font-black text-sm sm:text-xl tracking-widest uppercase shadow-2xl hover:bg-[#EEEAFD] transition-all group flex items-center justify-center gap-3 sm:gap-4 mx-auto"
              >
                Apply For Membership <ArrowRight className="group-hover:translate-x-3 transition-transform" />
              </button>
            </motion.div>
          </div>
        </section>
      </div>

      {/* Member Profile Modal — unchanged */}
      <AnimatePresence>
        {selectedMember && <MemberModal member={selectedMember} onClose={() => setSelectedMember(null)} />}
      </AnimatePresence>
    </div>
  );
};

export default About;