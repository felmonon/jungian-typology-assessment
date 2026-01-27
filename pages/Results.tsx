import React, { useEffect, useState, useRef, useCallback, Suspense } from 'react';
import { useNavigate } from 'react-router-dom';
import { ResultsAnalysis, FunctionScore, Stack } from '../types';
import { FUNCTION_DESCRIPTIONS, STACK_POSITIONS, THE_GRIP, TYPE_PHENOMENOLOGY, INDIVIDUATION_GUIDANCE, RELATIONSHIPS_INSIGHTS, CAREER_GUIDANCE, ACTIVE_IMAGINATION_PROMPTS, DREAM_JOURNALING_TEMPLATE } from '../data/questions';
import { Button } from '../components/ui/Button';
import { TierGate } from '../components/TierGate';
import { Download, RefreshCcw, Layers, ArrowDown, Loader2, BookOpen, AlertTriangle, Compass, History, Eye, Trash2, ChevronDown, ChevronUp, X, Sparkles, Heart, Briefcase, Moon, Brain, Crown } from 'lucide-react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { useAuth } from '../hooks/use-auth';
import { usePremiumStatus } from '../hooks/use-premium-status';
import { useAiAnalysis } from '../hooks/use-ai-analysis';
import { FormattedText } from '../components/FormattedText';
import { ChatBot } from '../components/ChatBot';
import { 
  ResultsHeader, 
  FunctionChart, 
  ScoreBreakdown, 
  QuickInsights, 
  ShareSection,
  ResultsLoading, 
  ResultsError, 
  AuthRequired,
  ResultsSkeleton
} from '../components/results';
import { 
  assessmentResultsSchema, 
  safeParseLocalStorage, 
  safeRemoveLocalStorage,
  STORAGE_KEYS,
  ValidatedAssessmentResults 
} from '../lib/validation';

// Lazy load Instagram story card (heavy component)
const InstagramStoryCard = React.lazy(() => import('../components/InstagramStoryCard').then(m => ({ default: m.InstagramStoryCard })));

interface SavedResult {
  id: string;
  scores: FunctionScore[];
  stack: Stack;
  attitudeScore: string;
  isUndifferentiated: string;
  shareSlug: string | null;
  createdAt: string;
}

type ResultsState = 
  | { status: 'loading' }
  | { status: 'auth-required' }
  | { status: 'error'; message: string }
  | { status: 'no-results' }
  | { status: 'ready'; results: ValidatedAssessmentResults };

