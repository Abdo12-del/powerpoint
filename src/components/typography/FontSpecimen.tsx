import { useEffect, useState } from 'react';
import { ensureFontLoaded, fontStack, FONT_CATEGORY_LABELS, type FontDef, ARABIC_SAMPLE } from '@/fonts';
import { cn } from '@/lib/cn';
import { VariableText } from './VariableText';

export interface FontSpecimenProps {
  font: FontDef;
  sample?: string;
  /** حجم العيّنة الكبيرة بالبكسل */
  size?: number;
  /** تشغيل حركة الوزن (للخطوط المتغيرة) */
  breathe?: boolean;
  className?: string;
}

/** أوزان العرض: 5 خطوات للمتغير، أو الحدّان للثابت */
export function weightSteps(font: FontDef): number[] {
  const [min, max] = font.weights;
  if (!font.variable) return min === max ? [min] : [min, max];
  const steps = 5;
  return Array.from({ length: steps }, (_, i) => Math.round(min + ((max - min) * i) / (steps - 1)));
}

/** بطاقة عيّنة لخط من السجل: الاسم، النوع، المحاور، سلّم الأوزان، ونص اختبار */
export function FontSpecimen({ font, sample = ARABIC_SAMPLE, size = 40, breathe = false, className }: FontSpecimenProps) {
  const [ready, setReady] = useState(false);
  useEffect(() => {
    let alive = true;
    ensureFontLoaded(font.id).then(() => alive && setReady(true));
    return () => {
      alive = false;
    };
  }, [font.id]);
  const family = fontStack(font);
  const latinOnly = !font.scripts.includes('arabic');
  const text = latinOnly ? 'The quick brown fox jumps over the lazy dog — 0123456789' : sample;
  return (
    <article
      className={cn('rounded-2xl border border-white/10 bg-white/[0.04] p-5 transition', !ready && 'opacity-60', className)}
      data-font={font.id}
    >
      <header className="mb-3 flex flex-wrap items-center gap-2 text-sm">
        <h3 className="text-lg font-extrabold text-slate-100">{font.label}</h3>
        <span dir="ltr" className="font-mono text-xs text-sky-300">
          {font.latinName}
        </span>
        <span className="rounded-full bg-white/10 px-2 py-0.5 text-xs text-slate-300">{FONT_CATEGORY_LABELS[font.category]}</span>
        <span className="rounded-full bg-white/10 px-2 py-0.5 text-xs text-slate-300">{font.variable ? 'متغيّر' : 'ثابت'}</span>
        {font.axes &&
          Object.entries(font.axes).map(([axis, [lo, hi]]) => (
            <code key={axis} className="rounded bg-sky-400/10 px-1.5 py-0.5 text-[11px] text-sky-200">
              {axis} {lo}–{hi}
            </code>
          ))}
        <span className="ms-auto text-xs text-slate-400">الأدوار: {font.roles.join(' · ')}</span>
      </header>
      <p
        dir={latinOnly ? 'ltr' : 'rtl'}
        className="leading-snug text-slate-50"
        style={{ fontFamily: family, fontSize: size, lineHeight: font.lineHeight, fontWeight: 700 }}
      >
        {breathe && font.variable ? (
          <VariableText mode="loop" from={font.weights[0]} to={font.weights[1]} duration={1.8}>
            {text}
          </VariableText>
        ) : (
          text
        )}
      </p>
      <div dir={latinOnly ? 'ltr' : 'rtl'} className="mt-3 flex flex-wrap gap-x-6 gap-y-1 text-xl text-slate-200" style={{ fontFamily: family }}>
        {weightSteps(font).map((w) => (
          <span key={w} style={{ fontWeight: w }}>
            {latinOnly ? 'Weight' : 'وزن'}{' '}
            <span dir="ltr" className="font-mono text-xs text-slate-400">
              {w}
            </span>
          </span>
        ))}
      </div>
      <p className="mt-3 text-sm text-slate-400">{font.bestFor}</p>
      <code dir="ltr" className="mt-2 block text-[11px] text-slate-500">{`fontFamily: "${family}"`}</code>
    </article>
  );
}
