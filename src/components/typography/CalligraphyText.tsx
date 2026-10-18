import { useEffect, useMemo, useState, type CSSProperties } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/cn';
import { prefersReducedMotion } from '@/lib/motion-prefs';
import { FONTS, fontStack } from '@/fonts/registry';
import { CALLIGRAPHY_FONTS, calligraphySource, type CalligraphyFontId } from '@/fonts/calligraphy';
import type { ShapedText, ShaperFontSource } from '@/lib/text-shaper';

export type CalligraphyMode = 'draw' | 'draw-fill' | 'fill' | 'glyphs';

export interface CalligraphyTextProps {
  text: string;
  /** خط من القائمة القابلة للتشكيل، أو ملفات خاصة { arabic, latin?, variations? } */
  font?: CalligraphyFontId | ShaperFontSource;
  weight?: number;
  /** حجم الخط بالبكسل (الـ SVG يتمدد مع الحاوية إن ضبطت width بالـ CSS) */
  size?: number;
  color?: string;
  /** لون القلم (الافتراضي = color) */
  strokeColor?: string;
  /** سماكة القلم بالبكسل (الافتراضي من الخط) */
  strokeWidth?: number;
  /**
   * draw: يرسم الخط الخارجي فقط · draw-fill: يرسم ثم يملأ (الافتراضي) · fill: الأشكال تظهر تباعاً بلا قلم · glyphs: بلا حركة
   */
  mode?: CalligraphyMode;
  /** زمن الكتابة الكلي بالثواني */
  duration?: number;
  delay?: number;
  dir?: 'rtl' | 'ltr';
  /** ميزات OpenType إضافية مثل ['dlig', 'ss01'] */
  features?: string[];
  /** مساحة أمان حول النص (بكسل) لتفادي قص الحركات والنوازل */
  padding?: number;
  className?: string;
  style?: CSSProperties;
  onComplete?: () => void;
}

const shaperCache = new Map<string, Promise<ShapedText>>();

/** تشكيل مع تخزين مؤقت (نفس النص/الخط/الحجم لا يُشكَّل مرتين) */
async function shapeCached(text: string, source: ShaperFontSource, size: number, dir: 'rtl' | 'ltr', features?: string[]): Promise<ShapedText> {
  const key = JSON.stringify([
    text,
    typeof source.arabic === 'string' ? source.arabic : 'bytes',
    typeof source.latin === 'string' ? source.latin : '',
    source.variations ?? null,
    size,
    dir,
    features ?? null,
  ]);
  let p = shaperCache.get(key);
  if (!p) {
    p = import('@/lib/text-shaper').then(async ({ loadShaperFont, shapeText }) =>
      shapeText(text, await loadShaperFont(source), { size, dir, features }),
    );
    shaperCache.set(key, p);
    p.catch(() => shaperCache.delete(key));
  }
  return p;
}

/**
 * «الخط يُكتب»: النص يُشكَّل بـ HarfBuzz إلى مسارات SVG حقيقية ثم يُرسم بالقلم شكلاً شكلاً من اليمين إلى اليسار.
 * الطريقة الوحيدة الآمنة لرسم العربية تدريجياً: الأشكال هي الحروف المتصلة فعلاً (مع الروابط والحركات) لا حروفاً مفككة.
 * يُحمَّل HarfBuzz (≈430KB wasm) وملف الخط كسولاً عند أول استعمال فقط.
 *
 * @example <CalligraphyText text="بسم الله الرحمن الرحيم" font="aref-ruqaa" size={96} />
 * @example <CalligraphyText text={meta.title} font="amiri" weight={700} mode="draw" strokeColor="#38bdf8" duration={4} />
 */
