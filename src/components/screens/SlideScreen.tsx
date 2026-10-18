import type { FlatSlide } from '@/lib/navigation';
import { SlideHeader } from '@/components/chrome/SlideHeader';

/** 2.4 الشرائح — رأس + منطقة محتوى قابلة للتمرير. */
export function SlideScreen({ item }: { item: FlatSlide }) {
  return (
    <article className="mx-auto flex h-full w-full max-w-7xl flex-col gap-6 px-6 pt-10 pb-24 sm:px-10" aria-labelledby={`slide-${item.slide.id}`}>
      <SlideHeader item={item} />
      <div className="min-h-0 flex-1 overflow-y-auto pe-1">
        <div className="flex min-h-full flex-col justify-center">{item.slide.content}</div>
      </div>
    </article>
  );
}
