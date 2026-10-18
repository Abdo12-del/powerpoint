import { describe, expect, it } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { presentation } from '@/data/presentation';
import { flattenSlides } from '@/lib/navigation';
import { Presentation } from '@/components/Presentation';
import { TitleScreen } from '@/components/screens/TitleScreen';
import { PrefaceScreen } from '@/components/screens/PrefaceScreen';
import { MapScreen } from '@/components/screens/MapScreen';
import { SlideScreen } from '@/components/screens/SlideScreen';
import { FinalScreen } from '@/components/screens/FinalScreen';

const slides = flattenSlides(presentation.chapters);
const noop = () => undefined;

describe('كل الشاشات تُعرض بلا أخطاء (smoke render)', () => {
  it('شاشة العنوان تحتوي بطاقة التعريف كاملة', () => {
    const html = renderToStaticMarkup(<TitleScreen meta={presentation.meta} onStart={noop} />);
    for (const line of presentation.meta.organization) expect(html).toContain(line);
    expect(html).toContain(presentation.meta.workType);
    expect(html).toContain(presentation.meta.date);
    expect(html).toContain(presentation.meta.startLabel ?? 'اضغط للبدء');
  });

  it('كل خطوات المقدمة تُعرض', () => {
    presentation.preface.forEach((_, step) => {
      const html = renderToStaticMarkup(<PrefaceScreen steps={presentation.preface} step={step} onGoto={noop} />);
      expect(html).toContain(presentation.preface[step].title);
    });
  });

  it('الخريطة تعرض كل الفصول وكل المحاور', () => {
    const html = renderToStaticMarkup(
      <MapScreen chapters={presentation.chapters} slides={slides} visited={[]} onSelect={noop} currentChapterId="ch1" />,
    );
    for (const ch of presentation.chapters) {
      expect(html).toContain(ch.title);
      for (const s of ch.slides) expect(html).toContain(s.title);
    }
  });

  it.each(slides.map((s) => [s.slide.id, s] as const))('الشريحة %s تُعرض مع عنوانها', (_id, item) => {
    const html = renderToStaticMarkup(<SlideScreen item={item} />);
    expect(html).toContain(item.slide.title);
    expect(html).toContain(item.chapter.title);
  });

  it('الخاتمة تعرض الخلاصة والشكر', () => {
    const html = renderToStaticMarkup(<FinalScreen data={presentation.final} onMap={noop} onRestart={noop} />);
    for (const s of presentation.final.summary) expect(html).toContain(s);
    expect(html).toContain(presentation.final.thanks);
  });

  it('المكوّن الجذري يبدأ بشاشة العنوان', () => {
    const html = renderToStaticMarkup(<Presentation data={presentation} />);
    expect(html).toContain(presentation.meta.title.split(' ')[0]);
    expect(html).toContain('شاشة العنوان');
  });
});
