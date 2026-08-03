import React from 'react';
import { Link } from 'react-router-dom';
import { Heart } from 'lucide-react';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="w-full overflow-hidden z-20 relative flex flex-col">
      {/* Background with linear gradient */}
      <div
        className="w-full pt-8 md:pt-12 flex flex-col text-[#1A1A1A]"
        style={{
          background: 'linear-gradient(180deg, #F4F1EA 0%, #E8D3FF 50%, #C471ED 100%)',
        }}
      >
        <div className="w-full max-w-[1800px] mx-auto px-4 md:px-8 flex-1 flex flex-col">

          {/* Main Grid Wrapper */}
          <div className="flex-1 grid grid-cols-2 md:grid-cols-4 gap-0 border-t border-[#1A1A1A]/10 border-b">

            {/* COLUMN 1: Unnamed (Description + Mail) */}
            <div className="flex flex-col border-r border-[#1A1A1A]/10 p-4 md:p-6 min-h-[200px] md:min-h-[250px] justify-between">
              <p className="text-sm md:text-base font-medium leading-relaxed max-w-[280px]">
                Official Website of DSC GIETU — The Data Science Club at GIET University (DSC GIETU) is a student-led community focused on artificial intelligence, machine learning, data science research, hackathons, and technical workshops.
              </p>
              <a href="mailto:datascienceclub@giet.edu" className="mt-auto text-sm md:text-base font-bold uppercase tracking-widest hover:text-[#9333EA] transition-colors break-words">
                DATASCIENCECLUB@GIET.EDU
              </a>
            </div>

            {/* COLUMN 2: Navigation */}
            <div className="flex flex-col border-r border-[#1A1A1A]/10 p-4 md:p-6 min-h-[200px] md:min-h-[250px] justify-between">
              <h4 className="text-xs md:text-sm font-black uppercase tracking-widest text-[#1A1A1A]">NAVIGATION</h4>
              <div className="flex flex-col gap-1.5 mt-auto">
                <Link to="/" className="text-sm md:text-base font-bold uppercase tracking-widest hover:text-[#9333EA] transition-colors">HOME</Link>
                <Link to="/events" className="text-sm md:text-base font-bold uppercase tracking-widest hover:text-[#9333EA] transition-colors">EVENTS</Link>
                <Link to="/media" className="text-sm md:text-base font-bold uppercase tracking-widest hover:text-[#9333EA] transition-colors">MEDIA</Link>
                <Link to="/about" className="text-sm md:text-base font-bold uppercase tracking-widest hover:text-[#9333EA] transition-colors">ABOUT</Link>
              </div>
            </div>

            {/* COLUMN 3: Socials */}
            <div className="flex flex-col border-r-0 md:border-r border-[#1A1A1A]/10 p-4 md:p-6 min-h-[200px] md:min-h-[250px] justify-between">
              <h4 className="text-xs md:text-sm font-black uppercase tracking-widest text-[#1A1A1A]">SOCIALS</h4>
              <div className="flex flex-col gap-1.5 mt-auto">
                <a href="https://github.com/riteshkumarlenka2005/DS_ClubOfficial" target="_blank" rel="noreferrer" className="text-sm md:text-base font-bold uppercase tracking-widest hover:text-[#9333EA] transition-colors">GITHUB</a>
                <a href="https://www.linkedin.com/company/dsc-gietu/" target="_blank" rel="noreferrer" className="text-sm md:text-base font-bold uppercase tracking-widest hover:text-[#9333EA] transition-colors">LINKEDIN</a>
                <a href="https://www.instagram.com/dscgietu/?hl=en" target="_blank" rel="noreferrer" className="text-sm md:text-base font-bold uppercase tracking-widest hover:text-[#9333EA] transition-colors">INSTAGRAM</a>
                <a href="mailto:datascienceclub@giet.edu" className="text-sm md:text-base font-bold uppercase tracking-widest hover:text-[#9333EA] transition-colors">EMAIL</a>
              </div>
            </div>

            {/* COLUMN 4: Media */}
            <div className="flex flex-col p-4 md:p-6 min-h-[200px] md:min-h-[250px] justify-between">
              <h4 className="text-xs md:text-sm font-black uppercase tracking-widest text-[#1A1A1A]">MEDIA</h4>
              <div className="flex flex-col gap-1.5 mt-auto">
                <Link to="/media" className="text-sm md:text-base font-bold uppercase tracking-widest hover:text-[#9333EA] transition-colors">GALLERY</Link>
              </div>
            </div>

          </div>

          {/* HUGE TYPOGRAPHY */}
          <div className="w-full overflow-hidden flex flex-col justify-end pt-8 md:pt-16 pb-4 md:pb-6">
            <h1
              className="font-black text-[#1A1A1A] leading-[0.75] tracking-tighter whitespace-nowrap m-0 p-0 text-center -translate-x-1 md:-translate-x-3 lg:-translate-x-5"
              style={{ fontSize: 'clamp(5rem, 18vw, 24rem)' }}
            >
              DSC GIETU
            </h1>
          </div>
        </div>

        {/* Bottom Bar (same background) */}
        <div className="w-full py-6 px-4 md:px-8">
          <div className="max-w-[1800px] mx-auto flex flex-col lg:flex-row items-center justify-between gap-6 text-[10px] md:text-xs font-bold uppercase tracking-[0.2em]">

            <div className="flex flex-col md:flex-row items-center gap-4 md:gap-8">
              <span className="text-center md:text-left text-[#1A1A1A]">© {currentYear} DATA SCIENCE CLUB GIETU</span>
              <span className="text-center md:text-left text-[#1A1A1A]/40">ALL RIGHTS RESERVED</span>
            </div>

            <div className="flex items-center justify-center gap-6 md:gap-8 shrink-0">

              <Link to="/privacy" className="text-[#1A1A1A] hover:text-[#9333EA] transition-colors">PRIVACY POLICY</Link>
              <Link to="/terms" className="text-[#1A1A1A] hover:text-[#9333EA] transition-colors">TERMS</Link>
            </div>

          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
