import React, { useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Zap, AlertTriangle, Briefcase, Heart, TrendingUp, Users, ChevronRight, Sparkles, Star } from 'lucide-react';
import { typeSEO, typeData, validTypes, functionData } from '../data/seo-config';
import { Button } from '../components/ui/Button';

type TypeCode = typeof validTypes[number];

const typeColors: Record<TypeCode, string> = {
  intj: 'from-indigo-600 to-purple-700',
  intp: 'from-blue-600 to-indigo-700',
  entj: 'from-slate-700 to-zinc-800',
  entp: 'from-yellow-500 to-orange-600',
  infj: 'from-teal-500 to-cyan-600',
  infp: 'from-rose-400 to-pink-500',
  enfj: 'from-emerald-500 to-teal-600',
  enfp: 'from-amber-400 to-orange-500',
  istj: 'from-stone-600 to-zinc-700',
  isfj: 'from-green-500 to-emerald-600',
  estj: 'from-blue-700 to-slate-800',
  esfj: 'from-pink-400 to-rose-500',
  istp: 'from-cyan-600 to-blue-700',
  isfp: 'from-violet-400 to-purple-500',
  estp: 'from-red-500 to-orange-600',
  esfp: 'from-yellow-400 to-amber-500',
};

const stackPositionLabels = ['Dominant', 'Auxiliary', 'Tertiary', 'Inferior'];
const stackPositionColors = ['bg-jung-accent', 'bg-blue-500', 'bg-amber-500', 'bg-rose-500'];

