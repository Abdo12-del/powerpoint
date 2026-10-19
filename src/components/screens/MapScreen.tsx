import { motion } from 'framer-motion';
import { Check, CornerDownLeft, LogOut, Map as MapIcon } from 'lucide-react';
import type { ChapterData } from '@/types/presentation';
import type { FlatSlide } from '@/lib/navigation';
import { fadeUp, staggerContainer } from '@/components/ui';
import { cn } from '@/lib/cn';
import { hasText, isBlankChapter } from '@/lib/blank';
import { chapterPaletteStyle } from '@/components/themes/palette';

interface MapScreenProps {
  chapters: ChapterData[];
  slides: FlatSlide[];
  currentChapterId?: string;
  lastSlideId?: string;
  visited: string[];
  onSelect: (index: number) => void;
}

/**
 * 2.3 خريطة الفصول — تُبنى آلياً من مصفوفة الفصول:
 * كل الفصول وكل محاورها كعقد مرئية؛ اختيار أي محور يقفز إلى شريحته.
 * القالب الأبيض: ما دامت الفصول بلا نصّ تبقى الخريطة أيقونات وأرقاماً فقط (بلا رأس ولا شارات مكتوبة).
 */
export function MapScreen({ chapters, slides, currentChapterId, lastSlideId, visited, onSelect }: MapScreenProps) {
  const indexOf = (slideId: string) => slides.find((s) => s.slide.id === slideId)?.index ?? 0;
  const cols = Math.min(Math.max(chapters.length, 1), 5);
  const filled = chapters.some((c) => !isBlankChapter(c));

  return (
    <div className="mx-auto flex h-full w-full max-w-7xl flex-col px-6 pt-10 pb-24 sm:px-10">
      {filled && (
        <motion.header initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-sm font-bold text-amber-300">
              <MapIcon className="h-4 w-4" /> خريطة العرض
            </div>
            <h2 className="mt-1 text-3xl font-extrabold sm:text-4xl">الفصول والمحاور</h2>
          </div>
          <div className="flex flex-wrap gap-3 text-xs text-slate-400">
            <span className="inline-flex items-center gap-1.5">
              <CornerDownLeft className="h-3.5 w-3.5" /> Enter للمتابعة من آخر موضع
            </span>
            <span className="inline-flex items-center gap-1.5">
              <LogOut className="h-3.5 w-3.5" /> Esc للعودة إلى شاشة العنوان
            </span>
          </div>
        </motion.header>
      )}

      <motion.div
        variants={staggerContainer(0.1, 0.1)}
        initial="hidden"
        animate="show"
        className={cn('grid min-h-0 flex-1 gap-5 overflow-y-auto pb-2', filled ? 'mt-8' : 'content-center')}
        style={{ gridTemplateColumns: `repeat(auto-fit, minmax(min(100%, ${cols >= 4 ? '15rem' : '18rem'}), 1fr))` }}
      >
        {chapters.map((chapter, ci) => {
          const ChapterIcon = chapter.icon;
          const hasChapterPalette = Boolean(chapter.brandColor);
          const paletteStyle = chapter.brandColor ? chapterPaletteStyle(chapter.brandColor) : undefined;
          const isCurrent = chapter.id === currentChapterId;
          const visitedCount = chapter.slides.filter((s) => visited.includes(s.id)).length;
          return (
            <motion.section
              key={chapter.id}
              variants={fadeUp}
              aria-label={chapter.title || `الفصل ${ci + 1}`}
              className={cn(
                'chapter-palette-scope relative flex flex-col overflow-hidden rounded-3xl border p-4 transition',
                hasChapterPalette ? 'chapter-palette-card' : cn('bg-gradient-to-b', chapter.color),
                isCurrent
                  ? hasChapterPalette
                    ? 'chapter-palette-current'
                    : 'border-amber-400/60 shadow-[0_0_0_1px_rgba(251,191,36,0.4),0_20px_60px_-20px_rgba(251,191,36,0.35)]'
                  : hasChapterPalette
                    ? 'chapter-palette-border'
                    : 'border-white/10',
              )}
              style={paletteStyle}
            >
              {isCurrent && filled && (
                <span
                  className={cn(
                    'absolute end-4 top-4 rounded-full px-2 py-0.5 text-[11px] font-black',
                    hasChapterPalette ? 'chapter-palette-current-badge' : 'bg-amber-400 text-slate-950',
                  )}
                >
                  الفصل الحالي
                </span>
              )}
              <div className="flex items-center gap-3">
                <span
                  className={cn(
                    'flex h-12 w-12 items-center justify-center rounded-2xl border',
                    hasChapterPalette ? 'chapter-palette-icon chapter-palette-border' : cn('bg-slate-950/40', chapter.accent),
                  )}
                >
                  <ChapterIcon className="h-6 w-6" />
                </span>
                <div className="min-w-0">
                  <div className="text-xs font-bold text-slate-300 tabular-nums">{filled ? `الفصل ${ci + 1}` : ci + 1}</div>
                  {hasText(chapter.title) && <h3 className="truncate text-lg font-extrabold">{chapter.title}</h3>}
                </div>
              </div>
              {hasText(chapter.subtitle) && <p className="mt-2 text-sm text-slate-300/90">{chapter.subtitle}</p>}

              <div className="mt-2 flex items-center gap-2 text-[11px] text-slate-400">
                <span className="h-1 flex-1 overflow-hidden rounded-full bg-white/10">
                  <span
                    className={cn('block h-full', hasChapterPalette ? 'chapter-palette-fill' : 'bg-amber-300/80')}
                    style={{ width: `${(visitedCount / chapter.slides.length) * 100}%` }}
                  />
                </span>
                <span className="tabular-nums">
                  {visitedCount} / {chapter.slides.length}
                </span>
              </div>

              <ol className="relative mt-4 space-y-1.5">
                <span
                  className={cn('absolute inset-y-3 start-[1.55rem] w-px', hasChapterPalette ? 'chapter-palette-track' : 'bg-white/15')}
                  aria-hidden
                />
                {chapter.slides.map((slide, si) => {
                  const SlideIcon = slide.icon;
                  const isLast = slide.id === lastSlideId;
                  const seen = visited.includes(slide.id);
                  const isEdge = slide.archetype === 'chapter-preface' || slide.archetype === 'chapter-summary';
                  const isPlaceholder = slide.archetype === 'placeholder';
                  return (
                    <li key={slide.id}>
                      <button
                        type="button"
                        onClick={() => onSelect(indexOf(slide.id))}
                        className={cn(
                          'group relative flex w-full items-center gap-3 rounded-xl border px-2 py-1.5 text-start transition',
                          isLast
                            ? hasChapterPalette
                              ? 'chapter-palette-selected-slide'
                              : 'border-amber-400/50 bg-amber-400/15'
                            : isPlaceholder
                              ? 'border-dashed border-white/15 hover:bg-white/[0.07]'
                              : 'border-transparent hover:border-white/15 hover:bg-white/[0.07]',
                        )}
                      >
                        <span
                          className={cn(
                            'relative z-10 flex h-[2.1rem] w-[2.1rem] shrink-0 items-center justify-center rounded-full border bg-slate-950',
                            isLast
                              ? hasChapterPalette
                                ? 'chapter-palette-active-node'
                                : 'border-amber-400 text-amber-300'
                              : seen
                                ? 'border-emerald-400/50 text-emerald-300'
                                : 'border-white/20 text-slate-300',
                            isEdge && 'rounded-lg',
                          )}
                        >
                          {seen && !isLast ? <Check className="h-4 w-4" /> : <SlideIcon className="h-4 w-4" />}
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className={cn('block truncate text-[15px] font-semibold', (isEdge || isPlaceholder) && 'text-slate-300')}>
                            {slide.title}
                            {isPlaceholder && filled && <span className="ms-2 text-[11px] font-normal text-amber-300/80">فارغة</span>}
                          </span>
                          {hasText(slide.subtitle) && <span className="block truncate text-xs text-slate-400">{slide.subtitle}</span>}
                        </span>
                        <span className="text-xs text-slate-500 tabular-nums">{si + 1}</span>
                      </button>
                    </li>
                  );
                })}
              </ol>
            </motion.section>
          );
        })}
      </motion.div>
    </div>
  );
}
