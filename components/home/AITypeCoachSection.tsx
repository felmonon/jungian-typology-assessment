import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence, type Variants } from 'framer-motion';
import { Sparkles, CheckCircle, ArrowRight, MessageCircle, Bot, User } from 'lucide-react';
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

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.15 },
    },
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, x: -20 },
    visible: {
      opacity: 1,
      x: 0,
      transition: { duration: 0.6, ease: "easeOut" },
    },
  };

  return (
    <section className="py-24 lg:py-32 bg-jung-dark relative overflow-hidden">
      {/* Decorative Orbs */}
      <div className="absolute top-1/4 left-0 w-96 h-96 bg-jung-accent/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-0 w-64 h-64 bg-jung-gold/5 rounded-full blur-[100px] pointer-events-none" />

      <div className="editorial-container relative z-10">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={containerVariants}
          className="grid lg:grid-cols-2 gap-16 items-center"
        >
          {/* Left Column - Text */}
          <div className="space-y-10">
            <motion.div variants={itemVariants} className="inline-flex">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 backdrop-blur-md rounded-full shadow-2xl">
                <Sparkles className="w-4 h-4 text-jung-accent-muted" />
                <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-white">Advanced AI Protocol</span>
              </div>
            </motion.div>

            <div className="space-y-6">
              <motion.h2 variants={itemVariants} className="text-display text-4xl sm:text-5xl lg:text-6xl text-white leading-tight">
                An Analyst in your <br />
                <span className="italic text-jung-accent-muted">Pocket.</span>
              </motion.h2>
              <motion.p variants={itemVariants} className="text-body-lg text-jung-subtle leading-relaxed max-w-lg">
                The Master Insight upgrade includes our AI Type Coach—an LLM fine-tuned on thousands of pages of Jungian literature and your specific assessment results.
              </motion.p>
            </div>

            <motion.div variants={itemVariants} className="grid sm:grid-cols-2 gap-6">
              {[
                "Personalized Shadow Work",
                "Career Path Synergy",
                "Interpersonal Strategy",
                "Archetypal Mapping"
              ].map((feature, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded-full bg-jung-accent/20 border border-jung-accent/30 flex items-center justify-center">
                    <CheckCircle className="w-3.5 h-3.5 text-jung-accent-muted" />
                  </div>
                  <span className="text-sm font-serif font-medium text-jung-subtle">{feature}</span>
                </div>
              ))}
            </motion.div>
          </div>

          {/* Right Column - Chat Demo Interface */}
          <motion.div
            variants={itemVariants}
            className="relative"
          >
            {/* Glossy Interface Card */}
            <div className="relative glass-morphism dark border-white/10 rounded-2xl overflow-hidden shadow-[0_32px_96px_-12px_rgba(0,0,0,0.6)]">
              {/* Header */}
              <div className="bg-white/5 border-b border-white/10 px-6 py-5 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-jung-accent to-jung-accent-hover flex items-center justify-center shadow-lg shadow-jung-accent/30">
                    <Bot className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h4 className="text-display text-lg text-white">AI Analyst</h4>
                    <span className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-jung-accent-muted animate-pulse" />
                      <span className="text-[10px] uppercase tracking-widest text-jung-subtle font-bold">Neural Engine Ready</span>
                    </span>
                  </div>
                </div>
                <div className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-[10px] font-bold text-jung-subtle uppercase">
                  GPT-4o Optimized
                </div>
              </div>

              {/* Chat Viewport */}
              <div className="p-8 space-y-8 min-h-[440px] max-h-[500px] overflow-y-auto bg-black/40">
                {/* User Message */}
                <div className="flex flex-col items-end space-y-2">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[10px] uppercase tracking-widest text-jung-subtle font-bold">You</span>
                    <div className="w-5 h-5 rounded bg-white/10 flex items-center justify-center">
                      <User className="w-3 h-3 text-jung-subtle" />
                    </div>
                  </div>
                  <div className="bg-white/5 border border-white/10 text-white/90 px-5 py-3.5 rounded-2xl rounded-tr-none max-w-[90%] text-sm leading-relaxed shadow-xl">
                    {AI_DEMO_CONVERSATION[0].message}
                  </div>
                </div>

                {/* AI Message */}
                <AnimatePresence>
                  {showResponse && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex flex-col items-start space-y-2"
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <div className="w-5 h-5 rounded bg-jung-accent/20 flex items-center justify-center">
                          <Bot className="w-3 h-3 text-jung-accent-muted" />
                        </div>
                        <span className="text-[10px] uppercase tracking-widest text-jung-accent-muted font-bold">Analyst</span>
                      </div>
                      <div className="bg-jung-accent/10 border border-jung-accent/20 text-white px-5 py-4 rounded-2xl rounded-tl-none max-w-[95%] shadow-2xl relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-1 h-full bg-jung-accent" />
                        <div className="text-sm leading-relaxed font-serif text-white/90">
                          {displayedMessage.split('\n\n').map((paragraph, idx) => {
                            if (paragraph.startsWith('**')) {
                              return (
                                <p key={idx} className="font-bold text-jung-accent-muted mt-3 first:mt-0 underline underline-offset-4 decoration-jung-accent/30">
                                  {paragraph.replace(/\*\*/g, '')}
                                </p>
                              );
                            }
                            return <p key={idx} className="mb-3 last:mb-0">{paragraph}</p>;
                          })}
                          {isTyping && (
                            <motion.span
                              animate={{ opacity: [0, 1, 0] }}
                              transition={{ duration: 1, repeat: Infinity }}
                              className="inline-block w-2.5 h-4 bg-jung-accent-muted ml-1 align-middle"
                            />
                          )}
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Input Bar Overlay */}
              <div className="p-6 bg-white/5 border-t border-white/10 backdrop-blur-xl">
                <div className="flex gap-4 p-2 bg-black/40 rounded-xl border border-white/5">
                  <div className="flex-1 px-4 py-3 text-sm text-jung-subtle font-serif truncate">
                    Ask about your Si-Ne axis development...
                  </div>
                  <div className="w-10 h-10 rounded-lg bg-jung-accent/20 flex items-center justify-center border border-jung-accent/30">
                    <ArrowRight className="w-5 h-5 text-jung-accent-muted" />
                  </div>
                </div>
              </div>
            </div>

            {/* Background Light Effect */}
            <div className="absolute -inset-10 bg-jung-accent/10 blur-[80px] -z-10 rounded-full" />
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};
