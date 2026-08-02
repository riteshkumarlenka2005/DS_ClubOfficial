
import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, useReducedMotion, AnimatePresence } from 'framer-motion';
import { X, Linkedin, Github, Instagram, Mail } from 'lucide-react';
import { teamService } from '../services/team.service';

interface MarqueeMember {
  name: string;
  role: string;
  img: string;
  bio?: string;
  linkedin?: string;
  github?: string;
  instagram?: string;
  email?: string;
}

/* ═══════════════ MEMBER MODAL ═══════════════ */

const MemberModal: React.FC<{ member: MarqueeMember; onClose: () => void }> = ({ member, onClose }) => {
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
        className="relative bg-white rounded-3xl border border-[#E0D4F5] shadow-2xl max-w-sm w-full overflow-hidden"
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 w-9 h-9 flex items-center justify-center rounded-full bg-white/80 backdrop-blur-sm border border-[#E0D4F5] hover:bg-[#EEEAFD] transition-colors cursor-pointer"
        >
          <X size={16} className="text-[#1A0B2E]" />
        </button>

        {/* Photo */}
        <div className="flex justify-center pt-8 pb-4 bg-gradient-to-b from-[#EEEAFD] to-white">
          <div className="w-32 h-32 rounded-full border-4 border-white shadow-xl overflow-hidden">
            <img
              src={member.img}
              alt={member.name}
              className="w-full h-full object-cover"
            />
          </div>
        </div>

        {/* Details */}
        <div className="px-8 pb-8 text-center">
          <h3 className="text-xl font-black text-[#1A0B2E] uppercase tracking-tight mb-1">{member.name}</h3>
          <p className="text-xs font-black uppercase text-[#9667E0] tracking-widest mb-5">{member.role}</p>

          {member.bio && (
            <p className="text-sm text-[#2D164B]/70 font-medium leading-relaxed mb-6">{member.bio}</p>
          )}

          {/* Social links */}
          {(member.linkedin || member.github || member.instagram || member.email) && (
            <div className="flex items-center justify-center gap-3">
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

/* ═══════════════ COMMUNITY MARQUEE ═══════════════ */

const CommunityMarquee: React.FC = () => {
  const shouldReduceMotion = useReducedMotion();
  const [selectedMember, setSelectedMember] = useState<MarqueeMember | null>(null);
  const [members, setMembers] = useState<MarqueeMember[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    teamService.getVisible()
      .then((res: any) => {
        const list = Array.isArray(res) ? res : res.data || [];
        const mapped: MarqueeMember[] = list.map((m: any) => ({
          name: m.name,
          role: m.role,
          img: m.avatar_url || `https://picsum.photos/seed/${m.img_seed || m.name}/200`,
          bio: m.bio || undefined,
          linkedin: m.linkedin_url || undefined,
          github: m.github_url || undefined,
          instagram: m.instagram_url || undefined,
          email: m.email || undefined,
        }));
        setMembers(mapped);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  // Need at least a few items for the marquee to look good
  // Triple the items for a smooth infinite loop
  const marqueeItems = members.length > 0
    ? [...members, ...members, ...members]
    : [];

  if (loading || members.length === 0) return null;

  return (
    <section className="relative w-full py-10 md:py-24 bg-gradient-to-b from-white via-[#EEEAFD]/40 to-white overflow-hidden border-t border-[#D8CAF6]/30">
      <div className="container mx-auto px-6 mb-8 md:mb-12 text-center">
        <span className="text-[10px] md:text-xs font-black text-[#9667E0] uppercase tracking-[0.5em] mb-4 block">Our DNA</span>
        <h2 className="text-3xl md:text-5xl font-black text-[#1A0B2E] tracking-tighter uppercase">The Human Element</h2>
      </div>

      <div className="flex relative items-center">
        {/* Left Gradient Fade */}
        <div className="absolute left-0 top-0 bottom-0 w-32 md:w-64 bg-gradient-to-r from-white to-transparent z-10 pointer-events-none" />

        {/* Right Gradient Fade */}
        <div className="absolute right-0 top-0 bottom-0 w-32 md:w-64 bg-gradient-to-l from-white to-transparent z-10 pointer-events-none" />

        {/* CSS keyframes for marquee */}
        <style>{`
          @keyframes marquee-scroll {
            from { transform: translateX(-50%); }
            to { transform: translateX(0%); }
          }
        `}</style>

        <div
          className="flex items-center gap-8 md:gap-16 whitespace-nowrap px-8 group/marquee"
          style={{
            width: 'fit-content',
            animation: shouldReduceMotion ? 'none' : 'marquee-scroll 40s linear infinite',
          }}
          onMouseEnter={(e) => { e.currentTarget.style.animationPlayState = 'paused'; }}
          onMouseLeave={(e) => { e.currentTarget.style.animationPlayState = 'running'; }}
        >
          {marqueeItems.map((member, idx) => (
            <div
              key={`${member.name}-${idx}`}
              className="group relative flex flex-col items-center cursor-pointer"
              onClick={() => setSelectedMember(member)}
            >
              <div className="relative w-20 h-20 md:w-32 md:h-32 rounded-full p-1 border-2 border-[#D8CAF6] group-hover:border-[#9667E0] transition-all duration-500 shadow-sm group-hover:shadow-[0_0_25px_rgba(150,103,224,0.3)]">
                <img
                  src={member.img}
                  alt={member.name}
                  className="w-full h-full rounded-full object-cover grayscale-[20%] group-hover:grayscale-0 transition-all duration-500"
                  loading="lazy"
                />
                {/* Click indicator overlay */}
                <div className="absolute inset-0 rounded-full bg-[#1A0B2E]/0 group-hover:bg-[#1A0B2E]/30 transition-all duration-300 flex items-center justify-center">
                  <span className="text-white text-[9px] font-bold uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity duration-300">View</span>
                </div>
              </div>

              {/* Floating Name Badge */}
              <div className="absolute -bottom-2 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-2 group-hover:translate-y-0 z-20">
                <div className="bg-[#1A0B2E] text-white px-4 py-1.5 rounded-full shadow-xl border border-[#9667E0]/40 flex flex-col items-center">
                  <span className="text-[10px] font-black tracking-tight whitespace-nowrap">{member.name}</span>
                  <span className="text-[8px] font-bold text-[#9667E0] uppercase tracking-widest whitespace-nowrap">{member.role}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-10 md:mt-16 text-center">
        <div className="inline-flex items-center gap-2 px-6 py-2 bg-[#EEEAFD] rounded-full border border-[#D8CAF6] shadow-sm">
          <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
          <span className="text-[10px] font-black text-[#1A0B2E] uppercase tracking-widest">
            {members.length}+ Active Members
          </span>
        </div>
      </div>

      {/* Member Profile Modal */}
      <AnimatePresence>
        {selectedMember && <MemberModal member={selectedMember} onClose={() => setSelectedMember(null)} />}
      </AnimatePresence>
    </section>
  );
};

export default CommunityMarquee;
