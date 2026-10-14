import React from 'react';

// An original visual alphabet: a different structure for each function-attitude.
// Labels remain visible alongside the symbols; shape and color do not encode scores.
const marks: Record<string, React.ReactNode> = {
  Ti: <><path d="M32 5 59 32 32 59 5 32Z" /><path d="m32 17 15 15-15 15-15-15Z" /><circle cx="32" cy="32" r="3" fill="currentColor" stroke="none" /></>,
  Te: <><path d="M10 11h44M10 32h44M10 53h44M17 5v54M47 5v54" /><path d="m27 23 9 9-9 9" /></>,
  Ni: <><path d="M32 5C3 20 3 44 32 59 61 44 61 20 32 5Z" /><path d="M32 17c-14 8-14 22 0 30 14-8 14-22 0-30Z" /><circle cx="32" cy="32" r="3" fill="currentColor" stroke="none" /></>,
  Ne: <><path d="M32 8v48M8 32h48M15 15l34 34M15 49l34-34" /><path d="m24 12 8-8 8 8M52 24l8 8-8 8M40 52l-8 8-8-8M12 40l-8-8 8-8" /></>,
  Si: <><path d="M11 50V14h42v36H11Zm8-8V22h26v20H19Z" /><path d="M5 58h54M26 32h12" /></>,
  Se: <><circle cx="32" cy="32" r="13" /><path d="M32 5v8M32 51v8M5 32h8M51 32h8M13 13l6 6M45 45l6 6M13 51l6-6M45 19l6-6" /></>,
  Fi: <><path d="M32 6C7 6 7 32 32 57 57 32 57 6 32 6Z" /><path d="M32 19c-12 0-12 14 0 26 12-12 12-26 0-26Z" /></>,
  Fe: <><path d="M32 32C6-2-9 36 32 32 58 66 73 28 32 32ZM32 32C66 6 28-9 32 32-2 58 36 73 32 32Z" /><circle cx="32" cy="32" r="5" fill="currentColor" stroke="none" /></>,
};

export const FunctionEmblem: React.FC<{ code: string; className?: string }> = ({ code, className = '' }) => (
  <svg viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className={className}>
    {marks[code] || <circle cx="32" cy="32" r="22" />}
  </svg>
);