export const TypeDetailPage: React.FC = () => {
  const { type } = useParams<{ type: string }>();
  const navigate = useNavigate();

  const typeLower = type?.toLowerCase() as TypeCode | undefined;

  // Validate type code
  const isValidType = typeLower && validTypes.includes(typeLower);

  useEffect(() => {
    if (!isValidType) {
      navigate('/', { replace: true });
      return;
    }

    const seo = typeSEO[typeLower];
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

  }, [typeLower, isValidType, navigate]);

  if (!isValidType || !typeLower) {
    return null;
  }

  const seo = typeSEO[typeLower];
  const data = typeData[typeLower];

  // Prepare JSON-LD data (static content from our config)
  const jsonLdData = {
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
      "@id": `https://typejung.com/types/${typeLower}`
    },
    "keywords": `${data.code} personality, ${data.name}, ${data.stack.join(' ')} stack, Jungian type`
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-stone-50 to-white">
      {/* Hero Section */}
      <section className={`relative bg-gradient-to-br ${typeColors[typeLower]} text-white py-16 md:py-24`}>
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
              <span className="text-sm uppercase tracking-wider opacity-80">{data.nickname}</span>
              <h1 className="text-2xl md:text-4xl font-serif font-bold">
                {data.name}
              </h1>
            </div>
          </div>

          <p className="text-lg md:text-xl leading-relaxed opacity-90 max-w-2xl">
            {data.description}
          </p>
        </div>
      </section>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 py-12">

        {/* Function Stack */}
        <section className="mb-12">
          <h2 className="text-2xl font-serif font-bold text-jung-dark mb-6">Cognitive Function Stack</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {data.stack.map((func, idx) => {
              const funcLower = func.toLowerCase() as keyof typeof functionData;
              const funcInfo = functionData[funcLower];
              return (
                <Link
                  key={func}
                  to={`/functions/${funcLower}`}
                  className="group bg-white rounded-xl p-4 shadow-sm border border-stone-100 hover:shadow-md hover:border-jung-accent/30 transition-all"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <span className={`w-3 h-3 rounded-full ${stackPositionColors[idx]}`} />
                    <span className="text-xs text-stone-500 uppercase tracking-wider">
                      {stackPositionLabels[idx]}
                    </span>
                  </div>
                  <div className="font-mono text-2xl font-bold text-jung-dark group-hover:text-jung-accent transition-colors">
                    {func}
                  </div>
                  <div className="text-sm text-stone-600">
                    {funcInfo?.fullName}
                  </div>
                </Link>
              );
            })}
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

        {/* Career Paths */}
        <section className="mb-12">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
              <Briefcase className="w-5 h-5 text-blue-600" />
            </div>
            <h2 className="text-2xl font-serif font-bold text-jung-dark">Career Paths</h2>
          </div>
          <div className="flex flex-wrap gap-3">
            {data.careerPaths.map((career, idx) => (
              <span
                key={idx}
                className="px-4 py-2 bg-blue-50 text-blue-700 rounded-lg font-medium border border-blue-100"
              >
                {career}
              </span>
            ))}
          </div>
        </section>

        {/* Relationships */}
        <section className="mb-12">
          <div className="bg-gradient-to-r from-rose-50 to-pink-50 rounded-2xl p-6 md:p-8 border border-rose-100">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-rose-100 flex items-center justify-center">
                <Heart className="w-5 h-5 text-rose-600" />
              </div>
              <h2 className="text-xl font-serif font-bold text-jung-dark">In Relationships</h2>
            </div>
            <p className="text-stone-700 leading-relaxed">
              {data.inRelationships}
            </p>
          </div>
        </section>

        {/* Under Stress */}
        <section className="mb-12">
          <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-2xl p-6 md:p-8 border border-amber-100">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-amber-600" />
              </div>
              <h2 className="text-xl font-serif font-bold text-jung-dark">Under Stress</h2>
            </div>
            <p className="text-stone-700 leading-relaxed">
              {data.underStress}
            </p>
          </div>
        </section>

        {/* Growth Path */}
        <section className="mb-12">
          <div className="bg-gradient-to-r from-emerald-50 to-teal-50 rounded-2xl p-6 md:p-8 border border-emerald-100">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-emerald-600" />
              </div>
              <h2 className="text-xl font-serif font-bold text-jung-dark">Growth Path</h2>
            </div>
            <p className="text-stone-700 leading-relaxed">
              {data.growthPath}
            </p>
          </div>
        </section>

        {/* Famous Examples */}
        <section className="mb-12">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center">
              <Star className="w-5 h-5 text-purple-600" />
            </div>
            <h2 className="text-2xl font-serif font-bold text-jung-dark">Notable {data.code}s</h2>
          </div>
          <div className="flex flex-wrap gap-3">
            {data.famousExamples.map((person, idx) => (
              <span
                key={idx}
                className="px-4 py-2 bg-purple-50 text-purple-700 rounded-lg font-medium border border-purple-100"
              >
                {person}
              </span>
            ))}
          </div>
          <p className="text-sm text-stone-500 mt-4 italic">
            Note: These are commonly cited examples in the typology community, not verified assessments.
          </p>
        </section>

        {/* CTA */}
        <section className="text-center py-12 border-t border-stone-200">
          <div className="inline-flex items-center gap-2 text-jung-accent mb-4">
            <Sparkles className="w-5 h-5" />
            <span className="text-sm font-semibold uppercase tracking-wider">Discover Your Type</span>
          </div>
          <h2 className="text-2xl md:text-3xl font-serif font-bold text-jung-dark mb-4">
            Are you an {data.code}?
          </h2>
          <p className="text-stone-600 mb-8 max-w-lg mx-auto">
            Take our free assessment to measure all 8 cognitive functions and discover if {data.code} matches your profile.
          </p>
          <Button onClick={() => navigate('/assessment')} size="lg">
            Take the Free Assessment
          </Button>
        </section>

        {/* Explore Other Types */}
        <section className="pt-8 border-t border-stone-200">
          <h3 className="text-lg font-serif font-bold text-jung-dark mb-4">Explore Other Types</h3>
          <div className="grid grid-cols-4 md:grid-cols-8 gap-2">
            {validTypes.filter(t => t !== typeLower).map((t) => (
              <Link
                key={t}
                to={`/types/${t}`}
                className="px-3 py-2 bg-stone-100 text-stone-600 rounded-lg font-mono text-sm text-center hover:bg-stone-200 transition-colors"
              >
                {t.toUpperCase()}
              </Link>
            ))}
          </div>
        </section>
      </div>

      {/* JSON-LD Structured Data - static content from our config file */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdData) }}
      />
    </div>
  );
};
