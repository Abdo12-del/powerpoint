/**
 * ملاحظات المعلم — استخراجها لكل شاشة وعدّادها
 * الملاحظات حقل اختياري في بيانات العرض (slide.notes / meta.notes / …)
 * ولا تُعرض في واجهة الطلاب إطلاقاً — نافذة المعلم هي القارئ الوحيد.
 */

import type { PresentationData, SlideData } from '@/types/presentation';
import { flattenSlides } from '@/lib/navigation';
import type { FlatSlide, Screen } from '@/lib/navigation';

/** ملاحظات شاشة معيّنة — '' عند غيابها */
export function notesFor(screen: Screen, data: PresentationData, slides: FlatSlide[]): string {
  switch (screen.kind) {
    case 'title':
      return data.meta.notes ?? '';
    case 'preface':
      return data.preface[screen.step]?.notes ?? '';
    case 'map':
      return ''; // شاشة تنقّل — بلا ملاحظات
    case 'slide':
      return slides[screen.index]?.slide.notes ?? '';
    case 'final':
      return data.final.notes ?? '';
  }
}

export interface ScreenInfo {
  /** عدّاد الشاشة — نفس صيغة شريط التحكم */
  counter: string;
  /** عنوان الشاشة (عنوان الشريحة أو الخطوة) */
  title: string;
  /** عنوان الفصل المالك (للشرائح) */
  chapter?: string;
  /** معرف شريحة (للاختبارات والمعاينة) */
  slideId?: string;
}

/** معلومات شاشة معيّنة للعرض في نافذة المعلم */
export function screenInfo(screen: Screen, data: PresentationData, slides: FlatSlide[]): ScreenInfo {
  switch (screen.kind) {
    case 'title':
      return { counter: 'شاشة العنوان', title: data.meta.title || 'شاشة العنوان' };
    case 'preface':
      return {
        counter: `المقدمة ${screen.step + 1} / ${data.preface.length}`,
        title: data.preface[screen.step]?.title || 'خطوة المقدمة',
      };
    case 'map':
      return { counter: 'خريطة الفصول', title: 'خريطة الفصول' };
    case 'slide': {
      const flat = slides[screen.index];
      return {
        counter: `الشريحة ${screen.index + 1} / ${slides.length}`,
        title: flat?.slide.title || 'شريحة',
        chapter: flat?.chapter.title,
        slideId: flat?.slide.id,
      };
    }
    case 'final':
      return { counter: 'الخاتمة', title: data.final.title || 'الخاتمة' };
  }
}

/** الشرائح المُسطَّحة — غلاف واحد يُعاد استعماله في الحزمة */
export function slidesOf(data: PresentationData): FlatSlide[] {
  return flattenSlides(data.chapters);
}

/** البحث عن شريحة بمعرّفها (للمختبر) */
export function slideById(slides: FlatSlide[], id: string): SlideData | undefined {
  return slides.find((s) => s.slide.id === id)?.slide;
}
