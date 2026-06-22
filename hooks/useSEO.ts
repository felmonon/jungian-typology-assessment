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
const SITE_NAME = 'TypeJung';

// SEO configurations for each page
export const PAGE_SEO: Record<string, SEOConfig> = {
  home: {
    title: 'Free Cognitive Function Test - MBTI Test Alternative | TypeJung',
    description: 'Take a free 42-question Jungian cognitive functions test for people comparing MBTI tests, Sakinorva, and 16Personalities. See the function-stack map first.',
  },
  assessment: {
    title: 'Take the Free Jungian Cognitive Function Assessment | TypeJung',
    description: 'Answer 42 scenario-based questions to map all 8 Jungian cognitive functions, inferior-function pressure, somatic signals, and attitude direction.',
  },
  results: {
    title: 'Your Function-Stack Map | TypeJung',
    description: 'View your Jungian function-stack map, dominant-inferior axis, developmental edge, somatic signal, and reliability score.',
    noIndex: true, // Results are personal
  },
  learn: {
    title: 'Learn Jungian Psychology | Cognitive Functions Explained',
    description: 'Understand Carl Jung\'s theory of psychological types. Learn about the 8 cognitive functions, introversion vs extraversion, and the process of individuation.',
  },
  about: {
    title: 'About | TypeJung',
    description: 'Learn why TypeJung maps all 8 cognitive functions, inferior-function pressure, somatic signals, and attitude direction instead of forcing a four-letter label.',
  },
  pricing: {
    title: 'Pricing | TypeJung',
    description: 'Start with the free TypeJung assessment, then unlock Insight for CA$7 or Mastery for CA$20.30 with TYPEJUNG30 applied on Stripe.',
  },
  methodology: {
    title: 'Methodology - How the Function-Stack Map Is Built | TypeJung',
    description: 'How TypeJung groups 42 prompts into four evidence layers, infers the dominant and inferior functions, scores reliability, and what it does not claim.',
  },
  debrief: {
    title: 'Personal Type Debrief - Founder-Reviewed Breakdown | TypeJung',
    description: 'Still stuck between two types? Get a founder-reviewed Personal Type Debrief of your TypeJung map, likely mistypes, and stress edge, delivered within 72 hours.',
  },
  sampleReport: {
    title: 'Sample Paid Report | TypeJung',
    description: 'Preview a fictional TypeJung paid report sample before you buy, including developmental edge, stress-pattern reflection, relationship-pattern reflection, practices, and AI Type Guide examples.',
  },
  privacy: {
    title: 'Privacy Policy | TypeJung',
    description: 'How TypeJung handles assessment data, account data, payments, and privacy controls.',
  },
  terms: {
    title: 'Terms of Service | TypeJung',
    description: 'Terms and conditions for using TypeJung, including free assessment access, paid reports, and account features.',
  },
  leaderboard: {
    title: 'Community Results | TypeJung',
    description: 'See how TypeJung function-stack maps distribute across the community and compare dominant-inferior patterns.',
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
      setMetaTag('robots', 'index, follow, max-image-preview:large');
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
    title: `${dominantFunction} Type Result | TypeJung`,
    description: `See this ${dominantFunction} psychological type profile. Take TypeJung to discover your own cognitive function stack.`,
    type: 'article',
  });
}
