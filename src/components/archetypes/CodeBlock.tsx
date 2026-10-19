import { useEffect, useMemo, useState, type CSSProperties } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { cn } from '@/lib/cn';
import { normalizeCodeLanguage, parseDiffLine, tokenizeCode, type CodeTokenLines, type DiffLineKind } from './shiki';

export interface CodeBlockProps {
  code: string;
  /** Appears in the window title bar: SQL / TypeScript / Python. */
  language?: string;
  /** Window title, usually a filename or schema name. */
  title?: string;
  /** 1-based line numbers to emphasize. */
  highlightLines?: number[];
  /** Treat code as unified diff; set language too to color the changed code itself. */
  diff?: boolean;
  /** Reveal rows in order when a slide enters. */
  revealLines?: boolean;
  /** Short optional explanation alongside the code. */
  aside?: { title: string; points: string[] };
}

const fontStyleToCss = (fontStyle = 0): CSSProperties => ({
  ...(fontStyle & 1 ? { fontStyle: 'italic' as const } : {}),
  ...(fontStyle & 2 ? { fontWeight: 700 } : {}),
  ...(fontStyle & 4 ? { textDecoration: 'underline' } : {}),
});

function diffLineClass(kind: DiffLineKind) {
  switch (kind) {
    case 'added':
      return 'bg-emerald-400/[0.11] shadow-[inset_2px_0_0_0_rgba(52,211,153,.8)]';
    case 'removed':
      return 'bg-rose-400/[0.11] shadow-[inset_2px_0_0_0_rgba(251,113,133,.8)]';
    case 'meta':
      return 'bg-sky-400/[0.07] text-sky-200';
    default:
      return '';
  }
}

