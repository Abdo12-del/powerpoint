import type { ChapterData, PresentationData, SlideData } from '@/types/presentation';

/**
 * الشاشات الخمس الثابتة (§2) — الترتيب إلزامي:
 * العنوان ← المقدمة (خطوات) ← الخريطة ← الشرائح ← الخاتمة
 */
export type Screen =
  | { kind: 'title' }
  | { kind: 'preface'; step: number }
  | { kind: 'map' }
  | { kind: 'slide'; index: number }
  | { kind: 'final' };

/** شريحة مُسطَّحة مع موقعها في العرض وفصلها المالك. */
export interface FlatSlide {
  slide: SlideData;
  chapter: ChapterData;
  chapterIndex: number;
  /** الموقع في العرض كاملاً (0-based) */
  index: number;
  /** الموقع داخل الفصل (0-based) */
  indexInChapter: number;
}

/** يُسطِّح الفصول إلى قائمة شرائح خطية مع الاحتفاظ بالفصل المالك. */
export function flattenSlides(chapters: ChapterData[]): FlatSlide[] {
  const out: FlatSlide[] = [];
  chapters.forEach((chapter, chapterIndex) => {
    chapter.slides.forEach((slide, indexInChapter) => {
      out.push({ slide, chapter, chapterIndex, index: out.length, indexInChapter });
    });
  });
  return out;
}

/** التسلسل الخطي الكامل للعرض — يُستعمل لشريط التقدّم. */
export function buildSequence(data: PresentationData): Screen[] {
  const seq: Screen[] = [{ kind: 'title' }];
  data.preface.forEach((_, step) => seq.push({ kind: 'preface', step }));
  seq.push({ kind: 'map' });
  flattenSlides(data.chapters).forEach((_, index) => seq.push({ kind: 'slide', index }));
  seq.push({ kind: 'final' });
  return seq;
}

export function screenKey(screen: Screen): string {
  switch (screen.kind) {
    case 'preface':
      return `preface-${screen.step}`;
    case 'slide':
      return `slide-${screen.index}`;
    default:
      return screen.kind;
  }
}

export function sameScreen(a: Screen, b: Screen): boolean {
  return screenKey(a) === screenKey(b);
}

/** موقع الشاشة في التسلسل الخطي (0-based). */
export function positionOf(screen: Screen, sequence: Screen[]): number {
  const key = screenKey(screen);
  const i = sequence.findIndex((s) => screenKey(s) === key);
  return i < 0 ? 0 : i;
}

/** نسبة التقدّم (0..1) = الموضع / الإجمالي */
export function progressOf(screen: Screen, sequence: Screen[]): number {
  if (sequence.length <= 1) return 1;
  return (positionOf(screen, sequence) + 1) / sequence.length;
}

export interface NavContext {
  prefaceCount: number;
  slideCount: number;
  /** آخر شريحة زارها المشاهد — تُستعمل عند العودة من الخريطة */
  lastSlide: number;
}

/** الشاشة التالية وفق عقد التدفق (§6). */
export function nextScreen(screen: Screen, ctx: NavContext): Screen {
  switch (screen.kind) {
    case 'title':
      return ctx.prefaceCount > 0 ? { kind: 'preface', step: 0 } : { kind: 'map' };
    case 'preface':
      return screen.step + 1 < ctx.prefaceCount
        ? { kind: 'preface', step: screen.step + 1 }
        : { kind: 'map' };
    case 'map':
      if (ctx.slideCount === 0) return { kind: 'final' };
      return { kind: 'slide', index: Math.max(0, Math.min(ctx.lastSlide, ctx.slideCount - 1)) };
    case 'slide':
      return screen.index + 1 < ctx.slideCount
        ? { kind: 'slide', index: screen.index + 1 }
        : { kind: 'final' };
    case 'final':
      return screen;
  }
}

/** الشاشة السابقة وفق عقد التدفق (§6). */
export function prevScreen(screen: Screen, ctx: NavContext): Screen {
  switch (screen.kind) {
    case 'title':
      return screen;
    case 'preface':
      return screen.step > 0 ? { kind: 'preface', step: screen.step - 1 } : { kind: 'title' };
    case 'map':
      return ctx.prefaceCount > 0
        ? { kind: 'preface', step: ctx.prefaceCount - 1 }
        : { kind: 'title' };
    case 'slide':
      return screen.index > 0 ? { kind: 'slide', index: screen.index - 1 } : { kind: 'map' };
    case 'final':
      return ctx.slideCount > 0 ? { kind: 'slide', index: ctx.slideCount - 1 } : { kind: 'map' };
  }
}

/**
 * Esc: من الخريطة ← شاشة العنوان (القائمة/الخروج)، ومن أي شاشة أخرى ← الخريطة.
 */
export function escapeScreen(screen: Screen): Screen {
  return screen.kind === 'map' ? { kind: 'title' } : { kind: 'map' };
}
