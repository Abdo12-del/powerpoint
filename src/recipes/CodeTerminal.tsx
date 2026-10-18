import { Terminal, TypingAnimation, AnimatedSpan } from '@/components/gallery';
import { cn } from '@/lib/cn';

export interface TerminalLine {
  /** cmd = يُكتب حرفاً حرفاً، out = يظهر دفعة */
  type: 'cmd' | 'out' | 'ok' | 'err';
  text: string;
}

export interface CodeTerminalProps {
  lines: TerminalLine[];
  className?: string;
}

/**
 * وصفة «طرفية» (نمط code): أوامر تُكتب ومخرجات تظهر بالتسلسل.
 * <CodeTerminal lines={[{ type: 'cmd', text: 'npm run check' }, { type: 'ok', text: '✔ 57 tests passed' }]} />
 */
export function CodeTerminal({ lines, className }: CodeTerminalProps) {
  return (
    <div dir="ltr" className={cn('mx-auto w-full max-w-3xl', className)}>
      <Terminal sequence startOnView={false} className="max-h-[420px] w-full max-w-none bg-slate-950 text-left">
        {lines.map((l, i) =>
          l.type === 'cmd' ? (
            <TypingAnimation key={i} duration={40} className="text-slate-100">
              {`$ ${l.text}`}
            </TypingAnimation>
          ) : (
            <AnimatedSpan
              key={i}
              className={cn(l.type === 'ok' && 'text-emerald-400', l.type === 'err' && 'text-rose-400', l.type === 'out' && 'text-slate-400')}
            >
              {l.text}
            </AnimatedSpan>
          ),
        )}
      </Terminal>
    </div>
  );
}
