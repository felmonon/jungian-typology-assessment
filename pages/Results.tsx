import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ValidatedAssessmentResults, assessmentResultsSchema, safeParseLocalStorage, STORAGE_KEYS } from '../lib/validation';
import { useAuth } from '../hooks/use-auth';
import { usePremiumStatus } from '../hooks/use-premium-status';
import { useAiAnalysis } from '../hooks/use-ai-analysis';
import { Button } from '../components/ui/Button';
import { ChatBot } from '../components/ChatBot';
import { Download, RefreshCcw, Loader2, Sparkles, Crown, Brain } from 'lucide-react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

import {
  ResultsHeader,
  FunctionChart,
  ScoreBreakdown,
  QuickInsights,
  ShareSection,
  GripSection,
  RelationshipsSection,
  CareerSection,
  IndividuationSection,
  ActiveImaginationSection,
  DreamJournalingSection,
  AiDeepAnalysis,
  AssessmentHistory,
  InstagramPreviewModal,
  ResultsSkeleton,
  ResultsError,
  AuthRequired
} from '../components/results';

import { THE_GRIP } from '../data/questions';
import { Stack, FunctionScore } from '../types';

interface SavedResult {
  id: string;
  scores: any[];
  stack: any;
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
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);

  const contentRef = useRef<HTMLDivElement>(null);
  const instagramCardRef = useRef<HTMLDivElement>(null);
  const saveAttemptedRef = useRef(false);
  const aiAnalysisFetchedRef = useRef(false);

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

  const loadResults = useCallback(() => {
    const saved = safeParseLocalStorage(STORAGE_KEYS.RESULTS, assessmentResultsSchema, null);
    if (saved) {
      setState({ status: 'ready', results: saved });
    } else {
      setState({ status: 'no-results' });
    }
  }, []);

  useEffect(() => {
    if (!authLoading) {
      if (!user) setState({ status: 'auth-required' });
      else loadResults();
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
      const response = await fetch(`/api/results/${id}`, { method: 'DELETE', credentials: 'include' });
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

  useEffect(() => {
    if (state.status === 'ready' && isAuthenticated && !saveAttemptedRef.current && !viewingHistoricalResult) {
      saveResultToDb(state.results);
    }
  }, [state, isAuthenticated, viewingHistoricalResult, saveResultToDb]);

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
      if (isPremium && !premiumLoading) fetchPremiumAnalysis(analysisInput);
    }
  }, [state, fetchFreeAnalysis, fetchPremiumAnalysis, isPremium, premiumLoading, isLoadingFree]);

  const generatePDF = useCallback(async () => {
    if (!contentRef.current || state.status !== 'ready') return;
    setIsGeneratingPdf(true);
    try {
      const content = contentRef.current;
      const canvas = await html2canvas(content, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#F7F5F0',
        windowWidth: 1200,
      });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
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
        if (page > 0) pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, scaledHeight);
        heightLeft -= pdfHeight;
        position -= pdfHeight;
        page++;
      }
      pdf.save(`jungian-profile-${state.results.stack.dominant.function}.pdf`);
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
        canvas.toBlob((b) => b ? resolve(b) : reject(new Error('Failed to create image')), 'image/png');
      });
      const file = new File([blob], `jungian-story-${state.results.stack.dominant.function}.png`, { type: 'image/png' });
      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({
          files: [file],
          title: 'My Jungian Typology Results',
          text: `I'm a ${state.results.stack.dominant.function}! Discover your cognitive function profile.`,
        });
      } else {
        const link = document.createElement('a');
        link.download = file.name;
        link.href = URL.createObjectURL(blob);
        link.click();
        URL.revokeObjectURL(link.href);
      }
      setShowInstagramPreview(false);
    } catch (error) {
      if ((error as Error).name !== 'AbortError') {
        console.error('Error sharing story:', error);
        alert('Failed to share. Please try again.');
      }
    } finally {
      setIsGeneratingStory(false);
    }
  }, [state]);

  if (authLoading || state.status === 'loading') return <ResultsSkeleton />;
  if (state.status === 'auth-required') return <AuthRequired onLoginClick={() => navigate('/auth')} />;
  if (state.status === 'error') return <ResultsError message={state.message} onRetry={() => { saveAttemptedRef.current = false; loadResults(); }} />;
  if (state.status === 'no-results') return <ResultsError message="No assessment results found. Please complete the assessment first." onRetry={() => navigate('/assessment')} />;

  const results = state.results;
  const dominantFunc = results.stack.dominant.function;
  const grip = THE_GRIP[dominantFunc as keyof typeof THE_GRIP];

  return (
    <div className="min-h-screen bg-jung-base dark:bg-dark-base transition-colors duration-500 pb-32">
      <div ref={contentRef} className="editorial-container py-12 lg:py-24">
        {/* Top Actions */}
        <div className="flex flex-wrap items-center justify-between gap-6 mb-16">
          <Button variant="ghost" onClick={() => navigate('/')} className="px-0 text-jung-muted hover:text-jung-accent">
            ← Return to Hub
          </Button>
          <div className="flex items-center gap-4">
            {isPremium && (
              <Button onClick={generatePDF} disabled={isGeneratingPdf} className="btn-premium shadow-xl shadow-jung-accent/20">
                {isGeneratingPdf ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
                Export PDF
              </Button>
            )}
            <Button variant="outline" onClick={() => navigate('/assessment')} className="border-jung-border dark:border-dark-border">
              <RefreshCcw className="w-4 h-4" />
              Retake
            </Button>
          </div>
        </div>

        <ResultsHeader results={results} />
        <FunctionChart results={results} />
        <ScoreBreakdown results={results} />

        {/* AI Insight Section */}
        <section className="mb-20">
          <div className="flex items-center gap-4 mb-10 pb-6 border-b border-jung-border dark:border-dark-border">
            <div className="w-12 h-12 rounded-2xl bg-jung-accent/10 flex items-center justify-center">
              <Brain className="w-6 h-6 text-jung-accent" />
            </div>
            <div>
              <h2 className="text-display text-3xl text-jung-dark dark:text-white">Pattern Recognition</h2>
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-jung-muted">Deep Personality Synthesis</p>
            </div>
          </div>

          <div className="card-premium p-8 lg:p-12 bg-white dark:bg-dark-surface border-jung-border dark:border-dark-border">
            {isLoadingFree ? (
              <div className="flex flex-col items-center justify-center py-20">
                <Loader2 className="w-10 h-10 animate-spin text-jung-accent mb-4" />
                <p className="text-sm font-bold uppercase tracking-widest text-jung-muted">De-shrouding the Shadow...</p>
              </div>
            ) : freeAnalysis ? (
              <div className="prose-editorial dark:prose-invert max-w-none">
                <p className="text-body-lg text-jung-secondary dark:text-jung-muted leading-relaxed font-serif italic">
                  {freeAnalysis}
                </p>
              </div>
            ) : (
              <p className="text-center text-jung-muted italic font-serif">Awaiting cognitive synthesis...</p>
            )}
          </div>
        </section>

        <QuickInsights results={results} />

        {/* Premium Gate Logic */}
        {!isPremium ? (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="card-premium p-12 lg:p-20 bg-jung-dark text-white text-center relative overflow-hidden"
          >
            <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-jung-accent/5 to-transparent pointer-events-none" />
            <div className="relative z-10 max-w-2xl mx-auto space-y-8">
              <div className="w-20 h-20 bg-jung-accent rounded-[2rem] flex items-center justify-center mx-auto shadow-2xl shadow-jung-accent/40 mb-10">
                <Crown className="w-10 h-10 text-white" />
              </div>
              <h2 className="text-display text-4xl lg:text-5xl">Unlock the Full <br /><span className="text-jung-accent-muted italic">Psychic Blueprint.</span></h2>
              <p className="text-lg text-jung-subtle font-serif italic leading-relaxed">
                Depth psychology goes beyond the ego. Unlock your 8-function stack, relationship dynamics, career roadmap, and your personalized AI Type Coach.
              </p>
              <div className="pt-8">
                <Button onClick={() => navigate('/pricing')} className="btn-premium px-12 py-6 text-lg">
                  Upgrade to Premium
                  <Sparkles className="w-5 h-5" />
                </Button>
              </div>
              <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-jung-muted">One-time payment for eternal insight</p>
            </div>
          </motion.div>
        ) : (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-24">
            <GripSection grip={grip} />
            <RelationshipsSection dominantFunc={dominantFunc} />
            <CareerSection dominantFunc={dominantFunc} />
            <IndividuationSection stack={results.stack as Stack} />
            <ActiveImaginationSection />
            <DreamJournalingSection />
            <AiDeepAnalysis
              isLoading={isLoadingPremium}
              error={premiumError}
              analysis={premiumAnalysis}
            />
          </motion.div>
        )}

        <ShareSection results={results} shareSlug={shareSlug} onInstagramClick={() => setShowInstagramPreview(true)} />

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
