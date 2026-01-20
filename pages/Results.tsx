import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from 'recharts';
import { ResultsAnalysis, FunctionScore, Stack } from '../types';
import { FUNCTION_DESCRIPTIONS, ATTITUDE_DESCRIPTIONS, STACK_POSITIONS, THE_GRIP, TYPE_PHENOMENOLOGY, INDIVIDUATION_GUIDANCE, RELATIONSHIPS_INSIGHTS, CAREER_GUIDANCE, ACTIVE_IMAGINATION_PROMPTS, DREAM_JOURNALING_TEMPLATE } from '../data/questions';
import { Button } from '../components/ui/Button';
import { TierGate } from '../components/TierGate';
import { AlertCircle, Download, RefreshCcw, Layers, ArrowDown, Loader2, BookOpen, AlertTriangle, Compass, Share2, Link2, Check, History, Eye, Trash2, ChevronDown, ChevronUp, Camera, X, Sparkles, Heart, Briefcase, Moon, Mail, Brain, Crown, Lock } from 'lucide-react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { useAuth } from '../hooks/use-auth';
import { usePremiumStatus } from '../hooks/use-premium-status';
import { InstagramStoryCard } from '../components/InstagramStoryCard';
import { useAiAnalysis } from '../hooks/use-ai-analysis';
import { FormattedText } from '../components/FormattedText';
import { ChatBot } from '../components/ChatBot';

interface SavedResult {
  id: string;
  scores: FunctionScore[];
  stack: Stack;
  attitudeScore: string;
  isUndifferentiated: string;
  shareSlug: string | null;
  createdAt: string;
}

