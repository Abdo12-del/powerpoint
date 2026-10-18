import { DotPattern, TextAnimate, WordRotate, ShimmerButton } from '@/components/gallery';
import { cn } from '@/lib/cn';

export interface TitleHeroProps {
  title: string;
  /** كلمات تتبدّل تحت العنوان (مثلاً صفات المشروع) */
  rotating?: string[];
  ctaLabel?: string;
  onCta?: () => void;
  className?: string;
}

/**
 * وصفة «بطل العنوان»: نمط نقاط خلفي + عنوان يدخل كلمةً كلمة بضبابية + كلمة تتبدّل + زر لامع.
 * تصلح لشاشة عنوان مخصّصة أو لتمهيد فصل مميّز.
 */
export function TitleHero({ title, rotating, ctaLabel, onCta, className }: TitleHeroProps) {
  return (
    <div
      className={cn(
        'relative flex h-full min-h-[320px] w-full flex-col items-center justify-center overflow-hidden rounded-3xl text-center',
        className,
      )}
    >
      <DotPattern className="pointer-events-none absolute inset-0 text-white/15 [mask-image:radial-gradient(60%_60%_at_50%_50%,#000,transparent)]" />
      <div className="relative z-10 flex flex-col items-center gap-6 px-6">
        <TextAnimate as="h1" by="word" animation="blurInUp" duration={0.9} className="text-4xl font-black leading-tight sm:text-5xl">
          {title}
        </TextAnimate>
        {rotating && rotating.length > 0 && <WordRotate words={rotating} duration={2200} className="text-2xl font-bold text-amber-300" />}
        {ctaLabel && (
          <ShimmerButton onClick={onCta} background="#f59e0b" shimmerColor="#fff7ed" className="px-8 py-3 text-lg font-bold text-slate-950">
            {ctaLabel}
          </ShimmerButton>
        )}
      </div>
    </div>
  );
}
