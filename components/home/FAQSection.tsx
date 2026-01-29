import React, { useState } from 'react';
import { ChevronDown, Minus } from 'lucide-react';
import { FAQ_ITEMS } from './data';

export const FAQSection: React.FC = () => {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  return (
    <section className="py-20 lg:py-28">
      <div className="editorial-container">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-display text-3xl sm:text-4xl text-jung-dark mb-4">
              Questions people ask
            </h2>
          </div>

          <div className="space-y-3" role="region" aria-label="Frequently Asked Questions">
            {FAQ_ITEMS.map((item, index) => (
              <div key={index} className="border border-jung-border rounded-xl overflow-hidden bg-jung-surface">
                <button
                  id={`faq-button-${index}`}
                  className="w-full px-6 py-5 flex items-center justify-between text-left hover:bg-jung-base transition-colors"
                  onClick={() => setOpenFaq(openFaq === index ? null : index)}
                  aria-expanded={openFaq === index}
                  aria-controls={`faq-panel-${index}`}
                >
                  <span className="font-serif font-medium text-jung-dark pr-4">{item.question}</span>
                  {openFaq === index ? (
                    <Minus className="w-5 h-5 text-jung-accent flex-shrink-0" aria-hidden="true" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-jung-muted flex-shrink-0" aria-hidden="true" />
                  )}
                </button>
                <div
                  id={`faq-panel-${index}`}
                  role="region"
                  aria-labelledby={`faq-button-${index}`}
                  className={`overflow-hidden transition-all duration-300 ${
                    openFaq === index ? 'max-h-96' : 'max-h-0'
                  }`}
                >
                  <div className="px-6 py-5 bg-jung-base border-t border-jung-border">
                    <p className="text-body text-jung-secondary leading-relaxed">{item.answer}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
