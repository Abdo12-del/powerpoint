import { useEffect, useRef, type CSSProperties, type ElementType, type ReactNode } from 'react';
import fitty, { type FittyInstance } from 'fitty';
import { cn } from '@/lib/cn';

export interface FitTextProps {
  children: ReactNode;
  as?: ElementType;
  /** أصغر حجم خط بالبكسل */
  minSize?: number;
  /** أكبر حجم خط بالبكسل */
  maxSize?: number;
  /** السماح بأكثر من سطر (الافتراضي: سطر واحد يملأ العرض) */
  multiLine?: boolean;
  className?: string;
  style?: CSSProperties;
}

/**
 * نص يملأ عرض حاويته تماماً (fitty، MIT) — للعناوين الكبيرة والأرقام البطلة والكلمة الواحدة على الشاشة.
 * يعيد القياس عند تغيّر الحجم وبعد تحميل الخط (document.fonts.ready) حتى لا يُقاس بخط النظام الاحتياطي.
 * لا يمسّ الحروف ولا يفصلها: يغيّر font-size فقط، فهو آمن للعربية والخطوط المتصلة.
 *
 * @example <FitText as="h1" minSize={32} maxSize={220} className="font-black text-amber-300">{meta.title}</FitText>
 */
export function FitText({ children, as: Tag = 'div', minSize = 16, maxSize = 512, multiLine = false, className, style }: FitTextProps) {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const instance: FittyInstance = fitty(el, { minSize, maxSize, multiLine });
    let alive = true;
    // إعادة القياس بعد وصول الخط الحقيقي (قد يكون أعرض/أضيق من الخط الاحتياطي)
    document.fonts?.ready.then(() => alive && instance.fit());
    return () => {
      alive = false;
      instance.unsubscribe();
    };
  }, [minSize, maxSize, multiLine, children]);

  // fitty يضبط display:inline-block و white-space:nowrap على العنصر نفسه؛ الحاوية الخارجية تحدّد العرض المتاح
  return (
    <div className={cn('w-full', className)} style={style}>
      <Tag ref={ref} className="leading-[1.25]">
        {children}
      </Tag>
    </div>
  );
}