/** Pattern 9 — professional code/schema pane, highlighted asynchronously by Shiki 4. */
export function CodeBlock({
  code,
  language,
  title,
  highlightLines = [],
  diff = false,
  revealLines = true,
  aside,
}: CodeBlockProps) {
  const lines = useMemo(() => code.replace(/^\n+|\n+$/g, '').replaceAll('\r\n', '\n').split('\n'), [code]);
  const [tokens, setTokens] = useState<CodeTokenLines | null>(null);
  const reduceMotion = useReducedMotion();
  const diffLines = useMemo(() => (diff ? lines.map(parseDiffLine) : null), [diff, lines]);

  useEffect(() => {
    const syntax = language?.trim() || (diff ? 'diff' : '');
    if (!syntax) {
      setTokens(null);
      return;
    }
    let cancelled = false;
    setTokens(null);
    void tokenizeCode(lines.join('\n'), syntax, diff)
      .then((result) => {
        if (!cancelled) setTokens(result);
      })
      .catch(() => {
        // Keep the readable plaintext view if a rare grammar cannot be loaded.
        if (!cancelled) setTokens(null);
      });
    return () => {
      cancelled = true;
    };
  }, [lines, language, diff]);

  const renderCode = (index: number, line: string) => {
    const parsed = diffLines?.[index];
    const rowTokens = tokens?.[index];
    if (parsed?.kind === 'meta') {
      return <span className="text-sky-200">{parsed.body || ' '}</span>;
    }
    if (!rowTokens?.length) {
      if (parsed && parsed.marker) {
        return (
          <>
            <span aria-hidden className={cn(parsed.kind === 'added' ? 'text-emerald-300' : parsed.kind === 'removed' ? 'text-rose-300' : 'text-slate-500')}>
              {parsed.marker}
            </span>
            <span>{parsed.body || ' '}</span>
          </>
        );
      }
      return <span>{line || ' '}</span>;
    }
    const normalizedLanguage = language ? normalizeCodeLanguage(language) : '';
    const embeddedDiff = diff && !!language?.trim() && language.trim().toLowerCase() !== 'diff' && normalizedLanguage !== 'text';
    return (
      <>
        {embeddedDiff && parsed?.marker && (
          <span aria-hidden className={cn(parsed.kind === 'added' ? 'text-emerald-300' : parsed.kind === 'removed' ? 'text-rose-300' : 'text-slate-500')}>
            {parsed.marker}
          </span>
        )}
        {rowTokens.map((token, tokenIndex) => (
          <span
            key={`${index}-${tokenIndex}`}
            style={{ color: token.color, backgroundColor: token.bgColor, ...fontStyleToCss(token.fontStyle) }}
          >
            {token.content}
          </span>
        ))}
      </>
    );
  };

  const content = (
    <pre className="max-h-[60vh] overflow-auto p-4 font-mono text-[13px] leading-6 text-slate-100" aria-label={language ? `شفرة ${language}` : 'شفرة'}>
      <code className="block min-w-max">
        {lines.map((line, index) => {
          const number = index + 1;
          const highlighted = highlightLines.includes(number);
          const diffKind = diffLines?.[index]?.kind;
          const lineClass = cn(
            'grid grid-cols-[2.5rem_1fr] -mx-4 px-4 transition-colors',
            diffKind && diffLineClass(diffKind),
            highlighted && 'outline outline-1 outline-inset outline-amber-300/50',
          );
          const row = (
            <>
              <span aria-hidden className="select-none pr-4 text-right text-slate-500 tabular-nums">{number}</span>
              <span className="whitespace-pre text-start">{renderCode(index, line)}</span>
            </>
          );
          return revealLines && !reduceMotion ? (
            <motion.span
              key={number}
              initial={{ opacity: 0, y: 3 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.28, delay: Math.min(0.12 + index * 0.025, 1.5) }}
              className={lineClass}
              data-line={number}
              data-highlighted={highlighted || undefined}
            >
              {row}
            </motion.span>
          ) : (
            <span key={number} className={lineClass} data-line={number} data-highlighted={highlighted || undefined}>
              {row}
            </span>
          );
        })}
      </code>
    </pre>
  );

  return (
    <div className={cn('grid h-full items-center gap-5', aside && 'lg:grid-cols-[1.7fr_1fr]')}>
      <motion.div
        initial={reduceMotion ? false : { opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: reduceMotion ? 0 : 0.45 }}
        dir="ltr"
        className="theme-code-window overflow-hidden rounded-2xl border border-white/10 bg-[#0b1220] shadow-2xl"
      >
        <div className="flex items-center gap-2 border-b border-white/10 bg-white/[0.04] px-4 py-2">
          <span aria-hidden className="h-3 w-3 rounded-full bg-rose-400/80" />
          <span aria-hidden className="h-3 w-3 rounded-full bg-amber-400/80" />
          <span aria-hidden className="h-3 w-3 rounded-full bg-emerald-400/80" />
          <span className="ms-3 truncate font-mono text-xs text-slate-300">{title}</span>
          {language && <span className="ms-auto shrink-0 rounded bg-sky-400/15 px-2 py-0.5 font-mono text-[11px] text-sky-200">{language}</span>}
          {diff && <span className="shrink-0 rounded bg-violet-400/15 px-2 py-0.5 font-mono text-[11px] text-violet-200">DIFF</span>}
        </div>
        {content}
      </motion.div>

      {aside && (
        <motion.aside
          initial={reduceMotion ? false : { opacity: 0, x: -16 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: reduceMotion ? 0 : 0.45, delay: reduceMotion ? 0 : 0.3 }}
          className="rounded-2xl border border-white/10 bg-white/[0.04] p-5"
        >
          <h4 className="mb-3 text-lg font-bold text-amber-200">{aside.title}</h4>
          <ul className="space-y-2 text-[15px] leading-relaxed text-slate-200">
            {aside.points.map((point) => (
              <li key={point} className="flex gap-2">
                <span aria-hidden className="mt-2.5 h-1.5 w-1.5 shrink-0 rounded-full bg-amber-300" />
                <span>{point}</span>
              </li>
            ))}
          </ul>
        </motion.aside>
      )}
    </div>
  );
}
