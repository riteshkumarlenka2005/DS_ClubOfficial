import React from 'react';
import { motion } from 'framer-motion';

const TECH_ITEMS = [
  { name: 'Python',       logo: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/python/python-original.svg',            bg: '#F1F0E9' },
  { name: 'MySQL',        logo: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/mysql/mysql-original-wordmark.svg',     bg: '#FF6B00' },
  { name: 'NumPy',        logo: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/numpy/numpy-original.svg',              bg: '#9667E0' },
  { name: 'Pandas',       logo: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/pandas/pandas-original-wordmark.svg',   bg: '#0284C7' },
  { name: 'TensorFlow',   logo: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/tensorflow/tensorflow-original.svg',    bg: '#C26B00' },
  { name: 'Scikit-learn', logo: 'https://upload.wikimedia.org/wikipedia/commons/0/05/Scikit_learn_logo_small.svg',          bg: '#F1F0E9' },
  { name: 'Docker',       logo: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/docker/docker-original.svg',            bg: '#0369A1' },
  { name: 'FastAPI',      logo: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/fastapi/fastapi-original.svg',          bg: '#10A37F' },
  { name: 'Jupyter',      logo: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/jupyter/jupyter-original-wordmark.svg', bg: '#F1F0E9' },
  { name: 'PyTorch',      logo: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/pytorch/pytorch-original.svg',          bg: '#E11D48' },
  { name: 'OpenCV',       logo: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/opencv/opencv-original.svg',            bg: '#15803D' },
  { name: 'Matplotlib',   logo: 'https://upload.wikimedia.org/wikipedia/commons/8/84/Matplotlib_icon.svg',                  bg: '#4C1D95' },
  { name: 'Keras',        logo: 'https://upload.wikimedia.org/wikipedia/commons/a/ae/Keras_logo.svg',                       bg: '#B91C1C' },
  { name: 'GitHub',       logo: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/github/github-original.svg',            bg: '#F1F0E9' },
  { name: 'VSCode',       logo: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/vscode/vscode-original.svg',            bg: '#0284C7' },
  { name: 'Kaggle',       logo: 'https://www.vectorlogo.zone/logos/kaggle/kaggle-icon.svg',                                  bg: '#20BEFF' },
  { name: 'Streamlit',    logo: 'https://streamlit.io/images/brand/streamlit-mark-color.svg',                               bg: '#F1F0E9' },
  { name: 'Flask',        logo: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/flask/flask-original.svg',              bg: '#F1F0E9' },
  { name: 'PostgreSQL',   logo: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/postgresql/postgresql-original.svg',    bg: '#4338CA' },
  { name: 'Linux',        logo: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/linux/linux-original.svg',              bg: '#D97706' },
];

// 5 columns x 8 slots each (null = empty cell)
const COLUMNS = [
  [0,    null, 1,    null, 2,    null, null, 3   ],
  [null, 4,    5,    null, null, 6,    7,    null ],
  [8,    null, null, 9,    10,   null, 11,   null ],
  [null, 12,   13,   null, null, 14,   null, 15  ],
  [16,   null, 17,   null, 18,   null, null, 19  ],
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
            Technical<br />Arsenal.
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: false, amount: 0.3 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-[#2D164B] text-lg md:text-xl font-medium leading-relaxed opacity-80 max-w-sm"
          >
            Master the modern data stack. From machine learning frameworks to cloud
            architecture, we build with the tools that power the future.
          </motion.p>
        </div>
      </div>

      {/* ── Right Content (Isometric Animated Grid) ── */}
      <div className="absolute top-1/2 left-[30%] md:left-[50%] lg:left-[45%] w-[1200px] h-[1000px] -translate-y-1/2 pointer-events-none">
        <div
          className="w-full h-full flex gap-0"
          style={{
            transform: 'rotateX(60deg) rotateZ(-45deg) scale(1.4)',
            transformStyle: 'preserve-3d',
          }}
        >
          <div className="flex-1 flex flex-col gap-0 animate-[reelUp_20s_linear_infinite]">
            {COLUMNS[0].map((t, i) => <GridCell key={`c1a-${i}`} techIdx={t} />)}
            {COLUMNS[0].map((t, i) => <GridCell key={`c1b-${i}`} techIdx={t} />)}
          </div>

          <div className="flex-1 flex flex-col gap-0 animate-[reelDown_25s_linear_infinite]" style={{ marginTop: '-100%' }}>
            {COLUMNS[1].map((t, i) => <GridCell key={`c2a-${i}`} techIdx={t} />)}
            {COLUMNS[1].map((t, i) => <GridCell key={`c2b-${i}`} techIdx={t} />)}
          </div>

          <div className="flex-1 flex flex-col gap-0 animate-[reelUp_22s_linear_infinite]">
            {COLUMNS[2].map((t, i) => <GridCell key={`c3a-${i}`} techIdx={t} />)}
            {COLUMNS[2].map((t, i) => <GridCell key={`c3b-${i}`} techIdx={t} />)}
          </div>

          <div className="flex-1 flex flex-col gap-0 animate-[reelDown_18s_linear_infinite]" style={{ marginTop: '-100%' }}>
            {COLUMNS[3].map((t, i) => <GridCell key={`c4a-${i}`} techIdx={t} />)}
            {COLUMNS[3].map((t, i) => <GridCell key={`c4b-${i}`} techIdx={t} />)}
          </div>

          <div className="flex-1 flex flex-col gap-0 animate-[reelUp_23s_linear_infinite]">
            {COLUMNS[4].map((t, i) => <GridCell key={`c5a-${i}`} techIdx={t} />)}
            {COLUMNS[4].map((t, i) => <GridCell key={`c5b-${i}`} techIdx={t} />)}
          </div>
        </div>
      </div>

      <style>{`
        @keyframes reelUp {
          0%   { transform: translateY(0); }
          100% { transform: translateY(-50%); }
        }
        @keyframes reelDown {
          0%   { transform: translateY(-50%); }
          100% { transform: translateY(0); }
        }
      `}</style>
    </section>
  );
};

function GridCell({ techIdx }: { techIdx: number | null }) {
  const tech = techIdx !== null ? TECH_ITEMS[techIdx] : null;
  const lightBg = tech?.bg === '#F1F0E9' || tech?.bg === '#20BEFF';

  return (
    <div
      className="w-[220px] h-[220px] shrink-0 border border-black/10 flex items-center justify-center relative overflow-hidden"
      style={{ backgroundColor: tech ? tech.bg : '#F1F0E9' }}
    >
      {tech && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 p-5">
          <img
            src={tech.logo}
            alt={tech.name}
            className="w-16 h-16 object-contain"
            style={{
              filter: lightBg ? 'none' : 'drop-shadow(0 2px 10px rgba(0,0,0,0.35))',
            }}
          />
          <span
            className="text-[9px] font-bold tracking-[0.15em] uppercase text-center leading-tight"
            style={{ color: lightBg ? '#1A0B2E' : 'rgba(255,255,255,0.9)' }}
          >
            {tech.name}
          </span>
        </div>
      )}
      <div className="absolute -top-[2px] -left-[2px] w-1 h-1 rounded-full bg-black/30 z-10" />
      <div className="absolute -bottom-[2px] -right-[2px] w-1 h-1 rounded-full bg-black/30 z-10" />
    </div>
  );
}