export const Results: React.FC = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const { tier, isPremium, isLoading: premiumLoading } = usePremiumStatus();
  const authUser = user;
  const [results, setResults] = useState<ResultsAnalysis | null>(null);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const isUnlocked = isPremium;
  
  const hasAccess = (requiredTier: 'insight' | 'mastery') => {
    if (requiredTier === 'insight') return tier === 'insight' || tier === 'mastery';
    if (requiredTier === 'mastery') return tier === 'mastery';
    return false;
  };
  const [shareSlug, setShareSlug] = useState<string | null>(null);
  const [linkCopied, setLinkCopied] = useState(false);
  const [historyResults, setHistoryResults] = useState<SavedResult[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [viewingHistoricalResult, setViewingHistoricalResult] = useState<string | null>(null);
  const [deletingResultId, setDeletingResultId] = useState<string | null>(null);
  const [showInstagramPreview, setShowInstagramPreview] = useState(false);
  const [isGeneratingStory, setIsGeneratingStory] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [isSendingEmail, setIsSendingEmail] = useState(false);
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

  // Redirect to auth if not logged in
  useEffect(() => {
    if (!authLoading && !authUser) {
      navigate('/auth');
    }
  }, [authLoading, authUser, navigate]);

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

  const saveResultToDb = useCallback(async (resultData: ResultsAnalysis) => {
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
        localStorage.setItem('jungian_assessment_share_slug', savedResult.shareSlug);
        fetchHistory();
      }
    } catch (error) {
      console.error('Failed to save result:', error);
      saveAttemptedRef.current = false;
    }
  }, [isAuthenticated, fetchHistory]);

  const loadHistoricalResult = (savedResult: SavedResult) => {
    const loadedResults: ResultsAnalysis = {
      scores: savedResult.scores,
      stack: savedResult.stack,
      dominant: savedResult.stack.dominant,
      inferior: savedResult.stack.inferior,
      attitudeScore: parseFloat(savedResult.attitudeScore),
      isUndifferentiated: savedResult.isUndifferentiated === 'true',
      differentiation: 0,
    };
    setResults(loadedResults);
    setShareSlug(savedResult.shareSlug);
    setViewingHistoricalResult(savedResult.id);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const deleteResult = async (id: string) => {
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
          const saved = localStorage.getItem('jungian_assessment_results');
          if (saved) {
            setResults(JSON.parse(saved));
          }
        }
      }
    } catch (error) {
      console.error('Failed to delete result:', error);
    } finally {
      setDeletingResultId(null);
    }
  };

  useEffect(() => {
    const saved = localStorage.getItem('jungian_assessment_results');
    if (saved) {
      const parsedResults = JSON.parse(saved);
      setResults(parsedResults);
      
      // Only save to DB if authenticated, not already attempted, and NOT viewing history
      if (isAuthenticated && !saveAttemptedRef.current && !viewingHistoricalResult) {
        saveResultToDb(parsedResults);
      }
    } else {
      navigate('/assessment');
    }

    // Initial load of share slug from localStorage for NEW results
    const savedSlug = localStorage.getItem('jungian_assessment_share_slug');
    if (savedSlug && !viewingHistoricalResult) {
      setShareSlug(savedSlug);
    }
  }, [navigate, isAuthenticated, saveResultToDb, viewingHistoricalResult]);

  useEffect(() => {
    if (isAuthenticated) {
      fetchHistory();
    }
  }, [isAuthenticated, fetchHistory]);

  useEffect(() => {
    if (results && !aiAnalysisFetchedRef.current && !isLoadingFree) {
      aiAnalysisFetchedRef.current = true;
      const analysisInput = {
        scores: results.scores,
        stack: results.stack,
        attitudeScore: results.attitudeScore,
        isUndifferentiated: results.isUndifferentiated,
      };
      fetchFreeAnalysis(analysisInput);
      if (isPremium && !premiumLoading) {
        fetchPremiumAnalysis(analysisInput);
      }
    }
  }, [results, fetchFreeAnalysis, fetchPremiumAnalysis, isPremium, premiumLoading, isLoadingFree]);

  useEffect(() => {
    if (isPremium && results && !premiumAnalysis && !isLoadingPremium && !premiumError) {
      const analysisInput = {
        scores: results.scores,
        stack: results.stack,
        attitudeScore: results.attitudeScore,
        isUndifferentiated: results.isUndifferentiated,
      };
      fetchPremiumAnalysis(analysisInput);
    }
  }, [isPremium, results, premiumAnalysis, isLoadingPremium, premiumError, fetchPremiumAnalysis]);

  // Auto-generate PDF and send email after payment
  const autoSendEmailRef = useRef(false);
  useEffect(() => {
    const shouldSendEmail = localStorage.getItem('jungian_assessment_send_email') === 'true';
    
    if (shouldSendEmail && isUnlocked && results && authUser?.email && !autoSendEmailRef.current && !emailSent && !premiumLoading && !isGeneratingPdf) {
      autoSendEmailRef.current = true;
      
      // Small delay to ensure content is rendered
      setTimeout(async () => {
        if (!contentRef.current) {
          autoSendEmailRef.current = false;
          return;
        }
        
        setIsGeneratingPdf(true);
        setIsSendingEmail(true);
        
        try {
          const content = contentRef.current;
          const canvas = await html2canvas(content, {
            scale: 1,
            useCORS: true,
            logging: false,
            backgroundColor: '#fafaf9',
            windowWidth: 900,
          });

          const imgData = canvas.toDataURL('image/jpeg', 0.7);
          const pdf = new jsPDF({
            orientation: 'portrait',
            unit: 'mm',
            format: 'a4',
            compress: true,
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
            pdf.addImage(imgData, 'JPEG', 0, position, pdfWidth, scaledHeight);
            heightLeft -= pdfHeight;
            position -= pdfHeight;
            page++;
          }

          const dominantFunction = results.stack.dominant.function;
          const pdfBase64 = pdf.output('datauristring').split(',')[1];
          const userName = authUser?.firstName || authUser?.email?.split('@')[0] || 'Explorer';
          
          const response = await fetch('/api/send-pdf-email', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({
              pdfBase64,
              userName,
              dominantFunction: FUNCTION_DESCRIPTIONS[dominantFunction]?.title || dominantFunction
            })
          });
          
          if (response.ok) {
            localStorage.removeItem('jungian_assessment_send_email');
            setEmailSent(true);
          } else if (response.status === 413) {
            console.error('PDF too large for email, skipping');
            localStorage.removeItem('jungian_assessment_send_email');
          } else {
            console.error('Email send failed, will retry on next page load');
            autoSendEmailRef.current = false;
          }
        } catch (error) {
          console.error('Failed to auto-send email:', error);
          autoSendEmailRef.current = false;
        } finally {
          setIsGeneratingPdf(false);
          setIsSendingEmail(false);
        }
      }, 2000);
    }
  }, [isUnlocked, results, authUser, premiumLoading, emailSent, isGeneratingPdf]);

  const getShareUrl = () => {
    if (!shareSlug) return '';
    return `${window.location.origin}/#/share/${shareSlug}`;
  };

  const shareOnTwitter = () => {
    if (!results) return;
    const dominantFunc = results.stack.dominant.function;
    const funcTitle = FUNCTION_DESCRIPTIONS[dominantFunc]?.title || dominantFunc;
    const text = `I just discovered my dominant cognitive function is ${funcTitle} (${dominantFunc})! Take the Jungian Typology Assessment to discover yours.`;
    const url = getShareUrl();
    window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`, '_blank', 'width=550,height=420');
  };

  const shareOnFacebook = () => {
    const url = getShareUrl();
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`, '_blank', 'width=550,height=420');
  };

  const shareOnLinkedIn = () => {
    const url = getShareUrl();
    window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`, '_blank', 'width=550,height=420');
  };

  const copyLink = async () => {
    const url = getShareUrl();
    try {
      await navigator.clipboard.writeText(url);
      setLinkCopied(true);
      setTimeout(() => setLinkCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy link:', err);
    }
  };

  const generatePDF = async () => {
    if (!contentRef.current || !results) return;

    setIsGeneratingPdf(true);

    try {
      const content = contentRef.current;

      const canvas = await html2canvas(content, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#fafaf9',
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

        pdf.addImage(
          imgData,
          'PNG',
          0,
          position,
          pdfWidth,
          scaledHeight
        );

        heightLeft -= pdfHeight;
        position -= pdfHeight;
        page++;
      }

      const dominantFunction = results.stack.dominant.function;
      pdf.save(`jungian-profile-${dominantFunction}.pdf`);

      if (isUnlocked && !emailSent && authUser?.email) {
        setIsSendingEmail(true);
        try {
          const pdfBase64 = pdf.output('datauristring').split(',')[1];
          const userName = authUser?.firstName || authUser?.email?.split('@')[0] || 'Explorer';
          
          await fetch('/api/send-pdf-email', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({
              pdfBase64,
              userName,
              dominantFunction: FUNCTION_DESCRIPTIONS[dominantFunction]?.title || dominantFunction
            })
          });
          setEmailSent(true);
        } catch (emailError) {
          console.error('Failed to send email:', emailError);
        } finally {
          setIsSendingEmail(false);
        }
      }
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Failed to generate PDF. Please try again.');
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  const generateInstagramStory = async () => {
    if (!instagramCardRef.current || !results) return;

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

      // Convert canvas to blob for sharing
      const blob = await new Promise<Blob>((resolve, reject) => {
        canvas.toBlob((b) => {
          if (b) resolve(b);
          else reject(new Error('Failed to create image'));
        }, 'image/png');
      });

      const file = new File([blob], `jungian-story-${results.stack.dominant.function}.png`, { type: 'image/png' });

      // Try Web Share API first (works on mobile)
      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({
          files: [file],
          title: 'My Jungian Typology Results',
          text: `I'm a ${FUNCTION_DESCRIPTIONS[results.stack.dominant.function].title}! Discover your cognitive function profile.`,
        });
        setShowInstagramPreview(false);
      } else {
        // Fallback to download for desktop
        const link = document.createElement('a');
        link.download = file.name;
        link.href = URL.createObjectURL(blob);
        link.click();
        URL.revokeObjectURL(link.href);
        setShowInstagramPreview(false);
      }
    } catch (error) {
      // User cancelled share or error occurred
      if ((error as Error).name !== 'AbortError') {
        console.error('Error sharing story:', error);
        alert('Failed to share. Please try again.');
      }
    } finally {
      setIsGeneratingStory(false);
    }
  };

  // Show loading while checking auth
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-jung-primary" />
      </div>
    );
  }

  // Don't render if not authenticated
  if (!authUser) {
    return null;
  }

  if (!results) return null;

  const chartData = results.scores.map(s => ({
    subject: s.function,
    A: s.score,
    fullMark: 100,
  }));

  const barData = [...results.scores].sort((a,b) => b.score - a.score);
  const attitude = results.attitudeScore > 0 ? ATTITUDE_DESCRIPTIONS.E : ATTITUDE_DESCRIPTIONS.I;
  const attitudeType = results.attitudeScore > 0 ? 'Extraversion' : 'Introversion';

  const dominantFunc = results.stack.dominant.function;
  const grip = THE_GRIP[dominantFunc as keyof typeof THE_GRIP];
  const typePhenomenology = TYPE_PHENOMENOLOGY[dominantFunc];

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-4 py-12">
      <div ref={contentRef} className="bg-stone-50 p-6">
        {/* Header */}
        <div className="text-center mb-6 sm:mb-12">
          <h1 className="text-2xl sm:text-4xl font-serif font-bold text-jung-dark mb-4">Your Jungian Profile</h1>
          <p className="text-stone-600 max-w-2xl mx-auto">
            An in-depth analysis of your conscious preferences and unconscious tendencies, based on Carl Jung's theory of psychological types.
          </p>
          <p className="text-xs text-stone-400 mt-2 italic">
            "Every individual is an exception to the rule." — C.G. Jung
          </p>
        </div>

        {/* Type Summary Banner */}
        <div className="bg-gradient-to-r from-jung-primary to-jung-accent text-white p-4 sm:p-6 rounded-lg mb-6 sm:mb-12 shadow-lg">
          <div className="text-center">
            <p className="text-sm uppercase tracking-widest opacity-80 mb-2">Your Dominant Function</p>
            <h2 className="text-xl sm:text-3xl font-serif font-bold mb-2">
              {FUNCTION_DESCRIPTIONS[dominantFunc].title} ({dominantFunc})
            </h2>
            <p className="text-lg opacity-90 italic">"{FUNCTION_DESCRIPTIONS[dominantFunc].quote}"</p>
          </div>
        </div>

        {/* FREE: Profile Chart */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-12 mb-16">
          <div className="bg-white p-6 rounded-lg shadow-sm border border-stone-100 flex flex-col items-center">
            <h3 className="text-lg font-bold text-jung-secondary mb-4 tracking-wider uppercase">Function-Attitude Energy</h3>
            <div className="w-full h-[280px] sm:h-[400px]">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart cx="50%" cy="50%" outerRadius="70%" data={chartData}>
                  <PolarGrid stroke="#e7e5e4" />
                  <PolarAngleAxis dataKey="subject" tick={{ fill: '#451a03', fontSize: 11, fontWeight: 'bold' }} />
                  <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                  <Radar
                    name="Score"
                    dataKey="A"
                    stroke="#b45309"
                    strokeWidth={3}
                    fill="#b45309"
                    fillOpacity={0.4}
                  />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* FREE: Basic Attitude + Score Summary */}
          <div className="flex flex-col justify-center space-y-6">
            <div className="bg-stone-50 p-6 rounded-lg border-l-4 border-stone-400">
              <h3 className="text-xl font-serif font-bold text-stone-800 mb-2">
                General Attitude: {attitudeType}
              </h3>
              <p className="text-stone-600 text-sm">
                Your energy naturally flows {results.attitudeScore > 0 ? 'outward toward the external world' : 'inward toward your inner experience'}.
              </p>
            </div>

            {results.isUndifferentiated && (
              <div className="flex items-start gap-3 p-4 bg-amber-50 text-amber-900 rounded-md">
                <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                <div className="text-sm">
                  <strong>Differentiation Note:</strong> Your profile is relatively balanced. The analysis below shows your theoretical function hierarchy.
                </div>
              </div>
            )}

            {/* FREE: Quick Stack Preview */}
            <div className="bg-white p-6 rounded-lg border border-stone-200">
              <h3 className="text-lg font-serif font-bold text-jung-dark mb-4">Your Function Stack</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between items-center py-2 border-b border-stone-100">
                  <span className="font-medium text-jung-primary">1. Dominant</span>
                  <span className="font-bold">{results.stack.dominant.function}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-stone-100">
                  <span className="font-medium text-jung-accent">2. Auxiliary</span>
                  <span className="font-bold">{results.stack.auxiliary.function}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-stone-100">
                  <span className="font-medium text-stone-500">3. Tertiary</span>
                  <span className="font-bold">{results.stack.tertiary.function}</span>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="font-medium text-stone-400">4. Inferior</span>
                  <span className="font-bold">{results.stack.inferior.function}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* FREE: Score Breakdown - Moved up */}
        <section className="mb-8">
          <h2 className="text-xl font-serif font-bold text-jung-dark mb-6 border-b border-stone-200 pb-2">Your 8-Function Scores</h2>
          <p className="text-sm text-stone-500 mb-4">High scores = conscious habits. Low scores = potential blind spots (unconscious potential).</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {barData.map((item) => (
              <div key={item.function} className="bg-white p-4 rounded border border-stone-100 flex items-center justify-between group relative">
                <div className="flex flex-col">
                  <span className="font-bold text-stone-700">{FUNCTION_DESCRIPTIONS[item.function].title}</span>
                  <span className="text-xs text-stone-400">{item.function}</span>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-24 bg-stone-100 h-2 rounded-full">
                    <div
                      className="bg-jung-primary h-full rounded-full transition-all"
                      style={{ width: `${item.score}%` }}
                    />
                  </div>
                  <span className="font-mono font-bold text-stone-500 w-8 text-right">{item.score}</span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* FREE: Quick Insights Section */}
        <section className="mb-12 bg-white rounded-lg border border-stone-200 p-6">
          <h2 className="text-2xl font-serif font-bold text-jung-dark mb-6 flex items-center gap-2">
            <Compass className="w-6 h-6 text-jung-accent" />
            Quick Insights
          </h2>
          
          <div className="grid md:grid-cols-2 gap-6 mb-6">
            {/* Strengths */}
            <div className="bg-emerald-50 rounded-lg p-5 border border-emerald-100">
              <h3 className="font-bold text-emerald-800 mb-3">Strengths of Your Profile</h3>
              <ul className="space-y-2 text-sm text-emerald-900">
                <li className="flex items-start gap-2">
                  <span className="mt-1">•</span>
                  <span>Strong in {FUNCTION_DESCRIPTIONS[dominantFunc].title.toLowerCase()}—your natural "Hero" approach.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-1">•</span>
                  <span>Supported by {FUNCTION_DESCRIPTIONS[results.stack.auxiliary.function].title.toLowerCase()} for balance.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-1">•</span>
                  <span>{FUNCTION_DESCRIPTIONS[dominantFunc].positive}</span>
                </li>
              </ul>
            </div>

            {/* Blind Spots */}
            <div className="bg-amber-50 rounded-lg p-5 border border-amber-100">
              <h3 className="font-bold text-amber-800 mb-3">Potential Blind Spots</h3>
              <ul className="space-y-2 text-sm text-amber-900">
                <li className="flex items-start gap-2">
                  <span className="mt-1">•</span>
                  <span>May underuse {FUNCTION_DESCRIPTIONS[results.stack.inferior.function].title.toLowerCase()} (your inferior function).</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-1">•</span>
                  <span>Risk of over-relying on {dominantFunc}, creating one-sidedness.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-1">•</span>
                  <span>{FUNCTION_DESCRIPTIONS[dominantFunc].negative}</span>
                </li>
              </ul>
            </div>
          </div>

          {/* The Grip Preview */}
          <div className="bg-stone-100 rounded-lg p-5 mb-6">
            <h3 className="font-bold text-stone-700 mb-2 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-600" />
              The Grip (Stress Response)
            </h3>
            <p className="text-sm text-stone-600 mb-3">
              Under pressure, your inferior {grip.inferiorFunction} may erupt primitively:
            </p>
            <ul className="text-sm text-stone-700 space-y-1 ml-4">
              <li>• {grip.gripDescription.split('.')[0]}.</li>
              <li>• Feels "not like you"—behaviors seem foreign.</li>
            </ul>
          </div>

          {/* Growth Edge */}
          <div className="bg-jung-primary/5 rounded-lg p-5 border-l-4 border-jung-primary">
            <h3 className="font-bold text-jung-dark mb-2">Your Growth Edge (Individuation Path)</h3>
            <p className="text-sm text-stone-700 mb-3">
              Jung saw type as starting point—not destiny. Your lower scores (especially {results.stack.inferior.function}) 
              are unconscious potential: the "treasure hard to attain" (von Franz).
            </p>
            <p className="text-sm text-stone-600 italic">
              <strong>Analogy:</strong> Like a skilled {FUNCTION_DESCRIPTIONS[dominantFunc].title.split(' ')[1]?.toLowerCase() || 'practitioner'} with 
              a hidden {FUNCTION_DESCRIPTIONS[results.stack.inferior.function].title.split(' ')[1]?.toLowerCase() || 'analytical'} side—embrace both for fuller self.
            </p>
          </div>

          {/* Reflection Prompt */}
          <div className="mt-6 text-center">
            <p className="text-stone-600 italic text-sm">
              Does this resonate? Reflect on recent stress—did your inferior function suddenly overwhelm you?
            </p>
          </div>
        </section>

        {/* Stack Explanation Note */}
        <div className="mb-8 p-4 bg-stone-50 rounded-lg border border-stone-200">
          <p className="text-sm text-stone-600">
            <strong>Note:</strong> Your stack is <em>theoretical</em>—based on Jung's principle of opposites and compensation. 
            Your empirical scores may vary. Discrepancies aren't errors—they're opportunities for reflection: 
            "Why might I avoid this function?"
          </p>
        </div>

        {/* AI-Powered Personalized Analysis (Free) */}
        <section className="mb-12 bg-gradient-to-br from-purple-50 to-indigo-50 rounded-lg border border-purple-100 p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Brain className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <h2 className="text-xl font-serif font-bold text-purple-900">AI-Powered Personal Insight</h2>
              <p className="text-sm text-purple-600">Personalized analysis generated just for you</p>
            </div>
          </div>
          
          {isLoadingFree ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-purple-500 mr-3" />
              <span className="text-purple-600">Generating your personalized insight...</span>
            </div>
          ) : freeError ? (
            <div className="flex items-center gap-2 text-red-600 py-4">
              <AlertCircle className="w-5 h-5" />
              <span>Unable to generate analysis. Please refresh to try again.</span>
            </div>
          ) : freeAnalysis ? (
            <div className="prose prose-purple max-w-none">
              <FormattedText text={freeAnalysis} />
            </div>
          ) : (
            <div className="text-stone-500 italic py-4">
              Loading personalized analysis...
            </div>
          )}
        </section>

        {/* INSIGHT TIER: Conversion Trigger for Free Users */}
        {tier === 'free' && (
          <div className="mb-12 bg-gradient-to-r from-jung-primary/10 to-jung-accent/10 rounded-xl p-6 border border-jung-primary/20">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-jung-primary/20 rounded-full">
                  <Sparkles className="w-6 h-6 text-jung-primary" />
                </div>
                <div>
                  <h3 className="font-bold text-jung-dark text-lg">Your full 8-function analysis is ready</h3>
                  <p className="text-stone-600 text-sm">Unlock detailed insights into your archetypal stack, relationships, career alignment, and more.</p>
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

        {/* MASTERY TIER: Conversion Trigger for Insight Users */}
        {tier === 'insight' && (
          <div className="mb-12 bg-gradient-to-r from-purple-50 to-indigo-50 rounded-xl p-6 border border-purple-200">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-purple-100 rounded-full">
                  <Crown className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <h3 className="font-bold text-purple-900 text-lg">Questions about your results?</h3>
                  <p className="text-purple-700 text-sm">Chat with your AI Type Coach for personalized guidance and deeper exploration.</p>
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

        {/* INSIGHT TIER CONTENT - With TierGate */}
        <div id="insight-content">
          {/* Premium Section Header with Badge */}
          <div className="flex items-center justify-center gap-3 mb-8">
            <div className="h-px flex-1 bg-gradient-to-r from-transparent via-jung-primary/30 to-transparent" />
            <div className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-jung-primary to-jung-accent rounded-full shadow-sm">
              <Sparkles className="w-4 h-4 text-white" />
              <span className="text-xs font-bold uppercase tracking-wider text-white">Insight Analysis</span>
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <div className="h-px flex-1 bg-gradient-to-r from-transparent via-jung-primary/30 to-transparent" />
          </div>

          <TierGate requiredTier="insight" currentTier={tier} featureDescription="Unlock complete type analysis including archetypes, relationships, and career guidance">

            {/* Type Phenomenology */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
              <div className="bg-white p-6 rounded-lg border border-stone-200 relative overflow-hidden">
                <div className="absolute top-0 right-0 bg-jung-primary text-white text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-bl">
                  Premium
                </div>
                <h3 className="text-lg font-serif font-bold text-jung-dark mb-4 flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-jung-primary" />
                  {typePhenomenology.typeName}
                </h3>
                <div className="space-y-4 text-sm">
                  <div>
                    <span className="font-bold text-stone-700">Focus: </span>
                    <span className="text-stone-600">{typePhenomenology.focus}</span>
                  </div>
                  <div>
                    <span className="font-bold text-stone-700">Behavior: </span>
                    <span className="text-stone-600">{typePhenomenology.behavior}</span>
                  </div>
                  <div>
                    <span className="font-bold text-stone-700">Historical Parallel: </span>
                    <span className="text-stone-600 italic">{typePhenomenology.historicalExample}</span>
                  </div>
                </div>
              </div>

              {/* Full Attitude Analysis */}
              <div className="bg-stone-50 p-6 rounded-lg border-l-4 border-stone-400">
                <h3 className="text-xl font-serif font-bold text-stone-800 mb-2">
                  General Attitude: {attitudeType}
                </h3>
                <p className="text-stone-600 text-sm mb-4">
                  {attitude.desc}
                </p>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="bg-white p-3 rounded border border-stone-100">
                    <span className="font-bold text-emerald-700 block mb-1">Strengths</span>
                    {attitude.positive}
                  </div>
                  <div className="bg-white p-3 rounded border border-stone-100">
                    <span className="font-bold text-red-700 block mb-1">Shadow</span>
                    {attitude.negative}
                  </div>
                </div>
              </div>
            </div>

        {/* THE ARCHETYPAL STACK */}
        <section className="mb-16">
          <div className="flex items-start sm:items-center gap-3 mb-6 sm:mb-8 border-b border-stone-200 pb-4">
            <Layers className="w-6 h-6 sm:w-8 sm:h-8 text-jung-primary flex-shrink-0" />
            <div>
              <h2 className="text-2xl sm:text-3xl font-serif font-bold text-jung-dark">The Archetypal Stack</h2>
              <p className="text-xs sm:text-sm text-stone-500">The hierarchy of psychic functions from conscious to unconscious</p>
            </div>
          </div>

          <p className="text-stone-600 max-w-3xl mb-8">
            {STACK_POSITIONS.dominant.description.split('.')[0]}. This stack represents the journey from your most conscious, developed self (the Hero) to the primitive, unconscious doorway to the Self (the Anima/Animus).
          </p>

          <div className="space-y-6">
            {/* Dominant */}
            <div className="bg-white rounded-lg border-l-8 border-jung-primary shadow-sm overflow-hidden">
              <div className="p-6">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4">
                  <div>
                    <span className="text-xs font-bold tracking-widest uppercase text-jung-primary mb-1 block">
                      {STACK_POSITIONS.dominant.archetype} • {STACK_POSITIONS.dominant.name}
                    </span>
                    <h3 className="text-2xl font-serif font-bold text-jung-dark">
                      {FUNCTION_DESCRIPTIONS[results.stack.dominant.function].title} ({results.stack.dominant.function})
                    </h3>
                  </div>
                  <div className="mt-2 md:mt-0 px-3 py-1 bg-jung-primary/10 rounded text-jung-primary font-mono text-sm font-bold">
                    Score: {results.stack.dominant.score}
                  </div>
                </div>
                <p className="text-stone-600 mb-4">{FUNCTION_DESCRIPTIONS[results.stack.dominant.function].desc}</p>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="bg-emerald-50/50 p-4 rounded border border-emerald-100">
                    <h4 className="font-bold text-emerald-800 mb-2 text-sm">Positive Manifestation</h4>
                    <p className="text-sm text-stone-700">{FUNCTION_DESCRIPTIONS[results.stack.dominant.function].positive}</p>
                  </div>
                  <div className="bg-red-50/50 p-4 rounded border border-red-100">
                    <h4 className="font-bold text-red-800 mb-2 text-sm">Shadow Manifestation</h4>
                    <p className="text-sm text-stone-700">{FUNCTION_DESCRIPTIONS[results.stack.dominant.function].negative}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-center py-2 text-stone-300"><ArrowDown className="w-6 h-6" /></div>

            {/* Auxiliary */}
            <div className="bg-white rounded-lg border-l-8 border-jung-accent shadow-sm overflow-hidden">
              <div className="p-6">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4">
                  <div>
                    <span className="text-xs font-bold tracking-widest uppercase text-jung-accent mb-1 block">
                      {STACK_POSITIONS.auxiliary.archetype} • {STACK_POSITIONS.auxiliary.name}
                    </span>
                    <h3 className="text-xl font-serif font-bold text-jung-dark">
                      {FUNCTION_DESCRIPTIONS[results.stack.auxiliary.function].title} ({results.stack.auxiliary.function})
                    </h3>
                  </div>
                  <div className="mt-2 md:mt-0 px-3 py-1 bg-stone-100 rounded text-stone-600 font-mono text-sm font-bold">
                    Score: {results.stack.auxiliary.score}
                  </div>
                </div>
                <p className="text-stone-600 text-sm mb-3">{STACK_POSITIONS.auxiliary.description}</p>
                <p className="text-stone-500 text-sm italic">{FUNCTION_DESCRIPTIONS[results.stack.auxiliary.function].desc}</p>
              </div>
            </div>

            <div className="flex justify-center py-2 text-stone-300"><ArrowDown className="w-6 h-6" /></div>

            {/* Tertiary */}
            <div className="bg-white rounded-lg border-l-8 border-stone-400 shadow-sm overflow-hidden opacity-90">
              <div className="p-6">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4">
                  <div>
                    <span className="text-xs font-bold tracking-widest uppercase text-stone-500 mb-1 block">
                      {STACK_POSITIONS.tertiary.archetype} • {STACK_POSITIONS.tertiary.name}
                    </span>
                    <h3 className="text-lg font-serif font-bold text-stone-700">
                      {FUNCTION_DESCRIPTIONS[results.stack.tertiary.function].title} ({results.stack.tertiary.function})
                    </h3>
                  </div>
                  <div className="mt-2 md:mt-0 px-3 py-1 bg-stone-100 rounded text-stone-600 font-mono text-sm font-bold">
                    Score: {results.stack.tertiary.score}
                  </div>
                </div>
                <p className="text-stone-600 text-sm">{STACK_POSITIONS.tertiary.description}</p>
              </div>
            </div>

            <div className="flex justify-center py-2 text-stone-300"><ArrowDown className="w-6 h-6" /></div>

            {/* Inferior */}
            <div className="bg-stone-900 rounded-lg shadow-md overflow-hidden text-stone-100">
              <div className="p-6">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4">
                  <div>
                    <span className="text-xs font-bold tracking-widest uppercase text-stone-400 mb-1 block">
                      {STACK_POSITIONS.inferior.archetype} • {STACK_POSITIONS.inferior.name}
                    </span>
                    <h3 className="text-xl font-serif font-bold text-white">
                      {FUNCTION_DESCRIPTIONS[results.stack.inferior.function].title} ({results.stack.inferior.function})
                    </h3>
                  </div>
                  <div className="mt-2 md:mt-0 px-3 py-1 bg-stone-800 rounded text-stone-300 font-mono text-sm font-bold">
                    Score: {results.stack.inferior.score}
                  </div>
                </div>
                <p className="text-stone-300 mb-4 leading-relaxed">
                  {STACK_POSITIONS.inferior.description}
                </p>
                <p className="text-stone-400 text-sm italic">
                  "{FUNCTION_DESCRIPTIONS[results.stack.inferior.function].quote}"
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* THE GRIP - Inferior Function Under Stress */}
        <section className="mb-16">
          <div className="flex items-start sm:items-center gap-3 mb-6 sm:mb-8 border-b border-stone-200 pb-4">
            <AlertTriangle className="w-6 h-6 sm:w-8 sm:h-8 text-amber-600 flex-shrink-0" />
            <div>
              <h2 className="text-2xl sm:text-3xl font-serif font-bold text-jung-dark">The Grip</h2>
              <p className="text-xs sm:text-sm text-stone-500">When the Inferior Function Takes Over Under Stress</p>
            </div>
          </div>

          <div className="bg-amber-50 border border-amber-200 rounded-lg p-6 mb-6">
            <p className="text-stone-700 mb-4">
              Under extreme stress, fatigue, or when your dominant function fails repeatedly, you may fall into "The Grip" — a state where your inferior function ({grip.inferiorFunction}) erupts in its most primitive, undifferentiated form.
            </p>
            <div className="bg-white rounded-lg p-4 border border-amber-100">
              <h4 className="font-bold text-amber-800 mb-2">What The Grip Looks Like For You:</h4>
              <p className="text-stone-700 text-sm">{grip.gripDescription}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white p-4 rounded-lg border border-stone-200">
              <h4 className="font-bold text-stone-700 mb-2 text-sm uppercase tracking-wide">Normal State</h4>
              <p className="text-sm text-stone-600">{grip.normalState}</p>
            </div>
            <div className="bg-white p-4 rounded-lg border border-stone-200">
              <h4 className="font-bold text-stone-700 mb-2 text-sm uppercase tracking-wide">Common Triggers</h4>
              <p className="text-sm text-stone-600">{grip.triggers}</p>
            </div>
            <div className="bg-white p-4 rounded-lg border border-stone-200">
              <h4 className="font-bold text-stone-700 mb-2 text-sm uppercase tracking-wide">Path to Recovery</h4>
              <p className="text-sm text-stone-600">{grip.recovery}</p>
            </div>
          </div>
        </section>

        {/* RELATIONSHIPS & COMPATIBILITY */}
        <section className="mb-16">
          <div className="flex items-start sm:items-center gap-3 mb-6 sm:mb-8 border-b border-stone-200 pb-4">
            <Heart className="w-6 h-6 sm:w-8 sm:h-8 text-rose-500 flex-shrink-0" />
            <div>
              <h2 className="text-2xl sm:text-3xl font-serif font-bold text-jung-dark">Relationships & Compatibility</h2>
              <p className="text-xs sm:text-sm text-stone-500">How your dominant function shapes your connections</p>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-stone-200 p-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 bg-jung-primary text-white text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-bl">
              Premium
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-emerald-50 rounded-lg p-5 border border-emerald-100">
                <h4 className="font-bold text-emerald-800 mb-3 flex items-center gap-2">
                  <span className="w-6 h-6 bg-emerald-200 rounded-full flex items-center justify-center text-emerald-700 text-sm">✓</span>
                  Relationship Strengths
                </h4>
                <p className="text-sm text-stone-700">{RELATIONSHIPS_INSIGHTS[dominantFunc]?.strengths}</p>
              </div>

              <div className="bg-amber-50 rounded-lg p-5 border border-amber-100">
                <h4 className="font-bold text-amber-800 mb-3 flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-amber-600" />
                  Relationship Challenges
                </h4>
                <p className="text-sm text-stone-700">{RELATIONSHIPS_INSIGHTS[dominantFunc]?.challenges}</p>
              </div>

              <div className="bg-rose-50 rounded-lg p-5 border border-rose-100">
                <h4 className="font-bold text-rose-800 mb-3 flex items-center gap-2">
                  <Heart className="w-5 h-5 text-rose-500" />
                  Ideal Partners
                </h4>
                <p className="text-sm text-stone-700">{RELATIONSHIPS_INSIGHTS[dominantFunc]?.idealPartners}</p>
              </div>

              <div className="bg-jung-primary/5 rounded-lg p-5 border border-jung-primary/20">
                <h4 className="font-bold text-jung-dark mb-3 flex items-center gap-2">
                  <Compass className="w-5 h-5 text-jung-primary" />
                  Growth in Relationships
                </h4>
                <p className="text-sm text-stone-700">{RELATIONSHIPS_INSIGHTS[dominantFunc]?.growthInRelationships}</p>
              </div>
            </div>
          </div>
        </section>

        {/* CAREER ALIGNMENT */}
        <section className="mb-16">
          <div className="flex items-start sm:items-center gap-3 mb-6 sm:mb-8 border-b border-stone-200 pb-4">
            <Briefcase className="w-6 h-6 sm:w-8 sm:h-8 text-blue-600 flex-shrink-0" />
            <div>
              <h2 className="text-2xl sm:text-3xl font-serif font-bold text-jung-dark">Career Alignment</h2>
              <p className="text-xs sm:text-sm text-stone-500">Professional paths aligned with your cognitive strengths</p>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-stone-200 p-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 bg-jung-primary text-white text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-bl">
              Insight
            </div>

            <div className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-blue-50 rounded-lg p-5 border border-blue-100">
                  <h4 className="font-bold text-blue-800 mb-3">Natural Strengths</h4>
                  <p className="text-sm text-stone-700">{CAREER_GUIDANCE[dominantFunc]?.naturalStrengths}</p>
                </div>

                <div className="bg-stone-50 rounded-lg p-5 border border-stone-200">
                  <h4 className="font-bold text-stone-700 mb-3">Ideal Environments</h4>
                  <p className="text-sm text-stone-600">{CAREER_GUIDANCE[dominantFunc]?.idealEnvironments}</p>
                </div>
              </div>

              <div className="bg-white border border-stone-200 rounded-lg p-5">
                <h4 className="font-bold text-jung-dark mb-4">Suggested Roles</h4>
                <div className="flex flex-wrap gap-2">
                  {CAREER_GUIDANCE[dominantFunc]?.roles.map((role, index) => (
                    <span key={index} className="px-3 py-1.5 bg-jung-primary/10 text-jung-primary rounded-full text-sm font-medium">
                      {role}
                    </span>
                  ))}
                </div>
              </div>

              <div className="bg-amber-50 border border-amber-200 rounded-lg p-5">
                <h4 className="font-bold text-amber-800 mb-2 flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-amber-600" />
                  Watch Out For
                </h4>
                <p className="text-sm text-stone-700">{CAREER_GUIDANCE[dominantFunc]?.watchOutFor}</p>
              </div>
            </div>
          </div>
        </section>

          </TierGate>
        </div>

        {/* MASTERY TIER CONTENT */}
        <div id="mastery-content">
          {/* Mastery Section Header */}
          <div className="flex items-center justify-center gap-3 mb-8 mt-12">
            <div className="h-px flex-1 bg-gradient-to-r from-transparent via-purple-300 to-transparent" />
            <div className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-full shadow-sm">
              <Crown className="w-4 h-4 text-white" />
              <span className="text-xs font-bold uppercase tracking-wider text-white">Mastery Tools</span>
              <Crown className="w-4 h-4 text-white" />
            </div>
            <div className="h-px flex-1 bg-gradient-to-r from-transparent via-purple-300 to-transparent" />
          </div>

          <TierGate requiredTier="mastery" currentTier={tier} featureDescription="Unlock advanced tools including AI Type Coach, individuation roadmap, and shadow work exercises">

        {/* INDIVIDUATION */}
        <section className="mb-16">
          <div className="flex items-start sm:items-center gap-3 mb-6 sm:mb-8 border-b border-stone-200 pb-4">
            <Compass className="w-6 h-6 sm:w-8 sm:h-8 text-jung-secondary flex-shrink-0" />
            <div>
              <h2 className="text-2xl sm:text-3xl font-serif font-bold text-jung-dark">The Path of Individuation</h2>
              <p className="text-xs sm:text-sm text-stone-500">The Journey Toward Wholeness</p>
            </div>
          </div>

          <p className="text-stone-600 mb-8 max-w-3xl">
            {INDIVIDUATION_GUIDANCE.intro}
          </p>

          <div className="bg-stone-100 rounded-lg p-6 mb-6">
            <h4 className="font-bold text-jung-dark mb-4">Working With Your Inferior Function ({results.stack.inferior.function})</h4>
            <p className="text-stone-600 text-sm">
              {INDIVIDUATION_GUIDANCE.inferiorFunctionWork}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {INDIVIDUATION_GUIDANCE.stages.slice(0, 3).map((stage, i) => (
              <div key={i} className="bg-white p-4 rounded-lg border border-stone-200">
                <h4 className="font-bold text-jung-primary mb-2 text-sm">{stage.name}</h4>
                <p className="text-xs text-stone-500 mb-2">{stage.description}</p>
                <p className="text-sm text-stone-700 font-medium">{stage.task}</p>
              </div>
            ))}
          </div>

          <div className="mt-6 p-4 bg-stone-800 text-stone-100 rounded-lg">
            <p className="text-sm italic">
              <strong>Caution:</strong> {INDIVIDUATION_GUIDANCE.warning}
            </p>
          </div>
        </section>

        {/* ACTIVE IMAGINATION EXERCISES */}
        <section className="mb-16">
          <div className="flex items-start sm:items-center gap-3 mb-6 sm:mb-8 border-b border-stone-200 pb-4">
            <Sparkles className="w-6 h-6 sm:w-8 sm:h-8 text-purple-500 flex-shrink-0" />
            <div>
              <h2 className="text-2xl sm:text-3xl font-serif font-bold text-jung-dark">Active Imagination Exercises</h2>
              <p className="text-xs sm:text-sm text-stone-500">Jung's technique for dialoguing with the unconscious</p>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-stone-200 p-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 bg-jung-primary text-white text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-bl">
              Premium
            </div>

            <p className="text-stone-600 mb-6">
              Active Imagination is Jung's method for engaging directly with unconscious contents. Unlike passive daydreaming, it involves consciously entering a meditative state and allowing images to arise, then actively participating with them. These exercises can reveal aspects of your shadow, anima/animus, and deeper Self.
            </p>

            <div className="space-y-4">
              {ACTIVE_IMAGINATION_PROMPTS.map((exercise, index) => (
                <details key={index} className="group bg-purple-50 rounded-lg border border-purple-100 overflow-hidden">
                  <summary className="flex items-center justify-between p-4 cursor-pointer hover:bg-purple-100 transition-colors">
                    <div className="flex items-center gap-3">
                      <span className="w-8 h-8 bg-purple-200 text-purple-700 rounded-full flex items-center justify-center font-bold text-sm">
                        {index + 1}
                      </span>
                      <h4 className="font-bold text-purple-900">{exercise.title}</h4>
                    </div>
                    <ChevronDown className="w-5 h-5 text-purple-500 group-open:rotate-180 transition-transform" />
                  </summary>
                  <div className="px-4 pb-4 pt-2 bg-white border-t border-purple-100">
                    <p className="text-sm text-stone-700 leading-relaxed">{exercise.prompt}</p>
                  </div>
                </details>
              ))}
            </div>

            <div className="mt-6 p-4 bg-purple-100 rounded-lg">
              <p className="text-sm text-purple-900 italic">
                <strong>Note:</strong> Active Imagination should be approached with respect. If you have a history of trauma or dissociation, consider working with a qualified therapist before engaging deeply with unconscious material.
              </p>
            </div>
          </div>
        </section>

        {/* DREAM JOURNALING GUIDE */}
        <section className="mb-16">
          <div className="flex items-start sm:items-center gap-3 mb-6 sm:mb-8 border-b border-stone-200 pb-4">
            <Moon className="w-6 h-6 sm:w-8 sm:h-8 text-indigo-500 flex-shrink-0" />
            <div>
              <h2 className="text-2xl sm:text-3xl font-serif font-bold text-jung-dark">Dream Journaling Guide</h2>
              <p className="text-xs sm:text-sm text-stone-500">The royal road to the unconscious</p>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-stone-200 p-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 bg-jung-primary text-white text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-bl">
              Premium
            </div>

            <p className="text-stone-600 mb-6">{DREAM_JOURNALING_TEMPLATE.intro}</p>

            <div className="grid md:grid-cols-2 gap-6 mb-6">
              <div className="bg-indigo-50 rounded-lg p-5 border border-indigo-100">
                <h4 className="font-bold text-indigo-800 mb-4 flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-indigo-600" />
                  Questions to Ask About Your Dreams
                </h4>
                <ol className="space-y-3 text-sm text-stone-700">
                  {DREAM_JOURNALING_TEMPLATE.questions.map((question, index) => (
                    <li key={index} className="flex gap-2">
                      <span className="font-bold text-indigo-600 flex-shrink-0">{index + 1}.</span>
                      <span>{question}</span>
                    </li>
                  ))}
                </ol>
              </div>

              <div className="bg-stone-50 rounded-lg p-5 border border-stone-200">
                <h4 className="font-bold text-stone-700 mb-4 flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-stone-500" />
                  Common Jungian Symbols
                </h4>
                <ul className="space-y-2 text-sm text-stone-600">
                  {DREAM_JOURNALING_TEMPLATE.symbolsToNotice.map((symbol, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <span className="text-indigo-400 mt-1">◆</span>
                      <span>{symbol}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="bg-indigo-900 text-white rounded-lg p-5">
              <h4 className="font-bold mb-2 flex items-center gap-2">
                <Moon className="w-5 h-5" />
                Jungian Tip
              </h4>
              <p className="text-sm text-indigo-100 leading-relaxed">{DREAM_JOURNALING_TEMPLATE.jungianTip}</p>
            </div>
          </div>
        </section>

          </TierGate>
        </div>

        {/* AI-POWERED INSIGHT DEEP ANALYSIS - Goes back to Insight tier */}
        <TierGate requiredTier="insight" currentTier={tier} featureDescription="Unlock AI-powered personalized analysis with detailed insights">

        {/* AI-POWERED PREMIUM DEEP ANALYSIS */}
        <section className="mb-16">
          <div className="flex items-start sm:items-center gap-3 mb-6 sm:mb-8 border-b border-purple-200 pb-4">
            <div className="p-2 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-lg flex-shrink-0">
              <Brain className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
            </div>
            <div>
              <h2 className="text-2xl sm:text-3xl font-serif font-bold text-jung-dark">AI-Powered Deep Analysis</h2>
              <p className="text-xs sm:text-sm text-stone-500">Personalized insights generated specifically for your unique profile</p>
            </div>
          </div>

          {isLoadingPremium ? (
            <div className="flex flex-col items-center justify-center py-16 bg-gradient-to-br from-purple-50 to-indigo-50 rounded-lg border border-purple-100">
              <Loader2 className="w-10 h-10 animate-spin text-purple-500 mb-4" />
              <span className="text-purple-700 font-medium">Generating your comprehensive personalized analysis...</span>
              <p className="text-purple-500 text-sm mt-2">This may take a moment as we craft detailed insights for each section.</p>
            </div>
          ) : premiumError ? (
            <div className="flex items-center gap-3 p-6 bg-red-50 border border-red-200 rounded-lg">
              <AlertCircle className="w-6 h-6 text-red-500 flex-shrink-0" />
              <div>
                <p className="text-red-700 font-medium">Unable to generate AI analysis</p>
                <p className="text-red-600 text-sm">Please refresh the page to try again.</p>
              </div>
            </div>
          ) : premiumAnalysis ? (
            <div className="space-y-8">
              {/* Overview */}
              <div className="bg-white rounded-lg border border-stone-200 p-6 relative overflow-hidden">
                <div className="absolute top-0 right-0 bg-gradient-to-r from-purple-500 to-indigo-500 text-white text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-bl">
                  AI Generated
                </div>
                <h3 className="text-xl font-serif font-bold text-jung-dark mb-4 flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-purple-600" />
                  Comprehensive Profile Overview
                </h3>
                <div className="prose prose-stone max-w-none">
                  <FormattedText text={premiumAnalysis.overview} />
                </div>
              </div>

              {/* Function Analysis */}
              <div className="bg-white rounded-lg border border-stone-200 p-6 relative overflow-hidden">
                <div className="absolute top-0 right-0 bg-gradient-to-r from-purple-500 to-indigo-500 text-white text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-bl">
                  AI Generated
                </div>
                <h3 className="text-xl font-serif font-bold text-jung-dark mb-4 flex items-center gap-2">
                  <Layers className="w-5 h-5 text-purple-600" />
                  Detailed Function Analysis
                </h3>
                <div className="prose prose-stone max-w-none">
                  <FormattedText text={premiumAnalysis.functionAnalysis} />
                </div>
              </div>

              {/* Archetypes */}
              <div className="bg-white rounded-lg border border-stone-200 p-6 relative overflow-hidden">
                <div className="absolute top-0 right-0 bg-gradient-to-r from-purple-500 to-indigo-500 text-white text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-bl">
                  AI Generated
                </div>
                <h3 className="text-xl font-serif font-bold text-jung-dark mb-4 flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-purple-600" />
                  Your Archetypal Patterns
                </h3>
                <div className="prose prose-stone max-w-none">
                  <FormattedText text={premiumAnalysis.archetypes} />
                </div>
              </div>

              {/* The Grip - AI Enhanced */}
              <div className="bg-amber-50 rounded-lg border border-amber-200 p-6 relative overflow-hidden">
                <div className="absolute top-0 right-0 bg-gradient-to-r from-purple-500 to-indigo-500 text-white text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-bl">
                  AI Generated
                </div>
                <h3 className="text-xl font-serif font-bold text-amber-900 mb-4 flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-amber-600" />
                  Deep Dive: Your Grip Experience
                </h3>
                <div className="prose prose-stone max-w-none">
                  <FormattedText text={premiumAnalysis.theGrip} />
                </div>
              </div>

              {/* Relationships - AI Enhanced */}
              <div className="bg-rose-50 rounded-lg border border-rose-200 p-6 relative overflow-hidden">
                <div className="absolute top-0 right-0 bg-gradient-to-r from-purple-500 to-indigo-500 text-white text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-bl">
                  AI Generated
                </div>
                <h3 className="text-xl font-serif font-bold text-rose-900 mb-4 flex items-center gap-2">
                  <Heart className="w-5 h-5 text-rose-500" />
                  Personalized Relationship Insights
                </h3>
                <div className="prose prose-stone max-w-none">
                  <FormattedText text={premiumAnalysis.relationships} />
                </div>
              </div>

              {/* Career - AI Enhanced */}
              <div className="bg-blue-50 rounded-lg border border-blue-200 p-6 relative overflow-hidden">
                <div className="absolute top-0 right-0 bg-gradient-to-r from-purple-500 to-indigo-500 text-white text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-bl">
                  AI Generated
                </div>
                <h3 className="text-xl font-serif font-bold text-blue-900 mb-4 flex items-center gap-2">
                  <Briefcase className="w-5 h-5 text-blue-600" />
                  Career Path Analysis
                </h3>
                <div className="prose prose-stone max-w-none">
                  <FormattedText text={premiumAnalysis.career} />
                </div>
              </div>

              {/* Individuation - AI Enhanced */}
              <div className="bg-emerald-50 rounded-lg border border-emerald-200 p-6 relative overflow-hidden">
                <div className="absolute top-0 right-0 bg-gradient-to-r from-purple-500 to-indigo-500 text-white text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-bl">
                  AI Generated
                </div>
                <h3 className="text-xl font-serif font-bold text-emerald-900 mb-4 flex items-center gap-2">
                  <Compass className="w-5 h-5 text-emerald-600" />
                  Your Individuation Journey
                </h3>
                <div className="prose prose-stone max-w-none">
                  <FormattedText text={premiumAnalysis.individuation} />
                </div>
              </div>

              {/* Shadow Work */}
              <div className="bg-stone-800 rounded-lg border border-stone-700 p-6 relative overflow-hidden">
                <div className="absolute top-0 right-0 bg-gradient-to-r from-purple-500 to-indigo-500 text-white text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-bl">
                  AI Generated
                </div>
                <h3 className="text-xl font-serif font-bold text-white mb-4 flex items-center gap-2">
                  <Moon className="w-5 h-5 text-stone-300" />
                  Shadow Integration Work
                </h3>
                <div className="prose prose-invert max-w-none">
                  <FormattedText text={premiumAnalysis.shadow} className="[&_p]:text-stone-300" />
                </div>
              </div>

              {/* Growth Roadmap */}
              <div className="bg-gradient-to-br from-purple-50 to-indigo-50 rounded-lg border border-purple-200 p-6 relative overflow-hidden">
                <div className="absolute top-0 right-0 bg-gradient-to-r from-purple-500 to-indigo-500 text-white text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-bl">
                  AI Generated
                </div>
                <h3 className="text-xl font-serif font-bold text-purple-900 mb-4 flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-purple-600" />
                  Personal Growth Roadmap
                </h3>
                <div className="prose prose-stone max-w-none">
                  <FormattedText text={premiumAnalysis.growth} />
                </div>
              </div>

              {/* Dream Guidance */}
              <div className="bg-indigo-50 rounded-lg border border-indigo-200 p-6 relative overflow-hidden">
                <div className="absolute top-0 right-0 bg-gradient-to-r from-purple-500 to-indigo-500 text-white text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-bl">
                  AI Generated
                </div>
                <h3 className="text-xl font-serif font-bold text-indigo-900 mb-4 flex items-center gap-2">
                  <Moon className="w-5 h-5 text-indigo-600" />
                  Personalized Dreamwork Guide
                </h3>
                <div className="prose prose-stone max-w-none">
                  <FormattedText text={premiumAnalysis.dreams} />
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-12 bg-stone-50 rounded-lg border border-stone-200">
              <Brain className="w-12 h-12 text-stone-300 mx-auto mb-4" />
              <p className="text-stone-500">AI analysis will be generated shortly...</p>
            </div>
          )}
        </section>
        </TierGate>

        {/* Footer */}
        <div className="text-center text-xs text-stone-400 pt-6 border-t border-stone-200">
          <p>Based on the typological work of Carl Gustav Jung (Psychological Types, CW Vol. 6)</p>
          <p className="mt-1 italic">"The meeting of two personalities is like the contact of two chemical substances: if there is any reaction, both are transformed."</p>
        </div>
      </div>

      {/* Actions */}
      <div className="border-t border-stone-200 pt-8 mt-8">
        <div className="flex flex-col sm:flex-row justify-center gap-3 sm:gap-4 mb-6">
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
          <Button variant="outline" onClick={() => {
            localStorage.removeItem('jungian_assessment_progress');
            localStorage.removeItem('jungian_assessment_results');
            navigate('/assessment');
          }} className="w-full sm:w-auto">
            <RefreshCcw className="mr-2 h-4 w-4" /> Retake Assessment
          </Button>
        </div>

        {shareSlug && (
          <div className="mt-6">
            <div className="flex items-center justify-center gap-2 mb-4">
              <Share2 className="w-5 h-5 text-jung-primary" />
              <span className="text-sm font-medium text-stone-600">Share Your Results</span>
            </div>
            <div className="flex flex-wrap justify-center gap-2 sm:gap-3">
              <button
                onClick={shareOnTwitter}
                className="flex items-center gap-2 px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors text-sm font-medium min-h-[44px]"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                </svg>
                Twitter/X
              </button>
              <button
                onClick={shareOnFacebook}
                className="flex items-center gap-2 px-4 py-2 bg-[#1877F2] text-white rounded-lg hover:bg-[#166FE5] transition-colors text-sm font-medium min-h-[44px]"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
                Facebook
              </button>
              <button
                onClick={shareOnLinkedIn}
                className="flex items-center gap-2 px-4 py-2 bg-[#0A66C2] text-white rounded-lg hover:bg-[#004182] transition-colors text-sm font-medium min-h-[44px]"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                </svg>
                LinkedIn
              </button>
              <button
                onClick={copyLink}
                className="flex items-center gap-2 px-4 py-2 bg-stone-100 text-stone-700 rounded-lg hover:bg-stone-200 transition-colors text-sm font-medium border border-stone-200 min-h-[44px]"
              >
                {linkCopied ? (
                  <>
                    <Check className="w-4 h-4 text-green-600" />
                    <span className="text-green-600">Copied!</span>
                  </>
                ) : (
                  <>
                    <Link2 className="w-4 h-4" />
                    Copy Link
                  </>
                )}
              </button>
              <button
                onClick={() => setShowInstagramPreview(true)}
                className="flex items-center gap-2 px-4 py-2 text-white rounded-lg hover:opacity-90 transition-opacity text-sm font-medium min-h-[44px]"
                style={{
                  background: 'linear-gradient(45deg, #f09433 0%, #e6683c 25%, #dc2743 50%, #cc2366 75%, #bc1888 100%)'
                }}
              >
                <Camera className="w-4 h-4" />
                Share to Story
              </button>
            </div>
          </div>
        )}

        {isAuthenticated && (
          <div className="mt-8 border-t border-stone-200 pt-8">
            <button
              onClick={() => setShowHistory(!showHistory)}
              className="flex items-center justify-center gap-2 w-full py-3 text-stone-600 hover:text-jung-primary transition-colors"
            >
              <History className="w-5 h-5" />
              <span className="font-medium">Your Assessment History</span>
              {showHistory ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>

            {showHistory && (
              <div className="mt-4">
                {isLoadingHistory ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="w-6 h-6 animate-spin text-stone-400" />
                    <span className="ml-2 text-stone-500">Loading history...</span>
                  </div>
                ) : historyResults.length === 0 ? (
                  <div className="text-center py-8 text-stone-500">
                    <History className="w-12 h-12 mx-auto mb-3 opacity-30" />
                    <p>No saved assessments yet.</p>
                    <p className="text-sm mt-1">Your results will appear here after you complete an assessment.</p>
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
                          className={`flex items-center justify-between p-4 rounded-lg border transition-all ${
                            isViewing
                              ? 'border-jung-primary bg-jung-primary/5'
                              : 'border-stone-200 bg-white hover:border-stone-300'
                          }`}
                        >
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <span className="font-medium text-stone-800">{funcTitle}</span>
                              <span className="text-xs px-2 py-0.5 bg-stone-100 rounded text-stone-500">{dominantFunc}</span>
                              {isViewing && (
                                <span className="text-xs px-2 py-0.5 bg-jung-primary text-white rounded">Viewing</span>
                              )}
                            </div>
                            <p className="text-sm text-stone-500 mt-1">{dateStr}</p>
                          </div>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => loadHistoricalResult(result)}
                              className="flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-jung-primary hover:bg-jung-primary/10 rounded transition-colors"
                            >
                              <Eye className="w-4 h-4" />
                              View
                            </button>
                            <button
                              onClick={() => deleteResult(result.id)}
                              disabled={deletingResultId === result.id}
                              className="flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-red-600 hover:bg-red-50 rounded transition-colors disabled:opacity-50"
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
        )}
      </div>

      {showInstagramPreview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
          <div className="relative max-h-[90vh] overflow-auto bg-stone-900 rounded-2xl shadow-2xl">
            <div className="sticky top-0 z-10 flex items-center justify-between p-4 bg-stone-900 border-b border-stone-700">
              <h3 className="text-lg font-medium text-white">Story Image Preview</h3>
              <button
                onClick={() => setShowInstagramPreview(false)}
                className="p-2 text-stone-400 hover:text-white transition-colors rounded-full hover:bg-stone-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-4">
              <div className="mx-auto" style={{ width: '270px', height: '480px', overflow: 'hidden' }}>
                <div style={{ transform: 'scale(0.25)', transformOrigin: 'top left' }}>
                  <div ref={instagramCardRef}>
                    <InstagramStoryCard
                      dominantFunction={results.stack.dominant.function}
                      scores={results.scores}
                      stack={results.stack}
                    />
                  </div>
                </div>
              </div>
            </div>
            
            <div className="sticky bottom-0 flex gap-3 p-4 bg-stone-900 border-t border-stone-700">
              <button
                onClick={() => setShowInstagramPreview(false)}
                className="flex-1 px-4 py-3 text-stone-300 bg-stone-700 hover:bg-stone-600 rounded-lg font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={generateInstagramStory}
                disabled={isGeneratingStory}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-3 text-white rounded-lg font-medium transition-opacity hover:opacity-90 disabled:opacity-50"
                style={{
                  background: 'linear-gradient(45deg, #f09433 0%, #e6683c 25%, #dc2743 50%, #cc2366 75%, #bc1888 100%)'
                }}
              >
                {isGeneratingStory ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Share2 className="w-4 h-4" />
                    Share
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {isUnlocked && results && (
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
