import type { ChapterData, PresentationData, PresentationMeta, SlideData } from '@/types/presentation';

/**
 * «الشاشة البيضاء»: القالب يأتي بلا نصّ في أي شاشة. كل شاشة تُخفي عناوينها
 * وشاراتها وتلميحاتها ما دامت بياناتها بلا نصّ، وتُظهرها فور الكتابة فيها.
 * هذه الدوال هي مصدر الحقيقة الوحيد لذلك القرار (الشاشات + المدقّق + الاختبارات).
 */

/** هل في أيٍّ من القيم نصّ غير فارغ؟ */
export function hasText(...values: Array<string | null | undefined>): boolean {
  return values.some((v) => typeof v === 'string' && v.trim().length > 0);
}

/** شريحة بيضاء: بلا عنوان وبلا محتوى. */
export function isBlankSlide(slide: Pick<SlideData, 'title' | 'subtitle' | 'content'>): boolean {
  return !hasText(slide.title, slide.subtitle) && (slide.content === null || slide.content === undefined);
}

/** فصل بيضاء كل شرائحه وبلا عنوان. */
export function isBlankChapter(chapter: ChapterData): boolean {
  return !hasText(chapter.title, chapter.subtitle) && chapter.slides.every(isBlankSlide);
}

/** هل في شاشة العنوان أي نصّ؟ */
export function titleHasText(meta: PresentationMeta): boolean {
  return hasText(meta.title, meta.subtitle, meta.workType, meta.date, ...meta.organization, ...meta.authors.flatMap((a) => [a.role, ...a.names]));
}

/** هل في الخاتمة أي نصّ؟ */
export function finalHasText(final: PresentationData['final']): boolean {
  return hasText(final.title, final.closing, final.thanks, ...final.summary);
}

/** عرض أبيض بالكامل: لا نصّ في العنوان ولا المقدمة ولا الفصول ولا الخاتمة. */
export function isBlankDeck(data: PresentationData): boolean {
  return (
    !titleHasText(data.meta) &&
    data.preface.every((s) => isBlankSlide(s)) &&
    data.chapters.length > 0 &&
    data.chapters.every(isBlankChapter) &&
    !finalHasText(data.final)
  );
}
