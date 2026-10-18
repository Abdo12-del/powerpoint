import { createElement, useEffect, useRef, type ReactNode } from 'react';
import { annotate } from 'rough-notation';
import type { RoughAnnotationType } from 'rough-notation/lib/model';

export interface AnnotateProps {
  children: ReactNode;
  /** underline | box | circle | highlight | strike-through | crossed-off | bracket */
  type?: RoughAnnotationType;
  color?: string;
  show?: boolean;
  /** تأخير الظهور بالمللي ثانية */
  delay?: number;
  /** مدة الرسم بالمللي ثانية */
  duration?: number;
  strokeWidth?: number;
  padding?: number | [number, number] | [number, number, number, number];
  iterations?: number;
  multiline?: boolean;
  /** اتجاه الرسم — true للنص العربي (الافتراضي) */
  rtl?: boolean;
  brackets?: ('left' | 'right' | 'top' | 'bottom')[];
  as?: 'span' | 'strong' | 'em' | 'mark' | 'div';
  className?: string;
}

/**
 * تعليق بخط اليد حول كلمة أو عبارة (rough-notation) — تحديد، دائرة، تظليل…
 * مثالي لإبراز المصطلح المفتاحي في الشريحة.
 *
 * @example <Annotate type="circle" color="#fbbf24" delay={600}>الإشكالية</Annotate>
 */
export function Annotate({
  children,
  type = 'underline',
  color = '#fbbf24',
  show = true,
  delay = 300,
  duration = 800,
  strokeWidth = 2,
  padding,
  iterations = 2,
  multiline = true,
  rtl = true,
  brackets,
  as = 'span',
  className,
}: AnnotateProps) {
  const ref = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const annotation = annotate(el, {
      type,
      color,
      animationDuration: duration,
      strokeWidth,
      padding,
      iterations,
      multiline,
      rtl,
      brackets,
    });
    let timer: number | undefined;
    if (show) timer = window.setTimeout(() => annotation.show(), delay);
    return () => {
      if (timer) window.clearTimeout(timer);
      annotation.remove();
    };
  }, [type, color, show, delay, duration, strokeWidth, padding, iterations, multiline, rtl, brackets]);

  return createElement(as, { ref, className }, children);
}
