import React, { useEffect, useRef, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Play } from 'lucide-react';
import { useApi } from '../hooks/useApi';
import { galleryService } from '../services/gallery.service';

gsap.registerPlugin(ScrollTrigger);

interface GalleryItemAPI {
  id: string;
  title: string | null;
  image_url: string;
  category: string | null;
}

export const ExploreCommunity: React.FC = () => {
  const sectionRef = useRef<HTMLDivElement>(null);
  const leftColRef = useRef<HTMLDivElement>(null);
  const rightColRef = useRef<HTMLDivElement>(null);
  const horizontalWrapperRef = useRef<HTMLDivElement>(null);
  const columnsRef = useRef<(HTMLDivElement | null)[]>([]);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const mouseWrapperRef = useRef<HTMLDivElement>(null);
  const desktopWrapperRef = useRef<HTMLDivElement>(null);
  
  const navigate = useNavigate();

  // Fetch approved gallery images
  const { data: apiImages, isLoading } = useApi<GalleryItemAPI[]>(
    () => galleryService.getApproved(),
    []
  );

  // Real event photos - MySQL Workshop & Data Decode
  const exploreItems = useMemo(() => {
    const baseImages = [
      { id: 'f1', image_url: 'https://dtdafbnzxuneroithrpe.supabase.co/storage/v1/object/public/gallery/uploads/9521da77-2b5e-473e-8f98-dc770f205f58/1774117093852.jpg', title: 'MySQL Workshop', category: 'Events' },
      { id: 'f2', image_url: 'https://dtdafbnzxuneroithrpe.supabase.co/storage/v1/object/public/gallery/uploads/9521da77-2b5e-473e-8f98-dc770f205f58/1774117135799.jpg', title: 'MySQL Workshop', category: 'Events' },
      { id: 'f3', image_url: 'https://dtdafbnzxuneroithrpe.supabase.co/storage/v1/object/public/gallery/uploads/9521da77-2b5e-473e-8f98-dc770f205f58/1774160157894.jpg', title: 'MySQL Workshop', category: 'Events' },
      { id: 'f4', image_url: 'https://dtdafbnzxuneroithrpe.supabase.co/storage/v1/object/public/gallery/uploads/9521da77-2b5e-473e-8f98-dc770f205f58/1774117064550.jpg', title: 'MySQL Workshop', category: 'Events' },
      { id: 'f5', image_url: 'https://dtdafbnzxuneroithrpe.supabase.co/storage/v1/object/public/gallery/uploads/9521da77-2b5e-473e-8f98-dc770f205f58/1774117074372.jpg', title: 'MySQL Workshop', category: 'Events' },
      { id: 'f6', image_url: 'https://dtdafbnzxuneroithrpe.supabase.co/storage/v1/object/public/gallery/uploads/9521da77-2b5e-473e-8f98-dc770f205f58/1774117035176.jpg', title: 'MySQL Workshop', category: 'Events' },
      { id: 'f7', image_url: 'https://dtdafbnzxuneroithrpe.supabase.co/storage/v1/object/public/gallery/uploads/9521da77-2b5e-473e-8f98-dc770f205f58/1774117030974.jpg', title: 'MySQL Workshop', category: 'Events' },
      { id: 'f8', image_url: 'https://dtdafbnzxuneroithrpe.supabase.co/storage/v1/object/public/gallery/uploads/fd2ea9f3-6b7c-4109-b849-b90d4cd51f8f/1774463200194.jpg', title: 'Data Decode', category: 'Events' },
      { id: 'f9', image_url: 'https://dtdafbnzxuneroithrpe.supabase.co/storage/v1/object/public/gallery/uploads/9521da77-2b5e-473e-8f98-dc770f205f58/1775422281926.jpg', title: 'Data Decode', category: 'Events' },
    ];

    // Fill 15 slots for 5 columns (3 per column), cycling through baseImages
    const filledImages = [];
    for (let i = 0; i < 15; i++) {
      filledImages.push(baseImages[i % baseImages.length]);
    }

    const pattern = [
      { aspect: 'aspect-square', col: 1 },
      { aspect: 'aspect-[3/4]', col: 1 },
      { aspect: 'aspect-[3/4]', col: 1 },

      { aspect: 'aspect-video', col: 2 },
      { aspect: 'aspect-[3/4]', col: 2 },
      { aspect: 'aspect-square', col: 2 },

      { aspect: 'aspect-[3/4]', col: 3 },
      { aspect: 'aspect-square', col: 3 },
      { aspect: 'aspect-[3/4]', col: 3 },

      { aspect: 'aspect-square', col: 4 },
      { aspect: 'aspect-[3/4]', col: 4 },
      { aspect: 'aspect-video', col: 4 },

      { aspect: 'aspect-[3/4]', col: 5 },
      { aspect: 'aspect-square', col: 5 },
      { aspect: 'aspect-[3/4]', col: 5 },
    ];

    return filledImages.map((img, i) => ({
      id: `${img.id}-${i}`,
      title: img.title,
      category: img.category,
      image: img.image_url,
      link: '/gallery',
      aspectRatio: pattern[i].aspect,
      column: pattern[i].col
    }));
  }, []);


  // Split images by columns and duplicate 6x for seamless scroll without gaps
  const getColumnData = (colIndex: number) => {
    const colItems = exploreItems.filter(item => item.column === colIndex);
    return [...colItems, ...colItems, ...colItems, ...colItems, ...colItems, ...colItems];
  };

  useEffect(() => {
    if (isLoading) return;

    const mm = gsap.matchMedia();

    mm.add({
      isDesktop: "(min-width: 768px)",
      isReduced: "(prefers-reduced-motion: reduce)"
    }, (context) => {
      const { isDesktop, isReduced } = context.conditions as { isDesktop: boolean, isReduced: boolean };

      if (!isDesktop || isReduced) {
        gsap.fromTo(leftColRef.current, { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 1, scrollTrigger: { trigger: sectionRef.current, start: "top 80%" } });
        return;
      }

      const entryTl = gsap.timeline({
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top top",
          end: "+=3000",
          pin: true,
          scrub: 1,
          anticipatePin: 1
        }
      });

      // Slide the entire section to the left
      entryTl.to(desktopWrapperRef.current, {
        x: "-40vw",
        ease: "none",
        duration: 2
      }, "move");

      // Phase 3: Vertical Independent Columns (5 columns now)
      const speeds = [0.55, -0.85, 0.72, -0.65, 0.81];
      columnsRef.current.forEach((col, i) => {
        if (col && speeds[i]) {
          entryTl.to(col, {
            yPercent: speeds[i] > 0 ? -60 * Math.abs(speeds[i]) : 60 * Math.abs(speeds[i]),
            ease: "none",
            duration: 2
          }, "move");
        }
      });

      entryTl.to({}, { duration: 0.1 }); 

      const updateImageFocus = () => {
        if(!sectionRef.current) return;
        const images = sectionRef.current.querySelectorAll('.explore-image-item');
        const viewportCenter = window.innerWidth / 2;
        
        images.forEach((img) => {
          const rect = img.getBoundingClientRect();
          const imgCenter = rect.left + rect.width / 2;
          const distFromCenter = Math.abs(viewportCenter - imgCenter);
          const maxDist = window.innerWidth;
          
          const normalized = Math.min(distFromCenter / maxDist, 1);
          
          const scale = 1.04 - (normalized * 0.09);
          const opacity = 1 - (normalized * 0.4); 
          
          gsap.set(img, { scale, opacity });
        });
      };

      gsap.ticker.add(updateImageFocus);

      const handleMouseMove = (e: MouseEvent) => {
        const x = (e.clientX / window.innerWidth - 0.5) * 8; 
        const y = (e.clientY / window.innerHeight - 0.5) * 8;
        gsap.to(mouseWrapperRef.current, {
          x, y, duration: 0.5, ease: "power2.out", overwrite: "auto"
        });
      };
      
      window.addEventListener('mousemove', handleMouseMove);

      return () => {
        gsap.ticker.remove(updateImageFocus);
        window.removeEventListener('mousemove', handleMouseMove);
      };
    });

    return () => mm.revert();
  }, [isLoading, exploreItems]);

  const blurs = ['blur-none', 'blur-[0.5px]', 'blur-none', 'blur-[0.5px]', 'blur-none'];

  return (
    <section ref={sectionRef} className="relative bg-[#f8f8f8] text-[#111] overflow-hidden min-h-screen will-change-transform selection:bg-[#111] selection:text-white">
      {/* ── MOBILE / FALLBACK VIEW ── */}
      <div className="md:hidden py-16 px-4 flex flex-col space-y-12">
         <div className="text-center space-y-4">
            <span className="uppercase tracking-widest text-xs font-semibold text-[#666]">Explore</span>
            <h2 className="text-6xl font-serif tracking-tight leading-none">DSC<br/>GIETU</h2>
            <p className="text-[#444] text-sm">Discover the projects and experiences that define our community.</p>
         </div>
         {isLoading ? (
           <div className="flex items-center justify-center h-40"><span className="text-sm font-medium animate-pulse">Loading Gallery...</span></div>
         ) : (
           <div className="grid grid-cols-2 gap-2 bg-[#111] p-2">
              <div className="flex flex-col gap-2">
                {getColumnData(1).slice(0, 4).map((item, i) => (
                   <div key={i} className={`w-full overflow-hidden rounded-none bg-[#222] ${item.aspectRatio}`}>
                     <img src={item.image} alt={item.title} className="w-full h-full object-cover" loading="lazy" />
                   </div>
                ))}
              </div>
              <div className="flex flex-col gap-2 mt-8">
                {getColumnData(2).slice(0, 4).map((item, i) => (
                   <div key={i} className={`w-full overflow-hidden rounded-none bg-[#222] ${item.aspectRatio}`}>
                     <img src={item.image} alt={item.title} className="w-full h-full object-cover" loading="lazy" />
                   </div>
                ))}
              </div>
           </div>
         )}
      </div>

      {/* ── DESKTOP VIEW ── */}
      <div ref={desktopWrapperRef} className="hidden md:flex h-screen items-center relative w-[140vw] will-change-transform">
        
        {/* LEFT COLUMN (40vw) */}
        <div ref={leftColRef} className="w-[40vw] shrink-0 h-full flex flex-col justify-between p-8 md:p-12 relative z-20">
          <div className="flex-1 flex items-center justify-center">
             <h2 ref={headingRef} className="text-[8rem] lg:text-[12rem] font-serif leading-[0.85] tracking-tighter text-black mix-blend-exclusion text-center">
               DS<br/>CLUB
             </h2>
          </div>
        </div>

        {/* RIGHT COLUMN (100vw) */}
        <div ref={rightColRef} className="w-[100vw] shrink-0 h-full relative z-10 overflow-hidden bg-black">
           
           <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-black via-black/80 to-transparent z-30 pointer-events-none"></div>
           <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-black via-black/80 to-transparent z-30 pointer-events-none"></div>

           {isLoading ? (
             <div className="flex items-center justify-center h-full w-full bg-[#f8f8f8] absolute inset-0 z-40">
               <span className="text-xs uppercase tracking-widest font-medium animate-pulse">Syncing Gallery...</span>
             </div>
           ) : (
             <div ref={mouseWrapperRef} className="w-full h-full">
               <div ref={horizontalWrapperRef} className="flex gap-4 w-[110%] h-full pt-[4vh] pb-[4vh] will-change-transform px-4">
                  
                  {[1, 2, 3, 4, 5].map((colIndex) => (
                    <div 
                      key={colIndex}
                      ref={(el) => { columnsRef.current[colIndex - 1] = el; }} 
                      className={`flex flex-col gap-4 w-1/5 will-change-transform ${blurs[colIndex - 1]}`}
                    >
                       {getColumnData(colIndex).map((item, i) => (
                          <div 
                            key={`${item.id}-${i}`} 
                            className={`explore-image-item w-full shrink-0 overflow-hidden rounded-none bg-[#111] ${item.aspectRatio}`}
                            onClick={() => navigate(item.link)}
                          >
                             <img 
                               src={item.image} 
                               alt={item.title} 
                               className="w-full h-full object-cover transform transition-transform duration-700 ease-out hover:scale-105"
                               loading="lazy"
                             />
                          </div>
                       ))}
                    </div>
                  ))}

               </div>
             </div>
           )}
        </div>
      </div>
    </section>
  );
};
