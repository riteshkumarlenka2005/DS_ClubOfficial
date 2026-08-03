import React, { useState } from 'react';
import { Newspaper } from 'lucide-react';
import Gallery from './Gallery';
import Blog from './Blog';
import SEO from '../components/SEO';
import { AnimatePresence, motion } from 'framer-motion';

type Tab = 'gallery' | 'blog';

const GalleryBlog: React.FC = () => {
  const [activeTab, setActiveTab] = useState<Tab>('gallery');

  return (
    <div className="w-full min-h-screen" style={{ background: 'var(--lavender-web)' }}>
      <SEO
        title="Gallery & Blog"
        description="Explore the DSC GIETU photo gallery and blog — event highlights, tutorials, workshops, and more."
      />

      {/* Tab Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -12 }}
          transition={{ duration: 0.25 }}
        >
          {activeTab === 'gallery'
            ? <Gallery onSwitchToBlog={() => setActiveTab('blog')} />
            : <Blog />}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default GalleryBlog;
