import React from 'react';
import { CheckCircle2 } from 'lucide-react';
import { PRODUCT_PROOF_ITEMS } from './data';

export const TestimonialsSection: React.FC = () => {
  return (
    <section className="py-20 lg:py-28 bg-jung-surface border-y border-jung-border">
      <div className="editorial-container">
        <div className="text-center mb-12">
          <h2 className="text-display text-3xl sm:text-4xl text-jung-dark mb-4">
            Product proof without personality theater
          </h2>
          <p className="text-body text-jung-secondary max-w-2xl mx-auto">
            TypeJung is built around visible function evidence, not anonymous praise or fixed identity claims.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {PRODUCT_PROOF_ITEMS.map((item, index) => (
            <div key={index} className="card-elevated p-6">
              <CheckCircle2 className="w-8 h-8 text-jung-accent mb-4" />
              <h3 className="font-serif text-xl text-jung-dark mb-3">{item.title}</h3>
              <p className="text-body text-jung-secondary mb-6 leading-relaxed">
                {item.description}
              </p>
              <div className="border-t border-jung-border pt-4">
                <p className="text-xs font-mono uppercase tracking-widest text-jung-muted">
                  {item.detail}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
