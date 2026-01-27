#!/usr/bin/env node
/**
 * Static HTML Page Generator for TypeJung SEO
 * Generates individual HTML files for all functions and types
 */

import { functionSEO, functionData, typeSEO, typeData } from '../data/seo-config.js';
import { writeFileSync, mkdirSync } from 'fs';
import { dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

const siteConfig = {
  url: 'https://typejung.com',
  name: 'TypeJung',
  description: 'Free Jungian cognitive function assessment using Singer-Loomis methodology',
};

// Common head template
const getHead = (title: string, description: string, path: string) => `
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${title}</title>
<meta name="description" content="${description}">
<meta name="keywords" content="Jung personality test, cognitive functions, ${title.split(' - ')[0].toLowerCase()}, psychological types">
<meta name="author" content="TypeJung">
<meta name="robots" content="index, follow">
<link rel="canonical" href="${siteConfig.url}${path}">
<meta property="og:type" content="article">
<meta property="og:url" content="${siteConfig.url}${path}">
<meta property="og:title" content="${title}">
<meta property="og:description" content="${description}">
<meta property="og:image" content="${siteConfig.url}/og-image.png">
<meta property="og:site_name" content="TypeJung">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="${title}">
<meta name="twitter:description" content="${description}">
<meta name="twitter:image" content="${siteConfig.url}/og-image.png">
<link rel="icon" type="image/svg+xml" href="/favicon.svg">
<style>
  body { font-family: Georgia, serif; line-height: 1.8; color: #333; max-width: 900px; margin: 0 auto; padding: 40px 20px; background: #fafaf9; }
  h1 { color: #451a03; font-size: 2.5em; margin-bottom: 0.2em; }
  h2 { color: #451a03; border-bottom: 2px solid #b45309; padding-bottom: 10px; margin-top: 40px; }
  h3 { color: #451a03; margin-top: 30px; }
  .subtitle { color: #57534e; font-size: 1.3em; margin-bottom: 30px; }
  .breadcrumb { color: #78716c; margin-bottom: 20px; }
  .breadcrumb a { color: #b45309; text-decoration: none; }
  .cta-box { background: #fef3c7; padding: 25px; border-radius: 10px; margin: 30px 0; border-left: 4px solid #b45309; }
  .cta-box h3 { margin-top: 0; }
  .btn { display: inline-block; padding: 12px 25px; background: #451a03; color: white; text-decoration: none; border-radius: 5px; font-weight: bold; }
  .related-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px; margin: 20px 0; }
  .related-card { background: white; padding: 15px; border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
  .related-card a { color: #451a03; text-decoration: none; font-weight: bold; }
  .trait-list { columns: 2; column-gap: 30px; }
  .trait-list li { break-inside: avoid; margin-bottom: 10px; }
  footer { margin-top: 50px; padding-top: 20px; border-top: 1px solid #e7e5e4; color: #78716c; text-align: center; }
  nav { background: #f5f5f4; padding: 20px; border-radius: 8px; margin-bottom: 30px; }
  nav a { color: #b45309; text-decoration: none; margin-right: 20px; }
</style>
`;

// Generate function page HTML
function generateFunctionPage(fn: string) {
  const seo = functionSEO[fn];
  const data = functionData[fn];
  const path = `/functions/${fn}`;
  
  const oppositeMap: Record<string, string> = {
    ni: 'ne', ne: 'ni', si: 'se', se: 'si',
    ti: 'te', te: 'ti', fi: 'fe', fe: 'fi'
  };
  const oppositeFn = oppositeMap[fn];
  const oppositeSeo = functionSEO[oppositeFn];

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
${getHead(seo.title, seo.description, path)}
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "Article",
  "headline": "${seo.name}",
  "description": "${seo.description}",
  "url": "${siteConfig.url}${path}",
  "author": { "@type": "Organization", "name": "TypeJung" },
  "publisher": { "@type": "Organization", "name": "TypeJung", "logo": { "@type": "ImageObject", "url": "${siteConfig.url}/logo.png" } },
  "mainEntityOfPage": { "@type": "WebPage", "@id": "${siteConfig.url}${path}" }
}
</script>
</head>
<body>
  <nav>
    <a href="/">Home</a>
    <a href="/learn">Learn</a>
    <a href="/assessment">Take Assessment</a>
    <a href="/pricing">Pricing</a>
  </nav>

  <div class="breadcrumb">
    <a href="/">Home</a> › <a href="/learn">Learn</a> › ${data.fullName}
  </div>

  <h1>${data.fullName}</h1>
  <p class="subtitle">${data.archetype} | ${data.category} Function | ${data.motto}</p>

  <p>${data.description}</p>

  <h2>Core Characteristics</h2>
  <ul>
    ${data.characteristics.map(c => `<li>${c}</li>`).join('\n    ')}
  </ul>

  <h2>Strengths</h2>
  <ul>
    ${data.strengths.map(s => `<li>${s}</li>`).join('\n    ')}
  </ul>

  <h2>Challenges & Growth Areas</h2>
  <ul>
    ${data.challenges.map(c => `<li>${c}</li>`).join('\n    ')}
  </ul>

  <h2>The Grip: ${data.code} Under Stress</h2>
  <p>${data.inTheGrip}</p>

  <h2>Personality Types with ${data.code}</h2>
  
  <h3>Dominant ${data.code}</h3>
  <div class="related-grid">
    ${data.dominantIn.map(type => {
      const typeKey = type.toLowerCase();
      const typeInfo = typeSEO[typeKey];
      return `<div class="related-card">
        <a href="/types/${typeKey}">${type}</a> - ${typeInfo?.name?.split(' - ')[1] || 'Personality Type'}
      </div>`;
    }).join('\n    ')}
  </div>

  <h3>Auxiliary ${data.code}</h3>
  <div class="related-grid">
    ${data.auxiliaryIn.map(type => {
      const typeKey = type.toLowerCase();
      const typeInfo = typeSEO[typeKey];
      return `<div class="related-card">
        <a href="/types/${typeKey}">${type}</a> - ${typeInfo?.name?.split(' - ')[1] || 'Personality Type'}
      </div>`;
    }).join('\n    ')}
  </div>

  <h2>Opposite Function</h2>
  <p>The opposite of ${data.fullName} is <a href="/functions/${oppositeFn}">${oppositeSeo.name}</a>. While ${data.code} focuses on ${data.category === 'Perceiving' ? 'perceiving information through ' + (fn.startsWith('n') ? 'intuition' : 'sensing') : 'making decisions through ' + (fn.startsWith('t') ? 'thinking' : 'feeling')}, ${oppositeSeo.name.split(' ')[0]} takes the opposite approach.</p>

  <div class="cta-box">
    <h3>Discover Your ${data.code} Score</h3>
    <p>Take our free 40-question assessment to see how ${data.fullName} ranks in your cognitive function profile. Get a personalized radar chart showing all 8 functions.</p>
    <p><a href="/assessment" class="btn">Take the Free Assessment</a></p>
  </div>

  <h2>Explore Other Cognitive Functions</h2>
  <div class="related-grid">
    ${['ni','ne','si','se','ti','te','fi','fe'].filter(f => f !== fn).map(f => {
      const fSeo = functionSEO[f];
      return `<div class="related-card">
        <a href="/functions/${f}">${fSeo.name}</a>
      </div>`;
    }).join('\n    ')}
  </div>

  <footer>
    <p>&copy; 2026 TypeJung. A tool for self-exploration based on Jung's Psychological Types.</p>
    <p><a href="/privacy">Privacy Policy</a> | <a href="/terms">Terms of Service</a></p>
  </footer>

  <script>
    // Redirect to React app for interactive experience
    if (window.location.hash !== '#static') {
      window.location.href = '/#' + window.location.pathname;
    }
  </script>
</body>
</html>`;

  return html;
}

// Generate type page HTML
function generateTypePage(type: string) {
  const seo = typeSEO[type];
  const data = typeData[type];
  const path = `/types/${type}`;

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
${getHead(seo.title, seo.description, path)}
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "Article",
  "headline": "${data.code} - ${data.name}",
  "description": "${seo.description}",
  "url": "${siteConfig.url}${path}",
  "author": { "@type": "Organization", "name": "TypeJung" },
  "publisher": { "@type": "Organization", "name": "TypeJung", "logo": { "@type": "ImageObject", "url": "${siteConfig.url}/logo.png" } },
  "mainEntityOfPage": { "@type": "WebPage", "@id": "${siteConfig.url}${path}" }
}
</script>
</head>
<body>
  <nav>
    <a href="/">Home</a>
    <a href="/learn">Learn</a>
    <a href="/assessment">Take Assessment</a>
    <a href="/pricing">Pricing</a>
  </nav>

  <div class="breadcrumb">
    <a href="/">Home</a> › <a href="/learn">Learn</a> › ${data.code} Personality Type
  </div>

  <h1>${data.code} - ${data.name}</h1>
  <p class="subtitle">${data.nickname} | ${data.stack.join('-')} Function Stack</p>

  <p>${data.description}</p>

  <h2>Cognitive Function Stack</h2>
  <p>The ${data.code} type uses these cognitive functions in order of development:</p>
  <ol>
    ${data.stack.map((fn, i) => {
      const fnLower = fn.toLowerCase();
      const position = i === 0 ? 'Dominant' : i === 1 ? 'Auxiliary' : i === 2 ? 'Tertiary' : 'Inferior';
      return `<li><strong><a href="/functions/${fnLower}">${fn}</a></strong> - ${position} (${functionData[fnLower].archetype})</li>`;
    }).join('\n    ')}
  </ol>

  <h2>Key Strengths</h2>
  <ul>
    ${data.strengths.map(s => `<li>${s}</li>`).join('\n    ')}
  </ul>

  <h2>Growth Challenges</h2>
  <ul>
    ${data.challenges.map(c => `<li>${c}</li>`).join('\n    ')}
  </ul>

  <h2>${data.code} in Relationships</h2>
  <p>${data.inRelationships}</p>

  <h2>Under Stress (The Grip)</h2>
  <p>${data.underStress}</p>

  <h2>Individuation Path</h2>
  <p>${data.growthPath}</p>

  <h2>Career Paths</h2>
  <ul>
    ${data.careerPaths.map(c => `<li>${c}</li>`).join('\n    ')}
  </ul>

  <h2>Well-Known ${data.code}s</h2>
  <p>${data.famousExamples.join(', ')}</p>

  <div class="cta-box">
    <h3>Are You an ${data.code}?</h3>
    <p>Take our free Jungian cognitive function assessment to discover your true type. Unlike simplified 4-letter tests, we measure all 8 functions on a spectrum.</p>
    <p><a href="/assessment" class="btn">Take the Free Assessment</a></p>
  </div>

  <h2>Related Personality Types</h2>
  <div class="related-grid">
    ${['intj','intp','entj','entp','infj','infp','enfj','enfp','istj','isfj','estj','esfj','istp','isfp','estp','esfp']
      .filter(t => t !== type)
      .slice(0, 7)
      .map(t => {
        const tData = typeData[t];
        return `<div class="related-card">
          <a href="/types/${t}">${tData.code}</a> - ${tData.name}
        </div>`;
      }).join('\n    ')}
  </div>

  <footer>
    <p>&copy; 2026 TypeJung. A tool for self-exploration based on Jung's Psychological Types.</p>
    <p><a href="/privacy">Privacy Policy</a> | <a href="/terms">Terms of Service</a></p>
  </footer>

  <script>
    if (window.location.hash !== '#static') {
      window.location.href = '/#' + window.location.pathname;
    }
  </script>
</body>
</html>`;

  return html;
}

// Main execution
console.log('🚀 Generating static HTML pages for SEO...\n');

// Generate function pages
console.log('Generating function pages...');
for (const fn of ['ni', 'ne', 'si', 'se', 'ti', 'te', 'fi', 'fe']) {
  const html = generateFunctionPage(fn);
  const path = `${__dirname}/../public/functions/${fn}/index.html`;
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, html);
  console.log(`  ✅ /functions/${fn}/index.html`);
}

// Generate type pages
console.log('\nGenerating type pages...');
for (const type of ['intj','intp','entj','entp','infj','infp','enfj','enfp','istj','isfj','estj','esfj','istp','isfp','estp','esfp']) {
  const html = generateTypePage(type);
  const path = `${__dirname}/../public/types/${type}/index.html`;
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, html);
  console.log(`  ✅ /types/${type}/index.html`);
}

console.log('\n✨ Generated 24 static HTML pages for SEO!');
console.log('\nNext steps:');
console.log('  1. Run your build process');
console.log('  2. Deploy to Vercel');
console.log('  3. Submit updated sitemap to Google Search Console');
