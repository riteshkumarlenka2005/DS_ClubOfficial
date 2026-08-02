
import React from 'react';
import { motion } from 'framer-motion';
import { Github, Globe, Code, ExternalLink } from 'lucide-react';
import { AnimatedText } from './Home';
import { projectService } from '../services/project.service';
import { useApi } from '../hooks/useApi';
import SEO from '../components/SEO';

/* ── Types ── */
interface Project {
  id: string;
  title: string;
  slug: string;
  description?: string;
  content?: string;
  short_description: string | null;
  tech_stack: string[];
  github_url: string | null;
  live_url: string | null;
  image_url?: string | null;
  cover_image?: string | null;
  cover_image_url?: string | null;
  created_by: string;
  status: string;
  created_at: string;
  updated_at: string;
  creator?: { id: string; full_name: string; avatar_url: string | null };
}

const ProjectCard = ({ project }: { project: Project }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="bg-white/95 rounded-[2rem] md:rounded-[3rem] border border-[#D8CAF6] shadow-md flex flex-col lg:flex-row gap-8 md:gap-10 p-6 md:p-10 hover:shadow-2xl transition-all hover:border-[#9667E0]"
    >
      <div className="w-full lg:w-[45%] aspect-video bg-[#EEEAFD] rounded-[1.5rem] md:rounded-[2rem] overflow-hidden relative shadow-inner">
        <img
          src={project.image_url || project.cover_image || project.cover_image_url || `https://picsum.photos/seed/${project.slug}/800/600`}
          className="w-full h-full object-cover transition-transform duration-1000 hover:scale-110"
          alt={project.title}
          loading="lazy"
        />
        {project.tech_stack.length > 0 && (
          <div className="absolute top-4 left-4 md:top-6 md:left-6 flex flex-wrap gap-2">
            {project.tech_stack.slice(0, 3).map((tech, i) => (
              <span
                key={i}
                className="bg-[#1A0B2E] text-white px-4 md:px-5 py-1.5 md:py-2 rounded-xl md:rounded-2xl text-[8px] md:text-[10px] font-black uppercase tracking-widest shadow-lg"
              >
                {tech}
              </span>
            ))}
          </div>
        )}
      </div>
      <div className="flex-1 flex flex-col justify-center">
        <h3 className="text-2xl md:text-4xl font-black mb-4 md:mb-6 text-[#1A0B2E] tracking-tight">{project.title}</h3>
        <p className="text-[#2D164B] mb-6 md:mb-10 text-base md:text-lg font-bold leading-relaxed opacity-90">
          {project.short_description || project.description || project.content}
        </p>
        <div className="flex flex-wrap gap-3 md:gap-5 mb-8 md:mb-10">
          {project.tech_stack.map((tech, i) => (
            <div
              key={i}
              className="flex items-center gap-2 text-[#1A0B2E] text-[10px] md:text-xs font-black bg-[#EEEAFD] px-4 md:px-6 py-2 md:py-2.5 rounded-full border border-[#D8CAF6]"
            >
              <Code size={14} /> {tech}
            </div>
          ))}
          {(project.github_url || project.live_url) && (
            <div className="flex items-center gap-2 text-[#4B2C82] text-[10px] md:text-xs font-black bg-white px-4 md:px-6 py-2 md:py-2.5 rounded-full border border-[#D8CAF6]">
              <ExternalLink size={14} /> {project.github_url ? 'OPEN SOURCE' : 'LIVE'}
            </div>
          )}
        </div>
        {project.creator && (
          <div className="flex items-center gap-3 mb-6">
            {project.creator.avatar_url ? (
              <img src={project.creator.avatar_url} alt={project.creator.full_name} className="w-7 h-7 rounded-full border-2 border-[#D8CAF6]" referrerPolicy="no-referrer" />
            ) : (
              <div className="w-7 h-7 rounded-full bg-[#EEEAFD] border-2 border-[#D8CAF6]" />
            )}
            <span className="text-[10px] md:text-xs font-bold text-[#4B2C82] uppercase tracking-wider">
              by {project.creator.full_name}
            </span>
          </div>
        )}
        <div className="flex flex-col sm:flex-row gap-4">
          {project.github_url && (
            <a
              href={project.github_url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 bg-[#1A0B2E] text-white py-3.5 md:py-4 rounded-xl md:rounded-2xl font-black text-xs md:text-sm tracking-widest flex items-center justify-center gap-3 hover:bg-[#4B2C82] transition-colors shadow-lg"
            >
              <Github size={20} /> SOURCE CODE
            </a>
          )}
          {project.live_url && (
            <a
              href={project.live_url}
              target="_blank"
              rel="noopener noreferrer"
              className={`${project.github_url ? 'px-8 md:px-10' : 'flex-1'} py-3.5 md:py-4 bg-white text-[#1A0B2E] border-2 border-[#1A0B2E] rounded-xl md:rounded-2xl hover:bg-[#EEEAFD] transition-all flex items-center justify-center gap-3 font-black text-xs md:text-sm tracking-widest`}
            >
              <Globe size={20} /> {project.github_url ? '' : 'LIVE DEMO'}
            </a>
          )}
          {!project.github_url && !project.live_url && (
            <div className="flex-1 bg-[#EEEAFD] text-[#4B2C82] py-3.5 md:py-4 rounded-xl md:rounded-2xl font-black text-xs md:text-sm tracking-widest flex items-center justify-center gap-3 border border-[#D8CAF6]">
              <Code size={20} /> COMING SOON
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

const Projects = () => {
  const { data: projects, isLoading, error } = useApi<Project[]>(
    () => projectService.getPublished(),
    []
  );

  return (
    <div className="w-full">
      <SEO title="Projects" description="Explore innovative AI/ML and data science projects built by DSC GIETU students at GIET University." />
      <section className="relative py-20 md:py-32 text-center px-4 md:px-6 overflow-hidden" style={{
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
        <div className="relative z-10 text-center flex flex-col items-center justify-center">
          <AnimatedText text="PROJECTS" animateOnLoad className="text-3xl sm:text-4xl md:text-9xl font-black mb-6 md:mb-8 text-white tracking-tight drop-shadow-[0_0_40px_rgba(150,103,224,0.4)]" />
          <p className="text-white/70 text-lg md:text-2xl max-w-3xl mx-auto font-bold leading-relaxed px-4">
            From concept to deployment. Explore the disruptive solutions being built in our research labs.
          </p>
        </div>
      </section>

      <section
        className="py-16 md:py-24 px-4 md:px-6 min-h-screen"
        style={{ background: 'linear-gradient(180deg, #FFFFFF 0%, #EEEAFD 50%, #D8CAF6 100%)' }}
      >
        <div className="container mx-auto max-w-6xl flex flex-col gap-10 md:gap-16">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-24">
              <div
                className="w-12 h-12 border-4 rounded-full animate-spin mb-4"
                style={{ borderColor: '#D8CAF6', borderTopColor: '#9667E0' }}
              />
              <p className="text-sm font-bold text-[#4B2C82] uppercase tracking-widest">Loading projects...</p>
            </div>
          ) : error ? (
            <div className="text-center py-24">
              <p className="text-sm font-semibold text-red-500">Failed to load projects. Please try again later.</p>
            </div>
          ) : projects && projects.length > 0 ? (
            projects.map(project => (
              <ProjectCard key={project.id} project={project} />
            ))
          ) : (
            <div className="text-center py-24">
              <div className="w-16 h-16 rounded-full bg-[#EEEAFD] flex items-center justify-center mx-auto mb-4 border border-[#D8CAF6]">
                <Code size={28} className="text-[#9667E0]" />
              </div>
              <p className="text-lg font-bold text-[#1A0B2E]">No projects yet</p>
              <p className="text-sm font-medium text-[#4B2C82] opacity-60 mt-1">Check back soon — our team is building something awesome.</p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default Projects;
