// @vitest-environment jsdom
import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { renderToStaticMarkup } from 'react-dom/server';
import { beforeAll, afterEach, describe, expect, it, vi } from 'vitest';

// ── محاكاة Lenis: jsdom بلا rAF ولا ResizeObserver ──
vi.mock('lenis', () => {
  class FakeLenis {
    scroll = 0;
    progress = 0;
    velocity = 0;
    on() {}
    off() {}
    raf() {}
    destroy() {}
  }
  return { default: FakeLenis };
});

import { ThreeShowreel } from '@/effects/ThreeShowreel';
import { EffectsLab } from '@/effects/lab/EffectsLab';
import { transitionSwap, slideIn, zoomIn, glitchIn } from '@/effects/transitions/dom';
import { isWebGLAvailable } from '@/effects/webgl';

// React 19: فعّل بيئة act صراحةً في jsdom
(globalThis as unknown as { IS_REACT_ACT_ENVIRONMENT: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

beforeAll(() => {
  // jsdom لا يوفّر سياق WebGL — المكونات تستخدم البديل الآمن
  HTMLCanvasElement.prototype.getContext = (() => null) as typeof HTMLCanvasElement.prototype.getContext;
});

describe('واجهة المؤثرات السينمائية', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('isWebGLAvailable ترجع false في jsdom', () => {
    expect(isWebGLAvailable()).toBe(false);
  });

  it('ThreeShowreel يعرض البديل الآمن مع العلامة عند غياب WebGL', () => {
    const html = renderToStaticMarkup(<ThreeShowreel brand="استوديو الاختبار" tagline="حركة بلا GL" />);
    expect(html).toContain('استوديو الاختبار');
    expect(html).toContain('حركة بلا GL');
    expect(html).toContain('WebGL غير متوفر');
    expect(html).toContain('three-showreel');
  });

  it('EffectsLab يُركّب الصفحة كاملة: مسرح + كتالوج + انتقالات + بارالاكس', async () => {
    const container = document.createElement('div');
    document.body.appendChild(container);
    const root: Root = createRoot(container);
    await act(async () => {
      root.render(<EffectsLab />);
    });

    const html = container.innerHTML;
    // الترويسة والمسرح — بلا WebGL يظهر البديل الآمن (بلا شارات أو أزرار)
    expect(html).toContain('حزمة المؤثرات السينمائية');
    const stage = container.querySelector('[data-testid="three-showreel"]');
    expect(stage).toBeTruthy();
    expect(stage?.textContent).toContain('ARENA STUDIO');
    expect(stage?.textContent).toContain('WebGL غير متوفر');
    // أدوات المسرح: منزلق BPM وزر الالتقاط
    expect(container.querySelector('[data-testid="bpm-value"]')?.textContent).toContain('128');
    expect(html).toContain('التقط إطاراً');
    // كتالوج التأثيرات
    expect(html).toContain('Morphing');
    expect(html).toContain('Particles');
    expect(html).toContain('Glitch');
    // الانتقالات الديناميكية
    expect(html).toContain('انتقال');
    // بارالاكس Lenis
    expect(html).toContain('Parallax + Lenis');
    expect(container.querySelectorAll('[data-speed]').length).toBe(3);

    await act(async () => {
      root.unmount();
    });
    container.remove();
  });

  it('انتقالات DOM: transitionSwap يستبدل المحتوى بكل الأنماط', async () => {
    const box = document.createElement('div');
    document.body.appendChild(box);
    box.innerHTML = '<p>القديم</p>';

    for (const style of ['slide', 'zoom', 'glitch'] as const) {
      let rendered = '';
      transitionSwap(box, () => {
        rendered = `جديد-${style}`;
        box.innerHTML = `<p>${rendered}</p>`;
      }, style);
      // GSAP يسقط إلى setTimeout عند غياب rAF — ننتظر انتهاء التبديل
      await new Promise((r) => setTimeout(r, 700));
      expect(box.textContent).toContain(`جديد-${style}`);
    }
    box.remove();
  });

  it('دوال الإدخال الثلاث لا ترمي في jsdom', () => {
    const el = document.createElement('div');
    expect(() => slideIn(el)).not.toThrow();
    expect(() => zoomIn(el)).not.toThrow();
    expect(() => glitchIn(el)).not.toThrow();
  });
});
