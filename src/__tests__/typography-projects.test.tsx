// @vitest-environment jsdom
import { describe, expect, it, vi } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { act } from 'react';
import { createRoot } from 'react-dom/client';
import * as gallery from '@/components/gallery';
import { LineShadowText, MorphingText, TextEffect, TextLoop, TextShimmer } from '@/components/gallery';
import { CalligraphyText, FitText, NumberRoll } from '@/components/typography';
import * as typo from '@/components/typography';

const r = (el: React.ReactElement) => renderToStaticMarkup(el);

// تصيير حقيقي في jsdom (لاختبار التأثيرات الجانبية: fitty والتحميل الكسول للمشكّل)
(globalThis as unknown as { IS_REACT_ACT_ENVIRONMENT: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
const mount = async (el: React.ReactElement) => {
  const host = document.createElement('div');
  document.body.appendChild(host);
  const root = createRoot(host);
  await act(async () => root.render(el));
  const flush = () => act(async () => void (await new Promise((res) => setTimeout(res, 30))));
  const unmount = async () => {
    await act(async () => root.unmount());
    host.remove();
  };
  return { host, flush, unmount };
};

describe('مشاريع حركة النص المثبّتة (الدفعة الثانية من المعرض)', () => {
  it('الفهرس يصدّر 42 مكوّناً بعد إضافة الخمسة', () => {
    expect(Object.keys(gallery).length).toBe(42);
    for (const n of ['TextEffect', 'TextLoop', 'TextShimmer', 'MorphingText', 'LineShadowText']) expect(gallery).toHaveProperty(n);
  });

  it('TextEffect لا يفكّك الحروف العربية حتى مع per="char" (قاعدة §9.5) ويبقي التقسيم للاتيني', () => {
    const arabic = r(
      <TextEffect per="char" preset="fade-in-blur">
        حفل التخرّج
      </TextEffect>,
    );
    expect(arabic).toContain('>حفل<');
    expect(arabic).not.toContain('>ح<');
    const latin = r(<TextEffect per="char">ab</TextEffect>);
    expect(latin).toContain('>a<');
    const words = r(
      <TextEffect per="word" preset="slide" as="h2" className="t">
        مشروع نهاية الدراسة
      </TextEffect>,
    );
    expect(words).toMatch(/<h2[^>]*class="t"/);
    expect(words).toContain('>نهاية<');
  });

  it('TextLoop يعرض العنصر الأول ككتلة، TextShimmer وLineShadowText يحفظان النص كاملاً', () => {
    const loop = r(
      <TextLoop interval={1}>
        <span>ناجح</span>
        <span>مبتكر</span>
      </TextLoop>,
    );
    expect(loop).toContain('ناجح');
    expect(loop).not.toContain('مبتكر');
    const shimmer = r(
      <TextShimmer as="h3" sweep="rtl" className="x">
        جارٍ التحميل
      </TextShimmer>,
    );
    expect(shimmer).toContain('>جارٍ التحميل<');
    expect(shimmer).toContain('bg-clip-text');
    const shadow = r(
      <LineShadowText as="h1" shadowColor="#fbbf24">
        التخرّج
      </LineShadowText>,
    );
    expect(shadow).toContain('data-text="التخرّج"');
    expect(shadow).toContain('animate-line-shadow');
    expect(shadow).toContain('--shadow-color:#fbbf24');
  });

  it('MorphingText يحمل فلتر العتبة ويقبل كلمات عربية كاملة', () => {
    const html = r(<MorphingText texts={['تحليل', 'تصميم']} className="h-20" />);
    expect(html).toContain('id="threshold"');
    expect(html).toContain('url(#threshold)');
  });
});

describe('مكونات الطباعة الجديدة', () => {
  it('الفهرس يصدّر CalligraphyText وNumberRoll وFitText', () => {
    for (const n of ['CalligraphyText', 'NumberRoll', 'FitText']) expect(typo).toHaveProperty(n);
  });

  it('NumberRoll يغلّف number-flow بـ dir="ltr" ويمرّر البادئة/اللاحقة', () => {
    const html = r(<NumberRoll value={1284} suffix=" خرّيجاً" className="big" />);
    expect(html).toMatch(/<span dir="ltr" class="[^"]*big[^"]*"/);
    expect(html).toContain('number-flow-react');
    expect(html).toContain('خرّيجاً');
    // المحلية الافتراضية ar-EG → أرقام هندية
    expect(html).toContain('١');
    const western = r(<NumberRoll value={42} locales="ar-DZ" />);
    expect(western).toContain('42');
  });

  it('FitText يُرسم بالوسم المطلوب ويُلغي اشتراك fitty عند الإزالة', async () => {
    expect(
      r(
        <FitText as="h1" minSize={20} maxSize={200} className="hero">
          دفعة ٢٠٢٦
        </FitText>,
      ),
    ).toMatch(/<h1[^>]*>دفعة ٢٠٢٦<\/h1>/);
    const { host, flush, unmount } = await mount(<FitText>عنوان</FitText>);
    await flush();
    const el = host.querySelector('.w-full > div') as HTMLElement;
    expect(el.style.whiteSpace).toBe('nowrap'); // fitty فعّال
    expect(el.style.display).toBe('inline-block');
    await unmount();
  });

  it('CalligraphyText يعرض نصاً احتياطياً مخفياً أثناء التحميل ثم SVG بالمسارات بعد التشكيل', async () => {
    vi.resetModules();
    const d = 'M10 10L20 20Z';
    vi.doMock('@/lib/text-shaper', () => ({
      loadShaperFont: vi.fn(async () => ({ arabic: { upem: 1000 } })),
      shapeText: vi.fn(async () => ({
        glyphs: [
          { d, x: 40, y: 50, scale: 0.06, advance: 30, cluster: 0, run: 0, order: 0 },
          { d, x: 10, y: 50, scale: 0.06, advance: 30, cluster: 2, run: 0, order: 1 },
        ],
        width: 70,
        height: 80,
        baseline: 50,
        size: 60,
      })),
    }));
    const { CalligraphyText: Calli } = await import('@/components/typography/CalligraphyText');
    // قبل اكتمال التشكيل: span مخفي يحجز المكان ويحمل aria
    const pending = r(<Calli text="تخرّج" font="aref-ruqaa" size={60} />);
    expect(pending).toContain('aria-busy="true"');
    expect(pending).toContain('opacity-0');
    expect(pending).toContain('>تخرّج<');
    const { host, flush, unmount } = await mount(<Calli text="تخرّج" font="aref-ruqaa" size={60} />);
    await flush();
    const svg = host.querySelector('svg[role="img"]');
    expect(svg?.getAttribute('aria-label')).toBe('تخرّج');
    const paths = host.querySelectorAll('path');
    expect(paths.length).toBe(2);
    expect(paths[0].getAttribute('transform')).toContain('scale(0.06000 -0.06000)');
    expect(paths[0].getAttribute('vector-effect')).toBe('non-scaling-stroke');
    await unmount();
    vi.doUnmock('@/lib/text-shaper');
  });

  it('CalligraphyText عند فشل التشكيل يعرض النص العادي بالخط المطلوب', async () => {
    vi.resetModules();
    vi.doMock('@/lib/text-shaper', () => ({
      loadShaperFont: vi.fn(async () => {
        throw new Error('wasm unavailable');
      }),
      shapeText: vi.fn(),
    }));
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const { CalligraphyText: Calli } = await import('@/components/typography/CalligraphyText');
    const { host, flush, unmount } = await mount(<Calli text="نص احتياطي" font="amiri" weight={700} />);
    await flush();
    const span = host.querySelector('span[aria-label="نص احتياطي"]') as HTMLElement;
    expect(span.className).not.toContain('opacity-0');
    expect(span.style.fontFamily).toContain('Amiri');
    expect(span.style.fontWeight).toBe('700');
    expect(warn).toHaveBeenCalled();
    warn.mockRestore();
    await unmount();
    vi.doUnmock('@/lib/text-shaper');
  });
});

// الاستيراد المباشر يُبقي النوع مستعملاً (CalligraphyText يُحمَّل ديناميكياً أعلاه مع mock)
void CalligraphyText;
