import React, { useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Brain, Zap, AlertTriangle, Users, ChevronRight, Sparkles } from 'lucide-react';
import { functionSEO, functionData, validFunctions } from '../data/seo-config';
import { Button } from '../components/ui/Button';

type FunctionCode = typeof validFunctions[number];

const functionColors: Record<FunctionCode, string> = {
  ni: 'from-indigo-500 to-purple-600',
  ne: 'from-yellow-400 to-orange-500',
  si: 'from-green-500 to-teal-600',
  se: 'from-red-500 to-pink-600',
  ti: 'from-blue-500 to-cyan-600',
  te: 'from-slate-600 to-zinc-700',
  fi: 'from-rose-400 to-pink-500',
  fe: 'from-amber-400 to-yellow-500',
};

const functionIcons: Record<FunctionCode, string> = {
  ni: 'Eye',
  ne: 'Lightbulb',
  si: 'Database',
  se: 'Zap',
  ti: 'Cpu',
  te: 'BarChart',
  fi: 'Heart',
  fe: 'Users',
};

export const FunctionDetailPage: React.FC = () => {
  const { fn } = useParams<{ fn: string }>();
  const navigate = useNavigate();

  const fnLower = fn?.toLowerCase() as FunctionCode | undefined;

  // Validate function code
  const isValidFunction = fnLower && validFunctions.includes(fnLower);

  useEffect(() => {
    if (!isValidFunction) {
      navigate('/', { replace: true });
      return;
    }

    const seo = functionSEO[fnLower];
    document.title = seo.title;

    // Update meta tags
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute('content', seo.description);
    }

    // Update OG tags
    const ogTitle = document.querySelector('meta[property="og:title"]');
    const ogDescription = document.querySelector('meta[property="og:description"]');
    if (ogTitle) ogTitle.setAttribute('content', seo.title);
    if (ogDescription) ogDescription.setAttribute('content', seo.description);

  }, [fnLower, isValidFunction, navigate]);

  if (!isValidFunction || !fnLower) {
    return null;
  }

  const seo = functionSEO[fnLower];
  const data = functionData[fnLower];

  return (
    <div className="min-h-screen bg-gradient-to-b from-stone-50 to-white">
      {/* Hero Section */}
      <section className={`relative bg-gradient-to-br ${functionColors[fnLower]} text-white py-16 md:py-24`}>
        <div className="absolute inset-0 bg-black/20" />
        <div className="relative max-w-4xl mx-auto px-4">
          <Link
            to="/learn"
            className="inline-flex items-center gap-2 text-white/80 hover:text-white transition-colors mb-8"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Theory
          </Link>

          <div className="flex items-center gap-4 mb-6">
            <span className="text-5xl md:text-7xl font-mono font-bold opacity-90">
              {data.code}
            </span>
            <div className="h-16 w-px bg-white/30" />
            <div>
              <span className="text-sm uppercase tracking-wider opacity-80">{data.attitude} {data.category}</span>
              <h1 className="text-2xl md:text-4xl font-serif font-bold">
                {data.fullName}
              </h1>
            </div>
          </div>

          <p className="text-2xl md:text-3xl font-serif italic opacity-90 mb-6">
            {data.archetype}
          </p>

          <blockquote className="text-xl md:text-2xl font-serif border-l-4 border-white/50 pl-6">
            {data.motto}
          </blockquote>
        </div>
      </section>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 py-12">

        {/* Description */}
        <section className="mb-12">
          <p className="text-lg md:text-xl text-stone-700 leading-relaxed">
            {data.description}
          </p>
        </section>

        {/* Quick Facts */}
        <section className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
          <div className="bg-white rounded-xl p-4 shadow-sm border border-stone-100">
            <span className="text-xs text-stone-500 uppercase tracking-wider">Attitude</span>
            <p className="font-semibold text-jung-dark">{data.attitude}</p>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm border border-stone-100">
            <span className="text-xs text-stone-500 uppercase tracking-wider">Category</span>
            <p className="font-semibold text-jung-dark">{data.category}</p>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm border border-stone-100">
            <span className="text-xs text-stone-500 uppercase tracking-wider">Opposite</span>
            <Link to={`/functions/${data.oppositeFunction.toLowerCase()}`} className="font-semibold text-jung-accent hover:underline">
              {data.oppositeFunction}
            </Link>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm border border-stone-100">
            <span className="text-xs text-stone-500 uppercase tracking-wider">Archetype</span>
            <p className="font-semibold text-jung-dark">{data.archetype}</p>
          </div>
        </section>

        {/* Characteristics */}
        <section className="mb-12">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-full bg-jung-accent/10 flex items-center justify-center">
              <Brain className="w-5 h-5 text-jung-accent" />
            </div>
            <h2 className="text-2xl font-serif font-bold text-jung-dark">Key Characteristics</h2>
          </div>
          <div className="grid md:grid-cols-2 gap-3">
            {data.characteristics.map((char, idx) => (
              <div key={idx} className="flex items-start gap-3 bg-white rounded-lg p-4 shadow-sm border border-stone-100">
                <ChevronRight className="w-5 h-5 text-jung-accent flex-shrink-0 mt-0.5" />
                <span className="text-stone-700">{char}</span>
              </div>
            ))}
          </div>
        </section>

        {/* Strengths & Challenges */}
        <section className="grid md:grid-cols-2 gap-8 mb-12">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                <Zap className="w-5 h-5 text-green-600" />
              </div>
              <h2 className="text-xl font-serif font-bold text-jung-dark">Strengths</h2>
            </div>
            <ul className="space-y-3">
              {data.strengths.map((strength, idx) => (
                <li key={idx} className="flex items-start gap-3">
                  <span className="w-6 h-6 rounded-full bg-green-100 text-green-600 flex items-center justify-center text-sm font-bold flex-shrink-0">
                    {idx + 1}
                  </span>
                  <span className="text-stone-700">{strength}</span>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-amber-600" />
              </div>
              <h2 className="text-xl font-serif font-bold text-jung-dark">Challenges</h2>
            </div>
            <ul className="space-y-3">
              {data.challenges.map((challenge, idx) => (
                <li key={idx} className="flex items-start gap-3">
                  <span className="w-6 h-6 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center text-sm font-bold flex-shrink-0">
                    {idx + 1}
                  </span>
                  <span className="text-stone-700">{challenge}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* The Grip */}
        <section className="mb-12">
          <div className="bg-gradient-to-r from-rose-50 to-orange-50 rounded-2xl p-6 md:p-8 border border-rose-100">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-rose-100 flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-rose-600" />
              </div>
              <h2 className="text-xl font-serif font-bold text-jung-dark">In The Grip (Under Stress)</h2>
            </div>
            <p className="text-stone-700 leading-relaxed">
              {data.inTheGrip}
            </p>
          </div>
        </section>

        {/* Types with this function */}
        <section className="mb-12">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-full bg-jung-accent/10 flex items-center justify-center">
              <Users className="w-5 h-5 text-jung-accent" />
            </div>
            <h2 className="text-2xl font-serif font-bold text-jung-dark">Types Using {data.code}</h2>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-sm uppercase tracking-wider text-stone-500 mb-3">Dominant Function</h3>
              <div className="flex flex-wrap gap-2">
                {data.dominantIn.map((type) => (
                  <Link
                    key={type}
                    to={`/types/${type.toLowerCase()}`}
                    className="px-4 py-2 bg-jung-accent text-white rounded-lg font-mono font-bold hover:bg-jung-accent/90 transition-colors"
                  >
                    {type}
                  </Link>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-sm uppercase tracking-wider text-stone-500 mb-3">Auxiliary Function</h3>
              <div className="flex flex-wrap gap-2">
                {data.auxiliaryIn.map((type) => (
                  <Link
                    key={type}
                    to={`/types/${type.toLowerCase()}`}
                    className="px-4 py-2 bg-stone-200 text-stone-700 rounded-lg font-mono font-bold hover:bg-stone-300 transition-colors"
                  >
                    {type}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="text-center py-12 border-t border-stone-200">
          <div className="inline-flex items-center gap-2 text-jung-accent mb-4">
            <Sparkles className="w-5 h-5" />
            <span className="text-sm font-semibold uppercase tracking-wider">Discover Your Profile</span>
          </div>
          <h2 className="text-2xl md:text-3xl font-serif font-bold text-jung-dark mb-4">
            Want to know your {data.code} score?
          </h2>
          <p className="text-stone-600 mb-8 max-w-lg mx-auto">
            Take our free assessment to measure all 8 cognitive functions and discover your unique psychological profile.
          </p>
          <Button onClick={() => navigate('/assessment')} size="lg">
            Take the Free Assessment
          </Button>
        </section>

        {/* Explore Other Functions */}
        <section className="pt-8 border-t border-stone-200">
          <h3 className="text-lg font-serif font-bold text-jung-dark mb-4">Explore Other Functions</h3>
          <div className="flex flex-wrap gap-2">
            {validFunctions.filter(f => f !== fnLower).map((func) => (
              <Link
                key={func}
                to={`/functions/${func}`}
                className="px-3 py-1.5 bg-stone-100 text-stone-600 rounded-lg font-mono text-sm hover:bg-stone-200 transition-colors"
              >
                {func.toUpperCase()}
              </Link>
            ))}
          </div>
        </section>
      </div>

      {/* JSON-LD Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Article",
            "headline": seo.title,
            "description": seo.description,
            "author": {
              "@type": "Organization",
              "name": "TypeJung"
            },
            "publisher": {
              "@type": "Organization",
              "name": "TypeJung",
              "url": "https://typejung.com"
            },
            "mainEntityOfPage": {
              "@type": "WebPage",
              "@id": `https://typejung.com/functions/${fnLower}`
            },
            "keywords": seo.keywords.join(", ")
          })
        }}
      />
    </div>
  );
};
