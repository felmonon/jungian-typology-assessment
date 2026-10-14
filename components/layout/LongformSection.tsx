import React from 'react';

/** A long-form page section: heading on the left (sticky on desktop), text on the right. */
export const LongformSection: React.FC<{
  id: string;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}> = ({ id, title, subtitle, children }) => (
  <section className="wrap lt-section" aria-labelledby={id}>
    <div className="lt-section-head">
      <h2 id={id} className="lt-title">{title}</h2>
      {subtitle && <p className="lt-sub">{subtitle}</p>}
    </div>
    <div className="lt-body">{children}</div>
  </section>
);
