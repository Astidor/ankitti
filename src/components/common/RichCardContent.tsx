import React, { useState } from 'react';

interface RichCardContentProps {
  content: string;
  showClozeAnswers?: boolean;
  className?: string;
  onClozeClick?: (clozeKey: string) => void;
  revealedClozes?: Record<string, boolean>;
}

// Convert markdown elements to clean safe HTML
function parseMarkdownToHtml(text: string): string {
  if (!text) return '';
  let html = text;

  // Headers (must be preceded by start of line or newline)
  html = html.replace(/(?:^|\n)###\s+(.*?)(?=\n|$)/g, '\n<h3>$1</h3>');
  html = html.replace(/(?:^|\n)##\s+(.*?)(?=\n|$)/g, '\n<h2>$1</h2>');
  html = html.replace(/(?:^|\n)#\s+(.*?)(?=\n|$)/g, '\n<h1>$1</h1>');

  // Bold & Italic markdown
  html = html.replace(/\*\*\*(.*?)\*\*\*/g, '<b><i>$1</i></b>');
  html = html.replace(/\*\*(.*?)\*\*/g, '<b>$1</b>');
  html = html.replace(/__(.*?)__/g, '<b>$1</b>');
  html = html.replace(/\*(.*?)\*/g, '<i>$1</i>');
  html = html.replace(/_(.*?)_/g, '<i>$1</i>');

  // Strikethrough
  html = html.replace(/~~(.*?)~~/g, '<s>$1</s>');

  // Highlight markdown ==text==
  html = html.replace(/==(.*?)==/g, '<mark class="bg-amber-200/80 px-1 py-0.5 rounded text-slate-900 font-semibold">$1</mark>');

  // Inline code
  html = html.replace(/`([^`]+)`/g, '<code class="bg-pink-100/70 text-pink-700 px-1.5 py-0.5 rounded-md font-mono text-[0.9em] border border-pink-200/60">$1</code>');

  // Markdown links: [text](url)
  html = html.replace(/\[(.*?)\]\((https?:\/\/[^\s\)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer" class="text-pink-600 underline font-semibold hover:text-pink-700 cursor-pointer">$1</a>');

  // Convert bullet points with markdown dashes or asterisks at start of line
  html = html.replace(/(?:^|\n)[-*]\s+(.*?)(?=\n|$)/g, '\n<div class="rich-list-item">• $1</div>');

  return html;
}

// Sanitize HTML: permit safe styling and formatting tags, strip dangerous scripts and events
function sanitizeCardHtml(rawHtml: string): string {
  if (!rawHtml) return '';

  // 1. Remove dangerous blocks
  let clean = rawHtml
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<style[\s\S]*?<\/style>/gi, '')
    .replace(/<iframe[\s\S]*?<\/iframe>/gi, '')
    .replace(/<object[\s\S]*?<\/object>/gi, '')
    .replace(/<embed[\s\S]*?<\/embed>/gi, '');

  // 2. Strip event handlers (e.g. onclick, onerror, onload)
  clean = clean.replace(/\son\w+\s*=\s*(?:'[^']*'|"[^"]*"|[^\s>]+)/gi, '');

  // 3. Strip javascript: URIs
  clean = clean.replace(/href\s*=\s*['"]\s*javascript:[^'"]*['"]/gi, '');

  // 4. Ensure line breaks and paragraph spacing
  clean = clean
    .replace(/<br\s*[\/]?>/gi, '<br/>')
    .replace(/&nbsp;/gi, ' ');

  // 5. Collapse unnecessary newlines immediately touching block elements to avoid double spacing
  clean = clean
    .replace(/\n+(<(?:div|h[1-6]|ul|ol|li|p|table|blockquote)[^>]*>)/gi, '$1')
    .replace(/(<\/(?:div|h[1-6]|ul|ol|li|p|table|blockquote)>)\n+/gi, '$1');

  return clean.trim();
}

export const RichCardContent: React.FC<RichCardContentProps> = ({
  content,
  showClozeAnswers = false,
  className = '',
  onClozeClick,
  revealedClozes,
}) => {
  const [internalRevealed, setInternalRevealed] = useState<Record<string, boolean>>({});
  const activeRevealed = revealedClozes || internalRevealed;

  if (!content) return null;

  // Split content by Cloze deletions: {{c1::answer::hint}} or {{c1::answer}}
  const clozeRegex = /\{\{c\d+::(.*?)(?:::([^\}]+))?\}\}/g;
  const parts: React.ReactNode[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = clozeRegex.exec(content)) !== null) {
    if (match.index > lastIndex) {
      const textSegment = content.substring(lastIndex, match.index);
      const formattedHtml = sanitizeCardHtml(parseMarkdownToHtml(textSegment));
      parts.push(
        <span
          key={`txt-${lastIndex}`}
          dangerouslySetInnerHTML={{ __html: formattedHtml }}
        />
      );
    }

    const answer = match[1];
    const hint = match[2];
    const clozeKey = `cloze-${match.index}`;
    const isRevealed = Boolean(activeRevealed[clozeKey]);

    const handleToggle = (e: React.MouseEvent) => {
      e.stopPropagation();
      if (onClozeClick) {
        onClozeClick(clozeKey);
      } else {
        setInternalRevealed(prev => ({ ...prev, [clozeKey]: !prev[clozeKey] }));
      }
    };

    if (showClozeAnswers) {
      const answerHtml = sanitizeCardHtml(parseMarkdownToHtml(answer));
      parts.push(
        <span
          key={clozeKey}
          className="cloze-active mx-1 text-sm md:text-base font-extrabold shadow-sm"
          dangerouslySetInnerHTML={{ __html: answerHtml }}
        />
      );
    } else {
      parts.push(
        <button
          key={clozeKey}
          type="button"
          onClick={handleToggle}
          className="cloze-badge mx-1 text-xs md:text-sm hover:scale-105 active:scale-95 transition-all shadow-xs"
          title="Click to reveal hint"
        >
          {isRevealed
            ? `[Hint: ${hint || answer.substring(0, 2) + '...'}]`
            : (hint ? `[... ${hint} ...]` : '[...]')}
        </button>
      );
    }

    lastIndex = clozeRegex.lastIndex;
  }

  if (lastIndex < content.length) {
    const trailingText = content.substring(lastIndex);
    const formattedHtml = sanitizeCardHtml(parseMarkdownToHtml(trailingText));
    parts.push(
      <span
        key={`txt-${lastIndex}`}
        dangerouslySetInnerHTML={{ __html: formattedHtml }}
      />
    );
  }

  return (
    <div className={`card-rich-content leading-relaxed whitespace-pre-wrap select-text ${className}`}>
      {parts}
    </div>
  );
};
