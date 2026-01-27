import React from 'react';
import { DIFFERENTIATORS } from './data';

export const DifferentiatorsSection: React.FC = () => {
  return (
    <section className="py-20 lg:py-28">
      <div className="editorial-container">
        <div className="text-center mb-16">
          <h2 className="text-display text-3xl sm:text-4xl text-jung-dark mb-4">
            This isn't another MBTI clone
          </h2>
        </div>

        <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
          {DIFFERENTIATORS.map((item, index) => {
            const Icon = item.icon;
            return (
              <div key={index} className="space-y-4">
                <div className="w-12 h-12 bg-jung-accent-light rounded-xl flex items-center justify-center">
                  <Icon className="w-6 h-6 text-jung-accent" />
                </div>
                <h3 className="text-heading text-xl text-jung-dark">{item.title}</h3>
                <p className="text-body text-jung-secondary leading-relaxed">{item.description}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
