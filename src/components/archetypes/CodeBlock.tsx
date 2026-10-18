import { motion } from 'framer-motion';
import { cn } from '@/lib/cn';

export interface CodeBlockProps {
  code: string;
  /** يظهر في شريط النافذة: «SQL» / «TypeScript» */
  language?: string;
  /** عنوان النافذة: اسم الملف أو النموذج */
  title?: string;
  /** أرقام الأسطر المُبرزة (1-based) */
  highlightLines?: number[];
  /** شرح جانبي قصير (اختياري) */
  aside?: { title: string; points: string[] };
}

/** النمط 9 — كود/نموذج تقني: نافذة كود بعناوين أسطر (MLD، SQL، شفرة). */
export function CodeBlock({ code, language, title, highlightLines = [], aside }: CodeBlockProps) {
  const lines = code.replace(/^\n+|\n+$/g, '').split('\n');
  return (
    <div className={cn('grid h-full items-center gap-5', aside && 'lg:grid-cols-[1.7fr_1fr]')}>
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45 }}
        dir="ltr"
        className="overflow-hidden rounded-2xl border border-white/10 bg-[#0b1220] shadow-2xl"
      >
        <div className="flex items-center gap-2 border-b border-white/10 bg-white/[0.04] px-4 py-2">
          <span className="h-3 w-3 rounded-full bg-rose-400/80" />
          <span className="h-3 w-3 rounded-full bg-amber-400/80" />
          <span className="h-3 w-3 rounded-full bg-emerald-400/80" />
          <span className="ms-3 font-mono text-xs text-slate-300">{title}</span>
          {language && <span className="ms-auto rounded bg-sky-400/15 px-2 py-0.5 font-mono text-[11px] text-sky-200">{language}</span>}
        </div>
        <pre className="max-h-[60vh] overflow-auto p-4 font-mono text-[13px] leading-6 text-slate-100">
          {lines.map((line, i) => {
            const n = i + 1;
            const hl = highlightLines.includes(n);
            return (
              <motion.div
                key={n}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.15 + i * 0.03 }}
                className={cn('grid grid-cols-[2.5rem_1fr] -mx-4 px-4', hl && 'bg-amber-400/10 border-s-2 border-amber-400')}
              >
                <span className="select-none text-right pr-4 text-slate-500 tabular-nums">{n}</span>
                <code className="whitespace-pre">{line || ' '}</code>
              </motion.div>
            );
          })}
        </pre>
      </motion.div>

      {aside && (
        <motion.aside
          initial={{ opacity: 0, x: -16 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.45, delay: 0.3 }}
          className="rounded-2xl border border-white/10 bg-white/[0.04] p-5"
        >
          <h4 className="mb-3 text-lg font-bold text-amber-200">{aside.title}</h4>
          <ul className="space-y-2 text-[15px] leading-relaxed text-slate-200">
            {aside.points.map((p) => (
              <li key={p} className="flex gap-2">
                <span className="mt-2.5 h-1.5 w-1.5 shrink-0 rounded-full bg-amber-300" />
                <span>{p}</span>
              </li>
            ))}
          </ul>
        </motion.aside>
      )}
    </div>
  );
}
