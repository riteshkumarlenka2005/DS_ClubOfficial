import React from 'react';
import { Link } from 'react-router-dom';
import { Github, Linkedin, Instagram, Mail, Heart } from 'lucide-react';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  const links = [
    { name: 'Home', path: '/' },
    { name: 'Alumni', path: '/alumni' },
    { name: 'Events', path: '/events' },
    { name: 'Projects', path: '/projects' },
    { name: 'Gallery', path: '/gallery' },
    { name: 'Blog', path: '/blog' },
    { name: 'About', path: '/about' },
    { name: 'Join Us', path: '/join' },
  ];

  const socials = [
    { href: 'https://github.com/riteshkumarlenka2005/DS_ClubOfficial', icon: Github, label: 'GitHub' },
    { href: 'https://www.linkedin.com/company/dsc-gietu/', icon: Linkedin, label: 'LinkedIn' },
    { href: 'https://www.instagram.com/dscgietu/?hl=en', icon: Instagram, label: 'Instagram' },
    { href: 'mailto:datascienceclub@giet.edu', icon: Mail, label: 'Email' },
  ];

  return (
    <footer className="bg-[#1A0B2E] text-white relative overflow-visible z-20">
      {/* Arched Top Curve */}
      <div className="absolute top-0 left-0 w-full overflow-hidden leading-[0] pointer-events-none -translate-y-[calc(100%-1px)]">
        <svg viewBox="0 0 1200 120" preserveAspectRatio="none" className="relative block w-full h-16 md:h-24 text-[#1A0B2E] fill-current">
          <path d="M0,120 C300,0 900,0 1200,120 L1200,120 L0,120 Z"></path>
        </svg>
      </div>

      <div className="container mx-auto px-6 py-10 md:py-12">
        {/* Main Row: Logo + Nav + Socials */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-8 mb-8">
          {/* Brand */}
          <Link to="/" className="flex items-center gap-3 shrink-0 group">
            <img
              src="/DSC_LogoV2.png"
              alt="DSC Logo"
              className="w-10 h-10 object-contain transition-transform group-hover:scale-110"
            />
            <div>
              <h2 className="text-lg font-black tracking-tight leading-none">
                DSC <span className="text-[#C2A9EF]">GIETU</span>
              </h2>
              <span className="text-[8px] font-bold uppercase tracking-[0.3em] text-[#9667E0]">Data Science Club</span>
            </div>
          </Link>

          {/* Navigation */}
          <nav className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2">
            {links.map(link => (
              <Link
                key={link.name}
                to={link.path}
                className="text-xs font-semibold text-[#D8CAF6]/70 hover:text-white transition-colors"
              >
                {link.name}
              </Link>
            ))}
          </nav>

          {/* Socials */}
          <div className="flex items-center gap-3">
            {socials.map(s => (
              <a
                key={s.label}
                href={s.href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={s.label}
                className="w-8 h-8 flex items-center justify-center rounded-full bg-white/5 border border-white/10 text-[#C2A9EF] hover:bg-[#9667E0] hover:border-[#9667E0] hover:text-white transition-all"
              >
                <s.icon size={14} />
              </a>
            ))}
          </div>
        </div>

        {/* Authority Text */}
        <div className="text-center mb-8">
          <p className="text-xs font-medium text-[#D8CAF6]/50 leading-relaxed max-w-2xl mx-auto">
            Official Website of <strong className="text-[#C2A9EF]">DSC GIETU</strong> — The Data Science Club at GIET University (DSC GIETU) is a student-led community focused on artificial intelligence, machine learning, data science research, hackathons, and technical workshops.
          </p>
          <a
            href="https://www.gietdsclub.me"
            className="text-[10px] font-bold text-[#9667E0] hover:text-white transition-colors mt-2 inline-block tracking-widest uppercase"
          >
            www.gietdsclub.me
          </a>
        </div>

        {/* Divider + Bottom Bar */}
        <div className="border-t border-white/10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-[10px] font-bold uppercase tracking-[0.2em] text-[#D8CAF6]/40">
          <p>© {currentYear} Data Science Club GIETU. All rights reserved.</p>
          <div className="flex items-center gap-2">
            Made with <Heart size={10} className="text-red-500 fill-red-500" /> by DSC Team
          </div>
          <div className="flex items-center gap-6">
            <Link to="/privacy" className="hover:text-white transition-colors">Privacy</Link>
            <Link to="/terms" className="hover:text-white transition-colors">Terms</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
