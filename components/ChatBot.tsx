import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, Send, Loader2, X, Sparkles } from 'lucide-react';

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

interface UserProfile {
  dominantFunction: string;
  auxiliaryFunction: string;
  tertiaryFunction: string;
  inferiorFunction: string;
  scores: Array<{ function: string; score: number }>;
  attitudeScore: number;
}

interface ChatBotProps {
  userProfile: UserProfile;
}

export const ChatBot: React.FC<ChatBotProps> = ({ userProfile }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setIsLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userMessage,
          history: messages,
          userProfile,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to get response');
      }

      setMessages(prev => [...prev, { role: 'assistant', content: data.response }]);
    } catch (error: any) {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: 'Sorry, I had trouble responding. Please try again.'
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const suggestedQuestions = [
    "How can I develop my inferior function?",
    "What are my biggest growth opportunities?",
    "How does my type handle stress?",
    "What careers suit my cognitive functions?",
  ];

  return (
    <>
      {/* Floating button when closed */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 z-50 flex items-center gap-3 bg-jung-dark hover:bg-jung-secondary text-white px-6 py-4 rounded-full shadow-lg transition-all duration-200 hover:scale-105 hover:shadow-xl min-h-[56px]"
        >
          <MessageCircle className="w-5 h-5" />
          <span className="font-sans font-medium tracking-wide">Ask Your Type Coach</span>
        </button>
      )}

      {/* Chat panel when open */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 z-50 w-[360px] sm:w-[400px] max-h-[600px] bg-jung-surface rounded-2xl shadow-2xl border border-jung-border flex flex-col overflow-hidden">
          {/* Header */}
          <div className="bg-jung-dark text-white p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-jung-accent" />
              </div>
              <div>
                <h3 className="font-serif font-bold text-lg">Jungian Type Coach</h3>
                <p className="text-xs text-white/70 font-sans">Ask about your type and growth</p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-2 hover:bg-white/10 rounded-lg transition-colors"
              aria-label="Close chat"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Messages area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 min-h-[300px] max-h-[400px] bg-jung-surface">
            {messages.length === 0 && (
              <div className="space-y-4">
                <p className="text-jung-secondary text-sm text-center font-serif italic">
                  Ask me anything about your cognitive functions and how to grow.
                </p>
                <div className="space-y-2">
                  {suggestedQuestions.map((q, i) => (
                    <button
                      key={i}
                      onClick={() => {
                        setInput(q);
                        inputRef.current?.focus();
                      }}
                      className="w-full text-left text-sm p-3 bg-jung-surface rounded-xl border border-jung-border hover:border-jung-accent hover:bg-jung-accent/5 transition-all duration-200 text-jung-dark font-sans"
                    >
                      {q}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {messages.map((msg, i) => (
              <div
                key={i}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[85%] p-4 rounded-2xl text-sm leading-relaxed ${
                    msg.role === 'user'
                      ? 'bg-jung-dark text-white rounded-br-md'
                      : 'bg-jung-surface border border-jung-border text-jung-dark rounded-bl-md shadow-sm'
                  }`}
                >
                  {msg.content}
                </div>
              </div>
            ))}

            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-jung-surface border border-jung-border p-4 rounded-2xl rounded-bl-md shadow-sm">
                  <Loader2 className="w-5 h-5 animate-spin text-jung-accent" />
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input area */}
          <div className="p-4 border-t border-jung-border bg-jung-surface">
            <div className="flex gap-3">
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask about your type..."
                className="flex-1 px-4 py-3 rounded-full border border-jung-border bg-jung-surface focus:outline-none focus:border-jung-accent focus:ring-2 focus:ring-jung-accent/20 text-sm text-jung-dark placeholder:text-jung-muted font-sans transition-all duration-200"
                disabled={isLoading}
              />
              <button
                onClick={sendMessage}
                disabled={!input.trim() || isLoading}
                className="p-3 bg-jung-accent text-white rounded-full hover:bg-jung-accent/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 min-w-[48px] min-h-[48px] flex items-center justify-center"
                aria-label="Send message"
              >
                <Send className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
