import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

interface SEOProps {
  title?: string;
  description?: string;
}

const BASE_TITLE = 'DSC GIETU Data Science Club';
const BASE_URL = 'https://www.gietdsclub.me';
const DEFAULT_DESCRIPTION =
  'Official Data Science Club of GIET University. Explore workshops, AI/ML projects, hackathons, alumni network and student research initiatives.';

/**
 * Lightweight SEO component that sets document title, meta description,
 * canonical URL and Open Graph tags per page — no extra dependencies needed.
 */
const SEO = ({ title, description }: SEOProps) => {
  const { pathname } = useLocation();

  useEffect(() => {
    // Title
    document.title = title ? `${title} | ${BASE_TITLE}` : `${BASE_TITLE} — GIET University`;

    // Meta description
    const desc = description || DEFAULT_DESCRIPTION;
    let metaDesc = document.querySelector<HTMLMetaElement>('meta[name="description"]');
    if (metaDesc) {
      metaDesc.content = desc;
    } else {
      metaDesc = document.createElement('meta');
      metaDesc.name = 'description';
      metaDesc.content = desc;
      document.head.appendChild(metaDesc);
    }

    // Canonical
    const canonicalUrl = `${BASE_URL}${pathname === '/' ? '/' : pathname}`;
    let canonical = document.querySelector<HTMLLinkElement>('link[rel="canonical"]');
    if (canonical) {
      canonical.href = canonicalUrl;
    } else {
      canonical = document.createElement('link');
      canonical.rel = 'canonical';
      canonical.href = canonicalUrl;
      document.head.appendChild(canonical);
    }

    // Open Graph
    const ogTags: Record<string, string> = {
      'og:title': title ? `${title} | ${BASE_TITLE}` : BASE_TITLE,
      'og:description': desc,
      'og:url': canonicalUrl,
    };
    Object.entries(ogTags).forEach(([property, content]) => {
      let tag = document.querySelector<HTMLMetaElement>(`meta[property="${property}"]`);
      if (tag) {
        tag.content = content;
      }
    });
  }, [title, description, pathname]);

  return null;
};

export default SEO;
