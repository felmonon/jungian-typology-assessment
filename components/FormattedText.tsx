import React from 'react';

interface FormattedTextProps {
  text: string;
  className?: string;
}

export function FormattedText({ text, className = '' }: FormattedTextProps) {
  const cleanText = text
    .replace(/\*\*(.*?)\*\*/g, '$1')
    .replace(/\*(.*?)\*/g, '$1')
    .replace(/__(.*?)__/g, '$1')
    .replace(/_(.*?)_/g, '$1')
    .replace(/^#{1,6}\s+/gm, '')
    .replace(/^[-*]\s+/gm, '• ')
    .replace(/^\d+\.\s+/gm, (match, offset, string) => {
      const lineStart = string.lastIndexOf('\n', offset - 1);
      const prevLine = string.substring(lineStart + 1, offset);
      if (prevLine.trim() === '') return match;
      return match;
    });

  const paragraphs = cleanText.split(/\n\n+/).filter(p => p.trim());

  return (
    <div className={`space-y-4 ${className}`}>
      {paragraphs.map((paragraph, index) => (
        <p key={index} className="text-stone-700 leading-relaxed">
          {paragraph.split('\n').map((line, lineIndex, arr) => (
            <React.Fragment key={lineIndex}>
              {line}
              {lineIndex < arr.length - 1 && <br />}
            </React.Fragment>
          ))}
        </p>
      ))}
    </div>
  );
}
