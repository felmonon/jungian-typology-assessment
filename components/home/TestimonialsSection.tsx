import React from 'react';
import { Quote } from 'lucide-react';
import { TESTIMONIALS } from './data';

export const TestimonialsSection: React.FC = () => {
  return (
    <section className="py-20 lg:py-28 bg-jung-surface border-y border-jung-border">
      <div className="editorial-container">
        <div className="text-center mb-12">
          <h2 className="text-display text-3xl sm:text-4xl text-jung-dark mb-4">
            "Finally, a test that didn't try to box me in"
          </h2>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {TESTIMONIALS.map((testimonial, index) => (
            <div key={index} className="card-elevated p-6">
              <Quote className="w-8 h-8 text-jung-border mb-4" />
              <p className="text-body text-jung-secondary italic mb-6 leading-relaxed">
                "{testimonial.quote}"
              </p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-jung-accent-light rounded-full flex items-center justify-center">
                  <span className="text-display text-jung-accent">{testimonial.name[0]}</span>
                </div>
                <div>
                  <p className="font-serif font-medium text-jung-dark">{testimonial.name}</p>
                  <p className="text-sm font-serif text-jung-muted">{testimonial.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
