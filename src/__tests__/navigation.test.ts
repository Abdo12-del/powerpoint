import { describe, expect, it } from 'vitest';
import { presentation } from '@/data/presentation';
import {
  buildSequence,
  escapeScreen,
  flattenSlides,
  nextScreen,
  prevScreen,
  progressOf,
  type Screen,
} from '@/lib/navigation';

const slides = flattenSlides(presentation.chapters);
const ctx = { prefaceCount: presentation.preface.length, slideCount: slides.length, lastSlide: 0 };

describe('تدفق العرض (§6): العنوان ← المقدمة ← الخريطة ← الشرائح ← الخاتمة', () => {
  it('التسلسل الخطي يبدأ بالعنوان وينتهي بالخاتمة ويمرّ بالخريطة مرة واحدة', () => {
    const seq = buildSequence(presentation);
    expect(seq[0]).toEqual({ kind: 'title' });
    expect(seq[seq.length - 1]).toEqual({ kind: 'final' });
    expect(seq.filter((s) => s.kind === 'map')).toHaveLength(1);
    expect(seq.filter((s) => s.kind === 'preface')).toHaveLength(presentation.preface.length);
    expect(seq.filter((s) => s.kind === 'slide')).toHaveLength(slides.length);
  });

  it('«التالي» من البداية إلى النهاية يزور كل شاشة بالترتيب الصحيح', () => {
    const seq = buildSequence(presentation);
    let screen: Screen = { kind: 'title' };
    const visited: Screen[] = [screen];
    for (let i = 0; i < seq.length * 2; i++) {
      const n = nextScreen(screen, { ...ctx, lastSlide: 0 });
      if (n === screen) break;
      visited.push(n);
      screen = n;
    }
    expect(visited).toEqual(seq);
  });

  it('«السابق» يعكس «التالي» (من الشريحة الأولى يعود إلى الخريطة، ومن الخريطة إلى آخر خطوة مقدمة)', () => {
    expect(prevScreen({ kind: 'slide', index: 0 }, ctx)).toEqual({ kind: 'map' });
    expect(prevScreen({ kind: 'map' }, ctx)).toEqual({ kind: 'preface', step: ctx.prefaceCount - 1 });
    expect(prevScreen({ kind: 'preface', step: 0 }, ctx)).toEqual({ kind: 'title' });
    expect(prevScreen({ kind: 'final' }, ctx)).toEqual({ kind: 'slide', index: slides.length - 1 });
    expect(prevScreen({ kind: 'title' }, ctx)).toEqual({ kind: 'title' });
  });

  it('من الخريطة «التالي» يستأنف من آخر شريحة مزارة', () => {
    expect(nextScreen({ kind: 'map' }, { ...ctx, lastSlide: 7 })).toEqual({ kind: 'slide', index: 7 });
  });

  it('Esc: من الخريطة إلى العنوان، ومن أي شاشة أخرى إلى الخريطة', () => {
    expect(escapeScreen({ kind: 'map' })).toEqual({ kind: 'title' });
    expect(escapeScreen({ kind: 'slide', index: 3 })).toEqual({ kind: 'map' });
    expect(escapeScreen({ kind: 'final' })).toEqual({ kind: 'map' });
  });

  it('شريط التقدّم: 1/N في العنوان و 100% في الخاتمة', () => {
    const seq = buildSequence(presentation);
    expect(progressOf({ kind: 'title' }, seq)).toBeCloseTo(1 / seq.length);
    expect(progressOf({ kind: 'final' }, seq)).toBe(1);
  });

  it('كل الشرائح المسطّحة تحمل فصلها الصحيح ومعرفات فريدة', () => {
    const ids = new Set(slides.map((s) => s.slide.id));
    expect(ids.size).toBe(slides.length);
    for (const s of slides) expect(s.slide.chapterId).toBe(s.chapter.id);
  });
});
