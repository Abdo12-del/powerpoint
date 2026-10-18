import { TypeAnimation } from 'react-type-animation';
import type { ComponentProps } from 'react';

type Wrapper = NonNullable<ComponentProps<typeof TypeAnimation>['wrapper']>;

export interface TypewriterProps {
  /** نص واحد أو عدة نصوص تُكتب تباعاً (مع حذف بينها) */
  text: string | string[];
  /** سرعة الكتابة 1–99 (الافتراضي 55) */
  speed?: number;
  /** توقّف بعد كل نص بالمللي ثانية */
  pause?: number;
  /** عدد التكرارات — Infinity للأبد، 0 لمرة واحدة */
  repeat?: number;
  cursor?: boolean;
  /** الكتابة كلمةً كلمة بدل حرفاً حرفاً */
  byWord?: boolean;
  as?: Wrapper;
  className?: string;
}

const WORD_SPLITTER = (s: string) => s.match(/\S+\s*/g) ?? [s];

/**
 * تأثير الآلة الكاتبة (react-type-animation).
 * آمن للعربية: النص يبقى عقدة نصية واحدة فتتصل الحروف طبيعياً أثناء الكتابة.
 *
 * @example <Typewriter as="h2" text={['نظام معلوماتي…', 'لتسيير…']} repeat={Infinity} />
 */
export function Typewriter({ text, speed = 55, pause = 1600, repeat = 0, cursor = true, byWord = false, as = 'span', className }: TypewriterProps) {
  const items = Array.isArray(text) ? text : [text];
  const sequence = items.flatMap((t) => [t, pause]);
  return (
    <TypeAnimation
      sequence={sequence}
      wrapper={as}
      speed={Math.min(99, Math.max(1, speed)) as 50}
      repeat={repeat}
      cursor={cursor}
      splitter={byWord ? WORD_SPLITTER : undefined}
      className={className}
    />
  );
}