export function CalligraphyText({
  text,
  font = 'aref-ruqaa',
  weight = 400,
  size = 72,
  color = '#fbbf24',
  strokeColor,
  strokeWidth,
  mode = 'draw-fill',
  duration = 3,
  delay = 0,
  dir = 'rtl',
  features,
  padding,
  className,
  style,
  onComplete,
}: CalligraphyTextProps) {
  const [shaped, setShaped] = useState<ShapedText | null>(null);
  const [failed, setFailed] = useState(false);
  const fontDef = typeof font === 'string' ? CALLIGRAPHY_FONTS[font] : undefined;
  const source = useMemo(() => (typeof font === 'string' ? calligraphySource(font, weight) : font), [font, weight]);
  const reduced = prefersReducedMotion();

  useEffect(() => {
    let alive = true;
    setShaped(null);
    setFailed(false);
    shapeCached(text, source, size, dir, features)
      .then((s) => alive && setShaped(s))
      .catch((err) => {
        console.warn('[CalligraphyText] تعذّر تشكيل النص — عرض نص عادي بدلاً من ذلك', err);
        if (alive) setFailed(true);
      });
    return () => {
      alive = false;
    };
  }, [text, source, size, dir, features]);

  const family = fontDef ? fontStack(FONTS[fontDef.fontId]) : undefined;
  const pad = padding ?? Math.round(size * 0.15);
  const pen = strokeWidth ?? Math.max(1, size * (fontDef?.penWidth ?? 0.012));

  if (failed || !shaped) {
    // احتياطي/تحميل: النص نفسه بالخط المطلوب (مخفي أثناء التحميل ليحجز المساحة)
    return (
      <span
        dir={dir}
        className={cn('inline-block', !failed && 'opacity-0', className)}
        style={{ fontFamily: family, fontSize: size, fontWeight: weight, color, lineHeight: 1.6, ...style }}
        aria-label={text}
        aria-busy={!failed}
      >
        {text}
      </span>
    );
  }

  const total = shaped.glyphs.reduce((n, g) => n + Math.max(g.advance, size * 0.15), 0) || 1;
  let elapsed = delay;
  const animated = mode !== 'glyphs' && !reduced;
  const strokeOnly = mode === 'draw';
  const lastIndex = shaped.glyphs.length - 1;

  return (
    <svg
      role="img"
      aria-label={text}
      className={cn('inline-block overflow-visible align-baseline', className)}
      width={shaped.width + pad * 2}
      height={shaped.height + pad * 2}
      viewBox={`${-pad} ${-pad} ${shaped.width + pad * 2} ${shaped.height + pad * 2}`}
      style={{ maxWidth: '100%', height: 'auto', ...style }}
    >
      {shaped.glyphs.map((g, i) => {
        const share = Math.max(g.advance, size * 0.15) / total;
        const d = duration * share;
        const start = elapsed;
        elapsed += d;
        const transform = `translate(${g.x.toFixed(2)} ${g.y.toFixed(2)}) scale(${g.scale.toFixed(5)} ${(-g.scale).toFixed(5)})`;
        const common = { d: g.d, transform, vectorEffect: 'non-scaling-stroke' as const };
        if (!animated)
          return (
            <path key={i} {...common} fill={strokeOnly ? 'none' : color} stroke={strokeOnly ? (strokeColor ?? color) : 'none'} strokeWidth={pen} />
          );
        if (mode === 'fill')
          return (
            <motion.path
              key={i}
              {...common}
              fill={color}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: Math.max(0.2, d * 2), delay: start, ease: 'easeOut' }}
              onAnimationComplete={i === lastIndex ? onComplete : undefined}
            />
          );
        return (
          <motion.path
            key={i}
            {...common}
            stroke={strokeColor ?? color}
            strokeWidth={pen}
            strokeLinecap="round"
            strokeLinejoin="round"
            fill={strokeOnly ? 'none' : color}
            initial={{ pathLength: 0, fillOpacity: 0, strokeOpacity: 1 }}
            animate={{ pathLength: 1, fillOpacity: strokeOnly ? 0 : 1, strokeOpacity: strokeOnly ? 1 : 0 }}
            transition={{
              pathLength: { duration: d, delay: start, ease: 'linear' },
              fillOpacity: { duration: 0.5, delay: start + d * 0.6 },
              strokeOpacity: { duration: 0.6, delay: delay + duration + 0.2 },
            }}
            onAnimationComplete={i === lastIndex ? onComplete : undefined}
          />
        );
      })}
    </svg>
  );
}
