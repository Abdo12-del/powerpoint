import NumberFlow, { type Format, type Trend } from '@number-flow/react';
import type { CSSProperties } from 'react';
import { cn } from '@/lib/cn';

export interface NumberRollProps {
  value: number;
  /**
   * المحلّية تحدّد شكل الأرقام: 'ar-EG' (الافتراضي) ← ٠١٢٣ هندية · 'ar-DZ' / 'ar-MA' / 'en' ← 0123 غربية
   */
  locales?: string | string[];
  /** خيارات Intl.NumberFormat: { style: 'percent' } · { notation: 'compact' } · { minimumFractionDigits: 1 } */
  format?: Format;
  prefix?: string;
  suffix?: string;
  /** اتجاه الدوران: +1 الخانات تصعد دائماً، -1 تهبط، 0 كل خانة تختار أقصر طريق (الافتراضي: حسب إشارة تغيّر القيمة) */
  trend?: Trend;
  /** تعطيل الحركة مؤقتاً (مثلاً أثناء السحب) */
  animated?: boolean;
  className?: string;
  style?: CSSProperties;
  onAnimationsFinish?: () => void;
}

/**
 * رقم «يتدحرج» خانةً خانة (number-flow، MIT) — بديل الـ CountUp التقليدي الذي يومض بالأرقام العشوائية.
 * الخانات عناصر مستقلة متحركة، فلا يتأثر النص العربي المجاور ولا يحتاج إلى تقسيم أي كلمة.
 * يُغلَّف بـ dir="ltr" لأن الأرقام تُقرأ من اليسار حتى داخل الفقرة العربية؛ البادئة/اللاحقة تبقيان داخل الغلاف.
 *
 * @example <NumberRoll value={stats.graduates} suffix=" خرّيجاً" />
 * @example <NumberRoll value={0.87} format={{ style: 'percent' }} locales="ar-DZ" trend={1} />
 */
export function NumberRoll({
  value,
  locales = 'ar-EG',
  format,
  prefix,
  suffix,
  trend,
  animated,
  className,
  style,
  onAnimationsFinish,
}: NumberRollProps) {
  return (
    <span dir="ltr" className={cn('inline-block tabular-nums', className)} style={style}>
      <NumberFlow
        value={value}
        locales={locales}
        format={format}
        prefix={prefix}
        suffix={suffix}
        trend={trend}
        animated={animated}
        respectMotionPreference
        onAnimationsFinish={onAnimationsFinish}
      />
    </span>
  );
}