export const Results: React.FC = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const { tier, isPremium, isLoading: premiumLoading } = usePremiumStatus();
  
  const [state, setState] = useState<ResultsState>({ status: 'loading' });
  const [shareSlug, setShareSlug] = useState<string | null>(null);
  const [historyResults, setHistoryResults] = useState<SavedResult[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [viewingHistoricalResult, setViewingHistoricalResult] = useState<string | null>(null);
  const [deletingResultId, setDeletingResultId] = useState<string | null>(null);
  const [showInstagramPreview, setShowInstagramPreview] = useState(false);
  const [isGeneratingStory, setIsGeneratingStory] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [isSendingEmail, setIsSendingEmail] = useState(false);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  
  const contentRef = useRef<HTMLDivElement>(null);
  const instagramCardRef = useRef<HTMLDivElement>(null);
  const saveAttemptedRef = useRef(false);

  const {
    freeAnalysis,
    premiumAnalysis,
    isLoadingFree,
    isLoadingPremium,
    freeError,
    premiumError,
    fetchFreeAnalysis,
    fetchPremiumAnalysis,
  } = useAiAnalysis();
  const aiAnalysisFetchedRef = useRef(false);

  const hasAccess = useCallback((requiredTier: 'insight' | 'mastery') => {
    if (requiredTier === 'insight') return tier === 'insight' || tier === 'mastery';
    if (requiredTier === 'mastery') return tier === 'mastery';
    return false;
  }, [tier]);

  // Load results from localStorage
  const loadResults = useCallback(() => {
    const saved = safeParseLocalStorage(STORAGE_KEYS.RESULTS, assessmentResultsSchema, null);
    
    if (saved) {
      setState({ status: 'ready', results: saved });
    } else {
      // Try to load raw results (legacy support)
      const raw = localStorage.getItem(STORAGE_KEYS.RESULTS);
      if (raw) {
        try {
          const parsed = JSON.parse(raw);
          const validated = assessmentResultsSchema.safeParse(parsed);
          if (validated.success) {
            setState({ status: 'ready', results: validated.data });
          } else {
            setState({ status: 'error', message: 'Your saved results appear to be corrupted. Please retake the assessment.' });
          }
        } catch {
          setState({ status: 'error', message: 'Unable to load your results. Please retake the assessment.' });
        }
      } else {
        setState({ status: 'no-results' });
      }
    }
  }, []);

  // Initial load
  useEffect(() => {
    if (!authLoading) {
      if (!user) {
        setState({ status: 'auth-required' });
      } else {
        loadResults();
      }
    }
  }, [authLoading, user, loadResults]);

  const fetchHistory = useCallback(async () => {
    if (!isAuthenticated) return;
    setIsLoadingHistory(true);
    try {
      const response = await fetch('/api/results', { credentials: 'include' });
      if (response.ok) {
        const data = await response.json();
        setHistoryResults(data);
      }
    } catch (error) {
      console.error('Failed to fetch history:', error);
    } finally {
      setIsLoadingHistory(false);
    }
  }, [isAuthenticated]);

  const saveResultToDb = useCallback(async (resultData: ValidatedAssessmentResults) => {
    if (!isAuthenticated || saveAttemptedRef.current || viewingHistoricalResult) return;
    saveAttemptedRef.current = true;

    try {
      const response = await fetch('/api/results', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          scores: resultData.scores,
          stack: resultData.stack,
          attitudeScore: resultData.attitudeScore,
          isUndifferentiated: resultData.isUndifferentiated,
        }),
      });

      if (response.ok) {
        const savedResult = await response.json();
        setShareSlug(savedResult.shareSlug);
        localStorage.setItem(STORAGE_KEYS.SHARE_SLUG, savedResult.shareSlug);
        fetchHistory();
      }
    } catch (error) {
      console.error('Failed to save result:', error);
      saveAttemptedRef.current = false;
    }
  }, [isAuthenticated, viewingHistoricalResult, fetchHistory]);

  const loadHistoricalResult = useCallback((savedResult: SavedResult) => {
    const loadedResults: ValidatedAssessmentResults = {
      scores: savedResult.scores,
      stack: savedResult.stack,
      dominant: savedResult.stack.dominant,
      inferior: savedResult.stack.inferior,
      attitudeScore: parseFloat(savedResult.attitudeScore),
      isUndifferentiated: savedResult.isUndifferentiated === 'true',
      differentiation: 0,
      auxiliary: savedResult.stack.auxiliary,
    };
    setState({ status: 'ready', results: loadedResults });
    setShareSlug(savedResult.shareSlug);
    setViewingHistoricalResult(savedResult.id);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const deleteResult = useCallback(async (id: string) => {
    if (!confirm('Are you sure you want to delete this result?')) return;

    setDeletingResultId(id);
    try {
      const response = await fetch(`/api/results/${id}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      if (response.ok) {
        setHistoryResults(prev => prev.filter(r => r.id !== id));
        if (viewingHistoricalResult === id) {
          setViewingHistoricalResult(null);
          loadResults();
        }
      }
    } catch (error) {
      console.error('Failed to delete result:', error);
    } finally {
      setDeletingResultId(null);
    }
  }, [viewingHistoricalResult, loadResults]);

  // Save to DB when ready
  useEffect(() => {
    if (state.status === 'ready' && isAuthenticated && !saveAttemptedRef.current && !viewingHistoricalResult) {
      saveResultToDb(state.results);
    }
  }, [state, isAuthenticated, viewingHistoricalResult, saveResultToDb]);

  // Load share slug
  useEffect(() => {
    const savedSlug = localStorage.getItem(STORAGE_KEYS.SHARE_SLUG);
    if (savedSlug && !viewingHistoricalResult) {
      setShareSlug(savedSlug);
    }
  }, [viewingHistoricalResult]);

  // Fetch history
  useEffect(() => {
    if (isAuthenticated) {
      fetchHistory();
    }
  }, [isAuthenticated, fetchHistory]);

  // Fetch AI analysis
  useEffect(() => {
    if (state.status === 'ready' && !aiAnalysisFetchedRef.current && !isLoadingFree) {
      aiAnalysisFetchedRef.current = true;
      const analysisInput = {
        scores: state.results.scores,
        stack: state.results.stack,
        attitudeScore: state.results.attitudeScore,
        isUndifferentiated: state.results.isUndifferentiated,
      };
      fetchFreeAnalysis(analysisInput);
      if (isPremium && !premiumLoading) {
        fetchPremiumAnalysis(analysisInput);
      }
    }
  }, [state, fetchFreeAnalysis, fetchPremiumAnalysis, isPremium, premiumLoading, isLoadingFree]);

  // Retry premium analysis if needed
  useEffect(() => {
    if (isPremium && state.status === 'ready' && !premiumAnalysis && !isLoadingPremium && !premiumError) {
      const analysisInput = {
        scores: state.results.scores,
        stack: state.results.stack,
        attitudeScore: state.results.attitudeScore,
        isUndifferentiated: state.results.isUndifferentiated,
      };
      fetchPremiumAnalysis(analysisInput);
    }
  }, [isPremium, state, premiumAnalysis, isLoadingPremium, premiumError, fetchPremiumAnalysis]);

  const generatePDF = useCallback(async () => {
    if (!contentRef.current || state.status !== 'ready') return;

    setIsGeneratingPdf(true);

    try {
      const content = contentRef.current;
      const canvas = await html2canvas(content, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#FAF9F7',
        windowWidth: 1200,
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      });

      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      const imgWidth = canvas.width;
      const imgHeight = canvas.height;

      const ratio = pdfWidth / imgWidth;
      const scaledHeight = imgHeight * ratio;

      let heightLeft = scaledHeight;
      let position = 0;
      let page = 0;

      while (heightLeft > 0) {
        if (page > 0) {
          pdf.addPage();
        }

        pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, scaledHeight);
        heightLeft -= pdfHeight;
        position -= pdfHeight;
        page++;
      }

      const dominantFunction = state.results.stack.dominant.function;
      pdf.save(`jungian-profile-${dominantFunction}.pdf`);
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Failed to generate PDF. Please try again.');
    } finally {
      setIsGeneratingPdf(false);
    }
  }, [state]);

  const generateInstagramStory = useCallback(async () => {
    if (!instagramCardRef.current || state.status !== 'ready') return;

    setIsGeneratingStory(true);

    try {
      const canvas = await html2canvas(instagramCardRef.current, {
        scale: 1,
        useCORS: true,
        logging: false,
        backgroundColor: null,
        width: 1080,
        height: 1920,
      });

      const blob = await new Promise<Blob>((resolve, reject) => {
        canvas.toBlob((b) => {
          if (b) resolve(b);
          else reject(new Error('Failed to create image'));
        }, 'image/png');
      });

      const file = new File([blob], `jungian-story-${state.results.stack.dominant.function}.png`, { type: 'image/png' });

      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({
          files: [file],
          title: 'My Jungian Typology Results',
          text: `I'm a ${FUNCTION_DESCRIPTIONS[state.results.stack.dominant.function].title}! Discover your cognitive function profile.`,
        });
        setShowInstagramPreview(false);
      } else {
        const link = document.createElement('a');
        link.download = file.name;
        link.href = URL.createObjectURL(blob);
        link.click();
        URL.revokeObjectURL(link.href);
        setShowInstagramPreview(false);
      }
    } catch (error) {
      if ((error as Error).name !== 'AbortError') {
        console.error('Error sharing story:', error);
        alert('Failed to share. Please try again.');
      }
    } finally {
      setIsGeneratingStory(false);
    }
  }, [state]);

  const handleRetake = useCallback(() => {
    safeRemoveLocalStorage(STORAGE_KEYS.PROGRESS);
    safeRemoveLocalStorage(STORAGE_KEYS.RESULTS);
    navigate('/assessment');
  }, [navigate]);

  // Render states
  if (authLoading || state.status === 'loading') {
    return <ResultsSkeleton />;
  }

  if (state.status === 'auth-required') {
    return <AuthRequired onLoginClick={() => navigate('/auth')} />;
  }

  if (state.status === 'error') {
    return (
      <ResultsError 
        message={state.message} 
        onRetry={() => {
          saveAttemptedRef.current = false;
          loadResults();
        }} 
      />
    );
  }

  if (state.status === 'no-results') {
    return (
      <ResultsError 
        message="No assessment results found. Please complete the assessment first." 
        onRetry={handleRetake}
      />
    );
  }

  const results = state.results;
  const dominantFunc = results.stack.dominant.function;
  const grip = THE_GRIP[dominantFunc as keyof typeof THE_GRIP];
  const typePhenomenology = TYPE_PHENOMENOLOGY[dominantFunc];

  return (
    <div className="editorial-container py-12 md:py-16">
      <div ref={contentRef} className="bg-jung-surface p-6 md:p-8 rounded-2xl">
        <ResultsHeader results={results} />
        <FunctionChart results={results} />
        <ScoreBreakdown results={results} />
        <QuickInsights results={results} />

        {/* Stack Explanation Note */}
        <div className="mb-12 p-5 bg-jung-surface rounded-xl border border-jung-border">
          <p className="text-body text-sm text-jung-secondary">
            <strong>Note:</strong> Your stack is <em>theoretical</em>—based on Jung's principle of opposites and compensation.
            Your empirical scores may vary. Discrepancies aren't errors—they're opportunities for reflection:
            "Why might I avoid this function?"
          </p>
        </div>

        {/* AI-Powered Personalized Analysis (Free) */}
        <section className="mb-12 bg-gradient-to-br from-purple-50/80 to-indigo-50/80 rounded-2xl border border-purple-200/50 p-6 md:p-8">
          <div className="flex items-center gap-4 mb-6">
            <div className="p-3 bg-purple-100 rounded-xl">
              <Brain className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <h2 className="text-heading text-xl md:text-2xl text-purple-900">AI-Powered Personal Insight</h2>
              <p className="text-body text-sm text-purple-600">Personalized analysis generated just for you</p>
            </div>
          </div>

          {isLoadingFree ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-purple-500 mr-3" />
              <span className="text-body text-purple-600">Generating your personalized insight...</span>
            </div>
          ) : freeError ? (
            <div className="flex items-center gap-3 text-red-600 py-6">
              <AlertTriangle className="w-6 h-6" />
              <span>Unable to generate analysis. Please refresh to try again.</span>
            </div>
          ) : freeAnalysis ? (
            <div className="prose-editorial">
              <FormattedText text={freeAnalysis} />
            </div>
          ) : (
            <div className="text-body text-jung-muted italic py-6">
              Loading personalized analysis...
            </div>
          )}
        </section>

        {/* Conversion Trigger for Free Users */}
        {tier === 'free' && (
          <div className="mb-12 bg-gradient-to-r from-jung-accent/10 to-jung-accent-hover/10 rounded-2xl p-6 md:p-8 border border-jung-accent/20">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-jung-accent/20 rounded-full">
                  <Sparkles className="w-7 h-7 text-jung-accent" />
                </div>
                <div>
                  <h3 className="text-heading text-lg text-jung-dark">Your full 8-function analysis is ready</h3>
                  <p className="text-body text-sm text-jung-muted">Unlock detailed insights into your archetypal stack, relationships, career alignment, and more.</p>
                </div>
              </div>
              <Button
                onClick={() => {
                  const element = document.getElementById('insight-content');
                  element?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="whitespace-nowrap"
              >
                Unlock it →
              </Button>
            </div>
          </div>
        )}

        {/* Conversion Trigger for Insight Users */}
        {tier === 'insight' && (
          <div className="mb-12 bg-gradient-to-r from-purple-50 to-indigo-50 rounded-2xl p-6 md:p-8 border border-purple-200">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-purple-100 rounded-full">
                  <Crown className="w-7 h-7 text-purple-600" />
                </div>
                <div>
                  <h3 className="text-heading text-lg text-purple-900">Questions about your results?</h3>
                  <p className="text-body text-sm text-purple-700">Chat with your AI Type Coach for personalized guidance and deeper exploration.</p>
                </div>
              </div>
              <Button
                onClick={() => {
                  const element = document.getElementById('mastery-content');
                  element?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="whitespace-nowrap bg-purple-600 hover:bg-purple-700"
              >
                Chat with AI Coach →
              </Button>
            </div>
          </div>
        )}

        {/* INSIGHT TIER CONTENT */}
        <div id="insight-content">
          <div className="flex items-center justify-center gap-3 mb-10">
            <div className="h-px flex-1 bg-gradient-to-r from-transparent via-jung-accent/30 to-transparent" />
            <div className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-jung-accent to-jung-accent-hover rounded-full shadow-md shadow-jung-accent/20">
              <Sparkles className="w-4 h-4 text-white" />
              <span className="text-xs font-bold uppercase tracking-wider text-white">Insight Analysis</span>
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <div className="h-px flex-1 bg-gradient-to-r from-transparent via-jung-accent/30 to-transparent" />
          </div>

          <TierGate requiredTier="insight" currentTier={tier} featureDescription="Unlock complete type analysis including archetypes, relationships, and career guidance">
            {/* Type Phenomenology & Attitude */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-12 mb-16">
              <TypePhenomenologyCard typePhenomenology={typePhenomenology} />
              <AttitudeCard attitudeScore={results.attitudeScore} />
            </div>

            {/* Archetypal Stack */}
            <ArchetypalStackSection stack={results.stack as Stack} />

            {/* The Grip */}
            <GripSection grip={grip} />

            {/* Relationships */}
            <RelationshipsSection dominantFunc={dominantFunc} />

            {/* Career */}
            <CareerSection dominantFunc={dominantFunc} />
          </TierGate>
        </div>

        {/* MASTERY TIER CONTENT */}
        <div id="mastery-content">
          <div className="flex items-center justify-center gap-3 mb-10 mt-16">
            <div className="h-px flex-1 bg-gradient-to-r from-transparent via-purple-300 to-transparent" />
            <div className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-full shadow-md shadow-purple-500/20">
              <Crown className="w-4 h-4 text-white" />
              <span className="text-xs font-bold uppercase tracking-wider text-white">Mastery Tools</span>
              <Crown className="w-4 h-4 text-white" />
            </div>
            <div className="h-px flex-1 bg-gradient-to-r from-transparent via-purple-300 to-transparent" />
          </div>

          <TierGate requiredTier="mastery" currentTier={tier} featureDescription="Unlock advanced tools including AI Type Coach, individuation roadmap, and shadow work exercises">
            <IndividuationSection stack={results.stack as Stack} />
            <ActiveImaginationSection />
            <DreamJournalingSection />
          </TierGate>
        </div>

        {/* AI Deep Analysis */}
        <TierGate requiredTier="insight" currentTier={tier} featureDescription="Unlock AI-powered personalized analysis with detailed insights">
          <AiDeepAnalysis 
            isLoading={isLoadingPremium}
            error={premiumError}
            analysis={premiumAnalysis}
          />
        </TierGate>

        {/* Footer */}
        <div className="text-center text-xs text-jung-muted pt-8 border-t border-jung-border">
          <p>Based on the typological work of Carl Gustav Jung (Psychological Types, CW Vol. 6)</p>
          <p className="mt-2 italic font-serif">"The meeting of two personalities is like the contact of two chemical substances: if there is any reaction, both are transformed."</p>
        </div>
      </div>

      {/* Actions */}
      <div className="border-t border-jung-border pt-10 mt-10">
        <div className="flex flex-col sm:flex-row justify-center gap-4 mb-8">
          {hasAccess('insight') && (
            <Button onClick={generatePDF} disabled={isGeneratingPdf} className="w-full sm:w-auto">
              {isGeneratingPdf ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Generating PDF...
                </>
              ) : (
                <>
                  <Download className="mr-2 h-4 w-4" /> Download PDF
                </>
              )}
            </Button>
          )}
          <Button variant="outline" onClick={handleRetake} className="w-full sm:w-auto">
            <RefreshCcw className="mr-2 h-4 w-4" /> Retake Assessment
          </Button>
        </div>

        <ShareSection 
          results={results} 
          shareSlug={shareSlug} 
          onInstagramClick={() => setShowInstagramPreview(true)} 
        />

        {isAuthenticated && (
          <AssessmentHistory
            historyResults={historyResults}
            isLoading={isLoadingHistory}
            showHistory={showHistory}
            viewingHistoricalResult={viewingHistoricalResult}
            deletingResultId={deletingResultId}
            onToggle={() => setShowHistory(!showHistory)}
            onLoad={loadHistoricalResult}
            onDelete={deleteResult}
          />
        )}
      </div>

      {/* Instagram Preview Modal */}
      {showInstagramPreview && (
        <InstagramPreviewModal
          onClose={() => setShowInstagramPreview(false)}
          onShare={generateInstagramStory}
          isGenerating={isGeneratingStory}
          instagramCardRef={instagramCardRef}
          results={results}
        />
      )}

      {isPremium && results && (
        <ChatBot
          userProfile={{
            dominantFunction: results.stack.dominant.function,
            auxiliaryFunction: results.stack.auxiliary.function,
            tertiaryFunction: results.stack.tertiary.function,
            inferiorFunction: results.stack.inferior.function,
            scores: results.scores.map(s => ({ function: s.function, score: s.score })),
            attitudeScore: results.attitudeScore,
          }}
        />
      )}
    </div>
  );
};

// Sub-components for cleaner organization
const TypePhenomenologyCard: React.FC<{ typePhenomenology: any }> = ({ typePhenomenology }) => (
  <div className="card-elevated p-6 md:p-8 relative overflow-hidden">
    <div className="absolute top-0 right-0 bg-jung-accent text-white text-[10px] font-bold uppercase tracking-wider px-3 py-1.5 rounded-bl-lg">
      Premium
    </div>
    <h3 className="text-heading text-lg mb-6 flex items-center gap-2">
      <BookOpen className="w-5 h-5 text-jung-accent" />
      {typePhenomenology.typeName}
    </h3>
    <div className="space-y-4 text-body text-sm">
      <div>
        <span className="font-semibold text-jung-dark">Focus: </span>
        <span className="text-jung-secondary">{typePhenomenology.focus}</span>
      </div>
      <div>
        <span className="font-semibold text-jung-dark">Behavior: </span>
        <span className="text-jung-secondary">{typePhenomenology.behavior}</span>
      </div>
      <div>
        <span className="font-semibold text-jung-dark">Historical Parallel: </span>
        <span className="text-jung-secondary italic">{typePhenomenology.historicalExample}</span>
      </div>
    </div>
  </div>
);

const AttitudeCard: React.FC<{ attitudeScore: number }> = ({ attitudeScore }) => {
  const attitude = attitudeScore > 0 ? { type: 'Extraversion', desc: 'E' } : { type: 'Introversion', desc: 'I' };
  return (
    <div className="bg-jung-surface p-6 md:p-8 rounded-xl border-l-4 border-jung-accent">
      <h3 className="text-heading text-xl mb-3">
        General Attitude: {attitude.type}
      </h3>
      <p className="text-body text-jung-secondary text-sm mb-6">
        Your energy naturally flows {attitudeScore > 0 ? 'outward toward the external world' : 'inward toward your inner experience'}.
      </p>
    </div>
  );
};

const ArchetypalStackSection: React.FC<{ stack: Stack }> = ({ stack }) => (
  <section className="mb-16">
    <div className="flex items-start sm:items-center gap-4 mb-8 border-b border-jung-border pb-4">
      <div className="w-12 h-12 rounded-full bg-jung-accent/10 flex items-center justify-center flex-shrink-0">
        <Layers className="w-6 h-6 text-jung-accent" />
      </div>
      <div>
        <h2 className="text-heading text-2xl md:text-3xl">The Archetypal Stack</h2>
        <p className="text-body text-sm text-jung-muted">The hierarchy of psychic functions from conscious to unconscious</p>
      </div>
    </div>

    <p className="text-body text-jung-secondary max-w-3xl mb-10">
      {STACK_POSITIONS.dominant.description.split('.')[0]}. This stack represents the journey from your most conscious, developed self (the Hero) to the primitive, unconscious doorway to the Self (the Anima/Animus).
    </p>

    <div className="space-y-6">
      {/* Dominant */}
      <StackCard 
        position={stack.dominant} 
        positionInfo={STACK_POSITIONS.dominant}
        variant="dominant"
      />
      <div className="flex justify-center py-2 text-jung-border"><ArrowDown className="w-6 h-6" /></div>
      
      {/* Auxiliary */}
      <StackCard 
        position={stack.auxiliary} 
        positionInfo={STACK_POSITIONS.auxiliary}
        variant="auxiliary"
      />
      <div className="flex justify-center py-2 text-jung-border"><ArrowDown className="w-6 h-6" /></div>
      
      {/* Tertiary */}
      <StackCard 
        position={stack.tertiary} 
        positionInfo={STACK_POSITIONS.tertiary}
        variant="tertiary"
      />
      <div className="flex justify-center py-2 text-jung-border"><ArrowDown className="w-6 h-6" /></div>
      
      {/* Inferior */}
      <div className="bg-jung-dark rounded-xl shadow-lg overflow-hidden text-jung-surface">
        <div className="p-6 md:p-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
            <div>
              <span className="text-ui text-xs font-bold tracking-widest uppercase text-jung-surface/60 mb-2 block">
                {STACK_POSITIONS.inferior.archetype} • {STACK_POSITIONS.inferior.name}
              </span>
              <h3 className="text-xl md:text-2xl font-serif font-bold text-white">
                {FUNCTION_DESCRIPTIONS[stack.inferior.function].title} ({stack.inferior.function})
              </h3>
            </div>
            <div className="mt-3 md:mt-0 px-4 py-2 bg-white/10 rounded-lg text-jung-surface/80 font-mono text-sm font-bold">
              Score: {stack.inferior.score}
            </div>
          </div>
          <p className="text-jung-surface/80 mb-4 leading-relaxed">
            {STACK_POSITIONS.inferior.description}
          </p>
          <p className="text-jung-surface/60 text-sm italic font-serif">
            "{FUNCTION_DESCRIPTIONS[stack.inferior.function].quote}"
          </p>
        </div>
      </div>
    </div>
  </section>
);

const StackCard: React.FC<{ 
  position: any; 
  positionInfo: any; 
  variant: 'dominant' | 'auxiliary' | 'tertiary';
}> = ({ position, positionInfo, variant }) => {
  const variants = {
    dominant: { border: 'border-jung-accent', text: 'text-jung-accent', bg: 'bg-jung-accent/10' },
    auxiliary: { border: 'border-jung-secondary', text: 'text-jung-secondary', bg: 'bg-jung-surface' },
    tertiary: { border: 'border-jung-muted', text: 'text-jung-muted', bg: 'bg-jung-surface opacity-90' },
  };
  const v = variants[variant];

  return (
    <div className={`card-elevated rounded-xl border-l-8 ${v.border} overflow-hidden ${variant === 'tertiary' ? 'opacity-90' : ''}`}>
      <div className="p-6 md:p-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4">
          <div>
            <span className={`text-ui text-xs font-bold tracking-widest uppercase ${v.text} mb-2 block`}>
              {positionInfo.archetype} • {positionInfo.name}
            </span>
            <h3 className={`text-heading text-lg ${variant === 'dominant' ? 'md:text-xl' : ''} ${variant === 'tertiary' ? 'text-jung-secondary' : ''}`}>
              {FUNCTION_DESCRIPTIONS[position.function].title} ({position.function})
            </h3>
          </div>
          <div className={`mt-3 md:mt-0 px-4 py-2 ${v.bg} rounded-lg text-jung-muted font-mono text-sm font-bold`}>
            Score: {position.score}
          </div>
        </div>
        {variant === 'dominant' ? (
          <>
            <p className="text-body text-jung-secondary mb-6">{FUNCTION_DESCRIPTIONS[position.function].desc}</p>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="bg-emerald-50/50 p-5 rounded-xl border border-emerald-200/50">
                <h4 className="text-ui text-sm font-semibold text-emerald-800 mb-2">Positive Manifestation</h4>
                <p className="text-body text-sm text-jung-secondary">{FUNCTION_DESCRIPTIONS[position.function].positive}</p>
              </div>
              <div className="bg-red-50/50 p-5 rounded-xl border border-red-200/50">
                <h4 className="text-ui text-sm font-semibold text-red-800 mb-2">Shadow Manifestation</h4>
                <p className="text-body text-sm text-jung-secondary">{FUNCTION_DESCRIPTIONS[position.function].negative}</p>
              </div>
            </div>
          </>
        ) : (
          <p className="text-body text-sm text-jung-secondary mb-3">{positionInfo.description}</p>
        )}
      </div>
    </div>
  );
};

const GripSection: React.FC<{ grip: any }> = ({ grip }) => (
  <section className="mb-16">
    <div className="flex items-start sm:items-center gap-4 mb-8 border-b border-jung-border pb-4">
      <div className="w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center flex-shrink-0">
        <AlertTriangle className="w-6 h-6 text-amber-600" />
      </div>
      <div>
        <h2 className="text-heading text-2xl md:text-3xl">The Grip</h2>
        <p className="text-body text-sm text-jung-muted">When the Inferior Function Takes Over Under Stress</p>
      </div>
    </div>

    <div className="bg-amber-50/50 border border-amber-200/50 rounded-2xl p-6 md:p-8 mb-8">
      <p className="text-body text-jung-secondary mb-6">
        Under extreme stress, fatigue, or when your dominant function fails repeatedly, you may fall into "The Grip" — a state where your inferior function ({grip.inferiorFunction}) erupts in its most primitive, undifferentiated form.
      </p>
      <div className="bg-jung-surface rounded-xl p-5 border border-amber-200/50">
        <h4 className="text-ui font-semibold text-amber-800 mb-3">What The Grip Looks Like For You:</h4>
        <p className="text-body text-sm text-jung-secondary">{grip.gripDescription}</p>
      </div>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div className="card-elevated p-5">
        <h4 className="text-ui text-xs font-semibold uppercase tracking-wide text-jung-muted mb-3">Normal State</h4>
        <p className="text-body text-sm text-jung-secondary">{grip.normalState}</p>
      </div>
      <div className="card-elevated p-5">
        <h4 className="text-ui text-xs font-semibold uppercase tracking-wide text-jung-muted mb-3">Common Triggers</h4>
        <p className="text-body text-sm text-jung-secondary">{grip.triggers}</p>
      </div>
      <div className="card-elevated p-5">
        <h4 className="text-ui text-xs font-semibold uppercase tracking-wide text-jung-muted mb-3">Path to Recovery</h4>
        <p className="text-body text-sm text-jung-secondary">{grip.recovery}</p>
      </div>
    </div>
  </section>
);

const RelationshipsSection: React.FC<{ dominantFunc: string }> = ({ dominantFunc }) => (
  <section className="mb-16">
    <div className="flex items-start sm:items-center gap-4 mb-8 border-b border-jung-border pb-4">
      <div className="w-12 h-12 rounded-full bg-rose-100 flex items-center justify-center flex-shrink-0">
        <Heart className="w-6 h-6 text-rose-500" />
      </div>
      <div>
        <h2 className="text-heading text-2xl md:text-3xl">Relationships & Compatibility</h2>
        <p className="text-body text-sm text-jung-muted">How your dominant function shapes your connections</p>
      </div>
    </div>

    <div className="card-elevated p-6 md:p-8 relative overflow-hidden">
      <div className="absolute top-0 right-0 bg-jung-accent text-white text-[10px] font-bold uppercase tracking-wider px-3 py-1.5 rounded-bl-lg">
        Premium
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-emerald-50/50 rounded-xl p-5 border border-emerald-200/50">
          <h4 className="text-ui font-semibold text-emerald-800 mb-3">Relationship Strengths</h4>
          <p className="text-body text-sm text-jung-secondary">{RELATIONSHIPS_INSIGHTS[dominantFunc]?.strengths}</p>
        </div>
        <div className="bg-amber-50/50 rounded-xl p-5 border border-amber-200/50">
          <h4 className="text-ui font-semibold text-amber-800 mb-3">Relationship Challenges</h4>
          <p className="text-body text-sm text-jung-secondary">{RELATIONSHIPS_INSIGHTS[dominantFunc]?.challenges}</p>
        </div>
        <div className="bg-rose-50/50 rounded-xl p-5 border border-rose-200/50">
          <h4 className="text-ui font-semibold text-rose-800 mb-3">Ideal Partners</h4>
          <p className="text-body text-sm text-jung-secondary">{RELATIONSHIPS_INSIGHTS[dominantFunc]?.idealPartners}</p>
        </div>
        <div className="bg-jung-accent/5 rounded-xl p-5 border border-jung-accent/20">
          <h4 className="text-ui font-semibold text-jung-dark mb-3">Growth in Relationships</h4>
          <p className="text-body text-sm text-jung-secondary">{RELATIONSHIPS_INSIGHTS[dominantFunc]?.growthInRelationships}</p>
        </div>
      </div>
    </div>
  </section>
);

const CareerSection: React.FC<{ dominantFunc: string }> = ({ dominantFunc }) => (
  <section className="mb-16">
    <div className="flex items-start sm:items-center gap-4 mb-8 border-b border-jung-border pb-4">
      <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
        <Briefcase className="w-6 h-6 text-blue-600" />
      </div>
      <div>
        <h2 className="text-heading text-2xl md:text-3xl">Career Alignment</h2>
        <p className="text-body text-sm text-jung-muted">Professional paths aligned with your cognitive strengths</p>
      </div>
    </div>

    <div className="card-elevated p-6 md:p-8 relative overflow-hidden">
      <div className="absolute top-0 right-0 bg-jung-accent text-white text-[10px] font-bold uppercase tracking-wider px-3 py-1.5 rounded-bl-lg">
        Insight
      </div>

      <div className="space-y-6">
        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-blue-50/50 rounded-xl p-5 border border-blue-200/50">
            <h4 className="text-ui font-semibold text-blue-800 mb-3">Natural Strengths</h4>
            <p className="text-body text-sm text-jung-secondary">{CAREER_GUIDANCE[dominantFunc]?.naturalStrengths}</p>
          </div>
          <div className="bg-jung-surface rounded-xl p-5 border border-jung-border">
            <h4 className="text-ui font-semibold text-jung-dark mb-3">Ideal Environments</h4>
            <p className="text-body text-sm text-jung-secondary">{CAREER_GUIDANCE[dominantFunc]?.idealEnvironments}</p>
          </div>
        </div>

        <div className="bg-jung-surface border border-jung-border rounded-xl p-5">
          <h4 className="text-ui font-semibold text-jung-dark mb-4">Suggested Roles</h4>
          <div className="flex flex-wrap gap-2">
            {CAREER_GUIDANCE[dominantFunc]?.roles.map((role: string, index: number) => (
              <span key={index} className="px-4 py-2 bg-jung-accent/10 text-jung-accent rounded-full text-sm font-medium">
                {role}
              </span>
            ))}
          </div>
        </div>

        <div className="bg-amber-50/50 border border-amber-200/50 rounded-xl p-5">
          <h4 className="text-ui font-semibold text-amber-800 mb-2 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-amber-600" />
            Watch Out For
          </h4>
          <p className="text-body text-sm text-jung-secondary">{CAREER_GUIDANCE[dominantFunc]?.watchOutFor}</p>
        </div>
      </div>
    </div>
  </section>
);

const IndividuationSection: React.FC<{ stack: Stack }> = ({ stack }) => (
  <section className="mb-16">
    <div className="flex items-start sm:items-center gap-4 mb-8 border-b border-jung-border pb-4">
      <div className="w-12 h-12 rounded-full bg-jung-secondary/10 flex items-center justify-center flex-shrink-0">
        <Compass className="w-6 h-6 text-jung-secondary" />
      </div>
      <div>
        <h2 className="text-heading text-2xl md:text-3xl">The Path of Individuation</h2>
        <p className="text-body text-sm text-jung-muted">The Journey Toward Wholeness</p>
      </div>
    </div>

    <p className="text-body text-jung-secondary mb-10 max-w-3xl">
      {INDIVIDUATION_GUIDANCE.intro}
    </p>

    <div className="bg-jung-surface rounded-xl p-6 md:p-8 mb-8 border border-jung-border">
      <h4 className="text-ui font-semibold text-jung-dark mb-4">Working With Your Inferior Function ({stack.inferior.function})</h4>
      <p className="text-body text-sm text-jung-secondary">
        {INDIVIDUATION_GUIDANCE.inferiorFunctionWork}
      </p>
    </div>

    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {INDIVIDUATION_GUIDANCE.stages.slice(0, 3).map((stage, i) => (
        <div key={i} className="card-elevated p-5">
          <h4 className="text-ui font-semibold text-jung-accent mb-2">{stage.name}</h4>
          <p className="text-xs text-jung-muted mb-3">{stage.description}</p>
          <p className="text-body text-sm text-jung-secondary font-medium">{stage.task}</p>
        </div>
      ))}
    </div>

    <div className="mt-8 p-5 bg-jung-dark text-jung-surface rounded-xl">
      <p className="text-sm italic">
        <strong>Caution:</strong> {INDIVIDUATION_GUIDANCE.warning}
      </p>
    </div>
  </section>
);

const ActiveImaginationSection: React.FC = () => (
  <section className="mb-16">
    <div className="flex items-start sm:items-center gap-4 mb-8 border-b border-jung-border pb-4">
      <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0">
        <Sparkles className="w-6 h-6 text-purple-500" />
      </div>
      <div>
        <h2 className="text-heading text-2xl md:text-3xl">Active Imagination Exercises</h2>
        <p className="text-body text-sm text-jung-muted">Jung's technique for dialoguing with the unconscious</p>
      </div>
    </div>

    <div className="card-elevated p-6 md:p-8 relative overflow-hidden">
      <div className="absolute top-0 right-0 bg-jung-accent text-white text-[10px] font-bold uppercase tracking-wider px-3 py-1.5 rounded-bl-lg">
        Premium
      </div>

      <p className="text-body text-jung-secondary mb-8">
        Active Imagination is Jung's method for engaging directly with unconscious contents. Unlike passive daydreaming, it involves consciously entering a meditative state and allowing images to arise, then actively participating with them.
      </p>

      <div className="space-y-4">
        {ACTIVE_IMAGINATION_PROMPTS.map((exercise, index) => (
          <details key={index} className="group bg-purple-50/50 rounded-xl border border-purple-200/50 overflow-hidden">
            <summary className="flex items-center justify-between p-5 cursor-pointer hover:bg-purple-100/50 transition-colors">
              <div className="flex items-center gap-4">
                <span className="w-9 h-9 bg-purple-200 text-purple-700 rounded-full flex items-center justify-center font-bold text-sm">
                  {index + 1}
                </span>
                <h4 className="text-ui font-semibold text-purple-900">{exercise.title}</h4>
              </div>
              <ChevronDown className="w-5 h-5 text-purple-500 group-open:rotate-180 transition-transform" />
            </summary>
            <div className="px-5 pb-5 pt-2 bg-jung-surface border-t border-purple-200/50">
              <p className="text-body text-sm text-jung-secondary leading-relaxed">{exercise.prompt}</p>
            </div>
          </details>
        ))}
      </div>

      <div className="mt-8 p-5 bg-purple-100/50 rounded-xl">
        <p className="text-body text-sm text-purple-900 italic">
          <strong>Note:</strong> Active Imagination should be approached with respect. If you have a history of trauma or dissociation, consider working with a qualified therapist before engaging deeply with unconscious material.
        </p>
      </div>
    </div>
  </section>
);

const DreamJournalingSection: React.FC = () => (
  <section className="mb-16">
    <div className="flex items-start sm:items-center gap-4 mb-8 border-b border-jung-border pb-4">
      <div className="w-12 h-12 rounded-full bg-indigo-100 flex items-center justify-center flex-shrink-0">
        <Moon className="w-6 h-6 text-indigo-500" />
      </div>
      <div>
        <h2 className="text-heading text-2xl md:text-3xl">Dream Journaling Guide</h2>
        <p className="text-body text-sm text-jung-muted">The royal road to the unconscious</p>
      </div>
    </div>

    <div className="card-elevated p-6 md:p-8 relative overflow-hidden">
      <div className="absolute top-0 right-0 bg-jung-accent text-white text-[10px] font-bold uppercase tracking-wider px-3 py-1.5 rounded-bl-lg">
        Premium
      </div>

      <p className="text-body text-jung-secondary mb-8">{DREAM_JOURNALING_TEMPLATE.intro}</p>

      <div className="grid md:grid-cols-2 gap-6 mb-8">
        <div className="bg-indigo-50/50 rounded-xl p-6 border border-indigo-200/50">
          <h4 className="text-ui font-semibold text-indigo-800 mb-4">Questions to Ask About Your Dreams</h4>
          <ol className="space-y-3 text-body text-sm text-jung-secondary">
            {DREAM_JOURNALING_TEMPLATE.questions.map((question, index) => (
              <li key={index} className="flex gap-2">
                <span className="font-bold text-indigo-600 flex-shrink-0">{index + 1}.</span>
                <span>{question}</span>
              </li>
            ))}
          </ol>
        </div>

        <div className="bg-jung-surface rounded-xl p-6 border border-jung-border">
          <h4 className="text-ui font-semibold text-jung-dark mb-4">Common Jungian Symbols</h4>
          <ul className="space-y-2 text-body text-sm text-jung-secondary">
            {DREAM_JOURNALING_TEMPLATE.symbolsToNotice.map((symbol, index) => (
              <li key={index} className="flex items-start gap-2">
                <span className="text-indigo-400 mt-1">◆</span>
                <span>{symbol}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="bg-indigo-900 text-white rounded-xl p-6">
        <h4 className="text-ui font-semibold mb-3 flex items-center gap-2">
          <Moon className="w-5 h-5" />
          Jungian Tip
        </h4>
        <p className="text-sm text-indigo-100 leading-relaxed">{DREAM_JOURNALING_TEMPLATE.jungianTip}</p>
      </div>
    </div>
  </section>
);

const AiDeepAnalysis: React.FC<{
  isLoading: boolean;
  error: Error | string | null;
  analysis: any;
}> = ({ isLoading, error, analysis }) => (
  <section className="mb-16">
    <div className="flex items-start sm:items-center gap-4 mb-8 border-b border-purple-200 pb-4">
      <div className="p-3 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-xl flex-shrink-0">
        <Brain className="w-6 h-6 text-white" />
      </div>
      <div>
        <h2 className="text-heading text-2xl md:text-3xl">AI-Powered Deep Analysis</h2>
        <p className="text-body text-sm text-jung-muted">Personalized insights generated specifically for your unique profile</p>
      </div>
    </div>

    {isLoading ? (
      <div className="flex flex-col items-center justify-center py-20 bg-gradient-to-br from-purple-50/80 to-indigo-50/80 rounded-2xl border border-purple-200/50">
        <Loader2 className="w-12 h-12 animate-spin text-purple-500 mb-4" />
        <span className="text-body font-medium text-purple-700">Generating your comprehensive personalized analysis...</span>
        <p className="text-body text-sm text-purple-500 mt-2">This may take a moment as we craft detailed insights for each section.</p>
      </div>
    ) : error ? (
      <div className="flex items-center gap-4 p-6 bg-red-50 border border-red-200 rounded-xl">
        <AlertTriangle className="w-8 h-8 text-red-500 flex-shrink-0" />
        <div>
          <p className="text-body font-medium text-red-700">Unable to generate AI analysis</p>
          <p className="text-body text-sm text-red-600">Please refresh the page to try again.</p>
        </div>
      </div>
    ) : analysis ? (
      <div className="space-y-8">
        {Object.entries(analysis).map(([key, value]) => (
          <div key={key} className="card-elevated p-6 md:p-8 relative overflow-hidden">
            <div className="absolute top-0 right-0 bg-gradient-to-r from-purple-500 to-indigo-500 text-white text-[10px] font-bold uppercase tracking-wider px-3 py-1.5 rounded-bl-lg">
              AI Generated
            </div>
            <h3 className="text-heading text-lg md:text-xl mb-4 capitalize">
              {key.replace(/([A-Z])/g, ' $1').trim()}
            </h3>
            <div className="prose-editorial">
              <FormattedText text={value as string} />
            </div>
          </div>
        ))}
      </div>
    ) : (
      <div className="text-center py-16 bg-jung-surface rounded-2xl border border-jung-border">
        <Brain className="w-14 h-14 text-jung-muted/30 mx-auto mb-4" />
        <p className="text-body text-jung-muted">AI analysis will be generated shortly...</p>
      </div>
    )}
  </section>
);

const AssessmentHistory: React.FC<{
  historyResults: SavedResult[];
  isLoading: boolean;
  showHistory: boolean;
  viewingHistoricalResult: string | null;
  deletingResultId: string | null;
  onToggle: () => void;
  onLoad: (result: SavedResult) => void;
  onDelete: (id: string) => void;
}> = ({ historyResults, isLoading, showHistory, viewingHistoricalResult, deletingResultId, onToggle, onLoad, onDelete }) => (
  <div className="mt-10 border-t border-jung-border pt-10">
    <button
      onClick={onToggle}
      className="flex items-center justify-center gap-3 w-full py-4 text-jung-muted hover:text-jung-accent transition-colors"
    >
      <History className="w-5 h-5" />
      <span className="text-ui font-medium">Your Assessment History</span>
      {showHistory ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
    </button>

    {showHistory && (
      <div className="mt-6">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-jung-muted" />
            <span className="ml-3 text-body text-jung-muted">Loading history...</span>
          </div>
        ) : historyResults.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 rounded-full bg-jung-surface flex items-center justify-center mx-auto mb-4">
              <History className="w-8 h-8 text-jung-muted/30" />
            </div>
            <p className="text-body font-medium text-jung-dark mb-1">No saved assessments yet.</p>
            <p className="text-sm text-jung-muted">Your results will appear here after you complete an assessment.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {historyResults.map((result) => {
              const dominantFunc = result.stack?.dominant?.function || 'N/A';
              const funcTitle = FUNCTION_DESCRIPTIONS[dominantFunc]?.title || dominantFunc;
              const dateStr = new Date(result.createdAt).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              });
              const isViewing = viewingHistoricalResult === result.id;

              return (
                <div
                  key={result.id}
                  className={`flex items-center justify-between p-5 rounded-xl border transition-all ${
                    isViewing
                      ? 'border-jung-accent bg-jung-accent/5'
                      : 'border-jung-border bg-jung-surface hover:border-jung-accent/30'
                  }`}
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-ui font-medium text-jung-dark">{funcTitle}</span>
                      <span className="text-xs px-2 py-0.5 bg-jung-surface rounded text-jung-muted">{dominantFunc}</span>
                      {isViewing && (
                        <span className="text-xs px-2 py-0.5 bg-jung-accent text-white rounded">Viewing</span>
                      )}
                    </div>
                    <p className="text-sm text-jung-muted mt-1">{dateStr}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => onLoad(result)}
                      className="flex items-center gap-1.5 px-4 py-2 min-h-[44px] text-sm font-medium text-jung-accent hover:bg-jung-accent/10 rounded-lg transition-colors"
                    >
                      <Eye className="w-4 h-4" />
                      View
                    </button>
                    <button
                      onClick={() => onDelete(result.id)}
                      disabled={deletingResultId === result.id}
                      className="flex items-center gap-1.5 px-4 py-2 min-h-[44px] text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                    >
                      {deletingResultId === result.id ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Trash2 className="w-4 h-4" />
                      )}
                      Delete
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    )}
  </div>
);

const InstagramPreviewModal: React.FC<{
  onClose: () => void;
  onShare: () => void;
  isGenerating: boolean;
  instagramCardRef: React.RefObject<HTMLDivElement>;
  results: ValidatedAssessmentResults;
}> = ({ onClose, onShare, isGenerating, instagramCardRef, results }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
    <div className="relative max-h-[90vh] overflow-auto bg-jung-dark rounded-2xl shadow-2xl">
      <div className="sticky top-0 z-10 flex items-center justify-between p-5 bg-jung-dark border-b border-white/10">
        <h3 className="text-lg font-medium text-white">Story Image Preview</h3>
        <button
          onClick={onClose}
          className="p-2 text-white/60 hover:text-white transition-colors rounded-full hover:bg-white/10"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="p-5">
        <div className="mx-auto" style={{ width: '270px', height: '480px', overflow: 'hidden' }}>
          <div style={{ transform: 'scale(0.25)', transformOrigin: 'top left' }}>
            <div ref={instagramCardRef}>
              <Suspense fallback={<div className="w-[1080px] h-[1920px] bg-jung-surface animate-pulse" />}>
                <InstagramStoryCard
                  dominantFunction={results.stack.dominant.function}
                  scores={results.scores}
                  stack={results.stack}
                />
              </Suspense>
            </div>
          </div>
        </div>
      </div>

      <div className="sticky bottom-0 flex gap-3 p-5 bg-jung-dark border-t border-white/10">
        <button
          onClick={onClose}
          className="flex-1 px-5 py-3.5 text-white/80 bg-white/10 hover:bg-white/20 rounded-lg font-medium transition-colors"
        >
          Cancel
        </button>
        <button
          onClick={onShare}
          disabled={isGenerating}
          className="flex-1 flex items-center justify-center gap-2 px-5 py-3.5 text-white rounded-lg font-medium transition-opacity hover:opacity-90 disabled:opacity-50"
          style={{
            background: 'linear-gradient(45deg, #f09433 0%, #e6683c 25%, #dc2743 50%, #cc2366 75%, #bc1888 100%)'
          }}
        >
          {isGenerating ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Generating...
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4" />
              Share
            </>
          )}
        </button>
      </div>
    </div>
  </div>
);
