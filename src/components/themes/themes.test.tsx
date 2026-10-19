import { describe, expect, it } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { Info } from 'lucide-react';
import { parse, wcagContrast } from 'culori';
import { BrandChrome } from './BrandChrome';
import { chapterPaletteStyle, deriveChapterPalette } from './palette';
import { Presentation } from '@/components/Presentation';
import { SlideScreen } from '@/components/screens/SlideScreen';
import { presentation } from '@/data/presentation';
import { flattenSlides } from '@/lib/navigation';
import type { ChapterData, PresentationData } from '@/types/presentation';

const themedChapter: ChapterData = {
  id: 'ch-test',
  title: 'الفصل التجريبي',
  icon: Info,
  brandColor: '#0ea5e9',
  color: 'from-sky-600/20 to-sky-400/10',
  accent: 'text-sky-200 border-sky-400/40',
  slides: [
    { id: 'ch-test-preface', chapterId: 'ch-test', title: 'تمهيد', icon: Info, archetype: 'chapter-preface', content: null },
    { id: 'ch-test-a', chapterId: 'ch-test', title: 'المحور الأول', icon: Info, archetype: 'bullets', content: <p>محتوى</p> },
    { id: 'ch-test-b', chapterId: 'ch-test', title: 'المحور الثاني', icon: Info, archetype: 'stats', content: <p>محتوى</p> },
    { id: 'ch-test-summary', chapterId: 'ch-test', title: 'خلاصة', icon: Info, archetype: 'chapter-summary', content: null },
  ],
};

const themedDeck: PresentationData = {
  ...presentation,
  theme: { mode: 'corporate', backdrop: 'mesh' },
  branding: {
    university: 'جامعة الاختبار',
    unit: 'كلية العلوم',
    logoSrc: '/branding/university.svg',
    logoAlt: 'شعار جامعة الاختبار',
    footer: 'السنة الجامعية 2026',
  },
  chapters: [themedChapter],
};

describe('ألوان الفصول المشتقة عبر Culori', () => {
  it('يشتق ألواناً متجاورة ومكمّلة وثلاثية من لون أساس CSS', () => {
    const palette = deriveChapterPalette('oklch(0.62 0.18 240)', 'dark');
    expect(palette.base).toMatch(/^#[\da-f]{6}$/i);
    expect(palette.accent).toMatch(/^#[\da-f]{6}$/i);
    expect(palette.analogous[0]).not.toBe(palette.accent);
    expect(palette.analogous[1]).not.toBe(palette.accent);
    expect(palette.complementary).not.toBe(palette.accent);
    expect(palette.triad[0]).not.toBe(palette.triad[1]);
  });

  it('يضبط الإضاءة ولون النص فوق التمييز لكل من الداكن والفاتح والمؤسسي', () => {
    const dark = deriveChapterPalette('#0ea5e9', 'dark');
    const light = deriveChapterPalette('#0ea5e9', 'light');
    const corporate = deriveChapterPalette('#0ea5e9', 'corporate');
    expect(dark.accent).not.toBe(light.accent);
    expect(light.accent).not.toBe(corporate.accent);
    for (const { palette, darkInk } of [
      { palette: dark, darkInk: '#020617' },
      { palette: light, darkInk: '#0f172a' },
      { palette: corporate, darkInk: '#0f172a' },
    ]) {
      const color = parse(palette.accent)!;
      const whiteContrast = wcagContrast(color, parse('#ffffff')!);
      const darkContrast = wcagContrast(color, parse(darkInk)!);
      expect(palette.onAccent).toBe(whiteContrast >= darkContrast ? '#ffffff' : darkInk);
      expect(Math.max(whiteContrast, darkContrast)).toBeGreaterThanOrEqual(4.5);
    }
  });

  it('يعيد إلى لون احتياطي معقول إذا كان لون الفصل غير صالح', () => {
    const invalid = deriveChapterPalette('not-a-real-color', 'light');
    const fallback = deriveChapterPalette('#0ea5e9', 'light');
    expect(invalid).toEqual(fallback);
  });

  it('يصدر متغيرات CSS مستقلة لكل سمة كي تتبدّل درجات الفصل دون إعادة الرسم', () => {
    const style = chapterPaletteStyle('#10b981') as Record<string, string>;
    for (const mode of ['dark', 'light', 'corporate']) {
      expect(style[`--chapter-${mode}-accent`]).toMatch(/^#[\da-f]{6}$/i);
      expect(style[`--chapter-${mode}-gradient-start`]).toMatch(/^#[\da-f]{6}$/i);
      expect(style[`--chapter-${mode}-complementary`]).toMatch(/^#[\da-f]{6}$/i);
    }
  });
});

describe('الهوية المؤسسية وسمة العرض', () => {
  it('لا يعرض إطار الهوية عند ترك إعداداته فارغة', () => {
    expect(renderToStaticMarkup(<BrandChrome />)).toBe('');
    expect(renderToStaticMarkup(<BrandChrome branding={{ university: '   ', footer: '' }} />)).toBe('');
  });

  it('يعرض شعار الجامعة بنص بديل وذيل الجهة الثابت', () => {
    const html = renderToStaticMarkup(<BrandChrome branding={themedDeck.branding} />);
    expect(html).toContain('aria-label="جامعة الاختبار"');
    expect(html).toContain('src="/branding/university.svg"');
    expect(html).toContain('alt="شعار جامعة الاختبار"');
    expect(html).toContain('كلية العلوم');
    expect(html).toContain('تذييل العرض');
    expect(html).toContain('السنة الجامعية 2026');
  });

  it('يطبق وضع العرض والخلفية وشريط الهوية على جذر العرض', () => {
    const html = renderToStaticMarkup(<Presentation data={themedDeck} />);
    expect(html).toContain('data-presentation-theme="corporate"');
    expect(html).toContain('data-presentation-backdrop="mesh"');
    expect(html).toContain('جامعة الاختبار');
    expect(html).toContain('pt-14 sm:pt-16');
    expect(html).toContain('pb-28');
  });

  it('يحتفظ الفصل بلون أساس عند رسم الشريحة ليرثه المحتوى الداخلي', () => {
    const slide = flattenSlides([themedChapter])[1];
    const html = renderToStaticMarkup(<SlideScreen item={slide} />);
    expect(html).toContain('class="chapter-palette-scope');
    expect(html).toContain('data-chapter-id="ch-test"');
    expect(html).toContain('--chapter-light-accent:');
    expect(html).toContain('--chapter-brand-color:#0ea5e9');
  });
});
