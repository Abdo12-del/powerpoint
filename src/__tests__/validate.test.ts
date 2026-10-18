import { describe, expect, it } from 'vitest';
import { Info } from 'lucide-react';
import { presentation } from '@/data/presentation';
import { validatePresentation } from '@/lib/validate';
import type { PresentationData } from '@/types/presentation';

describe('قائمة تحقق الهيكل (Definition of Done)', () => {
  it('المشروع النموذجي يجتاز كل القواعد بلا أخطاء ولا تحذيرات', () => {
    const report = validatePresentation(presentation);
    expect(report.errors).toEqual([]);
    expect(report.warnings).toEqual([]);
    expect(report.ok).toBe(true);
  });

  it('3–5 فصول، كل فصل يبدأ بتمهيد وينتهي بخلاصة، 4–8 شرائح', () => {
    expect(presentation.chapters.length).toBeGreaterThanOrEqual(3);
    expect(presentation.chapters.length).toBeLessThanOrEqual(5);
    for (const ch of presentation.chapters) {
      expect(ch.slides.length).toBeGreaterThanOrEqual(4);
      expect(ch.slides.length).toBeLessThanOrEqual(8);
      expect(ch.slides[0].archetype).toBe('chapter-preface');
      expect(ch.slides[ch.slides.length - 1].archetype).toBe('chapter-summary');
    }
  });

  it('الأنماط العشرة كلها مستعملة في المثال', () => {
    const used = new Set(presentation.chapters.flatMap((c) => c.slides.map((s) => s.archetype)));
    for (const a of ['profile', 'bullets', 'timeline', 'tree', 'comparison', 'process', 'table', 'relation', 'code', 'stats'])
      expect(used.has(a as never)).toBe(true);
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
    // تحذير عدد الفصول (< 3)
    expect(report.warnings.map((w) => w.rule)).toContain('chapters.count');
  });

  it('يحذّر من العناوين الطويلة (> 6 كلمات) ومن غياب التمهيد/الخلاصة', () => {
    const bad: PresentationData = {
      ...presentation,
      chapters: presentation.chapters.map((c, i) =>
        i !== 0
          ? c
          : {
              ...c,
              slides: [
                { id: 'ch1-long', chapterId: 'ch1', title: 'في هذا الجزء سوف ندرس الوثائق المستعملة في المؤسسة', icon: Info, archetype: 'bullets', content: 'x' },
                ...c.slides.slice(1, -1),
                { id: 'ch1-end', chapterId: 'ch1', title: 'نهاية', icon: Info, archetype: 'bullets', content: 'x' },
              ],
            },
      ),
    };
    const rules = validatePresentation(bad).warnings.map((w) => w.rule);
    expect(rules).toContain('slide.titleLength');
    expect(rules).toContain('chapter.preface');
    expect(rules).toContain('chapter.summary');
  });
});
