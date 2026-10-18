import { motion } from 'framer-motion';
import type { FlatSlide } from '@/lib/navigation';
import { cn } from '@/lib/cn';
import { hasText } from '@/lib/blank';

/**
 * رأس الشريحة: شارة الفصل + العنوان + العنوان الفرعي (§4).
 * القالب الأبيض: بلا عنوان لا يظهر صف العنوان؛ وبلا اسم للفصل تبقى الشارة أيقونة ورقماً.
 */
export function SlideHeader({ item }: { item: FlatSlide }) {
  const { slide, chapter, chapterIndex, indexInChapter } = item;
  const ChapterIcon = chapter.icon;
  const SlideIcon = slide.icon;
  return (
    <header className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center gap-2 text-sm">
        <span
          className={cn('inline-flex items-center gap-1.5 rounded-full border bg-white/[0.04] px-3 py-1 font-semibold tabular-nums', chapter.accent)}
        >
          <ChapterIcon className="h-4 w-4" />
          {hasText(chapter.title) ? `الفصل ${chapterIndex + 1} — ${chapter.title}` : chapterIndex + 1}
        </span>
        <span className="text-slate-400 tabular-nums">
          {indexInChapter + 1} / {chapter.slides.length}
        </span>
      </div>
      {hasText(slide.title, slide.subtitle) && (
        <div className="flex items-center gap-4">
          <motion.span
            initial={{ scale: 0.6, opacity: 0, rotate: -10 }}
            animate={{ scale: 1, opacity: 1, rotate: 0 }}
            transition={{ type: 'spring', stiffness: 260, damping: 18 }}
            className={cn('flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border bg-gradient-to-br', chapter.color, chapter.accent)}
          >
            <SlideIcon className="h-7 w-7" />
          </motion.span>
          <div className="min-w-0">
            {hasText(slide.title) && (
              <motion.h2
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.05 }}
                className="text-3xl font-extrabold leading-tight sm:text-4xl"
              >
                {slide.title}
              </motion.h2>
            )}
            {hasText(slide.subtitle) && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.4, delay: 0.2 }}
                className="mt-1 text-base text-slate-300 sm:text-lg"
              >
                {slide.subtitle}
              </motion.p>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
