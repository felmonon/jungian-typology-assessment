import React, { useState, useEffect } from 'react';
import { Sparkles, CheckCircle, ArrowRight, MessageCircle } from 'lucide-react';
import { AI_DEMO_CONVERSATION } from './data';

export const AITypeCoachSection: React.FC = () => {
  const [displayedMessage, setDisplayedMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showResponse, setShowResponse] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowResponse(true);
      setIsTyping(true);
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!showResponse || !isTyping) return;
    const fullMessage = AI_DEMO_CONVERSATION[1].message;
    let index = 0;
    const typeInterval = setInterval(() => {
      if (index < fullMessage.length) {
        setDisplayedMessage(fullMessage.slice(0, index + 1));
        index++;
      } else {
        setIsTyping(false);
        clearInterval(typeInterval);
      }
    }, 15);
    return () => clearInterval(typeInterval);
  }, [showResponse, isTyping]);

  return (
    <section className="py-20 lg:py-28 bg-jung-surface border-y border-jung-border">
      <div className="editorial-container">
        <div className="editorial-grid items-center">
          {/* Left Column - Text */}
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-jung-accent-light rounded-full">
              <Sparkles className="w-4 h-4 text-jung-accent" />
              <span className="text-sm font-sans font-medium text-jung-primary">Premium Feature</span>
            </div>
            <h2 className="text-display text-3xl sm:text-4xl text-jung-dark">
              AI Type Coach in Action
            </h2>
            <p className="text-body text-lg text-jung-secondary">
              Ask deep questions about your psychology. Get personalized, Jungian-informed insights—not generic advice.
            </p>
            <ul className="space-y-3">
              <li className="flex items-start gap-3 text-jung-secondary">
                <CheckCircle className="w-5 h-5 text-jung-accent flex-shrink-0 mt-0.5" />
                <span>Unlimited conversations about your type</span>
              </li>
              <li className="flex items-start gap-3 text-jung-secondary">
                <CheckCircle className="w-5 h-5 text-jung-accent flex-shrink-0 mt-0.5" />
                <span>Shadow work guidance specific to your profile</span>
              </li>
              <li className="flex items-start gap-3 text-jung-secondary">
                <CheckCircle className="w-5 h-5 text-jung-accent flex-shrink-0 mt-0.5" />
                <span>Relationship and career insights</span>
              </li>
            </ul>
          </div>

          {/* Right Column - Chat Demo */}
          <div className="bg-jung-base rounded-2xl border border-jung-border overflow-hidden shadow-lg">
            {/* Chat Header */}
            <div className="bg-jung-dark text-white px-6 py-4 flex items-center gap-3">
              <div className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center">
                <MessageCircle className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-sans font-semibold">AI Type Coach</h4>
                <p className="text-sm text-white/60">Powered by your assessment results</p>
              </div>
            </div>

            {/* Chat Messages */}
            <div className="p-6 space-y-4 min-h-[350px] max-h-[400px] overflow-y-auto">
              {/* User Message */}
              <div className="flex justify-end">
                <div className="bg-jung-dark text-white px-4 py-3 rounded-2xl rounded-br-md max-w-[85%]">
                  <p className="text-sm">{AI_DEMO_CONVERSATION[0].message}</p>
                </div>
              </div>

              {/* AI Response */}
              {showResponse && (
                <div className="flex justify-start">
                  <div className="bg-jung-surface border border-jung-border px-4 py-3 rounded-2xl rounded-bl-md max-w-[85%]">
                    <div className="prose-editorial text-sm">
                      {displayedMessage.split('\n\n').map((paragraph, idx) => {
                        if (paragraph.startsWith('**')) {
                          return (
                            <p key={idx} className="font-semibold text-jung-dark mt-3 first:mt-0">
                              {paragraph.replace(/\*\*/g, '')}
                            </p>
                          );
                        }
                        return <p key={idx} className="text-jung-secondary mt-2 first:mt-0">{paragraph}</p>;
                      })}
                      {isTyping && (
                        <span className="inline-block w-2 h-4 bg-jung-accent animate-pulse ml-1" />
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Chat Input (decorative) */}
            <div className="border-t border-jung-border px-4 py-3 bg-jung-surface">
              <div className="flex items-center gap-3">
                <input
                  type="text"
                  placeholder="Ask about your type, relationships, career..."
                  className="flex-1 px-4 py-2.5 bg-jung-base rounded-lg text-sm text-jung-muted cursor-not-allowed border border-jung-border"
                  disabled
                />
                <button className="w-10 h-10 bg-jung-border rounded-lg flex items-center justify-center cursor-not-allowed">
                  <ArrowRight className="w-5 h-5 text-jung-muted" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
