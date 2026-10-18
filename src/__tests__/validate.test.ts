import { describe, expect, it } from 'vitest';
import { Info } from 'lucide-react';
import { presentation } from '@/data/presentation';
import { validatePresentation } from '@/lib/validate';
import type { ChapterData, PresentationData } from '@/types/presentation';

/** فصل مكتمل اصطناعي (تمهيد + محوران + خلاصة) لبناء عرض صالح بالكامل. */
function completeChapter(n: number): ChapterData {
  const id = `ch${n}`;
  return {
    id,
    title: `الفصل ${n}`,
    icon: Info,
    color: '',
    accent: '',
    slides: [
      { id: `${id}-preface`, chapterId: id, title: 'تمهيد', icon: Info, archetype: 'chapter-preface', content: 'x' },
      { id: `${id}-a`, chapterId: id, title: 'محور أول', icon: Info, archetype: 'bullets', content: 'x' },
      { id: `${id}-b`, chapterId: id, title: 'محور ثانٍ', icon: Info, archetype: 'stats', content: 'x' },
      { id: `${id}-conclusion`, chapterId: id, title: 'خلاصة', icon: Info, archetype: 'chapter-summary', content: 'x' },
    ],
  };
}

describe('قائمة تحقق الهيكل (Definition of Done)', () => {
  it('القالب الفارغ بلا أخطاء: قابل للتشغيل والتنقل مباشرة', () => {
    const report = validatePresentation(presentation);
    expect(report.errors).toEqual([]);
    expect(report.ok).toBe(true);
  });

  it('القالب الفارغ يحذّر فقط من الشرائح النائبة (قائمة مهام التعبئة)', () => {
    const report = validatePresentation(presentation);
    const rules = new Set(report.warnings.map((w) => w.rule));
    expect(rules).toEqual(new Set(['slide.placeholder']));
    const placeholders = presentation.chapters.flatMap((c) => c.slides).filter((s) => s.archetype === 'placeholder');
    expect(report.warnings).toHaveLength(placeholders.length);
  });

  it('القالب الفارغ يحترم البنية: 3–5 فصول، كل فصل 4–8 شرائح يبدأ بتمهيد وينتهي بخلاصة', () => {
    expect(presentation.chapters.length).toBeGreaterThanOrEqual(3);
    expect(presentation.chapters.length).toBeLessThanOrEqual(5);
    for (const ch of presentation.chapters) {
      expect(ch.slides.length).toBeGreaterThanOrEqual(4);
      expect(ch.slides.length).toBeLessThanOrEqual(8);
      expect(ch.slides[0].archetype).toBe('chapter-preface');
      expect(ch.slides[ch.slides.length - 1].archetype).toBe('chapter-summary');
    }
    expect(presentation.preface.length).toBeGreaterThanOrEqual(3);
    expect(presentation.preface.length).toBeLessThanOrEqual(4);
  });

  it('عرض مكتمل التعبئة يجتاز كل القواعد بلا أخطاء ولا تحذيرات', () => {
    const complete: PresentationData = { ...presentation, chapters: [1, 2, 3].map(completeChapter) };
    const report = validatePresentation(complete);
    expect(report.errors).toEqual([]);
    expect(report.warnings).toEqual([]);
  });

  it('يكشف المعرفات المكررة وبادئة الفصل الخاطئة و chapterId غير المطابق', () => {
    const bad: PresentationData = {
      ...presentation,
      chapters: [
        {
          id: 'ch1',
          title: 'فصل',
          icon: Info,
          color: '',
          accent: '',
          slides: [
            { id: 'ch1-a', chapterId: 'ch1', title: 'أ', icon: Info, archetype: 'chapter-preface', content: 'x' },
            { id: 'ch1-a', chapterId: 'ch1', title: 'ب', icon: Info, archetype: 'bullets', content: 'x' },
            { id: 'x-b', chapterId: 'ch1', title: 'ج', icon: Info, archetype: 'bullets', content: 'x' },
            { id: 'ch1-c', chapterId: 'ch9', title: 'د', icon: Info, archetype: 'chapter-summary', content: 'x' },
          ],
        },
      ],
    };
    const report = validatePresentation(bad);
    const rules = report.errors.map((e) => e.rule);
    expect(rules).toContain('slide.uniqueId');
    expect(rules).toContain('slide.idPrefix');
    expect(rules).toContain('slide.chapterId');
    expect(report.ok).toBe(false);
    expect(report.warnings.map((w) => w.rule)).toContain('chapters.count');
  });

  it('يحذّر من العناوين الطويلة (> 6 كلمات) ومن غياب التمهيد/الخلاصة', () => {
    const base = completeChapter(1);
    const bad: PresentationData = {
      ...presentation,
      chapters: [
        {
          ...base,
          slides: [
            { id: 'ch1-long', chapterId: 'ch1', title: 'في هذا الجزء سوف ندرس الوثائق المستعملة في المؤسسة', icon: Info, archetype: 'bullets', content: 'x' },
            ...base.slides.slice(1, -1),
            { id: 'ch1-end', chapterId: 'ch1', title: 'نهاية', icon: Info, archetype: 'bullets', content: 'x' },
          ],
        },
        completeChapter(2),
        completeChapter(3),
      ],
    };
    const rules = validatePresentation(bad).warnings.map((w) => w.rule);
    expect(rules).toContain('slide.titleLength');
    expect(rules).toContain('chapter.preface');
    expect(rules).toContain('chapter.summary');
  });
});
