import { useEffect } from 'react';

interface SEOConfig {
  title?: string;
  description?: string;
  image?: string;
  url?: string;
  type?: 'website' | 'article';
  noIndex?: boolean;
}

const BASE_URL = 'https://typejung.com';
const DEFAULT_IMAGE = '/og-image.png';
const SITE_NAME = 'Jungian Typology Assessment';

// SEO configurations for each page
export const PAGE_SEO: Record<string, SEOConfig> = {
  home: {
    title: 'Jungian Typology Assessment - Discover Your True Psychological Type',
    description: 'Take the most accurate cognitive functions assessment based on Carl Jung\'s original theory. Understand your dominant function, inferior function, and path to individuation. Free, in-depth, and backed by depth psychology.',
  },
  assessment: {
    title: 'Take the Assessment | Jungian Typology',
    description: 'Answer 40 carefully crafted questions to discover your psychological type. Based on Jung\'s theory of cognitive functions, not simplified dichotomies.',
  },
  results: {
    title: 'Your Results | Jungian Typology Assessment',
    description: 'View your personalized cognitive function profile, including your dominant, auxiliary, tertiary, and inferior functions.',
    noIndex: true, // Results are personal
  },
  learn: {
    title: 'Learn Jungian Psychology | Cognitive Functions Explained',
    description: 'Understand Carl Jung\'s theory of psychological types. Learn about the 8 cognitive functions, introversion vs extraversion, and the process of individuation.',
  },
  about: {
    title: 'About | Jungian Typology Assessment',
    description: 'Learn why we built the most accurate Jungian typology assessment online. Our methodology, team, and commitment to depth psychology.',
  },
  pricing: {
    title: 'Pricing | Jungian Typology Assessment',
    description: 'Get your full psychological type report with personalized insights, shadow work exercises, and individuation guidance.',
  },
  privacy: {
    title: 'Privacy Policy | Jungian Typology Assessment',
    description: 'How we handle your data and protect your privacy when using the Jungian Typology Assessment.',
  },
  terms: {
    title: 'Terms of Service | Jungian Typology Assessment',
    description: 'Terms and conditions for using the Jungian Typology Assessment platform.',
  },
  leaderboard: {
    title: 'Community Leaderboard | Jungian Typology',
    description: 'See how your type compares with others. View the distribution of cognitive function types in our community.',
  },
};

export function useSEO(config: SEOConfig) {
  useEffect(() => {
    const {
      title,
      description,
      image = DEFAULT_IMAGE,
      url = window.location.pathname,
      type = 'website',
      noIndex = false,
    } = config;

    // Update document title
    if (title) {
      document.title = title;
    }

    // Helper to update or create meta tag
    const setMetaTag = (name: string, content: string, isProperty = false) => {
      const attr = isProperty ? 'property' : 'name';
      let element = document.querySelector(`meta[${attr}="${name}"]`) as HTMLMetaElement;

      if (!element) {
        element = document.createElement('meta');
        element.setAttribute(attr, name);
        document.head.appendChild(element);
      }
      element.content = content;
    };

    // Standard meta tags
    if (description) {
      setMetaTag('description', description);
    }

    // Robots
    if (noIndex) {
      setMetaTag('robots', 'noindex, nofollow');
    } else {
      setMetaTag('robots', 'index, follow');
    }

    // Open Graph tags
    if (title) {
      setMetaTag('og:title', title, true);
    }
    if (description) {
      setMetaTag('og:description', description, true);
    }
    setMetaTag('og:image', image.startsWith('http') ? image : `${BASE_URL}${image}`, true);
    setMetaTag('og:url', `${BASE_URL}${url}`, true);
    setMetaTag('og:type', type, true);
    setMetaTag('og:site_name', SITE_NAME, true);

    // Twitter Card tags
    setMetaTag('twitter:card', 'summary_large_image');
    if (title) {
      setMetaTag('twitter:title', title);
    }
    if (description) {
      setMetaTag('twitter:description', description);
    }
    setMetaTag('twitter:image', image.startsWith('http') ? image : `${BASE_URL}${image}`);

    // Canonical URL
    let canonical = document.querySelector('link[rel="canonical"]') as HTMLLinkElement;
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.rel = 'canonical';
      document.head.appendChild(canonical);
    }
    canonical.href = `${BASE_URL}${url}`;

  }, [config.title, config.description, config.image, config.url, config.type, config.noIndex]);
}

// Hook for dynamic share page SEO
export function useSharePageSEO(dominantFunction: string) {
  useSEO({
    title: `${dominantFunction} Type Result | Jungian Typology Assessment`,
    description: `See this ${dominantFunction} psychological type profile. Take the assessment to discover your own cognitive function stack.`,
    type: 'article',
  });
}
