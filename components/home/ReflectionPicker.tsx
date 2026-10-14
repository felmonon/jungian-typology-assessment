import React, { useRef, useState } from 'react';
import { FunctionEmblem } from '../brand/FunctionEmblem';
import {
  FUNCTION_CODES,
  FUNCTION_READINGS,
  inferiorOf,
  type FunctionCode,
} from '../../data/function-readings';
import { trackEvent } from '../../lib/analytics';

// The home page's one live thing: choose the function you lean on most and
// see which function usually sits below your line. Uses the classic stack
// pairing only; the copy says it is a preview, not a result.
export const ReflectionPicker: React.FC<{
  onPick?: (code: FunctionCode) => void;
  /** The hero copy, set on the day side beside the peak. */
  children?: React.ReactNode;
}> = ({ onPick, children }) => {
  const [lead, setLead] = useState<FunctionCode>('Ni');
  const tracked = useRef(false);
  const below = inferiorOf(lead);
  const pick = (code: FunctionCode) => {
    setLead(code);
    onPick?.(code);
    if (!tracked.current) {
      tracked.current = true;
      trackEvent('home_reflection_picked', { source: 'home_hero', function: code });
    }
  };

  return (
    <div className="reflect">
      <div className="reflect-day">
        <div className="wrap reflect-row">
          <div className="reflect-copy">{children}</div>
          <div className="reflect-shape" aria-hidden="true">
            <div className="reflect-peak">
              <span className="reflect-code">{lead}</span>
            </div>
          </div>
        </div>
      </div>
      <div className="reflect-night">
        <div className="wrap reflect-row">
          <div className="reflect-shape" aria-hidden="true">
            <div className="reflect-trough">
              <svg viewBox="0 0 300 290" preserveAspectRatio="none" focusable="false">
                <polygon points="9,6 291,6 150,276" />
              </svg>
              <span className="reflect-code">{below}</span>
            </div>
          </div>
          <div className="reflect-panel">
            <fieldset className="reflect-choices">
              <legend>Which function do you lean on most?</legend>
              <div className="reflect-grid">
                {FUNCTION_CODES.map((code) => (
                  <label key={code} className="reflect-choice">
                    <input
                      type="radio"
                      name="reflect-lead"
                      value={code}
                      checked={lead === code}
                      onChange={() => pick(code)}
                    />
                    <span>
                      <FunctionEmblem code={code} className="reflect-choice-glyph" />
                      {code}
                      <span className="sr-only">, {FUNCTION_READINGS[code].name}</span>
                    </span>
                  </label>
                ))}
              </div>
            </fieldset>
            <p className="reflect-reading" aria-live="polite" aria-atomic="true">
              Lead with <strong>{FUNCTION_READINGS[lead].name}</strong> and{' '}
              <strong>{FUNCTION_READINGS[below].name}</strong> usually sits below your line.{' '}
              {FUNCTION_READINGS[below].belowTheLine}
            </p>
            <p className="reflect-note">A preview from Jungian theory, not your result. Your map comes from 42 questions.</p>
          </div>
        </div>
      </div>
    </div>
  );
};
