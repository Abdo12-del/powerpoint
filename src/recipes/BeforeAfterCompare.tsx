import { ImageComparison, ImageComparisonImage, ImageComparisonSlider } from '@/components/gallery';
import { cn } from '@/lib/cn';

export interface BeforeAfterCompareProps {
  before: { src: string; caption: string };
  after: { src: string; caption: string };
  className?: string;
}

/**
 * وصفة «قبل / بعد» (نمط comparison للصور): شريط سحب يكشف الصورتين مع تسميتين.
 * <BeforeAfterCompare before={{ src: '/screens/before.png', caption: 'قبل' }} after={{ src: '/screens/after.png', caption: 'بعد' }} />
 */
export function BeforeAfterCompare({ before, after, className }: BeforeAfterCompareProps) {
  return (
    <div className={cn('mx-auto w-full max-w-4xl', className)}>
      <div dir="ltr">
        <ImageComparison className="aspect-video overflow-hidden rounded-2xl border border-white/10" enableHover>
          <ImageComparisonImage src={before.src} alt={before.caption} position="left" />
          <ImageComparisonImage src={after.src} alt={after.caption} position="right" />
          <ImageComparisonSlider className="w-1 bg-amber-400">
            <span className="absolute left-1/2 top-1/2 h-9 w-9 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-amber-400 bg-slate-950" />
          </ImageComparisonSlider>
        </ImageComparison>
      </div>
      <div className="mt-3 flex justify-between text-sm text-slate-300" dir="ltr">
        <span>{before.caption}</span>
        <span>{after.caption}</span>
      </div>
    </div>
  );
}
