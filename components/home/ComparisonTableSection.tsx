import React from 'react';
import { COMPARISON_ROWS } from './data';

export const ComparisonTableSection: React.FC = () => {
  return (
    <section className="py-20 lg:py-28 bg-jung-surface border-y border-jung-border">
      <div className="editorial-container">
        <div className="text-center mb-12">
          <h2 className="text-display text-3xl sm:text-4xl text-jung-dark mb-4">
            How we compare
          </h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full bg-jung-base rounded-xl overflow-hidden border border-jung-border">
            <thead>
              <tr className="bg-jung-dark text-white">
                <th className="px-4 py-4 text-left font-serif font-medium text-sm"></th>
                <th className="px-4 py-4 text-center font-serif font-medium text-sm">16Personalities</th>
                <th className="px-4 py-4 text-center font-serif font-medium text-sm">Enneagram</th>
                <th className="px-4 py-4 text-center font-serif font-medium text-sm">Big Five</th>
                <th className="px-4 py-4 text-center font-serif font-medium text-sm bg-jung-accent">JungianTypology</th>
              </tr>
            </thead>
            <tbody className="text-sm font-serif">
              {COMPARISON_ROWS.map((row, idx) => (
                <tr key={idx} className="border-b border-jung-border last:border-0">
                  <td className="px-4 py-4 font-medium text-jung-dark">{row.label}</td>
                  {row.values.map((val, vidx) => (
                    <td
                      key={vidx}
                      className={`px-4 py-4 text-center ${
                        vidx === 3
                          ? 'bg-jung-accent-light font-medium text-jung-primary'
                          : 'text-jung-secondary'
                      }`}
                    >
                      {val}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
};
